import type { ParentLink } from '@/types';

/**
 * Per-user class membership, derived from `classes.admins[]` and `parentLinks`.
 * A user with no entry has neither created nor joined a class — the onboarding
 * drop-off signal the admin Users tab surfaces.
 */

export type MembershipStatus = 'admin' | 'approved' | 'pending';

export interface UserMembership {
    classId: string;
    className: string;
    status: MembershipStatus;
}

export interface ClassSummary {
    id: string;
    name: string;
    admins?: string[];
}

const STATUS_RANK: Record<MembershipStatus, number> = { admin: 3, approved: 2, pending: 1 };

export function buildMembershipIndex(
    classes: ClassSummary[],
    links: ParentLink[],
): Map<string, UserMembership[]> {
    const classById = new Map(classes.map((c) => [c.id, c]));
    const index = new Map<string, UserMembership[]>();

    const add = (uid: string, membership: UserMembership) => {
        const list = index.get(uid) ?? [];
        const existing = list.find((m) => m.classId === membership.classId);
        if (!existing) {
            list.push(membership);
        } else if (STATUS_RANK[membership.status] > STATUS_RANK[existing.status]) {
            existing.status = membership.status;
        }
        index.set(uid, list);
    };

    for (const cls of classes) {
        for (const uid of cls.admins ?? []) {
            add(uid, { classId: cls.id, className: cls.name, status: 'admin' });
        }
    }

    for (const link of links) {
        if (!link.userId || !link.classId) continue;
        const cls = classById.get(link.classId);
        const status: MembershipStatus =
            link.role === 'admin' ? 'admin' : link.status === 'approved' ? 'approved' : 'pending';
        add(link.userId, { classId: link.classId, className: cls?.name ?? link.classId, status });
    }

    return index;
}
