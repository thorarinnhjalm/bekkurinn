import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK for server-side operations
 *
 * Used for:
 * - Verifying ID tokens in API routes
 * - Server-side user management
 *
 * Requires FIREBASE_ADMIN_* environment variables or
 * GOOGLE_APPLICATION_CREDENTIALS pointing to service account JSON
 */

let adminApp: App;
let adminAuth: Auth;

function initializeAdminApp() {
    if (getApps().length === 0) {
        // Try to initialize with service account credentials from env vars
        const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
            adminApp = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } else {
            // Fall back to application default credentials (works in GCP/Firebase hosting)
            adminApp = initializeApp({
                projectId,
            });
        }
    } else {
        adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    return { adminApp, adminAuth };
}

// Initialize on module load
const initialized = initializeAdminApp();
adminApp = initialized.adminApp;
adminAuth = initialized.adminAuth;

export { adminApp, adminAuth };
