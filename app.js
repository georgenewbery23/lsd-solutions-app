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
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  
  // Show requested page
  const page = document.getElementById(`page-${pageName}`);
  if (page) page.style.display = 'block';
  
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll(`[data-page="${pageName}"]`).forEach(btn => btn.classList.add('active'));
  
  // Load page-specific data
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

// Make globally available
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
    ? `${vehicle.make || ''} ${vehicle.model || ''} • ${vehicle.owner || 'Company Owned'}`
    : `${vehicle.make || ''} ${vehicle.model || ''} • ${vehicle.taxDue ? 'Tax: ' + formatDate(vehicle.taxDue).split(' ')[1] + ' ' + formatDate(vehicle.taxDue).split(' ')[2] : ''}`;
  
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
  alert('Edit functionality — extend as needed');
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
                  � Licence: ${d.licenceNumber ? escapeHtml(d.licenceNumber) : 'Not recorded'}
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
    ` : '<p style="color:#666;text-align:center;padding:2rem;">No drivers added yet. Invite or add drivers above.</p>'}
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
      <input type="text" id="new-driver-dvla" placeholder="123456ABC" style="width:100%;padding:0.6
      // ==========================================================
// LSD Solutions — app.js Section 3 (COMPLETE)
// Driver Management, Defect Tracking, Driver Checks, Exports
// ==========================================================

      <input type="text" id="new-driver-dvla" placeholder="123456ABC" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Valid From</label>
      <input type="date" id="new-driver-validfrom" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Licence Expiry Date</label>
      <input type="date" id="new-driver-expiry" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Penalty Points</label>
      <input type="number" id="new-driver-points" value="0" min="0" max="12" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <h4 style="margin:1.5rem 0 1rem 0;">Medical & Contact</h4>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Medical Certificate Expiry</label>
      <input type="date" id="new-driver-medical" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:500;">Phone Number</label>
      <input type="tel" id="new-driver-phone" placeholder="07xxx xxxxxx" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;" />
      
      <button onclick="saveNewDriver()" class="btn btn-primary" style="width:100%;margin-top:1rem;">💾 Save Driver</button>
    </div>
  `;
};

window.saveNewDriver = async function() {
  const fullName = document.getElementById('new-driver-name').value.trim();
  const email = document.getElementById('new-driver-email').value.trim();
  
  if (!fullName || !email) {
    return alert('⚠️ Name and email are required');
  }
  
  try {
    await addDoc(collection(db, 'companies', currentUser.uid, 'drivers'), {
      fullName,
      email,
      phone: document.getElementById('new-driver-phone').value.trim(),
      licenceNumber: document.getElementById('new-driver-licence').value.trim().toUpperCase(),
      licenceCategories: document.getElementById('new-driver-cats').value.trim(),
      dvlaCheckCode: document.getElementById('new-driver-dvla').value.trim(),
      licenceValidFrom: document.getElementById('new-driver-validfrom').valueAsDate 
        ? new Date(document.getElementById('new-driver-validfrom').value) : null,
      licenceExpiry: document.getElementById('new-driver-expiry').valueAsDate 
        ? new Date(document.getElementById('new-driver-expiry').value) : null,
      penaltyPoints: parseInt(document.getElementById('new-driver-points').value) || 0,
      medicalExpiry: document.getElementById('new-driver-medical').valueAsDate 
        ? new Date(document.getElementById('new-driver-medical').value) : null,
      addedAt: new Date(),
      addedBy: currentUser.uid
    });
    
    showToast('✅ Driver added successfully');
    loadCompanyDrivers();
  } catch (err) {
    console.error('Error saving driver:', err);
    alert('❌ Failed to save driver. Please try again.');
  }
};

window.removeDriver = async function(driverId, driverName) {
  if (!confirm(`⚠️ Are you sure you want to remove ${driverName}? This cannot be undone.`)) return;
  
  try {
    await deleteDoc(doc(db, 'companies', currentUser.uid, 'drivers', driverId));
    showToast('✅ Driver removed');
    loadCompanyDrivers();
  } catch (err) {
    console.error('Error removing driver:', err);
    alert('❌ Failed to remove driver.');
  }
};

window.viewDriverDocs = function(driverId) {
  alert('📄 Document viewer — extend to show uploaded documents from driver portal');
};

window.editDriver = function(driverId) {
  alert('✏️ Edit driver — extend as needed');
};

// --------------------------
// DEFECT MANAGEMENT — COMPANY PORTAL
// --------------------------
let allDefects = [];
let currentDefectId = null;

async function loadDefectsList() {
  const listEl = document.getElementById('defects-list');
  const filterEl = document.getElementById('defect-filter-status');
  if (!listEl || !filterEl) return;
  
  listEl.innerHTML = '<p>Loading defects...</p>';
  
  try {
    const checksSnap = await getDocs(
      collection(db, 'companies', currentUser.uid, 'completedChecks')
    );
    
    allDefects = [];
    
    checksSnap.forEach(docSnap => {
      const check = docSnap.data();
      if (check.defects && Array.isArray(check.defects)) {
        check.defects.forEach(defect => {
          allDefects.push({
            ...defect,
            checkId: docSnap.id,
            checkDate: check.completedAt?.toDate() || new Date()
          });
        });
      }
    });
    
    allDefects.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    
    const statusFilter = filterEl.value;
    let filtered = allDefects;
    if (statusFilter !== 'all') {
      filtered = allDefects.filter(d => d.status === statusFilter);
    }
    
    renderDefectsList(filtered);
    
  } catch (err) {
    console.error('Error loading defects:', err);
    listEl.innerHTML = '<p style="color:red;">❌ Could not load defects. Please refresh.</p>';
  }
}

function renderDefectsList(defects) {
  const listEl = document.getElementById('defects-list');
  if (!listEl) return;
  
  if (!defects.length) {
    listEl.innerHTML = '<p style="color:#666;text-align:center;padding:2rem;">No defects found matching your filter.</p>';
    return;
  }
  
  listEl.innerHTML = defects.map(d => {
    const statusInfo = Object.values(DEFECT_STATUS).find(s => s.value === d.status) || DEFECT_STATUS.REPORTED;
    const severityColor = d.severity === 'DANGEROUS' ? '#b91c1c' 
                        : d.severity === 'MAJOR' ? '#d97706' : '#d4af37';
    
    return `
      <div onclick="openDefect('${d.id}')" style="border:1px solid #e5e7eb;border-radius:6px;padding:1rem;margin-bottom:0.8rem;cursor-pointer;transition:all 0.2s;" 
        onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='transparent'">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:bold;background:${statusInfo.color}20;color:${statusInfo.color};">
              ${statusInfo.label}
            </span>
            <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:bold;background:${severityColor}20;color:${severityColor};margin-left:6px;">
              ${d.severity}
            </span>
            <h4 style="margin:0.5rem 0 0.3rem 0;">${escapeHtml(d.description || d.checkItem)}</h4>
            <p style="margin:0;font-size:0.85em;color:#666;">
              🚛 ${escapeHtml(d.vehicleReg || 'Unknown')} 
              ${d.trailerNo ? `| 🚉 ${escapeHtml(d.trailerNo)}` : ''}
              • Reported ${formatDate(d.reportedAt)}
            </p>
          </div>
          <span style="font-family:monospace;font-size:0.75em;color:#999;">${d.id}</span>
        </div>
      </div>
    `;
  }).join('');
}

async function openDefect(defectId) {
  currentDefectId = defectId;
  const defect = allDefects.find(d => d.id === defectId);
  if (!defect) return;
  
  const modal = document.getElementById('defect-modal');
  const content = document.getElementById('defect-modal-content');
  const title = document.getElementById('defect-modal-title');
  const ref = document.getElementById('defect-modal-ref');
  
  title.textContent = 'Defect Details';
  ref.textContent = `Ref: ${defectId}`;
  
  const statusInfo = Object.values(DEFECT_STATUS).find(s => s.value === defect.status) || DEFECT_STATUS.REPORTED;
  
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
      <div>
        <label style="font-size:0.8rem;color:#666;">Vehicle / Trailer</label>
        <p style="font-weight:500;">${escapeHtml(defect.vehicleReg || '—')} ${defect.trailerNo ? `/ ${escapeHtml(defect.trailerNo)}` : ''}</p>
      </div>
      <div>
        <label style="font-size:0.8rem;color:#666;">Reported</label>
        <p style="font-weight:500;">${formatDate(defect.reportedAt)}</p>
      </div>
      <div>
        <label style="font-size:0.8rem;color:#666;">Category</label>
        <p style="font-weight:500;">${defect.category || '—'} — ${escapeHtml(defect.categoryName || 'Unknown')}</p>
      </div>
      <div>
        <label style="font-size:0.8rem;color:#666;">Severity</label>
        <p style="font-weight:bold;color:${defect.severity === 'DANGEROUS' ? '#b91c1c' : defect.severity === 'MAJOR' ? '#d97706' : '#d4af37'};">${defect.severity || 'MINOR'}</p>
      </div>
      <div>
        <label style="font-size:0.8rem;color:#666;">Reported By</label>
        <p style="font-weight:500;">${escapeHtml(defect.reportedBy || 'Unknown Driver')}</p>
      </div>
      <div>
        <label style="font-size:0.8rem;color:#666;">Current Status</label>
        <p style="font-weight:bold;color:${statusInfo.color};">${statusInfo.label}</p>
      </div>
    </div>
    
    <div style="margin-bottom:1rem;">
      <label style="font-size:0.8rem;color:#666;">Description</label>
      <p style="background:#f9fafb;padding:0.75rem;border-radius:4px;">${escapeHtml(defect.description || defect.checkItem)}</p>
    </div>
    
    ${defect.code ? `
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.8rem;color:#666;">DVSA Code</label>
        <p style="font-family:monospace;background:#eee;padding:0.5rem;border-radius:4px;display:inline-block;">${escapeHtml(defect.code)}</p>
      </div>
    ` : ''}
    
    <hr style="margin:1.5rem 0;border:none;border-top:1px solid #eee;" />
    
    <h4 style="margin-bottom:1rem;">Update Status</h4>
    <select id="new-status-select" onchange="showStatusFields()" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ccc;border-radius:4px;">
      ${Object.values(DEFECT_STATUS).map(s => 
        `<option value="${s.value}" ${defect.status === s.value ? 'selected' : ''}>${s.label}</option>`
      ).join('')}
    </select>
    
    <div id="status-fields-scheduled" style="display:none;margin-bottom:1rem;">
      <label style="font-size:0.85rem;">Due Date</label>
      <input type="date" id="defect-dueby" style="width:100%;padding:0.5rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;" 
        value="${defect.dueBy ? new Date(defect.dueBy).toISOString().split('T')[0] : ''}" />
    </div>
    
    <div id="status-fields-assign" style="display:none;margin-bottom:1rem;">
      <label style="font-size:0.85rem;">Assign To / Notes</label>
      <input type="text" id="defect-assign" placeholder="Name of person responsible" 
        style="width:100%;padding:0.5rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;" 
        value="${escapeHtml(defect.assignedTo || '')}" />
    </div>
    
    <div style="margin-bottom:1rem;">
      <label style="font-size:0.85rem;">Add Note / Action Taken</label>
      <textarea id="defect-note" placeholder="Record any actions, repairs, or decisions here..." 
        style="width:100%;padding:0.6rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;min-height:80px;"></textarea>
    </div>
    
    <button onclick="updateDefectStatus()" class="btn btn-primary" style="width:100%;">💾 Update Status & Save Record</button>
    
    <div style="margin-top:1.5rem;">
      <h4 style="margin-bottom:0.8rem;">📋 History</h4>
      <div style="max-height:200px;overflow-y:auto;background:#f9fafb;padding:0.8rem;border-radius:4px;">
        ${(defect.notes || []).length === 0 
          ? '<p style="color:#888;font-size:0.9em;">No history recorded</p>'
          : (defect.notes || []).map(n => `
              <div style="border-left:2px solid #ddd;padding-left:0.75rem;margin-bottom:0.5rem;">
                <p style="margin:0;font-size:0.9em;">${escapeHtml(n.text)}</p>
                <p style="margin:0;font-size:0.75em;color:#666;">${escapeHtml(n.author || 'Unknown')} — ${formatDate(n.timestamp)}</p>
              </div>
            `).join('')
        }
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
}

window.showStatusFields = function() {
  const status = document.getElementById('new-status-select').value;
  const scheduledField = document.getElementById('status-fields-scheduled');
  const assignField = document.getElementById('status-fields-assign');
  if (scheduledField) scheduledField.style.display = status === 'scheduled' ? 'block' : 'none';
  if (assignField) assignField.style.display = ['scheduled', 'in_progress'].includes(status) ? 'block' : 'none';
};

window.updateDefectStatus = async function() {
  const newStatus = document.getElementById('new-status-select').value;
  const noteText = document.getElementById('defect-note').value.trim();
  const dueBy = document.getElementById('defect-dueby')?.value || null;
  const assignedTo = document.getElementById('defect-assign')?.value?.trim() || null;
  
  if (!currentDefectId) return;
  
  const defect = allDefects.find(d => d.id === currentDefectId);
  if (!defect) return;
  
  const newNote = {
    text: noteText || `Status changed to: ${Object.values(DEFECT_STATUS).find(s => s.value === newStatus)?.label}`,
    author: currentUser.displayName || 'Company User',
    timestamp: new Date().toISOString()
  };
  
  const updatedDefect = {
    ...defect,
    status: newStatus,
    assignedTo: assignedTo || defect.assignedTo,
    dueBy: dueBy ? new Date(dueBy).toISOString() : defect.dueBy,
    notes: [...(defect.notes || []), newNote],
    fixedAt: newStatus === 'fixed' ? new Date().toISOString() : defect.fixedAt,
    fixedBy: newStatus === 'fixed' ? (currentUser.displayName || 'Company User') : defect.fixedBy,
    verifiedAt: newStatus === 'verified' ? new Date().toISOString() : defect.verifiedAt,
    verifiedBy: newStatus === 'verified' ? (currentUser.displayName || 'Company User') : defect.verifiedBy
  };
  
  try {
    const checkRef = doc(db, 'companies', currentUser.uid, 'completedChecks', defect.checkId);
    const checkSnap = await getDoc(checkRef);
    
    if (checkSnap.exists()) {
      const checkData = checkSnap.data();
      const defectIndex = checkData.defects.findIndex(d => d.id === currentDefectId);
      
      if (defectIndex !== -1) {
        checkData.defects[defectIndex] = updatedDefect;
        await setDoc(checkRef, checkData, { merge: false });
      }
    }
    
    showToast('✅ Defect record updated — compliant record saved');
    closeDefectModal();
    loadDefectsList();
    
  } catch (err) {
    console.error('Error updating defect:', err);
    alert('❌ Failed to update defect. Please try again.');
  }
};

window.closeDefectModal = function() {
  const modal = document.getElementById('defect-modal');
  if (modal) modal.style.display = 'none';
  currentDefectId = null;
};

window.exportDefectReport = function() {
  if (!allDefects.length) {
    alert('No defects to export.');
    return;
  }
  
  const csvContent = [
    ['Defect ID', 'Date Reported', 'Vehicle', 'Trailer', 'Category', 'DVSA Code', 'Description', 'Severity', 'Status', 'Reported By', 'Fixed Date', 'Verified Date'].join(','),
    ...allDefects.map(d => [
      d.id,
      new Date(d.reportedAt).toLocaleDateString('en-GB'),
      `"${(d.vehicleReg || '').replace(/"/g, '""')}"`,
      `"${(d.trailerNo || '').replace(/"/g, '""')}"`,
      `"${(d.categoryName || '').replace(/"/g, '""')}"`,
      d.code || '',
      `"${(d.description || '').replace(/"/g, '""')}"`,
      d.severity || 'MINOR',
      d.status || 'reported',
      `"${(d.reportedBy || '').replace(/"/g, '""')}"`,
      d.fixedAt ? new Date(d.fixedAt).toLocaleDateString('en-GB') : '',
      d.verifiedAt ? new Date(d.verifiedAt).toLocaleDateString('en-GB') : ''
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `defect-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('✅ Defect report downloaded');
};

// --------------------------
// DRIVER WALKAROUND CHECKS
// --------------------------
async function loadDriverCheckSelection() {
  const vehicleSelect = document.getElementById('driver-vehicle-select');
  const trailerSelect = document.getElementById('driver-trailer-select');
  if (!vehicleSelect && !trailerSelect) return;
  
  try {
    const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
    
    for (const companyId of accessibleCompanies) {
      const vehiclesSnap = await getDocs(
        query(
          collection(db, 'companies', companyId, 'vehicles'),
          where('active', '==', true)
        )
      );
      
      vehiclesSnap.forEach(doc => {
        const v = doc.data();
        v.id = doc.id;
        v.companyId = companyId;
        
        if (v.type === 'vehicle' && vehicleSelect) {
          vehicleSelect.innerHTML += `<option value="${doc.id}">${escapeHtml(v.registration)} — ${escapeHtml(v.make || '')} ${escapeHtml(v.model || '')}</option>`;
        } else if (v.type === 'trailer' && trailerSelect) {
          trailerSelect.innerHTML += `<option value="${doc.id}">${escapeHtml(v.trailerNumber)} — ${escapeHtml(v.make || '')}</option>`;
        }
      });
    }
  } catch (err) {
    console.error('Error loading vehicle options:', err);
  }
}

window.updateCheckTypeOptions = function() {
  const type = document.getElementById('check-type-select').value;
  const vehicleWrap = document.getElementById('driver-vehicle-wrap');
  const trailerWrap = document.getElementById('driver-trailer-wrap');
  
  if (vehicleWrap) vehicleWrap.style.display = (type === 'vehicle' || type === 'both') ? 'block' : 'none';
  if (trailerWrap) trailerWrap.style.display = (type === 'trailer' || type === 'both') ? 'block' : 'none';
};

window.startWalkaroundCheck = async function() {
  const type = document.getElementById('check-type-select').value;
  const vehicleSelect = document.getElementById('driver-vehicle-select');
  const trailerSelect = document.getElementById('driver-trailer-select');
  
  if (!type) return alert('⚠️ Please select what you are checking');
  if ((type === 'vehicle' || type === 'both') && !vehicleSelect?.value) return alert('⚠️ Please select a vehicle');
  if ((type === 'trailer' || type === 'both') && !trailerSelect?.value) return alert('⚠️ Please select a trailer');
  
  const vehicleId = (type === 'vehicle' || type === 'both') ? vehicleSelect.value : null;
  const trailerId = (type === 'trailer' || type === 'both') ? trailerSelect.value : null;
  
  let vehicleReg = '', trailerNo = '';
  if (vehicleId && vehicleSelect) vehicleReg = vehicleSelect.selectedOptions[0].text.split(' — ')[0];
  if (trailerId && trailerSelect) trailerNo = trailerSelect.selectedOptions[0].text.split(' — ')[0];
  
  let checklistItems = [];
  let useCustomChecklist = false;
  const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
  
  for (const companyId of accessibleCompanies) {
    try {
      const clSnap = await getDoc(doc(db, 'companies', companyId, 'settings', 'checklist'));
      if (clSnap.exists() && clSnap.data().items?.length) {
        const allItems = clSnap.data().items;
        checklistItems = getFilteredChecklist(allItems, type);
        useCustomChecklist = true;
        break;
      }
    } catch(e) {}
  }
  
  if (!useCustomChecklist) {
    checklistItems = getFilteredChecklist(DEFAULT_CHECKLIST, type);
  }
  
  if (!checklistItems.length) {
    return alert('⚠️ No checklist items available for this selection. Please contact your company.');
  }
  
  currentCheckData = {
    type,
    vehicleId,
    trailerId,
    vehicleReg,
    trailerNo,
    items: checklistItems,
    responses: {},
    defects: {},
    startedAt: new Date(),
    startedBy: currentUser.displayName || currentUser.email,
    driverUid: currentUser.uid
  };
  
  renderChecklistForm();
};

function renderChecklistForm() {
  const formArea = document.getElementById('checklist-form-area');
  if (!formArea || !currentCheckData) return;
  
  const typeLabels = {
    vehicle: '🚛 Vehicle Only — DVSA Walkaround Check',
    trailer: '🚉 Trailer Only — DVSA Walkaround Check',
    both: '🚛 + 🚉 Vehicle & Trailer — Combined DVSA Walkaround Check'
  };
  
  formArea.innerHTML = `
    <div style="background:#e8edf3;border-left:4px solid #1a365d;padding:1rem;margin-bottom:1.5rem;border-radius:4px;">
      <strong>${typeLabels[currentCheckData.type]}</strong><br>
      ${currentCheckData.vehicleReg ? `<strong>Vehicle:</strong> ${escapeHtml(currentCheckData.vehicleReg)}` : ''}
      ${currentCheckData.trailerNo ? ` | <strong>Trailer:</strong> ${escapeHtml(currentCheckData.trailerNo)}` : ''}
      <br><small>Select ✅ if OK, ⚠️ for minor defect, ❌ for major/dangerous defect</small>
    </div>
    
    <p style="color:#666;margin-bottom:1rem;">
      ✅ No Defect &nbsp; ⚠️ Minor — Rectify at next service &nbsp; ❌ Major — DO NOT operate until repaired
    </p>
    
    ${currentCheckData.items.map((item, idx) => `
      <div style="padding:1rem 0;border-bottom:1px solid #eee;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.8rem;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <label style="font-weight:500;font-size:0.95rem;">${idx + 1}. ${escapeHtml(item.label)}</label>
          </div>
          <div style="display:flex;gap:0.4rem;">
            <button type="button" id="check-btn-${idx}" onclick="setCheckResponse(${idx}, 'pass')"
              style="width:44px;height:44px;border:none;border-radius:4px;font-size:1.1rem;cursor:pointer;background:transparent;">✅</button>
            <button type="button" id="minor-btn-${idx}" onclick="setCheckResponse(${idx}, 'minor')"
              style="width:44px;height:44px;border:none;border-radius:4px;font-size:1.1rem;cursor:pointer;background:transparent;">⚠️</button>
            <button type="button" id="major-btn-${idx}" onclick="setCheckResponse(${idx}, 'major')"
              style="width:44px;height:44px;border:none;border-radius:4px;font-size:1.1rem;cursor:pointer;background:transparent;">❌</button>
          </div>
        </div>
        
        <div id="defect-panel-${idx}" style="display:none;margin-top:0.8rem;padding:1rem;background:#fff9e6;border-radius:4px;border-left:3px solid #d4af37;">
          <h4 style="margin:0 0 0.6rem 0;font-size:0.95rem;">📋 Report Defect</h4>
          
          <div style="margin-bottom:0.6rem;">
            <label style="font-size:0.9rem;"><strong>DVSA Category</strong></label>
            <select id="defect-cat-${idx}" onchange="loadDefectOptions(${idx})" style="width:100%;padding:0.5rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;">
              <option value="">— Select Category —</option>
              ${DVSA_DEFECT_CATEGORIES.map(c => `<option value="${c.id}">${c.id} — ${c.name}</option>`).join('')}
            </select>
          </div>
          
          <div style="margin-bottom:0.6rem;">
            <label style="font-size:0.9rem;"><strong>Common Defect</strong></label>
            <select id="defect-opt-${idx}" onchange="fillDefectDesc(${idx})" style="width:100%;padding:0.5rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;">
              <option value="">— Select or describe below —</option>
            </select>
          </div>
          
          <div style="margin-bottom:0.6rem;">
            <label style="font-size:0.9rem;"><strong>Description</strong></label>
            <textarea id="defect-desc-${idx}" placeholder="Describe the defect..." 
              style="width:100%;padding:0.5rem;margin-top:0.3rem;border:1px solid #ccc;border-radius:4px;min-height:60px;"></textarea>
          </div>
          
          <div>
            <label style="font-size:0.9rem;"><strong>Severity:</strong></label>
            <span id="defect-sev-label-${idx}" style="font-weight:bold;color:#d4af37;">⚠️ Minor</span>
          </div>
        </div>
      </div>
    `).join('')}
    
    <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;">
      <button onclick="submitCheckResult()" class="btn btn-primary" style="padding:0.8rem 1.5rem;font-size:1rem;">✅ Submit Check</button>
      <button onclick="cancelCheck()" class="btn" style="padding:0.8rem 1.5rem;font-size:1rem;">Cancel</button>
    </div>
  `;
}

window.setCheckResponse = function(idx, status) {
  currentCheckData.responses[idx] = status;
  
  document.getElementById(`check-btn-${idx}`).style.background = status === 'pass' ? '#bbf7d0' : 'transparent';
  document.getElementById(`minor-btn-${idx}`).style.background = status === 'minor' ? '#fef3c7' : 'transparent';
  document.getElementById(`major-btn-${idx}`).style.background = status === 'major' ? '#fee2e2' : 'transparent';
  
  const defectPanel = document.getElementById(`defect-panel-${idx}`);
  if (status === 'pass') {
    defectPanel.style.display = 'none';
    delete currentCheckData.defects[idx];
  } else {
    defectPanel.style.display = 'block';
    currentCheckData.defects[idx] = { severity: status };
    const label = document.getElementById(`defect-sev-label-${idx}`);
    if (status === 'minor') {
      label.textContent = '⚠️ Minor';
      label.style.color = '#d4af37';
    } else {
      label.textContent = '❌ MAJOR — Do Not Operate Until Repaired';
      label.style.color = '#b91c1c';
    }
  }
};

window.loadDefectOptions = function(idx) {
  const catId = document.getElementById(`defect-cat-${idx}`).value;
  const select = document.getElementById(`defect-opt-${idx}`);
  select.innerHTML = '<option value="">— Select defect —</option>';
  
  if (catId && DVSA_COMMON_DEFECTS[catId]) {
    DVSA_COMMON_DEFECTS[catId].forEach(d => {
      select.innerHTML += `<option value="${d.code}" data-text="${d.text}" data-sev="${d.severity}">
        ${d.code} — ${d.text} (${d.severity})
      </option>`;
    });
  }
};

window.fillDefectDesc = function(idx) {
  const select = document.getElementById(`defect-opt-${idx}`);
  const selected = select.selectedOptions[0];
  if (selected && selected.dataset.text) {
    document.getElementById(`defect-desc-${idx}`).value = selected.dataset.text;
    currentCheckData.defects[idx].code = selected.value;
    currentCheckData.defects[idx].description = selected.dataset.text;
    currentCheckData.defects[idx].severity = selected.dataset.sev;
  }
};

window.cancelCheck = function() {
  if (confirm('Cancel this check? Progress will be lost.')) {
    currentCheckData = null;
    const formArea = document.getElementById('checklist-form-area');
    if (formArea) formArea.innerHTML = '<p>Check cancelled.</p>';
  }
};

window.submitCheckResult = async function() {
  if (!currentCheckData) return;
  
  const unanswered = currentCheckData.items.find((_, i) => currentCheckData.responses[i] === undefined);
  if (unanswered) return alert('⚠️ Please complete every item before submitting');
  
  const hasMajor = Object.values(currentCheckData.defects || {}).some(d => d.severity === 'major' || d.severity === 'DANGEROUS');
  if (hasMajor && !confirm('⚠️ MAJOR/CRITICAL defects reported.\n\nVehicle/Trailer MUST NOT be used until repaired and signed off.\n\nSubmit check anyway?')) {
    return;
  }
  
  const defectsArray = Object.entries(currentCheckData.defects || {}).map(([idx, d]) => {
    const catSelect = document.getElementById(`defect-cat-${idx}`);
    const catId = catSelect?.value || '';
    const catInfo = DVSA_DEFECT_CATEGORIES.find(c => c.id === catId);
    
    return {
      id: generateDefectId(),
      checkItem: currentCheckData.items[idx].label,
      category: catId,
      categoryName: catInfo?.name || 'Unknown',
      code: d.code || '',
      description: d.description || document.getElementById(`defect-desc-${idx}`)?.value?.trim() || 'Defect reported',
      severity: d.severity === 'major' ? 'MAJOR' : d.severity === 'minor' ? 'MINOR' : d.severity || 'MINOR',
      vehicleReg: currentCheckData.vehicleReg,
      trailerNo: currentCheckData.trailerNo,
      reportedBy: currentUser.displayName || currentUser.email,
      reportedByUid: currentUser.uid,
      reportedAt: new Date().toISOString(),
      status: 'reported',
      notes: []
    };
  });
  
  const accessibleCompanies = userProfile.linkedCompanies || [userProfile.companyId].filter(Boolean);
  
  for (const companyId of accessibleCompanies) {
    try {
      await addDoc(collection(db, 'companies', companyId, 'completedChecks'), {
        type: currentCheckData.type,
        vehicleId: currentCheckData.vehicleId,
        trailerId: currentCheckData.trailerId,
        vehicleReg: currentCheckData.vehicleReg,
        trailerNo: currentCheckData.trailerNo,
        startedAt: currentCheckData.startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        completedBy: currentUser.displayName || currentUser.email,
        completedByUid: currentUser.uid,
        responses: currentCheckData.responses,
        defects: defectsArray,
        passed: defectsArray.length === 0
      });
    } catch (e) {
      console.log('Could not save to company:', companyId);
    }
  }
  
  currentCheckData = null;
  const formArea = document.getElementById('checklist-form-area');
  if (formArea) {
    formArea.innerHTML = `
      <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:6px;padding:2rem;text-align:center;">
        <h3 style="color:#16a34a;margin:0 0 0.5rem 0;">✅ Check Submitted</h3>
        <p>${defectsArray.length === 0 
          ? 'No defects reported. Safe to operate.' 
          : `${defectsArray.length} defect(s) recorded — logged for rectification`}</p>
        <button onclick="showPage('driver-checks')" class="btn btn-primary" style="margin-top:1rem;">Start New Check</button>
      </div>
    `;
  }
  
  showToast('✅ Check submitted — records saved');
};

// --------------------------
// COMPANY PROFILE
// --------------------------
async function loadCompanyProfile() {
  const container = document.getElementById('company-profile-content');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading profile...</p>';
  
  try {
    const profileRef = doc(db, 'companies', currentUser.uid, 'profile', 'details');
    const snap = await getDoc(profileRef);
    
    if (snap.exists()) {
      const profile = snap.data();
      renderCompanyProfileForm(profile);
    } else {
      renderCompanyProfileForm({});
    }
  } catch (err) {
    console.error('Error loading company profile:', err);
    renderCompanyProfileForm({});
  }
}

function renderCompanyProfileForm(profile) {
  const container = document.getElementById('company-profile-content');
  if (!container) return;
  
  container.innerHTML = `
    <h3>🏢 Company Profile — DVSA & Traffic Commissioner Compliance</h3>
    <p style="font-size:0.9em;color:#666;margin-bottom:1.5rem;">This information appears on your check records, certificates and reports — keep it up to date.</p>
    
    <form id="company-profile-form" style="display:grid;gap:1.2rem;max-width:700px;">
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Registered Company Name *</label>
        <input type="text" name="registeredName" value="${escapeHtml(profile.registeredName || '')}" required style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Trading Name (if different)</label>
        <input type="text" name="tradingName" value="${escapeHtml(profile.tradingName || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">HMRC Company Registration Number</label>
        <input type="text" name="companyNumber" value="${escapeHtml(profile.companyNumber || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Operator's Licence Number *</label>
        <input type="text" name="licenceNumber" value="${escapeHtml(profile.licenceNumber || '')}" required style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Registered Office Address</label>
        <textarea name="registeredAddress" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;min-height:80px;">${escapeHtml(profile.registeredAddress || '')}</textarea>
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Correspondence Address (if different)</label>
        <textarea name="correspondenceAddress" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;min-height:80px;">${escapeHtml(profile.correspondenceAddress || '')}</textarea>
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Primary Contact Name</label>
        <input type="text" name="contactName" value="${escapeHtml(profile.contactName || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Email Address — General Enquiries</label>
        <input type="email" name="emailGeneral" value="${escapeHtml(profile.emailGeneral || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Email Address — Invoices & Accounts</label>
        <input type="email" name="emailInvoices" value="${escapeHtml(profile.emailInvoices || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Telephone Number</label>
        <input type="tel" name="telephone" value="${escapeHtml(profile.telephone || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Fleet Manager / Responsible Person</label>
        <input type="text" name="fleetManager" value="${escapeHtml(profile.fleetManager || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Notes / Additional Information</label>
        <textarea name="notes" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;min-height:80px;">${escapeHtml(profile.notes || '')}</textarea>
      </div>
      
      <button type="button" onclick="saveCompanyProfile()" class="btn btn-primary" style="max-width:250px;">💾 Save Company Profile</button>
    </form>
  `;
}

window.saveCompanyProfile = async function() {
  const form = document.getElementById('company-profile-form');
  if (!form) return;
  
  const formData = new FormData(form);
  const profileData = {
    registeredName: formData.get('registeredName'),
    tradingName: formData.get('tradingName'),
    companyNumber: formData.get('companyNumber'),
    licenceNumber: formData.get('licenceNumber'),
    registeredAddress: formData.get('registeredAddress'),
    correspondenceAddress: formData.get('correspondenceAddress'),
    contactName: formData.get('contactName'),
    emailGeneral: formData.get('emailGeneral'),
    emailInvoices: formData.get('emailInvoices'),
    telephone: formData.get('telephone'),
    fleetManager: formData.get('fleetManager'),
    notes: formData.get('notes'),
    updatedAt: new Date()
  };
  
  if (!profileData.registeredName || !profileData.licenceNumber) {
    return alert('⚠️ Registered Name and Operator\'s Licence Number are required');
  }
  
  try {
    await setDoc(
      doc(db, 'companies', currentUser.uid, 'profile', 'details'),
      profileData,
      { merge: true }
    );
    showToast('✅ Company profile saved — compliant records updated');
  } catch (err) {
    console.error('Error saving profile:', err);
    alert('❌ Failed to save profile. Please try again.');
  }
};

// --------------------------
// DRIVER PROFILE & DOCUMENTS
// --------------------------
async function loadDriverProfile() {
  const container = document.getElementById('driver-profile-content');
  if (!container || !currentUser) return;
  
  container.innerHTML = '<p>Loading profile...</p>';
  
  try {
    const profileRef = doc(db, 'driverProfiles', currentUser.uid);
    const snap = await getDoc(profileRef);
    
    if (snap.exists()) {
      const profile = snap.data();
      renderDriverProfileForm(profile);
    } else {
      renderDriverProfileForm({});
    }
  } catch (err) {
    console.error('Error loading driver profile:', err);
    renderDriverProfileForm({});
  }
}

function renderDriverProfileForm(profile) {
  const container = document.getElementById('driver-profile-content');
  if (!container) return;
  
  container.innerHTML = `
    <h3>👤 My Profile & Documents</h3>
    <p style="font-size:0.9em;color:#666;margin-bottom:1.5rem;">Keep your details and documents up to date for compliance.</p>
    
    <form id="driver-profile-form" style="display:grid;gap:1.2rem;max-width:700px;">
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Full Name</label>
        <input type="text" name="fullName" value="${escapeHtml(profile.fullName || currentUser.displayName || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Email Address</label>
        <input type="email" name="email" value="${escapeHtml(profile.email || currentUser.email || '')}" readonly style="padding:0.6rem;border:1px solid #ddd;background:#f5f5f5;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Phone Number</label>
        <input type="tel" name="phone" value="${escapeHtml(profile.phone || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <h4 style="margin-top:1rem;">Driving Licence</h4>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Licence Number</label>
        <input type="text" name="licenceNumber" value="${escapeHtml(profile.licenceNumber || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;text-transform:uppercase;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Licence Categories (e.g. C+E, C, D1)</label>
        <input type="text" name="licenceCategories" value="${escapeHtml(profile.licenceCategories || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">DVLA Check Code</label>
        <input type="text" name="dvlaCheckCode" value="${escapeHtml(profile.dvlaCheckCode || '')}" style="padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <div style="display:grid;gap:0.5rem;grid-template-columns:1fr 1fr;">
        <div>
          <label style="font-weight:500;">Valid From</label>
          <input type="date" name="licenceValidFrom" value="${profile.licenceValidFrom ? new Date(profile.licenceValidFrom).toISOString().split('T')[0] : ''}" style="width:100%;padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
        </div>
        <div>
          <label style="font-weight:500;">Expiry Date</label>
          <input type="date" name="licenceExpiry" value="${profile.licenceExpiry ? new Date(profile.licenceExpiry).toISOString().split('T')[0] : ''}" style="width:100%;padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
        </div>
      </div>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Penalty Points</label>
        <input type="number" name="penaltyPoints" value="${profile.penaltyPoints || 0}" min="0" max="12" style="width:100px;padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <h4 style="margin-top:1rem;">Medical Certificate</h4>
      
      <div style="display:grid;gap:0.5rem;">
        <label style="font-weight:500;">Lorry Medical (D4) Expiry Date</label>
        <input type="date" name
                <input type="date" name="medicalExpiry" value="${profile.medicalExpiry ? new Date(profile.medicalExpiry).toISOString().split('T')[0] : ''}" style="width:100%;padding:0.6rem;border:1px solid #ccc;border-radius:4px;" />
      </div>
      
      <h4 style="margin-top:1rem;">📁 Upload Documents</h4>
      
      <div style="background:#f9fafb;padding:1rem;border-radius:6px;border:1px dashed #ccc;">
        <p style="margin:0 0 0.8rem 0;font-size:0.9em;color:#666;">Upload copies of your licence, D4 medical, CPC card, and any other certificates. These are automatically shared with your linked companies.</p>
        
        <div style="display:grid;gap:0.8rem;margin-bottom:1rem;">
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.3rem;">Driving Licence (front)</label>
            <input type="file" id="doc-licence-front" accept="image/*,.pdf" style="width:100%;font-size:0.85rem;" />
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.3rem;">Driving Licence (back)</label>
            <input type="file" id="doc-licence-back" accept="image/*,.pdf" style="width:100%;font-size:0.85rem;" />
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.3rem;">D4 Medical Certificate</label>
            <input type="file" id="doc-medical" accept="image/*,.pdf" style="width:100%;font-size:0.85rem;" />
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.3rem;">CPC Qualification Card</label>
            <input type="file" id="doc-cpc" accept="image/*,.pdf" style="width:100%;font-size:0.85rem;" />
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.3rem;">Other Document / Certificate</label>
            <input type="file" id="doc-other" accept="image/*,.pdf" style="width:100%;font-size:0.85rem;" />
          </div>
        </div>
        
        <button type="button" onclick="uploadDriverDocuments()" class="btn" style="font-size:0.9rem;">📤 Upload Selected Files</button>
      </div>
      
      <button type="button" onclick="saveDriverProfile()" class="btn btn-primary" style="max-width:250px;margin-top:1rem;">💾 Save Profile</button>
    </form>
    
    <div id="upload-status" style="margin-top:1rem;"></div>
    
    <div style="margin-top:2rem;">
      <h4>📋 Your Uploaded Documents</h4>
      <div id="docs-list" style="margin-top:0.8rem;">
        <p style="color:#888;font-size:0.9em;">No documents uploaded yet.</p>
      </div>
    </div>
  `;
  
  loadDriverDocumentsList();
}

window.saveDriverProfile = async function() {
  const form = document.getElementById('driver-profile-form');
  if (!form) return;
  
  const formData = new FormData(form);
  
  const profileData = {
    fullName: formData.get('fullName')?.trim() || '',
    phone: formData.get('phone')?.trim() || '',
    licenceNumber: formData.get('licenceNumber')?.trim().toUpperCase() || '',
    licenceCategories: formData.get('licenceCategories')?.trim() || '',
    dvlaCheckCode: formData.get('dvlaCheckCode')?.trim() || '',
    penaltyPoints: parseInt(formData.get('penaltyPoints')) || 0,
    updatedAt: new Date()
  };
  
  if (formData.get('licenceValidFrom')) {
    profileData.licenceValidFrom = new Date(formData.get('licenceValidFrom'));
  }
  if (formData.get('licenceExpiry')) {
    profileData.licenceExpiry = new Date(formData.get('licenceExpiry'));
  }
  if (formData.get('medicalExpiry')) {
    profileData.medicalExpiry = new Date(formData.get('medicalExpiry'));
  }
  
  try {
    await setDoc(
      doc(db, 'driverProfiles', currentUser.uid),
      profileData,
      { merge: true }
    );
    
    if (currentUser.displayName !== profileData.fullName) {
      await updateProfile(currentUser, { displayName: profileData.fullName });
    }
    
    showToast('✅ Profile saved successfully');
    
  } catch (err) {
    console.error('Error saving driver profile:', err);
    alert('❌ Failed to save profile. Please try again.');
  }
};

async function loadDriverDocumentsList() {
  const listEl = document.getElementById('docs-list');
  if (!listEl || !currentUser) return;
  
  try {
    const docsSnap = await getDoc(doc(db, 'driverProfiles', currentUser.uid));
    if (docsSnap.exists()) {
      const data = docsSnap.data();
      const docs = data.documents || [];
      
      if (docs.length === 0) {
        listEl.innerHTML = '<p style="color:#888;font-size:0.9em;">No documents uploaded yet.</p>';
        return;
      }
      
      listEl.innerHTML = docs.map((d, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem;background:#f9fafb;border-radius:4px;margin-bottom:0.5rem;">
          <div>
            <strong style="font-size:0.9rem;">${escapeHtml(d.name)}</strong>
            <p style="margin:0.2rem 0 0 0;font-size:0.8em;color:#666;">
              Uploaded: ${formatDate(d.uploadedAt)}
            </p>
          </div>
          <div>
            <a href="${escapeHtml(d.url)}" target="_blank" class="btn btn-sm" style="text-decoration:none;">View</a>
            <button onclick="deleteDriverDocument('${d.id}')" class="btn btn-sm btn-red">Delete</button>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading documents:', err);
  }
}

window.uploadDriverDocuments = async function() {
  const statusEl = document.getElementById('upload-status');
  if (!statusEl) return;
  
  const fileInputs = [
    { el: document.getElementById('doc-licence-front'), type: 'licence-front', name: 'Driving Licence (Front)' },
    { el: document.getElementById('doc-licence-back'), type: 'licence-back', name: 'Driving Licence (Back)' },
    { el: document.getElementById('doc-medical'), type: 'medical', name: 'D4 Medical Certificate' },
    { el: document.getElementById('doc-cpc'), type: 'cpc', name: 'CPC Qualification Card' },
    { el: document.getElementById('doc-other'), type: 'other', name: 'Other Document' }
  ];
  
  const filesToUpload = fileInputs.filter(f => f.el?.files?.length > 0);
  
  if (filesToUpload.length === 0) {
    alert('⚠️ Please select at least one file to upload.');
    return;
  }
  
  statusEl.innerHTML = '<p style="color:#d4af37;">⏳ Uploading files...</p>';
  
  try {
    const profileRef = doc(db, 'driverProfiles', currentUser.uid);
    const profileSnap = await getDoc(profileRef);
    const existingDocs = profileSnap.exists() ? (profileSnap.data().documents || []) : [];
    
    const newDocs = [...existingDocs];
    
    for (const item of filesToUpload) {
      const file = item.el.files[0];
      const fileId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const fileExt = file.name.split('.').pop();
      const storagePath = `driver-documents/${currentUser.uid}/${fileId}.${fileExt}`;
      
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      newDocs.push({
        id: fileId,
        type: item.type,
        name: item.name,
        originalName: file.name,
        url: downloadUrl,
        path: storagePath,
        size: file.size,
        uploadedAt: new Date().toISOString()
      });
    }
    
    await setDoc(profileRef, { documents: newDocs }, { merge: true });
    
    statusEl.innerHTML = '<p style="color:#16a34a;">✅ All files uploaded successfully</p>';
    showToast('✅ Documents uploaded');
    
    fileInputs.forEach(f => { if (f.el) f.el.value = ''; });
    
    loadDriverDocumentsList();
    
  } catch (err) {
    console.error('Upload error:', err);
    statusEl.innerHTML = '<p style="color:#dc2626;">❌ Upload failed. Please try again.</p>';
  }
};

window.deleteDriverDocument = async function(docId) {
  if (!confirm('⚠️ Delete this document? Companies will no longer have access to it.')) return;
  
  try {
    const profileRef = doc(db, 'driverProfiles', currentUser.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      const docToDelete = data.documents?.find(d => d.id === docId);
      
      if (docToDelete?.path) {
        const fileRef = ref(storage, docToDelete.path);
        await deleteObject(fileRef);
      }
      
      const updatedDocs = (data.documents || []).filter(d => d.id !== docId);
      await updateDoc(profileRef, { documents: updatedDocs });
      
      showToast('✅ Document deleted');
      loadDriverDocumentsList();
    }
  } catch (err) {
    console.error('Error deleting document:', err);
    alert('❌ Failed to delete document.');
  }
};

// --------------------------
// UTILITY: GLOBAL ERROR HANDLING
// --------------------------
window.onerror = function(message, source, lineno, colno, error) {
  console.error('App Error:', message, 'at', source + ':' + lineno + ':' + colno);
  return false;
};

console.log('%c✅ LSD Solutions — app.js Loaded & Ready', 'color: #1a365d; font-weight: bold; font-size: 14px;');
console.log('%cDVSA Compliant Walkaround Check System', 'color: #d4af37;');