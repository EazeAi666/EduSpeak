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

// const config = getSelectedConfig();
const config = FIREBASE_CONFIG; // Force use of manual config since user provided it

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

// Persistence disabled to debug connection errors
if (false && typeof window !== 'undefined') {
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
      // Use a timeout for the connection test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await getDocFromServer(doc(db, 'test', 'connection'));
      clearTimeout(timeoutId);
      console.log("Firestore: Connection established successfully.");
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.error("Firestore: Client is offline or service is unavailable. Check API key restrictions, Firestore rules, and ensure the Firestore API is enabled in your Google Cloud Console.");
      } else {
        console.log("Firestore: Connection test completed with status:", error.message);
      }
    }
  };
  // Only test if we are likely online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    testConnection();
  }
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
      userId: auth.currentUser?.uid || getEffectiveUserId(),
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous || !auth.currentUser,
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

export const getEffectiveUserId = () => {
  if (auth.currentUser) return auth.currentUser.uid;
  if (typeof window === 'undefined') return 'server-guest';
  
  const nickname = localStorage.getItem('eduspeak_nickname');
  if (nickname) {
    // We use a prefix to distinguish from actual Google UIDs
    return `guest_name_${nickname.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
  }

  let guestId = localStorage.getItem('eduspeak_guest_id');
  if (!guestId) {
    guestId = 'guest_anon_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('eduspeak_guest_id', guestId);
  }
  return guestId;
};

export const setGuestNickname = (name: string) => {
  localStorage.setItem('eduspeak_nickname', name);
  // Also ensure we have a stable ID for this name
  const guestId = `guest_name_${name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
  localStorage.setItem('eduspeak_guest_id', guestId);
};

export const getGuestNickname = () => {
  return localStorage.getItem('eduspeak_nickname') || '';
};

export const clearGuestSession = () => {
  localStorage.removeItem('eduspeak_nickname');
  localStorage.removeItem('eduspeak_guest_id');
};
