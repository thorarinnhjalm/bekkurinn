import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Seed Script for Bekkurinn - FULL DEMO
 * 
 * Creates comprehensive data for 2 classes:
 * - 25 students per class
 * - Parents linked to students
 * - Birthdays spread across the year
 * - Multiple events and patrols
 */

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
    console.error('❌ Error: Missing env variables.');
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data Lists
const firstNames = ['Jón', 'Guðrún', 'Sigurður', 'Anna', 'Gunnar', 'Kristín', 'Ólafur', 'Margrét', 'Einar', 'Helga', 'Magnús', 'Sigríður', 'Stefán', 'Ingibjörg', 'Jóhann', 'Elísabet', 'Björn', 'Hanna', 'Árni', 'Eva', 'Páll', 'Karen', 'Ari', 'Ragnheiður', 'Daníel', 'Erla', 'Arnór', 'Hildur', 'Sindri', 'Rakel'];
const lastNames = ['Jónsson', 'Guðrúnardóttir', 'Sigurðsson', 'Jónsdóttir', 'Gunnarsson', 'Kristinsdóttir', 'Ólafsson', 'Margrétardóttir', 'Einarsson', 'Helgadóttir', 'Magnússon', 'Sigríðardóttir', 'Stefánsson', 'Ingibjargardóttir', 'Jóhannsson'];

// Helpers
function getRandomName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

function getRandomDate(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Firestore Helpers
async function createClass(data: any) {
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = await addDoc(collection(db, 'classes'), { ...cleanData, createdAt: serverTimestamp() });
    return docRef.id;
}

async function createStudent(data: any) {
    const cleanData = JSON.parse(JSON.stringify(data));
    const docRef = await addDoc(collection(db, 'students'), { ...cleanData, createdAt: serverTimestamp() });
    return docRef.id;
}

async function createDummyParent(name: string, email: string) {
    const uid = 'dummy_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'users', uid), {
        name,
        email,
        photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        createdAt: serverTimestamp(),
    });
    return uid;
}

async function linkParentToStudent(userId: string, studentId: string, classId: string, relationship: string) {
    const linkId = `${userId}_${studentId}`;
    await setDoc(doc(db, 'parentLinks', linkId), {
        userId,
        studentId,
        classId,
        relationship,
        status: 'approved',
        createdAt: serverTimestamp(),
    });
}

async function createTask(data: any) {
    const cleanData = JSON.parse(JSON.stringify(data));
    await addDoc(collection(db, 'tasks'), { ...cleanData, slotsFilled: 0, volunteers: [], createdAt: serverTimestamp() });
}

async function createAnnouncement(data: any) {
    const cleanData = JSON.parse(JSON.stringify(data));
    await addDoc(collection(db, 'announcements'), { ...cleanData, createdAt: serverTimestamp() });
}

async function seedFullDemo() {
    console.log('🌱 Seeding FULL Demo Scenario (Crowded Classes)...\n');

    try {
        // ==========================================
        // CLASS 1: 2. BEKKUR
        // ==========================================
        const class1Id = await createClass({
            joinCode: 'HLID-2B',
            name: 'Hlíðaskóli 2. Bekkur',
            schoolName: 'Hlíðaskóli',
            grade: 2,
            admins: ['demo-admin-uid'],
            confidentialityAgreedAt: new Date(),
            pactText: '<p>Við heitum trúnaði um allt sem fram fer í hópnum.</p>',
        });
        console.log(`✓ Class 1: ${class1Id}`);

        // Your Child
        const myChild1Id = await createStudent({
            classId: class1Id,
            name: 'Emilía (Þitt barn)',
            birthDate: new Date('2018-05-12'),
            dietaryNeeds: ['peanut'],
            photoPermission: 'allow',
        });

        // 24 Classmates + Parents
        for (let i = 0; i < 24; i++) {
            const firstName = firstNames[i % firstNames.length];
            const studentName = `${firstName} ${lastNames[i % lastNames.length]}`; // Simple last name logic

            const studentId = await createStudent({
                classId: class1Id,
                name: studentName,
                birthDate: getRandomDate(2018), // Born 2018
                dietaryNeeds: Math.random() > 0.8 ? ['gluten'] : [],
                photoPermission: 'allow',
            });

            // Add 1-2 parents per student
            const parentName = getRandomName();
            const parentUid = await createDummyParent(parentName, `parent${i}@demo.is`);
            await linkParentToStudent(parentUid, studentId, class1Id, 'Móðir');

            if (Math.random() > 0.5) {
                const parent2Name = getRandomName();
                const parent2Uid = await createDummyParent(parent2Name, `parent${i}_2@demo.is`);
                await linkParentToStudent(parent2Uid, studentId, class1Id, 'Faðir');
            }
        }
        console.log('  - Added 25 students & parents to 2. bekkur');

        // Events for 2. bekkur
        await createAnnouncement({ classId: class1Id, title: 'Velkomin í 2. bekk!', content: 'Hlökkum til vetrarins.', pinned: true, createdBy: 'sys', author: 'Kennari' });
        await createTask({ classId: class1Id, type: 'rolt', title: 'Foreldrarölt Janúar', description: 'Mæting við hlið.', date: new Date('2026-01-22'), slotsTotal: 2, createdBy: 'sys' });
        await createTask({ classId: class1Id, type: 'rolt', title: 'Foreldrarölt Febrúar', description: 'Mæting við hlið.', date: new Date('2026-02-05'), slotsTotal: 2, createdBy: 'sys' });
        await createTask({ classId: class1Id, type: 'event', title: 'Bekkjdkvöld', description: 'Pitsur og gleði.', date: new Date('2026-02-10'), slotsTotal: 5, createdBy: 'sys' });


        // ==========================================
        // CLASS 2: 9. BEKKUR
        // ==========================================
        const class2Id = await createClass({
            joinCode: 'HLID-9B',
            name: 'Hlíðaskóli 9. Bekkur',
            schoolName: 'Hlíðaskóli',
            grade: 9,
            admins: ['demo-admin-uid'],
            confidentialityAgreedAt: new Date(),
            pactText: '<p>Trúnaður.</p>',
        });
        console.log(`✓ Class 2: ${class2Id}`);

        // Your Child
        await createStudent({
            classId: class2Id,
            name: 'Gunnar (Þitt barn)',
            birthDate: new Date('2011-08-20'),
            dietaryNeeds: [],
            photoPermission: 'allow',
        });

        // 24 Classmates + Parents
        for (let i = 0; i < 24; i++) {
            const firstName = firstNames[(i + 5) % firstNames.length]; // Offset names
            const studentName = `${firstName} ${lastNames[(i + 5) % lastNames.length]}`;

            const studentId = await createStudent({
                classId: class2Id,
                name: studentName,
                birthDate: getRandomDate(2011), // Born 2011
                dietaryNeeds: Math.random() > 0.9 ? ['dairy'] : [],
                photoPermission: 'allow',
            });

            // Add 1 parent
            const parentName = getRandomName();
            const parentUid = await createDummyParent(parentName, `parent9b_${i}@demo.is`);
            await linkParentToStudent(parentUid, studentId, class2Id, 'Foreldri');
        }
        console.log('  - Added 25 students & parents to 9. bekkur');

        // Events for 9. bekkur
        await createAnnouncement({ classId: class2Id, title: 'Útskriftarferð', content: 'Söfnun hafin.', pinned: true, createdBy: 'sys', author: 'Gjaldkeri' });
        await createTask({ classId: class2Id, type: 'event', title: 'Árshátíð', description: 'Stóra kvöldið.', date: new Date('2026-03-15'), slotsTotal: 10, createdBy: 'sys' });
        await createTask({ classId: class2Id, type: 'rolt', title: 'Rölt Mars', description: 'Vakt.', date: new Date('2026-03-01'), slotsTotal: 2, createdBy: 'sys' });

        console.log('\n✅ FULL POPULATION COMPLETE');
        console.log('Codes: HLID-2B (2. bekkur), HLID-9B (9. bekkur)');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
    process.exit(0);
}

seedFullDemo();
