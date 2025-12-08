
/**
 * One-Time Migration Script
 * 
 * This script finds all patient documents that are missing a `doctorId` field
 * and updates them with a default doctor's ID.
 * 
 * ---
 * 
 * HOW TO RUN THIS SCRIPT:
 * 
 * 1.  This file is not part of the main application build. It is a standalone utility.
 * 2.  You need to run this script in an environment where you can connect to your 
 *     Firebase project with ADMIN privileges. A common way to do this is by setting
 *     up a Node.js script.
 * 
 * 3.  Example setup for a Node.js script:
 * 
 *     a. Make sure you have `firebase-admin` and `ts-node` installed:
 *        `npm install firebase-admin ts-node`
 * 
 *     b. Set up Firebase Admin credentials. Go to your Firebase project settings,
 *        find "Service accounts," and generate a new private key. Download the JSON file.
 * 
 *     c. Create a runner file, e.g., `run-migration.ts`:
 * 
 *        ```typescript
 *        import * as admin from 'firebase-admin';
 *        import { migratePatients } from './add-doctor-ids';
 * 
 *        // Load your service account key
 *        const serviceAccount = require('/path/to/your/serviceAccountKey.json');
 * 
 *        admin.initializeApp({
 *          credential: admin.credential.cert(serviceAccount),
 *          databaseURL: "https://your-project-id.firebaseio.com"
 *        });
 * 
 *        const db = admin.firestore();
 * 
 *        // Run the migration
 *        migratePatients(db).then(() => {
 *          console.log('Migration finished.');
 *          process.exit(0);
 *        }).catch(error => {
 *          console.error('Migration failed:', error);
 *          process.exit(1);
 *        });
 *        ```
 * 
 *     d. Run the script from your terminal:
 *        `npx ts-node run-migration.ts`
 * 
 * ---
 */

// Import necessary types from the Firestore Admin SDK for a standalone script.
// Note: This is different from the client-side SDK used in the app.
import { Firestore, Query, WriteBatch, DocumentSnapshot } from 'firebase-admin/firestore';

// --- CONFIGURATION ---
// IMPORTANT: Replace this with the actual UID of the doctor you want to assign to the unassigned patients.
const DEFAULT_DOCTOR_ID = "Y43GFgpcD3QY6xGM3f83hTzYV5i2"; 

/**
 * Migrates patient documents in Firestore to ensure they have a `doctorId`.
 * @param db The Firestore database instance from the Firebase Admin SDK.
 */
export async function migratePatients(db: Firestore): Promise<void> {
  if (!DEFAULT_DOCTOR_ID) {
    console.error("ERROR: Please set the DEFAULT_DOCTOR_ID constant in the script.");
    return;
  }

  console.log("Starting migration: Checking for patients missing a `doctorId`...");

  // Query for all users who are patients and do not have a doctorId field.
  const patientsRef = db.collection('users');
  const q: Query = patientsRef.where('role', '==', 'patient').where('doctorId', '==', null);

  const snapshot = await q.get();

  if (snapshot.empty) {
    console.log("No patients found without an assigned doctor. Migration is not needed.");
    return;
  }

  console.log(`Found ${snapshot.size} patient(s) to update.`);

  // Use a batch to update all documents efficiently.
  const batch: WriteBatch = db.batch();
  snapshot.forEach((doc: DocumentSnapshot) => {
    console.log(`  - Scheduling update for patient: ${doc.id}`);
    const docRef = patientsRef.doc(doc.id);
    batch.update(docRef, { doctorId: DEFAULT_DOCTOR_ID });
  });

  try {
    await batch.commit();
    console.log(`Successfully updated ${snapshot.size} patient document(s).`);
  } catch (error) {
    console.error("Error committing batch update:", error);
    throw error; // Re-throw the error to be caught by the runner.
  }
}

    