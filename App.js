import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ FIXED: Firebase imports — aliased to avoid conflicts
// ✅ NEW — matches what firebase.js now exports
import { auth, db, storage } from './firebase';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, collection, query, where,
  getDocs, addDoc, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

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
  textLight: '#666666'
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
  const [companies, setCompanies] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(Auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(Db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data());
      } else setUserProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const registerCompany = async (email, password, companyData) => {
    const cred = await createUserWithEmailAndPassword(Auth, email, password);
    await setDoc(doc(Db, 'users', cred.user.uid), {
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
    const cred = await createUserWithEmailAndPassword(Auth, email, password);
    await setDoc(doc(Db, 'users', cred.user.uid), {
      uid: cred.user.uid, email, role: 'driver',
      ...driverData, savedCompanies: [],
      createdAt: serverTimestamp()
    });
    return cred.user;
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(Auth, email, password);
  };

  const logout = async () => {
    await signOut(Auth);
    setUserProfile(null);
  };

  const addVehicle = async (reg, trailerNumber=null) => {
    if (!userProfile || userProfile.role !== 'company') return;
    const vehicles = [...(userProfile.subscription?.activeVehicles||[])];
    vehicles.push({reg, trailerNumber, addedAt: new Date().toISOString(), active:true});
    await updateDoc(doc(Db, 'users', currentUser.uid), {
      'subscription.activeVehicles': vehicles
    });
    setUserProfile(p => ({...p, subscription:{...p.subscription, activeVehicles:vehicles}}));
  };

  const submitCheck = async (checkData) => {
    await addDoc(collection(Db, 'checks'), {
      ...checkData, driverId: currentUser.uid,
      companyId: checkData.companyId, submittedAt: serverTimestamp()
    });
    if (checkData.hasDefect) {
      await addDoc(collection(Db, 'notifications'), {
        companyId: checkData.companyId, type: 'defect',
        message: `Defect reported on ${checkData.vehicleReg}`,
        checkData, read: false, createdAt: serverTimestamp()
      });
    }
  };

  const saveCompanyToProfile = async (companyId) => {
    const saved = [...(userProfile.savedCompanies||[]), companyId];
    await updateDoc(doc(Db, 'users', currentUser.uid), {savedCompanies:saved});
    setUserProfile(p => ({...p, savedCompanies:saved}));
  };

  if (loading) return <LoadingScreen />;

  return (
    <AppContext.Provider value={{
      currentUser, userProfile, companies, savedCompanies,
      registerCompany, registerDriver, login, logout, addVehicle, submitCheck,
      saveCompanyToProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ─── SCREENS ─────────────────────────────────────────────
const LoadingScreen = () => (
  <View style={styles.centered}><Text style={styles.loadingText}>Loading LSD Solutions...</Text></View>
);

const HomeScreen = ({navigation}) => {
  const {userProfile} = useContext(AppContext);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "LSD Solutions — HGV Walkaround";
    }
  }, []);

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
        <TextInput key={f} style={styles.input} placeholder={f.replace(/([A-Z])/g,' $1').trim().replace(/^./,t=>t.toUpperCase())}
          value={form[f]} onChangeText={v=>setForm(p=>({...p,[f]:v}))}
          secureTextEntry={f==='password'} autoCapitalize='none' keyboardType={f==='email'?'email-address':'default'} />
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
        <TextInput key={f} style={styles.input} placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
          value={form[f]} onChangeText={v=>setForm(p=>({...p,[f]:v}))}
          secureTextEntry={f==='password'} autoCapitalize='none' keyboardType={f==='email'?'email-address':'default'} />
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
          <TextInput style={styles.input} placeholder='Vehicle Registration' value={newReg} onChangeText={setNewReg} />
          <TextInput style={styles.input} placeholder='Trailer No. (optional)' value={newTrailer} onChangeText={setNewTrailer} />
          <TouchableOpacity style={styles.btnPrimary} onPress={()=>{addVehicle(newReg,newTrailer);setNewReg('');setNewTrailer('');}}>
            <Text style={styles.btnText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeading}>Fleet List</Text>
        {vehicles.map((v,i)=>(
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
  const [startTime,setStartTime] = useState(null);

  const startCheck = () => {
    if (!reg && type!=='trailer') return Alert.alert('Enter registration');
    if (!trailer && type==='trailer') return Alert.alert('Enter trailer number');
    setStartTime(new Date());
    navigation.navigate('CheckList', {
      type, reg, trailer, odometer, companyId, startTime
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Vehicle Details</Text>
      {type!=='trailer'&&<TextInput style={styles.input} placeholder='Vehicle Registration' value={reg} onChangeText={setReg} autoCapitalize='characters' />}
      {type!=='vehicle'&&<TextInput style={styles.input} placeholder='Trailer Number' value={trailer} onChangeText={setTrailer} autoCapitalize='characters' />}
      <TextInput style={styles.input} placeholder='Odometer Reading' value={odometer} onChangeText={setOdometer} keyboardType='numeric' />
      <TextInput style={styles.input} placeholder='Company ID (optional)' value={companyId} onChangeText={setCompanyId} autoCapitalize='none' />
      <TouchableOpacity style={styles.btnPrimary} onPress={startCheck}>
        <Text style={styles.btnText}>▶ Start Check — Timer Running</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const CheckListScreen = ({route, navigation}) => {
  const {type, reg, trailer, odometer, companyId, startTime} = route.params;
  const {submitCheck} = useContext(AppContext);
  const [checks,setChecks] = useState({});
  const [defectPhoto,setDefectPhoto] = useState(null);
  const [notes,setNotes] = useState('');
  const [elapsed,setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now()-startTime?.getTime())/1000));
    }, 1000);
    return ()=>clearInterval(timer);
  },[]);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({mediaTypes:['image']});
    if (!res.canceled) setDefectPhoto(res.assets[0].uri);
  };

  const submit = async () => {
    const finishTime = new Date();
    const duration = Math.floor((finishTime-startTime)/1000);
    const allChecks = [];
    if (type!=='trailer') allChecks.push(...DVSA_CHECKS.vehicle);
    if (type!=='vehicle') allChecks.push(...DVSA_CHECKS.trailer);
    const passed = allChecks.every(c => checks[c.id]==='ok');

    await submitCheck({
      type, vehicleReg:reg, trailerNumber:trailer, odometer, companyId,
      startTime:startTime?.toISOString(), finishTime:finishTime.toISOString(), duration,
      checks, notes, hasDefect:!passed || !!notes.trim(), defectPhoto, passed
    });

    Alert.alert(
      '✅ Check Submitted', 
      `Date: ${new Date(startTime).toLocaleDateString()}\nDuration: ${Math.floor(duration/60)}m ${duration%60}s\n\nThank you for completing your walkaround check.`,
      [{text:'Done', onPress:()=>navigation.navigate('DriverPortal')}]
    );
  };

  const mins = Math.floor(elapsed/60), secs = elapsed%60;
  const listItems = type==='vehicle' ? DVSA_CHECKS.vehicle : type==='trailer' ? DVSA_CHECKS.trailer : [...DVSA_CHECKS.vehicle,...DVSA_CHECKS.trailer];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.timer}>⏱ {mins}:{secs.toString().padStart(2,'0')}</Text>
      <ScrollView>
        <Text style={styles.subHeading}>DVSA Walkaround Check</Text>
        {listItems.map(item => (
          <View key={item.id} style={styles.checkRow}>
            <Text style={styles.checkLabel}>{item.label}</Text>
            <View style={styles.checkBtns}>
              <TouchableOpacity style={[styles.checkBtn,checks[item.id]==='ok'&&styles.checkOk]}
                onPress={()=>setChecks(p=>({...p,[item.id]:'ok'}))}>
                <Text style={styles.checkBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.checkBtn,checks[item.id]==='defect'&&styles.checkBad]}
                onPress={()=>setChecks(p=>({...p,[item.id]:'defect'}))}>
                <Text style={styles.checkBtnText}>⚠</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={{marginTop:20,fontWeight:'600'}}>Other Defects / Notes</Text>
        <TextInput style={[styles.input,{height:80}]} placeholder='Describe any other issues...' value={notes} onChangeText={setNotes} multiline />
        <TouchableOpacity style={styles.btnSecondary} onPress={pickPhoto}>
          <Text style={styles.btnTextSecondary}>{defectPhoto ? '📷 Photo Attached ✓' : '📷 Upload Defect Photo'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={submit}>
          <Text style={styles.btnText}>✅ Submit Check</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── MAIN APP & NAVIGATION ──────────────────────────────
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const App = () => (
  <AppProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:COLORS.primary},headerTintColor:'#fff'}}>
        <Stack.Screen name='Home' component={HomeScreen} options={{headerShown:false}} />
        <Stack.Screen name='SelectRole' component={SelectRoleScreen} options={{title:'Create Account'}} />
        <Stack.Screen name='CompanyRegister' component={CompanyRegisterScreen} options={{title:'Company Sign Up'}} />
        <Stack.Screen name='DriverRegister' component={DriverRegisterScreen} options={{title:'Driver Sign Up'}} />
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='CompanyPortal' component={CompanyPortalScreen} options={{title:'Company Dashboard'}} />
        <Stack.Screen name='DriverPortal' component={DriverPortalScreen} options={{title:'Driver Dashboard'}} />
        <Stack.Screen name='CheckTypeSelect' component={CheckTypeSelectScreen} options={{title:'Walkaround Check'}} />
        <Stack.Screen name='CheckEntry' component={CheckEntryScreen} options={{title:'Vehicle Details'}} />
        <Stack.Screen name='CheckList' component={CheckListScreen} options={{title:'DVSA Inspection'}} />
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
);

// ─── STYLES ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.background,padding:20},
  centered:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:COLORS.background},
  logoWrap:{alignItems:'center',marginTop:60,marginBottom:40},
  logoText:{fontSize:28,fontWeight:'bold',color:COLORS.primary,letterSpacing:2},
  tagline:{fontSize:14,color:COLORS.textLight,marginTop:8},
  heading:{fontSize:24,fontWeight:'bold',color:COLORS.primary,marginBottom:20,textAlign:'center'},
  subHeading:{fontSize:18,fontWeight:'600',color:COLORS.text,marginBottom:12},
  welcome:{fontSize:16,color:COLORS.textLight,marginBottom:30,textAlign:'center'},
  status:{fontSize:14,marginBottom:8},
  text:{fontSize:14,color:COLORS.textLight,marginBottom:20},
  timer:{fontSize:22,fontWeight:'bold',color:COLORS.primary,textAlign:'center',marginBottom:15},
  input:{borderWidth:1,borderColor:COLORS.silver,borderRadius:8,padding:12,marginBottom:12,backgroundColor:'#fff'},
  btnPrimary:{backgroundColor:COLORS.primary,borderRadius:10,padding:15,alignItems:'center',marginVertical:8},
  btnSecondary:{backgroundColor:'transparent',borderWidth:2,borderColor:COLORS.primary,borderRadius:10,padding:15,alignItems:'center',marginVertical:8},
  btnDanger:{backgroundColor:COLORS.danger,borderRadius:10,padding:15,alignItems:'center',marginTop:30},
  btnText:{color:'#fff',fontWeight:'bold',fontSize:16},
  btnTextSecondary:{color:COLORS.primary,fontWeight:'600',fontSize:16},
  btnCol:{marginTop:40},
  backLink:{marginTop:20,alignItems:'center'},
  backText:{color:COLORS.accent},
  formScroll:{paddingBottom:40},
  addVehicleForm:{marginBottom:30,padding:15,backgroundColor:'#fff',borderRadius:12,borderWidth:1,borderColor:COLORS.silver},
  itemRow:{flexDirection:'row',justifyContent:'space-between',padding:12,borderBottomWidth:1,borderBottomColor:COLORS.light},
  itemText:{fontSize:14},
  itemStatus:{color:COLORS.success,fontWeight:'600'},
  checkRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:COLORS.light},
  checkLabel:{flex:1,fontSize:14},
  checkBtns:{flexDirection:'row',gap:10},
  checkBtn:{width:44,height:44,borderRadius:22,borderWidth:2,borderColor:COLORS.silver,alignItems:'center',justifyContent:'center'},
  checkOk:{backgroundColor:COLORS.success,borderColor:COLORS.success},
  checkBad:{backgroundColor:COLORS.danger,borderColor:COLORS.danger},
  checkBtnText:{color:'#fff',fontWeight:'bold',fontSize:18},
  loadingText:{fontSize:16,color:COLORS.textLight}
});

export default App;