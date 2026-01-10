import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

const CLASS_ID = 'CLQCGsPBSZxKV4Zq6Xsg';
const CALENDAR_URL = 'https://www.kopavogur.is/static/files/skoladagatol/alfholsskoli_calendar_2025-2026.ics';

// Simple ICS Parser Helper
function parseICS(icsContent: string) {
    const events: any[] = [];
    const lines = icsContent.split(/\r\n|\n|\r/);
    let currentEvent: any = {};
    let inEvent = false;

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            inEvent = true;
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            inEvent = false;
            if (currentEvent.summary && currentEvent.dtstart) {
                events.push(currentEvent);
            }
        } else if (inEvent) {
            if (line.startsWith('SUMMARY:')) {
                currentEvent.summary = line.substring(8);
            } else if (line.startsWith('DTSTART;VALUE=DATE:')) {
                currentEvent.dtstart = line.substring(19); // YYYYMMDD
                currentEvent.isAllDay = true;
            } else if (line.startsWith('DTSTART:')) {
                currentEvent.dtstart = line.substring(8);
                currentEvent.isAllDay = false;
            }
        }
    }
    return events;
}

function parseDate(dateStr: string): Date {
    // Format: YYYYMMDD
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-based
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
}

async function importCalendar() {
    console.log('📅 Fetching calendar from:', CALENDAR_URL);

    try {
        const response = await fetch(CALENDAR_URL);
        const text = await response.text();
        const events = parseICS(text);

        console.log(`Found ${events.length} events. Filtering relevant ones...`);

        // Filter for relevant school events
        const keywords = ['Starfsdagur', 'Skipulagsdagur', 'Vetrarfrí', 'Jólafrí', 'Páskafrí', 'Skólasetning', 'Skólaslit', 'Lýðveldisdagurinn', 'Sumardagurinn fyrsti', 'Uppstigningardagur', 'Annar í hvítasunnu', 'Frídagur'];

        const relevantEvents = events.filter((e: any) =>
            keywords.some(k => e.summary.toLowerCase().includes(k.toLowerCase()))
        );

        console.log(` importing ${relevantEvents.length} school events to Class ID: ${CLASS_ID}...`);

        for (const event of relevantEvents) {
            const date = parseDate(event.dtstart);

            // Skip past events (optional, but good for cleanliness)
            // if (date < new Date()) continue;

            await addDoc(collection(db, 'tasks'), {
                classId: CLASS_ID,
                type: 'school_event',
                title: event.summary,
                description: 'Samkvæmt skóladagatali Kópavogs', // Source attribution
                date: Timestamp.fromDate(date),
                slotsTotal: 0, // No volunteers needed
                slotsFilled: 0,
                volunteers: [],
                createdBy: 'system-import',
                createdAt: Timestamp.now(),
            });
            console.log(`✓ Imported: ${event.summary} on ${date.toDateString()}`);
        }

        console.log('\n✅ Import complete!');

    } catch (error) {
        console.error('❌ Import failed:', error);
    }
    process.exit(0);
}

importCalendar();
