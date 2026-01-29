import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllUsers, searchUsers, getSystemStats } from '@/services/admin';
import { getDocs } from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/firestore')>();
    return {
        ...actual,
        getDocs: vi.fn(),
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
    };
});

// Mock DB config
vi.mock('@/lib/firebase/config', () => ({
    db: {},
}));

// Mock Logger
vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('Admin Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return a list of users', async () => {
            const mockDocs = [
                { id: 'user1', data: () => ({ name: 'John Doe', email: 'john@example.com' }) },
                { id: 'user2', data: () => ({ name: 'Jane Doe', email: 'jane@example.com' }) },
            ];

            vi.mocked(getDocs).mockResolvedValue({
                docs: mockDocs,
                size: mockDocs.length,
            } as any);

            const users = await getAllUsers();

            expect(users).toHaveLength(2);
            expect(users[0]).toEqual({ uid: 'user1', name: 'John Doe', email: 'john@example.com' });
        });

        it('should handle errors gracefully', async () => {
            vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

            const users = await getAllUsers();
            expect(users).toEqual([]);
        });
    });

    describe('searchUsers', () => {
        it('should return matching users', async () => {
            const mockDocs = [
                { id: 'user1', data: () => ({ name: 'John Doe', email: 'john@example.com' }) },
            ];

            vi.mocked(getDocs).mockResolvedValue({
                docs: mockDocs,
            } as any);

            const users = await searchUsers('john');

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe('john@example.com');
        });
    });

    describe('getSystemStats', () => {
        it('should return system stats', async () => {
            // We need to mock getDocs multiple times for different calls
            // 1. Users, 2. Classes, 3. Schools, 4. Pending
            vi.mocked(getDocs)
                .mockResolvedValueOnce({ size: 10 } as any) // Users
                .mockResolvedValueOnce({ size: 5 } as any)  // Classes
                .mockResolvedValueOnce({ size: 2 } as any)  // Schools
                .mockResolvedValueOnce({ size: 3 } as any); // Pending

            const stats = await getSystemStats();

            expect(stats).toEqual({
                totalUsers: 10,
                totalClasses: 5,
                totalSchools: 2,
                pendingApprovals: 3,
            });
        });

        it('should handle partial failures', async () => {
            // Simulator: Users fail, everything else succeeds
            vi.mocked(getDocs)
                .mockRejectedValueOnce(new Error('Users failed')) // Users
                .mockResolvedValueOnce({ size: 5 } as any)        // Classes
                .mockResolvedValueOnce({ size: 2 } as any)        // Schools
                .mockResolvedValueOnce({ size: 3 } as any);       // Pending

            const stats = await getSystemStats();

            expect(stats.totalUsers).toBe(0); // Should fallback to 0
            expect(stats.totalClasses).toBe(5);
        });
    });
});
