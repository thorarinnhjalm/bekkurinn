import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, GeoPoint, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
console.log('🔧 CWD:', process.cwd());
console.log('🔧 Env Path:', envPath);
console.log('🔧 Env Exists:', fs.existsSync(envPath));

dotenv.config({ path: envPath });
import * as readline from 'readline';

// Config
const BATCH_SIZE = 450; // Safety margin below 500
const CSV_PATH = path.join(__dirname, 'Stadfangaskra.csv');

// Firebase Config (Must rely on env vars or hardcoded for script execution context)
// For local script execution, we often need to load .env manually or assume it's running with `dotenv` preloaded.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple ZIP to City map (Top ones)
const ZIP_MAP: Record<string, string> = {
    '101': 'Reykjavík', '103': 'Reykjavík', '104': 'Reykjavík', '105': 'Reykjavík', '107': 'Reykjavík', '108': 'Reykjavík', '109': 'Reykjavík', '110': 'Reykjavík', '111': 'Reykjavík', '112': 'Reykjavík', '113': 'Reykjavík', '116': 'Reykjavík', '121': 'Reykjavík',
    '200': 'Kópavogur', '201': 'Kópavogur', '202': 'Kópavogur', '203': 'Kópavogur',
    '210': 'Garðabær', '212': 'Garðabær',
    '220': 'Hafnarfjörður', '221': 'Hafnarfjörður', '222': 'Hafnarfjörður', '225': 'Álftanes',
    '270': 'Mosfellsbær', '271': 'Mosfellsbær',
    '170': 'Seltjarnarnes',
    '230': 'Reykjanesbær', '232': 'Reykjanesbær', '233': 'Reykjanesbær', '235': 'Keflavíkurflugvöllur',
    '240': 'Grindavík', '245': 'Sandgerði', '250': 'Garður', '260': 'Reykjanesbær',
    '300': 'Akranes',
    '600': 'Akureyri', '601': 'Akureyri', '603': 'Akureyri',
    '800': 'Selfoss',
};

async function importAddresses() {
    console.log('🇮🇸 Importing Icelandic Address Registry...');
    console.log(`📂 Reading from: ${CSV_PATH}`);

    if (!fs.existsSync(CSV_PATH)) {
        console.error('❌ CSV file not found!');
        process.exit(1);
    }

    const fileStream = fs.createReadStream(CSV_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let header: string[] = [];
    let processedCount = 0;
    let batch = writeBatch(db);
    let batchCount = 0;

    // Indices
    let idx_HEITI_NF = -1;
    let idx_HUSNR = -1;
    let idx_BOKST = -1;
    let idx_POSTNR = -1;
    let idx_N_HNIT = -1; // Lat
    let idx_E_HNIT = -1; // Lng
    let idx_SERHEITI = -1;

    for await (const line of rl) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Parse CSV line (Handling commas in quotes roughly, though Staðfangaskrá is distinct)
        // Staðfangaskrá seems to be standard comma separated.
        const cols = line.split(',');

        if (header.length === 0) {
            header = cols;
            // Identify Columns
            idx_HEITI_NF = header.indexOf('HEITI_NF');
            idx_HUSNR = header.indexOf('HUSNR');
            idx_BOKST = header.indexOf('BOKST');
            idx_POSTNR = header.indexOf('POSTNR');
            idx_N_HNIT = header.indexOf('N_HNIT_WGS84');
            idx_E_HNIT = header.indexOf('E_HNIT_WGS84');
            idx_SERHEITI = header.indexOf('SERHEITI'); // e.g. "Harpa"

            console.log('📋 Header parsed. Columns found:', {
                HEITI_NF: idx_HEITI_NF,
                HUSNR: idx_HUSNR,
                POSTNR: idx_POSTNR,
                LAT: idx_N_HNIT,
                LNG: idx_E_HNIT
            });
            continue;
        }

        try {
            const streetName = cols[idx_HEITI_NF];
            const houseNum = cols[idx_HUSNR];
            const houseLetter = cols[idx_BOKST];
            const zip = cols[idx_POSTNR];
            const latStr = cols[idx_N_HNIT];
            const lngStr = cols[idx_E_HNIT];
            const specialName = cols[idx_SERHEITI];

            if (!streetName || !houseNum || !latStr || !lngStr) continue;

            const fullHouseNum = houseLetter ? `${houseNum}${houseLetter}` : houseNum;
            const fullAddress = specialName
                ? `${specialName}, ${streetName} ${fullHouseNum}`
                : `${streetName} ${fullHouseNum}`;

            const city = ZIP_MAP[zip] || '';
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn(`⚠️ Invalid coords: ${lat}, ${lng} for in line: ${line.substring(0, 50)}...`);
                continue;
            }

            // Ensure no undefined values in docData
            const docData = {
                streetName: streetName || '',
                houseNumber: fullHouseNum || '',
                zip: zip || '',
                city: city || '',
                fullAddress: fullAddress || '',
                location: new GeoPoint(lat, lng),
                searchTerms: [
                    (streetName || '').toLowerCase(),
                    (fullAddress || '').toLowerCase(),
                    zip || ''
                ]
            };

            // Debug first item
            if (processedCount === 0) {
                console.log('🔍 First doc preview:', JSON.stringify(docData, null, 2));
            }

            // Generate a deterministic ID: "postnr_street_num" -> "201_baejarlind_8"
            const safeStreet = streetName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const safeNum = fullHouseNum.toLowerCase();
            const docId = `${zip}_${safeStreet}_${safeNum}`;

            const docRef = doc(db, 'addresses', docId);
            batch.set(docRef, docData);

            batchCount++;
            processedCount++;

            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                console.log(`💾 Saved batch. Total processed: ${processedCount}`);
                batch = writeBatch(db);
                batchCount = 0;
            }

        } catch (e) {
            console.error('Error processing line:', e);
        }
    }

    // Final batch
    if (batchCount > 0) {
        await batch.commit();
        console.log(`💾 Saved final batch.`);
    }

    console.log(`✅ Import complete! Processed ${processedCount} addresses.`);
}

importAddresses().catch(console.error);
