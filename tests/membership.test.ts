import { describe, it, expect } from 'vitest';
import { buildMembershipIndex } from '@/utils/membership';
import type { ParentLink } from '@/types';

const classes = [
    { id: 'c1', name: '4. Bekkur B - Salaskóli', admins: ['admin-uid'] },
    { id: 'c2', name: '2. Bekkur - Kópavogsskóli', admins: [] },
];

const link = (overrides: Partial<ParentLink>): ParentLink => ({
    id: 'x',
    userId: 'u',
    studentId: 's',
    classId: 'c1',
    status: 'approved',
    createdAt: {} as ParentLink['createdAt'],
    ...overrides,
});

describe('buildMembershipIndex', () => {
    it('marks class creators as admin from classes.admins', () => {
        const index = buildMembershipIndex(classes, []);
        expect(index.get('admin-uid')).toEqual([
            { classId: 'c1', className: '4. Bekkur B - Salaskóli', status: 'admin' },
        ]);
    });

    it('maps approved and pending parent links', () => {
        const index = buildMembershipIndex(classes, [
            link({ id: 'p1_c1', userId: 'p1', status: 'approved' }),
            link({ id: 'p2_c1', userId: 'p2', status: 'pending' }),
        ]);
        expect(index.get('p1')?.[0].status).toBe('approved');
        expect(index.get('p2')?.[0].status).toBe('pending');
        expect(index.get('p2')?.[0].className).toBe('4. Bekkur B - Salaskóli');
    });

    it('treats a link with role admin as admin', () => {
        const index = buildMembershipIndex(classes, [
            link({ id: 'p3_c2', userId: 'p3', classId: 'c2', role: 'admin', status: 'approved' }),
        ]);
        expect(index.get('p3')?.[0].status).toBe('admin');
    });

    it('keeps the strongest status when a user appears twice for one class', () => {
        const index = buildMembershipIndex(classes, [
            link({ id: 'admin-uid_c1', userId: 'admin-uid', status: 'pending' }),
        ]);
        expect(index.get('admin-uid')).toHaveLength(1);
        expect(index.get('admin-uid')?.[0].status).toBe('admin');
    });

    it('falls back to the class id when the class document is missing', () => {
        const index = buildMembershipIndex(classes, [
            link({ id: 'p4_gone', userId: 'p4', classId: 'gone' }),
        ]);
        expect(index.get('p4')?.[0].className).toBe('gone');
    });

    it('has no entry for users who never joined or created a class', () => {
        const index = buildMembershipIndex(classes, []);
        expect(index.get('stranger')).toBeUndefined();
    });
});
