// tachomaster-config.js
const TACHOMASTER_CONFIG = {
  apiBaseUrl: 'https://api.tachomaster.co.uk/v1',
  apiKey: '', // ← Tachomaster will provide this
  clientId: '', // ← Your Tachomaster client ID
  syncEnabled: false, // Set to true once you have real credentials
  syncFrequency: 'hourly',
  autoNotifyDrivers: true,
  autoCreateInfringements: true
};

export default TACHOMASTER_CONFIG;