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

window.showPage = function(pageId) {
  // Hide EVERY page first
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });
  
  // Show ONLY the requested page
  function updateNavigationForPage(pageId) {
  const homeNav = document.getElementById('homeNav');
  
  // ✅ Always show the full navigation bar — never hide it
  if (homeNav) homeNav.style.display = 'block';
  
  // Go through EVERY button — hide ONLY the one matching the current page
  const allNavButtons = homeNav.querySelectorAll('button[data-page]');
  allNavButtons.forEach(btn => {
    const targetPage = btn.getAttribute('data-page');
    if (targetPage === pageId) {
      // ✅ Hide the button for the page we're CURRENTLY on
      btn.style.display = 'none';
    } else {
      // ✅ Show ALL other navigation buttons
      btn.style.display = 'inline-block';
    }
  });
}
  
  // Scroll to top
  window.scrollTo(0, 0);
};

window.handleSignOut = async function() {
  if (!auth) return;
  await signOut(auth);
  currentUser = null;
  userProfile = null;
  userRole = null;
  companyId = null;
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
// REGISTER — BRACES ARE NOW PERFECT ✅
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
          showPage('driverDashboardPage');
          const n = document.getElementById('driverNameDisplay');
          if (n) n.textContent = userProfile.name || 'Driver';
        } else if (userRole === 'company') {
          companyId = user.uid;
          showPage('companyDashboardPage');
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
// CHECKLIST
// ==================================================
document.querySelectorAll('.check-main').forEach(cb => {
  cb.addEventListener('change', function() {
    const note = document.getElementById(this.id + '_note');
    if (note) note.classList.toggle('visible', !this.checked);
  });
});

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
    driverUid: currentUser.uid,
    driverName: userProfile?.name || 'Anonymous',
    vehicleReg: document.getElementById('checkVehicleReg').value,
    trailerNo: document.getElementById('checkTrailerNo').value,
    checkDate: document.getElementById('checkDate').value,
    checkTime: document.getElementById('checkTime').value,
    comments: document.getElementById('checkComments').value,
    signature: document.getElementById('checkSignature').value,
    checks,
    submittedAt: serverTimestamp()
  });
  const s = document.getElementById('checklistStatus');
  if (s) { s.style.display = 'block'; s.textContent = '✅ Checklist submitted!'; }
  e.target.reset();
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
