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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Greeting (Full Width) */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        {translations.greeting.replace('{name}', firstName.split(' ')[0])}
                    </h1>
                    <p className="text-lg text-gray-500 mt-1">
                        Yfirlit dagsins á einum stað
                    </p>
                </div>

                {userClasses && userClasses.length > 1 ? (
                    <div className="relative inline-block group z-50">
                        <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full hover:border-blue-300 transition-colors">
                            <span className="font-medium text-gray-700">{displayClassName}</span>
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card border border-gray-100 py-1 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
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
                    <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {displayClassName}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* --- LEFT COLUMN (Main Content) - Spans 8 cols --- */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Pending Approvals (Only for approved parents) */}
                    {parentLink && parentLink.status === 'approved' && classId && (
                        <PendingApprovals classId={classId} myStudentId={parentLink.studentId} />
                    )}

                    {/* Latest Announcement Hero Card */}
                    {latestAnnouncement && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Megaphone className="text-nordic-blue" size={24} />
                                    {translations.latest_announcement}
                                </h2>
                                <Link href={`/${locale}/announcements`} className="text-sm font-semibold text-nordic-blue hover:text-blue-800 transition-colors flex items-center gap-1">
                                    Sjá allar <ChevronRight size={16} />
                                </Link>
                            </div>

                            <div className="nordic-card p-6 md:p-8 relative overflow-hidden group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Tilkynning</span>
                                            <span>•</span>
                                            <span>{formatDate(latestAnnouncement.createdAt)}</span>
                                        </div>
                                        {latestAnnouncement.pinned && (
                                            <div className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Star size={12} fill="currentColor" />
                                                Mikilvægt
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                        {latestAnnouncement.title}
                                    </h3>

                                    <div className="prose prose-blue prose-sm max-w-none text-gray-600 leading-relaxed line-clamp-4">
                                        {latestAnnouncement.content}
                                    </div>

                                    <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                            {(latestAnnouncement.author || 'S')[0]}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{latestAnnouncement.author || 'Stjórn'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Events */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="text-nordic-blue" size={24} />
                            {translations.whats_next}
                        </h2>

                        {upcomingTasks.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {upcomingTasks.slice(0, 4).map((task: any) => {
                                    const isSchoolEvent = task.type === 'school_event';
                                    const dateObj = task.jsDate;
                                    return (
                                        <div key={task.id} className="nordic-card p-5 hover:shadow-card-hover transition-all group flex flex-col justify-between h-full bg-white border-transparent hover:border-blue-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm ${isSchoolEvent ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    <span className="text-xs font-bold uppercase opacity-80">
                                                        {dateObj ? dateObj.toLocaleDateString('is-IS', { month: 'short' }).slice(0, 3) : ''}
                                                    </span>
                                                    <span className="text-xl font-bold leading-none">
                                                        {dateObj ? dateObj.getDate() : ''}
                                                    </span>
                                                </div>
                                                {!isSchoolEvent && (
                                                    <div className="bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-500">
                                                        {task.slotsFilled}/{task.slotsTotal}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-nordic-blue transition-colors line-clamp-2 mb-1">
                                                    {task.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {isSchoolEvent ? 'Skóladagatal' : 'Foreldrastarf'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* 'See all' card */}
                                <Link href={`/${locale}/tasks`} className="nordic-card p-5 group flex items-center justify-center text-center bg-gray-50 border-dashed border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                                    <div>
                                        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                            <ChevronRight className="text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <span className="font-medium text-gray-600 group-hover:text-blue-700">Sjá alla viðburði</span>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="nordic-card p-10 text-center bg-gray-50 border-dashed border-2 border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                                    <Calendar className="text-gray-300" size={32} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Ekkert á döfinni</h3>
                                <p className="text-gray-500 text-sm mb-4">{translations.no_events}</p>
                                {isAdmin && (
                                    <Link href={`/${locale}/settings`} className="inline-flex items-center gap-2 text-sm font-medium text-nordic-blue hover:underline bg-blue-50 px-4 py-2 rounded-lg">
                                        <span className="text-lg">📅</span> Sækja skóladagatal
                                    </Link>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* --- RIGHT COLUMN (Sidebar) - Spans 4 cols --- */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Quick Actions (Admin only) - Moved up for better access */}
                    {isAdmin && (
                        <section className="bg-gradient-to-br from-nordic-blue to-nordic-blue-dark rounded-2xl p-6 text-white shadow-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-10 -translate-y-10" />

                            <h2 className="text-lg font-bold mb-4 relative z-10">Stjórnborð</h2>

                            <div className="space-y-2 relative z-10">
                                <Link href={`/${locale}/announcements`} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
                                    <Megaphone size={18} className="text-amber-300" />
                                    <span className="font-medium text-sm">Ný tilkynning</span>
                                </Link>
                                <Link href={`/${locale}/tasks`} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
                                    <Calendar size={18} className="text-green-300" />
                                    <span className="font-medium text-sm">Skrá viðburð</span>
                                </Link>
                                <Link href={`/${locale}/settings`} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10">
                                    <div className="w-4 h-4 text-blue-200">⚙️</div>
                                    <span className="font-medium text-sm">Stillingar</span>
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Birthdays */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                                <Star size={18} fill="currentColor" />
                            </div>
                            {translations.upcoming_birthdays}
                        </h2>

                        <div className="nordic-card divide-y divide-gray-50 overflow-hidden">
                            {upcomingBirthdays.length > 0 ? (
                                upcomingBirthdays.map(student => (
                                    <div key={student.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm group-hover:scale-110 transition-transform">
                                            {student.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{student.name}</p>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                                {formatDate(student.nextBirthday as any)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-gray-50/50">
                                    <p className="text-sm text-gray-500 italic">Engin afmæli á næstunni</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <WelcomeWizard isOpen={showWizard} onClose={handleCloseWizard} />
        </div>
    );
}
