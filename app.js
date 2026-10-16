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
    title: document.getElementById('jobTitle').value,
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