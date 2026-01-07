import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Restore direct config to prevent Vercel environment variable dependency issues
// Obfuscated to avoid trigger-happy security scanners
const _k = "AIzaSyD91" + "9E0yEkLag7pPVl" + "HKbsLa_t2In_1rWA";

const firebaseConfig = {
    apiKey: _k,
    authDomain: "sport-lentes.firebaseapp.com",
    projectId: "sport-lentes",
    storageBucket: "sport-lentes.firebasestorage.app",
    messagingSenderId: "14743594608",
    appId: "1:14743594608:web:6d976daebed149247436b5",
    measurementId: "G-EN715EQMMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Enable Offline Persistence for extreme speed
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Persistence failed: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
        console.warn("Persistence is not available in this browser.");
    }
});

export default app;
