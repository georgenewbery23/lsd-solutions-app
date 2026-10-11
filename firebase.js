import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1futajZiZd79r08a8TJHAMfgtpPPk0rk",
  authDomain: "lsd-solutions.firebaseapp.com",
  projectId: "lsd-solutions",
  storageBucket: "lsd-solutions.firebasestorage.app",
  messagingSenderId: "833767217116",
  appId: "1:833767217116:web:b8c5d6e7f8a9b0c1d2e3f4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { doc, setDoc, getDoc }; // ← MUST BE HERE

// Keep connection warm — reduces delay on return visits
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (db?._?.initialized) {
      // Lightweight ping to keep connection alive
      getDoc(doc(db, '_system', 'ping')).catch(() => {});
    }
  }, 240000); // every 4 minutes
}
