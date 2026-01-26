
const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Construct service account from env vars if possible, or use default google credentials
// For this script, we'll try to use the project ID to initialize via Google Application Default Credentials
// If you are logged in via `gcloud auth application-default login`, this works.
// Otherwise we might need a key.

// Let's assume the user has run `gcloud` login or similar, or we check if we can list without creds (unlikely).
// Actually, creating a client-side script is easier given we have `firebase` configured for web.
// But client-side is bound by rules. 

// Alternative: Use the Service Account Key if available.
// Since we don't have the key file handling handy, let's try a different approach:
// We will create a Next.js API route that does this check using firebase-admin logic IF we have the logic there.
// But we don't.

// Simpler: Just run a script using the client SDK but AUTHENTICATED as the super admin (via hardcoding/impersonation? No).
// Wait, the client SDK obeys rules. The rules say: 
// isSuperAdmin() = request.auth.token.email == 'thorarinnhjalmarsson@gmail.com'

// Let's verify what the server sees.
// I will create a temporary page `app/debug/page.tsx` that prints out the raw Firestore data 
// using the client SDK. This confirms if the BROWSER can see it.
// If the browser sees 0, and we trust I deployed rules, then either:
// 1. Browser is not sending the right auth token.
// 2. Rules are deployed to wrong project (resolved?).
// 3. Data is actually 0.

// Let's create a script that uses `firebase-admin`.
// We need to initialize it. 
// "firebase-admin" needs a service account or default creds.
// I will assume the user has default creds or I will guide them.

// ACTUALLY, I can use the `firebase-tools` CLI to check collection sizes!
// command: `npx firebase firestore:documents:list users --project bekkurinn-7f951`? No that's not a command.

// I will write a script that connects using the `firebase-admin` and tries to read.
// It might fail if no creds.

console.log("Checking DB counts for project: bekkurinn-7f951");

// NOTE: This requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth
// I'll try to use the standard initialization.

initializeApp({
    projectId: 'bekkurinn-7f951'
});

const db = getFirestore();

async function check() {
    try {
        const users = await db.collection('users').count().get();
        const schools = await db.collection('schools').count().get();
        const classes = await db.collection('classes').count().get();

        console.log('--- COUNTS ---');
        console.log('Users:', users.data().count);
        console.log('Schools:', schools.data().count);
        console.log('Classes:', classes.data().count);
        console.log('--------------');
    } catch (e) {
        console.error("Error:", e.message);
        console.log("Make sure you are authenticated. Try 'gcloud auth application-default login'");
    }
}

check();
