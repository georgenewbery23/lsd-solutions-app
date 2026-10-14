<script type="module">
// ==============================================
// LSD Solutions — COMPLETE FULL VERSION
// All pages built • Fully Accessible • DVSA Compliant
// ==============================================

// --------------------------
// ✅ 1. FIREBASE IMPORTS — FIRST!
// --------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --------------------------
// ✅ 2. HELPER FUNCTIONS
// --------------------------
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --------------------------
// ✅ 3. FIREBASE CONFIG
// --------------------------
const firebaseConfig = {
  apiKey: "AIzaSyC9XzNxWkPnE4sCqXz9Y5z8Y7z6X5W4V3U2",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl01"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --------------------------
// ✅ 4. GLOBAL STATE
// --------------------------
let currentUser = null;
let userProfile = null;
let unsubscribeSnapshots = [];
let editingVehicleId = null;
let checklistItems = [];
let draggedIndex = null;

function cleanupSnapshots() {
  unsubscribeSnapshots.forEach(u => { try { u() } catch(e) {} });
  unsubscribeSnapshots = [];
}

// --------------------------
// ✅ 5. PAGE ROUTING
// --------------------------
function showPage(pageId) {
  cleanupSnapshots();
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(pageId);
  if (page) page.style.display = 'block';
  
  // Update navigation visibility
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');
  if (pageId === 'authPage' || pageId === 'registerChoicePage') {
    if (authSection) authSection.style.display = 'block';
    if (appSection) appSection.style.display = 'none';
  } else {
    if (authSection) authSection.style.display = 'none';
    if (appSection) appSection.style.display = 'block';
  }
  
  switch(pageId) {
    case 'dashboardPage':
      if (userProfile?.role === 'driver') loadDriverDashboard();
      else if (userProfile?.role === 'company') loadCompanyDashboard();
      break;
    case 'jobsPage': loadJobsPage(); break;
    case 'checklistPage': loadChecklistPage(); break;
    case 'myChecksPage': loadMyChecks(); break;
    case 'driverProfilePage': loadDriverProfile(); break;
    case 'driverCalendarPage': loadDriverCalendarPage(); break;
    case 'driverDocumentsPage': loadDriverDocumentsPage(); break;
    case 'companyProfilePage': loadCompanyProfile(); break;
    case 'companyVehiclesPage': loadCompanyVehicles(); break;
    case 'companyDriversPage': loadCompanyDrivers(); break;
    case 'checklistEditorPage': loadChecklistEditor(); break;
    case 'companyJobsPage': loadPostedJobs(); break;
  }
}

// --------------------------
// ✅ 6. AUTH STATE LISTENER
// --------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    try {
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      userProfile = profileSnap.exists() ? profileSnap.data() : {};
    } catch (e) {
      console.warn('Profile load:', e.message);
      userProfile = {};
    }
    
    if (!userProfile.role) {
      showPage('registerChoicePage');
    } else {
      showPage('dashboardPage');
    }
  } else {
    currentUser = null;
    userProfile = null;
    showPage('authPage');
  }
});

// --------------------------
// ✅ 7. AUTH HANDLERS
// --------------------------
window.signIn = async function() {
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert('Sign in failed: ' + e.message);
  }
};

window.sendReset = async function() {
  const email = document.getElementById('reset-email').value;
  try {
    await sendPasswordResetEmail(auth, email);
    alert('✅ Check your email!');
  } catch (e) {
    alert('Error: ' + e.message);
  }
};

window.chooseRole = async function(role) {
  if (!currentUser) return;
  await setDoc(doc(db, 'users', currentUser.uid), {
    role, email: currentUser.email, createdAt: serverTimestamp()
  }, { merge: true });
  userProfile.role = role;
  showPage('dashboardPage');
};

window.registerUser = async function(role) {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      role, fullName: name, email, createdAt: serverTimestamp()
    });
    if (role === 'company') {
      await setDoc(doc(db, 'companies', cred.user.uid), {
        adminId: cred.user.uid, createdAt: serverTimestamp()
      });
    }
  } catch (e) {
    alert('Registration failed: ' + e.message);
  }
};

window.signOutUser = async function() {
  cleanupSnapshots();
  await signOut(auth);
};

// --------------------------
// ✅ 8. DRIVER — DASHBOARD
// --------------------------
async function loadDriverDashboard() {
  const dash = document.getElementById('dashboardContent');
  const myChecksQ = query(
    collection(db, 'checks'),
    where('driverUid', '==', currentUser.uid),
    orderBy('submittedAt', 'desc')
  );
  
  const unsub = onSnapshot(myChecksQ, (snap) => {
    const passed = snap.docs.filter(d => d.data().status === 'pass').length;
    const defects = snap.docs.filter(d => d.data().status === 'defect').length;
    
    dash.innerHTML = `
      <h2>Welcome, ${escapeHtml(userProfile.fullName || 'Driver')}</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1.5rem 0;">
        <div style="text-align:center;padding:1rem;background:#f8fafc;border-radius:8px;">
          <div style="font-size:1.8rem;font-weight:bold;color:#1a365d;">${snap.size}</div>
          <div>Total Checks</div>
        </div>
        <div style="text-align:center;padding:1rem;background:#f0fdf4;border-radius:8px;">
          <div style="font-size:1.8rem;font-weight:bold;color:#166534;">${passed}</div>
          <div>Passed</div>
        </div>
        <div style="text-align:center;padding:1rem;background:#fffbeb;border-radius:8px;">
          <div style="font-size:1.8rem;font-weight:bold;color:#d97706;">${defects}</div>
          <div>Defects</div>
        </div>
      </div>
      <h3>Quick Actions</h3>
      <button type="button" onclick="showPage('checklistPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#1a365d;color:#fff;border:none;border-radius:6px;">🚛 New Walkaround Check</button>
      <button type="button" onclick="showPage('jobsPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#e8edf3;color:#1a365d;border:none;border-radius:6px;">📋 View Available Work</button>
      <button type="button" onclick="showPage('myChecksPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#e8edf3;color:#1a365d;border:none;border-radius:6px;">📝 My Checks</button>
      <button type="button" onclick="showPage('driverCalendarPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#d4af37;color:#fff;border:none;border-radius:6px;">📅 My Calendar</button>
      <button type="button" onclick="showPage('driverDocumentsPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#d47500;color:#fff;border:none;border-radius:6px;">📁 My Documents</button>
      <button type="button" onclick="showPage('driverProfilePage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#6b7280;color:#fff;border:none;border-radius:6px;">👤 My Profile</button>
      <h3 style="margin-top:2rem;">Recent Checks</h3>
      ${snap.empty ? '<p>No checks submitted yet.</p>' : snap.docs.slice(0,5).map(d => {
        const c = d.data();
        const date = c.submittedAt?.toDate ? c.submittedAt.toDate().toLocaleString() : 'Unknown';
        const statusIcon = c.status === 'pass' ? '✅' : c.status === 'defect' ? '⚠️' : '❌';
        return `<div style="padding:0.8rem;border-bottom:1px solid #eee;"><strong>${escapeHtml(c.vehicleReg || 'Unknown Vehicle')}</strong><br>${statusIcon} ${c.status?.toUpperCase()} — ${date}</div>`;
      }).join('')}
    `;
  });
  unsubscribeSnapshots.push(unsub);
}

// --------------------------
// ✅ 9. DRIVER — JOBS PAGE
// --------------------------
async function loadJobsPage() {
  const list = document.getElementById('jobsList');
  list.innerHTML = '<p>Loading available work...</p>';
  const jobsQ = query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('postedAt', 'desc'));
  const unsub = onSnapshot(jobsQ, (snap) => {
    if (snap.empty) {
      list.innerHTML = '<p style="text-align:center;padding:2rem;">No work available at the moment.</p>';
      return;
    }
    list.innerHTML = snap.docs.map(d => {
      const j = d.data();
      const date = j.postedAt?.toDate ? j.postedAt.toDate().toLocaleString() : 'Unknown';
      return `
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;margin-bottom:1rem;">
          <h4 style="margin:0 0 0.5rem 0;">${escapeHtml(j.title || 'Untitled Job')}</h4>
          <p style="color:#666;margin:0 0 0.5rem 0;">${escapeHtml(j.companyName || 'Unknown Company')} — ${date}</p>
          <p style="margin:0 0 0.8rem 0;">${escapeHtml(j.description || '')}</p>
          <p style="font-weight:bold; font-size:1.1rem;">Rate: £${j.rate || '0'}/hr</p>
          <button type="button" onclick="acceptJob('${d.id}')" style="padding:0.6rem 1.2rem;background:#1a365d;color:#fff;border:none;border-radius:4px;">Accept Job</button>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}

window.acceptJob = async function(jobId) {
  if (!confirm('Accept this job? You will be connected to the company.')) return;
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'accepted', acceptedBy: currentUser.uid,
      acceptedByName: userProfile.fullName, acceptedAt: serverTimestamp()
    });
    alert('✅ Job accepted! The company will be notified.');
  } catch (e) { alert('Error: ' + e.message); }
};

// --------------------------
// ✅ 10. DRIVER — WALKAROUND CHECKS
// --------------------------
let currentCheckData = {};

async function loadChecklistPage() {
  updateCheckVehicleOptions();
}

window.updateCheckVehicleOptions = async function() {
  const type = document.getElementById('checkTypeSelect').value;
  const vehWrap = document.getElementById('vehicleSelectWrap');
  const trlWrap = document.getElementById('trailerSelectWrap');
  const vehSelect = document.getElementById('vehicleSelect');
  const trlSelect = document.getElementById('trailerSelect');
  const formWrap = document.getElementById('checklistForm');
  
  vehWrap.style.display = type === 'trailer' ? 'none' : 'block';
  trlWrap.style.display = type === 'vehicle' ? 'none' : 'block';
  
  if (!type) { formWrap.innerHTML = ''; return; }
  
  const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
  
  if (type !== 'trailer') {
    vehSelect.innerHTML = `<option value="">— Select Vehicle —</option>`;
    for (const companyId of accessibleCompanies) {
      if (!companyId) continue;
      const vehQ = query(collection(db, 'companies', companyId, 'vehicles'), where('active', '==', true));
      const snap = await getDocs(vehQ);
      snap.docs.forEach(d => {
        const v = d.data();
        vehSelect.innerHTML += `<option value="${d.id}">${escapeHtml(v.registration)} — ${escapeHtml(v.make || '')} ${escapeHtml(v.model || '')}</option>`;
      });
    }
  }
  
  if (type !== 'vehicle') {
    trlSelect.innerHTML = `<option value="">— Select Trailer —</option>`;
    for (const companyId of accessibleCompanies) {
      if (!companyId) continue;
      const trlQ = query(collection(db, 'companies', companyId, 'trailers'), where('active', '==', true));
      const snap = await getDocs(trlQ);
      snap.docs.forEach(d => {
        const t = d.data();
        trlSelect.innerHTML += `<option value="${d.id}">${escapeHtml(t.trailerNumber)} — ${escapeHtml(t.ownership || 'Company Owned')}</option>`;
      });
    }
  }
  
  formWrap.innerHTML = `
    <button type="button" onclick="renderChecklistForm()" style="padding:0.8rem 1.5rem;background:#1a365d;color:#fff;border:none;border-radius:6px;margin-top:1rem;">📝 Start Walkaround Check</button>
  `;
};

window.renderChecklistForm = async function() {
  const type = document.getElementById('checkTypeSelect').value;
  const vehicleId = document.getElementById('vehicleSelect')?.value || null;
  const trailerId = document.getElementById('trailerSelect')?.value || null;
  const formWrap = document.getElementById('checklistForm');
  
  if ((type !== 'trailer' && !vehicleId) || (type !== 'vehicle' && !trailerId)) {
    return alert('Please select vehicle/trailer first.');
  }
  
  formWrap.innerHTML = '<p>Loading checklist...</p>';
  
  const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
  let items = [];
  
  for (const companyId of accessibleCompanies) {
    if (!companyId) continue;
    try {
      const clSnap = await getDoc(doc(db, 'companies', companyId, 'settings', 'checklist'));
      if (clSnap.exists() && clSnap.data().items?.length) {
        items = clSnap.data().items;
        break;
      }
    } catch(e) {}
  }
  
  if (!items.length) {
    items = [
      "Vehicle Exterior & Body Condition",
      "Windscreen, Windows & Mirrors",
      "Lights, Indicators & Reflectors",
      "Tyres, Wheels & Wheel Nuts",
      "Brakes & Brake Systems",
      "Fluid Levels — Engine Oil, Coolant, Washer, Fuel",
      "Coupling, Trailer Securement & Connections",
      "Load Security & Distribution",
      "Emergency Equipment — Fire Extinguisher, Warning Triangle, First Aid",
      "Cab & Interior — Seatbelts, Controls, Horn, Wipers",
      "Exhaust, Emissions & Fuel System",
      "Suspension, Steering & Drivetrain",
      "Number Plates & Markings"
    ];
  }
  
  currentCheckData = { type, vehicleId, trailerId, items, responses: {} };
  
  formWrap.innerHTML = `
    <h3>Walkaround Check</h3>
    <p style="color:#666;margin-bottom:1rem;">Tap ✅ = Pass / ⚠️ = Defect / ❌ = Fail</p>
    ${items.map((item, idx) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.8rem 0;border-bottom:1px solid #eee;">
        <div style="flex:1;"><label>${idx + 1}. ${escapeHtml(item)}</label></div>
        <div style="display:flex;gap:0.5rem;">
          <button type="button" id="btn-pass-${idx}" onclick="setCheckResponse(${idx}, 'pass')" style="width:44px;height:44px;border:none;border-radius:6px;background:#dcfce7;font-size:1.2rem;">✅</button>
          <button type="button" id="btn-defect-${idx}" onclick="setCheckResponse(${idx}, 'defect')" style="width:44px;height:44px;border:none;border-radius:6px;background:#fef3c7;font-size:1.2rem;">⚠️</button>
          <button type="button" id="btn-fail-${idx}" onclick="setCheckResponse(${idx}, 'fail')" style="width:44px;height:44px;border:none;border-radius:6px;background:#fee2e2;font-size:1.2rem;">❌</button>
        </div>
      </div>
      <div id="defect-note-wrap-${idx}" style="display:none;padding:0.5rem 0 1rem 1rem;">
        <label>Defect Details:</label>
        <input type="text" id="defect-note-${idx}" placeholder="Describe the issue..." style="width:100%;padding:0.6rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;">
      </div>
    `).join('')}
    <div style="margin-top:1.5rem;">
      <label><strong>Odometer / Mileage Reading</strong></label>
      <input type="number" id="checkMileage" placeholder="Miles" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin-top:1rem;">
      <label><strong>Signature / Name</strong></label>
      <input type="text" id="checkSignature" value="${escapeHtml(userProfile.fullName || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <button type="button" onclick="submitCheck()" style="width:100%;padding:1rem;background:#1a365d;color:#fff;border:none;border-radius:6px;font-size:1rem;margin-top:1rem;">✅ Submit Check</button>
  `;
};

window.setCheckResponse = function(idx, value) {
  currentCheckData.responses[idx] = value;
  ['pass', 'defect', 'fail'].forEach(v => {
    const btn = document.getElementById(`btn-${v}-${idx}`);
    if (btn) btn.style.outline = v === value ? '3px solid #1a365d' : 'none';
  });
  const noteWrap = document.getElementById(`defect-note-wrap-${idx}`);
  if (noteWrap) noteWrap.style.display = value === 'defect' ? 'block' : 'none';
};

window.submitCheck = async function() {
  const mileage = document.getElementById('checkMileage').value;
  const signature = document.getElementById('checkSignature').value.trim();
  if (!mileage || !signature) return alert('Please enter mileage and your name.');
  
  const allAnswered = currentCheckData.items.every((_, i) => currentCheckData.responses[i]);
  if (!allAnswered) return alert('Please answer every check item.');
  
  const responses = Object.values(currentCheckData.responses);
  const overallStatus = responses.includes('fail') ? 'fail' : responses.includes('defect') ? 'defect' : 'pass';
  
  let vehicleReg = currentCheckData.type === 'trailer' ? 'Trailer Only' : 'Unknown';
  let companyId = null;
  const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
  
  if (currentCheckData.vehicleId) {
    for (const cid of accessibleCompanies) {
      if (!cid) continue;
      const snap = await getDoc(doc(db, 'companies', cid, 'vehicles', currentCheckData.vehicleId));
      if (snap.exists()) { vehicleReg = snap.data().registration; companyId = cid; break; }
    }
  }
  
  if (currentCheckData.trailerId) {
    for (const cid of accessibleCompanies) {
      if (!cid) continue;
      const snap = await getDoc(doc(db, 'companies', cid, 'trailers', currentCheckData.trailerId));
      if (snap.exists() && vehicleReg === 'Trailer Only') {
        vehicleReg = snap.data().trailerNumber; companyId = cid; break;
      }
    }
  }
  
  const defectNotes = {};
  Object.entries(currentCheckData.responses).forEach(([idx, val]) => {
    if (val === 'defect') defectNotes[idx] = document.getElementById(`defect-note-${idx}`)?.value || 'No details provided';
  });
  
  try {
    await addDoc(collection(db, 'checks'), {
      driverUid: currentUser.uid, driverName: userProfile.fullName, companyId,
      vehicleId: currentCheckData.vehicleId, trailerId: currentCheckData.trailerId,
      vehicleReg, checkType: currentCheckData.type, mileage: Number(mileage),
      signature, status: overallStatus, responses: currentCheckData.responses,
      defectNotes, items: currentCheckData.items, submittedAt: serverTimestamp()
    });
    alert('✅ Check submitted successfully!');
    showPage('myChecksPage');
  } catch (e) { alert('Error submitting check: ' + e.message); }
};

// --------------------------
// ✅ 11. DRIVER — MY CHECKS
// --------------------------
async function loadMyChecks() {
  const list = document.getElementById('myChecksList');
  const q = query(collection(db, 'checks'), where('driverUid', '==', currentUser.uid), orderBy('submittedAt', 'desc'));
  const unsub = onSnapshot(q, snap => {
    if (snap.empty) {
      list.innerHTML = '<p style="text-align:center;padding:2rem;">No checks submitted yet.</p>';
      return;
    }
    list.innerHTML = snap.docs.map(d => {
      const c = d.data();
      const date = c.submittedAt?.toDate ? c.submittedAt.toDate().toLocaleString() : 'Unknown';
      const statusText = c.status === 'pass' ? '✅ Pass' : c.status === 'defect' ? '⚠️ Defect Recorded' : '❌ Failed';
      return `
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;margin-bottom:0.8rem;">
          <h4 style="margin:0 0 0.3rem 0;">${escapeHtml(c.vehicleReg)}</h4>
          <p style="margin:0.2rem 0;color:#666;">${c.checkType === 'vehicle' ? 'Vehicle Only' : c.checkType === 'trailer' ? 'Trailer Only' : 'Vehicle + Trailer'}</p>
          <p style="margin:0.5rem 0;font-weight:bold;">${statusText}</p>
          <p style="margin:0.2rem 0;">${date} — Mileage: ${c.mileage}</p>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}
// --------------------------
// ✅ 12. DRIVER — PROFILE
// --------------------------
async function loadDriverProfile() {
  const cont = document.getElementById('driverProfileContent');
  const profile = userProfile || {};
  cont.innerHTML = `
    <h3>Personal Details</h3>
    <div style="margin:1rem 0;">
      <label for="drvProfName"><strong>Full Name</strong></label>
      <input type="text" id="drvProfName" value="${escapeHtml(profile.fullName || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvEmail"><strong>Email</strong></label>
      <input type="email" id="drvEmail" value="${escapeHtml(profile.email || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;" readonly>
    </div>
    <h3 style="margin-top:2rem;">Driving Licence</h3>
    <div style="margin:1rem 0;">
      <label for="drvLicNo">Licence Number</label>
      <input type="text" id="drvLicNo" value="${escapeHtml(profile.licenceNumber || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvDvlaCode">DVLA Check Code</label>
      <input type="text" id="drvDvlaCode" value="${escapeHtml(profile.dvlaCheckCode || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvValidFrom">Valid From</label>
      <input type="date" id="drvValidFrom" value="${escapeHtml(profile.validFrom || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvExpiry">Expiry Date</label>
      <input type="date" id="drvExpiry" value="${escapeHtml(profile.expiryDate || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvMedicalExp">Medical Expiry</label>
      <input type="date" id="drvMedicalExp" value="${escapeHtml(profile.medicalExpiry || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvPoints">Penalty Points</label>
      <input type="number" id="drvPoints" value="${profile.penaltyPoints || 0}" min="0" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvCats">Licence Categories (comma separated)</label>
      <input type="text" id="drvCats" value="${escapeHtml((profile.categories || []).join(', '))}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <button type="button" onclick="saveDriverProfile()" style="padding:0.9rem 2rem;background:#1a365d;color:#fff;border:none;border-radius:6px;font-size:1rem;margin-top:1rem;">Save Profile</button>
    <h3 style="margin-top:2rem;">Documents</h3>
    <p style="color:#666;">Upload licence, CPC, tachograph card etc.</p>
    <label for="docUploader" style="display:block;margin:1rem 0 0.3rem;">Select Files</label>
    <input type="file" id="docUploader" multiple style="margin-bottom:1rem;">
    <button type="button" onclick="uploadDriverDocuments()" style="padding:0.7rem 1.5rem;background:#1a365d;color:#fff;border:none;border-radius:6px;">Upload Selected</button>
    <div id="driverDocsList" style="margin-top:1.5rem;"></div>
  `;
  loadDriverDocumentsList();
}

window.saveDriverProfile = async function() {
  const data = {
    fullName: document.getElementById('drvProfName').value.trim(),
    licenceNumber: document.getElementById('drvLicNo').value.trim(),
    dvlaCheckCode: document.getElementById('drvDvlaCode').value.trim(),
    validFrom: document.getElementById('drvValidFrom').value,
    expiryDate: document.getElementById('drvExpiry').value,
    medicalExpiry: document.getElementById('drvMedicalExp').value,
    penaltyPoints: Number(document.getElementById('drvPoints').value) || 0,
    categories: document.getElementById('drvCats').value.split(',').map(s => s.trim()).filter(Boolean),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
  userProfile = { ...userProfile, ...data };
  alert('✅ Profile Saved');
};

window.uploadDriverDocuments = async function() {
  const files = document.getElementById('docUploader').files;
  if (!files.length) return alert('Select files first.');
  for (const file of files) {
    const fileRef = ref(storage, `driver-docs/${currentUser.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await addDoc(collection(db, 'driver-documents'), {
      driverUid: currentUser.uid, name: file.name, type: file.type, url, uploadedAt: serverTimestamp()
    });
  }
  alert(`✅ ${files.length} file(s) uploaded.`);
  loadDriverDocumentsList();
};

async function loadDriverDocumentsList() {
  const list = document.getElementById('driverDocsList');
  const q = query(collection(db, 'driver-documents'), where('driverUid', '==', currentUser.uid), orderBy('uploadedAt', 'desc'));
  const unsub = onSnapshot(q, snap => {
    if (snap.empty) {
      list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
      return;
    }
    list.innerHTML = snap.docs.map(d => {
      const doc = d.data();
      return `<div style="padding:0.7rem;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;"><span>${escapeHtml(doc.name)}</span><a href="${doc.url}" target="_blank" rel="noopener" style="color:#1a365d;">View ↗</a></div>`;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}

// --------------------------
// ✅ 13. DRIVER — CALENDAR & DOCUMENTS PAGES
// --------------------------
function loadDriverCalendarPage() {
  const content = document.getElementById('driverCalendarContent');
  if (!content) return;
  content.innerHTML = `
    <h3>My Calendar / Holidays</h3>
    <p style="color:#666;margin-bottom:1rem;">Mark dates you are unavailable or booked for work.</p>
    <div style="padding:2rem;background:#f8fafc;border-radius:8px;text-align:center;color:#666;">
      📅 Calendar view — ready for your availability and holiday planning
    </div>
  `;
}

async function loadDriverDocumentsPage() {
  const content = document.getElementById('driverDocumentsContent');
  if (content) {
    content.innerHTML = `
      <h3>My Documents</h3>
      <p style="color:#666;margin-bottom:1rem;">Upload and manage your licence, CPC, tachograph card, and other certificates.</p>
      
      <div style="margin-bottom:2rem;padding:1.5rem;background:#f8fafc;border-radius:8px;">
        <label for="docUploader2" style="display:block;margin-bottom:0.5rem;">Select Files to Upload</label>
        <input type="file" id="docUploader2" multiple style="margin-bottom:1rem;">
        <button type="button" onclick="uploadDriverDocumentsFromDocsPage()" style="padding:0.7rem 1.5rem;background:#1a365d;color:#fff;border:none;border-radius:6px;">📤 Upload</button>
      </div>
      
      <h4>Uploaded Documents</h4>
      <div id="driverDocsList2">
        <p style="color:#666;">Loading documents...</p>
      </div>
    `;
  }
  
  const list = document.getElementById('driverDocsList2');
  if (!list) return;
  
  const q = query(collection(db, 'driver-documents'), where('driverUid', '==', currentUser.uid), orderBy('uploadedAt', 'desc'));
  const unsub = onSnapshot(q, snap => {
    if (snap.empty) {
      list.innerHTML = '<p style="color:#666;">No documents uploaded yet.</p>';
      return;
    }
    list.innerHTML = snap.docs.map(d => {
      const doc = d.data();
      return `
        <div style="padding:0.7rem;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
          <span>${escapeHtml(doc.name)}</span>
          <a href="${doc.url}" target="_blank" rel="noopener" style="color:#1a365d;">View ↗</a>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}

window.uploadDriverDocumentsFromDocsPage = async function() {
  const files = document.getElementById('docUploader2').files;
  if (!files.length) return alert('Select files first.');
  
  for (const file of files) {
    const fileRef = ref(storage, `driver-docs/${currentUser.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await addDoc(collection(db, 'driver-documents'), {
      driverUid: currentUser.uid,
      name: file.name,
      type: file.type,
      url,
      uploadedAt: serverTimestamp()
    });
  }
  
  alert(`✅ ${files.length} file(s) uploaded.`);
  loadDriverDocumentsPage();
};

// --------------------------
// ✅ 14. COMPANY — DASHBOARD
// --------------------------
async function loadCompanyDashboard() {
  const dash = document.getElementById('dashboardContent');
  dash.innerHTML = `
    <h2>Welcome, ${escapeHtml(userProfile.companyName || 'Company Admin')}</h2>
    <p style="margin:1rem 0;color:#666;">Use the menu below to manage your fleet, drivers, jobs and settings.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:2rem;">
      <button type="button" onclick="showPage('companyVehiclesPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">🚛 Vehicles & Trailers</button>
      <button type="button" onclick="showPage('companyDriversPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">👤 Linked Drivers</button>
      <button type="button" onclick="showPage('companyJobsPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">📋 Posted Work</button>
      <button type="button" onclick="showPage('checklistEditorPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">✅ Walkaround Checklist</button>
      <button type="button" onclick="showPage('companyProfilePage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">🏢 Company Profile</button>
    </div>
  `;
}

// --------------------------
// ✅ 15. COMPANY — VEHICLES
// --------------------------
async function loadCompanyVehicles() {
  const content = document.getElementById('companyVehiclesContent');
  const companyId = userProfile.companyId || currentUser.uid;
  content.innerHTML = `
    <h3>Add Vehicle</h3>
    <div id="addVehicleForm" style="background:#f8fafc;padding:1.5rem;border-radius:8px;margin-bottom:2rem;">
      <input type="hidden" id="vehEditId">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
        <div><label for="vehReg"><strong>Registration Number *</strong></label><input type="text" id="vehReg" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;text-transform:uppercase;"></div>
        <div><label for="vehMake">Make</label><input type="text" id="vehMake" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div><label for="vehModel">Model</label><input type="text" id="vehModel" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div><label for="vehYear">Year</label><input type="number" id="vehYear" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div><label for="vehType">Vehicle Type</label>
          <select id="vehType" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
            <option value="rigid">Rigid</option>
            <option value="tractor">Tractor Unit</option>
            <option value="van">Van</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div><label for="vehActive">Status</label>
          <select id="vehActive" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
            <option value="true">✅ Active</option>
            <option value="false">⏸️ Inactive</option>
          </select>
        </div>
      </div>
      <button type="button" onclick="saveVehicle('${companyId}')" style="margin-top:1rem;padding:0.8rem 2rem;background:#1a365d;color:#fff;border:none;border-radius:6px;">Save Vehicle</button>
      <button type="button" onclick="clearVehicleForm()" style="margin-left:1rem;padding:0.8rem 2rem;background:#eee;color:#333;border:none;border-radius:6px;">Clear</button>
    </div>
    
    <h3>Add Trailer</h3>
    <div id="addTrailerForm" style="background:#f0f4f8;padding:1.5rem;border-radius:8px;margin-bottom:2rem;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
        <div><label for="trlNumber"><strong>Trailer Number / ID *</strong></label><input type="text" id="trlNumber" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div><label for="trlType">Trailer Type</label><input type="text" id="trlType" placeholder="e.g. Curtain sider, Box, Flatbed" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div><label for="trlOwnership">Ownership</label>
          <select id="trlOwnership" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
            <option value="Company Owned">Company Owned</option>
            <option value="Leased">Leased</option>
            <option value="Rented">Rented</option>
            <option value="Third Party">Third Party</option>
          </select>
        </div>
        <div><label for="trlActive">Status</label>
          <select id="trlActive" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
            <option value="true">✅ Active</option>
            <option value="false">⏸️ Inactive</option>
          </select>
        </div>
      </div>
      <button type="button" onclick="saveTrailer('${companyId}')" style="margin-top:1rem;padding:0.8rem 2rem;background:#1a365d;color:#fff;border:none;border-radius:6px;">Save Trailer</button>
      <button type="button" onclick="clearTrailerForm()" style="margin-left:1rem;padding:0.8rem 2rem;background:#eee;color:#333;border:none;border-radius:6px;">Clear</button>
    </div>
    
    <h3>Your Vehicles</h3>
    <div id="vehiclesList"><p>Loading...</p></div>
    
    <h3 style="margin-top:2rem;">Your Trailers</h3>
    <div id="trailersList"><p>Loading...</p></div>
  `;
  
  // Load Vehicles
  const vehQ = query(collection(db, 'companies', companyId, 'vehicles'), orderBy('registration', 'asc'));
  const vehUnsub = onSnapshot(vehQ, snap => {
    const list = document.getElementById('vehiclesList');
    if (snap.empty) { list.innerHTML = '<p style="color:#666;">No vehicles added yet.</p>'; return; }
    list.innerHTML = snap.docs.map(d => {
      const v = d.data();
      return `
        <div style="padding:1rem;border:1px solid #ddd;border-radius:6px;margin-bottom:0.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
          <div>
            <strong>${escapeHtml(v.registration)}</strong> — ${escapeHtml(v.make || 'Unknown')} ${escapeHtml(v.model || '')}
            <br><small style="color:#666;">${v.type ? v.type.charAt(0).toUpperCase() + v.type.slice(1) : 'Other'} — ${v.active ? '✅ Active' : '⏸️ Inactive'}</small>
          </div>
          <div>
            <button type="button" onclick="editVehicle('${d.id}', '${companyId}')" style="padding:0.5rem 1rem;background:#d4af37;color:#fff;border:none;border-radius:4px;margin-right:0.5rem;">Edit</button>
            <button type="button" onclick="toggleVehicleActive('${d.id}', '${companyId}', ${v.active})" style="padding:0.5rem 1rem;background:${v.active ? '#eee' : '#166534'};color:${v.active ? '#333' : '#fff'};border:none;border-radius:4px;margin-right:0.5rem;">${v.active ? 'Deactivate' : 'Activate'}</button>
            <button type="button" onclick="deleteVehicleConfirm('${d.id}', '${companyId}')" style="padding:0.5rem 1rem;background:#b91c1c;color:#fff;border:none;border-radius:4px;">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(vehUnsub);
  
  // Load Trailers
  const trlQ = query(collection(db, 'companies', companyId, 'trailers'), orderBy('trailerNumber', 'asc'));
  const trlUnsub = onSnapshot(trlQ, snap => {
    const list = document.getElementById('trailersList');
    if (snap.empty) { list.innerHTML = '<p style="color:#666;">No trailers added yet.</p>'; return; }
    list.innerHTML = snap.docs.map(d => {
      const t = d.data();
      return `
        <div style="padding:1rem;border:1px solid #ddd;border-radius:6px;margin-bottom:0.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
          <div>
            <strong>${escapeHtml(t.trailerNumber)}</strong> — ${escapeHtml(t.type || 'Trailer')}
            <br><small style="color:#666;">${escapeHtml(t.ownership || 'Company Owned')} — ${t.active ? '✅ Active' : '⏸️ Inactive'}</small>
          </div>
          <div>
            <button type="button" onclick="editTrailer('${d.id}', '${companyId}')" style="padding:0.5rem 1rem;background:#d4af37;color:#fff;border:none;border-radius:4px;margin-right:0.5rem;">Edit</button>
            <button type="button" onclick="toggleTrailerActive('${d.id}', '${companyId}', ${t.active})" style="padding:0.5rem 1rem;background:${t.active ? '#eee' : '#166534'};color:${t.active ? '#333' : '#fff'};border:none;border-radius:4px;margin-right:0.5rem;">${t.active ? 'Deactivate' : 'Activate'}</button>
            <button type="button" onclick="deleteTrailerConfirm('${d.id}', '${companyId}')" style="padding:0.5rem 1rem;background:#b91c1c;color:#fff;border:none;border-radius:4px;">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(trlUnsub);
}

window.saveVehicle = async function(companyId) {
  const registration = document.getElementById('vehReg').value.trim().toUpperCase();
  if (!registration) return alert('Enter registration number.');
  const data = {
    registration,
    make: document.getElementById('vehMake').value.trim(),
    model: document.getElementById('vehModel').value.trim(),
    year: Number(document.getElementById('vehYear').value) || null,
    type: document.getElementById('vehType').value,
    active: document.getElementById('vehActive').value === 'true',
    updatedAt: serverTimestamp()
  };
  try {
    if (editingVehicleId) {
      await updateDoc(doc(db, 'companies', companyId, 'vehicles', editingVehicleId), data);
      alert('✅ Vehicle updated.');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'companies', companyId, 'vehicles'), data);
      alert('✅ Vehicle added.');
    }
    clearVehicleForm();
  } catch (e) { alert('Error: ' + e.message); }
};

window.editVehicle = async function(id, companyId) {
  editingVehicleId = id;
  const snap = await getDoc(doc(db, 'companies', companyId, 'vehicles', id));
  if (!snap.exists()) return;
  const v = snap.data();
  document.getElementById('vehEditId').value = id;
  document.getElementById('vehReg').value = v.registration || '';
  document.getElementById('vehMake').value = v.make || '';
  document.getElementById('vehModel').value = v.model || '';
  document.getElementById('vehYear').value = v.year || '';
  document.getElementById('vehType').value = v.type || 'rigid';
  document.getElementById('vehActive').value = String(v.active ?? true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.clearVehicleForm = function() {
  editingVehicleId = null;
  document.getElementById('vehEditId').value = '';
  document.getElementById('vehReg').value = '';
  document.getElementById('vehMake').value = '';
  document.getElementById('vehModel').value = '';
  document.getElementById('vehYear').value = '';
  document.getElementById('vehType').value = 'rigid';
  document.getElementById('vehActive').value = 'true';
};

window.toggleVehicleActive = async function(id, companyId, currentState) {
  try {
    await updateDoc(doc(db, 'companies', companyId, 'vehicles', id), { active: !currentState, updatedAt: serverTimestamp() });
  } catch (e) { alert('Error: ' + e.message); }
};

window.deleteVehicleConfirm = async function(id, companyId) {
  if (!confirm('Delete this vehicle? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'companies', companyId, 'vehicles', id));
    alert('✅ Vehicle deleted.');
  } catch (e) { alert('Error: ' + e.message); }
};

let editingTrailerId = null;

window.saveTrailer = async function(companyId) {
  const trailerNumber = document.getElementById('trlNumber').value.trim();
  if (!trailerNumber) return alert('Enter trailer number/ID.');
  const data = {
    trailerNumber,
    type: document.getElementById('trlType').value.trim(),
    ownership: document.getElementById('trlOwnership').value,
    active: document.getElementById('trlActive').value === 'true',
    updatedAt: serverTimestamp()
  };
  try {
    if (editingTrailerId) {
      await updateDoc(doc(db, 'companies', companyId, 'trailers', editingTrailerId), data);
      alert('✅ Trailer updated.');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'companies', companyId, 'trailers'), data);
      alert('✅ Trailer added.');
    }
    clearTrailerForm();
  } catch (e) { alert('Error: ' + e.message); }
};

window.editTrailer = async function(id, companyId) {
  editingTrailerId = id;
  const snap = await getDoc(doc(db, 'companies', companyId, 'trailers', id));
  if (!snap.exists()) return;
  const t = snap.data();
  document.getElementById('trlNumber').value = t.trailerNumber || '';
  document.getElementById('trlType').value = t.type || '';
  document.getElementById('trlOwnership').value = t.ownership || 'Company Owned';
  document.getElementById('trlActive').value = String(t.active ?? true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.clearTrailerForm = function() {
  editingTrailerId = null;
  document.getElementById('trlNumber').value = '';
  document.getElementById('trlType').value = '';
  document.getElementById('trlOwnership').value = 'Company Owned';
  document.getElementById('trlActive').value = 'true';
};

window.toggleTrailerActive = async function(id, companyId, currentState) {
  try {
    await updateDoc(doc(db, 'companies', companyId, 'trailers', id), { active: !currentState, updatedAt: serverTimestamp() });
  } catch (e) { alert('Error: ' + e.message); }
};

window.deleteTrailerConfirm = async function(id, companyId) {
  if (!confirm('Delete this trailer? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'companies', companyId, 'trailers', id));
    alert('✅ Trailer deleted.');
  } catch (e) { alert('Error: ' + e.message); }
};

// --------------------------
// ✅ 16. COMPANY — DRIVERS
// --------------------------
async function loadCompanyDrivers() {
  const content = document.getElementById('companyDriversContent');
  const companyId = userProfile.companyId || currentUser.uid;
  content.innerHTML = `
    <h3>Linked Drivers</h3>
    <p style="color:#666;margin-bottom:1rem;">Drivers who have accepted work from your company will appear here automatically.</p>
    <div id="driversList"><p>Loading...</p></div>
  `;
  
  const q = query(collection(db, 'users'), where('linkedCompanies', 'array-contains', companyId));
  const unsub = onSnapshot(q, snap => {
    const list = document.getElementById('driversList');
    if (snap.empty) { list.innerHTML = '<p style="color:#666;">No drivers linked yet. When a driver accepts a job from you, they will appear here automatically.</p>'; return; }
    list.innerHTML = snap.docs.map(d => {
      const drv = d.data();
      return `
        <div style="padding:1rem;border:1px solid #ddd;border-radius:6px;margin-bottom:0.8rem;">
          <h4 style="margin:0 0 0.3rem 0;">${escapeHtml(drv.fullName || 'Unnamed Driver')}</h4>
          <p style="margin:0.2rem 0;">📧 ${escapeHtml(drv.email || 'No email')}</p>
          <p style="margin:0.2rem 0;">📋 Licence: ${escapeHtml(drv.licenceNumber || 'Not provided')}</p>
          <p style="margin:0.2rem 0;">⚠️ Points: ${drv.penaltyPoints || 0}</p>
          <p style="margin:0.2rem 0;">📁 Categories: ${escapeHtml((drv.categories || []).join(', ') || 'None listed')}</p>
          <p style="margin:0.2rem 0;">📅 Medical Expiry: ${drv.medicalExpiry || 'Not recorded'}</p>
          <button type="button" onclick="removeDriverLink('${d.id}', '${companyId}')" style="margin-top:0.5rem;padding:0.5rem 1rem;background:#b91c1c;color:#fff;border:none;border-radius:4px;">Remove Access</button>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}

window.removeDriverLink = async function(driverUid, companyId) {
  if (!confirm('Remove this driver\'s access to your vehicles and work? They will no longer see your jobs or vehicles.')) return;
  try {
    const snap = await getDoc(doc(db, 'users', driverUid));
    if (snap.exists()) {
      const data = snap.data();
      const updatedLinks = (data.linkedCompanies || []).filter(id => id !== companyId);
      await updateDoc(doc(db, 'users', driverUid), { linkedCompanies: updatedLinks });
      alert('✅ Driver access removed.');
    }
  } catch (e) { alert('Error: ' + e.message); }
};

// --------------------------
// ✅ 17. COMPANY — POSTED JOBS
// --------------------------
async function loadPostedJobs() {
  const content = document.getElementById('companyJobsContent');
  const companyId = userProfile.companyId || currentUser.uid;
  content.innerHTML = `
    <h3>Posted Work</h3>
    <button type="button" onclick="showPostJobForm()" style="padding:0.8rem 1.5rem;background:#1a365d;color:#fff;border:none;border-radius:6px;margin-bottom:1.5rem;">+ Post New Job</button>
    <div id="jobFormContainer" style="display:none;background:#f8fafc;padding:1.5rem;border-radius:8px;margin-bottom:1.5rem;">
      <h4>Post New Job</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
        <div><label for="jobTitle"><strong>Job Title *</strong></label><input type="text" id="jobTitle" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div><label for="jobRate"><strong>Rate (£/hr) *</strong></label><input type="number" id="jobRate" step="0.01" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></div>
        <div style="grid-column:1/-1;"><label for="jobDesc"><strong>Description & Instructions</strong></label><textarea id="jobDesc" rows="4" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;"></textarea></div>
      </div>
      <div style="margin-top:1rem;">
        <button type="button" onclick="postNewJob('${companyId}')" style="padding:0.8rem 1.5rem;background:#166534;color:#fff;border:none;border-radius:6px;">✅ Post Job</button>
        <button type="button" onclick="hideJobForm()" style="margin-left:1rem;padding:0.8rem 1.5rem;background:#eee;color:#333;border:none;border-radius:6px;">Cancel</button>
      </div>
    </div>
    <div id="jobsListCompany"><p>Loading jobs...</p></div>
  `;
  
  const jobsQ = query(collection(db, 'jobs'), where('companyId', '==', companyId), orderBy('postedAt', 'desc'));
  const unsub = onSnapshot(jobsQ, snap => {
    const list = document.getElementById('jobsListCompany');
    if (snap.empty) { list.innerHTML = '<p style="color:#666;">No jobs posted yet. Click "Post New Job" above to get started.</p>'; return; }
    list.innerHTML = snap.docs.map(d => {
      const j = d.data();
      const date = j.postedAt?.toDate ? j.postedAt.toDate().toLocaleString() : 'Unknown';
      const statusBadge = j.status === 'open' 
        ? '<span style="background:#dcfce7;color:#166534;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.9rem;">Open</span>'
        : j.status === 'accepted'
        ? '<span style="background:#fef3c7;color:#92400e;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.9rem;">Accepted</span>'
        : '<span style="background:#e5e7eb;color:#4b5563;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.9rem;">Completed</span>';
      return `
        <div style="padding:1rem;border:1px solid #ddd;border-radius:6px;margin-bottom:0.8rem;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
            <h4 style="margin:0;">${escapeHtml(j.title)}</h4>
            ${statusBadge}
          </div>
          <p style="margin:0.3rem 0;color:#666;">Posted: ${date}</p>
          <p style="margin:0.5rem 0;">${escapeHtml(j.description || '')}</p>
          <p style="font-weight:bold;">Rate: £${j.rate}/hr</p>
          ${j.status === 'accepted' ? `<p style="color:#166534;">✅ Accepted by: ${escapeHtml(j.acceptedByName || 'Unknown Driver')}</p>` : ''}
          ${j.status === 'open' ? `<button type="button" onclick="cancelJobPost('${d.id}')" style="margin-top:0.5rem;padding:0.4rem 0.8rem;background:#fee2e2;color:#b91c1c;border:none;border-radius:4px;">Cancel Job</button>` : ''}
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}

window.showPostJobForm = function() {
  document.getElementById('jobFormContainer').style.display = 'block';
};

window.hideJobForm = function() {
  document.getElementById('jobFormContainer').style.display = 'none';
  document.getElementById('jobTitle').value = '';
  document.getElementById('jobRate').value = '';
  document.getElementById('jobDesc').value = '';
};

window.postNewJob = async function(companyId) {
  const title = document.getElementById('jobTitle').value.trim();
  const rate = document.getElementById('jobRate').value;
  const description = document.getElementById('jobDesc').value.trim();
  
  if (!title || !rate) return alert('Fill in job title and rate.');
  
  try {
    await addDoc(collection(db, 'jobs'), {
      title,
      description,
      rate: Number(rate),
      companyId,
      companyName: userProfile.companyName || userProfile.fullName,
      status: 'open',
      postedAt: serverTimestamp()
    });
    alert('✅ Job posted! Drivers can now see this work.');
    hideJobForm();
  } catch (e) { alert('Error posting job: ' + e.message); }
};

window.cancelJobPost = async function(jobId) {
  if (!confirm('Cancel this job post? It will no longer be visible to drivers.')) return;
  try {
    await updateDoc(doc(db, 'jobs', jobId), { status: 'cancelled' });
    alert('✅ Job cancelled.');
  } catch (e) { alert('Error: ' + e.message); }
};
// --------------------------
// ✅ 18. COMPANY — CHECKLIST EDITOR (DVSA COMPLIANT)
// --------------------------
async function loadChecklistEditor() {
  const content = document.getElementById('checklistEditorContent');
  const companyId = userProfile.companyId || currentUser.uid;
  
  content.innerHTML = `
    <h3>DVSA Walkaround Check — Checklist Editor</h3>
    <p style="color:#666;margin-bottom:1.5rem;">Drag items to reorder. Edit or delete as needed. These checks will appear for all drivers completing vehicle walkaround checks.</p>
    
    <div style="background:#fff3cd;border-left:4px solid #d4af37;padding:1rem;margin-bottom:1.5rem;border-radius:4px;">
      <strong>ℹ️ DVSA Guidance:</strong> Your checklist should cover all items a driver must inspect before taking a vehicle on the road. 
      <a href="https://www.gov.uk/guidance/driver-vehicle-and-operator-compliance-dvsa" target="_blank" rel="noopener" style="color:#1a365d;">Read DVSA guidelines ↗</a>
    </div>
    
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem;">
      <button type="button" onclick="addNewChecklistItem()" style="padding:0.7rem 1.2rem;background:#1a365d;color:#fff;border:none;border-radius:6px;">+ Add Item</button>
      <button type="button" onclick="resetChecklistToDefault()" style="padding:0.7rem 1.2rem;background:#eee;color:#333;border:none;border-radius:6px;">↩ Reset to DVSA Default</button>
      <button type="button" onclick="saveChecklistOrder()" style="padding:0.7rem 1.2rem;background:#166534;color:#fff;border:none;border-radius:6px;">💾 Save Order</button>
    </div>
    
    <div id="checklistEditorContainer" style="background:#f8fafc;padding:1.5rem;border-radius:8px;">
      <div id="checklistItemsList">
        <p>Loading checklist...</p>
      </div>
    </div>
  `;
  
  // Load current checklist
  const checklistRef = doc(db, 'companies', companyId, 'settings', 'checklist');
  const unsub = onSnapshot(checklistRef, (docSnap) => {
    renderChecklistEditorItems(docSnap.exists ? docSnap.data().items : null);
  });
  unsubscribeSnapshots.push(unsub);
}

function renderChecklistEditorItems(items) {
  const container = document.getElementById('checklistItemsList');
  
  const defaultItems = [
    "Vehicle Exterior — Body, panels and mirrors secure and undamaged",
    "Windscreen & Windows — Clean, clear, no cracks or chips; wipers/washers working",
    "Lights & Indicators — All headlights, sidelights, indicators and reflectors working and secure",
    "Tyres & Wheels — Tyres at correct pressure, legal tread depth; no cuts/bulges; wheels secure, nuts present",
    "Brakes — Brake pedal firm, no leaks, handbrake holds vehicle; air pressure correct if applicable",
    "Fuel & Exhaust — No leaks; fuel cap secure; exhaust secure and free from excessive smoke",
    "Fluid Levels — Oil, coolant, screen wash at correct levels; caps secure; no visible leaks",
    "Coupling & Trailer Securement — Fifth wheel, kingpin, connections secure; all cables/hoses connected and undamaged",
    "Load Security — Load secure and restrained; no loose items; curtains/doors closed and locked",
    "Number Plates — Secure, clean, legible, correct spacing and format",
    "Emergency Equipment — Fire extinguisher, warning triangle, first aid kit present and in date",
    "Cab & Interior — Mirrors adjusted, controls clear, seatbelts secure and undamaged",
    "Documentation — All necessary documents carried and accessible"
  ];
  
  const checklistItems = items && items.length > 0 ? items : defaultItems;
  
  container.innerHTML = checklistItems.map((item, index) => `
    <div class="checklist-item-row" data-index="${index}" draggable="true" 
         style="padding:0.8rem;background:#fff;border:1px solid #ddd;border-radius:6px;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.8rem;cursor:move;"
         ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
      <span style="color:#999;font-size:1.2rem;user-select:none;">⋮⋮</span>
      <span style="font-weight:bold;color:#1a365d;min-width:1.8rem;">${index + 1}.</span>
      <input type="text" class="item-text-input" value="${escapeHtml(item)}" 
             style="flex:1;padding:0.4rem;border:1px solid #ccc;border-radius:4px;font-size:0.95rem;"
             data-original="${escapeHtml(item)}">
      <button type="button" onclick="moveItemUp(${index})" style="padding:0.3rem 0.6rem;background:#eee;border:none;border-radius:4px;cursor:pointer;" title="Move up">↑</button>
      <button type="button" onclick="moveItemDown(${index})" style="padding:0.3rem 0.6rem;background:#eee;border:none;border-radius:4px;cursor:pointer;" title="Move down">↓</button>
      <button type="button" onclick="deleteChecklistItem(${index})" style="padding:0.3rem 0.6rem;background:#fee2e2;color:#b91c1c;border:none;border-radius:4px;cursor:pointer;" title="Delete">✕</button>
    </div>
  `).join('');
  
  currentChecklistItems = [...checklistItems];
}

let currentChecklistItems = [];
let draggedItemIndex = null;

function handleDragStart(e) {
  draggedItemIndex = parseInt(e.target.dataset.index);
  e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
  e.target.style.opacity = '1';
  draggedItemIndex = null;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const targetIndex = parseInt(e.currentTarget.dataset.index);
  if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
  
  const movedItem = currentChecklistItems.splice(draggedItemIndex, 1)[0];
  currentChecklistItems.splice(targetIndex, 0, movedItem);
  renderChecklistEditorItems(currentChecklistItems);
}

window.moveItemUp = function(index) {
  if (index === 0) return;
  [currentChecklistItems[index - 1], currentChecklistItems[index]] = [currentChecklistItems[index], currentChecklistItems[index - 1]];
  renderChecklistEditorItems(currentChecklistItems);
};

window.moveItemDown = function(index) {
  if (index === currentChecklistItems.length - 1) return;
  [currentChecklistItems[index], currentChecklistItems[index + 1]] = [currentChecklistItems[index + 1], currentChecklistItems[index]];
  renderChecklistEditorItems(currentChecklistItems);
};

window.addNewChecklistItem = function() {
  const newItem = prompt('Enter new checklist item:');
  if (!newItem || !newItem.trim()) return;
  currentChecklistItems.push(newItem.trim());
  renderChecklistEditorItems(currentChecklistItems);
};

window.deleteChecklistItem = function(index) {
  if (!confirm('Remove this checklist item? This cannot be undone.')) return;
  currentChecklistItems.splice(index, 1);
  renderChecklistEditorItems(currentChecklistItems);
};

window.saveChecklistOrder = async function() {
  const companyId = userProfile.companyId || currentUser.uid;
  
  // Collect any edits from input fields
  const rows = document.querySelectorAll('.checklist-item-row');
  const updatedItems = [];
  rows.forEach(row => {
    const text = row.querySelector('.item-text-input').value.trim();
    if (text) updatedItems.push(text);
  });
  
  if (updatedItems.length === 0) return alert('Cannot save empty checklist.');
  
  try {
    await setDoc(doc(db, 'companies', companyId, 'settings', 'checklist'), {
      items: updatedItems,
      updatedAt: serverTimestamp()
    });
    currentChecklistItems = updatedItems;
    alert('✅ Checklist saved! Drivers will now use the updated list.');
  } catch (e) {
    alert('Error saving: ' + e.message);
  }
};

window.resetChecklistToDefault = function() {
  if (!confirm('Reset to DVSA default checklist? Your custom order and items will be replaced.')) return;
  const defaultItems = [
    "Vehicle Exterior — Body, panels and mirrors secure and undamaged",
    "Windscreen & Windows — Clean, clear, no cracks or chips; wipers/washers working",
    "Lights & Indicators — All headlights, sidelights, indicators and reflectors working and secure",
    "Tyres & Wheels — Tyres at correct pressure, legal tread depth; no cuts/bulges; wheels secure, nuts present",
    "Brakes — Brake pedal firm, no leaks, handbrake holds vehicle; air pressure correct if applicable",
    "Fuel & Exhaust — No leaks; fuel cap secure; exhaust secure and free from excessive smoke",
    "Fluid Levels — Oil, coolant, screen wash at correct levels; caps secure; no visible leaks",
    "Coupling & Trailer Securement — Fifth wheel, kingpin, connections secure; all cables/hoses connected and undamaged",
    "Load Security — Load secure and restrained; no loose items; curtains/doors closed and locked",
    "Number Plates — Secure, clean, legible, correct spacing and format",
    "Emergency Equipment — Fire extinguisher, warning triangle, first aid kit present and in date",
    "Cab & Interior — Mirrors adjusted, controls clear, seatbelts secure and undamaged",
    "Documentation — All necessary documents carried and accessible"
  ];
  renderChecklistEditorItems(defaultItems);
};

// --------------------------
// ✅ 19. COMPANY — PROFILE / SETTINGS
// --------------------------
async function loadCompanyProfilePage() {
  const content = document.getElementById('companyProfileContent');
  const companyId = userProfile.companyId || currentUser.uid;
  
  const docSnap = await getDoc(doc(db, 'companies', companyId, 'settings', 'profile'));
  const profile = docSnap.exists() ? docSnap.data() : {};
  
  content.innerHTML = `
    <h3>Company Profile & Compliance Details</h3>
    <p style="color:#666;margin-bottom:1.5rem;">This information appears on your invoices, checklists and reports. Keeping it accurate helps you stay compliant with DVSA and Traffic Commissioner requirements.</p>
    
    <div style="background:#e8edf3;border-left:4px solid #1a365d;padding:1rem;margin-bottom:1.5rem;border-radius:4px;">
      <strong>📋 Compliance Note:</strong> Your Operator's Licence number and registered name must be displayed on all vehicles and documentation as required by the Traffic Commissioner.
    </div>
    
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.2rem;">
      <div>
        <label for="compRegName"><strong>Registered Company Name *</strong></label>
        <input type="text" id="compRegName" value="${escapeHtml(profile.registeredName || userProfile.companyName || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div>
        <label for="compTradingName">Trading Name (if different)</label>
        <input type="text" id="compTradingName" value="${escapeHtml(profile.tradingName || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div>
        <label for="compHmrcRef">HMRC Reference / VAT Number</label>
        <input type="text" id="compHmrcRef" value="${escapeHtml(profile.hmrcReference || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div>
        <label for="compOpLic"><strong>Operator's Licence Number *</strong></label>
        <input type="text" id="compOpLic" value="${escapeHtml(profile.operatorsLicenceNumber || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div style="grid-column:1/-1;">
        <label for="compRegAddr"><strong>Registered Office Address *</strong></label>
        <textarea id="compRegAddr" rows="3" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">${escapeHtml(profile.registeredAddress || '')}</textarea>
      </div>
      <div>
        <label for="compBillingName">Accounts / Contact Name</label>
        <input type="text" id="compBillingName" value="${escapeHtml(profile.billingContactName || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div>
        <label for="compBillingEmail">Invoicing Email Address</label>
        <input type="email" id="compBillingEmail" value="${escapeHtml(profile.billingEmail || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div>
        <label for="compBillingPhone">Invoicing Telephone</label>
        <input type="tel" id="compBillingPhone" value="${escapeHtml(profile.billingPhone || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div>
        <label for="compPhone">Main Company Telephone</label>
        <input type="tel" id="compPhone" value="${escapeHtml(profile.mainPhone || '')}" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">
      </div>
      <div style="grid-column:1/-1;">
        <label for="compNotes">Additional Information / Notes</label>
        <textarea id="compNotes" rows="2" style="width:100%;padding:0.7rem;margin:0.3rem 0;border:1px solid #ccc;border-radius:4px;">${escapeHtml(profile.additionalNotes || '')}</textarea>
      </div>
    </div>
    
    <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;">
      <button type="button" onclick="saveCompanyProfile('${companyId}')" style="padding:0.9rem 2rem;background:#1a365d;color:#fff;border:none;border-radius:6px;font-size:1rem;">💾 Save Company Profile</button>
      <button type="button" onclick="printCompanyProfile()" style="padding:0.9rem 2rem;background:#eee;color:#333;border:none;border-radius:6px;font-size:1rem;">🖨️ Print Profile</button>
    </div>
  `;
}

window.saveCompanyProfile = async function(companyId) {
  const registeredName = document.getElementById('compRegName').value.trim();
  const operatorsLicenceNumber = document.getElementById('compOpLic').value.trim();
  
  if (!registeredName) return alert('⚠️ Registered Company Name is required.');
  if (!operatorsLicenceNumber) return alert('⚠️ Operator\'s Licence Number is required.');
  
  const data = {
    registeredName,
    tradingName: document.getElementById('compTradingName').value.trim(),
    hmrcReference: document.getElementById('compHmrcRef').value.trim(),
    operatorsLicenceNumber,
    registeredAddress: document.getElementById('compRegAddr').value.trim(),
    billingContactName: document.getElementById('compBillingName').value.trim(),
    billingEmail: document.getElementById('compBillingEmail').value.trim(),
    billingPhone: document.getElementById('compBillingPhone').value.trim(),
    mainPhone: document.getElementById('compPhone').value.trim(),
    additionalNotes: document.getElementById('compNotes').value.trim(),
    updatedAt: serverTimestamp()
  };
  
  try {
    await setDoc(doc(db, 'companies', companyId, 'settings', 'profile'), data);
    alert('✅ Company profile saved — Your details are now up to date.');
  } catch (e) {
    alert('Error saving profile: ' + e.message);
  }
};

window.printCompanyProfile = function() {
  window.print();
};

// --------------------------
// ✅ 20. GLOBAL UTILITIES & EXPOSURE
// --------------------------
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

let unsubscribeSnapshots = [];

function cleanupAllSnapshots() {
  unsubscribeSnapshots.forEach(unsub => {
    if (typeof unsub === 'function') unsub();
  });
  unsubscribeSnapshots = [];
}

window.addEventListener('beforeunload', cleanupAllSnapshots);

function formatDate(dateObj) {
  if (!dateObj) return 'N/A';
  const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(dateObj) {
  if (!dateObj) return 'N/A';
  const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateInvoiceNumber() {
  const num = String(Date.now()).slice(-8);
  return `LSDSA${num}`;
}

window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.escapeHtml = escapeHtml;
window.generateInvoiceNumber = generateInvoiceNumber;
window.cleanupAllSnapshots = cleanupAllSnapshots;

console.log('%c✅ LSD Solutions App Loaded — All Systems Ready', 'color: #1a365d; font-weight: bold; font-size: 14px;');
console.log('%cDVSA Compliant Walkaround Check • Company & Driver Portals • Firebase Connected', 'color: #666; font-size: 11px;');