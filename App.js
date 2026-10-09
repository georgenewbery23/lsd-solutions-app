import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Firebase — aliased to avoid conflicts
import { 
  auth as fbAuth, 
  db as fbDb, 
  storage as fbStorage, 
  isDemoMode 
} from './firebase';

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  doc, setDoc, serverTimestamp
} from 'firebase/firestore';

import * as ImagePicker from 'expo-image-picker';

const Stack = createStackNavigator();

// ============== MAIN APP ==============
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "LSD Solutions — HGV Walkaround";
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    if (fbAuth && onAuthStateChanged) {
      unsubscribe = onAuthStateChanged(fbAuth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
    } else {
      console.log("⚠️ Firebase not connected — demo mode");
      setLoading(false);
    }
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading LSD Solutions...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0A337D' }, headerTintColor: '#fff' }}>
        {user ? (
          <>
            <Stack.Screen name="SelectType" component={SelectTypeScreen} options={{ title: 'New Walkaround Check' }} />
            <Stack.Screen name="VehicleSelect" component={VehicleSelectScreen} options={{ title: 'Vehicle & Trailer' }} />
            <Stack.Screen name="DefectCheck" component={DefectCheckScreen} options={{ title: 'Walkaround Check' }} />
            <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Check Report' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============== LOGIN SCREEN ==============
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(fbAuth, email, password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={loginStyles.container}>
      <Text style={loginStyles.title}>LSD Solutions</Text>
      <Text style={loginStyles.tagline}>For all your long haul, shunting & delivery needs</Text>
      <TextInput 
        style={loginStyles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address"
      />
      <TextInput 
        style={loginStyles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
        <Text style={loginStyles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={loginStyles.secondaryButton} 
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={loginStyles.secondaryText}>Don't have an account? Sign Up →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ============== SIGN UP SCREEN ==============
function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('driver');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }

    if (isDemoMode) {
      Alert.alert(
        '🔧 Demo Mode',
        'Account creation is for demonstration only.\n\nTo enable real accounts:\n1. Go to Firebase Console\n2. Create project & copy your config\n3. Replace the PLACEHOLDER values in firebase.js',
        [{ text: 'Got it', style: 'default' }]
      );
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(fbAuth, email, password);
      await setDoc(doc(fbDb, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        email: email,
        name: name,
        role: accountType,
        createdAt: serverTimestamp()
      });
      Alert.alert('✅ Account Created', 'Welcome to LSD Solutions!', [
        { text: 'OK', onPress: () => navigation.replace('SelectType') }
      ]);
    } catch (err) {
      Alert.alert('Sign Up Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={signupStyles.container}>
      <ScrollView>
        <Text style={signupStyles.title}>Create Account</Text>
        <Text style={signupStyles.tagline}>Join LSD Solutions</Text>
        
        <TextInput 
          style={signupStyles.input} 
          placeholder="Your Name" 
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={signupStyles.input} 
          placeholder="Email Address" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address"
        />
        <TextInput 
          style={signupStyles.input} 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        <TextInput 
          style={signupStyles.input} 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry 
        />
        
        <Text style={signupStyles.label}>Account Type</Text>
        <View style={signupStyles.typeRow}>
          <TouchableOpacity 
            style={[
              signupStyles.typeBtn,
              accountType === 'driver' && signupStyles.typeActive
            ]}
            onPress={() => setAccountType('driver')}
          >
            <Text style={accountType === 'driver' ? signupStyles.typeTextActive : signupStyles.typeText}>
              🚛 Driver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              signupStyles.typeBtn,
              accountType === 'company' && signupStyles.typeActive
            ]}
            onPress={() => setAccountType('company')}
          >
            <Text style={accountType === 'company' ? signupStyles.typeTextActive : signupStyles.typeText}>
              🏢 Company
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={signupStyles.button} onPress={handleSignUp}>
          <Text style={signupStyles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={signupStyles.backLink} 
          onPress={() => navigation.goBack()}
        >
          <Text style={signupStyles.backText}>← Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============== SELECT TYPE SCREEN ==============
function SelectTypeScreen({ navigation }) {
  return (
    <SafeAreaView style={selectStyles.container}>
      <Text style={selectStyles.heading}>Select Check Type</Text>
      <TouchableOpacity style={selectStyles.card} onPress={() => navigation.navigate('VehicleSelect', { mode: 'vehicle' })}>
        <Text style={selectStyles.cardTitle}>🚛 Vehicle Only</Text>
        <Text style={selectStyles.cardDesc}>Check truck / vehicle unit only</Text>
      </TouchableOpacity>
      <TouchableOpacity style={selectStyles.card} onPress={() => navigation.navigate('VehicleSelect', { mode: 'both' })}>
        <Text style={selectStyles.cardTitle}>🚛 + 📦 Vehicle & Trailer</Text>
        <Text style={selectStyles.cardDesc}>Check both unit and trailer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={selectStyles.card} onPress={() => navigation.navigate('VehicleSelect', { mode: 'trailer' })}>
        <Text style={selectStyles.cardTitle}>📦 Trailer Only</Text>
        <Text style={selectStyles.cardDesc}>Check trailer only</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 30 }} onPress={() => signOut(fbAuth)}>
        <Text style={{ color: 'red', textAlign: 'center' }}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const selectStyles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  card: { borderWidth: 2, borderColor: '#0A337D', borderRadius: 12, padding: 20, marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0A337D', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#666' }
});

// ============== VEHICLE SELECT SCREEN ==============
function VehicleSelectScreen({ route, navigation }) {
  const { mode } = route.params;
  const [vehReg, setVehReg] = useState('');
  const [trailerReg, setTrailerReg] = useState('');
  const [odometer, setOdometer] = useState('');

  return (
    <SafeAreaView style={vehStyles.container}>
      <ScrollView>
        {mode !== 'trailer' && (
          <>
            <Text style={vehStyles.label}>Vehicle Registration</Text>
            <TextInput style={vehStyles.input} placeholder="e.g. AB12 CDE" value={vehReg} onChangeText={setVehReg} autoCapitalize="characters" />
          </>
        )}
        {mode !== 'vehicle' && (
          <>
            <Text style={vehStyles.label}>Trailer Number / Reg</Text>
            <TextInput style={vehStyles.input} placeholder="e.g. T12345" value={trailerReg} onChangeText={setTrailerReg} autoCapitalize="characters" />
          </>
        )}
        <Text style={vehStyles.label}>Odometer Reading (miles)</Text>
        <TextInput style={vehStyles.input} placeholder="Current mileage" value={odometer} onChangeText={setOdometer} keyboardType="numeric" />
        <TouchableOpacity style={vehStyles.button} onPress={() => navigation.navigate('DefectCheck', { mode, vehReg, trailerReg, odometer })}>
          <Text style={vehStyles.buttonText}>Start Walkaround Check →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const vehStyles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#0A337D', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

// ============== DEFECT CHECK SCREEN ==============
function DefectCheckScreen({ route, navigation }) {
  const { mode, vehReg, trailerReg, odometer } = route.params;
  const startTime = new Date();
  const [checks, setChecks] = useState({});
  const [otherDefects, setOtherDefects] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  const vehicleChecks = [
    { id: 'lights', label: 'Lights & Indicators — working, clean, correct colour' },
    { id: 'tyres', label: 'Tyres — condition, pressure, tread depth (min 1.6mm), no cuts/bulges' },
    { id: 'brakes', label: 'Brakes — service, parking, air pressure, no leaks' },
    { id: 'steering', label: 'Steering — free play, no fluid leaks, secure' },
    { id: 'mirrors', label: 'Mirrors — all present, clean, secure' },
    { id: 'windscreen', label: 'Windscreen — chips/cracks, wipers/washers working' },
    { id: 'exhaust', label: 'Exhaust — no leaks, secure, no excessive smoke' },
    { id: 'fuel', label: 'Fuel system — no leaks, caps fitted, hoses secure' },
    { id: 'coupling', label: 'Coupling — fifth wheel, jaws, air/electrical connections secure' },
    { id: 'body', label: 'Body & Load — no damage, load secure, doors locked' },
    { id: 'docs', label: 'Documents — Operator Licence, Insurance, Discs in place' },
  ];

  const trailerChecks = [
    { id: 't_lights', label: 'Trailer Lights — all working, connections secure' },
    { id: 't_tyres', label: 'Trailer Tyres — condition, pressure, tread depth, no damage' },
    { id: 't_brakes', label: 'Trailer Brakes — service, parking, auto-reverse working' },
    { id: 't_suspension', label: 'Suspension — springs, air bags, fixings secure' },
    { id: 't_coupling', label: 'Coupling — kingpin, landing gear, legs operate correctly' },
    { id: 't_body', label: 'Body/Doors — no damage, seals good, doors secure/locked' },
    { id: 't_plates', label: 'Plates/Markings — registration, gross weight, dimensions correct' },
  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: prev[id] === 'ok' ? 'fault' : prev[id] === 'fault' ? null : 'ok' }));
  };

  const getChecklist = () => {
    if (mode === 'vehicle') return vehicleChecks;
    if (mode === 'trailer') return trailerChecks;
    return [...vehicleChecks, ...trailerChecks];
  };

  const completeCheck = () => {
    const finishTime = new Date();
    const durationMs = finishTime - startTime;
    const durationMins = Math.round(durationMs / 60000) || 1;

    navigation.navigate('Report', {
      mode, vehReg, trailerReg, odometer,
      startTime, finishTime, durationMins,
      checks, otherDefects, photoUri
    });
  };

  const list = getChecklist();

  return (
    <SafeAreaView style={defectStyles.container}>
      <Text style={defectStyles.timer}>Started: {startTime.toLocaleTimeString()}</Text>
      <ScrollView>
        {list.map(item => (
          <View key={item.id} style={defectStyles.itemRow}>
            <Text style={defectStyles.label}>{item.label}</Text>
            <View style={defectStyles.btnRow}>
              <TouchableOpacity
                style={[defectStyles.btn, checks[item.id] === 'ok' && defectStyles.btnOk]}
                onPress={() => toggleCheck(item.id)}
              >
                <Text style={checks[item.id] === 'ok' ? defectStyles.btnTextActive : defectStyles.btnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[defectStyles.btn, checks[item.id] === 'fault' && defectStyles.btnFault]}
                onPress={() => toggleCheck(item.id)}
              >
                <Text style={checks[item.id] === 'fault' ? defectStyles.btnTextActive : defectStyles.btnText}>✗</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={defectStyles.label}>Other Defects / Notes</Text>
        <TextInput
          style={defectStyles.notes}
          placeholder="Describe any other issues..."
          value={otherDefects}
          onChangeText={setOtherDefects}
          multiline numberOfLines={4}
        />
        <TouchableOpacity style={defectStyles.photoBtn} onPress={pickImage}>
          <Text>{photoUri ? '📷 Photo Attached ✓' : '📷 Add Photo of Defect'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={defectStyles.completeBtn} onPress={completeCheck}>
          <Text style={defectStyles.completeText}>Complete Walkaround Check</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const defectStyles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  timer: { fontSize: 14, color: '#0A337D', fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { flex: 1, fontSize: 14, paddingRight: 10 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  btnOk: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  btnFault: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  btnText: { color: '#999', fontWeight: 'bold' },
  btnTextActive: { color: '#fff', fontWeight: 'bold' },
  notes: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', marginBottom: 15 },
  photoBtn: { padding: 12, borderWidth: 1, borderColor: '#0A337D', borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  completeBtn: { backgroundColor: '#0A337D', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  completeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

// ============== REPORT SCREEN ==============
function ReportScreen({ route }) {
  const {
    mode, vehReg, trailerReg, odometer,
    startTime, finishTime, durationMins,
    checks, otherDefects, photoUri
  } = route.params;

  const hasFaults = Object.values(checks || {}).includes('fault') || otherDefects.trim() !== '';

  return (
    <SafeAreaView style={reportStyles.container}>
      <ScrollView>
        <Text style={reportStyles.title}>Walkaround Check Report</Text>
        <View style={reportStyles.section}>
          <Text style={reportStyles.label}>Check Type:</Text>
          <Text style={reportStyles.value}>{mode === 'vehicle' ? 'Vehicle Only' : mode === 'trailer' ? 'Trailer Only' : 'Vehicle & Trailer'}</Text>
        </View>
        {mode !== 'trailer' && (
          <View style={reportStyles.section}><Text style={reportStyles.label}>Vehicle Reg:</Text><Text style={reportStyles.value}>{vehReg || 'Not provided'}</Text></View>
        )}
        {mode !== 'vehicle' && (
          <View style={reportStyles.section}><Text style={reportStyles.label}>Trailer No:</Text><Text style={reportStyles.value}>{trailerReg || 'Not provided'}</Text></View>
        )}
        <View style={reportStyles.section}><Text style={reportStyles.label}>Odometer:</Text><Text style={reportStyles.value}>{odometer} miles</Text></View>
        <View style={reportStyles.section}><Text style={reportStyles.label}>Date:</Text><Text style={reportStyles.value}>{new Date(startTime).toLocaleDateString()}</Text></View>
        <View style={reportStyles.section}><Text style={reportStyles.label}>Start Time:</Text><Text style={reportStyles.value}>{new Date(startTime).toLocaleTimeString()}</Text></View>
        <View style={reportStyles.section}><Text style={reportStyles.label}>Finish Time:</Text><Text style={reportStyles.value}>{new Date(finishTime).toLocaleTimeString()}</Text></View>
        <View style={reportStyles.section}><Text style={reportStyles.label}>Duration:</Text><Text style={reportStyles.value}>{durationMins} minute{durationMins !== 1 ? 's' : ''}</Text></View>
        <View style={[reportStyles.statusBox, hasFaults ? reportStyles.hasFaults : reportStyles.allClear]}>
          <Text style={reportStyles.statusText}>{hasFaults ? '⚠️ DEFECTS REPORTED' : '✅ ALL ITEMS OK'}</Text>
        </View>
        {Object.entries(checks || {}).map(([id, status]) => status === 'fault' && (
          <View key={id} style={reportStyles.faultItem}>
            <Text style={{ color: '#e74c3c' }}>✗ Fault Recorded</Text>
          </View>
        ))}
        {otherDefects ? (
          <View style={reportStyles.section}>
            <Text style={reportStyles.label}>Other Defects:</Text>
            <Text style={reportStyles.value}>{otherDefects}</Text>
          </View>
        ) : null}
        {photoUri ? <Text style={{ textAlign: 'center', marginTop: 10 }}>📷 Photo attached to report</Text> : null}
        <Text style={reportStyles.footer}>LSD Solutions — For all your long haul, shunting & delivery needs</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const reportStyles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#0A337D' },
  section: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontWeight: '600', fontSize: 14 },
  value: { fontSize: 14, color: '#333' },
  statusBox: { padding: 15, borderRadius: 8, marginVertical: 20, alignItems: 'center' },
  allClear: { backgroundColor: '#d4edda' },
  hasFaults: { backgroundColor: '#f8d7da' },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  faultItem: { padding: 8, backgroundColor: '#fdf2f2', borderRadius: 4, marginBottom: 5 },
  footer: { textAlign: 'center', marginTop: 30, fontSize: 12, color: '#888' }
});

// ============== SHARED STYLES ==============
const loginStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0A337D', marginBottom: 5 },
  tagline: { fontSize: 14, color: '#666', marginBottom: 40, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15 },
  button: { backgroundColor: '#0A337D', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { marginTop: 20, padding: 10 },
  secondaryText: { color: '#0A337D', fontSize: 15 }
});

const signupStyles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A337D', textAlign: 'center', marginBottom: 5 },
  tagline: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, marginBottom: 15, fontSize: 15 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  typeBtn: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#ccc', alignItems: 'center' },
  typeActive: { borderColor: '#0A337D', backgroundColor: '#E8F0FE' },
  typeText: { fontSize: 15, color: '#666' },
  typeTextActive: { fontSize: 15, color: '#0A337D', fontWeight: '600' },
  button: { backgroundColor: '#0A337D', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  backLink: { marginTop: 25, alignItems: 'center' },
  backText: { color: '#0A337D', fontSize: 15 }
});

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontSize: 18, color: '#0A337D' }
});