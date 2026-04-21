'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAnnouncements, useTasks, useStudents, useClass, useUserClasses, useUserParentLink, useAgreement } from '@/hooks/useFirestore';
import { Loader2, Calendar, Cake, Megaphone, ChevronRight, ChevronDown, UserPlus, Users, Settings, Copy, Check, ShieldCheck, Pin } from 'lucide-react';

import Link from 'next/link';
import PendingApprovals from '@/components/dashboard/PendingApprovals';

// Icelandic month/weekday names (fallback when Intl.DateTimeFormat lacks is-IS)
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

const formatDateIcelandic = (date: Date, options: { day?: boolean; month?: 'long' | 'short'; weekday?: boolean }) => {
    const parts: string[] = [];
    if (options.weekday) parts.push(ICELANDIC_WEEKDAYS[date.getDay()]);
    if (options.day) parts.push(`${date.getDate()}.`);
    if (options.month === 'long') parts.push(ICELANDIC_MONTHS[date.getMonth()]);
    else if (options.month === 'short') parts.push(ICELANDIC_MONTHS_SHORT[date.getMonth()]);
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

    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid, user?.email);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    useEffect(() => {
        if (userClasses && userClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(userClasses[0].id);
        }
    }, [userClasses, selectedClassId]);

    const activeClass = userClasses?.find(c => c.id === selectedClassId) || (userClasses?.[0] || null);
    const classId = activeClass?.id || null;
    const isAdmin = activeClass?.role === 'admin';

    const { data: classData, isLoading: classLoading } = useClass(classId);
    const { data: parentLink, isLoading: parentLinkLoading } = useUserParentLink(user?.uid, classId);
    const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements(classId, activeClass?.schoolId);
    const { data: tasksData, isLoading: tasksLoading } = useTasks(classId, activeClass?.schoolId);
    const { data: studentsData, isLoading: studentsLoading } = useStudents(classId);
    const { data: agreementData } = useAgreement(classId);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [authLoading, user, router, locale]);

    useEffect(() => {
        if (!authLoading && !classesLoading && user && (!userClasses || userClasses.length === 0)) {
            router.push(`/${locale}/onboarding`);
        }
    }, [authLoading, classesLoading, user, userClasses, router, locale]);

    const [showWizard, setShowWizard] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('welcome') === 'true') {
            setShowWizard(true);
        }
    }, [searchParams]);

    const [copied, setCopied] = useState(false);
    const handleCopyJoinLink = () => {
        if (!classData?.joinCode || !user?.uid) return;
        const link = `${window.location.origin}/${locale}/onboarding?step=join&code=${classData.joinCode}&inviterId=${user.uid}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const toJsDate = (dateField: any): Date | null => {
        if (!dateField) return null;
        if (typeof dateField.toDate === 'function') return dateField.toDate();
        if (dateField instanceof Date) return dateField;
        const d = new Date(dateField);
        return isNaN(d.getTime()) ? null : d;
    };

    const formatDate = (timestamp: any) => {
        const date = toJsDate(timestamp);
        if (!date) return '';
        const formatted = formatDateIcelandic(date, { weekday: true, day: true, month: 'long' });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    if (authLoading || announcementsLoading || tasksLoading || studentsLoading || classLoading || classesLoading || parentLinkLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Foreldri';

    const displayClassName = classData
        ? (classData.schoolName && classData.grade
            ? `${classData.grade}. Bekkur ${classData.section || ''} - ${classData.schoolName}`
            : classData.name)
        : 'Bekkurinn';

    const getSimpleClassName = (c: any) => {
        return c.schoolName && c.grade ? `${c.grade}. Bekkur ${c.section || ''}` : c.name || 'Bekkur';
    };

    const announcements = announcementsData || [];
    const latestAnnouncement = announcements.length > 0
        ? [...announcements].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        })[0]
        : null;

    const now = new Date();
    const upcomingTasks = (tasksData || [])
        .map(t => ({ ...t, jsDate: toJsDate(t.date) }))
        .filter(t => t.jsDate && t.jsDate >= now)
        .sort((a, b) => (a.jsDate?.getTime() || 0) - (b.jsDate?.getTime() || 0))
        .slice(0, 4);

    const upcomingBirthdays = (studentsData || [])
        .filter(s => s.birthDate)
        .map(s => {
            const birthDate = toJsDate(s.birthDate);
            if (!birthDate || isNaN(birthDate.getTime())) return null;
            const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if (thisYearBirthday < now && thisYearBirthday.getDate() !== now.getDate()) {
                thisYearBirthday.setFullYear(now.getFullYear() + 1);
            }
            return { ...s, nextBirthday: thisYearBirthday };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime())
        .slice(0, 3);

    // --- SHOW BLOCKING "PENDING APPROVAL" UI ---
    if (parentLink && parentLink.status === 'pending' && !isAdmin) {
        return (
            <div className="min-h-screen p-4 pb-24 pt-24 max-w-lg mx-auto flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-tertiary-fixed text-on-tertiary-fixed">
                    <UserPlus size={40} />
                </div>

                <h1 className="text-3xl font-bold text-on-surface">Beðið eftir samþykki</h1>
                <p className="text-lg text-on-surface-variant">
                    Beiðni þín um að tengjast {displayClassName} hefur verið send.
                    <br /><br />
                    Foreldrið sem skráði barnið þarf að samþykkja beiðnina áður en þú færð aðgang.
                </p>

                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-ambient w-full">
                    <p className="text-sm text-on-surface-variant mb-4">
                        Þú færð aðgang um leið og beiðnin er samþykkt.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 rounded-full font-bold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary-container"
                    >
                        Endurhlaða síðu
                    </button>
                    <button
                        onClick={() => router.push(`/${locale}/user/profile`)}
                        className="mt-4 text-sm text-on-surface-variant hover:text-primary underline underline-offset-4"
                    >
                        Fara á minn prófíl
                    </button>
                </div>
            </div>
        );
    }

    // --- SHOW BLOCKING "CREATE STUDENT" UI IF NO PARENT LINK ---
    if (!parentLink && classId && !isAdmin) {
        return (
            <div className="min-h-screen p-4 pb-24 pt-24 max-w-5xl mx-auto flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary-container/10 text-primary">
                    <UserPlus size={40} />
                </div>

                <h1 className="text-3xl font-bold text-on-surface">Velkomin í {displayClassName}</h1>
                <p className="text-lg text-on-surface-variant max-w-md">
                    Til að sjá viðburði, afmæli og tilkynningar þarftu að skrá barnið þitt.
                </p>

                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-ambient w-full max-w-md">
                    <Link
                        href={`/${locale}/onboarding?step=join${classData?.joinCode ? `&code=${classData.joinCode}` : ''}`}
                        className="w-full inline-flex justify-center items-center gap-2 py-4 rounded-full font-bold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary-container"
                    >
                        <UserPlus size={20} />
                        Stofna / Velja Nemanda
                    </Link>
                    <p className="text-xs text-on-surface-variant mt-4">
                        Þegar þú hefur tengt barnið þitt opnast stjórnborðið sjálfkrafa.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* 1. Greeting Header - editorial, no hero card */}
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight">
                        Góðan daginn, <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">{firstName}</span>
                    </h1>
                    <p className="text-lg text-on-surface-variant leading-relaxed">
                        Þú ert að skoða <span className="font-semibold text-on-surface">{displayClassName}</span>. Hér er yfirlit dagsins.
                    </p>
                </div>

                {/* Class Switcher */}
                {userClasses && userClasses.length > 1 && (
                    <div className="relative group">
                        <button className="flex items-center gap-3 bg-surface-container-lowest shadow-ambient px-5 py-3 rounded-full transition-all hover:-translate-y-0.5">
                            <span className="font-semibold text-on-surface">{getSimpleClassName(activeClass)}</span>
                            <ChevronDown size={18} className="text-on-surface-variant" />
                        </button>

                        <div className="absolute right-0 mt-3 w-72 bg-surface-container-lowest rounded-2xl shadow-ambient ghost-border p-2 hidden group-hover:block z-20">
                            {userClasses.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedClassId(c.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${selectedClassId === c.id ? 'bg-primary-container/10 text-primary font-bold' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
                                >
                                    <span>{getSimpleClassName(c)}</span>
                                    {selectedClassId === c.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* --- MAIN CONTENT (Left) --- */}
                <div className="lg:col-span-8 space-y-6 lg:space-y-8">

                    {classId && (
                        <PendingApprovals
                            classId={classId}
                            myStudentId={parentLink?.studentId}
                            isAdmin={isAdmin}
                        />
                    )}

                    {/* Upcoming events - "Hvað er framundan?" */}
                    <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-ambient">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-on-surface tracking-tight">Hvað er framundan?</h2>
                            <Link href={`/${locale}/calendar`} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                                Sjá allt <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {upcomingTasks.length > 0 ? upcomingTasks.map((task: any) => {
                                const isSchoolEvent = task.type === 'school_event';
                                const dateObj = task.jsDate;
                                const isToday = dateObj && dateObj.toDateString() === now.toDateString();
                                const dateLabel = isToday ? 'Í dag' : dateObj ? formatDateIcelandic(dateObj, { weekday: true }) : '';

                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-4 p-4 rounded-2xl bg-surface hover:bg-surface-container-low transition-colors ghost-border"
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isSchoolEvent ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-container text-on-secondary-container'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="font-semibold text-on-surface truncate">{task.title}</h3>
                                                {dateLabel && (
                                                    <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-md shrink-0 capitalize">
                                                        {dateLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                                                {isSchoolEvent ? 'Skóladagatal' : 'Foreldrastarf'}
                                                {(task.isAllDay || isSchoolEvent) && <span className="ml-2">• Allan daginn</span>}
                                                {(task.slotsTotal > 0 && !isSchoolEvent) && (
                                                    <span className="ml-2">• Skráðir: {task.slotsFilled}/{task.slotsTotal}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-12 text-center rounded-2xl bg-surface-container-low">
                                    <div className="w-14 h-14 bg-surface-container-lowest rounded-full flex items-center justify-center mx-auto mb-3 shadow-ambient">
                                        <Calendar className="text-on-surface-variant" size={22} />
                                    </div>
                                    <p className="text-on-surface-variant font-medium">Ekkert á dagatalinu í augnablikinu</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Latest Announcement - tertiary accent bar */}
                    {latestAnnouncement && (
                        <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-ambient relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" aria-hidden="true" />
                            <div className="flex items-center gap-3 mb-4">
                                <Pin size={20} className="text-tertiary" />
                                <h2 className="text-xl font-bold text-on-surface tracking-tight">Nýjasta tilkynningin</h2>
                            </div>

                            <div className="bg-surface-container-low rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    {latestAnnouncement.pinned && (
                                        <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold rounded-md uppercase tracking-wider">
                                            Mikilvægt
                                        </span>
                                    )}
                                    <span className="text-xs font-medium text-on-surface-variant">
                                        {formatDate(latestAnnouncement.createdAt)}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-on-surface leading-snug mb-2">
                                    {latestAnnouncement.title}
                                </h3>
                                <p className="text-on-surface-variant leading-relaxed line-clamp-3 text-sm">
                                    {latestAnnouncement.content}
                                </p>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-semibold text-xs">
                                            {(latestAnnouncement.author || 'S')[0]}
                                        </div>
                                        <span className="text-xs font-medium text-on-surface-variant">{latestAnnouncement.author || 'Stjórn'}</span>
                                    </div>
                                    <Link
                                        href={`/${locale}/announcements`}
                                        className="text-sm font-medium text-primary hover:text-primary-container transition-colors"
                                    >
                                        Sjá nánar
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* --- SIDEBAR CONTENT (Right) --- */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Birthdays Card */}
                    <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                                <Cake size={18} />
                            </div>
                            <h3 className="font-bold text-on-surface">{translations.upcoming_birthdays}</h3>
                        </div>

                        <div className="space-y-3">
                            {upcomingBirthdays.length > 0 ? (
                                upcomingBirthdays.map((student) => {
                                    const daysAway = Math.floor((student.nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    const isThisWeek = daysAway >= 0 && daysAway <= 7;
                                    return (
                                        <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${isThisWeek ? 'border-tertiary-fixed' : 'border-outline-variant/30'}`}>
                                                    <span className="text-xs font-bold text-on-surface">{student.nextBirthday.getDate()}</span>
                                                </div>
                                                <span className="text-sm font-medium text-on-surface">{student.name.split(' ')[0]}</span>
                                            </div>
                                            <span className="text-xs text-on-surface-variant capitalize">
                                                {isThisWeek ? formatDateIcelandic(student.nextBirthday, { weekday: true }).slice(0, 3) : ICELANDIC_MONTHS_SHORT[student.nextBirthday.getMonth()]}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-on-surface-variant text-center py-4">Engin afmæli á næstunni</p>
                            )}
                        </div>
                    </section>

                    {/* Yfirlit bekkjar / Quick nav */}
                    <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient space-y-3">
                        <h3 className="font-bold text-on-surface mb-2">Yfirlit bekkjar</h3>

                        <button
                            onClick={() => router.push(`/${locale}/directory`)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-container-low transition-colors ghost-border"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                                    <Users size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-on-surface">Nemendaskrá</div>
                                    <div className="text-xs text-on-surface-variant">{studentsData?.length || 0} nemendur</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-on-surface-variant" />
                        </button>

                        <button
                            onClick={() => router.push(`/${locale}/agreement`)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-container-low transition-colors ghost-border"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agreementData ? 'bg-primary-container/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                    <ShieldCheck size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-on-surface">Bekkjarsáttmáli</div>
                                    <div className="text-xs text-on-surface-variant">
                                        {agreementData ? 'Skoða sáttmála' : (isAdmin ? 'Stofna' : 'Vantar')}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-on-surface-variant" />
                        </button>

                        <button
                            onClick={() => router.push(`/${locale}/announcements?new=1`)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-container-low transition-colors ghost-border"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                                    <Megaphone size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-on-surface">Ný tilkynning</div>
                                    <div className="text-xs text-on-surface-variant">Sendu á bekkinn</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-on-surface-variant" />
                        </button>
                    </section>

                    {/* Invite Card - primary gradient */}
                    <section className="p-6 rounded-3xl shadow-ambient relative overflow-hidden bg-gradient-to-br from-primary to-primary-container text-on-primary">
                        <div className="relative z-10 space-y-4">
                            <div className="w-11 h-11 bg-on-primary/15 rounded-2xl flex items-center justify-center">
                                <UserPlus size={22} className="text-on-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-on-primary">Stækkaðu hópinn</h3>
                                <p className="text-on-primary/85 text-sm mt-1 leading-relaxed">
                                    Vantar fleiri foreldra í bekkinn? Deildu hlekknum beint á þá eða í Facebook-hópinn.
                                </p>
                            </div>

                            <button
                                onClick={handleCopyJoinLink}
                                className={`w-full py-3 px-4 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-ambient ${copied
                                    ? 'bg-on-primary text-primary'
                                    : 'bg-surface-container-lowest text-primary hover:-translate-y-0.5 active:translate-y-0'
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
                    </section>

                    {isAdmin && (
                        <Link
                            href={`/${locale}/settings`}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary-container"
                        >
                            <Settings size={18} />
                            Stjórna bekk
                        </Link>
                    )}

                    {user?.email === 'thorarinnhjalmarsson@gmail.com' && (
                        <Link
                            href={`/${locale}/admin`}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-on-surface bg-surface-container-high hover:bg-surface-container transition-colors ghost-border"
                        >
                            <Users size={18} />
                            Kerfisstjórn
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
