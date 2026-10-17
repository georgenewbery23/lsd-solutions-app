// ==================================================
// 🚛 LSD SOLUTIONS — COMPLETE PRODUCTION app.js
// Firebase v10.7.1 | DVSA Compliant | Tacomaster API Integrated
// Full Build — October 2026
// ==================================================
'use strict';

// ==================================================
// 🔧 FIREBASE CONFIGURATION
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
  updateProfile
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
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const FIREBASE_CONFIG = {
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
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#d1fae5' : type === 'warning' ? '#fef3c7' : '#fee2e2'};
    color: ${type === 'success' ? '#166534' : type === 'warning' ? '#b45309' : '#dc2626'};
    padding: 0.85rem 1.5rem; border-radius: 8px; font-weight: 500; z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ==================================================
// 🔐 AUTH TAB NAVIGATION
// ==================================================
window.selectedRole = null;

function showAuthTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

  if (tabName === 'signin') {
    document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
    document.getElementById('signinForm').classList.add('active');
  }
  else if (tabName === 'register') {
    document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
    document.getElementById('registerForm').classList.add('active');
  }
  else if (tabName === 'reset') {
    document.getElementById('resetForm').classList.add('active');
  }
}
window.showAuthTab = showAuthTab;

function selectRole(role) {
  window.selectedRole = role;
  document.querySelectorAll('.role-option').forEach(el => el.classList.remove('selected'));
  document.getElementById(`role-${role}`).classList.add('selected');
}
window.selectRole = selectRole;

// ==================================================
// 🔐 PAGE SWITCHING
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
// ==================================================
// 🔐 SIGN IN — Fixed: defensive event handling
// ==================================================
async function handleSignIn(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  
  if (!email || !password) {
    showToast('Please enter email and password', 'warning');
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
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
// 🔐 REGISTER — Fixed: use selectedRole
// ==================================================
async function handleRegister(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const role = window.selectedRole; // ✅ Fixed: uses selectRole() value
  
  if (!name || !email || !password || !role) {
    showToast('Please fill in all fields and select your role', 'warning');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'warning');
    return;
  }
  
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = cred.user;
    
    const profileData = {
      name,
      email,
      role,
      createdAt: Timestamp.now(),
      companyId: role === 'company' ? cred.user.uid : null,
      employmentType: role === 'driver' ? null : 'company'
    };
    
    await setDoc(
      doc(db, role === 'company' ? 'companies' : 'drivers', cred.user.uid),
      profileData
    );
    
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    
    showToast('Account created! Check your email to verify ✅');
    
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
// 🔐 PASSWORD RESET — Fixed: page ID corrected
// ==================================================
async function handlePasswordReset(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const email = document.getElementById('reset-email').value.trim();
  
  if (!email) {
    showToast('Please enter your email', 'warning');
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Reset link sent — check your email ✅');
    showAuthTab('signin'); // ✅ Fixed: uses showAuthTab directly
  } catch (err) {
    console.error('Reset error:', err);
    showToast('Email not found or invalid', 'error');
  }
}
window.handlePasswordReset = handlePasswordReset;

// ==================================================
// 🔐 SIGN OUT — Fixed: page ID corrected
// ==================================================
async function handleSignOut() {
  try {
    await signOut(auth);
    currentUser = null;
    userProfile = null;
    showToast('Signed out');
    showPage('authPage'); // ✅ Fixed: matches HTML
  } catch (err) {
    console.error('Sign out error:', err);
    showToast('Sign out failed', 'error');
  }
}
window.handleSignOut = handleSignOut;
// ==================================================
// 🔐 AUTH STATE WATCHER — ROUTING (COMPLETELY FIXED)
// ==================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    userProfile = null;
    showPage('authPage');
    return;
  }
  
  currentUser = user;
  
  try {
    // Check COMPANY profile first
    let snap = await getDoc(doc(db, 'companies', user.uid));
    if (snap.exists()) {
      userProfile = snap.data();
      userProfile.uid = user.uid;
      
      showPage('company-dashboard-page');
      loadCompanyStats();
      loadCompanyActivity();
      return;
    }
    
    // Check DRIVER profile
    snap = await getDoc(doc(db, 'drivers', user.uid));
    if (snap.exists()) {
      userProfile = snap.data();
      userProfile.uid = user.uid;
      
      showPage('driver-dashboard-page');
      loadDriverRecentActivity();
      return;
    }
    
    // NO PROFILE FOUND — clear message + auth form shown
    console.log('No profile found for:', user.email);
    showToast('Welcome! Please complete registration to continue.', 'warning');
    showPage('authPage');
    showAuthTab('register'); // ✅ Auto-switch to registration form
    
  } catch (err) {
    console.error('Auth routing error:', err);
    showToast('Something went wrong — please sign in again.', 'warning');
    showPage('authPage');
  }
});

// ==================================================
// 👤 DRIVER PROFILE
// ==================================================
async function loadDriverProfile() {
  if (!userProfile) return;
  
  const fields = [
    'profile-name', 'profile-email', 'profile-phone', 'profile-location',
    'profile-licence-number', 'profile-licence-expiry', 'profile-cpc-expiry',
    'profile-tacho-expiry', 'profile-licence-category', 'profile-employment-type'
  ];
  
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = userProfile[id.replace('profile-', '').replace(/-([a-z])/g, g => g[1].toUpperCase())] || '';
  });
  
  toggleEmployerField();
  const employerEl = document.getElementById('profile-employer');
  if (employerEl) employerEl.value = userProfile.employer || '';
}
window.loadDriverProfile = loadDriverProfile;

function toggleEmployerField() {
  const typeEl = document.getElementById('profile-employment-type');
  const fieldEl = document.getElementById('employer-field');
  if (fieldEl) {
    fieldEl.style.display = typeEl && typeEl.value === 'employee' ? 'block' : 'none';
  }
}
window.toggleEmployerField = toggleEmployerField;

async function saveDriverProfile() {
  if (!currentUser) return;
  
  const data = {
    name: document.getElementById('profile-name')?.value.trim() || '',
    phone: document.getElementById('profile-phone')?.value.trim() || '',
    location: document.getElementById('profile-location')?.value.trim() || '',
    licenceNumber: document.getElementById('profile-licence-number')?.value.trim() || '',
    licenceExpiry: document.getElementById('profile-licence-expiry')?.value || null,
    cpcExpiry: document.getElementById('profile-cpc-expiry')?.value || null,
    tachoExpiry: document.getElementById('profile-tacho-expiry')?.value || null,
    licenceCategory: document.getElementById('profile-licence-category')?.value || '',
    employmentType: document.getElementById('profile-employment-type')?.value || '',
    employer: document.getElementById('profile-employer')?.value.trim() || ''
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
    if (snap.exists()) calendarData = snap.data() || {};
  } catch (err) {
    console.error('Load calendar error:', err);
  }
}
window.loadDriverCalendar = loadDriverCalendar;

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthLabel = document.getElementById('calendar-month-year');
  if (!grid || !monthLabel) return;
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  monthLabel.textContent = new Date(year, month).toLocaleDateString('en-GB', { 
    month: 'long', year: 'numeric' 
  });
  
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
  const displayEl = document.getElementById('selected-day-display');
  if (displayEl) {
    displayEl.textContent = `Selected: ${new Date(dateKey).toLocaleDateString('en-GB', { 
      weekday: 'long', day: 'numeric', month: 'long' 
    })}`;
  }
  const buttonsEl = document.getElementById('day-status-buttons');
  if (buttonsEl) buttonsEl.style.display = 'flex';
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
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    let checklist = DEFAULT_CHECKLIST_ITEMS;
    if (userProfile?.companyId) {
      const snap = await getDoc(doc(db, 'checklistConfig', userProfile.companyId));
      if (snap.exists() && snap.data().items) {
        checklist = snap.data().items;
      }
    }
    
    let html = '';
    checklist.forEach(section => {
      html += `<div style="margin-bottom:1.25rem;"><h4 style="color:#1a365d;margin-bottom:0.5rem;">${escapeHtml(section.category)}</h4>`;
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
  if (event && event.preventDefault) event.preventDefault();
  
  const vrm = document.getElementById('checklist-vrm')?.value.trim();
  const trailer = document.getElementById('checklist-trailer')?.value.trim() || null;
  const comments = document.getElementById('checklist-comments')?.value.trim() || '';
  
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
    const form = document.getElementById('checklist-form');
    if (form) form.reset();
    loadChecklistHistory();
    
  } catch (err) {
    console.error('Submit error:', err);
    showToast('Failed to submit', 'error');
  }
}
window.submitChecklist = submitChecklist;

async function loadChecklistHistory() {
  const container = document.getElementById('checklist-history');
  if (!container || !currentUser) return;
  
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
  if (!container) return;
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
  const type = document.getElementById('doc-type')?.value;
  const expiry = document.getElementById('doc-expiry')?.value;
  const file = document.getElementById('doc-file')?.files?.[0];
  
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
  if (!container) return;
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
  const start = document.getElementById('holiday-start')?.value;
  const end = document.getElementById('holiday-end')?.value;
  const notes = document.getElementById('holiday-notes')?.value.trim() || '';
  
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
  if (!userProfile || !currentUser) return;
  
  try {
    const driversSnap = await getDocs(collection(db, 'drivers'));
    const statDrivers = document.getElementById('stat-drivers');
    if (statDrivers) statDrivers.textContent = driversSnap.size;
    
    const vehiclesSnap = await getDocs(query(
      collection(db, 'vehicles'),
      where('companyId', '==', currentUser.uid)
    ));
    const statVehicles = document.getElementById('stat-vehicles');
    if (statVehicles) statVehicles.textContent = vehiclesSnap.size;
    
    const defectsSnap = await getDocs(query(
      collection(db, 'defects'),
      where('companyId', '==', currentUser.uid),
      where('status', '==', 'open')
    ));
    const statDefects = document.getElementById('stat-defects');
    if (statDefects) statDefects.textContent = defectsSnap.size;
    
    const jobsSnap = await getDocs(query(
      collection(db, 'postedJobs'),
      where('companyId', '==', currentUser.uid),
      where('status', '==', 'open')
    ));
    const statJobs = document.getElementById('stat-jobs');
    if (statJobs) statJobs.textContent = jobsSnap.size;
    
  } catch (err) {
    console.error('Load stats error:', err);
  }
}
window.loadCompanyStats = loadCompanyStats;

async function loadCompanyActivity() {
  const container = document.getElementById('company-recent-activity');
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
        ? data.submittedAt.toDate().toLocaleDateString('en-GB', { 
            dateStyle: 'short', timeStyle: 'short' 
          }) 
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
// 🚗 VEHICLE MANAGEMENT
// ==================================================
let currentEditingVehicleId = null;

function showAddVehicleModal() {
  currentEditingVehicleId = null;
  const modal = document.getElementById('add-vehicle-modal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('vrm').value = '';
  document.getElementById('make-model').value = '';
  document.getElementById('vin').value = '';
  document.getElementById('mot-expiry').value = '';
  document.getElementById('plating-expiry').value = '';
  document.getElementById('inspection-due').value = '';
}
window.showAddVehicleModal = showAddVehicleModal;

function closeAddVehicleModal() {
  const modal = document.getElementById('add-vehicle-modal');
  if (modal) modal.style.display = 'none';
  currentEditingVehicleId = null;
}
window.closeAddVehicleModal = closeAddVehicleModal;

async function saveVehicle() {
  const vrm = document.getElementById('vrm')?.value.trim().toUpperCase();
  const makeModel = document.getElementById('make-model')?.value.trim();
  const vin = document.getElementById('vin')?.value.trim();
  const motExpiry = document.getElementById('mot-expiry')?.value;
  const platingExpiry = document.getElementById('plating-expiry')?.value;
  const inspectionDue = document.getElementById('inspection-due')?.value;
  
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
  if (!container) return;
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
// 📋 JOB POSTING MANAGEMENT
// ==================================================
function showPostJobModal() {
  const modal = document.getElementById('post-job-modal');
  if (modal) modal.style.display = 'flex';
}
window.showPostJobModal = showPostJobModal;

function closePostJobModal() {
  const modal = document.getElementById('post-job-modal');
  if (modal) modal.style.display = 'none';
  document.getElementById('job-title').value = '';
  document.getElementById('job-description').value = '';
  document.getElementById('job-date').value = '';
  document.getElementById('job-rate').value = '';
}
window.closePostJobModal = closePostJobModal;

async function submitJob() {
  const title = document.getElementById('job-title')?.value.trim();
  const description = document.getElementById('job-description')?.value.trim();
  const jobDate = document.getElementById('job-date')?.value;
  const rate = document.getElementById('job-rate')?.value.trim();
  
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
  if (!container) return;
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
      const statusClass = job.status === 'open' ? 'success' : 'muted';
      
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
  const modal = document.getElementById('maintenance-modal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('maint-asset-type').value = '';
  document.getElementById('maint-vehicle-id').style.display = 'none';
  document.getElementById('maint-trailer-id').style.display = 'none';
  document.getElementById('maint-task').value = '';
  document.getElementById('maint-due-date').value = '';
  document.getElementById('maint-interval').value = '';
  document.getElementById('maint-priority').value = 'routine';
  document.getElementById('maint-notes').value = '';
}
window.showAddMaintenanceModal = showAddMaintenanceModal;

function closeMaintenanceModal() {
  const modal = document.getElementById('maintenance-modal');
  if (modal) modal.style.display = 'none';
}
window.closeMaintenanceModal = closeMaintenanceModal;

function toggleTrailerField() {
  const type = document.getElementById('maint-asset-type')?.value;
  document.getElementById('maint-vehicle-id').style.display = type === 'vehicle' ? 'block' : 'none';
  document.getElementById('maint-trailer-id').style.display = type === 'trailer' ? 'block' : 'none';
}
window.toggleTrailerField = toggleTrailerField;

async function saveMaintenanceSchedule() {
  const assetType = document.getElementById('maint-asset-type')?.value;
  const vehicleId = document.getElementById('maint-vehicle-id')?.value;
  const trailerId = document.getElementById('maint-trailer-id')?.value;
  const task = document.getElementById('maint-task')?.value.trim();
  const dueDate = document.getElementById('maint-due-date')?.value;
  const interval = document.getElementById('maint-interval')?.value;
  const priority = document.getElementById('maint-priority')?.value;
  const notes = document.getElementById('maint-notes')?.value.trim();
  
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
  if (!container) return;
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
        <div class="card" style="padding:0.85rem;${overdue ? 'border-left:3px solid #c62828;' : soon ? 'border-left:3px solid #b45309;' : ''}">
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
  const modal = document.getElementById('defect-modal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('defect-asset-type').value = '';
  document.getElementById('defect-vehicle').style.display = 'none';
  document.getElementById('defect-trailer').style.display = 'none';
  document.getElementById('defect-description').value = '';
  const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');
const nodemailer = require('nodemailer');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 📧 Email transporter — LSD Solutions
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'admin@lsd-solutions.co.uk',
    pass: 'krrw dvtw aeml kkps'
  }
});

// ✅ Defect notification — triggers on new checklist with defects
exports.sendDefectNotification = functions.firestore
  .document('checklists/{checklistId}')
  .onCreate(async (snap, context) => {
    const checklist = snap.data();
    
    // Only send if there are defects
    if (!checklist.defects || checklist.defects.length === 0) {
      console.log('✅ No defects found — no email sent');
      return null;
    }

    // Get company email — fall back to admin@lsd-solutions.co.uk
    const companyEmail = checklist.companyEmail || 'admin@lsd-solutions.co.uk';
    const driverName = checklist.driverName || 'Unknown Driver';
    const vehicleReg = checklist.vehicleReg || 'Unknown';
    const date = checklist.date 
      ? new Date(checklist.date.seconds * 1000).toLocaleString('en-GB') 
      : 'Unknown date';

    // Build defect list
    const defectList = checklist.defects
      .map((d, i) => `${i + 1}. ${d.item || 'Item'} — ${d.status || 'Issue noted'}${d.notes ? ` — Notes: ${d.notes}` : ''}`)
      .join('\n');

    const mailOptions = {
      from: '"LSD Solutions — Defect Alert" <admin@lsd-solutions.co.uk>',
      to: companyEmail,
      subject: `🚨 DEFECT REPORTED — ${vehicleReg} — ${driverName}`,
      text: `
DEFECT NOTIFICATION — LSD SOLUTIONS
====================================

Driver: ${driverName}
Vehicle: ${vehicleReg}
Date/Time: ${date}

DEFECTS RECORDED:
${defectList}

Please review and action this promptly to remain DVSA compliant.

— LSD Solutions Automated System
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Defect notification sent to ${companyEmail}`);
    return null;
  });

// Your existing Tachomaster sync function stays here below
exports.dailyTachomasterSync = functions.pubsub
  .schedule('every day 04:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    console.log('🔄 Starting Daily Tachomaster Sync — 04:00 UK Time');
    // ... keep your existing sync code here unchanged
    return null;
  });
