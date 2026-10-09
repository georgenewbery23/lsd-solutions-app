import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 👇 You'll replace these with your real Firebase credentials later
const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.firebasestorage.app",
  messagingSenderId: "833767217116",
  appId: "1:833767217116:web:b29188de76b5778a086119",
  measurementId: "G-7YF4T8BBPT"
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
