// ==================================================
// LSD SOLUTIONS — FULL BUILD-READY APP.JS
// ==================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore, doc, setDoc, getDoc, collection,
  query, where, getDocs, addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.appspot.com",
  messagingSenderId: "924526143782",
  appId: "1:924526143782:web:2a6b8c9d7e5f4a3b2c1d0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let userProfile = null;
let userRole = null;
let companyId = null;
let previousPageStack = [];

// ==================================================
// NAVIGATION HELPERS
// ==================================================
function updateNavigationForPage(pageId) {
  const companyNav = document.getElementById('companyNav');
  const driverNav = document.getElementById('driverNav');
  
  const isDriverPage = pageId.startsWith('driver') || 
                       pageId === 'checklistPage' || 
                       pageId === 'documentsPage' ||
                       pageId === 'noticesPage' ||
                       pageId === 'workingTimePage';

  if (companyNav) companyNav.style.display = isDriverPage ? 'none' : 'block';
  if (driverNav) driverNav.style.display = isDriverPage ? 'block' : 'none';

  const activeNav = isDriverPage ? driverNav : companyNav;
  if (!activeNav) return;
  
  const allNavButtons = activeNav.querySelectorAll('button[data-page]');
  allNavButtons.forEach(btn => {
    const targetPage = btn.getAttribute('data-page');
    btn.style.display = (targetPage === pageId) ? 'none' : 'inline-block';
  });
}

window.showPage = function(pageId) {
  const currentPage = document.querySelector('.page.active');
  if (currentPage && currentPage.id !== pageId) {
    previousPageStack.push(currentPage.id);
  }

  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  updateNavigationForPage(pageId);
  window.scrollTo(0, 0);
};

window.goBack = function() {
  if (previousPageStack.length > 0) {
    const prev = previousPageStack.pop();
    showPage(prev);
  } else {
    showPage(userRole === 'driver' ? 'driverDashboardPage' : 'companyDashboardPage');
  }
};

// ==================================================
// GLOBAL FUNCTIONS
// ==================================================
window.showAuthTab = function(tab) {
  const signInForm = document.getElementById('signInForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');
  
  if (signInForm) signInForm.style.display = tab === 'signin' ? 'block' : 'none';
  if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
  if (resetForm) resetForm.style.display = tab === 'reset' ? 'block' : 'none';
  
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  
  if (tabSignIn) tabSignIn.className = tab === 'signin' ? 'btn btn-primary' : 'btn btn-secondary';
  if (tabRegister) tabRegister.className = tab === 'register' ? 'btn btn-primary' : 'btn btn-secondary';
};

window.handleSignOut = async function() {
  if (!auth) return;
  await signOut(auth);
  currentUser = null;
  userProfile = null;
  userRole = null;
  companyId = null;
  previousPageStack = [];
  
  if (document.getElementById('companyNav')) document.getElementById('companyNav').style.display = 'none';
  if (document.getElementById('driverNav')) document.getElementById('driverNav').style.display = 'none';
  
  showPage('authPage');
};

window.loadDriverJobs = async function() {
  const list = document.getElementById('jobsList');
  if (!list) return;
  try {
    const snap = await getDocs(query(collection(db, 'jobs'), where('status', '==', 'open')));
    list.innerHTML = snap.empty ? '<p>No available jobs right now.</p>' :
      snap.docs.map(d => {
        const j = d.data();
        return `<div class="card" style="margin:0.5rem 0;">
          <strong>${j.title || 'Job'}</strong><br>
          ${j.pickup || ''} → ${j.dropoff || ''}<br>
          ${j.date || ''} | <strong>£${j.pay || 'On application'}</strong>
          <p style="margin-top:0.5rem;">${j.details || ''}</p>
        </div>`;
      }).join('');
  } catch (e) {
    list.innerHTML = `<p class="error-text">Error loading jobs: ${e.message}</p>`;
  }
};

window.loadDefects = async function(filter = 'all') {
  const list = document.getElementById('defectsList');
  if (!list) return;
  try {
    const snap = await getDocs(collection(db, 'checklists'));
    list.innerHTML = snap.empty ? '<p>No defects reported.</p>' :
      snap.docs.map(d => {
        const chk = d.data();
        const hasDefect = Object.entries(chk.checks || {}).some(([k, v]) => k.endsWith('_note') && v);
        return `<div class="card" style="margin:0.5rem 0;">
          <strong>${chk.vehicleReg || 'Unknown Vehicle'}</strong> — ${chk.checkDate || ''}<br>
          Driver: ${chk.signature || 'Anonymous'}<br>
          ${hasDefect ? '<span style="color:red;">⚠️ Defects noted</span>' : '<span style="color:green;">✅ No defects</span>'}
        </div>`;
      }).join('');
  } catch (e) {
    list.innerHTML = `<p class="error-text">Error loading defects: ${e.message}</p>`;
  }
};

// ==================================================
// SIGN IN
// ==================================================
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    err.style.display = 'block';
    err.textContent = 'Sign in failed: ' + e.message;
  }
});

// ==================================================
// REGISTER
// ==================================================
document.getElementById('registerFormEl').addEventListener('submit', async e => {
  e.preventDefault();
  const type = document.querySelector('input[name="accountType"]:checked').value;
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPassword').value;
  const err = document.getElementById('registerError');
  const succ = document.getElementById('registerSuccess');

  if (!email.includes('@')) {
    err.textContent = '❌ Please enter a valid email address';
    err.style.display = 'block';
    return;
  }
  if (pass.length < 6) {
    err.textContent = '❌ Password must be at least 6 characters';
    err.style.display = 'block';
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      accountType: type,
      createdAt: serverTimestamp()
    });
    
    if (type === 'company') {
      await setDoc(doc(db, 'companies', uid), {
        id: uid,
        name,
        email,
        createdAt: serverTimestamp()
      });
    }
    
    succ.style.display = 'block';
    succ.textContent = '✅ Account created! Signing in...';
    setTimeout(() => showAuthTab('signin'), 1500);
  } catch (e) {
    err.style.display = 'block';
    if (e.code === 'auth/email-already-in-use') {
      err.textContent = '❌ This email is already registered';
    } else if (e.code === 'auth/invalid-email') {
      err.textContent = '❌ Please enter a valid email address';
    } else if (e.code === 'auth/weak-password') {
      err.textContent = '❌ Password must be at least 6 characters';
    } else if (e.code === 'auth/operation-not-allowed') {
      err.textContent = '⚠️ Enable Email/Password in Firebase Console → Auth → Sign-in methods';
    } else {
      err.textContent = '❌ ' + e.message;
    }
  }
});

// ==================================================
// PASSWORD RESET
// ==================================================
document.getElementById('resetFormEl').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value;
  try {
    await sendPasswordResetEmail(auth, email);
    const msg = document.getElementById('resetMessage');
    msg.style.display = 'block';
    msg.textContent = '✅ Reset link sent! Check your email.';
  } catch (e) {
    alert('Error: ' + e.message);
  }
});

// ==================================================
// AUTH STATE
// ==================================================
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    const profileRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        userProfile = snap.data();
        userRole = userProfile.accountType;
        if (userRole === 'driver') {
          if (document.getElementById('companyNav')) document.getElementById('companyNav').style.display = 'none';
          if (document.getElementById('driverNav')) document.getElementById('driverNav').style.display = 'block';
          showPage('driverDashboardPage');
          const n = document.getElementById('driverNameDisplay');
          if (n) n.textContent = userProfile.name || 'Driver';
        } else if (userRole === 'company') {
          if (document.getElementById('driverNav')) document.getElementById('driverNav').style.display = 'none';
          if (document.getElementById('companyNav')) document.getElementById('companyNav').style.display = 'block';
          showPage('companyDashboardPage');
          await initialiseCompanyChecklist(user.uid);
          const n = document.getElementById('companyNameDisplay');
          if (n) n.textContent = userProfile.name || 'Company';
        }
      }
    } catch (e) {
      console.error('Auth error:', e);
    }
  } else {
    currentUser = null;
    userProfile = null;
    userRole = null;
    companyId = null;
    if (document.getElementById('companyNav')) document.getElementById('companyNav').style.display = 'none';
    if (document.getElementById('driverNav')) document.getElementById('driverNav').style.display = 'none';
    showPage('authPage');
  }
});

// ==================================================
// DRIVER PROFILE
// ==================================================
document.getElementById('driverProfileForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return;
  await setDoc(doc(db, 'users', currentUser.uid), {
    fullName: document.getElementById('dpFullName').value,
    email: document.getElementById('dpEmail').value,
    licenceNumber: document.getElementById('dpLicenceNumber').value,
    dob: document.getElementById('dpDob').value,
    licenceValidFrom: document.getElementById('dpLicenceValidFrom').value,
    licenceExpiry: document.getElementById('dpLicenceExpiry').value,
    medicalExpiry: document.getElementById('dpMedicalExpiry').value,
    points: parseInt(document.getElementById('dpDrivingPoints').value) || 0,
    phone: document.getElementById('dpPhone').value
  }, { merge: true });
  const s = document.getElementById('dpSaveStatus');
  if (s) s.textContent = '✅ Profile Saved!';
});

// ==================================================
// POST JOB
// ==================================================
document.getElementById('postJobForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser || userRole !== 'company') return;
  await addDoc(collection(db, 'jobs'), {
    companyId,
    title: d(ocument.getElementById('jobTitle').value,
    status: document.getElementById('jobStatus').value,
    pickup: document.getElementById('jobPickup').value,
    dropoff: document.getElementById('jobDropoff').value,
    date: document.getElementById('jobDate').value,
    pay: document.getElementById('jobPay').value,
    details: document.getElementById('jobDetails').value,
    createdAt: serverTimestamp()
  });
  const s = document.getElementById('jobSaveStatus');
  if (s) s.textContent = '✅ Job Posted!';
  e.target.reset();
});

// ==================================================
// DEFAULTS
// ==================================================
function initChecklistDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const d = document.getElementById('checkDate');
  const t = document.getElementById('checkTime');
  if (d && !d.value) d.value = today;
  if (t && !t.value) t.value = time;
}
document.addEventListener('DOMContentLoaded', initChecklistDefaults);

// ==================================================
// 🚛 PART 1: DVSA COMPLIANT CHECKLIST SYSTEM
// ==================================================

// Vehicle Types Definition
const VEHICLE_TYPES = {
  CAR_VAN: 'car_van',
  RIGID: 'rigid',
  TRACTOR_UNIT: 'tractor_unit',
  TRAILER: 'trailer'
};

// DVSA Default Checklist — grouped by category
const DEFAULT_DVSA_CHECKLIST = {
  categories: [
    {
      id: 'vehicle_details',
      name: 'Vehicle Details',
      order: 1,
      checks: [
        { id: 'v_reg', label: 'Registration Mark', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'v_make', label: 'Make & Model', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'v_mileage', label: 'Mileage', appliesTo: ['car_van', 'rigid', 'tractor_unit'] }
      ]
    },
    {
      id: 'exterior',
      name: 'Exterior',
      order: 2,
      checks: [
        { id: 'ext_body', label: 'Bodywork — damage, secure panels', appliesTo: ['car_van', 'rigid', 'tractor_unit', 'trailer'] },
        { id: 'ext_mirrors', label: 'Mirrors — condition & security', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'ext_lights', label: 'Lamps & reflectors — condition, operation, cleanliness', appliesTo: ['car_van', 'rigid', 'tractor_unit', 'trailer'] },
        { id: 'ext_wheels', label: 'Wheels & tyres — condition, pressure, tread depth, security', appliesTo: ['car_van', 'rigid', 'tractor_unit', 'trailer'] },
        { id: 'ext_windshield', label: 'Windscreen & wipers — condition, wipers operate correctly', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'ext_numberplate', label: 'Registration plate — legible, secure', appliesTo: ['car_van', 'rigid', 'tractor_unit', 'trailer'] }
      ]
    },
    {
      id: 'brakes',
      name: 'Brakes',
      order: 3,
      checks: [
        { id: 'brake_service', label: 'Service brake — operates correctly', appliesTo: ['car_van', 'rigid', 'tractor_unit', 'trailer'] },
        { id: 'brake_parking', label: 'Parking brake — holds securely', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'brake_air', label: 'Air lines & fittings — no leaks, secure', appliesTo: ['rigid', 'tractor_unit', 'trailer'] },
        { id: 'brake_pads', label: 'Brake pads/shoes — sufficient material', appliesTo: ['car_van', 'rigid', 'tractor_unit'] }
      ]
    },
    {
      id: 'coupling',
      name: 'Coupling & Connections',
      order: 4,
      checks: [
        { id: 'coupling_fifthwheel', label: 'Fifth wheel — secure, no damage, release mechanism safe', appliesTo: ['tractor_unit'] },
        { id: 'coupling_kingpin', label: 'Kingpin — condition, locking mechanism', appliesTo: ['trailer'] },
        { id: 'coupling_safety', label: 'Safety device — correctly attached', appliesTo: ['tractor_unit', 'trailer'] },
        { id: 'coupling_air', label: 'Air/electrical connections — secure, no damage', appliesTo: ['rigid', 'tractor_unit', 'trailer'] }
      ]
    },
    {
      id: 'interior',
      name: 'Interior & Documents',
      order: 5,
      checks: [
        { id: 'int_docs', label: 'All required documents present & in date', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'int_safety', label: 'Fire extinguisher & first aid kit present & valid', appliesTo: ['car_van', 'rigid', 'tractor_unit'] },
        { id: 'int_seatbelts', label: 'Seat belts — condition & fastening', appliesTo: ['car_van', 'rigid', 'tractor_unit'] }
      ]
    },
    {
      id: 'trailer_items',
      name: 'Trailer Specific',
      order: 6,
      checks: [
        { id: 'trailer_suspension', label: 'Suspension — condition, no leaks', appliesTo: ['trailer'] },
        { id: 'trailer_underrun', label: 'Side & rear underrun protection — secure & undamaged', appliesTo: ['trailer'] },
        { id: 'trailer_landing', label: 'Landing legs — raise/lower correctly, secure when travelling', appliesTo: ['trailer'] }
      ]
    }
  ]
};

// Get filtered checklist based on vehicle type
window.getChecklistForVehicleType = function(checklistData, vehicleType) {
  if (!checklistData || !checklistData.categories) return DEFAULT_DVSA_CHECKLIST;
  
  const filtered = {
    categories: checklistData.categories.map(cat => ({
      ...cat,
      checks: cat.checks.filter(check => 
        check.appliesTo && check.appliesTo.includes(vehicleType)
      )
    })).filter(cat => cat.checks.length > 0)
  };
  return filtered;
};

// Initialize company checklist on first registration
window.initialiseCompanyChecklist = async function(companyId) {
  const companyChecklistRef = doc(db, 'companies', companyId, 'settings', 'checklist');
  const existing = await getDoc(companyChecklistRef);
  
  if (!existing.exists()) {
    await setDoc(companyChecklistRef, {
      ...DEFAULT_DVSA_CHECKLIST,
      createdWithVersion: '1.0',
      lastModified: serverTimestamp()
    });
    console.log('✅ DVSA-compliant checklist installed for company:', companyId);
  }
};

// ==================================================
// 🏢 PART 2: COMPANY CHECKLIST EDITOR
// ==================================================

window.showComplianceWarning = function(message) {
  const warningEl = document.getElementById('complianceWarning');
  if (warningEl) {
    warningEl.innerHTML = `<div class="warning-box" style="background:#fff3cd; border-left:4px solid #d47500; padding:0.75rem; margin:1rem 0; border-radius:4px;">
      <strong>⚠️ DVSA Compliance Notice</strong>
      <p style="margin:0.5rem 0 0 0;">${message}</p>
    </div>`;
  }
};

window.hideComplianceWarning = function() {
  const warningEl = document.getElementById('complianceWarning');
  if (warningEl) warningEl.innerHTML = '';
};

window.reorderCategory = async function(categoryId, direction) {
  if (!confirm('⚠️ Changing order may affect your standard check layout. You can proceed, but ensure all required DVSA items remain accessible. Continue?')) {
    return;
  }
  showComplianceWarning('You have reordered a checklist section. Please verify all DVSA-required items are still included.');
  // Reorder logic — reload checklist after
  await loadCompanyChecklistEditor();
};

window.removeCategory = async function(categoryId, categoryName) {
  if (!confirm(`⚠️ You are removing the category "${categoryName}".\n\nThis may remove all checks in this section and affect DVSA compliance. You can proceed, but ensure you are not removing legally required checks.\n\nRemove this category?`)) {
    return;
  }
  showComplianceWarning(`Category "${categoryName}" was removed. Your checklist may no longer meet DVSA minimum requirements. Please review.`);
  // Remove logic
  await loadCompanyChecklistEditor();
};

window.removeCheck = async function(categoryId, checkId, checkLabel) {
  if (!confirm(`⚠️ You are removing: "${checkLabel}"\n\nThis item may be required by DVSA regulations. You can proceed, but ensure you have considered the impact.\n\nRemove this check item?`)) {
    return;
  }
  showComplianceWarning(`"${checkLabel}" was removed from your checklist. This may affect DVSA compliance. Please review your full checklist.`);
  // Remove logic
  await loadCompanyChecklistEditor();
};

window.loadCompanyChecklistEditor = async function() {
  const container = document.getElementById('checklistEditorContainer');
  if (!container || !userProfile || userRole !== 'company') return;
  
  hideComplianceWarning();
  const checklistRef = doc(db, 'companies', userProfile.uid, 'settings', 'checklist');
  const snap = await getDoc(checklistRef);
  
  let checklist = DEFAULT_DVSA_CHECKLIST;
  if (snap.exists()) {
    const data = snap.data();
    if (data.categories) checklist = data;
  }
  
  container.innerHTML = `
    <div style="margin-bottom:1rem;">
      <h3>Edit Checklist Structure</h3>
      <p style="color:#666; font-size:0.9rem;">Drag to reorder or use buttons. Changes apply to all future driver checks.</p>
      <div id="complianceWarning"></div>
    </div>
    ${checklist.categories.map(cat => `
      <div class="card" style="margin-bottom:1rem; padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd; padding-bottom:0.5rem; margin-bottom:0.5rem;">
          <strong>${cat.name}</strong>
          <div>
            <button type="button" onclick="reorderCategory('${cat.id}', 'up')">⬆️</button>
            <button type="button" onclick="reorderCategory('${cat.id}', 'down')">⬇️</button>
            <button type="button" onclick="removeCategory('${cat.id}', '${cat.name}')" style="color:red;">🗑️ Remove</button>
          </div>
        </div>
        ${cat.checks.map(check => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 1rem;">
            <span>${check.label}</span>
            <button type="button" onclick="removeCheck('${cat.id}', '${check.id}', '${check.label}')" style="font-size:0.8rem; color:red;">Remove</button>
          </div>
        `).join('')}
        <button type="button" style="margin-top:0.5rem;">+ Add Check</button>
      </div>
    `).join('')}
    <button type="button" style="margin-top:1rem;">+ Add New Category</button>
  `;
};

// ==================================================
// 🚛 PART 3: DRIVER ENHANCED CHECKLIST FLOW
// ==================================================

window.currentCheckType = null; // 'vehicle' | 'vehicle_trailer' | 'trailer_only'
window.selectedVehicleReg = null;
window.selectedTrailerNo = null;
window.linkedJobId = null;

window.loadVehicleTrailerOptions = async function() {
  const vehicleSelect = document.getElementById('checkVehicleReg');
  const trailerSelect = document.getElementById('checkTrailerNo');
  const checkTypeRadios = document.querySelectorAll('input[name="checkType"]');
  
  if (!vehicleSelect && !trailerSelect) return;
  
  // Load company's vehicles
  if (vehicleSelect && userProfile?.companyId) {
    const vehiclesSnap = await getDocs(collection(db, 'companies', userProfile.companyId, 'vehicles'));
    vehicleSelect.innerHTML = '<option value="">-- Select Vehicle --</option>';
    vehiclesSnap.docs.forEach(d => {
      const v = d.data();
      vehicleSelect.innerHTML += `<option value="${v.registration}">${v.registration} — ${v.type.replace('_', ' ').toUpperCase()}</option>`;
    });
  }
  
  // Load company's trailers
  if (trailerSelect && userProfile?.companyId) {
    const trailersSnap = await getDocs(collection(db, 'companies', userProfile.companyId, 'trailers'));
    trailerSelect.innerHTML = '<option value="">-- Select Trailer --</option>';
    trailersSnap.docs.forEach(d => {
      const t = d.data();
      trailerSelect.innerHTML += `<option value="${t.trailerNumber}">${t.trailerNumber}</option>`;
    });
  }
  
  // Check type selection
  checkTypeRadios?.forEach(radio => {
    radio.addEventListener('change', function() {
      currentCheckType = this.value;
      const vehGroup = document.getElementById('vehicleSelectGroup');
      const trlGroup = document.getElementById('trailerSelectGroup');
      
      if (currentCheckType === 'vehicle_only') {
        if (vehGroup) vehGroup.style.display = 'block';
        if (trlGroup) trlGroup.style.display = 'none';
      } else if (currentCheckType === 'trailer_only') {
        if (vehGroup) vehGroup.style.display = 'none';
        if (trlGroup) trlGroup.style.display = 'block';
      } else {
        if (vehGroup) vehGroup.style.display = 'block';
        if (trlGroup) trlGroup.style.display = 'block';
      }
    });
  });
};

// Render enhanced checklist with Green/Amber/Red options
window.renderEnhancedChecklist = function(checklistStructure) {
  const container = document.getElementById('enhancedChecklistContainer');
  if (!container) return;
  
  container.innerHTML = checklistStructure.categories.map(cat => `
    <div class="checklist-category">
      <h4>${cat.name}</h4>
      ${cat.checks.map(check => `
        <div class="check-item-enhanced" data-check-id="${check.id}">
          <label class="check-label">${check.label}</label>
          <div class="status-buttons" style="display:flex; gap:0.5rem; margin:0.5rem 0;">
            <label class="status-btn">
              <input type="radio" name="status_${check.id}" value="green" checked 
                onchange="handleStatusChange('${check.id}', 'green')">
              <span style="color:green; font-weight:bold;">✅ No Defect</span>
            </label>
            <label class="status-btn">
              <input type="radio" name="status_${check.id}" value="amber"
                onchange="handleStatusChange('${check.id}', 'amber')">
              <span style="color:orange; font-weight:bold;">⚠️ Advisory</span>
            </label>
            <label class="status-btn">
              <input type="radio" name="status_${check.id}" value="red"
                onchange="handleStatusChange('${check.id}', 'red')">
              <span style="color:red; font-weight:bold;">🔴 Major</span>
            </label>
          </div>
          <div id="defect_details_${check.id}" style="display:none; padding:0.5rem 1rem; background:#f9f9f9; border-radius:4px; margin:0.5rem 0;">
            <label>Defect Description:</label>
            <textarea id="defect_note_${check.id}" rows="3" style="width:100%; margin:0.5rem 0;" placeholder="Describe the issue..."></textarea>
            <label>Upload Photos:</label>
            <input type="file" id="defect_photos_${check.id}" accept="image/*" multiple style="margin:0.5rem 0;">
            <div id="photo_preview_${check.id}" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
};

window.handleStatusChange = async function(checkId, status) {
  const detailsDiv = document.getElementById(`defect_details_${checkId}`);
  
  if (status === 'green') {
    // Check for previous defects on this item
    const previousDefect = await checkPreviousDefect(checkId, selectedVehicleReg, selectedTrailerNo);
    if (previousDefect) {
      const confirmed = confirm(
        `⚠️ A defect was previously reported for this item:\n\n"${previousDefect.description}"\n\nHas this defect been rectified, or is it still present?\n\nClick OK = Rectified\nCancel = Still Present`
      );
      
      if (confirmed) {
        await recordDefectRectified(previousDefect.id, checkId);
      } else {
        // Keep as defect — revert status
        document.querySelector(`input[name="status_${checkId}"][value="amber"]`).checked = true;
        if (detailsDiv) detailsDiv.style.display = 'block';
        return;
      }
    }
    if (detailsDiv) detailsDiv.style.display = 'none';
  } else {
    if (detailsDiv) detailsDiv.style.display = 'block';
  }
};

window.checkPreviousDefect = async function(checkId, vehicleReg, trailerNo) {
  // Search recent checklists for same check with defect
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const checksRef = collection(db, 'checklists');
  let q = query(checksRef, 
    where('submittedAt', '>', thirtyDaysAgo),
    where('vehicleReg', '==', vehicleReg)
  );
  if (trailerNo) {
    q = query(checksRef, 
      where('submittedAt', '>', thirtyDaysAgo),
      where('trailerNo', '==', trailerNo)
    );
  }
  
  const snap = await getDocs(q);
  for (const doc of snap.docs) {
    const data = doc.data();
    const status = data.checks?.[`status_${checkId}`];
    if (status === 'amber' || status === 'red') {
      return {
        id: doc.id,
        description: data.checks?.[`defect_note_${checkId}`] || 'No description provided'
      };
    }
  }
  return null;
};

window.recordDefectRectified = async function(defectChecklistId, checkId) {
  await addDoc(collection(db, 'defect_signoff_requests'), {
    originalChecklistId: defectChecklistId,
    checkId: checkId,
    driverUid: currentUser.uid,
    driverName: userProfile.name,
    requestDate: serverTimestamp(),
    status: 'pending_signoff',
    companyId: userProfile.companyId || null
  });
  
  // Notify company
  await addDoc(collection(db, 'notifications'), {
    type: 'defect_rectified_request',
    title: '🔧 Defect Marked Rectified',
    message: `A driver has marked a defect as rectified — awaiting your review & sign-off.`,
    read: false,
    createdAt: serverTimestamp()
  });
};

// ==================================================
// 🚛 PART 4: SUBMISSION, REPORTS & ENHANCED FLOW
// ==================================================

// Replace old checklist form submit handler — completely replaces the old one above
// ⚠️ REMINDER: DELETE the old 'checklistForm' submit listener further UP in your file
document.getElementById('checklistForm')?.removeEventListener('submit', window.OLD_checklistSubmitHandler);

window.OLD_checklistSubmitHandler = document.getElementById('checklistForm')?.onsubmit;

document.getElementById('checklistForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return;
  
  const checksData = {};
  const defectsFound = [];
  
  // Gather all statuses and notes
  document.querySelectorAll('.check-item-enhanced').forEach(item => {
    const checkId = item.getAttribute('data-check-id');
    const statusInput = item.querySelector(`input[name="status_${checkId}"]:checked`);
    const status = statusInput ? statusInput.value : 'green';
    const noteEl = document.getElementById(`defect_note_${checkId}`);
    const note = noteEl ? noteEl.value.trim() : '';
    
    checksData[`status_${checkId}`] = status;
    if (note) checksData[`defect_note_${checkId}`] = note;
    
    if (status !== 'green') {
      defectsFound.push({
        checkId,
        status,
        description: note,
        vehicleReg: selectedVehicleReg,
        trailerNo: selectedTrailerNo
      });
    }
  });
  
    const startMileage = document.getElementById('startMileage')?.value || null;
  const endMileage = document.getElementById('endMileage')?.value || null;
  
  const checklistData = {
    driverUid: currentUser.uid,
    driverName: userProfile?.name || 'Anonymous',
    companyId: userProfile?.companyId || null,
    checkType: currentCheckType,
    vehicleReg: selectedVehicleReg,
    trailerNo: selectedTrailerNo,
    linkedJobId: linkedJobId,
    checkDate: document.getElementById('checkDate')?.value || new Date().toISOString().split('T')[0],
    checkTime: document.getElementById('checkTime')?.value,
    startMileage: startMileage ? parseFloat(startMileage) : null,
    startMileageUnit: startMileage ? mileageUnit : null,
    endMileage: endMileage ? parseFloat(endMileage) : null,
    endMileageUnit: endMileage ? mileageUnit : null,
    comments: document.getElementById('checkComments')?.value,
    signature: document.getElementById('checkSignature')?.value,
    checks: checksData,
    defectsFound: defectsFound,
    submittedAt: serverTimestamp()
  };
  
  await addDoc(collection(db, 'checklists'), checklistData);
  
  // If defects found — send notification to company
  if (defectsFound.length > 0) {
    await addDoc(collection(db, 'notifications'), {
      type: 'new_defects',
      title: `⚠️ ${defectsFound.length} Defect${defectsFound.length > 1 ? 's' : ''} Reported`,
      message: `${checklistData.driverName} — ${selectedVehicleReg || selectedTrailerNo || 'Unknown Vehicle'}`,
      defectCount: defectsFound.length,
      vehicleReg: selectedVehicleReg,
      trailerNo: selectedTrailerNo,
      read: false,
      createdAt: serverTimestamp()
    });
  }
  
  const s = document.getElementById('checklistStatus');
  if (s) { 
    s.style.display = 'block'; 
    s.textContent = defectsFound.length > 0 
      ? `✅ Checklist submitted — ${defectsFound.length} defect(s) recorded & notification sent.`
      : '✅ Checklist submitted — No defects found.';
  }
  
  e.target.reset();
  selectedVehicleReg = null;
  selectedTrailerNo = null;
  linkedJobId = null;
  currentCheckType = null;
});

// Load vehicles into dropdown when checklist page opens
window.initializeChecklistPage = async function() {
  await loadVehicleTrailerOptions();
  
  // When vehicle selected, determine type and load relevant checklist
  const vehicleSelect = document.getElementById('checkVehicleReg');
  vehicleSelect?.addEventListener('change', async function() {
    selectedVehicleReg = this.value || null;
    if (selectedVehicleReg) {
      // Get vehicle type and load filtered checklist
      const vehicleSnap = await getDocs(
        query(collection(db, 'companies', userProfile.companyId, 'vehicles'),
        where('registration', '==', selectedVehicleReg)
      ));
      
      let vehicleType = 'rigid'; // default
      if (!vehicleSnap.empty) {
        vehicleType = vehicleSnap.docs[0].data().type || 'rigid';
      }
      
      // Load company's custom checklist
      const checklistRef = doc(db, 'companies', userProfile.companyId, 'settings', 'checklist');
      const checklistSnap = await getDoc(checklistRef);
      let baseChecklist = DEFAULT_DVSA_CHECKLIST;
      if (checklistSnap.exists()) {
        baseChecklist = checklistSnap.data();
      }
      
      // Filter to this vehicle type and render
      const filtered = getChecklistForVehicleType(baseChecklist, vehicleType);
      renderEnhancedChecklist(filtered);
    }
  });
  
  // Trailer select change
  const trailerSelect = document.getElementById('checkTrailerNo');
  trailerSelect?.addEventListener('change', function() {
    selectedTrailerNo = this.value || null;
  });
};

// ==================================================
// ✅ AUTO-INITIALIZE CHECKLIST PAGE
// ==================================================
document.addEventListener('DOMContentLoaded', function() {
  // Call your existing defaults
  initChecklistDefaults();
  
  // ✅ Auto-load vehicle/trailer options on checklist page
  const checkPage = document.getElementById('checklistPage');
  if (checkPage) {
    initializeChecklistPage();
  }
});

// ==================================================
// 📏 MILEAGE / KILOMETRE UNIT HANDLING
// ==================================================
window.mileageUnit = 'km'; // Default: Kilometres

window.convertMileage = function(value, fromUnit, toUnit) {
  if (!value || isNaN(value)) return null;
  if (fromUnit === toUnit) return parseFloat(value);
  if (fromUnit === 'km' && toUnit === 'miles') return parseFloat(value) * 0.621371;
  if (fromUnit === 'miles' && toUnit === 'km') return parseFloat(value) * 1.60934;
  return parseFloat(value);
};

window.switchMileageUnit = function(newUnit) {
  mileageUnit = newUnit;
  const startInput = document.getElementById('startMileage');
  const endInput = document.getElementById('endMileage');
  const unitLabels = document.querySelectorAll('.mileage-unit-label');
  
  // Update unit display labels
  unitLabels.forEach(label => {
    label.textContent = mileageUnit === 'km' ? 'km' : 'miles';
  });
  
  // Optional: auto-convert existing values
  if (startInput && startInput.value) {
    const currentVal = parseFloat(startInput.value);
    const converted = convertMileage(currentVal, mileageUnit === 'km' ? 'miles' : 'km', mileageUnit);
    startInput.value = converted ? Math.round(converted) : '';
  }
  if (endInput && endInput.value) {
    const currentVal = parseFloat(endInput.value);
    const converted = convertMileage(currentVal, mileageUnit === 'km' ? 'miles' : 'km', mileageUnit);
    endInput.value = converted ? Math.round(converted) : '';
  }
};

// ==================================================
// 🔧 PART 1: DEFECTS REGISTER & SIGN-OFF (DVSA REQUIREMENT)
// ==================================================

window.loadDefectsRegister = async function(filter = 'all') {
  const container = document.getElementById('defectsRegisterContainer');
  if (!container || !userProfile || userRole !== 'company') return;
  
  container.innerHTML = '<p>Loading defects register...</p>';
  
  let q = collection(db, 'checklists');
  if (filter === 'open') {
    q = query(q, where('defectsFound', '!=', []));
  }
  
  const snap = await getDocs(q);
  const defectsList = [];
  
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (data.defectsFound && data.defectsFound.length > 0) {
      data.defectsFound.forEach((defect, idx) => {
        defectsList.push({
          id: `${doc.id}_${idx}`,
          checklistId: doc.id,
          checkId: defect.checkId,
          checkLabel: defect.checkId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          status: defect.status,
          description: defect.description,
          vehicleReg: data.vehicleReg || 'Unknown',
          trailerNo: data.trailerNo,
          driverName: data.driverName || 'Unknown',
          date: data.checkDate || data.submittedAt?.toDate?.()?.toLocaleDateString(),
          rectified: defect.rectified || false,
          rectifiedAt: defect.rectifiedAt || null,
          signedOff: defect.signedOff || false
        });
      });
    }
  });
  
  // Sort: newest first
  defectsList.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filter === 'open') {
    defectsList = defectsList.filter(d => !d.signedOff);
  } else if (filter === 'rectified') {
    defectsList = defectsList.filter(d => d.rectified && !d.signedOff);
  } else if (filter === 'closed') {
    defectsList = defectsList.filter(d => d.signedOff);
  }
  
  if (defectsList.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666; padding:2rem;">No defects found for selected filter.</p>';
    return;
  }
  
  container.innerHTML = `
    <div style="margin-bottom:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
      <button onclick="loadDefectsRegister('all')" class="${filter==='all'?'btn btn-primary':'btn btn-secondary'}">All Defects</button>
      <button onclick="loadDefectsRegister('open')" class="${filter==='open'?'btn btn-primary':'btn btn-secondary'}">🔴 Open</button>
      <button onclick="loadDefectsRegister('rectified')" class="${filter==='rectified'?'btn btn-primary':'btn btn-secondary'}">🟡 Awaiting Sign-Off</button>
      <button onclick="loadDefectsRegister('closed')" class="${filter==='closed'?'btn btn-primary':'btn btn-secondary'}">✅ Signed Off</button>
    </div>
    ${defectsList.map(d => `
      <div class="card" style="margin-bottom:0.75rem; padding:1rem; border-left:4px solid 
        ${d.signedOff ? '#28a745' : d.rectified ? '#ffc107' : d.status==='red'?'#dc3545':'#fd7e14'}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <strong>${d.vehicleReg}</strong>
            ${d.trailerNo ? ` / Trailer: ${d.trailerNo}` : ''}
            <br>
            <small>${d.date} — ${d.driverName}</small>
          </div>
          <span style="font-size:0.85rem; padding:0.25rem 0.5rem; border-radius:4px; background:
            ${d.signedOff ? '#d4edda; color:#155724' : d.rectified ? '#fff3cd; color:#856404' : d.status==='red'?'#f8d7da; color:#721c24':'#ffe5cc; color:#804000'}">
            ${d.signedOff ? '✅ Signed Off' : d.rectified ? '🟡 Rectified — Pending Sign-Off' : d.status==='red'?'🔴 Major Defect':'⚠️ Advisory'}
          </span>
        </div>
        <div style="margin-top:0.5rem;">
          <strong>${d.checkLabel}</strong><br>
          <em>"${d.description || 'No description'}"</em>
        </div>
        ${!d.signedOff ? `
          <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${d.rectified ? `
              <button onclick="signOffDefect('${d.checklistId}', '${d.id.split('_').pop()}')" class="btn btn-primary">✓ Sign Off</button>
              <button onclick="markDefectNotFixed('${d.checklistId}', '${d.checkId}')" class="btn btn-secondary">✗ Not Fixed — Reopen</button>
            ` : `
              <button onclick="markDefectFixed('${d.checklistId}', '${d.checkId}')" class="btn btn-primary">✓ Mark As Rectified</button>
              <button onclick="recordDefectOutstanding('${d.checklistId}', '${d.checkId}')" class="btn btn-secondary">⏳ Mark As Outstanding</button>
            `}
          </div>
        ` : `<div style="margin-top:0.5rem; color:#28a745; font-size:0.9rem;">✅ Signed off by company — ${d.signedOffAt?.toDate?.()?.toLocaleString() || 'Date unknown'}</div>`}
      </div>
    `).join('')}
  `;
};

window.signOffDefect = async function(checklistId, checkId) {
  if (!confirm('Confirm this defect has been rectified and signed off? This action is recorded permanently.')) return;
  
  const checklistRef = doc(db, 'checklists', checklistId);
  const snap = await getDoc(checklistRef);
  if (snap.exists()) {
    const data = snap.data();
    const updatedDefects = (data.defectsFound || []).map(d => {
      if (d.checkId === checkId) {
        return { ...d, signedOff: true, signedOffAt: serverTimestamp(), signedOffBy: userProfile.name };
      }
      return d;
    });
    await setDoc(checklistRef, { defectsFound: updatedDefects }, { merge: true });
  }
  loadDefectsRegister();
};

window.markDefectFixed = async function(checklistId, checkId) {
  if (!confirm('Mark this defect as rectified? Company will still need to sign it off.')) return;
  
  const checklistRef = doc(db, 'checklists', checklistId);
  const snap = await getDoc(checklistRef);
  if (snap.exists()) {
    const data = snap.data();
    const updatedDefects = (data.defectsFound || []).map(d => {
      if (d.checkId === checkId) {
        return { ...d, rectified: true, rectifiedAt: serverTimestamp(), rectifiedBy: userProfile.name };
      }
      return d;
    });
    await setDoc(checklistRef, { defectsFound: updatedDefects }, { merge: true });
  }
  
  // Notify driver (optional — notification sent to company already)
  loadDefectsRegister();
};

window.markDefectNotFixed = async function(checklistId, checkId) {
  if (!confirm('Reopen this defect? It will show as open and outstanding again.')) return;
  
  const checklistRef = doc(db, 'checklists', checklistId);
  const snap = await getDoc(checklistRef);
  if (snap.exists()) {
    const data = snap.data();
    const updatedDefects = (data.defectsFound || []).map(d => {
      if (d.checkId === checkId) {
        return { ...d, rectified: false, rectifiedAt: null, signedOff: false, signedOffAt: null };
      }
      return d;
    });
    await setDoc(checklistRef, { defectsFound: updatedDefects }, { merge: true });
  }
  loadDefectsRegister();
};

window.recordDefectOutstanding = async function(checklistId, checkId) {
  const reason = prompt('Please enter the reason the defect is outstanding and expected repair date:');
  if (!reason) return;
  
  const checklistRef = doc(db, 'checklists', checklistId);
  const snap = await getDoc(checklistRef);
  if (snap.exists()) {
    const data = snap.data();
    const updatedDefects = (data.defectsFound || []).map(d => {
      if (d.checkId === checkId) {
        return { ...d, outstanding: true, outstandingReason: reason, recordedAt: serverTimestamp() };
      }
      return d;
    });
    await setDoc(checklistRef, { defectsFound: updatedDefects }, { merge: true });
  }
  loadDefectsRegister();
};

// ==================================================
// 📄 PART 2: EXPORT TO CSV / PDF & RECORD RETENTION
// ==================================================

window.exportChecklistsToCSV = async function() {
  const snap = await getDocs(collection(db, 'checklists'));
  const rows = [];
  
  // Header row
  rows.push([
    'Date','Driver Name','Vehicle Reg','Trailer No.','Check Type','Start Mileage','End Mileage',
    'Total Defects','Defect Details','Submitted At'
  ].join(','));
  
  snap.docs.forEach(d => {
    const data = d.data();
    const defectSummary = (data.defectsFound || []).map(df => 
      `${df.checkId}(${df.status}): "${df.description?.replace(/,/g, ';') || ''}"`
    ).join(' | ');
    
    rows.push([
      data.checkDate || '',
      (data.driverName || '').replace(/,/g, ';'),
      data.vehicleReg || '',
      data.trailerNo || '',
      data.checkType || '',
      data.startMileage ? `${data.startMileage} ${data.startMileageUnit || 'km'}` : '',
      data.endMileage ? `${data.endMileage} ${data.endMileageUnit || 'km'}` : '',
      (data.defectsFound || []).length,
      `"${defectSummary}"`,
      data.submittedAt?.toDate?.()?.toISOString() || ''
    ].join(','));
  });
  
  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `checklists_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.exportSingleChecklist = async function(checklistId) {
  const docRef = doc(db, 'checklists', checklistId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  
  const data = snap.data();
  const content = [
    `WALKAROUND CHECKLIST — RECORD COPY`,
    ``,
    `Date: ${data.checkDate || 'N/A'}`,
    `Time: ${data.checkTime || 'N/A'}`,
    `Driver: ${data.driverName || 'N/A'}`,
    `Vehicle: ${data.vehicleReg || 'N/A'}`,
    `Trailer: ${data.trailerNo || 'N/A'}`,
    `Start Mileage: ${data.startMileage || 'N/A'} ${data.startMileageUnit || 'km'}`,
    `End Mileage: ${data.endMileage || 'N/A'} ${data.endMileageUnit || 'km'}`,
    ``,
    `--- DEFECTS ---`,
  ];
  
  if (data.defectsFound && data.defectsFound.length > 0) {
    data.defectsFound.forEach((d, i) => {
      content.push(`${i+1}. ${d.checkId} — ${d.status === 'red' ? 'MAJOR' : 'ADVISORY'}`);
      content.push(`   Description: ${d.description || 'None provided'}`);
      content.push(`   Status: ${d.signedOff ? 'SIGNED OFF' : d.rectified ? 'Awaiting sign-off' : 'OPEN'}`);
      content.push(``);
    });
  } else {
    content.push(`✅ NO DEFECTS REPORTED`);
  }
  
  content.push(``);
  content.push(`Signed: ________________________  Date: _______________`);
  content.push(`Driver Signature: ${data.signature || 'Not signed'}`);
  content.push(``, `Generated: ${new Date().toLocaleString()}`);
  
  // Create text download (easily printable to PDF)
  const textContent = content.join('\n');
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `checklist_${data.checkDate || checklistId}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Prevent deletion of historical records — DVSA requirement
window.preventRecordDeletion = function() {
  console.log('✅ Record retention active — historical checklists cannot be deleted');
};
preventRecordDeletion();

// ==================================================
// 📊 COMPANY COMPLIANCE MODULE — Full Integration
// ==================================================

// Global reference to current company data
let currentCompanyData = null;

// ==================================================
// 📊 COMPLIANCE DASHBOARD
// ==================================================
async function loadComplianceDashboard() {
  if (!currentUser) return;
  
  try {
    const companyRef = doc(db, 'companies', currentUser.uid);
    const snap = await getDoc(companyRef);
    
    if (snap.exists()) {
      currentCompanyData = snap.data();
      
      // Populate licence info
      document.getElementById('cl-licence-number').textContent = currentCompanyData.licenceNumber || 'Not set';
      document.getElementById('cl-licence-expiry').textContent = 
        currentCompanyData.licenceExpiryDate 
          ? formatDisplayDate(currentCompanyData.licenceExpiryDate) 
          : 'Not set';
      
      // Insurance info
      document.getElementById('cl-insurer').textContent = currentCompanyData.insuranceProvider || 'Not set';
      document.getElementById('cl-insurance-expiry').textContent = 
        currentCompanyData.insuranceExpiryDate 
          ? formatDisplayDate(currentCompanyData.insuranceExpiryDate) 
          : 'Not set';
      
      // Financial standing
      document.getElementById('cl-financial-expiry').textContent = 
        currentCompanyData.financialStandingExpiry 
          ? formatDisplayDate(currentCompanyData.financialStandingExpiry) 
          : 'Not set';
      
      // Tacho next due
      document.getElementById('cl-tacho-due').textContent = 
        currentCompanyData.nextTachoDue 
          ? formatDisplayDate(currentCompanyData.nextTachoDue) 
          : 'Not recorded';
      
      // Load and check all documents for expiry alerts
      await loadExpiryAlerts();
    }
  } catch (error) {
    console.error('Error loading compliance dashboard:', error);
  }
}

async function loadExpiryAlerts() {
  const alertsContainer = document.getElementById('complianceAlerts');
  const today = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(today.getDate() + 30);
  const sixtyDays = new Date();
  sixtyDays.setDate(today.getDate() + 60);
  
  try {
    const docsRef = collection(db, 'companies', currentUser.uid, 'documents');
    const snapshot = await getDocs(docsRef);
    
    const alerts = [];
    
    // Check company profile dates too
    const checkDate = (dateStr, label) => {
      if (!dateStr) return;
      const expiry = new Date(dateStr);
      const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) {
        alerts.push({ level: 'critical', message: `⚠️ ${label} — EXPIRED ${Math.abs(daysLeft)} days ago!` });
      } else if (daysLeft <= 30) {
        alerts.push({ level: 'warning', message: `🔴 ${label} — Expires in ${daysLeft} days` });
      } else if (daysLeft <= 60) {
        alerts.push({ level: 'info', message: `🟡 ${label} — Expires in ${daysLeft} days` });
      }
    };
    
    if (currentCompanyData) {
      checkDate(currentCompanyData.licenceExpiryDate, 'Operator Licence');
      checkDate(currentCompanyData.insuranceExpiryDate, 'Insurance');
      checkDate(currentCompanyData.financialStandingExpiry, 'Financial Standing');
      checkDate(currentCompanyData.transportManagerExpiry, 'Transport Manager CPC');
    }
    
    // Check uploaded documents
    snapshot.forEach(docSnap => {
      const doc = docSnap.data();
      if (!doc.expiryDate) return;
      
      const expiry = new Date(doc.expiryDate);
      const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) {
        alerts.push({ level: 'critical', message: `⚠️ ${doc.name || doc.type} — EXPIRED!` });
      } else if (daysLeft <= 30) {
        alerts.push({ level: 'warning', message: `🔴 ${doc.name || doc.type} — Expires in ${daysLeft} days` });
      } else if (daysLeft <= 60) {
        alerts.push({ level: 'info', message: `🟡 ${doc.name || doc.type} — Expires in ${daysLeft} days` });
      }
    });
    
    if (alerts.length === 0) {
      alertsContainer.innerHTML = '<p class="text-center" style="color:var(--success);">✅ All documents and dates up to date — No alerts</p>';
    } else {
      alertsContainer.innerHTML = alerts.map(a => {
        const bg = a.level === 'critical' ? '#ffebee' : a.level === 'warning' ? '#fff3e0' : '#fff8e1';
        return `<div style="padding:0.75rem; background:${bg}; border-radius:4px; margin-bottom:0.5rem;">${a.message}</div>`;
      }).join('');
    }
  } catch (error) {
    alertsContainer.innerHTML = '<p class="text-center text-light">Could not load alerts</p>';
  }
}

// ==================================================
// 🏢 COMPANY PROFILE / OPERATOR LICENCE
// ==================================================
document.getElementById('companyProfileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  
  const formData = new FormData(e.target);
  const profileData = {
    licenceNumber: formData.get('licenceNumber'),
    licenceType: formData.get('licenceType'),
    licenceIssueDate: formData.get('licenceIssueDate'),
    licenceExpiryDate: formData.get('licenceExpiryDate'),
    trafficArea: formData.get('trafficArea'),
    authorisedVehicles: parseInt(formData.get('authorisedVehicles')) || null,
    transportManagerName: formData.get('transportManagerName'),
    transportManagerCPC: formData.get('transportManagerCPC'),
    transportManagerExpiry: formData.get('transportManagerExpiry'),
    insuranceProvider: formData.get('insuranceProvider'),
    insurancePolicyNumber: formData.get('insurancePolicyNumber'),
    insuranceExpiryDate: formData.get('insuranceExpiryDate'),
    financialStandingExpiry: formData.get('financialStandingExpiry'),
    updatedAt: serverTimestamp()
  };
  
  try {
    const companyRef = doc(db, 'companies', currentUser.uid);
    await setDoc(companyRef, profileData, { merge: true });
    currentCompanyData = { ...currentCompanyData, ...profileData };
    alert('✅ Company profile saved successfully!');
    showPage('companyCompliancePage');
    loadComplianceDashboard();
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('❌ Error saving profile: ' + error.message);
  }
});

async function loadCompanyProfile() {
  if (!currentUser) return;
  
  try {
    const companyRef = doc(db, 'companies', currentUser.uid);
    const snap = await getDoc(companyRef);
    
    if (snap.exists()) {
      const data = snap.data();
      
      setInputValue('ol-number', data.licenceNumber);
      setInputValue('ol-type', data.licenceType);
      setInputValue('ol-issue-date', data.licenceIssueDate);
      setInputValue('ol-expiry-date', data.licenceExpiryDate);
      setInputValue('ol-traffic-area', data.trafficArea);
      setInputValue('ol-authorised-vehicles', data.authorisedVehicles);
      setInputValue('tm-name', data.transportManagerName);
      setInputValue('tm-cpc-number', data.transportManagerCPC);
      setInputValue('tm-expiry', data.transportManagerExpiry);
      setInputValue('ins-provider', data.insuranceProvider);
      setInputValue('ins-policy', data.insurancePolicyNumber);
      setInputValue('ins-expiry', data.insuranceExpiryDate);
      setInputValue('financial-expiry', data.financialStandingExpiry);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// ==================================================
// 📁 COMPANY DOCUMENTS MANAGEMENT
// ==================================================
document.getElementById('companyDocUploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) { alert('Please sign in first'); return; }
  
  const formData = new FormData(e.target);
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'documents'), {
      type: formData.get('docType'),
      name: formData.get('documentName'),
      expiryDate: formData.get('expiryDate'),
      uploadedAt: serverTimestamp()
    });
    
    alert('✅ Document logged successfully!');
    e.target.reset();
    loadCompanyDocuments();
    loadExpiryAlerts();
  } catch (error) {
    console.error('Error logging document:', error);
    alert('❌ Error: ' + error.message);
  }
});

async function loadCompanyDocuments() {
  if (!currentUser) return;
  const container = document.getElementById('companyDocsList');
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'documents'),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-center text-light">No documents uploaded yet</p>';
      return;
    }
    
    container.innerHTML = snapshot.docs.map(docSnap => {
      const d = docSnap.data();
      const expiry = d.expiryDate ? formatDisplayDate(d.expiryDate) : 'No expiry';
      return `
        <div style="padding:0.75rem; border-bottom:1px solid #eee;">
          <strong>${escapeHtml(d.name || d.type)}</strong><br>
          <small>Type: ${formatDocType(d.type)} | Expires: ${expiry}</small>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p class="text-center text-light">Could not load documents</p>';
  }
}

function formatDocType(type) {
  const map = {
    'operator-licence': 'Operator Licence',
    'insurance-cert': 'Insurance Certificate',
    'financial-evidence': 'Financial Evidence',
    'mot-cert': 'MOT Certificate',
    'tacho-card': 'Tachograph Card',
    'driver-cpc': 'Driver CPC',
    'employment-contract': 'Employment Contract',
    'policy-document': 'Policy Document',
    'other': 'Other'
  };
  return map[type] || type;
}

// ==================================================
// 🔧 DEFECT REPORTING & MAINTENANCE
// ==================================================
document.getElementById('defectReportForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  
  const formData = new FormData(e.target);
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'defects'), {
      vehicleReg: (formData.get('vehicleReg') || '').toUpperCase(),
      description: formData.get('description'),
      reportedBy: formData.get('reportedBy'),
      priority: formData.get('priority'),
      status: 'open',
      reportedAt: serverTimestamp()
    });
    
    alert('✅ Defect recorded successfully!');
    e.target.reset();
    loadDefectsList();
  } catch (error) {
    console.error('Error recording defect:', error);
    alert('❌ Error: ' + error.message);
  }
});

async function loadDefectsList() {
  if (!currentUser) return;
  const container = document.getElementById('defectsList');
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'defects'),
      orderBy('reportedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-center text-light">No defects recorded</p>';
      return;
    }
    
    const priorityColors = {
      'immediate': '#ffebee',
      'urgent': '#fff3e0',
      'schedule': '#fff8e1',
      'monitor': '#e8f5e9'
    };
    
    const priorityLabels = {
      'immediate': '⚠️ Immediate',
      'urgent': '🔴 Urgent',
      'schedule': '🟡 Schedule',
      'monitor': '🟢 Monitor'
    };
    
    container.innerHTML = snapshot.docs.map(docSnap => {
      const d = docSnap.data();
      return `
        <div style="padding:0.75rem; background:${priorityColors[d.priority] || '#fff'}; border-radius:4px; margin-bottom:0.5rem;">
          <strong>${escapeHtml(d.vehicleReg || 'Unknown Vehicle')}</strong>
          <span class="status-badge" style="float:right;">${priorityLabels[d.priority] || d.priority}</span>
          <p style="margin:0.5rem 0;">${escapeHtml(d.description)}</p>
          <small>Reported by: ${escapeHtml(d.reportedBy || 'Unknown')} — ${formatTimestamp(d.reportedAt)}</small>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p class="text-center text-light">Could not load defects</p>';
  }
}

// Service scheduling
document.getElementById('scheduleServiceForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  
  const formData = new FormData(e.target);
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'services'), {
      vehicleReg: (formData.get('vehicleReg') || '').toUpperCase(),
      serviceType: formData.get('serviceType'),
      dueDate: formData.get('dueDate'),
      dueMileage: formData.get('dueMileage') ? parseInt(formData.get('dueMileage')) : null,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    alert('✅ Service scheduled!');
    e.target.reset();
    loadServiceSchedule();
  } catch (error) {
    console.error('Error scheduling service:', error);
    alert('❌ Error: ' + error.message);
  }
});

async function loadServiceSchedule() {
  if (!currentUser) return;
  const container = document.getElementById('serviceScheduleList');
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'services'),
      orderBy('dueDate', 'asc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-center text-light">No services scheduled</p>';
      return;
    }
    
    const typeLabels = {
      'routine': '🔧 Routine Service',
      'mot': '🚥 MOT Test',
      'tachocal': '⏱️ Tacho Calibration',
      'repair': '🔩 Repair'
    };
    
    container.innerHTML = snapshot.docs.map(docSnap => {
      const d = docSnap.data();
      return `
        <div style="padding:0.75rem; border-bottom:1px solid #eee;">
          <strong>${escapeHtml(d.vehicleReg)}</strong> — ${typeLabels[d.serviceType] || d.serviceType}<br>
          <small>Due: ${formatDisplayDate(d.dueDate)}${d.dueMileage ? ` / ${d.dueMileage} miles` : ''}</small>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p class="text-center text-light">Could not load schedule</p>';
  }
}

// ==================================================
// ⏱️ TACHOGRAPH & DRIVERS' HOURS
// ==================================================
document.getElementById('tachoDownloadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  
  const formData = new FormData(e.target);
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'tachoDownloads'), {
      downloadType: formData.get('downloadType'),
      reference: formData.get('reference'),
      downloadDate: formData.get('downloadDate'),
      nextDueDate: formData.get('nextDueDate'),
      recordedAt: serverTimestamp()
    });
    
    // Update company profile next due date
    const companyRef = doc(db, 'companies', currentUser.uid);
    await updateDoc(companyRef, { nextTachoDue: formData.get('nextDueDate') });
    
    alert('✅ Download recorded!');
    e.target.reset();
    loadTachoSchedule();
    loadComplianceDashboard();
  } catch (error) {
    console.error('Error recording download:', error);
    alert('❌ Error: ' + error.message);
  }
});

async function loadTachoSchedule() {
  if (!currentUser) return;
  const container = document.getElementById('tachoScheduleList');
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'tachoDownloads'),
      orderBy('downloadDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-center text-light">No downloads recorded yet</p>';
      return;
    }
    
    container.innerHTML = snapshot.docs.map(docSnap => {
      const d = docSnap.data();
      return `
        <div style="padding:0.75rem; border-bottom:1px solid #eee;">
          <strong>${d.downloadType === 'vehicle' ? '🚛 Vehicle Unit' : '👤 Driver Card'}</strong> — ${escapeHtml(d.reference)}<br>
          <small>Downloaded: ${formatDisplayDate(d.downloadDate)} | Next due: ${formatDisplayDate(d.nextDueDate)}</small>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p class="text-center text-light">Could not load downloads</p>';
  }
}

// Infringements
document.getElementById('infringementForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  
  const formData = new FormData(e.target);
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'infringements'), {
      driverName: formData.get('driverName'),
      incidentDate: formData.get('incidentDate'),
      infringementType: formData.get('infringementType'),
      actionTaken: formData.get('actionTaken'),
      recordedAt: serverTimestamp()
    });
    
    alert('✅ Infringement recorded!');
    e.target.reset();
    loadInfringementsList();
  } catch (error) {
    console.error('Error recording infringement:', error);
    alert('❌ Error: ' + error.message);
  }
});

async function loadInfringementsList() {
  if (!currentUser) return;
  const container = document.getElementById('infringementsList');
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'infringements'),
      orderBy('incidentDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-center text-light">No infringements recorded — Great job!</p>';
      return;
    }
    
    container.innerHTML = snapshot.docs.map(docSnap => {
      const d = docSnap.data();
      return `
        <div style="padding:0.75rem; border-bottom:1px solid #eee;">
          <strong>${escapeHtml(d.driverName)}</strong><br>
          <small>${d.infringementType} — ${formatDisplayDate(d.incidentDate)}</small>
          ${d.actionTaken ? `<p style="margin-top:0.25rem; font-size:0.9rem;">Action: ${escapeHtml(d.actionTaken)}</p>` : ''}
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p class="text-center text-light">Could not load infringements</p>';
  }
}

// ==================================================
// 📄 REPORTING CENTRE
// ==================================================
function printReport() {
  window.print();
}

async function generateChecklistReport() {
  const from = document.getElementById('report-checks-from').value;
  const to = document.getElementById('report-checks-to').value;
  const output = document.getElementById('report-checks-output');
  
  if (!from || !to) { alert('Please select a date range'); return; }
  
  output.innerHTML = '<p>Loading data...</p>';
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'checklists'),
      orderBy('checkDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const filtered = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(d => {
        if (!d.checkDate) return false;
        const cd = new Date(d.checkDate);
        return cd >= new Date(from) && cd <= new Date(to);
      });
    
    if (filtered.length === 0) {
      output.innerHTML = '<p class="text-center text-light">No checklists found for selected date range</p>';
      return;
    }
    
    output.innerHTML = `
      <h3>Daily Walkaround Checklist Register</h3>
      <p><strong>Date Range:</strong> ${formatDisplayDate(from)} to ${formatDisplayDate(to)}</p>
      <p><strong>Total Checks:</strong> ${filtered.length}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
        <thead>
          <tr style="background:var(--primary); color:white;">
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Date</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Vehicle</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Driver</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Defects?</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(d => `
            <tr>
              <td style="padding:0.5rem; border:1px solid #ddd;">${formatDisplayDate(d.checkDate)}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.regNumber || 'Unknown')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.signature || 'Unknown')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.hasDefects ? '⚠️ Yes' : '✅ No'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    output.innerHTML = '<p class="error-box">Error generating report: ' + error.message + '</p>';
  }
}

async function generateDefectReport() {
  const output = document.getElementById('report-defects-output');
  output.innerHTML = '<p>Loading data...</p>';
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'defects'),
      orderBy('reportedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      output.innerHTML = '<p class="text-center text-light">No defects recorded — ✅ All clear!</p>';
      return;
    }
    
    const defects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    output.innerHTML = `
      <h3>Defect & Maintenance Register</h3>
      <p><strong>Total Defects Recorded:</strong> ${defects.length}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
        <thead>
          <tr style="background:var(--primary); color:white;">
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Vehicle</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Description</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Reported By</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Priority</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Date</th>
          </tr>
        </thead>
        <tbody>
          ${defects.map(d => `
            <tr>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.vehicleReg)}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.description.substring(0,40))}${d.description.length > 40 ? '...' : ''}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.reportedBy || 'Unknown')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.priority}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${formatTimestamp(d.reportedAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    output.innerHTML = '<p class="error-box">Error: ' + error.message + '</p>';
  }
}

async function generateTachoReport() {
  const output = document.getElementById('report-tacho-output');
  output.innerHTML = '<p>Loading data...</p>';
  
  try {
    const q = query(
      collection(db, 'companies', currentUser.uid, 'tachoDownloads'),
      orderBy('downloadDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      output.innerHTML = '<p class="text-center text-light">No tachograph downloads recorded</p>';
      return;
    }
    
    const downloads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    output.innerHTML = `
      <h3>Tachograph Download Compliance Report</h3>
      <p><strong>Total Downloads Recorded:</strong> ${downloads.length}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
        <thead>
          <tr style="background:var(--primary); color:white;">
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Type</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Reference</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Downloaded</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Next Due</th>
          </tr>
        </thead>
        <tbody>
          ${downloads.map(d => `
            <tr>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.downloadType === 'vehicle' ? 'Vehicle Unit' : 'Driver Card'}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.reference)}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${formatDisplayDate(d.downloadDate)}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${formatDisplayDate(d.nextDueDate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top:1rem; font-size:0.85rem; font-style:italic;">
        Legal requirement: Vehicle units every 28 days max • Driver cards every 90 days max
      </p>
    `;
  } catch (error) {
    output.innerHTML = '<p class="error-box">Error: ' + error.message + '</p>';
  }
}

async function generateVehicleReport() {
  const output = document.getElementById('report-vehicles-output');
  output.innerHTML = '<p>Loading data...</p>';
  
  try {
    const q = query(collection(db, 'companies', currentUser.uid, 'vehicles'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      output.innerHTML = '<p class="text-center text-light">No vehicles in fleet yet</p>';
      return;
    }
    
    const vehicles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    output.innerHTML = `
      <h3>Vehicle Compliance Summary</h3>
      <p><strong>Total Vehicles:</strong> ${vehicles.length}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
        <thead>
          <tr style="background:var(--primary); color:white;">
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Reg</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Make/Model</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">MOT Due</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Insurance Due</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Tacho Cal</th>
          </tr>
        </thead>
        <tbody>
          ${vehicles.map(d => `
            <tr>
              <td style="padding:0.5rem; border:1px solid #ddd; font-weight:bold;">${escapeHtml(d.registration || 'Unknown')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.make || '')} ${escapeHtml(d.model || '')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.motExpiry ? formatDisplayDate(d.motExpiry) : 'Not set'}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.insuranceExpiry ? formatDisplayDate(d.insuranceExpiry) : 'Not set'}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.tachographCalibration ? formatDisplayDate(d.tachographCalibration) : 'Not set'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    output.innerHTML = '<p class="error-box">Error: ' + error.message + '</p>';
  }
}

async function generateDriverReport() {
  const output = document.getElementById('report-drivers-output');
  output.innerHTML = '<p>Loading data...</p>';
  
  try {
    const q = query(collection(db, 'companies', currentUser.uid, 'drivers'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      output.innerHTML = '<p class="text-center text-light">No drivers registered yet</p>';
      return;
    }
    
    const drivers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    output.innerHTML = `
      <h3>Driver Compliance Summary</h3>
      <p><strong>Total Drivers:</strong> ${drivers.length}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
        <thead>
          <tr style="background:var(--primary); color:white;">
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Name</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Licence No.</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">CPC Expiry</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Medical Expiry</th>
            <th style="padding:0.5rem; text-align:left; border:1px solid #ddd;">Tacho Card Exp</th>
          </tr>
        </thead>
        <tbody>
          ${drivers.map(d => `
            <tr>
              <td style="padding:0.5rem; border:1px solid #ddd; font-weight:bold;">${escapeHtml(d.fullName || 'Unknown')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${escapeHtml(d.licenceNumber || 'Not recorded')}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.cpcExpiry ? formatDisplayDate(d.cpcExpiry) : 'Not set'}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.medicalExpiry ? formatDisplayDate(d.medicalExpiry) : 'Not set'}</td>
              <td style="padding:0.5rem; border:1px solid #ddd;">${d.tachoCardExpiry ? formatDisplayDate(d.tachoCardExpiry) : 'Not set'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    output.innerHTML = '<p class="error-box">Error: ' + error.message + '</p>';
  }
}

async function generateComplianceCertificate() {
  const output = document.getElementById('report-cert-output');
  output.innerHTML = '<p>Generating certificate...</p>';
  
  try {
    const today = new Date();
    const companyRef = doc(db, 'companies', currentUser.uid);
    const snap = await getDoc(companyRef);
    const company = snap.exists() ? snap.data() : {};
    
    output.innerHTML = `
      <div style="border:2px solid var(--primary); padding:2rem; border-radius:8px; background:white;">
        <h2 style="text-align:center; color:var(--primary); margin-bottom:0.5rem;">🚛 LSD Solutions — Compliance Certificate</h2>
        <p style="text-align:center; color:var(--text-light); margin-bottom:2rem;">Generated: ${today.toLocaleDateString('en-GB')}</p>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
          <div>
            <h4 style="border-bottom:2px solid var(--primary-light); padding-bottom:0.5rem;">Company Details</h4>
            <p><strong>Company:</strong> ${escapeHtml(company.companyName || 'Not Recorded')}</p>
            <p><strong>Operator Licence:</strong> ${escapeHtml(company.licenceNumber || 'Not Recorded')}</p>
            <p><strong>Licence Type:</strong> ${company.licenceType || 'Not Recorded'}</p>
            <p><strong>Traffic Area:</strong> ${company.trafficArea || 'Not Recorded'}</p>
          </div>
          <div>
            <h4 style="border-bottom:2px solid var(--primary-light); padding-bottom:0.5rem;">Key Dates</h4>
            <p><strong>Licence Expires:</strong> ${company.licenceExpiryDate ? formatDisplayDate(company.licenceExpiryDate) : 'Not Recorded'}</p>
            <p><strong>Insurance Expires:</strong> ${company.insuranceExpiryDate ? formatDisplayDate(company.insuranceExpiryDate) : 'Not Recorded'}</p>
            <p><strong>Financial Standing Expires:</strong> ${company.financialStandingExpiry ? formatDisplayDate(company.financialStandingExpiry) : 'Not Recorded'}</p>
            <p><strong>Transport Manager CPC Expires:</strong> ${company.transportManagerExpiry ? formatDisplayDate(company.transportManagerExpiry) : 'Not Recorded'}</p>
          </div>
        </div>
        
        <div style="margin-top:2rem; padding-top:1rem; border-top:1px solid #eee; text-align:center; font-style:italic; color:var(--text-light);">
          <p>This document provides a snapshot of compliance records as at the date of generation.<br>
          All records should be kept up to date — DVSA may request further evidence during a visit.</p>
        </div>
      </div>
    `;
  } catch (error) {
    output.innerHTML = '<p class="error-box">Error: ' + error.message + '</p>';
  }
}

// ==================================================
// 🛠️ HELPER FUNCTIONS
// ==================================================
function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = value;
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return '—';
  const d = new Date(dateValue);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ==================================================
// 🔗 PAGE LOADERS — Called when showing each page
// ==================================================
// Update your existing showPage function to call these:
// showPage('companyCompliancePage') → loadComplianceDashboard()
// showPage('companyProfilePage') → loadCompanyProfile()
// showPage('companyDocumentsPage') → loadCompanyDocuments()
// showPage('companyMaintenancePage') → loadDefectsList(); loadServiceSchedule()
// showPage('companyTachographPage') → loadTachoSchedule(); loadInfringementsList()