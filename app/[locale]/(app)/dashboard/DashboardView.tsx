'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAnnouncements, useTasks, useStudents, useClass } from '@/hooks/useFirestore';
import { Loader2, Calendar, Star, Megaphone, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

import Link from 'next/link';
import type { Task, Announcement, Student } from '@/types';

// TODO: Get this from user's class membership
const CLASS_ID = 'CLQCGsPBSZxKV4Zq6Xsg';

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
    const [classId, setClassId] = useState<string | null>(null);
    const [findingClass, setFindingClass] = useState(true);

    // 1. Find the user's class
    useEffect(() => {
        async function fetchUserClass() {
            if (!user) return;
            try {
                // Check if user is an admin of any class
                const q = query(
                    collection(db, 'classes'),
                    where('admins', 'array-contains', user.uid),
                    orderBy('createdAt', 'desc') // Get newest class first
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    setClassId(snapshot.docs[0].id);
                } else {
                    // Check parentLinks... (Future: not implemented for MVP onboarding yet)
                    // If no class found, redirect to Onboarding
                    router.push('/is/onboarding');
                }
            } catch (error) {
                console.error("Error finding class:", error);
            } finally {
                setFindingClass(false);
            }
        }

        if (!authLoading && user) {
            fetchUserClass();
        }
    }, [user, authLoading, router]);

    // 2. Fetch Class Data (only if we have an ID)
    const { data: classData, isLoading: classLoading } = useClass(classId || 'dummy');

    // ... Hooks dependent on classId ...
    // usage: enabled: !!classId
    // We need to update useStudents, useTasks etc to accept skip/enabled flag or handle null ID

    // TEMPORARY FIX:
    // Since useTasks etc might crash with null ID, we only render them when classId is set.

    // ... (Hooks below defined normally but we'll conditionally use their data)

    // Re-implement hooks to depend on classId state mostly?
    // Actually, react-query hooks usually usually handle null well if configured, 
    // but our custom hooks might pass null to firestore methods.

    // Let's modify the hooks imports or usage? 
    // Easier: Just conditionally render the whole view.

    const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(classId || '');
    const { data: tasksData, isLoading: tasksLoading } = useTasks(classId || '');
    const { data: studentsData, isLoading: studentsLoading } = useStudents(classId || '');

    // Auth redirection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/is/login');
        }
    }, [authLoading, user, router]);

    // Format helpers
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        return new Intl.DateTimeFormat('is-IS', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(timestamp.toDate());
    };

    if (authLoading || announcementsLoading || tasksLoading || studentsLoading || classLoading) {
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
        .filter(t => t.date?.toDate && t.date.toDate() >= now)
        .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
        .slice(0, 2);

    // 4. Upcoming Birthdays (Next 2)
    const upcomingBirthdays = (studentsData || [])
        .map(s => {
            const birthDate = s.birthDate.toDate();
            // Create date object for this year's birthday
            const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            // If passed, use next year
            if (thisYearBirthday < now && thisYearBirthday.getDate() !== now.getDate()) {
                thisYearBirthday.setFullYear(now.getFullYear() + 1);
            }
            return { ...s, nextBirthday: thisYearBirthday };
        })
        .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime())
        .slice(0, 3);

    // 5. Admin check
    const isAdmin = classData?.admins?.includes(user?.uid || '');

    return (
        <div className="min-h-screen p-4 pb-24 pt-24 max-w-5xl mx-auto space-y-6">
            {/* 1. Greeting (Full Width) */}
            <header className="space-y-1 mb-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                    {translations.greeting.replace('{name}', firstName)}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Velkomin í {displayClassName}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- LEFT COLUMN (Main Content) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Latest Announcement */}
                    {latestAnnouncement && (
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {translations.latest_announcement}
                                </h2>
                                <Link href="/is/announcements" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--nordic-blue)' }}>
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
                                {upcomingTasks.slice(0, 4).map(task => { // Increased to 4 items
                                    const isSchoolEvent = task.type === 'school_event';
                                    return (
                                        <div key={task.id} className="nordic-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${isSchoolEvent ? 'bg-amber-100' : 'bg-blue-50'}`}>
                                                <span className={`text-xs font-bold uppercase ${isSchoolEvent ? 'text-amber-700' : 'text-blue-600'}`}>
                                                    {task.date?.toDate ? task.date.toDate().toLocaleDateString('is-IS', { month: 'short' }) : ''}
                                                </span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    {task.date?.toDate ? task.date.toDate().getDate() : ''}
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
                                    <Link href="/is/settings" className="text-sm text-nordic-blue hover:underline">
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
                                <Link href="/is/settings" className="flex items-center gap-3 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors group text-sm font-medium text-gray-700">
                                    <div className="bg-blue-100 p-1.5 rounded-md group-hover:bg-blue-200 transition-colors">
                                        <Loader2 size={16} className="text-nordic-blue" />
                                    </div>
                                    Stillingar & Dagatal
                                </Link>
                                <Link href="/is/tasks/new" className="flex items-center gap-3 p-2 rounded-lg bg-white border border-blue-100 hover:border-blue-300 transition-colors group text-sm font-medium text-gray-700">
                                    <div className="bg-amber-100 p-1.5 rounded-md group-hover:bg-amber-200 transition-colors">
                                        <Star size={16} className="text-amber-600" />
                                    </div>
                                    Búa til viðburð (Rölt)
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
