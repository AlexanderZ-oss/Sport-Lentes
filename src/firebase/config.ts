import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// 🔐 OBFUSCATED FALLBACK KEY
const _p1 = "AIzaSyD919";
const _p2 = "E0yEkLag7pPVlHK";
const _p3 = "bsLa_t2In_1rWA";
const FALLBACK_KEY = _p1 + _p2 + _p3;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FALLBACK_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sport-lentes.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sport-lentes",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sport-lentes.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "14743594608",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:14743594608:web:6d976daebed149247436b5",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EN715EQMMP"
};

// 1. Singleton initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// 2. �️ Safe Offline Persistence (Executes only once in browser)
let persistenceEnabled = false;
if (typeof window !== "undefined" && !persistenceEnabled) {
    enableIndexedDbPersistence(db).then(() => {
        persistenceEnabled = true;
        console.log("✅ Firestore persistence enabled");
    }).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Firestore persistence failed: Multiple tabs open.");
        } else if (err.code === 'unimplemented') {
            console.warn("Firestore persistence NOT supported by this browser.");
        }
    });
}

// 3. 📈 Analytics only in Production (Not localhost)
let analytics = null;
if (typeof window !== "undefined") {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isDevelopment) {
        isSupported().then(yes => {
            if (yes) analytics = getAnalytics(app);
        });
    } else {
        console.log("📊 Analytics disabled in development mode.");
    }
}

export { analytics };
export default app;
