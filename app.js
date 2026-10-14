// ==================================================
// 🚛 LSD SOLUTIONS — COMPLETE PRODUCTION app.js
// Firebase v10.7.1 • DVSA Compliant • Full Version
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
  messagingSenderId: "492027460969",
  appId: "1:492027460969:web:7a2b3c4d5e6f7g8h9i0j1k"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Make globally available
window.auth = auth;
window.db = db;
window.storage = storage;

// ==================================================
// 🔹 DVSA DEFAULT WALKAROUND CHECKLIST
// ==================================================
const DEFAULT_CHECKLIST = [
  { category: 'Vehicle Exterior', item: 'Lights & indicators — working', pass: true },
  { category: 'Vehicle Exterior', item: 'Tyres — condition & pressure', pass: true },
  { category: 'Vehicle Exterior', item: 'Wheels & wheel nuts', pass: true },
  { category: 'Vehicle Exterior', item: 'Brakes — visible checks', pass: true },
  { category: 'Vehicle Exterior', item: 'Mirrors — condition & security', pass: true },
  { category: 'Vehicle Exterior', item: 'Windscreen & wipers', pass: true },
  { category: 'Vehicle Exterior', item: 'Number plates — legible', pass: true },
  { category: 'Vehicle Interior', item: 'Seat belts — condition & fastening', pass: true },
  { category: 'Vehicle Interior', item: 'Horn — working', pass: true },
  { category: 'Vehicle Interior', item: 'All controls — operational', pass: true },
  { category: 'Trailer (if used)', item: 'Coupling — secure & locked', pass: true },
  { category: 'Trailer (if used)', item: 'Air lines / electrical connections', pass: true },
  { category: 'Trailer (if used)', item: 'Trailer wheels & tyres', pass: true },
  { category: 'Safety & Documents', item: 'V5C / Operator\'s licence in-vehicle', pass: true },
  { category: 'Safety & Documents', item: 'Insurance — in-date & appropriate', pass: true },
  { category: 'Safety & Documents', item: 'First aid kit — present & complete', pass: true },
  { category: 'Safety & Documents', item: 'Fire extinguisher — present & valid', pass: true },
  { category: 'Load Security', item: 'Load — secured appropriately', pass: true },
  { category: 'Load Security', item: 'Doors / tailgate — secure', pass: true }
];
window.DEFAULT_CHECKLIST = DEFAULT_CHECKLIST;

// ==================================================
// 🔹 UTILITIES LIBRARY
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
window.escapeHtml = escapeHtml;

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
    remove(key) {
      localStorage.removeItem(key);
    }
  },

  Date: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
    format(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    isValidDateInput(value) {
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }
  },

  Format: {
    currency(value) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(value || 0);
    }
  },

  Validation: {
    email(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    password(password) {
      return password && password.length >= 6;
    }
  },

  async showToast(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      padding: 14px 24px; border-radius: 6px; color: white; font-weight: 500;
      background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#1a365d'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};
window.Utils = Utils;

// ==================================================
// 🔹 NAVIGATION — SHOW/HIDE PAGES
// ==================================================
window.showPage = function(pageId) {
  // Hide ALL pages first
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });

  // Show only the requested page
  const target = document.getElementById(pageId);
  if (target) {
    target.style.display = 'block';
    window.scrollTo(0, 0);
  } else {
    console.warn(`Page not found: ${pageId}`);
  }
};

// ==================================================
// 🔹 AUTHENTICATION — SIGN IN
// ==================================================
window.signIn = async function() {
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;

  if (!Utils.Validation.email(email)) {
    Utils.showToast('Please enter a valid email address', 'error');
    return;
  }
  if (!password) {
    Utils.showToast('Please enter your password', 'error');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    Utils.showToast('Welcome back! Signing in...', 'success');
  } catch (error) {
    console.error('Sign in error:', error);
    let msg = 'Failed to sign in. Please check your details.';
    if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
    if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
    if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try later.';
    Utils.showToast(msg, 'error');
  }
};

// ==================================================
// 🔹 REGISTER — DRIVER
// ==================================================
window.registerDriver = async function() {
  const name = document.getElementById('driver-name').value.trim();
  const email = document.getElementById('driver-email').value.trim();
  const password = document.getElementById('driver-password').value;
  const confirm = document.getElementById('driver-confirm').value;

  if (!name || !email || !password) {
    Utils.showToast('Please fill in all fields', 'error');
    return;
  }
  if (!Utils.Validation.email(email)) {
    Utils.showToast('Please enter a valid email address', 'error');
    return;
  }
  if (password !== confirm) {
    Utils.showToast('Passwords do not match', 'error');
    return;
  }
  if (!Utils.Validation.password(password)) {
    Utils.showToast('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      role: 'driver',
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'drivers', uid), {
      uid,
      name,
      email,
      role: 'driver',
      companyId: null,
      profileComplete: false,
      createdAt: serverTimestamp()
    });

    Utils.showToast('✅ Account created! Welcome to LSD Solutions.', 'success');
    document.getElementById('driver-register-form').reset();
  } catch (error) {
    console.error('Driver reg error:', error);
    let msg = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
    Utils.showToast(msg, 'error');
  }
};

// ==================================================
// 🔹 REGISTER — COMPANY
// ==================================================
window.registerCompany = async function() {
  const companyName = document.getElementById('company-name').value.trim();
  const contactName = document.getElementById('company-contact').value.trim();
  const email = document.getElementById('company-email').value.trim();
  const password = document.getElementById('company-password').value;
  const confirm = document.getElementById('company-confirm').value;

  if (!companyName || !contactName || !email || !password) {
    Utils.showToast('Please fill in all fields', 'error');
    return;
  }
  if (!Utils.Validation.email(email)) {
    Utils.showToast('Please enter a valid email address', 'error');
    return;
  }
  if (password !== confirm) {
    Utils.showToast('Passwords do not match', 'error');
    return;
  }
  if (!Utils.Validation.password(password)) {
    Utils.showToast('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, 'users', uid), {
      uid,
      name: contactName,
      email,
      role: 'company',
      companyName,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'companies', uid), {
      uid,
      companyName,
      contactName,
      email,
      role: 'company',
      drivers: [],
      vehicles: [],
      profileComplete: false,
      createdAt: serverTimestamp()
    });

    // Initialise DVSA checklist for new company
    await initialiseCompanyChecklist(uid);

    Utils.showToast('✅ Company registered successfully!', 'success');
    document.getElementById('company-register-form').reset();
  } catch (error) {
    console.error('Company reg error:', error);
    let msg = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
    Utils.showToast(msg, 'error');
  }
};

// ==================================================
// 🔹 INITIALISE COMPANY CHECKLIST
// ==================================================
async function initialiseCompanyChecklist(companyId) {
  try {
    const companyChecklistRef = doc(db, 'companies', companyId, 'settings', 'checklist');
    await setDoc(companyChecklistRef, {
      items: DEFAULT_CHECKLIST,
      updatedAt: serverTimestamp(),
      name: 'DVSA Standard Walkaround Checklist'
    });
    console.log('✅ DVSA-compliant checklist installed for company:', companyId);
  } catch (error) {
    console.error('Error initialising checklist:', error);
  }
}
window.initialiseCompanyChecklist = initialiseCompanyChecklist;

// ==================================================
// 🔹 SIGN OUT
// ==================================================
window.signOutUser = async function() {
  try {
    await signOut(auth);
    Utils.showToast('Signed out successfully', 'info');
  } catch (error) {
    console.error('Sign out error:', error);
    Utils.showToast('Error signing out', 'error');
  }
};

// ==================================================
// 🔹 GO TO CORRECT PORTAL
// ==================================================
window.goToPortal = async function(user) {
  if (!user) {
    showPage('auth-page');
    return;
  }

  try {
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) {
      showPage('auth-page');
      return;
    }

    const userData = userSnap.data();
    if (userData.role === 'driver') {
      showPage('driver-portal-page');
      await loadDriverDashboard(user.uid);
    } else if (userData.role === 'company') {
      showPage('company-portal-page');
      await loadCompanyDashboard(user.uid);
    }
  } catch (error) {
    console.error('Error navigating to portal:', error);
    showPage('auth-page');
  }
};

// ==================================================
// 🔹 AUTH STATE LISTENER
// ==================================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await goToPortal(user);
  } else {
    showPage('auth-page');
  }
});
// ==================================================
// 🔹 DRIVER PORTAL — DASHBOARD
// ==================================================
window.loadDriverDashboard = async function(userId) {
  try {
    const driverSnap = await getDoc(doc(db, 'drivers', userId));
    const driverData = driverSnap.exists() ? driverSnap.data() : {};
    
    const dashboard = document.getElementById('driver-dashboard');
    dashboard.innerHTML = `
      <div style="background: var(--primary-light); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="color: var(--primary); margin-bottom: 8px;">Welcome, ${escapeHtml(driverData.name || 'Driver')} 👋</h2>
        <p style="color: #555;">Here's what's happening today</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <button onclick="showPage('driver-profile-page')" style="padding: 24px; background: white; border: 2px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--primary); transition: all 0.2s;">
          👤 My Profile
        </button>
        <button onclick="showPage('driver-calendar-page')" style="padding: 24px; background: white; border: 2px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--primary); transition: all 0.2s;">
          📅 My Calendar
        </button>
        <button onclick="showPage('driver-documents-page')" style="padding: 24px; background: white; border: 2px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--primary); transition: all 0.2s;">
          📁 My Documents
        </button>
        <button onclick="showPage('driver-checklist-page')" style="padding: 24px; background: white; border: 2px solid var(--accent); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--accent); transition: all 0.2s;">
          ✅ Walkaround Check
        </button>
      </div>
      
      <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h3 style="margin-bottom: 16px; color: var(--primary);">Recent Walkaround Checks</h3>
        <div id="driver-recent-checks">
          <p style="color: #888;">Loading checks...</p>
        </div>
      </div>
    `;
    
    loadDriverRecentChecks(userId);
    
  } catch (error) {
    console.error('Error loading driver dashboard:', error);
    document.getElementById('driver-dashboard').innerHTML = '<p style="color: red;">Error loading dashboard. Please refresh.</p>';
  }
};

// ==================================================
// 🔹 DRIVER PORTAL — RECENT CHECKS
// ==================================================
async function loadDriverRecentChecks(userId) {
  try {
    const q = query(
      collection(db, 'walkaround'),
      where('driverUid', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    
    const snap = await getDocs(q);
    const container = document.getElementById('driver-recent-checks');
    
    if (snap.empty) {
      container.innerHTML = '<p style="color: #888;">No checks submitted yet.</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(doc => {
      const data = doc.data();
      const date = data.submittedAt ? data.submittedAt.toDate() : new Date();
      return `
        <div style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <strong>${escapeHtml(data.vehicleReg || 'Unknown Vehicle')}</strong>
          <span style="color: #888; font-size: 14px; margin-left: 12px;">${date.toLocaleDateString('en-GB')}</span>
          <span style="float: right; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: data.hasDefects ? '#fff3cd' : '#d4edda'; color: data.hasDefects ? '#856404' : '#155724';">
            ${data.hasDefects ? '⚠️ Defects Reported' : '✅ No Defects'}
          </span>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading recent checks:', error);
    document.getElementById('driver-recent-checks').innerHTML = '<p style="color: #888;">Could not load checks.</p>';
  }
}
window.loadDriverRecentChecks = loadDriverRecentChecks;

// ==================================================
// 🔹 DRIVER PORTAL — PROFILE
// ==================================================
window.showDriverProfile = async function() {
  showPage('driver-profile-page');
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const snap = await getDoc(doc(db, 'drivers', user.uid));
    const profile = snap.exists() ? snap.data() : {};
    
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-email').value = profile.email || user.email || '';
    document.getElementById('profile-phone').value = profile.phone || '';
    document.getElementById('profile-licence-number').value = profile.licenceNumber || '';
    document.getElementById('profile-valid-from').value = profile.validFrom || '';
    document.getElementById('profile-expiry-date').value = profile.expiryDate || '';
    document.getElementById('profile-medical-expiry').value = profile.medicalExpiry || '';
    document.getElementById('profile-points').value = profile.points || 0;
    document.getElementById('profile-notes').value = profile.notes || '';
    
  } catch (error) {
    console.error('Error loading profile:', error);
    Utils.showToast('Could not load profile', 'error');
  }
};

window.saveDriverProfile = async function() {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const data = {
      name: document.getElementById('profile-name').value.trim(),
      email: document.getElementById('profile-email').value.trim(),
      phone: document.getElementById('profile-phone').value.trim(),
      licenceNumber: document.getElementById('profile-licence-number').value.trim(),
      validFrom: document.getElementById('profile-valid-from').value || null,
      expiryDate: document.getElementById('profile-expiry-date').value || null,
      medicalExpiry: document.getElementById('profile-medical-expiry').value || null,
      points: parseInt(document.getElementById('profile-points').value) || 0,
      notes: document.getElementById('profile-notes').value.trim(),
      profileComplete: true,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'drivers', user.uid), data, { merge: true });
    await setDoc(doc(db, 'users', user.uid), { name: data.name }, { merge: true });
    
    Utils.showToast('✅ Profile saved successfully', 'success');
  } catch (error) {
    console.error('Error saving profile:', error);
    Utils.showToast('Failed to save profile', 'error');
  }
};

// ==================================================
// 📅 DRIVER PORTAL — CALENDAR
// ==================================================
function showDriverCalendarPage() {
  const page = document.getElementById('driver-calendar-page');
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  renderCalendar();
  
  function renderCalendar() {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let daysHTML = '';
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      daysHTML += `<div class="calendar-day empty"></div>`;
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && 
                      currentMonth === today.getMonth() && 
                      currentYear === today.getFullYear();
      daysHTML += `
        <div class="calendar-day ${isToday ? 'today' : ''}" 
             data-date="${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}">
          ${day}
        </div>
      `;
    }
    
    page.innerHTML = `
      <div class="calendar-header">
        <button onclick="changeMonth(-1)">◀</button>
        <h3>${monthNames[currentMonth]} ${currentYear}</h3>
        <button onclick="changeMonth(1)">▶</button>
      </div>
      <div class="calendar-weekdays">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
        <span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div class="calendar-grid">${daysHTML}</div>
    `;
  }
  
  window.changeMonth = (delta) => {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  };
}

// ==================================================
// 🔹 DRIVER PORTAL — DOCUMENTS
// ==================================================
window.showDriverDocuments = async function() {
  showPage('driver-documents-page');
  const user = auth.currentUser;
  if (!user) return;
  
  loadDriverDocuments(user.uid);
};

async function loadDriverDocuments(userId) {
  try {
    const q = query(
      collection(db, 'documents'),
      where('driverUid', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    
    const snap = await getDocs(q);
    const container = document.getElementById('documents-list');
    
    if (snap.empty) {
      container.innerHTML = '<p style="color: #888;">No documents uploaded yet.</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(doc => {
      const d = doc.data();
      return `
        <div style="padding: 12px; background: white; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid var(--primary);">
          <a href="${escapeHtml(d.url)}" target="_blank" style="font-weight: 500; color: var(--primary); text-decoration: none;">${escapeHtml(d.name || 'Document')}</a>
          <p style="font-size: 13px; color: #666; margin-top: 4px;">${d.uploadedAt ? d.uploadedAt.toDate().toLocaleDateString('en-GB') : ''}</p>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading documents:', error);
    document.getElementById('documents-list').innerHTML = '<p style="color: red;">Could not load documents</p>';
  }
}
window.loadDriverDocuments = loadDriverDocuments;

window.uploadDriverDocument = async function() {
  const user = auth.currentUser;
  if (!user) { Utils.showToast('Please sign in first', 'error'); return; }
  
  const fileInput = document.getElementById('document-file');
  const nameInput = document.getElementById('document-name');
  
  if (!fileInput.files.length) { Utils.showToast('Please select a file', 'error'); return; }
  if (!nameInput.value.trim()) { Utils.showToast('Please enter a document name', 'error'); return; }
  
  const file = fileInput.files[0];
  const docName = nameInput.value.trim();
  
  try {
    const filePath = `documents/${user.uid}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    await addDoc(collection(db, 'documents'), {
      name: docName,
      url: url,
      driverUid: user.uid,
      uploadedAt: serverTimestamp()
    });
    
    Utils.showToast('✅ Document uploaded', 'success');
    fileInput.value = '';
    nameInput.value = '';
    loadDriverDocuments(user.uid);
    
  } catch (error) {
    console.error('Upload error:', error);
    Utils.showToast('Upload failed: ' + error.message, 'error');
  }
};

// ==================================================
// 🔹 DRIVER PORTAL — WALKAROUND CHECKLIST
// ==================================================
let currentChecklistItems = [];

window.showWalkaroundChecklist = function() {
  showPage('driver-checklist-page');
  currentChecklistItems = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
  renderDriverChecklist();
};

function renderDriverChecklist() {
  const container = document.getElementById('checklist-form');
  const categories = [...new Set(currentChecklistItems.map(i => i.category))];
  
  container.innerHTML = categories.map(cat => `
    <div style="margin-bottom: 24px;">
      <h4 style="background: var(--primary); color: white; padding: 10px 16px; border-radius: 6px; margin-bottom: 12px;">${escapeHtml(cat)}</h4>
      ${currentChecklistItems.filter(i => i.category === cat).map((item, idx) => {
        const globalIdx = currentChecklistItems.indexOf(item);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: white; border-radius: 4px; margin-bottom: 6px;">
            <span style="font-size: 15px;">${globalIdx + 1}. ${escapeHtml(item.item)}</span>
            <div style="display: flex; gap: 8px;">
              <label style="padding: 4px 10px; border-radius: 4px; cursor: pointer; background: ${item.pass ? '#d4edda' : 'transparent'}; color: ${item.pass ? '#155724' : '#666'}; border: 1px solid #ccc;">
                <input type="radio" name="item-${globalIdx}" value="pass" style="display:none;" onchange="toggleChecklistItem(${globalIdx}, true)"> PASS
              </label>
              <label style="padding: 4px 10px; border-radius: 4px; cursor: pointer; background: ${!item.pass && item.pass !== null ? '#f8d7da' : 'transparent'}; color: ${!item.pass && item.pass !== null ? '#721c24' : '#666'}; border: 1px solid #ccc;">
                <input type="radio" name="item-${globalIdx}" value="fail" style="display:none;" onchange="toggleChecklistItem(${globalIdx}, false)"> FAIL
              </label>
            </div>
          </div>
          ${!item.pass && item.pass !== null ? `
            <div style="padding: 0 12px 8px;">
              <input type="text" id="defect-note-${globalIdx}" placeholder="Enter defect details..." 
                value="${escapeHtml(item.defectNote || '')}"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-top: 4px;"
                onchange="currentChecklistItems[${globalIdx}].defectNote = this.value">
            </div>
          ` : ''}
        `;
      }).join('')}
    </div>
  `).join('');
}
window.renderDriverChecklist = renderDriverChecklist;

window.toggleChecklistItem = function(index, passed) {
  currentChecklistItems[index].pass = passed;
  renderDriverChecklist();
};

window.submitChecklist = async function() {
  const user = auth.currentUser;
  if (!user) { Utils.showToast('Please sign in', 'error'); return; }
  
  const vehicleReg = document.getElementById('checklist-vehiclereg').value.trim();
  const mileage = document.getElementById('checklist-mileage').value.trim();
  
  if (!vehicleReg) { Utils.showToast('Please enter vehicle registration', 'error'); return; }
  if (!mileage) { Utils.showToast('Please enter current mileage', 'error'); return; }
  
  const hasDefects = currentChecklistItems.some(item => item.pass === false);
  const allChecked = currentChecklistItems.every(item => item.pass === true || item.pass === false);
  
  if (!allChecked) { Utils.showToast('Please check all items', 'error'); return; }
  
  try {
    await addDoc(collection(db, 'walkaround'), {
      driverUid: user.uid,
      driverName: (await getDoc(doc(db, 'drivers', user.uid))).data()?.name || '',
      vehicleReg: vehicleReg.toUpperCase(),
      mileage: parseInt(mileage),
      items: currentChecklistItems,
      hasDefects: hasDefects,
      submittedAt: serverTimestamp()
    });
    
    Utils.showToast('✅ Checklist submitted successfully', 'success');
    
    // Reset form
    document.getElementById('checklist-vehiclereg').value = '';
    document.getElementById('checklist-mileage').value = '';
    currentChecklistItems = [];
    
    // Refresh dashboard
    await loadDriverDashboard(user.uid);
    showPage('driver-portal-page');
    
  } catch (error) {
    console.error('Submit error:', error);
    Utils.showToast('Failed to submit checklist', 'error');
  }
};
// ==================================================
// 🔹 COMPANY PORTAL — DASHBOARD
// ==================================================
window.loadCompanyDashboard = async function(companyId) {
  try {
    const companySnap = await getDoc(doc(db, 'companies', companyId));
    const companyData = companySnap.exists() ? companySnap.data() : {};
    
    const dashboard = document.getElementById('company-dashboard');
    dashboard.innerHTML = `
      <div style="background: var(--primary-light); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="color: var(--primary); margin-bottom: 8px;">${escapeHtml(companyData.companyName || 'Company')} — Portal</h2>
        <p style="color: #555;">Welcome back, ${escapeHtml(companyData.contactName || 'Admin')}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <button onclick="showPostedWork()" style="padding: 24px; background: white; border: 2px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--primary);">
          📋 Posted Work
        </button>
        <button onclick="showAddDriver()" style="padding: 24px; background: white; border: 2px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--primary);">
          👤 Add Employed Driver
        </button>
        <button onclick="showPage('post-job-page')" style="padding: 24px; background: white; border: 2px solid var(--accent); border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: var(--accent);">
          🚛 Post New Job
        </button>
        <button onclick="showChecklistEditor()" style="padding: 24px; background: white; border: 2px solid #28a745; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; color: #28a745;">
          ✅ Checklist Editor
        </button>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="margin-bottom: 16px; color: var(--primary);">Quick Stats</h3>
          <p><strong>Employed Drivers:</strong> <span id="stat-drivers">0</span></p>
          <p><strong>Active Jobs:</strong> <span id="stat-jobs">0</span></p>
          <p><strong>Checklists Today:</strong> <span id="stat-checklists">0</span></p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="margin-bottom: 16px; color: var(--primary);">Recent Activity</h3>
          <div id="company-recent-activity">
            <p style="color: #888;">Loading activity...</p>
          </div>
        </div>
      </div>
    `;
    
    loadCompanyStats(companyId);
    loadCompanyActivity(companyId);
    
  } catch (error) {
    console.error('Error loading company dashboard:', error);
    document.getElementById('company-dashboard').innerHTML = 
      '<p style="color: red;">Error loading dashboard. Please refresh.</p>';
  }
};

async function loadCompanyStats(companyId) {
  try {
    const driversSnap = await getDocs(collection(db, 'companies', companyId, 'drivers'));
    document.getElementById('stat-drivers').textContent = driversSnap.size;
    
    const jobsSnap = await getDocs(query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId),
      where('status', '==', 'active')
    ));
    document.getElementById('stat-jobs').textContent = jobsSnap.size;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checksSnap = await getDocs(query(
      collection(db, 'walkaround'),
      where('submittedAt', '>=', today)
    ));
    document.getElementById('stat-checklists').textContent = checksSnap.size;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadCompanyActivity(companyId) {
  try {
    const q = query(
      collection(db, 'walkaround'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    const container = document.getElementById('company-recent-activity');
    
    if (snap.empty) {
      container.innerHTML = '<p style="color: #888;">No recent activity.</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(doc => {
      const d = doc.data();
      const date = d.submittedAt ? d.submittedAt.toDate().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : '';
      return `
        <div style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px;">
          <strong>${escapeHtml(d.driverName || 'Driver')}</strong> — ${escapeHtml(d.vehicleReg || 'Unknown')}
          <span style="color: #888; font-size: 12px; float: right;">${date}</span>
          <span style="display: block; font-size: 12px; color: ${d.hasDefects ? '#d47500' : '#28a745'};">
            ${d.hasDefects ? '⚠️ Defects reported' : '✅ Check complete'}
          </span>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading activity:', error);
    document.getElementById('company-recent-activity').innerHTML = 
      '<p style="color: #888;">Could not load activity.</p>';
  }
}

// ==================================================
// 🔹 COMPANY PORTAL — POSTED WORK
// ==================================================
window.showPostedWork = async function() {
  showPage('posted-work-page');
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const q = query(
      collection(db, 'jobs'),
      where('companyId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const container = document.getElementById('posted-work-list');
    
    if (snap.empty) {
      container.innerHTML = '<p style="color: #888;">No jobs posted yet. Click "Post New Job" to get started.</p>';
      return;
    }
    
    container.innerHTML = snap.docs.map(doc => {
      const j = doc.data();
      const statusColor = j.status === 'active' ? '#28a745' : j.status === 'completed' ? '#1a365d' : '#d47500';
      return `
        <div style="background: white; padding: 16px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid ${statusColor};">
          <h4 style="margin-bottom: 8px;">${escapeHtml(j.title || 'Untitled Job')}</h4>
          <p style="font-size: 14px; color: #666; margin-bottom: 4px;">📍 ${escapeHtml(j.location || 'No location')}</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">💰 ${Utils.Format.currency(j.rate || 0)}</p>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: ${statusColor}20; color: ${statusColor};">
            ${j.status || 'active'}
          </span>
          <button onclick="deleteJob('${doc.id}')" style="float: right; background: #dc3545; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">Delete</button>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading posted work:', error);
    document.getElementById('posted-work-list').innerHTML = 
      '<p style="color: red;">Could not load posted work.</p>';
  }
};

window.deleteJob = async function(jobId) {
  if (!confirm('Delete this job? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
    Utils.showToast('✅ Job deleted', 'success');
    showPostedWork();
  } catch (error) {
    console.error('Error deleting job:', error);
    Utils.showToast('Failed to delete job', 'error');
  }
};

// ==================================================
// 🔹 COMPANY PORTAL — POST NEW JOB
// ==================================================
window.postNewJob = async function() {
  const user = auth.currentUser;
  if (!user) { Utils.showToast('Please sign in', 'error'); return; }
  
  const title = document.getElementById('job-title').value.trim();
  const location = document.getElementById('job-location').value.trim();
  const description = document.getElementById('job-description').value.trim();
  const rate = parseFloat(document.getElementById('job-rate').value);
  const date = document.getElementById('job-date').value;
  
  if (!title || !location || !rate || !date) {
    Utils.showToast('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    await addDoc(collection(db, 'jobs'), {
      companyId: user.uid,
      title,
      location,
      description,
      rate,
      date,
      status: 'active',
      createdAt: serverTimestamp()
    });
    
    Utils.showToast('✅ Job posted successfully!', 'success');
    document.getElementById('post-job-form').reset();
    showPostedWork();
    
  } catch (error) {
    console.error('Error posting job:', error);
    Utils.showToast('Failed to post job', 'error');
  }
};

// ==================================================
// 🔹 COMPANY PORTAL — ADD EMPLOYED DRIVER
// ==================================================
window.showAddDriver = function() {
  showPage('add-driver-page');
  document.getElementById('add-driver-result').innerHTML = '';
};

window.addEmployedDriver = async function() {
  const user = auth.currentUser;
  if (!user) { Utils.showToast('Please sign in', 'error'); return; }
  
  const driverEmail = document.getElementById('driver-email-input').value.trim();
  const driverName = document.getElementById('driver-name-input').value.trim();
  
  if (!driverEmail) {
    Utils.showToast('Please enter the driver\'s email address', 'error');
    return;
  }
  
  try {
    const q = query(collection(db, 'users'), where('email', '==', driverEmail));
    const snap = await getDocs(q);
    
    let driverUid = null;
    let foundName = null;
    
    if (!snap.empty) {
      const existingDoc = snap.docs[0];
      driverUid = existingDoc.id;
      foundName = existingDoc.data().name;
      
      await setDoc(doc(db, 'drivers', driverUid), {
        companyId: user.uid,
        employedAt: serverTimestamp()
      }, { merge: true });
      
      await setDoc(doc(db, 'companies', user.uid, 'drivers', driverUid), {
        uid: driverUid,
        name: foundName || driverName,
        email: driverEmail,
        addedAt: serverTimestamp(),
        status: 'active'
      });
      
      document.getElementById('add-driver-result').innerHTML = 
        `<p style="color: green;">✅ Driver linked successfully: <strong>${escapeHtml(foundName || driverName)}</strong> (${escapeHtml(driverEmail)})</p>`;
      
    } else {
      const tempId = 'invite_' + Date.now();
      
      await setDoc(doc(db, 'companies', user.uid, 'drivers', tempId), {
        uid: null,
        name: driverName || 'New Driver',
        email: driverEmail,
        addedAt: serverTimestamp(),
        status: 'pending'
      });
      
      document.getElementById('add-driver-result').innerHTML = 
        `<p style="color: #d47500;">⚠️ Driver not yet registered — added as pending. Ask them to register using this email.</p>`;
    }
    
    Utils.showToast('✅ Driver added to company', 'success');
    document.getElementById('add-driver-form').reset();
    
  } catch (error) {
    console.error('Error adding driver:', error);
    Utils.showToast('Failed to add driver: ' + error.message, 'error');
    document.getElementById('add-driver-result').innerHTML = 
      `<p style="color: red;">Error: ${escapeHtml(error.message)}</p>`;
  }
};

// ==================================================
// 🔹 COMPANY PORTAL — CHECKLIST EDITOR
// ==================================================
let editorChecklistItems = [];

window.showChecklistEditor = async function() {
  showPage('checklist-editor-page');
  const user = auth.currentUser;
  if (!user) return;
  
  await loadChecklistTemplate(user.uid);
  renderChecklistEditor();
};

async function loadChecklistTemplate(companyId) {
  try {
    const checklistRef = doc(db, 'companies', companyId, 'settings', 'checklist');
    const snapshot = await getDoc(checklistRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      editorChecklistItems = data.items || DEFAULT_CHECKLIST;
      console.log('✅ Loaded checklist with', editorChecklistItems.length, 'items');
    } else {
      editorChecklistItems = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
      console.log('⚠️ No saved checklist found — using default DVSA checklist');
    }
  } catch (error) {
    console.error('Error loading checklist template:', error);
    editorChecklistItems = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
  }
}

function renderChecklistEditor() {
  const container = document.getElementById('checklist-editor-content');
  const categories = [...new Set(editorChecklistItems.map(i => i.category))];
  
  container.innerHTML = `
    <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h3>DVSA Walkaround Checklist Editor</h3>
      <button onclick="addNewChecklistItem()" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">+ Add New Item</button>
    </div>
    ${categories.map(cat => `
      <div style="margin-bottom: 24px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
        <div style="background: var(--primary); color: white; padding: 10px 16px; font-weight: 500;">${escapeHtml(cat)}</div>
        <div style="padding: 12px;">
          ${editorChecklistItems.filter(i => i.category === cat).map((item, idx) => {
            const globalIdx = editorChecklistItems.indexOf(item);
            return `
              <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #eee;">
                <input type="text" value="${escapeHtml(item.item)}" 
                  style="flex: 1; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
                  onchange="editorChecklistItems[${globalIdx}].item = this.value">
                <button onclick="removeChecklistItem(${globalIdx})" 
                  style="background: #dc3545; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px; line-height: 1;">×</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('')}
    <div style="margin-top: 24px; display: flex; gap: 12px;">
      <button onclick="saveChecklistTemplate()" style="padding: 10px 24px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 15px;">💾 Save Checklist</button>
      <button onclick="resetChecklistToDefault()" style="padding: 10px 24px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 15px;">↩️ Reset to DVSA Default</button>
    </div>
  `;
}

window.addNewChecklistItem = function() {
  const newItem = {
    category: 'New Category',
    item: 'New checklist item — click to edit',
    pass: true
  };
  editorChecklistItems.push(newItem);
  renderChecklistEditor();
};

window.removeChecklistItem = function(index) {
  if (confirm('Remove this checklist item?')) {
    editorChecklistItems.splice(index, 1);
    renderChecklistEditor();
  }
};

window.saveChecklistTemplate = async function() {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const checklistRef = doc(db, 'companies', user.uid, 'settings', 'checklist');
    await setDoc(checklistRef, {
      items: editorChecklistItems,
      updatedAt: serverTimestamp(),
      name: 'DVSA Standard Walkaround Checklist'
    });
    Utils.showToast('✅ Checklist saved successfully', 'success');
  } catch (error) {
    console.error('Error saving checklist:', error);
    Utils.showToast('Failed to save checklist', 'error');
  }
};

window.resetChecklistToDefault = function() {
  if (confirm('Reset all items to the standard DVSA checklist? Your changes will be lost.')) {
    editorChecklistItems = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST));
    renderChecklistEditor();
    Utils.showToast('✅ Reset to DVSA default', 'success');
  }
};
// ==================================================
// 🔹 PASSWORD RESET & UTILITY FUNCTIONS
// ==================================================
window.resetPassword = async function() {
  const email = document.getElementById('reset-email')?.value?.trim() || 
                prompt('Please enter your email address:');
  
  if (!email) {
    Utils.showToast('Please enter your email address', 'error');
    return;
  }
  
  if (!Utils.Validation.email(email)) {
    Utils.showToast('Please enter a valid email address', 'error');
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    Utils.showToast('✅ Password reset email sent! Check your inbox.', 'success');
  } catch (error) {
    console.error('Password reset error:', error);
    let msg = 'Failed to send reset email.';
    if (error.code === 'auth/user-not-found') msg = 'No account found with that email.';
    if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
    Utils.showToast(msg, 'error');
  }
};

// ==================================================
// 🔹 BACKUP DATA EXPORT
// ==================================================
window.exportMyData = async function() {
  const user = auth.currentUser;
  if (!user) {
    Utils.showToast('Please sign in first', 'error');
    return;
  }
  
  try {
    const data = {
      exportedAt: new Date().toISOString(),
      userId: user.uid,
      email: user.email
    };
    
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (userSnap.exists()) data.user = userSnap.data();
    
    const driverSnap = await getDoc(doc(db, 'drivers', user.uid));
    if (driverSnap.exists()) data.profile = driverSnap.data();
    
    const checksSnap = await getDocs(query(
      collection(db, 'walkaround'),
      where('driverUid', '==', user.uid),
      orderBy('submittedAt', 'desc'),
      limit(50)
    ));
    data.recentChecks = checksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lsd-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    Utils.showToast('✅ Data exported successfully', 'success');
  } catch (error) {
    console.error('Export error:', error);
    Utils.showToast('Failed to export data', 'error');
  }
};

// ==================================================
// 🔹 PAGE NAVIGATION SHORTCUTS
// ==================================================
window.showAuthPage = function() { showPage('auth-page'); };
window.showDriverPortal = function() { showPage('driver-portal-page'); };
window.showCompanyPortal = function() { showPage('company-portal-page'); };

// ==================================================
// 🔹 DEBUG / DIAGNOSTIC — RUN FROM CONSOLE (F12)
// ==================================================
window.AppDiagnostics = {
  async run() {
    console.clear();
    console.log('🧪 === LSD Solutions — App Diagnostics ===');
    
    const checks = [
      { name: 'Firebase Auth', ok: !!auth },
      { name: 'Firestore DB', ok: !!db },
      { name: 'Storage', ok: !!storage },
      { name: 'showPage()', ok: typeof showPage === 'function' },
      { name: 'DEFAULT_CHECKLIST', ok: Array.isArray(DEFAULT_CHECKLIST) },
      { name: 'escapeHtml()', ok: typeof escapeHtml === 'function' },
      { name: 'Utils Library', ok: typeof Utils === 'object' && Utils !== null },
    ];
    
    checks.forEach(c => console.log(`${c.ok ? '✅' : '❌'} ${c.name}`));
    
    const user = auth.currentUser;
    console.log(`\n👤 Current User: ${user ? user.email : 'Not signed in'}`);
    console.log(`🆔 User UID: ${user ? user.uid : 'N/A'}`);
    console.log(`📋 Checklist Items: ${DEFAULT_CHECKLIST.length}`);
    
    console.log('\n=== End Diagnostics ===');
    return checks.every(c => c.ok);
  }
};

// ==================================================
// 🔹 APP INITIALISATION
// ==================================================
console.log('🚛 LSD Solutions — App Loaded');
console.log(`📅 ${new Date().toLocaleString('en-GB')}`);
console.log('Run AppDiagnostics.run() in console to verify setup.');

// Auto-hide loading overlays if any
document.addEventListener('DOMContentLoaded', () => {
  const loaders = document.querySelectorAll('.loading');
  loaders.forEach(el => el.style.display = 'none');
  console.log('✅ DOM Ready — App Initialised');
});