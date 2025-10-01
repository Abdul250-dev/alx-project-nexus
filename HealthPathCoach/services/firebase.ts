import Constants from 'expo-constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback?: string): string => {
  // Try Expo Constants first
  const expoValue = Constants.expoConfig?.extra?.[key];
  if (expoValue) return expoValue;

  // Try process.env with proper typing
  const processValue = (process.env as Record<string, string | undefined>)[key];
  if (processValue) return processValue;

  // Return fallback or throw error
  if (fallback) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
};

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', "AIzaSyBnIw1uOF684o2QrYBEM8H4mslHEv_YxTo"),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', "healthapp-d711a.firebaseapp.com"),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', "healthapp-d711a"),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', "healthapp-d711a.firebasestorage.app"),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', "912153138945"),
  appId: getEnvVar('FIREBASE_APP_ID', "1:912153138945:web:2869d0ac13a71fb67a2d00"),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', "G-YEKH1ZFJGK")
};

// ========================================
// FIREBASE INITIALIZATION
// ========================================

let firebaseApp: firebase.app.App;

try {
  // Initialize Firebase with singleton pattern
  if (!firebase.apps.length) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    console.log('[Firebase] ✅ Firebase initialized successfully');
  } else {
    firebaseApp = firebase.app();
    console.log('[Firebase] ℹ️ Firebase already initialized, using existing instance');
  }
} catch (error) {
  console.error('[Firebase] ❌ Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase');
}

// ========================================
// EMULATOR CONFIGURATION
// ========================================

const isDevelopment = __DEV__;
const useEmulators = isDevelopment && Constants.expoConfig?.extra?.USE_FIREBASE_EMULATORS === 'true';

if (useEmulators) {
  try {
    // Connect to Firebase emulators
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const storage = firebase.storage();

    auth.useEmulator('http://localhost:9099');
    firestore.useEmulator('localhost', 8080);
    storage.useEmulator('localhost', 9199);

    console.log('[Firebase] 🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('[Firebase] ⚠️ Failed to connect to emulators:', error);
  }
}

// ========================================
// SERVICE EXPORTS
// ========================================

// Initialize and export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Export the Firebase app instance
export default firebaseApp;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get Firebase app instance
 */
export const getFirebaseApp = (): firebase.app.App => {
  return firebaseApp;
};

/**
 * Check if Firebase is properly initialized
 */
export const isFirebaseInitialized = (): boolean => {
  return !!firebaseApp;
};

/**
 * Get current Firebase configuration
 */
export const getFirebaseConfig = () => {
  return firebaseConfig;
};

/**
 * Reset Firebase app (useful for testing)
 */
export const resetFirebase = (): void => {
  if (firebaseApp) {
    firebaseApp.delete();
    console.log('[Firebase] 🔄 Firebase app reset');
  }
};

// ========================================
// ERROR HANDLING
// ========================================

// Global Firebase error handler
auth.onAuthStateChanged(
  (user) => {
    if (user) {
      console.log('[Firebase] 👤 User authenticated:', user.uid);
    } else {
      console.log('[Firebase] 👤 User signed out');
    }
  },
  (error) => {
    console.error('[Firebase] ❌ Auth state change error:', error);
  }
);

// Firestore error handler
db.enableNetwork().catch((error) => {
  console.error('[Firebase] ❌ Firestore network error:', error);
});

// ========================================
// TYPE EXPORTS
// ========================================

export type FirebaseApp = firebase.app.App;
export type FirebaseAuth = firebase.auth.Auth;
export type FirebaseFirestore = firebase.firestore.Firestore;
export type FirebaseStorage = firebase.storage.Storage;
