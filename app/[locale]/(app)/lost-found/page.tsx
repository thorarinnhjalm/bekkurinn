'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserClasses, useSchool, useLostItems, useCreateLostItem } from '@/hooks/useFirestore';
import { LostItemCard } from '@/components/cards/LostItemCard';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { Loader2, Plus, Search, Filter, Camera } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LostFoundPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter(); // Added missing router import if not present, checking imports... it was present.
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
    const [newItemImage, setNewItemImage] = useState(''); // URL from uploader

    // Permissions
    const isAdmin = activeClass?.role === 'admin';
    // Admins can post "Found" items (School scope). Parents usually post "Lost" items (Class scope).
    // Actually, let's allow anyone to post anything, but default logic suggests admins handle "Found" pile.

    // Redirect
    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
        return null;
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-nordic-blue">
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
            // Scope logic: Found items are usually school-wide. Lost items are class-wide (usually).
            // Let's simplify and make everything School-wide for visibility, but tag appropriately.
            classId: activeClassId,
            schoolId: activeClass?.schoolId || '',
            scope: newItemType === 'found' ? 'school' : 'class',
            isClaimed: false,
            createdBy: user?.uid || '',
            author: user?.displayName || 'Notandi',
            createdAt: new Date(), // Hook handles serverTimestamp
        } as any);

        setIsCreating(false);
        // Reset form
        setNewItemTitle(''); setNewItemDesc(''); setNewItemLocation(''); setNewItemImage('');
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">
                        <Camera size={12} />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-xl text-gray-500 max-w-xl mt-2 leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-premium flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    <Plus size={20} />
                    {t('register_item')}
                </button>
            </header>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                        ${filter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}
                    `}
                >
                    {t('filter_all')}
                </button>
                <button
                    onClick={() => setFilter('found')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${filter === 'found' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'}
                    `}
                >
                    {t('filter_found')}
                </button>
                <button
                    onClick={() => setFilter('lost')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${filter === 'lost' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-red-50'}
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
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{t('empty_title')}</h3>
                    <p className="text-gray-500">{t('empty_desc')}</p>
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-900">{t('modal_title')}</h2>
                            <p className="text-gray-500 text-sm">{t('modal_subtitle')}</p>
                        </div>

                        {/* Type Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setNewItemType('lost')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${newItemType === 'lost' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                {t('type_lost')}
                            </button>
                            <button
                                onClick={() => setNewItemType('found')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${newItemType === 'found' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                {t('type_found')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('label_image')}</label>
                                <div className="h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative group">
                                    <ImageUploader
                                        onUploadComplete={(url) => setNewItemImage(url)}
                                        currentImageUrl={newItemImage}
                                        storagePath={`lost-found/${activeClassId}`}
                                    />
                                    {/* Overlay hint if needed, handled by ImageUploader usually */}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('label_title')}</label>
                                <input
                                    type="text"
                                    value={newItemTitle}
                                    onChange={e => setNewItemTitle(e.target.value)}
                                    placeholder={newItemType === 'lost' ? t('placeholder_title_lost') : t('placeholder_title_found')}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('label_desc')}</label>
                                <textarea
                                    value={newItemDesc}
                                    onChange={e => setNewItemDesc(e.target.value)}
                                    placeholder={t('placeholder_desc')}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none h-24 resize-none"
                                />
                            </div>

                            {newItemType === 'found' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('label_location')}</label>
                                    <input
                                        type="text"
                                        value={newItemLocation}
                                        onChange={e => setNewItemLocation(e.target.value)}
                                        placeholder={t('placeholder_location')}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gray-900 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
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
