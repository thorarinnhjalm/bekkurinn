'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAnnouncements, useTasks, useStudents, useClass, useUserClasses, useUserParentLink } from '@/hooks/useFirestore';
import { Loader2, Calendar, Star, Megaphone, ChevronRight, ChevronDown, UserPlus } from 'lucide-react';
// import { db } from '@/lib/firebase/config'; // No longer needed directly
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Removed manual queries

import Link from 'next/link';
import WelcomeWizard from '@/components/dashboard/WelcomeWizard';
import PendingApprovals from '@/components/dashboard/PendingApprovals';
import type { Task, Announcement, Student } from '@/types';

interface DashboardViewProps {
    translations: {
        greeting: string;
        latest_announcement: string;
        whats_next: string;
        upcoming_birthdays: string;
        no_events: string;
        no_birthdays: string;
        quick_actions: string;
    };
}

export default function DashboardView({ translations }: DashboardViewProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale || 'is';

    // 1. Find all user classes
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // Default to first class if not selected
    useEffect(() => {
        if (userClasses && userClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(userClasses[0].id);
        }
    }, [userClasses, selectedClassId]);

    const activeClass = userClasses?.find(c => c.id === selectedClassId) || (userClasses?.[0] || null);
    const classId = activeClass?.id || null;
    const isAdmin = activeClass?.role === 'admin';

    // 2. Fetch Class Data (only if we have an ID)
    const { data: classData, isLoading: classLoading } = useClass(classId);

    // 3. Check for Parent Link (Is my child in this class?)
    const { data: parentLink, isLoading: parentLinkLoading } = useUserParentLink(user?.uid, classId);

    const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(classId);
    const { data: tasksData, isLoading: tasksLoading } = useTasks(classId);
    const { data: studentsData, isLoading: studentsLoading } = useStudents(classId);

    // Auth redirection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [authLoading, user, router]);

    // Redirect to onboarding only if completely done loading and no class found
    useEffect(() => {
        if (!authLoading && !classesLoading && user && (!userClasses || userClasses.length === 0)) {
            router.push(`/${locale}/onboarding`);
        }
    }, [authLoading, classesLoading, user, userClasses, router, locale]);

    // Wizard Logic
    const [showWizard, setShowWizard] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('welcome') === 'true') {
            setShowWizard(true);
        }
    }, [searchParams]);

    const handleCloseWizard = () => {
        setShowWizard(false);
        // Clean URL
        router.replace(`/${locale}/dashboard`);
    };

    // Helper to safely convert Firestore Timestamp or Date
    const toJsDate = (dateField: any): Date | null => {
        if (!dateField) return null;
        if (typeof dateField.toDate === 'function') {
            return dateField.toDate();
        }
        if (dateField instanceof Date) {
            return dateField;
        }
        // Try parsing string or other formats
        const d = new Date(dateField);
        return isNaN(d.getTime()) ? null : d;
    };

    // Format helpers
    const formatDate = (timestamp: any) => {
        const date = toJsDate(timestamp);
        if (!date) return '';

        const formatted = new Intl.DateTimeFormat('is-IS', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(date);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    if (authLoading || announcementsLoading || tasksLoading || studentsLoading || classLoading || classesLoading || parentLinkLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--nordic-blue)' }} />
            </div>
        );
    }

    // --- Data Processing ---

    // 1. Get user first name
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Foreldri';

    // 2. Class Name Display Logic
    const displayClassName = classData
        ? (classData.schoolName && classData.grade
            ? `${classData.grade}. Bekkur ${classData.section || ''} - ${classData.schoolName}`
            : classData.name)
        : 'Bekkurinn';

    // Helper to get simple name for switcher
    const getSimpleClassName = (c: any) => {
        return c.schoolName && c.grade ? `${c.grade}. Bekkur ${c.section || ''}` : c.name || 'Bekkur';
    };

    // 3. Latest Pinned Announcement (or just latest)
    const announcements = announcementsData || [];
    const latestAnnouncement = announcements.length > 0
        ? [...announcements].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        })[0]
        : null;

    // 3. Upcoming Tasks (Events/Patrols)
    const now = new Date();
    const upcomingTasks = (tasksData || [])
        .map(t => ({ ...t, jsDate: toJsDate(t.date) }))
        .filter(t => t.jsDate && t.jsDate >= now)
        .sort((a, b) => (a.jsDate?.getTime() || 0) - (b.jsDate?.getTime() || 0))
        .slice(0, 2);

    // 4. Upcoming Birthdays (Next 2)
    const upcomingBirthdays = (studentsData || [])
        .filter(s => s.birthDate) // Filter out missing dates
        .map(s => {
            const birthDate = toJsDate(s.birthDate);
            if (!birthDate || isNaN(birthDate.getTime())) return null;

            // Create date object for this year's birthday
            const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            // If passed, use next year
            if (thisYearBirthday < now && thisYearBirthday.getDate() !== now.getDate()) {
                thisYearBirthday.setFullYear(now.getFullYear() + 1);
            }
            return { ...s, nextBirthday: thisYearBirthday };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null) // Remove failed parses
        .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime())
        .slice(0, 3);

    // --- SHOW BLOCKING "PENDING APPROVAL" UI ---
    if (parentLink && parentLink.status === 'pending' && !isAdmin) {
        return (
            <div className="min-h-screen p-4 pb-24 pt-24 max-w-lg mx-auto flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-2">
                    <UserPlus className="text-amber-500" size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">Beðið eftir samþykki</h1>
                <p className="text-lg text-gray-600">
                    Beiðni þín um að tengjast {displayClassName} hefur verið send.
                    <br /><br />
                    Foreldrið sem skráði barnið þarf að samþykkja beiðnina áður en þú færð aðgang.
                </p>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
                    <p className="text-sm text-gray-500 mb-4">
                        Þú færð aðgang um leið og beiðnin er samþykkt.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all"
                    >
                        Endurhlaða síðu
                    </button>
                    <button
                        onClick={() => router.push(`/${locale}/user/profile`)}
                        className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        Fara á minn prófíl
                    </button>
                </div>
            </div>
        );
    }

    // --- SHOW BLOCKING "CREATE STUDENT" UI IF NO PARENT LINK ---
    // Exception: If we just created the class/admin, we still want them to create a student eventually,
    // but the prompt says "if you don't have a child created... it's blank".
    // UPDATED: Admins should NOT be blocked by this. They need to see the dashboard to manage things.
    if (!parentLink && classId && !isAdmin) {
        return (
            <div className="min-h-screen p-4 pb-24 pt-24 max-w-5xl mx-auto flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <UserPlus className="text-nordic-blue" size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">Velkomin í {displayClassName}</h1>
                <p className="text-lg text-gray-600 max-w-md">
                    Til að sjá viðburði, afmæli og tilkynningar þarftu að skrá barnið þitt.
                </p>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                    <Link
                        href={`/${locale}/onboarding?step=join${classData?.joinCode ? `&code=${classData.joinCode}` : ''}`} // Re-route to join/create student flow
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <UserPlus size={20} />
                        Stofna / Velja Nemanda
                    </Link>
                    <p className="text-xs text-gray-400 mt-4">
                        Þegar þú hefur tengt barnið þitt opnast stjórnborðið sjálfkrafa.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 1. Greeting (Full Width) */}
            <header className="space-y-1 mb-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                    {translations.greeting.replace('{name}', firstName)}
                </h1>

                {userClasses && userClasses.length > 1 ? (
                    <div className="relative inline-block group">
                        <button className="flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Velkomin í {displayClassName}
                            <ChevronDown size={18} />
                        </button>

                        <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                            {userClasses.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedClassId(c.id)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${selectedClassId === c.id ? 'font-semibold text-blue-700 bg-blue-50' : 'text-gray-600'}`}
                                >
                                    <span>{getSimpleClassName(c)}</span>
                                    {selectedClassId === c.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                </button>
                            ))}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <Link
                                    href={`/${locale}/onboarding?step=join${classData?.joinCode ? `&code=${classData.joinCode}` : ''}`}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-500 hover:text-gray-900 text-sm flex items-center gap-2"
                                >
                                    <span>+ Bæta við bekk</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Velkomin í {displayClassName}
                    </p>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- LEFT COLUMN (Main Content) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Pending Approvals (Only for approved parents) */}
                    {parentLink && parentLink.status === 'approved' && classId && (
                        <PendingApprovals classId={classId} myStudentId={parentLink.studentId} />
                    )}

                    {/* Latest Announcement */}
                    {latestAnnouncement && (
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {translations.latest_announcement}
                                </h2>
                                <Link href={`/${locale}/announcements`} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--nordic-blue)' }}>
                                    Sjá allar <ChevronRight size={16} />
                                </Link>
                            </div>

                            <div
                                className="nordic-card p-5 border-l-4 transition-transform hover:scale-[1.01]"
                                style={{ borderColor: 'var(--border-light)', borderLeftColor: latestAnnouncement.pinned ? 'var(--amber)' : 'var(--nordic-blue)' }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: latestAnnouncement.pinned ? 'var(--amber)20' : 'var(--nordic-blue)20' }}>
                                        <Megaphone size={20} color={latestAnnouncement.pinned ? 'var(--amber-dark)' : 'var(--nordic-blue)'} />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="font-medium truncate">{latestAnnouncement.title}</h3>
                                        <p className="text-sm line-clamp-2 leading-relaxed text-gray-600">
                                            {latestAnnouncement.content}
                                        </p>
                                        <p className="text-xs pt-1 text-gray-400">
                                            {formatDate(latestAnnouncement.createdAt)} • {latestAnnouncement.author || 'Stjórn'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Events */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {translations.whats_next}
                        </h2>

                        {upcomingTasks.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                {upcomingTasks.slice(0, 4).map((task: any) => { // Increased to 4 items
                                    const isSchoolEvent = task.type === 'school_event';
                                    const dateObj = task.jsDate; // We mapped this above
                                    return (
                                        <div key={task.id} className="nordic-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${isSchoolEvent ? 'bg-amber-100' : 'bg-blue-50'}`}>
                                                <span className={`text-xs font-bold uppercase ${isSchoolEvent ? 'text-amber-700' : 'text-blue-600'}`}>
                                                    {dateObj ? dateObj.toLocaleDateString('is-IS', { month: 'short' }) : ''}
                                                </span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    {dateObj ? dateObj.getDate() : ''}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {isSchoolEvent
                                                        ? 'Skóladagatal'
                                                        : `${task.slotsFilled} af ${task.slotsTotal} skráðir`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="nordic-card p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
                                <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                                <p className="text-gray-500 font-medium mb-2">{translations.no_events}</p>
                                {isAdmin && (
                                    <Link href={`/${locale}/settings`} className="text-sm text-nordic-blue hover:underline">
                                        Sækja skóladagatal í stillingum →
                                    </Link>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* --- RIGHT COLUMN (Sidebar) --- */}
                <div className="space-y-6">

                    {/* Upcoming Birthdays */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {translations.upcoming_birthdays}
                        </h2>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                            {upcomingBirthdays.length > 0 ? (
                                upcomingBirthdays.map(student => (
                                    <div key={student.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm">
                                            {student.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{student.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(student.nextBirthday as any)}
                                            </p>
                                        </div>
                                        <Star size={14} className="text-amber-400" fill="currentColor" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center py-6 text-gray-400 italic">{translations.no_birthdays}</p>
                            )}
                        </div>
                    </section>

                    {/* ADMIN ACTIONS SIDEBAR */}
                    {isAdmin && (
                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Flýtileiðir
                            </h2>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
                                <Link href={`/${locale}/settings`} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors group text-sm font-medium text-gray-700">
                                    <div className="bg-blue-100 p-1.5 rounded-md group-hover:bg-blue-200 transition-colors">
                                        <div className="w-4 h-4 text-nordic-blue">⚙️</div>
                                    </div>
                                    Stillingar & Dagatal
                                </Link>
                                <Link href={`/${locale}/announcements`} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors group text-sm font-medium text-gray-700">
                                    <div className="bg-amber-100 p-1.5 rounded-md group-hover:bg-amber-200 transition-colors">
                                        <Megaphone size={16} className="text-amber-600" />
                                    </div>
                                    Ný tilkynning
                                </Link>
                                <Link href={`/${locale}/patrol`} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors group text-sm font-medium text-gray-700">
                                    <div className="bg-green-100 p-1.5 rounded-md group-hover:bg-green-200 transition-colors">
                                        <Calendar size={16} className="text-green-600" />
                                    </div>
                                    Skrá Foreldrarölt
                                </Link>
                                <Link href={`/${locale}/tasks`} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors group text-sm font-medium text-gray-700">
                                    <div className="bg-purple-100 p-1.5 rounded-md group-hover:bg-purple-200 transition-colors">
                                        <Star size={16} className="text-purple-600" />
                                    </div>
                                    Nýtt verkefni
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <WelcomeWizard isOpen={showWizard} onClose={handleCloseWizard} />
        </div>
    );
}
