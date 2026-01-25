'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserClass, useAgreement, useAgreementVotes, useMyVote, useCastVote, useUpdateAgreement, useCreateAgreement, useDeleteAgreement } from '@/hooks/useFirestore';
import { Loader2, Lock, Vote, CheckCircle2, ShieldCheck, PenTool } from 'lucide-react';
import { VotingCard } from '@/components/agreement/VotingCard';
import { AgreementPoster } from '@/components/agreement/AgreementPoster';
import { Agreement, AgreementItem, AgreementSection } from '@/types';
import { Timestamp } from 'firebase/firestore';

export default function AgreementPage() {
    const t = useTranslations('agreement');
    const { user } = useAuth();
    const { data: activeClass, isLoading: userClassLoading } = useUserClass(user?.uid);
    const isAdmin = activeClass?.role === 'admin';

    const { data: agreement, isLoading } = useAgreement(activeClass?.id || null);
    const { data: myVote } = useMyVote(agreement?.id, user?.uid);
    const { data: signatures, isLoading: signaturesLoading } = useAgreementSignatures(agreement?.id);

    // Mutations
    const castVoteMutation = useCastVote();
    const createAgreementMutation = useCreateAgreement();
    const updateAgreementMutation = useUpdateAgreement();
    const deleteAgreementMutation = useDeleteAgreement();
    const signMutation = useSignAgreement();

    if (isLoading || userClassLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // --- ADMIN INITIALIZATION (If no agreement exists) ---
    const handleInitialize = async () => {
        if (!activeClass || !user) return;

        // Template for a standard agreement
        // In a real app, this might come from a localized constant or generator function
        const newAgreement: any = {
            classId: activeClass.id,
            status: 'draft', // Start as draft
            createdBy: user.uid,
            sections: [
                {
                    id: 'birthdays',
                    templateId: 'v1',
                    titleKey: 'sections.birthdays.title',
                    descriptionKey: 'sections.birthdays.desc',
                    items: [
                        {
                            id: 'gift_amount',
                            type: 'radio',
                            questionKey: 'sections.birthdays.gift_amount_q',
                            options: [
                                { value: 500, labelKey: 'options.500kr' },
                                { value: 1000, labelKey: 'options.1000kr' },
                                { value: 1500, labelKey: 'options.1500kr' },
                                { value: 2000, labelKey: 'options.2000kr' },
                                { value: 'free', labelKey: 'options.free' },
                            ]
                        },
                        {
                            id: 'invites',
                            type: 'radio',
                            questionKey: 'sections.birthdays.invitation_rule_q',
                            options: [
                                { value: 'all_class', labelKey: 'options.all_class' },
                                { value: 'gender_split', labelKey: 'options.gender_split' },
                                { value: 'small_groups', labelKey: 'options.small_groups' },
                            ]
                        }
                    ]
                },
                {
                    id: 'social',
                    templateId: 'v1',
                    titleKey: 'sections.social.title',
                    descriptionKey: 'sections.social.desc',
                    items: [
                        {
                            id: 'social_age',
                            type: 'radio',
                            questionKey: 'sections.social.social_age_q',
                            options: [
                                { value: 'no_social', labelKey: 'options.no_social' },
                                { value: 'monitored', labelKey: 'options.monitored' },
                                { value: 'open', labelKey: 'options.open' },
                            ]
                        },
                        {
                            id: 'gaming_rules',
                            type: 'radio',
                            questionKey: 'sections.social.gaming_q',
                            options: [
                                { value: 'pegi', labelKey: 'options.pegi' },
                                { value: 'flexible', labelKey: 'options.flexible_gaming' },
                                { value: 'open', labelKey: 'options.parents_decide' },
                            ]
                        },
                        {
                            id: 'screen_time',
                            type: 'radio',
                            questionKey: 'sections.social.screen_time_q',
                            options: [
                                { value: 'heilsuvera', labelKey: 'options.heilsuvera_guidelines' },
                                { value: 'balanced', labelKey: 'options.screen_balanced' },
                                { value: 'open', labelKey: 'options.parents_decide' },
                            ]
                        }
                    ]
                }
            ]
        };

        await createAgreementMutation.mutateAsync(newAgreement);
    };

    const handleStartVoting = async () => {
        if (!agreement) return;
        // Set deadline 7 days from now
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);

        await updateAgreementMutation.mutateAsync({
            agreementId: agreement.id,
            data: {
                status: 'voting',
                votingDeadline: Timestamp.fromDate(deadline)
            }
        });
    };

    const handlePublish = async () => {
        if (!agreement) return;
        // Logic to calculate winning votes would go here (or be done manually by admin)
        // For MVP, allow admin to just publish "as is" or we pretend auto-calc happens
        // Let's simpler: Set status to published
        await updateAgreementMutation.mutateAsync({
            agreementId: agreement.id,
            data: { status: 'published' }
        });
    };

    // --- RENDER LOGIC ---

    if (!agreement) {
        return (
            <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Vote className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500 mt-2">{t('subtitle')}</p>
                </div>
                {isAdmin ? (
                    <button
                        onClick={handleInitialize}
                        className="btn-primary"
                    >
                        Stofna nýjan sáttmála
                    </button>
                ) : (
                    <p className="text-sm text-gray-400">Bekkjarfulltrúi hefur ekki stofnað sáttmála ennþá.</p>
                )}


            </div>
        );
    }

    // 1. VOTING PHASE
    if (agreement.status === 'voting') {
        const cleanKey = (k: string) => k.replace(/^agreement\./, '');
        const sections: AgreementSection[] = agreement.sections.map((s: any) => ({
            ...s,
            titleKey: cleanKey(s.titleKey),
            descriptionKey: cleanKey(s.descriptionKey),
            items: s.items.map((i: any) => ({
                ...i,
                questionKey: cleanKey(i.questionKey),
                options: i.options.map((o: any) => ({ ...o, labelKey: cleanKey(o.labelKey) }))
            }))
        }));

        return (
            <div className="space-y-8 pb-20">
                <header>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-3">
                        <Vote className="w-3 h-3" />
                        {t('status_voting')}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500">{t('voting_card.desc')}</p>

                    {isAdmin && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-yellow-800">Admin Stjórnborð</span>
                            <button onClick={handlePublish} className="text-xs font-bold bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg hover:bg-yellow-500">
                                Loka kosningu & Birta
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('Ertu viss um að þú viljir eyða sáttmálanum? Þetta er óafturkræft.')) {
                                        await deleteAgreementMutation.mutateAsync(agreement.id);
                                        window.location.reload();
                                    }
                                }}
                                className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 ml-2"
                            >
                                Eyða
                            </button>
                        </div>
                    )}
                </header>

                <div className="space-y-8">
                    {sections.map(section => (
                        <div key={section.id}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">{t(section.titleKey as any)}</h2>
                            {section.items.map(item => (
                                <VotingCard
                                    key={item.id}
                                    item={item}
                                    isVotingOpen={true}
                                    existingVote={myVote?.answers?.[item.id]}
                                    onVote={async (val) => {
                                        await castVoteMutation.mutateAsync({
                                            agreementId: agreement.id,
                                            vote: {
                                                userId: user!.uid,
                                                userName: user!.displayName || 'Foreldri',
                                                studentId: undefined, // Could link to specific child if needed
                                                answers: {
                                                    ...(myVote?.answers || {}),
                                                    [item.id]: val
                                                }
                                            }
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. DRAFT PHASE (Admin only really)
    if (agreement.status === 'draft') {
        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                    <h2 className="font-bold text-yellow-800 text-lg mb-2">{t('status_draft')}</h2>
                    <p className="text-yellow-700 text-sm mb-4">Sáttmálinn er í vinnslu. Þú getur breytt spurningum eða byrjað kosningu.</p>

                    {isAdmin && (
                        <div className="space-y-4">
                            <button onClick={handleStartVoting} className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl transition-colors">
                                Byrja kosningu (Virkjar fyrir alla)
                            </button>

                            <button
                                onClick={async () => {
                                    if (confirm('Ertu viss um að þú viljir eyða sáttmálanum? Þetta er óafturkræft.')) {
                                        await deleteAgreementMutation.mutateAsync(agreement.id);
                                        window.location.reload();
                                    }
                                }}
                                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors"
                            >
                                Eyða sáttmála (Byrja upp á nýtt)
                            </button>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="mt-8 pt-8 border-t border-yellow-100">
                            <p className="text-xs text-yellow-600 mb-2 font-medium uppercase tracking-wide">Prufukeyrsla</p>
                            <button
                                onClick={async () => {
                                    if (!confirm('Þetta býr til gervi-niðurstöður fyrir sáttmálann til að sýna hvernig þetta lítur út. Eldri drögum verður eytt.')) return;

                                    // Delete old if exists
                                    if (agreement.id) {
                                        await deleteAgreementMutation.mutateAsync(agreement.id);
                                    }

                                    // Create demo
                                    const demoData: any = {
                                        classId: activeClass.id,
                                        status: 'published', // Published directly
                                        createdBy: user!.uid,
                                        sections: [
                                            {
                                                id: 'birthdays',
                                                templateId: 'v1',
                                                titleKey: 'sections.birthdays.title',
                                                descriptionKey: 'sections.birthdays.desc',
                                                items: [
                                                    {
                                                        id: 'gift_amount',
                                                        type: 'radio',
                                                        questionKey: 'sections.birthdays.gift_amount_q',
                                                        winningValue: 1500,
                                                        options: [
                                                            { value: 500, labelKey: 'options.500kr', voteCount: 2 },
                                                            { value: 1000, labelKey: 'options.1000kr', voteCount: 5 },
                                                            { value: 1500, labelKey: 'options.1500kr', voteCount: 12 },
                                                            { value: 2000, labelKey: 'options.2000kr', voteCount: 3 },
                                                            { value: 'free', labelKey: 'options.free', voteCount: 1 },
                                                        ]
                                                    },
                                                    {
                                                        id: 'invites',
                                                        type: 'radio',
                                                        questionKey: 'sections.birthdays.invitation_rule_q',
                                                        winningValue: 'all_class',
                                                        options: [
                                                            { value: 'all_class', labelKey: 'options.all_class', voteCount: 15 },
                                                            { value: 'gender_split', labelKey: 'options.gender_split', voteCount: 6 },
                                                            { value: 'small_groups', labelKey: 'options.small_groups', voteCount: 2 },
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'social',
                                                templateId: 'v1',
                                                titleKey: 'sections.social.title',
                                                descriptionKey: 'sections.social.desc',
                                                items: [
                                                    {
                                                        id: 'social_age',
                                                        type: 'radio',
                                                        questionKey: 'sections.social.social_age_q',
                                                        winningValue: 'monitored',
                                                        options: [
                                                            { value: 'no_social', labelKey: 'options.no_social', voteCount: 4 },
                                                            { value: 'monitored', labelKey: 'options.monitored', voteCount: 16 },
                                                            { value: 'open', labelKey: 'options.open', voteCount: 3 },
                                                        ]
                                                    },
                                                    {
                                                        id: 'gaming_rules',
                                                        type: 'radio',
                                                        questionKey: 'sections.social.gaming_q',
                                                        winningValue: 'flexible',
                                                        options: [
                                                            { value: 'pegi', labelKey: 'options.pegi', voteCount: 5 },
                                                            { value: 'flexible', labelKey: 'options.flexible_gaming', voteCount: 14 },
                                                            { value: 'open', labelKey: 'options.parents_decide', voteCount: 4 },
                                                        ]
                                                    },
                                                    {
                                                        id: 'screen_time',
                                                        type: 'radio',
                                                        questionKey: 'sections.social.screen_time_q',
                                                        winningValue: 'heilsuvera',
                                                        options: [
                                                            { value: 'heilsuvera', labelKey: 'options.heilsuvera_guidelines', voteCount: 18 },
                                                            { value: 'balanced', labelKey: 'options.screen_balanced', voteCount: 4 },
                                                            { value: 'open', labelKey: 'options.parents_decide', voteCount: 1 },
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    };

                                    await createAgreementMutation.mutateAsync(demoData);
                                    window.location.reload();
                                }}
                                className="w-full py-2 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors"
                            >
                                Sýna Demo (Fylla með gervigögnum)
                            </button>
                        </div>
                    )}
                </div>

                {/* Preview of what voting looks like */}
                <div className="opacity-60 pointer-events-none grayscale">
                    <h3 className="font-bold text-center mb-4">Forskoðun</h3>
                    {/* Reuse logic or map lightly */}
                </div>
            </div>
        );
    }

    const hasSigned = signatures?.some(s => s.userId === user?.uid);

    const handleSign = async () => {
        if (!agreement || !user) return;
        await signMutation.mutateAsync({
            agreementId: agreement.id,
            signature: {
                userId: user.uid,
                userName: user.displayName || 'Foreldri'
            }
        });
    };

    if (isLoading || userClassLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }
    // ... rest of checking logic if needed (it stays but let's see)

    // 3. PUBLISHED PHASE
    return (
        <div className="space-y-12 animate-in fade-in duration-800 pb-20">
            {/* Header Section */}
            <header className="relative isolate overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl opacity-20" aria-hidden="true">
                    <div className="aspect-[1155/678] w-[60rem] bg-gradient-to-tr from-emerald-100 to-indigo-200"
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                    />
                </div>

                <div className="glass-card p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                <ShieldCheck size={14} />
                                {t('poster.verified_badge')}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                <PenTool size={14} />
                                {signatures?.length || 0} hafa skrifað undir
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-gray-600 font-medium max-w-lg leading-relaxed">
                            {t('subtitle')}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={async () => {
                                    if (confirm('Ertu viss um að þú viljir endurræsa sáttmálann? Öllum atkvæðum verður eytt.')) {
                                        await deleteAgreementMutation.mutateAsync(agreement.id);
                                        window.location.reload();
                                    }
                                }}
                                className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                            >
                                Breyta / Endurnýja
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Signature CTA */}
            {!hasSigned && !isAdmin && (
                <div className="professional-card p-8 border-l-4 border-l-trust-navy bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-trust-navy shadow-sm">
                            <PenTool size={32} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Skrifa undir sáttmálann</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                {t('poster.signature_desc')}
                            </p>
                        </div>
                        <button
                            onClick={handleSign}
                            disabled={signMutation.isPending}
                            className="bg-trust-navy text-white px-10 py-4 rounded-xl font-bold hover:bg-trust-navy-light transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {signMutation.isPending ? 'Vistar...' : t('poster.sign_button')}
                        </button>
                    </div>
                </div>
            )}

            {hasSigned && (
                <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 animate-in zoom-in duration-300">
                    <CheckCircle2 size={24} />
                    <span className="font-bold text-lg">{t('poster.signed_success')}</span>
                </div>
            )}

            <AgreementPoster agreement={agreement} signaturesCount={signatures?.length || 0} />
        </div>
    );
}
