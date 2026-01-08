'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { Loader2, Save, User, Globe, Phone } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

type UserLanguage = 'is' | 'en' | 'pl';

export default function UserSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        language: 'is' as UserLanguage,
        photoURL: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/is/login');
            return;
        }

        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phone: (user as any).phone || '',
                language: ((user as any).language as UserLanguage) || 'is',
                photoURL: user.photoURL || ''
            });
        }
    }, [user, authLoading, router]);

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: formData.displayName,
                phone: formData.phone,
                language: formData.language,
                photoURL: formData.photoURL
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Villa kom upp við að vista');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex justify-center pt-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24 pt-8">
            <header className="border-b border-gray-200 pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mínar stillingar</h1>
                    <p className="text-gray-500">Breyttu persónulegum upplýsingum</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Vista
                </button>
            </header>

            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    ✅ Stillingar vistaðar!
                </div>
            )}

            {/* Profile Photo */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <User className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Prófílmynd</h2>
                </div>

                <ImageUploader
                    currentImageUrl={formData.photoURL}
                    onUploadComplete={(url) => setFormData({ ...formData, photoURL: url })}
                    storagePath={`users/${user.uid}/profile`}
                    label="Prófílmynd"
                />
            </section>

            {/* Basic Info */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <User className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Grunnupplýsingar</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nafn</label>
                    <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Fullt nafn"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Netfang</label>
                    <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ekki hægt að breyta netfangi</p>
                </div>
            </section>

            {/* Contact Info */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Phone className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Samskiptaupplýsingar</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Símanúmer</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="777-8888"
                    />
                </div>
            </section>

            {/* Language */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Globe className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Tungumál</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Viðmótstungumál</label>
                    <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value as UserLanguage })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    >
                        <option value="is">Íslenska</option>
                        <option value="en">English</option>
                        <option value="pl">Polski</option>
                    </select>
                </div>
            </section>
        </div>
    );
}
