'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, School as SchoolIcon, Users, Shield, Copy, ChevronDown, ChevronRight, GraduationCap, Plus, Save, Search, Check, X, Calendar, Trash2, Megaphone } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { createSchool, getAllSchools, updateSchoolAdmins, getUser, searchUsersByEmail, createTask, migrateClassToSchool, deleteTask } from '@/services/firestore';
import { getAllUsers, searchUsers, getUserClasses, getAllPendingParentLinks, getSystemStats, type SystemStats, deleteSchool } from '@/services/admin';
import { useSchoolTasks } from '@/hooks/useFirestore';
import type { School, User, Task, ParentLink } from '@/types';
import { Timestamp } from 'firebase/firestore';
import DashboardTab from './components/DashboardTab';
import UsersTab from './components/UsersTab';
import ApprovalsTab from './components/ApprovalsTab';
import TestimonialsTab from './components/TestimonialsTab';



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
    const params = useParams();

    // Core Data
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [schools, setSchools] = useState<School[]>([]);

    // UI State
    const [isFetching, setIsFetching] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'schools' | 'classes' | 'approvals' | 'testimonials'>('dashboard');
    const [expandedSchools, setExpandedSchools] = useState<string[]>([]);

    // Create School State
    const [newSchoolId, setNewSchoolId] = useState('');
    const [newSchoolName, setNewSchoolName] = useState('');
    const [newSchoolIcs, setNewSchoolIcs] = useState('');
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');

    // Dashboard State
    const [stats, setStats] = useState<SystemStats | null>(null);

    // Approvals State
    const [pendingLinks, setPendingLinks] = useState<ParentLink[]>([]);

    useEffect(() => {
        if (!loading && user) {
            fetchData();
        }
    }, [user, loading]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            // Fetch Classes
            // Fetch Classes (without orderBy to include those with missing schoolName)
            const q = query(collection(db, 'classes'));
            const snapshot = await getDocs(q);
            const classData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));

            // Sort manually
            classData.sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || ''));

            setClasses(classData);

            // Fetch Schools
            const allSchools = await getAllSchools();

            const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
            const isSuperAdmin = user && adminEmails.includes(user.email || '');



            if (isSuperAdmin) {
                setSchools(allSchools);

                // Fetch additional admin data
                const [usersData, statsData, pendingLinksData] = await Promise.all([
                    getAllUsers(100),
                    getSystemStats(),
                    getAllPendingParentLinks()
                ]);

                setUsers(usersData);
                setStats(statsData);
                setPendingLinks(pendingLinksData);
            } else {
                // Filter schools where user is admin
                const mySchools = allSchools.filter(s => s.admins.includes(user?.uid || ''));
                setSchools(mySchools);

                // Ensure we don't leave stale super admin data if we switch accounts (edge case)
                setUsers([]);
                setStats(null);
                setPendingLinks([]);
            }

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
            await createSchool(newSchoolId, newSchoolName, newSchoolIcs);
            setNewSchoolId('');
            setNewSchoolName('');
            setNewSchoolIcs('');
            setIsCreatingSchool(false);
            fetchData(); // Refresh
        } catch (e) {
            alert('Gat ekki búið til skóla');
        }
    };

    if (loading || isFetching) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;

    const isSuperAdmin = user && (
        process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()).includes(user.email || '')
        // Fallback for development if env is missing? No, secure by default.
    );

    // Access Check (After Fetching)
    if (!isFetching && !loading) {
        if (!isSuperAdmin && schools.length === 0) {
            return (
                <div className="p-8 text-center text-error">
                    <Shield className="mx-auto mb-4" size={48} />
                    <h1 className="text-2xl font-bold">Aðgangur bannaður</h1>
                    <p>Þú hefur ekki réttindi til að skoða þessa síðu ({user?.email}).</p>
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen pb-20 space-y-12 animate-in fade-in duration-800">

            {/* DEBUGGER */}

            {/* Header / Hero Section (Copied Style from Dashboard) */}
            <header className="relative isolate overflow-hidden">
                {/* Blurry blobs */}
                <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl opacity-30" aria-hidden="true">
                    <div className="aspect-[1155/678] w-[60rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>

                <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/50 backdrop-blur border border-white/30 text-xs font-bold text-on-surface uppercase tracking-wide">
                            <Shield size={12} className="text-on-surface" />
                            Admin Console
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface">
                            Stjórnborð
                        </h1>
                        <p className="text-lg text-on-surface-variant font-medium max-w-lg">
                            Yfirlit yfir skóla, bekki og notendur. Hér er hjarta kerfisins.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push(`/${params.locale || 'is'}/dashboard`)}
                        className="flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur border border-white/50 text-on-surface px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg font-bold"
                    >
                        <Users size={20} />
                        Fara í mitt Mælaborð
                    </button>
                </div>
            </header>


            {/* Navigation Tabs */}
            <div className="flex justify-center overflow-x-auto pb-2">
                <div className="inline-flex bg-surface-container-high p-1 rounded-2xl gap-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-surface-container-lowest shadow-md text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-surface-container-lowest shadow-md text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        👥 Notendur
                    </button>
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap relative ${activeTab === 'approvals' ? 'bg-surface-container-lowest shadow-md text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        ✅ Samþykktir
                        {pendingLinks.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-tertiary-fixed/400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {pendingLinks.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('schools')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'schools' ? 'bg-surface-container-lowest shadow-md text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        🏫 Skólar
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'classes' ? 'bg-surface-container-lowest shadow-md text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        📚 Bekkir
                    </button>
                    <button
                        onClick={() => setActiveTab('testimonials')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'testimonials' ? 'bg-surface-container-lowest shadow-md text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        ⭐ Umsagnir
                    </button>
                </div>
            </div>

            {/* CONTENT: DASHBOARD */}
            {activeTab === 'dashboard' && (
                <DashboardTab
                    stats={stats}
                    pendingCount={pendingLinks.length}
                    onNavigate={(tab) => setActiveTab(tab as 'dashboard' | 'users' | 'approvals' | 'schools' | 'classes')}
                />
            )}

            {/* CONTENT: USERS */}
            {activeTab === 'users' && (
                <UsersTab initialUsers={users} />
            )}

            {/* CONTENT: APPROVALS */}
            {activeTab === 'approvals' && (
                <ApprovalsTab
                    initialPendingLinks={pendingLinks}
                    onRefresh={fetchData}
                />
            )}

            {/* CONTENT: SCHOOLS */}
            {activeTab === 'schools' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">

                    {/* Actions Bar - SUPER ADMIN ONLY */}
                    {isSuperAdmin && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsCreatingSchool(!isCreatingSchool)}
                                className="bg-on-surface text-white px-6 py-3 rounded-2xl font-bold hover:bg-on-surface/90 transition-all flex items-center gap-2 shadow-lg"
                            >
                                {isCreatingSchool ? <X size={20} /> : <Plus size={20} />}
                                {isCreatingSchool ? 'Hætta við' : 'Stofna nýjan skóla'}
                            </button>
                        </div>
                    )}

                    {/* Create School Form */}
                    {isCreatingSchool && (
                        <div className="glass-card p-8 animate-in zoom-in-95 duration-300 border-2 border-primary/20">
                            <h3 className="text-2xl font-bold text-on-surface mb-6">Stofna nýjan skóla</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Auðkenni (ID)</label>
                                    <input
                                        type="text"
                                        value={newSchoolId}
                                        onChange={e => setNewSchoolId(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        placeholder="e.g. grandaskoli"
                                        className="w-full p-4 bg-surface rounded-xl border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all font-mono"
                                    />
                                    <p className="text-xs text-on-surface-variant mt-2">Engin bil, engir íslenskir stafir. verður hluti af slóð.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Heiti skóla</label>
                                    <input
                                        type="text"
                                        value={newSchoolName}
                                        onChange={e => setNewSchoolName(e.target.value)}
                                        placeholder="e.g. Grandaskóli"
                                        className="w-full p-4 bg-surface rounded-xl border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Dagatal (ICS Slóð) - Valfrjálst</label>
                                    <input
                                        type="text"
                                        value={newSchoolIcs}
                                        onChange={e => setNewSchoolIcs(e.target.value)}
                                        placeholder="https://example.com/calendar.ics"
                                        className="w-full p-4 bg-surface rounded-xl border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-sm"
                                    />
                                    <p className="text-xs text-primary mt-2">💡 Ef þú setur inn slóð mun kerfið sjálfkrafa fylgjast með starfsdögum og fríum.</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCreateSchool}
                                    disabled={!newSchoolId || !newSchoolName}
                                    className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Stofna skóla
                                </button>
                            </div>
                        </div>
                    )}

                    {/* School List */}
                    <div className="grid gap-6">
                        {schools.map(school => (
                            <SchoolCard key={school.id} school={school} refreshData={fetchData} />
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
                                    className="w-full flex items-center justify-between p-6 hover:bg-surface/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center text-primary">
                                            <SchoolIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-on-surface">{schoolName}</h3>
                                            <p className="text-sm text-on-surface-variant font-medium">{schoolClasses.length} bekkir skráðir</p>
                                        </div>
                                    </div>
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="text-on-surface-variant" />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-outline-variant/30 divide-y divide-outline-variant/30">
                                        {schoolClasses.map(cls => (
                                            <div key={cls.id} className="p-6 hover:bg-surface/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="font-bold text-on-surface">{cls.name}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-1">
                                                        <span className="bg-surface-container-high px-2 py-0.5 rounded text-xs font-bold">{cls.grade}. bekkur</span>
                                                        <span>• {cls.admins.length} stjórnendur</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="bg-surface px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-3">
                                                        <span className="text-xs font-bold text-on-surface-variant uppercase">Kóði:</span>
                                                        <code className="text-primary font-bold font-mono text-lg">{cls.joinCode || '---'}</code>
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(cls.joinCode || ''); alert('Afritað!') }}
                                                            className="text-on-surface-variant hover:text-primary transition-colors"
                                                        >
                                                            <Copy size={16} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`Ertu viss um að þú viljir eyða bekk "${cls.name}"?\n\n⚠️ VIÐVÖRUN: Þetta er ÓAFTURKRÆFT!`)) return;
                                                            try {
                                                                const { deleteClass } = await import('@/services/admin');
                                                                await deleteClass(cls.id);
                                                                fetchData();
                                                            } catch (error) {
                                                                alert('Villa við að eyða bekk');
                                                            }
                                                        }}
                                                        className="bg-error text-white px-3 py-2 rounded-lg font-bold hover:bg-error/90 transition-all inline-flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} />
                                                        Eyða
                                                    </button>
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

            {/* CONTENT: TESTIMONIALS */}
            {activeTab === 'testimonials' && (
                <TestimonialsTab />
            )}
        </div>
    );
}

function SchoolCard({ school, refreshData }: { school: School; refreshData: () => void }) {
    const { data: schoolTasks } = useSchoolTasks(school.id);
    const [adminSearch, setAdminSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);

    // Event State
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');

    // Admin Search Debounce
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

    const handleAddAdmin = async (userId: string) => {
        try {
            const newAdmins = [...school.admins, userId];
            await updateSchoolAdmins(school.id, newAdmins);
            setIsAddingAdmin(false);
            setAdminSearch('');
            setSearchResults([]);
            refreshData();
        } catch (e) {
            alert('Villa við að bæta við stjórnanda');
        }
    };

    const handleCreateEvent = async () => {
        if (!newEventTitle || !newEventDate) return;
        try {
            await createTask({
                type: 'school_event',
                title: newEventTitle,
                date: Timestamp.fromDate(new Date(newEventDate)),
                slotsTotal: 0,
                createdBy: 'admin-console',
                scope: 'school',
                schoolId: school.id
            });
            setNewEventTitle('');
            setNewEventDate('');
            setIsCreatingEvent(false);
            // Tasks auto-refresh via React Query cache invalidation usually, but we might need to wait?
            // useSchoolTasks uses caching. useCreateTask invalidates 'tasks'.
            // Since we are using manual createTask from service here (not hook), we must rely on refetch or query invalidation.
            // But AdminView doesn't use query client directly? 
            // Ideally we should use the hook `useCreateTask` but we are not in a hook context that allows easy access without passing query client?
            // Actually, `useSchoolTasks` will NOT auto-update if we don't invalidate.
            // For now, refreshing the whole page is nuclear option, but we can't easily do it here.
            // Proper way: Use `useCreateTask` hook in this component.
            window.location.reload(); // Temporary lazy refresh for events
        } catch (e) {
            alert('Villa við að búa til viðburð');
        }
    };

    return (
        <div className="glass-card p-0 overflow-hidden group hover:border-primary/30 transition-all">
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">{school.name}</h3>
                            <code className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">{school.id}</code>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            if (!confirm(`Ertu viss um að þú viljir eyða skóla "${school.name}"?\n\n⚠️ VIÐVÖRUN: Þetta er ÓAFTURKRÆFT!`)) return;
                            try {
                                await deleteSchool(school.id);
                                refreshData();
                            } catch (error) {
                                alert('Villa við að eyða skóla');
                            }
                        }}
                        className="bg-error text-white px-4 py-2 rounded-lg font-bold hover:bg-error/90 transition-all flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Eyða skóla
                    </button>
                </div>
            </div>

            {/* MANAGEMENT SECTIONS */}
            <div className="divide-y divide-outline-variant/30">

                {/* 1. ADMINS */}
                <div className="bg-surface/80 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-on-surface uppercase tracking-wide flex items-center gap-2">
                            <Shield size={14} /> Stjórnendur ({school.admins.length})
                        </h4>
                        <button
                            onClick={() => setIsAddingAdmin(!isAddingAdmin)}
                            className="text-sm font-bold text-primary hover:text-primary flex items-center gap-1"
                        >
                            <Plus size={14} strokeWidth={3} /> {isAddingAdmin ? 'Loka' : 'Bæta við'}
                        </button>
                    </div>

                    {isAddingAdmin && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                                <input
                                    type="text"
                                    placeholder="Leita eftir netfangi..."
                                    value={adminSearch}
                                    onChange={e => setAdminSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none"
                                    autoFocus
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/30">
                                    {searchResults.map(u => (
                                        <button
                                            key={u.uid}
                                            onClick={() => handleAddAdmin(u.uid)}
                                            className="w-full p-3 text-left hover:bg-primary-container/15 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <p className="font-bold text-on-surface">{u.displayName}</p>
                                                <p className="text-xs text-on-surface-variant">{u.email}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <div key={i} className="bg-surface-container-lowest border text-on-surface-variant text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                {uid}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. SCHOOL EVENTS */}
                <div className="bg-surface-container-lowest p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-on-surface uppercase tracking-wide flex items-center gap-2">
                            <Calendar size={14} /> Viðburðir skóla ({schoolTasks?.length || 0})
                        </h4>
                        <button
                            onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                            className="text-sm font-bold text-primary hover:text-primary flex items-center gap-1"
                        >
                            <Megaphone size={14} strokeWidth={3} /> {isCreatingEvent ? 'Loka' : 'Nýr viðburður'}
                        </button>
                    </div>

                    {isCreatingEvent && (
                        <div className="mb-6 bg-surface p-4 rounded-xl border border-outline-variant/30 animate-in fade-in">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Heiti viðburðar (t.d. Árshátíð)"
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-outline-variant/30"
                                />
                                <input
                                    type="datetime-local"
                                    value={newEventDate}
                                    onChange={e => setNewEventDate(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-outline-variant/30"
                                />
                                <button
                                    onClick={handleCreateEvent}
                                    disabled={!newEventTitle || !newEventDate}
                                    className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-container disabled:opacity-50"
                                >
                                    Vista viðburð
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {schoolTasks && schoolTasks.length > 0 ? (
                            schoolTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex flex-col items-center justify-center text-xs font-bold text-on-surface-variant border border-outline-variant/30">
                                            <span>
                                                {task.date?.toDate ? task.date.toDate().getDate() : ''}
                                            </span>
                                            <span className="text-[9px] uppercase opacity-70">
                                                {task.date?.toDate ? task.date.toDate().toLocaleDateString('is-IS', { month: 'short' }) : ''}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface">{task.title}</p>
                                            <p className="text-xs text-on-surface-variant">Skólaviðburður</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!confirm(`Ertu viss um að þú viljir eyða viðburðinum "${task.title}"?`)) return;
                                            try {
                                                await deleteTask(task.id);
                                                // Lazy refresh to match create flow
                                                window.location.reload();
                                            } catch (e) {
                                                alert('Villa við að eyða viðburði');
                                            }
                                        }}
                                        className="text-on-surface-variant hover:text-error transition-colors p-2"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-xs text-on-surface-variant italic">Engir viðburðir skráðir</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
