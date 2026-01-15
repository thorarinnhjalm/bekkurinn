'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserClasses, useSchool, useLostItems, useCreateLostItem } from '@/hooks/useFirestore';
import { LostItemCard } from '@/components/cards/LostItemCard';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { Loader2, Plus, Search, Filter, Camera } from 'lucide-react';

export default function LostFoundPage() {
    const { user, loading: authLoading } = useAuth();

    // Get Context (Class/School)
    const { data: userClasses } = useUserClasses(user?.uid || '');
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
        if (!newItemTitle) return alert("Vantar titil!");

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
                        Óskilamunir & Tapað/Fundið
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Týnt & Fundið</h1>
                    <p className="text-xl text-gray-500 max-w-xl mt-2 leading-relaxed">
                        Hér getur þú leitað að týndum munum eða skráð hluti sem þú hefur fundið.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-premium flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    <Plus size={20} />
                    Skrá hlut
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
                    Allt
                </button>
                <button
                    onClick={() => setFilter('found')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${filter === 'found' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'}
                    `}
                >
                    🎒 Óskilamunir (Fundið)
                </button>
                <button
                    onClick={() => setFilter('lost')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
                        ${filter === 'lost' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-red-50'}
                    `}
                >
                    ❓ Tapað (Óskast)
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
                    <h3 className="text-lg font-bold text-gray-900">Ekkert hér!</h3>
                    <p className="text-gray-500">Engir munir skráðir í augnablikinu.</p>
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-900">Skrá nýjan hlut</h2>
                            <p className="text-gray-500 text-sm">Hvort er hluturinn týndur eða fundinn?</p>
                        </div>

                        {/* Type Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setNewItemType('lost')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${newItemType === 'lost' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                ❓ Ég týndi...
                            </button>
                            <button
                                onClick={() => setNewItemType('found')}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                    ${newItemType === 'found' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                🎒 Ég fann...
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mynd af hlut (Valfrjálst)</label>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hvað er þetta?</label>
                                <input
                                    type="text"
                                    value={newItemTitle}
                                    onChange={e => setNewItemTitle(e.target.value)}
                                    placeholder={newItemType === 'lost' ? "Dæmi: Rauður Nike skór" : "Dæmi: Blá úlpa (66°N)"}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nánari lýsing</label>
                                <textarea
                                    value={newItemDesc}
                                    onChange={e => setNewItemDesc(e.target.value)}
                                    placeholder="Stærð, merkingar, sérkenni..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none h-24 resize-none"
                                />
                            </div>

                            {newItemType === 'found' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hvar fannst hann?</label>
                                    <input
                                        type="text"
                                        value={newItemLocation}
                                        onChange={e => setNewItemLocation(e.target.value)}
                                        placeholder="Dæmi: Íþróttahúsi, ganginum, klefa..."
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
                                Hætta við
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gray-900 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Skrá hlut
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
