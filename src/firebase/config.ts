import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD919E0yEkLag7pPVlHKbsLa_t2In_1rWA",
    authDomain: "sport-lentes.firebaseapp.com",
    projectId: "sport-lentes",
    storageBucket: "sport-lentes.firebasestorage.app",
    messagingSenderId: "14743594608",
    appId: "1:14743594608:web:6d976daebed149247436b5",
    measurementId: "G-EN715EQMMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
