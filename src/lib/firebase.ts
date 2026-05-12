import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence, doc, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import firebaseConfigFromJson from '../../firebase-applet-config.json';
import { FIREBASE_CONFIG } from './firebaseConfig';

const env = import.meta.env;

// Determine which config to use
function getSelectedConfig() {
  const manual = FIREBASE_CONFIG;
  const envVars = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    databaseId: env.VITE_FIREBASE_DATABASE_ID
  };

  // 1. Check Environment Variables first
  if (envVars.apiKey && envVars.apiKey.trim().length > 10) {
    console.log('Firebase: Using Env config (Project: ' + envVars.projectId + ')');
    return {
      apiKey: envVars.apiKey.trim(),
      authDomain: envVars.authDomain?.trim() || `${envVars.projectId}.firebaseapp.com`,
      projectId: envVars.projectId?.trim() || '',
      storageBucket: envVars.storageBucket?.trim() || `${envVars.projectId}.firebasestorage.app`,
      messagingSenderId: envVars.messagingSenderId?.trim() || '',
      appId: envVars.appId?.trim() || '',
      databaseId: envVars.databaseId?.trim()
    };
  }

  // 2. Check Manual Configuration (firebaseConfig.ts)
  if (manual.apiKey && manual.apiKey.trim().length > 10) {
    console.log('Firebase: Using Manual config from firebaseConfig.ts (Project: ' + manual.projectId + ')');
    return {
      apiKey: manual.apiKey.trim(),
      authDomain: manual.authDomain?.trim() || `${manual.projectId}.firebaseapp.com`,
      projectId: manual.projectId?.trim() || '',
      storageBucket: manual.storageBucket?.trim() || `${manual.projectId}.firebasestorage.app`,
      messagingSenderId: manual.messagingSenderId?.trim() || '',
      appId: manual.appId?.trim() || '',
      databaseId: (manual as any).databaseId?.trim()
    };
  }

  // 3. Fallback to System Configuration (firebase-applet-config.json)
  console.log('Firebase: Using System fallback config (Project: ' + firebaseConfigFromJson.projectId + ')');
  return {
    apiKey: firebaseConfigFromJson.apiKey,
    authDomain: firebaseConfigFromJson.authDomain,
    projectId: firebaseConfigFromJson.projectId,
    storageBucket: firebaseConfigFromJson.storageBucket,
    messagingSenderId: firebaseConfigFromJson.messagingSenderId,
    appId: firebaseConfigFromJson.appId,
    databaseId: firebaseConfigFromJson.firestoreDatabaseId
  };
}

const config = getSelectedConfig();

// Debug log (safe)
console.log('Firebase Config Active Keys:', Object.keys(config).filter(k => !!(config as any)[k]));
if (config.apiKey) {
  console.log(`Firebase API Key initialized (starts with ${config.apiKey.substring(0, 6)}..., length: ${config.apiKey.length})`);
} else {
  console.error('Firebase API Key is MISSING in selected config!');
}

const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
});

export const auth = getAuth(app);
export const db = config.databaseId && config.databaseId !== '(default)' 
  ? getFirestore(app, config.databaseId) 
  : getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a a time.
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence failed: Browser not supported');
    }
  });

  // Test connection
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      console.warn("Firestore connection test completed (this is normal if the document doesn't exist):", error);
    }
  };
  testConnection();
}

export { serverTimestamp };
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => auth.signOut();
