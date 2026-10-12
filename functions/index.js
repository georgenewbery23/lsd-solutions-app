// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ─── DAILY TACHOMASTER SYNC — PER COMPANY ───
exports.dailyTachomasterSync = functions.pubsub
  .schedule('every day 04:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    console.log('🔄 Starting Daily Tachomaster Sync — 04:00 UK Time');
    
    // Get ALL companies with Tachomaster enabled
    const companiesSnapshot = await db.collection('companies')
      .where('tachomasterEnabled', '==', true)
      .get();
    
    console.log(`📋 Found ${companiesSnapshot.size} companies with Tachomaster enabled`);
    
    const results = {
      totalCompanies: companiesSnapshot.size,
      successfulSyncs: 0,
      totalInfringementsFound: 0,
      newInfringements: 0,
      unmatchedDrivers: 0,
      skippedDisabled: 0,
      errors: []
    };

    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const companyData = companyDoc.data();
      
      console.log(`🏢 Syncing: ${companyData.companyName || companyId}`);
      
      try {
        const syncResult = await syncCompanyInfringements(companyId, companyData);
        
        results.successfulSyncs++;
        results.totalInfringementsFound += syncResult.total || 0;
        results.newInfringements += syncResult.created || 0;
        results.unmatchedDrivers += syncResult.needsMatch || 0;
        
      } catch (error) {
        console.error(`❌ Error syncing ${companyId}:`, error);
        results.errors.push({
          companyId,
          companyName: companyData.companyName || 'Unknown',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Master log
    await db.collection('sync_logs').add({
      service: 'tachomaster_daily',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      results: results,
      status: results.errors.length === 0 ? 'success' : 'completed_with_errors'
    });

    console.log(`✅ Sync Complete: ${results.successfulSyncs}/${results.totalCompanies} companies synced, ${results.newInfringements} new infringements`);
    return { success: true, results };
  });

// ─── SYNC SINGLE COMPANY ───
async function syncCompanyInfringements(companyId, companyData) {
  const apiKey = companyData.tachomasterApiKey;
  const clientId = companyData.tachomasterClientId;
  
  if (!apiKey || !clientId) {
    console.log(`⏭️ ${companyId}: Missing API credentials — skipping`);
    return { total: 0, created: 0, needsMatch: 0, skipped: true };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
  const toDate = new Date().toISOString().split('T')[0];

  // ─── STEP 1: Fetch from Tachomaster ───
  const infringements = await fetchFromTachomaster(apiKey, clientId, fromDate, toDate);
  
  if (!infringements.success) {
    throw new Error(`API Error: ${infringements.error}`);
  }

  // ─── STEP 2: Process & Match Each Infringement ───
  let created = 0;
  let needsMatch = 0;

  for (const item of infringements.data) {
    const driverUid = await matchDriverByTachoCard(item.driver_tacho_card, item.driver_email);
    
    // Check for duplicate
    const existing = await db.collection('tacho_infringements')
      .where('companyId', '==', companyId)
      .where('externalReference', '==', item.id)
      .limit(1)
      .get();
    
    if (!existing.empty) continue;

    // Save new infringement
    const newInfringement = {
      companyId: companyId,
      driverId: driverUid,
      externalReference: item.id,
      date: item.date,
      infringementType: item.type || 'Tachograph Violation',
      details: item.details || item.description || '',
      severity: item.severity || 'advisory',
      driverName: item.driver_name || 'Unknown Driver',
      tachoCardNumber: item.driver_tacho_card || null,
      source: 'tachomaster_api',
      reviewed: false,
      acknowledgedByDriver: false,
      needsManualMatch: !driverUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('tacho_infringements').add(newInfringement);
    created++;
    
    if (!driverUid) needsMatch++;
    
    // Notify matched driver
    if (driverUid) {
      await db.collection('notifications').add({
        userId: driverUid,
        title: '⏱️ New Tachograph Infringement',
        message: `${companyData.companyName}: ${item.type} — ${item.date}`,
        type: 'tacho_infringement',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  // Per-company sync log
  await db.collection('sync_logs').add({
    service: 'tachomaster_daily',
    companyId: companyId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    results: {
      total: infringements.data.length,
      created: created,
      needsMatch: needsMatch
    },
    status: 'success'
  });

  return { total: infringements.data.length, created, needsMatch };
}

// ─── MATCH DRIVER BY TACHO CARD NUMBER ───
async function matchDriverByTachoCard(tachoCardNumber, email = null) {
  if (!tachoCardNumber && !email) return null;

  // Primary match: Tacho Card Number (most reliable & permanent)
  if (tachoCardNumber) {
    const cardMatch = await db.collection('users')
      .where('tachoCardNumber', '==', tachoCardNumber)
      .limit(1)
      .get();
    
    if (!cardMatch.empty) return cardMatch.docs[0].id;
  }

  // Fallback match: Email
  if (email) {
    const emailMatch = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!emailMatch.empty) return emailMatch.docs[0].id;
  }

  return null; // Needs manual matching
}

// ─── TACHOMASTER API CALL ───
async function fetchFromTachomaster(apiKey, clientId, dateFrom, dateTo) {
  try {
    const baseUrl = 'https://api.tachomaster.co.uk/v1';
    
    // Get auth token
    const tokenResponse = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      return { success: false, error: `Auth failed: ${tokenResponse.status}` };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch infringements
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    const infraResponse = await fetch(`${baseUrl}/infringements?${params}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!infraResponse.ok) {
      return { success: false, error: `Data failed: ${infraResponse.status}` };
    }

    const result = await infraResponse.json();
    return { success: true, data: result.data || [] };

  } catch (error) {
    console.error('Tachomaster API Error:', error.message);
    return { success: false, error: error.message, data: [] };
  }
}