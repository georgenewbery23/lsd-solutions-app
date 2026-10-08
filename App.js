import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Image, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Wrap imports in try/catch ---
import { 
  getAuth, 
  onAuthStateChanged,  // ⬅️ ADD THIS LINE
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
}

let initializeAppCheck, getAppCheck;
try {
  const fbAppCheck = require('firebase/app-check');
  initializeAppCheck = fbAppCheck.initializeAppCheck;
  getAppCheck = fbAppCheck.getAppCheck;
} catch {
  initializeAppCheck = null;
  getAppCheck = null;
}

// ─── THEME ─────────────────────────────────────────────
const COLORS = {
  primary: '#0A337D',
  accent: '#2A60D9',
  silver: '#C8CDD8',
  light: '#E8EBF2',
  background: '#F5F7FA',
  success: '#2E7D32',
  warning: '#F57C00',
  danger: '#C62828',
  text: '#1A1A1A',
  textLight: '#666666',
  advisory: '#F57C00',
  major: '#C62828'
};

// ─── DVSA CHECKLISTS ───────────────────────────────────
const DVSA_CHECKS = {
  vehicle: [
    {id:'1',label:'Brakes',req:true},
    {id:'2',label:'Tyres & Wheels',req:true},
    {id:'3',label:'Lights & Indicators',req:true},
    {id:'4',label:'Mirrors & Windows',req:true},
    {id:'5',label:'Windscreen Wipers/Washers',req:true},
    {id:'6',label:'Steering',req:true},
    {id:'7',label:'Suspension',req:true},
    {id:'8',label:'Exhaust & Emissions',req:true},
    {id:'9',label:'Fuel System',req:true},
    {id:'10',label:'Electrical Systems',req:true},
    {id:'11',label:'Body & Security',req:true},
    {id:'12',label:'Coupling & Towing',req:true},
    {id:'13',label:'Load Security',req:true},
    {id:'14',label:'Emergency Equipment',req:true},
    {id:'15',label:'Tachograph',req:true}
  ],
  trailer: [
    {id:'t1',label:'Brakes',req:true},
    {id:'t2',label:'Tyres & Wheels',req:true},
    {id:'t3',label:'Lights & Reflectors',req:true},
    {id:'t4',label:'Coupling & Safety Chains',req:true},
    {id:'t5',label:'Suspension & Undercarriage',req:true},
    {id:'t6',label:'Body & Structure',req:true},
    {id:'t7',label:'Load Securing Points',req:true},
    {id:'t8',label:'Markings & Plates',req:true}
  ]
};

// ─── CONTEXT ────────────────────────────────────────────
const AppContext = createContext(null);

const AppProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data());
      } else setUserProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const registerCompany = async (email, password, companyData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, email, role: 'company',
      ...companyData,
      subscription: {
        status: 'trial', trialEnd: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        ratePerVehicle: 2.00, activeVehicles: []
      },
      createdAt: serverTimestamp()
    });
    return cred.user;
  };

  const registerDriver = async (email, password, driverData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, email, role: 'driver',
      ...driverData, savedCompanies: [],
      createdAt: serverTimestamp()
    });
    return cred.user;
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const addVehicle = async (reg, trailerNumber=null) => {
    if (!userProfile || userProfile.role !== 'company') return;
    const vehicles = [...(userProfile.subscription?.activeVehicles||[])];
    vehicles.push({reg, trailerNumber, addedAt: new Date().toISOString(), active:true});
    await updateDoc(doc(db, 'users', currentUser.uid), {
      'subscription.activeVehicles': vehicles
    });
    setUserProfile(p => ({...p, subscription:{...p.subscription, activeVehicles:vehicles}}));
  };

  const submitCheck = async (checkData) => {
    await addDoc(collection(db, 'checks'), {
      ...checkData, driverId: currentUser.uid,
      submittedAt: serverTimestamp()
    });
    if (checkData.hasDefect) {
      await addDoc(collection(db, 'notifications'), {
        companyId: checkData.companyId || 'unassigned',
        type: 'defect',
        severity: checkData.defectSeverity,
        message: `${checkData.defectSeverity === 'major' ? '🔴 MAJOR DEFECT' : '⚠️ Advisory'} reported on ${checkData.vehicleReg || checkData.trailerNumber}`,
        checkData, read: false, createdAt: serverTimestamp()
      });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <AppContext.Provider value={{
      currentUser, userProfile,
      registerCompany, registerDriver, login, logout, addVehicle, submitCheck
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ─── SCREENS ─────────────────────────────────────────────
const LoadingScreen = () => (
  <View style={styles.centered}>
    <Text style={styles.loadingText}>Loading LSD Solutions...</Text>
  </View>
);

const HomeScreen = ({navigation}) => {
  const {userProfile} = useContext(AppContext);
  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.role === 'company') navigation.replace('CompanyPortal');
    if (userProfile.role === 'driver') navigation.replace('DriverPortal');
  }, [userProfile]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoText}>LSD SOLUTIONS</Text>
        <Text style={styles.tagline}>For all your long haul, shunting & delivery needs</Text>
      </View>
      <View style={styles.btnCol}>
        <TouchableOpacity style={styles.btnPrimary} onPress={()=>navigation.navigate('Login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={()=>navigation.navigate('SelectRole')}>
          <Text style={styles.btnTextSecondary}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const SelectRoleScreen = ({navigation}) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.heading}>Select Account Type</Text>
    <TouchableOpacity style={styles.btnPrimary} onPress={()=>navigation.navigate('CompanyRegister')}>
      <Text style={styles.btnText}>🏢 Company — £2/vehicle/month</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.btnSecondary} onPress={()=>navigation.navigate('DriverRegister')}>
      <Text style={styles.btnTextSecondary}>🚛 Driver — Free</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.backLink} onPress={()=>navigation.goBack()}>
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const CompanyRegisterScreen = ({navigation}) => {
  const {registerCompany} = useContext(AppContext);
  const [form, setForm] = useState({
    email:'',password:'',name:'',tradingAs:'',address:'',operatorLicence:''
  });
  const handle = async () => {
    try {
      await registerCompany(form.email, form.password, {
        companyName:form.name, tradingAs:form.tradingAs,
        registeredAddress:form.address, operatorLicence:form.operatorLicence,
        contactEmail:form.email
      });
      navigation.replace('CompanyPortal');
    } catch(e) { Alert.alert('Error', e.message); }
  };
  return (
    <ScrollView style={styles.formScroll}>
      <Text style={styles.heading}>Company Registration</Text>
      {['email','password','name','tradingAs','address','operatorLicence'].map(f => (
        <TextInput 
          key={f} 
          style={styles.input} 
          placeholder={f.replace(/([A-Z])/g,' $1').trim().replace(/^./,t=>t.toUpperCase())}
          value={form[f]} 
          onChangeText={v=>setForm(p=>({...p,[f]:v}))}
          secureTextEntry={f==='password'} 
          autoCapitalize='none' 
          keyboardType={f==='email'?'email-address':'default'} 
        />
      ))}
      <TouchableOpacity style={styles.btnPrimary} onPress={handle}>
        <Text style={styles.btnText}>Register — 30 Day Free Trial</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const DriverRegisterScreen = ({navigation}) => {
  const {registerDriver} = useContext(AppContext);
  const [form, setForm] = useState({email:'',password:'',name:''});
  const handle = async () => {
    try {
      await registerDriver(form.email, form.password, {name:form.name});
      navigation.replace('DriverPortal');
    } catch(e) { Alert.alert('Error', e.message); }
  };
  return (
    <ScrollView style={styles.formScroll}>
      <Text style={styles.heading}>Driver Registration</Text>
      {['name','email','password'].map(f => (
        <TextInput 
          key={f} 
          style={styles.input} 
          placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
          value={form[f]} 
          onChangeText={v=>setForm(p=>({...p,[f]:v}))}
          secureTextEntry={f==='password'} 
          autoCapitalize='none' 
          keyboardType={f==='email'?'email-address':'default'} 
        />
      ))}
      <TouchableOpacity style={styles.btnPrimary} onPress={handle}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const LoginScreen = ({navigation}) => {
  const {login} = useContext(AppContext);
  const [email,setEmail] = useState(''),[pw,setPw] = useState('');
  const handle = async () => {
    try { await login(email,pw); } catch(e) { Alert.alert('Error',e.message); }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Sign In</Text>
      <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
      <TextInput style={styles.input} placeholder='Password' value={pw} onChangeText={setPw} secureTextEntry />
      <TouchableOpacity style={styles.btnPrimary} onPress={handle}>
        <Text style={styles.btnText}>Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const CompanyPortalScreen = ({navigation}) => {
  const {userProfile, logout, addVehicle} = useContext(AppContext);
  const [newReg,setNewReg] = useState(''),[newTrailer,setNewTrailer] = useState('');
  const vehicles = userProfile?.subscription?.activeVehicles||[];
  const isActive = userProfile?.subscription?.status==='trial' || userProfile?.subscription?.status==='active';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>Company Portal</Text>
        <Text style={styles.subHeading}>{userProfile?.companyName}</Text>
        <Text style={styles.status}>Subscription: {isActive?'✅ Active':'❌ Inactive'}</Text>
        <Text style={styles.text}>Vehicles: {vehicles.length} × £2.00 = £{(vehicles.length*2).toFixed(2)}/month</Text>
        
        <View style={styles.addVehicleForm}>
          <TextInput style={styles.input} placeholder='Vehicle Registration' value={newReg} onChangeText={setNewReg} autoCapitalize='characters' />
          <TextInput style={styles.input} placeholder='Trailer No. (optional)' value={newTrailer} onChangeText={setNewTrailer} autoCapitalize='characters' />
          <TouchableOpacity style={styles.btnPrimary} onPress={()=>{addVehicle(newReg,newTrailer);setNewReg('');setNewTrailer('');}}>
            <Text style={styles.btnText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeading}>Fleet List</Text>
        {vehicles.length === 0 ? (
          <Text style={styles.textLight}>No vehicles added yet.</Text>
        ) : vehicles.map((v,i)=>(
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemText}>{v.reg} {v.trailerNumber&&`/ ${v.trailerNumber}`}</Text>
            <Text style={styles.itemStatus}>Active</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.btnDanger} onPress={logout}>
          <Text style={styles.btnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const DriverPortalScreen = ({navigation}) => {
  const {userProfile, logout} = useContext(AppContext);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Driver Portal</Text>
      <Text style={styles.welcome}>Welcome, {userProfile?.name}</Text>
      
      <TouchableOpacity style={styles.btnPrimary} onPress={()=>navigation.navigate('CheckTypeSelect')}>
        <Text style={styles.btnText}>🚛 Start Walkaround Check</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.btnSecondary} onPress={logout}>
        <Text style={styles.btnTextSecondary}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const CheckTypeSelectScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select Check Type</Text>
      
      <TouchableOpacity style={styles.btnPrimary} onPress={()=>navigation.navigate('CheckEntry',{type:'vehicle'})}>
        <Text style={styles.btnText}>🚛 Vehicle Only</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnPrimary} onPress={()=>navigation.navigate('CheckEntry',{type:'both'})}>
        <Text style={styles.btnText}>🚛 + 📦 Vehicle & Trailer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnPrimary} onPress={()=>navigation.navigate('CheckEntry',{type:'trailer'})}>
        <Text style={styles.btnText}>📦 Trailer Only</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const CheckEntryScreen = ({route, navigation}) => {
  const {type} = route.params;
  const [reg,setReg] = useState('');
  const [trailer,setTrailer] = useState('');
  const [odometer,setOdometer] = useState('');
  const [companyId,setCompanyId] = useState('');

  const startCheck = () => {
    if (type !== 'trailer' && !reg.trim()) {
      return Alert.alert('⚠️ Required', 'Please enter the vehicle registration');
    }
    if (type === 'trailer' && !trailer.trim()) {
      return Alert.alert('⚠️ Required', 'Please enter the trailer number');
    }
    navigation.navigate('CheckList', {
      type, reg: reg.toUpperCase(), trailer: trailer.toUpperCase(), odometer, companyId,
      startTime: new Date()
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Vehicle Details</Text>
      
      {type !== 'trailer' && (
        <TextInput 
          style={styles.input} 
          placeholder='Vehicle Registration e.g. AB12 CDE' 
          value={reg} 
          onChangeText={setReg} 
          autoCapitalize='characters'
          autoCorrect={false}
        />
      )}
      
      {type !== 'vehicle' && (
        <TextInput 
          style={styles.input} 
          placeholder='Trailer Number / ID' 
          value={trailer} 
          onChangeText={setTrailer} 
          autoCapitalize='characters'
          autoCorrect={false}
        />
      )}
      
      <TextInput 
        style={styles.input} 
        placeholder='Odometer Reading (miles/km)' 
        value={odometer} 
        onChangeText={setOdometer} 
        keyboardType='numeric'
      />
      
      <TextInput 
        style={styles.input} 
        placeholder='Company ID (if linked)' 
        value={companyId} 
        onChangeText={setCompanyId} 
        autoCapitalize='none'
      />
      
      <TouchableOpacity style={styles.btnPrimary} onPress={startCheck}>
        <Text style={styles.btnText}>▶ Start Check — Timer Running</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ─── REUSABLE DEFECT FORM COMPONENT ─────────────────────
const DefectForm = ({defect, onChange, onRemove, showRemove}) => {
  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission needed', 'Please allow access to photos');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true
    });
    if (!result.canceled && result.assets) {
      onChange({
        ...defect,
        photos: [...(defect.photos||[]), ...result.assets.map(a => a.uri)]
      });
    }
  };

  const removePhoto = (index) => {
    onChange({
      ...defect,
      photos: defect.photos.filter((_,i)=>i!==index)
    });
  };

  return (
    <View style={styles.defectCard}>
      {showRemove && (
        <TouchableOpacity style={styles.removeDefectBtn} onPress={onRemove}>
          <Text style={styles.removeDefectText}>✕ Remove</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={styles.textArea}
        placeholder='Describe the defect...'
        value={defect.description}
        onChangeText={(text) => onChange({...defect, description: text})}
        multiline
        numberOfLines={3}
        textAlignVertical='top'
      />

      <Text style={styles.label}>Severity *</Text>
      <View style={styles.severityRow}>
        <TouchableOpacity 
          style={[
            styles.severityBtn,
            defect.severity === 'advisory' && styles.severityAdvisoryActive
          ]}
          onPress={() => onChange({...defect, severity: 'advisory'})}
        >
          <Text style={[
            styles.severityText,
            defect.severity === 'advisory' && styles.severityTextActive
          ]}>
            ⚠️ Advisory
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.severityBtn,
            defect.severity === 'major' && styles.severityMajorActive
          ]}
          onPress={() => onChange({...defect, severity: 'major'})}
        >
          <Text style={[
            styles.severityText,
            defect.severity === 'major' && styles.severityTextActive
          ]}>
            🔴 Major
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Photos</Text>
      <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
        <Text style={styles.photoBtnText}>📷 Add Photo</Text>
      </TouchableOpacity>
      
      {defect.photos?.length > 0 && (
        <View style={styles.photoGrid}>
          {defect.photos.map((uri, i) => (
            <View key={i} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(i)}>
                <Text style={styles.photoRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── CHECKLIST SCREEN ──────────────────────────────────
const CheckListScreen = ({route, navigation}) => {
  const {submitCheck, currentUser} = useContext(AppContext);
  const {type, reg, trailer, odometer, companyId, startTime} = route.params;
  
  const [checks, setChecks] = useState({});
  const [elapsed, setElapsed] = useState(0);
  
  // Built-in item defects
  const [mainDefect, setMainDefect] = useState({
    description: '',
    severity: null,
    photos: []
  });
  
  // Other / additional defects
  const [otherDefects, setOtherDefects] = useState([]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Upload photos helper
  const uploadPhotos = async (photoUris) => {
    const urls = [];
    for (let i = 0; i < photoUris?.length; i++) {
      try {
        const response = await fetch(photoUris[i]);
        const blob = await response.blob();
        const fileRef = ref(storage, `defect-photos/${currentUser.uid}/${Date.now()}_photo${i}.jpg`);
        await uploadBytes(fileRef, blob);
        urls.push(await getDownloadURL(fileRef));
      } catch (err) {
        console.warn('Upload failed:', err);
      }
    }
    return urls;
  };

  // Add new blank other defect
  const addOtherDefect = () => {
    setOtherDefects(prev => [...prev, {
      id: Date.now(),
      description: '',
      severity: null,
      photos: []
    }]);
  };

  // Update an other defect
  const updateOtherDefect = (index, data) => {
    const updated = [...otherDefects];
    updated[index] = data;
    setOtherDefects(updated);
  };

  // Remove an other defect
  const removeOtherDefect = (index) => {
    setOtherDefects(prev => prev.filter((_,i)=>i!==index));
  };

  // Validate all defects
  const validateDefects = () => {
    const mainDefectPresent = Object.values(checks).some(c => c === 'defect');
    
    if (mainDefectPresent) {
      if (!mainDefect.description.trim()) {
        return 'Please add a description for the marked defect(s)';
      }
      if (!mainDefect.severity) {
        return 'Please select severity for the marked defect(s)';
      }
    }

    for (let i = 0; i < otherDefects.length; i++) {
      const d = otherDefects[i];
      if (!d.description.trim()) {
        return `Please add a description for Additional Defect ${i+1}`;
      }
      if (!d.severity) {
        return `Please select severity for Additional Defect ${i+1}`;
      }
    }
    return null;
  };

  const submitCheckReport = async () => {
    const validationError = validateDefects();
    if (validationError) return Alert.alert('⚠️ Required', validationError);

    const finishTime = new Date();
    const duration = Math.floor((finishTime - startTime) / 1000);
    
    const mainDefectPresent = Object.values(checks).some(c => c === 'defect');
    const hasOtherDefects = otherDefects.length > 0;
    const hasDefect = mainDefectPresent || hasOtherDefects;

    // Upload all photos
    const mainPhotos = mainDefectPresent ? await uploadPhotos(mainDefect.photos) : [];
    const otherDefectsWithUrls = [];
    for (const d of otherDefects) {
      otherDefectsWithUrls.push({
        description: d.description,
        severity: d.severity,
        photos: await uploadPhotos(d.photos)
      });
    }

    const checkData = {
      type,
      vehicleReg: type !== 'trailer' ? reg : null,
      trailerNumber: type !== 'vehicle' ? trailer : null,
      odometer,
      companyId: companyId || 'unassigned',
      startTime: startTime.toISOString(),
      finishTime: finishTime.toISOString(),
      duration,
      checks,
      hasDefect,
      // Main defect from checklist items
      mainDefect: mainDefectPresent ? {
        description: mainDefect.description,
        severity: mainDefect.severity,
        photos: mainPhotos
      } : null,
      // Additional / other defects
      otherDefects: otherDefectsWithUrls,
      passed: !hasDefect
    };

    await submitCheck(checkData);

    const defectCount = (mainDefectPresent ? 1 : 0) + otherDefects.length;
    Alert.alert(
      '✅ Check Submitted',
      `Date: ${new Date().toLocaleDateString('en-GB')}\nDuration: ${Math.floor(duration/60)}m ${duration%60}s\n\n${hasDefect ? `⚠️ ${defectCount} Defect(s) Reported` : 'All items passed ✅'}`,
      [{ text: 'Done', onPress: () => navigation.navigate('DriverPortal') }]
    );
  };

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const listItems = type === 'vehicle' ? DVSA_CHECKS.vehicle : 
                    type === 'trailer' ? DVSA_CHECKS.trailer : 
                    [...DVSA_CHECKS.vehicle, ...DVSA_CHECKS.trailer];

  const showMainDefectForm = Object.values(checks).some(c => c === 'defect');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.timer}>⏱ {mins}:{secs.toString().padStart(2, '0')}</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>DVSA Walkaround Check</Text>
        <Text style={styles.subInfo}>
          {type !== 'trailer' && reg}
          {type === 'both' && ' / '}
          {type !== 'vehicle' && trailer}
          {'  • '}{odometer}
        </Text>

        {listItems.map(item => (
          <View key={item.id} style={styles.checkRow}>
            <Text style={styles.checkLabel}>{item.label}</Text>
            <View style={styles.checkBtns}>
              <TouchableOpacity 
                style={[styles.checkBtn, checks[item.id] === 'ok' && styles.checkOk]}
                onPress={() => setChecks(p => ({ ...p, [item.id]: 'ok' }))}
              >
                <Text style={styles.checkBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.checkBtn, checks[item.id] === 'defect' && styles.checkBad]}
                onPress={() => setChecks(p => ({ ...p, [item.id]: 'defect' }))}
              >
                <Text style={styles.checkBtnText}>⚠</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* DEFECT FORM FOR MARKED ITEMS */}
        {showMainDefectForm && (
          <View style={styles.defectSection}>
            <Text style={styles.defectHeading}>🔴 Defect Details — Marked Items</Text>
            <DefectForm
              defect={mainDefect}
              onChange={setMainDefect}
              showRemove={false}
            />
          </View>
        )}

        {/* OTHER DEFECTS SECTION */}
        <View style={styles.otherDefectsSection}>
          <Text style={styles.otherDefectsHeading}>📋 Other Defects</Text>
          <Text style={styles.otherDefectsSub}>Add any defects not listed above</Text>
          
          {otherDefects.map((defect, index) => (
            <DefectForm
              key={defect.id}
              defect={defect}
              onChange={(data) => updateOtherDefect(index, data)}
              onRemove={() => removeOtherDefect(index)}
              showRemove={true}
            />
          ))}
          
          <TouchableOpacity style={styles.addDefectBtn} onPress={addOtherDefect}>
            <Text style={styles.addDefectText}>+ Add Another Defect</Text>
          </TouchableOpacity>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity style={styles.btnPrimary} onPress={submitCheckReport}>
          <Text style={styles.btnText}>✅ Submit Check</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── MAIN APP & NAVIGATION ──────────────────────────────
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

const App = () => (
  <AppProvider>
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' }
    }}>
      <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name='SelectRole' component={SelectRoleScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name='CompanyRegister' component={CompanyRegisterScreen} options={{ title: 'Company Sign Up' }} />
      <Stack.Screen name='DriverRegister' component={DriverRegisterScreen} options={{ title: 'Driver Sign Up' }} />
      <Stack.Screen name='Login' component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name='CompanyPortal' component={CompanyPortalScreen} options={{ title: 'Company Dashboard' }} />
      <Stack.Screen name='DriverPortal' component={DriverPortalScreen} options={{ title: 'Driver Dashboard' }} />
      <Stack.Screen name='CheckTypeSelect' component={CheckTypeSelectScreen} options={{ title: 'Walkaround Check' }} />
      <Stack.Screen name='CheckEntry' component={CheckEntryScreen} options={{ title: 'Vehicle Details' }} />
      <Stack.Screen name='CheckList' component={CheckListScreen} options={{ title: 'DVSA Inspection' }} />
    </Stack.Navigator>
  </AppProvider>
);

// ─── STYLES ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center'
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    textAlign: 'center'
  },
  subInfo: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12
  },
  welcome: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 30,
    textAlign: 'center'
  },
  status: {
    fontSize: 14,
    marginBottom: 8
  },
  text: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20
  },
  textLight: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic'
  },
  timer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.silver,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 15
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 8
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.silver,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 80,
    fontSize: 15
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 8
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 8
  },
  btnDanger: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  btnTextSecondary: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16
  },
  btnCol: {
    marginTop: 40
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  backText: {
    color: COLORS.accent
  },
  formScroll: {
    paddingBottom: 40
  },
  addVehicleForm: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.silver
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light
  },
  itemText: {
    fontSize: 14
  },
  itemStatus: {
    color: COLORS.success,
    fontWeight: '600'
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light
  },
  checkLabel: {
    flex: 1,
    fontSize: 15,
    paddingRight: 10
  },
  checkBtns: {
    flexDirection: 'row',
    gap: 12
  },
  checkBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.silver,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9'
  },
  checkOk: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success
  },
  checkBad: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger
  },
  checkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  },
  defectSection: {
    marginTop: 25,
    padding: 18,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginBottom: 10
  },
  defectHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 15,
    textAlign: 'center'
  },
  otherDefectsSection: {
    marginTop: 30,
    padding: 18,
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 10
  },
  otherDefectsHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'center'
  },
  otherDefectsSub: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 15,
    textAlign: 'center'
  },
  defectCard: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.light
  },
  removeDefectBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginBottom: 8
  },
  removeDefectText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600'
  },
  severityRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 5
  },
  severityBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.silver,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  severityAdvisoryActive: {
    borderColor: COLORS.advisory,
    backgroundColor: COLORS.advisory
  },
  severityMajorActive: {
    borderColor: COLORS.major,
    backgroundColor: COLORS.major
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  severityTextActive: {
    color: '#fff'
  },
  photoBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(42,96,217,0.05)',
    marginTop: 8
  },
  photoBtnText: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 15
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12
  },
  photoWrap: {
    position: 'relative'
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.light
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  photoRemoveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  addDefectBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 5
  },
  addDefectText: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 15
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight
  }
});

export default App;
