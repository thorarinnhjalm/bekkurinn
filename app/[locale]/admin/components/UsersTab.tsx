'use client';

import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { getAllUsers, searchUsers, deleteUser } from '@/services/admin';
import type { User } from '@/types';

interface UsersTabProps {
    initialUsers: User[];
}

export default function UsersTab({ initialUsers }: UsersTabProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [userSearch, setUserSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-5xl mx-auto">
            <div className="professional-card p-6">
                <h3 className="font-bold text-2xl text-gray-900 mb-4">Notendastjórnun</h3>
                <p className="text-gray-600 mb-6">
                    Hér sérðu alla notendur í kerfinu. Notaðu leitina til að finna tiltekinn notanda.
                </p>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Leita eftir netfangi..."
                        value={userSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-nordic-blue outline-none"
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-5 w-5 border-2 border-nordic-blue border-t-transparent rounded-full" />
                        </div>
                    )}
                </div>

                {/* User Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm uppercase">Name</th>
                                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm uppercase">Netfang</th>
                                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm uppercase">Sími</th>
                                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm uppercase">Stofnað</th>
                                <th className="text-right py-3 px-4 font-bold text-gray-700 text-sm uppercase">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-semibold text-gray-900">{user.displayName}</td>
                                    <td className="py-4 px-4 text-gray-600 font-mono text-sm">{user.email}</td>
                                    <td className="py-4 px-4 text-gray-600">{user.phone}</td>
                                    <td className="py-4 px-4 text-gray-600 text-sm">
                                        {user.createdAt?.toDate?.().toLocaleDateString('is-IS') || 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all inline-flex items-center gap-2"
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

                {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-semibold">Engir notendur fundust</p>
                        <p className="text-sm mt-2">Prófaðu aðra leitarskilyrði</p>
                    </div>
                )}

                {users.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Sýni {users.length} notend{users.length === 1 ? 'a' : 'ur'}
                    </div>
                )}
            </div>
        </div>
    );
}
