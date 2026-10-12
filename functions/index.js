// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ─── TACHOMASTER DAILY SYNC ───
exports.dailyTachomasterSync = functions.pubsub
  .schedule('every day 04:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    console.log('🔄 Starting daily Tachomaster sync — 04:00 UK time');
    
    const companiesSnapshot = await db.collection('users')
      .where('role', '==', 'company')
      .get();
    
    const results = {
      totalCompanies: companiesSnapshot.size,
      syncedCompanies: 0,
      totalInfringementsFound: 0,
      newInfringements: 0,
      unmatchedDrivers: 0,
      errors: []
    };

    for (const companyDoc of companiesSnapshot.docs) {
      const company = companyDoc.data();
      const companyId = companyDoc.id;
      
      try {
        console.log(`📥 Syncing for: ${company.companyName || companyId}`);
        
        // Call Tachomaster API (we'll implement the actual fetch logic below)
        const syncResult = await runSyncForCompany(companyId, company);
        
        results.syncedCompanies++;
        results.totalInfringementsFound += syncResult.total || 0;
        results.newInfringements += syncResult.created || 0;
        results.unmatchedDrivers += syncResult.needsMatch || 0;
        
      } catch (error) {
        console.error(`❌ Error syncing ${companyId}:`, error);
        results.errors.push({ companyId, error: error.message });
      }
    }

    // Log the sync run
    await db.collection('sync_logs').add({
      service: 'tachomaster_daily',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      results: results,
      status: results.errors.length === 0 ? 'success' : 'completed_with_errors'
    });

    console.log(`✅ Daily sync complete: ${results.newInfringements} new infringements, ${results.unmatchedDrivers} unmatched drivers`);
    
    // Send alert if issues found
    if (results.unmatchedDrivers > 0 || results.errors.length > 0) {
      await sendSyncAlert(results);
    }

    return { success: true, results };
  });

// ─── SYNC LOGIC FOR EACH COMPANY ───
async function runSyncForCompany(companyId, company) {
  // Check if company has Tachomaster enabled
  if (!company.tachomasterEnabled) {
    console.log(`⏭️ Tachomaster not enabled for ${companyId} — skipping`);
    return { total: 0, created: 0, needsMatch: 0, skipped: true };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // In production: call actual Tachomaster API here
  // For now: return placeholder that will be replaced with real API call
  return { total: 0, created: 0, needsMatch: 0 };
}

// ─── SEND ALERT EMAIL ON ISSUES ───
async function sendSyncAlert(results) {
  console.log('⚠️ Sync issues detected — notification would be sent');
  // In production: integrate with SendGrid/Mailgun to email admin
}