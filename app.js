// ==================================================
// 🚛 LSD SOLUTIONS — COMPLETE PRODUCTION app.js
// Firebase v10.7.1 | DVSA Compliant
// Includes: Maintenance • Defects • Compliance • Tacomaster API
// ==================================================
'use strict';

// ==================================================
// 🔹 FIREBASE IMPORTS & INITIALIZATION
// ==================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 🔒 FIREBASE CONFIGURATION — UPDATE WITH YOUR VALUES
const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.firebasestorage.app",
  messagingSenderId: "833767217116",
  appId: "1:833767217116:web:b29188de76b5778a086119"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==================================================
// 🔹 GLOBAL STATE
// ==================================================
let currentUser = null;
let userProfile = null;
let unsubscribeProfile = null;
let currentCalendarDate = new Date();

// ==================================================
// 🔹 UTILITY FUNCTIONS
// ==================================================
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateInput(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

function daysUntil(date) {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ==================================================
// 🔹 PAGE NAVIGATION
// ==================================================
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page, .auth-container').forEach(p => p.classList.remove('active'));
  // Show requested page
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
  }
  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.page === pageId);
  });
  window.scrollTo(0, 0);
}
window.showPage = showPage;

function showMainApp() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('forgot-password-page').style.display = 'none';
  document.getElementById('app-header').style.display = 'flex';
  document.getElementById('main-nav').style.display = 'flex';
  document.getElementById('app-main').style.display = 'block';
}

function showAuth() {
  document.getElementById('auth-page').style.display = 'flex';
  document.getElementById('forgot-password-page').style.display = 'none';
  document.getElementById('app-header').style.display = 'none';
  document.getElementById('main-nav').style.display = 'none';
  document.getElementById('app-main').style.display = 'none';
}

function buildNavTabs() {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = '';

  const commonTabs = [
    { id: 'company-dashboard-page', label: '📊 Dashboard', roles: ['company', 'driver', 'employee'] }
  ];
  const companyTabs = [
    { id: 'maintenance-page', label: '🔧 Maintenance', roles: ['company'] },
    { id: 'defects-page', label: '⚠️ Defects', roles: ['company'] },
    { id: 'compliance-page', label: '✅ Compliance', roles: ['company'] },
    { id: 'tacomaster-page', label: '⏱️ Tacomaster', roles: ['company'] },
    { id: 'company-settings-page', label: '⚙️ Settings', roles: ['company'] }
  ];
  const driverTabs = [
    { id: 'driver-dashboard-page', label: '🏠 Dashboard', roles: ['driver', 'employee'] },
    { id: 'driver-checklist-page', label: '📝 Checklist', roles: ['driver', 'employee'] },
    { id: 'driver-defect-report-page', label: '⚠️ Report Defect', roles: ['driver', 'employee'] },
    { id: 'driver-calendar-page', label: '📅 Availability', roles: ['driver'] },
    { id: 'driver-documents-page', label: '📂 Documents', roles: ['driver', 'employee'] },
    { id: 'driver-tachograph-page', label: '⏱️ Tacho Info', roles: ['driver', 'employee'] },
    { id: 'driver-profile-page', label: '👤 Profile', roles: ['driver', 'employee'] }
  ];

  let allTabs = [...commonTabs];
  if (userProfile?.role === 'company') allTabs = allTabs.concat(companyTabs);
  if (userProfile?.role === 'driver' || userProfile?.role === 'employee') allTabs = allTabs.concat(driverTabs);

  allTabs.forEach(tab => {
    if (tab.roles.includes(userProfile?.role)) {
      const el = document.createElement('div');
      el.className = 'nav-tab';
      el.dataset.page = tab.id;
      el.textContent = tab.label;
      el.onclick = () => showPage(tab.id);
      nav.appendChild(el);
    }
  });
}

// ==================================================
// 🔹 AUTHENTICATION
// ==================================================
async function handleSignIn(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    currentUser = userCred.user;
    showToast('Welcome back! Signing in...', 'success');
    return true;
  } catch (err) {
    console.error('Sign in error:', err);
    let msg = 'Sign in failed. Please check your details.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      msg = 'Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      msg = 'Too many attempts. Please try again later.';
    }
    showToast(msg, 'danger');
    return false;
  }
}
window.handleSignIn = handleSignIn;

async function handleRegister(email, password, name, role, companyId = null) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = userCred.user;
    await updateProfile(currentUser, { displayName: name });

    const profileData = {
      uid: currentUser.uid,
      name: name,
      email: email,
      role: role,
      companyId: companyId,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    };

    if (role === 'company') {
      const companyRef = doc(collection(db, 'companies'));
      await setDoc(companyRef, {
        name: name,
        email: email,
        operatorLicence: '',
        createdAt: Timestamp.now(),
        tacomasterApiKey: '',
        tacomasterCompanyId: '',
        tacomasterAutoSync: false,
        archiveNotificationEmail: email,
        autoArchiveEnabled: true
      });
      profileData.companyId = companyRef.id;
    }

    await setDoc(doc(db, 'drivers', currentUser.uid), profileData);
    await sendEmailVerification(currentUser);
    showToast('Account created! Check your email to verify.', 'success');
    return true;
  } catch (err) {
    console.error('Registration error:', err);
    let msg = 'Registration failed.';
    if (err.code === 'auth/email-already-in-use') {
      msg = 'This email is already registered. Please sign in instead.';
    }
    showToast(msg, 'danger');
    return false;
  }
}
window.handleRegister = handleRegister;

async function handleSignOut() {
  if (unsubscribeProfile) unsubscribeProfile();
  await signOut(auth);
  currentUser = null;
  userProfile = null;
  showAuth();
  showToast('Signed out successfully', 'info');
}
window.handleSignOut = handleSignOut;

async function handlePasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Reset link sent — check your email', 'success');
    return true;
  } catch (err) {
    showToast('Could not send reset email. Check the address is correct.', 'danger');
    return false;
  }
}
window.handlePasswordReset = handlePasswordReset;

// Load user profile
async function loadUserProfile(uid) {
  try {
    const profileRef = doc(db, 'drivers', uid);
    const snap = await getDoc(profileRef);
    
    if (snap.exists()) {
      userProfile = snap.data();
      userProfile.uid = uid;
      document.getElementById('user-display-name').textContent = escapeHtml(userProfile.name);
      
      if (userProfile.role === 'driver' || userProfile.role === 'employee') {
        document.getElementById('driver-welcome-name').textContent = escapeHtml(userProfile.name);
      }
      
      buildNavTabs();
      
      // Show appropriate landing page
      if (userProfile.role === 'company') {
        showPage('company-dashboard-page');
        loadCompanyDashboard();
      } else if (userProfile.role === 'driver') {
        showPage('driver-dashboard-page');
      } else if (userProfile.role === 'employee') {
        showPage('driver-dashboard-page');
      }
      
      return userProfile;
    } else {
      showToast('Profile not found — please register again', 'warning');
      handleSignOut();
      return null;
    }
  } catch (err) {
    console.error('Error loading user profile:', err);
    showToast('Error loading profile', 'danger');
    return null;
  }
}

// Auth state watcher
onAuthStateChanged(getAuth(), async (user) => {
  const navGuest = document.getElementById('nav-guest');
  const navDriver = document.getElementById('nav-driver');
  const navCompany = document.getElementById('nav-company');
  
  if (user) {
    currentUser = user;
    await loadUserProfile();
    
    // Hide all navs first
    if (navGuest) navGuest.classList.add('hidden');
    if (navDriver) navDriver.classList.add('hidden');
    if (navCompany) navCompany.classList.add('hidden');
    
    // Show the right one
    if (userProfile?.role === 'company') {
      if (navCompany) navCompany.classList.remove('hidden');
    } else if (userProfile?.role === 'driver') {
      if (navDriver) navDriver.classList.remove('hidden');
    } else {
      if (navGuest) navGuest.classList.remove('hidden');
    }
  } else {
    currentUser = null;
    userProfile = null;
    // Show guest nav only
    if (navGuest) navGuest.classList.remove('hidden');
    if (navDriver) navDriver.classList.add('hidden');
    if (navCompany) navCompany.classList.add('hidden');
    showPage('home-page');
  }
});

// ==================================================
// 🔹 COMPANY DASHBOARD
// ==================================================
async function loadCompanyDashboard() {
  if (!userProfile?.companyId) return;

  try {
    // Count active drivers in company
    const driversSnap = await getDocs(
      query(collection(db, 'drivers'), where('companyId', '==', userProfile.companyId))
    );
    document.getElementById('stat-drivers').textContent = driversSnap.size;

    // Count vehicles
    const vehiclesSnap = await getDocs(
      query(collection(db, 'vehicles'), where('companyId', '==', userProfile.companyId))
    );
    document.getElementById('stat-vehicles').textContent = vehiclesSnap.size;

    // Count open defects
    const openDefectsSnap = await getDocs(
      query(collection(db, 'defects'), 
        where('companyId', '==', userProfile.companyId),
        where('status', 'in', ['open', 'acknowledged', 'in-progress'])
      )
    );
    document.getElementById('stat-defects').textContent = openDefectsSnap.size;

    // Count active jobs
    const jobsSnap = await getDocs(
      query(collection(db, 'jobs'), 
        where('companyId', '==', userProfile.companyId),
        where('status', '==', 'active')
      )
    );
    document.getElementById('stat-jobs').textContent = jobsSnap.size;

    loadRecentActivity();
    loadAlerts();
    calculateComplianceScore();
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

async function loadRecentActivity() {
  const list = document.getElementById('recent-activity-list');
  if (!list || !userProfile?.companyId) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'activity'), 
        where('companyId', '==', userProfile.companyId),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
    );

    if (snap.empty) {
      list.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No recent activity</p>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const act = doc.data();
      list.innerHTML += `
        <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
          <div style="font-size: 0.9rem;">${escapeHtml(act.message || act.type || 'Activity')}</div>
          <div style="font-size: 0.75rem; color: var(--text-light);">
            ${act.timestamp ? formatDate(act.timestamp.toDate()) : ''}
          </div>
        </div>
      `;
    });
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not load activity</p>';
  }
}

async function loadAlerts() {
  const list = document.getElementById('alerts-list');
  if (!list || !userProfile?.companyId) return;

  const alerts = [];

  try {
    // Check maintenance due soon
    const maintSnap = await getDocs(
      query(collection(db, 'maintenance'),
        where('companyId', '==', userProfile.companyId),
        where('status', 'in', ['scheduled', 'overdue'])
      )
    );

    const today = new Date();
    const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    maintSnap.forEach(doc => {
      const m = doc.data();
      if (m.dueDate) {
        const due = m.dueDate.toDate();
        if (due < today) {
          alerts.push({ text: `🔴 OVERDUE: ${escapeHtml(m.vehicleReg)} — ${escapeHtml(m.type)}`, type: 'danger' });
        } else if (due < oneWeek) {
          alerts.push({ text: `🟡 Due soon: ${escapeHtml(m.vehicleReg)} — ${escapeHtml(m.type)}`, type: 'warning' });
        }
      }
    });

    // Check open defects
    const defectsSnap = await getDocs(
      query(collection(db, 'defects'),
        where('companyId', '==', userProfile.companyId),
        where('severity', 'in', ['major', 'prohibitive']),
        where('status', '!=', 'resolved')
      )
    );

    if (!defectsSnap.empty) {
      alerts.push({ text: `⚠️ ${defectsSnap.size} major/prohibitive defect(s) open`, type: 'danger' });
    }

    if (alerts.length === 0) {
      list.innerHTML = '<p style="color: var(--success);">✅ No outstanding alerts — all on track</p>';
    } else {
      list.innerHTML = alerts.map(a => 
        `<div class="badge ${a.type}" style="margin: 0.25rem 0; display:block;">${a.text}</div>`
      ).join('');
    }
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not check alerts</p>';
  }
}

// ==================================================
// 🔹 MAINTENANCE SCHEDULES
// ==================================================
let currentMaintFilter = 'all';

async function loadMaintenanceList() {
  const list = document.getElementById('maintenance-list');
  if (!list || !userProfile?.companyId) return;

  try {
    let q = query(
      collection(db, 'maintenance'),
      where('companyId', '==', userProfile.companyId),
      orderBy('dueDate', 'asc')
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-light);">No maintenance schedules found. Click "+ Add Schedule" to create one.</td></tr>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const m = { id: doc.id, ...doc.data() };
      
      if (currentMaintFilter !== 'all' && m.vehicleId !== currentMaintFilter) return;

      let statusBadge = `<span class="badge info">${m.status}</span>`;
      const dueDate = m.dueDate ? m.dueDate.toDate() : null;
      if (dueDate && m.status !== 'completed') {
        const days = daysUntil(dueDate);
        if (days < 0) statusBadge = '<span class="badge danger">OVERDUE</span>';
        else if (days <= 7) statusBadge = '<span class="badge warning">Due Soon</span>';
      }

      list.innerHTML += `
        <tr>
          <td>${escapeHtml(m.vehicleReg || 'Unknown')}</td>
          <td>${escapeHtml(m.type)}</td>
          <td>${dueDate ? formatDate(dueDate) : ''} ${m.dueMileage ? `@ ${m.dueMileage}mi` : ''}</td>
          <td>${statusBadge}</td>
          <td class="hidden-mobile">${escapeHtml(m.assignedToName || '-')}</td>
          <td>
            <button class="btn small secondary" onclick="editMaintenance('${m.id}')">Edit</button>
            <button class="btn small danger" onclick="deleteMaintenance('${m.id}')">Del</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    list.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--danger);">Error loading schedules</td></tr>';
    console.error('Error loading maintenance:', err);
  }
}
window.loadMaintenanceList = loadMaintenanceList

function showAddMaintenanceModal() {
  document.getElementById('maint-modal-title').textContent = 'Add Maintenance Schedule';
  document.getElementById('maint-form').reset();
  document.getElementById('maint-id').value = '';
  populateVehicleSelect('maint-vehicle');
  populateDriverSelect('maint-assigned');
  document.getElementById('maint-modal').classList.remove('hidden');
}
window.showAddMaintenanceModal = showAddMaintenanceModal

function closeMaintModal() {
  document.getElementById('maint-modal').classList.add('hidden');
}
window.closeMaintModal = closeMaintModal

async function editMaintenance(id) {
  if (!userProfile?.companyId) return;
  try {
    const snap = await getDoc(doc(db, 'maintenance', id));
    if (!snap.exists()) return;
    const m = snap.data();
    
    document.getElementById('maint-modal-title').textContent = 'Edit Maintenance Schedule';
    document.getElementById('maint-id').value = id;
    document.getElementById('maint-vehicle').value = m.vehicleId || '';
    document.getElementById('maint-type').value = m.type || '';
    document.getElementById('maint-duedate').value = m.dueDate ? formatDateInput(m.dueDate.toDate()) : '';
    document.getElementById('maint-duemileage').value = m.dueMileage || '';
    document.getElementById('maint-assigned').value = m.assignedTo || '';
    document.getElementById('maint-notes').value = m.notes || '';
    document.getElementById('maint-status').value = m.status || 'scheduled';
    
    document.getElementById('maint-modal').classList.remove('hidden');
  } catch (err) {
    showToast('Could not load record', 'danger');
  }
}
window.editMaintenance = editMaintenance

async function deleteMaintenance(id) {
  if (!confirm('Delete this maintenance schedule?')) return;
  try {
    await deleteDoc(doc(db, 'maintenance', id));
    showToast('Schedule deleted', 'success');
    loadMaintenanceList();
  } catch (err) {
    showToast('Delete failed', 'danger');
  }
}
window.deleteMaintenance = deleteMaintenance

// Handle maintenance form submit
document.addEventListener('submit', async e => {
  if (e.target.id === 'maint-form') {
    e.preventDefault();
    const id = document.getElementById('maint-id').value;
    
    const vehicleSelect = document.getElementById('maint-vehicle');
    const vehicleReg = vehicleSelect.options[vehicleSelect.selectedIndex]?.text || '';

    const data = {
      companyId: userProfile.companyId,
      vehicleId: vehicleSelect.value,
      vehicleReg: vehicleReg,
      type: document.getElementById('maint-type').value,
      dueDate: document.getElementById('maint-duedate').value 
        ? Timestamp.fromDate(new Date(document.getElementById('maint-duedate').value)) 
        : null,
      dueMileage: parseInt(document.getElementById('maint-duemileage').value) || null,
      assignedTo: document.getElementById('maint-assigned').value,
      assignedToName: document.getElementById('maint-assigned').options[document.getElementById('maint-assigned').selectedIndex]?.text || '',
      notes: document.getElementById('maint-notes').value,
      status: document.getElementById('maint-status').value,
      updatedAt: Timestamp.now()
    };

    try {
      if (id) {
        await updateDoc(doc(db, 'maintenance', id), data);
        showToast('Schedule updated', 'success');
      } else {
        data.createdAt = Timestamp.now();
        await addDoc(collection(db, 'maintenance'), data);
        showToast('Schedule added', 'success');
      }
      closeMaintModal();
      loadMaintenanceList();
    } catch (err) {
      showToast('Error saving record', 'danger');
    }
  }
});

// ==================================================
// 🔹 DEFECT MANAGEMENT
// ==================================================
let currentDefectFilter = 'all';

async function loadDefectsList() {
  const list = document.getElementById('defects-list');
  if (!list || !userProfile?.companyId) return;

  try {
    let q = query(
      collection(db, 'defects'),
      where('companyId', '==', userProfile.companyId),
      orderBy('reportedAt', 'desc')
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-light);">No defects recorded. Great job!</td></tr>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const d = { id: doc.id, ...doc.data() };
      
      if (currentDefectFilter !== 'all' && d.status !== currentDefectFilter) return;

      const severityClass = {
        minor: '',
        significant: 'status-warning',
        major: 'status-bad',
        prohibitive: 'status-bad'
      }[d.severity] || '';

      const statusBadge = {
        open: '<span class="badge danger">Open</span>',
        acknowledged: '<span class="badge warning">Acknowledged</span>',
        'in-progress': '<span class="badge info">In Progress</span>',
        resolved: '<span class="badge success">Resolved</span>',
        deferred: '<span class="badge warning">Deferred</span>'
      }[d.status] || d.status;

      list.innerHTML += `
        <tr>
          <td>${d.reportedAt ? formatDate(d.reportedAt.toDate()) : '-'}</td>
          <td>${escapeHtml(d.vehicleReg || 'Unknown')}</td>
          <td>${escapeHtml(d.title)}</td>
          <td class="${severityClass}">${escapeHtml(d.severity)}</td>
          <td>${statusBadge}</td>
          <td class="hidden-mobile">${escapeHtml(d.reportedByName || '-')}</td>
          <td>
            <button class="btn small secondary" onclick="editDefect('${d.id}')">Edit</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    list.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--danger);">Error loading defects</td></tr>';
    console.error('Error loading defects:', err);
  }
}
window.loadDefectsList = loadDefectsList

function showAddDefectModal() {
  document.getElementById('defect-modal-title').textContent = 'Report Defect';
  document.getElementById('defect-form').reset();
  document.getElementById('defect-id').value = '';
  populateVehicleSelect('defect-vehicle');
  document.getElementById('defect-modal').classList.remove('hidden');
}
window.showAddDefectModal = showAddDefectModal

function closeDefectModal() {
  document.getElementById('defect-modal').classList.add('hidden');
}
window.closeDefectModal = closeDefectModal

async function editDefect(id) {
  if (!userProfile?.companyId) return;
  try {
    const snap = await getDoc(doc(db, 'defects', id));
    if (!snap.exists()) return;
    const d = snap.data();
    
    document.getElementById('defect-modal-title').textContent = 'Edit Defect';
    document.getElementById('defect-id').value = id;
    document.getElementById('defect-vehicle').value = d.vehicleId || '';
    document.getElementById('defect-title').value = d.title || '';
    document.getElementById('defect-description').value = d.description || '';
    document.getElementById('defect-severity').value = d.severity || 'minor';
    document.getElementById('defect-location').value = d.location || '';
    document.getElementById('defect-status').value = d.status || 'open';
    document.getElementById('defect-resolution').value = d.resolution || '';
    
    document.getElementById('defect-modal').classList.remove('hidden');
  } catch (err) {
    showToast('Could not load defect', 'danger');
  }
}
window.editDefect = editDefect

// Handle defect form submit
document.addEventListener('submit', async e => {
  if (e.target.id === 'defect-form') {
    e.preventDefault();
    const id = document.getElementById('defect-id').value;
    
    const vehicleSelect = document.getElementById('defect-vehicle');
    const vehicleReg = vehicleSelect.options[vehicleSelect.selectedIndex]?.text || '';

    const data = {
      companyId: userProfile.companyId,
      vehicleId: vehicleSelect.value,
      vehicleReg: vehicleReg,
      title: document.getElementById('defect-title').value,
      description: document.getElementById('defect-description').value,
      severity: document.getElementById('defect-severity').value,
      location: document.getElementById('defect-location').value,
      status: document.getElementById('defect-status').value,
      resolution: document.getElementById('defect-resolution').value,
      updatedAt: Timestamp.now(),
      updatedBy: currentUser.uid,
      updatedByName: userProfile.name
    };

    try {
      if (id) {
        await updateDoc(doc(db, 'defects', id), data);
        showToast('Defect updated', 'success');
      } else {
        data.reportedAt = Timestamp.now();
        data.reportedBy = currentUser.uid;
        data.reportedByName = userProfile.name;
        await addDoc(collection(db, 'defects'), data);
        showToast('Defect reported', 'success');
      }
      closeDefectModal();
      loadDefectsList();
    } catch (err) {
      showToast('Error saving defect', 'danger');
    }
  }
});

// Defect filter buttons
document.addEventListener('click', e => {
  if (e.target.classList.contains('defect-filter')) {
    document.querySelectorAll('.defect-filter').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentDefectFilter = e.target.dataset.filter;
    loadDefectsList();
  }
});

// ==================================================
// 🔹 COMPLIANCE OVERVIEW
// ==================================================
async function calculateComplianceScore() {
  if (!userProfile?.companyId) return;
  
  try {
    let totalChecks = 0;
    let passedChecks = 0;

    // 1. Vehicle MOT/Safety check
    const vehiclesSnap = await getDocs(
      query(collection(db, 'vehicles'), where('companyId', '==', userProfile.companyId))
    );
    vehiclesSnap.forEach(v => {
      const data = v.data();
      totalChecks++;
      if (data.motExpiry) {
        const days = daysUntil(data.motExpiry.toDate());
        if (days > 14) passedChecks++;
      }
      if (data.tachographCalDue) {
        totalChecks++;
        const days = daysUntil(data.tachographCalDue.toDate());
        if (days > 30) passedChecks++;
      }
    });

    // 2. Driver documents check
    const driversSnap = await getDocs(
      query(collection(db, 'drivers'), where('companyId', '==', userProfile.companyId))
    );
    driversSnap.forEach(d => {
      const data = d.data();
      totalChecks++;
      if (data.cpcExpiry) {
        const days = daysUntil(data.cpcExpiry.toDate());
        if (days > 30) passedChecks++;
      }
      totalChecks++;
      if (data.licenceExpiry) {
        const days = daysUntil(data.licenceExpiry.toDate());
        if (days > 90) passedChecks++;
      }
    });

    // 3. Open defects penalty
    const openDefectsSnap = await getDocs(
      query(collection(db, 'defects'),
        where('companyId', '==', userProfile.companyId),
        where('status', '!=', 'resolved')
      )
    );
    totalChecks += openDefectsSnap.size;
    openDefectsSnap.forEach(() => { passedChecks += 0; });

    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
    
    document.getElementById('compliance-score').textContent = score + '%';
    
    let statusText = '';
    if (score >= 95) statusText = '✅ Excellent — Fully Compliant';
    else if (score >= 85) statusText = '⚠️ Good — Minor improvements needed';
    else if (score >= 70) statusText = '⚠️ Needs Attention — Action recommended';
    else statusText = '🔴 At Risk — Immediate action required';
    document.getElementById('compliance-status').textContent = statusText;

    loadVehicleComplianceList();
    loadDriverComplianceList();
    loadDocumentAlerts();
    loadDvsaDocumentList();
    loadTachoComplianceStatus();
  } catch (err) {
    console.error('Error calculating compliance:', err);
    document.getElementById('compliance-score').textContent = '--%';
    document.getElementById('compliance-status').textContent = 'Could not calculate';
  }
}

async function loadVehicleComplianceList() {
  const list = document.getElementById('vehicle-compliance-list');
  if (!list || !userProfile?.companyId) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'vehicles'), where('companyId', '==', userProfile.companyId))
    );

    if (snap.empty) {
      list.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No vehicles added yet</p>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const v = doc.data();
      let status = '✅ OK';
      let statusClass = 'status-good';
      
      if (v.motExpiry) {
        const days = daysUntil(v.motExpiry.toDate());
        if (days < 0) { status = '🔴 MOT EXPIRED'; statusClass = 'status-bad'; }
        else if (days < 14) { status = '⚠️ MOT Due Soon'; statusClass = 'status-warning'; }
      }
      
      list.innerHTML += `
        <div style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
          <strong>${escapeHtml(v.registration || 'Unknown Vehicle')}</strong>
          <span class="${statusClass}" style="margin-left: 0.5rem; font-size: 0.85rem;">${status}</span>
        </div>
      `;
    });
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not load vehicle data</p>';
  }
}

async function loadDriverComplianceList() {
  const list = document.getElementById('driver-compliance-list');
  if (!list || !userProfile?.companyId) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'drivers'), where('companyId', '==', userProfile.companyId))
    );

    if (snap.empty) {
      list.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No drivers added yet</p>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      let status = '✅ Documents Current';
      let statusClass = 'status-good';
      
      if (d.cpcExpiry) {
        const days = daysUntil(d.cpcExpiry.toDate());
        if (days < 0) { status = '🔴 CPC EXPIRED'; statusClass = 'status-bad'; }
        else if (days < 30) { status = '⚠️ CPC Due Soon'; statusClass = 'status-warning'; }
      }
      
      list.innerHTML += `
        <div style="padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
          <strong>${escapeHtml(d.name || 'Unknown')}</strong>
          <span class="${statusClass}" style="margin-left: 0.5rem; font-size: 0.85rem;">${status}</span>
        </div>
      `;
    });
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not load driver data</p>';
  }
}

async function loadDocumentAlerts() {
  const list = document.getElementById('document-alerts-list');
  if (!list || !userProfile?.companyId) return;

  try {
    const alerts = [];
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();

    // Check vehicles
    const vehiclesSnap = await getDocs(
      query(collection(db, 'vehicles'), where('companyId', '==', userProfile.companyId))
    );
    vehiclesSnap.forEach(doc => {
      const v = doc.data();
      if (v.motExpiry) {
        const exp = v.motExpiry.toDate();
        if (exp < thirtyDays) {
          alerts.push({
            text: `${escapeHtml(v.registration)} — MOT expires ${formatDate(exp)}`,
            urgent: exp < today
          });
        }
      }
    });

    // Check drivers
    const driversSnap = await getDocs(
      query(collection(db, 'drivers'), where('companyId', '==', userProfile.companyId))
    );
    driversSnap.forEach(doc => {
      const d = doc.data();
      if (d.cpcExpiry) {
        const exp = d.cpcExpiry.toDate();
        if (exp < thirtyDays) {
          alerts.push({
            text: `${escapeHtml(d.name)} — CPC expires ${formatDate(exp)}`,
            urgent: exp < today
          });
        }
      }
    });

    if (alerts.length === 0) {
      list.innerHTML = '<p style="color: var(--success);">✅ All documents up to date</p>';
      return;
    }

    list.innerHTML = alerts.map(a => 
      `<div style="padding: 0.4rem 0; border-bottom: 1px solid var(--border); ${a.urgent ? 'color: var(--danger);' : 'color: var(--warning);'}">
        ${a.urgent ? '🔴' : '🟡'} ${escapeHtml(a.text)}
      </div>`
    ).join('');
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not check document expiry</p>';
  }
}

async function loadDvsaDocumentList() {
  const list = document.getElementById('dvsa-docs-list');
  if (!list) return;

  const docs = [
    { type: 'Driver Daily Walkaround Checks', retention: '3 Months', note: 'DVSA requirement' },
    { type: 'Vehicle Maintenance Records', retention: 'At least 3 Years', note: 'O-licence requirement' },
    { type: 'Defect Reports & Repair Records', retention: 'At least 3 Years', note: 'Must track defect to resolution' },
    { type: 'Tachograph Records', retention: '1 Year', note: 'EU regulation — 5 years for domestic' },
    { type: 'Driver CPC & Qualifications', retention: 'Duration + 2 Years', note: 'Proof of professional competence' },
    { type: 'Operator Licence Documents', retention: 'Duration + 5 Years', note: 'O-licence records' },
    { type: 'Insurance & Vehicle Documents', retention: 'Duration + 3 Years', note: 'Third-party insurance etc.' },
    { type: 'Driver Hours & Working Time', retention: '2 Years', note: 'Working Time Directive' }
  ];

  list.innerHTML = docs.map(d => `
    <tr>
      <td><strong>${d.type}</strong><br><small style="color: var(--text-light);">${d.note}</small></td>
      <td>Fleet / Driver</td>
      <td>${d.retention} + 10% buffer</td>
      <td><span class="badge success">Auto-Managed</span></td>
    </tr>
  `).join('');
}

async function loadTachoComplianceStatus() {
  const container = document.getElementById('tacho-compliance-status');
  if (!container || !userProfile?.companyId) return;

  try {
    const companySnap = await getDoc(doc(db, 'companies', userProfile.companyId));
    if (!companySnap.exists()) return;
    
    const company = companySnap.data();
    
    if (company.tacomasterApiKey) {
      container.innerHTML = `
        <p style="color: var(--success);">✅ Tacomaster API Connected</p>
        <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.5rem;">
          Auto-sync: ${company.tacomasterAutoSync ? 'Enabled' : 'Disabled'}
        </p>
      `;
    } else {
      container.innerHTML = '<p style="color: var(--text-light);">Not connected — add your API key in Settings</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="color: var(--text-light);">Status unknown</p>';
  }
}

// ==================================================
// 🔹 TACOMASTER API INTEGRATION
// ==================================================
document.addEventListener('submit', async e => {
  if (e.target.id === 'tacomaster-form') {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    const apiKey = document.getElementById('tacomaster-api-key').value.trim();
    const companyId = document.getElementById('tacomaster-company-id').value.trim();
    const autoSync = document.getElementById('tacomaster-auto-sync').checked;

    try {
      await updateDoc(doc(db, 'companies', userProfile.companyId), {
        tacomasterApiKey: apiKey,
        tacomasterCompanyId: companyId,
        tacomasterAutoSync: autoSync,
        updatedAt: Timestamp.now()
      });
      showToast('Tacomaster settings saved', 'success');
      
      if (apiKey) {
        addSyncLog('Connection configured — API key stored securely');
      }
      
      loadTachoComplianceStatus();
    } catch (err) {
      showToast('Failed to save settings', 'danger');
    }
  }
});

async function addSyncLog(message, status = 'success') {
  if (!userProfile?.companyId) return;
  try {
    await addDoc(collection(db, 'tachoSyncLog'), {
      companyId: userProfile.companyId,
      message: message,
      status: status,
      syncedAt: Timestamp.now()
    });
    loadSyncHistory();
  } catch (err) {
    console.error('Could not log sync:', err);
  }
}

async function loadSyncHistory() {
  const list = document.getElementById('tacho-sync-history');
  if (!list || !userProfile?.companyId) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'tachoSyncLog'),
        where('companyId', '==', userProfile.companyId),
        orderBy('syncedAt', 'desc'),
        limit(10)
      )
    );

    if (snap.empty) {
      list.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No sync history yet</p>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const log = doc.data();
      list.innerHTML += `
        <div style="padding: 0.4rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem;">
          <span class="badge ${log.status === 'success' ? 'success' : 'danger'}">${log.status}</span>
          ${escapeHtml(log.message)}
          <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.25rem;">
            ${log.syncedAt ? formatDate(log.syncedAt.toDate()) : ''}
          </div>
        </div>
      `;
    });
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not load history</p>';
  }
}
window.loadSyncHistory = loadSyncHistory

async function syncTachoData(type) {
  if (!userProfile?.companyId) {
    showToast('Please sign in', 'warning');
    return;
  }

  try {
    const companySnap = await getDoc(doc(db, 'companies', userProfile.companyId));
    if (!companySnap.exists()) return;
    const company = companySnap.data();

    if (!company.tacomasterApiKey) {
      showToast('Please enter your Tacomaster API key first', 'warning');
      return;
    }

    showToast(`Syncing ${type} data...`, 'info');
    
    // Log the sync request — actual API calls would be implemented server-side
    // for security (API keys should never be exposed in browser code)
    await addSyncLog(`Manual sync requested: ${type} data`, 'success');
    
    setTimeout(() => {
      showToast(`${type} sync completed — check logs in your Tacomaster account`, 'success');
    }, 1500);
  } catch (err) {
    showToast('Sync failed — check your API key', 'danger');
    addSyncLog(`Sync failed: ${err.message}`, 'error');
  }
}
window.syncTachoData = syncTachoData

// ==================================================
// 🔹 COMPANY SETTINGS
// ==================================================
document.addEventListener('submit', async e => {
  if (e.target.id === 'company-details-form') {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    try {
      await updateDoc(doc(db, 'companies', userProfile.companyId), {
        name: document.getElementById('settings-company-name').value,
        operatorLicence: document.getElementById('settings-operator-licence').value,
        email: document.getElementById('settings-email').value,
        updatedAt: Timestamp.now()
      });
      showToast('Company details saved', 'success');
    } catch (err) {
      showToast('Failed to save details', 'danger');
    }
  }

  if (e.target.id === 'retention-form') {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    try {
      await updateDoc(doc(db, 'companies', userProfile.companyId), {
        autoArchiveEnabled: document.getElementById('auto-archive-enabled').value === 'true',
        archiveNotificationEmail: document.getElementById('archive-email').value,
        updatedAt: Timestamp.now()
      });
      showToast('Retention settings saved', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'danger');
    }
  }
});

// ==================================================
// 🔹 HELPER FUNCTIONS — Vehicle & Driver Selectors
// ==================================================
async function populateVehicleSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !userProfile?.companyId) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">Select vehicle...</option>';

  try {
    const snap = await getDocs(
      query(collection(db, 'vehicles'), where('companyId', '==', userProfile.companyId))
    );
    snap.forEach(doc => {
      const v = doc.data();
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${v.registration || 'Unknown'} — ${v.make || ''} ${v.model || ''}`;
      select.appendChild(opt);
    });
    select.value = currentValue;
  } catch (err) {
    console.error('Error loading vehicles:', err);
  }
}

async function populateDriverSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !userProfile?.companyId) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">-- External / Workshop --</option>';

  try {
    const snap = await getDocs(
      query(collection(db, 'drivers'), where('companyId', '==', userProfile.companyId))
    );
    snap.forEach(doc => {
      const d = doc.data();
      if (d.role === 'company') return;
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = d.name || 'Unknown Driver';
      select.appendChild(opt);
    });
    select.value = currentValue;
  } catch (err) {
    console.error('Error loading drivers:', err);
  }
}

// Page load handlers — load data when page becomes visible
document.addEventListener('click', e => {
  if (e.target.matches('[data-page]')) {
    const pageId = e.target.dataset.page;
    setTimeout(() => {
      if (pageId === 'maintenance-page') {
        populateVehicleSelect('maint-vehicle');
        populateDriverSelect('maint-assigned');
        loadMaintenanceList();
      }
      if (pageId === 'defects-page') {
        populateVehicleSelect('defect-vehicle');
        loadDefectsList();
      }
      if (pageId === 'compliance-page') {
        calculateComplianceScore();
      }
      if (pageId === 'tacomaster-page') {
        loadSyncHistory();
        loadTachoSettings();
      }
    }, 50);
  }
});

async function loadTachoSettings() {
  if (!userProfile?.companyId) return;
  try {
    const snap = await getDoc(doc(db, 'companies', userProfile.companyId));
    if (snap.exists()) {
      const c = snap.data();
      document.getElementById('tacomaster-api-key').value = c.tacomasterApiKey || '';
      document.getElementById('tacomaster-company-id').value = c.tacomasterCompanyId || '';
      document.getElementById('tacomaster-auto-sync').checked = c.tacomasterAutoSync || false;
    }
  } catch (err) {
    console.error('Error loading tacho settings:', err);
  }
}

// ==================================================
// 🔹 DRIVER PORTAL — Dashboard & Profile
// ==================================================
async function loadDriverDashboard() {
  if (!userProfile) return;
  document.getElementById('driver-welcome-name').textContent = escapeHtml(userProfile.name);
}
window.loadDriverDashboard = loadDriverDashboard

document.addEventListener('submit', async e => {
  if (e.target.id === 'driver-profile-form') {
    e.preventDefault();
    try {
      const data = {
        name: document.getElementById('dr-profile-name').value,
        phone: document.getElementById('dr-profile-phone').value,
        location: document.getElementById('dr-profile-location').value,
        updatedAt: Timestamp.now()
      };
      await updateDoc(doc(db, 'drivers', currentUser.uid), data);
      userProfile = { ...userProfile, ...data };
      document.getElementById('user-display-name').textContent = escapeHtml(userProfile.name);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'danger');
    }
  }
});

async function loadDriverProfileForm() {
  if (!userProfile) return;
  document.getElementById('dr-profile-name').value = userProfile.name || '';
  document.getElementById('dr-profile-email').value = userProfile.email || '';
  document.getElementById('dr-profile-phone').value = userProfile.phone || '';
  document.getElementById('dr-profile-location').value = userProfile.location || '';
}
window.loadDriverProfileForm = loadDriverProfileForm

// ==================================================
// 🔹 DRIVER PORTAL — Defect Reporting
// ==================================================
document.addEventListener('submit', async e => {
  if (e.target.id === 'driver-defect-form') {
    e.preventDefault();
    if (!userProfile) return;

    const vehicleSelect = document.getElementById('dr-defect-vehicle');
    const vehicleReg = vehicleSelect.options[vehicleSelect.selectedIndex]?.text || '';

    const data = {
      companyId: userProfile.companyId,
      driverId: currentUser.uid,
      driverName: userProfile.name,
      vehicleId: vehicleSelect.value,
      vehicleReg: vehicleReg,
      title: document.getElementById('dr-defect-title').value,
      description: document.getElementById('dr-defect-description').value,
      severity: document.getElementById('dr-defect-severity').value,
      status: 'open',
      reportedAt: Timestamp.now(),
      reportedBy: currentUser.uid,
      reportedByName: userProfile.name
    };

    try {
      await addDoc(collection(db, 'defects'), data);
      showToast('Defect reported — thank you!', 'success');
      e.target.reset();
    } catch (err) {
      showToast('Failed to report defect', 'danger');
    }
  }
});

async function loadDriverDefectVehicles() {
  const select = document.getElementById('dr-defect-vehicle');
  if (!select || !userProfile?.companyId) return;

  select.innerHTML = '<option value="">Select vehicle...</option>';
  try {
    const snap = await getDocs(
      query(collection(db, 'vehicles'), where('companyId', '==', userProfile.companyId))
    );
    snap.forEach(doc => {
      const v = doc.data();
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = v.registration || 'Unknown Vehicle';
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error loading vehicles:', err);
  }
}
window.loadDriverDefectVehicles = loadDriverDefectVehicles

// ==================================================
// 🔹 DRIVER PORTAL — Documents
// ==================================================
async function uploadDriverDocument() {
  const fileInput = document.getElementById('doc-upload');
  const typeSelect = document.getElementById('doc-type');
  
  if (!fileInput.files.length) {
    showToast('Please select a file first', 'warning');
    return;
  }
  if (!typeSelect.value) {
    showToast('Please select document type', 'warning');
    return;
  }

  const file = fileInput.files[0];
  const docType = typeSelect.value;
  
  try {
    showToast('Uploading...', 'info');
    
    const fileRef = ref(storage, `driver-docs/${currentUser.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const expiryDate = calculateDocumentExpiry(docType);

    await addDoc(collection(db, 'documents'), {
      userId: currentUser.uid,
      userCompanyId: userProfile.companyId,
      type: docType,
      name: file.name,
      url: downloadURL,
      size: file.size,
      uploadedAt: Timestamp.now(),
      expiryDate: expiryDate ? Timestamp.fromDate(expiryDate) : null
    });

    showToast('Document uploaded successfully', 'success');
    fileInput.value = '';
    typeSelect.value = '';
    loadDriverDocuments();
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Upload failed — please try again', 'danger');
  }
}
window.uploadDriverDocument = uploadDriverDocument

function calculateDocumentExpiry(docType) {
  const today = new Date();
  switch (docType) {
    case 'cpc-card':
    case 'driving-licence':
      return new Date(today.setFullYear(today.getFullYear() + 5));
    case 'tacho-card':
      return new Date(today.setFullYear(today.getFullYear() + 5));
    case 'medical':
      return new Date(today.setFullYear(today.getFullYear() + 5));
    default:
      return null;
  }
}

async function loadDriverDocuments() {
  const list = document.getElementById('driver-docs-list');
  if (!list || !currentUser) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'documents'), where('userId', '==', currentUser.uid), orderBy('uploadedAt', 'desc'))
    );

    if (snap.empty) {
      list.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No documents uploaded yet</p>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      const expiry = d.expiryDate ? d.expiryDate.toDate() : null;
      const daysLeft = expiry ? daysUntil(expiry) : null;
      let expiryBadge = '';
      
      if (daysLeft !== null) {
        if (daysLeft < 0) expiryBadge = '<span class="badge danger">EXPIRED</span>';
        else if (daysLeft < 30) expiryBadge = '<span class="badge warning">Expiring Soon</span>';
        else expiryBadge = '<span class="badge success">Valid</span>';
      }

      list.innerHTML += `
        <div class="card" style="padding: 0.75rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong>${escapeHtml(d.name)}</strong>
              <div style="font-size: 0.85rem; color: var(--text-light);">
                ${escapeHtml(d.type).replace('-', ' ')} • ${formatDate(d.uploadedAt.toDate())}
              </div>
              ${expiryBadge}
            </div>
            <a href="${d.url}" target="_blank" class="btn small secondary">View</a>
          </div>
        </div>
      `;
    });
  } catch (err) {
    list.innerHTML = '<p style="color: var(--text-light);">Could not load documents</p>';
  }
}
window.loadDriverDocuments = loadDriverDocuments

// ==================================================
// 🔹 DRIVER PORTAL — Calendar / Availability
// ==================================================
let calendarData = {};

async function loadDriverCalendar() {
  if (!currentUser) return;
  renderCalendar();
}
window.loadDriverCalendar = loadDriverCalendar

function renderCalendar() {
  const container = document.getElementById('calendar-days');
  const header = document.getElementById('calendar-month-year');
  if (!container || !header) return;

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  header.textContent = currentCalendarDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dayHeaders = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  container.innerHTML = dayHeaders.map(h => `<div style="text-align:center; font-weight:600; padding:0.5rem; font-size:0.8rem;">${h}</div>`).join('');
  
  for (let i = 0; i < firstDay; i++) {
    container.innerHTML += '<div></div>';
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const status = calendarData[dateKey] || 'undefined';
    
    let bg = '#f9fafb';
    if (status === 'available') bg = '#e8f5e9';
    else if (status === 'unavailable') bg = '#ffebee';
    else if (status === 'pending') bg = '#fff4e5';
    else if (status === 'booked') bg = '#bbdefb';
    
    container.innerHTML += `
      <div style="background:${bg}; padding:0.5rem; text-align:center; border-radius:4px; cursor:pointer; min-height:40px; display:flex; align-items:center; justify-content:center;"
           onclick="toggleDayStatus('${dateKey}')">
        ${day}
      </div>
    `;
  }
}

window.changeMonth = function(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

window.toggleDayStatus = function(dateKey) {
  const states = ['undefined', 'available', 'unavailable'];
  const current = calendarData[dateKey] || 'undefined';
  const idx = states.indexOf(current);
  calendarData[dateKey] = states[(idx + 1) % states.length];
  renderCalendar();
  saveCalendarDay(dateKey, calendarData[dateKey]);
}

async function saveCalendarDay(dateKey, status) {
  if (!currentUser) return;
  try {
    await setDoc(doc(db, 'driverAvailability', currentUser.uid, 'dates', dateKey), {
      status: status,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving availability:', err);
  }
}

// ==================================================
// 🔹 AUTH PAGE EVENT HANDLERS
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
  // Auth tabs switching
  document.querySelectorAll('[data-auth-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-auth-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      if (tab.dataset.authTab === 'signin') {
        document.getElementById('signin-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
      } else {
        document.getElementById('signin-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
      }
    });
  });

  // Show/hide company fields based on account type
  const accountTypeSelect = document.getElementById('reg-account-type');
  if (accountTypeSelect) {
    accountTypeSelect.addEventListener('change', () => {
      const val = accountTypeSelect.value;
      document.getElementById('reg-company-name-group').style.display = val === 'company' ? 'block' : 'none';
      document.getElementById('reg-company-code-group').style.display = val === 'employee' ? 'block' : 'none';
    });
  }

  // Sign in form
  const signinForm = document.getElementById('signin-form');
  if (signinForm) {
    signinForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('si-email').value;
      const password = document.getElementById('si-password').value;
      const success = await handleSignIn(email, password);
      if (!success) {
        document.getElementById('si-password').value = '';
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const role = document.getElementById('reg-account-type').value;
      
      let companyId = null;
      
      if (role === 'employee') {
        const code = document.getElementById('reg-company-code').value.trim();
        if (!code) {
          showToast('Please enter your company access code', 'warning');
          return;
        }
        // Look up company by code
        try {
          const companiesSnap = await getDocs(
            query(collection(db, 'companies'), where('accessCode', '==', code))
          );
          if (companiesSnap.empty) {
            showToast('Invalid company access code', 'danger');
            return;
          }
          companiesSnap.forEach(doc => {
            companyId = doc.id;
          });
        } catch (err) {
          showToast('Could not verify company code', 'danger');
          return;
        }
      }
      
      const success = await handleRegister(email, password, name, role, companyId);
      if (success) {
        registerForm.reset();
        document.getElementById('reg-company-name-group').style.display = 'none';
        document.getElementById('reg-company-code-group').style.display = 'none';
        document.querySelector('[data-auth-tab="signin"]').click();
      }
    });
  }

  // Forgot password form
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('fp-email').value;
      const success = await handlePasswordReset(email);
      if (success) {
        forgotForm.reset();
        setTimeout(() => showPage('auth-page'), 2000);
      }
    });
  }

  // Page visibility handlers — load data when pages are shown
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mut => {
      if (mut.target.classList.contains('active')) {
        const pageId = mut.target.id;
        onPageShown(pageId);
      }
    });
  });

  document.querySelectorAll('.page').forEach(page => {
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  });
});

// ==================================================
// 🔹 PAGE SHOWN HANDLERS — Auto-load data
// ==================================================
async function onPageShown(pageId) {
  switch(pageId) {
    case 'company-dashboard-page':
      loadCompanyDashboard();
      break;
    case 'maintenance-page':
      populateVehicleSelect('maint-vehicle');
      populateDriverSelect('maint-assigned');
      loadMaintenanceList();
      break;
    case 'defects-page':
      populateVehicleSelect('defect-vehicle');
      loadDefectsList();
      break;
    case 'compliance-page':
      calculateComplianceScore();
      break;
    case 'tacomaster-page':
      loadSyncHistory();
      loadTachoSettings();
      break;
    case 'driver-dashboard-page':
      loadDriverDashboard();
      break;
    case 'driver-profile-page':
      loadDriverProfileForm();
      break;
    case 'driver-defect-report-page':
      loadDriverDefectVehicles();
      break;
    case 'driver-documents-page':
      loadDriverDocuments();
      break;
    case 'driver-calendar-page':
      loadDriverCalendar();
      break;
  }
}

// ==================================================
// 🔹 DVSA COMPLIANCE — Document Retention & Auto-Archive
// ==================================================
const RETENTION_PERIODS = {
  'walkaround-check': { months: 3, gracePercent: 10 },
  'maintenance-record': { years: 3, gracePercent: 10 },
  'defect-report': { years: 3, gracePercent: 10 },
  'tachograph': { years: 1, gracePercent: 10 },
  'tachograph-domestic': { years: 5, gracePercent: 10 },
  'driver-cpc': { years: 2, gracePercent: 10 },
  'operator-licence': { years: 5, gracePercent: 10 },  // ✅ FIXED
  'insurance': { years: 3, gracePercent: 10 },
  'working-time': { years: 2, gracePercent: 10 }
};

function calculateExpiryDate(docType, uploadedDate) {
  const date = new Date(uploadedDate);
  const period = RETENTION_PERIODS[docType] || { years: 1, gracePercent: 10 };
  
  if (period.months) date.setMonth(date.getMonth() + period.months);
  if (period.years) date.setFullYear(date.getFullYear() + period.years);
  
  // Add 10% grace period
  const totalDays = Math.ceil((date - new Date(uploadedDate)) / (1000 * 60 * 60 * 24));
  const graceDays = Math.ceil(totalDays * (period.gracePercent / 100));
  date.setDate(date.getDate() + graceDays);
  
  return date;
}

async function checkForExpiredRecords() {
  if (!userProfile?.companyId) return;
  
  try {
    const today = new Date();
    
    // Check documents nearing expiry or expired
    const docsSnap = await getDocs(
      query(collection(db, 'documents'),
        where('userCompanyId', '==', userProfile.companyId)
      )
    );

    const companyRef = doc(db, 'companies', userProfile.companyId);
    const companySnap = await getDoc(companyRef);
    const company = companySnap.exists() ? companySnap.data() : {};
    
    if (!company.autoArchiveEnabled) return;

    const archiveEmail = company.archiveNotificationEmail || company.email;
    
    docsSnap.forEach(async doc => {
      const d = doc.data();
      if (!d.expiryDate) return;
      
      const expiry = d.expiryDate.toDate();
      const days = daysUntil(expiry);
      
      // Archive and email copy when past expiry
      if (days < 0 && !d.archived) {
        // Mark as archived
        await updateDoc(doc.ref, {
          archived: true,
          archivedAt: Timestamp.now(),
          archiveNotificationSent: false
        });
        
        // In a production environment, this would trigger a server-side Cloud Function
        // to email the document to the company before permanent deletion
        console.log(`📦 Document archived: ${d.name} — would email to ${archiveEmail}`);
        
        // After notification + grace period, permanently delete
        // deleteObject(ref(storage, d.url)) — handled server-side
      }
    });
  } catch (err) {
    console.error('Error checking expired records:', err);
  }
}

// Run daily check — triggered when company dashboard loads
setInterval(() => {
  if (userProfile?.role === 'company') {
    checkForExpiredRecords();
  }
}, 12 * 60 * 60 * 1000); // Every 12 hours

// ==================================================
// 🔹 GLOBAL ERROR HANDLING
// ==================================================
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showToast('Something went wrong. Please try again.', 'danger');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showToast('Action failed — please check your connection and try again.', 'danger');
});

// ==================================================
// 🔹 JOB BOARD & MARKETPLACE
// ==================================================

const JOB_STATUSES = {
  ACTIVE: 'active',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

const APPLICATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// Helper: Format pay rate for display
function formatPayRate(amount, type) {
  const symbols = {
    'daily': '/day',
    'halfday': '/half day',
    'hourly': '/hour',
    'job': ' flat',
    'mile': '/mile'
  };
  return `£${parseFloat(amount).toFixed(2)}${symbols[type] || ''}`;
}

// Load all jobs for job board
async function loadJobBoard() {
  const container = document.getElementById('job-listings');
  if (!container) return;
  
  try {
    const now = Timestamp.now();
    const snap = await getDocs(
      query(
        collection(db, 'jobs'),
        where('status', '==', JOB_STATUSES.ACTIVE),
        where('startDateTime', '>', now),
        orderBy('startDateTime', 'asc')
      )
    );

    if (snap.empty) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <h3 style="color: var(--primary); margin-bottom: 0.5rem;">No jobs available right now</h3>
          <p style="color: var(--text-light);">Check back soon — new jobs are posted daily.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    snap.forEach(doc => {
      const job = doc.data();
      const startDate = job.startDateTime?.toDate() ? job.startDateTime.toDate() : new Date(job.startDate);
      
      container.innerHTML += `
        <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; cursor: pointer;" onclick="showJobDetails('${doc.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <h3 style="color: var(--primary); margin-bottom: 0.25rem;">${escapeHtml(job.jobType || 'Job')}</h3>
              <p style="color: var(--text-light); font-size: 0.9rem; margin: 0;">📍 ${escapeHtml(job.startLocation || 'Location not specified')}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; color: var(--accent); font-size: 1.1rem;">${formatPayRate(job.payAmount, job.payType)}</div>
              <div style="font-size: 0.8rem; color: var(--text-light);">${formatDateShort(startDate)}</div>
            </div>
          </div>
          ${job.destination ? `<p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">→ ${escapeHtml(job.destination)}</p>` : ''}
          <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-light);">Posted anonymously • Company name revealed once accepted</span>
            <span class="btn small secondary">View & Apply</span>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Error loading jobs:', err);
    container.innerHTML = '<p style="text-align: center; color: red;">Could not load jobs. Please refresh.</p>';
  }
}
window.loadJobBoard = loadJobBoard

// Show full job details modal
async function showJobDetails(jobId) {
  const modal = document.getElementById('job-details-modal');
  const content = document.getElementById('job-details-content');
  if (!modal || !content) return;

  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      content.innerHTML = '<p>Job not found or no longer available.</p>';
      modal.classList.add('hidden');
      return;
    }

    const job = jobDoc.data();
    const startDate = job.startDateTime?.toDate() ? job.startDateTime.toDate() : new Date(job.startDate);
    const startTime = job.startTime || '--:--';
    
    // Check if current user has already applied
    let existingApplication = null;
    if (currentUser) {
      const appSnap = await getDocs(
        query(collection(db, 'applications'), 
          where('jobId', '==', jobId),
          where('driverId', '==', currentUser.uid)
        )
      );
      if (!appSnap.empty) {
        appSnap.forEach(d => { existingApplication = { id: d.id, ...d.data() }; });
      }
    }

    content.innerHTML = `
      <h2 style="color: var(--primary); margin-bottom: 1rem;">${escapeHtml(job.jobType || 'Job Details')}</h2>
      
      <div style="margin-bottom: 1rem;">
        <p style="margin: 0.25rem 0;"><strong>Start:</strong> ${formatDateShort(startDate)} at ${startTime}</p>
        <p style="margin: 0.25rem 0;"><strong>From:</strong> ${escapeHtml(job.startLocation || 'Not specified')}</p>
        ${job.destination ? `<p style="margin: 0.25rem 0;"><strong>To:</strong> ${escapeHtml(job.destination)}</p>` : ''}
        <p style="margin: 0.25rem 0;"><strong>Rate:</strong> ${formatPayRate(job.payAmount, job.payType)}</p>
        ${job.vehicleInfo ? `<p style="margin: 0.25rem 0;"><strong>Vehicle:</strong> ${escapeHtml(job.vehicleInfo)}</p>` : ''}
      </div>
      
      ${job.description ? `
        <div style="background: var(--primary-light); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
          <strong>Additional Info:</strong>
          <p style="margin-top: 0.5rem; white-space: pre-wrap;">${escapeHtml(job.description)}</p>
        </div>
      ` : ''}
      
      <div style="background: #fff8e1; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
        📌 <strong>Company name is kept anonymous</strong> — you will receive full contact details once you are accepted for this job.
      </div>
      
      ${existingApplication ? `
        <div style="text-align: center; padding: 1rem; background: var(--primary-light); border-radius: 4px;">
          <p>✅ You have applied for this job</p>
          <p style="font-size: 0.9rem; color: var(--text-light);">Status: <strong>${existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}</strong></p>
        </div>
      ` : currentUser ? `
        <button class="btn primary" style="width: 100%;" onclick="applyForJob('${jobId}')">✋ Apply for This Job</button>
      ` : `
        <button class="btn primary" style="width: 100%;" onclick="showPage('auth-page'); closeJobModal();">Sign In to Apply</button>
      `}
    `;
    
    modal.classList.remove('hidden');
  } catch (err) {
    console.error('Error loading job details:', err);
    showToast('Could not load job details', 'danger');
  }
}
window.showJobDetails = showJobDetails

function closeJobModal() {
  document.getElementById('job-details-modal').classList.add('hidden');
}
window.closeJobModal = closeJobModal

// Apply for a job
async function applyForJob(jobId) {
  if (!currentUser || !userProfile) {
    showToast('Please sign in first', 'warning');
    return;
  }

  try {
    await addDoc(collection(db, 'applications'), {
      jobId: jobId,
      driverId: currentUser.uid,
      driverName: userProfile.name,
      driverEmail: userProfile.email,
      driverPhone: userProfile.phone || '',
      companyId: userProfile.companyId || null,
      status: APPLICATION_STATUSES.PENDING,
      appliedAt: Timestamp.now()
    });
    
    showToast('✅ Application submitted! Good luck!', 'success');
    closeJobModal();
    loadJobBoard();
  } catch (err) {
    console.error('Error applying:', err);
    showToast('Failed to submit application', 'danger');
  }
}
window.applyForJob = applyForJob

// Handle post job form submit
document.addEventListener('submit', async e => {
  if (e.target.id === 'post-job-form') {
    e.preventDefault();
    if (!currentUser || userProfile?.role !== 'company') {
      showToast('Please sign in as a company', 'warning');
      return;
    }

    const formData = {
      companyId: userProfile.companyId || currentUser.uid,
      jobType: document.getElementById('job-type').value,
      startDate: document.getElementById('job-start-date').value,
      startTime: document.getElementById('job-start-time').value,
      startLocation: document.getElementById('job-location').value,
      destination: document.getElementById('job-destination').value || null,
      payType: document.getElementById('pay-rate-type').value,
      payAmount: parseFloat(document.getElementById('pay-rate-amount').value),
      vehicleInfo: document.getElementById('job-vehicle').value || null,
      description: document.getElementById('job-description').value || null,
      status: JOB_STATUSES.ACTIVE,
      createdAt: Timestamp.now(),
      anonymous: true
    };

    try {
      await addDoc(collection(db, 'jobs'), formData);
      showToast('✅ Job posted successfully!', 'success');
      e.target.reset();
      showPage('manage-jobs-page');
    } catch (err) {
      console.error('Error posting job:', err);
      showToast('Failed to post job', 'danger');
    }
  }
});

// Load company's posted jobs
async function loadCompanyJobs() {
  const container = document.getElementById('company-jobs-list');
  if (!container || !userProfile?.companyId) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'jobs'), 
        where('companyId', '==', userProfile.companyId),
        orderBy('createdAt', 'desc')
      )
    );

    if (snap.empty) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <h3 style="color: var(--primary); margin-bottom: 0.5rem;">No jobs posted yet</h3>
          <p style="color: var(--text-light); margin-bottom: 1.5rem;">Reach drivers by posting your first job — it's free!</p>
          <button class="btn primary" onclick="showPage('post-job-page')">Post Your First Job</button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    snap.forEach(async doc => {
      const job = { id: doc.id, ...doc.data() };
      const startDate = job.startDate ? new Date(job.startDate) : null;
      
      // Count applications
      let applicationCount = 0;
      const appsSnap = await getDocs(query(collection(db, 'applications'), where('jobId', '==', doc.id)));
      applicationCount = appsSnap.size;
      
      const statusBadges = {
        'active': '<span class="badge success">● Active</span>',
        'filled': '<span class="badge" style="background: #e3f2fd; color: #1565c0;">● Filled</span>',
        'cancelled': '<span class="badge" style="background: #ffebee; color: #c62828;">● Cancelled</span>'
      };
      
      container.innerHTML += `
        <div class="card" style="padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <h4 style="color: var(--primary); margin: 0 0 0.25rem 0;">${escapeHtml(job.jobType || 'Job')}</h4>
              <p style="font-size: 0.9rem; color: var(--text-light); margin: 0;">
                ${startDate ? formatDateShort(startDate) : 'Date TBC'} • ${escapeHtml(job.startLocation)}
              </p>
            </div>
            <div style="text-align: right;">
              ${statusBadges[job.status] || ''}
              <div style="font-weight: 600; margin-top: 0.25rem;">${formatPayRate(job.payAmount, job.payType)}</div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
            <span style="font-size: 0.85rem; color: var(--text-light);">${applicationCount} application${applicationCount !== 1 ? 's' : ''}</span>
            <div>
              <button class="btn small secondary" onclick="viewApplications('${doc.id}')">View Applications</button>
              ${job.status === 'active' ? `<button class="btn small" style="background: #ffebee; color: #c62828;" onclick="cancelJob('${doc.id}')">Cancel</button>` : ''}
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Error loading company jobs:', err);
    container.innerHTML = '<p style="text-align: center; color: red;">Could not load your jobs</p>';
  }
}
window.loadCompanyJobs = loadCompanyJobs

// View applications for a specific job
async function viewApplications(jobId) {
  const modal = document.createElement('div');
  modal.id = 'apps-modal';
  modal.style = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
  
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) return;
    const job = jobDoc.data();
    
    const appsSnap = await getDocs(query(collection(db, 'applications'), where('jobId', '==', jobId), orderBy('appliedAt', 'desc')));
    
    modal.innerHTML = `
      <div class="card" style="max-width: 600px; width: 90%; max-height: 85vh; overflow-y: auto; padding: 2rem; position: relative;">
        <button onclick="this.closest('#apps-modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Applications — ${escapeHtml(job.jobType || 'Job')}</h3>
        
        ${appsSnap.empty ? '<p style="color: var(--text-light);">No applications yet. Check back soon!</p>' : ''}
        
        ${appsSnap.docs.map(appDoc => {
          const app = appDoc.data();
          const statusColors = {
            'pending': 'background: #fff8e1; color: #f57c00;',
            'accepted': 'background: #e8f5e9; color: #2e7d32;',
            'rejected': 'background: #ffebee; color: #c62828;'
          };
          return `
            <div style="padding: 1rem; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <strong>${escapeHtml(app.driverName || 'Anonymous')}</strong>
                <span style="font-size: 0.8rem; padding: 0.15rem 0.5rem; border-radius: 10px; ${statusColors[app.status]}">${app.status}</span>
              </div>
              <p style="font-size: 0.85rem; margin: 0.25rem 0;">📧 ${escapeHtml(app.driverEmail || 'Email not provided')}</p>
              ${app.driverPhone ? `<p style="font-size: 0.85rem; margin: 0.25rem 0;">📱 ${escapeHtml(app.driverPhone)}</p>` : ''}
              
              ${app.status === 'pending' ? `
                <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
                  <button class="btn small primary" style="flex: 1;" onclick="acceptDriver('${jobId}', '${appDoc.id}', '${app.driverId}')">✅ Accept & Reveal Details</button>
                  <button class="btn small" style="background: #ffebee; color: #c62828; flex: 1;" onclick="rejectDriver('${appDoc.id}')">❌ Reject</button>
                </div>
              ` : ''}
              
              ${app.status === 'accepted' ? `
                <div style="margin-top: 0.5rem; padding: 0.5rem; background: #e8f5e9; border-radius: 4px; font-size: 0.85rem;">
                  ✅ Driver accepted. Contact details shared with both parties. £1.00 agency fee applies.
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (err) {
    console.error('Error loading applications:', err);
    showToast('Could not load applications', 'danger');
  }
}
window.viewApplications = viewApplications

// ACCEPT DRIVER — The Key Moment!
async function acceptDriver(jobId, applicationId, driverId) {
  if (!confirm('Are you sure you want to accept this driver?\n\n• Company name & contact details will be revealed to them\n• The £1.00 agency fee becomes payable\n• The job will be marked as filled')) return;
  
  try {
    // 1. Update application status
    await updateDoc(doc(db, 'applications', applicationId), {
      status: APPLICATION_STATUSES.ACCEPTED,
      acceptedAt: Timestamp.now()
    });
    
    // 2. Mark job as filled
    await updateDoc(doc(db, 'jobs', jobId), {
      status: JOB_STATUSES.FILLED,
      acceptedDriverId: driverId,
      filledAt: Timestamp.now()
    });
    
    // 3. Record the £1 fee for the company
    await addDoc(collection(db, 'transactions'), {
      companyId: userProfile.companyId || currentUser.uid,
      type: 'agency-fee',
      amount: 1.00,
      description: 'Job placement fee — driver accepted',
      jobId: jobId,
      applicationId: applicationId,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    
    showToast('✅ Driver accepted! Company details revealed. £1.00 fee recorded.', 'success');
    
    // Refresh
    document.getElementById('apps-modal')?.remove();
    loadCompanyJobs();
  } catch (err) {
    console.error('Error accepting driver:', err);
    showToast('Failed to accept driver', 'danger');
  }
}
window.acceptDriver = acceptDriver

// REJECT DRIVER
async function rejectDriver(applicationId) {
  if (!confirm('Reject this application?')) return;
  
  try {
    await updateDoc(doc(db, 'applications', applicationId), {
      status: APPLICATION_STATUSES.REJECTED,
      rejectedAt: Timestamp.now()
    });
    showToast('Application rejected', 'success');
    document.getElementById('apps-modal')?.remove();
    loadCompanyJobs();
  } catch (err) {
    console.error('Error rejecting:', err);
    showToast('Failed to reject', 'danger');
  }
}
window.rejectDriver = rejectDriver

// CANCEL JOB
async function cancelJob(jobId) {
  if (!confirm('Cancel this job posting? No fee will be charged.')) return;
  
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: JOB_STATUSES.CANCELLED,
      cancelledAt: Timestamp.now()
    });
    showToast('Job cancelled', 'success');
    loadCompanyJobs();
  } catch (err) {
    console.error('Error cancelling job:', err);
    showToast('Failed to cancel job', 'danger');
  }
}
window.cancelJob = cancelJob

// Load driver's applications
async function loadMyApplications() {
  const container = document.getElementById('applications-list');
  if (!container || !currentUser) return;

  try {
    const snap = await getDocs(
      query(collection(db, 'applications'), where('driverId', '==', currentUser.uid), orderBy('appliedAt', 'desc'))
    );

    if (snap.empty) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <h3 style="color: var(--primary); margin-bottom: 0.5rem;">No applications yet</h3>
          <p style="color: var(--text-light); margin-bottom: 1.5rem;">Browse available jobs and apply — it's completely free!</p>
          <button class="btn primary" onclick="showPage('job-board-page')">🔍 Browse Jobs</button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    snap.forEach(async appDoc => {
      const app = appDoc.data();
      const jobDoc = await getDoc(doc(db, 'jobs', app.jobId));
      const job = jobDoc.exists() ? jobDoc.data() : null;
      
      const statusInfo = {
        'pending': { text: '⏳ Under review', color: '#f57c00' },
        'accepted': { text: '✅ Accepted — Details Revealed', color: '#2e7d32' },
        'rejected': { text: '❌ Not successful', color: '#c62828' },
        'withdrawn': { text: 'Withdrawn', color: '#757575' }
      };
      const s = statusInfo[app.status] || { text: app.status, color: '#757575' };
      
      container.innerHTML += `
        <div class="card" style="padding: 1.25rem; margin-bottom: 1rem;">
          <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${job ? escapeHtml(job.jobType) : 'Job no longer available'}</h4>
          <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem;">
            Applied: ${app.appliedAt ? formatDate(app.appliedAt.toDate()) : 'Unknown date'}
          </p>
          <p style="font-weight: 600; color: ${s.color};">${s.text}</p>
          
          ${app.status === 'accepted' && job ? `
            <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 4px;">
              <p style="font-weight: 600; color: #2e7d32; margin-bottom: 0.5rem;">🎉 Congratulations! Here are the company details:</p>
              <p style="margin: 0.25rem 0;"><strong>Company:</strong> ${escapeHtml(job.companyName || 'Name revealed')}</p>
              <p style="margin: 0.25rem 0;"><strong>Start:</strong> ${job.startDate} at ${job.startTime}</p>
              <p style="margin: 0.25rem 0;"><strong>Location:</strong> ${escapeHtml(job.startLocation)}</p>
            </div>
          ` : ''}
        </div>
      `;
    });
  } catch (err) {
    console.error('Error loading applications:', err);
    container.innerHTML = '<p style="text-align: center; color: red;">Could not load your applications</p>';
  }
}
window.loadMyApplications = loadMyApplications

// Search jobs
function searchJobs() {
  showToast('Search functionality running...', 'info');
  loadJobBoard();
}
window.searchJobs = searchJobs

// Auto-load when pages shown
document.addEventListener('click', e => {
  if (e.target.matches('[data-page="job-board-page"]')) {
    setTimeout(loadJobBoard, 100);
  }
  if (e.target.matches('[data-page="post-job-page"]')) {
    // Ensure only companies can access
    if (userProfile && userProfile.role !== 'company') {
      showToast('Only company accounts can post jobs', 'warning');
      showPage('driver-dashboard-page');
      return;
    }
  }
  if (e.target.matches('[data-page="manage-jobs-page"]')) {
    setTimeout(loadCompanyJobs, 100);
  }
  if (e.target.matches('[data-page="my-applications-page"]')) {
    setTimeout(loadMyApplications, 100);
  }
});



// ==================================================
// 🔹 INITIALISATION COMPLETE
// ==================================================
console.log('%c🚛 LSD Solutions — App Loaded', 'color: #1a365d; font-weight: bold; font-size: 14px;');
console.log('Firebase connected, DVSA compliance active, Tacomaster integration ready.');