import { db } from '@/lib/firebase/config';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    runTransaction,
    writeBatch,
    DocumentReference,
    DocumentData
} from 'firebase/firestore';
import { Agreement, AgreementVote, CreateAgreementInput } from '@/types';

const COLLECTION_NAME = 'agreements';
const VOTES_SUBCOLLECTION = 'votes';

// Get active agreement for a class
export async function getAgreementByClass(classId: string): Promise<Agreement | null> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('classId', '==', classId),
        // We usually only want the latest one, but for now let's just get the most recent created
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Return the first one (most recent)
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Agreement;
}

// Create a new agreement
export async function createAgreement(data: CreateAgreementInput): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
}

// Update agreement (e.g., change status, set winning values)
export async function updateAgreement(agreementId: string, data: Partial<Agreement>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, agreementId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

// Cast a vote
export async function castVote(agreementId: string, vote: Omit<AgreementVote, 'id' | 'timestamp'>): Promise<void> {
    const voteRef = doc(db, COLLECTION_NAME, agreementId, VOTES_SUBCOLLECTION, vote.userId);
    await utilSetDoc(voteRef, { // Using setDoc to overwrite previous vote if any
        ...vote,
        id: vote.userId,
        timestamp: serverTimestamp()
    });
}

// Helper for setDoc since I didn't import it above and want to be consistent
import { setDoc } from 'firebase/firestore';
async function utilSetDoc(ref: DocumentReference, data: DocumentData) {
    await setDoc(ref, data);
}

// Get all votes for an agreement (Admin only typically)
export async function getAgreementVotes(agreementId: string): Promise<AgreementVote[]> {
    const q = query(collection(db, COLLECTION_NAME, agreementId, VOTES_SUBCOLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgreementVote));
}

// Get MY vote
export async function getMyVote(agreementId: string, userId: string): Promise<AgreementVote | null> {
    const docRef = doc(db, COLLECTION_NAME, agreementId, VOTES_SUBCOLLECTION, userId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as AgreementVote;
}
const SIGNATURES_SUBCOLLECTION = 'signatures';

// Sign an agreement
export async function signAgreement(agreementId: string, signature: { userId: string; userName: string; timestamp?: any }): Promise<void> {
    const sigRef = doc(db, COLLECTION_NAME, agreementId, SIGNATURES_SUBCOLLECTION, signature.userId);
    await utilSetDoc(sigRef, {
        ...signature,
        timestamp: signature.timestamp || serverTimestamp()
    });
}

// Get all signatures for an agreement
export async function getAgreementSignatures(agreementId: string): Promise<DocumentData[]> {
    const q = query(collection(db, COLLECTION_NAME, agreementId, SIGNATURES_SUBCOLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Delete an agreement
export async function deleteAgreement(agreementId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, agreementId));
    } catch (error) {
        console.error('Failed to delete agreement', error);
        throw new Error('Gat ekki eytt sáttmála');
    }
}
