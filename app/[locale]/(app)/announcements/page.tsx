'use client';

import { Heart, Pin, Loader2, MessageSquare, Edit2, Plus, Megaphone } from 'lucide-react';
import { useAnnouncements, useUserClasses, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Announcements Page - Auglýsingataflan V2
 * 
 * V2: Nordic Glass Cards, Premium Pinning, Smooth Animations
 */

export default function AnnouncementsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Dynamic Class ID
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '');
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(activeClassId);

    // Create state
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newPinned, setNewPinned] = useState(false);

    const createAnnouncementMutation = useCreateAnnouncement();
    const deleteAnnouncementMutation = useDeleteAnnouncement();

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        router.push('/is/login');
        return null;
    }

    // Format timestamp for display
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Rétt í þessu';
        if (diffHours < 24) return `${diffHours} klst. síðan`;
        if (diffDays === 1) return 'Í gær';
        if (diffDays < 7) return `${diffDays} dögum síðan`;

        return new Intl.DateTimeFormat('is-IS', { day: 'numeric', month: 'long' }).format(date);
    };

    if (authLoading || announcementsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 text-nordic-blue">
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    const announcements = announcementsData || [];

    // Sort: pinned first, then by date
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
    });

    const pinnedCount = announcements.filter(a => a.pinned).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
            <div className="fixed top-40 left-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none" />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-bold text-amber-700 uppercase tracking-wide mb-3 animate-in fade-in slide-in-from-left-2">
                        <Megaphone size={12} />
                        Fréttir úr bekknum
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Auglýsingataflan</h1>
                    <p className="text-xl text-gray-500 max-w-xl mt-2 leading-relaxed">
                        Hér finnur þú allar mikilvægar tilkynningar frá bekkjarfulltrúum.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-premium flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <Plus size={20} />
                        Ný tilkynning
                    </button>
                )}
            </header>

            {/* Announcements Feed */}
            <div className="space-y-8 max-w-4xl mx-auto pt-6">
                {sortedAnnouncements.map((announcement, index) => (
                    <div
                        key={announcement.id}
                        className={`glass-card relative overflow-hidden transition-all duration-300 ${announcement.pinned ? 'bg-gradient-to-br from-white to-amber-50/30 border-amber-100' : 'bg-white/80'}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Pinned Stripe */}
                        {announcement.pinned && (
                            <div className="absolute top-0 right-0 p-4">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                                    <Pin size={12} fill="currentColor" /> Mikilvægt
                                </span>
                            </div>
                        )}

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Author Avatar */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${announcement.pinned ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {(announcement.author || 'S')[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 leading-tight">
                                        {announcement.author || 'Stjórn'}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                        {formatDate(announcement.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">
                                {announcement.title}
                            </h2>

                            <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed">
                                {announcement.content}
                            </div>

                            {isAdmin && (
                                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => {
                                            if (confirm('Ertu viss um að þú viljir eyða þessu?')) {
                                                deleteAnnouncementMutation.mutate(announcement.id);
                                            }
                                        }}
                                        className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Eyða tilkynningu
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-nordic-blue to-purple-600 left-0" />

                        <div className="text-center">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                                <MessageSquare size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ný tilkynning</h2>
                            <p className="text-gray-500 font-medium mt-1">Sendu mikilvæg skilaboð til allra foreldra</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Fyrirsögn"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-bold text-lg"
                                autoFocus
                            />

                            <textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder="Hvað er í fréttum?"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none h-40 resize-none font-medium text-gray-600"
                            />

                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer" onClick={() => setNewPinned(!newPinned)}>
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newPinned ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-300 bg-white'}`}>
                                    {newPinned && <Pin size={14} />}
                                </div>
                                <span className="font-bold text-amber-900 text-sm">Festa efst sem mikilvægt</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newTitle || !newContent) return alert("Vinsamlegast fylltu út reitina");
                                    await createAnnouncementMutation.mutateAsync({
                                        classId: activeClassId,
                                        title: newTitle,
                                        content: newContent,
                                        pinned: newPinned,
                                        createdBy: user?.uid || '',
                                        author: user?.displayName || 'Stjórn'
                                    } as any);
                                    setIsCreating(false);
                                    setNewTitle(''); setNewContent(''); setNewPinned(false);
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-br from-nordic-blue to-nordic-blue-dark shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Birta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
