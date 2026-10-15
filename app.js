// ==================================================
// LSD SOLUTIONS — FULL WORKING APP.JS
// ==================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection,
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
let userRole = null;
let companyId = null;

// ==================================================
// GLOBAL FUNCTIONS — Called directly from HTML onclick
// ==================================================

// Auth tab switching
window.showAuthTab = function(tab) {
  const signInForm = document.getElementById('signInForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');
  
  if (signInForm) signInForm.style.display = tab === 'signin' ? 'block' : 'none';
  if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
  if (resetForm) resetForm.style.display = tab === 'reset' ? 'block' : 'none';
  
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  
  if (tabSignIn) {
    tabSignIn.className = tab === 'signin' ? 'btn btn-primary' : 'btn btn-secondary';
  }
  if (tabRegister) {
    tabRegister.className = tab === 'register' ? 'btn btn-primary' : 'btn btn-secondary';
  }
};

// Page navigation
window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
  } else {
    console.error('Page not found:', pageId);
  }
};

// Sign out
window.handleSignOut = async function() {
  if (!auth) return;
  await signOut(auth);
  currentUser = null;
  userRole = null;
  companyId = null;
  showPage('authPage');
};

// ==================================================
// PAGE NAVIGATION — Core function that fixes visibility
// ==================================================
window.showPage = function(pageId) {
  // Hide ALL pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show selected page
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  else console.error('Page not found:', pageId);
};

// ==================================================
// AUTH TABS
// ==================================================
window.showAuthTab = function(tab) {
  document.getElementById('signInForm').style.display = tab === 'signin' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('resetForm').style.display = tab === 'reset' ? 'block' : 'none';
  
  document.getElementById('tabSignIn').className = tab === 'signin' ? 'btn btn-primary' : 'btn btn-secondary';
  document.getElementById('tabRegister').className = tab === 'register' ? 'btn btn-primary' : 'btn btn-secondary';
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
// REGISTER — Unified users collection
// ==================================================
document.getElementById('registerFormEl').addEventListener('submit', async e => {
  e.preventDefault();
  const type = document.querySelector('input[name="accountType"]:checked').value;
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPassword').value;
  const err = document.getElementById('registerError');
  const succ = document.getElementById('registerSuccess');
  
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    
    // ONE unified users collection — matches auth state listener
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      accountType: type,
      createdAt: serverTimestamp(),
      emailVerified: false
    });
    
    // If company — initialize default DVSA checklist
    if (type === 'company') {
      await initialiseCompanyChecklist(uid);
    }
    
    succ.style.display = 'block';
    succ.textContent = '✅ Account created! Signing in...';
    setTimeout(() => showAuthTab('signin'), 1500);
    
  } catch (e) {
    err.style.display = 'block';
    err.textContent = '❌ ' + (e.code === 'auth/email-already-in-use' 
      ? 'This email is already registered' 
      : e.message);
  }
});

// Initialize company checklist
async function initialiseCompanyChecklist(companyId) {
  const DEFAULT_CHECKLIST = {
    ext01: { label: 'Tyres — condition, pressure, tread depth', required: true },
    ext02: { label: 'Wheels & Fixings — secure, no damage', required: true },
    ext03: { label: 'Lights & Reflectors — working, lenses intact', required: true },
    ext04: { label: 'Mirrors — clean, secure, glass intact', required: true },
    ext05: { label: 'Windscreen & Wipers — clean, operate correctly', required: true },
    ext06: { label: 'Body & Mudguards — condition, security', required: true },
    ext07: { label: 'Number Plates — legible & secure', required: true },
    ext08: { label: 'Coupling & Connections — secure', required: true },
    int01: { label: 'Cab Security — doors lock correctly', required: true },
    int02: { label: 'Seat Belts — condition & operation', required: true },
    int03: { label: 'Horn — working', required: true },
    int04: { label: 'Warning Devices — functioning', required: true },
    int05: { label: 'Fire Extinguisher — present & in date', required: true },
    int06: { label: 'First Aid Kit — complete & in date', required: true },
    eng01: { label: 'Fluid Levels — correct, no leaks', required: true },
    eng02: { label: 'Air System — no audible leaks', required: true },
    eng03: { label: 'Brakes — operation & performance', required: true },
    trl01: { label: 'Trailer Coupling — secure', required: false },
    trl02: { label: 'Air & Electrics — connected & working', required: false },
    trl03: { label: 'Trailer Tyres & Wheels', required: false },
    trl04: { label: 'Trailer Doors & Body — secure', required: false }
  };
  
  try {
    await setDoc(doc(db, 'companies', companyId, 'settings', 'checklist'), {
      items: DEFAULT_CHECKLIST,
      updatedAt: serverTimestamp()
    });
    console.log('✅ DVSA checklist installed');
  } catch (err) {
    console.warn('Checklist init skipped:', err);
  }
}

// ==================================================
// AUTH STATE — UPDATED to match unified users
// ==================================================
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    const profileRef = doc(db, 'users', user.uid);
    const snap = await getDoc(profileRef);
    
    if (snap.exists()) {
      userProfile = snap.data();
      userRole = userProfile.accountType;
      
      if (userRole === 'driver') {
        showPage('driverDashboardPage');
        const nameEl = document.getElementById('driverNameDisplay');
        if (nameEl) nameEl.textContent = userProfile.name || 'Driver';
      } else if (userRole === 'company') {
        companyId = user.uid;
        showPage('companyDashboardPage');
        const nameEl = document.getElementById('companyNameDisplay');
        if (nameEl) nameEl.textContent = userProfile.name || 'Company';
      }
    }
  } else {
    currentUser = null;
    userProfile = null;
    showPage('authPage');
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
    document.getElementById('resetMessage').style.display = 'block';
    document.getElementById('resetMessage').textContent = '✅ Reset link sent! Check your email.';
  } catch (e) {
    alert('Error: ' + e.message);
  }
});

// ==================================================
// SIGN OUT
// ==================================================
window.handleSignOut = async function() {
  await signOut(auth);
  currentUser = null;
  userRole = null;
  showPage('authPage');
};

// ==================================================
// AUTH STATE — Routes to correct portal
// ==================================================
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    const driverSnap = await getDoc(doc(db, 'drivers', user.uid));
    const companySnap = await getDoc(doc(db, 'companies', user.uid));
    
    if (driverSnap.exists()) {
      userRole = 'driver';
      showPage('driverDashboardPage');
      document.getElementById('driverNameDisplay').textContent = driverSnap.data().name || 'Driver';
    } else if (companySnap.exists()) {
      userRole = 'company';
      companyId = user.uid;
      showPage('companyDashboardPage');
      document.getElementById('companyNameDisplay').textContent = companySnap.data().name || 'Company';
      loadCompanyJobs();
      loadVehicles();
      loadDrivers();
    }
  } else {
    showPage('authPage');
  }
});

// ==================================================
// DRIVER PROFILE SAVE
// ==================================================
document.getElementById('driverProfileForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return;
  
  const data = {
    fullName: document.getElementById('dpFullName').value,
    email: document.getElementById('dpEmail').value,
    licenceNumber: document.getElementById('dpLicenceNumber').value,
    dob: document.getElementById('dpDob').value,
    licenceValidFrom: document.getElementById('dpLicenceValidFrom').value,
    licenceExpiry: document.getElementById('dpLicenceExpiry').value,
    medicalExpiry: document.getElementById('dpMedicalExpiry').value,
    points: parseInt(document.getElementById('dpDrivingPoints').value) || 0,
    phone: document.getElementById('dpPhone').value
  };
  
  await setDoc(doc(db, 'drivers', currentUser.uid), data, { merge: true });
  document.getElementById('dpSaveStatus').textContent = '✅ Profile Saved!';
  setTimeout(() => document.getElementById('dpSaveStatus').textContent = '', 3000);
});

// ==================================================
// WALkAROUND CHECKLIST — Load existing + Submit
// ==================================================
document.getElementById('checklistForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return;
  
  const checks = {};
  document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => {
    checks[cb.name] = cb.checked;
    const note = document.getElementById(cb.name + '_note');
    if (note) checks[cb.name + '_note'] = note.querySelector('textarea').value;
  });
  
  await addDoc(collection(db, 'checklists'), {
    driverId: currentUser.uid,
    driverName: document.getElementById('dpFullName')?.value || 'Anonymous',
    vehicleReg: document.getElementById('checkVehicleReg').value,
    trailerNo: document.getElementById('checkTrailerNo').value,
    checkDate: document.getElementById('checkDate').value,
    checkTime: document.getElementById('checkTime').value,
    comments: document.getElementById('checkComments').value,
    signature: document.getElementById('checkSignature').value,
    checks,
    submittedAt: serverTimestamp()
  });
  
  const status = document.getElementById('checklistStatus');
  status.style.display = 'block';
  status.innerHTML = '✅ Checklist submitted successfully!';
  e.target.reset();
});

// Show defect note when checkbox UNCHECKED (defect found)
document.querySelectorAll('.check-main').forEach(cb => {
  cb.addEventListener('change', function() {
    const note = document.getElementById(this.id + '_note');
    if (note) {
      note.classList.toggle('visible', !this.checked);
    }
  });
});

// ==================================================
// COMPANY JOBS — Post & Load
// ==================================================
document.getElementById('postJobForm').addEventListener('submit', async e => {
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
  
  document.getElementById('jobSaveStatus').textContent = '✅ Job Posted!';
  e.target.reset();
  loadCompanyJobs();
});

async function loadCompanyJobs() {
  const list = document.getElementById('jobsCompanyList');
  if (!list) return;
  
  const snap = await getDocs(query(collection(db, 'jobs'), where('companyId', '==', companyId)));
  list.innerHTML = snap.empty ? '<p>No jobs posted yet.</p>' : 
    snap.docs.map(d => {
      const j = d.data();
      return `<div class="card" style="margin:0.5rem 0;">
        <strong>${j.title}</strong> — <em>${j.status}</em><br>
        ${j.pickup} → ${j.dropoff}<br>
        ${j.date || 'No date set'} | £${j.pay || '0'}
      </div>`;
    }).join('');
}

window.loadDriverJobs = async function() {
  const list = document.getElementById('jobsList');
  if (!list) return;
  
  const snap = await getDocs(query(collection(db, 'jobs'), where('status', '==', 'open')));
  list.innerHTML = snap.empty ? '<p>No available jobs right now.</p>' :
    snap.docs.map(d => {
      const j = d.data();
      return `<div class="card" style="margin:0.5rem 0;">
        <strong>${j.title}</strong><br>
        ${j.pickup} → ${j.dropoff}<br>
        ${j.date || ''} | <strong>£${j.pay || 'On application'}</strong>
        <p style="margin-top:0.5rem;">${j.details || ''}</p>
      </div>`;
    }).join('');
};

// ==================================================
// VEHICLES — Add & List
// ==================================================
document.getElementById('addVehicleForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser || userRole !== 'company') return;
  
  await addDoc(collection(db, 'vehicles'), {
    companyId,
    reg: document.getElementById('vReg').value.toUpperCase(),
    make: document.getElementById('vMake').value,
    model: document.getElementById('vModel').value,
    type: document.getElementById('vType').value,
    motExpiry: document.getElementById('vMotExpiry').value,
    insExpiry: document.getElementById('vInsExpiry').value,
    createdAt: serverTimestamp()
  });
  
  document.getElementById('vSaveStatus').textContent = '✅ Vehicle Added!';
  e.target.reset();
  loadVehicles();
});

async function loadVehicles() {
  const list = document.getElementById('vehiclesList');
  if (!list || !companyId) return;
  
  const snap = await getDocs(query(collection(db, 'vehicles'), where('companyId', '==', companyId)));
  list.innerHTML = snap.empty ? '<p>No vehicles added yet.</p>' :
    `<div style="display:grid; gap:0.75rem;">` +
    snap.docs.map(d => {
      const v = d.data();
      return `<div style="padding:0.75rem; background:#f9fafb; border-radius:4px;">
        <strong>${v.reg}</strong> — ${v.make} ${v.model} (${v.type})<br>
        MOT: ${v.motExpiry || 'Not set'} | Ins: ${v.insExpiry || 'Not set'}
      </div>`;
    }).join('') + `</div>`;
}

// ==================================================
// DRIVERS — Link & List
// ==================================================
document.getElementById('addDriverForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser || userRole !== 'company') return;
  const email = document.getElementById('dEmail').value;
  
  const snap = await getDocs(query(collection(db, 'drivers'), where('email', '==', email)));
  if (snap.empty) {
    document.getElementById('dSaveStatus').textContent = '⚠️ Driver not found — ask them to register first.';
    return;
  }
  
  const docRef = snap.docs[0].ref;
  await updateDoc(docRef, { linkedCompanyId: companyId });
  document.getElementById('dSaveStatus').textContent = '✅ Driver linked!';
  e.target.reset();
  loadDrivers();
});

async function loadDrivers() {
  const list = document.getElementById('driversList');
  if (!list || !companyId) return;
  
  const snap = await getDocs(query(collection(db, 'drivers'), where('linkedCompanyId', '==', companyId)));
  list.innerHTML = snap.empty ? '<p>No drivers linked yet. Enter a driver\'s email above to link them.</p>' :
    snap.docs.map(d => {
      const dr = d.data();
      return `<div style="padding:0.75rem; background:#f9fafb; border-radius:4px;">
        <strong>${dr.name || 'Unnamed Driver'}</strong><br>
        ${dr.email}<br>
        Licence: ${dr.licenceNumber || 'Not provided'}
      </div>`;
    }).join('');
}

// ==================================================
// DEFECTS — Load & Filter
// ==================================================
window.loadDefects = async function(filter) {
  const list = document.getElementById('defectsList');
  if (!list || !companyId) return;
  
  let q = collection(db, 'checklists');
  // For demo: load all; add filter logic as needed
  const snap = await getDocs(q);
  list.innerHTML = snap.empty ? '<p>No defects reported.</p>' :
    snap.docs.map(d => {
      const chk = d.data();
      const hasDefect = Object.entries(chk.checks || {}).some(([k,v]) => k.endsWith('_note') && v);
      return `<div class="card" style="margin:0.5rem 0;">
        <strong>${chk.vehicleReg || 'Unknown Vehicle'}</strong> — ${chk.checkDate}<br>
        Driver: ${chk.signature || 'Anonymous'}<br>
        ${hasDefect ? '<span style="color:red;">⚠️ Defects noted</span>' : '<span style="color:green;">✅ No defects</span>'}
      </div>`;
    }).join('');
};

// ==================================================
// COMPANY PROFILE SAVE
// ==================================================
document.getElementById('companyProfileForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser || userRole !== 'company') return;
  
  await setDoc(doc(db, 'companies', currentUser.uid), {
    name: document.getElementById('cpCompanyName').value,
    email: document.getElementById('cpCompanyEmail').value,
    address: document.getElementById('cpAddress').value,
    phone: document.getElementById('cpPhone').value,
    oLicence: document.getElementById('cpOlicence').value,
    fleetSize: document.getElementById('cpFleetSize').value
  }, { merge: true });
  
  document.getElementById('cpSaveStatus').textContent = '✅ Company Profile Saved!';
});

// ==================================================
// INIT — Set today's date/time in checklist
// ==================================================
function initChecklistDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  const dateEl = document.getElementById('checkDate');
  const timeEl = document.getElementById('checkTime');
  if (dateEl && !dateEl.value) dateEl.value = today;
  if (timeEl && !timeEl.value) timeEl.value = time;
}

document.addEventListener('DOMContentLoaded', initChecklistDefaults);
