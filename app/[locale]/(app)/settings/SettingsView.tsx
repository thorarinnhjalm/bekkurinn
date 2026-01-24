'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useClass } from '@/hooks/useFirestore';
import { updateClass } from '@/services/firestore';
import { Loader2, Save, School, GraduationCap, AlertTriangle, Check, Calendar, RefreshCw, Users, X, UserPlus, Shield } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { SCHOOLS } from '@/constants/schools';
// Import firestore functions directly for the sync logic
import { collection, query, where, getDocs, deleteDoc, addDoc, Timestamp, getFirestore, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // Ensure db is exported from lib/firebase or services
import { HelpBox } from '@/components/ui/HelpBox';
import { useTranslations } from 'next-intl';

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
            } else if (line.startsWith('DTSTART;TZID=')) {
                // Handle DTSTART;TZID=...:20240101T080000
                const parts = line.split(':');
                if (parts.length > 1) {
                    currentEvent.dtstart = parts[1];
                    currentEvent.isAllDay = parts[1].length <= 8; // Date only format is usually 8 chars YYYYMMDD
                }
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
    const t = useTranslations('settings');
    const tCommon = useTranslations('common');

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

    // Security Redirect
    const isAdmin = classData?.admins?.includes(user?.uid || '');
    const router = useRouter();

    useEffect(() => {
        if (!classLoading && !authLoading && user && classData && !isAdmin) {
            router.push('/dashboard');
        }
    }, [classLoading, authLoading, user, classData, isAdmin, router]);

    const params = useParams();
    const locale = params?.locale || 'is';

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
        joinCode: '',
        parentTeamCode: '',
        schoolId: ''
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
                joinCode: classData.joinCode || '',
                parentTeamCode: classData.parentTeamCode || '',
                schoolId: classData.schoolId || ''
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
                                email: data.email || 'Ekkert netfang', // Could translate 'No email' but minor
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
                calendarUrl: selectedSchool.icsUrl,
                schoolId: selectedSchool.id
            });
        } else {
            setFormData({ ...formData, schoolName: e.target.value, schoolId: '' });
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
                joinCode: formData.joinCode,
                schoolId: formData.schoolId || null
            });
            await refetch();

            alert(t('saved_success'));
        } catch (error) {
            console.error(error);
            alert(t('error_saving'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePromoteClass = async () => {
        if (!classId) return;
        const nextGrade = Number(formData.grade) + 1;
        if (confirm(t('promote_confirm_title', { grade: nextGrade }) + '\n\n' + t('promote_confirm_desc'))) {
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
                alert(t('promote_success', { grade: nextGrade }));
            } catch (error) {
                console.error(error);
                alert(tCommon('error'));
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
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Gat ekki sótt dagatal'); // Backend error message might be hardcoded, let's leave it for now or rely on generic
            }
            const icsText = await res.text();

            // 2. Parse ICS
            setSyncStatus(t('reading_data'));
            const events = parseICS(icsText);

            // 3. Filter relevant events
            const keywords = ['Starfsdagur', 'Skipulagsdagur', 'Vetrarfrí', 'Jólafrí', 'Páskafrí', 'Skólasetning', 'Skólaslit', 'Lýðveldisdagurinn', 'Sumardagurinn fyrsti', 'Frídagur'];
            const relevantEvents = events.filter((e: any) =>
                keywords.some(k => e.summary && e.summary.toLowerCase().includes(k.toLowerCase()))
            );

            // 4. Delete old school events
            setSyncStatus(t('cleaning_old'));
            const q = query(collection(db, 'tasks'), where('classId', '==', classId), where('type', '==', 'school_event'));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // 5. Add new events
            setSyncStatus(t('adding_events'));
            const addPromises = relevantEvents.map((event: any) => {
                const date = parseDate(event.dtstart);
                // Skip past (optional)
                // if (date < new Date()) return Promise.resolve();

                return addDoc(collection(db, 'tasks'), {
                    classId: classId,
                    schoolId: classData?.schoolId || null,
                    type: 'school_event',
                    title: event.summary,
                    description: 'Samkvæmt skóladagatali',
                    date: Timestamp.fromDate(date),
                    isAllDay: event.isAllDay ?? true,
                    slotsTotal: 0,
                    slotsFilled: 0,
                    volunteers: [],
                    createdBy: user?.uid || 'system',
                    createdAt: Timestamp.now(),
                });
            });
            await Promise.all(addPromises);

            setSyncStatus(t('sync_done'));
            setTimeout(() => setSyncStatus(null), 3000);

        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Villa kom upp!';
            setSyncStatus(message);
            // Reset status after delay
            setTimeout(() => setSyncStatus(null), 5000);
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
            alert('Stjórnendaréttindi veitt!'); // Keep hardcoded or add key 'admin_added'
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
            alert(tCommon('error'));
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
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500">{t('subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="hidden sm:flex items-center gap-2 bg-[#4A7C9E] text-white px-4 py-2 rounded-lg hover:bg-[#2E5A75] transition-colors disabled:opacity-50 shadow-sm border-none"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {t('save_btn')}
                </button>
            </header>

            {/* Help Box */}
            <HelpBox
                title={t('help_title')}
                variant="tip"
                tips={[
                    t('help_tip_1'),
                    t('help_tip_2'),
                    t('help_tip_3')
                ]}
            />


            {/* Invite Code Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Users className="text-[#4A7C9E]" size={24} />
                        {t('invite_section_title')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('invite_section_desc')}
                    </p>
                </div>

                {/* Standard Join Code */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">
                        {t('general_code_label')}
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="bg-white px-4 py-3 rounded-lg border border-blue-200 flex-1 min-w-0">
                            <input
                                type="text"
                                value={formData.joinCode}
                                readOnly
                                className="text-2xl sm:text-3xl font-mono font-bold text-[#4A7C9E] tracking-widest bg-white border border-blue-200 rounded-lg outline-none w-full uppercase text-center select-all p-2"
                                placeholder="KÓÐI"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/${locale}/onboarding?step=join&code=${formData.joinCode}`;
                                    navigator.clipboard.writeText(url);
                                    alert(t('link_copied') + '\n\n' + url);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-[#4A7C9E] text-white rounded-lg hover:bg-[#2E5A75] transition-colors text-sm font-medium"
                                title={t('copy_link')}
                            >
                                📋 {t('copy_link')}
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(formData.joinCode);
                                    alert(t('code_copied'));
                                }}
                                className="px-4 py-2 bg-white text-[#4A7C9E] border border-[#B3CDE0] rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                                title={t('copy_code')}
                            >
                                {t('copy_code')}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                        ℹ️ {t('parent_info')}
                    </p>
                </div>

                {/* Admin/Parent Team Code */}
                {formData.parentTeamCode && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <label className="block text-sm font-semibold text-purple-900 uppercase tracking-wider mb-2">
                            {t('admin_code_label')}
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="bg-white px-4 py-3 rounded-lg border border-purple-200 flex-1 min-w-0 overflow-hidden">
                                <input
                                    type="text"
                                    value={formData.parentTeamCode}
                                    readOnly
                                    className="text-xl sm:text-2xl font-mono font-bold text-purple-800 tracking-widest bg-white border border-purple-200 rounded-lg outline-none w-full uppercase text-center select-all break-all p-2"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/${locale}/onboarding?step=join&code=${formData.parentTeamCode}`;
                                        navigator.clipboard.writeText(url);
                                        alert(t('link_copied') + '\n\n' + url);
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                >
                                    📋 {t('copy_link')}
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(formData.parentTeamCode);
                                        alert(t('code_copied'));
                                    }}
                                    className="px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                                >
                                    {t('copy_code')}
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-purple-700 mt-2">
                            ⚠️ {t('admin_warning')}
                        </p>
                    </div>
                )}
            </section>

            {/* Admin Management */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Shield className="text-nordic-blue" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{t('admins_section_title')}</h2>
                        <p className="text-sm text-gray-500">{t('admins_section_desc')}</p>
                    </div>
                </div>

                {/* Current Admins List */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('current_admins')} ({adminUsers.length})</label>
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
                                        title={t('remove_admin')}
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                                {adminUsers.length === 1 && (
                                    <span className="text-xs text-gray-400 italic">{t('only_admin_msg')}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add New Admin */}
                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('add_admin_title')}</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder={t('add_admin_placeholder')}
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
                            {t('add_btn')}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        ⚠️ {t('add_admin_warning')}
                    </p>
                </div>

            </section>

            {/* General Settings */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <School className="text-nordic-blue" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">{t('general_settings_title')}</h2>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('school_label')}</label>
                        <select
                            value={formData.schoolName}
                            onChange={handleSchoolChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none bg-white text-gray-900"
                        >
                            <option value="">{t('select_school')}</option>
                            {SCHOOLS.map(school => (
                                <option key={school.name} value={school.name}>
                                    {school.name}
                                </option>
                            ))}
                            <option value="Annað">{t('other_school')}</option>
                        </select>
                        {/* Fallback input if 'Annað' or unknown */}
                        {!SCHOOLS.find(s => s.name === formData.schoolName) && formData.schoolName && (
                            <input
                                type="text"
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                                placeholder={t('enter_school_name')}
                            />
                        )}
                    </div>

                    {/* Calendar Sync Section */}
                    {formData.calendarUrl && (
                        <div className="bg-blue-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-nordic-blue" />
                                <div>
                                    <p className="font-medium text-nordic-blue-dark">{t('calendar_found')}</p>
                                    <p className="text-xs text-nordic-blue">
                                        {t('calendar_sync_desc')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSyncCalendar}
                                disabled={isSyncing}
                                className="flex items-center gap-2 bg-white text-nordic-blue border border-blue-200 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                            >
                                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                {syncStatus || t('update_calendar')}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('grade_label')}</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('section_label')}</label>
                            <input
                                type="text"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-nordic-blue focus:border-transparent outline-none"
                                placeholder={t('section_placeholder')}
                            />
                        </div>
                    </div>

                    <div className="pt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                        <strong>{t('preview_name')}</strong><br />
                        {formData.schoolName && formData.grade
                            ? `${formData.grade}. Bekkur ${formData.section || ''} - ${formData.schoolName}`
                            : formData.name || t('missing_info')}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-[#4A7C9E] text-white px-4 py-2 rounded-lg hover:bg-[#2E5A75] transition-colors disabled:opacity-50 border-none"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {t('save_changes')}
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
                        <h2 className="text-xl font-semibold text-gray-900">{t('new_school_year_title')}</h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                        {t('new_school_year_desc')}
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
                            {t('start_new_year')}
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
