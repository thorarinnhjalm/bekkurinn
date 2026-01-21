'use client';

import { Heart, Pin, Loader2, MessageSquare, Edit2, Plus, Megaphone, Info, BarChart2, CheckCircle, XCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { useAnnouncements, useUserClasses, useCreateAnnouncement, useDeleteAnnouncement, useSchool, useVoteAnnouncement } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Babelfish } from '@/components/Babelfish';
import { PollOption } from '@/types';

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

    // Poll State
    const [isPoll, setIsPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState<{ id: string, text: string }[]>([]);
    const [newOptionText, setNewOptionText] = useState('');

    const createAnnouncementMutation = useCreateAnnouncement();
    const deleteAnnouncementMutation = useDeleteAnnouncement();
    const voteMutation = useVoteAnnouncement();

    const addPollOption = () => {
        if (!newOptionText) return;
        setPollOptions([...pollOptions, { id: crypto.randomUUID(), text: newOptionText }]);
        setNewOptionText('');
    };

    const removePollOption = (id: string) => {
        setPollOptions(pollOptions.filter(opt => opt.id !== id));
    };

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
        <div className="space-y-8 pb-20">

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
                        className="trust-button flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Ný tilkynning
                    </button>
                )}
            </header>

            {/* Global Translation Notice (if not Icelandic) */}
            {locale !== 'is' && (
                <div className="max-w-4xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed italic">
                        <strong>Translation Notice:</strong> Messages are automatically translated into your language. Original text is preserved for accuracy.
                    </p>
                </div>
            )}

            {/* Announcements Feed */}
            <div className="space-y-6 max-w-4xl mx-auto pt-6">
                {sortedAnnouncements.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 font-medium">Engar tilkynningar ennþá</p>
                    </div>
                )}

                {sortedAnnouncements.map((announcement, index) => (
                    <div
                        key={announcement.id}
                        className={`trust-card relative overflow-hidden ${announcement.pinned ? 'bg-amber-50/30 border-amber-200' : ''}`}
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
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${announcement.pinned ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
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

                            {/* POLL UI */}
                            {announcement.pollOptions && announcement.pollOptions.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                                        <BarChart2 size={16} />
                                        <span>Könnun</span>
                                    </div>

                                    {announcement.pollOptions.map(option => {
                                        const totalVotes = announcement.pollOptions?.reduce((acc, curr) => acc + (curr.votes?.length || 0), 0) || 0;
                                        const votes = option.votes?.length || 0;
                                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                                        const hasVoted = option.votes?.includes(user?.uid || '');

                                        return (
                                            <div
                                                key={option.id}
                                                onClick={() => {
                                                    voteMutation.mutate({
                                                        announcementId: announcement.id,
                                                        optionId: option.id,
                                                        userId: user?.uid || '',
                                                        toggle: hasVoted
                                                    });
                                                }}
                                                className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all group
                                                    ${hasVoted ? 'border-nordic-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}
                                                `}
                                            >
                                                {/* Progress Bar Background */}
                                                <div
                                                    className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out opacity-20
                                                        ${hasVoted ? 'bg-nordic-blue' : 'bg-gray-400'}
                                                    `}
                                                    style={{ width: `${percentage}%` }}
                                                />

                                                <div className="relative p-3 flex items-center justify-between z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                                            ${hasVoted ? 'border-nordic-blue bg-nordic-blue text-white' : 'border-gray-300'}
                                                        `}>
                                                            {hasVoted && <CheckCircle size={12} />}
                                                        </div>
                                                        <span className={`font-medium ${hasVoted ? 'text-nordic-blue font-bold' : 'text-gray-700'}`}>
                                                            {option.text}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {percentage}% ({votes})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <p className="text-center text-xs text-gray-400 font-medium pt-2">
                                        {announcement.pollOptions?.reduce((acc, curr) => acc + (curr.votes?.length || 0), 0)} atkvæði samtals
                                    </p>
                                </div>
                            )}

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
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full space-y-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-nordic-blue to-purple-600 left-0" />

                        <div className="text-center">
                            <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
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

                            {/* Poll Creator */}
                            <div className="pt-2">
                                <button
                                    onClick={() => setIsPoll(!isPoll)}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${isPoll ? 'text-nordic-blue' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isPoll ? 'border-nordic-blue bg-nordic-blue text-white' : 'border-gray-300'}`}>
                                        {isPoll && <CheckCircle size={14} />}
                                    </div>
                                    Búa til könnun
                                </button>

                                {isPoll && (
                                    <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in slide-in-from-top-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Svarmöguleikar</label>

                                        {pollOptions.map((opt) => (
                                            <div key={opt.id} className="flex gap-2 animate-in fade-in">
                                                <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                                                    {opt.text}
                                                </div>
                                                <button onClick={() => removePollOption(opt.id)} className="text-red-400 hover:text-red-600">
                                                    <MinusCircle size={20} />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="flex gap-2">
                                            <input
                                                value={newOptionText}
                                                onChange={(e) => setNewOptionText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') addPollOption();
                                                }}
                                                placeholder="Bæta við valmöguleika..."
                                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-nordic-blue"
                                            />
                                            <button onClick={addPollOption} className="text-nordic-blue hover:text-blue-700">
                                                <PlusCircle size={32} />
                                            </button>
                                        </div>
                                    </div>
                                )}
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

                                    if (newTitle && newContent) {
                                        await createAnnouncementMutation.mutateAsync({
                                            classId: scope === 'class' ? activeClassId : null,
                                            schoolId: activeClass?.schoolId || '',
                                            scope,
                                            title: newTitle,
                                            content: newContent,
                                            pinned: false,
                                            isCritical: false, // Default to false
                                            originalLanguage: locale,
                                            pollOptions: isPoll ? pollOptions.map(opt => ({ ...opt, votes: [] })) : [],
                                            allowMultipleVotes: false,
                                            createdBy: user?.uid || '',
                                            author: user?.displayName || (scope === 'school' ? 'Foreldrafélag' : 'Stjórn'),
                                        });
                                        setNewTitle('');
                                        setNewContent('');
                                        setIsCreating(false);
                                        setNuclearKeyword('');
                                        setIsCritical(false); // Assuming setIsNuclear was a typo for setIsCritical
                                        // Reset Poll
                                        setIsPoll(false);
                                        setPollOptions([]);
                                    }
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
                            <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center mx-auto text-red-600">
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
                                className="w-full text-center px-6 py-4 rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white transition-all outline-none font-bold text-2xl tracking-[0.3em] uppercase placeholder:opacity-20"
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
                                className="w-full py-5 rounded-lg font-bold text-white bg-red-600 shadow-md hover:bg-red-700 hover:shadow-lg active:scale-98 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xl"
                            >
                                SENDA NÚNA
                            </button>
                            <button
                                onClick={() => {
                                    setShowNuclearConfirm(false);
                                    setNuclearKeyword('');
                                }}
                                className="w-full py-4 rounded-lg font-semibold text-gray-500 hover:text-gray-700 transition-colors"
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
