import React, { useState, useContext, createContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal,
  SafeAreaView, Alert
} from 'react-native';

// ═══════════════════════════════════════════════════════════════
// 🔐 ADMIN LOGIN CREDENTIALS
// ═══════════════════════════════════════════════════════════════
const ADMIN_CREDENTIALS = {
  email: 'admin@lsd-solutions.co.uk',
  password: 'ABC-123-DEF-456'
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const LSD_THEME = {
  primary: '#1a237e',
  secondary: '#283593',
  accent: '#3949ab',
  success: '#2e7d32',
  warning: '#f57c00',
  danger: '#d32f2f',
  light: '#e8eaf6',
  dark: '#0d1442',
  gray: '#666666',
  lightGray: '#f5f5f5',
  white: '#ffffff',
  border: '#dde0e8',
};

const SUBSCRIPTION_TERMS = {
  basePricePerVehiclePerMonth: 2.00,
  trialDays: 30,
  penaltyAmount: 50.00,
  retentionYears: 3,
};

const BILLING_CODE_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  CUSTOM_MONTHLY: 'custom_monthly',
  FREE: 'free',
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const generateId = () => Math.random().toString(36).slice(2, 15) + Date.now().toString(36);
const formatDateUK = (d) => !d ? '—' : (d = new Date(d), isNaN(d) ? '—' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
const formatTimeUK = (d) => !d ? '—' : (d = new Date(d), isNaN(d) ? '—' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
const formatDuration = (s, f) => !s || !f ? '—' : ((m) => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`)(Math.round((new Date(f) - new Date(s)) / 60000));

const applyBillingCode = (baseAmount, code) => {
  if (!code || !code.active) return { amount: baseAmount, applied: false, discount: 0 };
  let amount = baseAmount, discount = 0;
  switch (code.type) {
    case BILLING_CODE_TYPES.PERCENTAGE:
      discount = baseAmount * (code.value / 100);
      amount = baseAmount - discount;
      break;
    case BILLING_CODE_TYPES.FIXED:
      discount = code.value;
      amount = Math.max(0, baseAmount - code.value);
      break;
    case BILLING_CODE_TYPES.CUSTOM_MONTHLY:
      amount = code.value;
      discount = baseAmount - amount;
      break;
    case BILLING_CODE_TYPES.FREE:
      amount = 0;
      discount = baseAmount;
      break;
  }
  return { amount, applied: true, discount, code };
};

const calculateMonthlyCost = (vehicles, appliedCode = null) => {
  const baseTotal = vehicles.filter(v => v.status === 'active').length * SUBSCRIPTION_TERMS.basePricePerVehiclePerMonth;
  return { baseTotal, ...applyBillingCode(baseTotal, appliedCode) };
};

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════
const AppContext = createContext(null);
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [billingCodes, setBillingCodes] = useState([
    { id: '1', code: 'LAUNCH50', type: BILLING_CODE_TYPES.PERCENTAGE, value: 50, active: true, name: 'Launch 50% Off' },
    { id: '2', code: 'FREEMONTH', type: BILLING_CODE_TYPES.FREE, value: 0, active: true, name: 'Complimentary Month' },
  ]);
  const [appliedBillingCode, setAppliedBillingCode] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <AppContext.Provider value={{
      user, setUser, company, setCompany, vehicles, setVehicles,
      billingCodes, setBillingCodes, appliedBillingCode, setAppliedBillingCode,
      isAdmin, setIsAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
};
const useApp = () => useContext(AppContext);

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════
const BrandHeader = ({ compact = false }) => (
  <View style={compact ? styles.headerCompact : styles.headerFull}>
    <Text style={[styles.brandMain, compact && styles.brandCompact]}>LSD Solutions</Text>
    {!compact && <Text style={styles.brandSub}>For All Your Long Haul, Shunting & Delivery Needs</Text>}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// 🏠 HOME SCREEN
// ═══════════════════════════════════════════════════════════════
const HomeScreen = ({ onSignup, onSignin }) => (
  <View style={styles.homeWrap}>
    <BrandHeader />
    <View style={styles.homeHero}>
      <Text style={styles.homeTagline}>For All Your Long Haul, Shunting & Delivery Needs</Text>
      <Text style={styles.homeSub}>DVSA Compliant Walkaround • Fleet Management • Compliance</Text>
    </View>
    <View style={styles.homeActions}>
      <TouchableOpacity style={styles.homePrimaryBtn} onPress={onSignup}>
        <Text style={styles.homeBtnText}>✍️ Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.homeSecondaryBtn} onPress={onSignin}>
        <Text style={styles.homeBtnTextDark}>🔑 Sign In</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.adminLink} onPress={() => onSignin('admin')}>
      <Text style={styles.adminLinkText}>⚙️ Admin Portal</Text>
    </TouchableOpacity>
  </View>
);

// ═══════════════════════════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════════════════════════
const SignupScreen = ({ onBack, onComplete }) => {
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({});

  const submit = () => {
    if (!role) return Alert.alert('Select Role', 'Choose Company or Driver');
    if (!form.email || !form.password) return Alert.alert('Missing Info', 'Fill email & password');
    if (form.password !== form.confirmPassword) return Alert.alert('Mismatch', 'Passwords do not match');
    onComplete({ ...form, role });
  };

  if (!role) return (
    <View style={styles.roleWrap}>
      <TouchableOpacity onPress={onBack}><Text style={styles.linkText}>← Back</Text></TouchableOpacity>
      <BrandHeader compact />
      <Text style={styles.roleTitle}>Create Your Account</Text>
      <TouchableOpacity style={styles.roleCard} onPress={() => setRole('company')}>
        <Text style={styles.roleIcon}>🏢</Text>
        <Text style={styles.roleName}>Company / Fleet Manager</Text>
        <Text style={styles.roleDesc}>Manage fleet, billing & compliance</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.roleCard} onPress={() => setRole('driver')}>
        <Text style={styles.roleIcon}>🚛</Text>
        <Text style={styles.roleName}>Driver</Text>
        <Text style={styles.roleDesc}>Walkaround checks & defect reporting</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.formWrap}>
      <TouchableOpacity onPress={() => setRole(null)}><Text style={styles.linkText}>← Change Role</Text></TouchableOpacity>
      <BrandHeader compact />
      <Text style={styles.formTitle}>{role === 'company' ? '🏢 Company Account' : '🚛 Driver Account'}</Text>
      {role === 'company' && (
        <>
          <TextInput placeholder="Legal Company Name *" style={styles.input} onChangeText={t => setForm(p => ({ ...p, companyName: t }))} />
          <TextInput placeholder="Trading As (if different)" style={styles.input} onChangeText={t => setForm(p => ({ ...p, tradingName: t }))} />
          <TextInput placeholder="Operator Licence Number" style={styles.input} onChangeText={t => setForm(p => ({ ...p, operatorLicenceNo: t }))} />
        </>
      )}
      {role === 'driver' && <TextInput placeholder="Full Name *" style={styles.input} onChangeText={t => setForm(p => ({ ...p, fullName: t }))} />}
      <TextInput placeholder="Email *" style={styles.input} autoCapitalize="none" keyboardType="email-address" onChangeText={t => setForm(p => ({ ...p, email: t }))} />
      <TextInput placeholder="Password *" style={styles.input} secureTextEntry onChangeText={t => setForm(p => ({ ...p, password: t }))} />
      <TextInput placeholder="Confirm Password *" style={styles.input} secureTextEntry onChangeText={t => setForm(p => ({ ...p, confirmPassword: t }))} />
      <TouchableOpacity style={styles.primaryBtn} onPress={submit}><Text style={styles.btnText}>Create Account</Text></TouchableOpacity>
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════
// SIGNIN — 🔐 ADMIN LOGIC
// ═══════════════════════════════════════════════════════════════
const SigninScreen = ({ onBack, onSuccess, prefilledType = null }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState(prefilledType || 'user');

  const handleSignin = () => {
    if (!email.trim() || !password.trim()) return Alert.alert('Required', 'Enter email and password');

    if (loginType === 'admin') {
      const emailMatch = email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
      const passMatch = password === ADMIN_CREDENTIALS.password;
      if (emailMatch && passMatch) {
        return onSuccess({ type: 'admin', email: ADMIN_CREDENTIALS.email, name: 'System Administrator', authenticated: true });
      }
      return Alert.alert('⚠️ Admin Access Denied', 'Invalid email or password.');
    }

    const isCompany = email.toLowerCase().includes('company') || email.toLowerCase().includes('fleet');
    onSuccess({ type: isCompany ? 'company' : 'driver', email, name: isCompany ? 'Demo Fleet Ltd' : 'Demo Driver', authenticated: true });
  };

  return (
    <View style={styles.formWrap}>
      <TouchableOpacity onPress={onBack} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
        <Text style={styles.linkText}>← Back</Text>
      </TouchableOpacity>
      <BrandHeader compact />
      <Text style={styles.formTitle}>{loginType === 'admin' ? '⚙️ Admin Sign In' : '🔑 Sign In'}</Text>

      {loginType !== 'admin' && (
        <View style={styles.loginTypeToggle}>
          <TouchableOpacity style={[styles.toggleBtn, loginType === 'user' && styles.toggleActive]} onPress={() => setLoginType('user')}>
            <Text>User Portal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, loginType === 'admin' && styles.toggleActive]} onPress={() => setLoginType('admin')}>
            <Text>Admin</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput placeholder="Email Address" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSignin}>
        <Text style={styles.btnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ⚙️ ADMIN PORTAL
// ═══════════════════════════════════════════════════════════════
const AdminPortal = ({ onLogout }) => {
  const { billingCodes, setBillingCodes, appliedBillingCode, setAppliedBillingCode } = useApp();
  const [activeTab, setActiveTab] = useState('codes');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [newCode, setNewCode] = useState({ code: '', type: BILLING_CODE_TYPES.PERCENTAGE, value: 0, active: true, name: '' });
  const [testVehicleCount, setTestVehicleCount] = useState(5);

  const saveCode = () => {
    if (!newCode.code.trim()) return Alert.alert('Required', 'Enter a code');
    if (['percentage', 'fixed', 'custom_monthly'].includes(newCode.type) && (isNaN(parseFloat(newCode.value)) || newCode.value < 0)) {
      return Alert.alert('Invalid', 'Enter valid number');
    }
    if (editingCode) {
      setBillingCodes(billingCodes.map(c => c.id === editingCode.id ? { ...c, ...newCode } : c));
    } else {
      setBillingCodes([...billingCodes, { id: generateId(), ...newCode }]);
    }
    setShowCodeModal(false);
    setEditingCode(null);
  };

  const toggleCodeActive = (id) => setBillingCodes(billingCodes.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const deleteCode = (id) => Alert.alert('Delete', 'Cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => setBillingCodes(billingCodes.filter(c => c.id !== id)) }
  ]);

  const preview = (() => {
    const base = testVehicleCount * SUBSCRIPTION_TERMS.basePricePerVehiclePerMonth;
    return appliedBillingCode ? applyBillingCode(base, appliedBillingCode) : { amount: base, discount: 0 };
  })();

  return (
    <View style={styles.adminWrap}>
      <View style={styles.adminHeader}>
        <BrandHeader compact />
        <TouchableOpacity onPress={onLogout}><Text style={{ color: LSD_THEME.danger }}>Logout</Text></TouchableOpacity>
      </View>

      <View style={styles.adminTabs}>
        {['codes', 'preview', 'settings'].map(tab => (
          <TouchableOpacity key={tab} style={[styles.adminTab, activeTab === tab && styles.adminTabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={activeTab === tab ? styles.adminTabTextActive : styles.adminTabText}>
              {tab === 'codes' ? '🎟️ Billing Codes' : tab === 'preview' ? '📊 Price Preview' : '⚙️ Settings'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.adminContent}>
        {activeTab === 'codes' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.heading}>Billing & Discount Codes</Text>
              <TouchableOpacity style={styles.primaryBtnSmall} onPress={() => { setEditingCode(null); setNewCode({ code: '', type: BILLING_CODE_TYPES.PERCENTAGE, value: 0, active: true, name: '' }); setShowCodeModal(true); }}>
                <Text style={{ color: '#fff' }}>+ New Code</Text>
              </TouchableOpacity>
            </View>
            {billingCodes.map(code => (
              <View key={code.id} style={styles.codeCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.codeDisplay}>{code.code}</Text>
                    <Text style={styles.codeName}>{code.name || 'Unnamed'}</Text>
                  </View>
                </View>
                <Text style={styles.codeValueAmount}>
                  {code.type === 'percentage' && `${code.value}% OFF`}
                  {code.type === 'fixed' && `£${code.value.toFixed(2)} OFF`}
                  {code.type === 'custom_monthly' && `£${code.value.toFixed(2)}/mo`}
                  {code.type === 'free' && '♾️ 100% FREE'}
                </Text>
                <View style={styles.codeActions}>
                  <TouchableOpacity onPress={() => toggleCodeActive(code.id)}>
                    <Text style={{ color: code.active ? LSD_THEME.success : LSD_THEME.gray }}>
                      {code.active ? '✅ Active' : '⏸️ Paused'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEditingCode(code); setNewCode({ ...code }); setShowCodeModal(true); }}>
                    <Text style={{ color: LSD_THEME.primary }}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteCode(code.id)}>
                    <Text style={{ color: LSD_THEME.danger }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'preview' && (
          <>
            <Text style={styles.heading}>📊 Pricing Calculator</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Base: £{SUBSCRIPTION_TERMS.basePricePerVehiclePerMonth.toFixed(2)}/vehicle/mo</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={String(testVehicleCount)} onChangeText={v => setTestVehicleCount(parseInt(v) || 0)} placeholder="Vehicles" />
              <ScrollView horizontal style={{ marginVertical: 12 }}>
                <TouchableOpacity style={[styles.codeChip, !appliedBillingCode && styles.codeChipActive]} onPress={() => setAppliedBillingCode(null)}>
                  <Text>None</Text>
                </TouchableOpacity>
                {billingCodes.filter(c => c.active).map(c => (
                  <TouchableOpacity key={c.id} style={[styles.codeChip, appliedBillingCode?.id === c.id && styles.codeChipActive]} onPress={() => setAppliedBillingCode(c)}>
                    <Text>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.previewDivider} />
              <View style={styles.previewRow}><Text>Subtotal:</Text><Text>£{(testVehicleCount * 2).toFixed(2)}</Text></View>
              {preview.discount > 0 && <View style={styles.previewRow}><Text style={{ color: LSD_THEME.success }}>Discount:</Text><Text style={{ color: LSD_THEME.success }}>-£{preview.discount.toFixed(2)}</Text></View>}
              <View style={[styles.previewRow, styles.previewTotal]}>
                <Text style={{ fontWeight: 'bold' }}>TOTAL/mo:</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: LSD_THEME.primary }}>£{preview.amount.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <Text style={styles.heading}>⚙️ Global Settings</Text>
            {[
              ['Base Rate', `£${SUBSCRIPTION_TERMS.basePricePerVehiclePerMonth.toFixed(2)}/vehicle/mo`],
              ['Trial Period', `${SUBSCRIPTION_TERMS.trialDays} days`],
              ['Late Fee', `£${SUBSCRIPTION_TERMS.penaltyAmount.toFixed(2)}`],
            ].map(([k, v]) => (
              <View key={k} style={styles.infoBox}>
                <Text style={styles.infoLabel}>{k}:</Text>
                <Text style={styles.infoValue}>{v}</Text>
              </View>
            ))}
            <View style={{ marginTop: 20, padding: 12, backgroundColor: LSD_THEME.light, borderRadius: 8 }}>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>🔐 Admin Credentials</Text>
              <Text style={{ fontSize: 12, color: LSD_THEME.gray }}>Email: {ADMIN_CREDENTIALS.email}</Text>
              <Text style={{ fontSize: 12, color: LSD_THEME.gray }}>Password: ABC-123-DEF-456</Text>
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={showCodeModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: LSD_THEME.light }}>
          <Text style={styles.formTitle}>{editingCode ? 'Edit' : 'Create'} Billing Code</Text>
          <TextInput placeholder="Code e.g. SAVE50" style={styles.input} autoCapitalize="characters" value={newCode.code} onChangeText={t => setNewCode(p => ({ ...p, code: t }))} />
          <TextInput placeholder="Display Name" style={styles.input} value={newCode.name} onChangeText={t => setNewCode(p => ({ ...p, name: t }))} />
          {[
            { v: BILLING_CODE_TYPES.PERCENTAGE, l: '% Discount' },
            { v: BILLING_CODE_TYPES.FIXED, l: 'Fixed £ Discount' },
            { v: BILLING_CODE_TYPES.CUSTOM_MONTHLY, l: 'Custom Flat Rate' },
            { v: BILLING_CODE_TYPES.FREE, l: 'Free (Zero Price)' },
          ].map(opt => (
            <TouchableOpacity key={opt.v} style={[styles.optionRow, newCode.type === opt.v && styles.optionSelected]} onPress={() => setNewCode(p => ({ ...p, type: opt.v }))}>
              <Text style={{ fontWeight: newCode.type === opt.v ? '600' : 'normal' }}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
          {newCode.type !== BILLING_CODE_TYPES.FREE && (
            <TextInput placeholder="Value" style={styles.input} keyboardType="decimal-pad" value={String(newCode.value)} onChangeText={v => setNewCode(p => ({ ...p, value: parseFloat(v) || 0 }))} />
          )}
          <View style={styles.toggleRow}>
            <Text>Active</Text>
            <TouchableOpacity onPress={() => setNewCode(p => ({ ...p, active: !p.active }))}>
              <Text style={{ fontSize: 20 }}>{newCode.active ? '🟢' : '🔴'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCodeModal(false)}>
              <Text style={styles.btnTextDark}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={saveCode}>
              <Text style={styles.btnText}>{editingCode ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPANY PORTAL
// ═══════════════════════════════════════════════════════════════
const CompanyPortal = ({ onLogout }) => {
  const { company, vehicles, setVehicles, billingCodes, appliedBillingCode, setAppliedBillingCode } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({});
  const [codeInput, setCodeInput] = useState('');

  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const billing = calculateMonthlyCost(vehicles, appliedBillingCode);

  const applyCode = () => {
    const found = billingCodes.find(c => c.code.toUpperCase() === codeInput.toUpperCase() && c.active);
    if (found) {
      setAppliedBillingCode(found);
      Alert.alert('✅ Applied', `${found.name} — pricing updated`);
    } else {
      Alert.alert('Invalid Code', 'Check and try again');
    }
    setCodeInput('');
  };

  const addVehicle = () => {
    if (!newVehicle.reg) return Alert.alert('Required', 'Enter registration');
    setVehicles([...vehicles, {
      id: generateId(), reg: newVehicle.reg.toUpperCase(),
      make: newVehicle.make || '', model: newVehicle.model || '',
      status: 'active', createdAt: new Date().toISOString()
    }]);
    setShowAddVehicle(false); setNewVehicle({});
  };

  return (
    <View style={styles.portalWrap}>
      <View style={styles.portalHeader}>
        <BrandHeader compact />
        <TouchableOpacity onPress={onLogout}><Text style={{ color: LSD_THEME.danger }}>Logout</Text></TouchableOpacity>
      </View>
      <View style={styles.portalTabs}>
        {['dashboard', 'fleet', 'billing'].map(tab => (
          <TouchableOpacity key={tab} style={[styles.portalTab, activeTab === tab && styles.portalTabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={activeTab === tab ? styles.portalTabTextActive : styles.portalTabText}>
              {tab === 'dashboard' ? '📊' : tab === 'fleet' ? '🚛' : '💷'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.portalContent}>
        {activeTab === 'dashboard' && (
          <>
            <Text style={styles.heading}>Welcome, {company?.tradingAs || company?.legalName}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}><Text style={styles.statNum}>{activeVehicles.length}</Text><Text>Active Vehicles</Text></View>
              <View style={styles.statCard}><Text style={styles.statNum}>£{billing.amount.toFixed(2)}</Text><Text>Monthly</Text></View>
            </View>
            {billing.applied && (
              <View style={styles.codeAppliedBox}>
                <Text style={{ color: LSD_THEME.success }}>✅ {appliedBillingCode.code} — saving £{billing.discount.toFixed(2)}/mo</Text>
              </View>
            )}
          </>
        )}
        {activeTab === 'fleet' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.heading}>Fleet Vehicles</Text>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setShowAddVehicle(true)}><Text style={{ color: '#fff' }}>+ Add</Text></TouchableOpacity>
            </View>
            {activeVehicles.map(v => (
              <View key={v.id} style={styles.vehicleCard}>
                <Text style={{ fontWeight: 'bold' }}>{v.reg}</Text>
                <Text style={{ color: LSD_THEME.gray }}>{v.make} {v.model}</Text>
              </View>
            ))}
            <Modal visible={showAddVehicle} animationType="slide">
              <SafeAreaView style={{ padding: 20 }}>
                <Text style={styles.formTitle}>Add Vehicle</Text>
                <TextInput placeholder="Registration *" style={styles.input} onChangeText={t => setNewVehicle(p => ({ ...p, reg: t }))} autoCapitalize="characters" />
                <TextInput placeholder="Make" style={styles.input} onChangeText={t => setNewVehicle(p => ({ ...p, make: t }))} />
                <TextInput placeholder="Model" style={styles.input} onChangeText={t => setNewVehicle(p => ({ ...p, model: t }))} />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowAddVehicle(false)}><Text>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={addVehicle}><Text style={{ color: '#fff' }}>Add Vehicle</Text></TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
          </>
        )}
        {activeTab === 'billing' && (
          <>
            <Text style={styles.heading}>💷 Billing</Text>
            <Text style={{ marginBottom: 8 }}>Base Rate: £{SUBSCRIPTION_TERMS.basePricePerVehiclePerMonth.toFixed(2)}/vehicle/mo</Text>
            <TextInput placeholder="Enter Billing Code" style={styles.input} value={codeInput} onChangeText={setCodeInput} autoCapitalize="characters" />
            <TouchableOpacity style={styles.primaryBtn} onPress={applyCode}><Text style={styles.btnText}>Apply Code</Text></TouchableOpacity>
            {billing.applied && (
              <View style={styles.codeAppliedBox}>
                <Text>Code: {appliedBillingCode.name}</Text>
                <Text>Base: £{billing.baseTotal.toFixed(2)} → Now: £{billing.amount.toFixed(2)}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// DRIVER PORTAL — Walkaround Check ✅ COMPLETE
// ═══════════════════════════════════════════════════════════════
const DriverPortal = ({ onLogout }) => {
  const [checkType, setCheckType] = useState(null);
  const [vehicleReg, setVehicleReg] = useState('');
  const [trailerNum, setTrailerNum] = useState('');
  const [odometer, setOdometer] = useState('');
  const [checkStarted, setCheckStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [checkItems, setCheckItems] = useState({});
  const [defectNote, setDefectNote] = useState('');
  const [showReport, setShowReport] = useState(false);

  const CHECKLISTS = {
    vehicle: ['Tyres & Pressures', 'Brakes & Suspension', 'Lights & Indicators', 'Windscreen & Wipers', 'Mirrors', 'Fluid Levels', 'Fuel & AdBlue', 'Exhaust', 'Doors', 'Speedometer', 'Tachograph', 'Horn', 'Coupling', 'Bodywork', 'Emergency Equipment'],
    trailer: ['Tyres & Wheels', 'Braking System', 'Lights & Reflectors', 'Coupling Security', 'Doors & Curtains', 'Floor & Sides', 'Roof & Tarps', 'Load Restraints', 'Markings', 'Suspension', 'Air/Electrical Connections', 'Number Plate', 'Safety Equipment'],
  };

  const getItems = () => {
    if (checkType === 'vehicle') return CHECKLISTS.vehicle;
    if (checkType === 'trailer') return CHECKLISTS.trailer;
    return [...CHECKLISTS.vehicle, ...CHECKLISTS.trailer];
  };

  const startCheck = () => {
    if (!odometer.trim()) return Alert.alert('Required', 'Enter odometer reading');
    if (checkType !== 'trailer' && !vehicleReg.trim()) return Alert.alert('Required', 'Enter vehicle registration');
    if (checkType !== 'vehicle' && !trailerNum.trim()) return Alert.alert('Required', 'Enter trailer number');
    setStartTime(new Date().toISOString());
    setCheckStarted(true);
    const items = {};
    getItems().forEach(i => items[i] = null);
    setCheckItems(items);
  };

  const completeCheck = () => {
    const allDone = getItems().every(i => checkItems[i] !== null);
    if (!allDone) return Alert.alert('Incomplete', 'Mark all items OK or Defect');
    setShowReport(true);
  };

  if (showReport) return (
    <View style={{ flex: 1, padding: 20, backgroundColor: LSD_THEME.light }}>
      <Text style={styles.heading}>✅ Walkaround Check Report</Text>
      <View style={styles.reportBox}>
        <Text style={styles.reportLabel}>Date:</Text><Text>{formatDateUK(startTime)}</Text>
        <Text style={styles.reportLabel}>Vehicle:</Text><Text>{vehicleReg || 'N/A'}</Text>
        <Text style={styles.reportLabel}>Trailer:</Text><Text>{trailerNum || 'N/A'}</Text>
        <Text style={styles.reportLabel}>Odometer:</Text><Text>{odometer} km</Text>
        <Text style={styles.reportLabel}>Start:</Text><Text>{formatTimeUK(startTime)}</Text>
        <Text style={styles.reportLabel}>Finish:</Text><Text>{formatTimeUK(new Date())}</Text>
        <Text style={styles.reportLabel}>Duration:</Text><Text style={{ fontWeight: 'bold' }}>{formatDuration(startTime, new Date().toISOString())}</Text>
        {defectNote ? <><Text style={styles.reportLabel}>Defects:</Text><Text style={{ color: LSD_THEME.danger }}>{defectNote}</Text></> : null}
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => {
        setCheckType(null); setVehicleReg(''); setTrailerNum(''); setOdometer('');
        setCheckStarted(false); setStartTime(null); setCheckItems({}); setDefectNote(''); setShowReport(false);
      }}>
        <Text style={styles.btnText}>New Check</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onLogout} style={{ marginTop: 12 }}>
        <Text style={{ color: LSD_THEME.danger, textAlign: 'center' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  if (!checkStarted) return (
    <View style={styles.portalWrap}>
      <View style={styles.portalHeader}>
        <BrandHeader compact />
        <TouchableOpacity onPress={onLogout}><Text style={{ color: LSD_THEME.danger }}>Logout</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.heading}>🚛 Daily Walkaround Check</Text>
        {!checkType ? (
          <>
            <Text style={{ marginBottom: 12 }}>Select Check Type:</Text>
            {[
              { v: 'vehicle', l: '🚛 Vehicle Only' },
              { v: 'trailer', l: '🚍 Trailer Only' },
              { v: 'both', l: '🚛+🚍 Vehicle & Trailer' },
            ].map(opt => (
              <TouchableOpacity key={opt.v} style={styles.checkTypeCard} onPress={() => setCheckType(opt.v)}>
                <Text style={{ fontSize: 16 }}>{opt.l}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setCheckType(null)}><Text style={styles.linkText}>← Change Type</Text></TouchableOpacity>
            {checkType !== 'trailer' && (
              <TextInput placeholder="Vehicle Registration" style={styles.input} value={vehicleReg} onChangeText={setVehicleReg} autoCapitalize="characters" />
            )}
            {checkType !== 'vehicle' && (
              <TextInput placeholder="Trailer Number" style={styles.input} value={trailerNum} onChangeText={setTrailerNum} autoCapitalize="characters" />
            )}
            <TextInput placeholder="Odometer Reading" style={styles.input} value={odometer} onChangeText={setOdometer} keyboardType="numeric" />
            <TouchableOpacity style={styles.primaryBtn} onPress={startCheck}>
              <Text style={styles.btnText}>▶️ Start Walkaround</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.portalWrap}>
      <View style={styles.portalHeader}>
        <BrandHeader compact />
        <View>
          <Text style={{ fontSize: 12, color: LSD_THEME.success }}>● Started: {formatTimeUK(startTime)}</Text>
        </View>
        <TouchableOpacity onPress={onLogout}><Text style={{ color: LSD_THEME.danger }}>Logout</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.heading}>Checking: {vehicleReg || trailerNum}</Text>
        {getItems().map(item => (
          <View key={item} style={styles.checkItemRow}>
            <Text style={{ flex: 1 }}>{item}</Text>
            <TouchableOpacity style={[styles.statusBtn, checkItems[item] === 'ok' && styles.statusOk]} onPress={() => setCheckItems(p => ({ ...p, [item]: 'ok' }))}>
              <Text>✓ OK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusBtn, checkItems[item] === 'defect' && styles.statusDefect]} onPress={() => setCheckItems(p => ({ ...p, [item]: 'defect' }))}>
              <Text>⚠️ Defect</Text>
            </TouchableOpacity>
          </View>
        ))}
        {Object.values(checkItems).includes('defect') && (
          <TextInput placeholder="Describe defects found..." style={[styles.input, { marginTop: 16, height: 80 }]} value={defectNote} onChangeText={setDefectNote} multiline />
        )}
        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={completeCheck}>
          <Text style={styles.btnText}>✅ Submit Check</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP ROUTER
// ═══════════════════════════════════════════════════════════════
const AppRouter = () => {
  const { user, setUser, setCompany, setIsAdmin, setVehicles } = useApp();
  const [screen, setScreen] = useState('home');

  const handleSignupComplete = (data) => {
    if (data.role === 'company') {
      setCompany({
        id: generateId(),
        legalName: data.companyName,
        tradingAs: data.tradingName || data.companyName,
        email: data.email,
        operatorLicenceNo: data.operatorLicenceNo || '',
        subscription: { status: 'trial', startedAt: new Date().toISOString() }
      });
      setUser({ type: 'company', email: data.email, name: data.companyName });
    } else {
      setUser({ type: 'driver', email: data.email, name: data.fullName });
    }
  };

  const handleSigninSuccess = (data) => {
    setUser(data);
    if (data.type === 'admin') {
      setIsAdmin(true);
    } else if (data.type === 'company') {
      setCompany({
        id: generateId(),
        legalName: 'Demo Fleet Ltd',
        tradingAs: 'Demo Fleet',
        email: data.email,
        subscription: { status: 'active' }
      });
      setVehicles([
        { id: 'v1', reg: 'AB12 XYZ', make: 'Volvo', model: 'FH', status: 'active', createdAt: new Date().toISOString() },
        { id: 'v2', reg: 'CD34 ABC', make: 'Mercedes', model: 'Actros', status: 'active', createdAt: new Date().toISOString() },
      ]);
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    setIsAdmin(false);
    setScreen('home');
  };

  if (!user) {
    if (screen === 'home') return <HomeScreen onSignup={() => setScreen('signup')} onSignin={(t) => setScreen(t === 'admin' ? 'signin-admin' : 'signin')} />;
    if (screen === 'signup') return <SignupScreen onBack={() => setScreen('home')} onComplete={handleSignupComplete} />;
    if (screen === 'signin' || screen === 'signin-admin') {
      return <SigninScreen onBack={() => setScreen('home')} onSuccess={handleSigninSuccess} prefilledType={screen === 'signin-admin' ? 'admin' : 'user'} />;
    }
  }

  if (user.type === 'admin') return <AdminPortal onLogout={logout} />;
  if (user.type === 'company') return <CompanyPortal onLogout={logout} />;
  if (user.type === 'driver') return <DriverPortal onLogout={logout} />;

  return <HomeScreen onSignup={() => setScreen('signup')} onSignin={() => setScreen('signin')} />;
};

// ═══════════════════════════════════════════════════════════════
// ✅ COMPLETE & FIXED STYLESHEET — NO MORE ERRORS
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  homeWrap: { flex: 1, padding: 24, backgroundColor: LSD_THEME.light },
  homeHero: { alignItems: 'center', marginVertical: 32 },
  homeTagline: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  homeSub: { fontSize: 14, color: LSD_THEME.gray, textAlign: 'center' },
  homeActions: { gap: 16, marginVertical: 24 },
  homePrimaryBtn: { backgroundColor: LSD_THEME.primary, padding: 16, borderRadius: 10, alignItems: 'center' },
  homeSecondaryBtn: { backgroundColor: LSD_THEME.white, padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: LSD_THEME.border },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  homeBtnTextDark: { fontSize: 16, fontWeight: 'bold' },
  adminLink: { marginTop: 16, alignItems: 'center' },
  adminLinkText: { color: LSD_THEME.primary, fontSize: 14 },

  headerFull: { alignItems: 'center', marginBottom: 24 },
  headerCompact: { alignItems: 'flex-start', marginBottom: 16 },
  brandMain: { fontSize: 24, fontWeight: 'bold', color: LSD_THEME.primary },
  brandCompact: { fontSize: 18 },
  brandSub: { fontSize: 12, color: LSD_THEME.gray, marginTop: 4 },

  roleWrap: { flex: 1, padding: 24, backgroundColor: LSD_THEME.light },
  roleTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  roleCard: { backgroundColor: '#fff', padding: 24, borderRadius: 12, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: LSD_THEME.border },
  roleIcon: { fontSize: 36, marginBottom: 8 },
  roleName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  roleDesc: { fontSize: 12, color: LSD_THEME.gray },

  formWrap: { padding: 24, backgroundColor: LSD_THEME.light },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: LSD_THEME.border },
  primaryBtn: { backgroundColor: LSD_THEME.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryBtnSmall: { backgroundColor: LSD_THEME.primary, padding: 8, borderRadius: 6 },
  secondaryBtn: { backgroundColor: LSD_THEME.lightGray, padding: 16, borderRadius: 10, alignItems: 'center' },
  smallBtn: { backgroundColor: LSD_THEME.primary, padding: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnTextDark: { fontSize: 16, fontWeight: 'bold' },
  linkText: { color: LSD_THEME.primary, marginBottom: 16 },

  loginTypeToggle: { flexDirection: 'row', marginBottom: 20, backgroundColor: LSD_THEME.lightGray, borderRadius: 8, padding: 4 },
  toggleBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 },

  adminWrap: { flex: 1, backgroundColor: LSD_THEME.light },
  adminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  adminTabs: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: LSD_THEME.border },
  adminTab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
  adminTabActive: { borderBottomWidth: 2, borderColor: LSD_THEME.primary },
  adminTabText: { color: LSD_THEME.gray },
  adminTabTextActive: { color: LSD_THEME.primary, fontWeight: '600' },
  adminContent: { padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  codeCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12 },
  codeDisplay: { fontSize: 18, fontWeight: 'bold' },
  codeName: { fontSize: 12, color: LSD_THEME.gray, marginBottom: 8 },
  codeValueAmount: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  codeActions: { flexDirection: 'row', gap: 16 },
  previewCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  previewLabel: { fontSize: 14, marginBottom: 12 },
  previewDivider: { height: 1, backgroundColor: LSD_THEME.border, marginVertical: 12 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  previewTotal: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: LSD_THEME.border },
    codeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, backgroundColor: LSD_THEME.lightGray },
  codeChipActive: { backgroundColor: LSD_THEME.primary },
  infoBox: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  infoLabel: { fontWeight: '600' },
  infoValue: { color: LSD_THEME.gray },
  optionRow: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  optionSelected: { backgroundColor: LSD_THEME.light },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },

  portalWrap: { flex: 1, backgroundColor: LSD_THEME.light },
  portalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: LSD_THEME.border },
  portalTabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: LSD_THEME.border },
  portalTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  portalTabActive: { borderBottomWidth: 2, borderColor: LSD_THEME.primary },
  portalTabText: { fontSize: 20, opacity: 0.4 },
  portalTabTextActive: { fontSize: 20 },
  portalContent: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 10, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: 'bold', color: LSD_THEME.primary },
  codeAppliedBox: { padding: 12, backgroundColor: '#e8f5e9', borderRadius: 8, marginBottom: 16 },
  vehicleCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 8 },

  checkTypeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: LSD_THEME.border },
  checkItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: LSD_THEME.border },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginLeft: 8, backgroundColor: LSD_THEME.lightGray },
  statusOk: { backgroundColor: '#c8e6c9' },
  statusDefect: { backgroundColor: '#ffcdd2' },
  reportBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20 },
  reportLabel: { fontWeight: '600', marginTop: 8 },
});

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}