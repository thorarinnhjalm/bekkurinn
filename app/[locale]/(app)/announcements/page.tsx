'use client';

import { Heart, Pin, Loader2, MessageSquare, Edit2, Plus, Megaphone, Info } from 'lucide-react';
import { useAnnouncements, useUserClasses, useCreateAnnouncement, useDeleteAnnouncement, useSchool } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Babelfish } from '@/components/Babelfish';

/**
 * Announcements Page - Auglýsingataflan V2
 * 
 * V2: Nordic Glass Cards, Premium Pinning, Smooth Animations
 */

export default function AnnouncementsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    // Dynamic Class ID
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '');
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    // School Context
    const { data: school } = useSchool(activeClass?.schoolId);
    const isSchoolAdmin = school?.admins?.includes(user?.uid || '');

    // Fetch announcements (class + school)
    const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(activeClassId, activeClass?.schoolId);

    // Create state
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newPinned, setNewPinned] = useState(false);
    const [isCritical, setIsCritical] = useState(false);
    const [showNuclearConfirm, setShowNuclearConfirm] = useState(false);
    const [nuclearKeyword, setNuclearKeyword] = useState('');
    const [scope, setScope] = useState<'class' | 'school'>('class');

    const createAnnouncementMutation = useCreateAnnouncement();
    const deleteAnnouncementMutation = useDeleteAnnouncement();

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
            <div className="fixed top-40 left-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none" />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-bold text-amber-700 uppercase tracking-wide mb-3 animate-in fade-in slide-in-from-left-2">
                        <Megaphone size={12} />
                        Fréttir úr skólanum
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Auglýsingataflan</h1>
                    <p className="text-xl text-gray-500 max-w-xl mt-2 leading-relaxed">
                        Hér finnur þú allar mikilvægar tilkynningar frá bekkjarfulltrúum og foreldrafélagi.
                    </p>
                </div>

                {(isAdmin || isSchoolAdmin) && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-premium flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <Plus size={20} />
                        Ný tilkynning
                    </button>
                )}
            </header>

            {/* Global Translation Notice (if not Icelandic) */}
            {locale !== 'is' && (
                <div className="max-w-4xl mx-auto p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed italic">
                        <strong>Translation Notice:</strong> Messages are automatically translated into your language. Original text is preserved for accuracy.
                    </p>
                </div>
            )}

            {/* Announcements Feed */}
            <div className="space-y-8 max-w-4xl mx-auto pt-6">
                {sortedAnnouncements.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">Engar tilkynningar ennþá</p>
                    </div>
                )}

                {sortedAnnouncements.map((announcement, index) => (
                    <div
                        key={announcement.id}
                        className={`glass-card relative overflow-hidden transition-all duration-300 ${announcement.pinned ? 'bg-gradient-to-br from-white to-amber-50/30 border-amber-100' : 'bg-white/80'}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Tags / Badges */}
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            {announcement.scope === 'school' && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                                    <Megaphone size={12} fill="currentColor" /> Skólatilkynning
                                </span>
                            )}
                            {announcement.pinned && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                                    <Pin size={12} fill="currentColor" /> Mikilvægt
                                </span>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Author Avatar */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${announcement.pinned ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {(announcement.author || 'S')[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900 leading-tight">
                                            {announcement.author || (announcement.scope === 'school' ? 'Foreldrafélag' : 'Stjórn')}
                                        </p>
                                        {announcement.originalLanguage && announcement.originalLanguage !== 'is' && (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                                {announcement.originalLanguage}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                        {formatDate(announcement.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">
                                {announcement.title}
                            </h2>

                            <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {announcement.content}
                            </div>

                            {/* BABELFISH TRANSLATION */}
                            <Babelfish
                                text={announcement.content}
                                originalLanguage={announcement.originalLanguage || 'is'}
                                targetLanguage={locale}
                            />

                            {(isAdmin || isSchoolAdmin) && (
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
                            <p className="text-gray-500 font-medium mt-1">Sendu mikilvæg skilaboð</p>
                        </div>

                        <div className="space-y-4">
                            {/* Scope Selector (Only if School Admin) */}
                            {isSchoolAdmin && (
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setScope('class')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'class' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Bekkur
                                    </button>
                                    <button
                                        onClick={() => setScope('school')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'school' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Allur Skólinn (Foreldrafélag)
                                    </button>
                                </div>
                            )}

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

                            <div className="flex border-t border-gray-100 pt-4 flex-col gap-3">
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer flex-1" onClick={() => setNewPinned(!newPinned)}>
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newPinned ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-300 bg-white'}`}>
                                        {newPinned && <Pin size={14} />}
                                    </div>
                                    <span className="font-bold text-amber-900 text-sm">Festa efst sem mikilvægt</span>
                                </div>

                                {/* Kjarnorku sending - DISABLED FOR NOW */}
                                {/* {(isAdmin || isSchoolAdmin) && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer flex-1" onClick={() => setIsCritical(!isCritical)}>
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isCritical ? 'bg-red-500 border-red-500 text-white' : 'border-red-300 bg-white'}`}>
                                            {isCritical && <Megaphone size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-red-900 text-sm block">Kjarnorku sending</span>
                                            <span className="text-[10px] text-red-600 font-medium leading-tight">Senda sem tölvupóst á alla (trompar stillingar)</span>
                                        </div>
                                    </div>
                                )} */}
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

                                    if (isCritical) {
                                        setShowNuclearConfirm(true);
                                        return;
                                    }

                                    await createAnnouncementMutation.mutateAsync({
                                        classId: scope === 'class' ? activeClassId : null,
                                        schoolId: scope === 'school' ? (activeClass?.schoolId || null) : (activeClass?.schoolId || null),
                                        scope: scope,
                                        title: newTitle,
                                        content: newContent,
                                        pinned: newPinned,
                                        createdBy: user?.uid || '',
                                        author: user?.displayName || (scope === 'school' ? 'Foreldrafélag' : 'Stjórn'),
                                        originalLanguage: locale
                                    } as any);

                                    setIsCreating(false);
                                    setNewTitle(''); setNewContent(''); setNewPinned(false); setScope('class'); setIsCritical(false);
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-br from-nordic-blue to-nordic-blue-dark shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Birta
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Nuclear Confirmation Modal */}
            {showNuclearConfirm && (
                <div className="fixed inset-0 bg-red-900/80 backdrop-blur-xl flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-10 max-w-md w-full space-y-8 shadow-2xl relative overflow-hidden border-4 border-red-500">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto text-red-600 animate-pulse">
                                <Megaphone size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">VARÚÐ!</h2>
                            <p className="text-gray-600 font-bold leading-relaxed">
                                Þessi tilkynning verður send sem tölvupóstur á <span className="text-red-600 underline text-lg">alla foreldra</span> í hópnum.
                                <br /><br />
                                Þetta trompar allar stillingar notenda og er ekki hægt að afturkalla.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Skrifaðu staðfestingarorðið hér að neðan</p>
                            <input
                                type="text"
                                value={nuclearKeyword}
                                onChange={e => setNuclearKeyword(e.target.value)}
                                placeholder="SENDA"
                                className="w-full text-center px-6 py-4 rounded-2xl bg-gray-50 border-4 border-gray-100 focus:border-red-500 focus:bg-white transition-all outline-none font-black text-2xl tracking-[0.3em] uppercase placeholder:opacity-20 translate-z-0"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={async () => {
                                    if (nuclearKeyword.toUpperCase() !== 'SENDA') return alert("Vinsamlegast skrifaðu SENDA til að staðfesta");

                                    const announcement = {
                                        classId: scope === 'class' ? activeClassId : null,
                                        schoolId: scope === 'school' ? (activeClass?.schoolId || null) : (activeClass?.schoolId || null),
                                        scope: scope,
                                        title: newTitle,
                                        content: newContent,
                                        pinned: newPinned,
                                        isCritical: true,
                                        createdBy: user?.uid || '',
                                        author: user?.displayName || (scope === 'school' ? 'Foreldrafélag' : 'Stjórn'),
                                        originalLanguage: locale
                                    };

                                    await createAnnouncementMutation.mutateAsync(announcement as any);

                                    // Trigger Email API
                                    try {
                                        await fetch('/api/send-critical-announcement', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(announcement)
                                        });
                                    } catch (err) {
                                        console.error("Failed to send emails:", err);
                                        // We don't block the UI here as the announcement is already created in Firestore
                                    }

                                    setIsCreating(false);
                                    setShowNuclearConfirm(false);
                                    setNuclearKeyword('');
                                    setNewTitle(''); setNewContent(''); setNewPinned(false); setScope('class'); setIsCritical(false);
                                }}
                                disabled={nuclearKeyword.toUpperCase() !== 'SENDA'}
                                className="w-full py-5 rounded-2xl font-black text-white bg-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none text-xl"
                            >
                                SENDA NÚNA
                            </button>
                            <button
                                onClick={() => {
                                    setShowNuclearConfirm(false);
                                    setNuclearKeyword('');
                                }}
                                className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Hætta við
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
