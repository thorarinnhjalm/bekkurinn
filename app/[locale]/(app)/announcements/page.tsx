'use client';

import { Pin, Loader2, MessageSquare, Plus, Megaphone, Info, BarChart2, CheckCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { useAnnouncements, useUserClasses, useCreateAnnouncement, useDeleteAnnouncement, useSchool, useVoteAnnouncement } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Babelfish } from '@/components/Babelfish';
import { useTranslations } from 'next-intl';

/**
 * Announcements Page — Auglýsingataflan (fjord_moss redesign)
 */

export default function AnnouncementsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('announcements');

    // Dynamic Class ID
    const { data: userClasses } = useUserClasses(user?.uid || '', user?.email);
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

        if (diffHours < 1) return t('time_just_now');
        if (diffHours < 24) return t('time_hours_ago', { hours: diffHours });
        if (diffDays === 1) return t('time_yesterday');
        if (diffDays < 7) return t('time_days_ago', { days: diffDays });

        return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(date);
    };

    if (authLoading || announcementsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 text-primary">
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

    // Translation for Scope/Author
    const getAuthorLabel = (announcement: any) => {
        if (announcement.scope === 'school') return t('author_pta');
        return announcement.author || t('author_board');
    }

    return (
        <div className="space-y-8 pb-20">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed/60 text-xs font-bold text-on-tertiary-fixed uppercase tracking-wide mb-3 animate-in fade-in slide-in-from-left-2">
                        <Megaphone size={12} />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">{t('title')}</h1>
                    <p className="text-xl text-on-surface-variant max-w-xl mt-2 leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                {(isAdmin || isSchoolAdmin) && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-on-primary shadow-ambient bg-gradient-to-r from-primary to-primary-container hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={18} />
                        {t('new_announcement')}
                    </button>
                )}
            </header>

            {/* Global Translation Notice (if not Icelandic) */}
            {locale !== 'is' && (
                <div className="max-w-4xl mx-auto p-4 bg-surface-container-low ghost-border rounded-2xl flex items-start gap-3">
                    <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-on-surface-variant leading-relaxed italic">
                        <strong className="text-on-surface">Translation Notice:</strong> Messages are automatically translated into your language. Original text is preserved for accuracy.
                    </p>
                </div>
            )}

            {/* Announcements Feed */}
            <div className="space-y-6 max-w-4xl mx-auto pt-6">
                {sortedAnnouncements.length === 0 && (
                    <div className="text-center py-20 bg-surface-container-lowest rounded-3xl shadow-ambient">
                        <p className="text-on-surface-variant font-medium">{t('empty')}</p>
                    </div>
                )}

                {sortedAnnouncements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className={`relative overflow-hidden rounded-3xl shadow-ambient ${announcement.pinned ? 'bg-tertiary-fixed/40 ring-1 ring-tertiary-fixed' : 'bg-surface-container-lowest'}`}
                    >
                        {/* Pinned accent bar */}
                        {announcement.pinned && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" />
                        )}

                        {/* Tags / Badges */}
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            {announcement.scope === 'school' && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wide">
                                    <Megaphone size={12} fill="currentColor" /> {t('tag_school')}
                                </span>
                            )}
                            {announcement.pinned && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold rounded-full uppercase tracking-wide">
                                    <Pin size={12} fill="currentColor" /> {t('tag_important')}
                                </span>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Author Avatar */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${announcement.pinned ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-primary'}`}>
                                    {(announcement.author || 'S')[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-on-surface leading-tight">
                                            {getAuthorLabel(announcement)}
                                        </p>
                                        {announcement.originalLanguage && announcement.originalLanguage !== 'is' && (
                                            <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                                {announcement.originalLanguage}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">
                                        {formatDate(announcement.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-on-surface mb-4 tracking-tight leading-snug">
                                {announcement.title}
                            </h2>

                            <div className="prose prose-lg max-w-none text-on-surface-variant leading-relaxed whitespace-pre-wrap">
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
                                <div className="mt-6 bg-surface-container-low rounded-2xl p-6 space-y-4 ghost-border">
                                    <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant uppercase tracking-wide mb-2">
                                        <BarChart2 size={16} />
                                        <span>{t('poll')}</span>
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
                                                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all group
                                                    ${hasVoted ? 'ring-2 ring-primary bg-primary-container/15' : 'ghost-border bg-surface-container-lowest hover:ring-1 hover:ring-primary/30'}
                                                `}
                                            >
                                                {/* Progress Bar Background */}
                                                <div
                                                    className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out opacity-25
                                                        ${hasVoted ? 'bg-primary' : 'bg-on-surface-variant/40'}
                                                    `}
                                                    style={{ width: `${percentage}%` }}
                                                />

                                                <div className="relative p-3 flex items-center justify-between z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                                            ${hasVoted ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'}
                                                        `}>
                                                            {hasVoted && <CheckCircle size={12} />}
                                                        </div>
                                                        <span className={`font-medium ${hasVoted ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                                            {option.text}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-bold text-on-surface-variant">
                                                        {percentage}% ({votes})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <p className="text-center text-xs text-on-surface-variant font-medium pt-2">
                                        {announcement.pollOptions?.reduce((acc, curr) => acc + (curr.votes?.length || 0), 0)} {t('votes_total')}
                                    </p>
                                </div>
                            )}

                            {(isAdmin || isSchoolAdmin) && (
                                <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-end">
                                    <button
                                        onClick={() => {
                                            if (confirm(t('delete_confirm'))) {
                                                deleteAnnouncementMutation.mutate(announcement.id);
                                            }
                                        }}
                                        className="text-xs font-bold text-error px-3 py-1 bg-error-container/40 hover:bg-error-container rounded-full transition-colors"
                                    >
                                        {t('delete_btn')}
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
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-ambient relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-primary-container left-0" />

                        <div className="text-center">
                            <div className="w-14 h-14 bg-primary-container/15 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary shadow-ambient">
                                <MessageSquare size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-on-surface tracking-tight">{t('modal_title')}</h2>
                            <p className="text-on-surface-variant font-medium mt-1">{t('modal_subtitle')}</p>
                        </div>

                        <div className="space-y-4">
                            {/* Scope Selector (Only if School Admin) */}
                            {isSchoolAdmin && (
                                <div className="flex bg-surface-container-low p-1 rounded-xl">
                                    <button
                                        onClick={() => setScope('class')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'class' ? 'bg-surface-container-lowest text-on-surface shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        Bekkur
                                    </button>
                                    <button
                                        onClick={() => setScope('school')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'school' ? 'bg-surface-container-lowest text-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        Allur Skólinn (Foreldrafélag)
                                    </button>
                                </div>
                            )}

                            <input
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder={t('placeholder_title')}
                                className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-bold text-lg text-on-surface"
                                autoFocus
                            />

                            <textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder={t('placeholder_content')}
                                className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none h-40 resize-none font-medium text-on-surface"
                            />

                            <div className="flex border-t border-outline-variant/30 pt-4 flex-col gap-3">
                                <div className="flex items-center gap-3 p-4 bg-tertiary-fixed/50 rounded-2xl cursor-pointer flex-1" onClick={() => setNewPinned(!newPinned)}>
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newPinned ? 'bg-tertiary border-tertiary text-on-tertiary' : 'border-on-tertiary-fixed/40 bg-surface-container-lowest'}`}>
                                        {newPinned && <Pin size={14} />}
                                    </div>
                                    <span className="font-bold text-on-tertiary-fixed text-sm">{t('pin_action')}</span>
                                </div>
                            </div>

                            {/* Poll Creator */}
                            <div className="pt-2">
                                <button
                                    onClick={() => setIsPoll(!isPoll)}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${isPoll ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isPoll ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'}`}>
                                        {isPoll && <CheckCircle size={14} />}
                                    </div>
                                    {t('create_poll')}
                                </button>

                                {isPoll && (
                                    <div className="mt-4 space-y-3 bg-surface-container-low p-4 rounded-2xl ghost-border animate-in slide-in-from-top-2">
                                        <label className="text-xs font-bold text-on-surface-variant uppercase">{t('poll_options')}</label>

                                        {pollOptions.map((opt) => (
                                            <div key={opt.id} className="flex gap-2 animate-in fade-in">
                                                <div className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-lg text-sm font-medium text-on-surface">
                                                    {opt.text}
                                                </div>
                                                <button onClick={() => removePollOption(opt.id)} className="text-error hover:opacity-80">
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
                                                placeholder={t('add_option')}
                                                className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 text-on-surface"
                                            />
                                            <button onClick={addPollOption} className="text-primary hover:opacity-80">
                                                <PlusCircle size={32} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newTitle || !newContent) return alert(t('fill_required'));

                                    if (isCritical) {
                                        setShowNuclearConfirm(true);
                                        return;
                                    }

                                    if (newTitle && newContent) {
                                        const announcementPayload = {
                                            classId: scope === 'class' ? activeClassId : null,
                                            schoolId: activeClass?.schoolId || '',
                                            scope,
                                            title: newTitle,
                                            content: newContent,
                                            pinned: false,
                                            isCritical: false,
                                            originalLanguage: locale,
                                            pollOptions: isPoll ? pollOptions.map(opt => ({ ...opt, votes: [] })) : [],
                                            allowMultipleVotes: false,
                                            createdBy: user?.uid || '',
                                            author: user?.displayName || (scope === 'school' ? 'Foreldrafélag' : 'Stjórn'),
                                        };

                                        await createAnnouncementMutation.mutateAsync(announcementPayload);

                                        // Trigger Notification Fan-out
                                        try {
                                            const token = await user?.getIdToken();
                                            await fetch('/api/notifications/fan-out', {
                                                method: 'POST',
                                                headers: { 
                                                    'Content-Type': 'application/json',
                                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                },
                                                body: JSON.stringify({
                                                    ...announcementPayload,
                                                    message: newTitle, // Short message for notification
                                                    link: `/${locale}/announcements`
                                                })
                                            });
                                        } catch (err) {
                                            console.error("Failed to send notification fan-out:", err);
                                        }

                                        setNewTitle('');
                                        setNewContent('');
                                        setIsCreating(false);
                                        setNuclearKeyword('');
                                        setIsCritical(false);
                                        setIsPoll(false);
                                        setPollOptions([]);
                                    }
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container shadow-ambient hover:-translate-y-0.5 transition-all"

                            >
                                {t('publish')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Nuclear Confirmation Modal */}
            {showNuclearConfirm && (
                <div className="fixed inset-0 bg-error/80 backdrop-blur-xl flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
                    <div className="bg-surface-container-lowest rounded-3xl p-10 max-w-md w-full space-y-8 shadow-ambient relative overflow-hidden ring-4 ring-error">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-error-container rounded-2xl flex items-center justify-center mx-auto text-error">
                                <Megaphone size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-on-surface tracking-tight italic uppercase">VARÚÐ!</h2>
                            <p className="text-on-surface-variant font-bold leading-relaxed">
                                Þessi tilkynning verður send sem tölvupóstur á <span className="text-error underline text-lg">alla foreldra</span> í hópnum.
                                <br /><br />
                                Þetta trompar allar stillingar notenda og er ekki hægt að afturkalla.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-center text-xs font-black text-on-surface-variant uppercase tracking-[0.2em]">Skrifaðu staðfestingarorðið hér að neðan</p>
                            <input
                                type="text"
                                value={nuclearKeyword}
                                onChange={e => setNuclearKeyword(e.target.value)}
                                placeholder="SENDA"
                                className="w-full text-center px-6 py-4 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-error transition-all outline-none font-bold text-2xl tracking-[0.3em] uppercase placeholder:opacity-30 text-on-surface"
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
                                        const token = await user?.getIdToken();
                                        await fetch('/api/send-critical-announcement', {
                                            method: 'POST',
                                            headers: { 
                                                'Content-Type': 'application/json',
                                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                            },
                                            body: JSON.stringify(announcement)
                                        });

                                        // Also trigger Notification Fan-out
                                        await fetch('/api/notifications/fan-out', {
                                            method: 'POST',
                                            headers: { 
                                                'Content-Type': 'application/json',
                                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                            },
                                            body: JSON.stringify({
                                                ...announcement,
                                                message: newTitle,
                                                link: `/${locale}/announcements`
                                            })
                                        });
                                    } catch (err) {
                                        console.error("Failed to send emails or notifications:", err);
                                    }

                                    setIsCreating(false);
                                    setShowNuclearConfirm(false);
                                    setNuclearKeyword('');
                                    setNewTitle(''); setNewContent(''); setNewPinned(false); setScope('class'); setIsCritical(false);
                                }}
                                disabled={nuclearKeyword.toUpperCase() !== 'SENDA'}
                                className="w-full py-5 rounded-xl font-bold text-on-error bg-error shadow-ambient hover:opacity-90 active:scale-98 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xl"
                            >
                                SENDA NÚNA
                            </button>
                            <button
                                onClick={() => {
                                    setShowNuclearConfirm(false);
                                    setNuclearKeyword('');
                                }}
                                className="w-full py-4 rounded-xl font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
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
