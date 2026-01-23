'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAnnouncements, useTasks, useStudents, useClass, useUserClasses, useUserParentLink } from '@/hooks/useFirestore';
import { Loader2, Calendar, Star, Megaphone, ChevronRight, ChevronDown, UserPlus, Users, CheckSquare, Settings, Copy, Check } from 'lucide-react';
// import { db } from '@/lib/firebase/config'; // No longer needed directly
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Removed manual queries

import Link from 'next/link';
import WelcomeWizard from '@/components/dashboard/WelcomeWizard';
import PendingApprovals from '@/components/dashboard/PendingApprovals';
import type { Task, Announcement, Student } from '@/types';

// Icelandic month names (fallback for when browser doesn't support is-IS locale)
const ICELANDIC_MONTHS = [
    'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní',
    'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'
];
const ICELANDIC_MONTHS_SHORT = [
    'jan', 'feb', 'mar', 'apr', 'maí', 'jún',
    'júl', 'ágú', 'sep', 'okt', 'nóv', 'des'
];
const ICELANDIC_WEEKDAYS = [
    'sunnudagur', 'mánudagur', 'þriðjudagur', 'miðvikudagur',
    'fimmtudagur', 'föstudagur', 'laugardagur'
];

// Helper to format date in Icelandic
const formatDateIcelandic = (date: Date, options: { day?: boolean; month?: 'long' | 'short'; weekday?: boolean }) => {
    const parts: string[] = [];
    if (options.weekday) {
        parts.push(ICELANDIC_WEEKDAYS[date.getDay()]);
    }
    if (options.day) {
        parts.push(`${date.getDate()}.`);
    }
    if (options.month === 'long') {
        parts.push(ICELANDIC_MONTHS[date.getMonth()]);
    } else if (options.month === 'short') {
        parts.push(ICELANDIC_MONTHS_SHORT[date.getMonth()]);
    }
    return parts.join(' ');
};

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

    const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(classId, activeClass?.schoolId);
    const { data: tasksData, isLoading: tasksLoading } = useTasks(classId, activeClass?.schoolId);
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

    // --- Share Class Logic ---
    const [copied, setCopied] = useState(false);

    const handleCopyJoinLink = () => {
        if (!classData?.joinCode || !user?.uid) return;
        const link = `${window.location.origin}/${locale}/onboarding?step=join&code=${classData.joinCode}&inviterId=${user.uid}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
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

    // Format helpers - using manual Icelandic names for reliability
    const formatDate = (timestamp: any) => {
        const date = toJsDate(timestamp);
        if (!date) return '';

        const formatted = formatDateIcelandic(date, { weekday: true, day: true, month: 'long' });
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

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-full">
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
                    <UserPlus className="text-blue-900" size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">Velkomin í {displayClassName}</h1>
                <p className="text-lg text-gray-600 max-w-md">
                    Til að sjá viðburði, afmæli og tilkynningar þarftu að skrá barnið þitt.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-full max-w-md">
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
        <div className="space-y-12 animate-in fade-in duration-800 pb-20">
            {/* 1. Glass Hero Section */}
            <header className="relative isolate overflow-hidden">
                {/* Blurry background blobs for depth */}
                <div className="absolute top-0 right-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div className="aspect-[1155/678] w-[60rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                    />
                </div>

                <div className="glass-card p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="space-y-4 max-w-2xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-xs font-semibold text-nordic-blue uppercase tracking-wide">
                            👋 Velkomin aftur
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                            Góðan daginn, <span className="text-blue-900">{firstName.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 font-medium max-w-lg leading-relaxed">
                            Þú ert að skoða <span className="font-bold text-gray-900">{displayClassName}</span>. Hér er yfirlit yfir allt sem er framundan í bekknum.
                        </p>
                    </div>

                    {/* Class Switcher - Floating Pill */}
                    {userClasses && userClasses.length > 1 && (
                        <div className="relative z-10">
                            <div className="relative inline-block group">
                                <button className="flex items-center gap-3 bg-white shadow-sm border border-gray-200 px-6 py-3 rounded-lg hover:shadow-md hover:border-gray-300 transition-all">
                                    <span className="font-bold text-gray-800 text-lg">{getSimpleClassName(activeClass)}</span>
                                    <ChevronDown size={20} className="text-gray-400" />
                                </button>

                                <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hidden group-hover:block">
                                    {userClasses.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedClassId(c.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${selectedClassId === c.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-white/50 text-gray-600'}`}
                                        >
                                            <span>{getSimpleClassName(c)}</span>
                                            {selectedClassId === c.id && <div className="w-2 h-2 rounded-full bg-blue-600 shadow-glow" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* --- MAIN CONTENT (Left) --- */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Pending Approvals (For Admins or Parents of specific matching students) */}
                    {classId && (
                        <PendingApprovals
                            classId={classId}
                            myStudentId={parentLink?.studentId}
                            isAdmin={isAdmin}
                        />
                    )}

                    {/* Latest Announcement */}
                    {latestAnnouncement && (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nýjasta tilkynningin</h2>
                                <Link href={`/${locale}/announcements`} className="text-sm font-bold text-gray-400 hover:text-blue-900 transition-colors">
                                    Sjá allar
                                </Link>
                            </div>

                            <div className="glass-card p-8 group cursor-pointer hover:border-blue-200/50 transition-all duration-500">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            {latestAnnouncement.pinned && (
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" />
                                                    Mikilvægt
                                                </span>
                                            )}
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md uppercase tracking-wider">
                                                Nýtt
                                            </span>
                                            <span className="text-xs font-medium text-gray-400">
                                                {formatDate(latestAnnouncement.createdAt)}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 leading-snug group-hover:text-blue-900 transition-colors">
                                            {latestAnnouncement.title}
                                        </h3>

                                        <p className="text-gray-600 leading-relaxed line-clamp-3">
                                            {latestAnnouncement.content}
                                        </p>

                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                                                {(latestAnnouncement.author || 'S')[0]}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{latestAnnouncement.author || 'Stjórn'}</span>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex h-12 w-12 rounded-lg bg-blue-50 items-center justify-center text-blue-900 shadow-sm">
                                        <Megaphone size={24} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Events - Horizontal Scroller or Grid */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                Framundan <span className="text-gray-300 font-light text-lg">|</span> <span className="text-lg font-medium text-gray-500">Næstu dagar</span>
                            </h2>
                            <Link href={`/${locale}/calendar`} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-900 hover:shadow-md transition-all">
                                <ChevronRight size={20} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {upcomingTasks.slice(0, 4).map((task: any, index) => {
                                const isSchoolEvent = task.type === 'school_event';
                                const dateObj = task.jsDate;
                                return (
                                    <div
                                        key={task.id}
                                        className="glass-card p-6 flex flex-col justify-between min-h-[160px] group border-transparent hover:border-white/60 bg-white/60"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center shadow-sm transition-transform duration-200 group-hover:-translate-y-1 ${isSchoolEvent ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                                    {dateObj ? ICELANDIC_MONTHS_SHORT[dateObj.getMonth()] : ''}
                                                </span>
                                                <span className="text-xl font-black leading-none">
                                                    {dateObj ? dateObj.getDate() : ''}
                                                </span>
                                            </div>

                                            {(task.slotsTotal > 0 && !isSchoolEvent) && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skráning</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-900 rounded-full" style={{ width: `${(task.slotsFilled / task.slotsTotal) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-900 transition-colors">
                                                {task.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {isSchoolEvent ? '📚 Skóladagatal' : '🤝 Foreldrastarf'}
                                                {(task.isAllDay || isSchoolEvent) && <span className="ml-2 text-blue-600">• Allan daginn</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {upcomingTasks.length === 0 && (
                                <div className="col-span-full py-12 text-center rounded-3xl border-2 border-dashed border-gray-200/50 bg-white/30">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Calendar className="text-gray-300" size={24} />
                                    </div>
                                    <p className="text-gray-500 font-medium">Ekkert á dagatalinu í augnablikinu</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* --- SIDEBAR CONTENT (Right) --- */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Birthdays Card */}
                    <div className="professional-card p-6 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 1.7 3.5 2.5 3.5-2.5 2-2.5 2 1 4 1" /><path d="M2 21h20" /><path d="M7 8v2" /><path d="M12 8v2" /><path d="M17 8v2" /><path d="M7 4h.01" /><path d="M12 4h.01" /><path d="M17 4h.01" /></svg>
                            </div>
                            <h3 className="font-bold text-gray-900">{translations.upcoming_birthdays}</h3>
                        </div>

                        <div className="space-y-4">
                            {upcomingBirthdays.length > 0 ? (
                                upcomingBirthdays.map((student) => (
                                    <div key={student.id} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-xl shadow-sm border border-gray-100">
                                            🎂
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{student.name.split(' ')[0]}</p>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {formatDateIcelandic(student.nextBirthday, { day: true, month: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">Engin afmæli á næstunni</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Access / Class Stats */}
                    <div className="glass-card p-6 space-y-6">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-4">Yfirlit bekkjar</h3>

                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-center hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => router.push(`/${locale}/directory`)}>
                            <div className="text-2xl font-black text-blue-900 mb-1">{studentsData?.length || 0}</div>
                            <div className="text-xs font-bold text-blue-600/70 uppercase tracking-wide">Nemendur</div>
                        </div>
                        {/* Placeholder for future stat or remove grid-cols-2 if only one item */}
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100 text-center hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => router.push(`/${locale}/patrol`)}>
                            <div className="text-2xl font-black text-purple-600 mb-1">
                                📅
                            </div>
                            <div className="text-xs font-bold text-purple-600/70 uppercase tracking-wide">Dagatal</div>
                        </div>
                    </div>

                    {/* INVITE CARD */}
                    <div className="p-6 bg-[#1E3A5F] rounded-lg shadow-lg relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                                <UserPlus size={24} className="text-[#FFFFFF]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#FFFFFF] tracking-tight">Stækka hópinn?</h3>
                                <p className="text-[#93C5FD] text-sm font-medium mt-1 leading-relaxed">
                                    Vantar fleiri foreldra í bekkinn? Deildu hlekknum beint á þá eða í Facebook-hópinn.
                                </p>
                            </div>

                            <button
                                onClick={handleCopyJoinLink}
                                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-all duration-300 shadow-md ${copied
                                    ? 'bg-[#22C55E] text-[#FFFFFF]'
                                    : 'bg-[#FFFFFF] text-[#1E3A5F] hover:bg-gray-50 active:scale-95'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} />
                                        <span>Afritað!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        <span>Afrita hlekk</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="pt-2">
                            <Link
                                href={`/${locale}/settings`}
                                className="btn-premium w-full flex items-center justify-center gap-2"
                            >
                                <Settings size={18} />
                                Stjórna bekk
                            </Link>
                        </div>
                    )}

                    {/* SUPER ADMIN SWITCHER */}
                    {user?.email === 'thorarinnhjalmarsson@gmail.com' && (
                        <div className="pt-2">
                            <Link
                                href={`/${locale}/admin`}
                                className="w-full bg-gray-900 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg border border-gray-700"
                            >
                                <Users size={18} />
                                Kerfisstjórn
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
