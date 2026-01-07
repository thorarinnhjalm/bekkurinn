'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useClass } from '@/hooks/useFirestore';
import { updateClass } from '@/services/firestore';
import { Loader2, Save, School, GraduationCap, AlertTriangle, Check, Calendar, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SCHOOLS } from '@/constants/schools';
// Import firestore functions directly for the sync logic
import { collection, query, where, getDocs, deleteDoc, addDoc, Timestamp, getFirestore } from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // Ensure db is exported from lib/firebase or services

// TODO: Get this from user's class membership (context)
const CLASS_ID = 'CLQCGsPBSZxKV4Zq6Xsg';

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
    const { data: classData, isLoading: classLoading, refetch } = useClass(CLASS_ID);
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        schoolName: '',
        grade: 1,
        section: '',
        name: '',
        calendarUrl: ''
    });

    // Populate form when data loads
    useEffect(() => {
        if (classData) {
            setFormData({
                schoolName: classData.schoolName || '',
                grade: classData.grade || 1,
                section: classData.section || '',
                name: classData.name || '',
                calendarUrl: classData.calendarUrl || ''
            });
        }
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
        setIsSaving(true);
        try {
            // Generate display name automatically if fields are present
            const displayName = formData.schoolName && formData.grade
                ? `${formData.grade}. Bekkur ${formData.section || ''} - ${formData.schoolName}`
                : formData.name;

            await updateClass(CLASS_ID, {
                schoolName: formData.schoolName,
                grade: Number(formData.grade),
                section: formData.section,
                name: displayName,
                calendarUrl: formData.calendarUrl
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
        const nextGrade = Number(formData.grade) + 1;
        if (confirm(`Ertu viss um að þú viljir hækka bekkinn upp í ${nextGrade}. bekk?\n\nÞetta uppfærir nafnið á bekknum fyrir alla.`)) {
            setIsSaving(true);
            try {
                const displayName = formData.schoolName
                    ? `${nextGrade}. Bekkur ${formData.section || ''} - ${formData.schoolName}`
                    : `Bekkur ${nextGrade}`;

                await updateClass(CLASS_ID, {
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
        if (!formData.calendarUrl) return;
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
            const q = query(collection(db, 'tasks'), where('classId', '==', CLASS_ID), where('type', '==', 'school_event'));
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
                    classId: CLASS_ID,
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
            <header className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Stillingar Bekkjarins</h1>
                <p className="text-gray-500">Breyttu upplýsingum um skóla og árgang</p>
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
                        <div className="bg-stone-100 px-4 py-2 rounded-lg border border-stone-200">
                            <code className="text-xl font-mono font-bold text-nordic-blue tracking-wider">
                                {classData.joinCode || 'Enginn kóði'}
                            </code>
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
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none bg-white"
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
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none"
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
