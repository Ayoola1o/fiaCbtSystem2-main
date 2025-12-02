import { initializeApp } from "firebase/app";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    Firestore
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

console.log("🔥 Firebase Config Debug:", {
    projectId: firebaseConfig.projectId,
    apiKey: firebaseConfig.apiKey ? "Set" : "Missing",
    env: import.meta.env
});

if (missingKeys.length > 0) {
    console.error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
    console.error("Please check your .env file.");
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
let db: Firestore;

try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
    console.log("Firestore initialized with offline persistence enabled.");
} catch (error) {
    console.error("Failed to initialize Firestore with offline persistence:", error);
    // Fallback to default initialization if persistence fails
    db = getFirestore(app);
}

let auth: any;

try {
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase Auth not initialized. This is expected if you haven't enabled Authentication in Firebase Console.", error);
    auth = null;
}

export { app, db, auth };
