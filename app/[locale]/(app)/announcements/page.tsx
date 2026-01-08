'use client';

import { TranslationButton } from '@/components/ui/TranslationButton';
import { Heart, Pin, Loader2, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { useAnnouncements, useUserClasses, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditAnnouncementModal } from '@/components/modals/EditAnnouncementModal';
import type { Announcement } from '@/types';

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
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                        Auglýsingataflan
                    </h1>
                    {pinnedCount > 0 && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{ backgroundColor: 'var(--amber)20', color: 'var(--amber-dark)' }}
                        >
                            <Pin size={14} />
                            <span>{pinnedCount} fest</span>
                        </div>
                    )}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Tilkynningar frá bekkjarformönnum
                </p>
            </header>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                    >
                        + Ný tilkynning
                    </button>
                </div>
            )}

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900">Skrifa nýja tilkynningu</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fyrirsögn</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="t.d. Foreldrafundur í næstu viku"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Efni</label>
                                <textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder="Skrifaðu skilaboðin hér..."
                                    className="w-full p-2 border rounded-lg h-32"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="pin"
                                    checked={newPinned}
                                    onChange={e => setNewPinned(e.target.checked)}
                                    className="w-4 h-4 text-nordic-blue rounded border-gray-300"
                                />
                                <label htmlFor="pin" className="text-sm text-gray-700">Festa efst (Mikilvægt)</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
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
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {createAnnouncementMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                                Birta
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Announcements Feed */}
            <div className="space-y-4">
                {sortedAnnouncements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className="nordic-card p-5 space-y-3"
                        style={{
                            borderColor: announcement.pinned ? 'var(--amber)' : 'var(--border-light)',
                            borderWidth: announcement.pinned ? '2px' : '1px',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Author Avatar */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                    style={{ backgroundColor: 'var(--nordic-blue)', color: 'white' }}
                                >
                                    {(announcement.author || 'B')[0]}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                            {announcement.author || 'Bekkjarformaður'}
                                        </h3>
                                        {announcement.pinned && (
                                            <div
                                                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                                                style={{ backgroundColor: 'var(--amber)', color: 'white' }}
                                            >
                                                <Pin size={12} />
                                                <span>Fest</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        {formatDate(announcement.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingAnnouncement(announcement)}
                                        className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                        title="Breyta"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(announcement.id, announcement.title)}
                                        className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                                        title="Eyða"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Title & Content */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {announcement.title}
                            </h2>
                            <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                                {announcement.content}
                            </p>

                            {/* AI Translation Feature */}
                            <TranslationButton text={announcement.content} />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <button
                                className="flex items-center gap-2 text-sm transition-colors hover:opacity-70"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                <Heart size={16} />
                                <span>Líkar vel</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {announcements.length === 0 && (
                <div className="text-center py-12">
                    <MessageSquare size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
                    <h3 className="text-lg font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                        Engar tilkynningar enn
                    </h3>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Bekkjarformaður mun birta tilkynningar hér
                    </p>
                </div>
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
