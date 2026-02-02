'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserClass, useAgreement, useAgreementVotes, useMyVote, useCastVote, useUpdateAgreement, useCreateAgreement, useDeleteAgreement, useAgreementSignatures, useSignAgreement } from '@/hooks/useFirestore';
import { Loader2, Lock, Vote, CheckCircle2, ShieldCheck, PenTool, Settings, PartyPopper, Smartphone, Plus, X, Save, Trash2, Edit2 } from 'lucide-react';
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

    const cleanKey = (key: string) => {
        if (!key) return '';
        return key.replace(/^agreement\./, '');
    };

    const renderText = (key: string) => {
        const cleaned = cleanKey(key);
        const translated = t(cleaned as any);
        return translated.startsWith('agreement.') ? cleaned : translated;
    };

    // --- EDITING STATE ---
    const [editingItem, setEditingItem] = useState<{ sectionId: string, item: AgreementItem } | null>(null);
    const [editingSection, setEditingSection] = useState<{ id: string, titleKey: string, descriptionKey: string } | null>(null);

    // Helpers for editing
    const handleSaveItem = async (sectionId: string, item: AgreementItem) => {
        if (!agreement) return;

        const newSections = agreement.sections.map((s: any) => {
            if (s.id === sectionId) {
                // Check if item exists
                const itemExists = s.items.find((i: any) => i.id === item.id);
                let newItems;
                if (itemExists) {
                    newItems = s.items.map((i: any) => i.id === item.id ? item : i);
                } else {
                    newItems = [...s.items, item];
                }
                return { ...s, items: newItems };
            }
            return s;
        });

        await updateAgreementMutation.mutateAsync({
            agreementId: agreement.id,
            data: { sections: newSections }
        });
        setEditingItem(null);
    };

    const handleDeleteItem = async (sectionId: string, itemId: string) => {
        if (!agreement || !confirm('Ertu viss um að þú viljir eyða þessari spurningu?')) return;

        const newSections = agreement.sections.map((s: any) => {
            if (s.id === sectionId) {
                return { ...s, items: s.items.filter((i: any) => i.id !== itemId) };
            }
            return s;
        });

        await updateAgreementMutation.mutateAsync({
            agreementId: agreement.id,
            data: { sections: newSections }
        });
    };

    const handleSaveSection = async (sectionId: string, title: string, desc: string) => {
        if (!agreement) return;

        const newSections = agreement.sections.map((s: any) => {
            if (s.id === sectionId) {
                return { ...s, titleKey: title, descriptionKey: desc };
            }
            return s;
        });

        await updateAgreementMutation.mutateAsync({
            agreementId: agreement.id,
            data: { sections: newSections }
        });
        setEditingSection(null);
    };

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
                            id: 'gaming_communication',
                            type: 'radio',
                            questionKey: 'Viðmið um tölvuleiki (t.d. Roblox, Fortnite)',
                            options: [
                                { value: 'monitoring', labelKey: 'Við fylgjumst með vinabeiðnum og spjalli' },
                                { value: 'education', labelKey: 'Við ræðum um nethegðun og samskiptareglur' },
                                { value: 'open', labelKey: 'Foreldrar ákveða reglur fyrir sín börn' },
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
            <div className="space-y-12 animate-in fade-in duration-800 pb-20">
                {/* Header Section */}
                <header className="relative isolate overflow-hidden">
                    <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl opacity-20" aria-hidden="true">
                        <div className="aspect-[1155/678] w-[60rem] bg-gradient-to-tr from-amber-100 to-orange-200"
                            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                        />
                    </div>

                    <div className="glass-card p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700 uppercase tracking-wide">
                                <Lock size={14} />
                                {t('status_draft')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                                Sáttmáli í vinnslu
                            </h1>
                            <p className="text-lg text-gray-600 font-medium max-w-lg leading-relaxed">
                                Hér getur þú stillt spurningar og valmöguleika áður en kosning hefst.
                            </p>
                        </div>

                        {isAdmin && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleStartVoting}
                                    className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-amber-900 font-black rounded-xl transition-all shadow-lg shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Vote size={20} />
                                    Byrja kosningu
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('Ertu viss um að þú viljir eyða sáttmálanum? Þetta er óafturkræft.')) {
                                            await deleteAgreementMutation.mutateAsync(agreement.id);
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-6 py-4 bg-white border border-gray-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 text-sm"
                                >
                                    Eyða & Byrja aftur
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Editor/Structure */}
                    <div className="lg:col-span-12 space-y-10">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reglur & Spurningar</h2>
                                <span className="text-sm font-bold text-gray-400">Drög að uppsetningu</span>
                            </div>

                            <div className="space-y-8">
                                {agreement.sections.map((section: any) => (
                                    <div key={section.id} className="professional-card p-0 overflow-hidden bg-white">
                                        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                                    {section.id === 'birthdays' ? <PartyPopper className="text-pink-500" /> : <Smartphone className="text-indigo-500" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{renderText(section.titleKey)}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">{renderText(section.descriptionKey)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingSection({
                                                    id: section.id,
                                                    titleKey: section.titleKey,
                                                    descriptionKey: section.descriptionKey
                                                })}
                                                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                Breyta texta
                                            </button>
                                        </div>

                                        <div className="p-6 md:p-8 space-y-8">
                                            {section.items.map((item: any) => {
                                                const questionKey = cleanKey(item.questionKey || `sections.${section.id}.${item.id}_q`);

                                                return (
                                                    <div key={item.id} className="space-y-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Spurning</div>
                                                                <h4 className="font-bold text-lg text-gray-900">
                                                                    {renderText(questionKey)}
                                                                </h4>
                                                            </div>
                                                            <button
                                                                onClick={() => setEditingItem({ sectionId: section.id, item })}
                                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            >
                                                                <Settings size={18} />
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {item.options.map((opt: any) => {
                                                                const labelKey = cleanKey(opt.labelKey || `options.${opt.value}`);

                                                                return (
                                                                    <div key={opt.value} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
                                                                        {renderText(labelKey)}
                                                                    </div>
                                                                );
                                                            })}
                                                            <button
                                                                onClick={() => {
                                                                    // Add a new empty option to this item and open editor
                                                                    const newOption = { value: Date.now(), labelKey: 'Nýr valmöguleiki' };
                                                                    const newItem = { ...item, options: [...item.options, newOption] };
                                                                    setEditingItem({ sectionId: section.id, item: newItem });
                                                                }}
                                                                className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs font-black text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                                                            >
                                                                + Bæta við
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Add Question Button at bottom of section */}
                                        <div className="px-6 pb-6 pt-2">
                                            <button
                                                onClick={() => {
                                                    const newItem: AgreementItem = {
                                                        id: `custom_${Date.now()}`,
                                                        type: 'radio',
                                                        questionKey: 'Ný Spurning',
                                                        options: [
                                                            { value: 'opt1', labelKey: 'Já' },
                                                            { value: 'opt2', labelKey: 'Nei' }
                                                        ]
                                                    };
                                                    setEditingItem({ sectionId: section.id, item: newItem });
                                                }}
                                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} />
                                                Bæta við spurningu
                                            </button>
                                        </div>
                                    </div>
                    </div>
                                ))}
                    </div>
                </section>

                {/* Demo/Preview Area */}
                {
                    isAdmin && (
                        <div className="glass-card p-10 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50">
                            <div className="text-center max-w-md mx-auto space-y-4">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Prufukeyrsla</h3>
                                <p className="text-gray-600 font-medium">Viltu sjá strax hvernig niðurstöðurnar munu líta út? Þú getur búið til gervigögn hér.</p>
                                <button
                                    onClick={async () => {
                                        if (!confirm('Þetta býr til gervi-niðurstöður fyrir sáttmálann til að sýna hvernig þetta lítur út. Eldri drögum verður eytt.')) return;
                                        if (agreement.id) await deleteAgreementMutation.mutateAsync(agreement.id);

                                        const demoData: any = {
                                            classId: activeClass.id,
                                            status: 'published',
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
                                                        }
                                                    ]
                                                }
                                            ]
                                        };
                                        await createAgreementMutation.mutateAsync(demoData);
                                        window.location.reload();
                                    }}
                                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                >
                                    Sýna Demo (Fylla með gervigögnum)
                                </button>
                            </div>
                        </div>
                    )
                }
            </div >
                </div >
            </div >
        );
    }

    // 3. PUBLISHED PHASE
    const hasSigned = signatures?.some((s: any) => s.userId === user?.uid);

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

            {/* ITEM EDITOR MODAL */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900">Breyta Spurningu</h3>
                            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Question Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Spurning</label>
                                <input
                                    type="text"
                                    value={editingItem.item.questionKey} // We edit the key directly as text
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        item: { ...editingItem.item, questionKey: e.target.value }
                                    })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Options */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Valmöguleikar</label>
                                <div className="space-y-3">
                                    {editingItem.item.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt.labelKey}
                                                onChange={(e) => {
                                                    const newOptions = [...editingItem.item.options];
                                                    newOptions[idx] = { ...opt, labelKey: e.target.value };
                                                    setEditingItem({
                                                        ...editingItem,
                                                        item: { ...editingItem.item, options: newOptions }
                                                    });
                                                }}
                                                className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newOptions = editingItem.item.options.filter((_, i) => i !== idx);
                                                    setEditingItem({
                                                        ...editingItem,
                                                        item: { ...editingItem.item, options: newOptions }
                                                    });
                                                }}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newOption = { value: Date.now(), labelKey: '' };
                                            setEditingItem({
                                                ...editingItem,
                                                item: { ...editingItem.item, options: [...editingItem.item.options, newOption] }
                                            });
                                        }}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                                    >
                                        <Plus size={14} /> Bæta við valmöguleika
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
                            <button
                                onClick={() => handleDeleteItem(editingItem.sectionId, editingItem.item.id)}
                                className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Eyða spurningu
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 text-gray-500 font-bold text-sm hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Hætta við
                                </button>
                                <button
                                    onClick={() => handleSaveItem(editingItem.sectionId, editingItem.item)}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Vista Breytingar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION EDITOR MODAL */}
            {editingSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Breyta texta</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Titill</label>
                                <input
                                    type="text"
                                    value={editingSection.titleKey}
                                    onChange={(e) => setEditingSection({ ...editingSection, titleKey: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Lýsing</label>
                                <textarea
                                    value={editingSection.descriptionKey}
                                    onChange={(e) => setEditingSection({ ...editingSection, descriptionKey: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={() => handleSaveSection(editingSection.id, editingSection.titleKey, editingSection.descriptionKey)}
                                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            >
                                Vista
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TopicItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
        </div>
    );
}
