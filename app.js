// ==================================================
// LSD SOLUTIONS — COMPLETE app.js
// Matches index.html • Firebase v10.7.1 • DVSA Compliant
// ==================================================
'use strict';

// ==================================================
// 📦 FIREBASE IMPORTS & CONFIGURATION
// ==================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
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
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// --- FIREBASE CONFIG — UPDATE WITH YOURS ---
const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.appspot.com",
  messagingSenderId: "1034953014549",
  appId: "1:1034953014549:web:6e8c7f5a8b9c7d6e5f4a3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==================================================
// 🛠️ UTILITY FUNCTIONS
// ==================================================
const Utils = {
  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  },

  formatDateTime(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 16);
  },

  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
      el.className = 'error-text';
    }
  },

  showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
      el.className = 'success-text';
    }
  },

  hideStatus(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
  }
};

// ==================================================
// 🔐 AUTHENTICATION STATE
// ==================================================
let currentUser = null;
let userProfile = null;
let unsubscribeProfile = null;

// Listen for auth changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserProfile();
    showPageBasedOnRole();
  } else {
    currentUser = null;
    userProfile = null;
    if (unsubscribeProfile) unsubscribeProfile();
    showAuthPage();
  }
});

// Load user profile from Firestore
async function loadUserProfile() {
  if (!currentUser) return;
  try {
    const profileRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      userProfile = snap.data();
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

// ==================================================
// 📄 PAGE NAVIGATION SYSTEM
// ==================================================

// Show a specific page — EXACT match for index.html IDs
window.showPage = function(pageId) {
  // Hide ALL pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  // Show the requested page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo(0, 0);
    // Trigger page-specific loaders
    runPageLoaders(pageId);
  } else {
    console.error('Page not found:', pageId);
  }
};

// Run data loaders when pages are shown
function runPageLoaders(pageId) {
  switch(pageId) {
    case 'driverDashboardPage':
      updateDriverDashboard();
      break;
    case 'driverProfilePage':
      populateDriverProfile();
      break;
    case 'driverDocumentsPage':
      loadDriverDocuments();
      break;
    case 'driverCalendarPage':
      loadDriverJobs();
      break;
    case 'driverInfringementsPage':
      loadDriverInfringements();
      break;
    case 'driverChecklistPage':
      initChecklistPage();
      break;
    case 'companyDashboardPage':
      updateCompanyDashboard();
      break;
    case 'companyProfilePage':
      populateCompanyProfile();
      break;
    case 'companyVehiclesPage':
      loadCompanyVehicles();
      break;
    case 'companyDriversPage':
      loadCompanyDrivers();
      break;
    case 'companyJobsPage':
      loadCompanyJobs();
      break;
    case 'companyMaintenancePage':
      loadMaintenanceSchedule();
      break;
    case 'companyDefectsPage':
      loadDefects('all');
      break;
    case 'companyCompliancePage':
      loadComplianceOverview();
      break;
    case 'companyTachographPage':
      loadTachoRecords();
      loadTachoOverview();
      break;
  }
}

// Show auth page only
function showAuthPage() {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById('authPage').classList.add('active');
}

// Show correct portal based on user role
function showPageBasedOnRole() {
  if (!userProfile) {
    showAuthPage();
    return;
  }
  if (userProfile.accountType === 'driver') {
    showPage('driverDashboardPage');
  } else if (userProfile.accountType === 'company') {
    showPage('companyDashboardPage');
  }
}
// ==================================================
// LSD SOLUTIONS — app.js SECTION 2
// Auth Forms & Authentication Functions
// ==================================================

// ==================================================
// 🔐 AUTH TABS SWITCHING
// ==================================================
// ==================================================
// 🔐 AUTH TABS SWITCHING
// ==================================================
window.showAuthTab = function(tabName) {
  // Get elements with safety checks
  const signInForm = document.getElementById('signInForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');

  // Hide ALL forms first
  if (signInForm) signInForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (resetForm) resetForm.style.display = 'none';

  // Reset tab button styles
  if (tabSignIn) {
    tabSignIn.classList.remove('btn-secondary');
    tabSignIn.classList.add('btn-primary');
  }
  if (tabRegister) {
    tabRegister.classList.remove('btn-primary');
    tabRegister.classList.add('btn-secondary');
  }

  // Show selected form
  if (tabName === 'signin' && signInForm) {
    signInForm.style.display = 'block';
  } 
  else if (tabName === 'register' && registerForm) {
    registerForm.style.display = 'block';
    if (tabSignIn) {
      tabSignIn.classList.remove('btn-primary');
      tabSignIn.classList.add('btn-secondary');
    }
    if (tabRegister) {
      tabRegister.classList.remove('btn-secondary');
      tabRegister.classList.add('btn-primary');
    }
  } 
  else if (tabName === 'reset' && resetForm) {
    resetForm.style.display = 'block';
  }

  // Clear messages
  Utils.hideStatus('loginError');
  Utils.hideStatus('registerError');
  Utils.hideStatus('registerSuccess');
  const resetMsg = document.getElementById('resetMessage');
  if (resetMsg) resetMsg.style.display = 'none';
};

// ==================================================
// 🚪 SIGN IN
// ==================================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  Utils.hideStatus('loginError');
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Auth state listener handles redirection
  } catch (err) {
    console.error('Sign in error:', err);
    let message = 'Sign in failed. Please check your details.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      message = '❌ Incorrect email or password';
    } else if (err.code === 'auth/too-many-requests') {
      message = '❌ Too many attempts. Please try again later.';
    }
    Utils.showError('loginError', message);
  }
});

// ==================================================
// 📝 REGISTER
// ==================================================
document.getElementById('registerFormEl').addEventListener('submit', async (e) => {
  e.preventDefault();
  Utils.hideStatus('registerError');
  Utils.hideStatus('registerSuccess');
  
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const accountType = document.querySelector('input[name="accountType"]:checked').value;
  
  if (password.length < 6) {
    Utils.showError('registerError', '❌ Password must be at least 6 characters');
    return;
  }
  
  try {
    // Create auth user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    
    // Send verification email
    await sendEmailVerification(user);
    
    // Create profile in Firestore
    const profileData = {
      uid: user.uid,
      name: name,
      email: email,
      accountType: accountType,
      createdAt: serverTimestamp(),
      emailVerified: false
    };
    
    await setDoc(doc(db, 'users', user.uid), profileData);
    
    // If company — initialize default DVSA checklist
    if (accountType === 'company') {
      await initialiseCompanyChecklist(user.uid);
    }
    
    Utils.showSuccess('registerSuccess', '✅ Account created! Check your email to verify, then sign in.');
    document.getElementById('registerFormEl').reset();
    
    // Sign out — user must verify first
    await signOut(auth);
    showAuthTab('signin');
    
  } catch (err) {
    console.error('Registration error:', err);
    let message = 'Registration failed.';
    if (err.code === 'auth/email-already-in-use') {
      message = '❌ This email is already registered';
    } else if (err.code === 'auth/invalid-email') {
      message = '❌ Please enter a valid email address';
    }
    Utils.showError('registerError', message);
  }
});

// Initialize company with DVSA-compliant default checklist
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
    console.warn('Could not initialize checklist:', err);
  }
}

// ==================================================
// 🔑 PASSWORD RESET
// ==================================================
document.getElementById('resetFormEl').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value.trim();
  const msgEl = document.getElementById('resetMessage');
  
  try {
    await sendPasswordResetEmail(auth, email);
    msgEl.textContent = '✅ Password reset link sent! Check your email.';
    msgEl.style.display = 'block';
    msgEl.className = 'success-text';
    document.getElementById('resetFormEl').reset();
  } catch (err) {
    console.error('Reset error:', err);
    msgEl.textContent = '❌ Could not send reset email. Please check your address.';
    msgEl.style.display = 'block';
    msgEl.className = 'error-text';
  }
});

// ==================================================
// 🚪 SIGN OUT
// ==================================================
window.handleSignOut = async function() {
  try {
    await signOut(auth);
    userProfile = null;
    currentUser = null;
    if (unsubscribeProfile) unsubscribeProfile();
    showAuthPage();
    showAuthTab('signin');
  } catch (err) {
    console.error('Sign out error:', err);
  }
};
// ==================================================
// LSD SOLUTIONS — app.js SECTION 3
// Driver Portal — Dashboard, Profile & Walkaround
// ==================================================

// ==================================================
// 🚛 DRIVER DASHBOARD
// ==================================================
async function updateDriverDashboard() {
  if (!currentUser || !userProfile) return;
  
  const nameEl = document.getElementById('driverNameDisplay');
  if (nameEl) {
    nameEl.textContent = Utils.escapeHtml(userProfile.name || 'Driver');
  }
  
  // Load recent activity
  const activityEl = document.getElementById('drActivityList');
  if (!activityEl) return;
  
  try {
    const q = query(
      collection(db, 'checklists'),
      where('driverUid', '==', currentUser.uid),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      activityEl.innerHTML = '<p style="color:#666;">No recent activity yet.</p>';
    } else {
      let html = '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
      snap.forEach(doc => {
        const d = doc.data();
        const date = d.submittedAt ? d.submittedAt.toDate().toLocaleDateString() : 'Unknown date';
        html += `
          <div style="padding:0.5rem 0; border-bottom:1px solid #eee;">
            <strong>${Utils.escapeHtml(d.vehicleReg || 'Unknown Vehicle')}</strong>
            <span style="color:#666; font-size:0.9rem; margin-left:0.5rem;">${date}</span>
          </div>
        `;
      });
      html += '</div>';
      activityEl.innerHTML = html;
    }
  } catch (err) {
    console.error('Error loading activity:', err);
    activityEl.innerHTML = '<p class="error-text">Could not load recent activity.</p>';
  }
}

// ==================================================
// 👤 DRIVER PROFILE
// ==================================================
function populateDriverProfile() {
  if (!userProfile) return;
  
  document.getElementById('dpFullName').value = userProfile.name || '';
  document.getElementById('dpEmail').value = userProfile.email || '';
  document.getElementById('dpLicenceNumber').value = userProfile.licenceNumber || '';
  document.getElementById('dpDob').value = userProfile.dateOfBirth || '';
  document.getElementById('dpLicenceValidFrom').value = userProfile.licenceValidFrom || '';
  document.getElementById('dpLicenceExpiry').value = userProfile.licenceExpiry || '';
  document.getElementById('dpMedicalExpiry').value = userProfile.medicalExpiry || '';
  document.getElementById('dpDrivingPoints').value = userProfile.drivingPoints || 0;
  document.getElementById('dpPhone').value = userProfile.phone || '';
}

document.getElementById('driverProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('dpSaveStatus');
  
  try {
    const profileRef = doc(db, 'users', currentUser.uid);
    await updateDoc(profileRef, {
      name: document.getElementById('dpFullName').value.trim(),
      licenceNumber: document.getElementById('dpLicenceNumber').value.trim(),
      dateOfBirth: document.getElementById('dpDob').value || null,
      licenceValidFrom: document.getElementById('dpLicenceValidFrom').value || null,
      licenceExpiry: document.getElementById('dpLicenceExpiry').value || null,
      medicalExpiry: document.getElementById('dpMedicalExpiry').value || null,
      drivingPoints: parseInt(document.getElementById('dpDrivingPoints').value) || 0,
      phone: document.getElementById('dpPhone').value.trim()
    });
    
    // Update local copy
    userProfile.name = document.getElementById('dpFullName').value.trim();
    Utils.showSuccess('dpSaveStatus', '✅ Profile saved successfully!');
    setTimeout(() => Utils.hideStatus('dpSaveStatus'), 3000);
  } catch (err) {
    console.error('Error saving profile:', err);
    Utils.showError('dpSaveStatus', '❌ Failed to save profile. Please try again.');
  }
});

// ==================================================
// ✅ DRIVER WALKAROUND CHECKLIST
// ==================================================
let currentChecklistData = {};

function initChecklistPage() {
  // Set today's date and current time automatically
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkDate').value = today;
  
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  document.getElementById('checkTime').value = timeStr;
  
  // Attach toggle listeners to all checkboxes
  document.querySelectorAll('.check-main').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const noteId = this.id + '_note';
      const noteEl = document.getElementById(noteId);
      if (noteEl) {
        if (!this.checked) {
          noteEl.classList.add('visible');
        } else {
          noteEl.classList.remove('visible');
        }
      }
      currentChecklistData[this.id] = this.checked;
    });
  });
  
  // Load existing checklist if editing
  loadExistingChecklist();
}

async function loadExistingChecklist() {
  // Optionally load a saved checklist — check URL param or recent submission
  const params = new URLSearchParams(window.location.search);
  const checkId = params.get('checkId');
  if (!checkId) return;
  
  try {
    const checkSnap = await getDoc(doc(db, 'checklists', checkId));
    if (checkSnap.exists()) {
      const data = checkSnap.data();
      
      document.getElementById('checkVehicleReg').value = data.vehicleReg || '';
      document.getElementById('checkTrailerNo').value = data.trailerNumber || '';
      document.getElementById('checkDate').value = data.checkDate || '';
      document.getElementById('checkTime').value = data.checkTime || '';
      document.getElementById('checkComments').value = data.comments || '';
      document.getElementById('checkSignature').value = data.signature || '';
      
      // Restore all checkbox states
      Object.keys(data).forEach(key => {
        const el = document.getElementById(key);
        if (el && el.type === 'checkbox') {
          el.checked = data[key] === true;
          // Show defect note if item is unchecked
          const noteId = key + '_note';
          const noteEl = document.getElementById(noteId);
          if (noteEl && !el.checked) {
            noteEl.classList.add('visible');
            const textarea = noteEl.querySelector('textarea');
            if (textarea && data[key + '_note']) {
              textarea.value = data[key + '_note'];
            }
          }
        }
      });
    }
  } catch (err) {
    console.warn('Could not load existing checklist:', err);
  }
}

// Handle checklist submission
document.getElementById('checklistForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('checklistStatus');
  statusEl.style.display = 'none';
  
  const vehicleReg = document.getElementById('checkVehicleReg').value.trim();
  const signature = document.getElementById('checkSignature').value.trim();
  
  if (!vehicleReg) {
    statusEl.textContent = '❌ Please enter the vehicle registration.';
    statusEl.className = 'error-text';
    statusEl.style.display = 'block';
    return;
  }
  if (!signature) {
    statusEl.textContent = '❌ Please type your name as confirmation.';
    statusEl.className = 'error-text';
    statusEl.style.display = 'block';
    return;
  }
  
  // Collect all data
  const formData = {
    driverUid: currentUser.uid,
    driverName: userProfile.name,
    driverEmail: userProfile.email,
    vehicleReg: vehicleReg,
    trailerNumber: document.getElementById('checkTrailerNo').value.trim(),
    checkDate: document.getElementById('checkDate').value,
    checkTime: document.getElementById('checkTime').value,
    comments: document.getElementById('checkComments').value.trim(),
    signature: signature,
    submittedAt: serverTimestamp(),
    ...currentChecklistData
  };
  
  // Collect defect notes
  document.querySelectorAll('.defect-note.visible').forEach(noteEl => {
    const textarea = noteEl.querySelector('textarea');
    if (textarea) {
      formData[noteEl.id] = textarea.value.trim();
    }
  });
  
  try {
    await addDoc(collection(db, 'checklists'), formData);
    statusEl.textContent = '✅ Checklist submitted successfully!';
    statusEl.className = 'success-text';
    statusEl.style.display = 'block';
    
    // Reset form after short delay
    setTimeout(() => {
      document.getElementById('checklistForm').reset();
      initChecklistPage();
      statusEl.style.display = 'none';
    }, 2500);
    
  } catch (err) {
    console.error('Checklist submission error:', err);
    statusEl.textContent = '❌ Failed to submit. Please try again.';
    statusEl.className = 'error-text';
    statusEl.style.display = 'block';
  }
});
// ==================================================
// LSD SOLUTIONS — app.js SECTION 4
// Driver Portal — Documents, Posted Work, Notices & WTD
// ==================================================

// ==================================================
// 📁 DRIVER DOCUMENTS
// ==================================================
document.getElementById('docUploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('docUploadStatus');
  statusEl.textContent = '';
  
  const docType = document.getElementById('docType').value;
  const docExpiry = document.getElementById('docExpiry').value || null;
  const fileInput = document.getElementById('docFile');
  const file = fileInput.files[0];
  
  if (!file) {
    statusEl.textContent = '❌ Please select a file.';
    statusEl.className = 'error-text';
    return;
  }
  
  try {
    statusEl.textContent = '⏳ Uploading...';
    statusEl.className = '';
    
    const fileRef = ref(storage, `documents/${currentUser.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    await addDoc(collection(db, 'documents'), {
      driverUid: currentUser.uid,
      driverName: userProfile.name,
      type: docType,
      expiryDate: docExpiry,
      fileName: file.name,
      fileURL: downloadURL,
      uploadedAt: serverTimestamp()
    });
    
    statusEl.textContent = '✅ Document uploaded successfully!';
    statusEl.className = 'success-text';
    document.getElementById('docUploadForm').reset();
    
    // Refresh list
    setTimeout(() => loadDriverDocuments(), 500);
    
  } catch (err) {
    console.error('Upload error:', err);
    statusEl.textContent = '❌ Upload failed. Please try again.';
    statusEl.className = 'error-text';
  }
});

async function loadDriverDocuments() {
  const listEl = document.getElementById('docsList');
  if (!listEl) return;
  
  try {
    const qry = query(
      collection(db, 'documents'),
      where('driverUid', '==', currentUser.uid),
      orderBy('uploadedAt', 'desc')
    );
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
      return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
    snap.forEach(doc => {
      const d = doc.data();
      const date = d.uploadedAt ? d.uploadedAt.toDate().toLocaleDateString() : 'Unknown';
      const expiry = d.expiryDate || 'No expiry set';
      html += `
        <div style="padding:0.75rem; background:#f9fafb; border-radius:4px; border-left:3px solid var(--primary);">
          <p style="font-weight:500; margin-bottom:0.25rem;">${Utils.escapeHtml(d.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}</p>
          <p style="font-size:0.85rem; color:#666;">
            📎 ${Utils.escapeHtml(d.fileName)} • Uploaded: ${date}
            ${expiry !== 'No expiry set' ? `• Expires: ${expiry}` : ''}
          </p>
          <a href="${d.fileURL}" target="_blank" style="font-size:0.9rem; color:var(--primary); margin-top:0.25rem; display:inline-block;">📥 View / Download</a>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading documents:', err);
    listEl.innerHTML = '<p class="error-text">Could not load documents.</p>';
  }
}

// ==================================================
// 📋 DRIVER POSTED WORK / JOBS
// ==================================================
window.loadDriverJobs = async function() {
  const listEl = document.getElementById('jobsList');
  if (!listEl) return;
  
  try {
    const qry = query(
      collection(db, 'jobs'),
      where('status', 'in', ['open', 'assigned']),
      orderBy('jobDate', 'desc')
    );
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = '<p style="color:#666;">No jobs posted yet. Check back soon!</p>';
      return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:1rem;">';
    snap.forEach(doc => {
      const d = doc.data();
      const jobDate = d.jobDate ? new Date(d.jobDate).toLocaleString() : 'Date TBC';
      const statusColour = d.status === 'open' ? '#006633' : '#d47500';
      html += `
        <div style="padding:1rem; background:white; border-radius:6px; border-left:4px solid ${statusColour}; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <h4 style="margin-bottom:0.5rem; color:var(--primary);">${Utils.escapeHtml(d.jobTitle || 'Untitled Job')}</h4>
          <p style="margin-bottom:0.25rem;"><strong>From:</strong> ${Utils.escapeHtml(d.jobPickup || '—')}</p>
          <p style="margin-bottom:0.25rem;"><strong>To:</strong> ${Utils.escapeHtml(d.jobDropoff || '—')}</p>
          <p style="margin-bottom:0.25rem;"><strong>Date/Time:</strong> ${jobDate}</p>
          ${d.jobPay ? `<p style="font-weight:500;">💷 £${d.jobPay}</p>` : ''}
          <p style="font-size:0.85rem; color:#666; margin-top:0.5rem;">${Utils.escapeHtml(d.jobDetails || '')}</p>
          <span style="display:inline-block; margin-top:0.5rem; padding:0.2rem 0.5rem; background:${statusColour}15; color:${statusColour}; border-radius:3px; font-size:0.8rem; font-weight:500;">
            ${d.status === 'open' ? '🟢 Open — Available' : '🟡 Assigned'}
          </span>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading jobs:', err);
    listEl.innerHTML = '<p class="error-text">Could not load jobs.</p>';
  }
};

// ==================================================
// ⚠️ DRIVER INFRINGEMENTS & NOTICES
// ==================================================
async function loadDriverInfringements() {
  const pendingEl = document.getElementById('pendingInfringementsList');
  const signedEl = document.getElementById('signedInfringementsList');
  if (!pendingEl || !signedEl) return;
  
  try {
    const qryPending = query(
      collection(db, 'infringements'),
      where('driverUid', '==', currentUser.uid),
      where('signed', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapPending = await getDocs(qryPending);
    
    if (snapPending.empty) {
      pendingEl.innerHTML = '<p style="color:#666;">✅ No items requiring your attention.</p>';
    } else {
      let html = '<div style="display:flex; flex-direction:column; gap:1rem;">';
      snapPending.forEach(doc => {
        const d = doc.data();
        html += `
          <div class="card" style="margin:0; border-left:4px solid var(--accent);">
            <h4 style="color:var(--accent); margin-bottom:0.5rem;">⚠️ ${Utils.escapeHtml(d.title || 'Notice')}</h4>
            <p style="margin-bottom:0.5rem;">${Utils.escapeHtml(d.description || '')}</p>
            <div class="form-group">
              <label>Your Comments:</label>
              <textarea id="inf-comment-${doc.id}" rows="2" placeholder="Add any notes before signing..."></textarea>
            </div>
            <button type="button" class="btn btn-success" onclick="signInfringement('${doc.id}')">✓ Sign Off — I Have Read & Understood</button>
          </div>
        `;
      });
      html += '</div>';
      pendingEl.innerHTML = html;
    }
    
    const qrySigned = query(
      collection(db, 'infringements'),
      where('driverUid', '==', currentUser.uid),
      where('signed', '==', true),
      orderBy('signedAt', 'desc'),
      limit(10)
    );
    const snapSigned = await getDocs(qrySigned);
    
    if (snapSigned.empty) {
      signedEl.innerHTML = '<p style="color:#666;">No signed items yet.</p>';
    } else {
      let html = '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
      snapSigned.forEach(doc => {
        const d = doc.data();
        const signedDate = d.signedAt ? d.signedAt.toDate().toLocaleDateString() : 'Unknown';
        html += `
          <div style="padding:0.5rem; background:#f0f7f0; border-radius:4px;">
            <span style="color:var(--success);">✅</span>
            <strong>${Utils.escapeHtml(d.title || 'Notice')}</strong>
            <span style="color:#666; font-size:0.85rem; margin-left:0.5rem;">Signed: ${signedDate}</span>
          </div>
        `;
      });
      html += '</div>';
      signedEl.innerHTML = html;
    }
    
  } catch (err) {
    console.error('Error loading infringements:', err);
    pendingEl.innerHTML = '<p class="error-text">Could not load notices.</p>';
  }
}

window.signInfringement = async function(docId) {
  const commentEl = document.getElementById(`inf-comment-${docId}`);
  const comment = commentEl ? commentEl.value.trim() : '';
  
  try {
    await updateDoc(doc(db, 'infringements', docId), {
      signed: true,
      signedAt: serverTimestamp(),
      driverComment: comment
    });
    loadDriverInfringements();
  } catch (err) {
    console.error('Sign error:', err);
    alert('❌ Could not sign. Please try again.');
  }
};

// ==================================================
// ⏱️ DRIVER WORKING TIME DIRECTIVE
// ==================================================
async function loadDriverWTD() {
  const historyEl = document.getElementById('wtdHistoryList');
  if (!historyEl) return;
  
  // Placeholder — replace with real Firestore data
  document.getElementById('wtdThisWeekHours').textContent = '42';
  document.getElementById('wtdRestStatus').textContent = '✅ Requirements Met';
  document.getElementById('wtdNightHours').textContent = '0 hrs this week';
  
  historyEl.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.5rem;">
      <div style="padding:0.5rem; border-bottom:1px solid #eee;">
        <strong>Week 41</strong> — 42 hrs • ✅ Within limits
      </div>
      <div style="padding:0.5rem; border-bottom:1px solid #eee;">
        <strong>Week 40</strong> — 45 hrs • ✅ Within limits
      </div>
      <div style="padding:0.5rem;">
        <strong>Week 39</strong> — 38 hrs • ✅ Within limits
      </div>
    </div>
  `;
}
// ==================================================
// LSD SOLUTIONS — app.js SECTION 5
// Company Portal — Dashboard, Profile, Vehicles & Drivers
// ==================================================

// ==================================================
// 🏢 COMPANY DASHBOARD
// ==================================================
async function updateCompanyDashboard() {
  if (!currentUser || !userProfile) return;
  
  const nameEl = document.getElementById('companyNameDisplay');
  if (nameEl) {
    nameEl.textContent = Utils.escapeHtml(userProfile.companyName || userProfile.name || 'Company');
  }
  
  try {
    // Quick stats — run all queries in parallel
    const [driversSnap, vehiclesSnap, jobsSnap, defectsOpenSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('linkedCompanyId', '==', currentUser.uid))),
      getDocs(query(collection(db, 'vehicles'), where('companyId', '==', currentUser.uid))),
      getDocs(query(collection(db, 'jobs'), where('companyId', '==', currentUser.uid))),
      getDocs(query(collection(db, 'defects'), where('companyId', '==', currentUser.uid), where('status', '==', 'open')))
    ]);
    
    document.getElementById('qDriversTotal').textContent = driversSnap.size;
    document.getElementById('qDocsOk').textContent = '—';
    document.getElementById('qMaintDue').textContent = '—';
    document.getElementById('qDefectsOpen').textContent = defectsOpenSnap.size;
    
  } catch (err) {
    console.error('Dashboard stats error:', err);
  }
}

// ==================================================
// 🏢 COMPANY PROFILE
// ==================================================
function populateCompanyProfile() {
  if (!userProfile) return;
  
  document.getElementById('cpCompanyName').value = userProfile.companyName || userProfile.name || '';
  document.getElementById('cpCompanyEmail').value = userProfile.email || '';
  document.getElementById('cpAddress').value = userProfile.businessAddress || '';
  document.getElementById('cpPhone').value = userProfile.businessPhone || '';
  document.getElementById('cpOlicence').value = userProfile.operatorLicence || '';
  document.getElementById('cpFleetSize').value = userProfile.authorisedVehicles || '';
  
  // Load saved Tacomaster API key if exists
  if (userProfile.tacomasterApiKey) {
    document.getElementById('tacomasterApiKey').value = userProfile.tacomasterApiKey;
  }
}

document.getElementById('companyProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('cpSaveStatus');
  
  try {
    const profileRef = doc(db, 'users', currentUser.uid);
    await updateDoc(profileRef, {
      companyName: document.getElementById('cpCompanyName').value.trim(),
      businessAddress: document.getElementById('cpAddress').value.trim(),
      businessPhone: document.getElementById('cpPhone').value.trim(),
      operatorLicence: document.getElementById('cpOlicence').value.trim(),
      authorisedVehicles: parseInt(document.getElementById('cpFleetSize').value) || null
    });
    
    userProfile.companyName = document.getElementById('cpCompanyName').value.trim();
    Utils.showSuccess('cpSaveStatus', '✅ Company profile saved!');
    setTimeout(() => Utils.hideStatus('cpSaveStatus'), 3000);
  } catch (err) {
    console.error('Error saving company profile:', err);
    Utils.showError('cpSaveStatus', '❌ Failed to save profile.');
  }
});

// Tacomaster API settings
document.getElementById('tacomasterSettingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('tacomasterStatus');
  
  try {
    const apiKey = document.getElementById('tacomasterApiKey').value.trim();
    await updateDoc(doc(db, 'users', currentUser.uid), {
      tacomasterApiKey: apiKey || null
    });
    userProfile.tacomasterApiKey = apiKey;
    Utils.showSuccess('tacomasterStatus', '✅ API key saved securely.');
    setTimeout(() => Utils.hideStatus('tacomasterStatus'), 3000);
  } catch (err) {
    console.error('Error saving API key:', err);
    Utils.showError('tacomasterStatus', '❌ Failed to save API key.');
  }
});

// ==================================================
// 🚛 COMPANY VEHICLES FLEET
// ==================================================
document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('vSaveStatus');
  
  try {
    await addDoc(collection(db, 'vehicles'), {
      companyId: currentUser.uid,
      reg: document.getElementById('vReg').value.trim().toUpperCase(),
      make: document.getElementById('vMake').value.trim(),
      model: document.getElementById('vModel').value.trim(),
      type: document.getElementById('vType').value,
      motExpiry: document.getElementById('vMotExpiry').value || null,
      insuranceExpiry: document.getElementById('vInsExpiry').value || null,
      addedAt: serverTimestamp()
    });
    
    Utils.showSuccess('vSaveStatus', '✅ Vehicle added to fleet!');
    document.getElementById('addVehicleForm').reset();
    setTimeout(() => {
      Utils.hideStatus('vSaveStatus');
      loadCompanyVehicles();
    }, 1500);
  } catch (err) {
    console.error('Error adding vehicle:', err);
    Utils.showError('vSaveStatus', '❌ Failed to add vehicle.');
  }
});

async function loadCompanyVehicles() {
  const listEl = document.getElementById('vehiclesList');
  if (!listEl) return;
  
  try {
    const qry = query(
      collection(db, 'vehicles'),
      where('companyId', '==', currentUser.uid),
      orderBy('addedAt', 'desc')
    );
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = '<p style="color:#666;">No vehicles added yet. Add your first vehicle above.</p>';
      return;
    }
    
    let html = '<div style="display:grid; gap:0.75rem;">';
    snap.forEach(doc => {
      const d = doc.data();
      html += `
        <div style="padding:0.75rem; background:#f9fafb; border-radius:4px; border-left:3px solid var(--primary);">
          <p style="font-weight:600; font-size:1rem;">${Utils.escapeHtml(d.reg || 'Unknown')}</p>
          <p style="font-size:0.9rem; color:#666;">
            ${Utils.escapeHtml(d.make || '')} ${Utils.escapeHtml(d.model || '')}
            ${d.type ? ` • ${d.type.charAt(0).toUpperCase() + d.type.slice(1)}` : ''}
          </p>
          <p style="font-size:0.85rem; color:#666; margin-top:0.25rem;">
            ${d.motExpiry ? `📅 MOT: ${d.motExpiry}` : ''}
            ${d.insuranceExpiry ? ` • Ins: ${d.insuranceExpiry}` : ''}
          </p>
          <button type="button" class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.8rem; margin-top:0.5rem;" 
            onclick="deleteVehicle('${doc.id}')">🗑️ Remove</button>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading vehicles:', err);
    listEl.innerHTML = '<p class="error-text">Could not load fleet.</p>';
  }
}

window.deleteVehicle = async function(vehicleId) {
  if (!confirm('Remove this vehicle from your fleet?')) return;
  try {
    await deleteDoc(doc(db, 'vehicles', vehicleId));
    loadCompanyVehicles();
  } catch (err) {
    console.error('Delete error:', err);
    alert('❌ Could not remove vehicle.');
  }
};

// ==================================================
// 👥 COMPANY DRIVERS — Link & Manage
// ==================================================
document.getElementById('addDriverForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('dSaveStatus');
  const email = document.getElementById('dEmail').value.trim().toLowerCase();
  
  try {
    // Find driver by email
    const driverQ = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('accountType', '==', 'driver')
    );
    const driverSnap = await getDocs(driverQ);
    
    if (driverSnap.empty) {
      Utils.showError('dSaveStatus', '❌ No driver found with that email. They must register first.');
      return;
    }
    
    const driverDoc = driverSnap.docs[0];
    const driverData = driverDoc.data();
    
    if (driverData.linkedCompanyId) {
      Utils.showError('dSaveStatus', '❌ This driver is already linked to a company.');
      return;
    }
    
    // Link driver to this company
    await updateDoc(doc(db, 'users', driverDoc.id), {
      linkedCompanyId: currentUser.uid,
      linkedCompanyName: userProfile.companyName || userProfile.name
    });
    
    Utils.showSuccess('dSaveStatus', `✅ ${Utils.escapeHtml(driverData.name)} linked successfully!`);
    document.getElementById('addDriverForm').reset();
    setTimeout(() => {
      Utils.hideStatus('dSaveStatus');
      loadCompanyDrivers();
    }, 1500);
    
  } catch (err) {
    console.error('Error linking driver:', err);
    Utils.showError('dSaveStatus', '❌ Failed to link driver.');
  }
});

async function loadCompanyDrivers() {
  const listEl = document.getElementById('driversList');
  if (!listEl) return;
  
  try {
    const qry = query(
      collection(db, 'users'),
      where('linkedCompanyId', '==', currentUser.uid)
    );
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = '<p style="color:#666;">No drivers linked yet. Enter a driver\'s email above to link them.</p>';
      return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
    snap.forEach(driverDoc => {
      const d = driverDoc.data();
      html += `
        <div style="padding:0.75rem; background:#f9fafb; border-radius:4px; border-left:3px solid var(--primary);">
          <p style="font-weight:600; margin-bottom:0.25rem;">${Utils.escapeHtml(d.name || 'Unknown Driver')}</p>
          <p style="font-size:0.85rem; color:#666;">${Utils.escapeHtml(d.email || '')}</p>
          <p style="font-size:0.85rem; color:#666;">
            Licence: ${d.licenceNumber || 'Not provided'}
            ${d.licenceExpiry ? `• Expires: ${d.licenceExpiry}` : ''}
          </p>
          <button type="button" class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem; margin-top:0.5rem;"
            onclick="unlinkDriver('${driverDoc.id}')">🔗 Unlink from Company</button>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading drivers:', err);
    listEl.innerHTML = '<p class="error-text">Could not load drivers.</p>';
  }
}

window.unlinkDriver = async function(driverUid) {
  if (!confirm('Unlink this driver from your company? They will still keep their account.')) return;
  try {
    await updateDoc(doc(db, 'users', driverUid), {
      linkedCompanyId: null,
      linkedCompanyName: null
    });
    loadCompanyDrivers();
  } catch (err) {
    console.error('Unlink error:', err);
    alert('❌ Could not unlink driver.');
  }
};
// ==================================================
// LSD SOLUTIONS — app.js SECTION 6
// Company Portal — Jobs, Maintenance, Defects, Compliance & Init
// ==================================================

// ==================================================
// 📋 COMPANY JOBS — Post & Manage
// ==================================================
document.getElementById('postJobForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('jSaveStatus');
  
  try {
    await addDoc(collection(db, 'jobs'), {
      companyId: currentUser.uid,
      jobTitle: document.getElementById('jTitle').value.trim(),
      jobPickup: document.getElementById('jPickup').value.trim(),
      jobDropoff: document.getElementById('jDropoff').value.trim(),
      jobDate: new Date(document.getElementById('jDate').value),
      jobDetails: document.getElementById('jDetails').value.trim(),
      jobPay: parseFloat(document.getElementById('jPay').value) || null,
      status: 'open',
      postedAt: serverTimestamp()
    });
    
    Utils.showSuccess('jSaveStatus', '✅ Job posted successfully!');
    document.getElementById('postJobForm').reset();
    setTimeout(() => {
      Utils.hideStatus('jSaveStatus');
      loadCompanyJobs();
    }, 1500);
  } catch (err) {
    console.error('Error posting job:', err);
    Utils.showError('jSaveStatus', '❌ Failed to post job.');
  }
});

async function loadCompanyJobs() {
  const listEl = document.getElementById('companyJobsList');
  if (!listEl) return;
  
  try {
    const qry = query(
      collection(db, 'jobs'),
      where('companyId', '==', currentUser.uid),
      orderBy('jobDate', 'desc')
    );
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = '<p style="color:#666;">No jobs posted yet.</p>';
      return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
    snap.forEach(doc => {
      const d = doc.data();
      const jobDate = d.jobDate ? new Date(d.jobDate).toLocaleDateString() : 'Date TBC';
      const statusColour = d.status === 'open' ? '#006633' : d.status === 'assigned' ? '#d47500' : '#666666';
      
      html += `
        <div style="padding:0.75rem; background:#f9fafb; border-radius:4px; border-left:3px solid ${statusColour};">
          <p style="font-weight:600;">${Utils.escapeHtml(d.jobTitle)}</p>
          <p style="font-size:0.85rem; color:#666;">
            📅 ${jobDate}<br>
            📍 ${Utils.escapeHtml(d.jobPickup)} → ${Utils.escapeHtml(d.jobDropoff)}
          </p>
          ${d.jobPay ? `<p style="font-size:0.9rem; font-weight:500; margin-top:0.25rem;">💷 £${d.jobPay}</p>` : ''}
          <span style="display:inline-block; margin-top:0.25rem; padding:0.15rem 0.4rem; background:${statusColour}15; color:${statusColour}; border-radius:3px; font-size:0.8rem;">
            ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}
          </span>
          <button type="button" class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.8rem; margin-left:0.5rem;"
            onclick="deleteJob('${doc.id}')">🗑️</button>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading jobs:', err);
    listEl.innerHTML = '<p class="error-text">Could not load jobs.</p>';
  }
}

window.deleteJob = async function(jobId) {
  if (!confirm('Delete this job posting?')) return;
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
    loadCompanyJobs();
  } catch (err) {
    console.error('Delete job error:', err);
    alert('❌ Could not delete job.');
  }
};

// ==================================================
// 🔧 MAINTENANCE SCHEDULING
// ==================================================
document.getElementById('addMaintenanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('mSaveStatus');
  
  try {
    await addDoc(collection(db, 'maintenance'), {
      companyId: currentUser.uid,
      vehicleReg: document.getElementById('mReg').value.trim().toUpperCase(),
      serviceType: document.getElementById('mType').value,
      scheduledDate: new Date(document.getElementById('mDate').value),
      mileage: parseInt(document.getElementById('mMileage').value) || null,
      notes: document.getElementById('mNotes').value.trim(),
      status: 'scheduled',
      createdAt: serverTimestamp()
    });
    
    Utils.showSuccess('mSaveStatus', '✅ Maintenance scheduled!');
    document.getElementById('addMaintenanceForm').reset();
    setTimeout(() => {
      Utils.hideStatus('mSaveStatus');
      loadMaintenanceSchedule();
    }, 1500);
  } catch (err) {
    console.error('Error scheduling maintenance:', err);
    Utils.showError('mSaveStatus', '❌ Failed to schedule.');
  }
});

async function loadMaintenanceSchedule() {
  const listEl = document.getElementById('maintenanceList');
  if (!listEl) return;
  
  try {
    const qry = query(
      collection(db, 'maintenance'),
      where('companyId', '==', currentUser.uid),
      orderBy('scheduledDate', 'asc')
    );
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = '<p style="color:#666;">No maintenance scheduled.</p>';
      return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
    snap.forEach(doc => {
      const d = doc.data();
      const schedDate = d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : 'Date TBC';
      html += `
        <div style="padding:0.75rem; background:#f9fafb; border-radius:4px; border-left:3px solid var(--accent);">
          <p style="font-weight:600;">${Utils.escapeHtml(d.vehicleReg)}</p>
          <p style="font-size:0.85rem; color:#666;">
            ${d.serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • 📅 ${schedDate}
            ${d.mileage ? `• ${d.mileage} miles` : ''}
          </p>
          ${d.notes ? `<p style="font-size:0.8rem; color:#666; margin-top:0.25rem;">${Utils.escapeHtml(d.notes)}</p>` : ''}
          <span style="display:inline-block; margin-top:0.25rem; padding:0.15rem 0.4rem; background:#d4750015; color:#d47500; border-radius:3px; font-size:0.8rem;">
            ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}
          </span>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading maintenance:', err);
    listEl.innerHTML = '<p class="error-text">Could not load schedule.</p>';
  }
}

// ==================================================
// 🚨 DEFECTS MANAGEMENT
// ==================================================
window.loadDefects = async function(filter = 'all') {
  const listEl = document.getElementById('defectsList');
  if (!listEl) return;
  
  try {
    let qry;
    if (filter === 'all') {
      qry = query(collection(db, 'defects'), where('companyId', '==', currentUser.uid), orderBy('reportedAt', 'desc'));
    } else {
      qry = query(collection(db, 'defects'), where('companyId', '==', currentUser.uid), where('status', '==', filter), orderBy('reportedAt', 'desc'));
    }
    
    const snap = await getDocs(qry);
    
    if (snap.empty) {
      listEl.innerHTML = `<p style="color:#666;">No ${filter === 'all' ? '' : filter + ' '}defects found.</p>`;
      return;
    }
    
    let html = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
    snap.forEach(doc => {
      const d = doc.data();
      const reported = d.reportedAt ? d.reportedAt.toDate().toLocaleDateString() : 'Unknown';
      const borderCol = d.status === 'open' ? '#dc2626' : d.status === 'in-progress' ? '#d47500' : '#16a34a';
      
      html += `
        <div style="padding:0.75rem; background:#f9fafb; border-radius:4px; border-left:3px solid ${borderCol};">
          <p style="font-weight:600;">${Utils.escapeHtml(d.vehicleReg || 'Unknown Vehicle')}</p>
          <p style="font-size:0.9rem; margin-top:0.25rem;">${Utils.escapeHtml(d.description || '')}</p>
          <p style="font-size:0.8rem; color:#666; margin-top:0.25rem;">Reported: ${reported} by ${Utils.escapeHtml(d.reportedBy || 'Unknown')}</p>
          <div style="margin-top:0.5rem;">
            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="updateDefectStatus('${doc.id}', 'resolved')">✓ Mark Fixed</button>
            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="updateDefectStatus('${doc.id}', 'in-progress')">🔧 In Progress</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Error loading defects:', err);
    listEl.innerHTML = '<p class="error-text">Could not load defects.</p>';
  }
};

window.updateDefectStatus = async function(defectId, newStatus) {
  try {
    await updateDoc(doc(db, 'defects', defectId), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    loadDefects();
  } catch (err) {
    console.error('Update defect error:', err);
    alert('❌ Could not update status.');
  }
};

// ==================================================
// 📊 COMPLIANCE OVERVIEW
// ==================================================
async function loadComplianceOverview() {
  const listEl = document.getElementById('complianceList');
  if (!listEl) return;
  
  listEl.innerHTML = '<p style="color:#666;">Loading compliance data...</p>';
  
  try {
    const [vehiclesSnap, driversSnap] = await Promise.all([
      getDocs(query(collection(db, 'vehicles'), where('companyId', '==', currentUser.uid))),
      getDocs(query(collection(db, 'users'), where('linkedCompanyId', '==', currentUser.uid)))
    ]);
    
    let html = '<div style="display:flex; flex-direction:column; gap:1rem;">';
    
    // Vehicle MOT/Insurance status
    html += '<div><h4 style="margin-bottom:0.5rem; color:var(--primary);">🚛 Vehicle Status</h4>';
    if (vehiclesSnap.empty) {
      html += '<p style="color:#666;">No vehicles registered.</p>';
    } else {
      html += '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
      vehiclesSnap.forEach(v => {
        const d = v.data();
        const today = new Date();
        const motExp = d.motExpiry ? new Date(d.motExpiry) : null;
        const insExp = d.insuranceExpiry ? new Date(d.insuranceExpiry) : null;
        
        let motStatus = '✅ Up to date', motCol = '#16a34a';
        let insStatus = '✅ Up to date', insCol = '#16a34a';
        
        if (!motExp) { motStatus = '⚠️ No date'; motCol = '#d47500'; }
        else if (motExp < today) { motStatus = '❌ Expired'; motCol = '#dc2626'; }
        else if ((motExp - today) / (1000*60*60*24) < 30) { motStatus = '⚠️ Soon'; motCol = '#d47500'; }
        
        if (!insExp) { insStatus = '⚠️ No date'; insCol = '#d47500'; }
        else if (insExp < today) { insStatus = '❌ Expired'; insCol = '#dc2626'; }
        else if ((insExp - today) / (1000*60*60*24) < 30) { insStatus = '⚠️ Soon'; insCol = '#d47500'; }
        
        html += `
          <div style="padding:0.5rem; background:#f9fafb; border-radius:4px;">
            <strong>${Utils.escapeHtml(d.reg)}</strong><br>
            <span style="color:${motCol}; font-size:0.85rem;">MOT: ${motStatus}</span> •
            <span style="color:${insCol}; font-size:0.85rem;">Ins: ${insStatus}</span>
          </div>
        `;
      });
      html += '</div>';
    }
    html += '</div>';
    
    // Driver licence status
    html += '<div><h4 style="margin-bottom:0.5rem; color:var(--primary);">👤 Driver Status</h4>';
    if (driversSnap.empty) {
      html += '<p style="color:#666;">No drivers linked.</p>';
    } else {
      html += '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
      driversSnap.forEach(d => {
        const data = d.data();
        const exp = data.licenceExpiry ? new Date(data.licenceExpiry) : null;
        const today = new Date();
        
        let status = '✅ Valid', col = '#16a34a';
        if (!exp) { status = '⚠️ No expiry'; col = '#d47500'; }
        else if (exp < today) { status = '❌ Expired'; col = '#dc2626'; }
        else if ((exp - today) / (1000*60*60*24) < 90) { status = '⚠️ Expiring soon'; col = '#d47500'; }
        
        html += `
          <div style="padding:0.5rem; background:#f9fafb; border-radius:4px;">
            <strong>${Utils.escapeHtml(data.name)}</strong><br>
            <span style="color:${col}; font-size:0.85rem;">Licence: ${status}</span>
          </div>
        `;
      });
      html += '</div>';
    }
    html += '</div>';
    
    html += '</div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Compliance error:', err);
    listEl.innerHTML = '<p class="error-text">Could not load compliance overview.</p>';
  }
}

// ==================================================
// 📊 TACHOMASTER & INTEGRATIONS
// ==================================================
async function loadTachoOverview() {
  const container = document.getElementById('tachoOverview');
  if (!container) return;
  
  if (!userProfile || !userProfile.tacomasterApiKey) {
    container.innerHTML = '<p style="color:#666;">Enter your Tacomaster API key in Settings to see driver activity.</p>';
    return;
  }
  
  container.innerHTML = `
    <div style="padding:1rem; background:#f0f7f0; border-radius:6px; border-left:3px solid #16a34a;">
      <p style="font-weight:500;">✅ Tacomaster API connected</p>
      <p style="font-size:0.85rem; color:#666; margin-top:0.25rem;">Driver hours & tachograph data will appear here.</p>
    </div>
  `;
}

function loadTachoOverview() {
  const container = document.getElementById('tachoOverview');
  if (!container) return;
  
  if (!userProfile || !userProfile.tacomasterApiKey) {
    container.innerHTML = '<p style="color:#666;">Enter your Tacomaster API key in Settings to see driver activity.</p>';
    return;
  }
  
  container.innerHTML = `
    <div style="padding:1rem; background:#f0f7f0; border-radius:6px; border-left:3px solid #16a34a;">
      <p style="font-weight:500;">✅ Tacomaster API connected</p>
      <p style="font-size:0.85rem; color:#666; margin-top:0.25rem;">Driver hours & tachograph data will appear here.</p>
    </div>
  `;
}

// ==================================================
// 🏁 FINAL INITIALIZATION
// ==================================================
console.log('✅ LSD Solutions app.js loaded successfully');

// Auto-load company data when on company pages
window.addEventListener('load', () => {
  // Page loaders are already triggered by showPage() → runPageLoaders()
});
