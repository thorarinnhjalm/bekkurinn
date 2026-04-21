'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Star, ChevronUp, Users, Loader2, Search, MapPin } from 'lucide-react';
import { addStarredStudent, removeStarredStudent, getStarredStudents } from '@/services/firestore';
import { DietaryIcon } from '@/components/icons/DietaryIcons';
import { useStudents, useClass, useUserParentLink } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import type { DietaryNeed } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslations } from 'next-intl';

/**
 * Directory Page - Sameiginleg skrá bekkjarins
 * fjord_moss / Academic Sanctuary redesign.
 */

export default function DirectoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('directory');
    const [classId, setClassId] = useState<string | null>(null);

    // Fetch user's newest admin class
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

    const { data: classData } = useClass(classId);
    const { data: studentsData, isLoading: studentsLoading } = useStudents(classId || '');
    const { data: parentLink } = useUserParentLink(user?.uid, classId);

    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [starredStudents, setStarredStudents] = useState<Set<string>>(new Set());
    const [parentsMap, setParentsMap] = useState<Map<string, any[]>>(new Map());

    // Load starred
    useEffect(() => {
        async function loadStarredStudents() {
            if (!user?.uid) return;
            try {
                const starred = await getStarredStudents(user.uid);
                setStarredStudents(new Set(starred));
            } catch (error) {
                console.error('Error loading starred students:', error);
            }
        }
        if (user?.uid) loadStarredStudents();
    }, [user?.uid]);

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [authLoading, user, router, locale]);

    // Fetch parents
    useEffect(() => {
        async function fetchParents() {
            if (!studentsData || studentsData.length === 0) return;
            try {
                const parentLinksQuery = query(
                    collection(db, 'parentLinks'),
                    where('classId', '==', classId),
                    where('status', '==', 'approved')
                );
                const parentLinksSnap = await getDocs(parentLinksQuery);
                let parentLinks = parentLinksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Fallback for legacy links missing classId
                const studentsWithParents = new Set(parentLinks.map((pl: any) => pl.studentId));
                const studentsWithoutParents = studentsData.filter(s => !studentsWithParents.has(s.id));

                if (studentsWithoutParents.length > 0) {
                    const studentIds = studentsWithoutParents.map(s => s.id);
                    const BATCH_SIZE = 10;
                    for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
                        const batch = studentIds.slice(i, i + BATCH_SIZE);
                        try {
                            const fallbackQuery = query(
                                collection(db, 'parentLinks'),
                                where('studentId', 'in', batch),
                                where('status', '==', 'approved')
                            );
                            const fallbackSnap = await getDocs(fallbackQuery);
                            const fallbackLinks = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                            parentLinks = [...parentLinks, ...fallbackLinks];
                        } catch (err) {
                            console.error('Fallback query failed', err);
                        }
                    }
                }

                const studentIdSet = new Set(studentsData.map(s => s.id));
                const textLinks = parentLinks.filter((pl: any) => studentIdSet.has(pl.studentId));
                const userIds = [...new Set(textLinks.map((pl: any) => pl.userId))];

                if (userIds.length === 0) {
                    setParentsMap(new Map());
                    return;
                }

                const usersQuery = query(
                    collection(db, 'users'),
                    where('__name__', 'in', userIds)
                );
                const usersSnap = await getDocs(usersQuery);
                const usersData = new Map();
                usersSnap.docs.forEach(d => {
                    usersData.set(d.id, { id: d.id, ...d.data() });
                });

                const newParentsMap = new Map<string, any[]>();
                parentLinks.forEach((link: any) => {
                    const parentUser = usersData.get(link.userId);
                    if (parentUser) {
                        const existing = newParentsMap.get(link.studentId) || [];
                        existing.push(parentUser);
                        newParentsMap.set(link.studentId, existing);
                    }
                });

                setParentsMap(newParentsMap);
            } catch (e) {
                console.error('Error fetching parents:', e);
            }
        }
        fetchParents();
    }, [studentsData, classId]);

    const toggleStar = async (studentId: string) => {
        if (!user?.uid) return;
        const newStarred = new Set(starredStudents);
        const isCurrentlyStarred = newStarred.has(studentId);
        if (isCurrentlyStarred) newStarred.delete(studentId);
        else newStarred.add(studentId);
        setStarredStudents(newStarred);
        try {
            if (isCurrentlyStarred) await removeStarredStudent(user.uid, studentId);
            else await addStarredStudent(user.uid, studentId);
        } catch (error) {
            console.error('Error toggling star:', error);
            setStarredStudents(starredStudents);
        }
    };

    const toggleExpand = (studentId: string) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(studentId)) newExpanded.delete(studentId);
        else newExpanded.add(studentId);
        setExpandedCards(newExpanded);
    };

    const formatBirthDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    if (authLoading || studentsLoading || !classId) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin text-primary" />
                    <p className="text-on-surface-variant">Hleður gögnum...</p>
                </div>
            </div>
        );
    }

    const students = studentsData || [];
    const sortedStudents = [...students]
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const aStarred = starredStudents.has(a.id);
            const bStarred = starredStudents.has(b.id);
            if (aStarred && !bStarred) return -1;
            if (!aStarred && bStarred) return 1;
            return a.name.localeCompare(b.name, locale);
        });

    const starredCount = starredStudents.size;
    const displayName = classData?.name || (classData?.grade ? `${classData.grade}. Bekkur` : 'Bekkurinn');

    // Fair photo logic — both sides share photos or neither sees them
    const myStudent = students.find(s => s.id === parentLink?.studentId);
    const userHasPhoto = !!user?.photoURL;
    const childHasPhoto = !!myStudent?.photoUrl;
    const canViewPhotos = userHasPhoto && childHasPhoto;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-3">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-on-surface-variant leading-relaxed">
                        {t('subtitle_prefix')}{' '}
                        <span className="font-semibold text-primary">{displayName}</span>{' '}
                        {t('subtitle_suffix')}
                    </p>
                </div>
                {starredCount > 0 && (
                    <div className="px-5 py-2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center gap-2 font-semibold shadow-ambient animate-in zoom-in">
                        <Star size={18} fill="currentColor" />
                        <span>{starredCount} {t('starred_friends')}</span>
                    </div>
                )}
            </header>

            {/* Utility bar: search + (future) filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                    <input
                        type="search"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-container-high text-on-surface placeholder:text-on-surface-variant rounded-full py-3 pl-12 pr-4 border-0 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                </div>

                {students.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest md:ml-auto">
                        <Users size={14} />
                        <span>
                            {t('student_count', { current: sortedStudents.length, total: students.length })}
                        </span>
                    </div>
                )}
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {sortedStudents.map((student) => {
                    const isExpanded = expandedCards.has(student.id);
                    const isStarred = starredStudents.has(student.id);
                    const parents = parentsMap.get(student.id) || [];

                    return (
                        <div
                            key={student.id}
                            className={`relative bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'ring-2 ring-primary/25' : ''
                            } ${isStarred ? 'ring-2 ring-tertiary-fixed' : ''}`}
                        >
                            {/* Star Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleStar(student.id); }}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all z-10 ${
                                    isStarred
                                        ? 'text-tertiary bg-tertiary-fixed scale-110'
                                        : 'text-on-surface-variant/50 hover:text-tertiary hover:bg-surface-container-high'
                                }`}
                                aria-label={isStarred ? 'Fjarlægja stjörnu' : 'Bæta við stjörnu'}
                            >
                                <Star size={20} fill={isStarred ? 'currentColor' : 'none'} />
                            </button>

                            {/* Child Info */}
                            <div
                                onClick={() => toggleExpand(student.id)}
                                className="p-6 cursor-pointer"
                            >
                                <div className="flex items-center gap-4 pr-10">
                                    {/* Avatar */}
                                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold bg-surface-container-high text-primary shrink-0">
                                        {canViewPhotos && student.photoUrl ? (
                                            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span>{student.name[0]}</span>
                                        )}
                                        {/* Dietary Badge */}
                                        {student.dietaryNeeds?.length ? (
                                            <div
                                                className="absolute -bottom-1 -right-1 bg-surface-container-lowest p-1 rounded-full shadow-ambient z-20"
                                                title={student.dietaryNeeds.join(', ')}
                                            >
                                                <div className="w-5 h-5">
                                                    <DietaryIcon type={student.dietaryNeeds[0] as DietaryNeed} showLabel={false} size={14} />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-on-surface truncate">
                                            {student.name.split(' ')[0]}{' '}
                                            <span className="text-on-surface-variant font-normal">
                                                {student.name.split(' ').slice(1).join(' ')}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                                            <span>🎂</span>
                                            {student.birthDate ? formatBirthDate(student.birthDate) : t('missing_birthday')}
                                        </p>
                                    </div>
                                </div>

                                {/* Dietary pills (full list if multiple) */}
                                {student.dietaryNeeds && student.dietaryNeeds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {student.dietaryNeeds.map((need) => (
                                            <div
                                                key={need}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/40 text-on-error-container text-xs font-medium"
                                            >
                                                <DietaryIcon type={need as DietaryNeed} showLabel={false} size={14} />
                                                <span>{need}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Expanded Parent Info */}
                            {isExpanded && (
                                <div className="bg-surface px-6 py-5 border-t border-outline-variant/20 animate-in slide-in-from-top-2">
                                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                                        {t('parents_title')}
                                    </h4>
                                    <div className="space-y-3">
                                        {parents.length > 0 ? (
                                            parents.map((parent) => (
                                                <div
                                                    key={parent.id}
                                                    className="p-4 rounded-2xl bg-surface-container-lowest shadow-ambient"
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary-container/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                                                            {parent.displayName?.[0] || 'F'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-on-surface text-sm truncate">
                                                                {parent.displayName}
                                                            </p>
                                                            <p className="text-xs text-on-surface-variant">
                                                                {parent.role === 'admin' ? t('teacher_role') : t('parent_role')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {parent.phone && parent.isPhoneVisible && (
                                                            <a
                                                                href={`tel:${parent.phone}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-container transition-colors"
                                                            >
                                                                <Phone size={13} /> {t('call')}
                                                            </a>
                                                        )}
                                                        <a
                                                            href={`mailto:${parent.email}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-container transition-colors"
                                                        >
                                                            <Mail size={13} /> {t('email')}
                                                        </a>
                                                    </div>

                                                    {parent.address && (
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parent.address)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-3 flex items-start gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors group/addr"
                                                        >
                                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                                            <span className="underline-offset-2 group-hover/addr:underline">
                                                                {parent.address}
                                                            </span>
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 rounded-xl bg-surface-container-low">
                                                <p className="text-sm text-on-surface-variant">{t('no_parents')}</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggleExpand(student.id)}
                                        className="w-full mt-4 flex items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface py-2 transition-colors"
                                    >
                                        <ChevronUp size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wide">{t('close')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {sortedStudents.length === 0 && (
                <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-12 text-center max-w-lg mx-auto mt-12">
                    <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-on-surface-variant" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">{t('no_results_title')}</h3>
                    <p className="text-on-surface-variant mt-2">{t('no_results_desc')}</p>
                </div>
            )}
        </div>
    );
}
