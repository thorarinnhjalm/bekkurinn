'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserClasses, useSchool, useLostItems, useCreateLostItem } from '@/hooks/useFirestore';
import { LostItemCard } from '@/components/cards/LostItemCard';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { Loader2, Plus, Search, Camera } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LostFoundPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('lost_found');

    // Get Context (Class/School)
    const { data: userClasses } = useUserClasses(user?.uid || '', user?.email);
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const { data: school } = useSchool(activeClass?.schoolId);

    // Queries
    const { data: lostItems, isLoading } = useLostItems(activeClass?.schoolId || '', activeClassId);
    const createMutation = useCreateLostItem();

    // State
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newItemType, setNewItemType] = useState<'lost' | 'found'>('lost');
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemLocation, setNewItemLocation] = useState('');
    const [newItemImage, setNewItemImage] = useState('');

    const isAdmin = activeClass?.role === 'admin';

    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
        return null;
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-primary">
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    const filteredItems = (lostItems || []).filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    const handleCreate = async () => {
        if (!newItemTitle) return alert(t('missing_title'));

        await createMutation.mutateAsync({
            title: newItemTitle,
            description: newItemDesc,
            location: newItemLocation,
            imageUrl: newItemImage,
            type: newItemType,
            classId: activeClassId,
            schoolId: activeClass?.schoolId || '',
            scope: newItemType === 'found' ? 'school' : 'class',
            isClaimed: false,
            createdBy: user?.uid || '',
            author: user?.displayName || 'Notandi',
            createdAt: new Date(),
        } as any);

        setIsCreating(false);
        setNewItemTitle(''); setNewItemDesc(''); setNewItemLocation(''); setNewItemImage('');
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wide mb-3">
                        <Camera size={12} />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">{t('title')}</h1>
                    <p className="text-xl text-on-surface-variant max-w-xl mt-2 leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-on-primary shadow-ambient bg-linear-to-r from-primary to-primary-container hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={20} />
                    {t('register_item')}
                </button>
            </header>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                        ${filter === 'all' ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface ghost-border'}
                    `}
                >
                    {t('filter_all')}
                </button>
                <button
                    onClick={() => setFilter('found')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${filter === 'found' ? 'bg-secondary-container text-on-secondary-container shadow-ambient' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface ghost-border'}
                    `}
                >
                    {t('filter_found')}
                </button>
                <button
                    onClick={() => setFilter('lost')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${filter === 'lost' ? 'bg-error-container text-on-error-container shadow-ambient' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface ghost-border'}
                    `}
                >
                    {t('filter_lost')}
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredItems.map((item) => (
                    <LostItemCard
                        key={item.id}
                        item={item}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-surface-container-lowest rounded-3xl shadow-ambient">
                    <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface">{t('empty_title')}</h3>
                    <p className="text-on-surface-variant">{t('empty_desc')}</p>
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-ambient scale-100 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-on-surface">{t('modal_title')}</h2>
                            <p className="text-on-surface-variant text-sm">{t('modal_subtitle')}</p>
                        </div>

                        {/* Type Toggle */}
                        <div className="flex bg-surface-container-low p-1 rounded-xl">
                            <button
                                onClick={() => setNewItemType('lost')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${newItemType === 'lost' ? 'bg-surface-container-lowest text-error shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}
                                `}
                            >
                                {t('type_lost')}
                            </button>
                            <button
                                onClick={() => setNewItemType('found')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${newItemType === 'found' ? 'bg-surface-container-lowest text-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}
                                `}
                            >
                                {t('type_found')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">{t('label_image')}</label>
                                <div className="h-40 bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant/50 overflow-hidden relative group">
                                    <ImageUploader
                                        onUploadComplete={(url) => setNewItemImage(url)}
                                        currentImageUrl={newItemImage}
                                        storagePath={`lost-found/${activeClassId}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">{t('label_title')}</label>
                                <input
                                    type="text"
                                    value={newItemTitle}
                                    onChange={e => setNewItemTitle(e.target.value)}
                                    placeholder={newItemType === 'lost' ? t('placeholder_title_lost') : t('placeholder_title_found')}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-bold text-on-surface"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">{t('label_desc')}</label>
                                <textarea
                                    value={newItemDesc}
                                    onChange={e => setNewItemDesc(e.target.value)}
                                    placeholder={t('placeholder_desc')}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none h-24 resize-none text-on-surface"
                                />
                            </div>

                            {newItemType === 'found' && (
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">{t('label_location')}</label>
                                    <input
                                        type="text"
                                        value={newItemLocation}
                                        onChange={e => setNewItemLocation(e.target.value)}
                                        placeholder={t('placeholder_location')}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none text-on-surface"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-linear-to-r from-primary to-primary-container shadow-ambient hover:-translate-y-0.5 transition-all"
                            >
                                {t('submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
