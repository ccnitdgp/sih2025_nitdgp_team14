
'use client';

import { firebaseConfig as hardcodedConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
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
