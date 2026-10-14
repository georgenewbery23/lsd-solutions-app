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
      --accent: #d47500;
      --success: #2e7d32;
      --danger: #c62828;
      --warning: #ef6c00;
      --text: #1f2937;
      --text-light: #6b7280;
      --border: #d1d5db;
      --bg: #ffffff;
      --card-bg: #f9fafb;
      --shadow: 0 2px 8px rgba(0,0,0,0.08);
      --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
    }
    [data-theme="dark"] {
      --primary: #2d4a77;
      --primary-light: #1e293b;
      --accent: #f59e0b;
      --text: #f1f5f9;
      --text-light: #94a3b8;
      --border: #374151;
      --bg: #111827;
      --card-bg: #1f2937;
      --shadow: 0 2px 8px rgba(0,0,0,0.3);
      --shadow-lg: 0 4px 16px rgba(0,0,0,0.4);
    }
    body { background: var(--bg); color: var(--text); min-height: 100vh; transition: background 0.3s, color 0.3s; }
    
    /* Layout */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .page { display: none; padding: 1rem 0; animation: fadeIn 0.3s ease; }
    .page.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    /* Header */
    .app-header { text-align: center; padding: 2rem 1rem; background: linear-gradient(135deg, var(--primary) 0%, #2c5282 100%); color: white; }
    .logo { max-width: 140px; margin-bottom: 1rem; }
    .app-header h1 { font-size: 1.8rem; margin-bottom: 0.3rem; }
    .app-header h2 { font-size: 1.1rem; font-weight: 400; opacity: 0.9; margin-bottom: 0.3rem; }
    .app-header p { font-size: 0.95rem; opacity: 0.8; }
    
    /* Navigation */
    .nav-bar { position: sticky; top: 0; background: var(--bg); border-bottom: 1px solid var(--border); z-index: 100; padding: 0.75rem 0; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-weight: 700; color: var(--primary); text-decoration: none; font-size: 1.2rem; }
    .nav-links { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .nav-btn { background: transparent; border: none; color: var(--text); padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .nav-btn:hover, .nav-btn.active { background: var(--primary-light); color: var(--primary); }
    .nav-right { display: flex; align-items: center; gap: 0.75rem; }
    
    /* Mobile Menu */
    .menu-toggle { display: none; background: none; border: none; font-size: 1.5rem; color: var(--text); cursor: pointer; }
    @media (max-width: 768px) {
      .menu-toggle { display: block; }
      .nav-links { display: none; position: absolute; top: 100%; left: 0; right: 0; flex-direction: column; background: var(--bg); border: 1px solid var(--border); padding: 1rem; gap: 0.5rem; }
      .nav-links.open { display: flex; }
    }
    
    /* Forms */
    .card { background: var(--card-bg); border-radius: 10px; padding: 1.5rem; box-shadow: var(--shadow); margin-bottom: 1.5rem; }
    .card h3 { font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; }
    input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.95rem; background: var(--bg); color: var(--text); }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(26,54,93,0.15); }
    .btn { padding: 0.75rem 1.25rem; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: #152c4d; }
    .btn-accent { background: var(--accent); color: white; }
    .btn-accent:hover { background: #b86500; }
    .btn-success { background: var(--success); color: white; }
    .btn-danger { background: var(--danger); color: white; }
    .btn-secondary { background: var(--border); color: var(--text); }
    .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.85rem; }
    .btn-group { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
    .btn-full { width: 100%; }
    
    /* Auth Pages */
    .auth-container { max-width: 440px; margin: 2rem auto; padding: 0 1rem; }
    .auth-tabs { display: flex; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
    .auth-tab { flex: 1; padding: 0.75rem; background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--text-light); }
    .auth-tab.active { color: var(--primary); border-bottom: 2px solid var(--primary); font-weight: 600; }
    .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .role-card { padding: 1.5rem; text-align: center; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .role-card.selected { border-color: var(--primary); background: var(--primary-light); }
    .role-card span { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    
    /* Alerts & Banners */
    .alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .alert-success { background: #e8f5e9; color: var(--success); }
    .alert-error { background: #ffebee; color: var(--danger); }
    .alert-warning { background: #fff8e1; color: var(--warning); }
    .alert-info { background: var(--e3f2fd); color: #0277bd; }
    .offline-banner { background: var(--warning); color: white; text-align: center; padding: 0.5rem; font-size: 0.9rem; position: sticky; top: 0; z-index: 200; display: none; }
    .offline-banner.show { display: block; }
    
    /* Lists & Tables */
    .list-item { padding: 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .list-item:last-child { border-bottom: none; }
    .list-item h4 { font-size: 0.95rem; margin-bottom: 0.25rem; }
    .list-item p { font-size: 0.85rem; color: var(--text-light); }
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-success { background: #e8f5e9; color: var(--success); }
    .badge-danger { background: #ffebee; color: var(--danger); }
    .badge-warning { background: #fff8e1; color: var(--warning); }
    .badge-info { background: #e3f2fd; color: #0277bd; }
    
    /* Search */
    .search-bar { margin-bottom: 1rem; position: relative; }
    .search-bar input { padding-left: 2.5rem; }
    .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-light); }
    
    /* Quick Actions */
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .quick-action-card { background: var(--card-bg); padding: 1.25rem; border-radius: 8px; text-align: center; cursor: pointer; box-shadow: var(--shadow); transition: all 0.2s; }
    .quick-action-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .quick-action-card span { font-size: 1.8rem; display: block; margin-bottom: 0.5rem; }
    .quick-action-card p { font-size: 0.85rem; color: var(--text-light); }
    
    /* Checklist */
    .checklist-section { margin-bottom: 1.5rem; }
    .check-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
    .check-item:last-child { border-bottom: none; }
    .check-item input[type="checkbox"] { width: 1.2rem; height: 1.2rem; margin-top: 0.1rem; cursor: pointer; }
    .check-item label { flex: 1; margin-bottom: 0; cursor: pointer; }
    .check-item.fault label { color: var(--danger); }
    .fault-note { margin-top: 0.5rem; padding: 0.5rem; background: #ffebee; border-radius: 4px; font-size: 0.85rem; }
    .checklist-editor-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: var(--bg); border-radius: 4px; margin-bottom: 0.5rem; }
    .checklist-editor-item input { flex: 1; margin-bottom: 0; }
    .drag-handle { cursor: grab; color: var(--text-light); }
    .drag-handle:active { cursor: grabbing; }
    
    /* Profile */
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .profile-item label { font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.1rem; }
    .profile-item .value { font-size: 0.95rem; }
    
    /* Documents */
    .doc-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg); border-radius: 6px; margin-bottom: 0.5rem; }
    .doc-icon { font-size: 1.5rem; margin-right: 0.75rem; }
    .doc-info { flex: 1; }
    .doc-name { font-weight: 500; font-size: 0.9rem; }
    .doc-date { font-size: 0.8rem; color: var(--text-light); }
    
    /* Invoices */
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--primary); }
    .invoice-number { font-size: 1.1rem; font-weight: 700; color: var(--primary); }
    .invoice-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .invoice-table th, .invoice-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .invoice-table th { background: var(--primary-light); font-weight: 600; }
    .invoice-total { text-align: right; font-size: 1.2rem; font-weight: 700; margin-top: 1rem; }
    
    /* Holiday */
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; justify-content: flex-start; padding: 0.25rem; border-radius: 4px; font-size: 0.8rem; min-height: 50px; }
    .calendar-day.today { border: 2px solid var(--primary); }
    .calendar-day.weekend { background: var(--primary-light); }
    .calendar-day.off { background: #ffebee; color: var(--danger); }
    .calendar-day.holiday { background: #fff8e1; color: var(--warning); }
    .calendar-day-number { font-weight: 600; }
    
    /* Utilities */
    .hidden { display: none !important; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { color: var(--text-light); }
    .mt-1 { margin-top: 0.5rem; }
    .mt-2 { margin-top: 1rem; }
    .mb-1 { margin-bottom: 0.5rem; }
    .mb-2 { margin-bottom: 1rem; }
    .w-full { width: 100%; }
    
    @media print {
      .no-print { display: none !important; }
      .page { display: block !important; }
    }
    
    /* Loading Spinner */
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <!-- Offline Banner -->
  <div id="offlineBanner" class="offline-banner">⚠️ You are offline — changes will save when you reconnect</div>

  <!-- Header -->
  <header class="app-header no-print">
    <img src="assets/lsd-logo.png" alt="LSD Solutions" class="logo" onerror="this.style.display='none'" />
    <h1>LSD Solutions</h1>
    <h2>HGV And Logistics Services</h2>
    <p>For All Your Longhaul, Shunting And Delivery Needs</p>
  </header>

  <!-- Navigation Bar -->
  <nav id="mainNav" class="nav-bar no-print hidden">
    <div class="container nav-inner">
      <a href="#" class="nav-logo" onclick="showPage('dashboard'); return false;">🚛 LSD Solutions</a>
      <button class="menu-toggle" onclick="toggleMenu()">☰</button>
      <div class="nav-links" id="navLinks">
        <!-- Dynamic links inserted here -->
      </div>
      <div class="nav-right">
        <button class="nav-btn" onclick="toggleTheme()" title="Toggle Dark Mode">🌙</button>
        <button class="nav-btn" id="userMenuBtn">👤 <span id="userNameShort"></span></button>
        <button class="nav-btn btn-secondary" onclick="signOut()">Sign Out</button>
      </div>
    </div>
  </nav>

  <main class="container">
    <!-- AUTH PAGES -->
    <div id="page-auth" class="page active">
      <div class="auth-container">
        <div id="authSignIn">
          <h3 class="text-center mb-2">Sign In</h3>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="signInEmail" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="signInPassword" placeholder="••••••••" />
          </div>
          <button class="btn btn-primary btn-full" onclick="handleSignIn()">Sign In</button>
          <p class="text-center mt-1">
            <a href="#" onclick="showAuthPage('reset'); return false;">Reset Your Password</a>
          </p>
          <p class="text-center mt-2 text-muted">
            Don't have an account? 
            <a href="#" onclick="showAuthPage('register'); return false;">Register</a>
          </p>
        </div>

        <div id="authReset" class="hidden">
          <h3 class="text-center mb-2">Reset Your Password</h3>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="resetEmail" placeholder="you@example.com" />
          </div>
          <button class="btn btn-primary btn-full" onclick="handlePasswordReset()">Send Reset Link</button>
          <p class="text-center mt-2">
            <a href="#" onclick="showAuthPage('signin'); return false;">← Back to Sign In</a>
          </p>
        </div>

        <div id="authCheckEmail" class="hidden text-center">
          <span style="font-size:3rem;">📧</span>
          <h3>Check Your Email</h3>
          <p>We've sent a password reset link to your email address. It may take a few minutes to arrive.</p>
          <button class="btn btn-secondary mt-2" onclick="showAuthPage('signin')">Back to Sign In</button>
        </div>

        <div id="authRegister" class="hidden">
          <h3 class="text-center mb-2">Register As</h3>
          <div class="role-selector">
            <div class="role-card" id="roleDriver" onclick="selectRole('driver')">
              <span>👤</span>
              <strong>Driver</strong>
              <p>Find work & manage documents</p>
            </div>
            <div class="role-card" id="roleCompany" onclick="selectRole('company')">
              <span>🏢</span>
              <strong>Company</strong>
              <p>Post work & manage fleet</p>
            </div>
          </div>
          <div id="registerForm" class="hidden">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="regName" placeholder="Your full name" />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="regEmail" placeholder="you@example.com" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="regPassword" placeholder="Min. 6 characters" />
            </div>
            <button class="btn btn-primary btn-full" onclick="handleRegister()">Create Account</button>
            <p class="text-center mt-2">
              <a href="#" onclick="showAuthPage('signin'); return false;">← Back to Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- DRIVER PAGES -->
    <div id="page-dashboard" class="page">
      <h2>Welcome, <span id="dashboardName"></span> 👋</h2>
      <p class="text-muted" id="dashboardRole"></p>
      
      ${showPushPrompt()}
      ${renderVerificationBanner()}
      ${renderSearchBar()}
      ${renderQuickActions()}
      
      <div id="recentActivity" class="card">
        <h3>Recent Activity</h3>
        <p class="text-muted text-center py-2">Loading...</p>
      </div>
    </div>

    <div id="page-jobs" class="page">
      <h2>Available Work</h2>
      <div class="card">
        <div class="form-group">
          <label>Filter by:</label>
          <select id="jobFilter" onchange="loadJobs()">
            <option value="all">All Jobs</option>
            <option value="longhaul">Long Haul</option>
            <option value="shunting">Shunting</option>
            <option value="local">Local Delivery</option>
          </select>
        </div>
      </div>
      <div id="jobsList">
        <p class="text-muted text-center">Loading jobs...</p>
      </div>
    </div>

    <div id="page-checklist" class="page">
      <h2>Vehicle Walkaround Check</h2>
      <div class="card">
        <div class="form-group">
          <label>Check Type</label>
          <select id="checkType" onchange="updateCheckType()">
            <option value="vehicle">Vehicle Only</option>
            <option value="both">Vehicle & Trailer</option>
            <option value="trailer">Trailer Only</option>
          </select>
        </div>
        <div class="form-group" id="vehicleSelectGroup">
          <label>Vehicle</label>
          <select id="selectedVehicle">
            <option value="">-- Select Vehicle --</option>
          </select>
        </div>
        <div class="form-group hidden" id="trailerSelectGroup">
          <label>Trailer</label>
          <select id="selectedTrailer">
            <option value="">-- Select Trailer --</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date & Time</label>
          <input type="datetime-local" id="checkDateTime" />
        </div>
      </div>
      
      <div class="card">
        <h3>DVSA Walkaround Checklist</h3>
        <div id="checklistItems">
          <p class="text-muted">Loading checklist...</p>
        </div>
      </div>
      
      <div class="btn-group">
        <button class="btn btn-secondary" onclick="resetChecklist()">Clear</button>
        <button class="btn btn-primary" onclick="submitChecklist()">Submit Check</button>
      </div>
    </div>

    <div id="page-documents" class="page">
      <h2>My Documents</h2>
      <div class="btn-group mb-2">
        <button class="btn btn-primary" onclick="uploadDocument()">📤 Upload Document</button>
        <button class="btn btn-secondary" onclick="downloadAllDocuments()">⬇️ Download All</button>
      </div>
      <div id="documentsList">
        <p class="text-muted text-center">No documents uploaded yet.</p>
      </div>
    </div>

    <div id="page-driver-profile" class="page">
      <h2>My Profile</h2>
      <div class="card">
        <h3>Personal Details</h3>
        <div class="profile-grid">
          <div class="profile-item">
            <label>Full Name</label>
            <div class="value" id="profileName">-</div>
          </div>
          <div class="profile-item">
            <label>Email</label>
            <div class="value" id="profileEmail">-</div>
          </div>
          <div class="profile-item">
            <label>Role</label>
            <div class="value" id="profileRole">-</div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>Driving Licence Details</h3>
        <div class="profile-grid">
          <div class="profile-item">
            <label>Licence Number</label>
            <div class="value" id="licenceNumber">-</div>
          </div>
          <div class="profile-item">
            <label>Categories</label>
            <div class="value" id="licenceCategories">-</div>
          </div>
          <div class="profile-item">
            <label>DVLA Check Code</label>
            <div class="value" id="dvlaCode">-</div>
          </div>
          <div class="profile-item">
            <label>Points</label>
            <div class="value" id="licencePoints">None</div>
          </div>
          <div class="profile-item">
            <label>Valid From</label>
            <div class="value" id="licenceValidFrom">-</div>
          </div>
          <div class="profile-item">
            <label>Expiry Date</label>
            <div class="value" id="licenceExpiry">-</div>
          </div>
          <div class="profile-item">
            <label>Medical Expiry</label>
            <div class="value" id="medicalExpiry">-</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm mt-1" onclick="editDriverProfile()">Edit Details</button>
      </div>
      <div class="card">
        <h3>Data Management</h3>
        <div class="btn-group">
          <button class="btn btn-secondary" onclick="exportMyData()">📄 Download My Data</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteAccount()">Delete Account</button>
        </div>
      </div>
    </div>

    <div id="page-holidays" class="page">
      <h2>Holiday & Leave</h2>
      <div class="card">
        <h3 id="calendarMonth">Month Year</h3>
        <div class="calendar-grid" id="calendarGrid"></div>
        <div class="btn-group mt-2">
          <button class="btn btn-secondary" onclick="prevMonth()">← Prev</button>
          <button class="btn btn-primary" onclick="requestHoliday()">Request Holiday</button>
          <button class="btn btn-secondary" onclick="nextMonth()">Next →</button>
        </div>
      </div>
      <div class="card">
        <h3>My Requests</h3>
        <div id="holidayRequests">
          <p class="text-muted">No requests yet.</p>
        </div>
      </div>
    </div>

    <!-- COMPANY PAGES -->
    <div id="page-company-dashboard" class="page">
      <h2>Company Portal</h2>
      <p class="text-muted">Welcome back, <span id="companyName"></span></p>
      
      ${renderQuickActions()}
      
      <div class="card">
        <h3>This Week</h3>
        <div class="profile-grid">
          <div class="profile-item">
            <label>Active Drivers</label>
            <div class="value" id="statDrivers">0</div>
          </div>
          <div class="profile-item">
            <label>Vehicles</label>
            <div class="value" id="statVehicles">0</div>
          </div>
          <div class="profile-item">
            <label>Jobs Posted</label>
            <div class="value" id="statJobs">0</div>
          </div>
          <div class="profile-item">
            <label>Checks Completed</label>
            <div class="value" id="statChecks">0</div>
          </div>
        </div>
      </div>
    </div>

    <div id="page-company-profile" class="page">
      <h2>Company Profile & Compliance</h2>
      <div class="card">
        <h3>Company Information</h3>
        <div class="form-group">
          <label>Registered Company Name *</label>
          <input type="text" id="compRegName" placeholder="Ltd / PLC etc." />
        </div>
        <div class="form-group">
          <label>HMRC Company Registration Number</label>
          <input type="text" id="compHrrc" placeholder="e.g. CRN12345678" />
        </div>
        <div class="form-group">
          <label>Registered Address *</label>
          <textarea id="compRegAddress" rows="3" placeholder="Full registered address"></textarea>
        </div>
        <div class="form-group">
          <label>Trading Name (if different)</label>
          <input type="text" id="compTradingName" placeholder="Trading as..." />
        </div>
        <div class="form-group">
          <label>Operator's Licence Number *</label>
          <input type="text" id="compLicenceNo" placeholder="e.g. OB1234567" />
        </div>
      </div>
      
      <div class="card">
        <h3>Contact Information</h3>
        <div class="form-group">
          <label>Main Contact Name</label>
          <input type="text" id="compContactName" />
        </div>
        <div class="form-group">
          <label>Telephone Number</label>
          <input type="tel" id="compPhone" />
        </div>
        <div class="form-group">
          <label>Email Address — General</label>
          <input type="email" id="compEmail" />
        </div>
        <div class="form-group">
          <label>Email Address — Invoicing Department</label>
          <input type="email" id="compInvoiceEmail" />
        </div>
        <div class="form-group">
          <label>DVSA & Compliance Contact Name</label>
          <input type="text" id="compComplianceContact" />
        </div>
      </div>
      
      <div class="card">
        <h3>Billing Preferences</h3>
        <div class="form-group">
          <label>Invoice Generation</label>
          <select id="billingPreference">
            <option value="per-billing-period">Per Billing Period — Show all drivers on one invoice</option>
            <option value="per-driver">Per Driver — Separate invoice for each driver</option>
          </select>
        </div>
      </div>
      
      <div class="btn-group">
        <button class="btn btn-primary" onclick="saveCompanyProfile()">Save Company Profile</button>
      </div>
    </div>

    <div id="page-company-drivers" class="page">
      <h2>Driver Management</h2>
      <div class="btn-group mb-2">
        <button class="btn btn-primary" onclick="showAddDriverModal()">+ Add Employed Driver</button>
        <input type="text" placeholder="Search drivers..." id="driverSearch" 
               style="max-width:250px; margin-left:auto;" oninput="filterDrivers()" />
      </div>
      <div class="card">
        <div id="companyDriversList">
          <p class="text-muted">Loading drivers...</p>
        </div>
      </div>
    </div>

    <div id="page-company-vehicles" class="page">
      <h2>Fleet Management</h2>
      <div class="btn-group mb-2">
        <button class="btn btn-primary" onclick="showAddVehicleModal()">+ Add Vehicle</button>
        <button class="btn btn-accent" onclick="showAddTrailerModal()">+ Add Trailer</button>
      </div>
      
      <div class="card">
        <h3>Vehicles</h3>
        <div id="companyVehiclesList">
          <p class="text-muted">No vehicles added yet.</p>
        </div>
      </div>
      
      <div class="card">
        <h3>Trailers</h3>
        <div id="companyTrailersList">
          <p class="text-muted">No trailers added yet.</p>
        </div>
      </div>
    </div>

    <div id="page-checklist-editor" class="page">
      <h2>Walkaround Checklist Editor</h2>
      <p class="text-muted mb-2">Customise your DVSA-compliant walkaround checklist. Drag items to reorder.</p>
      <div class="card">
        <div id="checklistEditorContainer">
          <div id="checklistEditorList"></div>
          <div class="mt-2">
            <input type="text" id="newCheckItem" placeholder="Add new check item..." />
            <button class="btn btn-primary btn-sm mt-1" onclick="addCheckItem()">+ Add Item</button>
          </div>
          <div class="btn-group mt-3">
            <button class="btn btn-secondary" onclick="resetChecklistToDefault()">↩️ Reset to DVSA Default</button>
            <button class="btn btn-primary" onclick="saveChecklist()">Save Checklist</button>
          </div>
        </div>
      </div>
    </div>

    <div id="page-company-checks" class="page">
      <h2>Submitted Walkaround Checks</h2>
      <div class="card">
        <div class="form-group">
          <label>Filter by Status</label>
          <select id="checkStatusFilter" onchange="loadCompanyChecks()">
            <option value="all">All Checks</option>
            <option value="pass">No Defects</option>
            <option value="fault">Defects Reported</option>
            <option value="resolved">Defects Resolved</option>
          </select>
        </div>
      </div>
      <div id="companyChecksList">
        <p class="text-muted text-center">Loading checks...</p>
      </div>
    </div>

    <div id="page-invoices" class="page">
      <h2>Invoices & Billing</h2>
      <div class="card">
        <div class="form-group">
          <label>Billing Period</label>
          <input type="week" id="invoiceWeek" onchange="generateInvoices()" />
        </div>
      </div>
      <div id="invoicesOutput"></div>
    </div>

    <div id="page-company-holidays" class="page">
      <h2>Holiday Requests</h2>
      <div class="card">
        <h3>All Requests</h3>
        <div id="allHolidayRequests">
          <p class="text-muted">No requests yet.</p>
        </div>
      </div>
    </div>

    <!-- MODALS -->
    <div id="modalOverlay" class="hidden" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;">
      <div id="modalContent" style="background:var(--bg);border-radius:10px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;padding:1.5rem;">
        <div id="modalBody"></div>
        <div class="btn-group mt-3">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" id="modalConfirmBtn">Confirm</button>
        </div>
      </div>
    </div>

  </main>

  <!-- FIREBASE IMPORTS -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, orderBy, Timestamp, onSnapshot, deleteDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
    import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCzP1QzK5sZb4XzXzXzXzXzXzXzXzXzXzXzX",
      authDomain: "lsd-solutions.firebaseapp.com",
      projectId: "lsd-solutions",
      storageBucket: "lsd-solutions.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abc123def456ghi789jkl01"
    };

    // Initialise Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // Make available globally
    window.firebaseServices = { auth, db, storage, getDoc, setDoc, doc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, Timestamp, increment, ref, uploadBytes, getDownloadURL, listAll, deleteObject };
  </script>

  <script>
    // ==========================================
    // GLOBAL STATE & CONSTANTS
    // ==========================================
    let currentUser = null;
    let currentUserData = null;
    let selectedRole = null;
    let currentPage = 'auth';
    let currentMonth = new Date();
    
    const INVOICE_PREFIX = "LSDsa";
    const DEFAULT_CHECKLIST = {
      items: [
        "1. Cab — Doors, mirrors, windows, steps and handholds secure and free from damage",
        "2. Windscreen and windows — clean, no cracks or chips, wipers and washers work correctly",
        "3. Mirrors — all present, clean, adjusted and secure",
        "4. Lights — all work correctly, lenses clean and undamaged",
        "5. Markings and plates — registration plates, markings and discs correct and legible",
        "6. Tyres and wheels — condition, pressure, security and no cuts/damage",
        "7. Brakes — no air/hydraulic leaks, pressure/build-up normal, warning devices work",
        "8. Suspension — springs, shackles and mountings secure, no damage or leaks",
        "9. Exhaust system — no leaks, securely mounted, no excessive smoke",
        "10. Fuel system — no leaks, cap secure, lines undamaged",
        "11. Load security — load secure, sheeted if required, no items loose",
        "12. Coupling and connections — fifth wheel, drawbar, air/electrical lines secure",
        "13. Trailer — doors, lights, tyres, coupling, markings and load secure",
        "14. Emergency equipment — fire extinguisher, warning triangle, first aid kit present",
        "15. Documentation — all required documents in vehicle and up to date",
        "16. General condition — no obvious damage or defects reported previously"
      ],
      updatedAt: new Date()
    };

    // ==========================================
    // OFFLINE / ONLINE DETECTION
    // ==========================================
    window.addEventListener('online', () => {
      document.getElementById('offlineBanner').classList.remove('show');
    });
    window.addEventListener('offline', () => {
      document.getElementById('offlineBanner').classList.add('show');
    });
    if (!navigator.onLine) {
      document.getElementById('offlineBanner').classList.add('show');
    }

    // ==========================================
    // THEME MANAGEMENT
    // ==========================================
    function toggleTheme() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // ==========================================
    // NAVIGATION HELPERS
    // ==========================================
    function toggleMenu() {
      document.getElementById('navLinks').classList.toggle('open');
    }

    function showPage(pageId) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(pageId).classList.add('active');
      currentPage = pageId;
      
      if (typeof window.loadPageData === 'function') {
        window.loadPageData(pageId);
      }
      
      document.getElementById('navLinks').classList.remove('open');
      window.scrollTo(0, 0);
    }
    window.showPage = showPage;

    function showAuthPage(page) {
      document.getElementById('authSignIn').classList.add('hidden');
      document.getElementById('authReset').classList.add('hidden');
      document.getElementById('authCheckEmail').classList.add('hidden');
      document.getElementById('authRegister').classList.add('hidden');
      
      if (page === 'signin') document.getElementById('authSignIn').classList.remove('hidden');
      else if (page === 'reset') document.getElementById('authReset').classList.remove('hidden');
      else if (page === 'checkemail') document.getElementById('authCheckEmail').classList.remove('hidden');
      else if (page === 'register') {
        document.getElementById('authRegister').classList.remove('hidden');
        selectedRole = null;
        document.getElementById('registerForm').classList.add('hidden');
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
      }
    }

    function selectRole(role) {
      selectedRole = role;
      document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
      document.getElementById('role' + role.charAt(0).toUpperCase() + role.slice(1)).classList.add('selected');
      document.getElementById('registerForm').classList.remove('hidden');
    }

    // ==========================================
    // MODAL HELPERS
    // ==========================================
    function showModal(content, confirmText = 'Confirm', onConfirm = () => {}) {
      document.getElementById('modalBody').innerHTML = content;
      document.getElementById('modalConfirmBtn').textContent = confirmText;
      document.getElementById('modalOverlay').classList.remove('hidden');
      document.getElementById('modalConfirmBtn').onclick = () => {
        onConfirm();
        closeModal();
      };
    }
    window.showModal = showModal;

    function closeModal() {
      document.getElementById('modalOverlay').classList.add('hidden');
    }
    window.closeModal = closeModal;

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    function showAlert(message, type = 'info') {
      const colours = {
        success: '#e8f5e9',
        error: '#ffebee',
        warning: '#fff8e1',
        info: '#e3f2fd'
      };
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;top:1rem;right:1rem;background:${colours[type]};padding:1rem 1.5rem;border-radius:6px;z-index:1000;max-width:350px;box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
      el.textContent = message;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
    window.showAlert = showAlert;

    // ==========================================
    // PUSH NOTIFICATIONS
    // ==========================================
    function showPushPrompt() {
      if ('Notification' in window && Notification.permission === 'default') {
        return `<div class="alert alert-info">🔔 <span>Enable push notifications for job alerts & check reminders</span> <button class="btn btn-sm btn-primary" onclick="requestNotificationPermission()">Enable</button></div>`;
      }
      return '';
    }
    window.showPushPrompt = showPushPrompt;

    function requestNotificationPermission() {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') showAlert('Notifications enabled!', 'success');
      });
    }
    window.requestNotificationPermission = requestNotificationPermission;

    function renderVerificationBanner() {
      if (currentUser && !currentUser.emailVerified) {
        return `<div class="alert alert-warning">📧 Please verify your email address. <button class="btn btn-sm btn-secondary" onclick="resendVerificationEmail()">Resend</button></div>`;
      }
      return '';
    }
    window.renderVerificationBanner = renderVerificationBanner;

    function renderSearchBar() {
      return `<div class="search-bar"><span class="search-icon">🔍</span><input type="text" placeholder="Search everywhere..." id="globalSearch" oninput="handleGlobalSearch(this.value)" /></div>`;
    }
    window.renderSearchBar = renderSearchBar;

    function renderQuickActions() {
      const actions = currentUserData?.role === 'company' ? [
        { icon: '➕', label: 'Post Job', page: 'jobs' },
        { icon: '🚛', label: 'Vehicles', page: 'company-vehicles' },
        { icon: '📋', label: 'Checks', page: 'company-checks' },
        { icon: '📄', label: 'Invoices', page: 'invoices' }
      ] : [
        { icon: '📋', label: 'Start Check', page: 'checklist' },
        { icon: '📄', label: 'Documents', page: 'documents' },
        { icon: '📅', label: 'Holiday', page: 'holidays' },
        { icon: '👤', label: 'Profile', page: 'driver-profile' }
      ];
      
      return `<div class="quick-actions">${actions.map(a => 
        `<div class="quick-action-card" onclick="showPage('${a.page}')"><span>${a.icon}</span><p>${a.label}</p></div>`
      ).join('')}</div>`;
    }
    window.renderQuickActions = renderQuickActions;

    function handleGlobalSearch(query) {
      console.log('Search:', query);
    }
    window.handleGlobalSearch = handleGlobalSearch;

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    async function handleSignIn() {
      const email = document.getElementById('signInEmail').value;
      const password = document.getElementById('signInPassword').value;
      try {
        const { signInWithEmailAndPassword } = firebaseServices;
        await signInWithEmailAndPassword(auth, email, password);
        showAlert('Welcome back!', 'success');
      } catch (err) {
                showAlert('Sign in failed: ' + err.message, 'error');
      }
    }
    window.handleSignIn = handleSignIn;

    async function handlePasswordReset() {
      const email = document.getElementById('resetEmail').value;
      try {
        const { sendPasswordResetEmail } = firebaseServices;
        await sendPasswordResetEmail(auth, email);
        showAuthPage('checkemail');
      } catch (err) {
        showAlert('Error sending reset email: ' + err.message, 'error');
      }
    }
    window.handlePasswordReset = handlePasswordReset;

    async function handleRegister() {
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      
      if (!selectedRole) {
        showAlert('Please select account type', 'warning');
        return;
      }
      
      try {
        const { createUserWithEmailAndPassword, updateProfile } = firebaseServices;
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
        
        // Create user profile in Firestore
        const { setDoc, doc, Timestamp } = firebaseServices;
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          role: selectedRole,
          createdAt: Timestamp.now()
        });
        
        // Initialise company checklist if company account
        if (selectedRole === 'company') {
          await setDoc(doc(db, 'companies', user.uid, 'settings', 'checklist'), {
            items: DEFAULT_CHECKLIST.items,
            updatedAt: Timestamp.now()
          });
        }
        
        showAlert('Account created successfully! ✅', 'success');
      } catch (err) {
        showAlert('Registration failed: ' + err.message, 'error');
      }
    }
    window.handleRegister = handleRegister;

    async function resendVerificationEmail() {
      if (currentUser && !currentUser.emailVerified) {
        const { sendEmailVerification } = firebaseServices;
        await sendEmailVerification(currentUser);
        showAlert('Verification email sent! 📧', 'success');
      }
    }
    window.resendVerificationEmail = resendVerificationEmail;

    function signOut() {
      const { signOut } = firebaseServices;
      signOut(auth).then(() => {
        currentUser = null;
        currentUserData = null;
        showPage('auth');
        document.getElementById('mainNav').classList.add('hidden');
        showAlert('Signed out', 'info');
      });
    }
    window.signOut = signOut;

    // ==========================================
    // AUTH STATE MANAGEMENT
    // ==========================================
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        await loadUserProfile(user.uid);
        showPage('dashboard');
        document.getElementById('mainNav').classList.remove('hidden');
        updateNavigation();
      } else {
        currentUser = null;
        currentUserData = null;
        showPage('auth');
        document.getElementById('mainNav').classList.add('hidden');
      }
    });

    async function loadUserProfile(uid) {
      try {
        const { getDoc, doc } = firebaseServices;
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          currentUserData = snap.data();
          
          // Update UI with user info
          document.getElementById('dashboardName').textContent = currentUserData.name;
          document.getElementById('dashboardRole').textContent = 
            currentUserData.role === 'company' ? 'Company Administrator' : 'Driver';
          document.getElementById('userNameShort').textContent = currentUserData.name.split(' ')[0];
          
          // Driver profile fields
          if (currentUserData.role === 'driver') {
            document.getElementById('profileName').textContent = currentUserData.name || '-';
            document.getElementById('profileEmail').textContent = currentUser.email || '-';
            document.getElementById('profileRole').textContent = 'Driver';
            document.getElementById('licenceNumber').textContent = currentUserData.licenceNumber || '-';
            document.getElementById('licenceCategories').textContent = currentUserData.licenceCategories || '-';
            document.getElementById('dvlaCode').textContent = currentUserData.dvlaCheckCode || '-';
            document.getElementById('licencePoints').textContent = currentUserData.points || 'None';
            document.getElementById('licenceValidFrom').textContent = 
              currentUserData.licenceValidFrom ? new Date(currentUserData.licenceValidFrom).toLocaleDateString() : '-';
            document.getElementById('licenceExpiry').textContent = 
              currentUserData.licenceExpiry ? new Date(currentUserData.licenceExpiry).toLocaleDateString() : '-';
            document.getElementById('medicalExpiry').textContent = 
              currentUserData.medicalExpiry ? new Date(currentUserData.medicalExpiry).toLocaleDateString() : '-';
          }
          
          // Load company profile if needed
          if (currentUserData.role === 'company') {
            loadCompanyProfile(uid);
            ensureDefaultChecklist(uid);
          }
          
        }
      } catch (err) {
        console.error('Profile load error:', err);
      }
    }

    async function ensureDefaultChecklist(companyId) {
      try {
        const { getDoc, setDoc, doc, Timestamp } = firebaseServices;
        const checklistRef = doc(db, 'companies', companyId, 'settings', 'checklist');
        const snap = await getDoc(checklistRef);
        
        if (!snap.exists() || !snap.data().items || snap.data().items.length === 0) {
          await setDoc(checklistRef, {
            items: DEFAULT_CHECKLIST.items,
            updatedAt: Timestamp.now()
          });
          console.log('✅ DVSA default checklist installed');
        }
      } catch (err) {
        console.error('Error setting default checklist:', err);
      }
    }

    function updateNavigation() {
      const navLinks = document.getElementById('navLinks');
      let links = '';
      
      if (currentUserData?.role === 'company') {
        links = `
          <button class="nav-btn" onclick="showPage('company-dashboard')">Dashboard</button>
          <button class="nav-btn" onclick="showPage('company-drivers')">Drivers</button>
          <button class="nav-btn" onclick="showPage('company-vehicles')">Fleet</button>
          <button class="nav-btn" onclick="showPage('checklist-editor')">Checklist</button>
          <button class="nav-btn" onclick="showPage('company-checks')">Checks</button>
          <button class="nav-btn" onclick="showPage('company-profile')">Profile</button>
          <button class="nav-btn" onclick="showPage('invoices')">Invoices</button>
          <button class="nav-btn" onclick="showPage('company-holidays')">Holidays</button>
        `;
      } else {
        links = `
          <button class="nav-btn" onclick="showPage('dashboard')">Dashboard</button>
          <button class="nav-btn" onclick="showPage('jobs')">Work</button>
          <button class="nav-btn" onclick="showPage('checklist')">Walkaround</button>
          <button class="nav-btn" onclick="showPage('documents')">Documents</button>
          <button class="nav-btn" onclick="showPage('holidays')">Holiday</button>
          <button class="nav-btn" onclick="showPage('driver-profile')">Profile</button>
        `;
      }
      navLinks.innerHTML = links;
    }

    // ==========================================
    // COMPANY PROFILE
    // ==========================================
    async function loadCompanyProfile(companyId) {
      try {
        const { getDoc, doc } = firebaseServices;
        const snap = await getDoc(doc(db, 'companies', companyId, 'profile', 'info'));
        if (snap.exists()) {
          const data = snap.data();
          document.getElementById('companyName').textContent = data.tradingName || data.registeredName || 'Your Company';
          
          document.getElementById('compRegName').value = data.registeredName || '';
          document.getElementById('compHrrc').value = data.hmrcNumber || '';
          document.getElementById('compRegAddress').value = data.registeredAddress || '';
          document.getElementById('compTradingName').value = data.tradingName || '';
          document.getElementById('compLicenceNo').value = data.operatorLicence || '';
          document.getElementById('compContactName').value = data.contactName || '';
          document.getElementById('compPhone').value = data.phone || '';
          document.getElementById('compEmail').value = data.email || '';
          document.getElementById('compInvoiceEmail').value = data.invoiceEmail || '';
          document.getElementById('compComplianceContact').value = data.complianceContact || '';
          document.getElementById('billingPreference').value = data.billingPreference || 'per-billing-period';
        }
      } catch (err) {
        console.error('Error loading company profile:', err);
      }
    }
    window.loadCompanyProfile = loadCompanyProfile;

    async function saveCompanyProfile() {
      try {
        const { setDoc, doc, Timestamp } = firebaseServices;
        await setDoc(doc(db, 'companies', currentUser.uid, 'profile', 'info'), {
          registeredName: document.getElementById('compRegName').value,
          hmrcNumber: document.getElementById('compHrrc').value,
          registeredAddress: document.getElementById('compRegAddress').value,
          tradingName: document.getElementById('compTradingName').value,
          operatorLicence: document.getElementById('compLicenceNo').value,
          contactName: document.getElementById('compContactName').value,
          phone: document.getElementById('compPhone').value,
          email: document.getElementById('compEmail').value,
          invoiceEmail: document.getElementById('compInvoiceEmail').value,
          complianceContact: document.getElementById('compComplianceContact').value,
          billingPreference: document.getElementById('billingPreference').value,
          updatedAt: Timestamp.now()
        });
        showAlert('Company profile saved ✅', 'success');
        document.getElementById('companyName').textContent = 
          document.getElementById('compTradingName').value || document.getElementById('compRegName').value || 'Your Company';
      } catch (err) {
        showAlert('Error saving profile: ' + err.message, 'error');
      }
    }
    window.saveCompanyProfile = saveCompanyProfile;

    // ==========================================
    // VEHICLE & TRAILER MANAGEMENT
    // ==========================================
    async function loadCompanyVehicles() {
      if (!currentUser || currentUserData?.role !== 'company') return;
      
      try {
        const { getDocs, collection, query, where } = firebaseServices;
        const vehiclesRef = collection(db, 'companyVehicles');
        const q = query(vehiclesRef, where('companyId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        const container = document.getElementById('companyVehiclesList');
        if (snapshot.empty) {
          container.innerHTML = '<p class="text-muted">No vehicles added yet.</p>';
          return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
          const v = doc.data();
          return `
            <div class="list-item">
              <div>
                <h4>${v.make} ${v.model} — ${v.registration}</h4>
                <p>Type: ${v.type || 'HGV'} | Status: 
                  <span class="badge ${v.active ? 'badge-success' : 'badge-danger'}">${v.active ? 'Active' : 'Inactive'}</span>
                </p>
              </div>
              <div class="btn-group">
                <button class="btn btn-sm btn-secondary" onclick="toggleVehicleActive('${doc.id}', ${!v.active})">
                  ${v.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${doc.id}')">Remove</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Error loading vehicles:', err);
      }
      
      loadCompanyTrailers();
    }
    window.loadCompanyVehicles = loadCompanyVehicles;

    async function loadCompanyTrailers() {
      if (!currentUser || currentUserData?.role !== 'company') return;
      
      try {
        const { getDocs, collection, query, where } = firebaseServices;
        const trailersRef = collection(db, 'companyTrailers');
        const q = query(trailersRef, where('companyId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        const container = document.getElementById('companyTrailersList');
        if (snapshot.empty) {
          container.innerHTML = '<p class="text-muted">No trailers added yet.</p>';
          return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
          const t = doc.data();
          return `
            <div class="list-item">
              <div>
                <h4>Trailer: ${t.trailerNumber}</h4>
                <p>Owner: ${t.owner || ' LSD Solutions'} | Status: 
                  <span class="badge ${t.active ? 'badge-success' : 'badge-danger'}">${t.active ? 'Active' : 'Inactive'}</span>
                </p>
              </div>
              <div class="btn-group">
                <button class="btn btn-sm btn-secondary" onclick="toggleTrailerActive('${doc.id}', ${!t.active})">
                  ${t.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTrailer('${doc.id}')">Remove</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('Error loading trailers:', err);
      }
    }
    window.loadCompanyTrailers = loadCompanyTrailers;

    function showAddVehicleModal() {
      showModal(`
        <h3>Add New Vehicle</h3>
        <div class="form-group">
          <label>Make</label>
          <input type="text" id="vMake" placeholder="e.g. Volvo, Scania" />
        </div>
        <div class="form-group">
          <label>Model</label>
          <input type="text" id="vModel" placeholder="e.g. FH, R Series" />
        </div>
        <div class="form-group">
          <label>Registration Number *</label>
          <input type="text" id="vReg" placeholder="AB12 CDE" required />
        </div>
        <div class="form-group">
          <label>Vehicle Type</label>
          <select id="vType">
            <option value="HGV">HGV Tractor Unit</option>
            <option value="rigid">Rigid Vehicle</option>
            <option value="van">Van</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>VIN / Chassis Number</label>
          <input type="text" id="vVin" placeholder="17 character VIN" />
        </div>
        <div class="form-group">
          <label>Year</label>
          <input type="number" id="vYear" placeholder="2024" />
        </div>
      `, 'Add Vehicle', async () => {
        const make = document.getElementById('vMake').value;
        const model = document.getElementById('vModel').value;
        const reg = document.getElementById('vReg').value;
        const type = document.getElementById('vType').value;
        const vin = document.getElementById('vVin').value;
        const year = document.getElementById('vYear').value;
        
        if (!reg) { showAlert('Registration is required', 'warning'); return; }
        
        const { addDoc, collection, Timestamp } = firebaseServices;
        await addDoc(collection(db, 'companyVehicles'), {
          companyId: currentUser.uid,
          make, model, registration: reg.toUpperCase(), type, vin, year,
          active: true,
          createdAt: Timestamp.now()
        });
        showAlert('Vehicle added ✅', 'success');
        loadCompanyVehicles();
      });
    }
    window.showAddVehicleModal = showAddVehicleModal;

    function showAddTrailerModal() {
      showModal(`
        <h3>Add New Trailer</h3>
        <div class="form-group">
          <label>Trailer Number / ID *</label>
          <input type="text" id="tNumber" placeholder="e.g. T123" required />
        </div>
        <div class="form-group">
          <label>Registration Number</label>
          <input type="text" id="tReg" placeholder="AB12 CDE" />
        </div>
        <div class="form-group">
          <label>Trailer Type</label>
          <select id="tType">
            <option value="box">Box / Dry Van</option>
            <option value="curtainside">Curtainside</option>
            <option value="fridge">Refrigerated</option>
            <option value="flatbed">Flatbed</option>
            <option value="skeletal">Skeletal</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Owner</label>
          <input type="text" id="tOwner" placeholder="Your company name" />
        </div>
        <div class="form-group">
          <label>VIN / Chassis Number</label>
          <input type="text" id="tVin" placeholder="17 character VIN" />
        </div>
      `, 'Add Trailer', async () => {
        const number = document.getElementById('tNumber').value;
        const reg = document.getElementById('tReg').value;
        const type = document.getElementById('tType').value;
        const owner = document.getElementById('tOwner').value || 'LSD Solutions';
        const vin = document.getElementById('tVin').value;
        
        if (!number) { showAlert('Trailer number is required', 'warning'); return; }
        
        const { addDoc, collection, Timestamp } = firebaseServices;
        await addDoc(collection(db, 'companyTrailers'), {
          companyId: currentUser.uid,
          trailerNumber: number,
          registration: reg ? reg.toUpperCase() : '',
          type, owner, vin,
          active: true,
          createdAt: Timestamp.now()
        });
        showAlert('Trailer added ✅', 'success');
        loadCompanyVehicles();
      });
    }
    window.showAddTrailerModal = showAddTrailerModal;

    async function toggleVehicleActive(id, active) {
      const { updateDoc, doc } = firebaseServices;
      await updateDoc(doc(db, 'companyVehicles', id), { active });
      showAlert(active ? 'Vehicle activated' : 'Vehicle deactivated', 'info');
      loadCompanyVehicles();
    }
    window.toggleVehicleActive = toggleVehicleActive;

    async function toggleTrailerActive(id, active) {
      const { updateDoc, doc } = firebaseServices;
      await updateDoc(doc(db, 'companyTrailers', id), { active });
      showAlert(active ? 'Trailer activated' : 'Trailer deactivated', 'info');
      loadCompanyVehicles();
    }
    window.toggleTrailerActive = toggleTrailerActive;

    async function deleteVehicle(id) {
      if (!confirm('Remove this vehicle? This cannot be undone.')) return;
      const { deleteDoc, doc } = firebaseServices;
      await deleteDoc(doc(db, 'companyVehicles', id));
      showAlert('Vehicle removed', 'info');
      loadCompanyVehicles();
    }
    window.deleteVehicle = deleteVehicle;

    async function deleteTrailer(id) {
      if (!confirm('Remove this trailer? This cannot be undone.')) return;
      const { deleteDoc, doc } = firebaseServices;
      await deleteDoc(doc(db, 'companyTrailers', id));
      showAlert('Trailer removed', 'info');
      loadCompanyVehicles();
    }
    window.deleteTrailer = deleteTrailer;

    // ==========================================
    // CHECKLIST EDITOR
    // ==========================================
    let checklistItems = [];

    async function loadChecklistEditor() {
      if (!currentUser || currentUserData?.role !== 'company') return;
      
      try {
        const { getDoc, doc } = firebaseServices;
        const snap = await getDoc(doc(db, 'companies', currentUser.uid, 'settings', 'checklist'));
        if (snap.exists() && snap.data().items) {
          checklistItems = snap.data().items;
        } else {
          checklistItems = [...DEFAULT_CHECKLIST.items];
        }
      } catch (err) {
        checklistItems = [...DEFAULT_CHECKLIST.items];
      }
      
      renderChecklistEditor();
    }
    window.loadChecklistEditor = loadChecklistEditor;

    function renderChecklistEditor() {
      const container = document.getElementById('checklistEditorList');
      container.innerHTML = checklistItems.map((item, index) => `
        <div class="checklist-editor-item" data-index="${index}">
          <span class="drag-handle">⋮⋮</span>
          <input type="text" value="${item.replace(/"/g, '&quot;')}" 
                 onchange="updateCheckItem(${index}, this.value)" />
          <button class="btn btn-sm btn-danger" onclick="removeCheckItem(${index})">✕</button>
        </div>
      `).join('');
    }
    window.renderChecklistEditor = renderChecklistEditor;

    function updateCheckItem(index, value) {
      checklistItems[index] = value;
    }
    window.updateCheckItem = updateCheckItem;

    function addCheckItem() {
      const input = document.getElementById('newCheckItem');
      const value = input.value.trim();
      if (value) {
        checklistItems.push(value);
        input.value = '';
        renderChecklistEditor();
      }
    }
    window.addCheckItem = addCheckItem;

    function removeCheckItem(index) {
      checklistItems.splice(index, 1);
      renderChecklistEditor();
    }
    window.removeCheckItem = removeCheckItem;

    async function saveChecklist() {
      try {
        const { setDoc, doc, Timestamp } = firebaseServices;
        await setDoc(doc(db, 'companies', currentUser.uid, 'settings', 'checklist'), {
          items: checklistItems,
          updatedAt: Timestamp.now()
        });
        showAlert('Checklist saved ✅', 'success');
      } catch (err) {
        showAlert('Error saving checklist: ' + err.message, 'error');
      }
    }
    window.saveChecklist = saveChecklist;

    function resetChecklistToDefault() {
      if (confirm('Reset to DVSA default? Your custom changes will be lost.')) {
        checklistItems = [...DEFAULT_CHECKLIST.items];
        renderChecklistEditor();
        showAlert('Restored to DVSA default', 'info');
      }
    }
    window.resetChecklistToDefault = resetChecklistToDefault;

    // ==========================================
    // DRIVER WALKAROUND CHECK
    // ==========================================
    let currentChecklist = [];
    let checkResponses = {};
    let checkFaults = {};

    async function loadChecklist() {
      // Set default date/time to now
      const now = new Date();
      const localDateTime = now.toISOString().slice(0, 16);
      document.getElementById('checkDateTime').value = localDateTime;
      
      // Load vehicles & trailers for dropdowns
      loadVehicleOptions();
      
      // Load checklist items
      try {
        const { getDoc, doc } = firebaseServices;
        let items = DEFAULT_CHECKLIST.items;
        
        // If driver belongs to a company, use their custom checklist
        if (currentUserData?.companyId) {
          const snap = await getDoc(doc(db, 'companies', currentUserData.companyId, 'settings', 'checklist'));
          if (snap.exists() && snap.data().items) {
            items = snap.data().items;
          }
        }
        currentChecklist = items;
        checkResponses = {};
        checkFaults = {};
        renderChecklistItems();
      } catch (err) {
        currentChecklist = [...DEFAULT_CHECKLIST.items];
        renderChecklistItems();
      }
    }
    window.loadChecklist = loadChecklist;

    async function loadVehicleOptions() {
      const vehicleSelect = document.getElementById('selectedVehicle');
      const trailerSelect = document.getElementById('selectedTrailer');
      
      vehicleSelect.innerHTML = '<option value="">-- Select Vehicle --</option>';
      trailerSelect.innerHTML = '<option value="">-- Select Trailer --</option>';
      
      // If driver has company association, load their vehicles
      if (currentUserData?.companyId) {
        const { getDocs, collection, query, where } = firebaseServices;
        
        // Load vehicles
        try {
          const vq = query(collection(db, 'companyVehicles'), 
                           where('companyId', '==', currentUserData.companyId),
                           where('active', '==', true));
          const vSnap = await getDocs(vq);
          vSnap.forEach(d => {
            const v = d.data();
            vehicleSelect.innerHTML += `<option value="${d.id}">${v.make} ${v.model} — ${v.registration}</option>`;
          });
        } catch (e) { console.error('Error loading vehicles:', e); }
        
        // Load trailers
        try {
          const tq = query(collection(db, 'companyTrailers'), 
                           where('companyId', '==', currentUserData.companyId),
                           where('active', '==', true));
          const tSnap = await getDocs(tq);
          tSnap.forEach(d => {
            const t = d.data();
            trailerSelect.innerHTML += `<option value="${d.id}">${t.trailerNumber} — ${t.registration || 'No Reg'}</option>`;
          });
        } catch (e) { console.error('Error loading trailers:', e); }
      }
    }
    window.loadVehicleOptions = loadVehicleOptions;

    function updateCheckType() {
      const type = document.getElementById('checkType').value;
      document.getElementById('vehicleSelectGroup').classList.toggle('hidden', type === 'trailer');
      document.getElementById('trailerSelectGroup').classList.toggle('hidden', type === 'vehicle');
    }
    window.updateCheckType = updateCheckType;

    function renderChecklistItems() {
      const container = document.getElementById('checklistItems');
      container.innerHTML = currentChecklist.map((item, index) => `
        <div class="check-item" id="check-item-${index}">
          <input type="checkbox" id="check-${index}" onchange="toggleCheckItem(${index}, this.checked)" />
          <label for="check-${index}">${item}</label>
          <button class="btn btn-sm btn-secondary" style="margin-left:auto" id="fault-btn-${index}" 
                  onclick="toggleFaultNote(${index})">⚠️ Fault</button>
        </div>
        <div id="fault-note-${index}" class="fault-note hidden">
          <label>Describe the fault:</label>
          <textarea id="fault-text-${index}" rows="2" placeholder="Describe the issue..."></textarea>
        </div>
      `).join('');
    }
    window.renderChecklistItems = renderChecklistItems;

    function toggleCheckItem(index, checked) {
      checkResponses[index] = checked;
    }
    window.toggleCheckItem = toggleCheckItem;

    function toggleFaultNote(index) {
      const note = document.getElementById(`fault-note-${index}`);
      note.classList.toggle('hidden');
      checkFaults[index] = !note.classList.contains('hidden');
    }
    window.toggleFaultNote = toggleFaultNote;

    function resetChecklist() {
      checkResponses = {};
      checkFaults = {};
      renderChecklistItems();
      document.getElementById('checkDateTime').value = '';
      document.getElementById('selectedVehicle').value = '';
      document.getElementById('selectedTrailer').value = '';
    }
    window.resetChecklist = resetChecklist;

    async function submitChecklist() {
      const checkType = document.getElementById('checkType').value;
      const vehicleId = document.getElementById('selectedVehicle').value;
      const trailerId = document.getElementById('selectedTrailer').value;
      const checkDate = document.getElementById('checkDateTime').value;
      
      if (!checkDate) {
        showAlert('Please enter date and time', 'warning');
        return;
      }
      if (checkType !== 'trailer' && !vehicleId) {
        showAlert('Please select a vehicle', 'warning');
        return;
      }
      if (checkType !== 'vehicle' && !trailerId) {
        showAlert('Please select a trailer', 'warning');
        return;
      }
      
      // Build responses
      const responses = currentChecklist.map((item, i) => ({
        item,
        passed: !!checkResponses[i],
        hasFault: !!checkFaults[i],
        faultNote: checkFaults[i] ? document.getElementById(`fault-text-${i}`)?.value || '' : ''
      }));
      
      const hasDefects = responses.some(r => r.hasFault);
      
      try {
        const { addDoc, collection, Timestamp } = firebaseServices;
        await addDoc(collection(db, 'walkaroundChecks'), {
          driverId: currentUser.uid,
          driverName: currentUserData.name,
          companyId: currentUserData.companyId || null,
          checkType,
          vehicleId: vehicleId || null,
          trailerId: trailerId || null,
          checkDate: new Date(checkDate),
          responses,
          hasDefects,
          status: hasDefects ? 'fault' : 'pass',
          submittedAt: Timestamp.now()
        });
        
        showAlert('Check submitted successfully ✅', 'success');
        resetChecklist();
      } catch (err) {
        showAlert('Error submitting check: ' + err.message, 'error');
      }
    }
    window.submitChecklist = submitChecklist;

    // ==========================================
    // COMPANY — VIEW SUBMITTED CHECKS
    // ==========================================
    async function loadCompanyChecks() {
      if (!currentUser || currentUserData?.role !== 'company') return;
      
      const statusFilter = document.getElementById('checkStatusFilter')?.value || 'all';
      
      try {
        const { getDocs, collection, query, where, orderBy } = firebaseServices;
        let q = query(collection(db, 'walkaroundChecks'), 
                      where('companyId', '==', currentUser.uid),
                      orderBy('submittedAt', 'desc'));
        
        const snapshot = await getDocs(q);
        const container = document.getElementById('companyChecksList');
        
        if (snapshot.empty) {
          container.innerHTML = '<p class="text-muted text-center">No checks submitted yet.</p>';
          return;
        }
        
        let checks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (statusFilter !== 'all') {
          checks = checks.filter(c => c.status === statusFilter);
        }
        
        container.innerHTML = checks.map(check => {
          const date = check.checkDate?.toDate ? check.checkDate.toDate() : new Date(check.checkDate);
          return `
            <div class="card">
              <div class="list-item" style="border-bottom:1px solid var(--border);padding-bottom:0.5rem;">
                <div>
                  <h4>${check.driverName || 'Unknown Driver'}</h4>
                  <p>${date.toLocaleString()} — ${check.checkType === 'vehicle' ? '🚛 Vehicle Only' : 
                     check.checkType === 'trailer' ? '📦 Trailer Only' : '🚛📦 Vehicle & Trailer'}</p>
                </div>
                <span class="badge ${check.status === 'pass' ? 'badge-success' : 
                     check.status === 'fault' ? 'badge-warning' : 'badge-info'}">
                  ${check.status === 'pass' ? '✅ No Defects' : 
                    check.status === 'fault' ? '⚠️ Defects Reported' : 'ℹ️ Resolved'}
                </span>
              </div>
              <div style="margin-top:0.75rem;">
                <strong>Check Items:</strong>
                ${check.responses.map(r => 
                  `<div style="font-size:0.85rem;padding:0.25rem 0;${r.hasFault ? 'color:var(--danger)' : ''}">
                    ${r.passed ? '✅' : '⬜'} ${r.item}
                    ${r.hasFault ? `<br><em>Fault: ${r.faultNote || 'Not described'}</em>` : ''}
                  </div>`
                ).join('')}
              </div>
              ${check.status === 'fault' ? `
                <button class="btn btn-sm btn-success mt-2" onclick="markCheckResolved('${check.id}')">
                  ✅ Mark Defects Resolved
                </button>
              ` : ''}
            </div>
          `;
        }).join('');
      } catch (err) {
        document.getElementById('companyChecksList').innerHTML = 
          `<p class="text-muted text-center">Error loading checks: ${err.message}</p>`;
      }
    }
    window.loadCompanyChecks = loadCompanyChecks;

    async function markCheckResolved(checkId) {
      const { updateDoc, doc } = firebaseServices;
      await updateDoc(doc(db, 'walkaroundChecks', checkId), { status: 'resolved', resolvedAt: new Date() });
      showAlert('Marked as resolved ✅', 'success');
      loadCompanyChecks();
    }
    window.markCheckResolved = markCheckResolved;

    // ==========================================
    // DRIVER MANAGEMENT — COMPANY PORTAL
    // ==========================================
    let allCompanyDrivers = [];

    async function loadCompanyDrivers() {
      if (!currentUser || currentUserData?.role !== 'company') return;
      
      try {
        const { getDocs, collection, query, where, Timestamp } = firebaseServices;
        
        // Load drivers linked to this company
        const q = query(collection(db, 'users'), 
                        where('associatedCompanies', 'array-contains', currentUser.uid));
        const snapshot = await getDocs(q);
        
        allCompanyDrivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCompanyDrivers(allCompanyDrivers);
      } catch (err) {
        console.error('Error loading drivers:', err);
        document.getElementById('companyDriversList').innerHTML = 
          '<p class="text-muted">Error loading drivers.</p>';
      }
    }
    window.loadCompanyDrivers = loadCompanyDrivers;

    function renderCompanyDrivers(drivers) {
      const container = document.getElementById('companyDriversList');
      
      if (drivers.length === 0) {
        container.innerHTML = '<p class="text-muted">No drivers added yet. Drivers will appear here once they accept work from your company.</p>';
        return;
      }
      
      container.innerHTML = drivers.map(d => `
        <div class="list-item">
          <div>
            <h4>${d.name || 'Unknown'}</h4>
            <p>${d.email || ''} | Licence: ${d.licenceNumber || 'Not provided'}</p>
            <p class="text-muted" style="font-size:0.8rem;">
              Categories: ${d.licenceCategories || '—'} | Points: ${d.points || '0'}
            </p>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-secondary" onclick="viewDriverDetails('${d.id}')">View</button>
            <button class="btn btn-sm btn-danger" onclick="removeDriverFromCompany('${d.id}')">Remove</button>
          </div>
        </div>
      `).join('');
    }
    window.renderCompanyDrivers = renderCompanyDrivers;

    function filterDrivers() {
      const query = document.getElementById('driverSearch').value.toLowerCase();
      const filtered = allCompanyDrivers.filter(d => 
        (d.name || '').toLowerCase().includes(query) ||
        (d.email || '').toLowerCase().includes(query) ||
        (d.licenceNumber || '').toLowerCase().includes(query)
      );
      renderCompanyDrivers(filtered);
    }
    window.filterDrivers = filterDrivers;

    function showAddDriverModal() {
      showModal(`
        <h3>Add Employed Driver</h3>
        <p class="text-muted">Enter the driver's email address. If they already have an account, they will be linked to your company.</p>
        <div class="form-group">
          <label>Driver's Email Address</label>
          <input type="email" id="newDriverEmail" placeholder="driver@email.com" />
        </div>
        <div class="form-group">
          <label>Weekly Hours Limit (optional)</label>
          <input type="number" id="driverHoursLimit" placeholder="40" />
        </div>
      `, 'Add Driver', async () => {
        const email = document.getElementById('newDriverEmail').value.toLowerCase().trim();
        const hoursLimit = document.getElementById('driverHoursLimit').value;
        
        if (!email) { showAlert('Email is required', 'warning'); return; }
        
        const { getDocs, collection, query, where, updateDoc, doc, arrayUnion } = firebaseServices;
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          showAlert('No driver found with that email. Ask them to register first.', 'warning');
          return;
        }
        
        const driverDoc = snap.docs[0];
        await updateDoc(doc(db, 'users', driverDoc.id), {
          associatedCompanies: arrayUnion(currentUser.uid),
          [`companyData.${currentUser.uid}.hoursLimit`]: hoursLimit || null
        });
        
        showAlert('Driver linked to your company ✅', 'success');
        loadCompanyDrivers();
      });
    }
    window.showAddDriverModal = showAddDriverModal;

    async function viewDriverDetails(driverId) {
      const driver = allCompanyDrivers.find(d => d.id === driverId);
      if (!driver) return;
      
      showModal(`
        <h3>${driver.name || 'Driver Details'}</h3>
        <div class="profile-grid">
          <div class="profile-item"><label>Email</label><div class="value">${driver.email || '-'}</div></div>
          <div class="profile-item"><label>Licence Number</label><div class="value">${driver.licenceNumber || '-'}</div></div>
          <div class="profile-item"><label>Categories</label><div class="value">${driver.licenceCategories || '-'}</div></div>
          <div class="profile-item"><label>DVLA Check Code</label><div class="value">${driver.dvlaCheckCode || '-'}</div></div>
          <div class="profile-item"><label>Points</label><div class="value">${driver.points || 'None'}</div></div>
          <div class="profile-item"><label>Licence Expiry</label><div class="value">
            ${driver.licenceExpiry ? new Date(driver.licenceExpiry).toLocaleDateString() : '-'}
          </div></div>
          <div class="profile-item"><label>Medical Expiry</label><div class="value">
            ${driver.medicalExpiry ? new Date(driver.medicalExpiry).toLocaleDateString() : '-'}
          </div></div>
        </div>
        <h4 style="margin-top:1rem;">Uploaded Documents</h4>
        <div id="driverDocs-${driverId}" class="text-muted">Loading...</div>
      `, 'Close', () => {});
      
      // Load documents
      const listEl = document.getElementById(`driverDocs-${driverId}`);
      try {
        const { getDocs, collection, query, where } = firebaseServices;
        const q = query(collection(db, 'documents'), where('driverId', '==', driverId));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          listEl.innerHTML = '<p>No documents uploaded yet.</p>';
        } else {
          listEl.innerHTML = snap.docs.map(d => {
            const doc = d.data();
            return `
              <div class="doc-item">
                <span class="doc-icon">📄</span>
                <div class="doc-info">
                  <div class="doc-name">${doc.name || 'Document'}</div>
                  <div class="doc-date">${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}</div>
                </div>
                ${doc.url ? `<a href="${doc.url}" target="_blank" class="btn btn-sm btn-secondary">View</a>` : ''}
              </div>
            `;
          }).join('');
        }
      } catch (e) {
        listEl.innerHTML = '<p>Could not load documents.</p>';
      }
    }
    window.viewDriverDetails = viewDriverDetails;

    async function removeDriverFromCompany(driverId) {
      if (!confirm('Remove this driver from your company? They will no longer see your jobs.')) return;
      
      const { updateDoc, doc, arrayRemove } = firebaseServices;
      await updateDoc(doc(db, 'users', driverId), {
        associatedCompanies: arrayRemove(currentUser.uid)
      });
      
      showAlert('Driver removed', 'info');
      loadCompanyDrivers();
    }
    window.removeDriverFromCompany = removeDriverFromCompany;

    // ==========================================
    // HOLIDAY MANAGEMENT
    // ==========================================
    function renderCalendar() {
      const container = document.getElementById('calendarGrid');
      const monthLabel = document.getElementById('calendarMonth');
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      monthLabel.textContent = new Date(year, month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      
      let html = '';
      
      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day"></div>';
      }
      
      // Days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        html += `
          <div class="calendar-day ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}">
            <span class="calendar-day-number">${day}</span>
          </div>
        `;
      }
      
      container.innerHTML = html;
    }
    window.renderCalendar = renderCalendar;

    function prevMonth() {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      renderCalendar();
    }
    window.prevMonth = prevMonth;

    function nextMonth() {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      renderCalendar();
    }
    window.nextMonth = nextMonth;

    function requestHoliday() {
      showModal(`
        <h3>Request Holiday / Leave</h3>
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="holidayStart" />
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" id="holidayEnd" />
        </div>
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea id="holidayNotes" rows="2" placeholder="Reason or comment..."></textarea>
        </div>
      `, 'Submit Request', async () => {
        const start = document.getElementById('holidayStart').value;
        const end = document.getElementById('holidayEnd').value;
        const notes = document.getElementById('holidayNotes').value;
        
        if (!start || !end) {
          showAlert('Please select dates', 'warning');
          return;
        }
        
        const { addDoc, collection, Timestamp } = firebaseServices;
        await addDoc(collection(db, 'holidayRequests'), {
          driverId: currentUser.uid,
          driverName: currentUserData.name,
          companyId: currentUserData.companyId || null,
          startDate: new Date(start),
          endDate: new Date(end),
          notes,
          status: 'pending',
          submittedAt: Timestamp.now()
        });
        
        showAlert('Request submitted ✅', 'success');
        closeModal();
      });
    }
    window.requestHoliday = requestHoliday;

    async function loadHolidayRequests() {
      if (!currentUser) return;
      
      const container = document.getElementById('holidayRequests') || document.getElementById('allHolidayRequests');
      const isCompany = currentUserData?.role === 'company';
      
      try {
        const { getDocs, collection, query, where, orderBy } = firebaseServices;
        let q;
        
        if (isCompany) {
          q = query(collection(db, 'holidayRequests'), 
                    where('companyId', '==', currentUser.uid),
                    orderBy('submittedAt', 'desc'));
        } else {
          q = query(collection(db, 'holidayRequests'), 
                    where('driverId', '==', currentUser.uid),
                    orderBy('submittedAt', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          if (container) container.innerHTML = '<p class="text-muted">No requests yet.</p>';
          return;
        }
        
        if (container) container.innerHTML = snapshot.docs.map(doc => {
          const r = doc.data();
          const start = r.startDate?.toDate ? r.startDate.toDate() : new Date(r.startDate);
          const end = r.endDate?.toDate ? r.endDate.toDate() : new Date(r.endDate);
          
          const statusBadge = r.status === 'pending' ? 'badge-warning' :
                              r.status === 'approved' ? 'badge-success' : 'badge-danger';
          
          return `
            <div class="list-item">
              <div>
                <h4>${r.driverName || 'Unknown Driver'}</h4>
                <p>${start.toLocaleDateString()} — ${end.toLocaleDateString()}</p>
                ${r.notes ? `<p class="text-muted" style="font-size:0.85rem;">${r.notes}</p>` : ''}
              </div>
              <span class="badge ${statusBadge}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
              ${isCompany && r.status === 'pending' ? `
                <div class="btn-group">
                  <button class="btn btn-sm btn-success" onclick="approveHoliday('${doc.id}')">✓ Approve</button>
                  <button class="btn btn-sm btn-danger" onclick="rejectHoliday('${doc.id}')">✕ Reject</button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
      } catch (err) {
        if (container) container.innerHTML = `<p class="text-muted">Error loading requests.</p>`;
      }
    }
    window.loadHolidayRequests = loadHolidayRequests;

    async function approveHoliday(id) {
      const { updateDoc, doc } = firebaseServices;
      await updateDoc(doc(db, 'holidayRequests', id), { status: 'approved', reviewedAt: new Date() });
      showAlert('Request approved ✅', 'success');
      loadHolidayRequests();
    }
    window.approveHoliday = approveHoliday;

    async function rejectHoliday(id) {
      const { updateDoc, doc } = firebaseServices;
      await updateDoc(doc(db, 'holidayRequests', id), { status: 'rejected', reviewedAt: new Date() });
      showAlert('Request rejected', 'info');
      loadHolidayRequests();
    }
    window.rejectHoliday = rejectHoliday;

    // ==========================================
    // INVOICING
    // ==========================================
    let invoiceCounter = 1;

    async function generateInvoices() {
      const week = document.getElementById('invoiceWeek').value;
      if (!week) {
        showAlert('Select a billing period', 'warning');
        return;
      }
      
      const pref = currentUserData?.billingPreference || 'per-billing-period';
      const output = document.getElementById('invoicesOutput');
      
      output.innerHTML = `<p class="text-muted text-center">Generating invoices for week ${week}...</p>`;
      
      try {
        const { getDocs, collection, query, where, orderBy } = firebaseServices;
        
        // Get all completed work for this week
        const q = query(collection(db, 'workRecords'), 
                        where('companyId', '==', currentUser.uid),
                        where('week', '==', week),
                        orderBy('driverName'));
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          output.innerHTML = '<p class="text-muted text-center">No work records found for this week.</p>';
          return;
        }
        
        const workByDriver = {};
        snapshot.docs.forEach(doc => {
          const rec = doc.data();
          if (!workByDriver[rec.driverId]) {
            workByDriver[rec.driverId] = { name: rec.driverName, items: [], totalHours: 0 };
          }
          workByDriver[rec.driverId].items.push(rec);
          workByDriver[rec.driver('
          ByDriver[rec.driverId].totalHours += rec.hours || 0;
        });
        
        output.innerHTML = '';
        
        if (pref === 'per-driver') {
          // Separate invoice per driver
          Object.keys(workByDriver).forEach(driverId => {
            const data = workByDriver[driverId];
            const invoiceNumber = `${INVOICE_PREFIX}${String(invoiceCounter++).padStart(6, '0')}`;
            
            output.innerHTML += `
              <div class="card">
                <div class="invoice-header">
                  <div>
                    <h3>Invoice</h3>
                    <p class="invoice-number">${invoiceNumber}</p>
                  </div>
                  <div style="text-align:right;">
                    <p><strong>LSD Solutions</strong></p>
                    <p>For All Your Longhaul, Shunting And Delivery Needs</p>
                    <p>Week: ${week}</p>
                    <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                <p><strong>Driver:</strong> ${data.name}</p>
                <table class="invoice-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Job / Description</th>
                      <th>Hours</th>
                      <th>Rate (£)</th>
                      <th>Total (£)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.items.map(item => {
                      const total = (item.hours || 0) * (item.rate || 0);
                      return `
                        <tr>
                          <td>${item.date ? new Date(item.date.toDate()).toLocaleDateString('en-GB') : '-'}</td>
                          <td>${item.description || 'Work completed'}</td>
                          <td>${item.hours || 0}</td>
                          <td>${(item.rate || 0).toFixed(2)}</td>
                          <td>${total.toFixed(2)}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
                <div class="invoice-total">
                  Total Hours: ${data.totalHours} — Total Amount: £${data.items.reduce((sum, i) => sum + ((i.hours || 0) * (i.rate || 0)), 0).toFixed(2)}
                </div>
                <div class="btn-group mt-2 no-print">
                  <button class="btn btn-secondary" onclick="window.print()">🖨️ Print / Save PDF</button>
                </div>
              </div>
            `;
          });
        } else {
          // One invoice per billing period — all drivers listed
          const invoiceNumber = `${INVOICE_PREFIX}${String(invoiceCounter++).padStart(6, '0')}`;
          output.innerHTML += `
            <div class="card">
              <div class="invoice-header">
                <div>
                  <h3>Invoice</h3>
                  <p class="invoice-number">${invoiceNumber}</p>
                </div>
                <div style="text-align:right;">
                  <p><strong>LSD Solutions</strong></p>
                  <p>For All Your Longhaul, Shunting And Delivery Needs</p>
                  <p>Week: ${week}</p>
                  <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Driver Name</th>
                    <th>Total Hours</th>
                    <th>Details</th>
                    <th>Amount (£)</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.keys(workByDriver).map(driverId => {
                    const d = workByDriver[driverId];
                    const total = d.items.reduce((sum, i) => sum + ((i.hours || 0) * (i.rate || 0)), 0);
                    return `
                      <tr>
                        <td><strong>${d.name}</strong></td>
                        <td>${d.totalHours}</td>
                        <td>${d.items.length} work record(s)</td>
                        <td>${total.toFixed(2)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              <div class="invoice-total">
                Total for Week ${week}: £${Object.values(workByDriver).reduce((sum, d) => 
                  sum + d.items.reduce((s, i) => s + ((i.hours || 0) * (i.rate || 0)), 0), 0
                ).toFixed(2)}
              </div>
              <div class="btn-group mt-2 no-print">
                <button class="btn btn-secondary" onclick="window.print()">🖨️ Print / Save PDF</button>
              </div>
            </div>
          `;
        }
      } catch (err) {
        output.innerHTML = `<p class="text-muted text-center text-danger">Error generating invoices: ${err.message}</p>`;
      }
    }
    window.generateInvoices = generateInvoices;

    // ==========================================
    // DOCUMENTS — DRIVER PORTAL
    // ==========================================
    async function loadDocuments() {
      if (!currentUser) return;
      
      const container = document.getElementById('documentsList');
      container.innerHTML = '<p class="text-muted">Loading documents...</p>';
      
      try {
        const { getDocs, collection, query, where } = firebaseServices;
        const q = query(collection(db, 'documents'), where('driverId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          container.innerHTML = '<p class="text-muted text-center">No documents uploaded yet.</p>';
          return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
          const d = doc.data();
          return `
            <div class="doc-item">
              <div style="display:flex;align-items:center;">
                <span class="doc-icon">📄</span>
                <div class="doc-info">
                  <div class="doc-name">${d.name || 'Document'}</div>
                  <div class="doc-date">
                    Uploaded: ${d.uploadedAt ? new Date(d.uploadedAt.toDate()).toLocaleDateString('en-GB') : 'Unknown'}
                  </div>
                </div>
              </div>
              <div class="btn-group">
                ${d.url ? `<a href="${d.url}" target="_blank" class="btn btn-sm btn-secondary">View</a>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteDocument('${doc.id}', '${d.name || ''}')">Delete</button>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        container.innerHTML = `<p class="text-muted text-center">Error loading documents: ${err.message}</p>`;
      }
    }
    window.loadDocuments = loadDocuments;

    function uploadDocument() {
      showModal(`
        <h3>Upload Document</h3>
        <div class="form-group">
          <label>Document Name / Type</label>
          <input type="text" id="docName" placeholder="e.g. Driving Licence, CPC Card, Insurance..." />
        </div>
        <div class="form-group">
          <label>Select File</label>
          <input type="file" id="docFile" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        </div>
        <p class="text-muted" style="font-size:0.85rem;">PDF, JPG, PNG, DOC — Max 10MB</p>
      `, 'Upload', async () => {
        const name = document.getElementById('docName').value.trim();
        const file = document.getElementById('docFile').files[0];
        
        if (!name || !file) {
          showAlert('Please enter a name and select a file', 'warning');
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          showAlert('File too large. Max 10MB.', 'warning');
          return;
        }
        
        try {
          const { ref, uploadBytes, getDownloadURL, addDoc, collection, Timestamp } = firebaseServices;
          const fileRef = ref(storage, `documents/${currentUser.uid}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snapshot.ref);
          
          await addDoc(collection(db, 'documents'), {
            driverId: currentUser.uid,
            name,
            fileName: file.name,
            type: file.type,
            size: file.size,
            url,
            uploadedAt: Timestamp.now()
          });
          
          showAlert('Document uploaded ✅', 'success');
          loadDocuments();
        } catch (err) {
          showAlert('Upload failed: ' + err.message, 'error');
        }
      });
    }
    window.uploadDocument = uploadDocument;

    async function deleteDocument(docId, docName) {
      if (!confirm(`Delete "${docName}"? This cannot be undone.`)) return;
      
      try {
        const { deleteDoc, doc } = firebaseServices;
        await deleteDoc(doc(db, 'documents', docId));
        showAlert('Document deleted', 'info');
        loadDocuments();
      } catch (err) {
        showAlert('Delete failed: ' + err.message, 'error');
      }
    }
    window.deleteDocument = deleteDocument;

    async function downloadAllDocuments() {
      showAlert('Select documents to download — coming soon!', 'info');
    }
    window.downloadAllDocuments = downloadAllDocuments;

    async function exportMyData() {
      if (!currentUser) return;
      
      try {
        const { getDocs, collection, query, where, getDoc, doc } = firebaseServices;
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        
        const docsSnap = await getDocs(query(collection(db, 'documents'), where('driverId', '==', currentUser.uid)));
        const documents = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const checksSnap = await getDocs(query(collection(db, 'walkaroundChecks'), where('driverId', '==', currentUser.uid)));
        const checks = checksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const holidaySnap = await getDocs(query(collection(db, 'holidayRequests'), where('driverId', '==', currentUser.uid)));
        const holidays = holidaySnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const exportData = {
          exportedAt: new Date().toISOString(),
          user: userData,
          documents,
          walkaroundChecks: checks,
          holidayRequests: holidays
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lssdrivers-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showAlert('Data downloaded ✅', 'success');
      } catch (err) {
        showAlert('Export failed: ' + err.message, 'error');
      }
    }
    window.exportMyData = exportMyData;

    function editDriverProfile() {
      showModal(`
        <h3>Update Licence & Profile Details</h3>
        <div class="form-group">
          <label>Driving Licence Number</label>
          <input type="text" id="edit_licenceNumber" value="${currentUserData?.licenceNumber || ''}" />
        </div>
        <div class="form-group">
          <label>Licence Categories (e.g. C, C+E, D1)</label>
          <input type="text" id="edit_licenceCategories" value="${currentUserData?.licenceCategories || ''}" />
        </div>
        <div class="form-group">
          <label>DVLA Check Code</label>
          <input type="text" id="edit_dvlaCheckCode" value="${currentUserData?.dvlaCheckCode || ''}" />
        </div>
        <div class="form-group">
          <label>Penalty Points</label>
          <input type="number" id="edit_points" value="${currentUserData?.points || 0}" min="0" max="12" />
        </div>
        <div class="form-group">
          <label>Licence Valid From</label>
          <input type="date" id="edit_licenceValidFrom" value="${currentUserData?.licenceValidFrom ? new Date(currentUserData.licenceValidFrom).toISOString().slice(0,10) : ''}" />
        </div>
        <div class="form-group">
          <label>Licence Expiry Date</label>
          <input type="date" id="edit_licenceExpiry" value="${currentUserData?.licenceExpiry ? new Date(currentUserData.licenceExpiry).toISOString().slice(0,10) : ''}" />
        </div>
        <div class="form-group">
          <label>Driver's Medical Certificate Expiry</label>
          <input type="date" id="edit_medicalExpiry" value="${currentUserData?.medicalExpiry ? new Date(currentUserData.medicalExpiry).toISOString().slice(0,10) : ''}" />
        </div>
      `, 'Save Changes', async () => {
        try {
          const { updateDoc, doc } = firebaseServices;
          await updateDoc(doc(db, 'users', currentUser.uid), {
            licenceNumber: document.getElementById('edit_licenceNumber').value.toUpperCase(),
            licenceCategories: document.getElementById('edit_licenceCategories').value.toUpperCase(),
            dvlaCheckCode: document.getElementById('edit_dvlaCheckCode').value,
            points: parseInt(document.getElementById('edit_points').value) || 0,
            licenceValidFrom: document.getElementById('edit_licenceValidFrom').value ? 
              new Date(document.getElementById('edit_licenceValidFrom').value) : null,
            licenceExpiry: document.getElementById('edit_licenceExpiry').value ? 
              new Date(document.getElementById('edit_licenceExpiry').value) : null,
            medicalExpiry: document.getElementById('edit_medicalExpiry').value ? 
              new Date(document.getElementById('edit_medicalExpiry').value) : null
          });
          showAlert('Profile updated ✅', 'success');
          closeModal();
          loadUserProfile(currentUser.uid);
        } catch (err) {
          showAlert('Error saving: ' + err.message, 'error');
        }
      });
    }
    window.editDriverProfile = editDriverProfile;

    function confirmDeleteAccount() {
      if (confirm('⚠️ Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be removed.')) {
        if (confirm('Last chance — permanently delete my account and all data?')) {
          const { deleteUser } = firebaseServices;
          deleteUser(auth.currentUser).then(() => {
            showAlert('Account deleted', 'info');
          }).catch(err => {
            showAlert('Error: ' + err.message, 'error');
          });
        }
      }
    }
    window.confirmDeleteAccount = confirmDeleteAccount;

    // ==========================================
    // PAGE LOAD DATA HANDLER
    // ==========================================
    window.loadPageData = async function(pageId) {
      switch(pageId) {
        case 'dashboard':
          // Dashboard quick stats loaded via quick actions
          break;
        case 'jobs':
          loadJobs();
          break;
        case 'checklist':
          loadChecklist();
          break;
        case 'documents':
          loadDocuments();
          break;
        case 'holidays':
          renderCalendar();
          loadHolidayRequests();
          break;
        case 'company-dashboard':
          updateCompanyStats();
          break;
        case 'company-drivers':
          loadCompanyDrivers();
          break;
        case 'company-vehicles':
          loadCompanyVehicles();
          break;
        case 'checklist-editor':
          loadChecklistEditor();
          break;
        case 'company-checks':
          loadCompanyChecks();
          break;
        case 'company-holidays':
          loadHolidayRequests();
          break;
        case 'invoices':
          // Set default week to current week
          const now = new Date();
          const day = now.getDay();
          const monday = new Date(now);
          monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
          document.getElementById('invoiceWeek').value = monday.toISOString().slice(0,10);
          break;
      }
    };

    async function loadJobs() {
      const container = document.getElementById('jobsList');
      container.innerHTML = '<p class="text-muted">Loading available work...</p>';
      
      try {
        const { getDocs, collection, query, orderBy, where } = firebaseServices;
        const q = query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          container.innerHTML = '<p class="text-muted text-center">No jobs available right now. Check back soon!</p>';
          return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
          const job = doc.data();
          return `
            <div class="card">
              <h3>${job.title || 'Job Opportunity'}</h3>
              <p><strong>Company:</strong> ${job.companyName || 'LSD Solutions'}</p>
              <p><strong>Type:</strong> ${job.jobType || 'General'}</p>
              <p><strong>Date:</strong> ${job.date ? new Date(job.date.toDate()).toLocaleDateString('en-GB') : 'Flexible'}</p>
              <p><strong>Rate:</strong> £${(job.rate || 0).toFixed(2)} / hr</p>
              <p>${job.description || ''}</p>
              <button class="btn btn-primary btn-sm mt-1">Accept Job</button>
            </div>
          `;
        }).join('');
      } catch (err) {
        container.innerHTML = `<p class="text-muted text-center">Error loading jobs: ${err.message}</p>`;
      }
    }
    window.loadJobs = loadJobs;

    async function updateCompanyStats() {
      if (!currentUser || currentUserData?.role !== 'company') return;
      
      try {
        const { getDocs, collection, query, where } = firebaseServices;
        
        const driverQ = query(collection(db, 'users'), where('associatedCompanies', 'array-contains', currentUser.uid));
        const driverSnap = await getDocs(driverQ);
        document.getElementById('statDrivers').textContent = driverSnap.size;
        
        const vehQ = query(collection(db, 'companyVehicles'), where('companyId', '==', currentUser.uid), where('active', '==', true));
        const vehSnap = await getDocs(vehQ);
        document.getElementById('statVehicles').textContent = vehSnap.size;
        
        const jobQ = query(collection(db, 'jobs'), where('companyId', '==', currentUser.uid));
        const jobSnap = await getDocs(jobQ);
        document.getElementById('statJobs').textContent = jobSnap.size;
        
        const checkQ = query(collection(db, 'walkaroundChecks'), where('companyId', '==', currentUser.uid));
        const checkSnap = await getDocs(checkQ);
        document.getElementById('statChecks').textContent = checkSnap.size;
      } catch (err) {
        console.error('Error updating stats:', err);
      }
    }
    window.updateCompanyStats = updateCompanyStats;

    // Initialise week picker for invoices
    document.addEventListener('DOMContentLoaded', () => {
      const weekInput = document.getElementById('invoiceWeek');
      if (weekInput) {
        const now = new Date();
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        weekInput.value = monday.toISOString().slice(0,10);
      }
    });
  </script>

</body>
</html>
        
        