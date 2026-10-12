// tachomaster-service.js
import { db } from './firebase.js';
import TACHOMASTER_CONFIG from './tachomaster-config.js';

const TachomasterAPI = {
  // Check if API is configured
  isConfigured() {
    return TACHOMASTER_CONFIG.apiKey && TACHOMASTER_CONFIG.syncEnabled;
  },

  // ─── AUTHENTICATION ───
  async getAuthToken() {
    if (!this.isConfigured()) return { success: false, mode: 'demo' };
    
    try {
      const response = await fetch(`${TACHOMASTER_CONFIG.apiBaseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TACHOMASTER_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          client_id: TACHOMASTER_CONFIG.clientId,
          grant_type: 'client_credentials'
        })
      });
      return await response.json();
    } catch (error) {
      console.warn('⚠️ Tachomaster API unavailable — using demo mode');
      return { success: false, error: error.message, mode: 'demo' };
    }
  },

  // ─── FETCH INFRINGEMENTS FROM TACHOMASTER ───
  async fetchInfringements(dateFrom = null, dateTo = null) {
    if (!this.isConfigured()) {
      console.log('📋 Tachomaster API not configured — returning demo data');
      return { success: true, data: this.getDemoInfringements(), mode: 'demo' };
    }

    try {
      const tokenData = await this.getAuthToken();
      if (!tokenData.success) return { success: true, data: this.getDemoInfringements(), mode: 'demo' };

      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(
        `${TACHOMASTER_CONFIG.apiBaseUrl}/infringements?${params}`, {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        }
      );

      const result = await response.json();
      return { success: true, data: result.data || [], mode: 'live' };
    } catch (error) {
      console.error('❌ Tachomaster API Error:', error);
      return { success: false, error: error.message, data: [], mode: 'error' };
    }
  },

  // ─── MATCH TACHOMASTER DRIVERS TO YOUR SYSTEM ───
  matchDriver(tachomasterDriver) {
    // Try matching by tacho card number first (most reliable)
    return db.collection('users')
      .where('tachoCardNumber', '==', tachomasterDriver.tacho_card_number)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) return snapshot.docs[0].id;
        
        // Fallback: match by email or name
        return db.collection('users')
          .where('email', '==', tachomasterDriver.email)
          .get()
          .then(emailSnapshot => {
            if (!emailSnapshot.empty) return emailSnapshot.docs[0].id;
            return null; // No match found — will flag for manual review
          });
      });
  },

  // ─── SYNC INFRINGEMENT TO FIRESTORE ───
  async syncInfringement(infringementData, companyId) {
    const driverUid = await this.matchDriver({
      tacho_card_number: infringementData.driver_tacho_card,
      email: infringementData.driver_email
    });

    const exists = await db.collection('tacho_infringements')
      .where('externalReference', '==', infringementData.id)
      .get();
    
    if (!exists.empty) {
      console.log(`⏭️ Infringement ${infringementData.id} already synced — skipping`);
      return { success: true, status: 'already_exists' };
    }

    const newInfringement = {
      companyId: companyId,
      driverId: driverUid || null,
      externalReference: infringementData.id,
      date: infringementData.date || new Date().toISOString().split('T')[0],
      infringementType: infringementData.type || 'Tachograph Rule Violation',
      details: infringementData.details || infringementData.description || 'See Tachomaster record',
      severity: infringementData.severity || 'advisory',
      driverName: infringementData.driver_name || 'Unknown Driver',
      tachoCardNumber: infringementData.driver_tacho_card || null,
      source: 'tachomaster_api',
      reviewed: false,
      acknowledgedByDriver: false,
      needsManualMatch: !driverUid,
      createdAt: new Date()
    };

    const docRef = await db.collection('tacho_infringements').add(newInfringement);
    
    if (driverUid && TACHOMASTER_CONFIG.autoNotifyDrivers) {
      await db.collection('notifications').add({
        userId: driverUid,
        title: '⏱️ New Tachograph Infringement',
        message: `A new record from Tachomaster is ready for your review — ${newInfringement.infringementType}`,
        type: 'tacho_infringement',
        read: false,
        createdAt: new Date()
      });
    }

    return { success: true, id: docRef.id, status: 'created' };
  },

  // ─── FULL SYNC JOB — RUN DAILY/HOURLY ───
  async runFullSync(companyId) {
    console.log('🔄 Starting Tachomaster sync...');
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.fetchInfringements(
      thirtyDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );

    if (!result.success) return result;

    const results = { created: 0, skipped: 0, needsMatch: 0, total: result.data.length };
    
    for (const item of result.data) {
      const syncResult = await this.syncInfringement(item, companyId);
      if (syncResult.status === 'created') results.created++;
      else if (syncResult.status === 'already_exists') results.skipped++;
      if (syncResult.id && !item.driverId) results.needsMatch++;
    }

    await db.collection('sync_logs').add({
      service: 'tachomaster',
      companyId: companyId,
      timestamp: new Date(),
      result: results,
      mode: result.mode
    });

    console.log(`✅ Tachomaster sync complete: ${results.created} new, ${results.skipped} already existed`);
    return { success: true, results, mode: result.mode };
  },

  // ─── DEMO DATA — for testing before API keys arrive ───
  getDemoInfringements() {
    return [
      {
        id: 'DEMO-001',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Daily Rest Violation',
        details: 'Reduced daily rest detected — less than 11 hours uninterrupted rest taken',
        severity: 'advisory',
        driver_name: 'Demo Driver',
        driver_tacho_card: '123456789012',
        driver_email: 'driver@example.com'
      },
      {
        id: 'DEMO-002',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Driving Time Exceeded',
        details: '4.5 hours driving period exceeded without required break',
        severity: 'major',
        driver_name: 'Demo Driver',
        driver_tacho_card: '123456789012',
        driver_email: 'driver@example.com'
      }
    ];
  }
};

export default TachomasterAPI;