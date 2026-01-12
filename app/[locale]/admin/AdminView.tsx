'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, School as SchoolIcon, Users, Shield, Copy, ChevronDown, ChevronRight, GraduationCap, Plus, Save, Search, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSchool, getAllSchools, updateSchoolAdmins, getUser, searchUsersByEmail } from '@/services/firestore';
import type { School, User } from '@/types';

const SUPER_ADMINS = [
    'thorarinnhjalmarsson@gmail.com'
];

interface ClassData {
    id: string;
    schoolName: string;
    name: string;
    grade: number;
    section?: string;
    joinCode?: string;
    admins: string[];
}

export default function AdminView() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Core Data
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [schools, setSchools] = useState<School[]>([]);

    // UI State
    const [isFetching, setIsFetching] = useState(true);
    const [activeTab, setActiveTab] = useState<'classes' | 'schools'>('schools');
    const [expandedSchools, setExpandedSchools] = useState<string[]>([]);

    // Create School State
    const [newSchoolId, setNewSchoolId] = useState('');
    const [newSchoolName, setNewSchoolName] = useState('');
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);

    // Add Admin State (Modified for Search)
    const [adminSearch, setAdminSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null); // Which school are we adding to?

    useEffect(() => {
        if (!loading && user) {
            // Check auth (simplified for client-side, real check in rules)
            fetchData();
        }
    }, [user, loading]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (adminSearch.length > 2) {
                const results = await searchUsersByEmail(adminSearch.toLowerCase());
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [adminSearch]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            // Fetch Classes
            const q = query(collection(db, 'classes'), orderBy('schoolName'));
            const snapshot = await getDocs(q);
            const classData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
            setClasses(classData);

            // Fetch Schools
            const schoolData = await getAllSchools();
            setSchools(schoolData);

        } catch (error) {
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    // Group classes by school name for the "Classes" view
    const classesBySchool = classes.reduce((acc, cls) => {
        const school = cls.schoolName || 'Óþekktur skóli';
        if (!acc[school]) acc[school] = [];
        acc[school].push(cls);
        return acc;
    }, {} as Record<string, ClassData[]>);

    const toggleSchool = (schoolName: string) => {
        setExpandedSchools(prev =>
            prev.includes(schoolName) ? prev.filter(s => s !== schoolName) : [...prev, schoolName]
        );
    };

    const handleCreateSchool = async () => {
        if (!newSchoolId || !newSchoolName) return;
        try {
            await createSchool(newSchoolId, newSchoolName);
            setNewSchoolId('');
            setNewSchoolName('');
            setIsCreatingSchool(false);
            fetchData(); // Refresh
        } catch (e) {
            alert('Gat ekki búið til skóla');
        }
    };

    const handleAddAdmin = async (userId: string) => {
        if (!selectedSchoolId) return;
        try {
            const school = schools.find(s => s.id === selectedSchoolId);
            if (!school) return;

            const newAdmins = [...school.admins, userId];
            await updateSchoolAdmins(selectedSchoolId, newAdmins);

            setSelectedSchoolId(null);
            setAdminSearch('');
            setSearchResults([]);
            fetchData(); // Refresh
        } catch (e) {
            alert('Villa við að bæta við stjórnanda');
        }
    };

    if (loading || isFetching) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-nordic-blue" /></div>;

    if (!user || (!SUPER_ADMINS.includes(user.email || ''))) {
        return (
            <div className="p-8 text-center text-red-600">
                <Shield className="mx-auto mb-4" size={48} />
                <h1 className="text-2xl font-bold">Aðgangur bannaður</h1>
                <p>Þú hefur ekki réttindi til að skoða þessa síðu ({user?.email}).</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20 space-y-12 animate-in fade-in duration-800">
            {/* Header / Hero Section (Copied Style from Dashboard) */}
            <header className="relative isolate overflow-hidden">
                {/* Blurry blobs */}
                <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl opacity-30" aria-hidden="true">
                    <div className="aspect-[1155/678] w-[60rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>

                <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur border border-white/30 text-xs font-bold text-gray-800 uppercase tracking-wide">
                            <Shield size={12} className="text-gray-800" />
                            Admin Console
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
                            Stjórnborð
                        </h1>
                        <p className="text-lg text-gray-600 font-medium max-w-lg">
                            Yfirlit yfir skóla, bekki og notendur. Hér er hjarta kerfisins.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/is/dashboard')}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur border border-white/50 text-gray-700 px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg font-bold"
                    >
                        <Users size={20} />
                        Fara í mitt Mælaborð
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('schools')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'schools' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Skólar (Foreldrafélög)
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'classes' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Bekkir
                    </button>
                </div>
            </div>

            {/* CONTENT: SCHOOLS */}
            {activeTab === 'schools' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">

                    {/* Actions Bar */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsCreatingSchool(!isCreatingSchool)}
                            className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                        >
                            {isCreatingSchool ? <X size={20} /> : <Plus size={20} />}
                            {isCreatingSchool ? 'Hætta við' : 'Stofna nýjan skóla'}
                        </button>
                    </div>

                    {/* Create School Form */}
                    {isCreatingSchool && (
                        <div className="glass-card p-8 animate-in zoom-in-95 duration-300 border-2 border-blue-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Stofna nýjan skóla</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Auðkenni (ID)</label>
                                    <input
                                        type="text"
                                        value={newSchoolId}
                                        onChange={e => setNewSchoolId(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        placeholder="e.g. grandaskoli"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Engin bil, engir íslenskir stafir. verður hluti af slóð.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Heiti skóla</label>
                                    <input
                                        type="text"
                                        value={newSchoolName}
                                        onChange={e => setNewSchoolName(e.target.value)}
                                        placeholder="e.g. Grandaskóli"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCreateSchool}
                                    disabled={!newSchoolId || !newSchoolName}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Stofna skóla
                                </button>
                            </div>
                        </div>
                    )}

                    {/* School List */}
                    <div className="grid gap-6">
                        {schools.map(school => (
                            <div key={school.id} className="glass-card p-0 overflow-hidden group hover:border-blue-200 transition-all">
                                <div className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-blue-700 shadow-inner">
                                                <GraduationCap size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{school.name}</h3>
                                                <code className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{school.id}</code>
                                            </div>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {school.admins.slice(0, 3).map((uid, i) => (
                                                <div key={i} title={uid} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {uid.substring(0, 2)}
                                                </div>
                                            ))}
                                            {school.admins.length > 3 && (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                    +{school.admins.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Management Section (Light Gray Background) */}
                                <div className="bg-gray-50/80 p-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                            <Shield size={14} /> Stjórnendur ({school.admins.length})
                                        </h4>
                                        {selectedSchoolId === school.id ? (
                                            <button onClick={() => setSelectedSchoolId(null)} className="text-sm font-bold text-gray-400 hover:text-gray-600">Loka</button>
                                        ) : (
                                            <button onClick={() => setSelectedSchoolId(school.id)} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                <SchoolIcon size={14} /> Bæta við stjórnanda
                                            </button>
                                        )}
                                    </div>

                                    {selectedSchoolId === school.id && (
                                        <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Leita eftir netfangi..."
                                                    value={adminSearch}
                                                    onChange={e => setAdminSearch(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    autoFocus
                                                />
                                            </div>

                                            {searchResults.length > 0 && (
                                                <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                                    {searchResults.map(u => (
                                                        <button
                                                            key={u.uid}
                                                            onClick={() => handleAddAdmin(u.uid)}
                                                            className="w-full p-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                                                        >
                                                            <div>
                                                                <p className="font-bold text-gray-900">{u.displayName}</p>
                                                                <p className="text-xs text-gray-500">{u.email}</p>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Plus size={16} />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {school.admins.map((uid, i) => (
                                            <div key={i} className="bg-white border text-gray-600 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                {uid}
                                                {/* In future: Remove button */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CONTENT: CLASSES */}
            {activeTab === 'classes' && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 max-w-5xl mx-auto">
                    {Object.entries(classesBySchool).map(([schoolName, schoolClasses]) => {
                        const isExpanded = expandedSchools.includes(schoolName);
                        return (
                            <div key={schoolName} className="glass-card overflow-hidden transition-all">
                                <button
                                    onClick={() => toggleSchool(schoolName)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <SchoolIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{schoolName}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{schoolClasses.length} bekkir skráðir</p>
                                        </div>
                                    </div>
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="text-gray-400" />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-gray-100 divide-y divide-gray-100">
                                        {schoolClasses.map(cls => (
                                            <div key={cls.id} className="p-6 hover:bg-gray-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{cls.name}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{cls.grade}. bekkur</span>
                                                        <span>• {cls.admins.length} stjórnendur</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase">Kóði:</span>
                                                        <code className="text-blue-600 font-bold font-mono text-lg">{cls.joinCode || '---'}</code>
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(cls.joinCode || ''); alert('Afritað!') }}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Copy size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
