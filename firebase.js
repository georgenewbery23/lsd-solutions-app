import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 👇 You'll replace these with your real Firebase credentials later
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER.firebaseapp.com",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER.appspot.com",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

let app, auth, db, storage;
let isDemoMode = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("✅ Firebase initialized");
  
  // Detect if still using placeholders
  if (firebaseConfig.apiKey === "PLACEHOLDER") {
    isDemoMode = true;
    console.log("⚠️ Running in DEMO MODE — connect Firebase for real accounts");
  }
} catch (err) {
  isDemoMode = true;
  console.warn("⚠️ Firebase not configured — DEMO MODE active:", err.message);
  auth = {};
  db = {};
  storage = {};
}

export { auth, db, storage, isDemoMode };
export default app;
