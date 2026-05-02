import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize app (safe to call multiple times in dev)
export const app = initializeApp(config)

// Auth and persistence (browser)
export const auth = getAuth(app)
if (typeof window !== 'undefined') {
  // set persistent session in browser
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // ignore persistence errors (fallback to default)
  })
}

// Firestore
export const db = getFirestore(app)

const globalRef = globalThis as { __firebaseEmulatorsConnected?: boolean }

if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' && !globalRef.__firebaseEmulatorsConnected) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  globalRef.__firebaseEmulatorsConnected = true
}

// Providers
export const googleProvider = new GoogleAuthProvider()

export default {
  app,
  auth,
  db,
  googleProvider
}
