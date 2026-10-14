// ==================================================
// 🚛 LSD SOLUTIONS — FINAL CLEAN VERSION
// No Duplicates | Build-Ready | Vite Compatible
// ==================================================
'use strict';

// ==================================================
// 📦 1. FIREBASE IMPORTS & INITIALISATION
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
  serverTimestamp
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
  messagingSenderId: "494734371769",
  appId: "1:494734371769:web:3b8c0f4d5e7f9a2b3c4d5e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==================================================
// 🛠️ 2. UTILITIES LIBRARY
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
        console.error(`[Storage Get Error] ${key}:`, e);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error(`[Storage Set Error] ${key}:`, e);
        return false;
      }
    },
    remove(key) { localStorage.removeItem(key); }
  },
  Format: {
    date(dateObj) {
      if (!dateObj) return '';
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    },
    dateInput(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    },
    currency(amount) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency', currency: 'GBP'
      }).format(amount || 0);
    }
  },
  Validate: {
    email(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''); },
    password(pw) { return (pw || '').length >= 6; }
  }
};

// ==================================================
// 🔐 3. AUTHENTICATION FUNCTIONS
// ==================================================
window.signIn = async function() {
  const email = document.getElementById('signin-email')?.value?.trim();
  const password = document.getElementById('signin-password')?.value;

  if (!Utils.Validate.email(email)) return alert('Please enter a valid email');
  if (!password) return alert('Please enter your password');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signing in...');
  } catch (err) {
    alert('Sign in failed: ' + err.message);
  }
};

window.register = async function() {
  const name = document.getElementById('register-name')?.value?.trim();
  const email = document.getElementById('register-email')?.value?.trim();
  const password = document.getElementById('register-password')?.value;
  const confirm = document.getElementById('register-confirm')?.value;
  const role = document.querySelector('input[name="user-role"]:checked')?.value;

  if (!name || !email || !password || !confirm || !role) return alert('Fill in all fields');
  if (!Utils.Validate.email(email)) return alert('Invalid email');
  if (password !== confirm) return alert('Passwords do not match');
  if (!Utils.Validate.password(password)) return alert('Password must be 6+ characters');

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await setDoc(doc(db, 'users', user.uid), {
      name, email, role, createdAt: serverTimestamp()
    });

    if (role === 'company') {
      await setDoc(doc(db, 'companies', user.uid), {
        name, email, createdAt: serverTimestamp()
      });
    } else {
      await setDoc(doc(db, 'drivers', user.uid), {
        name, email, status: 'available', points: 0, createdAt: serverTimestamp()
      });
    }

    await sendEmailVerification(user);
    alert('✅ Account created! Check your email to verify.');
  } catch (err) {
    alert('Registration failed: ' + err.message);
  }
};

window.signOutUser = async function() {
  await signOut(auth);
  Utils.Storage.remove('userRole');
};

window.resetPassword = async function() {
  const email = document.getElementById('signin-email')?.value?.trim();
  if (!Utils.Validate.email(email)) return alert('Enter your email first');
  try {
    await sendPasswordResetEmail(auth, email);
    alert('✅ Password reset email sent!');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
};

// ==================================================
// 🧭 4. PAGE NAVIGATION
// ==================================================
window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const target = document.getElementById(pageId);
  if (!target) return console.error('❌ Page not found:', pageId);
  
  target.style.display = 'block';
  console.log('✅ Showing:', pageId);
  
  switch(pageId) {
    case 'company-portal': loadCompanyDashboard(); break;
    case 'company-work': loadPostedWork(); break;
    case 'company-drivers': loadEmployedDrivers(); break;
    case 'company-jobs': loadCompanyJobs(); break;
    case 'checklist-editor': loadExistingChecklist(); break;
    case 'driver-portal': loadDriverDashboard(); break;
    case 'driver-profile': loadDriverProfile(); break;
    case 'driver-work': loadDriverWork(); break;
    case 'driver-documents': loadDriverDocuments(); break;
    case 'driver-calendar': loadDriverCalendar(); break;
  }
};

window.showAuthPage = function(view) {
  document.getElementById('auth-page').style.display = 'block';
  document.getElementById('signin-form').style.display = view === 'signin' ? 'block' : 'none';
  document.getElementById('register-form').style.display = view === 'register' ? 'block' : 'none';
};

// ==================================================
// 🚛 5. DRIVER PORTAL — ALL FUNCTIONS
// ==================================================
async function loadDriverDashboard() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('driver-dashboard-content');
  if (!container) return;

  container.innerHTML = '<p>Loading...</p>';
  try {
    const snap = await getDoc(doc(db, 'drivers', user.uid));
    if (!snap.exists()) return;
    const p = snap.data();
    container.innerHTML = `
      <h3>Welcome back, ${escapeHtml(p.name || 'Driver')} 👋</h3>
      <div class="stats-grid">
        <div class="stat-card"><h4>Status</h4><p class="stat-value">${escapeHtml(p.status || 'Available')}</p></div>
        <div class="stat-card"><h4>Points</h4><p class="stat-value">${p.points || 0}</p></div>
      </div>
      <div class="portal-buttons">
        <button class="btn btn-primary" onclick="showPage('driver-profile')">My Profile</button>
        <button class="btn btn-primary" onclick="showPage('driver-work')">Available Work</button>
        <button class="btn btn-primary" onclick="showPage('driver-calendar')">Calendar</button>
        <button class="btn btn-primary" onclick="showPage('driver-documents')">My Documents</button>
        <button class="btn btn-secondary" onclick="signOutUser()">Sign Out</button>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p class="error">Could not load dashboard</p>';
  }
}

async function loadDriverProfile() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('driver-profile-content');
  if (!container) return;

  try {
    const snap = await getDoc(doc(db, 'drivers', user.uid));
    if (!snap.exists()) return;
    const p = snap.data();
    container.innerHTML = `
      <h3>My Profile</h3>
      <div class="form-stack">
        <div class="form-group"><label>Full Name</label><input type="text" id="d-name" value="${escapeHtml(p.name || '')}"></div>
        <div class="form-group"><label>Email</label><input type="email" value="${escapeHtml(p.email || '')}" readonly></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="d-phone" value="${escapeHtml(p.phone || '')}"></div>
        <div class="form-group"><label>Licence No.</label><input type="text" id="d-lic" value="${escapeHtml(p.licenceNumber || '')}"></div>
        <div class="form-group"><label>Licence Expiry</label><input type="date" id="d-exp" value="${Utils.Format.dateInput(p.expiryDate)}"></div>
        <div class="form-group"><label>Medical Expiry</label><input type="date" id="d-med" value="${Utils.Format.dateInput(p.medicalExpiry)}"></div>
        <div class="form-group"><label>Points</label><input type="number" id="d-pts" value="${p.points || 0}"></div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="saveDriverProfile()">Save</button>
          <button class="btn btn-secondary" onclick="showPage('driver-portal')">Back</button>
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = '<p class="error">Could not load profile</p>';
  }
}

window.saveDriverProfile = async function() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await updateDoc(doc(db, 'drivers', user.uid), {
      name: document.getElementById('d-name').value.trim(),
      phone: document.getElementById('d-phone').value.trim(),
      licenceNumber: document.getElementById('d-lic').value.trim(),
      expiryDate: document.getElementById('d-exp').value || null,
      medicalExpiry: document.getElementById('d-med').value || null,
      points: parseInt(document.getElementById('d-pts').value) || 0,
      updatedAt: serverTimestamp()
    });
    alert('✅ Saved!');
    showPage('driver-portal');
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
};

async function loadDriverWork() {
  const container = document.getElementById('driver-work-content');
  if (!container) return;
  container.innerHTML = '<p>Loading jobs...</p>';
  
  try {
    const snap = await getDocs(query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('createdAt', 'desc')));
    if (snap.empty) {
      container.innerHTML = `<h3>Available Work</h3><p class="muted">No jobs right now.</p><button class="btn btn-secondary" onclick="showPage('driver-portal')">Back</button>`;
      return;
    }
    let html = '<h3>Available Work</h3><div class="job-list">';
    snap.forEach(d => {
      const j = d.data();
      html += `
        <div class="card job-card">
          <h4>${escapeHtml(j.title || 'Job')}</h4>
          <p><strong>From:</strong> ${escapeHtml(j.fromLocation || '—')}</p>
          <p><strong>To:</strong> ${escapeHtml(j.toLocation || '—')}</p>
          <p><strong>Date:</strong> ${j.date ? Utils.Format.date(j.date) : '—'}</p>
          <p><strong>Rate:</strong> ${Utils.Format.currency(j.rate)}</p>
          <button class="btn btn-primary" onclick="applyForJob('${d.id}')">Apply</button>
        </div>
      `;
    });
    html += '</div><br><button class="btn btn-secondary" onclick="showPage(\'driver-portal\')">Back</button>';
    container.innerHTML = html;
  } catch {
    container.innerHTML = '<p class="error">Could not load jobs</p>';
  }
}

window.applyForJob = async function(jobId) {
  const user = auth.currentUser;
  if (!user || !confirm('Apply for this job?')) return;
  try {
    const name = (await getDoc(doc(db, 'drivers', user.uid))).data()?.name || 'Driver';
    await addDoc(collection(db, 'applications'), {
      jobId, driverId: user.uid, driverName: name, status: 'pending', appliedAt: serverTimestamp()
    });
    alert('✅ Applied!');
    loadDriverWork();
  } catch (err) {
    alert('Failed: ' + err.message);
  }
};

async function loadDriverCalendar() {
  const container = document.getElementById('driver-calendar-content');
  if (!container) return;
  container.innerHTML = `<h3>My Schedule</h3><p class="muted">No upcoming jobs yet.</p><br><button class="btn btn-secondary" onclick="showPage('driver-portal')">Back</button>`;
}

async function loadDriverDocuments() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('driver-documents-content');
  if (!container) return;
  container.innerHTML = `
    <h3>My Documents</h3>
    <div class="upload-section">
      <h4>Upload</h4>
      <input type="file" id="doc-file" class="form-control">
      <input type="text" id="doc-name" placeholder="Document name" class="form-control mt-sm">
      <button class="btn btn-primary mt-sm" onclick="uploadDriverDocument()">Upload</button>
    </div>
    <br><button class="btn btn-secondary" onclick="showPage('driver-portal')">Back</button>
  `;
}

window.uploadDriverDocument = async function() {
  const user = auth.currentUser;
  const file = document.getElementById('doc-file')?.files?.[0];
  const name = document.getElementById('doc-name')?.value?.trim();
  if (!file || !name) return alert('Select file and enter name');
  
  try {
    const refPath = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(refPath, file);
    const url = await getDownloadURL(refPath);
    await addDoc(collection(db, 'documents'), {
      name, url, ownerId: user.uid, uploadedAt: serverTimestamp()
    });
    alert('✅ Uploaded!');
    loadDriverDocuments();
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
};

// ==================================================
// 🏢 6. COMPANY PORTAL — ALL FUNCTIONS
// ==================================================
async function loadCompanyDashboard() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('company-dashboard-content');
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const snap = await getDoc(doc(db, 'companies', user.uid));
    if (!snap.exists()) return;
    const c = snap.data();
    
    const [jobsSnap, driversSnap] = await Promise.all([
      getDocs(query(collection(db, 'jobs'), where('companyId', '==', user.uid))),
      getDocs(query(collection(db, 'drivers'), where('companyId', '==', user.uid)))
    ]);
    const openJobs = jobsSnap.docs.filter(d => d.data().status === 'open').length;
    
    container.innerHTML = `
      <h3>Welcome, ${escapeHtml(c.name || 'Company')} 👋</h3>
      <div class="stats-grid">
        <div class="stat-card"><h4>Drivers</h4><p class="stat-value">${driversSnap.size}</p></div>
        <div class="stat-card"><h4>Open Jobs</h4><p class="stat-value">${openJobs}</p></div>
        <div class="stat-card"><h4>Total Jobs</h4><p class="stat-value">${jobsSnap.size}</p></div>
      </div>
      <div class="portal-buttons">
        <button class="btn btn-primary" onclick="showPage('company-work')">Posted Work</button>
        <button class="btn btn-primary" onclick="showPage('company-drivers')">Employed Drivers</button>
        <button class="btn btn-primary" onclick="showPage('company-jobs')">Post New Job</button>
        <button class="btn btn-primary" onclick="showPage('checklist-editor')">Checklist Editor</button>
        <button class="btn btn-secondary" onclick="signOutUser()">Sign Out</button>
      </div>
    `;
  } catch {
    container.innerHTML = '<p class="error">Could not load dashboard</p>';
  }
}

async function loadPostedWork() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('company-work-content');
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const snap = await getDocs(query(collection(db, 'jobs'), where('companyId', '==', user.uid), orderBy('createdAt', 'desc')));
    if (snap.empty) {
      container.innerHTML = `<h3>Posted Work</h3><p class="muted">No jobs yet.</p><button class="btn btn-primary" onclick="showPage('company-jobs')">Post First Job</button><button class="btn btn-secondary" onclick="showPage('company-portal')">Back</button>`;
      return;
    }
    let html = '<h3>Posted Work</h3><div class="job-list">';
    snap.forEach(d => {
      const j = d.data();
      const badge = j.status === 'open' 
        ? '<span class="badge badge-success">Open</span>' 
        : '<span class="badge badge-muted">Closed</span>';
      html += `
        <div class="card job-card">
          <div style="display:flex;justify-content:space-between;">
            <h4>${escapeHtml(j.title || 'Job')}</h4>${badge}
          </div>
          <p><strong>From:</strong> ${escapeHtml(j.fromLocation || '—')}</p>
          <p><strong>To:</strong> ${escapeHtml(j.toLocation || '—')}</p>
          <p><strong>Rate:</strong> ${Utils.Format.currency(j.rate)}</p>
          <button class="btn btn-sm btn-danger" onclick="deleteJob('${d.id}')">Delete</button>
        </div>
      `;
    });
    html += '</div><br><button class="btn btn-primary" onclick="showPage(\'company-jobs\')">Post New Job</button> <button class="btn btn-secondary" onclick="showPage(\'company-portal\')">Back</button>';
    container.innerHTML = html;
  } catch {
    container.innerHTML = '<p class="error">Could not load jobs</p>';
  }
}

window.deleteJob = async function(jobId) {
  if (!confirm('Delete this job?')) return;
  await deleteDoc(doc(db, 'jobs', jobId));
  loadPostedWork();
};

async function loadEmployedDrivers() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('company-drivers-content');
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const snap = await getDocs(query(collection(db, 'drivers'), where('companyId', '==', user.uid), orderBy('name')));
    if (snap.empty) {
      container.innerHTML = `<h3>Employed Drivers</h3><p class="muted">No drivers linked yet.</p><button class="btn btn-secondary" onclick="showPage('company-portal')">Back</button>`;
      return;
    }
    let html = '<h3>Employed Drivers</h3><div class="driver-list">';
    snap.forEach(d => {
      const drv = d.data();
      html += `
        <div class="card">
          <h4>${escapeHtml(drv.name || 'Driver')}</h4>
          <p>📧 ${escapeHtml(drv.email || '—')}</p>
          <p>🚛 Licence: ${escapeHtml(drv.licenceNumber || 'Not provided')}</p>
          <p>⚠️ Points: ${drv.points || 0}</p>
        </div>
      `;
    });
    html += '</div><br><button class="btn btn-secondary" onclick="showPage(\'company-portal\')">Back</button>';
    container.innerHTML = html;
  } catch {
    container.innerHTML = '<p class="error">Could not load drivers</p>';
  }
}

async function loadCompanyJobs() {
  const container = document.getElementById('company-jobs-content');
  if (!container) return;
  container.innerHTML = `
    <h3>Post New Job</h3>
    <div class="form-stack">
      <div class="form-group"><label>Title *</label><input type="text" id="j-title" placeholder="e.g. Poole → London"></div>
      <div class="form-row">
        <div class="form-group"><label>From *</label><input type="text" id="j-from"></div>
        <div class="form-group"><label>To *</label><input type="text" id="j-to"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Date *</label><input type="date" id="j-date"></div>
        <div class="form-group"><label>Rate (£) *</label><input type="number" id="j-rate" step="0.01"></div>
      </div>
      <div class="form-group"><label>Details</label><textarea id="j-desc" rows="3"></textarea></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="submitNewJob()">Post Job</button>
        <button class="btn btn-secondary" onclick="showPage('company-portal')">Cancel</button>
      </div>
    </div>
  `;
}

window.submitNewJob = async function() {
  const user = auth.currentUser;
  if (!user) return;
  const title = document.getElementById('j-title').value.trim();
  const from = document.getElementById('j-from').value.trim();
  const to = document.getElementById('j-to').value.trim();
  const date = document.getElementById('j-date').value;
  const rate = parseFloat(document.getElementById('j-rate').value);
  const desc = document.getElementById('j-desc').value.trim();
  
  if (!title || !from || !to || !date || isNaN(rate)) return alert('Fill all required fields');
  
  try {
    const cname = (await getDoc(doc(db, 'companies', user.uid))).data()?.name || 'Your Company';
    await addDoc(collection(db, 'jobs'), {
      title, fromLocation: from, toLocation: to, date: new Date(date), rate, cargo: desc,
      companyId: user.uid, companyName: cname, status: 'open', createdAt: serverTimestamp()
    });
    alert('✅ Job posted!');
    showPage('company-work');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
};

// ==================================================
// ✅ 7. CHECKLIST EDITOR — NO DUPLICATES
// ==================================================
const DEFAULT_CHECKLIST = {
  items: [
    { category: '🚗 Exterior', itemName: 'Bodywork — condition & damage' },
    { category: '🚗 Exterior', itemName: 'Mirrors — secure & clean' },
    { category: '🚗 Lights', itemName: 'All lights working & lenses intact' },
    { category: '🛞 Wheels & Tyres', itemName: 'Tread depth ≥1.6mm, pressures correct' },
    { category: '🛞 Wheels & Tyres', itemName: 'Wheel nuts secure & marked' },
    { category: '⛟ Brakes', itemName: 'No air leaks or fluid leaks' },
    { category: '🔧 Engine', itemName: 'Oil, coolant, screen wash levels correct' },
    { category: '🔥 Safety', itemName: 'Fire extinguisher present & in date' },
    { category: '🔥 Safety', itemName: 'Warning triangle & first aid kit present' },
    { category: '📝 Documents', itemName: 'All relevant docs present & in date' }
  ]
};

let currentChecklistItems = [];

async function initialiseCompanyChecklist(companyId) {
  const ref = doc(db, 'companies', companyId, 'settings', 'checklist');
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { items: DEFAULT_CHECKLIST.items, createdAt: serverTimestamp() });
      currentChecklistItems = [...DEFAULT_CHECKLIST.items];
      console.log('✅ Default checklist installed');
    } else {
      currentChecklistItems = snap.data().items || [];
    }
  } catch (e) { console.log('Checklist init:', e); }
}

async function loadExistingChecklist() {
  const user = auth.currentUser;
  if (!user) return;
  const container = document.getElementById('checklist-items');
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';
  
  try {
    const snap = await getDoc(doc(db, 'companies', user.uid, 'settings', 'checklist'));
    currentChecklistItems = snap.exists() ? snap.data().items || [] : [...DEFAULT_CHECKLIST.items];
    renderChecklistUI();
  } catch {
    currentChecklistItems = [...DEFAULT_CHECKLIST.items];
    renderChecklistUI();
  }
}

function renderChecklistUI() {
  const container = document.getElementById('checklist-items');
  if (!container) return;
  container.innerHTML = currentChecklistItems.length === 0 
    ? '<p class="muted">No items yet. Add below.</p>'
    : currentChecklistItems.map((item, i) => `
        <div style="padding:0.5rem 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
          <strong>${escapeHtml(item.category)}</strong> — ${escapeHtml(item.itemName)}
          <button class="btn-small btn-danger" onclick="removeChecklistItem(${i})">Remove</button>
        </div>
      `).join('');
}

window.addChecklistItem = function() {
  const cat = document.getElementById('new-checklist-category')?.value?.trim();
  const name = document.getElementById('new-checklist-item')?.value?.trim();
  if (!cat || !name) return alert('Fill both fields');
  currentChecklistItems.push({ category: cat, itemName: name });
  document.getElementById('new-checklist-category').value = '';
  document.getElementById('new-checklist-item').value = '';
  renderChecklistUI();
};

window.removeChecklistItem = function(idx) {
  currentChecklistItems.splice(idx, 1);
  renderChecklistUI();
};

window.saveChecklist = async function() {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'companies', user.uid, 'settings', 'checklist'), {
    items: currentChecklistItems, updatedAt: serverTimestamp()
  });
  alert('✅ Checklist saved!');
};

// ==================================================
// 🔄 8. AUTH STATE WATCHER — FINAL
// ==================================================
onAuthStateChanged(auth, async (user) => {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  
  if (!user) {
    document.getElementById('auth-page').style.display = 'block';
    showAuthPage('signin');
    return;
  }
  
  try {
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) {
      document.getElementById('auth-page').style.display = 'block';
      return;
    }
    
    const role = userSnap.data().role;
    Utils.Storage.set('userRole', role);
    
    if (role === 'driver') {
      showPage('driver-portal');
    } else if (role === 'company') {
      await initialiseCompanyChecklist(user.uid);
      showPage('company-portal');
    }
  } catch {
    document.getElementById('auth-page').style.display = 'block';
  }
});

console.log('✅ LSD Solutions — Build Ready, No Duplicates!');
