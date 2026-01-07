import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * Simple Seed Script for Bekkurinn
 * 
 * Populates Firestore with demo data for testing
 * Run with: npx tsx scripts/seedSimple.ts
 */

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
    console.log('🌱 Seeding Bekkurinn database...\n');

    try {
        // Create a demo class
        console.log('Creating class...');
        const classRef = await addDoc(collection(db, 'classes'), {
            joinCode: 'SALA-4B',
            name: '4. bekkur Hlíð - Salaskóli',
            schoolName: 'Salaskóli',
            grade: 4,
            section: 'Hlíð',
            admins: ['demo-admin-uid'],
            confidentialityAgreedAt: Timestamp.now(),
            pactText: '<p>Við samþykkjum að fara með allar upplýsingar með trúnaði.</p>',
            createdAt: Timestamp.now(),
        });
        const classId = classRef.id;
        console.log(`✓ Class created: ${classId}\n`);

        // Create demo students
        console.log('Creating students...');
        const students = [
            {
                name: 'Jón Jónsson',
                birthDate: Timestamp.fromDate(new Date('2016-01-15')),
                dietaryNeeds: ['peanut'],
            },
            {
                name: 'Anna Sigurðardóttir',
                birthDate: Timestamp.fromDate(new Date('2016-03-22')),
                dietaryNeeds: [],
            },
            {
                name: 'Pétur Pétursson',
                birthDate: Timestamp.fromDate(new Date('2016-05-10')),
                dietaryNeeds: ['gluten'],
            },
            {
                name: 'María Kristinsdóttir',
                birthDate: Timestamp.fromDate(new Date('2016-02-28')),
                dietaryNeeds: ['vegan'],
            },
            {
                name: 'Baldur Gunnarsson',
                birthDate: Timestamp.fromDate(new Date('2016-06-08')),
                dietaryNeeds: ['gluten', 'dairy'],
            },
        ];

        for (const student of students) {
            const studentRef = await addDoc(collection(db, 'students'), {
                classId,
                name: student.name,
                birthDate: student.birthDate,
                dietaryNeeds: student.dietaryNeeds,
                photoPermission: 'allow',
                createdAt: Timestamp.now(),
            });
            console.log(`✓ Student created: ${student.name} (${studentRef.id})`);
        }
        console.log('');

        // Create demo patrol tasks
        console.log('Creating patrol tasks...');
        const patrolDates = [
            new Date('2026-01-15'),
            new Date('2026-01-22'),
            new Date('2026-01-29'),
        ];

        for (const date of patrolDates) {
            const taskRef = await addDoc(collection(db, 'tasks'), {
                classId,
                type: 'rolt',
                title: 'Foreldrarölt',
                description: 'Vaktagátt um hverfið',
                date: Timestamp.fromDate(date),
                slotsTotal: 2,
                slotsFilled: 0,
                volunteers: [],
                createdBy: 'demo-admin-uid',
                createdAt: Timestamp.now(),
            });
            console.log(`✓ Patrol task created: ${date.toLocaleDateString('is-IS')} (${taskRef.id})`);
        }
        console.log('');

        // Create demo event
        console.log('Creating event...');
        const eventRef = await addDoc(collection(db, 'tasks'), {
            classId,
            type: 'event',
            title: 'Jólahátíð bekkjarins',
            description: 'Jólahátíð í skólanum',
            date: Timestamp.fromDate(new Date('2026-12-20')),
            slotsTotal: 5,
            slotsFilled: 0,
            volunteers: [],
            createdBy: 'demo-admin-uid',
            createdAt: Timestamp.now(),
        });
        console.log(`✓ Event created: ${eventRef.id}\n`);

        // Create demo announcements
        console.log('Creating announcements...');
        const announcements = [
            {
                title: 'Foreldrafundur',
                content:
                    'Næsti foreldrafundur er 15. janúar kl. 19:00 í matsalnum. Dagskrá: Röltið, sumarferð, og gjafir.',
                pinned: true,
            },
            {
                title: 'Bókaþjófurinn',
                content: 'Munum að senda börnunum með bók í dag fyrir bókaþjófinn! 📚',
                pinned: false,
            },
            {
                title: 'Jólahátíð bekkjarins',
                content:
                    'Takk fyrir frábæra jólahátíð! Sérstaklega þakkir til þeirra sem böku kökurnar og skreyttu. 🎄',
                pinned: false,
            },
        ];

        for (const announcement of announcements) {
            const announcementRef = await addDoc(collection(db, 'announcements'), {
                classId,
                title: announcement.title,
                content: announcement.content,
                pinned: announcement.pinned,
                createdBy: 'demo-admin-uid',
                author: 'Guðrún (Formaður)',
                createdAt: Timestamp.now(),
            });
            console.log(`✓ Announcement created: ${announcement.title} (${announcementRef.id})`);
        }

        console.log('\n✅ Seeding complete!\n');
        console.log(`📋 Join code: SALA-4B`);
        console.log(`🆔 Class ID: ${classId}`);
        console.log(`🔗 Test at: http://localhost:3000/is/directory\n`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();
