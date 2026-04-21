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
import { SCHOOLS } from '@/constants/schools';

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

        try {
            const newSections = agreement.sections.map((s: any) => {
                if (s.id === sectionId) {
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
        } catch (error) {
            console.error("Failed to save item:", error);
            alert("Villa kom upp við að vista breytingar.");
        }
    };

    const handleDeleteItem = async (sectionId: string, itemId: string) => {
        if (!agreement || !confirm('Ertu viss um að þú viljir eyða þessari spurningu?')) return;

        try {
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
        } catch (error) {
            console.error("Failed to delete item:", error);
            alert("Villa kom upp við að eyða spurningu.");
        }
    };

    const handleSaveSection = async (sectionId: string, title: string, desc: string) => {
        if (!agreement) return;

        try {
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
        } catch (error) {
            console.error("Failed to save section:", error);
            alert("Villa kom upp við að vista kafla.");
        }
    };

    if (isLoading || userClassLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // --- ADMIN INITIALIZATION (If no agreement exists) ---
    const handleInitialize = async () => {
        if (!activeClass || !user) return;

        const isKopavogur = activeClass.schoolId && SCHOOLS.some(s => s.id === activeClass.schoolId);

        const sections: any[] = [];

        if (isKopavogur) {
            sections.push({
                id: 'kopavogur_phonefree',
                templateId: 'municipality_v1',
                titleKey: 'sections.kopavogur_phonefree.title',
                descriptionKey: 'sections.kopavogur_phonefree.desc',
                isMunicipalityMandated: true,
                items: [
                    { id: 'rules_1_7', type: 'info', questionKey: 'sections.kopavogur_phonefree.rules_1_7', options: [] },
                    { id: 'rules_8_10', type: 'info', questionKey: 'sections.kopavogur_phonefree.rules_8_10', options: [] },
                    { id: 'breaks', type: 'info', questionKey: 'sections.kopavogur_phonefree.breaks', options: [] },
                    { id: 'parent_commitment', type: 'info', questionKey: 'sections.kopavogur_phonefree.parent_commitment', options: [] },
                    { id: 'staff_commitment', type: 'info', questionKey: 'sections.kopavogur_phonefree.staff_commitment', options: [] }
                ]
            });
        }

        sections.push(
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
        );

        const newAgreement: any = {
            classId: activeClass.id,
            status: 'draft',
            createdBy: user.uid,
            sections
        };

        await createAgreementMutation.mutateAsync(newAgreement);
    };

    const handleStartVoting = async () => {
        if (!agreement) return;
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
                <div className="mx-auto w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center">
                    <Vote className="w-10 h-10 text-on-surface-variant" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-on-surface">{t('title')}</h2>
                    <p className="text-on-surface-variant mt-2">{t('subtitle')}</p>
                </div>
                {isAdmin ? (
                    <button
                        onClick={handleInitialize}
                        className="inline-flex items-center gap-2 px-8 py-4 text-lg rounded-full font-semibold text-on-primary shadow-ambient bg-gradient-to-r from-primary to-primary-container hover:-translate-y-0.5 transition-all mx-auto"
                    >
                        <Plus size={24} />
                        Stofna nýjan sáttmála
                    </button>
                ) : (
                    <p className="text-sm text-on-surface-variant">Bekkjarfulltrúi hefur ekki stofnað sáttmála ennþá.</p>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary text-xs font-bold uppercase tracking-wide mb-3">
                        <Vote className="w-3 h-3" />
                        {t('status_voting')}
                    </div>
                    <h1 className="text-3xl font-bold text-on-surface">{t('title')}</h1>
                    <p className="text-on-surface-variant">{t('voting_card.desc')}</p>

                    {isAdmin && (
                        <div className="mt-4 p-4 bg-tertiary-fixed/50 rounded-2xl flex items-center justify-between shadow-ambient">
                            <span className="text-sm font-medium text-on-tertiary-fixed">Admin Stjórnborð</span>
                            <button onClick={handlePublish} className="text-xs font-bold bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full hover:opacity-90">
                                Loka kosningu & Birta
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('Ertu viss um að þú viljir eyða sáttmálanum? Þetta er óafturkræft.')) {
                                        await deleteAgreementMutation.mutateAsync(agreement.id);
                                        window.location.reload();
                                    }
                                }}
                                className="text-xs font-bold bg-error-container text-error px-3 py-1.5 rounded-full hover:opacity-90 ml-2"
                            >
                                Eyða
                            </button>
                        </div>
                    )}
                </header>

                <div className="space-y-8">
                    {sections.map(section => (
                        <div key={section.id}>
                            <h2 className="text-xl font-bold text-on-surface mb-4 px-1">{t(section.titleKey as any)}</h2>
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
                                                studentId: undefined,
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
                    <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed/60 text-xs font-semibold text-on-tertiary-fixed uppercase tracking-wide">
                                <Lock size={14} />
                                {t('status_draft')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight">
                                Sáttmáli í vinnslu
                            </h1>
                            <p className="text-lg text-on-surface-variant font-medium max-w-lg leading-relaxed">
                                Hér getur þú stillt spurningar og valmöguleika áður en kosning hefst.
                            </p>
                        </div>

                        {isAdmin && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleStartVoting}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-black rounded-full transition-all shadow-ambient hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
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
                                    className="px-6 py-4 bg-surface-container-low text-error font-bold rounded-full hover:bg-error-container/40 transition-all active:scale-95 text-sm"
                                >
                                    Eyða & Byrja aftur
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-12 space-y-10">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-bold text-on-surface tracking-tight">Reglur & Spurningar</h2>
                                <span className="text-sm font-bold text-on-surface-variant">Drög að uppsetningu</span>
                            </div>

                            <div className="space-y-8">
                                {agreement.sections.map((section: any) => (
                                    <div key={section.id} className="bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
                                        <div className="p-6 md:p-8 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest shadow-ambient flex items-center justify-center">
                                                    {section.id === 'birthdays' ? <PartyPopper className="text-secondary" /> : <Smartphone className="text-primary" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-on-surface">{renderText(section.titleKey)}</h3>
                                                    <p className="text-sm text-on-surface-variant font-medium">{renderText(section.descriptionKey)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingSection({
                                                    id: section.id,
                                                    titleKey: section.titleKey,
                                                    descriptionKey: section.descriptionKey
                                                })}
                                                className="text-xs font-bold text-primary bg-primary-container/15 px-3 py-1.5 rounded-full hover:bg-primary-container/25 transition-colors"
                                            >
                                                Breyta texta
                                            </button>
                                        </div>

                                        <div className="p-6 md:p-8 space-y-8">
                                            {section.items.map((item: any) => {
                                                const questionKeyRaw = item.questionKey || `sections.${section.id}.${item.id}_q`;

                                                return (
                                                    <div key={item.id} className="space-y-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Spurning</div>
                                                                <h4 className="font-bold text-lg text-on-surface">
                                                                    {renderText(questionKeyRaw)}
                                                                </h4>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingItem({ sectionId: section.id, item: structuredClone(item) })
                                                                }}
                                                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/15 rounded-lg transition-all"
                                                            >
                                                                <Settings size={18} />
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {item.options.map((opt: any) => {
                                                                const labelKeyRaw = opt.labelKey || `options.${opt.value}`;

                                                                return (
                                                                    <div key={opt.value} className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface">
                                                                        {renderText(labelKeyRaw)}
                                                                    </div>
                                                                );
                                                            })}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newOption = { value: Date.now().toString(), labelKey: 'Nýr valmöguleiki' };
                                                                    const newItem = { ...item, options: [...item.options, newOption] };
                                                                    setEditingItem({ sectionId: section.id, item: newItem });
                                                                }}
                                                                className="px-3 py-1.5 border border-dashed border-outline-variant rounded-lg text-xs font-black text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex items-center gap-1"
                                                            >
                                                                <Plus size={12} /> Bæta við
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
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
                                                className="w-full py-3 border-2 border-dashed border-outline-variant/50 rounded-xl text-sm font-bold text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary-container/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} />
                                                Bæta við spurningu
                                            </button>
                                        </div>
                                    </div>

                                ))}
                            </div>
                        </section>

                        {/* Demo/Preview Area */}
                        {
                            isAdmin && (
                                <div className="bg-gradient-to-br from-primary-container/15 to-surface-container-lowest rounded-3xl shadow-ambient p-10">
                                    <div className="text-center max-w-md mx-auto space-y-4">
                                        <div className="w-16 h-16 bg-surface-container-lowest rounded-2xl shadow-ambient flex items-center justify-center mx-auto text-primary">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-on-surface">Prufukeyrsla</h3>
                                        <p className="text-on-surface-variant font-medium">Viltu sjá strax hvernig niðurstöðurnar munu líta út? Þú getur búið til gervigögn hér.</p>
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
                                                                    winningValue: 'gender_split',
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
                                                                    winningValue: 'monitored',
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
                                                                    winningValue: 'education',
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
                                                                    winningValue: 'balanced',
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
                                                await createAgreementMutation.mutateAsync(demoData);
                                                window.location.reload();
                                            }}
                                            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-black rounded-full hover:-translate-y-0.5 transition-all shadow-ambient active:scale-95"
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
                <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 text-primary text-xs font-semibold uppercase tracking-wide">
                                <ShieldCheck size={14} />
                                {t('poster.verified_badge')}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold uppercase tracking-wide">
                                <PenTool size={14} />
                                {signatures?.length || 0} hafa skrifað undir
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight">
                            {t('title')}
                        </h1>
                        <p className="text-lg text-on-surface-variant font-medium max-w-lg leading-relaxed">
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
                                className="px-6 py-3 bg-surface-container-low rounded-full text-sm font-bold text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all"
                            >
                                Breyta / Endurnýja
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Signature CTA */}
            {!hasSigned && !isAdmin && (
                <div className="relative overflow-hidden bg-surface-container-lowest rounded-3xl shadow-ambient p-8">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary-container/15 flex items-center justify-center text-primary shadow-ambient">
                            <PenTool size={32} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-on-surface mb-2">Skrifa undir sáttmálann</h3>
                            <p className="text-on-surface-variant leading-relaxed font-medium">
                                {t('poster.signature_desc')}
                            </p>
                        </div>
                        <button
                            onClick={handleSign}
                            disabled={signMutation.isPending}
                            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 transition-all shadow-ambient active:scale-95 disabled:opacity-50"
                        >
                            {signMutation.isPending ? 'Vistar...' : t('poster.sign_button')}
                        </button>
                    </div>
                </div>
            )}

            {hasSigned && (
                <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-primary-container/15 text-primary shadow-ambient animate-in zoom-in duration-300">
                    <CheckCircle2 size={24} />
                    <span className="font-bold text-lg">{t('poster.signed_success')}</span>
                </div>
            )}

            <AgreementPoster agreement={agreement} signaturesCount={signatures?.length || 0} />

            {/* ITEM EDITOR MODAL */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-surface-container-lowest rounded-3xl shadow-ambient w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
                            <h3 className="font-bold text-on-surface">Breyta Spurningu</h3>
                            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Spurning</label>
                                <input
                                    type="text"
                                    value={editingItem.item.questionKey}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        item: { ...editingItem.item, questionKey: e.target.value }
                                    })}
                                    className="w-full p-3 bg-surface-container-high border-0 rounded-xl font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Valmöguleikar</label>
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
                                                className="flex-1 p-2 bg-surface-container-high border-0 rounded-lg text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newOptions = editingItem.item.options.filter((_, i) => i !== idx);
                                                    setEditingItem({
                                                        ...editingItem,
                                                        item: { ...editingItem.item, options: newOptions }
                                                    });
                                                }}
                                                className="p-2 text-error hover:bg-error-container/40 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const newOption = { value: Date.now().toString(), labelKey: '' };
                                            setEditingItem({
                                                ...editingItem,
                                                item: { ...editingItem.item, options: [...editingItem.item.options, newOption] }
                                            });
                                        }}
                                        className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1 mt-2"
                                    >
                                        <Plus size={14} /> Bæta við valmöguleika
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-between">
                            <button
                                onClick={() => handleDeleteItem(editingItem.sectionId, editingItem.item.id)}
                                className="px-4 py-2 text-error font-bold text-sm hover:bg-error-container/40 rounded-full transition-colors"
                            >
                                Eyða spurningu
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 text-on-surface-variant font-bold text-sm hover:bg-surface-container-high rounded-full transition-colors"
                                >
                                    Hætta við
                                </button>
                                <button
                                    onClick={() => handleSaveItem(editingItem.sectionId, editingItem.item)}
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-full hover:-translate-y-0.5 transition-all shadow-ambient"
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
                    <div className="bg-surface-container-lowest rounded-3xl shadow-ambient w-full max-w-md p-6 space-y-6">
                        <h3 className="text-xl font-bold text-on-surface">Breyta texta</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Titill</label>
                                <input
                                    type="text"
                                    value={editingSection.titleKey}
                                    onChange={(e) => setEditingSection({ ...editingSection, titleKey: e.target.value })}
                                    className="w-full p-3 bg-surface-container-high border-0 rounded-xl font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Lýsing</label>
                                <textarea
                                    value={editingSection.descriptionKey}
                                    onChange={(e) => setEditingSection({ ...editingSection, descriptionKey: e.target.value })}
                                    className="w-full p-3 bg-surface-container-high border-0 rounded-xl h-32 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-on-surface-variant font-bold hover:bg-surface-container-high rounded-full"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={() => handleSaveSection(editingSection.id, editingSection.titleKey, editingSection.descriptionKey)}
                                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-full hover:-translate-y-0.5 shadow-ambient transition-all"
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
        <div className="p-4 bg-surface-container-low rounded-2xl ghost-border">
            <h3 className="font-bold text-on-surface mb-1">{title}</h3>
            <p className="text-on-surface-variant text-sm">{desc}</p>
        </div>
    );
}
