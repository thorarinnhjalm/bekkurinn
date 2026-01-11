'use client';

import { TranslationButton } from '@/components/ui/TranslationButton';
import { Heart, Pin, Loader2, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { useAnnouncements, useUserClasses, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditAnnouncementModal } from '@/components/modals/EditAnnouncementModal';
import type { Announcement } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';


/**
 * Announcements Page - Auglýsingataflan
 * 
 * Announcement feed with pinning and likes
 * Now connected to real Firestore data!
 */
// TODO: Get this from user's class membership (Dynamic now)

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

    // Edit/Delete state
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const updateAnnouncementMutation = useUpdateAnnouncement();
    const deleteAnnouncementMutation = useDeleteAnnouncement();

    const handleDeleteAnnouncement = async (id: string, title: string) => {
        if (!confirm(`Ertu viss um að þú viljir eyða tilkynningunni "${title}"?`)) return;
        try {
            await deleteAnnouncementMutation.mutateAsync(id);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Villa kom upp við að eyða');
        }
    };

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
        if (diffHours < 24) return `${diffHours} klukkustundum síðan`;
        if (diffDays === 1) return 'Í gær';
        if (diffDays < 7) return `${diffDays} dögum síðan`;

        return new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        }).format(date);
    };

    // Loading state
    if (authLoading || announcementsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--nordic-blue)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Hleður tilkynningum...</p>
                </div>
            </div>
        );
    }

    const announcements = announcementsData || [];

    // Sort: pinned first, then by date
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Both pinned or both not pinned - sort by date (newest first)
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
    });

    const pinnedCount = announcements.filter(a => a.pinned).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Auglýsingataflan</h1>
                    <p className="text-gray-500 mt-1">
                        Tilkynningar og fréttir frá stjórn
                    </p>
                </div>
                {pinnedCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm animate-in zoom-in">
                        <Pin size={16} fill="currentColor" />
                        <span>{pinnedCount} fest</span>
                    </div>
                )}
            </header>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-nordic-blue text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-nordic-blue-dark transition-all shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95"
                    >
                        <Edit2 size={18} />
                        Ný tilkynning
                    </button>
                </div>
            )}

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="text-nordic-blue" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Skrifa nýja tilkynningu</h2>
                            <p className="text-gray-500 text-sm mt-1">Deildu fréttum með bekknum</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fyrirsögn</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="t.d. Foreldrafundur í næstu viku"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Efni</label>
                                <textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder="Skrifaðu skilaboðin hér..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all min-h-[150px]"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <input
                                    type="checkbox"
                                    id="pin"
                                    checked={newPinned}
                                    onChange={e => setNewPinned(e.target.checked)}
                                    className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                                />
                                <label htmlFor="pin" className="text-sm font-medium text-amber-900">Festa efst (Mikilvægt)</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newTitle || !newContent) return alert('Vinsamlegast fylltu út fyrirsögn og efni');

                                    try {
                                        await createAnnouncementMutation.mutateAsync({
                                            classId: activeClassId,
                                            title: newTitle,
                                            content: newContent,
                                            pinned: newPinned,
                                            createdBy: user?.uid || '',
                                            author: user?.displayName || 'Stjórn',
                                        } as any);

                                        setIsCreating(false);
                                        setNewTitle('');
                                        setNewContent('');
                                        setNewPinned(false);
                                    } catch (e) {
                                        console.error(e);
                                        alert('Villa kom upp');
                                    }
                                }}
                                disabled={createAnnouncementMutation.isPending}
                                className="px-6 py-2.5 bg-nordic-blue text-white font-bold rounded-xl hover:bg-nordic-blue-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                {createAnnouncementMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                Birta
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Announcements Feed */}
            <div className="space-y-6 max-w-4xl mx-auto">
                {sortedAnnouncements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className={`nordic-card group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 bg-white ${announcement.pinned ? 'ring-2 ring-amber-100 shadow-md bg-gradient-to-br from-amber-50/30 to-white' : ''}`}
                    >
                        {/* Pinned Indicator Stripe */}
                        {announcement.pinned && (
                            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                <div className="bg-amber-400 shadow-md text-white text-[10px] font-bold uppercase tracking-wide text-center transform rotate-45 translate-x-4 translate-y-3 py-1 w-24">
                                    Fest
                                </div>
                            </div>
                        )}

                        <div className="p-7 space-y-5">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    {/* Author Avatar */}
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold shadow-sm ${announcement.pinned ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-nordic-blue'}`}
                                    >
                                        {(announcement.author || 'B')[0]}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-nordic-blue transition-colors text-lg">
                                            {announcement.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-medium text-gray-700">{announcement.author || 'Bekkjarformaður'}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{formatDate(announcement.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingAnnouncement(announcement)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAnnouncement(announcement.id, announcement.title)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="prose prose-blue max-w-none">
                                <p className="whitespace-pre-wrap text-gray-600 leading-relaxed text-base">
                                    {announcement.content}
                                </p>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                                <div className="flex gap-4">
                                    <button
                                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors group/heart"
                                    >
                                        <Heart size={18} className="group-hover/heart:scale-110 transition-transform" />
                                        <span>Líkar vel</span>
                                    </button>
                                </div>

                                {/* AI Translation Feature */}
                                <div className="flex justify-end">
                                    <TranslationButton text={announcement.content} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {announcements.length === 0 && (
                isAdmin ? (
                    <EmptyState
                        icon={<MessageSquare size={48} className="text-nordic-blue" />}
                        title="Auglýsingataflan er tóm"
                        description="Deildu fréttum, áminningum og mikilvægum upplýsingum með foreldrum bekkjarins."
                        actionLabel="Skrifa fyrstu tilkynningu"
                        onAction={() => setIsCreating(true)}
                    />
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Engar tilkynningar enn</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Þegar bekkjarformaðurinn deilir fréttum munu þær birtast hér.
                        </p>
                    </div>
                )
            )}


            {/* Edit Modal */}
            {editingAnnouncement && (
                <EditAnnouncementModal
                    announcement={editingAnnouncement}
                    isOpen={!!editingAnnouncement}
                    onClose={() => setEditingAnnouncement(null)}
                    onSave={async (id, data) => {
                        await updateAnnouncementMutation.mutateAsync({ announcementId: id, data });
                    }}
                />
            )}
        </div>
    );
}
