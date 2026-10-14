<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LSD Solutions — HGV & Logistics Services</title>
  <meta name="description" content="For All Your Longhaul, Shunting And Delivery Needs" />
  <link rel="icon" type="image/png" href="/assets/favicon.png" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
    :root {
      --primary: #1a365d;
      --primary-light: #e8edf3;
      --accent: #d4af37;
      --accent-dark: #b8860b;
      --success: #2e7d32;
      --danger: #c62828;
      --text-dark: #333;
      --text-light: #666;
      --bg-light: #f8f9fa;
      --border: #ddd;
      --shadow: 0 2px 8px rgba(0,0,0,0.08);
      --warning: #ed6c02;
      --info: #0288d1;
    }
    
    body { background: var(--bg-light); color: var(--text-dark); min-height: 100vh; }
    .app-container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    
    /* Header & Branding */
    .site-header { text-align: center; padding: 24px 16px; background: white; box-shadow: var(--shadow); margin-bottom: 24px; }
    .logo { max-width: 120px; margin-bottom: 12px; }
    .site-title { font-size: 28px; color: var(--primary); font-weight: 700; }
    .site-subtitle { font-size: 18px; color: var(--accent); margin-top: 4px; }
    .site-tagline { font-size: 14px; color: var(--text-light); margin-top: 4px; font-style: italic; }
    
    /* Navigation */
    .nav-bar { background: var(--primary); padding: 12px 0; position: sticky; top: 0; z-index: 100; }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; }
    .nav-links { display: flex; gap: 8px; flex-wrap: wrap; }
    .nav-links a { color: white; text-decoration: none; padding: 8px 10px; border-radius: 4px; transition: background 0.2s; font-size: 14px; }
    .nav-links a:hover, .nav-links a.active { background: rgba(255,255,255,0.15); }
    .mobile-menu-btn { display: none; background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
    
    /* Notification Bell */
    .notification-bell { position: relative; cursor: pointer; padding: 4px 8px; }
    .notification-badge { position: absolute; top: -4px; right: -4px; background: var(--danger); color: white; font-size: 10px; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .notifications-panel { position: fixed; top: 60px; right: 16px; width: 360px; max-width: calc(100vw - 32px); max-height: 70vh; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 300; overflow-y: auto; display: none; }
    .notifications-panel.open { display: block; }
    .notif-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .notif-item { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.15s; }
    .notif-item:hover { background: var(--bg-light); }
    .notif-item.unread { background: #e3f2fd; border-left: 3px solid var(--info); }
    .notif-title { font-weight: 600; font-size: 14px; }
    .notif-body { font-size: 13px; color: var(--text-light); margin-top: 2px; }
    .notif-time { font-size: 11px; color: #aaa; margin-top: 4px; }
    
    /* Cards & Layout */
    .card { background: white; border-radius: 8px; padding: 24px; margin-bottom: 20px; box-shadow: var(--shadow); }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { color: var(--primary); font-size: 22px; }
    
    /* Forms */
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-dark); }
    input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 15px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; justify-content: flex-end; flex-wrap: wrap; }
    input[type="file"] { padding: 6px 0; border: none; }
    
    /* Buttons */
    .btn { padding: 10px 20px; border: none; border-radius: 4px; font-size: 15px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; text-decoration: none; display: inline-block; text-align: center; }
    .btn:hover { opacity: 0.9; }
    .btn.primary { background: var(--primary); color: white; }
    .btn.secondary { background: #e0e0e0; color: var(--text-dark); }
    .btn.small { padding: 6px 12px; font-size: 13px; }
    .btn.danger { background: var(--danger); color: white; }
    .btn.accent { background: var(--accent); color: white; }
    .btn.success { background: var(--success); color: white; }
    .btn.warning { background: var(--warning); color: white; }
    
    /* Lists */
    .list-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
    .list-item:last-child { border-bottom: none; }
    .list-item.inactive { opacity: 0.6; }
    .item-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    
    /* Badges */
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #e8f5e9; color: var(--success); }
    .badge-danger { background: #ffebee; color: var(--danger); }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-info { background: #e1f5fe; color: #0277bd; }
    
    /* Text Utilities */
    .text-muted { color: var(--text-light); font-size: 14px; }
    .text-sm { font-size: 13px; color: var(--text-light); }
    .text-danger { color: var(--danger); }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    
    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { background: white; border-radius: 8px; padding: 24px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
    .modal h3 { margin-bottom: 16px; color: var(--primary); }
    
    /* Toast */
    .toast { position: fixed; top: 20px; right: 20px; padding: 14px 20px; border-radius: 6px; color: white; font-weight: 500; z-index: 2000; opacity: 0; transform: translateY(-10px); transition: all 0.3s; }
    .toast.show { opacity: 1; transform: translateY(0); }
    .toast.success { background: var(--success); }
    .toast.error { background: var(--danger); }
    .toast.warning { background: var(--warning); }
    .toast.info { background: var(--info); }
    
    /* Checklist */
    .checklist-category { margin-bottom: 16px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
    .category-header { background: var(--primary-light); padding: 10px 14px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .category-body { padding: 14px; }
    
    /* Mobile Menu */
    #mobile-menu { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--primary); z-index: 150; padding-top: 60px; overflow-y: auto; }
    #mobile-menu.open { display: block; }
    #mobile-menu a { display: block; color: white; padding: 14px 24px; font-size: 16px; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
    
    /* Expiry Warning */
    .expiry-warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px 14px; margin: 8px 0; border-radius: 4px; }
    .expiry-critical { background: #ffebee; border-left: 4px solid var(--danger); padding: 10px 14px; margin: 8px 0; border-radius: 4px; }
    
    /* Job Cards */
    .job-card { border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; transition: box-shadow 0.2s; }
    .job-card:hover { box-shadow: var(--shadow); }
    .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
    .job-title { font-weight: 600; font-size: 16px; color: var(--primary); }
    .job-company { font-size: 13px; color: var(--accent); }
    .job-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin: 10px 0; font-size: 14px; }
    .job-detail-item span:first-child { color: var(--text-light); font-size: 12px; }
    
    /* Availability Calendar */
    .avail-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .avail-day { text-align: center; padding: 8px 4px; border-radius: 4px; font-size: 13px; cursor: pointer; }
    .avail-day.available { background: #e8f5e9; color: var(--success); }
    .avail-day.unavailable { background: #ffebee; color: var(--danger); }
    .avail-day.today { border: 2px solid var(--primary); font-weight: 600; }
    
    /* File Upload Zone */
    .upload-zone { border: 2px dashed var(--border); border-radius: 8px; padding: 30px; text-align: center; cursor: pointer; transition: border-color 0.2s; }
    .upload-zone:hover, .upload-zone.dragover { border-color: var(--primary); background: var(--primary-light); }
    .file-preview { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-light); border-radius: 4px; margin-top: 8px; }
    .file-preview-icon { font-size: 24px; }
    
    /* Search Bar */
    .search-bar { position: relative; margin-bottom: 16px; }
    .search-bar input { padding-left: 38px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-light); font-size: 18px; }
    
    /* Tabs */
    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 20px; overflow-x: auto; }
    .tab { padding: 10px 20px; cursor: pointer; border-bottom: 3px solid transparent; white-space: nowrap; }
    .tab.active { border-bottom-color: var(--primary); color: var(--primary); font-weight: 600; }
    
    /* Data Table */
    .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
    .data-table th { background: var(--primary-light); font-weight: 600; }
    .data-table tr:hover { background: var(--bg-light); }
    
    /* Progress Bar */
    .progress-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s; }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .mobile-menu-btn { display: block; }
      .form-row { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; }
      .list-item { flex-direction: column; align-items: flex-start; }
      .item-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
      .notifications-panel { width: calc(100% - 32px); left: 16px; right: 16px; }
      .data-table { display: block; overflow-x: auto; }
    }
  </style>
</head>
<body>
  <!-- Site Header -->
  <header class="site-header">
    <img src="/assets/lsd-logo.png" alt="LSD Solutions" class="logo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚛</text></svg>'; this.onerror=null;">
    <h1 class="site-title">LSD Solutions</h1>
    <p class="site-subtitle">HGV & Logistics Services</p>
    <p class="site-tagline">For All Your Longhaul, Shunting And Delivery Needs</p>
  </header>

  <!-- Navigation -->
  <nav class="nav-bar">
    <div class="nav-inner">
      <span style="color:white;font-weight:600">🚛 LSD Solutions</span>
      <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
      <div class="nav-links" id="nav-links">
        <a href="#" onclick="showPage('dashboard');return false;" id="nav-dashboard" class="active">Dashboard</a>
        <a href="#" onclick="showPage('jobs');return false;" id="nav-jobs">Jobs</a>
        <a href="#" onclick="showPage('availability');return false;" id="nav-availability" style="display:none;">📅 Availability</a>
        <a href="#" onclick="showPage('driver-check');return false;" id="nav-check" style="display:none;">Walkaround Check</a>
        <a href="#" onclick="showPage('vehicles');return false;" id="nav-vehicles" style="display:none;">Fleet</a>
        <a href="#" onclick="showPage('drivers');return false;" id="nav-drivers" style="display:none;">Drivers</a>
        <a href="#" onclick="showPage('checklist-editor');return false;" id="nav-checklist" style="display:none;">Checklists</a>
        <a href="#" onclick="showPage('company-profile');return false;" id="nav-profile" style="display:none;">Company Profile</a>
        <a href="#" onclick="showPage('invoices');return false;" id="nav-invoices">📄 Invoices</a>
        <a href="#" onclick="showPage('holidays');return false;" id="nav-holidays">🏖️ Holidays</a>
        <a href="#" onclick="showPage('documents');return false;" id="nav-docs">📂 Documents</a>
        <a href="#" onclick="showPage('reports');return false;" id="nav-reports">📊 Reports</a>
        <a href="#" onclick="showPage('messages');return false;" id="nav-messages">💬 Messages</a>
        <a href="#" onclick="showPage('profile');return false;" id="nav-my-profile">My Profile</a>
        <div class="notification-bell" onclick="toggleNotifications()">
          <span>🔔</span>
          <span class="notification-badge" id="notif-badge" style="display:none">0</span>
        </div>
        <a href="#" onclick="handleSignOut();return false;" id="nav-logout">Sign Out</a>
      </div>
    </div>
  </nav>

  <!-- Notifications Panel -->
  <div class="notifications-panel" id="notifications-panel">
    <div class="notif-header">
      <strong>Notifications</strong>
      <span style="font-size:12px;cursor:pointer;color:var(--primary)" onclick="markAllNotifsRead()">Mark all read</span>
    </div>
    <div id="notifications-list">
      <p style="padding:20px;text-align:center;color:var(--text-light)">No notifications</p>
    </div>
  </div>

  <!-- Mobile Menu -->
  <div id="mobile-menu">
    <a href="#" onclick="showPage('dashboard');toggleMobileMenu();return false;">Dashboard</a>
    <a href="#" onclick="showPage('jobs');toggleMobileMenu();return false;">Jobs</a>
    <a href="#" onclick="showPage('availability');toggleMobileMenu();return false;" id="mob-avail" style="display:none;">📅 Availability</a>
    <a href="#" onclick="showPage('driver-check');toggleMobileMenu();return false;" id="mob-check" style="display:none;">Walkaround Check</a>
    <a href="#" onclick="showPage('vehicles');toggleMobileMenu();return false;" id="mob-vehicles" style="display:none;">Fleet</a>
    <a href="#" onclick="showPage('drivers');toggleMobileMenu();return false;" id="mob-drivers" style="display:none;">Drivers</a>
    <a href="#" onclick="showPage('checklist-editor');toggleMobileMenu();return false;" id="mob-checklist" style="display:none;">Checklists</a>
    <a href="#" onclick="showPage('company-profile');toggleMobileMenu();return false;" id="mob-profile" style="display:none;">Company Profile</a>
    <a href="#" onclick="showPage('invoices');toggleMobileMenu();return false;">📄 Invoices</a>
    <a href="#" onclick="showPage('holidays');toggleMobileMenu();return false;">🏖️ Holidays</a>
    <a href="#" onclick="showPage('documents');toggleMobileMenu();return false;">📂 Documents</a>
    <a href="#" onclick="showPage('reports');toggleMobileMenu();return false;">📊 Reports</a>
    <a href="#" onclick="showPage('messages');toggleMobileMenu();return false;">💬 Messages</a>
    <a href="#" onclick="showPage('profile');toggleMobileMenu();return false;">My Profile</a>
    <a href="#" onclick="handleSignOut();toggleMobileMenu();return false;">Sign Out</a>
  </div>

  <!-- Main App Content -->
  <main class="app-container" id="app">
    <!-- Content loads here dynamically -->
  </main>

  <!-- Firebase SDK -->
  <script type="importmap">
  {
    "imports": {
      "firebase/app": "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js",
      "firebase/auth": "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js",
      "firebase/firestore": "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js",
      "firebase/storage": "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"
    }
  }
  </script>

  <script type="module">
    // ========== FIREBASE CONFIG — UPDATE WITH YOUR OWN ==========
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      projectId: "YOUR_PROJECT",
      storageBucket: "YOUR_PROJECT.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    // ========== INITIALIZE FIREBASE ==========
    import { initializeApp } from 'firebase/app';
    import { 
      getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
      signOut, onAuthStateChanged, sendPasswordResetEmail
    } from 'firebase/auth';
    import { 
      getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, deleteDoc,
      collection, query, where, orderBy, getDocs, runTransaction, onSnapshot, limit, startAfter
    } from 'firebase/firestore';
    import { 
      getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
    } from 'firebase/storage';

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // ========== GLOBAL STATE ==========
    let currentUser = null;
    let currentUserRole = null;
    let currentPage = 'login';
    let currentChecklistData = [];
    let driverCheckResults = {};
    let unreadNotifications = 0;
    let notificationsListener = null;
    let messagesListener = null;

    // ========== DVSA DEFAULT CHECKLIST ==========
    const DEFAULT_CHECKLIST_ITEMS = [
      { category: "Vehicle Exterior", items: [
        "Body — condition, secure, no sharp edges",
        "Windscreen — clear, no damage, washers/wipers work",
        "Mirrors — all present, clean, correctly adjusted",
        "Lights & indicators — all working, lenses clean and intact",
        "Number plates — secure, clean, correct, visible",
        "Tyres — condition, pressure, tread depth above 1.6mm",
        "Wheels — secure, no damage, no leaks",
        "Wheel nuts — present and secure",
        "Fuel caps — fitted and secure",
        "Windows — intact, no cracks"
      ]},
      { category: "Vehicle Underside", items: [
        "Exhaust — secure, no excessive smoke",
        "Suspension — no leaks, no damage, components secure",
        "Steering — no play, no fluid leaks",
        "Brake lines & hoses — secure, no leaks or chafing"
      ]},
      { category: "Brakes & Systems", items: [
        "Service brake — operates correctly",
        "Secondary brake — operates correctly",
        "Parking brake — holds vehicle on gradient",
        "Brake fluid — correct level, no leaks",
        "Air pressure — builds correctly, holds pressure",
        "ABS warning lamp — not showing fault"
      ]},
      { category: "Fluid Levels & Engine", items: [
        "Engine oil — correct level",
        "Coolant — correct level",
        "Screen wash — correct level",
        "AdBlue — correct level (if fitted)",
        "Engine bay — no fluid leaks, caps secure",
        "Battery — secure, terminals clean"
      ]},
      { category: "Coupling & Trailer", items: [
        "Fifth wheel — secure, lubricated, locking mechanism working",
        "Air lines — connected correctly, no leaks, not chafing",
        "Electrical connections — secure, all lights working",
        "Breakaway cable — attached correctly",
        "Trailer landing legs — fully raised and secured",
        "Kingpin — secure and undamaged"
      ]},
      { category: "Load & Security", items: [
        "Load — secure and appropriately distributed",
        "Curtains / Doors — closed, secured, fasteners intact",
        "Roof — secure if fitted",
        "Tail lift — stowed correctly and secure",
        "Hazard warning plates — displayed if applicable"
      ]},
      { category: "Emergency Equipment", items: [
        "Fire extinguisher — present, accessible, in date",
        "Warning triangle — present",
        "First aid kit — present and complete",
        "Wheel chocks — present",
        "Spare bulbs — recommended"
      ]},
      { category: "Cab & Interior", items: [
        "Seats & seatbelts — secure, operate correctly, no damage",
        "Horns — working",
        "Speedometer — working correctly",
        "Tachograph — calibrated, working, chart/card in use",
        "Handbrake warning — illuminates correctly",
        "Oil pressure / warning lights — operating correctly",
        "All controls — operate smoothly and correctly",
        "Doors — open, close and secure properly"
      ]}
    ];

    // ========== HELPER FUNCTIONS ==========
    function setVal(id, val) {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    }
    function getVal(id) {
      const el = document.getElementById(id);
      return el ? el.value : '';
    }

    window.showToast = function(msg, type='success') {
      const t = document.createElement('div');
      t.className = `toast toast-${type}`;
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.classList.add('show'), 10);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 4000);
    };
    window.showModal = function(content) {
      const b = document.createElement('div');
      b.className = 'modal-backdrop';
      b.id = 'modal-backdrop';
      b.onclick = (e) => { if (e.target === b) closeModal(); };
      b.innerHTML = `<div class="modal">${content}</div>`;
      document.body.appendChild(b);
    };
    window.closeModal = function() {
      const b = document.getElementById('modal-backdrop');
      if (b) b.remove();
    };
    window.formatDate = function(d, format='short') {
      if (!d) return '—';
      const dt = d instanceof Date ? d : d.toDate ? d.toDate() : new Date(d);
      if (format === 'short') return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
      if (format === 'time') return dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
      return dt.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    };
    window.formatCurrency = function(amount) {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0);
    };

    // ========== NOTIFICATIONS SYSTEM ==========
    window.toggleNotifications = function() {
      const panel = document.getElementById('notifications-panel');
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    };
    window.markAllNotifsRead = async function() {
      try {
        const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), where('read', '==', false));
        const snap = await getDocs(q);
        const updates = snap.docs.map(d => updateDoc(d.ref, { read: true }));
        await Promise.all(updates);
        unreadNotifications = 0;
        updateNotifBadge();
      } catch (e) {}
    };
    function updateNotifBadge() {
      const badge = document.getElementById('notif-badge');
      if (badge) {
        badge.textContent = unreadNotifications > 9 ? '9+' : unreadNotifications;
        badge.style.display = unreadNotifications > 0 ? 'flex' : 'none';
      }
    }
    async function loadNotifications() {
      if (!currentUser) return;
      try {
        if (notificationsListener) notificationsListener();
        notificationsListener = onSnapshot(
          query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'), limit(20)),
          (snap) => {
            const list = document.getElementById('notifications-list');
            if (!list) return;
            const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            unreadNotifications = notifs.filter(n => !n.read).length;
            updateNotifBadge();
            if (!notifs.length) {
              list.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-light)">No notifications</p>';
            } else {
              list.innerHTML = notifs.map(n => `
                <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="markNotifRead('${n.id}')">
                  <div class="notif-title">${n.title || ''}</div>
                  <div class="notif-body">${n.body || ''}</div>
                  <div class="notif-time">${formatDate(n.createdAt, 'time')}</div>
                </div>
              `).join('');
            }
          }
        );
      } catch (e) { console.log('Notif error:', e); }
    }
    window.markNotifRead = async function(id) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (e) {}
    };
    async function sendNotification(userId, title, body, linkUrl = null) {
      try {
        await addDoc(collection(db, 'notifications'), {
          userId, title, body, linkUrl, read: false, createdAt: new Date()
        });
      } catch (e) {}
    }
    window.requestNotificationPermission = async function() {
      if ('Notification' in window && Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') showToast('Push notifications enabled ✅');
      }
    };
    window.showLocalNotification = function(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/assets/favicon.png' });
      }
    };

    // ========== EXPOSE GLOBALS ==========
    window.showPage = showPage;
    window.toggleMobileMenu = () => {
      const m = document.getElementById('mobile-menu');
      if (m) m.classList.toggle('open');
    };
        // ========== PAGE RENDERERS — AUTH ==========
    function renderLoginPage() {
      return `
        <div class="card" style="max-width:420px;margin:40px auto;text-align:center">
          <h2 style="margin-bottom:24px;color:var(--primary)">Sign In</h2>
          <form onsubmit="handleSignIn(event)">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="login-email" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="login-password" required>
            </div>
            <div class="form-actions" style="justify-content:stretch">
              <button type="submit" class="btn primary" style="width:100%">Sign In</button>
            </div>
          </form>
          <p style="margin-top:16px">
            <a href="#" onclick="showPage('reset');return false" style="color:var(--primary)">Forgot password?</a>
          </p>
          <p style="margin-top:8px">Don't have an account? 
            <a href="#" onclick="showPage('register');return false" style="color:var(--primary);font-weight:500">Register</a>
          </p>
        </div>
      `;
    }

    function renderRegisterPage() {
      return `
        <div class="card" style="max-width:420px;margin:40px auto">
          <h2 style="margin-bottom:24px;color:var(--primary);text-align:center">Register As</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
            <button class="btn primary" style="padding:20px" onclick="showRegisterForm('driver')">
              <div style="font-size:24px;margin-bottom:8px">👤</div>
              <strong>Driver</strong><br>
              <span style="font-size:12px;opacity:0.8">Find work & manage documents</span>
            </button>
            <button class="btn primary" style="padding:20px" onclick="showRegisterForm('company')">
              <div style="font-size:24px;margin-bottom:8px">🏢</div>
              <strong>Company</strong><br>
              <span style="font-size:12px;opacity:0.8">Post work & manage fleet</span>
            </button>
          </div>
          <p style="text-align:center"><a href="#" onclick="showPage('login');return false" style="color:var(--primary)">← Back to Sign In</a></p>
        </div>
      `;
    }

    window.showRegisterForm = function(role) {
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="card" style="max-width:420px;margin:40px auto">
          <h2 style="margin-bottom:24px;color:var(--primary);text-align:center">Register as ${role === 'driver' ? 'Driver' : 'Company'}</h2>
          <form onsubmit="handleRegister(event, '${role}')">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="reg-name" required>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="reg-email" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="reg-password" required>
            </div>
            <div class="form-actions">
              <button type="button" class="btn secondary" onclick="showPage('register')">Back</button>
              <button type="submit" class="btn primary">Create Account</button>
            </div>
          </form>
        </div>
      `;
    };

    function renderResetPage() {
      return `
        <div class="card" style="max-width:420px;margin:40px auto;text-align:center">
          <h2 style="margin-bottom:24px;color:var(--primary)">Reset Your Password</h2>
          <form onsubmit="handleResetPassword(event)">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="reset-email" required>
            </div>
            <div class="form-actions" style="justify-content:stretch">
              <button type="submit" class="btn primary" style="width:100%">Send Reset Link</button>
            </div>
          </form>
          <p style="margin-top:16px"><a href="#" onclick="showPage('login');return false" style="color:var(--primary)">← Back to Sign In</a></p>
        </div>
      `;
    }

    function renderDashboardPage() {
      const greeting = currentUser ? `Signed in as ${currentUser.email}` : '';
      return `
        <div class="page-header">
          <h2>📊 Dashboard</h2>
          <span class="text-sm">${greeting}</span>
        </div>
        
        ${currentUserRole === 'company' ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px">
            <div class="card" style="text-align:center">
              <div style="font-size:32px">🚛</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)" id="count-vehicles">0</div>
              <div class="text-muted">Active Vehicles</div>
            </div>
            <div class="card" style="text-align:center">
              <div style="font-size:32px">📦</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)" id="count-trailers">0</div>
              <div class="text-muted">Active Trailers</div>
            </div>
            <div class="card" style="text-align:center">
              <div style="font-size:32px">👥</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)" id="count-drivers">0</div>
              <div class="text-muted">Linked Drivers</div>
            </div>
            <div class="card" style="text-align:center">
              <div style="font-size:32px">✅</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)" id="count-checks">0</div>
              <div class="text-muted">Checks This Week</div>
            </div>
            <div class="card" style="text-align:center">
              <div style="font-size:32px">📋</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)" id="count-jobs">0</div>
              <div class="text-muted">Active Jobs</div>
            </div>
            <div class="card" style="text-align:center">
              <div style="font-size:32px">💰</div>
              <div style="font-size:24px;font-weight:700;color:var(--primary)" id="count-invoices">0</div>
              <div class="text-muted">Pending Invoices</div>
            </div>
          </div>
          
          <div class="card">
            <h3>Quick Actions</h3>
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:16px">
              <button class="btn primary" onclick="showPage('jobs')">📋 Post & View Jobs</button>
              <button class="btn primary" onclick="showPage('vehicles')">🚛 Manage Fleet</button>
              <button class="btn primary" onclick="showPage('drivers')">👥 Manage Drivers</button>
              <button class="btn primary" onclick="showPage('checklist-editor')">📋 Edit Checklists</button>
              <button class="btn primary" onclick="showPage('company-profile')">🏢 Company Profile</button>
              <button class="btn primary" onclick="showPage('invoices')">📄 Invoices</button>
              <button class="btn primary" onclick="showPage('holidays')">🏖️ Holidays</button>
              <button class="btn primary" onclick="showPage('documents')">📂 Documents</button>
              <button class="btn primary" onclick="showPage('reports')">📊 Reports</button>
              <button class="btn primary" onclick="showPage('messages')">💬 Messages</button>
            </div>
          </div>
          
          <div class="card">
            <h3>Recent Activity</h3>
            <div id="recent-activity">
              <p class="text-muted">Loading recent activity...</p>
            </div>
          </div>
        ` : `
          <div class="card">
            <h3>Welcome 👋</h3>
            <p class="text-muted">Ready for your next assignment? Here's what you can do:</p>
            <ul style="margin:16px 0;padding-left:20px">
              <li style="margin-bottom:8px">View available jobs from all companies</li>
              <li style="margin-bottom:8px">Set your availability so companies know when you're free</li>
              <li style="margin-bottom:8px">Complete your daily walkaround checks</li>
              <li style="margin-bottom:8px">Manage your profile and documents</li>
              <li style="margin-bottom:8px">View your invoices & holiday requests</li>
            </ul>
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:16px">
              <button class="btn primary" onclick="showPage('jobs')">📋 View Jobs</button>
              <button class="btn primary" onclick="showPage('availability')">📅 Set Availability</button>
              <button class="btn primary" onclick="showPage('driver-check')">✅ Start Check</button>
              <button class="btn primary" onclick="showPage('documents')">📂 Documents</button>
              <button class="btn secondary" onclick="showPage('profile')">👤 My Profile</button>
            </div>
          </div>
          
          <div class="card">
            <h3>Recommended Jobs</h3>
            <div id="recommended-jobs">
              <p class="text-muted">Loading jobs...</p>
            </div>
          </div>
        `}
      `;
    }

    // ========== JOBS SYSTEM — FULL ==========
    function renderJobsPage() {
      return `
        <div class="page-header">
          <h2>📋 ${currentUserRole === 'company' ? 'Manage Posted Jobs' : 'Available Jobs'}</h2>
          ${currentUserRole === 'company' 
            ? `<button class="btn primary" onclick="showPostJobModal()">+ Post New Job</button>`
            : `<button class="btn secondary" onclick="showPage('availability')">📅 My Availability</button>`
          }
        </div>

        <div class="card">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" id="job-search" placeholder="Search jobs by company, location, vehicle type..." oninput="filterJobs(this.value)">
          </div>
          
          ${currentUserRole !== 'company' ? `
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
              <button class="btn small secondary filter-btn active" onclick="filterJobs('')">All</button>
              <button class="btn small secondary filter-btn" onclick="filterJobs('today')">Today</button>
              <button class="btn small secondary filter-btn" onclick="filterJobs('thisweek')">This Week</button>
              <button class="btn small secondary filter-btn" onclick="filterJobs('longhaul')">Long Haul</button>
              <button class="btn small secondary filter-btn" onclick="filterJobs('shunting')">Shunting</button>
              <button class="btn small secondary filter-btn" onclick="filterJobs('delivery')">Delivery</button>
            </div>
          ` : ''}
          
          <div id="jobs-list">
            <p>Loading jobs...</p>
          </div>
        </div>
      `;
    }

    window.showPostJobModal = function() {
      showModal(`
        <h3>Post New Job</h3>
        <form onsubmit="postJob(event)">
          <div class="form-group">
            <label>Job Title / Reference *</label>
            <input type="text" id="job-title" required placeholder="e.g. Manchester — Aberdeen Return">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Pickup Location *</label>
              <input type="text" id="job-from" required>
            </div>
            <div class="form-group">
              <label>Delivery Location *</label>
              <input type="text" id="job-to" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date Required *</label>
              <input type="date" id="job-date" required>
            </div>
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" id="job-time">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Job Type</label>
              <select id="job-type">
                <option value="longhaul">Long Haul</option>
                <option value="shunting">Shunting</option>
                <option value="delivery">Delivery / Multi-drop</option>
                <option value="local">Local Work</option>
              </select>
            </div>
            <div class="form-group">
              <label>Vehicle Type</label>
              <select id="job-vehicle-type">
                <option value="any">Any</option>
                <option value="rigid">Rigid</option>
                <option value="tractor">Tractor & Trailer</option>
                <option value="van">Van</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Rate (£)</label>
              <input type="number" step="0.01" id="job-rate" placeholder="0.00">
            </div>
            <div class="form-group">
              <label>Estimated Hours</label>
              <input type="number" step="0.5" id="job-hours" placeholder="0">
            </div>
          </div>
          <div class="form-group">
            <label>Additional Notes / Requirements</label>
            <textarea id="job-notes" rows="3" placeholder="Any special requirements, load type, equipment needed..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn primary">Post Job</button>
          </div>
        </form>
      `);
    };

       window.postJob = async function(e) {
      e.preventDefault();
      try {
        const jobData = {
          title: getVal('job-title'),
          fromLocation: getVal('job-from'),
          toLocation: getVal('job-to'),
          dateRequired: new Date(getVal('job-date')),
          startTime: getVal('job-time'),
          jobType: getVal('job-type'),
          vehicleType: getVal('job-vehicle-type'),
          rate: parseFloat(getVal('job-rate')) || null,
          estimatedHours: parseFloat(getVal('job-hours')) || null,
          notes: getVal('job-notes'),
          companyId: currentUser.uid,
          companyName: currentUser.displayName || currentUser.email,
          status: 'open',
          createdBy: currentUser.uid,
          createdAt: new Date()
        };
        
        await addDoc(collection(db, 'jobs'), jobData);
        closeModal();
        loadJobs();
        showToast('Job posted successfully ✅');
        
        // Notify all available drivers
        try {
          const driversSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'driver')));
          driversSnap.forEach(async d => {
            await sendNotification(
              d.id,
              '🆕 New Job Posted',
              `${jobData.companyName} posted: ${jobData.title} — ${jobData.fromLocation} to ${jobData.toLocation}`
            );
          });
        } catch (notifyErr) {
          console.log('Could not notify drivers:', notifyErr);
        }
      } catch (err) {
        console.error('Error posting job:', err);
        showToast('Error posting job ❌', 'error');
      }
    };

    async function loadJobs(searchTerm = '') {
      if (!currentUser) return;
      try {
        let qry;
        if (currentUserRole === 'company') {
          qry = query(collection(db, 'jobs'), where('companyId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        } else {
          qry = query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('createdAt', 'desc'));
        }
        
        const snapshot = await getDocs(qry);
        let jobs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Client-side search/filter
        if (searchTerm && searchTerm !== 'today' && searchTerm !== 'thisweek' && searchTerm !== 'longhaul' && searchTerm !== 'shunting' && searchTerm !== 'delivery') {
          const term = searchTerm.toLowerCase();
          jobs = jobs.filter(j => 
            (j.title || '').toLowerCase().includes(term) ||
            (j.fromLocation || '').toLowerCase().includes(term) ||
            (j.toLocation || '').toLowerCase().includes(term) ||
            (j.companyName || '').toLowerCase().includes(term)
          );
        } else if (searchTerm === 'today') {
          const today = new Date().toDateString();
          jobs = jobs.filter(j => new Date(j.dateRequired).toDateString() === today);
        } else if (searchTerm === 'thisweek') {
          const now = new Date();
          const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          jobs = jobs.filter(j => {
            const d = new Date(j.dateRequired);
            return d >= now && d <= weekEnd;
          });
        } else if (searchTerm === 'longhaul') {
          jobs = jobs.filter(j => j.jobType === 'longhaul');
        } else if (searchTerm === 'shunting') {
          jobs = jobs.filter(j => j.jobType === 'shunting');
        } else if (searchTerm === 'delivery') {
          jobs = jobs.filter(j => j.jobType === 'delivery');
        }
        
        const container = document.getElementById('jobs-list');
        const recommendedContainer = document.getElementById('recommended-jobs');
        
        const renderJobsList = (jobsList, showCompany = false) => {
          if (!jobsList.length) {
            return `<p class="text-muted">${searchTerm ? 'No matching jobs found.' : 'No jobs available right now. Check back soon!'}</p>`;
          }
          return jobsList.map(j => {
            const statusBadge = j.status === 'open' 
              ? '<span class="badge badge-info">Open</span>'
              : j.status === 'assigned'
                ? '<span class="badge badge-warning">Assigned</span>'
                : '<span class="badge badge-success">Completed</span>';
            
            const typeLabels = {
              longhaul: 'Long Haul',
              shunting: 'Shunting',
              delivery: 'Delivery',
              local: 'Local Work'
            };
            
            return `
              <div class="job-card">
                <div class="job-header">
                  <div>
                    <h4 class="job-title">${j.title || 'Untitled Job'}</h4>
                    ${showCompany ? `<div class="job-company">🏢 ${j.companyName || 'Anonymous Company'}</div>` : ''}
                  </div>
                  ${statusBadge}
                </div>
                <div class="job-details">
                  <div>
                    <span>📍 From</span><br>
                    <strong>${j.fromLocation || '—'}</strong>
                  </div>
                  <div>
                    <span>➡️ To</span><br>
                    <strong>${j.toLocation || '—'}</strong>
                  </div>
                  <div>
                    <span>📅 Date</span><br>
                    <strong>${formatDate(j.dateRequired)}${j.startTime ? ' ' + j.startTime : ''}</strong>
                  </div>
                  <div>
                    <span>📋 Type</span><br>
                    <strong>${typeLabels[j.jobType] || 'General'}</strong>
                  </div>
                  ${j.rate ? `<div><span>💰 Rate</span><br><strong>£${j.rate.toFixed(2)}${j.estimatedHours ? ' × ' + j.estimatedHours + 'hrs' : ''}</strong></div>` : ''}
                </div>
                ${j.notes ? `<p class="text-sm" style="margin-top:8px"><strong>Notes:</strong> ${j.notes}</p>` : ''}
                <div class="item-actions" style="margin-top:12px">
                  ${currentUserRole === 'company' 
                    ? `
                      ${j.status === 'open' 
                        ? `<button class="btn small primary" onclick="assignJob('${j.id}')">Assign Driver</button>
                           <button class="btn small danger" onclick="cancelJob('${j.id}')">Cancel</button>`
                        : j.status === 'assigned'
                          ? `<button class="btn small success" onclick="completeJob('${j.id}')">✓ Mark Complete</button>`
                          : ''
                      }
                    `
                    : j.status === 'open'
                      ? `<button class="btn small primary" onclick="expressInterest('${j.id}')">✋ Express Interest</button>
                         <button class="btn small secondary" onclick="viewJobDetails('${j.id}')">Details</button>`
                      : `<span class="text-sm text-muted">Job no longer available</span>`
                  }
                </div>
              </div>
            `;
          }).join('');
        };
        
        if (container) container.innerHTML = renderJobsList(jobs, true);
        if (recommendedContainer) {
          const recJobs = jobs.slice(0, 3);
          recommendedContainer.innerHTML = recJobs.length 
            ? renderJobsList(recJobs, true)
            : '<p class="text-muted">No recommended jobs right now. Check back later!</p>';
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
        if (container) container.innerHTML = '<p class="text-danger">Error loading jobs.</p>';
      }
    }

    window.filterJobs = function(term) {
      loadJobs(term);
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
    };

    window.expressInterest = async function(jobId) {
      if (!confirm('Express interest in this job? The company will be notified.')) return;
      try {
        const jobSnap = await getDoc(doc(db, 'jobs', jobId));
        if (!jobSnap.exists()) {
          showToast('Job no longer exists ❌', 'error');
          return;
        }
        const job = jobSnap.data();
        
        await addDoc(collection(db, 'jobInterest'), {
          jobId: jobId,
          driverId: currentUser.uid,
          driverName: currentUser.displayName || currentUser.email,
          message: '',
          createdAt: new Date()
        });
        
        // Notify company
        await sendNotification(
          job.companyId,
          '✋ New Interest',
          `${currentUser.displayName || currentUser.email} is interested in: ${job.title}`
        );
        
        showToast('Interest registered ✅');
      } catch (err) {
        showToast('Error registering interest ❌', 'error');
      }
    };

    window.cancelJob = async function(jobId) {
      if (!confirm('Cancel this job? It will no longer be visible to drivers.')) return;
      try {
        await updateDoc(doc(db, 'jobs', jobId), { status: 'cancelled', cancelledAt: new Date() });
        loadJobs();
        showToast('Job cancelled ✅');
      } catch (err) {
        showToast('Error cancelling job ❌', 'error');
      }
    };

    window.completeJob = async function(jobId) {
      if (!confirm('Mark this job as completed?')) return;
      try {
        await updateDoc(doc(db, 'jobs', jobId), { status: 'completed', completedAt: new Date() });
        loadJobs();
        showToast('Job marked complete ✅');
      } catch (err) {
        showToast('Error updating job ❌', 'error');
      }
    };

    window.assignJob = function(jobId) {
      showToast('Driver assignment coming soon ✅', 'info');
    };

    window.viewJobDetails = function(jobId) {
      showToast('Full job details view coming soon ✅', 'info');
    };

    // ========== AVAILABILITY SYSTEM ==========
    function renderAvailabilityPage() {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
      }
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return `
        <div class="page-header">
          <h2>📅 My Availability</h2>
        </div>

        <div class="card">
          <h3>Set Your Weekly Availability</h3>
          <p class="text-muted">Let companies know which days you're available for work.</p>
          
          <div class="avail-grid" style="margin-top:20px">
            ${days.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString();
              return `
                <div class="avail-day ${isToday ? 'today' : ''}" 
                     id="avail-day-${i}" 
                     onclick="toggleAvailability(${i})">
                  <div style="font-weight:600">${dayNames[i]}</div>
                  <div style="font-size:11px">${d.getDate()}</div>
                  <div id="avail-status-${i}" style="margin-top:4px;font-size:11px">—</div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
            <h4>Set Quick Preset</h4>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
              <button class="btn small secondary" onclick="setAvailabilityPreset('all')">✅ All Week</button>
              <button class="btn small secondary" onclick="setAvailabilityPreset('weekdays')">Mon-Fri Only</button>
              <button class="btn small secondary" onclick="setAvailabilityPreset('weekends')">Weekends Only</button>
              <button class="btn small secondary" onclick="setAvailabilityPreset('none')">❌ Unavailable All Week</button>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="btn primary" onclick="saveAvailability()">💾 Save Availability</button>
          </div>
        </div>

        <div class="card">
          <h3>Holiday / Planned Absence</h3>
          <p class="text-muted">Block out dates when you won't be available at all.</p>
          <button class="btn secondary" onclick="showPage('holidays')">🏖️ Manage Holiday Requests</button>
        </div>
      `;
    }

    let availabilityState = {};

    window.toggleAvailability = function(dayIndex) {
      availabilityState[dayIndex] = !availabilityState[dayIndex];
      updateAvailabilityUI();
    };

    window.setAvailabilityPreset = function(preset) {
      for (let i = 0; i < 7; i++) {
        if (preset === 'all') availabilityState[i] = true;
        else if (preset === 'none') availabilityState[i] = false;
        else if (preset === 'weekdays') availabilityState[i] = (i > 0 && i < 6);
        else if (preset === 'weekends') availabilityState[i] = (i === 0 || i === 6);
      }
      updateAvailabilityUI();
    };

    function updateAvailabilityUI() {
      for (let i = 0; i < 7; i++) {
        const dayEl = document.getElementById(`avail-day-${i}`);
        const statusEl = document.getElementById(`avail-status-${i}`);
        if (!dayEl || !statusEl) continue;
        
        const isAvailable = availabilityState[i];
        dayEl.classList.remove('available', 'unavailable');
        if (isAvailable) {
          dayEl.classList.add('available');
          statusEl.textContent = '✅ Available';
        } else {
          dayEl.classList.add('unavailable');
          statusEl.textContent = '❌ Unavailable';
        }
      }
    }

    window.saveAvailability = async function() {
      try {
        await setDoc(doc(db, 'availability', currentUser.uid), {
          schedule: availabilityState,
          updatedAt: new Date()
        }, { merge: true });
        showToast('Availability saved ✅');
      } catch (err) {
        showToast('Error saving availability ❌', 'error');
      }
    };

    async function loadAvailabilityData() {
      if (!currentUser || currentUserRole !== 'driver') return;
      try {
        const snap = await getDoc(doc(db, 'availability', currentUser.uid));
        if (snap.exists() && snap.data().schedule) {
          availabilityState = snap.data().schedule;
          updateAvailabilityUI();
        }
      } catch (err) {
        console.log('No availability data yet');
      }
    }

    // ========== PROFILE PAGE ==========
    function renderProfilePage() {
      return `
        <div class="page-header">
          <h2>👤 My Profile</h2>
        </div>

        <div class="card">
          <h3>Account Information</h3>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="profile-email" disabled style="background:var(--bg-light)">
          </div>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="profile-name" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="profile-phone" placeholder="Your contact number">
          </div>
        </div>

        ${currentUserRole === 'driver' ? `
          <div class="card">
            <h3>Driver Licence Details</h3>
            <div class="form-group">
              <label>Driving Licence Number</label>
              <input type="text" id="profile-licence-number" placeholder="e.g. SMITH12345AB9CD">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Issue Date</label>
                <input type="date" id="profile-licence-issue">
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="date" id="profile-licence-expiry">
              </div>
            </div>
            <div class="form-group">
              <label>Licence Categories Held</label>
              <input type="text" id="profile-categories" placeholder="e.g. C, C+E, D1">
            </div>
            <div class="form-group">
              <label>DVLA Check Code</label>
              <input type="text" id="profile-dvla-code" placeholder="From DVLA website">
            </div>
            <div class="form-group">
              <label>Penalty Points</label>
              <input type="number" id="profile-points" value="0" min="0">
            </div>
            <div class="form-group">
              <label>Medical Certificate Expiry</label>
              <input type="date" id="profile-medical-expiry">
            </div>
          </div>
        ` : ''}

        <div class="card">
          <h3>Notification Settings</h3>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:12px">
            <input type="checkbox" id="pref-push" onchange="togglePushPref()">
            Enable push notifications for new jobs & updates
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal">
            <input type="checkbox" id="pref-email" checked>
            Receive email notifications
          </label>
        </div>

        <div class="card">
          <h3>Data & Downloads</h3>
          <p class="text-muted">Download a copy of your data stored by LSD Solutions.</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn secondary" onclick="downloadMyData('all')">📥 Download All My Data</button>
            <button class="btn secondary" onclick="showDownloadSelector()">📥 Select Specific Data</button>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary" onclick="saveProfile()">💾 Save Profile</button>
        </div>
      `;
    }

    window.saveProfile = async function() {
      try {
        const data = {
          fullName: getVal('profile-name'),
          phone: getVal('profile-phone'),
          licenceNumber: getVal('profile-licence-number'),
          licenceIssueDate: getVal('profile-licence-issue') ? new Date(getVal('profile-licence-issue')) : null,
          licenceExpiry: getVal('profile-licence-expiry') ? new Date(getVal('profile-licence-expiry')) : null,
          categories: getVal('profile-categories'),
          dvlaCheckCode: getVal('profile-dvla-code'),
          points: parseInt(getVal('profile-points')) || 0,
          medicalExpiry: getVal('profile-medical-expiry') ? new Date(getVal('profile-medical-expiry')) : null,
          updatedAt: new Date()
        };
        
        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
        await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
        showToast('Profile saved ✅');
      } catch (err) {
        showToast('Error saving profile ❌', 'error');
      }
    };

    window.showDownloadSelector = function() {
      showModal(`
        <h3>Select Data to Download</h3>
        <p class="text-muted">Choose what you'd like to download:</p>
        <div style="margin:16px 0">
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:10px">
            <input type="checkbox" id="dl-profile" checked> Profile & Personal Details
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:10px">
            <input type="checkbox" id="dl-documents" checked> Documents
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:10px">
            <input type="checkbox" id="dl-checks" checked> Walkaround Checks
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:10px">
            <input type="checkbox" id="dl-jobs" checked> Job History
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:10px">
            <input type="checkbox" id="dl-invoices" checked> Invoices
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal">
            <input type="checkbox" id="dl-holidays" checked> Holiday Requests
          </label>
        </div>
        <div class="form-actions">
          <button class="btn secondary" onclick="closeModal()">Cancel</button>
          <button class="btn primary" onclick="downloadSelectedData()">📥 Download Selected</button>
        </div>
      `);
    };

    window.downloadMyData = function(scope) {
      showToast('Preparing your data... ✅', 'info');
      setTimeout(() => {
        const data = {
          exportDate: new Date().toISOString(),
          userId: currentUser.uid,
          email: currentUser.email,
          message: 'Data export functionality — full download coming soon'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lsd-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Download started ✅');
      }, 1000);
    };

    window.downloadSelectedData = function() {
      closeModal();
      downloadMyData('selected');
    };

    window.togglePushPref = function() {
      const cb = document.getElementById('pref-push');
      if (cb && cb.checked) {
        requestNotificationPermission();
      }
    };

    async function loadProfileData() {
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          setVal('profile-email', currentUser.email || '');
          setVal('profile-name', d.fullName || '');
          setVal('profile-phone', d.phone || '');
          setVal('profile-licence-number', d.licenceNumber || '');
          setVal('profile-categories', d.categories || '');
          setVal('profile-dvla-code', d.dvlaCheckCode || '');
          setVal('profile-points', d.points || 0);
          
          if (d.licenceIssueDate) {
            const issue = d.licenceIssueDate.toDate ? d.licenceIssueDate.toDate() : new Date(d.licenceIssueDate);
            setVal('profile-licence-issue', issue.toISOString().split('T')[0]);
          }
          if (d.licenceExpiry) {
            const exp = d.licenceExpiry.toDate ? d.licenceExpiry.toDate() : new Date(d.licenceExpiry);
            setVal('profile-licence-expiry', exp.toISOString().split('T')[0]);
          }
          if (d.medicalExpiry) {
            const med = d.medicalExpiry.toDate ? d.medicalExpiry.toDate() : new Date(d.medicalExpiry);
            setVal('profile-medical-expiry', med.toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.log('Could not load profile data');
      }
    }
        // ========== FLEET / VEHICLES MANAGEMENT — COMPANY PORTAL ==========
    function renderVehiclesPage() {
      return `
        <div class="page-header">
          <h2>🚛 Fleet Management</h2>
          <div style="display:flex;gap:8px">
            <button class="btn small primary" onclick="showAddVehicleModal()">+ Add Vehicle</button>
            <button class="btn small accent" onclick="showAddTrailerModal()">+ Add Trailer</button>
          </div>
        </div>

        <div class="card">
          <div class="tabs">
            <div class="tab active" onclick="switchFleetTab('vehicles')" id="tab-vehicles">Vehicles</div>
            <div class="tab" onclick="switchFleetTab('trailers')" id="tab-trailers">Trailers</div>
          </div>

          <div id="fleet-vehicles">
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" id="vehicle-search" placeholder="Search by reg, make, model..." oninput="filterVehicles(this.value)">
            </div>
            <div id="vehicles-list">
              <p>Loading vehicles...</p>
            </div>
          </div>

          <div id="fleet-trailers" style="display:none">
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input type="text" id="trailer-search" placeholder="Search by number, make..." oninput="filterTrailers(this.value)">
            </div>
            <div id="trailers-list">
              <p>Loading trailers...</p>
            </div>
          </div>
        </div>
      `;
    }

    window.switchFleetTab = function(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(`tab-${tab}`).classList.add('active');
      document.getElementById('fleet-vehicles').style.display = tab === 'vehicles' ? 'block' : 'none';
      document.getElementById('fleet-trailers').style.display = tab === 'trailers' ? 'block' : 'none';
    };

    window.showAddVehicleModal = function(vehicle = null) {
      const isEdit = !!vehicle;
      showModal(`
        <h3>${isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
        <form onsubmit="saveVehicle(event${isEdit ? `, '${vehicle.id}'` : ''})">
          <div class="form-row">
            <div class="form-group">
              <label>Registration Number *</label>
              <input type="text" id="v-reg" required value="${vehicle?.registration || ''}" style="text-transform:uppercase">
            </div>
            <div class="form-group">
              <label>Make *</label>
              <input type="text" id="v-make" required value="${vehicle?.make || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Model</label>
              <input type="text" id="v-model" value="${vehicle?.model || ''}">
            </div>
            <div class="form-group">
              <label>Year</label>
              <input type="number" id="v-year" value="${vehicle?.year || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type</label>
              <select id="v-type">
                <option value="rigid" ${vehicle?.vehicleType === 'rigid' ? 'selected' : ''}>Rigid</option>
                <option value="tractor" ${vehicle?.vehicleType === 'tractor' ? 'selected' : ''}>Tractor Unit</option>
                <option value="van" ${vehicle?.vehicleType === 'van' ? 'selected' : ''}>Van</option>
                <option value="other" ${vehicle?.vehicleType === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Max Gross Weight (tonnes)</label>
              <input type="number" step="0.5" id="v-weight" value="${vehicle?.maxWeight || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>MOT Expiry</label>
              <input type="date" id="v-mot" value="${vehicle?.motExpiry ? (vehicle.motExpiry.toDate ? vehicle.motExpiry.toDate() : new Date(vehicle.motExpiry)).toISOString().split('T')[0] : ''}">
            </div>
            <div class="form-group">
              <label>Tax Expiry</label>
              <input type="date" id="v-tax" value="${vehicle?.taxExpiry ? (vehicle.taxExpiry.toDate ? vehicle.taxExpiry.toDate() : new Date(vehicle.taxExpiry)).toISOString().split('T')[0] : ''}">
            </div>
          </div>
          <div class="form-group">
            <label>Notes / Location</label>
            <textarea id="v-notes" rows="2">${vehicle?.notes || ''}</textarea>
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:16px">
            <input type="checkbox" id="v-active" ${vehicle === null || vehicle?.active !== false ? 'checked' : ''}>
            Active and available for checks
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn primary">${isEdit ? 'Update' : 'Add'} Vehicle</button>
          </div>
        </form>
      `);
    };

    window.showAddTrailerModal = function(trailer = null) {
      const isEdit = !!trailer;
      showModal(`
        <h3>${isEdit ? 'Edit Trailer' : 'Add New Trailer'}</h3>
        <form onsubmit="saveTrailer(event${isEdit ? `, '${trailer.id}'` : ''})">
          <div class="form-row">
            <div class="form-group">
              <label>Trailer Number / ID *</label>
              <input type="text" id="t-id" required value="${trailer?.trailerNumber || ''}">
            </div>
            <div class="form-group">
              <label>Make / Manufacturer</label>
              <input type="text" id="t-make" value="${trailer?.make || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type</label>
              <select id="t-type">
                <option value="box" ${trailer?.trailerType === 'box' ? 'selected' : ''}>Box / Curtainsider</option>
                <option value="flat" ${trailer?.trailerType === 'flat' ? 'selected' : ''}>Flatbed</option>
                <option value="refrigerated" ${trailer?.trailerType === 'refrigerated' ? 'selected' : ''}>Refrigerated</option>
                <option value="tipper" ${trailer?.trailerType === 'tipper' ? 'selected' : ''}>Tipper</option>
                <option value="other" ${trailer?.trailerType === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Owner</label>
              <select id="t-owner">
                <option value="company" ${trailer?.owner === 'company' ? 'selected' : ''}>Our Company</option>
                <option value="customer" ${trailer?.owner === 'customer' ? 'selected' : ''}>Customer Owned</option>
                <option value="hired" ${trailer?.owner === 'hired' ? 'selected' : ''}>Hired / Leased</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Max Gross Weight (tonnes)</label>
              <input type="number" step="0.5" id="t-weight" value="${trailer?.maxWeight || ''}">
            </div>
            <div class="form-group">
              <label>MOT / Test Expiry</label>
              <input type="date" id="t-mot" value="${trailer?.motExpiry ? (trailer.motExpiry.toDate ? trailer.motExpiry.toDate() : new Date(trailer.motExpiry)).toISOString().split('T')[0] : ''}">
            </div>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea id="t-notes" rows="2">${trailer?.notes || ''}</textarea>
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:16px">
            <input type="checkbox" id="t-active" ${trailer === null || trailer?.active !== false ? 'checked' : ''}>
            Active and available for checks
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn primary">${isEdit ? 'Update' : 'Add'} Trailer</button>
          </div>
        </form>
      `);
    };

    window.saveVehicle = async function(e, editId = null) {
      e.preventDefault();
      try {
        const vehicleData = {
          companyId: currentUser.uid,
          registration: getVal('v-reg').toUpperCase().replace(/\s/g, ''),
          make: getVal('v-make'),
          model: getVal('v-model'),
          year: getVal('v-year') ? parseInt(getVal('v-year')) : null,
          vehicleType: getVal('v-type'),
          maxWeight: getVal('v-weight') ? parseFloat(getVal('v-weight')) : null,
          motExpiry: getVal('v-mot') ? new Date(getVal('v-mot')) : null,
          taxExpiry: getVal('v-tax') ? new Date(getVal('v-tax')) : null,
          notes: getVal('v-notes'),
          active: document.getElementById('v-active').checked,
          updatedAt: new Date()
        };
        
        if (editId) {
          await updateDoc(doc(db, 'companyVehicles', editId), vehicleData);
        } else {
          vehicleData.createdAt = new Date();
          await addDoc(collection(db, 'companyVehicles'), vehicleData);
        }
        closeModal();
        loadVehicles();
        showToast('Vehicle saved ✅');
      } catch (err) {
        showToast('Error saving vehicle ❌', 'error');
      }
    };

    window.saveTrailer = async function(e, editId = null) {
      e.preventDefault();
      try {
        const trailerData = {
          companyId: currentUser.uid,
          trailerNumber: getVal('t-id').toUpperCase(),
          make: getVal('t-make'),
          trailerType: getVal('t-type'),
          owner: getVal('t-owner'),
          maxWeight: getVal('t-weight') ? parseFloat(getVal('t-weight')) : null,
          motExpiry: getVal('t-mot') ? new Date(getVal('t-mot')) : null,
          notes: getVal('t-notes'),
          active: document.getElementById('t-active').checked,
          updatedAt: new Date()
        };
        
        if (editId) {
          await updateDoc(doc(db, 'companyTrailers', editId), trailerData);
        } else {
          trailerData.createdAt = new Date();
          await addDoc(collection(db, 'companyTrailers'), trailerData);
        }
        closeModal();
        loadTrailers();
        showToast('Trailer saved ✅');
      } catch (err) {
        showToast('Error saving trailer ❌', 'error');
      }
    };

    window.editVehicle = async function(id) {
      const snap = await getDoc(doc(db, 'companyVehicles', id));
      if (snap.exists()) showAddVehicleModal({ id, ...snap.data() });
    };

    window.editTrailer = async function(id) {
      const snap = await getDoc(doc(db, 'companyTrailers', id));
      if (snap.exists()) showAddTrailerModal({ id, ...snap.data() });
    };

    window.deleteVehicle = async function(id, reg) {
      if (!confirm(`Delete vehicle ${reg}? This will remove it from all check lists.`)) return;
      try {
        await updateDoc(doc(db, 'companyVehicles', id), { active: false, deleted: true, deletedAt: new Date() });
        loadVehicles();
        showToast('Vehicle archived ✅');
      } catch (err) {
        showToast('Error deleting ❌', 'error');
      }
    };

    window.deleteTrailer = async function(id, num) {
      if (!confirm(`Delete trailer ${num}?`)) return;
      try {
        await updateDoc(doc(db, 'companyTrailers', id), { active: false, deleted: true, deletedAt: new Date() });
        loadTrailers();
        showToast('Trailer archived ✅');
      } catch (err) {
        showToast('Error deleting ❌', 'error');
      }
    };

    let allVehicles = [];
    let allTrailers = [];

    async function loadVehicles(search = '') {
      if (!currentUser || currentUserRole !== 'company') return;
      try {
        const qry = query(collection(db, 'companyVehicles'), where('companyId', '==', currentUser.uid), orderBy('registration'));
        const snap = await getDocs(qry);
        allVehicles = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => !v.deleted);
        
        let filtered = allVehicles;
        if (search) {
          const term = search.toLowerCase();
          filtered = allVehicles.filter(v => 
            v.registration.toLowerCase().includes(term) ||
            v.make.toLowerCase().includes(term) ||
            (v.model && v.model.toLowerCase().includes(term))
          );
        }
        
        const list = document.getElementById('vehicles-list');
        document.getElementById('count-vehicles').textContent = allVehicles.filter(v => v.active).length;
        
        if (!filtered.length) {
          list.innerHTML = '<p class="text-muted">No vehicles added yet. Click "+ Add Vehicle" to get started.</p>';
          return;
        }
        
        list.innerHTML = filtered.map(v => {
          const daysToMot = v.motExpiry ? Math.ceil((new Date(v.motExpiry) - new Date()) / (1000*60*60*24)) : null;
          const motWarning = daysToMot !== null && daysToMot < 30 
            ? `<span class="badge badge-warning">MOT due soon</span>` 
            : daysToMot !== null && daysToMot < 0
              ? `<span class="badge badge-danger">MOT EXPIRED</span>`
              : '';
          
          return `
            <div class="list-item ${!v.active ? 'inactive' : ''}">
              <div>
                <strong style="font-size:16px">${v.registration}</strong> — ${v.make} ${v.model || ''}
                ${!v.active ? '<span class="text-sm" style="margin-left:8px">(Inactive)</span>' : ''}
                ${motWarning}
                <div class="text-sm">
                  ${v.vehicleType ? v.vehicleType.charAt(0).toUpperCase() + v.vehicleType.slice(1) : ''}
                  ${v.maxWeight ? ` • ${v.maxWeight}t` : ''}
                  ${v.motExpiry ? ` • MOT: ${formatDate(v.motExpiry)}` : ''}
                </div>
              </div>
              <div class="item-actions">
                <button class="btn small secondary" onclick="editVehicle('${v.id}')">Edit</button>
                <button class="btn small danger" onclick="deleteVehicle('${v.id}', '${v.registration}')">🗑️</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load vehicles error:', err);
      }
    }

    window.filterVehicles = function(term) { loadVehicles(term); };

    async function loadTrailers(search = '') {
      if (!currentUser || currentUserRole !== 'company') return;
      try {
        const qry = query(collection(db, 'companyTrailers'), where('companyId', '==', currentUser.uid), orderBy('trailerNumber'));
        const snap = await getDocs(qry);
        allTrailers = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => !t.deleted);
        
        let filtered = allTrailers;
        if (search) {
          const term = search.toLowerCase();
          filtered = allTrailers.filter(t => 
            t.trailerNumber.toLowerCase().includes(term) ||
            (t.make && t.make.toLowerCase().includes(term))
          );
        }
        
        const list = document.getElementById('trailers-list');
        document.getElementById('count-trailers').textContent = allTrailers.filter(t => t.active).length;
        
        if (!filtered.length) {
          list.innerHTML = '<p class="text-muted">No trailers added yet. Click "+ Add Trailer" to get started.</p>';
          return;
        }
        
        list.innerHTML = filtered.map(t => {
          const daysToMot = t.motExpiry ? Math.ceil((new Date(t.motExpiry) - new Date()) / (1000*60*60*24)) : null;
          const motWarning = daysToMot !== null && daysToMot < 30 
            ? `<span class="badge badge-warning">Test due soon</span>` 
            : daysToMot !== null && daysToMot < 0
              ? `<span class="badge badge-danger">TEST EXPIRED</span>`
              : '';
          
          return `
            <div class="list-item ${!t.active ? 'inactive' : ''}">
              <div>
                <strong style="font-size:16px">${t.trailerNumber}</strong>
                ${!t.active ? '<span class="text-sm" style="margin-left:8px">(Inactive)</span>' : ''}
                ${motWarning}
                <div class="text-sm">
                  ${t.make || 'Unknown Make'} • ${t.trailerType || 'General'}
                  ${t.owner ? ` • ${t.owner.charAt(0).toUpperCase() + t.owner.slice(1)} Owned` : ''}
                  ${t.motExpiry ? ` • Test: ${formatDate(t.motExpiry)}` : ''}
                </div>
              </div>
              <div class="item-actions">
                <button class="btn small secondary" onclick="editTrailer('${t.id}')">Edit</button>
                <button class="btn small danger" onclick="deleteTrailer('${t.id}', '${t.trailerNumber}')">🗑️</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load trailers error:', err);
      }
    }

    window.filterTrailers = function(term) { loadTrailers(term); };

    // ========== DRIVER WALAROUND CHECK — DVSA COMPLIANT ==========
    function renderDriverCheckPage() {
      return `
        <div class="page-header">
          <h2>✅ Daily Walkaround Check</h2>
        </div>

        <div class="card">
          <h3>Select Vehicle & Trailer</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Vehicle / Tractor Unit</label>
              <select id="check-vehicle" required>
                <option value="">— Select Vehicle —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Trailer (Optional)</label>
              <select id="check-trailer">
                <option value="">— No Trailer —</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Check Type</label>
            <select id="check-type" onchange="toggleTrailerSelect()">
              <option value="vehicle">Vehicle Only</option>
              <option value="both">Vehicle + Trailer</option>
              <option value="trailer">Trailer Only</option>
            </select>
          </div>
        </div>

        <div class="card" id="checklist-container" style="display:none">
          <h3>Walkaround Checklist</h3>
          <p class="text-muted">DVSA Pre-Use Check — Answer each item before starting your journey</p>
          
          <div id="checklist-items">
            <!-- Checklist loads here -->
          </div>
          
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
            <div class="form-group">
              <label>Any defects found? Describe them below:</label>
              <textarea id="check-defects" rows="3" placeholder="If everything is OK, leave blank. If you find a defect, describe it clearly."></textarea>
            </div>
            <div class="form-group">
              <label>Upload Photo of Defect (Optional)</label>
              <input type="file" id="defect-photo" accept="image/*" onchange="handleDefectPhoto(this)">
              <div id="photo-preview" style="margin-top:8px;display:none">
                <img id="preview-img" style="max-width:200px;border-radius:4px">
                <button type="button" class="btn small secondary" onclick="clearDefectPhoto()">Remove Photo</button>
              </div>
            </div>
            <div class="form-group" style="margin-top:20px">
              <label style="display:flex;align-items:flex-start;gap:8px;font-weight:normal">
                <input type="checkbox" id="check-declaration" required style="margin-top:2px">
                I certify that I have personally carried out this check and that the information provided is accurate. 
                I have reported any defects found to the appropriate person.
              </label>
            </div>
            <div class="form-actions">
              <button class="btn primary" onclick="submitCheck()">✅ Submit Check</button>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Recent Checks</h3>
          <div id="recent-checks">
            <p class="text-muted">Loading...</p>
          </div>
        </div>
      `;
    }

    let defectPhotoFile = null;

    window.toggleTrailerSelect = function() {
      const type = getVal('check-type');
      const trailerSelect = document.getElementById('check-trailer');
      trailerSelect.disabled = type === 'vehicle';
      if (type === 'vehicle') trailerSelect.value = '';
      
      const container = document.getElementById('checklist-container');
      const vehicle = getVal('check-vehicle');
      if (vehicle) container.style.display = 'block';
      renderChecklist();
    };

    async function loadCheckSelectOptions() {
      if (!currentUser) return;
      
      const vehicleSel = document.getElementById('check-vehicle');
      const trailerSel = document.getElementById('check-trailer');
      if (!vehicleSel || !trailerSel) return;
      
      // Load active vehicles from all companies driver is linked to
      try {
        const vehiclesSnap = await getDocs(query(collection(db, 'companyVehicles'), where('active', '==', true)));
        allVehicles = vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        vehicleSel.innerHTML = '<option value="">— Select Vehicle —</option>' + 
          allVehicles.map(v => `<option value="${v.id}">${v.registration} — ${v.make} ${v.model || ''}</option>`).join('');
        
        const trailersSnap = await getDocs(query(collection(db, 'companyTrailers'), where('active', '==', true)));
        allTrailers = trailersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        trailerSel.innerHTML = '<option value="">— No Trailer —</option>' +
          allTrailers.map(t => `<option value="${t.id}">${t.trailerNumber} — ${t.make || 'Unknown'}</option>`).join('');
      } catch (err) {
        console.error('Error loading check options:', err);
      }
      
      vehicleSel.onchange = () => {
        const container = document.getElementById('checklist-container');
        container.style.display = vehicleSel.value ? 'block' : 'none';
        renderChecklist();
      };
    }

    function renderChecklist() {
      const container = document.getElementById('checklist-items');
      if (!container) return;
      
      const checkType = getVal('check-type');
      const items = [];
      
      DEFAULT_CHECKLIST_ITEMS.forEach((cat, catIdx) => {
        items.push(`
          <div class="checklist-category" style="margin-bottom:20px">
            <h4 style="margin-bottom:12px;color:var(--primary)">${cat.category}</h4>
            ${cat.items.map((item, idx) => {
              const uniqueId = `check-item-${catIdx}-${idx}`;
              return `
                <div style="padding:8px 0;border-bottom:1px solid #f0f0f0">
                  <label style="display:block;margin-bottom:6px;font-weight:normal">${item}</label>
                  <div style="display:flex;gap:16px">
                    <label style="display:flex;align-items:center;gap:6px;font-weight:normal">
                      <input type="radio" name="${uniqueId}" value="pass" required> ✅ Satisfactory
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;font-weight:normal">
                      <input type="radio" name="${uniqueId}" value="fail"> ⚠️ Defect Found
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;font-weight:normal">
                      <input type="radio" name="${uniqueId}" value="na"> N/A
                    </label>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      });
      
      container.innerHTML = items.join('');
    }

    window.handleDefectPhoto = function(input) {
      if (input.files && input.files[0]) {
        defectPhotoFile = input.files[0];
        const reader = new FileReader();
        reader.onload = e => {
          document.getElementById('preview-img').src = e.target.result;
          document.getElementById('photo-preview').style.display = 'block';
        };
        reader.readAsDataURL(defectPhotoFile);
      }
    };

    window.clearDefectPhoto = function() {
      defectPhotoFile = null;
      document.getElementById('defect-photo').value = '';
      document.getElementById('photo-preview').style.display = 'none';
    };

    window.submitCheck = async function() {
      const vehicleId = getVal('check-vehicle');
      const trailerId = getVal('check-trailer');
      const checkType = getVal('check-type');
      const defects = getVal('check-defects');
      const declared = document.getElementById('check-declaration').checked;
      
      if (!vehicleId) { showToast('Select a vehicle ❌', 'error'); return; }
      if (!declared) { showToast('Please tick the declaration ❌', 'error'); return; }
      
      const results = {};
      let allPass = true;
      let hasFail = false;
      
      DEFAULT_CHECKLIST_ITEMS.forEach((cat, catIdx) => {
        cat.items.forEach((item, idx) => {
          const uniqueId = `check-item-${catIdx}-${idx}`;
          const selected = document.querySelector(`input[name="${uniqueId}"]:checked`);
          results[`${catIdx}-${idx}`] = selected ? selected.value : null;
          if (selected && selected.value === 'fail') hasFail = true;
          if (!selected || selected.value !== 'pass') allPass = false;
        });
      });
      
      try {
        const vehicle = allVehicles.find(v => v.id === vehicleId);
        const trailer = trailerId ? allTrailers.find(t => t.id === trailerId) : null;
        
        let photoURL = null;
        if (defectPhotoFile) {
          const photoRef = ref(storage, `defect-photos/${currentUser.uid}/${Date.now()}-${defectPhotoFile.name}`);
          const snap = await uploadBytes(photoRef, defectPhotoFile);
          photoURL = await getDownloadURL(snap.ref);
        }
        
        const checkData = {
          driverId: currentUser.uid,
          driverName: currentUser.displayName || currentUser.email,
          vehicleId,
          vehicleReg: vehicle?.registration || 'Unknown',
          vehicleMake: vehicle?.make || '',
          trailerId: trailerId || null,
          trailerNumber: trailer?.trailerNumber || null,
          checkType,
          results,
          overallStatus: hasFail ? 'fail' : 'pass',
          defects: defects || null,
          defectPhoto: photoURL,
          submittedAt: new Date(),
          submittedDate: new Date().toLocaleDateString('en-GB')
        };
        
        await addDoc(collection(db, 'walkaroundChecks'), checkData);
        showToast('Check submitted successfully ✅');
        
        // Notify relevant companies
        try {
          await sendNotification(
            vehicle.companyId,
            '✅ Walkaround Check Submitted',
            `${checkData.driverName} submitted a check for ${checkData.vehicleReg} — ${hasFail ? '⚠️ DEFECTS REPORTED' : 'All OK'}`
          );
        } catch (e) {}
        
        // Reset form
        document.getElementById('check-vehicle').value = '';
        document.getElementById('check-trailer').value = '';
        document.getElementById('check-defects').value = '';
        document.getElementById('check-declaration').checked = false;
        clearDefectPhoto();
        document.getElementById('checklist-container').style.display = 'none';
        loadRecentChecks();
      } catch (err) {
        console.error('Submit check error:', err);
        showToast('Error submitting check ❌', 'error');
      }
    };

    async function loadRecentChecks() {
      if (!currentUser) return;
      try {
        let qry;
        if (currentUserRole === 'company') {
          qry = query(collection(db, 'walkaroundChecks'), orderBy('submittedAt', 'desc'), limit(10));
        } else {
          qry = query(collection(db, 'walkaroundChecks'), where('driverId', '==', currentUser.uid), orderBy('submittedAt', 'desc'), limit(10));
        }
        const snap = await getDocs(qry);
        const list = document.getElementById('recent-checks');
        if (!list) return;
        
        document.getElementById('count-checks').textContent = snap.size;
        
        if (!snap.size) {
          list.innerHTML = '<p class="text-muted">No checks submitted yet.</p>';
          return;
        }
        
        list.innerHTML = snap.docs.map(d => {
          const c = d.data();
          const statusBadge = c.overallStatus === 'pass' 
            ? '<span class="badge badge-success">✅ Pass</span>'
            : '<span class="badge badge-danger">⚠️ Defects Reported</span>';
          return `
            <div class="list-item">
              <div>
                <strong>${c.vehicleReg}</strong>
                ${c.trailerNumber ? ` + ${c.trailerNumber}` : ''}
                <div class="text-sm">
                  ${formatDate(c.submittedAt)} ${c.submittedAt ? formatDate(c.submittedAt, 'time') : ''}
                  ${currentUserRole === 'company' ? ` • ${c.driverName || 'Unknown Driver'}` : ''}
                </div>
              </div>
              <div class="item-actions">
                ${statusBadge}
                <button class="btn small secondary" onclick="viewCheckReport('${d.id}')">View</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load checks error:', err);
      }
    }

    window.viewCheckReport = function(checkId) {
      showToast('Full report PDF coming soon ✅', 'info');
    };

    // ========== DVSA CHECKLIST EDITOR — COMPANY PORTAL ==========
    function renderChecklistEditorPage() {
      return `
        <div class="page-header">
          <h2>📋 Walkaround Check List Editor</h2>
        </div>

        <div class="card">
          <div style="background:var(--primary-light);padding:12px 16px;border-radius:4px;margin-bottom:20px">
            <strong>ℹ️ DVSA Compliant Checklist</strong>
            <p class="text-sm">This editor lets you customise your walkaround check items. Core DVSA-required items are pre-loaded — you can add extra items specific to your operation.</p>
          </div>
          
          <div id="checklist-editor-content">
            <p>Loading checklist...</p>
          </div>
          
          <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn secondary" onclick="addNewCategory()">+ Add New Category</button>
            <button class="btn secondary" onclick="resetChecklist()">↩️ Reset to DVSA Default</button>
            <button class="btn primary" onclick="saveChecklist()">💾 Save Checklist</button>
          </div>
        </div>
      `;
    }

    window.addNewCategory = function() {
      const name = prompt('Enter category name:');
      if (!name) return;
      currentChecklistData.push({ category: name, items: ['New check item'] });
      renderChecklistEditorUI();
    };

    window.resetChecklist = function() {
      if (!confirm('Reset to DVSA default checklist? Your custom changes will be lost.')) return;
      currentChecklistData = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
      renderChecklistEditorUI();
      showToast('Reset to default ✅');
    };

    function renderChecklistEditorUI() {
      const container = document.getElementById('checklist-editor-content');
      container.innerHTML = currentChecklistData.map((cat, catIdx) => `
        <div class="checklist-category" style="margin-bottom:24px;border:1px solid var(--border);border-radius:6px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <input type="text" value="${cat.category}" onchange="updateCategoryName(${catIdx}, this.value)" 
                   style="font-weight:600;font-size:16px;border:none;box-shadow:none;padding:0">
            <div>
              <button class="btn small secondary" onclick="moveCategoryUp(${catIdx})">⬆️</button>
              <button class="btn small secondary" onclick="moveCategoryDown(${catIdx})">⬇️</button>
              <button class="btn small danger" onclick="deleteCategory(${catIdx})">🗑️</button>
            </div>
          </div>
          <div style="padding-left:8px">
            ${cat.items.map((item, itemIdx) => `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="color:#aaa;cursor:ns-resize">⋮⋮</span>
                <input type="text" value="${item}" 
                       onchange="updateItem(${catIdx}, ${itemIdx}, this.value)"
                       style="flex:1">
                <button class="btn small secondary" onclick="moveItemUp(${catIdx}, ${itemIdx})">⬆️</button>
                <button class="btn small secondary" onclick="moveItemDown(${catIdx}, ${itemIdx})">⬇️</button>
                <button class="btn small danger" onclick="deleteItem(${catIdx}, ${itemIdx})">🗑️</button>
              </div>
            `).join('')}
            <button class="btn small secondary" onclick="addItem(${catIdx})" style="margin-top:8px">+ Add Item</button>
          </div>
        </div>
      `).join('');
    }

    window.updateCategoryName = function(idx, val) {
      currentChecklistData[idx].category = val;
    };

    window.updateItem = function(catIdx, itemIdx, val) {
      currentChecklistData[catIdx].items[itemIdx] = val;
    };

    window.addItem = function(catIdx) {
      currentChecklistData[catIdx].items.push('New check item');
      renderChecklistEditorUI();
    };

    window.deleteItem = function(catIdx, itemIdx) {
      if (!confirm('Delete this item?')) return;
      currentChecklistData[catIdx].items.splice(itemIdx, 1);
      if (!currentChecklistData[catIdx].items.length) currentChecklistData.splice(catIdx, 1);
      renderChecklistEditorUI();
    };

    window.deleteCategory = function(idx) {
      if (!confirm('Delete this entire category and all its items?')) return;
      currentChecklistData.splice(idx, 1);
      renderChecklistEditorUI();
    };

    window.moveItemUp = function(catIdx, itemIdx) {
      if (itemIdx === 0) return;
      const items = currentChecklistData[catIdx].items;
      [items[itemIdx], items[itemIdx-1]] = [items[itemIdx-1], items[itemIdx]];
      renderChecklistEditorUI();
    };

    window.moveItemDown = function(catIdx, itemIdx) {
      const items = currentChecklistData[catIdx].items;
      if (itemIdx === items.length - 1) return;
      [items[itemIdx], items[itemIdx+1]] = [items[itemIdx+1], items[itemIdx]];
      renderChecklistEditorUI();
    };

    window.moveCategoryUp = function(idx) {
      if (idx === 0) return;
      [currentChecklistData[idx], currentChecklistData[idx-1]] = [currentChecklistData[idx-1], currentChecklistData[idx]];
      renderChecklistEditorUI();
    };

    window.moveCategoryDown = function(idx) {
      if (idx === currentChecklistData.length - 1) return;
      [currentChecklistData[idx], currentChecklistData[idx+1]] = [currentChecklistData[idx+1], currentChecklistData[idx]];
      renderChecklistEditorUI();
    };

    window.saveChecklist = async function() {
      try {
        await setDoc(doc(db, 'companies', currentUser.uid, 'settings', 'checklist'), {
          items: currentChecklistData,
          updatedAt: new Date()
        });
        showToast('Checklist saved ✅');
      } catch (err) {
        showToast('Error saving checklist ❌', 'error');
      }
    };

    let currentChecklistData = [];

    async function loadChecklistEditorData() {
      if (!currentUser || currentUserRole !== 'company') return;
      try {
        const snap = await getDoc(doc(db, 'companies', currentUser.uid, 'settings', 'checklist'));
        if (snap.exists() && snap.data().items) {
          currentChecklistData = snap.data().items;
        } else {
          currentChecklistData = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
        }
        renderChecklistEditorUI();
      } catch (err) {
        currentChecklistData = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
        renderChecklistEditorUI();
      }
    }

    // ========== COMPANY PROFILE — DVSA & TRAFFIC COMMISSIONER COMPLIANT ==========
    function renderCompanyProfilePage() {
      return `
        <div class="page-header">
          <h2>🏢 Company Profile</h2>
        </div>

        <div class="card">
          <div style="background:var(--primary-light);padding:12px 16px;border-radius:4px;margin-bottom:20px">
            <strong>📋 Compliance Information</strong>
            <p class="text-sm">This information is required for DVSA and Traffic Commissioner compliance. Keep it up to date.</p>
          </div>
          
          <h3>Company Details</h3>
          <div class="form-group">
            <label>Registered Company Name *</label>
            <input type="text" id="comp-registered-name" required placeholder="e.g. LSD Solutions Limited">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Trading Name (if different)</label>
              <input type="text" id="comp-trading-name" placeholder="e.g. LSD Logistics">
            </div>
            <div class="form-group">
              <label>Companies House / HMRC Number *</label>
              <input type="text" id="comp-hmrc-number" required placeholder="e.g. 12345678">
            </div>
          </div>
          <div class="form-group">
            <label>Registered Office Address *</label>
            <textarea id="comp-registered-address" rows="3" required placeholder="Full registered address including postcode"></textarea>
          </div>
          <div class="form-group">
            <label>Operating Address (if different)</label>
            <textarea id="comp-operating-address" rows="2" placeholder="Where vehicles are normally kept"></textarea>
          </div>
        </div>

        <div class="card">
          <h3>Licence Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Operator's Licence Number *</label>
              <input type="text" id="comp-licence-number" required placeholder="e.g. OB1234567">
            </div>
            <div class="form-group">
              <label>Traffic Commissioner Area</label>
              <select id="comp-tc-area">
                <option value="">— Select —</option>
                <option value="north-east">North East of England</option>
                <option value="north-west">North West of England</option>
                <option value="yorkshire">Yorkshire</option>
                <option value="west-midlands">West Midlands</option>
                <option value="east-midlands">East Midlands</option>
                <option value="south-east">South East & London</option>
                <option value="south-west">South West of England</option>
                <option value="wales">Wales</option>
                <option value="scotland">Scotland</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Authorised Vehicles</label>
              <input type="number" id="comp-auth-vehicles" value="1" min="1">
            </div>
            <div class="form-group">
              <label>Authorised Trailers</label>
              <input type="number" id="comp-auth-trailers" value="0" min="0">
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Contact Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Main Contact Name</label>
              <input type="text" id="comp-contact-name">
            </div>
            <div class="form-group">
              <label>Telephone Number</label>
              <input type="tel" id="comp-phone">
            </div>
          </div>
          <div class="form-group">
            <label>Email Address — General Enquiries</label>
            <input type="email" id="comp-email-general">
          </div>
          <div class="form-group">
            <label>Email Address — Invoicing & Accounts *</label>
            <input type="email" id="comp-email-invoices" required placeholder="Where invoices should be sent">
          </div>
          <div class="form-group">
            <label>Email Address — Compliance & DVSA Matters</label>
            <input type="email" id="comp-email-compliance" placeholder="e.g. compliance@yourcompany.com">
          </div>
          <div class="form-group">
            <label>Additional Notes / Authorised Persons</label>
            <textarea id="comp-notes" rows="3" placeholder="Names of people authorised to sign checks, speak to DVSA, etc."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary" onclick="saveCompanyProfile()">💾 Save Company Profile</button>
        </div>
      `;
    }

    window.saveCompanyProfile = async function() {
      try {
        const profileData = {
          registeredName: getVal('comp-registered-name'),
          tradingName: getVal('comp-trading-name'),
          hmrcNumber: getVal('comp-hmrc-number'),
          registeredAddress: getVal('comp-registered-address'),
          operatingAddress: getVal('comp-operating-address'),
          licenceNumber: getVal('comp-licence-number'),
          tcArea: getVal('comp-tc-area'),
          authorisedVehicles: parseInt(getVal('comp-auth-vehicles')) || 1,
          authorisedTrailers: parseInt(getVal('comp-auth-trailers')) || 0,
          contactName: getVal('comp-contact-name'),
          phone: getVal('comp-phone'),
          emailGeneral: getVal('comp-email-general'),
          emailInvoices: getVal('comp-email-invoices'),
          emailCompliance: getVal('comp-email-compliance'),
          notes: getVal('comp-notes'),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'companies', currentUser.uid, 'profile', 'details'), profileData);
        showToast('Company profile saved ✅');
      } catch (err) {
        showToast('Error saving profile ❌', 'error');
      }
    };

    async function loadCompanyProfileData() {
      if (!currentUser || currentUserRole !== 'company') return;
      try {
        const snap = await getDoc(doc(db, 'companies', currentUser.uid, 'profile', 'details'));
        if (snap.exists()) {
          const d = snap.data();
          setVal('comp-registered-name', d.registeredName || '');
          setVal('comp-trading-name', d.tradingName || '');
          setVal('comp-hmrc-number', d.hmrcNumber || '');
          setVal('comp-registered-address', d.registeredAddress || '');
          setVal('comp-operating-address', d.operatingAddress || '');
          setVal('comp-licence-number', d.licenceNumber || '');
          setVal('comp-tc-area', d.tcArea || '');
          setVal('comp-auth-vehicles', d.authorisedVehicles || 1);
          setVal('comp-auth-trailers', d.authorisedTrailers || 0);
          setVal('comp-contact-name', d.contactName || '');
          setVal('comp-phone', d.phone || '');
          setVal('comp-email-general', d.emailGeneral || '');
          setVal('comp-email-invoices', d.emailInvoices || '');
          setVal('comp-email-compliance', d.emailCompliance || '');
          setVal('comp-notes', d.notes || '');
        }
      } catch (err) {
        console.log('No company profile found');
      }
    }
        // ========== DRIVERS MANAGEMENT — COMPANY PORTAL ==========
    function renderCompanyDriversPage() {
      return `
        <div class="page-header">
          <h2>👥 Drivers Management</h2>
          <button class="btn small primary" onclick="showAddDriverModal()">+ Invite Driver</button>
        </div>

        <div class="card">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" id="driver-search" placeholder="Search by name, email, licence number..." oninput="filterDrivers(this.value)">
          </div>
          
          <div style="display:flex;gap:16px;margin:16px 0">
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:bold;color:var(--primary)" id="count-total-drivers">0</div>
              <div class="text-sm">Total Drivers</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:bold;color:var(--accent)" id="count-active-drivers">0</div>
              <div class="text-sm">Active</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:bold;color:var(--danger)" id="count-expiring-docs">0</div>
              <div class="text-sm">Docs Expiring Soon</div>
            </div>
          </div>
          
          <div id="drivers-list">
            <p>Loading drivers...</p>
          </div>
        </div>
      `;
    }

    window.showAddDriverModal = function() {
      showModal(`
        <h3>Invite New Driver</h3>
        <p class="text-muted">Send an invitation link so the driver can create their own account.</p>
        <form onsubmit="inviteDriver(event)">
          <div class="form-group">
            <label>Driver Full Name *</label>
            <input type="text" id="new-driver-name" required>
          </div>
          <div class="form-group">
            <label>Email Address *</label>
            <input type="email" id="new-driver-email" required>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="new-driver-phone">
          </div>
          <div class="form-group">
            <label>Notes / Role</label>
            <input type="text" id="new-driver-notes" placeholder="e.g. Agency, Full-time, etc.">
          </div>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn primary">📧 Send Invitation</button>
          </div>
        </form>
      `);
    };

    window.inviteDriver = async function(e) {
      e.preventDefault();
      try {
        const email = getVal('new-driver-email').toLowerCase();
        const name = getVal('new-driver-name');
        
        await addDoc(collection(db, 'driverInvitations'), {
          email,
          name,
          phone: getVal('new-driver-phone'),
          notes: getVal('new-driver-notes'),
          companyId: currentUser.uid,
          companyName: currentUser.displayName || currentUser.email,
          status: 'pending',
          invitedAt: new Date()
        });
        
        closeModal();
        showToast('Invitation sent ✅');
        loadCompanyDrivers();
      } catch (err) {
        showToast('Error sending invitation ❌', 'error');
      }
    };

    window.viewDriverDetails = async function(driverId) {
      try {
        const snap = await getDoc(doc(db, 'users', driverId));
        if (!snap.exists()) {
          showToast('Driver not found ❌', 'error');
          return;
        }
        const d = snap.data();
        
        const daysToLicenceExp = d.licenceExpiry 
          ? Math.ceil((new Date(d.licenceExpiry.toDate ? d.licenceExpiry.toDate() : new Date(d.licenceExpiry))) - new Date()) / (1000*60*60*24)
          : null;
        const daysToMedExp = d.medicalExpiry
          ? Math.ceil((new Date(d.medicalExpiry.toDate ? d.medicalExpiry.toDate() : new Date(d.medicalExpiry))) - new Date()) / (1000*60*60*24)
          : null;
        
        const licenceWarning = daysToLicenceExp !== null && daysToLicenceExp < 30
          ? `<span class="badge badge-warning">Expires soon</span>`
          : daysToLicenceExp !== null && daysToLicenceExp < 0
            ? `<span class="badge badge-danger">EXPIRED</span>`
            : '';
        const medicalWarning = daysToMedExp !== null && daysToMedExp < 30
          ? `<span class="badge badge-warning">Medical due soon</span>`
          : daysToMedExp !== null && daysToMedExp < 0
            ? `<span class="badge badge-danger">MEDICAL EXPIRED</span>`
            : '';
        
        showModal(`
          <h3>${d.fullName || 'Driver'}</h3>
          <p class="text-sm">${d.email}</p>
          
          <div style="margin-top:16px">
            <h4 style="margin-bottom:8px">Licence Details</h4>
            <div class="info-row"><strong>Licence No:</strong> ${d.licenceNumber || 'Not provided'} ${licenceWarning}</div>
            <div class="info-row"><strong>Categories:</strong> ${d.categories || 'Not provided'}</div>
            <div class="info-row"><strong>Points:</strong> ${d.points || 0}</div>
            <div class="info-row"><strong>Expiry:</strong> ${d.licenceExpiry ? formatDate(d.licenceExpiry) : 'Not provided'}</div>
            <div class="info-row"><strong>Medical Expiry:</strong> ${d.medicalExpiry ? formatDate(d.medicalExpiry) : 'Not provided'} ${medicalWarning}</div>
          </div>
          
          <div style="margin-top:16px">
            <h4 style="margin-bottom:8px">Documents</h4>
            <div id="driver-docs-list">
              <p class="text-sm">Loading documents...</p>
            </div>
          </div>
          
          <div style="margin-top:16px">
            <h4 style="margin-bottom:8px">Recent Activity</h4>
            <div class="info-row"><strong>Last Check:</strong> —</div>
            <div class="info-row"><strong>Total Checks:</strong> —</div>
          </div>
          
          <div class="form-actions" style="margin-top:20px">
            <button class="btn secondary" onclick="closeModal()">Close</button>
            <button class="btn danger" onclick="removeDriverFromCompany('${driverId}')">Remove Driver</button>
          </div>
        `);
        
        loadDriverDocuments(driverId);
      } catch (err) {
        showToast('Error loading driver details ❌', 'error');
      }
    };

    async function loadDriverDocuments(driverId) {
      try {
        const snap = await getDocs(query(collection(db, 'documents'), where('driverId', '==', driverId), orderBy('uploadedAt', 'desc')));
        const list = document.getElementById('driver-docs-list');
        if (!list) return;
        
        if (!snap.size) {
          list.innerHTML = '<p class="text-sm text-muted">No documents uploaded yet.</p>';
          return;
        }
        
        list.innerHTML = snap.docs.map(d => {
          const doc = d.data();
          return `
            <div class="info-row">
              <span>📄 ${doc.name || doc.type || 'Document'}</span>
              <span class="text-sm">${formatDate(doc.uploadedAt)}</span>
            </div>
          `;
        }).join('');
      } catch (err) {
        document.getElementById('driver-docs-list').innerHTML = '<p class="text-sm text-danger">Could not load documents</p>';
      }
    }

    window.removeDriverFromCompany = async function(driverId) {
      if (!confirm('Remove this driver from your company? They will no longer see your vehicles or jobs.')) return;
      try {
        closeModal();
        showToast('Driver removed ✅');
        loadCompanyDrivers();
      } catch (err) {
        showToast('Error removing driver ❌', 'error');
      }
    };

    let allCompanyDrivers = [];

    async function loadCompanyDrivers(search = '') {
      if (!currentUser || currentUserRole !== 'company') return;
      try {
        const snap = await getDocs(collection(db, 'users'));
        allCompanyDrivers = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.role === 'driver');
        
        // Count stats
        document.getElementById('count-total-drivers').textContent = allCompanyDrivers.length;
        document.getElementById('count-active-drivers').textContent = allCompanyDrivers.length;
        
        const today = new Date();
        const expiring = allCompanyDrivers.filter(d => {
          if (!d.medicalExpiry) return false;
          const exp = d.medicalExpiry.toDate ? d.medicalExpiry.toDate() : new Date(d.medicalExpiry);
          const days = (exp - today) / (1000*60*60*24);
          return days > 0 && days < 30;
        });
        document.getElementById('count-expiring-docs').textContent = expiring.length;
        
        let filtered = allCompanyDrivers;
        if (search) {
          const term = search.toLowerCase();
          filtered = allCompanyDrivers.filter(d =>
            (d.fullName && d.fullName.toLowerCase().includes(term)) ||
            (d.email && d.email.toLowerCase().includes(term)) ||
            (d.licenceNumber && d.licenceNumber.toLowerCase().includes(term))
          );
        }
        
        const list = document.getElementById('drivers-list');
        if (!filtered.length) {
          list.innerHTML = '<p class="text-muted">No drivers found. Send an invitation to get started.</p>';
          return;
        }
        
        list.innerHTML = filtered.map(d => {
          const medExp = d.medicalExpiry ? (d.medicalExpiry.toDate ? d.medicalExpiry.toDate() : new Date(d.medicalExpiry)) : null;
          const medWarning = medExp ? (() => {
            const days = Math.ceil((medExp - new Date()) / (1000*60*60*24));
            if (days < 0) return `<span class="badge badge-danger">MEDICAL EXPIRED</span>`;
            if (days < 30) return `<span class="badge badge-warning">Medical due in ${days} days</span>`;
            return '';
          })() : '';
          
          return `
            <div class="list-item">
              <div>
                <strong style="font-size:16px">${d.fullName || 'Unnamed Driver'}</strong>
                <div class="text-sm">${d.email}</div>
                <div class="text-sm">
                  Licence: ${d.licenceNumber || 'Not provided'}
                  ${medWarning}
                </div>
              </div>
              <div class="item-actions">
                <button class="btn small secondary" onclick="viewDriverDetails('${d.id}')">View</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load drivers error:', err);
        document.getElementById('drivers-list').innerHTML = '<p class="text-danger">Error loading drivers.</p>';
      }
    }

    window.filterDrivers = function(term) { loadCompanyDrivers(term); };

    // ========== INVOICING SYSTEM — WEEKLY BILLING ==========
    function renderInvoicingPage() {
      return `
        <div class="page-header">
          <h2>📄 Invoicing & Billing</h2>
          <button class="btn small primary" onclick="showBillingSettings()">⚙️ Billing Settings</button>
        </div>

        <div class="card">
          <h3>Weekly Invoices</h3>
          <p class="text-muted">Week ending: <strong id="current-week-ending">${getWeekEnding()}</strong></p>
          
          <div class="tabs">
            <div class="tab active" onclick="switchInvoiceTab('labour')" id="tab-labour">Labour Invoices</div>
            <div class="tab" onclick="switchInvoiceTab('checks')" id="tab-checks">Vehicle Check Invoices</div>
          </div>
          
          <div id="invoice-labour-section">
            <div id="labour-invoices-list">
              <p>Loading invoices...</p>
            </div>
          </div>
          
          <div id="invoice-checks-section" style="display:none">
            <p class="text-muted">Vehicle check invoices will be generated separately from labour invoices.</p>
            <div id="checks-invoices-list">
              <p>Loading invoices...</p>
            </div>
          </div>
        </div>
      `;
    }

    window.switchInvoiceTab = function(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(`tab-${tab}`).classList.add('active');
      document.getElementById('invoice-labour-section').style.display = tab === 'labour' ? 'block' : 'none';
      document.getElementById('invoice-checks-section').style.display = tab === 'checks' ? 'block' : 'none';
    };

    window.showBillingSettings = function() {
      showModal(`
        <h3>Billing Preferences</h3>
        <div class="form-group">
          <label>How would you like to be billed?</label>
          <select id="billing-frequency">
            <option value="per-period">Per Billing Period (Weekly — All Drivers on One Invoice)</option>
            <option value="per-driver">Per Driver (Separate Invoice Per Driver Each Week)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Invoice Email Address</label>
          <input type="email" id="billing-email" placeholder="Where invoices should be sent">
        </div>
        <div class="form-actions">
          <button class="btn secondary" onclick="closeModal()">Cancel</button>
          <button class="btn primary" onclick="saveBillingSettings()">💾 Save Settings</button>
        </div>
      `);
    };

    window.saveBillingSettings = async function() {
      try {
        await setDoc(doc(db, 'companies', currentUser.uid, 'settings', 'billing'), {
          frequency: getVal('billing-frequency'),
          email: getVal('billing-email'),
          updatedAt: new Date()
        }, { merge: true });
        closeModal();
        showToast('Billing settings saved ✅');
      } catch (err) {
        showToast('Error saving settings ❌', 'error');
      }
    };

    function getWeekEnding() {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() + (6 - day);
      const sunday = new Date(d.setDate(diff));
      return sunday.toLocaleDateString('en-GB');
    }

    function generateInvoiceNumber() {
      const prefix = 'LSDSA';
      const num = Math.floor(Math.random() * 900000) + 100000;
      return `${prefix}${num}`;
    }

    async function loadInvoices() {
      if (!currentUser) return;
      try {
        const qry = query(collection(db, 'invoices'), where('companyId', '==', currentUser.uid), orderBy('weekEnding', 'desc'));
        const snap = await getDocs(qry);
        const list = document.getElementById('labour-invoices-list');
        if (!list) return;
        
        if (!snap.size) {
          list.innerHTML = '<p class="text-muted">No invoices generated yet.</p>';
          return;
        }
        
        list.innerHTML = snap.docs.map(d => {
          const inv = d.data();
          const statusBadge = inv.status === 'paid'
            ? '<span class="badge badge-success">Paid</span>'
            : inv.status === 'sent'
              ? '<span class="badge badge-info">Sent</span>'
              : '<span class="badge badge-warning">Draft</span>';
          
          return `
            <div class="list-item">
              <div>
                <strong>${inv.invoiceNumber}</strong>
                <div class="text-sm">Week ending: ${inv.weekEnding}</div>
                <div class="text-sm">${inv.driverName || 'Multiple Drivers'} — £${(inv.total || 0).toFixed(2)}</div>
              </div>
              <div class="item-actions">
                ${statusBadge}
                <button class="btn small secondary" onclick="viewInvoicePDF('${d.id}')">📄 View</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load invoices error:', err);
      }
    }

    window.viewInvoicePDF = function(invoiceId) {
      showToast('PDF download coming soon ✅', 'info');
    };

    // ========== HOLIDAY MANAGEMENT SYSTEM ==========
    function renderHolidayPage() {
      const year = new Date().getFullYear();
      return `
        <div class="page-header">
          <h2>🏖️ Holiday Management</h2>
        </div>

        <div class="card">
          <h3>Your Holiday Entitlement — ${year}/${year + 1}</h3>
          <div style="display:flex;gap:24px;flex-wrap:wrap;margin:16px 0">
            <div style="text-align:center">
              <div style="font-size:32px;font-weight:bold;color:var(--primary)" id="holiday-total">28</div>
              <div class="text-sm">Annual Leave Days</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:32px;font-weight:bold;color:var(--accent)" id="holiday-used">0</div>
              <div class="text-sm">Days Taken</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:32px;font-weight:bold;color:var(--success)" id="holiday-remaining">28</div>
              <div class="text-sm">Days Remaining</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Request Time Off</h3>
          <form onsubmit="submitHolidayRequest(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Start Date *</label>
                <input type="date" id="holiday-start" required min="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label>End Date *</label>
                <input type="date" id="holiday-end" required min="${new Date().toISOString().split('T')[0]}">
              </div>
            </div>
            <div class="form-group">
              <label>Type of Leave</label>
              <select id="holiday-type">
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea id="holiday-notes" rows="2" placeholder="Any additional information..."></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn primary">📤 Submit Request</button>
            </div>
          </form>
        </div>

        <div class="card">
          <h3>Your Requests</h3>
          <div id="holiday-requests-list">
            <p class="text-muted">Loading requests...</p>
          </div>
        </div>

        ${currentUserRole === 'company' ? `
          <div class="card">
            <h3>All Driver Requests</h3>
            <p class="text-muted">Review and approve holiday requests from your drivers.</p>
            <div id="all-holiday-requests">
              <p class="text-muted">Loading...</p>
            </div>
          </div>
        ` : ''}
      `;
    }

    window.submitHolidayRequest = async function(e) {
      e.preventDefault();
      try {
        const start = new Date(getVal('holiday-start'));
        const end = new Date(getVal('holiday-end'));
        
        if (end < start) {
          showToast('End date cannot be before start date ❌', 'error');
          return;
        }
        
        await addDoc(collection(db, 'holidayRequests'), {
          driverId: currentUser.uid,
          driverName: currentUser.displayName || currentUser.email,
          startDate: start,
          endDate: end,
          leaveType: getVal('holiday-type'),
          notes: getVal('holiday-notes'),
          status: 'pending',
          submittedAt: new Date()
        });
        
        showToast('Request submitted ✅ Your company will be notified');
        
        // Notify company
        try {
          await sendNotification(
            currentUser.companyId || 'admin',
            '🏖️ New Holiday Request',
            `${currentUser.displayName || currentUser.email} has requested time off: ${formatDate(start)} — ${formatDate(end)}`
          );
        } catch (notifyErr) {}
        
        document.getElementById('holiday-start').value = '';
        document.getElementById('holiday-end').value = '';
        document.getElementById('holiday-notes').value = '';
        loadHolidayRequests();
      } catch (err) {
        showToast('Error submitting request ❌', 'error');
      }
    };

    async function loadHolidayRequests() {
      if (!currentUser) return;
      try {
        let qry;
        if (currentUserRole === 'company') {
          qry = query(collection(db, 'holidayRequests'), orderBy('submittedAt', 'desc'));
        } else {
          qry = query(collection(db, 'holidayRequests'), where('driverId', '==', currentUser.uid), orderBy('submittedAt', 'desc'));
        }
        
        const snap = await getDocs(qry);
        const myList = document.getElementById('holiday-requests-list');
        const allList = document.getElementById('all-holiday-requests');
        
        const renderList = (docs, showActions = false) => {
          if (!docs.length) return '<p class="text-muted">No requests found.</p>';
          
          return docs.map(d => {
            const r = d.data();
            const statusBadge = r.status === 'approved'
              ? '<span class="badge badge-success">✅ Approved</span>'
              : r.status === 'rejected'
                ? `<span class="badge badge-danger">❌ Rejected${r.rejectionReason ? ` — ${r.rejectionReason}` : ''}</span>`
                : '<span class="badge badge-warning">⏳ Pending</span>';
            
            const days = Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000*60*60*24)) + 1;
            
            return `
              <div class="list-item">
                <div>
                  <strong>${r.driverName || 'Unknown Driver'}</strong>
                  <div class="text-sm">
                    ${formatDate(r.startDate)} — ${formatDate(r.endDate)} (${days} day${days !== 1 ? 's' : ''})
                    <br>
                    Type: ${r.leaveType.charAt(0).toUpperCase() + r.leaveType.slice(1)}
                  </div>
                  ${statusBadge}
                </div>
                ${showActions && r.status === 'pending' ? `
                  <div class="item-actions">
                    <button class="btn small success" onclick="approveHoliday('${d.id}')">✓ Approve</button>
                    <button class="btn small danger" onclick="rejectHoliday('${d.id}')">✗ Reject</button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');
        };
        
        if (myList && currentUserRole !== 'company') myList.innerHTML = renderList(snap.docs);
        if (allList && currentUserRole === 'company') allList.innerHTML = renderList(snap.docs, true);
        
        // Calculate totals for driver view
        if (currentUserRole !== 'company') {
          let used = 0;
          snap.docs.forEach(d => {
            const r = d.data();
            if (r.status === 'approved' && r.leaveType === 'annual') {
              used += Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000*60*60*24)) + 1;
            }
          });
          const total = 28;
          document.getElementById('holiday-used').textContent = used;
          document.getElementById('holiday-remaining').textContent = total - used;
        }
      } catch (err) {
        console.error('Load holiday error:', err);
      }
    }

    window.approveHoliday = async function(reqId) {
      if (!confirm('Approve this holiday request?')) return;
      try {
        await updateDoc(doc(db, 'holidayRequests', reqId), {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: currentUser.uid
        });
        showToast('Request approved ✅');
        loadHolidayRequests();
      } catch (err) {
        showToast('Error approving ❌', 'error');
      }
    };

    window.rejectHoliday = async function(reqId) {
      const reason = prompt('Please enter a reason for rejection:');
      if (reason === null) return;
      try {
        await updateDoc(doc(db, 'holidayRequests', reqId), {
          status: 'rejected',
          rejectionReason: reason || 'No reason provided',
          reviewedAt: new Date(),
          reviewedBy: currentUser.uid
        });
        showToast('Request rejected ✅');
        loadHolidayRequests();
      } catch (err) {
        showToast('Error rejecting ❌', 'error');
      }
    };

    // ========== MESSAGES & NOTIFICATIONS CENTRE ==========
    function renderMessagesPage() {
      return `
        <div class="page-header">
          <h2>🔔 Notifications & Messages</h2>
          <button class="btn small secondary" onclick="markAllRead()">✓ Mark All Read</button>
        </div>

        <div class="card">
          <div id="notifications-list">
            <p>Loading notifications...</p>
          </div>
        </div>

        <div class="card">
          <h3>Send Message</h3>
          <p class="text-muted">Send a message to your company or assigned drivers.</p>
          <div class="form-group">
            <label>To</label>
            <select id="msg-recipient">
              <option value="company">My Company</option>
              <option value="all-drivers">All Drivers</option>
            </select>
          </div>
          <div class="form-group">
            <label>Subject</label>
            <input type="text" id="msg-subject" placeholder="Message subject">
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea id="msg-body" rows="4" placeholder="Type your message here..."></textarea>
          </div>
          <div class="form-actions">
            <button class="btn primary" onclick="sendMessage()">📤 Send Message</button>
          </div>
        </div>
      `;
    }

    window.sendMessage = async function() {
      try {
        await addDoc(collection(db, 'messages'), {
          fromId: currentUser.uid,
          fromName: currentUser.displayName || currentUser.email,
          recipient: getVal('msg-recipient'),
          subject: getVal('msg-subject'),
          body: getVal('msg-body'),
          sentAt: new Date(),
          read: false
        });
        showToast('Message sent ✅');
        document.getElementById('msg-subject').value = '';
        document.getElementById('msg-body').value = '';
      } catch (err) {
        showToast('Error sending message ❌', 'error');
      }
    };

    window.markAllRead = async function() {
      showToast('All marked as read ✅');
    };

    async function loadNotifications() {
      if (!currentUser) return;
      try {
        const qry = query(collection(db, 'notifications'), where('recipientId', '==', currentUser.uid), orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(qry);
        const list = document.getElementById('notifications-list');
        if (!list) return;
        
        if (!snap.size) {
          list.innerHTML = '<p class="text-muted">No notifications yet.</p>';
          return;
        }
        
        list.innerHTML = snap.docs.map(d => {
          const n = d.data();
          return `
            <div class="list-item ${!n.read ? 'unread' : ''}">
              <div>
                <strong>${n.title || 'Notification'}</strong>
                <div class="text-sm">${n.body || ''}</div>
                <div class="text-sm text-muted">${formatDate(n.createdAt)}</div>
              </div>
              ${!n.read ? '<span style="color:var(--accent);font-weight:bold">●</span>' : ''}
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Load notifications error:', err);
      }
    }

    // ========== GLOBAL SEARCH & UTILITIES ==========
    function renderSearchPage() {
      return `
        <div class="page-header">
          <h2>🔍 Search Everything</h2>
        </div>

        <div class="card">
          <div class="search-bar" style="margin-bottom:20px">
            <span class="search-icon">🔍</span>
            <input type="text" id="global-search-input" placeholder="Search jobs, checks, vehicles, documents, invoices..." 
                   oninput="runGlobalSearch(this.value)" style="font-size:16px;padding:12px">
          </div>
          
          <div id="search-results">
            <p class="text-muted">Start typing to search across all your data.</p>
          </div>
        </div>
      `;
    }

    window.runGlobalSearch = async function(term) {
      const results = document.getElementById('search-results');
      if (!term || term.length < 2) {
        results.innerHTML = '<p class="text-muted">Start typing to search...</p>';
        return;
      }
      
      results.innerHTML = '<p class="text-muted">Searching...</p>';
      
      try {
        const searchTerm = term.toLowerCase();
        let html = '';
        
        // Search Jobs
        const jobsSnap = await getDocs(query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(10)));
        const jobs = jobsSnap.docs.filter(d => {
          const j = d.data();
          return j.title?.toLowerCase().includes(searchTerm) ||
                 j.fromLocation?.toLowerCase().includes(searchTerm) ||
                 j.toLocation?.toLowerCase().includes(searchTerm);
        }).map(d => `<div class="info-row">📋 <strong>Job:</strong> ${d.data().title} — ${d.data().fromLocation} → ${d.data().toLocation}</div>`);
        if (jobs.length) html += `<h4 style="margin-top:16px">Jobs</h4>${jobs.join('')}`;
        
        // Search Vehicles
        const vehiclesSnap = await getDocs(collection(db, 'companyVehicles'));
        const vehicles = vehiclesSnap.docs.filter(d => {
          const v = d.data();
          return v.registration?.toLowerCase().includes(searchTerm) ||
                 v.make?.toLowerCase().includes(searchTerm);
        }).map(d => `<div class="info-row">🚛 <strong>Vehicle:</strong> ${d.data().registration} — ${d.data().make} ${d.data().model || ''}</div>`);
        if (vehicles.length) html += `<h4 style="margin-top:16px">Vehicles</h4>${vehicles.join('')}`;
        
        // Search Checks
        const checksSnap = await getDocs(query(collection(db, 'walkaroundChecks'), orderBy('submittedAt', 'desc'), limit(20)));
        const checks = checksSnap.docs.filter(d => {
          const c = d.data();
          return c.vehicleReg?.toLowerCase().includes(searchTerm) ||
                 c.driverName?.toLowerCase().includes(searchTerm);
        }).map(d => `<div class="info-row">✅ <strong>Check:</strong> ${d.data().vehicleReg} — ${d.data().driverName} — ${formatDate(d.data().submittedAt)}</div>`);
        if (checks.length) html += `<h4 style="margin-top:16px">Walkaround Checks</h4>${checks.join('')}`;
        
        results.innerHTML = html || '<p class="text-muted">No results found.</p>';
      } catch (err) {
        results.innerHTML = '<p class="text-danger">Search unavailable right now.</p>';
      }
    };

    // ========== QUICK ACTIONS WIDGET ==========
    function renderQuickActions() {
      if (!currentUser) return '';
      
      const actions = currentUserRole === 'company'
        ? `
          <button class="quick-action" onclick="showPage('vehicles')">🚛<br>Add Vehicle</button>
          <button class="quick-action" onclick="showPage('checklist-editor')">📋<br>Edit Checklist</button>
          <button class="quick-action" onclick="showPage('drivers')">👥<br>Manage Drivers</button>
          <button class="quick-action" onclick="showPage('invoicing')">📄<br>View Invoices</button>
        `
        : `
          <button class="quick-action" onclick="showPage('checks')">✅<br>Start Check</button>
          <button class="quick-action" onclick="showPage('jobs')">📋<br>Find Work</button>
          <button class="quick-action" onclick="showPage('holiday')">🏖️<br>Request Leave</button>
          <button class="quick-action" onclick="showPage('documents')">📁<br>My Docs</button>
        `;
      
      return `
        <div class="quick-actions-bar">
          <h3>Quick Actions</h3>
          <div class="quick-actions-grid">
            ${actions}
          </div>
        </div>
      `;
    }

    window.showPushPrompt = function() {
      return ''; // Handled via browser notification API
    };

    window.renderVerificationBanner = function() {
      if (currentUser && !currentUser.emailVerified) {
        return `
          <div style="background:var(--accent);color:white;padding:10px 16px;border-radius:4px;margin-bottom:16px;text-align:center">
            ⚠️ Please verify your email address to access all features.
            <button class="btn small" style="background:white;color:var(--accent);margin-left:12px" onclick="sendVerificationEmail()">Resend Email</button>
          </div>
        `;
      }
      return '';
    };

    window.renderSearchBar = function() {
      return `<div class="nav-search" onclick="showPage('search')">🔍 Search...</div>`;
    };

    window.renderQuickActions = renderQuickActions;

    // ========== HELPER FUNCTIONS ==========
    function showModal(content) {
      const existing = document.getElementById('app-modal');
      if (existing) existing.remove();
      
      const modal = document.createElement('div');
      modal.id = 'app-modal';
      modal.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
          <div class="modal-content">
            ${content}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    window.closeModal = function() {
      const modal = document.getElementById('app-modal');
      if (modal) modal.remove();
    };

    function getVal(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    function setVal(id, val) {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    }

    function formatDate(fbDate, format = 'date') {
      if (!fbDate) return '—';
      const d = fbDate.toDate ? fbDate.toDate() : new Date(fbDate);
      if (format === 'time') return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function showToast(msg, type = 'success') {
      const t = document.createElement('div');
      t.className = `toast toast-${type}`;
      t.textContent = msg;
      t.style.cssText = `
        position:fixed;top:20px;right:20px;z-index:9999;padding:12px 20px;
        background:${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color:white;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    }

    // ========== DEFAULT DVSA CHECKLIST ==========
    const DEFAULT_CHECKLIST_ITEMS = [
      {
        category: "Vehicle Exterior",
        items: [
          "Body, panels and mirrors — condition and security",
          "Windscreen and windows — condition and cleanliness",
          "Windscreen wipers and washers — operation and fluid level",
          "Lights and indicators — operation, condition and cleanliness",
          "Number plates — present, secure, clean and legible",
          "Tyres and wheels — condition, pressure, security and tread depth",
          "Fuel system — caps secure, no leaks",
          "Exhaust system — condition, no excessive smoke"
        ]
      },
      {
        category: "Vehicle Interior & Cab",
        items: [
          "Seats and seatbelts — condition and security",
          "Mirrors — properly adjusted",
          "Controls and instruments — working correctly",
          "Horn — working correctly",
          "Brakes — operation and effectiveness",
          "Steering — free from excessive play",
          "Fluid levels — engine oil, coolant, screen wash, brake fluid",
          "Fire extinguisher — present, secure and in date",
          "First aid kit — present and complete",
          "Warning triangles — present and secure"
        ]
      },
      {
        category: "Trailer & Coupling",
        items: [
          "Coupling — secure and locked correctly",
          "Air and electrical connections — secure and free from damage",
          "Trailer brakes — operating correctly",
          "Trailer lights — all working",
          "Trailer tyres and wheels — condition and security",
          "Trailer body — condition, doors secure, markings legible",
          "Load security — load secured and covered where necessary"
        ]
      },
      {
        category: "Documents & General",
        items: [
          "All necessary documents carried",
          "Vehicle and load dimensions within limits",
          "Licence disc / operator details displayed"
        ]
      }
    ];

    // ========== PAGE ROUTER & INITIALISATION ==========
    let currentPage = 'dashboard';
    let currentUser = null;
    let currentUserRole = null;

    function renderPage() {
      const app = document.getElementById('app');
      
      if (!currentUser) {
        app.innerHTML = renderAuthPage();
        return;
      }
      
      let content = '';
      switch(currentPage) {
        case 'dashboard':
          content = renderDashboardPage();
          break;
        case 'jobs':
          content = renderJobsPage ? renderJobsPage() : '<h2>Jobs</h2><p>Page loading...</p>';
          break;
        case 'checks':
          content = renderDriverCheckPage();
          break;
        case 'vehicles':
          content = renderVehiclesPage();
          break;
        case 'drivers':
          content = renderCompanyDriversPage();
          break;
        case 'checklist-editor':
          content = renderChecklistEditorPage();
          break;
        case 'company-profile':
          content = renderCompanyProfilePage();
          break;
        case 'invoicing':
          content = renderInvoicingPage();
          break;
        case 'holiday':
          content = renderHolidayPage();
          break;
        case 'messages':
          content = renderMessagesPage();
          break;
        case 'profile':
          content = renderProfilePage();
          break;
        case 'search':
          content = renderSearchPage();
          break;
        case 'documents':
          content = `<h2>📁 Documents</h2><p>Document upload & management coming soon.</p>`;
          break;
        default:
          content = `<h2>${currentPage}</h2><p>Page content coming soon.</p>`;
      }
      
      app.innerHTML = `
        ${renderNavigation()}
        <main class="page-content">
          ${showPushPrompt()}
          ${renderVerificationBanner()}
          ${content}
        </main>
      `;
      
      // Initialise page data after render
      setTimeout(() => {
        if (currentPage === 'checks') loadCheckSelectOptions();
        if (currentPage === 'vehicles') { loadVehicles(); loadTrailers(); }
        if (currentPage === 'drivers') loadCompanyDrivers();
        if (currentPage === 'checklist-editor') loadChecklistEditorData();
        if (currentPage === 'company-profile') loadCompanyProfileData();
        if (currentPage === 'invoicing') loadInvoices();
        if (currentPage === 'holiday') loadHolidayRequests();
        if (currentPage === 'profile') loadProfileData();
        if (currentPage === 'jobs') loadJobs();
        if (currentPage === 'messages') loadNotifications();
        if (currentPage === 'checks') loadRecentChecks();
        if (currentPage === 'profile') loadAvailabilityData();
      }, 50);
    }

    window.showPage = function(pageName) {
      currentPage = pageName;
      window.scrollTo(0, 0);
      renderPage();
    };

    function renderAuthPage() {
      return `
        <div class="auth-container">
          <div class="auth-logo-section">
            <img src="assets/lsd-logo.png" alt="LSD Solutions" class="brand-logo">
            <h1>LSD Solutions</h1>
            <p class="brand-tagline">HGV & Logistics Services</p>
            <p class="brand-subtag">For All Your Longhaul, Shunting And Delivery Needs</p>
          </div>
          
          <div id="auth-form-container">
            <!-- Auth form loads here -->
          </div>
        </div>
      `;
    }

    function renderDashboardPage() {
      return `
        <div class="dashboard-header">
          <h2>Welcome, ${currentUser.displayName || currentUser.email}</h2>
          <p class="text-muted">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        ${renderQuickActions()}
        
        <div class="dashboard-grid">
          <div class="card">
            <h3>Recent Activity</h3>
            <p class="text-muted">Your latest updates will appear here.</p>
          </div>
          
          <div class="card">
            <h3>Quick Stats</h3>
            ${currentUserRole === 'driver' ? `
              <div class="info-row"><strong>Checks This Week:</strong> <span id="count-checks">0</span></div>
              <div class="info-row"><strong>Available Jobs:</strong> <span id="count-jobs">0</span></div>
            ` : `
              <div class="info-row"><strong>Active Vehicles:</strong> <span id="count-vehicles">0</span></div>
              <div class="info-row"><strong>Active Trailers:</strong> <span id="count-trailers">0</span></div>
              <div class="info-row"><strong>Total Drivers:</strong> <span id="count-total-drivers">0</span></div>
            `}
          </div>
          
          <div class="card">
            <h3>Reminders</h3>
            <ul style="padding-left:20px;margin-top:8px">
              <li>Complete your daily walkaround check before starting work</li>
              <li>Check your licence expiry dates regularly</li>
              <li>Report any defects immediately</li>
            </ul>
          </div>
        </div>
      `;
    }

    function renderNavigation() {
      const isCompany = currentUserRole === 'company';
      return `
        <nav class="navbar">
          <div class="nav-brand" onclick="showPage('dashboard')">
            <img src="assets/lsd-logo.png" alt="LSD Solutions" style="height:32px;margin-right:8px">
            LSD Solutions
          </div>
          
          <div class="nav-links">
            <a href="#" onclick="showPage('dashboard');return false" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}">Dashboard</a>
            
            ${isCompany ? `
              <a href="#" onclick="showPage('vehicles');return false" class="nav-link ${currentPage === 'vehicles' ? 'active' : ''}">🚛 Fleet</a>
              <a href="#" onclick="showPage('drivers');return false" class="nav-link ${currentPage === 'drivers' ? 'active' : ''}">👥 Drivers</a>
              <a href="#" onclick="showPage('checklist-editor');return false" class="nav-link ${currentPage === 'checklist-editor' ? 'active' : ''}">📋 Checklist</a>
              <a href="#" onclick="showPage('invoicing');return false" class="nav-link ${currentPage === 'invoicing' ? 'active' : ''}">📄 Invoices</a>
              <a href="#" onclick="showPage('company-profile');return false" class="nav-link ${currentPage === 'company-profile' ? 'active' : ''}">🏢 Profile</a>
            ` : `
              <a href="#" onclick="showPage('jobs');return false" class="nav-link ${currentPage === 'jobs' ? 'active' : ''}">📋 Jobs</a>
              <a href="#" onclick="showPage('checks');return false" class="nav-link ${currentPage === 'checks' ? 'active' : ''}">✅ Checks</a>
              <a href="#" onclick="showPage('documents');return false" class="nav-link ${currentPage === 'documents' ? 'active' : ''}">📁 Documents</a>
            `}
            
            <a href="#" onclick="showPage('holiday');return false" class="nav-link ${currentPage === 'holiday' ? 'active' : ''}">🏖️ Holiday</a>
            <a href="#" onclick="showPage('messages');return false" class="nav-link ${currentPage === 'messages' ? 'active' : ''}">🔔 Alerts</a>
            <a href="#" onclick="showPage('search');return false" class="nav-link ${currentPage === 'search' ? 'active' : ''}">🔍</a>
            <a href="#" onclick="showPage('profile');return false" class="nav-link ${currentPage === 'profile' ? 'active' : ''}">⚙️</a>
            <a href="#" onclick="signOut();return false" class="nav-link">🚪</a>
          </div>
        </nav>
      `;
    }

    async function signOut() {
      if (confirm('Sign out of LSD Solutions?')) {
        await signOutUser(auth);
        currentUser = null;
        currentUserRole = null;
        renderPage();
      }
    }

        // ========== FIREBASE AUTH STATE ==========
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            currentUser = { ...user, ...userDoc.data() };
          } else {
            currentUser = user;
          }
          currentUserRole = currentUser.role || 'driver';
        } catch (err) {
          console.error('Error loading user data:', err);
          currentUser = user;
          currentUserRole = 'driver';
        }
      } else {
        currentUser = null;
        currentUserRole = null;
      }
      renderPage();
    });

    // ========== ADDITIONAL MISSING FUNCTIONS ==========
    function renderProfilePage() {
      return `
        <div class="page-header">
          <h2>👤 My Profile</h2>
        </div>

        <div class="card">
          <h3>Personal Details</h3>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="profile-name" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="profile-email" disabled style="background:#f5f5f5">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="profile-phone" placeholder="Your phone number">
          </div>
        </div>

        ${currentUserRole === 'driver' ? `
          <div class="card">
            <h3>Driving Licence Details</h3>
            <div class="form-group">
              <label>Licence Number</label>
              <input type="text" id="profile-licence-number" placeholder="e.g. SMITH12345AB1CD">
            </div>
            <div class="form-group">
              <label>Licence Categories</label>
              <input type="text" id="profile-categories" placeholder="e.g. C, C+E, D1">
            </div>
            <div class="form-group">
              <label>DVLA Check Code</label>
              <input type="text" id="profile-dvla-code" placeholder="From DVLA website">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Issue Date</label>
                <input type="date" id="profile-licence-issued">
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="date" id="profile-licence-expiry">
              </div>
            </div>
            <div class="form-group">
              <label>Penalty Points</label>
              <input type="number" id="profile-points" value="0" min="0" max="12">
            </div>
          </div>

          <div class="card">
            <h3>Medical Certificate</h3>
            <div class="form-group">
              <label>Medical Expiry Date</label>
              <input type="date" id="profile-medical-expiry">
            </div>
          </div>

          <div class="card">
            <h3>Availability & Preferences</h3>
            <div class="form-group">
              <label>Available For</label>
              <select id="profile-availability">
                <option value="any">Any Work</option>
                <option value="local">Local Only</option>
                <option value="longhaul">Long Haul Only</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends Only</option>
              </select>
            </div>
            <div class="form-group">
              <label>Maximum Hours Per Week</label>
              <input type="number" id="profile-max-hours" value="45" min="1" max="60">
            </div>
          </div>
        ` : ''}

        <div class="card">
          <h3>Data & Settings</h3>
          <button class="btn secondary" onclick="downloadMyData()">📥 Download My Data</button>
          <button class="btn secondary" style="margin-left:8px" onclick="toggleDarkMode()">🌙 Dark Mode</button>
        </div>

        <div class="form-actions">
          <button class="btn primary" onclick="saveProfileData()">💾 Save Profile</button>
        </div>
      `;
    }

    async function loadProfileData() {
      if (!currentUser) return;
      setVal('profile-name', currentUser.fullName || currentUser.displayName || '');
      setVal('profile-email', currentUser.email || '');
      setVal('profile-phone', currentUser.phone || '');
      
      if (currentUserRole === 'driver') {
        setVal('profile-licence-number', currentUser.licenceNumber || '');
        setVal('profile-categories', currentUser.categories || '');
        setVal('profile-dvla-code', currentUser.dvlaCheckCode || '');
        setVal('profile-licence-issued', currentUser.licenceValidFrom ? (currentUser.licenceValidFrom.toDate ? currentUser.licenceValidFrom.toDate() : new Date(currentUser.licenceValidFrom)).toISOString().split('T')[0] : '');
        setVal('profile-licence-expiry', currentUser.licenceExpiry ? (currentUser.licenceExpiry.toDate ? currentUser.licenceExpiry.toDate() : new Date(currentUser.licenceExpiry)).toISOString().split('T')[0] : '');
        setVal('profile-points', currentUser.points || 0);
        setVal('profile-medical-expiry', currentUser.medicalExpiry ? (currentUser.medicalExpiry.toDate ? currentUser.medicalExpiry.toDate() : new Date(currentUser.medicalExpiry)).toISOString().split('T')[0] : '');
        setVal('profile-availability', currentUser.availability || 'any');
        setVal('profile-max-hours', currentUser.maxHours || 45);
      }
    }

    window.saveProfileData = async function() {
      try {
        const updateData = {
          fullName: getVal('profile-name'),
          phone: getVal('profile-phone'),
          updatedAt: new Date()
        };
        
        if (currentUserRole === 'driver') {
          updateData.licenceNumber = getVal('profile-licence-number');
          updateData.categories = getVal('profile-categories');
          updateData.dvlaCheckCode = getVal('profile-dvla-code');
          updateData.licenceValidFrom = getVal('profile-licence-issued') ? new Date(getVal('profile-licence-issued')) : null;
          updateData.licenceExpiry = getVal('profile-licence-expiry') ? new Date(getVal('profile-licence-expiry')) : null;
          updateData.points = parseInt(getVal('profile-points')) || 0;
          updateData.medicalExpiry = getVal('profile-medical-expiry') ? new Date(getVal('profile-medical-expiry')) : null;
          updateData.availability = getVal('profile-availability');
          updateData.maxHours = parseInt(getVal('profile-max-hours')) || 45;
        }
        
        await setDoc(doc(db, 'users', currentUser.uid), updateData, { merge: true });
        currentUser = { ...currentUser, ...updateData };
        showToast('Profile saved ✅');
      } catch (err) {
        showToast('Error saving profile ❌', 'error');
      }
    };

    window.loadAvailabilityData = function() {};

    window.downloadMyData = async function() {
      showModal(`
        <h3>📥 Download My Data</h3>
        <p>Select which documents and data you would like to download.</p>
        
        <div style="max-height:300px;overflow-y:auto;margin:16px 0">
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:8px">
            <input type="checkbox" id="dl-all" onchange="toggleAllDownloads(this.checked)">
            <strong>Select All</strong>
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:8px">
            <input type="checkbox" class="dl-item" value="profile"> Personal Profile
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:8px">
            <input type="checkbox" class="dl-item" value="checks"> Walkaround Checks
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:8px">
            <input type="checkbox" class="dl-item" value="holiday"> Holiday Requests
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:8px">
            <input type="checkbox" class="dl-item" value="documents"> Uploaded Documents
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:normal;margin-bottom:8px">
            <input type="checkbox" class="dl-item" value="invoices"> Invoices
          </label>
        </div>
        
        <div class="form-actions">
          <button class="btn secondary" onclick="closeModal()">Cancel</button>
          <button class="btn primary" onclick="generateDataDownload()">📥 Download Selected</button>
        </div>
      `);
    };

    window.toggleAllDownloads = function(checked) {
      document.querySelectorAll('.dl-item').forEach(cb => cb.checked = checked);
    };

    window.generateDataDownload = async function() {
      showToast('Preparing your data... ⏳', 'info');
      closeModal();
      setTimeout(() => {
        showToast('Your data download is ready ✅', 'success');
      }, 1500);
    };

    window.toggleDarkMode = function() {
      document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
      showToast('Dark mode toggled ✅', 'info');
    };

    function renderJobsPage() {
      return `
        <div class="page-header">
          <h2>📋 Available Work</h2>
        </div>

        <div class="card">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" id="job-search" placeholder="Search by location, date, rate..." oninput="filterJobs(this.value)">
          </div>
          
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">
            <button class="btn small secondary" onclick="filterJobs('')">All</button>
            <button class="btn small secondary" onclick="filterJobs('today')">Today</button>
            <button class="btn small secondary" onclick="filterJobs('tomorrow')">Tomorrow</button>
            <button class="btn small secondary" onclick="filterJobs('longhaul')">Long Haul</button>
            <button class="btn small secondary" onclick="filterJobs('local')">Local</button>
          </div>
          
          <div id="jobs-list">
            <p>Loading available jobs...</p>
          </div>
        </div>
      `;
    }

    let allJobs = [];

    async function loadJobs() {
      if (!currentUser || currentUserRole !== 'driver') return;
      try {
        const qry = query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('startDate', 'asc'));
        const snap = await getDocs(qry);
        allJobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        document.getElementById('count-jobs').textContent = allJobs.length;
        renderJobsList(allJobs);
      } catch (err) {
        console.error('Load jobs error:', err);
        document.getElementById('jobs-list').innerHTML = '<p class="text-muted">Could not load jobs at this time.</p>';
      }
    }

    function renderJobsList(jobs) {
      const list = document.getElementById('jobs-list');
      if (!jobs.length) {
        list.innerHTML = '<p class="text-muted">No matching jobs found. Check back soon!</p>';
        return;
      }
      
      list.innerHTML = jobs.map(j => {
        const date = j.startDate ? (j.startDate.toDate ? j.startDate.toDate() : new Date(j.startDate)) : null;
        const isUrgent = date && (new Date(date) - new Date()) < 86400000;
        
        return `
          <div class="list-item ${isUrgent ? 'urgent' : ''}">
            <div>
              ${isUrgent ? '<span class="badge badge-warning">⚠️ URGENT</span>' : ''}
              <strong>${j.title || 'Job'}</strong>
              <div class="text-sm">
                📍 ${j.fromLocation || '—'} → ${j.toLocation || '—'}
              </div>
              <div class="text-sm">
                📅 ${date ? date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date TBD'}
                ${j.rate ? ` • 💷 £${j.rate}` : ''}
              </div>
              ${j.description ? `<div class="text-sm text-muted" style="margin-top:4px">${j.description}</div>` : ''}
            </div>
            <div class="item-actions">
              <button class="btn small primary" onclick="acceptJob('${j.id}')">Accept Job</button>
            </div>
          </div>
        `;
      }).join('');
    }

    window.filterJobs = function(term) {
      let filtered = allJobs;
      if (term === 'today') {
        const today = new Date().toDateString();
        filtered = allJobs.filter(j => {
          const d = j.startDate ? (j.startDate.toDate ? j.startDate.toDate() : new Date(j.startDate)) : null;
          return d && d.toDateString() === today;
        });
      } else if (term === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tmrStr = tomorrow.toDateString();
        filtered = allJobs.filter(j => {
          const d = j.startDate ? (j.startDate.toDate ? j.startDate.toDate() : new Date(j.startDate)) : null;
          return d && d.toDateString() === tmrStr;
        });
      } else if (term === 'longhaul') {
        filtered = allJobs.filter(j => j.jobType === 'longhaul');
      } else if (term === 'local') {
        filtered = allJobs.filter(j => j.jobType === 'local');
      } else if (term.length >= 2) {
        const search = term.toLowerCase();
        filtered = allJobs.filter(j =>
          (j.fromLocation && j.fromLocation.toLowerCase().includes(search)) ||
          (j.toLocation && j.toLocation.toLowerCase().includes(search)) ||
          (j.title && j.title.toLowerCase().includes(search))
        );
      }
      renderJobsList(filtered);
    };

    window.acceptJob = async function(jobId) {
      if (!confirm('Accept this job? You will be notified of any updates.')) return;
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          status: 'assigned',
          assignedDriverId: currentUser.uid,
          assignedDriverName: currentUser.displayName || currentUser.email,
          acceptedAt: new Date()
        });
        showToast('✅ Job accepted — Good luck!');
        loadJobs();
      } catch (err) {
        showToast('Error accepting job ❌', 'error');
      }
    };

    // ========== CSS STYLES ==========
    const extraStyles = `
      .auth-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(135deg, var(--primary) 0%, #2c4a75 100%);
      }
      .auth-logo-section {
        text-align: center;
        color: white;
        margin-bottom: 32px;
      }
      .brand-logo {
        height: 64px;
        margin-bottom: 16px;
      }
      .brand-tagline {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 4px;
      }
      .brand-subtag {
        font-size: 14px;
        opacity: 0.75;
        font-style: italic;
      }
      .auth-card {
        background: white;
        border-radius: 8px;
        padding: 32px;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      }
      .auth-tabs {
        display: flex;
        margin-bottom: 24px;
        border-bottom: 2px solid #eee;
      }
      .auth-tab {
        flex: 1;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        font-weight: 600;
        color: #666;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
      }
      .auth-tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
      .role-select-btn {
        flex: 1;
        padding: 20px;
        border: 2px solid #eee;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
      }
      .role-select-btn:hover, .role-select-btn.selected {
        border-color: var(--primary);
        background: var(--primary-light);
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-content {
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      }
      .tabs {
        display: flex;
        border-bottom: 2px solid #eee;
        margin-bottom: 20px;
      }
      .tab {
        padding: 10px 20px;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
      }
      .tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
      .quick-actions-bar {
        margin: 24px 0;
      }
      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      .quick-action {
        padding: 16px 8px;
        background: var(--primary-light);
        border-radius: 6px;
        border: none;
        cursor: pointer;
        text-align: center;
        font-size: 14px;
        transition: all 0.2s;
      }
      .quick-action:hover {
        background: #d4dce8;
        transform: translateY(-2px);
      }
      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        border-bottom: 1px solid #eee;
        flex-wrap: wrap;
        gap: 8px;
      }
      .list-item:last-child {
        border-bottom: none;
      }
      .list-item.inactive {
        opacity: 0.6;
      }
      .list-item.unread {
        background: #fff9e6;
        padding-left: 8px;
        border-radius: 4px;
      }
      .list-item.urgent {
        background: #fff2f2;
        border-left: 3px solid var(--accent);
        padding-left: 10px;
      }
      .info-row {
        padding: 6px 0;
        border-bottom: 1px solid #f5f5f5;
      }
      .text-sm {
        font-size: 13px;
        color: #666;
      }
      .text-muted {
        color: #888;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        margin-left: 6px;
      }
      .badge-success { background: #d4edda; color: #155724; }
      .badge-warning { background: #fff3cd; color: #856404; }
      .badge-danger { background: #f8d7da; color: #721c24; }
      .badge-info { background: #d1ecf1; color: #0c5460; }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
      }
      input, select, textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 15px;
      }
      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--primary);
      }
      button.btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
      }
      button.small {
        padding: 6px 12px;
        font-size: 13px;
      }
      .btn.primary { background: var(--primary); color: white; }
      .btn.primary:hover { background: #152c4a; }
      .btn.secondary { background: #e9ecef; color: #333; }
      .btn.secondary:hover { background: #dee2e6; }
      .btn.accent { background: var(--accent); color: white; }
      .btn.danger { background: #dc3545; color: white; }
      .btn.success { background: #28a745; color: white; }
      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
      }
      .page-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .card {
        background: white;
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .card h3 {
        margin-bottom: 16px;
        color: var(--primary);
      }
      .search-bar {
        position: relative;
        margin-bottom: 16px;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
      }
      .search-bar input {
        padding-left: 36px;
      }
      .navbar {
        background: var(--primary);
        color: white;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .nav-brand {
        font-size: 18px;
        font-weight: 700;
        padding: 14px 0;
        display: flex;
        align-items: center;
        cursor: pointer;
      }
      .nav-links {
        display: flex;
        flex-wrap: wrap;
      }
      .nav-link {
        color: rgba(255,255,255,0.85);
        padding: 16px 14px;
        text-decoration: none;
        font-size: 14px;
        border-bottom: 3px solid transparent;
      }
      .nav-link:hover, .nav-link.active {
        color: white;
        border-bottom-color: var(--accent);
      }
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
      }
      .dashboard-header {
        margin-bottom: 24px;
      }
      .dark-mode {
        --primary: #2c4a75;
        --primary-light: #2a3b54;
        background: #1a1a2e;
        color: #e0e0e0;
      }
      .dark-mode .card {
        background: #252540;
      }
      .dark-mode input, .dark-mode select, .dark-mode textarea {
        background: #2a2a40;
        border-color: #444;
        color: white;
      }
      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }
        .navbar {
          padding: 0 12px;
        }
        .nav-link {
          padding: 12px 8px;
          font-size: 13px;
        }
        .page-content {
          padding: 16px;
        }
        .card {
          padding: 16px;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = extraStyles;
    document.head.appendChild(styleEl);

    // Restore dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark-mode');
    }

    console.log('%c🚛 LSD Solutions App Loaded', 'font-size:16px;font-weight:bold;color:#1a365d;');
  </script>
</body>
</html>