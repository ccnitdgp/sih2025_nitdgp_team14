
'use client';

import { firebaseConfig as hardcodedConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    const app = getApp();
    // Re-enable persistence on subsequent loads if it's not already enabled.
    // This can happen on hot reloads in development.
    enableIndexedDbPersistence(getFirestore(app)).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one.
            // This is a normal scenario.
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence.
        }
    });
    return getSdks(app);
  }

  // For Vercel deployment, we use environment variables.
  // We fall back to the hardcoded config for other environments (like local dev without a .env file).
  const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || hardcodedConfig.projectId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || hardcodedConfig.appId,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || hardcodedConfig.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || hardcodedConfig.authDomain,
  };
  
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp);

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
          // This can happen if multiple tabs are open.
          console.warn("Firestore persistence failed to initialize. This is likely due to multiple tabs being open.");
      } else if (err.code == 'unimplemented') {
          console.warn("The browser does not support Firestore offline persistence.");
      }
  });

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export { addDocumentNonBlocking } from './non-blocking-updates';
