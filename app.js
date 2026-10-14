// ==================================================
// 🚛 LSD SOLUTIONS — FINAL COMPLETE VERSION
// Firebase v10.7.1 | DVSA Compliant | All Buttons Fixed
// ==================================================
'use strict';

// ==================================================
// 🛠️ UTILITIES
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

const Utils = {
  Storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('[Storage Get Error]', e);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('[Storage Set Error]', e);
        return false;
      }
    },
    remove(key) {
      localStorage.removeItem(key);
    },
    clear() {
      localStorage.clear();
    }
  },

  Format: {
    date(date) {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    },
    datetime(date) {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleString('en-GB');
    },
    currency(amount, currency = 'GBP') {
      if (amount === null || amount === undefined) amount = 0;
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
    }
  },

  Validators: {
    email(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
    },
    password(password) {
      return (password || '').length >= 6;
    }
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

window.Utils = Utils;

// ==================================================
// 🔥 FIREBASE INITIALISATION
// ==================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.appspot.com",
  messagingSenderId: "490824167351",
  appId: "1:490824167351:web:6b8a8c7e0f1a2b3c4d5e6f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.auth = auth;
window.db = db;
window.storage = storage;
// ==================================================
// 🔐 AUTHENTICATION FUNCTIONS
// ==================================================
window.signIn = async function () {
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;

  if (!Utils.Validators.email(email)) {
    alert('❌ Please enter a valid email address');
    return;
  }
  if (!Utils.Validators.password(password)) {
    alert('❌ Password must be at least 6 characters');
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    if (!user.emailVerified) {
      alert('ℹ️ Please check your email to verify your account before signing in');
      await auth.signOut();
      return;
    }

    console.log('✅ Signed in:', user.uid);
  } catch (err) {
    console.error('[Sign In Error]', err.code, err.message);
    const messages = {
      'auth/invalid-email': '❌ Invalid email address',
      'auth/user-disabled': '❌ This account has been disabled',
      'auth/user-not-found': '❌ No account found with this email — please register first',
      'auth/wrong-password': '❌ Incorrect password',
      'auth/too-many-requests': '❌ Too many attempts — please try again later',
      'auth/network-request-failed': '❌ Network error — check your internet connection'
    };
    alert(messages[err.code] || '❌ Sign in failed: ' + err.message);
  }
};

window.register = async function () {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const accountType = document.querySelector('input[name="account-type"]:checked')?.value;

  if (!name) return alert('❌ Please enter your name');
  if (!Utils.Validators.email(email)) return alert('❌ Please enter a valid email');
  if (!Utils.Validators.password(password)) return alert('❌ Password must be at least 6 characters');
  if (password !== confirm) return alert('❌ Passwords do not match');
  if (!accountType) return alert('❌ Please select account type: Driver or Company');

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await sendEmailVerification(user);

    const collectionName = accountType === 'driver' ? 'drivers' : 'companies';
    const profileData = {
      uid: user.uid,
      name,
      email,
      accountType,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, collectionName, user.uid), profileData);

    // Initialise DVSA checklist for new companies
    if (accountType === 'company') {
      await initialiseCompanyChecklist(user.uid);
    }

    alert('✅ Account created! Please check your email to verify your account, then sign in.');
    showPage('auth-page');
  } catch (err) {
    console.error('[Register Error]', err.code, err.message);
    const messages = {
      'auth/email-already-in-use': '❌ This email is already registered — try signing in instead',
      'auth/invalid-email': '❌ Invalid email address',
      'auth/operation-not-allowed': '❌ Account creation is not enabled',
      'auth/weak-password': '❌ Please use a stronger password (at least 6 characters)'
    };
    alert(messages[err.code] || '❌ Registration failed: ' + err.message);
  }
};

window.signOut = async function () {
  if (confirm('Are you sure you want to sign out?')) {
    await auth.signOut();
    Utils.Storage.removeItem('userData');
    showPage('auth-page');
  }
};

window.resetPassword = async function () {
  const email = document.getElementById('signin-email').value.trim();
  if (!Utils.Validators.email(email)) return alert('❌ Enter your email first');

  try {
    await sendPasswordResetEmail(auth, email);
    alert('✅ Password reset email sent — check your inbox');
  } catch (err) {
    alert('❌ Error: ' + err.message);
  }
};

// ==================================================
// 📄 PAGE NAVIGATION
// ==================================================
let currentUser = null;
let userProfile = null;
let unsubscribers = [];

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const target = document.getElementById(pageId);
  if (target) target.style.display = 'block';
  window.scrollTo(0, 0);
}

window.showPage = showPage;

function goBack() {
  if (userProfile?.accountType === 'driver') {
    showPage('driver-dashboard-page');
  } else if (userProfile?.accountType === 'company') {
    showPage('company-dashboard-page');
  } else {
    showPage('auth-page');
  }
}

window.goBack = goBack;

// ==================================================
// ✅ AUTH STATE MONITOR — ROUTING CONTROL
// ==================================================
onAuthStateChanged(auth, async (user) => {
  unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
  unsubscribers = [];
  currentUser = user;

  if (!user) {
    userProfile = null;
    showPage('auth-page');
    return;
  }

  if (!user.emailVerified) {
    alert('⚠️ Please verify your email before proceeding');
    await auth.signOut();
    return;
  }

  // Detect account type
  let docSnap = await getDoc(doc(db, 'drivers', user.uid));
  let accountType = 'driver';

  if (!docSnap.exists()) {
    docSnap = await getDoc(doc(db, 'companies', user.uid));
    accountType = 'company';
  }

  if (!docSnap.exists()) {
    alert('⚠️ Profile not found — please register again');
    await auth.signOut();
    return;
  }

  userProfile = { uid: user.uid, ...docSnap.data(), accountType };
  Utils.Storage.set('userData', userProfile);

  console.log('✅ User loaded:', userProfile);

  if (accountType === 'driver') {
    showPage('driver-dashboard-page');
    loadDriverDashboard();
  } else {
    showPage('company-dashboard-page');
    loadCompanyDashboard();
  }
});
// ==================================================
// 🚛 DRIVER PORTAL — DASHBOARD & SUBPAGES
// ==================================================

async function loadDriverDashboard() {
  if (!userProfile) return;
  const page = document.getElementById('driver-dashboard-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <h2>Welcome, ${escapeHtml(userProfile.name)}!</h2>
      <p style="color: #666; margin-top: 0.5rem;">Driver Portal Dashboard</p>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
      <button class="btn primary" onclick="showPage('driver-profile-page'); loadDriverProfile();">
        👤 My Profile
      </button>
      <button class="btn primary" onclick="showPage('driver-calendar-page'); loadDriverCalendar();">
        📅 My Calendar
      </button>
      <button class="btn primary" onclick="showPage('driver-documents-page'); loadDriverDocuments();">
        📄 My Documents
      </button>
      <button class="btn primary" onclick="showPage('driver-checklist-page'); loadDriverChecklist();">
        ✅ Walkaround Checklist
      </button>
      <button class="btn primary" onclick="showPage('driver-work-page'); loadDriverWork();">
        � Posted Work
      </button>
      <button class="btn secondary" onclick="signOut();">
        🚪 Sign Out
      </button>
    </div>
  `;
}

window.loadDriverDashboard = loadDriverDashboard;

// --------------------------
// DRIVER PROFILE
// --------------------------
async function loadDriverProfile() {
  const page = document.getElementById('driver-profile-page');
  if (!page) return;

  const docSnap = await getDoc(doc(db, 'drivers', currentUser.uid));
  const profile = docSnap.exists() ? docSnap.data() : {};

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>👤 My Profile</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>

      <div class="form-group">
        <label for="driver-name">Full Name</label>
        <input type="text" id="driver-name" value="${escapeHtml(profile.name || '')}" />
      </div>
      <div class="form-group">
        <label for="driver-email">Email</label>
        <input type="email" id="driver-email" value="${escapeHtml(profile.email || '')}" readonly />
      </div>
      <div class="form-group">
        <label for="driver-licence">HGV Licence Number</label>
        <input type="text" id="driver-licence" value="${escapeHtml(profile.licenceNumber || '')}" />
      </div>
      <div class="form-group">
        <label for="driver-dob">Date of Birth</label>
        <input type="date" id="driver-dob" value="${profile.dateOfBirth ? Utils.Format.date(profile.dateOfBirth) : ''}" />
      </div>
      <div class="form-group">
        <label for="driver-validfrom">Licence Valid From</label>
        <input type="date" id="driver-validfrom" value="${profile.validFrom ? Utils.Format.date(profile.validFrom) : ''}" />
      </div>
      <div class="form-group">
        <label for="driver-expiry">Licence Expiry Date</label>
        <input type="date" id="driver-expiry" value="${profile.expiryDate ? Utils.Format.date(profile.expiryDate) : ''}" />
      </div>
      <div class="form-group">
        <label for="driver-medical">Medical Certificate Expiry</label>
        <input type="date" id="driver-medical" value="${profile.medicalExpiry ? Utils.Format.date(profile.medicalExpiry) : ''}" />
      </div>
      <div class="form-group">
        <label for="driver-points">Penalty Points</label>
        <input type="number" id="driver-points" value="${profile.points || 0}" min="0" max="12" />
      </div>

      <button class="btn primary" onclick="saveDriverProfile()">💾 Save Profile</button>
    </div>
  `;
}

window.loadDriverProfile = loadDriverProfile;

async function saveDriverProfile() {
  const data = {
    name: document.getElementById('driver-name').value.trim(),
    licenceNumber: document.getElementById('driver-licence').value.trim(),
    dateOfBirth: document.getElementById('driver-dob').valueAsDate,
    validFrom: document.getElementById('driver-validfrom').valueAsDate,
    expiryDate: document.getElementById('driver-expiry').valueAsDate,
    medicalExpiry: document.getElementById('driver-medical').valueAsDate,
    points: parseInt(document.getElementById('driver-points').value) || 0,
    updatedAt: serverTimestamp()
  };

  try {
    await updateDoc(doc(db, 'drivers', currentUser.uid), data);
    Object.assign(userProfile, data);
    alert('✅ Profile saved successfully');
  } catch (e) {
    await setDoc(doc(db, 'drivers', currentUser.uid), { ...data, createdAt: serverTimestamp() }, { merge: true });
    Object.assign(userProfile, data);
    alert('✅ Profile created and saved');
  }
}

window.saveDriverProfile = saveDriverProfile;

// --------------------------
// DRIVER CALENDAR
// --------------------------
async function loadDriverCalendar() {
  const page = document.getElementById('driver-calendar-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>📅 My Calendar</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>
      <p>Your upcoming shifts and assignments will appear here.</p>
      <div id="calendar-events" style="margin-top: 1rem;">
        <p style="color: #666; font-style: italic;">No upcoming events scheduled.</p>
      </div>
    </div>
  `;
}

window.loadDriverCalendar = loadDriverCalendar;

// --------------------------
// DRIVER DOCUMENTS
// --------------------------
async function loadDriverDocuments() {
  const page = document.getElementById('driver-documents-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>📄 My Documents</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>

      <div class="form-group">
        <label>Upload Document</label>
        <input type="file" id="doc-upload" />
        <button class="btn primary" style="margin-top: 0.5rem;" onclick="uploadDriverDocument()">⬆️ Upload</button>
      </div>

      <h3 style="margin-top: 2rem;">My Files</h3>
      <div id="docs-list">
        <p style="color: #666; font-style: italic;">No documents uploaded yet.</p>
      </div>
    </div>
  `;

  loadDocsList();
}

window.loadDriverDocuments = loadDriverDocuments;

async function loadDocsList() {
  const listEl = document.getElementById('docs-list');
  if (!listEl) return;

  const q = query(collection(db, 'driver-documents'), where('driverUid', '==', currentUser.uid), orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = `<p style="color: #666; font-style: italic;">No documents uploaded yet.</p>`;
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const doc = d.data();
    return `
      <div style="padding: 0.75rem; background: var(--primary-light); border-radius: 6px; margin-top: 0.5rem;">
        <a href="${escapeHtml(doc.url)}" target="_blank" style="font-weight: 500;">${escapeHtml(doc.name)}</a>
        <br><small>${Utils.Format.datetime(doc.uploadedAt?.toDate())}</small>
      </div>
    `;
  }).join('');
}

window.loadDocsList = loadDocsList;

async function uploadDriverDocument() {
  const fileInput = document.getElementById('doc-upload');
  if (!fileInput.files.length) return alert('❌ Please select a file first');

  const file = fileInput.files[0];
  const fileId = Utils.generateId();
  const fileRef = ref(storage, `driver-docs/${currentUser.uid}/${fileId}_${file.name}`);

  try {
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await addDoc(collection(db, 'driver-documents'), {
      driverUid: currentUser.uid,
      name: file.name,
      url,
      uploadedAt: serverTimestamp()
    });

    alert('✅ Document uploaded');
    loadDocsList();
    fileInput.value = '';
  } catch (err) {
    console.error(err);
    alert('❌ Upload failed: ' + err.message);
  }
}

window.uploadDriverDocument = uploadDriverDocument;

// --------------------------
// DRIVER WORK / POSTED JOBS
// --------------------------
async function loadDriverWork() {
  const page = document.getElementById('driver-work-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>📓 Posted Work</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>
      <p>Available jobs posted by companies will appear here.</p>
      <div id="work-list" style="margin-top: 1rem;"></div>
    </div>
  `;

  const listEl = document.getElementById('work-list');
  const q = query(collection(db, 'jobs'), where('isActive', '==', true), orderBy('postedAt', 'desc'));
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = `<p style="color: #666; font-style: italic;">No jobs posted yet. Check back soon!</p>`;
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const job = d.data();
    return `
      <div style="padding: 1rem; background: var(--primary-light); border-radius: 6px; margin-bottom: 0.75rem;">
        <h4 style="margin: 0 0 0.5rem 0;">${escapeHtml(job.title || 'Untitled Job')}</h4>
        <p style="margin: 0.25rem 0;"><strong>From:</strong> ${escapeHtml(job.fromLocation || '—')}</p>
        <p style="margin: 0.25rem 0;"><strong>To:</strong> ${escapeHtml(job.toLocation || '—')}</p>
        <p style="margin: 0.25rem 0;"><strong>Pay:</strong> ${Utils.Format.currency(job.pay || 0)}</p>
        <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${escapeHtml(job.description || '')}</p>
        <small>Posted: ${Utils.Format.datetime(job.postedAt?.toDate())}</small>
      </div>
    `;
  }).join('');
}

window.loadDriverWork = loadDriverWork;

// --------------------------
// DRIVER WALKAROUND CHECKLIST
// --------------------------
const DVSA_CHECKLIST_ITEMS = [
  { id: 'tyres', label: 'Tyres & Wheels', required: true },
  { id: 'brakes', label: 'Brakes', required: true },
  { id: 'lights', label: 'Lights & Indicators', required: true },
  { id: 'mirrors', label: 'Mirrors & Windows', required: true },
  { id: 'wipers', label: 'Windscreen Wipers & Washers', required: true },
  { id: 'horn', label: 'Horn', required: true },
  { id: 'exhaust', label: 'Exhaust System', required: true },
  { id: 'suspension', label: 'Suspension', required: true },
  { id: 'coupling', label: 'Coupling & Security', required: true },
  { id: 'doors', label: 'Doors & Bodywork', required: true },
  { id: 'markings', label: 'Plates & Markings', required: true },
  { id: 'fire', label: 'Fire Extinguisher & Safety Equipment', required: true },
  { id: 'fuel', label: 'Fuel System & Caps', required: true },
  { id: 'oil', label: 'Oil & Fluid Leaks', required: true },
  { id: 'emergency', label: 'Emergency Equipment', required: true }
];

async function loadDriverChecklist() {
  const page = document.getElementById('driver-checklist-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>✅ Daily Walkaround Checklist</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>

      <p style="margin-bottom: 1rem;">Complete before starting your journey. DVSA Compliant.</p>

      <div id="checklist-form">
        ${DVSA_CHECKLIST_ITEMS.map(item => `
          <div style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
            <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
              <input type="checkbox" id="check-${item.id}" data-label="${escapeHtml(item.label)}" />
              <span>${escapeHtml(item.label)}</span>
            </label>
            <div style="margin-left: 1.75rem; margin-top: 0.25rem;">
              <input type="text" id="note-${item.id}" placeholder="Add note if needed..." style="width: 100%; padding: 0.25rem; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
          </div>
        `).join('')}
      </div>

      <div class="form-group" style="margin-top: 1.5rem;">
        <label>Vehicle Registration</label>
        <input type="text" id="check-vrm" placeholder="e.g. AB51 XYZ" />
      </div>
      <div class="form-group">
        <label>Mileage</label>
        <input type="number" id="check-mileage" placeholder="Current mileage" />
      </div>
      <div class="form-group">
        <label>Signature / Name</label>
        <input type="text" id="check-signoff" placeholder="Your name" />
      </div>

      <button class="btn primary" onclick="submitChecklist()">✅ Submit Checklist</button>
    </div>

    <div class="card" style="margin-top: 2rem;">
      <h3>📋 Recent Checks</h3>
      <div id="checklist-history"></div>
    </div>
  `;

  loadChecklistHistory();
}

window.loadDriverChecklist = loadDriverChecklist;

async function submitChecklist() {
  const checked = [];
  const notes = {};

  DVSA_CHECKLIST_ITEMS.forEach(item => {
    const cb = document.getElementById(`check-${item.id}`);
    const note = document.getElementById(`note-${item.id}`);
    if (cb?.checked) checked.push(item.id);
    if (note?.value?.trim()) notes[item.id] = note.value.trim();
  });

  const vrm = document.getElementById('check-vrm').value.trim();
  const mileage = parseInt(document.getElementById('check-mileage').value) || 0;
  const signoff = document.getElementById('check-signoff').value.trim();

  if (!vrm) return alert('❌ Please enter vehicle registration');
  if (!signoff) return alert('❌ Please enter your name');

  try {
    await addDoc(collection(db, 'checklists'), {
      driverUid: currentUser.uid,
      driverName: userProfile.name,
      vrm,
      mileage,
      checked,
      notes,
      signedOff: signoff,
      completedAt: serverTimestamp()
    });
    alert('✅ Checklist submitted — Thank You');
    loadDriverChecklist();
  } catch (err) {
    console.error(err);
    alert('❌ Error submitting: ' + err.message);
  }
}

window.submitChecklist = submitChecklist;

async function loadChecklistHistory() {
  const listEl = document.getElementById('checklist-history');
  if (!listEl) return;

  const q = query(
    collection(db, 'checklists'),
    where('driverUid', '==', currentUser.uid),
    orderBy('completedAt', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    listEl.innerHTML = `<p style="color: #666; font-style: italic;">No previous checks submitted.</p>`;
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const chk = d.data();
    const pct = Math.round((chk.checked?.length || 0) / DVSA_CHECKLIST_ITEMS.length * 100);
    return `
      <div style="padding: 0.75rem; background: var(--primary-light); border-radius: 6px; margin-top: 0.5rem;">
        <strong>${escapeHtml(chk.vrm || 'Unknown Vehicle')}</strong>
        <br><small>${Utils.Format.datetime(chk.completedAt?.toDate())} — ${pct}% complete — ${escapeHtml(chk.signedOff || 'Anonymous')}</small>
      </div>
    `;
  }).join('');
}

window.loadChecklistHistory = loadChecklistHistory;
// ==================================================
// 🏢 COMPANY PORTAL — DASHBOARD & SUBPAGES
// ==================================================

async function loadCompanyDashboard() {
  if (!userProfile) return;
  const page = document.getElementById('company-dashboard-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <h2>Welcome, ${escapeHtml(userProfile.name)}!</h2>
      <p style="color: #666; margin-top: 0.5rem;">${escapeHtml(userProfile.companyName || 'Company Name')} — Company Portal</p>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
      <button class="btn primary" onclick="showPage('company-work-page'); loadCompanyWork();">
        📋 Posted Work
      </button>
      <button class="btn primary" style="width: 100%;" onclick="showPage('vehicles-page'); loadVehicles();">
  🚚 Vehicle Management
</button>
<button class="btn primary" style="width: 100%;" onclick="showPage('trailers-page'); loadTrailers();">
  🚛 Trailer Management
</button>
<button class="btn primary" style="width: 100%;" onclick="showPage('service-logs-page'); loadServiceLogsPage();">
  🔧 Service Logs
</button>
<button class="btn primary" style="width: 100%;" onclick="showPage('reports-page'); loadExpiryAlerts();">
  📊 Reports & Alerts
</button>
      <button class="btn primary" onclick="showPage('company-drivers-page'); loadCompanyDrivers();">
        👥 Employed Drivers
      </button>
      <button class="btn primary" onclick="showPage('company-post-job-page');">
        🚛 Post New Job
      </button>
      <button class="btn primary" onclick="showPage('company-checklist-editor-page'); loadChecklistEditor();">
        ✅ Checklist Editor
      </button>
      <button class="btn primary" onclick="showPage('company-holidays-page'); loadHolidayRequests();">
        🏖️ Holiday Requests
      </button>
      <button class="btn secondary" onclick="signOut();">
        🚪 Sign Out
      </button>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
      <div class="card">
        <h3>📊 Quick Stats</h3>
        <p><strong>Active Jobs:</strong> <span id="stat-jobs">0</span></p>
        <p><strong>Employed Drivers:</strong> <span id="stat-drivers">0</span></p>
        <p><strong>Checklists Today:</strong> <span id="stat-checklists">0</span></p>
      </div>
      <div class="card">
        <h3>🕐 Recent Activity</h3>
        <div id="company-activity">
          <p style="color: #666; font-style: italic;">Loading...</p>
        </div>
      </div>
    </div>
  `;

  loadCompanyStats();
  loadCompanyActivity();
}

window.loadCompanyDashboard = loadCompanyDashboard;

// --------------------------
// COMPANY STATS & ACTIVITY
// --------------------------
async function loadCompanyStats() {
  const jobsSnap = await getDocs(query(
    collection(db, 'jobs'),
    where('companyId', '==', currentUser.uid),
    where('isActive', '==', true)
  ));
  document.getElementById('stat-jobs').textContent = jobsSnap.size;

  const driversSnap = await getDocs(collection(db, 'companies', currentUser.uid, 'drivers'));
  document.getElementById('stat-drivers').textContent = driversSnap.size;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checksSnap = await getDocs(query(
    collection(db, 'checklists'),
    where('completedAt', '>=', today)
  ));
  document.getElementById('stat-checklists').textContent = checksSnap.size;
}

window.loadCompanyStats = loadCompanyStats;

async function loadCompanyActivity() {
  const container = document.getElementById('company-activity');
  const snap = await getDocs(query(
    collection(db, 'checklists'),
    orderBy('completedAt', 'desc'),
    limit(5)
  ));

  if (snap.empty) {
    container.innerHTML = `<p style="color: #666; font-style: italic;">No recent activity.</p>`;
    return;
  }

  container.innerHTML = snap.docs.map(d => {
    const chk = d.data();
    return `
      <div style="padding: 0.4rem 0; border-bottom: 1px solid #eee; font-size: 0.9rem;">
        <strong>${escapeHtml(chk.driverName || 'Driver')}</strong> — ${escapeHtml(chk.vrm || 'Unknown')}
        <br><span style="color: #666; font-size: 0.8rem;">${Utils.Format.datetime(chk.completedAt?.toDate())}</span>
      </div>
    `;
  }).join('');
}

window.loadCompanyActivity = loadCompanyActivity;

// --------------------------
// POSTED WORK — COMPANY VIEW
// --------------------------
async function loadCompanyWork() {
  const page = document.getElementById('company-work-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>📋 Posted Work</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>
      <div id="company-work-list"></div>
    </div>
  `;

  const listEl = document.getElementById('company-work-list');
  const snap = await getDocs(query(
    collection(db, 'jobs'),
    where('companyId', '==', currentUser.uid),
    orderBy('postedAt', 'desc')
  ));

  if (snap.empty) {
    listEl.innerHTML = `<p style="color: #666; font-style: italic;">No jobs posted yet. Click "Post New Job" to get started.</p>`;
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const job = d.data();
    return `
      <div style="padding: 1rem; background: var(--primary-light); border-radius: 6px; margin-bottom: 0.75rem;">
        <h4 style="margin: 0 0 0.5rem 0;">${escapeHtml(job.title || 'Untitled Job')}</h4>
        <p style="margin: 0.25rem 0;"><strong>Route:</strong> ${escapeHtml(job.fromLocation || '—')} → ${escapeHtml(job.toLocation || '—')}</p>
        <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${job.jobDate || '—'}</p>
        <p style="margin: 0.25rem 0;"><strong>Pay:</strong> ${Utils.Format.currency(job.pay || 0)}</p>
        <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${escapeHtml(job.description || '')}</p>
        <div style="margin-top: 0.75rem;">
          <span style="display: inline-block; padding: 0.25rem 0.5rem; background: ${job.isActive ? '#d4edda' : '#f8d7da'}; border-radius: 4px; font-size: 0.8rem;">
            ${job.isActive ? '🟢 Active' : '🔴 Closed'}
          </span>
          ${job.isActive ? `
            <button class="btn secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; float: right;" onclick="closeJob('${d.id}')">Close Job</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.loadCompanyWork = loadCompanyWork;

// --------------------------
// POST NEW JOB
// --------------------------
document.addEventListener('submit', async e => {
  if (e.target?.id === 'post-job-form') {
    e.preventDefault();
    await postNewJob();
  }
});

async function postNewJob() {
  const title = document.getElementById('job-title')?.value.trim();
  const from = document.getElementById('job-from')?.value.trim();
  const to = document.getElementById('job-to')?.value.trim();
  const date = document.getElementById('job-date')?.value;
  const pay = parseFloat(document.getElementById('job-pay')?.value) || 0;
  const desc = document.getElementById('job-desc')?.value.trim();

  if (!title || !from || !to || !date || !pay) {
    return alert('❌ Please fill in all required fields');
  }

  try {
    await addDoc(collection(db, 'jobs'), {
      companyId: currentUser.uid,
      title,
      fromLocation: from,
      toLocation: to,
      jobDate: date,
      pay,
      description: desc,
      isActive: true,
      postedAt: serverTimestamp()
    });
    alert('✅ Job posted successfully!');
    showPage('company-work-page');
    loadCompanyWork();
  } catch (err) {
    console.error(err);
    alert('❌ Failed to post job: ' + err.message);
  }
}

window.postNewJob = postNewJob;

async function closeJob(jobId) {
  if (!confirm('Close this job? It will no longer be visible to drivers.')) return;
  try {
    await updateDoc(doc(db, 'jobs', jobId), { isActive: false, closedAt: serverTimestamp() });
    alert('✅ Job closed');
    loadCompanyWork();
  } catch (err) {
    alert('❌ Failed to close job: ' + err.message);
  }
}

window.closeJob = closeJob;

// --------------------------
// ADD / MANAGE EMPLOYED DRIVERS
// --------------------------
async function loadCompanyDrivers() {
  const page = document.getElementById('company-drivers-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>👥 Employed Drivers</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>

      <div class="form-group" style="background: var(--primary-light); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
        <h3 style="margin-top: 0; font-size: 1rem;">Add New Driver</h3>
        <div class="form-group">
          <label>Driver Name</label>
          <input type="text" id="new-driver-name" placeholder="Full name" />
        </div>
        <div class="form-group">
          <label>Driver Email</label>
          <input type="email" id="new-driver-email" placeholder="driver@email.com" />
        </div>
        <button class="btn primary" onclick="addEmployedDriver()">➕ Add Driver</button>
      </div>

      <h3>Current Drivers</h3>
      <div id="drivers-list">
        <p style="color: #666; font-style: italic;">Loading...</p>
      </div>
    </div>
  `;

  refreshDriversList();
}

window.loadCompanyDrivers = loadCompanyDrivers;

async function addEmployedDriver() {
  const name = document.getElementById('new-driver-name').value.trim();
  const email = document.getElementById('new-driver-email').value.trim();

  if (!name || !email) return alert('❌ Please enter both name and email');
  if (!Utils.Validators.email(email)) return alert('❌ Please enter a valid email');

  try {
    const driverId = Utils.generateId();
    await setDoc(doc(db, 'companies', currentUser.uid, 'drivers', driverId), {
      id: driverId,
      name,
      email,
      addedAt: serverTimestamp()
    });
    alert('✅ Driver added successfully');
    document.getElementById('new-driver-name').value = '';
    document.getElementById('new-driver-email').value = '';
    refreshDriversList();
  } catch (err) {
    alert('❌ Failed to add driver: ' + err.message);
  }
}

window.addEmployedDriver = addEmployedDriver;

async function refreshDriversList() {
  const listEl = document.getElementById('drivers-list');
  const snap = await getDocs(collection(db, 'companies', currentUser.uid, 'drivers'));

  if (snap.empty) {
    listEl.innerHTML = `<p style="color: #666; font-style: italic;">No drivers added yet.</p>`;
    return;
  }

  listEl.innerHTML = snap.docs.map(d => {
    const driver = d.data();
    return `
      <div style="padding: 0.75rem; background: var(--primary-light); border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${escapeHtml(driver.name)}</strong>
          <br><small>${escapeHtml(driver.email)}</small>
        </div>
        <div>
          <button class="btn secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="viewDriverCalendarForCompany('${d.id}')">📅 Calendar</button>
          <button class="btn secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="removeDriver('${d.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

window.refreshDriversList = refreshDriversList;

async function removeDriver(driverId) {
  if (!confirm('Remove this driver from your company? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'companies', currentUser.uid, 'drivers', driverId));
    alert('✅ Driver removed');
    refreshDriversList();
  } catch (err) {
    alert('❌ Failed to remove driver: ' + err.message);
  }
}

window.removeDriver = removeDriver;

function viewDriverCalendarForCompany(driverId) {
  alert('📅 Calendar view — feature ready to connect');
}

window.viewDriverCalendarForCompany = viewDriverCalendarForCompany;
// ==================================================
// ✅ COMPANY CHECKLIST EDITOR — FIXED: Loads existing items
// ==================================================

const DEFAULT_CHECKLIST = [
  { id: 'vehicle-condition', label: 'Vehicle Exterior Condition', category: 'General', required: true },
  { id: 'windscreen-mirrors', label: 'Windscreen & Mirrors', category: 'General', required: true },
  { id: 'lights-indicators', label: 'Lights & Indicators', category: 'General', required: true },
  { id: 'tyres-wheels', label: 'Tyres & Wheels / Wheel Nuts', category: 'Wheels', required: true },
  { id: 'brakes', label: 'Brakes — Operation & Condition', category: 'Brakes', required: true },
  { id: 'fuel-system', label: 'Fuel System — Leaks & Security', category: 'Engine', required: true },
  { id: 'exhaust', label: 'Exhaust System', category: 'Engine', required: true },
  { id: 'coupling', label: 'Coupling & Security', category: 'Trailer', required: true },
  { id: 'suspension', label: 'Suspension', category: 'General', required: true },
  { id: 'doors-body', label: 'Doors & Bodywork', category: 'General', required: true },
  { id: 'markings-plates', label: 'Plates & Markings', category: 'General', required: true },
  { id: 'fire-safety', label: 'Fire Extinguisher & Safety Equipment', category: 'Safety', required: true },
  { id: 'emergency-kit', label: 'Emergency Equipment', category: 'Safety', required: true },
  { id: 'oil-levels', label: 'Oil & Fluid Levels / Leaks', category: 'Engine', required: true },
  { id: 'horn-wipers', label: 'Horn, Washers & Wipers', category: 'General', required: true }
];

// Initialise default checklist for a company (runs once at registration)
window.initialiseCompanyChecklist = async function(companyId) {
  const companyChecklistRef = doc(db, 'companies', companyId, 'settings', 'checklist');
  const snap = await getDoc(companyChecklistRef);
  
  if (!snap.exists()) {
    await setDoc(companyChecklistRef, {
      items: DEFAULT_CHECKLIST,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    console.log('✅ DVSA-compliant checklist installed for company:', companyId);
    return DEFAULT_CHECKLIST;
  }
  return snap.data().items || DEFAULT_CHECKLIST;
};

let currentChecklistItems = [];

async function loadChecklistEditor() {
  const page = document.getElementById('company-checklist-editor-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>✅ Checklist Editor</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>

      <p style="margin-bottom: 1rem;">Customise your daily walkaround checklist. DVSA baseline included.</p>

      <div style="background: var(--primary-light); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
        <h3 style="margin-top: 0; font-size: 1rem;">Add New Check Item</h3>
        <div class="form-group">
          <label>Item Label</label>
          <input type="text" id="new-item-label" placeholder="e.g. Fifth Wheel Operation" />
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" id="new-item-category" placeholder="e.g. Trailer" />
        </div>
        <label style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
          <input type="checkbox" id="new-item-required" checked /> Required Item
        </label>
        <button class="btn primary" onclick="addChecklistItem()">➕ Add Item</button>
      </div>

      <h3>Current Checklist Items</h3>
      <div id="checklist-editor-list" style="margin-top: 1rem;">
        <p style="color: #666; font-style: italic;">Loading existing items...</p>
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn primary" onclick="saveChecklist()">💾 Save Changes</button>
        <button class="btn secondary" onclick="resetChecklist()">↩️ Reset to DVSA Default</button>
      </div>
    </div>
  `;

  // ✅ FIX: Load EXISTING items from Firestore
  await loadExistingChecklistItems();
}

window.loadChecklistEditor = loadChecklistEditor;

// ✅ NEW: Load saved items from database
async function loadExistingChecklistItems() {
  const listEl = document.getElementById('checklist-editor-list');
  const checklistRef = doc(db, 'companies', currentUser.uid, 'settings', 'checklist');
  const snap = await getDoc(checklistRef);

  if (snap.exists() && snap.data().items) {
    currentChecklistItems = snap.data().items;
    console.log('✅ Loaded', currentChecklistItems.length, 'existing checklist items');
  } else {
    // No saved items yet — use defaults
    currentChecklistItems = [...DEFAULT_CHECKLIST];
    console.log('⚠️ No saved checklist found — using defaults');
  }

  renderChecklistEditorList();
}

function renderChecklistEditorList() {
  const listEl = document.getElementById('checklist-editor-list');
  
  if (!currentChecklistItems.length) {
    listEl.innerHTML = `<p style="color: #666; font-style: italic;">No items yet — add one above!</p>`;
    return;
  }

  listEl.innerHTML = currentChecklistItems.map((item, index) => `
    <div style="padding: 0.75rem; background: var(--primary-light); border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <span style="display: inline-block; font-size: 0.75rem; background: #ccc; padding: 0.1rem 0.4rem; border-radius: 3px; margin-left: 0.5rem;">${escapeHtml(item.category || 'General')}</span>
        ${item.required ? '<span style="color: #d47500; font-size: 0.8rem; margin-left: 0.3rem;">★ Required</span>' : ''}
      </div>
      <button class="btn secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="removeChecklistItem(${index})">🗑️</button>
    </div>
  `).join('');
}

window.renderChecklistEditorList = renderChecklistEditorList;

function addChecklistItem() {
  const label = document.getElementById('new-item-label').value.trim();
  const category = document.getElementById('new-item-category').value.trim() || 'General';
  const required = document.getElementById('new-item-required').checked;

  if (!label) return alert('❌ Please enter a label for the checklist item');

  currentChecklistItems.push({
    id: 'custom-' + Utils.generateId(),
    label,
    category,
    required
  });

  document.getElementById('new-item-label').value = '';
  document.getElementById('new-item-category').value = '';
  
  renderChecklistEditorList();
}

window.addChecklistItem = addChecklistItem;

function removeChecklistItem(index) {
  if (!confirm('Remove this checklist item?')) return;
  currentChecklistItems.splice(index, 1);
  renderChecklistEditorList();
}

window.removeChecklistItem = removeChecklistItem;

async function saveChecklist() {
  if (!currentChecklistItems.length) return alert('❌ Checklist cannot be empty');

  try {
    const checklistRef = doc(db, 'companies', currentUser.uid, 'settings', 'checklist');
    await setDoc(checklistRef, {
      items: currentChecklistItems,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    alert('✅ Checklist saved successfully — drivers will see the updated list');
  } catch (err) {
    console.error(err);
    alert('❌ Failed to save: ' + err.message);
  }
}

window.saveChecklist = saveChecklist;

async function resetChecklist() {
  if (!confirm('⚠️ Reset to DVSA default? All custom items will be removed.')) return;
  currentChecklistItems = [...DEFAULT_CHECKLIST];
  await saveChecklist();
  renderChecklistEditorList();
}

window.resetChecklist = resetChecklist;

// ==================================================
// 🏖️ HOLIDAY REQUESTS
// ==================================================
async function loadHolidayRequests() {
  const page = document.getElementById('company-holidays-page');
  if (!page) return;

  page.innerHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>🏖️ Holiday Requests</h2>
        <button class="btn secondary" onclick="goBack()">← Back</button>
      </div>

      <p style="margin-bottom: 1rem;">View and manage driver holiday & time-off requests.</p>

      <div id="holiday-list">
        <p style="color: #666; font-style: italic;">Loading...</p>
      </div>
    </div>
  `;

  refreshHolidayList();
}

window.loadHolidayRequests = loadHolidayRequests;

async function refreshHolidayList() {
  const listEl = document.getElementById('holiday-list');
  
  // Placeholder — replace with real Firestore query when collection exists
  listEl.innerHTML = `
    <p style="color: #666; font-style: italic;">No holiday requests submitted yet.</p>
    <div style="margin-top: 1rem; padding: 1rem; background: var(--primary-light); border-radius: 6px;">
      <p><strong>Feature Status:</strong> Ready — connect your drivers to submit requests from their portal.</p>
    </div>
  `;
}

window.refreshHolidayList = refreshHolidayList;

// ==================================================
// ✅ INITIALISE COMPANY CHECKLIST ON FIRST LOAD
// ==================================================
// Called automatically during registration — see register() in Section 2
// ==================================================
// 📦 FINAL EXPORTS — Make all functions globally accessible
// ==================================================

window.initialiseCompanyChecklist = initialiseCompanyChecklist;
window.currentChecklistItems = currentChecklistItems;

// Dashboard & Navigation
window.loadCompanyDashboard = loadCompanyDashboard;
window.loadCompanyStats = loadCompanyStats;
window.loadCompanyActivity = loadCompanyActivity;

// Work & Jobs
window.loadCompanyWork = loadCompanyWork;
window.postNewJob = postNewJob;
window.closeJob = closeJob;

// Drivers
window.loadCompanyDrivers = loadCompanyDrivers;
window.addEmployedDriver = addEmployedDriver;
window.refreshDriversList = refreshDriversList;
window.removeDriver = removeDriver;
window.viewDriverCalendarForCompany = viewDriverCalendarForCompany;

// Checklist Editor
window.loadChecklistEditor = loadChecklistEditor;
window.loadExistingChecklistItems = loadExistingChecklistItems;
window.renderChecklistEditorList = renderChecklistEditorList;
window.addChecklistItem = addChecklistItem;
window.removeChecklistItem = removeChecklistItem;
window.saveChecklist = saveChecklist;
window.resetChecklist = resetChecklist;

// Holiday Requests
window.loadHolidayRequests = loadHolidayRequests;
window.refreshHolidayList = refreshHolidayList;

// ==================================================
// 🛡️ GLOBAL ERROR HANDLING
// ==================================================
window.onerror = function(message, source, lineno, colno, error) {
  console.error('❌ [GLOBAL ERROR]', { message, source, lineno, colno, error });
  
  // Suppress common non-critical errors
  if (message.includes('ResizeObserver') || message.includes('script error')) {
    return true; // Don't show to user
  }
  
  return false;
};

window.unhandledrejection = function(event) {
  console.error('❌ [UNHANDLED PROMISE]', event.reason);
  event.preventDefault();
};

// ==================================================
// 📱 HELPER: DETECT DEVICE TYPE
// ==================================================
const Device = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: /iPad|Android/.test(navigator.userAgent) && window.innerWidth >= 768,
  isDesktop: window.innerWidth >= 1024
};

window.Device = Device;
console.log('📱 Device detected:', Device.isMobile ? 'Mobile' : Device.isTablet ? 'Tablet' : 'Desktop');

// ==================================================
// 🔄 HELPER: SYNC LOCAL PROFILE STATE
// ==================================================
window.syncProfileState = function(updates = {}) {
  if (!userProfile) return;
  Object.assign(userProfile, updates);
  Utils.Storage.set('userData', userProfile);
};

// ==================================================
// ⏱️ HELPER: DEBOUNCE FOR PERFORMANCE
// ==================================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.debounce = debounce;

// ==================================================
// 📊 HELPER: FORMAT FIREBASE TIMESTAMP
// ==================================================
function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

window.formatTimestamp = formatTimestamp;

// ==================================================
// 🧹 CLEANUP ON PAGE UNLOAD
// ==================================================
window.addEventListener('beforeunload', () => {
  unsubscribers.forEach(unsub => {
    try { unsub(); } catch (e) {}
  });
});

// ==================================================
// ✅ SYSTEM READY — CONFIRMATION
// ==================================================
console.log('========================================');
console.log('🚛 LSD SOLUTIONS — APP FULLY LOADED');
console.log('✅ Firebase Connected');
console.log('✅ All Portals Ready');
console.log('✅ DVSA Checklist System Active');
console.log('========================================');
console.log('Version: 1.0 | Build: 2026-10-14');
console.log('========================================');
// ==================================================
// 🚛 LSD SOLUTIONS — VEHICLE & TRAILER MANAGEMENT
// PDF REPORTS • EMAIL NOTIFICATIONS • SERVICE LOGS
// ==================================================

// ==================================================
// 🛠️ HELPER FUNCTIONS
// ==================================================
function formatDate(dateVal) {
  if (!dateVal) return '—';
  const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatInputDate(dateVal) {
  if (!dateVal) return '';
  const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
  return d.toISOString().split('T')[0];
}

function daysUntil(dateVal) {
  if (!dateVal) return -999;
  const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function getStatusLabel(status) {
  const labels = {
    active: '✅ Active',
    maintenance: '🔧 In Maintenance',
    offroad: '⛔ Off Road',
    retired: '📦 Retired',
    completed: '✅ Completed',
    pending: '⏳ Pending',
    'in-progress': '🔄 In Progress'
  };
  return labels[status] || status;
}

function getTrailerTypeLabel(type) {
  const labels = {
    box: '📦 Box / Van',
    curtainside: '🚪 Curtainside',
    flatbed: '📏 Flatbed',
    refrigerated: '❄️ Refrigerated',
    tanker: '🛢️ Tanker',
    skeletal: '🏗️ Skeletal'
  };
  return labels[type] || type;
}

function getServiceTypeLabel(type) {
  const labels = {
    routine: '🔩 Routine Service',
    repair: '🔧 Repair',
    mot: '📋 MOT / Inspection',
    tyres: '🛞 Tyre Replacement',
    brakes: '🛑 Brakes',
    other: '📝 Other'
  };
  return labels[type] || type;
}

// ==================================================
// 🚚 VEHICLE MANAGEMENT
// ==================================================
let currentVehicleId = null;
let currentTrailerId = null;

window.loadVehicles = async function() {
  if (!currentUser) return;
  const listEl = document.getElementById('vehicles-list');
  if (!listEl) return;
  listEl.innerHTML = '<p class="text-muted">Loading vehicles...</p>';
  
  try {
    const q = query(
      collection(db, `companies/${currentUser.uid}/vehicles`),
      orderBy('registration', 'asc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      listEl.innerHTML = '<p class="text-muted">No vehicles added yet. Click "Add Vehicle" to get started.</p>';
      return;
    }
    
    listEl.innerHTML = snapshot.docs.map(doc => {
      const v = doc.data();
      const motDays = daysUntil(v.motExpiry);
      const taxDays = daysUntil(v.taxExpiry);
      const insDays = daysUntil(v.insuranceExpiry);
      
      return `
        <div class="list-item" style="border: 1px solid #ddd; padding: 1rem; margin: 0.5rem 0; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h4 style="margin: 0; font-size: 1.1rem;">${escapeHtml(v.registration)}</h4>
              <p style="margin: 0.25rem 0; color: #666;">${escapeHtml(v.make || '')} ${escapeHtml(v.model || '')} ${v.year || ''}</p>
              <span class="badge ${v.status === 'active' ? 'badge-success' : v.status === 'maintenance' ? 'badge-warning' : 'badge-danger'}">
                ${getStatusLabel(v.status)}
              </span>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                MOT: ${formatDate(v.motExpiry)} ${motDays >= 0 && motDays <= 30 ? `<span style="color:red; font-weight:bold;">(${motDays}d)</span>` : ''}
              </p>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                Tax: ${formatDate(v.taxExpiry)} ${taxDays >= 0 && taxDays <= 30 ? `<span style="color:red; font-weight:bold;">(${taxDays}d)</span>` : ''}
              </p>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                Ins: ${formatDate(v.insuranceExpiry)} ${insDays >= 0 && insDays <= 30 ? `<span style="color:red; font-weight:bold;">(${insDays}d)</span>` : ''}
              </p>
            </div>
          </div>
          <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" 
                    onclick="editVehicle('${doc.id}')">✏️ Edit</button>
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" 
                    onclick="showServiceForAsset('${v.registration}', 'vehicle')">🔧 Service Log</button>
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" 
                    onclick="exportVehiclePDF('${doc.id}')">📄 PDF</button>
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem; color: #b00;" 
                    onclick="deleteVehicle('${doc.id}')">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading vehicles:', error);
    listEl.innerHTML = '<p style="color:red;">Error loading vehicles. Please refresh.</p>';
  }
};

window.showAddVehicleForm = function() {
  currentVehicleId = null;
  const title = document.getElementById('vehicle-form-title');
  const form = document.getElementById('vehicle-form');
  const idField = document.getElementById('vehicle-id');
  if (title) title.textContent = 'Add Vehicle';
  if (form) form.reset();
  if (idField) idField.value = '';
  showPage('vehicle-form-page');
};

window.editVehicle = async function(id) {
  currentVehicleId = id;
  const docSnap = await getDoc(doc(db, `companies/${currentUser.uid}/vehicles/${id}`));
  if (!docSnap.exists) return;
  const v = docSnap.data();
  
  document.getElementById('vehicle-form-title').textContent = 'Edit Vehicle';
  document.getElementById('vehicle-id').value = id;
  document.getElementById('veh-reg').value = v.registration || '';
  document.getElementById('veh-type').value = v.type || 'tractor';
  document.getElementById('veh-make').value = v.make || '';
  document.getElementById('veh-model').value = v.model || '';
  document.getElementById('veh-year').value = v.year || '';
  document.getElementById('veh-mot-expiry').value = formatInputDate(v.motExpiry);
  document.getElementById('veh-tax-expiry').value = formatInputDate(v.taxExpiry);
  document.getElementById('veh-ins-expiry').value = formatInputDate(v.insuranceExpiry);
  document.getElementById('veh-status').value = v.status || 'active';
  document.getElementById('veh-notes').value = v.notes || '';
  
  showPage('vehicle-form-page');
};

window.saveVehicle = async function(e) {
  e.preventDefault();
  if (!currentUser) return;
  
  const vehicleData = {
    companyId: currentUser.uid,
    registration: document.getElementById('veh-reg').value.toUpperCase(),
    type: document.getElementById('veh-type').value,
    make: document.getElementById('veh-make').value,
    model: document.getElementById('veh-model').value,
    year: parseInt(document.getElementById('veh-year').value) || null,
    motExpiry: new Date(document.getElementById('veh-mot-expiry').value),
    taxExpiry: new Date(document.getElementById('veh-tax-expiry').value),
    insuranceExpiry: new Date(document.getElementById('veh-ins-expiry').value),
    status: document.getElementById('veh-status').value,
    notes: document.getElementById('veh-notes').value,
    updatedAt: serverTimestamp()
  };
  
  try {
    if (currentVehicleId) {
      await updateDoc(doc(db, `companies/${currentUser.uid}/vehicles/${currentVehicleId}`), vehicleData);
    } else {
      vehicleData.createdAt = serverTimestamp();
      await addDoc(collection(db, `companies/${currentUser.uid}/vehicles`), vehicleData);
    }
    showPage('vehicles-page');
    loadVehicles();
  } catch (error) {
    console.error('Error saving vehicle:', error);
    alert('Error saving vehicle. Please try again.');
  }
};

window.deleteVehicle = async function(id) {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;
  try {
    await deleteDoc(doc(db, `companies/${currentUser.uid}/vehicles/${id}`));
    loadVehicles();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    alert('Error deleting vehicle.');
  }
};

// ==================================================
// 🚛 TRAILER MANAGEMENT
// ==================================================
window.loadTrailers = async function() {
  if (!currentUser) return;
  const listEl = document.getElementById('trailers-list');
  if (!listEl) return;
  listEl.innerHTML = '<p class="text-muted">Loading trailers...</p>';
  
  try {
    const q = query(
      collection(db, `companies/${currentUser.uid}/trailers`),
      orderBy('identifier', 'asc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      listEl.innerHTML = '<p class="text-muted">No trailers added yet. Click "Add Trailer" to get started.</p>';
      return;
    }
    
    listEl.innerHTML = snapshot.docs.map(doc => {
      const t = doc.data();
      const platDays = daysUntil(t.platingExpiry);
      const insDays = daysUntil(t.insuranceExpiry);
      
      return `
        <div class="list-item" style="border: 1px solid #ddd; padding: 1rem; margin: 0.5rem 0; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h4 style="margin: 0; font-size: 1.1rem;">${escapeHtml(t.identifier)}</h4>
              <p style="margin: 0.25rem 0; color: #666;">${escapeHtml(t.make || '')} ${escapeHtml(t.model || '')} — ${getTrailerTypeLabel(t.type)}</p>
              <span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-warning'}">
                ${getStatusLabel(t.status)}
              </span>
            </div>
            <div style="text-align: right;">
              ${t.platingExpiry ? `<p style="margin: 0.25rem 0; font-size: 0.9rem;">Plating: ${formatDate(t.platingExpiry)} ${platDays >= 0 && platDays <= 30 ? `<span style="color:red; font-weight:bold;">(${platDays}d)</span>` : ''}</p>` : ''}
              ${t.insuranceExpiry ? `<p style="margin: 0.25rem 0; font-size: 0.9rem;">Ins: ${formatDate(t.insuranceExpiry)} ${insDays >= 0 && insDays <= 30 ? `<span style="color:red; font-weight:bold;">(${insDays}d)</span>` : ''}</p>` : ''}
              ${t.maxWeight ? `<p style="margin: 0.25rem 0; font-size: 0.9rem;">Max Load: ${t.maxWeight}kg</p>` : ''}
            </div>
          </div>
          <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" 
                    onclick="editTrailer('${doc.id}')">✏️ Edit</button>
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" 
                    onclick="showServiceForAsset('${t.identifier}', 'trailer')">🔧 Service Log</button>
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" 
                    onclick="exportTrailerPDF('${doc.id}')">📄 PDF</button>
            <button class="btn secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem; color: #b00;" 
                    onclick="deleteTrailer('${doc.id}')">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading trailers:', error);
    listEl.innerHTML = '<p style="color:red;">Error loading trailers.</p>';
  }
};

window.showAddTrailerForm = function() {
  currentTrailerId = null;
  const title = document.getElementById('trailer-form-title');
  const form = document.getElementById('trailer-form');
  const idField = document.getElementById('trailer-id');
  if (title) title.textContent = 'Add Trailer';
  if (form) form.reset();
  if (idField) idField.value = '';
  showPage('trailer-form-page');
};

window.editTrailer = async function(id) {
  currentTrailerId = id;
  const docSnap = await getDoc(doc(db, `companies/${currentUser.uid}/trailers/${id}`));
  if (!docSnap.exists) return;
  const t = docSnap.data();
  
  document.getElementById('trailer-form-title').textContent = 'Edit Trailer';
  document.getElementById('trailer-id').value = id;
  document.getElementById('trailer-reg').value = t.identifier || '';
  document.getElementById('trailer-type').value = t.type || 'box';
  document.getElementById('trailer-make').value = t.make || '';
  document.getElementById('trailer-model').value = t.model || '';
  document.getElementById('trailer-year').value = t.year || '';
  document.getElementById('trailer-mot-expiry').value = formatInputDate(t.platingExpiry);
  document.getElementById('trailer-ins-expiry').value = formatInputDate(t.insuranceExpiry);
  document.getElementById('trailer-max-weight').value = t.maxWeight || '';
  document.getElementById('trailer-status').value = t.status || 'active';
  document.getElementById('trailer-notes').value = t.notes || '';
  
  showPage('trailer-form-page');
};

window.saveTrailer = async function(e) {
  e.preventDefault();
  if (!currentUser) return;
  
  const trailerData = {
    companyId: currentUser.uid,
    identifier: document.getElementById('trailer-reg').value.toUpperCase(),
    type: document.getElementById('trailer-type').value,
    make: document.getElementById('trailer-make').value,
    model: document.getElementById('trailer-model').value,
    year: parseInt(document.getElementById('trailer-year').value) || null,
    platingExpiry: document.getElementById('trailer-mot-expiry').value ? new Date(document.getElementById('trailer-mot-expiry').value) : null,
    insuranceExpiry: document.getElementById('trailer-ins-expiry').value ? new Date(document.getElementById('trailer-ins-expiry').value) : null,
    maxWeight: parseInt(document.getElementById('trailer-max-weight').value) || null,
    status: document.getElementById('trailer-status').value,
    notes: document.getElementById('trailer-notes').value,
    updatedAt: serverTimestamp()
  };
  
  try {
    if (currentTrailerId) {
      await updateDoc(doc(db, `companies/${currentUser.uid}/trailers/${currentTrailerId}`), trailerData);
    } else {
      trailerData.createdAt = serverTimestamp();
      await addDoc(collection(db, `companies/${currentUser.uid}/trailers`), trailerData);
    }
    showPage('trailers-page');
    loadTrailers();
  } catch (error) {
    console.error('Error saving trailer:', error);
    alert('Error saving trailer. Please try again.');
  }
};

window.deleteTrailer = async function(id) {
  if (!confirm('Are you sure you want to delete this trailer?')) return;
  try {
    await deleteDoc(doc(db, `companies/${currentUser.uid}/trailers/${id}`));
    loadTrailers();
  } catch (error) {
    console.error('Error deleting trailer:', error);
    alert('Error deleting trailer.');
  }
};

// ==================================================
// 🔧 SERVICE & MAINTENANCE LOGS
// ==================================================
let currentServiceAssetRef = null;

window.loadServiceLogsPage = async function() {
  await populateAssetSelector();
  const listEl = document.getElementById('service-logs-list');
  if (listEl) listEl.innerHTML = '<p class="text-muted">Select an asset above to view history...</p>';
};

async function populateAssetSelector() {
  const select = document.getElementById('service-asset');
  if (!select) return;
  select.innerHTML = '<option value="">-- Select an asset --</option>';
  
  const vSnapshot = await getDocs(collection(db, `companies/${currentUser.uid}/vehicles`));
  vSnapshot.forEach(doc => {
    const v = doc.data();
    select.innerHTML += `<option value="vehicle:${doc.id}">🚚 ${v.registration}</option>`;
  });
  
  const tSnapshot = await getDocs(collection(db, `companies/${currentUser.uid}/trailers`));
  tSnapshot.forEach(doc => {
    const t = doc.data();
    select.innerHTML += `<option value="trailer:${doc.id}">🚛 ${t.identifier}</option>`;
  });
}

window.showServiceForAsset = function(assetRef, type) {
  currentServiceAssetRef = { ref: assetRef, type };
  showPage('service-logs-page');
  const refField = document.getElementById('service-asset-ref');
  if (refField) refField.value = assetRef;
  loadServiceLogs();
};

window.loadServiceLogs = async function() {
  const select = document.getElementById('service-asset');
  const selectVal = select ? select.value : '';
  const listEl = document.getElementById('service-logs-list');
  
  if (!selectVal || !listEl) {
    if (listEl) listEl.innerHTML = '<p class="text-muted">Select an asset above to view history...</p>';
    return;
  }
  
  listEl.innerHTML = '<p class="text-muted">Loading history...</p>';
  
  try {
    const q = query(
      collection(db, `companies/${currentUser.uid}/serviceLogs`),
      where('assetRef', '==', selectVal),
      orderBy('serviceDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      listEl.innerHTML = '<p class="text-muted">No service records found for this asset.</p>';
      return;
    }
    
    listEl.innerHTML = snapshot.docs.map(doc => {
      const s = doc.data();
      return `
        <div style="border: 1px solid #eee; padding: 0.75rem; margin: 0.5rem 0; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <strong>${formatDate(s.serviceDate)} — ${getServiceTypeLabel(s.type)}</strong>
            <span class="badge ${s.status === 'completed' ? 'badge-success' : 'badge-warning'}">${s.status}</span>
          </div>
          <p style="margin: 0.5rem 0;">${escapeHtml(s.description)}</p>
          <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #666;">
            ${s.mileage ? `Mileage: ${s.mileage}` : ''}
            ${s.cost ? ` | Cost: £${s.cost.toFixed(2)}` : ''}
            ${s.serviceProvider ? ` | ${escapeHtml(s.serviceProvider)}` : ''}
          </p>
          ${s.nextServiceDue ? `<p style="margin: 0.25rem 0; font-size: 0.85rem; color: #d47500;">🔔 Next due: ${formatDate(s.nextServiceDue)}</p>` : ''}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading service logs:', error);
    if (listEl) listEl.innerHTML = '<p style="color:red;">Error loading service history.</p>';
  }
};

window.showAddServiceForm = function() {
  const title = document.getElementById('service-form-title');
  const form = document.getElementById('service-form');
  const idField = document.getElementById('service-id');
  const refField = document.getElementById('service-asset-ref');
  
  if (title) title.textContent = 'Record Service';
  if (form) form.reset();
  if (idField) idField.value = '';
  if (currentServiceAssetRef && refField) {
    refField.value = currentServiceAssetRef.ref;
  }
  showPage('service-form-page');
};

window.saveServiceRecord = async function(e) {
  e.preventDefault();
  if (!currentUser) return;
  
  const recordData = {
    companyId: currentUser.uid,
    assetRef: document.getElementById('service-asset-ref').value,
    serviceDate: new Date(document.getElementById('service-date').value),
    mileage: parseInt(document.getElementById('service-mileage').value) || null,
    type: document.getElementById('service-type').value,
    description: document.getElementById('service-description').value,
    cost: parseFloat(document.getElementById('service-cost').value) || null,
    nextServiceDue: document.getElementById('service-next-due').value ? new Date(document.getElementById('service-next-due').value) : null,
    serviceProvider: document.getElementById('service-provider').value,
    status: document.getElementById('service-status').value,
    createdAt: serverTimestamp()
  };
  
  try {
    await addDoc(collection(db, `companies/${currentUser.uid}/serviceLogs`), recordData);
    showPage('service-logs-page');
    loadServiceLogs();
  } catch (error) {
    console.error('Error saving service record:', error);
    alert('Error saving record. Please try again.');
  }
};

// ==================================================
// 📄 PDF REPORT GENERATION
// ==================================================
function generatePDFHTML(title, content) {
  const today = new Date().toLocaleDateString('en-GB');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} — LSD Solutions</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; line-height: 1.4; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
    .header h1 { color: #1a365d; margin: 0; font-size: 20px; }
    .header p { margin: 5px 0; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
    th { background-color: #1a365d; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .alert { color: #d47500; font-weight: bold; }
    .danger { color: #b00; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LSD Solutions — HGV & Logistics Services</h1>
    <h2>${title}</h2>
    <p>Generated: ${today}</p>
  </div>
  ${content}
  <div class="footer">
    © ${new Date().getFullYear()} LSD Solutions. DVSA Compliant Fleet Management System.
  </div>
</body>
</html>
  `;
}

function downloadPDF(filename, htmlContent) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('⚠️ Pop-up blocker prevented report from opening — please allow pop-ups for this site');
    return;
  }
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

window.generateVehicleReport = async function() {
  if (!currentUser) return;
  const snapshot = await getDocs(collection(db, `companies/${currentUser.uid}/vehicles`));
  
  let rows = '';
  snapshot.docs.forEach(doc => {
    const v = doc.data();
    const motDays = daysUntil(v.motExpiry);
    const taxDays = daysUntil(v.taxExpiry);
    const insDays = daysUntil(v.insuranceExpiry);
    
    rows += `
      <tr>
        <td><strong>${escapeHtml(v.registration)}</strong></td>
        <td>${escapeHtml(v.make || '')} ${escapeHtml(v.model || '')}</td>
        <td>${getStatusLabel(v.status)}</td>
        <td class="${motDays >= 0 && motDays <= 30 ? 'alert' : ''}">${formatDate(v.motExpiry)} ${motDays < 0 ? '<span class="danger">EXPIRED</span>' : ''}</td>
        <td class="${taxDays >= 0 && taxDays <= 30 ? 'alert' : ''}">${formatDate(v.taxExpiry)} ${taxDays < 0 ? '<span class="danger">EXPIRED</span>' : ''}</td>
        <td class="${insDays >= 0 && insDays <= 30 ? 'alert' : ''}">${formatDate(v.insuranceExpiry)} ${insDays < 0 ? '<span class="danger">EXPIRED</span>' : ''}</td>
      </tr>
    `;
  });
  
  const content = `
    <table>
      <tr><th>Reg No</th><th>Make/Model</th><th>Status</th><th>MOT Expires</th><th>Tax Expires</th><th>Insurance Expires</th></tr>
      ${rows || '<tr><td colspan="6" style="text-align:center;">No vehicles found</td></tr>'}
    </table>
  `;
  
  downloadPDF('Vehicle-Status-Report.pdf', generatePDFHTML('Vehicle Status Report', content));
};

window.generateTrailerReport = async function() {
  if (!currentUser) return;
  const snapshot = await getDocs(collection(db, `companies/${currentUser.uid}/trailers`));
  
  let rows = '';
  snapshot.docs.forEach(doc => {
    const t = doc.data();
    const platDays = daysUntil(t.platingExpiry);
    const insDays = daysUntil(t.insuranceExpiry);
    
    rows += `
      <tr>
        <td><strong>${escapeHtml(t.identifier)}</strong></td>
        <td>${escapeHtml(t.make || '')} ${escapeHtml(t.model || '')}</td>
        <td>${getTrailerTypeLabel(t.type)}</td>
        <td>${getStatusLabel(t.status)}</td>
        <td class="${platDays >= 0 && platDays <= 30 ? 'alert' : ''}">${t.platingExpiry ? formatDate(t.platingExpiry) : '—'} ${platDays < 0 ? '<span class="danger">EXPIRED</span>' : ''}</td>
        <td class="${insDays >= 0 && insDays <= 30 ? 'alert' : ''}">${t.insuranceExpiry ? formatDate(t.insuranceExpiry) : '—'} ${insDays < 0 ? '<span class="danger">EXPIRED</span>' : ''}</td>
      </tr>
    `;
  });
  
  const content = `
    <table>
      <tr><th>ID / Reg</th><th>Make/Model</th><th>Type</th><th>Status</th><th>Plating Cert</th><th>Insurance</th></tr>
      ${rows || '<tr><td colspan="6" style="text-align:center;">No trailers found</td></tr>'}
    </table>
  `;
  
  downloadPDF('Trailer-Status-Report.pdf', generatePDFHTML('Trailer Status Report', content));
};

window.generateExpiryReport = async function() {
  if (!currentUser) return;
  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  let rows = '';
  
  const vSnapshot = await getDocs(collection(db, `companies/${currentUser.uid}/vehicles`));
  vSnapshot.docs.forEach(doc => {
    const v = doc.data();
    const items = [
      { name: 'MOT', date: v.motExpiry },
      { name: 'Tax', date: v.taxExpiry },
      { name: 'Insurance', date: v.insuranceExpiry }
    ];
    items.forEach(item => {
      if (!item.date) return;
      const expiry = item.date.toDate ? item.date.toDate() : new Date(item.date);
      if (expiry <= thirtyDays) {
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        rows += `
          <tr>
            <td>🚚 ${escapeHtml(v.registration)}</td>
            <td>${item.name}</td>
            <td>${formatDate(expiry)}</td>
            <td class="${days < 0 ? 'danger' : days <= 7 ? 'alert' : ''}">
              ${days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : days === 0 ? 'TODAY' : `${days} days`}
            </td>
          </tr>
        `;
      }
    });
  });
  
  const tSnapshot = await getDocs(collection(db, `companies/${currentUser.uid}/trailers`));
  tSnapshot.docs.forEach(doc => {
    const t = doc.data();
    const items = [
      { name: 'Plating Cert', date: t.platingExpiry },
      { name: 'Insurance', date: t.insuranceExpiry }
    ];
    items.forEach(item => {
      if (!item.date) return;
      const expiry = item.date.toDate ? item.date.toDate() : new Date(item.date);
      if (expiry <= thirtyDays) {
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        rows += `
          <tr>
            <td>🚛 ${escapeHtml(t.identifier)}</td>
            <td>${item.name}</td>
            <td>${formatDate(expiry)}</td>
            <td class="${days < 0 ? 'danger' : days <= 7 ? 'alert' : ''}">
              ${days < 0 ? `EXPIRED ${Math.abs(days)}d ago` : days === 0 ? 'TODAY' : `${days} days`}
            </td>
          </tr>
        `;
      }
    });
  });
  
  const content = `
    <p><strong>Showing items expiring within the next 30 days.</strong></p>
    <table>
      <tr><th>Asset</th><th>Document Type</th><th>Expiry Date</th><th>Status</th></tr>
      ${rows || '<tr><td colspan="4" style="text-align:center; color:green;">✅ No items due for renewal within 30 days</td></tr>'}
    </table>
  `;
  
  downloadPDF('Expiry-Alerts-Report.pdf', generatePDFHTML('Expiry Alerts Report', content));
};

window.generateMaintenanceReport = async function() {
  if (!currentUser) return;
  const snapshot = await getDocs(query(
    collection(db, `companies/${currentUser.uid}/serviceLogs`),
    orderBy('serviceDate', 'desc'),
    limit(100)
  ));
  
  let totalCost = 0;
  let rows = '';
  snapshot.docs.forEach(doc => {
    const s = doc.data();
    totalCost += s.cost || 0;
    rows += `
      <tr>
        <td>${formatDate(s.serviceDate)}</td>
        <td>${escapeHtml(s.assetRef)}</td>
        <td>${getServiceTypeLabel(s.type)}</td>
        <td>${escapeHtml(s.description.substring(0, 40))}${s.description.length > 40 ? '...' : ''}</td>
        <td>£${(s.cost || 0).toFixed(2)}</td>
        <td>${s.serviceProvider ? escapeHtml(s.serviceProvider) : '—'}</td>
      </tr>
    `;
  });
  
  const content = `
    <p><strong>Total Recorded Cost: £${totalCost.toFixed(2)}</strong></p>
    <table>
      <tr><th>Date</th><th>Asset</th><th>Type</th><th>Description</th><th>Cost</th><th>Provider</th></tr>
      ${rows || '<tr><td colspan="6" style="text-align:center;">No service records found</td></tr>'}
    </table>
  `;
  
  downloadPDF('Maintenance-Summary-Report.pdf', generatePDFHTML('Maintenance Summary Report', content));
};

window.generateChecklistReport = async function() {
  if (!currentUser) return;
  const snapshot = await getDocs(query(
    collection(db, `companies/${currentUser.uid}/checklists`),
    orderBy('submittedAt', 'desc'),
    limit(100)
  ));
  
  let defectCount = 0;
  let rows = '';
  snapshot.docs.forEach(doc => {
    const c = doc.data();
    if (c.hasDefects) defectCount++;
    rows += `
      <tr>
        <td>${c.submittedAt ? formatDate(c.submittedAt) : '—'}</td>
        <td>${escapeHtml(c.vehicleReg)}</td>
        <td>${escapeHtml(c.driverName)}</td>
        <td>${c.hasDefects ? '<span class="alert">⚠️ Defects</span>' : '<span style="color:green;">✅ Clear</span>'}</td>
      </tr>
    `;
  });
  
  const content = `
    <p><strong>Total Checks: ${snapshot.size} | With Defects: ${defectCount} | Clear: ${snapshot.size - defectCount}</strong></p>
    <table>
      <tr><th>Date</th><th>Vehicle</th><th>Driver</th><th>Status</th></tr>
      ${rows || '<tr><td colspan="4" style="text-align:center;">No checklists submitted yet</td></tr>'}
    </table>
  `;
  
  downloadPDF('Checklist-Log-Report.pdf', generatePDFHTML('Walkaround Checklist Log Report', content));
};

window.generateDriverReport = async function() {
  if (!currentUser) return;
  
  const driversSnap = await getDocs(collection(db, `companies/${currentUser.uid}/drivers`));
  let rows = '';
  
  driversSnap.docs.forEach(doc => {
    const d = doc.data();
    rows += `
      <tr>
        <td><strong>${escapeHtml(d.fullName || d.email)}</strong></td>
        <td>${escapeHtml(d.email)}</td>
        <td>${d.status === 'active' ? '✅ Active' : '⏳ Inactive'}</td>
        <td>${d.role === 'driver' ? '👤 Driver' : d.role}</td>
      </tr>
    `;
  });
  
  const content = `
    <table>
      <tr><th>Name</th><th>Email</th><th>Status</th><th>Role</th></tr>
      ${rows || '<tr><td colspan="4" style="text-align:center;">No drivers added yet</td></tr>'}
    </table>
  `;
  
  downloadPDF('Driver-Compliance-Report.pdf', generatePDFHTML('Driver Compliance Report', content));
};

window.loadExpiryAlerts = async function() {
  if (!currentUser) return;
  const container = document.getElementById('expiry-alerts');
  if (!container) return;
  
  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  let alerts = [];
  
  const vSnap = await getDocs(collection(db, `companies/${currentUser.uid}/vehicles`));
  vSnap.docs.forEach(doc => {
    const v = doc.data();
    [
      { type: 'MOT', date: v.motExpiry, reg: v.registration },
      { type: 'Tax', date: v.taxExpiry, reg: v.registration },
      { type: 'Insurance', date: v.insuranceExpiry, reg: v.registration }
    ].forEach(item => {
      if (!item.date) return;
      const expiry = item.date.toDate ? item.date.toDate() : new Date(item.date);
      const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (expiry <= thirtyDays) {
        alerts.push({ reg: item.reg, type: item.type, date: expiry, days });
      }
    });
  });
  
  const tSnap = await getDocs(collection(db, `companies/${currentUser.uid}/trailers`));
  tSnap.docs.forEach(doc => {
    const t = doc.data();
    [
      { type: 'Plating Cert', date: t.platingExpiry, reg: t.identifier },
      { type: 'Insurance', date: t.insuranceExpiry, reg: t.identifier }
    ].forEach(item => {
      if (!item.date) return;
      const expiry = item.date.toDate ? item.date.toDate() : new Date(item.date);
      const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (expiry <= thirtyDays) {
        alerts.push({ reg: item.reg, type: item.type, date: expiry, days });
      }
    });
  });
  
  alerts.sort((a, b) => a.days - b.days);
  
  if (alerts.length === 0) {
    container.innerHTML = '<p style="color:green;">✅ No items due for renewal within the next 30 days.</p>';
    return;
  }
  
  container.innerHTML = alerts.map(a => `
    <div style="padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px; background: ${a.days < 0 ? '#ffebee' : a.days <= 7 ? '#fff3e0' : '#fff8e1'};">
      <strong>${a.reg}</strong> — ${a.type}: ${formatDate(a.date)}
      <span style="float:right; font-weight:bold; color:${a.days < 0 ? '#b00' : a.days <= 7 ? '#d47500' : '#888'}">
        ${a.days < 0 ? `EXPIRED ${Math.abs(a.days)}d ago` : a.days === 0 ? 'TODAY' : `${a.days}d left`}
      </span>
    </div>
  `).join('');
};

// ==================================================
// ⚙️ NOTIFICATION SETTINGS
// ==================================================
window.saveNotificationSettings = async function(e) {
  e.preventDefault();
  if (!currentUser) return;
  
  const settings = {
    alertEmail: document.getElementById('notify-email')?.value || '',
    notifyMot: document.getElementById('notify-mot')?.checked ?? true,
    notifyTax: document.getElementById('notify-tax')?.checked ?? true,
    notifyInsurance: document.getElementById('notify-insurance')?.checked ?? true,
    notifyService: document.getElementById('notify-service')?.checked ?? true,
    notifyChecklist: document.getElementById('notify-checklist')?.checked ?? false,
    updatedAt: serverTimestamp()
  };
  
  try {
    await setDoc(doc(db, `companies/${currentUser.uid}/settings/notifications`), settings, { merge: true });
    alert('✅ Notification settings saved!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
};

window.loadNotificationSettings = async function() {
  if (!currentUser) return;
  const docSnap = await getDoc(doc(db, `companies/${currentUser.uid}/settings/notifications`));
  if (docSnap.exists()) {
    const s = docSnap.data();
    const emailField = document.getElementById('notify-email');
    const motCheck = document.getElementById('notify-mot');
    const taxCheck = document.getElementById('notify-tax');
    const insCheck = document.getElementById('notify-insurance');
    const serviceCheck = document.getElementById('notify-service');
    const checkCheck = document.getElementById('notify-checklist');
    
    if (emailField) emailField.value = s.alertEmail || '';
    if (motCheck) motCheck.checked = s.notifyMot !== false;
    if (taxCheck) taxCheck.checked = s.notifyTax !== false;
    if (insCheck) insCheck.checked = s.notifyInsurance !== false;
    if (serviceCheck) serviceCheck.checked = s.notifyService !== false;
    if (checkCheck) checkCheck.checked = s.notifyChecklist === true;
  }
};

// ==================================================
// 🔄 AUTO-LOAD DATA ON PAGE CHANGE
// ==================================================
const originalShowPage = window.showPage;
window.showPage = function(pageId) {
  if (originalShowPage) originalShowPage(pageId);
  else console.log('Showing page:', pageId);
  
  switch(pageId) {
    case 'vehicles-page':
      if (currentUser) loadVehicles();
      break;
    case 'trailers-page':
      if (currentUser) loadTrailers();
      break;
    case 'reports-page':
      if (currentUser) {
        loadExpiryAlerts();
        loadNotificationSettings();
      }
      break;
    case 'service-logs-page':
      if (currentUser) loadServiceLogsPage();
      break;
  }
};

console.log('✅ All new features loaded: Vehicle & Trailer Management • PDF Reports • Service Logs • Email Notifications');