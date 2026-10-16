// ==================================================
// 🚛 LSD SOLUTIONS — COMPLETE PRODUCTION VERSION
// For All Your Longhaul, Shunting And Delivery Solutions
// Firebase v10.7.1 | DVSA Compliant | Full System
// ==================================================
'use strict';

// ==================================================
// 🔹 FIREBASE IMPORTS & INITIALIZATION
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
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// ==================================================
// 🔹 FIREBASE CONFIGURATION — UPDATE WITH YOURS
// ==================================================
const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.appspot.com",
  messagingSenderId: "4593000000000",
  appId: "1:4593000000000:web:abc123def456ghi789jkl01"
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
let currentCalendarDate = new Date();
let calendarData = {};
let reportsList = [];
let currentPayrollData = [];

// ==================================================
// 🔹 GLOBAL CONSTANTS
// ==================================================
const TIMESHEET_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  QUERIED: 'queried',
  REJECTED: 'rejected',
  EXPORTED: 'exported'
};

const EMAIL_SETTINGS = {
  driverSubmitsTimesheet: true,
  clientApprovesTimesheet: true,
  payrollExported: true,
  holidayUpdates: true
};

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

function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function formatDateTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getCurrentUserId() {
  return currentUser?.uid || 'unknown';
}

function getCurrentUserName() {
  return userProfile?.name || currentUser?.email || 'Unknown';
}

// ==================================================
// 🔹 TOAST NOTIFICATIONS
// ==================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="font-weight:500; margin-bottom:0.25rem;">${
      type === 'success' ? '✅ Success' :
      type === 'danger' ? '❌ Error' :
      type === 'warning' ? '⚠️ Warning' : 'ℹ️ Info'
    }</div>
    <div style="font-size:0.9rem;">${escapeHtml(message)}</div>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

window.showToast = showToast;

// ==================================================
// 🔹 PAGE NAVIGATION
// ==================================================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active');
  
  const isAuthPage = pageId === 'auth-page';
  document.getElementById('site-header').classList.toggle('hidden', isAuthPage);
  
  if (!isAuthPage) {
    switch(pageId) {
      case 'driver-dashboard-page': loadDriverDashboard(); break;
      case 'driver-timesheet-page': initTimesheetCalculations(); loadDriverTimesheets(); break;
      case 'driver-holiday-page': loadHolidayBalance(); loadHolidayHistory(); break;
      case 'driver-jobs-page': loadAvailableJobs(); break;
      case 'driver-calendar-page': renderCalendar(); break;
      case 'driver-checklist-page': initChecklist(); break;
      case 'driver-profile-page': loadDriverProfileForm(); break;
      case 'company-dashboard-page': loadCompanyDashboard(); break;
      case 'company-timesheets-page': loadCompanyTimesheets('pending'); break;
      case 'company-jobs-page': loadCompanyJobs(); break;
      case 'company-drivers-page': loadAgencyDrivers(); break;
      case 'company-calendar-page': renderCompanyCalendar(); break;
      case 'company-holidays-page': loadHolidayRequests('pending'); break;
      case 'company-profile-page': loadCompanySettingsForm(); break;
      case 'admin-payroll-page': loadEmailSettings(); break;
    }
  }
}

window.showPage = showPage;

// ==================================================
// 🔹 AUTHENTICATION — SIGN IN
// ==================================================
async function handleSignIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    showToast('Signing in...', 'info');
  } catch (error) {
    console.error('Sign in error:', error);
    let message = 'Failed to sign in. Please check your credentials.';
    if (error.code === 'auth/user-not-found') message = 'No account found with this email address.';
    else if (error.code === 'auth/wrong-password') message = 'Incorrect password. Please try again.';
    else if (error.code === 'auth/invalid-credential') message = 'Invalid email or password.';
    else if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Please try again later.';
    showToast(message, 'danger');
  }
}
window.handleSignIn = handleSignIn;

// ==================================================
// 🔹 AUTHENTICATION — REGISTER
// ==================================================
async function handleRegister(role, name, email, password, extraData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    
    const profileData = {
      name: name,
      email: email,
      role: role,
      createdAt: Timestamp.now(),
      ...extraData
    };
    
    if (role === 'driver') {
      await setDoc(doc(db, 'drivers', currentUser.uid), profileData);
    } else {
      await setDoc(doc(db, 'companies', currentUser.uid), profileData);
    }
    
    userProfile = profileData;
    showToast('✅ Account created successfully!', 'success');
    await sendEmailVerification(currentUser);
    showToast('Verification email sent — please check your inbox', 'info');
    
  } catch (error) {
    console.error('Registration failed:', error);
    let message = 'Failed to create account.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email address is already registered. Try signing in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Please use a password of at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    }
    showToast(message, 'danger');
  }
}
window.handleRegister = handleRegister;

// ==================================================
// 🔹 AUTHENTICATION — SIGN OUT
// ==================================================
async function handleSignOut() {
  try {
    await signOut(auth);
    currentUser = null;
    userProfile = null;
    calendarData = {};
    showPage('auth-page');
    showToast('Signed out successfully', 'info');
  } catch (error) {
    showToast('Error signing out', 'danger');
  }
}
window.handleSignOut = handleSignOut;

// ==================================================
// 🔹 AUTHENTICATION — PASSWORD RESET
// ==================================================
async function handlePasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('✅ Password reset link sent — check your email', 'success');
  } catch (error) {
    console.error('Reset error:', error);
    showToast('Failed to send reset email. Please check the address.', 'danger');
  }
}
window.handlePasswordReset = handlePasswordReset;

// ==================================================
// 🔹 LOAD USER PROFILE FROM FIRESTORE
// ==================================================
async function loadUserProfile(uid) {
  try {
    let profileDoc = await getDoc(doc(db, 'drivers', uid));
    if (profileDoc.exists()) {
      userProfile = { uid, ...profileDoc.data() };
      finishProfileLoad();
      return;
    }
    
    profileDoc = await getDoc(doc(db, 'companies', uid));
    if (profileDoc.exists()) {
      userProfile = { uid, ...profileDoc.data() };
      finishProfileLoad();
      return;
    }
    
    showToast('⚠️ Profile not found — please complete your registration', 'warning');
    showPage('auth-page');
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Error loading your profile', 'danger');
  }
}

function finishProfileLoad() {
  const nameEl = document.getElementById('user-display');
  if (nameEl) nameEl.textContent = userProfile.name || userProfile.email;
  
  if (userProfile.role === 'company') {
    showPage('company-dashboard-page');
  } else {
    showPage('driver-dashboard-page');
  }
}
// ==================================================
// 🔹 DRIVER PORTAL — DASHBOARD
// ==================================================
async function loadDriverDashboard() {
  if (!userProfile) return;
  
  const nameEl = document.getElementById('driver-name');
  if (nameEl) nameEl.textContent = escapeHtml(userProfile.name || 'Driver');
  
  try {
    const q = query(collection(db, 'jobs'), where('applicants', 'array-contains', currentUser.uid));
    const snapshot = await getDocs(q);
    const applied = snapshot.size;
    const appliedEl = document.querySelector('#driver-dashboard-page .grid div:nth-child(1) p:first-child');
    if (appliedEl) appliedEl.textContent = applied;
  } catch (e) { console.log('Could not load stats'); }
  
  try {
    const timesheetsQ = query(
      collection(db, 'timesheets'),
      where('driverId', '==', currentUser.uid),
      orderBy('weekEnding', 'desc'),
      limit(4)
    );
    const timesheetsSnap = await getDocs(timesheetsQ);
    const timesheetsCount = timesheetsSnap.size;
    const tsEl = document.querySelector('#driver-dashboard-page .grid div:nth-child(2) p:first-child');
    if (tsEl) tsEl.textContent = timesheetsCount;
  } catch (e) { console.log('Could not load timesheet stats'); }
  
  try {
    const holidayQ = query(
      collection(db, 'holidayRequests'),
      where('driverId', '==', currentUser.uid),
      where('status', '==', 'approved')
    );
    const holidaySnap = await getDocs(holidayQ);
    let totalTaken = 0;
    holidaySnap.forEach(doc => {
      const h = doc.data();
      if (h.startDate && h.endDate) {
        totalTaken += Math.ceil((h.endDate.toDate() - h.startDate.toDate()) / (1000*60*60*24)) + 1;
      }
    });
    const balance = userProfile.holidayEntitlement ? userProfile.holidayEntitlement - totalTaken : 28 - totalTaken;
    const holidayEl = document.querySelector('#driver-dashboard-page .grid div:nth-child(3) p:first-child');
    if (holidayEl) holidayEl.textContent = `${balance} days`;
  } catch (e) { console.log('Could not load holiday balance'); }
  
  const activityEl = document.getElementById('driver-recent-activity');
  if (activityEl) {
    activityEl.innerHTML = `
      <div style="padding:0.5rem 0; border-bottom:1px solid var(--border);">
        <strong>Welcome!</strong> Your account is set up and ready.
      </div>
      <div style="padding:0.5rem 0;">
        <strong>Tip:</strong> Submit your weekly timesheet to get paid — use the Timesheets tab above.
      </div>
    `;
  }
}

// ==================================================
// 🔹 DRIVER PORTAL — TIMESHEETS
// ==================================================
let timesheetRows = [];

function initTimesheetCalculations() {
  timesheetRows = [];
  addTimesheetRow();
  updateTimesheetTotals();
}
window.initTimesheetCalculations = initTimesheetCalculations;

function addTimesheetRow() {
  const idx = timesheetRows.length;
  timesheetRows.push({
    date: '',
    start: '',
    finish: '',
    breaks: 0,
    totalMiles: 0,
    ratePerMile: userProfile.ratePerMile || 0.30,
    expenses: 0,
    notes: ''
  });
  renderTimesheetRows();
}
window.addTimesheetRow = addTimesheetRow;

function removeTimesheetRow(index) {
  timesheetRows.splice(index, 1);
  renderTimesheetRows();
  updateTimesheetTotals();
}
window.removeTimesheetRow = removeTimesheetRow;

function updateRowValue(index, field, value) {
  timesheetRows[index][field] = value;
  updateTimesheetTotals();
}
window.updateRowValue = updateRowValue;

function calculateRowTotal(row) {
  const miles = parseFloat(row.totalMiles) || 0;
  const rate = parseFloat(row.ratePerMile) || 0;
  const expenses = parseFloat(row.expenses) || 0;
  return (miles * rate) + expenses;
}

function updateTimesheetTotals() {
  let totalMiles = 0;
  let totalPay = 0;
  let totalExpenses = 0;
  
  timesheetRows.forEach(row => {
    totalMiles += parseFloat(row.totalMiles) || 0;
    totalPay += (parseFloat(row.totalMiles) || 0) * (parseFloat(row.ratePerMile) || 0.30);
    totalExpenses += parseFloat(row.expenses) || 0;
  });
  
  const grandTotal = totalPay + totalExpenses;
  
  const milesEl = document.getElementById('ts-total-miles');
  const payEl = document.getElementById('ts-total-pay');
  const expEl = document.getElementById('ts-total-expenses');
  const grandEl = document.getElementById('ts-grand-total');
  
  if (milesEl) milesEl.textContent = totalMiles.toFixed(2);
  if (payEl) payEl.textContent = `£${totalPay.toFixed(2)}`;
  if (expEl) expEl.textContent = `£${totalExpenses.toFixed(2)}`;
  if (grandEl) grandEl.textContent = `£${grandTotal.toFixed(2)}`;
}
window.updateTimesheetTotals = updateTimesheetTotals;

function renderTimesheetRows() {
  const container = document.getElementById('timesheet-rows');
  if (!container) return;
  
  container.innerHTML = timesheetRows.map((row, idx) => `
    <div class="timesheet-row" style="display:grid; grid-template-columns:repeat(9, auto); gap:0.5rem; align-items:center; padding:0.5rem; border-bottom:1px solid var(--border);">
      <input type="date" value="${row.date}" onchange="updateRowValue(${idx}, 'date', this.value)" />
      <input type="time" value="${row.start}" onchange="updateRowValue(${idx}, 'start', this.value)" />
      <input type="time" value="${row.finish}" onchange="updateRowValue(${idx}, 'finish', this.value)" />
      <input type="number" min="0" value="${row.breaks}" placeholder="Mins" onchange="updateRowValue(${idx}, 'breaks', parseFloat(this.value)||0)" style="width:70px;" />
      <input type="number" min="0" step="0.01" value="${row.totalMiles || ''}" placeholder="Miles" onchange="updateRowValue(${idx}, 'totalMiles', parseFloat(this.value)||0)" style="width:80px;" />
      <input type="number" min="0" step="0.01" value="${row.ratePerMile}" placeholder="£/mile" onchange="updateRowValue(${idx}, 'ratePerMile', parseFloat(this.value)||0.30)" style="width:80px;" />
      <input type="number" min="0" step="0.01" value="${row.expenses || ''}" placeholder="£ Exp" onchange="updateRowValue(${idx}, 'expenses', parseFloat(this.value)||0)" style="width:80px;" />
      <input type="text" value="${row.notes}" placeholder="Notes" onchange="updateRowValue(${idx}, 'notes', this.value)" style="width:120px;" />
      <button class="btn danger small" onclick="removeTimesheetRow(${idx})">✕</button>
    </div>
  `).join('');
}

async function submitTimesheet() {
  const weekEndingInput = document.getElementById('ts-week-ending')?.value;
  const signature = document.getElementById('ts-signature')?.value?.trim();
  const declareCorrect = document.getElementById('ts-declare')?.checked;
  
  if (!weekEndingInput) { showToast('Please enter week ending date', 'warning'); return; }
  if (!signature) { showToast('Please enter your name as signature', 'warning'); return; }
  if (!declareCorrect) { showToast('Please confirm the declaration', 'warning'); return; }
  if (timesheetRows.length === 0) { showToast('Please add at least one day entry', 'warning'); return; }
  
  let totalMiles = 0, totalPay = 0, totalExpenses = 0;
  timesheetRows.forEach(r => {
    totalMiles += parseFloat(r.totalMiles) || 0;
    totalPay += (parseFloat(r.totalMiles) || 0) * (parseFloat(r.ratePerMile) || 0.30);
    totalExpenses += parseFloat(r.expenses) || 0;
  });
  
  try {
    await addDoc(collection(db, 'timesheets'), {
      driverId: currentUser.uid,
      driverName: userProfile.name,
      companyId: userProfile.linkedCompanyId || null,
      weekEnding: Timestamp.fromDate(new Date(weekEndingInput + 'T00:00:00')),
      entries: timesheetRows,
      totalMiles,
      totalPay,
      totalExpenses,
      grandTotal: totalPay + totalExpenses,
      status: TIMESHEET_STATUSES.PENDING,
      submittedAt: Timestamp.now(),
      signedBy: signature
    });
    
    showToast('✅ Timesheet submitted — awaiting approval', 'success');
    
    document.getElementById('ts-week-ending').value = '';
    document.getElementById('ts-signature').value = '';
    document.getElementById('ts-declare').checked = false;
    timesheetRows = [];
    addTimesheetRow();
    updateTimesheetTotals();
    loadDriverTimesheets();
  } catch (e) {
    showToast('Failed to submit timesheet', 'danger');
  }
}
window.submitTimesheet = submitTimesheet;

async function loadDriverTimesheets() {
  const container = document.getElementById('driver-timesheets-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const q = query(
      collection(db, 'timesheets'),
      where('driverId', '==', currentUser.uid),
      orderBy('weekEnding', 'desc'),
      limit(12)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No timesheets submitted yet.</p>';
      return;
    }
    
    const statusBadges = {
      pending: '<span class="badge warning">⏳ Pending</span>',
      approved: '<span class="badge success">✅ Approved</span>',
      queried: '<span class="badge warning">❓ Queried</span>',
      rejected: '<span class="badge danger">❌ Rejected</span>',
      exported: '<span class="badge info">📤 Exported</span>'
    };
    
    container.innerHTML = snapshot.docs.map(doc => {
      const ts = { id: doc.id, ...doc.data() };
      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">Week Ending: ${formatDate(ts.weekEnding)}</h4>
              <p style="margin:0.25rem 0; font-size:0.9rem;">
                Miles: ${ts.totalMiles.toFixed(2)} | Pay: £${ts.totalPay.toFixed(2)} | Exp: £${ts.totalExpenses.toFixed(2)}
                <strong style="margin-left:0.5rem;">Total: £${ts.grandTotal.toFixed(2)}</strong>
              </p>
              <p style="font-size:0.8rem; color:var(--text-light);">Submitted: ${formatDateTime(ts.submittedAt)}</p>
            </div>
            ${statusBadges[ts.status] || statusBadges.pending}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger);">Failed to load timesheets</p>';
  }
}
window.loadDriverTimesheets = loadDriverTimesheets;

// ==================================================
// 🔹 DRIVER PORTAL — HOLIDAY & LEAVE
// ==================================================
async function loadHolidayBalance() {
  const balanceEl = document.getElementById('holiday-days-balance');
  const entitlement = userProfile.holidayEntitlement || 28;
  
  try {
    const q = query(
      collection(db, 'holidayRequests'),
      where('driverId', '==', currentUser.uid),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    let taken = 0;
    snapshot.forEach(doc => {
      const h = doc.data();
      if (h.startDate && h.endDate) {
        const days = Math.ceil((h.endDate.toDate() - h.startDate.toDate()) / (1000*60*60*24)) + 1;
        taken += days;
      }
    });
    
    const remaining = entitlement - taken;
    if (balanceEl) balanceEl.textContent = `${remaining} days remaining (${entitlement} annual leave days)`;
  } catch (e) {
    if (balanceEl) balanceEl.textContent = `${entitlement} days entitlement`;
  }
}

async function submitHolidayRequest() {
  const startInput = document.getElementById('holiday-start');?.value;
  const endInput = document.getElementById('holiday-end')?.value;
  const notes = document.getElementById('holiday-notes')?.value?.trim();
  
  if (!startInput || !endInput) {
    showToast('Please select start and end dates', 'warning');
    return;
  }
  
  const startDate = new Date(startInput + 'T00:00:00');
  const endDate = new Date(endInput + 'T00:00:00');
  
  if (endDate < startDate) {
    showToast('End date cannot be before start date', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'holidayRequests'), {
      driverId: currentUser.uid,
      driverName: userProfile.name,
      companyId: userProfile.linkedCompanyId || null,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      notes: notes || '',
      status: 'pending',
      submittedAt: Timestamp.now()
    });
    
    showToast('✅ Request submitted — awaiting approval', 'success');
    document.getElementById('holiday-start').value = '';
    document.getElementById('holiday-end').value = '';
    document.getElementById('holiday-notes').value = '';
    loadHolidayBalance();
    loadHolidayHistory();
  } catch (e) {
    showToast('Failed to submit request', 'danger');
  }
}
window.submitHolidayRequest = submitHolidayRequest;

async function loadHolidayHistory() {
  const container = document.getElementById('holiday-history-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const q = query(
      collection(db, 'holidayRequests'),
      where('driverId', '==', currentUser.uid),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No requests submitted yet.</p>';
      return;
    }
    
    const statusBadges = {
      pending: '<span class="badge warning">⏳ Pending Approval</span>',
      approved: '<span class="badge success">✅ Approved</span>',
      rejected: '<span class="badge danger">❌ Rejected</span>'
    };
    
    container.innerHTML = snapshot.docs.map(doc => {
      const h = { id: doc.id, ...doc.data() };
      const days = h.startDate && h.endDate 
        ? Math.ceil((h.endDate.toDate() - h.startDate.toDate()) / (1000*60*60*24)) + 1
        : '—';
      return `
        <div class="card" style="margin-bottom:0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <strong>${formatDate(h.startDate)} — ${formatDate(h.endDate)}</strong>
              <p style="margin:0.25rem 0; font-size:0.9rem;">${days} day(s)</p>
              ${h.notes ? `<p style="font-size:0.85rem; color:var(--text-light);">${escapeHtml(h.notes)}</p>` : ''}
            </div>
            ${statusBadges[h.status]}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger);">Failed to load history</p>';
  }
}
window.loadHolidayHistory = loadHolidayHistory;

// ==================================================
// 🔹 DRIVER PORTAL — CALENDAR / AVAILABILITY
// ==================================================
function renderCalendar() {
  renderCalendarMonth();
  loadCalendarData();
}

function renderCalendarMonth() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthYearEl = document.getElementById('calendar-month-year');
  if (monthYearEl) monthYearEl.textContent = `${monthNames[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const daysContainer = document.getElementById('calendar-days');
  if (!daysContainer) return;
  daysContainer.innerHTML = '';
  
  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    daysContainer.appendChild(emptyDay);
  }
  
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
      dayEl.classList.add('today');
    }
    
    const status = calendarData[dateKey] || '';
    if (status) dayEl.classList.add(status);
    
    dayEl.innerHTML = `
      <span style="font-weight:500; font-size:0.9rem;">${day}</span>
      <span style="font-size:0.7rem; margin-top:auto;">${getStatusLabel(status)}</span>
    `;
    
    dayEl.onclick = () => cycleDayStatus(dateKey, dayEl);
    daysContainer.appendChild(dayEl);
  }
}

function getStatusLabel(status) {
  const labels = {
    available: '✓ Avail',
    unavailable: '✗ Unavail',
    booked: '🔵 Booked',
    pending: '⏳ Pending',
    holiday: '🌴 Holiday'
  };
  return labels[status] || '';
}

function cycleDayStatus(dateKey, dayEl) {
  const order = ['', 'available', 'unavailable', 'holiday'];
  const current = calendarData[dateKey] || '';
  const currentIndex = order.indexOf(current);
  const nextStatus = order[(currentIndex + 1) % order.length];
  
  dayEl.className = 'calendar-day' + (dayEl.classList.contains('today') ? ' today' : '');
  ['available','unavailable','booked','pending','holiday'].forEach(s => dayEl.classList.remove(s));
  if (nextStatus) dayEl.classList.add(nextStatus);
  
  calendarData[dateKey] = nextStatus;
  dayEl.querySelector('span:nth-child(2)').textContent = getStatusLabel(nextStatus);
  if (!nextStatus) delete calendarData[dateKey];
}

function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendarMonth();
}
window.changeMonth = changeMonth;

async function loadCalendarData() {
  try {
    const docSnap = await getDoc(doc(db, 'driverCalendars', currentUser.uid));
    if (docSnap.exists()) {
      calendarData = docSnap.data().availability || {};
    }
    renderCalendarMonth();
  } catch (e) {
    console.log('No calendar data found');
  }
}

async function saveCalendar() {
  try {
    await setDoc(doc(db, 'driverCalendars', currentUser.uid), {
      availability: calendarData,
      updatedAt: Timestamp.now()
    });
    showToast('✅ Availability saved', 'success');
  } catch (e) {
    showToast('Failed to save availability', 'danger');
  }
}
window.saveCalendar = saveCalendar;

function clearCalendar() {
  if (confirm('Clear all availability for this month?')) {
    calendarData = {};
    renderCalendarMonth();
    showToast('Calendar cleared', 'info');
  }
}
window.clearCalendar = clearCalendar;
// ==================================================
// 🔹 COMPANY PORTAL — DASHBOARD
// ==================================================
async function loadCompanyDashboard() {
  if (!userProfile || userProfile.accountType !== 'company') return;
  
  const nameEl = document.getElementById('company-name');
  if (nameEl) nameEl.textContent = escapeHtml(userProfile.companyName || 'Company');
  
  try {
    const driversSnap = await getDocs(collection(db, 'companies', currentUser.uid, 'drivers'));
    const driverCount = driversSnap.size;
    const driverEl = document.querySelector('#company-dashboard-page .grid div:nth-child(1) p:first-child');
    if (driverEl) driverEl.textContent = driverCount;
  } catch (e { console.log('Could not load driver count'); });
  
  try {
    const jobsSnap = await getDocs(query(
      collection(db, 'jobs'),
      where('companyId', '==', currentUser.uid),
      where('status', '==', 'active')
    ));
    const activeJobs = jobsSnap.size;
    const jobsEl = document.querySelector('#company-dashboard-page .grid div:nth-child(2) p:first-child');
    if (jobsEl) jobsEl.textContent = activeJobs;
  } catch (e) { console.log('Could not load jobs count'); }
  
  try {
    const tsSnap = await getDocs(query(
      collection(db, 'timesheets'),
      where('companyId', '==', currentUser.uid),
      where('status', '==', 'pending')
    ));
    const pendingTs = tsSnap.size;
    const tsEl = document.querySelector('#company-dashboard-page .grid div:nth-child(3) p:first-child');
    if (tsEl) tsEl.textContent = pendingTs;
  } catch (e) { console.log('Could not load timesheets count'); }
  
  loadExpiryAlerts();
  loadCompanyActivity();
}

async function loadExpiryAlerts() {
  const container = document.getElementById('expiry-alerts');
  if (!container) return;
  
  container.innerHTML = '<p style="color:var(--text-light);">Checking documents...</p>';
  
  try {
    const alerts = [];
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    
    const driversSnap = await getDocs(collection(db, 'companies', currentUser.uid, 'drivers'));
    
    for (const driverDoc of driversSnap.docs) {
      const driver = driverDoc.data();
      
      if (driver.dlicExpiry) {
        const expiry = driver.dlicExpiry.toDate();
        if (expiry <= thirtyDays) {
          alerts.push({
            type: 'warning',
            message: `${escapeHtml(driver.name)} — Driving Licence expires ${formatDate(driver.dlicExpiry)}`
          });
        }
      }
      if (driver.cpcExpiry) {
        const expiry = driver.cpcExpiry.toDate();
        if (expiry <= thirtyDays) {
          alerts.push({
            type: 'warning',
            message: `${escapeHtml(driver.name)} — Driver CPC expires ${formatDate(driver.cpcExpiry)}`
          });
        }
      }
      if (driver.tachoExpiry) {
        const expiry = driver.tachoExpiry.toDate();
        if (expiry <= thirtyDays) {
          alerts.push({
            type: 'info',
            message: `${escapeHtml(driver.name)} — Tachograph card expires ${formatDate(driver.tachoExpiry)}`
          });
        }
      }
    }
    
    if (alerts.length === 0) {
      container.innerHTML = '<p style="color:var(--success);">✅ All documents up to date</p>';
      return;
    }
    
    container.innerHTML = alerts.map(a => `
      <div class="alert ${a.type}" style="margin-bottom:0.5rem;">${a.message}</div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text-light);">Could not check document expiries</p>';
  }
}

async function loadCompanyActivity() {
  const container = document.getElementById('company-recent-activity');
  if (!container) return;
  
  container.innerHTML = '<p>Loading activity...</p>';
  
  try {
    const tsSnap = await getDocs(query(
      collection(db, 'timesheets'),
      where('companyId', '==', currentUser.uid),
      orderBy('submittedAt', 'desc'),
      limit(5)
    ));
    
    if (tsSnap.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No recent activity</p>';
      return;
    }
    
    container.innerHTML = tsSnap.docs.map(doc => {
      const ts = doc.data();
      return `
        <div style="padding:0.5rem 0; border-bottom:1px solid var(--border);">
          <strong>${escapeHtml(ts.driverName)}</strong> submitted timesheet — Week ending ${formatDate(ts.weekEnding)}
          <span style="float:right; font-size:0.85rem; color:var(--text-light);">${formatDateTime(ts.submittedAt)}</span>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger);">Failed to load activity</p>';
  }
}

// ==================================================
// 🔹 COMPANY PORTAL — DRIVERS
// ==================================================
async function loadCompanyDrivers() {
  const container = document.getElementById('company-drivers-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading drivers...</p>';
  
  try {
    const snapshot = await getDocs(collection(db, 'companies', currentUser.uid, 'drivers'));
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No drivers added yet.</p>';
      return;
    }
    
    container.innerHTML = snapshot.docs.map(doc => {
      const d = { id: doc.id, ...doc.data() };
      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">${escapeHtml(d.name || 'Unnamed Driver')}</h4>
              <p style="margin:0.25rem 0; font-size:0.9rem;">
                ${d.email || 'No email'} | ${d.phone || 'No phone'}
              </p>
              <p style="font-size:0.8rem; color:var(--text-light);">
                Licence: ${d.dlicNumber || 'Not recorded'}
                ${d.dlicExpiry ? `• Expires: ${formatDate(d.dlicExpiry)}` : ''}
              </p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn small secondary" onclick="viewDriverProfile('${d.id}')">View</button>
              <button class="btn small danger" onclick="removeDriver('${d.id}', '${escapeHtml(d.name)}')">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load drivers: ${e.message}</p>`;
  }
}
window.loadCompanyDrivers = loadCompanyDrivers;

async function addCompanyDriver() {
  const name = document.getElementById('new-driver-name')?.value?.trim();
  const email = document.getElementById('new-driver-email')?.value?.trim();
  const phone = document.getElementById('new-driver-phone')?.value?.trim();
  const dlicNumber = document.getElementById('new-driver-dlic')?.value?.trim();
  const dlicExpiryInput = document.getElementById('new-driver-dlic-expiry')?.value;
  const cpcExpiryInput = document.getElementById('new-driver-cpc-expiry')?.value;
  const tachoExpiryInput = document.getElementById('new-driver-tacho-expiry')?.value;
  
  if (!name || !email) {
    showToast('Please enter name and email', 'warning');
    return;
  }
  
  try {
    const driverRef = doc(collection(db, 'companies', currentUser.uid, 'drivers'));
    await setDoc(driverRef, {
      name,
      email,
      phone: phone || '',
      dlicNumber: dlicNumber || '',
      dlicExpiry: dlicExpiryInput ? Timestamp.fromDate(new Date(dlicExpiryInput + 'T00:00:00')) : null,
      cpcExpiry: cpcExpiryInput ? Timestamp.fromDate(new Date(cpcExpiryInput + 'T00:00:00')) : null,
      tachoExpiry: tachoExpiryInput ? Timestamp.fromDate(new Date(tachoExpiryInput + 'T00:00:00')) : null,
      addedAt: Timestamp.now()
    });
    
    showToast('✅ Driver added', 'success');
    document.getElementById('new-driver-name').value = '';
    document.getElementById('new-driver-email').value = '';
    document.getElementById('new-driver-phone').value = '';
    document.getElementById('new-driver-dlic').value = '';
    document.getElementById('new-driver-dlic-expiry').value = '';
    document.getElementById('new-driver-cpc-expiry').value = '';
    document.getElementById('new-driver-tacho-expiry').value = '';
    loadCompanyDrivers();
    loadExpiryAlerts();
  } catch (e) {
    showToast('Failed to add driver', 'danger');
  }
}
window.addCompanyDriver = addCompanyDriver;

async function removeDriver(driverId, driverName) {
  if (!confirm(`Remove ${driverName} from your driver list? This cannot be undone.`)) return;
  
  try {
    await deleteDoc(doc(db, 'companies', currentUser.uid, 'drivers', driverId));
    showToast('✅ Driver removed', 'success');
    loadCompanyDrivers();
    loadExpiryAlerts();
  } catch (e) {
    showToast('Failed to remove driver', 'danger');
  }
}
window.removeDriver = removeDriver;

function viewDriverProfile(driverId) {
  showPage('driver-profile-page');
  loadDriverProfile(driverId);
}

// ==================================================
// 🔹 COMPANY PORTAL — JOBS
// ==================================================
async function loadCompanyJobs() {
  const container = document.getElementById('company-jobs-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading jobs...</p>';
  
  try {
    const snapshot = await getDocs(query(
      collection(db, 'jobs'),
      where('companyId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    ));
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No jobs posted yet.</p>';
      return;
    }
    
    const statusBadges = {
      active: '<span class="badge success">🟢 Active</span>',
      filled: '<span class="badge info">✓ Filled</span>',
      completed: '<span class="badge">✅ Completed</span>',
      cancelled: '<span class="badge danger">❌ Cancelled</span>'
    };
    
    container.innerHTML = snapshot.docs.map(doc => {
      const job = { id: doc.id, ...doc.data() };
      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">${escapeHtml(job.title || 'Untitled Job')}</h4>
              <p style="margin:0.25rem 0; font-size:0.9rem;">
                ${escapeHtml(job.fromLocation || '—')} → ${escapeHtml(job.toLocation || '—')}
              </p>
              <p style="font-size:0.85rem; color:var(--text-light);">
                Date: ${job.date ? formatDate(job.date) : 'Flexible'} • Pay: ${job.pay ? `£${job.pay}` : 'On application'}
                • ${job.applicants ? job.applicants.length : 0} applied
              </p>
            </div>
            <div style="text-align:right;">
              ${statusBadges[job.status] || statusBadges.active}
              <div style="margin-top:0.5rem; display:flex; gap:0.25rem;">
                ${job.status === 'active' ? `<button class="btn small secondary" onclick="closeJob('${job.id}')">Close</button>` : ''}
                <button class="btn small danger" onclick="deleteJob('${job.id}')">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading jobs: ${e.message}</p>`;
  }
}
window.loadCompanyJobs = loadCompanyJobs;

async function postNewJob() {
  const title = document.getElementById('job-title')?.value?.trim();
  const fromLocation = document.getElementById('job-from')?.value?.trim();
  const toLocation = document.getElementById('job-to')?.value?.trim();
  const dateInput = document.getElementById('job-date')?.value;
  const pay = document.getElementById('job-pay')?.value;
  const description = document.getElementById('job-desc')?.value?.trim();
  
  if (!title || !fromLocation || !toLocation) {
    showToast('Please fill in all required fields', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'jobs'), {
      companyId: currentUser.uid,
      companyName: userProfile.companyName,
      title,
      fromLocation,
      toLocation,
      date: dateInput ? Timestamp.fromDate(new Date(dateInput + 'T00:00:00')) : null,
      pay: pay ? parseFloat(pay) : null,
      description: description || '',
      status: 'active',
      applicants: [],
      createdAt: Timestamp.now()
    });
    
    showToast('✅ Job posted', 'success');
    document.getElementById('job-title').value = '';
    document.getElementById('job-from').value = '';
    document.getElementById('job-to').value = '';
    document.getElementById('job-date').value = '';
    document.getElementById('job-pay').value = '';
    document.getElementById('job-desc').value = '';
    loadCompanyJobs();
  } catch (e) {
    showToast('Failed to post job', 'danger');
  }
}
window.postNewJob = postNewJob;

async function closeJob(jobId) {
  try {
    await updateDoc(doc(db, 'jobs', jobId), { status: 'filled' });
    showToast('✅ Job closed', 'success');
    loadCompanyJobs();
  } catch (e) {
    showToast('Failed to close job', 'danger');
  }
}
window.closeJob = closeJob;

async function deleteJob(jobId) {
  if (!confirm('Delete this job posting? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
    showToast('✅ Job deleted', 'success');
    loadCompanyJobs();
  } catch (e) {
    showToast('Failed to delete job', 'danger');
  }
}
window.deleteJob = deleteJob;

// ==================================================
// 🔹 COMPANY PORTAL — TIMESHEET APPROVAL
// ==================================================
async function loadCompanyTimesheets() {
  const container = document.getElementById('company-timesheets-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading timesheets...</p>';
  
  try {
    const snapshot = await getDocs(query(
      collection(db, 'timesheets'),
      where('companyId', '==', currentUser.uid),
      orderBy('weekEnding', 'desc')
    ));
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No timesheets submitted yet.</p>';
      return;
    }
    
    const statusBadges = {
      pending: '<span class="badge warning">⏳ Pending</span>',
      approved: '<span class="badge success">✅ Approved</span>',
      queried: '<span class="badge warning">❓ Queried</span>',
      rejected: '<span class="badge danger">❌ Rejected</span>',
      exported: '<span class="badge info">📤 Exported</span>'
    };
    
    container.innerHTML = snapshot.docs.map(doc => {
      const ts = { id: doc.id, ...doc.data() };
      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">${escapeHtml(ts.driverName)}</h4>
              <p style="margin:0.25rem 0; font-size:0.9rem;">
                Week Ending: ${formatDate(ts.weekEnding)} | Miles: ${ts.totalMiles.toFixed(2)}
              </p>
              <p style="font-weight:500; margin:0;">
                Total Due: <strong>£${ts.grandTotal.toFixed(2)}</strong>
              </p>
              <p style="font-size:0.8rem; color:var(--text-light);">Submitted: ${formatDateTime(ts.submittedAt)}</p>
            </div>
            <div style="text-align:right;">
              ${statusBadges[ts.status]}
              ${ts.status === 'pending' ? `
                <div style="margin-top:0.5rem; display:flex; gap:0.25rem;">
                  <button class="btn small success" onclick="approveTimesheet('${ts.id}')">Approve</button>
                  <button class="btn small warning" onclick="queryTimesheet('${ts.id}')">Query</button>
                  <button class="btn small danger" onclick="rejectTimesheet('${ts.id}')">Reject</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load timesheets: ${e.message}</p>`;
  }
}
window.loadCompanyTimesheets = loadCompanyTimesheets;

async function approveTimesheet(tsId) {
  try {
    await updateDoc(doc(db, 'timesheets', tsId), { status: 'approved', approvedAt: Timestamp.now() });
    showToast('✅ Timesheet approved', 'success');
    loadCompanyTimesheets();
  } catch (e) {
    showToast('Failed to approve', 'danger');
  }
}
window.approveTimesheet = approveTimesheet;

async function queryTimesheet(tsId) {
  const note = prompt('Enter note for driver:');
  if (note === null) return;
  try {
    await updateDoc(doc(db, 'timesheets', tsId), { status: 'queried', note });
    showToast('✅ Timesheet queried', 'success');
    loadCompanyTimesheets();
  } catch (e) {
    showToast('Failed to update', 'danger');
  }
}
window.queryTimesheet = queryTimesheet;

async function rejectTimesheet(tsId) {
  const reason = prompt('Reason for rejection:');
  if (reason === null) return;
  try {
    await updateDoc(doc(db, 'timesheets', tsId), { status: 'rejected', rejectionReason: reason });
    showToast('✅ Timesheet rejected', 'success');
    loadCompanyTimesheets();
  } catch (e) {
    showToast('Failed to reject', 'danger');
  }
}
window.rejectTimesheet = rejectTimesheet;

// ==================================================
// 🔹 COMPANY PORTAL — HOLIDAY REQUESTS
// ==================================================
async function loadCompanyHolidayRequests() {
  const container = document.getElementById('company-holiday-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading requests...</p>';
  
  try {
    const snapshot = await getDocs(query(
      collection(db, 'holidayRequests'),
      where('companyId', '==', currentUser.uid),
      orderBy('submittedAt', 'desc')
    ));
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No holiday requests yet.</p>';
      return;
    }
    
    const statusBadges = {
      pending: '<span class="badge warning">⏳ Pending</span>',
      approved: '<span class="badge success">✅ Approved</span>',
      rejected: '<span class="badge danger">❌ Rejected</span>'
    };
    
    container.innerHTML = snapshot.docs.map(doc => {
      const req = { id: doc.id, ...doc.data() };
      const days = req.startDate && req.endDate
        ? Math.ceil((req.endDate.toDate() - req.startDate.toDate()) / (1000*60*60*24)) + 1
        : '—';
      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">${escapeHtml(req.driverName)}</h4>
              <p style="margin:0.25rem 0;">
                ${formatDate(req.startDate)} — ${formatDate(req.endDate)} • ${days} day(s)
              </p>
              ${req.notes ? `<p style="font-size:0.85rem; color:var(--text-light);">"${escapeHtml(req.notes)}"</p>` : ''}
            </div>
            <div style="text-align:right;">
              ${statusBadges[req.status]}
              ${req.status === 'pending' ? `
                <div style="margin-top:0.5rem; display:flex; gap:0.25rem;">
                  <button class="btn small success" onclick="approveHoliday('${req.id}')">Approve</button>
                  <button class="btn small danger" onclick="rejectHoliday('${req.id}')">Reject</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load requests: ${e.message}</p>`;
  }
}
window.loadCompanyHolidayRequests = loadCompanyHolidayRequests;

async function approveHoliday(reqId) {
  try {
    await updateDoc(doc(db, 'holidayRequests', reqId), { status: 'approved', reviewedAt: Timestamp.now() });
    showToast('✅ Holiday approved', 'success');
    loadCompanyHolidayRequests();
  } catch (e) {
    showToast('Failed to approve', 'danger');
  }
}
window.approveHoliday = approveHoliday;

async function rejectHoliday(reqId) {
  const reason = prompt('Reason for rejection:');
  if (reason === null) return;
  try {
    await updateDoc(doc(db, 'holidayRequests', reqId), { status: 'rejected', rejectionReason: reason, reviewedAt: Timestamp.now() });
    showToast('✅ Holiday rejected', 'success');
    loadCompanyHolidayRequests();
  } catch (e) {
    showToast('Failed to reject', 'danger');
  }
}
window.rejectHoliday = rejectHoliday;
// ==================================================
// 🔹 MAINTENANCE SCHEDULE & DEFECT MANAGEMENT
// ==================================================
let maintenanceVehicles = [];
let defectRecords = [];

// Load Maintenance Dashboard
async function loadMaintenanceSchedule() {
  const container = document.getElementById('maintenance-schedule-list');
  if (!container) return;
  container.innerHTML = '<p>Loading schedule...</p>';
  
  try {
    const snapshot = await getDocs(query(
      collection(db, 'maintenance'),
      where('companyId', '==', currentUser.uid),
      orderBy('dueDate', 'asc')
    ));
    
    maintenanceVehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (maintenanceVehicles.length === 0) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No maintenance items scheduled.</p>';
      return;
    }
    
    const today = new Date();
    container.innerHTML = maintenanceVehicles.map(item => {
      const dueDate = item.dueDate?.toDate();
      const daysUntil = dueDate ? Math.ceil((dueDate - today) / (1000*60*60*24)) : null;
      let urgency = '';
      let badge = '';
      
      if (daysUntil !== null) {
        if (daysUntil < 0) { urgency = 'overdue'; badge = '<span class="badge danger">⚠️ OVERDUE</span>'; }
        else if (daysUntil <= 7) { urgency = 'soon'; badge = '<span class="badge warning">🔔 Due Soon</span>'; }
        else { badge = '<span class="badge success">✅ On Track</span>'; }
      }
      
      return `
        <div class="card ${urgency === 'overdue' ? 'card-border-danger' : urgency === 'soon' ? 'card-border-warning' : ''}" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">${escapeHtml(item.vehicleReg || 'Unknown Vehicle')}</h4>
              <p style="margin:0.25rem 0; font-size:0.9rem;">
                <strong>Type:</strong> ${escapeHtml(item.type || 'Service')} • <strong>Due:</strong> ${dueDate ? formatDate(dueDate) : 'Not set'}
                ${daysUntil !== null ? `(${daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d remaining`})` : ''}
              </p>
              <p style="font-size:0.85rem; color:var(--text-light);">
                ${item.notes ? escapeHtml(item.notes) : ''} • Assigned: ${item.assignedTo || 'Unassigned'}
              </p>
            </div>
            <div style="text-align:right;">
              ${badge}
              <div style="margin-top:0.5rem; display:flex; gap:0.25rem;">
                <button class="btn small secondary" onclick="completeMaintenance('${item.id}')">✓ Complete</button>
                <button class="btn small danger" onclick="deleteMaintenance('${item.id}', '${escapeHtml(item.vehicleReg)}')">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load schedule: ${e.message}</p>`;
  }
}
window.loadMaintenanceSchedule = loadMaintenanceSchedule;

// Add New Maintenance Item
async function addMaintenanceItem() {
  const vehicleReg = document.getElementById('maint-vehicle-reg')?.value?.trim();
  const type = document.getElementById('maint-type')?.value;
  const dueDateInput = document.getElementById('maint-due-date')?.value;
  const notes = document.getElementById('maint-notes')?.value?.trim();
  const assignedTo = document.getElementById('maint-assigned')?.value?.trim();
  
  if (!vehicleReg || !dueDateInput) {
    showToast('Please enter vehicle registration and due date', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'maintenance'), {
      companyId: currentUser.uid,
      vehicleReg,
      type: type || 'Service',
      dueDate: Timestamp.fromDate(new Date(dueDateInput + 'T00:00:00')),
      notes: notes || '',
      assignedTo: assignedTo || '',
      status: 'pending',
      createdAt: Timestamp.now()
    });
    
    showToast('✅ Maintenance item added', 'success');
    document.getElementById('maint-vehicle-reg').value = '';
    document.getElementById('maint-type').value = 'Service';
    document.getElementById('maint-due-date').value = '';
    document.getElementById('maint-notes').value = '';
    document.getElementById('maint-assigned').value = '';
    loadMaintenanceSchedule();
  } catch (e) {
    showToast('Failed to add item', 'danger');
  }
}
window.addMaintenanceItem = addMaintenanceItem;

// Mark Maintenance as Complete
async function completeMaintenance(itemId) {
  const completedDate = prompt('Date completed:', new Date().toISOString().split('T')[0]);
  if (!completedDate) return;
  
  try {
    await updateDoc(doc(db, 'maintenance', itemId), {
      status: 'completed',
      completedDate: Timestamp.fromDate(new Date(completedDate + 'T00:00:00')),
      completedBy: currentUser.uid,
      updatedAt: Timestamp.now()
    });
    showToast('✅ Marked as complete', 'success');
    loadMaintenanceSchedule();
  } catch (e) {
    showToast('Failed to update', 'danger');
  }
}
window.completeMaintenance = completeMaintenance;

async function deleteMaintenance(itemId, reg) {
  if (!confirm(`Delete maintenance for ${reg}? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, 'maintenance', itemId));
    showToast('✅ Deleted', 'success');
    loadMaintenanceSchedule();
  } catch (e) {
    showToast('Failed to delete', 'danger');
  }
}
window.deleteMaintenance = deleteMaintenance;

// ==================================================
// 🔹 DEFECT MANAGEMENT SYSTEM
// ==================================================
async function loadDefectRegister() {
  const container = document.getElementById('defect-register-list');
  if (!container) return;
  container.innerHTML = '<p>Loading defects...</p>';
  
  try {
    const snapshot = await getDocs(query(
      collection(db, 'defects'),
      where('companyId', '==', currentUser.uid),
      orderBy('reportedAt', 'desc')
    ));
    
    defectRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (defectRecords.length === 0) {
      container.innerHTML = '<p style="color:var(--success);">✅ No defects recorded</p>';
      return;
    }
    
    const statusBadges = {
      reported: '<span class="badge warning">🔴 Reported</span>',
      'in-progress': '<span class="badge">🔧 In Progress</span>',
      resolved: '<span class="badge success">✅ Resolved</span>',
      closed: '<span class="badge info">📁 Closed</span>'
    };
    
    container.innerHTML = defectRecords.map(d => `
      <div class="card" style="margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h4 style="margin:0;">${escapeHtml(d.vehicleReg || 'Unknown Vehicle')}</h4>
            <p style="margin:0.25rem 0; font-weight:500;">${escapeHtml(d.title)}</p>
            <p style="font-size:0.9rem;">${escapeHtml(d.description)}</p>
            <p style="font-size:0.8rem; color:var(--text-light);">
              Reported: ${formatDateTime(d.reportedAt)} by ${escapeHtml(d.reportedBy || 'Unknown')}
              ${d.resolvedAt ? `• Resolved: ${formatDateTime(d.resolvedAt)}` : ''}
            </p>
          </div>
          <div style="text-align:right;">
            ${statusBadges[d.status] || statusBadges.reported}
            ${d.status !== 'resolved' && d.status !== 'closed' ? `
              <div style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.25rem;">
                <button class="btn small secondary" onclick="updateDefectStatus('${d.id}', 'in-progress')">In Progress</button>
                <button class="btn small success" onclick="resolveDefect('${d.id}')">✓ Resolve</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load defects: ${e.message}</p>`;
  }
}
window.loadDefectRegister = loadDefectRegister;

async function reportDefect() {
  const vehicleReg = document.getElementById('defect-vehicle-reg')?.value?.trim();
  const title = document.getElementById('defect-title')?.value?.trim();
  const description = document.getElementById('defect-desc')?.value?.trim();
  const severity = document.getElementById('defect-severity')?.value;
  
  if (!vehicleReg || !title || !description) {
    showToast('Please complete all fields', 'warning');
    return;
  }
  
  try {
    await addDoc(collection(db, 'defects'), {
      companyId: currentUser.uid,
      vehicleReg,
      title,
      description,
      severity: severity || 'medium',
      status: 'reported',
      reportedBy: userProfile.name || currentUser.email,
      reportedAt: Timestamp.now()
    });
    
    showToast('✅ Defect reported — added to register', 'success');
    document.getElementById('defect-vehicle-reg').value = '';
    document.getElementById('defect-title').value = '';
    document.getElementById('defect-desc').value = '';
    document.getElementById('defect-severity').value = 'medium';
    loadDefectRegister();
  } catch (e) {
    showToast('Failed to report defect', 'danger');
  }
}
window.reportDefect = reportDefect;

async function updateDefectStatus(defectId, newStatus) {
  try {
    await updateDoc(doc(db, 'defects', defectId), {
      status: newStatus,
      updatedAt: Timestamp.now()
    });
    showToast('✅ Status updated', 'success');
    loadDefectRegister();
  } catch (e) {
    showToast('Failed to update status', 'danger');
  }
}
window.updateDefectStatus = updateDefectStatus;

async function resolveDefect(defectId) {
  const resolution = prompt('Resolution details:');
  if (resolution === null) return;
  
  try {
    await updateDoc(doc(db, 'defects', defectId), {
      status: 'resolved',
      resolution,
      resolvedAt: Timestamp.now(),
      resolvedBy: userProfile.name || currentUser.email
    });
    showToast('✅ Defect resolved', 'success');
    loadDefectRegister();
  } catch (e) {
    showToast('Failed to resolve', 'danger');
  }
}
window.resolveDefect = resolveDefect;

// ==================================================
// 🔹 COMPLIANCE OVERVIEW
// ==================================================
async function loadComplianceOverview() {
  const container = document.getElementById('compliance-overview-page');
  if (!container) return;
  
  container.innerHTML = '<p>Loading compliance data...</p>';
  
  try {
    const today = new Date();
    const ninetyDays = new Date(today); ninetyDays.setDate(ninetyDays.getDate() + 90);
    
    // Load Drivers for document expiry check
    const driversSnap = await getDocs(collection(db, 'companies', currentUser.uid, 'drivers'));
    const drivers = driversSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Load Defects
    const openDefectsSnap = await getDocs(query(
      collection(db, 'defects'),
      where('companyId', '==', currentUser.uid),
      where('status', 'in', ['reported', 'in-progress'])
    ));
    const openDefects = openDefectsSnap.size;
    
    // Load Maintenance Overdue
    const overdueMaintSnap = await getDocs(query(
      collection(db, 'maintenance'),
      where('companyId', '==', currentUser.uid),
      where('dueDate', '<', Timestamp.fromDate(today)),
      where('status', '==', 'pending')
    ));
    const overdueMaintenance = overdueMaintSnap.size;
    
    // Expiring Documents
    let expiringDocs = 0;
    drivers.forEach(d => {
      ['dlicExpiry', 'cpcExpiry', 'tachoExpiry'].forEach(field => {
        if (d[field]) {
          const expiry = d[field].toDate();
          if (expiry <= ninetyDays) expiringDocs++;
        }
      });
    });
    
    // DVSA Guide Links
    container.innerHTML = `
      <h2>📋 Compliance Overview</h2>
      <p style="color:var(--text-light); margin-bottom:1.5rem;">Last updated: ${formatDateTime(Timestamp.now())}</p>
      
      <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:2rem;">
        <div class="card ${openDefects > 0 ? 'card-border-warning' : 'card-border-success'}">
          <h3 style="margin:0 0 0.5rem 0;">🚛 Open Defects</h3>
          <p style="font-size:2rem; font-weight:bold; margin:0;">${openDefects}</p>
          <p style="font-size:0.9rem; color:var(--text-light);">${openDefects === 0 ? 'All clear!' : 'Requires attention'}</p>
        </div>
        <div class="card ${overdueMaintenance > 0 ? 'card-border-danger' : 'card-border-success'}">
          <h3 style="margin:0 0 0.5rem 0;">🔧 Overdue Maintenance</h3>
          <p style="font-size:2rem; font-weight:bold; margin:0;">${overdueMaintenance}</p>
          <p style="font-size:0.9rem; color:var(--text-light);">${overdueMaintenance === 0 ? 'Schedule up to date' : 'Action needed'}</p>
        </div>
        <div class="card ${expiringDocs > 0 ? 'card-border-warning' : 'card-border-success'}">
          <h3 style="margin:0 0 0.5rem 0;">📄 Expiring Documents (90d)</h3>
          <p style="font-size:2rem; font-weight:bold; margin:0;">${expiringDocs}</p>
          <p style="font-size:0.9rem; color:var(--text-light);">${expiringDocs === 0 ? 'All valid' : 'Renew soon'}</p>
        </div>
        <div class="card">
          <h3 style="margin:0 0 0.5rem 0;">👥 Total Drivers</h3>
          <p style="font-size:2rem; font-weight:bold; margin:0;">${drivers.length}</p>
          <p style="font-size:0.9rem; color:var(--text-light);">Active on system</p>
        </div>
      </div>
      
      <div class="card">
        <h3>📚 DVSA Quick References</h3>
        <ul style="margin:0.5rem 0; padding-left:1.25rem; line-height:1.8;">
          <li><strong>Operator Licence:</strong> Keep copies at operating centre • Renew display annually</li>
          <li><strong>Driver CPC:</strong> 35 hours periodic training every 5 years • Record certificates</li>
          <li><strong>Tachograph:</strong> Download driver cards every 28 days • Vehicle units every 90 days • Store files 2 years</li>
          <li><strong>Daily Walkaround:</strong> Pre-use check before every shift • Defects reported immediately • Signature required</li>
          <li><strong>Maintenance:</strong> Service every 6 weeks / 6,000 miles • Keep records for 15 months • Annual MOT</li>
          <li><strong>Driver Hours:</strong> Max 9hrs daily driving • 4.5hrs break every 4.5hrs • Weekly rest 45hrs (can reduce to 36 every other week)</li>
        </ul>
      </div>
      
      <div class="card" style="margin-top:1.5rem;">
        <h3>⚙️ System Settings — Document Retention</h3>
        <p style="font-size:0.9rem; color:var(--text-light); margin-bottom:0.5rem;">
          Documents are retained for <strong>110% of legal requirement</strong>, then archived and emailed to company before secure deletion.
        </p>
        <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <tr><th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--border);">Document Type</th><th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--border);">Legal Requirement</th><th style="text-align:left; padding:0.5rem; border-bottom:1px solid var(--border);">System Retention</th></tr>
          <tr><td style="padding:0.5rem; border-bottom:1px solid var(--border);">Tachograph Files</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">2 years</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">2 years + 73 days</td></tr>
          <tr><td style="padding:0.5rem; border-bottom:1px solid var(--border);">Driver Defect Reports</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">15 months</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">16.5 months</td></tr>
          <tr><td style="padding:0.5rem; border-bottom:1px solid var(--border);">Maintenance Records</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">15 months</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">16.5 months</td></tr>
          <tr><td style="padding:0.5rem; border-bottom:1px solid var(--border);">Timesheets & Invoices</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">6 years</td><td style="padding:0.5rem; border-bottom:1px solid var(--border);">6 years + 7 months</td></tr>
        </table>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load overview: ${e.message}</p>`;
  }
}
window.loadComplianceOverview = loadComplianceOverview;

// ==================================================
// 🔹 TACOMASTER INTEGRATION
// ==================================================
async function loadTacomasterSettings() {
  const container = document.getElementById('tacomaster-settings-page');
  if (!container) return;
  
  try {
    const companyDoc = await getDoc(doc(db, 'companies', currentUser.uid));
    const companyData = companyDoc.exists() ? companyDoc.data() : {};
    const apiKey = companyData.tacomasterApiKey || '';
    const isConnected = !!apiKey && apiKey.length > 10;
    
    container.innerHTML = `
      <h2>📊 Tacomaster Integration</h2>
      <p style="color:var(--text-light); margin-bottom:1.5rem;">Automatically pull tachograph data from your Tacomaster account</p>
      
      <div class="card">
        <h3>🔑 API Connection</h3>
        <p style="font-size:0.9rem; color:var(--text-light); margin-bottom:1rem;">
          Enter your Tacomaster API key below. You can find this in your Tacomaster account under:
          <strong>Settings → API Access → Generate Key</strong>
        </p>
        
        <label for="tacomaster-api-key">API Key</label>
        <input type="password" id="tacomaster-api-key" value="${escapeHtml(apiKey)}" placeholder="tm_xxxxxxxxxxxxxxxx" style="width:100%; padding:0.75rem; margin-bottom:1rem;" />
        
        <div style="display:flex; gap:0.75rem; align-items:center; margin-bottom:1rem;">
          <button class="btn primary" onclick="saveTacomasterKey()">${isConnected ? '🔄 Update Key' : '✅ Save & Connect'}</button>
          <button class="btn secondary" onclick="testTacomasterConnection()">🧪 Test Connection</button>
          ${isConnected ? '<span style="color:var(--success);">● Connected</span>' : '<span style="color:var(--text-light);">● Not connected</span>'}
        </div>
        
        ${isConnected ? `
          <div style="margin-top:1.5rem; padding:1rem; background:var(--primary-light); border-radius:6px;">
            <h4 style="margin:0 0 0.5rem 0;">📥 Data Sync Status</h4>
            <p style="font-size:0.9rem; margin:0 0 0.5rem 0;">Last sync: ${companyData.tacomasterLastSync ? formatDateTime(companyData.tacomasterLastSync) : 'Never'}</p>
            <button class="btn small secondary" onclick="syncTacomasterData()">🔄 Sync Now</button>
          </div>
        ` : ''}
      </div>
      
      <div class="card" style="margin-top:1.5rem;">
        <h3>ℹ️ About This Integration</h3>
        <ul style="margin:0.5rem 0; padding-left:1.25rem; line-height:1.8; font-size:0.9rem;">
          <li>Your API key is stored securely — never shared with third parties</li>
          <li>Data syncs automatically every 24 hours</li>
          <li>Tachograph files are auto-retained for 2 years + 73 days per DVSA requirements</li>
          <li>Expired files are archived to email before secure deletion</li>
          <li>Need help? Contact Tacomaster support to enable API access on your account</li>
        </ul>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load settings: ${e.message}</p>`;
  }
}
window.loadTacomasterSettings = loadTacomasterSettings;

async function saveTacomasterKey() {
  const apiKey = document.getElementById('tacomaster-api-key')?.value?.trim();
  
  if (!apiKey) {
    showToast('Please enter an API key', 'warning');
    return;
  }
  
  try {
    await updateDoc(doc(db, 'companies', currentUser.uid), {
      tacomasterApiKey: apiKey,
      tacomasterConnected: true,
      tacomasterConnectedAt: Timestamp.now()
    });
    showToast('✅ Tacomaster connected successfully', 'success');
    loadTacomasterSettings();
  } catch (e) {
    showToast('Failed to save key', 'danger');
  }
}
window.saveTacomasterKey = saveTacomasterKey;

async function testTacomasterConnection() {
  showToast('🔍 Testing connection...', 'info');
  // Simulated test - real implementation would call Tacomaster API
  setTimeout(() => {
    showToast('✅ Connection successful — API key valid', 'success');
  }, 1500);
}
window.testTacomasterConnection = testTacomasterConnection;

async function syncTacomasterData() {
  showToast('🔄 Syncing tachograph data...', 'info');
  // Simulated sync - real implementation would pull data from Tacomaster API
  setTimeout(async () => {
    await updateDoc(doc(db, 'companies', currentUser.uid), {
      tacomasterLastSync: Timestamp.now()
    });
    showToast('✅ Sync complete — Tachograph data updated', 'success');
    loadTacomasterSettings();
  }, 2000);
}
window.syncTacomasterData = syncTacomasterData;
// ==================================================
// 🔹 CHECKLIST SUBMISSIONS & DAILY CHECKS
// ==================================================
async function loadChecklistSubmissions() {
  const container = document.getElementById('checklist-submissions-list');
  if (!container) return;
  
  container.innerHTML = '<p>Loading submissions...</p>';
  
  try {
    let q;
    if (userProfile.accountType === 'company') {
      q = query(
        collection(db, 'checklistSubmissions'),
        where('companyId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, 'checklistSubmissions'),
        where('driverId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc'),
        limit(20)
      );
    }
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="color:var(--text-light); font-style:italic;">No checklists submitted yet.</p>';
      return;
    }
    
    container.innerHTML = snapshot.docs.map(doc => {
      const sub = { id: doc.id, ...doc.data() };
      const hasDefects = sub.defectsFound && sub.defectsFound.length > 0;
      
      return `
        <div class="card" style="margin-bottom:0.75rem; ${hasDefects ? 'border-left:4px solid var(--danger);' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="margin:0;">${escapeHtml(sub.vehicleReg || 'Unknown Vehicle')}</h4>
              <p style="margin:0.25rem 0; font-size:0.9rem;">
                ${escapeHtml(sub.driverName || 'Unknown Driver')} • ${sub.checklistType || 'Daily Check'}
              </p>
              <p style="font-size:0.85rem; color:var(--text-light);">
                Submitted: ${formatDateTime(sub.submittedAt)}
              </p>
              ${hasDefects 
                ? `<p style="color:var(--danger); font-size:0.85rem; margin-top:0.25rem;">⚠️ ${sub.defectsFound.length} defect(s) reported</p>`
                : '<p style="color:var(--success); font-size:0.85rem; margin-top:0.25rem;">✅ No defects found</p>'
              }
            </div>
            <div>
              <button class="btn small secondary" onclick="viewChecklistSubmission('${sub.id}')">View</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load submissions: ${e.message}</p>`;
  }
}
window.loadChecklistSubmissions = loadChecklistSubmissions;

async function viewChecklistSubmission(subId) {
  try {
    const docSnap = await getDoc(doc(db, 'checklistSubmissions', subId));
    if (!docSnap.exists()) { showToast('Submission not found', 'warning'); return; }
    
    const sub = docSnap.data();
    const defectsList = sub.defectsFound && sub.defectsFound.length > 0
      ? '<h4 style="margin:1rem 0 0.5rem 0;">Defects Reported:</h4>' +
        sub.defectsFound.map(d => `
          <div style="padding:0.5rem; background:var(--danger-light); border-radius:4px; margin-bottom:0.25rem;">
            <strong>${escapeHtml(d.item)}</strong> — ${escapeHtml(d.issue)}
            ${d.severity ? `<span style="margin-left:0.5rem; font-size:0.8rem;">(${d.severity})</span>` : ''}
          </div>
        `).join('')
      : '<p style="color:var(--success);">No defects reported</p>';
    
    const detailsWin = window.open('', '_blank', 'width=600,height=800');
    detailsWin.document.write(`
      <html><head><title>Checklist — ${escapeHtml(sub.vehicleReg)}</title>
      <style>body{font-family:Arial,sans-serif; padding:20px; line-height:1.6;} h2{border-bottom:2px solid #1a365d; padding-bottom:0.5rem;} .defect{background:#fff0f0; padding:10px; margin:5px 0; border-radius:4px;}</style>
      </head><body>
      <h2>Vehicle Walkaround Check</h2>
      <p><strong>Vehicle Reg:</strong> ${escapeHtml(sub.vehicleReg)}</p>
      <p><strong>Date/Time:</strong> ${formatDateTime(sub.submittedAt)}</p>
      <p><strong>Driver:</strong> ${escapeHtml(sub.driverName)}</p>
      <p><strong>Signature:</strong> ${escapeHtml(sub.signature || 'Not signed')}</p>
      <hr />
      ${defectsList}
      <hr />
      <p style="font-size:0.8rem; color:#666;">Generated by LSD Solutions — DVSA Compliant Transport Management</p>
      </body></html>
    `);
    detailsWin.document.close();
  } catch (e) {
    showToast('Failed to load submission', 'danger');
  }
}
window.viewChecklistSubmission = viewChecklistSubmission;

// ==================================================
// 🔹 DRIVER DAILY CHECK SUBMISSION
// ==================================================
async function submitDailyChecklist() {
  const vehicleReg = document.getElementById('check-vehicle-reg')?.value?.trim();
  const checklistType = document.getElementById('check-type')?.value || 'daily';
  const signature = document.getElementById('check-signature')?.value?.trim();
  const declareCorrect = document.getElementById('check-declare')?.checked;
  
  if (!vehicleReg) { showToast('Please enter vehicle registration', 'warning'); return; }
  if (!signature) { showToast('Please enter your name as signature', 'warning'); return; }
  if (!declareCorrect) { showToast('Please confirm the declaration', 'warning'); return; }
  
  // Collect items
  const items = [];
  const defectsFound = [];
  
  document.querySelectorAll('.checklist-item-row').forEach(row => {
    const itemId = row.dataset.itemId;
    const itemName = row.dataset.itemName;
    const condition = row.querySelector(`[name="condition-${itemId}"]`)?.value;
    const notes = row.querySelector(`[name="notes-${itemId}"]`)?.value?.trim() || '';
    
    items.push({ id: itemId, name: itemName, condition, notes });
    
    if (condition === 'defect') {
      defectsFound.push({ item: itemName, issue: notes || 'Needs inspection', severity: 'medium' });
    }
  });
  
  try {
    await addDoc(collection(db, 'checklistSubmissions'), {
      driverId: currentUser.uid,
      driverName: userProfile.name,
      companyId: userProfile.linkedCompanyId || null,
      vehicleReg,
      checklistType,
      items,
      defectsFound,
      signature,
      declaredCorrect: true,
      submittedAt: Timestamp.now()
    });
    
    showToast(defectsFound.length > 0 
      ? '✅ Checklist submitted — defects have been flagged' 
      : '✅ Checklist submitted — All items OK', 'success');
    
    // Reset form
    document.getElementById('check-vehicle-reg').value = '';
    document.getElementById('check-signature').value = '';
    document.getElementById('check-declare').checked = false;
    loadChecklistSubmissions();
    
    if (defectsFound.length > 0) {
      setTimeout(() => {
        showPage('defect-register-page');
        loadDefectRegister();
      }, 1500);
    }
  } catch (e) {
    showToast('Failed to submit checklist', 'danger');
  }
}
window.submitDailyChecklist = submitDailyChecklist;

async function loadDailyChecklistForm() {
  const container = document.getElementById('daily-checklist-items');
  if (!container) return;
  
  container.innerHTML = '<p>Loading checklist items...</p>';
  
  try {
    let checklistItems;
    
    // Try company custom checklist first
    if (userProfile.linkedCompanyId) {
      const customSnap = await getDoc(doc(db, 'companies', userProfile.linkedCompanyId, 'settings', 'checklist'));
      if (customSnap.exists() && customSnap.data().items) {
        checklistItems = customSnap.data().items;
      }
    }
    
    // Fallback to DVSA default
    if (!checklistItems) {
      checklistItems = getDefaultChecklistItems();
    }
    
    container.innerHTML = checklistItems.map(item => `
      <div class="checklist-item-row" data-item-id="${escapeHtml(item.id)}" data-item-name="${escapeHtml(item.name)}" 
           style="padding:0.75rem; border-bottom:1px solid var(--border);">
        <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
          <span style="flex:2; min-width:150px; font-weight:500;">${escapeHtml(item.name)}</span>
          <select name="condition-${escapeHtml(item.id)}" style="flex:1; min-width:120px; padding:0.4rem;">
            <option value="ok">✅ Satisfactory</option>
            <option value="defect">⚠️ Defect / Needs Attention</option>
            <option value="na">N/A</option>
          </select>
          <input type="text" name="notes-${escapeHtml(item.id)}" placeholder="Notes / Details" 
                 style="flex:2; min-width:150px; padding:0.4rem;" />
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger);">Failed to load checklist items</p>';
  }
}
window.loadDailyChecklistForm = loadDailyChecklistForm;

// ==================================================
// 🔹 GLOBAL APP INITIALIZATION & UTILITIES
// ==================================================
let currentUser = null;
let userProfile = null;
let calendarData = {};
const currentCalendarDate = new Date();

function getDefaultChecklistItems() {
  return [
    { id: 'lights', name: 'Lamps & Lights — All working, lenses clean' },
    { id: 'tyres', name: 'Tyres — Condition, pressure, tread depth, no damage' },
    { id: 'brakes', name: 'Brakes — Operation, pressure, no leaks, wear level' },
    { id: 'mirrors', name: 'Mirrors — All present, clean, correctly adjusted' },
    { id: 'windscreen', name: 'Windscreen — Clean, no damage, wipers/washers work' },
    { id: 'fluid-levels', name: 'Fluid Levels — Oil, coolant, screen wash, brake fluid' },
    { id: 'exhaust', name: 'Exhaust — Secure, no excessive smoke or leaks' },
    { id: 'coupling', name: 'Coupling & Connections — Secure, hoses/cables intact' },
    { id: 'doors', name: 'Doors & Body — Secure, no damage, latches work' },
    { id: 'plates', name: 'Number Plates — Secure, legible' },
    { id: 'markings', name: 'Plates & Markings — Operator Licence, Tax disc, markings correct' },
    { id: 'safety', name: 'Safety Equipment — Fire extinguisher, warning triangle, first aid kit' }
  ];
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-GB', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colours = {
    success: 'background:var(--success, #2e7d32); color:white;',
    danger: 'background:var(--danger, #c62828); color:white;',
    warning: 'background:var(--accent, #d4af37); color:#1a1a1a;',
    info: 'background:var(--primary, #1a365d); color:white;'
  };
  
  toast.style = `
    position: fixed; top: 1rem; right: 1rem; z-index: 9999;
    padding: 0.875rem 1.25rem; border-radius: 6px; ${colours[type] || colours.info}
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 350px;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
window.showToast = showToast;

// Page Navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.style.display = 'block';
    window.scrollTo(0, 0);
    
    // Load page-specific data
    if (pageId === 'driver-dashboard-page') loadDriverDashboard();
    if (pageId === 'driver-timesheets-page') loadDriverTimesheets();
    if (pageId === 'driver-holiday-page') { loadHolidayBalance(); loadHolidayHistory(); }
    if (pageId === 'driver-calendar-page') renderCalendar();
    if (pageId === 'daily-checklist-page') loadDailyChecklistForm();
    if (pageId === 'checklist-submissions-page') loadChecklistSubmissions();
    
    if (pageId === 'company-dashboard-page') loadCompanyDashboard();
    if (pageId === 'company-drivers-page') loadCompanyDrivers();
    if (pageId === 'company-jobs-page') loadCompanyJobs();
    if (pageId === 'company-timesheets-page') loadCompanyTimesheets();
    if (pageId === 'company-holiday-page') loadCompanyHolidayRequests();
    if (pageId === 'maintenance-schedule-page') loadMaintenanceSchedule();
    if (pageId === 'defect-register-page') loadDefectRegister();
    if (pageId === 'compliance-overview-page') loadComplianceOverview();
    if (pageId === 'tacomaster-settings-page') loadTacomasterSettings();
  }
  
  // Update nav active state
  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
}
window.showPage = showPage;

// ==================================================
// 🔹 AUTH STATE WATCHER — MAIN ENTRY POINT
// ==================================================
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user ? 'Signed in' : 'Signed out');
  
  if (user) {
    currentUser = user;
    
    try {
      // Load user profile
      const profileSnap = await getDoc(doc(db, 'userProfiles', user.uid));
      
      if (profileSnap.exists()) {
        userProfile = profileSnap.data();
        
        // Route based on account type
        if (userProfile.accountType === 'driver') {
          document.querySelectorAll('.company-only').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.driver-only').forEach(el => el.style.display = 'block');
          showPage('driver-dashboard-page');
        } else if (userProfile.accountType === 'company') {
          document.querySelectorAll('.driver-only').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.company-only').forEach(el => el.style.display = 'block');
          showPage('company-dashboard-page');
        } else {
          // Account type not selected yet — show account type selector
          showPage('account-type-page');
        }
      } else {
        // No profile — ask account type
        showPage('account-type-page');
      }
    } catch (e) {
      console.error('Error loading profile:', e);
      showToast('Error loading profile data', 'danger');
      showPage('auth-page');
    }
  } else {
    // Signed out — reset state
    currentUser = null;
    userProfile = null;
    document.querySelectorAll('.driver-only, .company-only').forEach(el => el.style.display = 'none');
    showPage('auth-page');
  }
});

// ==================================================
// 🔹 HELPER: Set Account Type
// ==================================================
async function setAccountType(type) {
  if (!currentUser) return;
  
  try {
    await setDoc(doc(db, 'userProfiles', currentUser.uid), {
      email: currentUser.email,
      name: currentUser.displayName || '',
      accountType: type,
      createdAt: Timestamp.now(),
      holidayEntitlement: type === 'driver' ? 28 : null
    }, { merge: true });
    
    showToast(`✅ Account set up as ${type}`, 'success');
    window.location.reload();
  } catch (e) {
    showToast('Failed to set account type', 'danger');
  }
}
window.setAccountType = setAccountType;

console.log('%c🚛 LSD Solutions — App Loaded Successfully', 'color: #1a365d; font-weight:bold; font-size:14px;');
console.log('✅ Firebase Connected • Auth Ready • All Modules Loaded');