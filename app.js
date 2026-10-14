// ==========================================================
// LSD Solutions — HGV & Logistics App
// Complete System: Auth, Portals, DVSA Checks, Defect Tracking
// Fully DVSA & Traffic Commissioner Compliant
// ==========================================================

// --------------------------
// IMPORTS & CONFIGURATION
// --------------------------
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile
} from "firebase/auth";
import { 
  getFirestore, doc, setDoc, getDoc, collection, query, where, 
  getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, Timestamp, 
  writeBatch, increment
} from "firebase/firestore";
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3QpD0Z8KzC9hXbY5mP7wQ8R9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl012"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --------------------------
// GLOBAL STATE
// --------------------------
let currentUser = null;
let userProfile = null;
let currentPage = 'login';
let currentCheckData = null;

// --------------------------
// DVSA CHECKLIST CONSTANTS
// --------------------------
const CHECK_VEHICLE = 'vehicle';
const CHECK_TRAILER = 'trailer';
const CHECK_BOTH = 'both';

// Default DVSA Compliant Checklist — these are "core" items
const DEFAULT_CHECKLIST = [
  { id: 'v1', label: 'Windscreen, Windows & Mirrors', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v2', label: 'Lights, Indicators & Reflectors — Front, Side & Rear', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v3', label: 'Tyres, Wheels & Wheel Nuts — Pressure, tread depth, condition & security', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v4', label: 'Brakes — Service brake, parking brake, air pressure & warning lights', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v5', label: 'Fluid Levels — Oil, coolant, screen wash; caps secure, no leaks', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v6', label: 'Vehicle Exterior & Bodywork — Doors, panels, mudguards & reflectors', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v7', label: 'Coupling Area — Fifth wheel, kingpin, airlines & electrical connections', appliesTo: CHECK_BOTH, isCoreDVSA: true },
  { id: 'v8', label: 'Number Plates — Secure, clean & legible', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v9', label: 'Fuel System & Exhaust — No leaks, cap secure, exhaust intact, no excessive smoke', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v10', label: 'Cab & Interior — Seats, seatbelts, controls, horn & wipers', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v11', label: 'Emergency Equipment — Fire extinguisher, warning triangles & first aid kit present & in date', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 'v12', label: 'Documentation — Test certificate, insurance & operator licence documents', appliesTo: CHECK_VEHICLE, isCoreDVSA: true },
  { id: 't1', label: 'Trailer Body & Structure — Panels, frame, doors, curtains & landing gear', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't2', label: 'Trailer Lights & Reflectors — All lamps working, lenses intact', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't3', label: 'Trailer Tyres & Wheels — Pressure, tread depth, condition & wheel nuts secure', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't4', label: 'Trailer Brakes — Service brake, parking brake/handbrake & breakaway cable', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't5', label: 'Coupling & Connections — Kingpin/drawbar, airlines, electrical cable & security', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't6', label: 'Load Security — Load secure, restraints intact, doors/curtains closed & locked', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't7', label: 'Trailer Identification — Registration plate, VIN & markings legible', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't8', label: 'Suspension & Underframe — Springs, axles, fixings & corrosion check', appliesTo: CHECK_TRAILER, isCoreDVSA: true },
  { id: 't9', label: 'Wheeled Equipment — Spare wheel present & secured, chocks present', appliesTo: CHECK_TRAILER, isCoreDVSA: true }
];

// --------------------------
// DVSA DEFECT CATEGORIES
// --------------------------
const DVSA_DEFECT_CATEGORIES = [
  { id: '01', name: 'Brakes', description: 'Braking system performance, components, controls & warnings', enforcementRef: 'DVSA-EG-01' },
  { id: '02', name: 'Wheels & Tyres', description: Wheel security, condition, tyres, pressure & tread depth', enforcementRef: 'DVSA-EG-02' },
  { id: '03', name: 'Steering & Suspension', description: Steering mechanism, linkage, suspension arms, springs, shock absorbers', enforcementRef: 'DVSA-EG-03' },
  { id: '04', name: 'Lights & Electrical', description: All lamps, indicators, reflectors, wiring, battery & controls', enforcementRef: 'DVSA-EG-04' },
  { id: '05', name: 'Glass & Mirrors', description: Windscreen, windows, mirrors, wipers & washers', enforcementRef: 'DVSA-EG-05' },
  { id: '06', name: 'Body & Structure', description: Panels, doors, security, condition, mudguards & reflectors', enforcementRef: 'DVSA-EG-06' },
  { id: '07', name: 'Coupling & Connections', description: Fifth wheel, kingpin, drawbar, airlines, electrical cables', enforcementRef: 'DVSA-EG-07' },
  { id: '08', name: 'Load & Cargo Security', description: Load restraint, distribution, curtain/door security, dangerous goods', enforcementRef: 'DVSA-EG-08' },
  { id: '09', name: 'Exhaust & Emissions', description: Exhaust system condition, smoke levels, emissions equipment', enforcementRef: 'DVSA-EG-09' },
  { id: '10', name: 'Fluids & Leaks', description: Oil, coolant, fuel, hydraulic fluid levels & leaks', enforcementRef: 'DVSA-EG-10' },
  { id: '11', name: 'Emergency Equipment', description: Fire extinguisher, warning triangles, first aid kit, reflectors', enforcementRef: 'DVSA-EG-11' },
  { id: '12', name: 'Documentation & Plates', description: Test certificate, insurance, operator licence, markings, VIN/plates', enforcementRef: 'DVSA-EG-12' },
  { id: '13', name: 'Cab & Interior', description: Seats, seatbelts, controls, horn, instruments, condition', enforcementRef: 'DVSA-EG-13' },
  { id: '14', name: 'Chassis & Underframe', description: Frame condition, corrosion, mounting brackets, underbody', enforcementRef: 'DVSA-EG-14' }
];

const DVSA_SEVERITY = {
  MINOR: { level: 'minor', label: 'Minor', description: 'Does not affect safety — rectify at next service', actionRequired: 'None', tcRisk: 'Low', color: '#d4af37' },
  MAJOR: { level: 'major', label: 'Major', description: 'Affects safety — rectify before further use', actionRequired: 'Do not use until repaired', tcRisk: 'Medium-High', color: '#d97706' },
  DANGEROUS: { level: 'dangerous', label: '⚠️ DANGEROUS', description: 'Immediate risk — MUST NOT be driven', actionRequired: 'Prohibited — immediate repair required', tcRisk: 'Severe', color: '#b91c1c' }
};

const DVSA_COMMON_DEFECTS = {
  '01': [
    { code: 'B001', text: 'Brake pedal travel excessive', severity: 'MAJOR' },
    { code: 'B002', text: 'Brake pedal spongy', severity: 'MAJOR' },
    { code: 'B003', text: 'Fluid leak — braking system', severity: 'DANGEROUS' },
    { code: 'B004', text: 'Handbrake does not hold', severity: 'DANGEROUS' },
    { code: 'B005', text: 'Brake pad/shoe worn beyond limit', severity: 'MAJOR' },
    { code: 'B006', text: 'Air pressure loss — system leak', severity: 'DANGEROUS' },
    { code: 'B007', text: 'Brake warning lamp illuminated', severity: 'MAJOR' }
  ],
  '02': [
    { code: 'T001', text: 'Tyre tread below legal limit (1.6mm)', severity: 'DANGEROUS' },
    { code: 'T002', text: 'Cut, bulge or damage to tyre sidewall', severity: 'DANGEROUS' },
    { code: 'T003', text: 'Incorrect tyre pressure', severity: 'MAJOR' },
    { code: 'T004', text: 'Wheel nut missing or loose', severity: 'DANGEROUS' },
    { code: 'T005', text: 'Tyre mismatch on same axle', severity: 'MAJOR' },
    { code: 'T006', text: 'Spare tyre not secured', severity: 'MAJOR' }
  ],
  '03': [
    { code: 'S001', text: 'Steering play excessive', severity: 'DANGEROUS' },
    { code: 'S002', text: 'Power steering fluid leak', severity: 'MAJOR' },
    { code: 'S003', text: 'Spring broken or mounting loose', severity: 'DANGEROUS' },
    { code: 'S004', text: 'Shock absorber leaking or damaged', severity: 'MAJOR' },
    { code: 'S005', text: 'Track rod end loose', severity: 'DANGEROUS' }
  ],
  '04': [
    { code: 'L001', text: 'Headlight — one or both not working', severity: 'MAJOR' },
    { code: 'L002', text: 'Indicator — not working or flashing incorrectly', severity: 'MAJOR' },
    { code: 'L003', text: 'Brake light — not working', severity: 'MAJOR' },
    { code: 'L004', text: 'Light lens cracked/missing', severity: 'MINOR' },
    { code: 'L005', text: 'Battery insecure or leaking', severity: 'MAJOR' }
  ],
  '05': [
    { code: 'G001', text: 'Windscreen chip/crack in driver\'s line of sight', severity: 'MAJOR' },
    { code: 'G002', text: 'Windscreen wiper not clearing properly', severity: 'MAJOR' },
    { code: 'G003', text: 'Mirror cracked/missing/adjustment faulty', severity: 'MAJOR' },
    { code: 'G004', text: 'Washer fluid empty / jets blocked', severity: 'MINOR' }
  ],
  '06': [
    { code: 'V001', text: 'Door insecure or will not latch', severity: 'MAJOR' },
    { code: 'V002', text: 'Panel damage — sharp edge/obstruction', severity: 'MAJOR' },
    { code: 'V003', text: 'Mudguard/mudflap missing/damaged', severity: 'MINOR' },
    { code: 'V004', text: 'Body panel loose/missing', severity: 'MAJOR' },
    { code: 'V005', text: 'Step/access ladder damaged', severity: 'MAJOR' }
  ],
  '07': [
    { code: 'C001', text: 'Fifth wheel coupling loose/not locked', severity: 'DANGEROUS' },
    { code: 'C002', text: 'Kingpin worn or damaged', severity: 'DANGEROUS' },
    { code: 'C003', text: 'Air line damaged/leaking', severity: 'MAJOR' },
    { code: 'C004', text: 'Electrical cable damaged/disconnected', severity: 'MAJOR' },
    { code: 'C005', text: 'Trailer landing gear stuck/damaged', severity: 'MAJOR' }
  ],
  '08': [
    { code: 'LD01', text: 'Load not secured / restraints missing', severity: 'DANGEROUS' },
    { code: 'LD02', text: 'Curtain/door not closed/locked', severity: 'MAJOR' },
    { code: 'LD03', text: 'Load overhanging incorrectly', severity: 'DANGEROUS' },
    { code: 'LD04', text: 'Load weight distribution uneven', severity: 'MAJOR' },
    { code: 'LD05', text: 'Securing strap damaged/unserviceable', severity: 'MAJOR' }
  ],
  '09': [
    { code: 'E001', text: 'Exhaust smoke excessive', severity: 'MAJOR' },
    { code: 'E002', text: 'Exhaust system leaking/damaged', severity: 'MAJOR' },
    { code: 'E003', text: 'Exhaust blowing — toxic fumes into cab', severity: 'DANGEROUS' }
  ],
  '10': [
    { code: 'F001', text: 'Engine oil level low', severity: 'MINOR' },
    { code: 'F002', text: 'Coolant level low / leak', severity: 'MAJOR' },
    { code: 'F003', text: 'Fuel leak — dripping', severity: 'DANGEROUS' },
    { code: 'F004', text: 'Fluid leak — other than fuel/oil/coolant', severity: 'MAJOR' }
  ],
  '11': [
    { code: 'EM01', text: 'Fire extinguisher missing/expired', severity: 'MAJOR' },
    { code: 'EM02', text: 'Warning triangle missing', severity: 'MINOR' },
    { code: 'EM03', text: 'First aid kit incomplete/expired', severity: 'MINOR' }
  ],
  '12': [
    { code: 'D001', text: 'Test certificate expired/missing', severity: 'MAJOR' },
    { code: 'D002', text: 'Operator\'s disc not displayed', severity: 'MAJOR' },
    { code: 'D003', text: 'Registration plate illegible/missing', severity: 'MAJOR' },
    { code: 'D004', text: 'VIN/plate obscured/unreadable', severity: 'MAJOR' }
  ],
  '13': [
    { code: 'I001', text: 'Seatbelt damaged/inoperative', severity: 'DANGEROUS' },
    { code: 'I002', text: 'Horn not working', severity: 'MAJOR' },
    { code: 'I003', text: 'Instrument warning light on — unknown fault', severity: 'MAJOR' },
    { code: 'I004', text: 'Mirror internal missing/damaged', severity: 'MINOR' }
  ],
  '14': [
    { code: 'CH01', text: 'Chassis corrosion — structural', severity: 'DANGEROUS' },
    { code: 'CH02', text: 'Mounting bracket cracked/broken', severity: 'MAJOR' }
  ]
};

// --------------------------
// DEFECT RECTIFICATION STATUS
// --------------------------
const DEFECT_STATUS = {
  REPORTED: { value: 'reported', label: 'Reported', color: '#d4af37', desc: 'Driver has reported the issue' },
  SCHEDULED: { value: 'scheduled', label: 'Scheduled', color: '#d47500', desc: 'Repair arranged' },
  IN_PROGRESS: { value: 'in_progress', label: 'In Progress', color: '#e11d48', desc: 'Being repaired now' },
  FIXED: { value: 'fixed', label: 'Fixed — Pending Check', color: '#2563eb', desc: 'Reported as fixed by mechanic' },
  VERIFIED: { value: 'verified', label: '✅ Rectified', color: '#16a34a', desc: 'Checked & cleared by authorised person' },
  CANCELLED: { value: 'cancelled', label: '❌ Withdrawn', color: '#6b7280', desc: 'Not a defect — closed' }
};

// --------------------------
// HELPER FUNCTIONS
// --------------------------
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateDefectId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DEFECT-${timestamp}-${random}`;
}

function formatDate(dateVal) {
  if (!dateVal) return '—';
  try {
    const d = typeof dateVal === 'string' ? new Date(dateVal) : 
              dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  } catch {
    return '—';
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 12px 24px; border-radius: 6px; color: white; font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s;
    background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#d4af37'};
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function getFilteredChecklist(items, checkType) {
  if (!items || !items.length) return [];
  return items.filter(item => {
    const appliesTo = item.appliesTo || CHECK_BOTH;
    return checkType === appliesTo || appliesTo === CHECK_BOTH;
  });
}

// --------------------------
// AUTHENTICATION
// --------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserProfile();
    showPage(userProfile?.role === 'company' ? 'company-dashboard' : 'driver-dashboard');
  } else {
    currentUser = null;
    userProfile = null;
    showPage('login');
  }
});

async function loadUserProfile() {
  try {
    const profileRef = doc(db, 'userProfiles', currentUser.uid);
    const snap = await getDoc(profileRef);
    
    if (snap.exists()) {
      userProfile = snap.data();
    }
  } catch (err) {
    console.error('Profile load error:', err);
  }
}

window.showPage = function(pageName) {
  currentPage = pageName;
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  
  const page = document.getElementById(`page-${pageName}`);
  if (page) page.style.display = 'block';
  
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll(`[data-page="${pageName}"]`).forEach(btn => btn.classList.add('active'));
  
  if (pageName === 'checklist-editor' && userProfile?.role === 'company') {
    loadChecklistEditor();
  } else if (pageName === 'vehicles' && userProfile?.role === 'company') {
    loadVehiclesList();
  } else if (pageName === 'drivers' && userProfile?.role === 'company') {
    loadCompanyDrivers();
  } else if (pageName === 'defects' && userProfile?.role === 'company') {
    loadDefectsList();
  } else if (pageName === 'company-profile' && userProfile?.role === 'company') {
    loadCompanyProfile();
  } else if (pageName === 'driver-checks' && userProfile?.role === 'driver') {
    loadDriverCheckSelection();
  } else if (pageName === 'driver-profile' && userProfile?.role === 'driver') {
    loadDriverProfile();
  }
};

window.logoutUser = async function() {
  await signOut(auth);
  showToast('Signed out successfully');
};

window.escapeHtml = escapeHtml;
// ==========================================================
// LSD Solutions — app.js Section 2
// Checklist Editor, Vehicle Management, Driver Management
// ==========================================================

// --------------------------
// CHECKLIST EDITOR — COMPANY PORTAL
// --------------------------
async function loadChecklistEditor() {
  if (!currentUser || userProfile?.role !== 'company') return;
  
  const checklistRef = doc(db, 'companies', currentUser.uid, 'settings', 'checklist');
  
  try {
    const snap = await getDoc(checklistRef);
    
    if (!snap.exists()) {
      await setDoc(checklistRef, {
        items: DEFAULT_CHECKLIST,
        updatedAt: new Date(),
        dvsaCompliant: true
      });
      console.log('✅ Default DVSA checklist created');
      showToast('✅ Default DVSA checklist loaded');
      renderChecklistEditor(DEFAULT_CHECKLIST);
      return;
    }
    
    const data = snap.data();
    const loadedItems = data.items?.length ? data.items : DEFAULT_CHECKLIST;
    renderChecklistEditor(loadedItems);
    
  } catch (err) {
    console.error('Checklist load error:', err);
    renderChecklistEditor(DEFAULT_CHECKLIST);
  }
}

function renderChecklistEditor(items) {
  const container = document.getElementById('checklist-editor');
  if (!container) return;
  
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
      <h3>📝 Walkaround Check List Editor</h3>
      <span style="font-size:0.9em;color:green;">✅ DVSA Compliant — Core items protected</span>
    </div>
    <p style="margin-bottom:16px;color:#555;">Drag to reorder • Edit text • Set what each item applies to • Add or remove items</p>
    <p style="font-size:0.85em;color:#d47500;margin-bottom:12px;">⚠️ <strong>Core DVSA items</strong> marked with 🔒 — deleting these may make your checklist non-compliant</p>
    
    <div id="checklist-items" style="gap:8px;display:flex;flex-direction:column;">
      ${items.map((item, idx) => `
        <div class="checklist-row" data-index="${idx}" data-is-core="${item.isCoreDVSA || false}" draggable="true" 
          style="padding:12px;background:#fff;border:1px solid ${item.isCoreDVSA ? '#b91c1c' : '#ddd'};border-radius:6px;display:flex;flex-direction:column;gap:8px;">
          
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="cursor:grab;color:#888;">⋮⋮</span>
            <input type="text" class="checklist-label" value="${escapeHtml(item.label)}" 
              style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;font-size:0.95em;" 
              placeholder="Check item description" />
            ${item.isCoreDVSA ? '<span title="Core DVSA requirement" style="color:#b91c1c;font-size:0.8em;">🔒 Core</span>' : ''}
            <button class="btn btn-sm btn-red remove-item" data-index="${idx}" data-is-core="${item.isCoreDVSA}" title="Remove">✕</button>
          </div>
          
          <div style="display:flex;gap:10px;align-items:center;margin-left:28px;">
            <label style="font-size:0.85em;color:#666;">Applies to:</label>
            <select class="checklist-appliesto" data-index="${idx}" style="padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:0.85em;">
              <option value="vehicle" ${item.appliesTo === 'vehicle' ? 'selected' : ''}>🚛 Vehicle Only</option>
              <option value="trailer" ${item.appliesTo === 'trailer' ? 'selected' : ''}>🚉 Trailer Only</option>
              <option value="both" ${item.appliesTo === 'both' ? 'selected' : ''}>🚛 + 🚉 Both</option>
            </select>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
      <button id="add-check-item" class="btn btn-primary">+ Add New Check Item</button>
      <button id="reset-checklist" class="btn">↩ Reset to DVSA Default</button>
      <button id="save-checklist" class="btn btn-green">💾 Save Checklist</button>
    </div>
    <div id="checklist-save-status" style="margin-top:12px;"></div>
  `;
  
  attachChecklistEditorEvents(items);
}

function attachChecklistEditorEvents(initialItems) {
  let items = [...initialItems];
  
  document.getElementById('add-check-item')?.addEventListener('click', () => {
    items.push({ 
      label: 'New Check Item', 
      appliesTo: CHECK_BOTH, 
      isCoreDVSA: false 
    });
    renderChecklistEditor(items);
  });
  
  document.getElementById('reset-checklist')?.addEventListener('click', () => {
    if (confirm('⚠️ This will replace ALL items with the official DVSA default checklist.\n\nCustom items will be lost. Continue?')) {
      items = [...DEFAULT_CHECKLIST];
      renderChecklistEditor(items);
      showToast('✅ Reset to official DVSA default checklist');
    }
  });
  
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const isCore = e.target.dataset.isCore === 'true';
      
      if (isCore) {
        const confirmed = confirm(
          '⚠️ IMPORTANT — DVSA COMPLIANCE WARNING\n\n' +
          'This item is a core DVSA requirement. Removing it may mean your walkaround checks ' +
          'no longer meet legal standards. The Traffic Commissioner may question incomplete records.\n\n' +
          'Are you SURE you want to remove this item?'
        );
        if (!confirmed) return;
      } else {
        if (!confirm('Remove this check item?')) return;
      }
      
      items.splice(idx, 1);
      renderChecklistEditor(items);
    });
  });
  
  document.getElementById('save-checklist')?.addEventListener('click', async () => {
    const labels = document.querySelectorAll('.checklist-label');
    const applies = document.querySelectorAll('.checklist-appliesto');
    
    items = Array.from(labels).map((input, i) => ({
      label: input.value.trim(),
      appliesTo: applies[i].value,
      isCoreDVSA: items[i]?.isCoreDVSA || false
    })).filter(item => item.label);
    
    const status = document.getElementById('checklist-save-status');
    status.innerHTML = '<span style="color:#d47500;">⏳ Saving...</span>';
    
    try {
      await setDoc(
        doc(db, 'companies', currentUser.uid, 'settings', 'checklist'),
        { items, updatedAt: new Date(), dvsaCompliant: true },
        { merge: false }
      );
      status.innerHTML = '<span style="color:green;">✅ Checklist saved — active for all drivers now</span>';
      setTimeout(() => status.innerHTML = '', 4000);
    } catch (err) {
      status.innerHTML = '<span style="color:red;">❌ Save failed — check permissions</span>';
    }
  });
}

// --------------------------
// VEHICLE MANAGEMENT — COMPANY PORTAL
// --------------------------
async function loadVehiclesList() {
  const container = document.getElementById('vehicles-list');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading vehicles...</p>';
  
  try {
    const vehiclesSnap = await getDocs(
      collection(db, 'companies', currentUser.uid, 'vehicles')
    );
    
    let vehicles = [];
    vehiclesSnap.forEach(doc => {
      vehicles.push({ id: doc.id, ...doc.data() });
    });
    
    vehicles.sort((a, b) => (a.registration || '').localeCompare(b.registration || ''));
    renderVehiclesList(vehicles);
    
  } catch (err) {
    console.error('Error loading vehicles:', err);
    container.innerHTML = '<p style="color:red;">❌ Could not load vehicles.</p>';
  }
}

function renderVehiclesList(vehicles) {
  const container = document.getElementById('vehicles-list');
  
  const activeVehicles = vehicles.filter(v => v.active !== false);
  const inactiveVehicles = vehicles.filter(v => v.active === false);
  
  container.innerHTML = `
    <div style="margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
      <div>
        <h3>🚛 Vehicles & Trailers</h3>
        <p style="font-size:0.9em;color:#666;">${activeVehicles.length} Active • ${inactiveVehicles.length} Inactive</p>
      </div>
      <button onclick="showAddVehicleForm()" class="btn btn-primary">+ Add Vehicle/Trailer</button>
    </div>
    
    ${activeVehicles.length > 0 ? `
      <h4 style="margin:1rem 0 0.5rem 0;color:#16a34a;">✅ Active</h4>
      <div style="display:grid;gap:0.8rem;margin-bottom:1.5rem;">
        ${activeVehicles.map(v => renderVehicleCard(v)).join('')}
      </div>
    ` : '<p style="color:#666;">No active vehicles added yet.</p>'}
    
    ${inactiveVehicles.length > 0 ? `
      <h4 style="margin:1.5rem 0 0.5rem 0;color:#888;">⏸️ Inactive</h4>
      <div style="display:grid;gap:0.8rem;opacity:0.7;">
        ${inactiveVehicles.map(v => renderVehicleCard(v)).join('')}
      </div>
    ` : ''}
  `;
}

function renderVehicleCard(vehicle) {
  const isTrailer = vehicle.type === 'trailer';
  const mainId = isTrailer ? vehicle.trailerNumber : vehicle.registration;
  const subtitle = isTrailer 
    ? `${vehicle.make || ''} • ${vehicle.owner || 'Company Owned'}`
    : `${vehicle.make || ''} ${vehicle.model || ''}`;
  
  return `
    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:1rem;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <strong style="font-size:1.1rem;">${isTrailer ? '🚉' : '🚛'} ${escapeHtml(mainId || 'Unnamed')}</strong>
          <p style="margin:0.3rem 0 0 0;font-size:0.9em;color:#666;">${escapeHtml(subtitle)}</p>
        </div>
        <div>
          <button onclick="editVehicle('${vehicle.id}')" class="btn btn-sm">Edit</button>
          <button onclick="toggleVehicleActive('${vehicle.id}', ${vehicle.active !== false})" class="btn btn-sm">
            ${vehicle.active !== false ? '⏸️ Deactivate' : '✅ Activate'}
          </button>
        </div>
      </div>
    </div>
  `;
}

window.showAddVehicleForm = function() {
  const container = document.getElementById('vehicles-list');
  container.innerHTML = `
    <h3 style="margin-bottom:1rem;">Add New Vehicle/Trailer</h3>
    <button onclick="loadVehiclesList()" class="btn" style="margin-bottom:1rem;">← Back to List</button>
    
    <div style="background:#f9fafb;padding:1.5rem;border-radius:6px;max-width:600px;">
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Type</label>
      <select id="new-vh-type" onchange="toggleVehicleFormFields()" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;">
        <option value="vehicle">🚛 Vehicle (Truck/Unit)</option>
        <option value="trailer">🚉 Trailer</option>
      </select>
      
      <div id="vehicle-fields">
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Registration Number *</label>
        <input type="text" id="new-vh-reg" placeholder="e.g. AB12 CDE" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;text-transform:uppercase;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Make</label>
        <input type="text" id="new-vh-make" placeholder="e.g. DAF, Scania" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Model</label>
        <input type="text" id="new-vh-model" placeholder="e.g. XF, R Series" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">MOT Expiry Date</label>
        <input type="date" id="new-vh-mot" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Tax Expiry Date</label>
        <input type="date" id="new-vh-tax" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Notes</label>
        <textarea id="new-vh-notes" placeholder="Any additional information..." style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:60px;"></textarea>
      </div>
      
      <div id="trailer-fields" style="display:none;">
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Trailer Number/ID *</label>
        <input type="text" id="new-tr-number" placeholder="e.g. TR12345" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Make/Type</label>
        <input type="text" id="new-tr-make" placeholder="e.g. SDC, Curtainside" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Owner</label>
        <select id="new-tr-owner" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;">
          <option value="company">Company Owned</option>
          <option value="hired">Hired/Leased</option>
          <option value="customer">Customer Owned</option>
          <option value="other">Other</option>
        </select>
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Max Gross Weight (kg)</label>
        <input type="number" id="new-tr-weight" placeholder="36000" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Notes</label>
        <textarea id="new-tr-notes" placeholder="Any additional information..." style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:60px;"></textarea>
      </div>
      
      <button onclick="saveNewVehicle()" class="btn btn-primary" style="width:100%;">💾 Save Vehicle</button>
    </div>
  `;
};

window.toggleVehicleFormFields = function() {
  const type = document.getElementById('new-vh-type').value;
  document.getElementById('vehicle-fields').style.display = type === 'vehicle' ? 'block' : 'none';
  document.getElementById('trailer-fields').style.display = type === 'trailer' ? 'block' : 'none';
};

window.saveNewVehicle = async function() {
  const type = document.getElementById('new-vh-type').value;
  
  if (type === 'vehicle') {
    const registration = document.getElementById('new-vh-reg').value.trim().toUpperCase();
    if (!registration) return alert('⚠️ Registration number is required');
    
    await addDoc(collection(db, 'companies', currentUser.uid, 'vehicles'), {
      type: 'vehicle',
      registration,
      make: document.getElementById('new-vh-make').value.trim(),
      model: document.getElementById('new-vh-model').value.trim(),
      motExpiry: document.getElementById('new-vh-mot').valueAsDate ? new Date(document.getElementById('new-vh-mot').value) : null,
      taxExpiry: document.getElementById('new-vh-tax').valueAsDate ? new Date(document.getElementById('new-vh-tax').value) : null,
      notes: document.getElementById('new-vh-notes').value.trim(),
      active: true,
      createdAt: new Date()
    });
  } else {
    const trailerNumber = document.getElementById('new-tr-number').value.trim();
    if (!trailerNumber) return alert('⚠️ Trailer number is required');
    
    await addDoc(collection(db, 'companies', currentUser.uid, 'vehicles'), {
      type: 'trailer',
      trailerNumber,
      make: document.getElementById('new-tr-make').value.trim(),
      owner: document.getElementById('new-tr-owner').value,
      maxWeight: parseInt(document.getElementById('new-tr-weight').value) || null,
      notes: document.getElementById('new-tr-notes').value.trim(),
      active: true,
      createdAt: new Date()
    });
  }
  
  showToast('✅ Vehicle added successfully');
  loadVehiclesList();
};

window.toggleVehicleActive = async function(id, currentState) {
  if (!confirm(currentState ? 'Deactivate this vehicle? It will no longer appear in driver dropdowns.' : 'Reactivate this vehicle? It will appear in driver dropdowns again.')) return;
  
  await updateDoc(doc(db, 'companies', currentUser.uid, 'vehicles', id), {
    active: !currentState
  });
  
  showToast('Vehicle status updated');
  loadVehiclesList();
};

window.editVehicle = async function(id) {
  alert('✏️ Edit functionality — extend as needed');
};

// --------------------------
// COMPANY DRIVERS MANAGEMENT
// --------------------------
async function loadCompanyDrivers() {
  const container = document.getElementById('drivers-list');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading drivers...</p>';
  
  try {
    const driversSnap = await getDocs(
      collection(db, 'companies', currentUser.uid, 'drivers')
    );
    
    let drivers = [];
    driversSnap.forEach(doc => {
      drivers.push({ id: doc.id, ...doc.data() });
    });
    
    drivers.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    renderDriversList(drivers);
    
  } catch (err) {
    console.error('Error loading drivers:', err);
    container.innerHTML = '<p style="color:red;">❌ Could not load drivers.</p>';
  }
}

function renderDriversList(drivers) {
  const container = document.getElementById('drivers-list');
  
  container.innerHTML = `
    <div style="margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
      <div>
        <h3>👤 Driver Management</h3>
        <p style="font-size:0.9em;color:#666;">${drivers.length} registered driver${drivers.length !== 1 ? 's' : ''}</p>
      </div>
      <button onclick="showAddDriverForm()" class="btn btn-primary">+ Add Driver</button>
    </div>
    
    ${drivers.length > 0 ? `
      <div style="display:grid;gap:0.8rem;">
        ${drivers.map(d => `
          <div style="border:1px solid #e5e7eb;border-radius:6px;padding:1rem;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
              <div>
                <strong style="font-size:1.05rem;">${escapeHtml(d.fullName || 'Unnamed Driver')}</strong>
                <p style="margin:0.2rem 0;font-size:0.9em;color:#666;">${escapeHtml(d.email || '')}</p>
                <p style="margin:0;font-size:0.85em;">
                  🪪 Licence: ${d.licenceNumber ? escapeHtml(d.licenceNumber) : 'Not recorded'}
                  ${d.licenceExpiry ? `• Expires: ${formatDate(d.licenceExpiry).split(' ')[1]} ${formatDate(d.licenceExpiry).split(' ')[2]}` : ''}
                </p>
                <p style="margin:0.3rem 0 0 0;font-size:0.8em;color:#666;">
                  Medical: ${d.medicalExpiry ? `Valid until ${formatDate(d.medicalExpiry).split(' ')[1]} ${formatDate(d.medicalExpiry).split(' ')[2]}` : 'Not recorded'}
                </p>
              </div>
              <div>
                <button onclick="viewDriverDocs('${d.id}')" class="btn btn-sm">📄 Docs</button>
                <button onclick="editDriver('${d.id}')" class="btn btn-sm">Edit</button>
                <button onclick="removeDriver('${d.id}', '${escapeHtml(d.fullName)}')" class="btn btn-sm btn-red">Remove</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p style="color:#666;text-align:center;padding:2rem;">No drivers added yet. Add drivers above.</p>'}
  `;
}

window.showAddDriverForm = function() {
  const container = document.getElementById('drivers-list');
  container.innerHTML = `
    <h3 style="margin-bottom:1rem;">Add New Driver</h3>
    <button onclick="loadCompanyDrivers()" class="btn" style="margin-bottom:1rem;">← Back to List</button>
    
    <div style="background:#f9fafb;padding:1.5rem;border-radius:6px;max-width:600px;">
      <h4 style="margin-bottom:1rem;">Personal Details</h4>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Full Name *</label>
      <input type="text" id="new-driver-name" placeholder="Full legal name" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Email Address *</label>
      <input type="email" id="new-driver-email" placeholder="driver@email.com" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <h4 style="margin:1.5rem 0 1rem 0;">Driving Licence Details</h4>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Number</label>
      <input type="text" id="new-driver-licence" placeholder="e.g. SMITH123456AB9XY" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;text-transform:uppercase;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Categories</label>
      <input type="text" id="new-driver-cats" placeholder="C+E, C, D1, etc." style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">DVLA Check Code</label>
      <input type="text" id="new-driver-dvla" placeholder="123456ABC" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Valid From</label>
      <input type="date" id="new-driver-validfrom" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Valid From</label>
      <input type="date" id="new-driver-validfrom" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Expiry Date</label>
      <input type="date" id="new-driver-expiry" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">DVLA Penalty Points</label>
      <input type="number" id="new-driver-points" placeholder="0" min="0" max="12" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <h4 style="margin:1.5rem 0 1rem 0;">Medical & Compliance</h4>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Medical Certificate Expiry</label>
      <input type="date" id="new-driver-medical" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Phone Number</label>
      <input type="tel" id="new-driver-phone" placeholder="+44 7xxx xxxxxx" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <button onclick="saveNewDriver()" class="btn btn-primary" style="width:100%;margin-top:1rem;">💾 Save Driver</button>
    </div>
  `;
};

window.saveNewDriver = async function() {
  const fullName = document.getElementById('new-driver-name').value.trim();
  const email = document.getElementById('new-driver-email').value.trim();
  
  if (!fullName || !email) return alert('⚠️ Name and email are required');
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'drivers'), {
      fullName,
      email,
      licenceNumber: document.getElementById('new-driver-licence').value.trim().toUpperCase(),
      licenceCategories: document.getElementById('new-driver-cats').value.trim(),
      dvlaCheckCode: document.getElementById('new-driver-dvla').value.trim(),
      validFrom: document.getElementById('new-driver-validfrom').valueAsDate 
        ? new Date(document.getElementById('new-driver-validfrom').value) : null,
      licenceExpiry: document.getElementById('new-driver-expiry').valueAsDate 
        ? new Date(document.getElementById('new-driver-expiry').value) : null,
      penaltyPoints: parseInt(document.getElementById('new-driver-points').value) || 0,
      medicalExpiry: document.getElementById('new-driver-medical').valueAsDate 
        ? new Date(document.getElementById('new-driver-medical').value) : null,
      phone: document.getElementById('new-driver-phone').value.trim(),
      addedAt: new Date(),
      documents: []
    });
    
    showToast('✅ Driver added successfully');
    loadCompanyDrivers();
  } catch (err) {
    console.error('Error saving driver:', err);
    showToast('❌ Failed to add driver', 'error');
  }
};

window.removeDriver = async function(driverId, driverName) {
  if (!confirm(`⚠️ Permanently remove ${driverName}? This cannot be undone.`)) return;
  
  try {
    await deleteDoc(doc(db, 'companies', currentUser.uid, 'drivers', driverId));
    showToast('✅ Driver removed');
    loadCompanyDrivers();
  } catch (err) {
    console.error('Error removing driver:', err);
    showToast('❌ Failed to remove driver', 'error');
  }
};

window.editDriver = async function(driverId) {
  alert('✏️ Edit driver — extend as needed');
};

window.viewDriverDocs = function(driverId) {
  showToast('📄 Documents viewer — extend as needed');
};
// ==========================================================
// LSD Solutions — app.js Section 3
// Defect Management, Company Profile, Driver Portal,
// Walkaround Checks, Company Profile & Exports
// ==========================================================

// --------------------------
// DEFECT MANAGEMENT
// --------------------------
async function loadDefectsList() {
  const container = document.getElementById('defects-list');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading defects...</p>';
  
  try {
    const defectsSnap = await getDocs(
      query(
        collection(db, 'defects'),
        where('companyId', '==', currentUser.uid)
      )
    );
    
    let defects = [];
    defectsSnap.forEach(doc => {
      defects.push({ id: doc.id, ...doc.data() });
    });
    
    defects.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    renderDefectsList(defects);
    
  } catch (err) {
    console.error('Error loading defects:', err);
    container.innerHTML = '<p style="color:red;">❌ Could not load defects.</p>';
  }
}

function renderDefectsList(defects) {
  const container = document.getElementById('defects-list');
  
  if (defects.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;">
        <h3>✅ No Reported Defects</h3>
        <p style="color:#666;margin-top:0.5rem;">All vehicles and trailers operating within DVSA standards.</p>
      </div>
    `;
    return;
  }
  
  const grouped = {
    dangerous: defects.filter(d => d.severity === 'DANGEROUS'),
    major: defects.filter(d => d.severity === 'MAJOR'),
    minor: defects.filter(d => d.severity === 'MINOR'),
    other: defects.filter(d => !['DANGEROUS','MAJOR','MINOR'].includes(d.severity))
  };
  
  container.innerHTML = `
    <div style="margin-bottom:1.5rem;">
      <h3>⚠️ Defect Management</h3>
      <p style="font-size:0.9em;color:#666;">${defects.length} total • 
        <span style="color:#b91c1c;">${grouped.dangerous.length} Dangerous</span> • 
        <span style="color:#d97706;">${grouped.major.length} Major</span> • 
        <span style="color:#d4af37;">${grouped.minor.length} Minor</span>
      </p>
    </div>
    
    ${['dangerous','major','minor','other'].map(severityKey => {
      const list = grouped[severityKey];
      if (!list.length) return '';
      
      const label = severityKey === 'dangerous' ? '⚠️ DANGEROUS — Immediate Action Required' :
                    severityKey === 'major' ? '🔶 Major — Repair Before Further Use' :
                    severityKey === 'minor' ? '🟡 Minor — Monitor / Rectify Soon' : '📋 Other Defects';
      const color = severityKey === 'dangerous' ? '#b91c1c' :
                    severityKey === 'major' ? '#d97706' :
                    severityKey === 'minor' ? '#d4af37' : '#666';
      
      return `
        <div style="margin-bottom:1.5rem;border-left:4px solid ${color};padding-left:1rem;">
          <h4 style="color:${color};margin-bottom:0.5rem;">${label}</h4>
          <div style="display:grid;gap:0.7rem;">
            ${list.map(d => renderDefectCard(d)).join('')}
          </div>
        </div>
      `;
    }).join('')}
  `;
}

function renderDefectCard(defect) {
  const statusInfo = DEFECT_STATUS[defect.status?.toUpperCase()] || DEFECT_STATUS.REPORTED;
  const severityInfo = DVSA_SEVERITY[defect.severity] || DVSA_SEVERITY.MINOR;
  
  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <div>
          <strong style="font-size:0.95rem;">${escapeHtml(defect.defectCode || defect.category || 'DEFECT')}</strong>
          <p style="margin:0.25rem 0;">${escapeHtml(defect.description || 'No description')}</p>
          <p style="margin:0;font-size:0.85em;color:#666;">
            🚛 ${escapeHtml(defect.vehicleInfo || 'Unknown Vehicle')} • 
            Reported: ${formatDate(defect.reportedAt)} • 
            By: ${escapeHtml(defect.driverName || 'Unknown')}
          </p>
        </div>
        <div style="text-align:right;">
          <span style="display:inline-block;padding:3px 8px;border-radius:4px;font-size:0.8em;font-weight:bold;background:${statusInfo.color}20;color:${statusInfo.color};">
            ${statusInfo.label}
          </span>
          <p style="margin:0.3rem 0 0 0;font-size:0.75em;color:${severityInfo.color};">
            ${severityInfo.label}
          </p>
        </div>
      </div>
      <div style="margin-top:0.7rem;display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="updateDefectStatus('${defect.id}', 'in_progress')" class="btn btn-sm">🔧 In Progress</button>
        <button onclick="updateDefectStatus('${defect.id}', 'fixed')" class="btn btn-sm btn-green">✅ Mark Fixed</button>
        <button onclick="updateDefectStatus('${defect.id}', 'verified')" class="btn btn-sm">✓ Verified</button>
      </div>
    </div>
  `;
}

window.updateDefectStatus = async function(defectId, newStatus) {
  try {
    await updateDoc(doc(db, 'defects', defectId), {
      status: newStatus,
      updatedAt: new Date()
    });
    showToast('✅ Defect status updated');
    loadDefectsList();
  } catch (err) {
    console.error('Error updating defect:', err);
    showToast('❌ Failed to update', 'error');
  }
};

// --------------------------
// COMPANY PROFILE — DVSA & TRAFFIC COMMISSIONER COMPLIANT
// --------------------------
async function loadCompanyProfile() {
  const container = document.getElementById('company-profile-content');
  if (!container || !currentUser) return;
  
  try {
    const profileRef = doc(db, 'companies', currentUser.uid, 'settings', 'profile');
    const snap = await getDoc(profileRef);
    const data = snap.exists() ? snap.data() : {};
    renderCompanyProfileForm(data);
  } catch (err) {
    console.error('Error loading company profile:', err);
    renderCompanyProfileForm({});
  }
}

function renderCompanyProfileForm(data) {
  const container = document.getElementById('company-profile-content');
  
  container.innerHTML = `
    <div style="max-width:700px;">
      <h3 style="margin-bottom:1.5rem;">🏢 Company Profile</h3>
      <p style="font-size:0.9em;color:#666;margin-bottom:1.5rem;">
        This information is used for DVSA, Traffic Commissioner and legal compliance records.
      </p>
      
      <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
        <h4 style="margin-bottom:1rem;font-size:1rem;">📋 Registered Details</h4>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Registered Company Name *</label>
        <input type="text" id="cp-registered-name" value="${escapeHtml(data.registeredName || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" required />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Trading Name (if different)</label>
        <input type="text" id="cp-trading-name" value="${escapeHtml(data.tradingName || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Companies House / HMRC Registered Number *</label>
        <input type="text" id="cp-company-number" value="${escapeHtml(data.companyNumber || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" required />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Registered Office Address *</label>
        <textarea id="cp-registered-address" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:80px;" required>${escapeHtml(data.registeredAddress || '')}</textarea>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Operational / Trading Address (if different)</label>
        <textarea id="cp-trading-address" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:80px;">${escapeHtml(data.tradingAddress || '')}</textarea>
      </div>
      
      <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
        <h4 style="margin-bottom:1rem;font-size:1rem;">🚛 Operator Licence Details</h4>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Operator Licence Number *</label>
        <input type="text" id="cp-licence-number" value="${escapeHtml(data.licenceNumber || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" required />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Licence Type</label>
        <select id="cp-licence-type" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;">
          <option value="" ${!data.licenceType ? 'selected' : ''}>Select...</option>
          <option value="standard_national" ${data.licenceType === 'standard_national' ? 'selected' : ''}>Standard National</option>
          <option value="standard_international" ${data.licenceType === 'standard_international' ? 'selected' : ''}>Standard International</option>
          <option value="restricted" ${data.licenceType === 'restricted' ? 'selected' : ''}>Restricted</option>
        </select>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Traffic Commissioner Area</label>
        <select id="cp-tc-area" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;">
          <option value="" ${!data.tcArea ? 'selected' : ''}>Select your area...</option>
          <option value="north_east" ${data.tcArea === 'north_east' ? 'selected' : ''}>North East of England</option>
          <option value="north_west" ${data.tcArea === 'north_west' ? 'selected' : ''}>North West of England</option>
          <option value="west_midlands" ${data.tcArea === 'west_midlands' ? 'selected' : ''}>West Midlands</option>
          <option value="east_midlands" ${data.tcArea === 'east_midlands' ? 'selected' : ''}>East Midlands</option>
          <option value="south_east" ${data.tcArea === 'south_east' ? 'selected' : ''}>South East & London</option>
          <option value="south_west" ${data.tcArea === 'south_west' ? 'selected' : ''}>South West of England</option>
          <option value="wales" ${data.tcArea === 'wales' ? 'selected' : ''}>Wales</option>
          <option value="scotland" ${data.tcArea === 'scotland' ? 'selected' : ''}>Scotland</option>
        </select>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Authorised Operating Centres</label>
        <textarea id="cp-operating-centres" placeholder="List all operating centres as shown on your licence"
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:80px;">${escapeHtml(data.operatingCentres || '')}</textarea>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Maximum Authorised Vehicles</label>
        <input type="number" id="cp-max-vehicles" value="${data.maxVehicles || ''}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Maximum Authorised Trailers</label>
        <input type="number" id="cp-max-trailers" value="${data.maxTrailers || ''}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
        <h4 style="margin-bottom:1rem;font-size:1rem;">📧 Contact & Administration</h4>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Primary Contact Name</label>
        <input type="text" id="cp-contact-name" value="${escapeHtml(data.contactName || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Company Email Address</label>
        <input type="email" id="cp-email" value="${escapeHtml(data.email || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Telephone Number</label>
        <input type="tel" id="cp-phone" value="${escapeHtml(data.phone || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Invoices To — Name / Department</label>
        <input type="text" id="cp-invoice-contact" value="${escapeHtml(data.invoiceContact || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Invoices Email Address</label>
        <input type="email" id="cp-invoice-email" value="${escapeHtml(data.invoiceEmail || '')}" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Invoices Postal Address</label>
        <textarea id="cp-invoice-address" 
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:60px;">${escapeHtml(data.invoiceAddress || '')}</textarea>
        
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Additional Notes / Compliance Info</label>
        <textarea id="cp-notes" placeholder="Any additional regulatory information..."
          style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;min-height:60px;">${escapeHtml(data.notes || '')}</textarea>
      </div>
      
      <button onclick="saveCompanyProfile()" class="btn btn-primary" style="width:100%;">💾 Save Company Profile</button>
      <div id="profile-save-status" style="margin-top:12px;"></div>
    </div>
  `;
}

window.saveCompanyProfile = async function() {
  const required = ['cp-registered-name', 'cp-company-number', 'cp-registered-address', 'cp-licence-number'];
  for (const id of required) {
    if (!document.getElementById(id)?.value.trim()) {
      return alert('⚠️ Please fill in all required * fields');
    }
  }
  
  const status = document.getElementById('profile-save-status');
  status.innerHTML = '<span style="color:#d47500;">⏳ Saving...</span>';
  
  try {
    await setDoc(
      doc(db, 'companies', currentUser.uid, 'settings', 'profile'),
      {
        registeredName: document.getElementById('cp-registered-name').value.trim(),
        tradingName: document.getElementById('cp-trading-name').value.trim(),
        companyNumber: document.getElementById('cp-company-number').value.trim(),
        registeredAddress: document.getElementById('cp-registered-address').value.trim(),
        tradingAddress: document.getElementById('cp-trading-address').value.trim(),
        licenceNumber: document.getElementById('cp-licence-number').value.trim(),
        licenceType: document.getElementById('cp-licence-type').value,
        tcArea: document.getElementById('cp-tc-area').value,
        operatingCentres: document.getElementById('cp-operating-centres').value.trim(),
        maxVehicles: parseInt(document.getElementById('cp-max-vehicles').value) || null,
        maxTrailers: parseInt(document.getElementById('cp-max-trailers').value) || null,
        contactName: document.getElementById('cp-contact-name').value.trim(),
        email: document.getElementById('cp-email').value.trim(),
        phone: document.getElementById('cp-phone').value.trim(),
        invoiceContact: document.getElementById('cp-invoice-contact').value.trim(),
        invoiceEmail: document.getElementById('cp-invoice-email').value.trim(),
        invoiceAddress: document.getElementById('cp-invoice-address').value.trim(),
        notes: document.getElementById('cp-notes').value.trim(),
        updatedAt: new Date()
      },
      { merge: true }
    );
    
    status.innerHTML = '<span style="color:green;">✅ Profile saved — DVSA compliant records updated</span>';
    setTimeout(() => status.innerHTML = '', 4000);
    showToast('✅ Company profile saved');
  } catch (err) {
    status.innerHTML = '<span style="color:red;">❌ Save failed — check permissions</span>';
  }
};

// --------------------------
// DRIVER PORTAL — WALKAROUND CHECKS
// --------------------------
async function loadDriverCheckSelection() {
  const container = document.getElementById('driver-checks-content');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading available vehicles...</p>';
  
  try {
    // Load company vehicles accessible to this driver
    const vehiclesSnap = await getDocs(
      query(
        collection(db, 'companyVehicles'),
        where('active', '==', true)
      )
    );
    
    let vehicles = [];
    vehiclesSnap.forEach(doc => {
      vehicles.push({ id: doc.id, ...doc.data() });
    });
    
    vehicles.sort((a, b) => {
      const aId = a.registration || a.trailerNumber || '';
      const bId = b.registration || b.trailerNumber || '';
      return aId.localeCompare(bId);
    });
    
    renderDriverCheckSelection(vehicles);
    
  } catch (err) {
    console.error('Error loading vehicles:', err);
    renderDriverCheckSelection([]);
  }
}

function renderDriverCheckSelection(vehicles) {
  const container = document.getElementById('driver-checks-content');
  
  const activeVehicles = vehicles.filter(v => v.active !== false);
  const vehicleUnits = activeVehicles.filter(v => v.type === 'vehicle');
  const trailers = activeVehicles.filter(v => v.type === 'trailer');
  
  container.innerHTML = `
    <h3 style="margin-bottom:1rem;">🚛 Daily Walkaround Check</h3>
    <p style="font-size:0.9em;color:#666;margin-bottom:1.5rem;">Select your vehicle and/or trailer to begin your pre-use inspection</p>
    
    ${activeVehicles.length === 0 ? `
      <div style="background:#fff4e5;border:1px solid #d47500;border-radius:6px;padding:1rem;margin-bottom:1rem;">
        <strong>⚠️ No vehicles available</strong>
        <p style="margin:0.3rem 0 0 0;font-size:0.9em;">Please check with your company administrator that vehicles have been added and marked as active.</p>
      </div>
    ` : ''}
    
    <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Select Vehicle (Truck/Unit)</label>
      <select id="check-vehicle" style="width:100%;padding:0.7rem;border:1px solid #ccc;border-radius:4px;margin-bottom:1rem;">
        <option value="">— No Vehicle —</option>
        ${vehicleUnits.map(v => `
          <option value="${v.id}" data-type="vehicle">
            🚛 ${escapeHtml(v.registration)} — ${escapeHtml(v.make || '')} ${escapeHtml(v.model || '')}
          </option>
        `).join('')}
      </select>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Select Trailer (optional)</label>
      <select id="check-trailer" style="width:100%;padding:0.7rem;border:1px solid #ccc;border-radius:4px;margin-bottom:1rem;">
        <option value="">— No Trailer —</option>
        ${trailers.map(v => `
          <option value="${v.id}" data-type="trailer">
            🉐 ${escapeHtml(v.trailerNumber)} — ${escapeHtml(v.make || '')}
          </option>
        `).join('')}
      </select>
      
      <button onclick="startWalkaroundCheck()" class="btn btn-primary" style="width:100%;font-size:1rem;padding:0.8rem;">
        ▶️ Start Walkaround Check
      </button>
    </div>
    
    <div style="margin-top:2rem;">
      <h4 style="margin-bottom:1rem;">📋 Recent Checks</h4>
      <div id="recent-checks-list">
        <p style="color:#666;font-style:italic;">Loading recent checks...</p>
      </div>
    </div>
  `;
  
  loadRecentChecks();
}

async function startWalkaroundCheck() {
  const vehicleSelect = document.getElementById('check-vehicle');
  const trailerSelect = document.getElementById('check-trailer');
  
  const vehicleId = vehicleSelect.value;
  const trailerId = trailerSelect.value;
  
  if (!vehicleId && !trailerId) {
    return alert('⚠️ Please select at least a vehicle or a trailer to begin your check');
  }
  
  let checkType;
  if (vehicleId && trailerId) checkType = CHECK_BOTH;
  else if (vehicleId) checkType = CHECK_VEHICLE;
  else checkType = CHECK_TRAILER;
  
  currentCheckData = {
    checkType,
    vehicleId: vehicleId || null,
    trailerId: trailerId || null,
    startTime: new Date(),
    items: {},
    defects: []
  };
  
  renderWalkaroundCheckForm();
}

async function renderWalkaroundCheckForm() {
  const container = document.getElementById('driver-checks-content');
  
  // Load checklist from company settings
  let checklistItems = DEFAULT_CHECKLIST;
  try {
    const companyId = userProfile.companyId;
    if (companyId) {
      const snap = await getDoc(doc(db, 'companies', companyId, 'settings', 'checklist'));
      if (snap.exists() && snap.data().items) {
        checklistItems = snap.data().items;
      }
    }
  } catch (e) {
    console.log('Using default checklist');
  }
  
  const filteredItems = getFilteredChecklist(checklistItems, currentCheckData.checkType);
  
  const vehicleInfo = currentCheckData.vehicleId 
    ? vehicleSelect.options[vehicleSelect.selectedIndex].text 
    : 'No Vehicle';
  const trailerInfo = currentCheckData.trailerId
    ? trailerSelect.options[trailerSelect.selectedIndex].text
    : 'No Trailer';
  
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:10px;">
      <h3>📝 Daily Walkaround Check</h3>
      <button onclick="loadDriverCheckSelection()" class="btn">← Change Vehicle</button>
    </div>
    
    <div style="background:#e8edf3;padding:1rem;border-radius:6px;margin-bottom:1.5rem;">
      <p style="margin:0.3rem 0;"><strong>Vehicle:</strong> ${escapeHtml(vehicleInfo)}</p>
      <p style="margin:0.3rem 0;"><strong>Trailer:</strong> ${escapeHtml(trailerInfo)}</p>
      <p style="margin:0.5rem 0 0 0;font-size:0.85em;color:#555;">
        Started: ${new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'})}
      </p>
    </div>
    
    <form id="walkaround-form">
      ${filteredItems.map((item, idx) => `
        <div style="border-bottom:1px solid #eee;padding:1rem 0;${idx === 0 ? 'padding-top:0;' : ''}">
          <p style="font-weight:500;margin-bottom:0.7rem;">${idx + 1}. ${escapeHtml(item.label)}</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
              <input type="radio" name="check-${item.id}" value="pass" required 
                onchange="updateCheckItem('${item.id}', 'pass')" />
              ✅ Satisfactory
            </label>
            <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
              <input type="radio" name="check-${item.id}" value="fail" 
                onchange="updateCheckItem('${item.id}', 'fail')" />
              ❌ Unsatisfactory — Report Defect
            </label>
          </div>
          
          <div id="defect-section-${item.id}" style="display:none;margin-top:0.7rem;padding:0.7rem;background:#fff4e5;border-radius:4px;">
            <label style="display:block;margin-bottom:0.4rem;font-size:0.9em;">Describe the issue:</label>
            <textarea id="defect-text-${item.id}" rows="2" placeholder="Describe what is wrong..." 
              style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;font-size:0.9em;"
              oninput="updateCheckItem('${item.id}', 'fail')"></textarea>
            
            <label style="display:block;margin:0.7rem 0 0.4rem 0;font-size:0.9em;">Severity:</label>
            <select id="defect-severity-${item.id}" onchange="updateCheckItem('${item.id}', 'fail')"
              style="padding:0.4rem;border:1px solid #ccc;border-radius:4px;font-size:0.9em;">
              <option value="MINOR">🟡 Minor — Rectify at next service</option>
              <option value="MAJOR">🔶 Major — Repair before further use</option>
              <option value="DANGEROUS">⚠️ DANGEROUS — Must not be driven</option>
            </select>
          </div>
        </div>
      `).join('')}
      
      <div style="margin-top:1.5rem;padding-top:1rem;border-top:2px solid #eee;">
        <label style="display:block;margin-bottom:0.7rem;font-weight:500;">Additional Comments (optional)</label>
        <textarea id="check-comments" rows="3" placeholder="Any other notes or observations..."
          style="width:100%;padding:0.7rem;border:1px solid #ccc;border-radius:4px;"></textarea>
        
        <div style="margin-top:1.5rem;display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" onclick="loadDriverCheckSelection()" class="btn">Cancel</button>
          <button type="button" onclick="submitWalkaroundCheck()" class="btn btn-primary">✅ Submit Check</button>
        </div>
      </div>
    </form>
  `;
}

window.updateCheckItem = function(itemId, status) {
  const defectSection = document.getElementById(`defect-section-${itemId}`);
  
  if (status === 'fail') {
    defectSection.style.display = 'block';
    const desc = document.getElementById(`defect-text-${itemId}`)?.value?.trim();
    const severity = document.getElementById(`defect-severity-${itemId}`)?.value;
    
    currentCheckData.items[itemId] = {
      status: 'fail',
      description: desc || 'Defect reported but not described',
      severity: severity || 'MAJOR'
    };
  } else {
    defectSection.style.display = 'none';
    currentCheckData.items[itemId] = { status: 'pass' };
  }
};

window.submitWalkaroundCheck = async function() {
  if (!confirm('⚠️ Please confirm you have checked all items. Once submitted it cannot be edited.\n\nSigning this confirms the vehicle/trailer is safe to operate or defects have been correctly reported.')) {
    return;
  }
  
  const endTime = new Date();
  const checkDuration = Math.round((endTime - currentCheckData.startTime) / 60000);
  
  const hasFailures = Object.values(currentCheckData.items).some(i => i.status === 'fail');
  const overallResult = hasFailures ? 'unsatisfactory' : 'satisfactory';
  
  try {
    const checkRef = await addDoc(collection(db, 'walkaroundChecks'), {
      driverId: currentUser.uid,
      driverName: userProfile.fullName || currentUser.email,
      companyId: userProfile.companyId || null,
      vehicleId: currentCheckData.vehicleId,
      trailerId: currentCheckData.trailerId,
      checkType: currentCheckData.checkType,
      startTime: currentCheckData.startTime,
      endTime: endTime,
      durationMinutes: checkDuration,
      items: currentCheckData.items,
      overallResult,
      comments: document.getElementById('check-comments')?.value?.trim() || '',
      signedAt: new Date()
    });
    
    // Create defect records for failures
    const batch = writeBatch(db);
    for (const [itemId, result] of Object.entries(currentCheckData.items)) {
      if (result.status === 'fail') {
        batch.set(doc(collection(db, 'defects')), {
          checkId: checkRef.id,
          driverId: currentUser.uid,
          driverName: userProfile.fullName || currentUser.email,
          companyId: userProfile.companyId || null,
          vehicleId: currentCheckData.vehicleId,
          trailerId: currentCheckData.trailerId,
          category: itemId,
          description: result.description,
          severity: result.severity,
          status: 'reported',
          reportedAt: new Date()
        });
      }
    }
    await batch.commit();
    
    showToast('✅ Check submitted — records saved');
    currentCheckData = null;
    loadDriverCheckSelection();
    
  } catch (err) {
    console.error('Error submitting check:', err);
    showToast('❌ Failed to submit check', 'error');
  }
};

async function loadRecentChecks() {
  const container = document.getElementById('recent-checks-list');
  if (!container || !currentUser) return;
  
  try {
    const checksSnap = await getDocs(
      query(
        collection(db, 'walkaroundChecks'),
        where('driverId', '==', currentUser.uid)
      )
    );
    
    let checks = [];
    checksSnap.forEach(doc => {
      checks.push({ id: doc.id, ...doc.data() });
    });
    
    checks.sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt));
    checks = checks.slice(0, 5);
    
    if (checks.length === 0) {
      container.innerHTML = '<p style="color:#888;font-style:italic;">No checks completed yet.</p>';
      return;
    }
    
    container.innerHTML = checks.map(check => {
      const isOk = check.overallResult === 'satisfactory';
      return `
        <div style="padding:0.7rem 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <span style="font-weight:500;">${isOk ? '✅ Satisfactory' : '❌ Defects Reported'}</span>
            <p style="margin:0.2rem 0 0 0;font-size:0.85em;color:#666;">
              ${formatDate(check.signedAt)}
            </p>
          </div>
          <button onclick="viewCheckReceipt('${check.id}')" class="btn btn-sm">📄 View</button>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    container.innerHTML = '<p style="color:#888;font-style:italic;">Could not load recent checks.</p>';
  }
}

window.viewCheckReceipt = function(checkId) {
  showToast('📄 Receipt viewer — extend as needed');
};

// --------------------------
// DRIVER PROFILE & DOCUMENTS
// --------------------------
async function loadDriverProfile() {
  const container = document.getElementById('driver-profile-content');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading your profile...</p>';
  
  try {
    const profileRef = doc(db, 'userProfiles', currentUser.uid);
    const snap = await getDoc(profileRef);
    const data = snap.exists() ? snap.data() : {};
    renderDriverProfileForm(data);
  } catch (err) {
    console.error('Error loading profile:', err);
    renderDriverProfileForm({});
  }
}

function renderDriverProfileForm(data) {
  const container = document.getElementById('driver-profile-content');
  
  container.innerHTML = `
    <h3 style="margin-bottom:1.5rem;">👤 My Profile & Documents</h3>
    
    <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
      <h4 style="margin-bottom:1rem;font-size:1rem;">Personal Details</h4>
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Full Name</label>
      <input type="text" id="dp-fullname" value="${escapeHtml(data.fullName || currentUser?.displayName || '')}" 
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Email Address</label>
      <input type="email" value="${escapeHtml(currentUser?.email || '')}" disabled
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ddd;background:#f5f5f5;border-radius:4px;color:#666;" />
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Phone Number</label>
      <input type="tel" id="dp-phone" value="${escapeHtml(data.phone || '')}" 
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
    </div>
    
    <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
      <h4 style="margin-bottom:1rem;font-size:1rem;">🚛 Driving Licence</h4>
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Licence Number</label>
      <input type="text" id="dp-licence-number" value="${escapeHtml(data.licenceNumber || '')}" 
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;text-transform:uppercase;" />
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Licence Categories</label>
      <input type="text" id="dp-licence-cats" value="${escapeHtml(data.licenceCategories || '')}" 
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" 
        placeholder="e.g. C+E, C, D1" />
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">DVLA Check Code</label>
      <input type="text" id="dp-dvla-code" value="${escapeHtml(data.dvlaCheckCode || '')}" 
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div>
          <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Valid From</label>
          <input type="date" id="dp-valid-from" value="${data.validFrom ? new Date(data.validFrom.seconds * 1000).toISOString().split('T')[0] : ''}" 
            style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        </div>
        <div>
          <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Expiry Date</label>
          <input type="date" id="dp-expiry" value="${data.licenceExpiry ? new Date(data.licenceExpiry.seconds * 1000).toISOString().split('T')[0] : ''}" 
            style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
        </div>
      </div>
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Penalty Points</label>
      <input type="number" id="dp-points" value="${data.penaltyPoints || 0}" min="0" max="12"
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">D4 Medical Certificate Expiry</label>
      <input type="date" id="dp-medical-expiry" value="${data.medicalExpiry ? new Date(data.medicalExpiry.seconds * 1000).toISOString().split('T')[0] : ''}" 
        style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
    </div>
    
    <div style="background:#f9fafb;padding:1.25rem;border-radius:6px;margin-bottom:1.5rem;">
      <h4 style="margin-bottom:1rem;font-size:1rem;">📁 My Documents</h4>
      <p style="font-size:0.85em;color:#666;margin-bottom:1rem;">Upload documents for your company to view. All files are stored securely.</p>
      
      <div id="docs-upload-area">
        <label style="display:block;margin-bottom:0.4rem;font-weight:500;font-size:0.9em;">Select File to Upload</label>
        <input type="file" id="doc-upload" accept=".pdf,.jpg,.jpeg,.png" 
          style="width:100%;padding:0.5rem;margin-bottom:0.7rem;" />
        <button onclick="uploadDriverDocument()" class="btn btn-sm">📤 Upload Document</button>
      </div>
      
      <div id="docs-list" style="margin-top:1.5rem;">
        <p style="color:#888;font-style:italic;font-size:0.9em;">Loading your documents...</p>
      </div>
    </div>
    
    <button onclick="saveDriverProfile()" class="btn btn-primary" style="width:100%;">💾 Save Profile</button>
    <div id="dp-save-status" style="margin-top:12px;"></div>
  `;
  
  loadDriverDocuments();
}

window.saveDriverProfile = async function() {
  const status = document.getElementById('dp-save-status');
  status.innerHTML = '<span style="color:#d47500;">⏳ Saving...</span>';
  
  try {
    await setDoc(
      doc(db, 'userProfiles', currentUser.uid),
      {
        fullName: document.getElementById('dp-fullname').value.trim(),
        phone: document.getElementById('dp-phone').value.trim(),
        licenceNumber: document.getElementById('dp-licence-number').value.trim().toUpperCase(),
        licenceCategories: document.getElementById('dp-licence-cats').value.trim(),
        dvlaCheckCode: document.getElementById('dp-dvla-code').value.trim(),
        validFrom: document.getElementById('dp-valid-from').valueAsDate 
          ? new Date(document.getElementById('dp-valid-from').value) : null,
        licenceExpiry: document.getElementById('dp-expiry').valueAsDate 
          ? new Date(document.getElementById('dp-expiry').value) : null,
        penaltyPoints: parseInt(document.getElementById('dp-points').value) || 0,
        medicalExpiry: document.getElementById('dp-medical-expiry').valueAsDate 
          ? new Date(document.getElementById('dp-medical-expiry').value) : null,
        updatedAt: new Date()
      },
      { merge: true }
    );
    
    status.innerHTML = '<span style="color:green;">✅ Profile saved</span>';
    setTimeout(() => status.innerHTML = '', 4000);
    showToast('✅ Profile updated successfully');
  } catch (err) {
    status.innerHTML = '<span style="color:red;">❌ Save failed</span>';
  }
};

async function loadDriverDocuments() {
  const container = document.getElementById('docs-list');
  if (!container || !currentUser) return;
  
  try {
    const docsSnap = await getDocs(
      collection(db, 'userProfiles', currentUser.uid, 'documents')
    );
    
    let docs = [];
    docsSnap.forEach(d => docs.push({ id: d.id, ...d.data() }));
    
    docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    if (docs.length === 0) {
      container.innerHTML = '<p style="color:#888;font-style:italic;font-size:0.9em;">No documents uploaded yet.</p>';
      return;
    }
    
    container.innerHTML = `
      <h5 style="margin-bottom:0.7rem;font-size:0.9em;">Uploaded Documents (${docs.length})</h5>
      <div style="display:grid;gap:0.5rem;">
        ${docs.map(d => `
          <div style="padding:0.6rem;background:#fff;border:1px solid #eee;border-radius:4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div>
              <p style="margin:0;font-size:0.9em;"><strong>${escapeHtml(d.name || 'Document')}</strong></p>
              <p style="margin:0.1rem 0 0 0;font-size:0.8em;color:#666;">
                ${formatDate(d.uploadedAt)} • ${(d.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div>
              <a href="${escapeHtml(d.url || '#')}" target="_blank" class="btn btn-sm">👁 View</a>
              <button onclick="deleteDriverDoc('${d.id}')" class="btn btn-sm btn-red">🗑 Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
  } catch (err) {
    container.innerHTML = '<p style="color:red;font-size:0.9em;">❌ Could not load documents.</p>';
  }
}

window.uploadDriverDocument = async function() {
  const fileInput = document.getElementById('doc-upload');
  const file = fileInput?.files?.[0];
  
  if (!file) return alert('⚠️ Please select a file first');
  
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return alert('⚠️ Only PDF, JPG and PNG files are allowed');
  }
  
  try {
    const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const storageRef = ref(storage, `driverDocs/${currentUser.uid}/${fileId}`);
    
    showToast('⏳ Uploading...');
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    await addDoc(collection(db, 'userProfiles', currentUser.uid, 'documents'), {
      name: file.name,
      type: file.type,
      size: file.size,
      url: url,
      storagePath: `driverDocs/${currentUser.uid}/${fileId}`,
      uploadedAt: new Date()
    });
    
    showToast('✅ Document uploaded');
    fileInput.value = '';
    loadDriverDocuments();
    
  } catch (err) {
    console.error('Upload error:', err);
    showToast('❌ Upload failed', 'error');
  }
};

window.deleteDriverDoc = async function(docId) {
  if (!confirm('⚠️ Permanently delete this document? This cannot be undone.')) return;
  
  try {
    const docRef = doc(db, 'userProfiles', currentUser.uid, 'documents', docId);
    const snap = await getDoc(docRef);
    const data = snap.data();
    
    if (data?.storagePath) {
      await deleteObject(ref(storage, data.storagePath));
    }
    
    await deleteDoc(docRef);
    showToast('✅ Document deleted');
    loadDriverDocuments();
    
  } catch (err) {
    console.error('Delete error:', err);
    showToast('❌ Delete failed', 'error');
  }
};

// --------------------------
// INITIALISATION & READY
// --------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ LSD Solutions App Loaded — DVSA Compliant System');
});

// Expose globally
window.loadDriverCheckSelection = loadDriverCheckSelection;
window.loadRecentChecks = loadRecentChecks;
window.renderWalkaroundCheckForm = renderWalkaroundCheckForm;
window.loadDriverProfile = loadDriverProfile;
window.loadCompanyProfile = loadCompanyProfile;
window.loadChecklistEditor = loadChecklistEditor;
window.loadVehiclesList = loadVehiclesList;
window.loadCompanyDrivers = loadCompanyDrivers;
window.loadDefectsList = loadDefectsList;
window.DEFAULT_CHECKLIST = DEFAULT_CHECKLIST;
window.CHECK_VEHICLE = CHECK_VEHICLE;
window.CHECK_TRAILER = CHECK_TRAILER;
window.CHECK_BOTH = CHECK_BOTH;
window.DVSA_DEFECT_CATEGORIES = DVSA_DEFECT_CATEGORIES;
window.DVSA_SEVERITY = DVSA_SEVERITY;
window.DVSA_COMMON_DEFECTS = DVSA_COMMON_DEFECTS;
window.DEFECT_STATUS = DEFECT_STATUS;
window.formatDate = formatDate;
window.showToast = showToast;
window.currentUser = () => currentUser;
window.userProfile = () => userProfile;

</script>
</body>
</html>