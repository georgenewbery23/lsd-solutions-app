// ==================================================
// 🚛 LSD SOLUTIONS — COMPLETE PRODUCTION app.js
// Firebase v10.7.1 | DVSA Compliant | Tacomaster API Integrated
// Full Build — October 2026
// ==================================================
'use strict';

// ==================================================
// 🔧 FIREBASE CONFIGURATION — UPDATE WITH YOUR VALUES
// ==================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  EmailAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const FIREBASE_CONFIG = {   // ← ALL CAPS, underscores
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  databaseURL: "https://lsd-solutions-default-rtdb.firebaseio.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.firebasestorage.app",
  messagingSenderId: "833767217116",
  appId: "1:833767217116:web:b29188de76b5778a086119",
  measurementId: "G-7YF4T8BBPT"
};

// ==================================================
// ⚙️ INITIALIZE FIREBASE
// ==================================================
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==================================================
// 🛠️ UTILITIES
// ==================================================
let currentUser = null;
let userProfile = null;

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 4000);
}

// ==================================================
// 🔐 AUTHENTICATION — Page Switching
// ==================================================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }
}
window.showPage = showPage;

function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('active', form.id.includes(tabName));
  });
}
window.switchAuthTab = switchAuthTab;

// ==================================================
// 🔐 SIGN IN
// ==================================================
async function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  
  if (!email || !password) {
    showToast('Please enter email and password', 'warning');
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Auth state listener handles redirection
  } catch (err) {
    console.error('Sign in error:', err);
    let msg = 'Sign in failed';
    switch (err.code) {
      case 'auth/user-not-found': msg = 'No account found with this email'; break;
      case 'auth/wrong-password': msg = 'Incorrect password'; break;
      case 'auth/invalid-email': msg = 'Invalid email address'; break;
      case 'auth/user-disabled': msg = 'This account has been disabled'; break;
    }
    showToast(msg, 'error');
  }
}
window.handleSignIn = handleSignIn;

// ==================================================
// 🔐 REGISTER
// ==================================================
async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  
  if (!name || !email || !password || !role) {
    showToast('Please complete all fields', 'warning');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'warning');
    return;
  }
  
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = cred.user;
    
    // Create profile document
    const profileData = {
      name,
      email,
      role,
      createdAt: Timestamp.now(),
      companyId: role === 'company' ? cred.user.uid : null,
      employmentType: role === 'driver' ? null : 'company'
    };
    
    await setDoc(doc(db, role === 'company' ? 'companies' : 'drivers', cred.user.uid), profileData);
    
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    
    showToast('Account created! Check your email to verify ✅');
    // Auth listener will redirect
  } catch (err) {
    console.error('Registration error:', err);
    let msg = 'Registration failed';
    switch (err.code) {
      case 'auth/email-already-in-use':
        msg = 'This email is already registered — try signing in';
        break;
      case 'auth/invalid-email': msg = 'Invalid email address'; break;
      case 'auth/operation-not-allowed': msg = 'Account creation not enabled'; break;
      case 'auth/weak-password': msg = 'Please use a stronger password'; break;
    }
    showToast(msg, 'error');
  }
}
window.handleRegister = handleRegister;

// ==================================================
// 🔐 PASSWORD RESET
// ==================================================
async function handlePasswordReset(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email').value.trim();
  
  if (!email) {
    showToast('Please enter your email', 'warning');
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Reset link sent — check your email ✅');
    showPage('auth-page');
    switchAuthTab('signin');
  } catch (err) {
    console.error('Reset error:', err);
    showToast('Email not found or invalid', 'error');
  }
}
window.handlePasswordReset = handlePasswordReset;

// ==================================================
// 🔐 SIGN OUT
// ==================================================
async function handleSignOut() {
  try {
    await signOut(auth);
    currentUser = null;
    userProfile = null;
    showToast('Signed out');
    showPage('auth-page');
  } catch (err) {
    console.error('Sign out error:', err);
    showToast('Sign out failed', 'error');
  }
}
window.handleSignOut = handleSignOut;

// ==================================================
// 🔐 AUTH STATE WATCHER — ROUTING
// ==================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    userProfile = null;
    showPage('auth-page');
    return;
  }
  
  currentUser = user;
  
  try {
    // Try driver profile first
    let snap = await getDoc(doc(db, 'drivers', user.uid));
    if (snap.exists()) {
      userProfile = snap.data();
      userProfile.uid = user.uid;
      
      // Update UI
      const nameEl = document.getElementById('driver-user-name');
      if (nameEl) nameEl.textContent = escapeHtml(userProfile.name || 'Driver');
      
      showPage('driver-dashboard-page');
      const dashName = document.getElementById('driver-dash-name');
      if (dashName) dashName.textContent = escapeHtml(userProfile.name || 'Driver');
      loadDriverRecentActivity();
      return;
    }
    
    // Try company profile
    snap = await getDoc(doc(db, 'companies', user.uid));
    if (snap.exists()) {
      userProfile = snap.data();
      userProfile.uid = user.uid;
      
      const nameEl = document.getElementById('company-user-name');
      if (nameEl) nameEl.textContent = escapeHtml(userProfile.name || 'Company');
      
      showPage('company-dashboard-page');
      const dashName = document.getElementById('company-dash-name');
      if (dashName) dashName.textContent = escapeHtml(userProfile.name || 'Company');
      loadCompanyStats();
      loadCompanyActivity();
      return;
    }
    
    // No profile found — offer recovery
    showPage('auth-page');
    showToast('Profile not found — please register', 'warning');
    
  } catch (err) {
    console.error('Auth routing error:', err);
    showPage('auth-page');
  }
});
// ==================================================
// 👤 DRIVER PROFILE
// ==================================================
async function loadDriverProfile() {
  if (!userProfile) return;
  
  document.getElementById('profile-name').value = userProfile.name || '';
  document.getElementById('profile-email').value = userProfile.email || '';
  document.getElementById('profile-phone').value = userProfile.phone || '';
  document.getElementById('profile-location').value = userProfile.location || '';
  document.getElementById('profile-licence-number').value = userProfile.licenceNumber || '';
  document.getElementById('profile-licence-expiry').value = userProfile.licenceExpiry || '';
  document.getElementById('profile-cpc-expiry').value = userProfile.cpcExpiry || '';
  document.getElementById('profile-tacho-expiry').value = userProfile.tachoExpiry || '';
  document.getElementById('profile-licence-category').value = userProfile.licenceCategory || '';
  document.getElementById('profile-employment-type').value = userProfile.employmentType || '';
  
  toggleEmployerField();
  document.getElementById('profile-employer').value = userProfile.employer || '';
  
  const nameEl = document.getElementById('profile-user-name');
  if (nameEl) nameEl.textContent = escapeHtml(userProfile.name || 'User');
}
window.loadDriverProfile = loadDriverProfile;

function toggleEmployerField() {
  const type = document.getElementById('profile-employment-type').value;
  document.getElementById('employer-field').style.display = type === 'employee' ? 'block' : 'none';
}
window.toggleEmployerField = toggleEmployerField;

async function saveDriverProfile() {
  if (!currentUser) return;
  
  const data = {
    name: document.getElementById('profile-name').value.trim(),
    phone: document.getElementById('profile-phone').value.trim(),
    location: document.getElementById('profile-location').value.trim(),
    licenceNumber: document.getElementById('profile-licence-number').value.trim(),
    licenceExpiry: document.getElementById('profile-licence-expiry').value,
    cpcExpiry: document.getElementById('profile-cpc-expiry').value,
    tachoExpiry: document.getElementById('profile-tacho-expiry').value,
    licenceCategory: document.getElementById('profile-licence-category').value,
    employmentType: document.getElementById('profile-employment-type').value,
    employer: document.getElementById('profile-employer').value.trim()
  };
  
  try {
    await updateDoc(doc(db, 'drivers', currentUser.uid), data);
    userProfile = { ...userProfile, ...data };
    showToast('Profile saved ✅');
    loadDriverProfile();
  } catch (err) {
    console.error('Save profile error:', err);
    showToast('Failed to save profile', 'error');
  }
}
window.saveDriverProfile = saveDriverProfile;

// ==================================================
// 📅 DRIVER CALENDAR / AVAILABILITY
// ==================================================
let currentCalendarDate = new Date();
let selectedCalendarDay = null;
let calendarData = {};

async function loadDriverCalendar() {
  renderCalendar();
  if (!userProfile) return;
  
  try {
    const snap = await getDoc(doc(db, 'driverAvailability', currentUser.uid));
    if (snap.exists()) {
      calendarData = snap.data() || {};
    }
  } catch (err) {
    console.error('Load calendar error:', err);
  }
}
window.loadDriverCalendar = loadDriverCalendar;

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthLabel = document.getElementById('calendar-month-year');
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  monthLabel.textContent = new Date(year, month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  let html = '';
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  dayNames.forEach(d => html += `<div style="text-align:center;font-weight:bold;padding:0.5rem 0;font-size:0.8rem;">${d}</div>`);
  
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day" style="visibility:hidden;"></div>';
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    const status = calendarData[dateKey] || '';
    
    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${status}" 
           onclick="selectCalendarDay(${day}, '${dateKey}')">
        ${day}
      </div>
    `;
  }
  
  grid.innerHTML = html;
}

function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}
window.changeMonth = changeMonth;

function selectCalendarDay(day, dateKey) {
  selectedCalendarDay = { day, dateKey };
  document.getElementById('selected-day-display').textContent = 
    `Selected: ${new Date(dateKey).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`;
  document.getElementById('day-status-buttons').style.display = 'flex';
}
window.selectCalendarDay = selectCalendarDay;

async function setDayStatus(status) {
  if (!selectedCalendarDay || !currentUser) return;
  
  calendarData[selectedCalendarDay.dateKey] = status;
  
  try {
    await setDoc(doc(db, 'driverAvailability', currentUser.uid), calendarData, { merge: true });
    showToast('Availability updated ✅');
    renderCalendar();
  } catch (err) {
    console.error('Save availability error:', err);
    showToast('Failed to save', 'error');
  }
}
window.setDayStatus = setDayStatus;

// ==================================================
// ✅ DAILY WALKAROUND CHECKLIST
// ==================================================
const DEFAULT_CHECKLIST_ITEMS = [
  { category: 'Exterior', items: [
    'Lights and indicators working', 'Tyres correct pressure & condition', 'Wheel nuts secure', 
    'Mirrors clean & secure', 'Windows & wipers condition', 'Bodywork secure & no damage', 
    'Number plates clean & legible', 'Brakes operational & no leaks'
  ]},
  { category: 'Interior / Cab', items: [
    'Seat belts secure & in good condition', 'Horn working', 'All gauges & instruments functioning',
    'Fire extinguisher present & valid', 'First aid kit present', 'Warning triangles on board',
    'Tachograph working & calibrated', 'Seats secure & adjustments work'
  ]},
  { category: 'Coupling & Trailer', items: [
    'Fifth wheel properly secured', 'Air lines & electrical connections secure & free from damage',
    'Landing legs function correctly', 'Trailer brakes apply correctly', 'All lights connected & working'
  ]},
  { category: 'Documentation', items: [
    'Vehicle documents present', 'Insurance valid & in cab', 'Operator licence disc displayed',
    'Driver hours records available'
  ]}
];

async function loadChecklist() {
  const container = document.getElementById('checklist-items');
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    // Load company custom checklist or use default
    let checklist = DEFAULT_CHECKLIST_ITEMS;
    if (userProfile?.companyId) {
      const snap = await getDoc(doc(db, 'checklistConfig', userProfile.companyId));
      if (snap.exists() && snap.data().items) {
        checklist = snap.data().items;
      }
    }
    
    let html = '';
    checklist.forEach(section => {
      html += `<div style="margin-bottom:1.25rem;"><h4 style="color:var(--primary);margin-bottom:0.5rem;">${escapeHtml(section.category)}</h4>`;
      section.items.forEach((item, idx) => {
        const inputId = `check-item-${section.category}-${idx}`.replace(/\W/g,'_');
        html += `
          <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid #f0f0f0;">
            <input type="checkbox" id="${inputId}" name="${inputId}" required style="margin-top:0.25rem;">
            <label for="${inputId}" style="font-size:0.95rem;">${escapeHtml(item)}</label>
          </div>
        `;
      });
      html += '</div>';
    });
    
    container.innerHTML = html;
    loadChecklistHistory();
    
  } catch (err) {
    console.error('Load checklist error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load checklist</p>';
  }
}
window.loadChecklist = loadChecklist;

async function submitChecklist(event) {
  event.preventDefault();
  
  const vrm = document.getElementById('checklist-vrm').value.trim();
  const trailer = document.getElementById('checklist-trailer').value.trim() || null;
  const comments = document.getElementById('checklist-comments').value.trim();
  
  if (!vrm) {
    showToast('Enter vehicle registration', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'checklistSubmissions'), {
      driverId: currentUser.uid,
      driverName: userProfile.name,
      companyId: userProfile.companyId || null,
      vrm,
      trailerNumber: trailer,
      comments,
      submittedAt: Timestamp.now(),
      status: 'compliant'
    });
    
    showToast('Inspection submitted ✅ DVSA record created');
    document.getElementById('checklist-form').reset();
    loadChecklistHistory();
    
  } catch (err) {
    console.error('Submit error:', err);
    showToast('Failed to submit', 'error');
  }
}
window.submitChecklist = submitChecklist;

async function loadChecklistHistory() {
  const container = document.getElementById('checklist-history');
  if (!currentUser) return;
  
  try {
    const snap = await getDocs(query(
      collection(db, 'checklistSubmissions'),
      where('driverId', '==', currentUser.uid),
      orderBy('submittedAt', 'desc'),
      limit(10)
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No previous inspections found</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const data = d.data();
      const date = data.submittedAt?.toDate() 
        ? data.submittedAt.toDate().toLocaleDateString('en-GB') 
        : 'Unknown';
      return `
        <div style="padding:0.5rem 0;border-bottom:1px solid #eee;">
          <strong>${escapeHtml(data.vrm)}</strong> — ${date}
          <span class="badge success" style="margin-left:0.5rem;">✓ Compliant</span>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('History error:', err);
    container.innerHTML = '<p class="muted">Could not load history</p>';
  }
}

// ==================================================
// 📁 DRIVER DOCUMENTS
// ==================================================
async function loadDriverDocuments() {
  const container = document.getElementById('docs-list');
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const snap = await getDocs(query(
      collection(db, 'driverDocuments'),
      where('driverId', '==', currentUser.uid),
      orderBy('uploadedAt', 'desc')
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No documents uploaded yet</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const doc = d.data();
      const expiry = doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('en-GB') : 'No expiry';
      return `
        <div style="padding:0.75rem;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${escapeHtml(doc.type || 'Document')}</strong>
            <p class="muted" style="margin:0.25rem 0;">Expires: ${expiry}</p>
          </div>
          <a href="${escapeHtml(doc.url)}" target="_blank" class="btn secondary" style="padding:0.4rem 0.7rem;font-size:0.85rem;">View</a>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load docs error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load documents</p>';
  }
}
window.loadDriverDocuments = loadDriverDocuments;

async function uploadDriverDocument() {
  const type = document.getElementById('doc-type').value;
  const expiry = document.getElementById('doc-expiry').value;
  const file = document.getElementById('doc-file').files[0];
  
  if (!type || !file) {
    showToast('Select document type and file', 'warning');
    return;
  }
  
  try {
    const fileRef = ref(storage, `driver-docs/${currentUser.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    
    await addDoc(collection(db, 'driverDocuments'), {
      driverId: currentUser.uid,
      type,
      expiryDate: expiry || null,
      url,
      name: file.name,
      uploadedAt: Timestamp.now()
    });
    
    showToast('Document uploaded ✅');
    document.getElementById('doc-type').value = '';
    document.getElementById('doc-expiry').value = '';
    document.getElementById('doc-file').value = '';
    loadDriverDocuments();
    
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Upload failed', 'error');
  }
}
window.uploadDriverDocument = uploadDriverDocument;

// ==================================================
// 🏝️ HOLIDAY / TIME OFF REQUESTS
// ==================================================
async function loadHolidayRequests() {
  const container = document.getElementById('holiday-requests-list');
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const snap = await getDocs(query(
      collection(db, 'holidayRequests'),
      where('driverId', '==', currentUser.uid),
      orderBy('startDate', 'desc')
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No requests submitted yet</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const req = d.data();
      const start = new Date(req.startDate).toLocaleDateString('en-GB');
      const end = new Date(req.endDate).toLocaleDateString('en-GB');
      const statusClass = req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning';
      return `
        <div style="padding:0.75rem;border-bottom:1px solid #eee;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <strong>${start} to ${end}</strong>
              <p class="muted" style="margin:0.25rem 0;">${escapeHtml(req.notes || '')}</p>
            </div>
            <span class="badge ${statusClass}">${req.status}</span>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load holidays error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load requests</p>';
  }
}
window.loadHolidayRequests = loadHolidayRequests;

async function submitHolidayRequest() {
  const start = document.getElementById('holiday-start').value;
  const end = document.getElementById('holiday-end').value;
  const notes = document.getElementById('holiday-notes').value.trim();
  
  if (!start || !end) {
    showToast('Select start and end dates', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'holidayRequests'), {
      driverId: currentUser.uid,
      driverName: userProfile.name,
      companyId: userProfile.companyId || null,
      startDate: start,
      endDate: end,
      notes,
      status: 'pending',
      submittedAt: Timestamp.now()
    });
    
    showToast('Request submitted ✅ Pending approval');
    document.getElementById('holiday-start').value = '';
    document.getElementById('holiday-end').value = '';
    document.getElementById('holiday-notes').value = '';
    loadHolidayRequests();
    
  } catch (err) {
    console.error('Submit holiday error:', err);
    showToast('Failed to submit', 'error');
  }
}
window.submitHolidayRequest = submitHolidayRequest;

// ==================================================
// 📊 DRIVER RECENT ACTIVITY
// ==================================================
async function loadDriverRecentActivity() {
  const container = document.getElementById('driver-recent-activity');
  if (!container || !currentUser) return;
  
  try {
    const snap = await getDocs(query(
      collection(db, 'checklistSubmissions'),
      where('driverId', '==', currentUser.uid),
      orderBy('submittedAt', 'desc'),
      limit(5)
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No recent activity — complete your first checklist!</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const data = d.data();
      const date = data.submittedAt?.toDate() 
        ? data.submittedAt.toDate().toLocaleDateString('en-GB') 
        : 'Unknown';
      return `<p>✅ ${date} — Daily Check: ${escapeHtml(data.vrm)}</p>`;
    }).join('');
    
  } catch (err) {
    console.error('Activity error:', err);
    container.innerHTML = '<p class="muted">Could not load activity</p>';
  }
}
// ==================================================
// 🏢 COMPANY PORTAL — DASHBOARD STATS & ACTIVITY
// ==================================================
async function loadCompanyStats() {
  if (!userProfile) return;
  
  try {
    // Count drivers
    const driversSnap = await getDocs(collection(db, 'drivers'));
    document.getElementById('stat-drivers').textContent = driversSnap.size;
    
    // Count vehicles
    const vehiclesSnap = await getDocs(query(
      collection(db, 'vehicles'),
      where('companyId', '==', currentUser.uid)
    ));
    document.getElementById('stat-vehicles').textContent = vehiclesSnap.size;
    
    // Count open defects
    const defectsSnap = await getDocs(query(
      collection(db, 'defects'),
      where('companyId', '==', currentUser.uid),
      where('status', '==', 'open')
    ));
    document.getElementById('stat-defects').textContent = defectsSnap.size;
    
    // Count expiring documents
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const docsSnap = await getDocs(collection(db, 'driverDocuments'));
    let alertCount = 0;
    docsSnap.forEach(doc => {
      const data = doc.data();
      if (data.expiryDate) {
        const expiry = new Date(data.expiryDate);
        if (expiry <= thirtyDays) alertCount++;
      }
    });
    document.getElementById('stat-alerts').textContent = alertCount;
    
  } catch (err) {
    console.error('Load stats error:', err);
  }
}
window.loadCompanyStats = loadCompanyStats;

async function loadCompanyActivity() {
  const container = document.getElementById('company-activity');
  if (!container || !currentUser) return;
  
  try {
    const snap = await getDocs(query(
      collection(db, 'checklistSubmissions'),
      where('companyId', '==', currentUser.uid),
      orderBy('submittedAt', 'desc'),
      limit(8)
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No recent activity</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const data = d.data();
      const date = data.submittedAt?.toDate() 
        ? data.submittedAt.toDate().toLocaleDateString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) 
        : 'Unknown';
      return `<p>✅ ${date} — ${escapeHtml(data.driverName || 'Driver')}: ${escapeHtml(data.vrm)}</p>`;
    }).join('');
    
  } catch (err) {
    console.error('Company activity error:', err);
    container.innerHTML = '<p class="muted">Could not load activity</p>';
  }
}
window.loadCompanyActivity = loadCompanyActivity;

// ==================================================
// 🏢 COMPANY PROFILE
// ==================================================
async function loadCompanyProfile() {
  if (!userProfile) return;
  
  document.getElementById('company-name').value = userProfile.name || '';
  document.getElementById('company-licence').value = userProfile.licenceNumber || '';
  document.getElementById('company-licence-type').value = userProfile.licenceType || 'standard-national';
  document.getElementById('company-auth-vehicles').value = userProfile.authorisedVehicles || '';
  document.getElementById('company-auth-trailers').value = userProfile.authorisedTrailers || '';
  document.getElementById('company-tm-name').value = userProfile.transportManager || '';
  document.getElementById('company-email').value = userProfile.email || '';
  
  // Load saved API key (masked)
  try {
    const snap = await getDoc(doc(db, 'companySettings', currentUser.uid));
    if (snap.exists()) {
      const settings = snap.data();
      if (settings.tacomasterApiKey) {
        document.getElementById('tacomaster-api-key').placeholder = '••••••••••••••••••••••••••••••••';
      }
    }
  } catch (e) {}
}
window.loadCompanyProfile = loadCompanyProfile;

async function saveCompanyProfile() {
  if (!currentUser) return;
  
  const data = {
    name: document.getElementById('company-name').value.trim(),
    licenceNumber: document.getElementById('company-licence').value.trim(),
    licenceType: document.getElementById('company-licence-type').value,
    authorisedVehicles: parseInt(document.getElementById('company-auth-vehicles').value) || 0,
    authorisedTrailers: parseInt(document.getElementById('company-auth-trailers').value) || 0,
    transportManager: document.getElementById('company-tm-name').value.trim()
  };
  
  try {
    await updateDoc(doc(db, 'companies', currentUser.uid), data);
    userProfile = { ...userProfile, ...data };
    showToast('Company profile saved ✅');
    loadCompanyProfile();
    loadCompanyStats();
  } catch (err) {
    console.error('Save company error:', err);
    showToast('Failed to save profile', 'error');
  }
}
window.saveCompanyProfile = saveCompanyProfile;

// ==================================================
// 📡 TACOMASTER API — REAL INTEGRATION
// ==================================================
const TACOMASTER_CONFIG = {
  BASE_URL: 'https://api.tacomaster.com/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 2
};

async function getTacomasterApiKey() {
  try {
    const snap = await getDoc(doc(db, 'companySettings', currentUser.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data.tacomasterApiKey || null;
  } catch (e) {
    console.error('Failed to get Tacomaster key:', e);
    return null;
  }
}

async function tacomasterRequest(endpoint, options = {}) {
  const apiKey = await getTacomasterApiKey();
  if (!apiKey) {
    throw new Error('Tacomaster API key not configured — please set in Company Profile');
  }

  const url = `${TACOMASTER_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TACOMASTER_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      ...options
    });

    clearTimeout(timeoutId);

    if (response.status === 401) throw new Error('Invalid API key — please check and re-save');
    if (response.status === 403) throw new Error('Access denied — your Tacomaster account may need API access enabled');
    if (response.status === 429) throw new Error('Rate limited — please try again later');
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Request timed out — please try again');
    throw err;
  }
}

async function saveTacomasterKey() {
  const keyInput = document.getElementById('tacomaster-api-key');
  const statusEl = document.getElementById('tacomaster-status');
  const key = keyInput?.value.trim();
  
  if (!key) {
    if (statusEl) statusEl.innerHTML = '<span style="color:orange;">⚠ Enter an API key first</span>';
    return;
  }

  try {
    await setDoc(doc(db, 'companySettings', currentUser.uid), {
      tacomasterApiKey: key,
      tacomasterConnected: true,
      tacomasterConnectedAt: Timestamp.now()
    }, { merge: true });
    
    if (statusEl) statusEl.innerHTML = '<span style="color:green;">✅ Key saved securely</span>';
    showToast('Tacomaster API key saved ✅', 'success');
    keyInput.value = '';
    keyInput.placeholder = '••••••••••••••••••••••••••••••••';
  } catch (err) {
    console.error('Save key error:', err);
    if (statusEl) statusEl.innerHTML = '<span style="color:red;">❌ Failed to save key</span>';
    showToast('Failed to save key', 'danger');
  }
}
window.saveTacomasterKey = saveTacomasterKey;

async function testTacomasterConnection() {
  const statusEl = document.getElementById('tacomaster-status');
  if (statusEl) statusEl.innerHTML = '<span>🔍 Testing connection...</span>';
  
  try {
    const accountData = await tacomasterRequest('/account');
    
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:green;">✅ Connected — Account: ${escapeHtml(accountData.name || 'Verified')}</span>`;
    }
    
    await setDoc(doc(db, 'companySettings', currentUser.uid), {
      tacomasterLastVerified: Timestamp.now(),
      tacomasterAccountId: accountData.id || null
    }, { merge: true });
    
    showToast('Tacomaster connection verified ✅', 'success');
    setTimeout(() => syncTacomasterData(), 1000);
    
  } catch (err) {
    console.error('Tacomaster connection test failed:', err);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:red;">❌ ${err.message}</span>`;
    }
    showToast(`Connection failed: ${err.message}`, 'danger');
  }
}
window.testTacomasterConnection = testTacomasterConnection;

async function syncTacomasterData() {
  const statusEl = document.getElementById('tacomaster-sync-status') || document.getElementById('tacomaster-status');
  if (statusEl) statusEl.innerHTML = '<span>🔄 Syncing tachograph data...</span>';
  
  try {
    const driversData = await tacomasterRequest('/drivers');
    const drivers = driversData.data || driversData || [];
    
    const vehiclesData = await tacomasterRequest('/vehicles');
    const vehicles = vehiclesData.data || vehiclesData || [];
    
    const activityData = await tacomasterRequest('/driver-hours/recent');
    const driverHours = activityData.data || activityData || [];
    
    const infringementsData = await tacomasterRequest('/infringements');
    const infringements = infringementsData.data || infringementsData || [];
    
    const filesData = await tacomasterRequest('/downloads/status');
    const fileStatus = filesData.data || filesData || {};

    const syncTime = Timestamp.now();
    
    await setDoc(doc(db, 'tacomasterSync', currentUser.uid), {
      lastSynced: syncTime,
      driverCount: drivers.length,
      vehicleCount: vehicles.length,
      totalInfringements: infringements.length,
      drivers,
      vehicles,
      driverHours,
      infringements,
      fileStatus,
      retentionPolicy: '2 years + 10%'
    });

    await setDoc(doc(db, 'companySettings', currentUser.uid), {
      tacomasterLastSync: syncTime,
      tacomasterDriverCount: drivers.length,
      tacomasterVehicleCount: vehicles.length,
      tacomasterOpenInfringements: infringements.filter(i => !i.resolved).length
    }, { merge: true });

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:green;">✅ Sync complete — ${drivers.length} drivers, ${vehicles.length} vehicles, ${infringements.length} infringements</span>`;
    }
    
    showToast(`Tachograph data synced ✅ ${drivers.length} drivers`, 'success');
    
    if (document.getElementById('compliance-page')?.classList.contains('active')) {
      loadComplianceOverview();
    }

  } catch (err) {
    console.error('Tacomaster sync failed:', err);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:red;">❌ Sync failed: ${err.message}</span>`;
    }
    showToast(`Sync failed: ${err.message}`, 'danger');
  }
}
window.syncTacomasterData = syncTacomasterData;

async function loadTacomasterDashboard() {
  const container = document.getElementById('tacomaster-dashboard');
  if (!container) return;
  
  container.innerHTML = '<p>Loading tachograph data...</p>';
  
  try {
    const snap = await getDoc(doc(db, 'tacomasterSync', currentUser.uid));
    
    if (!snap.exists()) {
      container.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <h3>No data synced yet</h3>
          <p>Connect your Tacomaster API key in Company Profile to start pulling tachograph data.</p>
          <button class="btn primary" onclick="showPage('company-profile-page')">Go to Profile →</button>
        </div>
      `;
      return;
    }
    
    const data = snap.data();
    const lastSync = data.lastSynced?.toDate() 
      ? new Date(data.lastSynced.toDate()).toLocaleString('en-GB') 
      : 'Never';
    const openInfringements = data.infringements?.filter(i => !i.resolved) || [];
    
    container.innerHTML = `
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div class="card">
          <h4>👤 Drivers Monitored</h4>
          <p style="font-size:2rem;font-weight:bold;margin:0;">${data.driverCount || 0}</p>
        </div>
        <div class="card">
          <h4>🚛 Vehicles Linked</h4>
          <p style="font-size:2rem;font-weight:bold;margin:0;">${data.vehicleCount || 0}</p>
        </div>
        <div class="card ${openInfringements.length > 0 ? 'card-border-warning' : 'card-border-success'}">
          <h4>⚠️ Open Infringements</h4>
          <p style="font-size:2rem;font-weight:bold;margin:0;">${openInfringements.length}</p>
        </div>
      </div>
      
      <div class="card">
        <p class="muted">Last synced: ${lastSync}</p>
        <button class="btn primary" onclick="syncTacomasterData()">🔄 Sync Now</button>
      </div>
      
      ${openInfringements.length > 0 ? `
        <div class="card" style="margin-top:1.5rem;">
          <h3>🚨 Unresolved Infringements</h3>
          <p style="color:var(--warning);margin-bottom:1rem;">These require attention to maintain Operator Licence compliance</p>
          <div style="max-height:400px;overflow-y:auto;">
            ${openInfringements.map(i => `
              <div style="padding:0.75rem;border-bottom:1px solid var(--border);">
                <strong>${escapeHtml(i.driverName || 'Unknown Driver')}</strong>
                <p style="margin:0.25rem 0;font-size:0.9rem;">${escapeHtml(i.description || 'Infringement recorded')}</p>
                <span class="badge ${i.severity === 'serious' ? 'danger' : 'warning'}">${i.severity || 'standard'}</span>
                <p class="muted" style="margin-top:0.25rem;">Date: ${i.date || 'Unknown'}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${(data.driverHours || []).length > 0 ? `
        <div class="card" style="margin-top:1.5rem;">
          <h3>📊 Recent Driver Hours</h3>
          <div style="max-height:300px;overflow-y:auto;margin-top:0.5rem;">
            ${data.driverHours.slice(0, 10).map(h => `
              <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);">
                <span>${escapeHtml(h.driverName || 'Unknown')}</span>
                <span>${h.drivingHours ? `${h.drivingHours}h driving` : ''} ${h.restHours ? `${h.restHours}h rest` : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  } catch (err) {
    console.error('Load dashboard error:', err);
    container.innerHTML = `<p style="color:var(--danger);">Failed to load dashboard: ${err.message}</p>`;
  }
}
window.loadTacomasterDashboard = loadTacomasterDashboard;
// ==================================================
// 🚗 VEHICLE MANAGEMENT
// ==================================================
let currentEditingVehicleId = null;

function showAddVehicleModal() {
  currentEditingVehicleId = null;
  document.getElementById('add-vehicle-modal').style.display = 'flex';
  document.getElementById('maint-modal-title').textContent = 'Add Vehicle';
  document.getElementById('vrm').value = '';
  document.getElementById('make-model').value = '';
  document.getElementById('vin').value = '';
  document.getElementById('mot-expiry').value = '';
  document.getElementById('plating-expiry').value = '';
  document.getElementById('inspection-due').value = '';
}
window.showAddVehicleModal = showAddVehicleModal;

function closeAddVehicleModal() {
  document.getElementById('add-vehicle-modal').style.display = 'none';
  currentEditingVehicleId = null;
}
window.closeAddVehicleModal = closeAddVehicleModal;

async function saveVehicle() {
  const vrm = document.getElementById('vrm').value.trim().toUpperCase();
  const makeModel = document.getElementById('make-model').value.trim();
  const vin = document.getElementById('vin').value.trim();
  const motExpiry = document.getElementById('mot-expiry').value;
  const platingExpiry = document.getElementById('plating-expiry').value;
  const inspectionDue = document.getElementById('inspection-due').value;
  
  if (!vrm || !makeModel) {
    showToast('Enter registration and make/model', 'warning');
    return;
  }
  
  try {
    const vehicleData = {
      vrm,
      makeModel,
      vin,
      motExpiry,
      platingExpiry,
      inspectionDue,
      companyId: currentUser.uid,
      updatedAt: Timestamp.now()
    };
    
    if (currentEditingVehicleId) {
      await updateDoc(doc(db, 'vehicles', currentEditingVehicleId), vehicleData);
      showToast('Vehicle updated ✅');
    } else {
      vehicleData.addedAt = Timestamp.now();
      await addDoc(collection(db, 'vehicles'), vehicleData);
      showToast('Vehicle added ✅');
    }
    
    closeAddVehicleModal();
    loadVehicles();
    loadCompanyStats();
    
  } catch (err) {
    console.error('Save vehicle error:', err);
    showToast('Failed to save vehicle', 'error');
  }
}
window.saveVehicle = saveVehicle;

async function loadVehicles() {
  const container = document.getElementById('vehicles-list');
  container.innerHTML = '<p>Loading fleet...</p>';
  
  try {
    const snap = await getDocs(query(
      collection(db, 'vehicles'),
      where('companyId', '==', currentUser.uid),
      orderBy('vrm')
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No vehicles added yet. Click "Add Vehicle" above.</p>';
      return;
    }
    
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    container.innerHTML = snap.docs.map(d => {
      const v = d.data();
      const motExp = v.motExpiry ? new Date(v.motExpiry) : null;
      const motWarning = motExp && motExp <= thirtyDays;
      const motOverdue = motExp && motExp < today;
      
      return `
        <div class="card" style="padding:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <h4 style="margin-bottom:0.3rem;font-size:1.1rem;">${escapeHtml(v.vrm)}</h4>
              <p class="muted" style="margin:0;">${escapeHtml(v.makeModel)}</p>
              ${v.vin ? `<p class="muted" style="margin:0.25rem 0 0 0;font-size:0.8rem;">VIN: ${escapeHtml(v.vin)}</p>` : ''}
            </div>
            <div style="text-align:right;">
              ${motOverdue 
                ? `<span class="badge danger">⚠️ MOT EXPIRED</span>` 
                : motWarning 
                  ? `<span class="badge warning">MOT Due Soon</span>`
                  : `<span class="badge success">✓ MOT Valid</span>`
              }
              ${motExp ? `<p class="muted" style="font-size:0.75rem;margin-top:0.25rem;">Expires: ${motExp.toLocaleDateString('en-GB')}</p>` : ''}
            </div>
          </div>
          <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
            ${v.platingExpiry ? `<span class="info" style="font-size:0.8rem;">Plating: ${new Date(v.platingExpiry).toLocaleDateString('en-GB')}</span>` : ''}
            ${v.inspectionDue ? `<span class="info" style="font-size:0.8rem;">Inspect: ${new Date(v.inspectionDue).toLocaleDateString('en-GB')}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load vehicles error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load vehicles</p>';
  }
}
window.loadVehicles = loadVehicles;

// ==================================================
// 👥 DRIVER MANAGEMENT & SEARCH
// ==================================================
let allDriversList = [];

async function loadDriversList() {
  const container = document.getElementById('drivers-list');
  container.innerHTML = '<p>Loading drivers...</p>';
  
  try {
    const snap = await getDocs(collection(db, 'drivers'));
    allDriversList = [];
    
    snap.forEach(d => {
      const driver = d.data();
      driver.id = d.id;
      allDriversList.push(driver);
    });
    
    filterDrivers();
    
  } catch (err) {
    console.error('Load drivers error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load drivers</p>';
  }
}
window.loadDriversList = loadDriversList;

function filterDrivers() {
  const container = document.getElementById('drivers-list');
  const searchTerm = document.getElementById('driver-search')?.value?.toLowerCase() || '';
  const availabilityFilter = document.getElementById('availability-filter')?.value || 'all';
  
  let filtered = allDriversList;
  
  if (searchTerm) {
    filtered = filtered.filter(d => 
      (d.name?.toLowerCase().includes(searchTerm)) ||
      (d.location?.toLowerCase().includes(searchTerm)) ||
      (d.email?.toLowerCase().includes(searchTerm))
    );
  }
  
  if (availabilityFilter === 'available') {
    const todayKey = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(d => {
      if (!d.availability) return true;
      return d.availability[todayKey] === 'available';
    });
  }
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="muted">No drivers found matching your search</p>';
    return;
  }
  
  container.innerHTML = filtered.map(d => {
    const isSelfEmployed = d.employmentType === 'self-employed';
    return `
      <div class="card" style="padding:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
          <div>
            <h4 style="margin-bottom:0.25rem;">${escapeHtml(d.name || 'Unknown')}</h4>
            <p class="muted" style="margin:0 0 0.5rem 0;">${escapeHtml(d.location || 'Location not set')}</p>
            <span class="badge ${isSelfEmployed ? 'info' : 'success'}">${isSelfEmployed ? 'Self-Employed' : 'Company Driver'}</span>
            ${d.licenceCategory ? `<span class="badge" style="background:var(--primary-light);color:var(--primary);margin-left:0.3rem;">${escapeHtml(d.licenceCategory)}</span>` : ''}
          </div>
          <button class="btn secondary" style="padding:0.4rem 0.7rem;font-size:0.85rem;" onclick="viewDriverProfile('${d.id}')">View Profile</button>
        </div>
      </div>
    `;
  }).join('');
}
window.filterDrivers = filterDrivers;

async function viewDriverProfile(driverId) {
  const driver = allDriversList.find(d => d.id === driverId);
  if (!driver) return;
  
  const todayKey = new Date().toISOString().split('T')[0];
  const availability = driver.availability?.[todayKey] || 'unavailable';
  const isAvailable = availability === 'available';
  
  const expiryChecks = [];
  if (driver.licenceExpiry) {
    const exp = new Date(driver.licenceExpiry);
    expiryChecks.push(`Licence: ${exp.toLocaleDateString('en-GB')}`);
  }
  if (driver.cpcExpiry) {
    const exp = new Date(driver.cpcExpiry);
    expiryChecks.push(`CPC: ${exp.toLocaleDateString('en-GB')}`);
  }
  if (driver.tachoExpiry) {
    const exp = new Date(driver.tachoExpiry);
    expiryChecks.push(`Tacho Card: ${exp.toLocaleDateString('en-GB')}`);
  }
  
  alert(`
📋 ${driver.name}
━━━━━━━━━━━━━━━━━━━━
📍 Location: ${driver.location || 'Not set'}
📧 Email: ${driver.email}
🚛 Licence: ${driver.licenceNumber || 'Not provided'} (${driver.licenceCategory || 'Category not set'})
✅ Available Today: ${isAvailable ? 'YES' : 'NO'}
📄 Expiry Dates: ${expiryChecks.length ? expiryChecks.join(' | ') : 'None recorded'}
  `.trim().replace(/\n/g, '\n'));
}
window.viewDriverProfile = viewDriverProfile;

// ==================================================
// 📋 JOB POSTING MANAGEMENT
// ==================================================
function showPostJobModal() {
  document.getElementById('post-job-modal').style.display = 'flex';
}
window.showPostJobModal = showPostJobModal;

function closePostJobModal() {
  document.getElementById('post-job-modal').style.display = 'none';
  document.getElementById('job-title').value = '';
  document.getElementById('job-description').value = '';
  document.getElementById('job-date').value = '';
  document.getElementById('job-rate').value = '';
}
window.closePostJobModal = closePostJobModal;

async function submitJob() {
  const title = document.getElementById('job-title').value.trim();
  const description = document.getElementById('job-description').value.trim();
  const jobDate = document.getElementById('job-date').value;
  const rate = document.getElementById('job-rate').value.trim();
  
  if (!title || !jobDate) {
    showToast('Enter job title and date', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'postedJobs'), {
      title,
      description,
      jobDate,
      rate,
      companyId: currentUser.uid,
      companyName: userProfile.name,
      status: 'open',
      postedAt: Timestamp.now()
    });
    
    showToast('Job posted ✅');
    closePostJobModal();
    loadJobs();
    
  } catch (err) {
    console.error('Post job error:', err);
    showToast('Failed to post job', 'error');
  }
}
window.submitJob = submitJob;

async function loadJobs() {
  const container = document.getElementById('jobs-list');
  container.innerHTML = '<p>Loading jobs...</p>';
  
  try {
    const snap = await getDocs(query(
      collection(db, 'postedJobs'),
      where('companyId', '==', currentUser.uid),
      orderBy('jobDate', 'desc')
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No jobs posted yet. Click "Post New Job" above.</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const job = d.data();
      const date = job.jobDate ? new Date(job.jobDate).toLocaleDateString('en-GB') : 'Date not set';
      const statusClass = job.status === 'open' ? 'success' : job.status === 'assigned' ? 'info' : 'muted';
      
      return `
        <div class="card" style="padding:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <h4 style="margin-bottom:0.3rem;">${escapeHtml(job.title)}</h4>
              <p class="muted" style="margin:0 0 0.5rem 0;">📅 ${date}${job.rate ? ` | 💷 £${escapeHtml(job.rate)}` : ''}</p>
              ${job.description ? `<p style="font-size:0.9rem;">${escapeHtml(job.description)}</p>` : ''}
            </div>
            <span class="badge ${statusClass}">${job.status}</span>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load jobs error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load jobs</p>';
  }
}
window.loadJobs = loadJobs;
// ==================================================
// 🚗 MAINTENANCE SCHEDULE
// ==================================================
function showAddMaintenanceModal() {
  document.getElementById('maintenance-modal').style.display = 'flex';
  document.getElementById('maint-modal-title').textContent = 'Schedule Maintenance';
  document.getElementById('maint-asset-type').value = '';
  document.getElementById('maint-vehicle-id').style.display = 'none';
  document.getElementById('maint-trailer-id').style.display = 'none';
  document.getElementById('maint-vehicle-id').innerHTML = '<option value="">Select Vehicle</option>';
  document.getElementById('maint-trailer-id').innerHTML = '<option value="">Select Trailer</option>';
  document.getElementById('maint-task').value = '';
  document.getElementById('maint-due-date').value = '';
  document.getElementById('maint-interval').value = '';
  document.getElementById('maint-priority').value = 'routine';
  document.getElementById('maint-notes').value = '';
}
window.showAddMaintenanceModal = showAddMaintenanceModal;

function closeMaintenanceModal() {
  document.getElementById('maintenance-modal').style.display = 'none';
}
window.closeMaintenanceModal = closeMaintenanceModal;

function toggleTrailerField() {
  const type = document.getElementById('maint-asset-type').value;
  document.getElementById('maint-vehicle-id').style.display = type === 'vehicle' ? 'block' : 'none';
  document.getElementById('maint-trailer-id').style.display = type === 'trailer' ? 'block' : 'none';
}
window.toggleTrailerField = toggleTrailerField;

async function saveMaintenanceSchedule() {
  const assetType = document.getElementById('maint-asset-type').value;
  const vehicleId = document.getElementById('maint-vehicle-id').value;
  const trailerId = document.getElementById('maint-trailer-id').value;
  const task = document.getElementById('maint-task').value.trim();
  const dueDate = document.getElementById('maint-due-date').value;
  const interval = document.getElementById('maint-interval').value;
  const priority = document.getElementById('maint-priority').value;
  const notes = document.getElementById('maint-notes').value.trim();
  
  if (!assetType || !task || !dueDate) {
    showToast('Complete required fields', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'maintenance'), {
      companyId: currentUser.uid,
      assetType,
      vehicleId: assetType === 'vehicle' ? vehicleId : null,
      trailerId: assetType === 'trailer' ? trailerId : null,
      task,
      dueDate,
      repeatMonths: interval ? parseInt(interval) : null,
      priority,
      notes,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    
    showToast('Task scheduled ✅');
    closeMaintenanceModal();
    loadMaintenanceSchedule();
    
  } catch (err) {
    console.error('Save maintenance error:', err);
    showToast('Failed to save', 'error');
  }
}
window.saveMaintenanceSchedule = saveMaintenanceSchedule;

async function loadMaintenanceSchedule() {
  const container = document.getElementById('maintenance-list');
  container.innerHTML = '<p>Loading schedule...</p>';
  
  try {
    const snap = await getDocs(query(
      collection(db, 'maintenance'),
      where('companyId', '==', currentUser.uid),
      orderBy('dueDate', 'asc')
    ));
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No maintenance tasks scheduled</p>';
      return;
    }
    
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    container.innerHTML = snap.docs.map(d => {
      const m = d.data();
      const due = new Date(m.dueDate);
      const overdue = due < today && m.status !== 'completed';
      const soon = due <= thirtyDays && due >= today && m.status !== 'completed';
      
      return `
        <div class="card" style="padding:0.85rem;${overdue ? 'border-left:3px solid var(--danger);' : soon ? 'border-left:3px solid var(--warning);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <h4 style="margin-bottom:0.25rem;">${escapeHtml(m.task)}</h4>
              <p class="muted" style="margin:0;">${m.assetType === 'vehicle' ? '🚛 Vehicle' : '🚐 Trailer'}</p>
            </div>
            <div style="text-align:right;">
              <p style="font-weight:500;margin:0;">${due.toLocaleDateString('en-GB')}</p>
              ${overdue ? '<span class="badge danger">⚠️ OVERDUE</span>' : soon ? '<span class="badge warning">Due Soon</span>' : `<span class="badge info">${m.priority}</span>`}
            </div>
          </div>
          ${m.notes ? `<p class="muted" style="margin-top:0.5rem;font-size:0.85rem;">${escapeHtml(m.notes)}</p>` : ''}
          <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
            <button class="btn success" style="padding:0.35rem 0.6rem;font-size:0.8rem;" onclick="completeMaintenanceTask('${d.id}')">✓ Mark Done</button>
            <button class="btn secondary" style="padding:0.35rem 0.6rem;font-size:0.8rem;" onclick="deleteMaintenanceTask('${d.id}')">🗑️ Remove</button>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load maintenance error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load schedule</p>';
  }
}
window.loadMaintenanceSchedule = loadMaintenanceSchedule;

async function completeMaintenanceTask(taskId) {
  try {
    await updateDoc(doc(db, 'maintenance', taskId), {
      status: 'completed',
      completedAt: Timestamp.now()
    });
    showToast('Marked as completed ✅');
    loadMaintenanceSchedule();
  } catch (err) {
    console.error('Complete error:', err);
    showToast('Failed to update', 'error');
  }
}
window.completeMaintenanceTask = completeMaintenanceTask;

async function deleteMaintenanceTask(taskId) {
  if (!confirm('Delete this task?')) return;
  try {
    await deleteDoc(doc(db, 'maintenance', taskId));
    showToast('Task removed');
    loadMaintenanceSchedule();
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Failed to remove', 'error');
  }
}
window.deleteMaintenanceTask = deleteMaintenanceTask;

// ==================================================
// 🔧 DEFECT MANAGEMENT
// ==================================================
function showReportDefectModal() {
  document.getElementById('defect-modal').style.display = 'flex';
  document.getElementById('defect-asset-type').value = '';
  document.getElementById('defect-vehicle').style.display = 'none';
  document.getElementById('defect-trailer').style.display = 'none';
  document.getElementById('defect-description').value = '';
  document.getElementById('defect-photo-preview').innerHTML = '';
}
window.showReportDefectModal = showReportDefectModal;

function closeDefectModal() {
  document.getElementById('defect-modal').style.display = 'none';
}
window.closeDefectModal = closeDefectModal;

function toggleDefectAssetFields() {
  const type = document.getElementById('defect-asset-type').value;
  document.getElementById('defect-vehicle').style.display = type === 'vehicle' ? 'block' : 'none';
  document.getElementById('defect-trailer').style.display = type === 'trailer' ? 'block' : 'none';
}
window.toggleDefectAssetFields = toggleDefectAssetFields;

async function submitDefect() {
  const assetType = document.getElementById('defect-asset-type').value;
  const vehicleId = document.getElementById('defect-vehicle').value;
  const trailerId = document.getElementById('defect-trailer').value;
  const category = document.getElementById('defect-category').value;
  const severity = document.getElementById('defect-severity').value;
  const description = document.getElementById('defect-description').value.trim();
  const photoInput = document.getElementById('defect-photo');
  
  if (!assetType || !category || !description) {
    showToast('Complete required fields', 'warning');
    return;
  }
  
  try {
    let photoUrl = null;
    if (photoInput.files?.length > 0) {
      const file = photoInput.files[0];
      const fileRef = ref(storage, `defects/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      photoUrl = await getDownloadURL(fileRef);
    }
    
    await addDoc(collection(db, 'defects'), {
      companyId: currentUser.uid,
      reportedBy: currentUser.uid,
      reporterName: userProfile.name,
      assetType,
      vehicleId: assetType === 'vehicle' ? vehicleId : null,
      trailerId: assetType === 'trailer' ? trailerId : null,
      category,
      severity,
      description,
      photoUrl,
      status: 'open',
      reportedAt: Timestamp.now()
    });
    
    showToast('Defect reported ✅');
    closeDefectModal();
    loadDefectsList();
    loadCompanyStats();
    
  } catch (err) {
    console.error('Submit defect error:', err);
    showToast('Failed to report', 'error');
  }
}
window.submitDefect = submitDefect;

async function loadDefectsList() {
  const container = document.getElementById('defects-list');
  container.innerHTML = '<p>Loading defects...</p>';
  
  try {
    const snap = await getDocs(query(
      collection(db, 'defects'),
      where('companyId', '==', currentUser.uid),
      orderBy('reportedAt', 'desc')
    ));
    
    const openCount = snap.docs.filter(d => d.data().status === 'open').length;
    const closedCount = snap.docs.filter(d => d.data().status === 'resolved').length;
    
    const openEl = document.getElementById('defect-count-open');
    const closedEl = document.getElementById('defect-count-closed');
    if (openEl) openEl.textContent = `Open: ${openCount}`;
    if (closedEl) closedEl.textContent = `Closed: ${closedCount}`;
    
    if (snap.empty) {
      container.innerHTML = '<p class="muted">No defects recorded — excellent!</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(d => {
      const def = d.data();
      const date = def.reportedAt?.toDate() 
        ? def.reportedAt.toDate().toLocaleDateString('en-GB') 
        : 'Unknown';
      const statusClass = def.status === 'resolved' ? 'success' : 'danger';
      
      return `
        <div class="card" style="padding:0.85rem;${def.status === 'open' && def.severity === 'immediate' ? 'border-left:4px solid var(--danger);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <span class="badge ${statusClass}" style="margin-bottom:0.5rem;display:inline-block;">${def.status === 'open' ? '🔴 Open' : '✅ Resolved'}</span>
              <h4 style="margin-bottom:0.25rem;">${escapeHtml(def.category)}</h4>
              <p class="muted" style="margin:0;">${escapeHtml(def.assetType || 'Asset')} — ${date}</p>
            </div>
            <span class="badge ${def.severity === 'immediate' ? 'danger' : def.severity === 'major' ? 'warning' : 'info'}">${def.severity}</span>
          </div>
          <p style="margin:0.5rem 0;">${escapeHtml(def.description)}</p>
          ${def.photoUrl ? `<a href="${escapeHtml(def.photoUrl)}" target="_blank" class="btn secondary" style="padding:0.3rem 0.5rem;font-size:0.8rem;">📷 View Photo</a>` : ''}
          ${def.status === 'open' ? `
            <div style="margin-top:0.75rem;">
              <button class="btn success" style="padding:0.4rem 0.7rem;font-size:0.85rem;" onclick="resolveDefect('${d.id}')">✓ Mark Resolved</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load defects error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load defects</p>';
  }
}
window.loadDefectsList = loadDefectsList;

async function resolveDefect(defectId) {
  if (!confirm('Mark this defect as resolved?')) return;
  try {
    await updateDoc(doc(db, 'defects', defectId), {
      status: 'resolved',
      resolvedAt: Timestamp.now()
    });
    showToast('Defect resolved ✅');
    loadDefectsList();
    loadCompanyStats();
  } catch (err) {
    console.error('Resolve error:', err);
    showToast('Failed to update', 'error');
  }
}
window.resolveDefect = resolveDefect;
// ==================================================
// ✅ COMPLIANCE OVERVIEW — DVSA REQUIREMENTS
// ==================================================
async function loadComplianceOverview() {
  const statusBanner = document.getElementById('compliance-status-banner');
  const licenceDetails = document.getElementById('licence-details');
  const docsList = document.getElementById('docs-compliance-list');
  const alertsList = document.getElementById('expiry-alerts');
  const fleetTable = document.getElementById('fleet-compliance-table');
  
  if (!statusBanner || !currentUser) return;
  
  statusBanner.innerHTML = '<p>Checking compliance status...</p>';
  
  try {
    // Load company info
    const companySnap = await getDoc(doc(db, 'companies', currentUser.uid));
    const companyData = companySnap.exists() ? companySnap.data() : null;
    
    if (licenceDetails && companyData) {
      licenceDetails.innerHTML = `
        <p><strong>Licence No:</strong> ${escapeHtml(companyData.licenceNumber || 'Not recorded')}</p>
        <p><strong>Type:</strong> ${escapeHtml(companyData.licenceType || 'Not recorded')}</p>
        <p><strong>Authorised Vehicles:</strong> ${companyData.authorisedVehicles || 0}</p>
        <p><strong>Authorised Trailers:</strong> ${companyData.authorisedTrailers || 0}</p>
        <p><strong>Transport Manager:</strong> ${escapeHtml(companyData.transportManager || 'Not recorded')}</p>
      `;
    }
    
    // Check vehicles for MOT/plating expiry
    const vehiclesSnap = await getDocs(query(
      collection(db, 'vehicles'),
      where('companyId', '==', currentUser.uid)
    ));
    
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const alerts = [];
    const vehicleStatus = [];
    
    vehiclesSnap.forEach(v => {
      const data = v.data();
      const motExp = data.motExpiry ? new Date(data.motExpiry) : null;
      const platingExp = data.platingExpiry ? new Date(data.platingExpiry) : null;
      const inspectDue = data.inspectionDue ? new Date(data.inspectionDue) : null;
      
      let motStatus = 'valid';
      let platingStatus = 'valid';
      let inspectStatus = 'valid';
      
      if (motExp) {
        if (motExp < today) {
          motStatus = 'overdue';
          alerts.push(`🔴 MOT EXPIRED: ${data.vrm} — ${motExp.toLocaleDateString('en-GB')}`);
        } else if (motExp <= thirtyDays) {
          motStatus = 'soon';
          alerts.push(`🟠 MOT Due Soon: ${data.vrm} — ${motExp.toLocaleDateString('en-GB')}`);
        }
      }
      if (platingExp) {
        if (platingExp < today) {
          platingStatus = 'overdue';
          alerts.push(`🔴 Plating Test EXPIRED: ${data.vrm} — ${platingExp.toLocaleDateString('en-GB')}`);
        } else if (platingExp <= ninetyDays) {
          platingStatus = 'soon';
          alerts.push(`🟠 Plating Test Due Soon: ${data.vrm} — ${platingExp.toLocaleDateString('en-GB')}`);
        }
      }
      if (inspectDue) {
        if (inspectDue < today) {
          inspectStatus = 'overdue';
          alerts.push(`🔴 Inspection OVERDUE: ${data.vrm} — ${inspectDue.toLocaleDateString('en-GB')}`);
        } else if (inspectDue <= thirtyDays) {
          inspectStatus = 'soon';
          alerts.push(`🟠 Inspection Due Soon: ${data.vrm} — ${inspectDue.toLocaleDateString('en-GB')}`);
        }
      }
      
      vehicleStatus.push({ vrm: data.vrm, motStatus, platingStatus, inspectStatus });
    });
    
    // Check driver documents
    const docsSnap = await getDocs(collection(db, 'driverDocuments'));
    docsSnap.forEach(d => {
      const doc = d.data();
      if (doc.expiryDate) {
        const exp = new Date(doc.expiryDate);
        if (exp < today) {
          alerts.push(`🔴 Document EXPIRED: ${doc.type} — ${exp.toLocaleDateString('en-GB')}`);
        } else if (exp <= ninetyDays) {
          alerts.push(`🟠 Document Expiring Soon: ${doc.type} — ${exp.toLocaleDateString('en-GB')}`);
        }
      }
    });
    
    // Update banner
    if (alerts.length === 0) {
      statusBanner.innerHTML = `
        <div style="background:#e8f5e9;padding:1rem;border-radius:6px;border-left:4px solid #4caf50;">
          <h3 style="color:#2e7d32;margin:0 0 0.5rem 0;">✅ Operation Appears Compliant</h3>
          <p style="margin:0;">All key documents and inspections are up to date. Keep up the good work!</p>
        </div>
      `;
    } else {
      const critical = alerts.filter(a => a.startsWith('🔴')).length;
      statusBanner.innerHTML = `
        <div style="background:${critical > 0 ? '#ffebee' : '#fff8e1'};padding:1rem;border-radius:6px;border-left:4px solid ${critical > 0 ? '#ef5350' : '#ffc107'};">
          <h3 style="color:${critical > 0 ? '#c62828' : '#f57c00'};margin:0 0 0.5rem 0;">⚠️ ${alerts.length} Compliance Alert${alerts.length !== 1 ? 's' : ''}</h3>
          <p style="margin:0;">${critical > 0 ? '<strong>ACTION REQUIRED:</strong> Critical items need your attention immediately' : 'Some items are approaching their expiry dates'}</p>
        </div>
      `;
    }
    
    // Update alerts list
    if (alertsList) {
      if (alerts.length === 0) {
        alertsList.innerHTML = '<p class="muted">✅ No expiry alerts — all up to date</p>';
      } else {
        alertsList.innerHTML = alerts.map(a => `
          <p style="padding:0.4rem 0;border-bottom:1px solid #eee;margin:0;">${escapeHtml(a)}</p>
        `).join('');
      }
    }
    
    // Fleet table
    if (fleetTable && vehicleStatus.length > 0) {
      fleetTable.innerHTML = `
        <table style="width:100%;border-collapse:collapse;margin-top:0.5rem;">
          <thead>
            <tr style="background:var(--primary-light);">
              <th style="padding:0.5rem;text-align:left;border-bottom:2px solid var(--primary);">VRM</th>
              <th style="padding:0.5rem;text-align:center;border-bottom:2px solid var(--primary);">MOT</th>
              <th style="padding:0.5rem;text-align:center;border-bottom:2px solid var(--primary);">Plating</th>
              <th style="padding:0.5rem;text-align:center;border-bottom:2px solid var(--primary);">Inspection</th>
            </tr>
          </thead>
          <tbody>
            ${vehicleStatus.map(v => `
              <tr>
                <td style="padding:0.4rem;border-bottom:1px solid #eee;"><strong>${escapeHtml(v.vrm)}</strong></td>
                <td style="padding:0.4rem;text-align:center;border-bottom:1px solid #eee;">
                  <span class="badge ${v.motStatus === 'overdue' ? 'danger' : v.motStatus === 'soon' ? 'warning' : 'success'}">
                    ${v.motStatus === 'overdue' ? '⚠️ EXPIRED' : v.motStatus === 'soon' ? 'Due Soon' : '✓ Valid'}
                  </span>
                </td>
                <td style="padding:0.4rem;text-align:center;border-bottom:1px solid #eee;">
                  <span class="badge ${v.platingStatus === 'overdue' ? 'danger' : v.platingStatus === 'soon' ? 'warning' : 'success'}">
                    ${v.platingStatus === 'overdue' ? '⚠️ EXPIRED' : v.platingStatus === 'soon' ? 'Due Soon' : '✓ Valid'}
                  </span>
                </td>
                <td style="padding:0.4rem;text-align:center;border-bottom:1px solid #eee;">
                  <span class="badge ${v.inspectStatus === 'overdue' ? 'danger' : v.inspectStatus === 'soon' ? 'warning' : 'success'}">
                    ${v.inspectStatus === 'overdue' ? '⚠️ OVERDUE' : v.inspectStatus === 'soon' ? 'Due Soon' : '✓ Up to Date'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (fleetTable) {
      fleetTable.innerHTML = '<p class="muted">No vehicles added yet</p>';
    }
    
    // Tacomaster sync status on compliance page
    const syncEl = document.getElementById('tacomaster-sync-status');
    if (syncEl) {
      const syncSnap = await getDoc(doc(db, 'tacomasterSync', currentUser.uid));
      if (syncSnap.exists()) {
        const syncData = syncSnap.data();
        const lastSync = syncData.lastSynced?.toDate() 
          ? syncData.lastSynced.toDate().toLocaleString('en-GB') 
          : 'Never';
        syncEl.innerHTML = `<p class="muted">Last Tacomaster sync: ${lastSync}</p>`;
      }
    }
    
  } catch (err) {
    console.error('Compliance overview error:', err);
    statusBanner.innerHTML = `
      <div style="background:#ffebee;padding:1rem;border-radius:6px;border-left:4px solid #ef5350;">
        <p style="margin:0;color:#c62828;">⚠️ Could not load compliance data. Please refresh and try again.</p>
      </div>
    `;
  }
}
window.loadComplianceOverview = loadComplianceOverview;

// ==================================================
// 🧹 AUTO-ARCHIVE & RETENTION SYSTEM
// DVSA recommended: Keep records, archive after retention period + 10%, email copies to company
// ==================================================
const RETENTION_PERIODS = {
  checklistSubmissions: { years: 2, gracePercent: 10 },
  driverDocuments: { years: 2, gracePercent: 10 },
  defects: { years: 2, gracePercent: 10 },
  maintenance: { years: 2, gracePercent: 10 },
  holidayRequests: { years: 2, gracePercent: 10 },
  postedJobs: { years: 1, gracePercent: 10 },
  tachographFiles: { years: 2, gracePercent: 10 }
};

function calculateExpiryDate(baseDate, period) {
  const expiry = new Date(baseDate);
  expiry.setFullYear(expiry.getFullYear() + period.years);
  const graceMs = (expiry.getTime() - baseDate.getTime()) * (period.gracePercent / 100);
  return new Date(expiry.getTime() + graceMs);
}

async function runArchiveCleanup() {
  console.log('📅 Running archive cleanup check...');
  const today = new Date();
  
  for (const [collectionName, period] of Object.entries(RETENTION_PERIODS)) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      
      for (const doc of snap.docs) {
        const data = doc.data();
        const dateField = data.submittedAt || data.reportedAt || data.postedAt || data.uploadedAt || data.createdAt;
        if (!dateField) continue;
        
        const recordDate = dateField.toDate ? dateField.toDate() : new Date(dateField);
        const expiryDate = calculateExpiryDate(recordDate, period);
        
        if (today >= expiryDate) {
          console.log(`🗄️ Archiving: ${collectionName}/${doc.id}`);
          
          // Mark as archived instead of immediate delete
          await updateDoc(doc.ref, {
            archivedAt: Timestamp.now(),
            expiryDate: expiryDate.toISOString(),
            retentionPolicy: `${period.years} years + ${period.gracePercent}%`
          });
          
          // TODO: Email copy to company before permanent deletion
          // Permanent deletion would be handled by scheduled Cloud Function
        }
      }
    } catch (e) {
      console.warn(`⚠️ Could not process ${collectionName}:`, e.message);
    }
  }
}

// Run once per day when app loads — ONLY processes CURRENT USER'S records
const lastRun = localStorage.getItem('lastArchiveCheck');
const today = new Date();
const todayStr = today.toDateString();
if (lastRun !== todayStr) {
  localStorage.setItem('lastArchiveCheck', todayStr);
  // Skip broad scan — archive cleanup should be done via Cloud Functions
  // This client-side check is now disabled to avoid permission errors
  console.log('📅 Archive check skipped — use Cloud Function for scheduled cleanup');
}

// ==================================================
// 🚀 APP INITIALIZATION
// ==================================================
console.log('%c🚛 LSD Solutions App Loading...', 'font-weight:bold;font-size:14px;color:#1a365d;');

window.addEventListener('beforeunload', () => {
  // Cleanup any modal overlays
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
});

console.log('%c✅ LSD Solutions App Ready — DVSA Compliant', 'font-weight:bold;color:green;');
console.log('%c📋 Features: Driver Portal | Company Portal | Checklist | Calendar | Documents | Maintenance | Defects | Compliance | Tacomaster API', 'color:gray;');
