import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function patchCalendarUrls() {
    console.log('🔧 Starting Calendar URL Patch...');

    try {
        const classesRef = collection(db, 'classes');
        const snapshot = await getDocs(classesRef);

        console.log(`Found ${snapshot.size} classes. Checking URLs...`);

        let updateCount = 0;

        for (const classDoc of snapshot.docs) {
            const data = classDoc.data();
            const url = data.calendarUrl;

            if (url && typeof url === 'string' && url.includes('/Skoladagatol/')) {
                const newUrl = url.replace('/Skoladagatol/', '/skoladagatol/');
                console.log(`Fixing URL for class ${classDoc.id} (${data.name}):`);
                console.log(`  Old: ${url}`);
                console.log(`  New: ${newUrl}`);

                await updateDoc(doc(db, 'classes', classDoc.id), {
                    calendarUrl: newUrl
                });
                updateCount++;
            }
        }

        console.log(`✅ Patch complete. Updated ${updateCount} classes.`);

    } catch (error) {
        console.error('❌ Patch failed:', error);
    }
    process.exit(0);
}

patchCalendarUrls();
