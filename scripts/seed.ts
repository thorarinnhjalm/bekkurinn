import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp } from 'firebase/firestore';
import {
    createClass,
    createStudent,
    createTask,
    createAnnouncement,
} from '../services/firestore';

/**
 * Seed Script for Bekkurinn
 * 
 * Populates Firestore with demo data for testing
 * Run with: node --require ts-node/register scripts/seed.ts
 */

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

async function seed() {
    console.log('🌱 Seeding Bekkurinn database...\n');

    try {
        // Create a demo class
        console.log('Creating class...');
        const classId = await createClass({
            joinCode: 'SALA-4B',
            name: 'Salaskóli 4. Bekkur',
            schoolName: 'Salaskóli',
            grade: 4,
            admins: ['demo-admin-uid'],
            confidentialityAgreedAt: Timestamp.now(),
            pactText: '<p>Við samþykkjum að fara með allar upplýsingar með trúnaði.</p>',
        });
        console.log(`✓ Class created: ${classId}\n`);

        // Create demo students
        console.log('Creating students...');
        const students = [
            {
                name: 'Jón Jónsson',
                birthDate: Timestamp.fromDate(new Date('2016-01-15')),
                dietaryNeeds: ['peanut' as const],
            },
            {
                name: 'Anna Sigurðardóttir',
                birthDate: Timestamp.fromDate(new Date('2016-03-22')),
                dietaryNeeds: [],
            },
            {
                name: 'Pétur Pétursson',
                birthDate: Timestamp.fromDate(new Date('2016-05-10')),
                dietaryNeeds: ['gluten' as const],
            },
            {
                name: 'María Kristinsdóttir',
                birthDate: Timestamp.fromDate(new Date('2016-02-28')),
                dietaryNeeds: ['vegan' as const],
            },
        ];

        for (const student of students) {
            const studentId = await createStudent({
                classId,
                name: student.name,
                birthDate: student.birthDate,
                dietaryNeeds: student.dietaryNeeds,
                photoPermission: 'allow',
            });
            console.log(`✓ Student created: ${student.name} (${studentId})`);
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
            const taskId = await createTask({
                classId,
                type: 'rolt',
                title: 'Foreldrarölt',
                description: 'Vaktagátt um hverfið',
                date: Timestamp.fromDate(date),
                slotsTotal: 2,
                createdBy: 'demo-admin-uid',
                scope: 'class'
            });
            console.log(`✓ Patrol task created: ${date.toLocaleDateString('is-IS')} (${taskId})`);
        }
        console.log('');

        // Create demo event
        console.log('Creating event...');
        const eventId = await createTask({
            classId,
            type: 'event',
            title: 'Jólahátíð bekkjarins',
            description: 'Jólahátíð í skólanum',
            date: Timestamp.fromDate(new Date('2026-12-20')),
            slotsTotal: 5,
            createdBy: 'demo-admin-uid',
            scope: 'class'
        });
        console.log(`✓ Event created: ${eventId}\n`);

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
            const announcementId = await createAnnouncement({
                classId,
                title: announcement.title,
                content: announcement.content,
                pinned: announcement.pinned,
                createdBy: 'demo-admin-uid',
                author: 'Guðrún (Formaður)',
                scope: 'class'
            });
            console.log(`✓ Announcement created: ${announcement.title} (${announcementId})`);
        }

        console.log('\n✅ Seeding complete!\n');
        console.log(`📋 Join code: SALA-4B`);
        console.log(`🔗 Test at: http://localhost:3000/directory\n`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();
