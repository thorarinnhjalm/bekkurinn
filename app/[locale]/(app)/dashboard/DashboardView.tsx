'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAnnouncements, useTasks, useStudents, useClass } from '@/hooks/useFirestore';
import { Loader2, Calendar, Star, Megaphone, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
                const q = query(collection(db, 'classes'), where('admins', 'array-contains', user.uid));
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

    return (
        <div className="min-h-screen p-4 space-y-8 pb-24 pt-24">
            {/* 1. Greeting */}
            <header className="space-y-1">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                    {translations.greeting.replace('{name}', firstName)}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Velkomin í {displayClassName}
                </p>
            </header>

            {/* 2. Primary Call to Action: Latest Announcement */}
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
                        className="nordic-card p-5 border-l-4"
                        style={{ borderColor: 'var(--border-light)', borderLeftColor: latestAnnouncement.pinned ? 'var(--amber)' : 'var(--nordic-blue)' }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: latestAnnouncement.pinned ? 'var(--amber)20' : 'var(--nordic-blue)20' }}>
                                <Megaphone size={20} color={latestAnnouncement.pinned ? 'var(--amber-dark)' : 'var(--nordic-blue)'} />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h3 className="font-medium truncate">{latestAnnouncement.title}</h3>
                                <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {latestAnnouncement.content}
                                </p>
                                <p className="text-xs pt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    {formatDate(latestAnnouncement.createdAt)} • {latestAnnouncement.author || 'Stjórn'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Upcoming Events / What's Next */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {translations.whats_next}
                </h2>

                {upcomingTasks.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingTasks.slice(0, 4).map(task => { // Increased to 4 items
                            const isSchoolEvent = task.type === 'school_event';
                            return (
                                <div key={task.id} className="nordic-card p-4 flex items-center gap-4">
                                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${isSchoolEvent ? 'bg-amber-100' : 'bg-stone-100'}`}>
                                        <span className={`text-xs font-bold uppercase ${isSchoolEvent ? 'text-amber-700' : 'text-nordic-blue'}`} style={{ color: isSchoolEvent ? 'var(--amber-dark)' : 'var(--nordic-blue)' }}>
                                            {task.date.toDate().toLocaleDateString('is-IS', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {task.date.toDate().getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{task.title}</h4>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                    <div className="nordic-card p-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar className="mx-auto mb-2 opacity-50" size={24} />
                        <p>{translations.no_events}</p>
                    </div>
                )}
            </section>

            {/* 4. Upcoming Birthdays */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {translations.upcoming_birthdays}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                    {upcomingBirthdays.length > 0 ? (
                        upcomingBirthdays.map(student => (
                            <div key={student.id} className="nordic-card p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: 'var(--amber)' }}>
                                    {student.name[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {formatDate(student.nextBirthday as any)}
                                    </p>
                                </div>
                                <Star size={16} className="text-amber-400" fill="currentColor" />
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>{translations.no_birthdays}</p>
                    )}
                </div>
            </section>
        </div>
    );
}
