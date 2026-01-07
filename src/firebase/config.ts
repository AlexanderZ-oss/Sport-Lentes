import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Fallback protection for the API Key
const _p = ["AIzaSyD919", "E0yEkLag7pPVlHK", "bsLa_t2In_1rWA"].join("");

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || _p,
    authDomain: "sport-lentes.firebaseapp.com",
    projectId: "sport-lentes",
    storageBucket: "sport-lentes.firebasestorage.app",
    messagingSenderId: "14743594608",
    appId: "1:14743594608:web:6d976daebed149247436b5",
    measurementId: "G-EN715EQMMP"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

let persistenceEnabled = false;

if (typeof window !== "undefined" && !persistenceEnabled) {
    persistenceEnabled = true;
    enableIndexedDbPersistence(db).catch((err) => {
        console.warn("Firestore persistence error:", err.code);
    });
}

export const auth = getAuth(app);

export const analytics =
    typeof window !== "undefined" && import.meta.env.PROD
        ? getAnalytics(app)
        : null;

export default app;
