'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useClass } from '@/hooks/useFirestore';
import { updateClass } from '@/services/firestore';
import { Loader2, Save, School, GraduationCap, AlertTriangle, Check, Calendar, RefreshCw, Users, X, UserPlus, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SCHOOLS } from '@/constants/schools';
// Import firestore functions directly for the sync logic
import { collection, query, where, getDocs, deleteDoc, addDoc, Timestamp, getFirestore, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // Ensure db is exported from lib/firebase or services

// Calendar Parsing Logic
function parseICS(icsContent: string) {
    const events: any[] = [];
    const lines = icsContent.split(/\r\n|\n|\r/);
    let currentEvent: any = {};
    let inEvent = false;

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            inEvent = true;
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            inEvent = false;
            // Only keep events that have summary and date
            if (currentEvent.summary && currentEvent.dtstart) {
                events.push(currentEvent);
            }
        } else if (inEvent) {
            if (line.startsWith('SUMMARY:')) {
                currentEvent.summary = line.substring(8);
            } else if (line.startsWith('DTSTART;VALUE=DATE:')) {
                currentEvent.dtstart = line.substring(19); // YYYYMMDD
                currentEvent.isAllDay = true;
            } else if (line.startsWith('DTSTART:')) {
                currentEvent.dtstart = line.substring(8);
                currentEvent.isAllDay = false;
            }
        }
    }
    return events;
}

function parseDate(dateStr: string): Date {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
}

export default function SettingsView() {
    const { user, loading: authLoading } = useAuth();

    // Dynamic Class Fetching
    const [classId, setClassId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserClass() {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'classes'),
                    where('admins', 'array-contains', user.uid)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const sortedDocs = snapshot.docs.sort((a, b) => {
                        const tA = a.data().createdAt?.toMillis() || 0;
                        const tB = b.data().createdAt?.toMillis() || 0;
                        return tB - tA;
                    });
                    setClassId(sortedDocs[0].id);
                }
            } catch (error) {
                console.error("Error finding class:", error);
            }
        }
        if (!authLoading && user) fetchUserClass();
    }, [user, authLoading]);

    const { data: classData, isLoading: classLoading, refetch } = useClass(classId);
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);

    // Admin Management State
    const [adminUsers, setAdminUsers] = useState<Array<{ uid: string; email: string; displayName: string }>>([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);

    const [formData, setFormData] = useState({
        schoolName: '',
        grade: 1,
        section: '',
        name: '',
        calendarUrl: '',
        joinCode: ''
    });

    // Populate form when data loads
    useEffect(() => {
        if (classData) {
            setFormData({
                schoolName: classData.schoolName || '',
                grade: classData.grade || 1,
                section: classData.section || '',
                name: classData.name || '',
                calendarUrl: classData.calendarUrl || '',
                joinCode: classData.joinCode || ''
            });
        }
    }, [classData]);

    // Fetch admin users when classData loads
    useEffect(() => {
        async function fetchAdminUsers() {
            if (!classData || !classData.admins || classData.admins.length === 0) return;

            try {
                const adminData = await Promise.all(
                    classData.admins.map(async (uid) => {
                        const userDoc = await getDoc(doc(db, 'users', uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            return {
                                uid,
                                email: data.email || 'Ekkert netfang',
                                displayName: data.displayName || data.email || 'Notandi'
                            };
                        }
                        return {
                            uid,
                            email: 'Óþekkt',
                            displayName: 'Óþekktur notandi'
                        };
                    })
                );
                setAdminUsers(adminData);
            } catch (error) {
                console.error('Error fetching admin users:', error);
            }
        }
        fetchAdminUsers();
    }, [classData]);

    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSchool = SCHOOLS.find(s => s.name === e.target.value);
        if (selectedSchool) {
            setFormData({
                ...formData,
                schoolName: selectedSchool.name,
                calendarUrl: selectedSchool.icsUrl
            });
        } else {
            setFormData({ ...formData, schoolName: e.target.value });
        }
    };

    const handleSave = async () => {
        if (!classId) return;
        setIsSaving(true);
        try {
            // Generate display name automatically if fields are present
            const displayName = formData.schoolName && formData.grade
                ? `${formData.grade}. Bekkur ${formData.section || ''} - ${formData.schoolName}`
                : formData.name;

            await updateClass(classId, {
                schoolName: formData.schoolName,
                grade: Number(formData.grade),
                section: formData.section,
                name: displayName,
                calendarUrl: formData.calendarUrl,
                joinCode: formData.joinCode
            });
            await refetch();
            alert('Stillingar vistaðar!');
        } catch (error) {
            console.error(error);
            alert('Villa við vistun');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePromoteClass = async () => {
        if (!classId) return;
        const nextGrade = Number(formData.grade) + 1;
        if (confirm(`Ertu viss um að þú viljir hækka bekkinn upp í ${nextGrade}. bekk?\n\nÞetta uppfærir nafnið á bekknum fyrir alla.`)) {
            setIsSaving(true);
            try {
                const displayName = formData.schoolName
                    ? `${nextGrade}. Bekkur ${formData.section || ''} - ${formData.schoolName}`
                    : `Bekkur ${nextGrade}`;

                await updateClass(classId, {
                    grade: nextGrade,
                    name: displayName
                });
                await refetch();
                alert(`Til hamingju! Bekkurinn er núna í ${nextGrade}. bekk.`);
            } catch (error) {
                console.error(error);
                alert('Villa kom upp');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleSyncCalendar = async () => {
        if (!classId || !formData.calendarUrl) return;
        setIsSyncing(true);
        setSyncStatus('Sæki dagatal...');

        try {
            // 1. Fetch ICS via proxy
            const res = await fetch(`/api/proxy-calendar?url=${encodeURIComponent(formData.calendarUrl)}`);
            if (!res.ok) throw new Error('Gat ekki sótt dagatal');
            const icsText = await res.text();

            // 2. Parse ICS
            setSyncStatus('Les gögn...');
            const events = parseICS(icsText);

            // 3. Filter relevant events
            const keywords = ['Starfsdagur', 'Skipulagsdagur', 'Vetrarfrí', 'Jólafrí', 'Páskafrí', 'Skólasetning', 'Skólaslit', 'Lýðveldisdagurinn', 'Sumardagurinn fyrsti', 'Frídagur'];
            const relevantEvents = events.filter((e: any) =>
                keywords.some(k => e.summary && e.summary.toLowerCase().includes(k.toLowerCase()))
            );

            // 4. Delete old school events
            setSyncStatus('Hreinsa gamalt...');
            const q = query(collection(db, 'tasks'), where('classId', '==', classId), where('type', '==', 'school_event'));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // 5. Add new events
            setSyncStatus(`Bæti við ${relevantEvents.length} viðburðum...`);
            const addPromises = relevantEvents.map((event: any) => {
                const date = parseDate(event.dtstart);
                // Skip past (optional)
                // if (date < new Date()) return Promise.resolve();

                return addDoc(collection(db, 'tasks'), {
                    classId: classId,
                    type: 'school_event',
                    title: event.summary,
                    description: 'Samkvæmt skóladagatali',
                    date: Timestamp.fromDate(date),
                    slotsTotal: 0,
                    slotsFilled: 0,
                    volunteers: [],
                    createdBy: user?.uid || 'system',
                    createdAt: Timestamp.now(),
                });
            });
            await Promise.all(addPromises);

            setSyncStatus('Lokið!');
            setTimeout(() => setSyncStatus(null), 3000);

        } catch (error) {
            console.error(error);
            setSyncStatus('Villa kom upp!');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!classId || !newAdminEmail.trim()) {
            alert('Vinsamlegast sláðu inn gilt netfang.');
            return;
        }

        setIsAddingAdmin(true);
        try {
            // Find user by email
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', newAdminEmail.trim().toLowerCase()));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                alert('Enginn notandi fannst með þetta netfang. Viðkomandi þarf að hafa skráð sig inn í kerfið fyrst.');
                setIsAddingAdmin(false);
                return;
            }

            const userDoc = snapshot.docs[0];
            const userId = userDoc.id;

            // Check if already admin
            if (classData?.admins?.includes(userId)) {
                alert('Þessi notandi er nú þegar með stjórnendaréttindi.');
                setIsAddingAdmin(false);
                return;
            }

            // Add to admins array
            await updateDoc(doc(db, 'classes', classId), {
                admins: arrayUnion(userId)
            });

            await refetch();
            setNewAdminEmail('');
            alert('Stjórnendaréttindi veitt!');
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Villa kom upp við að bæta við stjórnanda.');
        } finally {
            setIsAddingAdmin(false);
        }
    };

    const handleRemoveAdmin = async (userId: string) => {
        if (!classId) return;

        // Prevent removing last admin
        if (classData?.admins && classData.admins.length === 1) {
            alert('Ekki hægt að fjarlægja síðasta stjórnandann. Bættu við öðrum fyrst.');
            return;
        }

        if (!confirm('Ertu viss um að þú viljir afturkalla stjórnendaréttindi þessa notanda?')) {
            return;
        }

        try {
            await updateDoc(doc(db, 'classes', classId), {
                admins: arrayRemove(userId)
            });
            await refetch();
            alert('Réttindi afturkölluð.');
        } catch (error) {
            console.error('Error removing admin:', error);
            alert('Villa kom upp.');
        }
    };

    if (authLoading || classLoading) {
        return (
            <div className="flex justify-center pt-20">
                <Loader2 className="animate-spin text-nordic-blue" size={40} />
            </div>
        );
    }

    if (!classData) return <div>Enginn bekkur fannst.</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-8 pb-24 pt-8">
            <header className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Stillingar Bekkjarins</h1>
                    <p className="text-gray-500">Breyttu upplýsingum um skóla og árgang</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="hidden sm:flex items-center gap-2 bg-nordic-blue text-white px-4 py-2 rounded-lg hover:bg-nordic-blue-dark transition-colors disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Vista
                </button>
            </header>

            {/* Invite Code Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-nordic-blue" />
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Boðskóði fyrir foreldra</h2>
                        <p className="text-sm text-gray-500 max-w-md">
                            Sendu þennan kóða á aðra foreldra svo þeir geti gengið í bekkinn.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-stone-50 px-4 py-2 rounded-lg border border-stone-200">
                            <input
                                type="text"
                                value={formData.joinCode}
                                onChange={(e) => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                                className="text-xl font-mono font-bold text-nordic-blue tracking-wider bg-transparent outline-none w-32 uppercase text-center"
                                placeholder="KÓÐI"
                            />
                        </div>
                        {classData.joinCode && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(classData.joinCode || '');
                                    alert('Kóði afritaður!');
                                }}
                                className="p-2 text-gray-500 hover:text-nordic-blue transition-colors"
                                title="Afrita kóða"
                            >
                                <Check size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Admin Management */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Shield className="text-nordic-blue" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Stjórnendur bekkjarins</h2>
                        <p className="text-sm text-gray-500">Aðeins stjórnendur geta breytt stillingum og búið til viðburði</p>
                    </div>
                </div>

                {/* Current Admins List */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Núverandi stjórnendur ({adminUsers.length})</label>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {adminUsers.map((admin) => (
                            <div key={admin.uid} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-nordic-blue text-white flex items-center justify-center text-sm font-bold">
                                        {admin.displayName[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{admin.displayName}</p>
                                        <p className="text-xs text-gray-500">{admin.email}</p>
                                    </div>
                                </div>
                                {adminUsers.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveAdmin(admin.uid)}
                                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Fjarlægja stjórnanda"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                                {adminUsers.length === 1 && (
                                    <span className="text-xs text-gray-400 italic">Einasti stjórnandi</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add New Admin */}
                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bæta við stjórnanda</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="netfang@example.com"
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleAddAdmin();
                            }}
                        />
                        <button
                            onClick={handleAddAdmin}
                            disabled={isAddingAdmin || !newAdminEmail.trim()}
                            className="flex items-center gap-2 bg-nordic-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAddingAdmin ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                            Bæta við
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        ⚠️ Notandinn þarf að hafa skráð sig inn í kerfið áður en þú getur bætt honum við sem stjórnanda.
                    </p>
                </div>
            </section>

            {/* General Settings */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <School className="text-nordic-blue" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Grunnupplýsingar</h2>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skóli</label>
                        <select
                            value={formData.schoolName}
                            onChange={handleSchoolChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none bg-white text-gray-900"
                        >
                            <option value="">Veldu skóla...</option>
                            {SCHOOLS.map(school => (
                                <option key={school.name} value={school.name}>
                                    {school.name}
                                </option>
                            ))}
                            <option value="Annað">Annað (Skrifa nafn)</option>
                        </select>
                        {/* Fallback input if 'Annað' or unknown */}
                        {!SCHOOLS.find(s => s.name === formData.schoolName) && formData.schoolName && (
                            <input
                                type="text"
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                                placeholder="Sláðu inn nafn skóla"
                            />
                        )}
                    </div>

                    {/* Calendar Sync Section */}
                    {formData.calendarUrl && (
                        <div className="bg-blue-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-nordic-blue" />
                                <div>
                                    <p className="font-medium text-nordic-blue-dark">Skóladagatal fundið</p>
                                    <p className="text-xs text-nordic-blue">
                                        Nær sjálfkrafa í starfsdaga og frí.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSyncCalendar}
                                disabled={isSyncing}
                                className="flex items-center gap-2 bg-white text-nordic-blue border border-blue-200 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                            >
                                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                {syncStatus || 'Uppfæra dagatal'}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bekkur / Árgangur</label>
                            <input
                                type="number"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none text-gray-900"
                                min="1"
                                max="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deild (Valfrjálst)</label>
                            <input
                                type="text"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none"
                                placeholder="t.d. Hlíð"
                            />
                        </div>
                    </div>

                    <div className="pt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                        <strong>Forskoðun á nafni:</strong><br />
                        {formData.schoolName && formData.grade
                            ? `${formData.grade}. Bekkur ${formData.section || ''} - ${formData.schoolName}`
                            : formData.name || '(Vantar upplýsingar)'}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-nordic-blue text-white px-4 py-2 rounded-lg hover:bg-nordic-blue-dark transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Vista Breytingar
                    </button>
                </div>
            </section>

            {/* Advance Grade Level */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full translate-x-10 -translate-y-10" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <GraduationCap className="text-amber-600" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Nýtt Skólaár (Í ágúst)</h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Þegar skólinn byrjar aftur í ágúst er sniðugt að hækka bekkinn upp um árgang hér.
                        Nafn bekkjarins uppfærist og nýtt tímabil hefst.
                    </p>

                    <div className="flex items-center justify-between bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-400 text-lg">{formData.grade}. bekkur</span>
                            <ChevronRight className="text-gray-400" />
                            <span className="font-bold text-nordic-blue text-lg">{Number(formData.grade) + 1}. bekkur</span>
                        </div>

                        <button
                            onClick={handlePromoteClass}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-white border-2 border-amber-400 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors font-semibold shadow-sm"
                        >
                            <GraduationCap size={20} />
                            Byrja nýtt skólaár
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ChevronRight(props: any) {
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
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
