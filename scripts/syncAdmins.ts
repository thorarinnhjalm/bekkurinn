
import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function syncAdmins() {
    console.log('🔄 Syncing System Admins from .env.local to Firestore...');

    const adminEmailsVar = process.env.NEXT_PUBLIC_ADMIN_EMAILS;

    if (!adminEmailsVar) {
        console.error('❌ NEXT_PUBLIC_ADMIN_EMAILS not found in .env.local');
        process.exit(1);
    }

    const emails = adminEmailsVar.split(',').map(e => e.trim()).filter(e => e.length > 0);
    console.log(`📋 Found ${emails.length} admin emails in config:`, emails);

    // Initialize Firebase Admin
    // Note: This requires GOOGLE_APPLICATION_CREDENTIALS to be set, 
    // or to be running in an environment with default credentials (like Cloud Functions or gcloud auth application-default login)
    try {
        if (getApps().length === 0) {
            initializeApp();
        }
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin. Make sure you have credentials set up.');
        console.error('   Run: gcloud auth application-default login');
        console.error(error);
        process.exit(1);
    }

    const auth = getAuth();
    const db = getFirestore();
    const adminsCollection = db.collection('system_admins');

    // 1. Get all current admin docs to identify removals
    const snapshot = await adminsCollection.get();
    const currentAdminIds = snapshot.docs.map(doc => doc.id);
    const newAdminIds: string[] = [];

    // 2. Process each email
    for (const email of emails) {
        try {
            const user = await auth.getUserByEmail(email);
            console.log(`✅ Found user for ${email}: ${user.uid}`);

            await adminsCollection.doc(user.uid).set({
                email: email,
                uid: user.uid,
                updatedAt: new Date(),
                source: 'env_sync'
            });

            newAdminIds.push(user.uid);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.warn(`⚠️ User not found for email: ${email} (Skipping structure creation for this user)`);
            } else {
                console.error(`❌ Error fetching user ${email}:`, error.message);
            }
        }
    }

    // 3. Remove admins that are no longer in the env var
    // BE CAREFUL: Only remove if we successfully processed at least one admin to avoid wiping DB on error
    if (newAdminIds.length > 0) {
        const toRemove = currentAdminIds.filter(id => !newAdminIds.includes(id));

        for (const id of toRemove) {
            console.log(`🗑️ Removing admin privileges for UID: ${id}`);
            await adminsCollection.doc(id).delete();
        }
    }

    console.log('✨ Sync complete!\n');
}

syncAdmins().catch(console.error);
