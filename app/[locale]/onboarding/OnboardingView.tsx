'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClass } from '@/services/firestore'; // Assuming these exist or I'll create them
import { SCHOOLS } from '@/constants/schools';
import { Users, School, ArrowRight, Loader2, Plus, QrCode, Check } from 'lucide-react';
import { doc, getFirestore, updateDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Temporary local implementations until moved to services
async function createClassLocal(data: any, userId: string) {
    // Generate simple join code: First 4 chars of school + grade + section
    // e.g. SALA-4-H or SALA-4
    const schoolPrefix = data.schoolName.substring(0, 4).toUpperCase();
    const sectionSuffix = data.section ? `-${data.section.toUpperCase().substring(0, 1)}` : '';
    const baseCode = `${schoolPrefix}-${data.grade}${sectionSuffix}`;
    // Add random suffix to ensure uniqueness
    const uniqueCode = `${baseCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    const classRef = await addDoc(collection(db, 'classes'), {
        ...data,
        section: data.section || null, // Ensure section is null not undefined
        joinCode: uniqueCode,
        admins: [userId],
        createdAt: serverTimestamp(),
        confidentialityAgreedAt: serverTimestamp(), // Auto-agree for creator ?? TBD
    });

    // Add creator as admin/parent link? Usually handled separately, 
    // but for MVP creator just gets access via 'admins' array.

    // Update USER profile with this classId? 
    // For now we rely on the user being in the 'admins' array.

    return classRef.id;
}

export default function OnboardingView() {
    const { user } = useAuth();
    const router = useRouter();

    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create Form State
    const [formData, setFormData] = useState({
        schoolName: '',
        grade: 1,
        isSplit: true, // Default to split classes (A, B, etc.)
        section: ''
    });

    // Join Form State
    const [joinCode, setJoinCode] = useState('');

    const handleCreate = async () => {
        if (!user) return;
        if (!formData.schoolName) { setError('Veldu skóla'); return; }
        if (formData.isSplit && !formData.section) { setError('Skráðu deild (t.d. A eða Hlíð)'); return; }

        setLoading(true);
        setError(null);

        try {
            // Find Calendar URL
            const schoolObj = SCHOOLS.find(s => s.name === formData.schoolName);
            const calendarUrl = schoolObj?.icsUrl;

            const displayName = formData.isSplit
                ? `${formData.grade}. Bekkur ${formData.section} - ${formData.schoolName}`
                : `${formData.grade}. Bekkur (Árgangur) - ${formData.schoolName}`;

            const classId = await createClassLocal({
                name: displayName,
                schoolName: formData.schoolName,
                grade: Number(formData.grade),
                section: formData.isSplit ? formData.section : null,
                calendarUrl
            }, user.uid);

            // Redirect
            router.push('/is/dashboard?welcome=true');
        } catch (err: any) {
            console.error(err);
            setError('Gat ekki stofnað bekk. Reyndu aftur.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        alert('Virkni til að ganga í bekk er í vinnslu! (Notaðu Stofna bekk í bili)');
        // Implement join logic later
    };

    if (mode === 'select') {
        return (
            <div className="min-h-screen bg-stone-50 p-4 flex flex-col items-center justify-center space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-nordic-blue-dark">Velkomin í Bekkinn!</h1>
                    <p className="text-text-secondary">Hvernig viltu byrja?</p>
                </div>

                <div className="grid gap-4 w-full max-w-md">
                    <button
                        onClick={() => setMode('join')}
                        className="nordic-card p-6 flex items-center gap-4 hover:border-nordic-blue transition-all group text-left"
                    >
                        <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                            <Users className="text-nordic-blue" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Ganga í bekk</h3>
                            <p className="text-sm text-text-secondary">Ég er með boðskóða frá fulltrúa</p>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-nordic-blue" />
                    </button>

                    <button
                        onClick={() => setMode('create')}
                        className="nordic-card p-6 flex items-center gap-4 hover:border-amber-400 transition-all group text-left border-2 border-transparent"
                    >
                        <div className="bg-amber-50 p-3 rounded-full group-hover:bg-amber-100 transition-colors">
                            <Plus className="text-amber-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Stofna nýjan bekk</h3>
                            <p className="text-sm text-text-secondary">Ég er bekkjarfulltrúi</p>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'create') {
        return (
            <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    <header>
                        <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
                            ← Til baka
                        </button>
                        <h1 className="text-2xl font-bold text-nordic-blue-dark">Stofna nýjan bekk</h1>
                        <p className="text-text-secondary">Fylltu út grunnupplýsingar</p>
                    </header>

                    <div className="space-y-4">
                        {/* School */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skóli (í Kópavogi)</label>
                            <select
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-900"
                            >
                                <option value="">Veldu skóla...</option>
                                {SCHOOLS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Grade */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Árgangur</label>
                            <div className="flex flex-wrap gap-3 justify-center py-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setFormData({ ...formData, grade: g })}
                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border
                                            ${formData.grade === g
                                                ? 'bg-blue-900 text-white border-blue-900 scale-110 shadow-md'
                                                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Structure Type */}
                        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                            <label className="block text-sm font-medium text-nordic-blue-dark">Hvernig er árganginum skipt?</label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-md border cursor-pointer hover:border-blue-300">
                                <input
                                    type="radio"
                                    checked={!formData.isSplit}
                                    onChange={() => setFormData({ ...formData, isSplit: false })}
                                    name="structure"
                                    className="w-4 h-4 text-nordic-blue"
                                />
                                <div>
                                    <span className="font-semibold block text-sm">Heill árgangur saman</span>
                                    <span className="text-xs text-gray-500">Engin sérstök deildaskipting (Allur 4. bekkur)</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-md border cursor-pointer hover:border-blue-300">
                                <input
                                    type="radio"
                                    checked={formData.isSplit}
                                    onChange={() => setFormData({ ...formData, isSplit: true })}
                                    name="structure"
                                    className="w-4 h-4 text-nordic-blue"
                                />
                                <div>
                                    <span className="font-semibold block text-sm">Skipt í bekki/deildir</span>
                                    <span className="text-xs text-gray-500">T.d. 4. bekkur A, 4. bekkur B...</span>
                                </div>
                            </label>
                        </div>

                        {/* Section Input (Only if split) */}
                        {formData.isSplit && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nafn deildar/bekkjar</label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    placeholder="t.d. A, B, Hlíð, Melar..."
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                                    autoFocus
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all transform active:scale-95 shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" />}
                            <span>Stofna Bekk</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'join') {
        return (
            <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-6">
                    <button onClick={() => setMode('select')} className="absolute top-4 left-4 text-gray-400">← Til baka</button>
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="text-nordic-blue" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Sláðu inn boðskóða</h2>
                    <p className="text-gray-500">
                        Sláðu inn kóðann sem bekkjarfulltrúinn sendi þér.<br />
                        (Virknin er í vinnslu - hafðu samband við stjórnanda)
                    </p>

                    <input disabled type="text" placeholder="XXXX-XXXX" className="w-full text-center text-2xl tracking-widest p-4 border rounded-xl bg-gray-50" />

                    <button disabled className="w-full bg-gray-300 text-white py-3 rounded-xl font-bold cursor-not-allowed">Ganga í bekk</button>
                </div>
            </div>
        )
    }

    return null;
}

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
