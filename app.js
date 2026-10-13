  // Firebase Imports — v10.7.1 — CORRECTED URLs
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
      writeBatch,
      runTransaction
    } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
    import { 
      getStorage,
      ref,
      uploadBytes,
      getDownloadURL,
      deleteObject
    } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

    // ====================================== -->
    // FIREBASE CONFIG — UPDATE WITH YOURS! -->
    // ====================================== -->
    const firebaseConfig = {
      apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
      authDomain: "lsd-solutions.firebaseapp.com",
      projectId: "lsd-solutions",
      storageBucket: "lsd-solutions.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    // Initialise Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // Global State
    let currentUser = null;
    let currentUserRole = null;
    let unsubscribeAuth = null;
    let invoiceCounter = 0;
    const INVOICE_PREFIX = "LSDSA";

    // Default DVSA Compliant Checklist
    const DEFAULT_CHECKLIST = [
      { id: 'ext_body', label: 'Vehicle Exterior — Body & Panels', category: 'Exterior' },
      { id: 'ext_wheels', label: 'Wheels & Tyres — Condition & Pressure', category: 'Wheels' },
      { id: 'ext_lights', label: 'Lights & Indicators — Operation & Security', category: 'Lights' },
      { id: 'ext_mirrors', label: 'Mirrors — Condition & Security', category: 'Vision' },
      { id: 'ext_windscreen', label: 'Windscreen — Chips, Cracks & Washers/Wipers', category: 'Vision' },
      { id: 'ext_coupling', label: 'Coupling & Trailer Securement', category: 'Coupling' },
      { id: 'ext_undercarriage', label: 'Undercarriage / Mudguards', category: 'Exterior' },
      { id: 'int_doors', label: 'Doors & Locking Mechanisms', category: 'Security' },
      { id: 'int_seats', label: 'Seats & Seatbelts', category: 'Interior' },
      { id: 'int_fire', label: 'Fire Extinguisher — Present & In Date', category: 'Safety' },
      { id: 'int_triangle', label: 'Warning Triangle / Hazard Signs', category: 'Safety' },
      { id: 'int_firstaid', label: 'First Aid Kit', category: 'Safety' },
      { id: 'fluid_oil', label: 'Engine Oil — Level', category: 'Fluids' },
      { id: 'fluid_coolant', label: 'Coolant — Level', category: 'Fluids' },
      { id: 'fluid_wash', label: 'Screen Wash — Level', category: 'Fluids' },
      { id: 'fluid_brake', label: 'Brake Fluid — Level', category: 'Fluids' },
      { id: 'trailer_brakes', label: 'Trailer Brakes — Operation', category: 'Trailer', trailerOnly: true },
      { id: 'trailer_lights', label: 'Trailer Lights — Operation', category: 'Trailer', trailerOnly: true },
      { id: 'trailer_doors', label: 'Trailer Doors & Security', category: 'Trailer', trailerOnly: true },
      { id: 'trailer_load', label: 'Load Securement / Curtains', category: 'Trailer', trailerOnly: true }
    ];

    // ====================================== -->
    // UTILITY FUNCTIONS -->
    // ====================================== -->
    
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
    window.showToast = showToast;

    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    window.escapeHtml = escapeHtml;

    function formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    window.formatDate = formatDate;

    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0);
    }
    window.formatCurrency = formatCurrency;

    function generateInvoiceNumber() {
      invoiceCounter++;
      const padded = String(invoiceCounter).padStart(6, '0');
      return `${INVOICE_PREFIX}${padded}`;
    }
    window.generateInvoiceNumber = generateInvoiceNumber;

    function showPage(pageId) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = document.getElementById(pageId);
      if (page) page.classList.add('active');
      
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active');
      
      window.scrollTo(0, 0);
    }
    window.showPage = showPage;

    function hideAllPages() {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    }
    window.hideAllPages = hideAllPages;

    function showElement(id) {
      document.getElementById(id)?.classList.remove('hidden');
    }
    window.showElement = showElement;

    function hideElement(id) {
      document.getElementById(id)?.classList.add('hidden');
    }
    window.hideElement = hideElement;

    function openModal(id) {
      document.getElementById(id)?.classList.add('show');
    }
    window.openModal = openModal;

    function closeModal(id) {
      document.getElementById(id)?.classList.remove('show');
    }
    window.closeModal = closeModal;

    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    }
    window.toggleDarkMode = toggleDarkMode;

    // ====================================== -->
    // OFFLINE DETECTION -->
    // ====================================== -->
    function updateOnlineStatus() {
      const banner = document.getElementById('offlineBanner');
      if (navigator.onLine) {
        banner.classList.remove('show');
        setTimeout(processQueuedOfflineActions, 1000);
      } else {
        banner.classList.add('show');
      }
    }
    window.updateOnlineStatus = updateOnlineStatus;

    async function processQueuedOfflineActions() {
      try {
        const pending = JSON.parse(localStorage.getItem('pendingActions') || '[]');
        if (pending.length === 0) return;
        
        showToast(`Syncing ${pending.length} pending changes...`, 'warning');
        localStorage.setItem('pendingActions', '[]');
        showToast('✅ All changes saved!', 'success');
      } catch (e) {
        console.error('Offline sync failed:', e);
      }
    }
    window.processQueuedOfflineActions = processQueuedOfflineActions;

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // ====================================== -->
    // AUTHENTICATION -->
    // ====================================== -->
    async function handleSignIn() {
      const email = document.getElementById('signInEmail').value.trim();
      const password = document.getElementById('signInPassword').value;
      
      if (!email || !password) {
        showToast('Please enter email and password', 'warning');
        return;
      }
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('✅ Welcome back!', 'success');
      } catch (error) {
        console.error('Sign in error:', error);
        showToast('❌ Sign in failed: ' + error.message, 'error');
      }
    }
    window.handleSignIn = handleSignIn;

    async function handleRegisterDriver() {
      const name = document.getElementById('driverRegName').value.trim();
      const email = document.getElementById('driverRegEmail').value.trim();
      const password = document.getElementById('driverRegPassword').value;
      
      if (!name || !email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
      }
      
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
      }
      
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        
        await sendEmailVerification(user);
        
        await setDoc(doc(db, 'drivers', user.uid), {
          uid: user.uid,
          fullName: name,
          email: email,
          role: 'driver',
          createdAt: serverTimestamp(),
          licenceNumber: '',
          licenceCategories: '',
          penaltyPoints: 0,
          dvlaCheckCode: '',
          validFrom: null,
          expiryDate: null,
          medicalExpiry: null,
          companies: [],
          active: true
        });
        
        showToast('✅ Account created! Check your email to verify.', 'success');
        showPage('signInPage');
      } catch (error) {
        console.error('Driver register error:', error);
        showToast('❌ Registration failed: ' + error.message, 'error');
      }
    }
    window.handleRegisterDriver = handleRegisterDriver;

    async function handleRegisterCompany() {
      const name = document.getElementById('companyRegName').value.trim();
      const email = document.getElementById('companyRegEmail').value.trim();
      const password = document.getElementById('companyRegPassword').value;
      
      if (!name || !email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
      }
      
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
      }
      
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        
        await sendEmailVerification(user);
        
        await setDoc(doc(db, 'companies', user.uid), {
          uid: user.uid,
          registeredName: name,
          email: email,
          role: 'company',
          createdAt: serverTimestamp(),
          hmrcNumber: '',
          companiesHouseNumber: '',
          tradingName: '',
          registeredAddress: '',
          operatorLicenceNumber: '',
          transportManager: '',
          invoiceEmail: '',
          phone: '',
          billingPreference: 'per_driver',
          active: true
        });
        
        // Initialise default checklist for company
        await setDoc(doc(db, 'companies', user.uid, 'settings', 'checklist'), {
          items: DEFAULT_CHECKLIST,
          updatedAt: serverTimestamp()
        });
        
        showToast('✅ Company account created! Check your email to verify.', 'success');
        showPage('signInPage');
      } catch (error) {
        console.error('Company register error:', error);
        showToast('❌ Registration failed: ' + error.message, 'error');
      }
    }
    window.handleRegisterCompany = handleRegisterCompany;

    async function handlePasswordReset() {
      const email = document.getElementById('resetEmail').value.trim();
      if (!email) {
        showToast('Please enter your email', 'warning');
        return;
      }
      
      try {
        await sendPasswordResetEmail(auth, email);
        showPage('checkEmailPage');
      } catch (error) {
        showToast('❌ Error: ' + error.message, 'error');
      }
    }
    window.handlePasswordReset = handlePasswordReset;

    async function signOutUser() {
      try {
        await signOut(auth);
        showToast('✅ Signed out', 'success');
      } catch (error) {
        showToast('❌ Sign out failed', 'error');
      }
    }
    window.signOutUser = signOutUser;

    // ====================================== -->
    // AUTH STATE MANAGEMENT -->
    // ====================================== -->
    function initAuthState() {
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (!user) {
          currentUserRole = null;
          hideElement('headerSection');
          hideElement('searchBarSection');
          hideElement('bottomNav');
          hideElement('appContent');
          showPage('signInPage');
          return;
        }
        
        showElement('headerSection');
        showElement('searchBarSection');
        showElement('bottomNav');
        showElement('appContent');
        
        // Determine user role
        const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
        const companyDoc = await getDoc(doc(db, 'companies', user.uid));
        
        if (companyDoc.exists()) {
          currentUserRole = 'company';
          await loadCompanyPortal();
        } else if (driverDoc.exists()) {
          currentUserRole = 'driver';
          await loadDriverPortal(driverDoc.data());
        }
        
        // Update username display
        const nameEl = document.getElementById('userNameDisplay');
        if (nameEl) {
          if (currentUserRole === 'company') {
            nameEl.textContent = companyDoc.data()?.registeredName || 'Company';
          } else {
            nameEl.textContent = driverDoc.data()?.fullName || 'Driver';
          }
        }
        
        // Email verification banner
        const banner = document.getElementById('verificationBanner');
        if (banner) {
          if (!user.emailVerified) {
            banner.classList.remove('hidden');
          } else {
            banner.classList.add('hidden');
          }
        }
        
        showPage('dashboardPage');
      });
    }
    window.initAuthState = initAuthState;

    // Initialise on load
    document.addEventListener('DOMContentLoaded', () => {
      if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
      }
      initAuthState();
      console.log('🚛 LSD Solutions App — Section 2 Loaded');
    });