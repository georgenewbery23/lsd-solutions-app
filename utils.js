// ==============================================
// 🛠️ LSD SOLUTIONS — COMPLETE UTILITIES LIBRARY
// ==============================================

// ------------------------------
// STORAGE HELPERS — LocalStorage with JSON support
// ------------------------------
export const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Storage get error [${key}]:`, e);
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage set error [${key}]:`, e);
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  }
};

// ------------------------------
// VALIDATION — Form & Data Checks
// ------------------------------
export const Validators = {
  email(email) {
    if (!email) return 'Email is required';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return 'Please enter a valid email address';
    return null;
  },
  
  required(value, fieldName = 'This field') {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },
  
  minLength(value, min, fieldName = 'This field') {
    if (!value || value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },
  
  licenceNumber(number) {
    if (!number) return 'Licence number is required';
    const clean = number.toUpperCase().replace(/\s/g, '');
    // UK DVLA format: 16 chars — 5 letters + 5 numbers + 2 letters + 4 numbers
    const regex = /^[A-Z9]{5}\d{5}[A-Z9]{2}\d{4}$/;
    if (!regex.test(clean)) return 'Please enter a valid 16-character driving licence number';
    return null;
  },
  
  postcode(postcode) {
    if (!postcode) return null; // allow empty
    const regex = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;
    if (!regex.test(postcode.toUpperCase())) return 'Please enter a valid UK postcode';
    return null;
  },
  
  phone(phone) {
    if (!phone) return null;
    const clean = phone.replace(/\s/g, '');
    const regex = /^(\+44|0)\d{10,11}$/;
    if (!regex.test(clean)) return 'Please enter a valid UK phone number';
    return null;
  }
};

// ------------------------------
// DATE & TIME — Extra helpers
// ------------------------------
export const Dates = {
  today() {
    return new Date().toISOString().split('T')[0];
  },
  
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  isExpired(date) {
    if (!date) return null;
    return new Date(date) < new Date();
  },
  
  daysUntilExpiry(date) {
    if (!date) return null;
    const expiry = new Date(date);
    const today = new Date();
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff;
  },
  
  formatShort(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short' 
    });
  },
  
  formatFull(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    });
  },
  
  formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-GB', { 
      hour: '2-digit', minute: '2-digit' 
    });
  },
  
  formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${this.formatShort(d)} at ${this.formatTime(d)}`;
  }
};

// ------------------------------
// FILES & DOCUMENTS — Upload helpers
// ------------------------------
export const Files = {
  formatSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${units[i]}`;
  },
  
  getExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  },
  
  isImage(filename) {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(this.getExtension(filename));
  },
  
  isPDF(filename) {
    return this.getExtension(filename) === 'pdf';
  },
  
  validateType(filename, allowed = ['pdf', 'jpg', 'jpeg', 'png']) {
    const ext = this.getExtension(filename);
    if (!allowed.includes(ext)) {
      return `File type not allowed. Please use: ${allowed.join(', ').toUpperCase()}`;
    }
    return null;
  },
  
  validateSize(bytes, maxMB = 5) {
    const maxBytes = maxMB * 1024 * 1024;
    if (bytes > maxBytes) {
      return `File too large. Maximum size: ${maxMB}MB`;
    }
    return null;
  }
};

// ------------------------------
// ERRORS — Friendly Firebase messages
// ------------------------------
export function friendlyFirebaseError(error) {
  const map = {
    'auth/email-already-in-use': 'This email address is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'No internet connection. Please check your network.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'permission-denied': 'You don\'t have permission to do that. Please check you\'re signed in correctly.',
    'not-found': 'That record no longer exists.',
    'unavailable': 'Server unavailable. Please check your connection and try again.'
  };
  
  for (const [key, msg] of Object.entries(map)) {
    if (error?.code?.includes(key) || error?.message?.includes(key)) {
      return msg;
    }
  }
  return error?.message || 'Something went wrong. Please try again.';
}

// ------------------------------
// DEBOUNCE — Prevent duplicate calls
// ------------------------------
export function debounce(func, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ------------------------------
// FORMS — Serialize form data to object
// ------------------------------
export function serializeForm(formElement) {
  const formData = new FormData(formElement);
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

// ------------------------------
// COPY TO CLIPBOARD
// ------------------------------
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

// ------------------------------
// EXPORT ALL TO WINDOW FOR EASY ACCESS
// ------------------------------
if (typeof window !== 'undefined') {
  window.Storage = Storage;
  window.Validators = Validators;
  window.Dates = Dates;
  window.Files = Files;
  window.friendlyFirebaseError = friendlyFirebaseError;
  window.debounce = debounce;
  window.serializeForm = serializeForm;
  window.copyToClipboard = copyToClipboard;
}

console.log('✅ LSD Solutions Utilities Loaded');