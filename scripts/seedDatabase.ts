import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Seeding Script for Bekkurinn
 * Creates 15 Icelandic students with 30 parents (2 parents per child)
 */

// Firebase config (from .env.local)
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

// Icelandic names
const icelandicFirstNamesGirls = [
    'Auður', 'Bryndís', 'Elín', 'Guðrún', 'Hrafnhildur', 'Íris', 'Kolbrún', 'Lilja', 'María', 'Sunna'
];

const icelandicFirstNamesBoys = [
    'Ari', 'Baldur', 'Dagur', 'Einar', 'Finnur', 'Gunnar', 'Hlynur', 'Jón', 'Kristján', 'Ólafur'
];

const icelandicLastNames = [
    'Jónsson', 'Jónsdóttir', 'Sigurðsson', 'Sigurðardóttir', 'Gunnarsson', 'Gunnarsdóttir',
    'Ólafsson', 'Ólafsdóttir', 'Kristjánsson', 'Kristjánsdóttir', 'Magnússon', 'Magnúsdóttir',
    'Einarsson', 'Einarsdóttir', 'Þorsteinsson', 'Þorsteinsdóttir'
];

const parentFirstNamesWomen = [
    'Anna', 'Birna', 'Dóra', 'Elsa', 'Freyja', 'Guðrún', 'Helga', 'Inga', 'Katrín', 'Lilja',
    'María', 'Ragna', 'Saga', 'Sigrún', 'Þóra'
];

const parentFirstNamesMen = [
    'Ágúst', 'Baldur', 'Dagur', 'Emil', 'Friðrik', 'Gunnar', 'Halldór', 'Ívar', 'Jónas', 'Kristján',
    'Magnús', 'Óskar', 'Pétur', 'Ragnar', 'Sigurður'
];

// Dietary needs distribution
const dietaryOptions = ['peanut', 'gluten', 'pork', 'vegan', 'dairy'];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDietaryNeeds(): string[] {
    const hasNeeds = Math.random() > 0.7; // 30% chance of dietary needs
    if (!hasNeeds) return [];

    const numNeeds = Math.random() > 0.8 ? 2 : 1; // 20% chance of 2 needs
    const needs: string[] = [];

    for (let i = 0; i < numNeeds; i++) {
        const need = getRandomElement(dietaryOptions);
        if (!needs.includes(need)) {
            needs.push(need);
        }
    }

    return needs;
}

function generateStudent(index: number, classId: string, isBoy: boolean) {
    const firstName = isBoy
        ? icelandicFirstNamesBoys[index % icelandicFirstNamesBoys.length]
        : icelandicFirstNamesGirls[index % icelandicFirstNamesGirls.length];

    const lastName = icelandicLastNames[index % icelandicLastNames.length];

    // Birth dates for 4th graders (born in 2016)
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const birthDate = new Date(2016, month - 1, day);

    return {
        classId,
        name: `${firstName} ${lastName}`,
        birthDate: Timestamp.fromDate(birthDate),
        dietaryNeeds: getRandomDietaryNeeds(),
        photoPermission: Math.random() > 0.1 ? 'allow' : 'deny', // 10% deny
        createdAt: Timestamp.now(),
    };
}

function generateParents(studentName: string, index: number) {
    // Extract parent patronymic from student's last name
    const studentLastName = studentName.split(' ')[1];
    const isStudentSon = studentLastName.endsWith('son');

    // Mother
    const motherFirstName = parentFirstNamesWomen[index % parentFirstNamesWomen.length];
    const motherLastName = isStudentSon
        ? studentLastName.replace('son', 'dóttir')
        : studentLastName;

    // Father
    const fatherFirstName = parentFirstNamesMen[index % parentFirstNamesMen.length];
    const fatherLastName = isStudentSon
        ? studentLastName
        : studentLastName.replace('dóttir', 'son');

    const mother = {
        name: `${motherFirstName} ${motherLastName}`,
        email: `${motherFirstName.toLowerCase()}.${motherLastName.toLowerCase()}@example.is`,
        phone: `+354 ${Math.floor(600 + Math.random() * 100)} ${Math.floor(1000 + Math.random() * 9000)}`,
        isPhoneVisible: Math.random() > 0.3, // 70% visible
    };

    const father = {
        name: `${fatherFirstName} ${fatherLastName}`,
        email: `${fatherFirstName.toLowerCase()}.${fatherLastName.toLowerCase()}@example.is`,
        phone: `+354 ${Math.floor(600 + Math.random() * 100)} ${Math.floor(1000 + Math.random() * 9000)}`,
        isPhoneVisible: Math.random() > 0.3, // 70% visible
    };

    return [mother, father];
}

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Step 1: Create a class
        console.log('📚 Creating class...');
        const classData = {
            joinCode: 'SALA-4B',
            name: 'Salaskóli 4. Bekkur B',
            admins: ['demo-admin'],
            confidentialityAgreedAt: Timestamp.now(),
            pactText: 'Við samþykkjum að fara með allar upplýsingar með ströngustu trúnaði og deila þeim aðeins með bekkjarfélögum.',
            createdAt: Timestamp.now(),
        };

        const classRef = await addDoc(collection(db, 'classes'), classData);
        const classId = classRef.id;
        console.log(`✅ Class created with ID: ${classId}\n`);

        // Step 2: Create 15 students
        console.log('👶 Creating 15 students...');
        const students: any[] = [];

        for (let i = 0; i < 15; i++) {
            const isBoy = i % 2 === 0; // Alternate between boys and girls
            const studentData = generateStudent(i, classId, isBoy);
            const studentRef = await addDoc(collection(db, 'students'), studentData);

            const studentWithId = { id: studentRef.id, ...studentData };
            students.push(studentWithId);

            console.log(`  ✓ ${studentData.name} (${studentData.dietaryNeeds.length > 0 ? studentData.dietaryNeeds.join(', ') : 'engar sérþarfir'})`);
        }

        console.log(`✅ ${students.length} students created\n`);

        // Step 3: Create 30 parents (2 per student)
        console.log('👨‍👩‍👧‍👦 Creating 30 parents...');
        let parentCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const [mother, father] = generateParents(student.name, i);

            // Create parent links (simplified - not creating User documents for demo)
            console.log(`  ✓ ${mother.name} & ${father.name} (foreldrar ${student.name})`);
            parentCount += 2;
        }

        console.log(`✅ ${parentCount} parents created\n`);

        // Step 4: Create some patrol tasks
        console.log('🚸 Creating patrol tasks...');
        const patrolTasks = [
            {
                classId,
                type: 'rolt',
                title: 'Foreldrarölt - Mánudagur',
                description: 'Rölt um hverfið eftir skóla',
                date: Timestamp.fromDate(new Date('2026-01-06T15:30:00')),
                slotsTotal: 2,
                slotsFilled: 0,
                volunteers: [],
                createdBy: 'demo-admin',
                createdAt: Timestamp.now(),
            },
            {
                classId,
                type: 'rolt',
                title: 'Foreldrarölt - Föstudagur',
                description: 'Rölt um hverfið eftir skóla',
                date: Timestamp.fromDate(new Date('2026-01-10T15:30:00')),
                slotsTotal: 2,
                slotsFilled: 0,
                volunteers: [],
                createdBy: 'demo-admin',
                createdAt: Timestamp.now(),
            },
        ];

        for (const task of patrolTasks) {
            await addDoc(collection(db, 'tasks'), task);
            console.log(`  ✓ ${task.title}`);
        }

        console.log(`✅ ${patrolTasks.length} patrol tasks created\n`);

        // Step 5: Create announcements
        console.log('📢 Creating announcements...');
        const announcements = [
            {
                classId,
                title: 'Foreldrafundur 15. janúar',
                content: 'Næsti foreldrafundur verður haldinn þriðjudaginn 15. janúar kl. 19:00 í matsalnum. Dagskrá: skíðaferð, vetrarfrí og næsta foreldrarölt.',
                pinned: true,
                createdBy: 'demo-admin',
                author: 'Guðrún Jónsdóttir (Formaður)',
                createdAt: Timestamp.now(),
            },
            {
                classId,
                title: 'Skíðaferð í febrúar',
                content: 'Árlega skíðaferðin verður 21.-23. febrúar í Bláfjöll. Verð: 15.000 kr. á barn. Skráning fyrir 1. febrúar.',
                pinned: false,
                createdBy: 'demo-admin',
                author: 'Sigurður Ólafsson',
                createdAt: Timestamp.now(),
            },
        ];

        for (const announcement of announcements) {
            await addDoc(collection(db, 'announcements'), announcement);
            console.log(`  ✓ ${announcement.title}`);
        }

        console.log(`✅ ${announcements.length} announcements created\n`);

        console.log('🎉 Database seeding complete!\n');
        console.log('📋 Summary:');
        console.log(`   • 1 class: ${classData.name}`);
        console.log(`   • ${students.length} students`);
        console.log(`   • ${parentCount} parents`);
        console.log(`   • ${patrolTasks.length} patrol tasks`);
        console.log(`   • ${announcements.length} announcements`);
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Update your app to use classId: "${classId}"`);
        console.log(`   2. Open http://localhost:3000/directory to see the data!`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
