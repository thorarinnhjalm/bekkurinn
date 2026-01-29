import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAgreement, castVote, signAgreement, getAgreementByClass } from '@/services/agreementService';
import { addDoc, getDocs, setDoc } from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/firestore')>();
    return {
        ...actual,
        getDocs: vi.fn(),
        getDoc: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        setDoc: vi.fn(),
        collection: vi.fn(),
        doc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        serverTimestamp: vi.fn(),
    };
});

// Mock DB config
vi.mock('@/lib/firebase/config', () => ({
    db: {},
}));

describe('Agreement Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createAgreement', () => {
        it('should create a new agreement document', async () => {
            const mockRef = { id: 'new-agreement-id' };
            vi.mocked(addDoc).mockResolvedValue(mockRef as any);

            const input = {
                classId: 'class-1',
                status: 'draft',
                createdBy: 'user-1',
                sections: [],
            } as any;

            const id = await createAgreement(input);

            expect(id).toBe('new-agreement-id');
            expect(addDoc).toHaveBeenCalled();
        });
    });

    describe('getAgreementByClass', () => {
        it('should return the latest agreement for a class', async () => {
            const mockDocs = [
                { id: 'agreement-1', data: () => ({ classId: 'class-1', status: 'published' }) },
            ];

            vi.mocked(getDocs).mockResolvedValue({
                empty: false,
                docs: mockDocs,
            } as any);

            const agreement = await getAgreementByClass('class-1');

            expect(agreement).toEqual({ id: 'agreement-1', classId: 'class-1', status: 'published' });
        });

        it('should return null if no agreement exists', async () => {
            vi.mocked(getDocs).mockResolvedValue({
                empty: true,
                docs: [],
            } as any);

            const agreement = await getAgreementByClass('class-1');

            expect(agreement).toBeNull();
        });
    });

    describe('castVote', () => {
        it('should save a user vote', async () => {
            vi.mocked(setDoc).mockResolvedValue(undefined);

            const vote = {
                userId: 'user-1',
                userName: 'John Doe',
                answers: { 'q1': 'yes' },
            };

            await castVote('agreement-1', vote);

            expect(setDoc).toHaveBeenCalled();
        });
    });

    describe('signAgreement', () => {
        it('should save a signature', async () => {
            vi.mocked(setDoc).mockResolvedValue(undefined);

            const signature = {
                userId: 'user-1',
                userName: 'John Doe',
            };

            await signAgreement('agreement-1', signature);

            expect(setDoc).toHaveBeenCalled();
        });
    });
});
