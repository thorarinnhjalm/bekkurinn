/**
 * Próf fyrir firestore.rules og storage.rules.
 *
 * Keyra aðeins á Firebase-emulator (`npm run test:rules`), aldrei á raun-Firebase:
 * verkefnisheitið byrjar á `demo-`, svo emulatorinn tengist engu raunverkefni.
 *
 * Bekkjarforritið er lokað og reglurnar loka öllu. Prófin ganga úr skugga um að
 * enginn, hvorki gestur, innskráður notandi, nafnlaus notandi né ofurstjórnandi,
 * komist að gögnum gamla forritsins úr vafra.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    assertFails,
    initializeTestEnvironment,
    type RulesTestContext,
    type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'demo-bekkurinn';
const ROOT = resolve(__dirname, '..');

let env: RulesTestEnvironment;

/** Söfn gamla forritsins ásamt dæmiskjali sem er sett inn framhjá reglunum. */
const SEED: Record<string, Record<string, Record<string, unknown>>> = {
    users: { 'parent-1': { uid: 'parent-1', email: 'foreldri@example.com', phone: '5551234', address: 'Gata 1' } },
    students: { 'student-1': { classId: 'class-1', name: 'Barn', birthDate: '2015-01-01', dietaryNeeds: ['nuts'] } },
    classes: { 'class-1': { joinCode: 'SKOLI-7-A-1234', parentTeamCode: 'SKOLI-7-A-1234-ADMIN', admins: ['parent-1'], schoolId: 'school-1' } },
    schools: { 'school-1': { name: 'Skóli', admins: ['parent-1'] } },
    parentLinks: { 'parent-1_class-1': { userId: 'parent-1', classId: 'class-1', studentId: 'student-1', status: 'approved', role: 'admin' } },
    tasks: { 'task-1': { classId: 'class-1', schoolId: 'school-1', scope: 'class', type: 'rolt', slotsTotal: 2, slotsFilled: 0, volunteers: [] } },
    announcements: { 'ann-1': { classId: 'class-1', scope: 'class', title: 'Tilkynning' } },
    lostItems: { 'lost-1': { schoolId: 'school-1', createdBy: 'parent-1', isClaimed: false, claimedBy: null } },
    notifications: { 'notif-1': { userId: 'parent-1', read: false } },
    agreements: { 'agr-1': { classId: 'class-1' } },
    testimonials: { 'test-1': { userId: 'parent-1', status: 'approved', text: 'Frábært' } },
    contactMessages: { 'msg-1': { email: 'a@example.com', message: 'Halló' } },
    system_admins: { 'super-1': { email: 'admin@example.com' } },
};

type Who = { label: string; ctx: () => RulesTestContext };

const WHO: Who[] = [
    { label: 'gestur (óinnskráður)', ctx: () => env.unauthenticatedContext() },
    { label: 'ókunnugur innskráður notandi', ctx: () => env.authenticatedContext('stranger', { email: 'x@example.com', email_verified: true }) },
    { label: 'nafnlaus notandi', ctx: () => env.authenticatedContext('anon', { firebase: { sign_in_provider: 'anonymous' } }) },
    { label: 'bekkjarfulltrúi og foreldri', ctx: () => env.authenticatedContext('parent-1', { email: 'foreldri@example.com', email_verified: true }) },
    { label: 'ofurstjórnandi', ctx: () => env.authenticatedContext('super-1', { email: 'admin@example.com', email_verified: true }) },
];

beforeAll(async () => {
    env = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: { rules: readFileSync(resolve(ROOT, 'firestore.rules'), 'utf8') },
        storage: { rules: readFileSync(resolve(ROOT, 'storage.rules'), 'utf8') },
    });
});

afterAll(async () => {
    await env?.cleanup();
});

beforeEach(async () => {
    await env.clearFirestore();
    await env.clearStorage();
    await env.withSecurityRulesDisabled(async (admin) => {
        const db = admin.firestore();
        for (const [col, docs] of Object.entries(SEED)) {
            for (const [id, data] of Object.entries(docs)) {
                await setDoc(doc(db, col, id), data);
            }
        }
        await setDoc(doc(db, 'agreements/agr-1/votes/parent-1'), { optionId: 'a' });
        await setDoc(doc(db, 'agreements/agr-1/signatures/parent-1'), { signedAt: 1 });

        const storage = admin.storage();
        const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
        for (const path of ['users/parent-1/profile.png', 'students/student-1/profile.png', 'lost-found/class-1/item.png']) {
            await uploadBytes(ref(storage, path), png, { contentType: 'image/png' });
        }
    });
});

describe('Firestore: söfn gamla forritsins eru lokuð', () => {
    for (const who of WHO) {
        describe(who.label, () => {
            for (const [col, docs] of Object.entries(SEED)) {
                const id = Object.keys(docs)[0];

                it(`getur hvorki lesið né listað ${col}`, async () => {
                    const db = who.ctx().firestore();
                    await assertFails(getDoc(doc(db, col, id)));
                    await assertFails(getDocs(collection(db, col)));
                });

                it(`getur hvorki búið til, breytt né eytt í ${col}`, async () => {
                    const db = who.ctx().firestore();
                    await assertFails(addDoc(collection(db, col), { x: 1 }));
                    await assertFails(setDoc(doc(db, col, 'nytt'), { x: 1 }));
                    await assertFails(updateDoc(doc(db, col, id), { x: 2 }));
                    await assertFails(deleteDoc(doc(db, col, id)));
                });
            }

            it('getur ekki fundið bekk eftir boðskóða', async () => {
                const db = who.ctx().firestore();
                await assertFails(getDocs(query(collection(db, 'classes'), where('joinCode', '==', 'SKOLI-7-A-1234'))));
            });

            it('getur ekki lesið né skrifað atkvæði og undirskriftir', async () => {
                const db = who.ctx().firestore();
                for (const sub of ['votes', 'signatures']) {
                    await assertFails(getDoc(doc(db, `agreements/agr-1/${sub}/parent-1`)));
                    await assertFails(setDoc(doc(db, `agreements/agr-1/${sub}/parent-1`), { x: 1 }));
                }
            });

            it('getur ekki búið til ný söfn', async () => {
                const db = who.ctx().firestore();
                await assertFails(setDoc(doc(db, 'eitthvad_nytt/a'), { x: 1 }));
                await assertFails(getDoc(doc(db, 'eitthvad_nytt/a')));
            });
        });
    }

    it('skráning á rölt (eldra gat): innskráður notandi getur ekki breytt sjálfboðaliðum', async () => {
        const db = env.authenticatedContext('stranger').firestore();
        await assertFails(updateDoc(doc(db, 'tasks', 'task-1'), { slotsFilled: 0, volunteers: [] }));
    });
});

describe('Storage: myndir eru lokaðar', () => {
    const PATHS = ['users/parent-1/profile.png', 'students/student-1/profile.png', 'lost-found/class-1/item.png'];
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

    for (const who of WHO) {
        describe(who.label, () => {
            for (const path of PATHS) {
                it(`getur hvorki lesið né hlaðið upp í ${path}`, async () => {
                    const storage = who.ctx().storage();
                    await assertFails(getBytes(ref(storage, path)));
                    await assertFails(uploadBytes(ref(storage, path), png, { contentType: 'image/png' }));
                });
            }

            it('getur ekki hlaðið upp eigin prófílmynd', async () => {
                const storage = who.ctx().storage();
                await assertFails(uploadBytes(ref(storage, 'users/stranger/profile.png'), png, { contentType: 'image/png' }));
                await assertFails(uploadBytes(ref(storage, 'users/parent-1/new.png'), png, { contentType: 'image/png' }));
            });
        });
    }
});
