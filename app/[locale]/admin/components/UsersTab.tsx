'use client';

import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { getAllUsers, searchUsers, deleteUser } from '@/services/admin';
import { Chip, type ChipVariant } from '@/components/ui/Chip';
import type { User } from '@/types';
import type { MembershipStatus, UserMembership } from '@/utils/membership';

interface UsersTabProps {
    initialUsers: User[];
    /**
     * uid → classes the user belongs to; a missing key means "never joined or created a class".
     * null/undefined means membership could not be determined (not a super-admin, or the read failed).
     */
    membership?: Map<string, UserMembership[]> | null;
}

const STATUS_LABEL: Record<MembershipStatus, { label: string; variant: ChipVariant }> = {
    admin: { label: 'Stjórnandi', variant: 'success' },
    approved: { label: 'Foreldri', variant: 'info' },
    pending: { label: 'Bíður samþykkis', variant: 'pinned' },
};

export default function UsersTab({ initialUsers, membership }: UsersTabProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [userSearch, setUserSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [onlyWithoutClass, setOnlyWithoutClass] = useState(false);

    const membershipKnown = membership != null;
    const membershipFor = (uid: string): UserMembership[] => membership?.get(uid) ?? [];
    const usersWithoutClass = membershipKnown ? users.filter(u => membershipFor(u.uid).length === 0) : [];
    const visibleUsers = onlyWithoutClass && membershipKnown ? usersWithoutClass : users;

    const handleSearch = async (query: string) => {
        setUserSearch(query);
        setIsSearching(true);

        try {
            if (query.length > 2) {
                const results = await searchUsers(query);
                setUsers(results);
            } else {
                const allUsers = await getAllUsers(100);
                setUsers(allUsers);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Ertu viss um að þú viljir eyða notanda "${user.displayName}"?\n\n⚠️ VIÐVÖRUN: Þetta er ÓAFTURKRÆFT!`)) {
            return;
        }

        try {
            await deleteUser(user.uid);
            setUsers(prev => prev.filter(u => u.uid !== user.uid));
        } catch (error) {
            alert('Error deleting user');
        }
    };

    const handleBulkDeleteDemo = async () => {
        // Find users matching demo criteria
        const demoUsers = users.filter(u =>
            u.email?.includes('demo') ||
            u.email?.includes('test')
        );

        if (demoUsers.length === 0) {
            alert('Engir demo notendur fundust í listanum.');
            return;
        }

        if (!confirm(`Ertu viss um að þú viljir eyða ${demoUsers.length} demo notendum?\n\nÞetta mun eyða öllum sem hafa "demo" eða "test" í netfanginu.\n\n⚠️ VIÐVÖRUN: Þetta er ÓAFTURKRÆFT!`)) {
            return;
        }

        let deletedCount = 0;
        for (const user of demoUsers) {
            try {
                await deleteUser(user.uid);
                deletedCount++;
                // Update specific user in UI immediately to show progress
                setUsers(prev => prev.filter(u => u.uid !== user.uid));
            } catch (error) {
                console.error(`Failed to delete ${user.email}`);
            }
        }
        alert(`Búið að eyða ${deletedCount} notendum.`);
    };

    const renderMembership = (uid: string) => {
        if (!membershipKnown) {
            return <Chip variant="info" title="Ekki tókst að sækja tengingar foreldra">Óþekkt</Chip>;
        }
        const list = membershipFor(uid);
        if (list.length === 0) {
            return <Chip variant="danger">Enginn bekkur</Chip>;
        }
        return (
            <ul className="space-y-1.5">
                {list.map(m => {
                    const status = STATUS_LABEL[m.status];
                    return (
                        <li key={m.classId} className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-on-surface">{m.className}</span>
                            <Chip variant={status.variant}>{status.label}</Chip>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-6xl mx-auto">
            <div className="professional-card p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-2xl text-on-surface mb-2">Notendastjórnun</h3>
                        <p className="text-on-surface-variant">
                            Hér sérðu alla notendur í kerfinu og hvaða bekk þeir tilheyra. Notaðu leitina til að finna tiltekinn notanda.
                        </p>
                    </div>
                    <button
                        onClick={handleBulkDeleteDemo}
                        className="bg-error-container/60 text-error px-4 py-2 rounded-xl font-bold hover:bg-error-container/70 transition-colors flex items-center gap-2 border border-error/30"
                    >
                        <Trash2 size={16} />
                        Eyða demo notendum
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                    <input
                        type="text"
                        placeholder="Leita eftir netfangi..."
                        value={userSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none"
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    )}
                </div>

                {/* Drop-off filter: users who signed up but never joined or created a class */}
                <label className="flex items-center gap-3 mb-6 text-sm text-on-surface cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={onlyWithoutClass && membershipKnown}
                        disabled={!membershipKnown}
                        onChange={(e) => setOnlyWithoutClass(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                    />
                    <span>
                        Sýna aðeins notendur án bekkjar
                        <span className="ml-2 text-on-surface-variant">
                            {membershipKnown ? `(${usersWithoutClass.length} af ${users.length} í listanum)` : '(tengingar náðust ekki)'}
                        </span>
                    </span>
                </label>

                {/* User Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-outline-variant/30">
                                <th className="text-left py-3 px-4 font-bold text-on-surface text-sm uppercase">Name</th>
                                <th className="text-left py-3 px-4 font-bold text-on-surface text-sm uppercase">Netfang</th>
                                <th className="text-left py-3 px-4 font-bold text-on-surface text-sm uppercase">Sími</th>
                                <th className="text-left py-3 px-4 font-bold text-on-surface text-sm uppercase">Bekkur</th>
                                <th className="text-left py-3 px-4 font-bold text-on-surface text-sm uppercase">Stofnað</th>
                                <th className="text-right py-3 px-4 font-bold text-on-surface text-sm uppercase">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.map(user => (
                                <tr key={user.uid} className="border-b border-outline-variant/30 hover:bg-surface transition-colors align-top">
                                    <td className="py-4 px-4 font-semibold text-on-surface">{user.displayName}</td>
                                    <td className="py-4 px-4 text-on-surface-variant font-mono text-sm">{user.email}</td>
                                    <td className="py-4 px-4 text-on-surface-variant">{user.phone}</td>
                                    <td className="py-4 px-4">{renderMembership(user.uid)}</td>
                                    <td className="py-4 px-4 text-on-surface-variant text-sm whitespace-nowrap">
                                        {user.createdAt?.toDate?.().toLocaleDateString('is-IS') || 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="bg-error text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-error/90 transition-all inline-flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Eyða
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {visibleUsers.length === 0 && (
                    <div className="text-center py-12 text-on-surface-variant">
                        <p className="text-lg font-semibold">Engir notendur fundust</p>
                        <p className="text-sm mt-2">{onlyWithoutClass ? 'Allir notendur í listanum tilheyra bekk' : 'Prófaðu aðra leitarskilyrði'}</p>
                    </div>
                )}

                {visibleUsers.length > 0 && (
                    <div className="mt-4 text-sm text-on-surface-variant">
                        Sýni {visibleUsers.length} notend{visibleUsers.length === 1 ? 'a' : 'ur'}
                    </div>
                )}
            </div>
        </div>
    );
}
