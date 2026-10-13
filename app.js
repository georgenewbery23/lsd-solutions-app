<script type="module">
// ==============================================
// LSD Solutions — Fully Accessible Fixed Script
// ==============================================

// --------------------------
// 1. HELPER — MUST BE FIRST
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
// 2. FIREBASE IMPORTS
// --------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --------------------------
// 3. FIREBASE INIT
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
// 4. GLOBAL STATE
// --------------------------
let currentUser = null;
let userProfile = null;
let unsubscribeSnapshots = [];

function cleanupSnapshots() {
  unsubscribeSnapshots.forEach(u => { try { u() } catch(e) {} });
  unsubscribeSnapshots = [];
}

// --------------------------
// 5. PAGE ROUTING
// --------------------------
function showPage(pageId) {
  cleanupSnapshots();
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(pageId);
  if (page) page.style.display = 'block';
  
  switch(pageId) {
    case 'dashboardPage':
      if (userProfile?.role === 'driver') loadDriverDashboard();
      else if (userProfile?.role === 'company') loadCompanyDashboard();
      break;
    case 'jobsPage': loadJobsPage(); break;
    case 'checklistPage': loadChecklistPage(); break;
    case 'myChecksPage': loadMyChecks(); break;
    case 'driverProfilePage': loadDriverProfile(); break;
    case 'companyProfilePage': loadCompanyProfile(); break;
    case 'companyVehiclesPage': loadCompanyVehicles(); break;
    case 'companyDriversPage': loadCompanyDrivers(); break;
    case 'checklistEditorPage': loadChecklistEditor(); break;
  }
}

// --------------------------
// 6. AUTH STATE
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
    
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    
    if (!userProfile.role) {
      showPage('registerChoicePage');
    } else {
      showPage('dashboardPage');
    }
  } else {
    currentUser = null;
    userProfile = null;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('appSection').style.display = 'none';
  }
});

// --------------------------
// 7. AUTH HANDLERS
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
    role,
    email: currentUser.email,
    createdAt: serverTimestamp()
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
  } catch (e) {
    alert('Registration failed: ' + e.message);
  }
};

window.signOutUser = async function() {
  await signOut(auth);
};

// --------------------------
// 8. DRIVER DASHBOARD
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
    const failed = snap.docs.filter(d => d.data().status === 'fail').length;
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
      <button onclick="showPage('checklistPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#1a365d;color:#fff;border:none;border-radius:6px;">🚛 New Walkaround Check</button>
      <button onclick="showPage('jobsPage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#e8edf3;color:#1a365d;border:none;border-radius:6px;">📋 View Available Work</button>
      <button onclick="showPage('driverProfilePage')" style="width:100%;padding:1rem;font-size:1rem;margin:0.5rem 0;background:#d47500;color:#fff;border:none;border-radius:6px;">👤 Update Profile</button>
      
      <h3 style="margin-top:2rem;">Recent Checks</h3>
      ${snap.empty ? '<p>No checks submitted yet.</p>' : snap.docs.slice(0,5).map(d => {
        const c = d.data();
        const date = c.submittedAt?.toDate ? c.submittedAt.toDate().toLocaleString() : 'Unknown';
        const statusIcon = c.status === 'pass' ? '✅' : c.status === 'defect' ? '⚠️' : '❌';
        return `
          <div style="padding:0.8rem;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(c.vehicleReg || 'Unknown Vehicle')}</strong>
            <br>${statusIcon} ${c.status?.toUpperCase()} — ${date}
          </div>
        `;
      }).join('')}
    `;
  });
  unsubscribeSnapshots.push(unsub);
}

// --------------------------
// 9. JOBS / AVAILABLE WORK
// --------------------------
async function loadJobsPage() {
  const list = document.getElementById('jobsList');
  list.innerHTML = '<p>Loading available work...</p>';
  
  const jobsQ = query(
    collection(db, 'jobs'),
    where('status', '==', 'open'),
    orderBy('postedAt', 'desc')
  );
  
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
          <button onclick="acceptJob('${d.id}')" style="padding:0.6rem 1.2rem;background:#1a365d;color:#fff;border:none;border-radius:4px;">Accept Job</button>
        </div>
      `;
    }).join('');
  });
  unsubscribeSnapshots.push(unsub);
}

window.acceptJob = async function(jobId) {
  if (!confirm('Accept this job?')) return;
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'accepted',
      acceptedBy: currentUser.uid,
      acceptedByName: userProfile.fullName,
      acceptedAt: serverTimestamp()
    });
    alert('✅ Job accepted!');
  } catch (e) {
    alert('Error: ' + e.message);
  }
};

// --------------------------
// 10. WALKAROUND CHECK — FULLY ACCESSIBLE
// --------------------------
let currentCheckData = {};

async function loadChecklistPage() {
  const formWrap = document.getElementById('checklistForm');
  formWrap.innerHTML = '<p>Loading...</p>';
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
  
  currentCheckData = { type, vehicleId: null, trailerId: null, items: [], responses: {} };
  
  let checklistItems = [];
  for (const companyId of accessibleCompanies) {
    if (!companyId) continue;
    try {
      const clSnap = await getDoc(doc(db, 'companies', companyId, 'settings', 'checklist'));
      if (clSnap.exists() && clSnap.data().items?.length) {
        checklistItems = clSnap.data().items;
        break;
      }
    } catch(e) {}
  }
  
  if (!checklistItems.length) {
    checklistItems = [
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
  
  currentCheckData.items = checklistItems;
  
  formWrap.innerHTML = `
    <h3>Walkaround Check</h3>
    <p style="color:#666;margin-bottom:1rem;">Tap ✅ = Pass / ⚠️ = Defect / ❌ = Fail</p>
    
    ${checklistItems.map((item, idx) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.8rem 0;border-bottom:1px solid #eee;">
        <div style="flex:1;">
          <label for="check-item-${idx}">${idx + 1}. ${escapeHtml(item)}</label>
        </div>
        <div style="display:flex;gap:0.5rem;" id="check-item-${idx}">
          <button type="button" id="btn-pass-${idx}" name="check-response-${idx}" onclick="setCheckResponse(${idx}, 'pass')" style="width:44px;height:44px;border:none;border-radius:6px;background:#dcfce7;font-size:1.2rem;" aria-label="Pass">✅</button>
          <button type="button" id="btn-defect-${idx}" name="check-response-${idx}" onclick="setCheckResponse(${idx}, 'defect')" style="width:44px;height:44px;border:none;border-radius:6px;background:#fef3c7;font-size:1.2rem;" aria-label="Defect">⚠️</button>
          <button type="button" id="btn-fail-${idx}" name="check-response-${idx}" onclick="setCheckResponse(${idx}, 'fail')" style="width:44px;height:44px;border:none;border-radius:6px;background:#fee2e2;font-size:1.2rem;" aria-label="Fail">❌</button>
        </div>
      </div>
      <div id="defect-note-wrap-${idx}" style="display:none;padding:0.5rem 0 1rem 1rem;">
        <label for="defect-note-${idx}">Defect Details:</label>
        <input type="text" id="defect-note-${idx}" name="defect_note_${idx}" placeholder="Describe the issue..." style="width:100%;padding:0.6rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;">
      </div>
    `).join('')}
    
    <div style="margin-top:1.5rem;">
      <label for="checkMileage"><strong>Odometer / Mileage Reading</strong></label>
      <input type="number" id="checkMileage" name="check_mileage" placeholder="Miles" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    
    <div style="margin-top:1rem;">
      <label for="checkSignature"><strong>Signature / Name</strong></label>
      <input type="text" id="checkSignature" name="check_signature" value="${escapeHtml(userProfile.fullName || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    
    <button type="button" onclick="submitCheck()" style="width:100%;padding:1rem;background:#1a365d;color:#fff;border:none;border-radius:6px;font-size:1rem;margin-top:1rem;">✅ Submit Check</button>
  `;
};

window.setCheckResponse = function(idx, value) {
  currentCheckData.responses[idx] = value;
  
  ['pass', 'defect', 'fail'].forEach(v => {
    const btn = document.getElementById(`btn-${v}-${idx}`);
    if (btn) btn.style.outline = 'none';
  });
  const selectedBtn = document.getElementById(`btn-${value}-${idx}`);
  if (selectedBtn) selectedBtn.style.outline = '3px solid #1a365d';
  
  const noteWrap = document.getElementById(`defect-note-wrap-${idx}`);
  if (noteWrap) noteWrap.style.display = value === 'defect' ? 'block' : 'none';
};

window.submitCheck = async function() {
  const mileage = document.getElementById('checkMileage').value;
  const signature = document.getElementById('checkSignature').value.trim();
  
  if (!mileage || !signature) return alert('Please enter mileage and your name.');
  
  const type = document.getElementById('checkTypeSelect').value;
  const vehicleId = document.getElementById('vehicleSelect')?.value || null;
  const trailerId = document.getElementById('trailerSelect')?.value || null;
  
  if (type !== 'trailer' && !vehicleId) return alert('Please select a vehicle.');
  if (type !== 'vehicle' && !trailerId) return alert('Please select a trailer.');
  
  const allAnswered = currentCheckData.items.every((_, i) => currentCheckData.responses[i]);
  if (!allAnswered) return alert('Please answer every check item.');
  
  const responses = Object.values(currentCheckData.responses);
  const hasFail = responses.includes('fail');
  const hasDefect = responses.includes('defect');
  const overallStatus = hasFail ? 'fail' : hasDefect ? 'defect' : 'pass';
  
  let vehicleReg = type === 'trailer' ? 'Trailer Only' : 'Unknown';
  const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
  
  if (vehicleId) {
    for (const cid of accessibleCompanies) {
      if (!cid) continue;
      const snap = await getDoc(doc(db, 'companies', cid, 'vehicles', vehicleId));
      if (snap.exists()) {
        vehicleReg = snap.data().registration;
        break;
      }
    }
  }
  
  if (trailerId) {
    for (const cid of accessibleCompanies) {
      if (!cid) continue;
      const snap = await getDoc(doc(db, 'companies', cid, 'trailers', trailerId));
      if (snap.exists() && vehicleReg === 'Trailer Only') {
        vehicleReg = snap.data().trailerNumber;
        break;
      }
    }
  }
  
  const defectNotes = {};
  Object.entries(currentCheckData.responses).forEach(([idx, val]) => {
    if (val === 'defect') {
      defectNotes[idx] = document.getElementById(`defect-note-${idx}`)?.value || 'No details provided';
    }
  });
  
  try {
    await addDoc(collection(db, 'checks'), {
      driverUid: currentUser.uid,
      driverName: userProfile.fullName,
      vehicleId, trailerId, vehicleReg,
      checkType: type,
      mileage: Number(mileage),
      signature,
      status: overallStatus,
      responses: currentCheckData.responses,
      defectNotes,
      submittedAt: serverTimestamp()
    });
    alert('✅ Check submitted successfully!');
    showPage('myChecksPage');
  } catch (e) {
    alert('Error submitting check: ' + e.message);
  }
};

// --------------------------
// 11. MY CHECKS LIST
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
// 12. DRIVER PROFILE — FULLY LABELLED
// --------------------------
async function loadDriverProfile() {
  const cont = document.getElementById('driverProfileContent');
  const profile = userProfile || {};
  
  cont.innerHTML = `
    <h3>Personal Details</h3>
    <div style="margin:1rem 0;">
      <label for="drvProfName"><strong>Full Name</strong></label>
      <input type="text" id="drvProfName" name="driver_fullname" value="${escapeHtml(profile.fullName || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvEmail"><strong>Email</strong></label>
      <input type="email" id="drvEmail" name="driver_email" value="${escapeHtml(profile.email || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;" readonly>
    </div>
    
    <h3 style="margin-top:2rem;">Driving Licence</h3>
    <div style="margin:1rem 0;">
      <label for="drvLicNo">Licence Number</label>
      <input type="text" id="drvLicNo" name="driver_licence_number" value="${escapeHtml(profile.licenceNumber || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvDvlaCode">DVLA Check Code</label>
      <input type="text" id="drvDvlaCode" name="driver_dvla_code" value="${escapeHtml(profile.dvlaCheckCode || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvValidFrom">Valid From</label>
      <input type="date" id="drvValidFrom" name="driver_valid_from" value="${escapeHtml(profile.validFrom || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvExpiry">Expiry Date</label>
      <input type="date" id="drvExpiry" name="driver_expiry" value="${escapeHtml(profile.expiryDate || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvMedicalExp">Medical Expiry</label>
      <input type="date" id="drvMedicalExp" name="driver_medical_expiry" value="${escapeHtml(profile.medicalExpiry || '')}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvPoints">Penalty Points</label>
      <input type="number" id="drvPoints" name="driver_penalty_points" value="${profile.penaltyPoints || 0}" min="0" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="margin:1rem 0;">
      <label for="drvCats">Licence Categories (comma separated)</label>
      <input type="text" id="drvCats" name="driver_categories" value="${escapeHtml((profile.categories || []).join(', '))}" style="width:100%;padding:0.8rem;margin:0.5rem 0;border:1px solid #ccc;border-radius:4px;">
    </div>
    
    <button type="button" id="drvProfSave" onclick="saveDriverProfile()" style="padding:0.9rem 2rem;background:#1a365d;color:#fff;border:none;border-radius:6px;font-size:1rem;margin-top:1rem;">Save Profile</button>
    
    <h3 style="margin-top:2rem;">Documents</h3>
    <p style="color:#666;">Upload licence, CPC, tachograph card etc.</p>
    <label for="docUploader" style="display:block;margin:1rem 0 0.3rem;">Select Files</label>
    <input type="file" id="docUploader" name="driver_documents" multiple style="margin-bottom:1rem;">
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
  
  const btn = document.getElementById('drvProfSave');
  btn.textContent = '✅ Profile Saved';
  setTimeout(() => btn.textContent = 'Save Profile', 3000);
};

window.uploadDriverDocuments = async function() {
  const files = document.getElementById('docUploader').files;
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

// --------------------------
// 13. COMPANY PORTAL PLACEHOLDERS
// --------------------------
async function loadCompanyDashboard() {
  const dash = document.getElementById('dashboardContent');
  dash.innerHTML = `
    <h2>Welcome, ${escapeHtml(userProfile.companyName || 'Company Admin')}</h2>
    <p style="margin:1rem 0;color:#666;">Use the menu to manage your fleet, drivers, and settings.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:2rem;">
      <button type="button" onclick="showPage('companyVehiclesPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;">🚛 Vehicles</button>
      <button type="button" onclick="showPage('companyDriversPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;">👤 Drivers</button>
      <button type="button" onclick="showPage('checklistEditorPage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;">📋 Walkaround Check Editor</button>
      <button type="button" onclick="showPage('companyProfilePage')" style="padding:1.5rem;background:#f0f4f8;border:none;border-radius:8px;font-size:1rem;">🏢 Company Profile</button>
    </div>
  `;
}

async function loadCompanyVehicles() {
  document.getElementById('companyVehiclesContent').innerHTML = '<p>Vehicles management — add/edit/activate vehicles here.</p>';
}
async function loadCompanyDrivers() {
  document.getElementById('companyDriversContent').innerHTML = '<p>Drivers management — view linked drivers & their documents here.</p>';
}
async function loadCompanyProfile() {
  document.getElementById('companyProfileContent').innerHTML = '<p>Company profile & compliance settings.</p>';
}
async function loadChecklistEditor() {
  document.getElementById('checklistEditorContent').innerHTML = '<p>Checklist editor — customise your walkaround items.</p>';
}

console.log('✅ LSD Solutions app loaded — fully accessible');
</script>
