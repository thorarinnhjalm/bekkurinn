'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserClass, useAgreement, useAgreementVotes, useMyVote, useCastVote, useUpdateAgreement, useCreateAgreement } from '@/hooks/useFirestore';
import { Loader2, Lock, Vote, CheckCircle2 } from 'lucide-react';
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

    // Mutations
    const castVoteMutation = useCastVote();
    const createAgreementMutation = useCreateAgreement();
    const updateAgreementMutation = useUpdateAgreement();

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
                                { value: 0, labelKey: 'options.0kr' },
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
                        }
                    ]
                }
            ]
        };

        try {
            console.log('Starting creation with:', newAgreement);
            await createAgreementMutation.mutateAsync(newAgreement);
            alert('Agreement created! Page should refresh.');
        } catch (e: any) {
            console.error('Agreement creation failed:', e);
            alert(`Error creating agreement: ${e.message}`);
        }
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
        return (
            <div className="space-y-8 pb-20">
                <header>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-3">
                        <Vote className="w-3 h-3" />
                        {t('status_voting')}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500">{t('voting_card.desc')}</p>

                    {/* Helper to strip double prefixes from old data */}
                    {(() => {
                        const cleanKey = (k: string) => k.replace(/^agreement\./, '');
                        const sections = agreement.sections.map(s => ({
                            ...s,
                            titleKey: cleanKey(s.titleKey),
                            descriptionKey: cleanKey(s.descriptionKey),
                            items: s.items.map(i => ({
                                ...i,
                                questionKey: cleanKey(i.questionKey),
                                options: i.options.map(o => ({ ...o, labelKey: cleanKey(o.labelKey) }))
                            }))
                        }));

                        return (
                            <>
                                {isAdmin && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                                        <span className="text-sm font-medium text-yellow-800">Admin Stjórnborð</span>
                                        <button onClick={handlePublish} className="text-xs font-bold bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg hover:bg-yellow-500">
                                            Loka kosningu & Birta
                                        </button>
                                    </div>
                                )}
                            </header >

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
                            </>
                )
                    })()}
            </div>
            </div >
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
                        <button onClick={handleStartVoting} className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl transition-colors">
                            Byrja kosningu (Virkjar fyrir alla)
                        </button>
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

    // 3. PUBLISHED PHASE
    return (
        <div className="pb-20">
            <AgreementPoster agreement={agreement} />

            {/* Admin control to re-open loop? */}
            {isAdmin && (
                <div className="mt-8 text-center">
                    <button className="text-xs text-gray-400 hover:text-gray-600 underline">
                        Breyta / Endurnýja sáttmála
                    </button>
                </div>
            )}
        </div>
    );
}
