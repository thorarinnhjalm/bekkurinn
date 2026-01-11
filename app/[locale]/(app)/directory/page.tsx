'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Star, ChevronUp, Users, Loader2 } from 'lucide-react';
import { DietaryIcon } from '@/components/icons/DietaryIcons';
import { useStudents, useClass, useUserParentLink } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Student, DietaryNeed } from '@/types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Directory Page - Sameiginleg skrá bekkjarins
 * 
 * Child-focused cards with expandable parent info
 * Now connected to real Firestore data!
 */

export default function DirectoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [classId, setClassId] = useState<string | null>(null);

    // 1. Fetch User Class (Newest)
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
    const { data: studentsData, isLoading: studentsLoading, error } = useStudents(classId || '');
    const { data: parentLink } = useUserParentLink(user?.uid, classId);

    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [starredStudents, setStarredStudents] = useState<Set<string>>(new Set());
    const [parentsMap, setParentsMap] = useState<Map<string, any[]>>(new Map());

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/is/login');
        }
    }, [authLoading, user, router]);

    // Fetch parent data for all students
    useEffect(() => {
        async function fetchParents() {
            if (!studentsData || studentsData.length === 0) return;

            try {
                const studentIds = studentsData.map(s => s.id);

                // Fetch all parent links for these students
                const parentLinksQuery = query(
                    collection(db, 'parentLinks'),
                    where('studentId', 'in', studentIds),
                    where('status', '==', 'approved')
                );
                const parentLinksSnap = await getDocs(parentLinksQuery);
                const parentLinks = parentLinksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Get unique user IDs
                const userIds = [...new Set(parentLinks.map((pl: any) => pl.userId))];

                if (userIds.length === 0) {
                    setParentsMap(new Map());
                    return;
                }

                // Fetch user data for all parents
                const usersQuery = query(
                    collection(db, 'users'),
                    where('__name__', 'in', userIds)
                );
                const usersSnap = await getDocs(usersQuery);
                const usersData = new Map();
                usersSnap.docs.forEach(d => {
                    usersData.set(d.id, { id: d.id, ...d.data() });
                });

                // Build map: studentId -> array of parent user objects
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
    }, [studentsData]);

    // Format helpers and event handlers...
    const toggleStar = (studentId: string) => {
        const newStarred = new Set(starredStudents);
        if (newStarred.has(studentId)) {
            newStarred.delete(studentId);
        } else {
            newStarred.add(studentId);
        }
        setStarredStudents(newStarred);
    };

    const toggleExpand = (studentId: string) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(studentId)) {
            newExpanded.delete(studentId);
        } else {
            newExpanded.add(studentId);
        }
        setExpandedCards(newExpanded);
    };

    const formatBirthDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Loading state
    if (authLoading || studentsLoading || !classId) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--nordic-blue)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Hleður gögnum...</p>
                </div>
            </div>
        );
    }

    const students = studentsData || [];

    // Filter and sort students
    const sortedStudents = [...students]
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const aStarred = starredStudents.has(a.id);
            const bStarred = starredStudents.has(b.id);
            if (aStarred && !bStarred) return -1;
            if (!aStarred && bStarred) return 1;
            return a.name.localeCompare(b.name, 'is');
        });

    const starredCount = starredStudents.size;
    const displayName = classData?.name || (classData?.grade ? `${classData.grade}. Bekkur` : 'Bekkurinn');

    // FAIR PHOTO LOGIC
    // Rule: User can only see photos if:
    // 1. User has a photo (user.photoURL)
    // 2. User's child has a photo (myStudent.photoUrl)
    const myStudent = students.find(s => s.id === parentLink?.studentId);
    const userHasPhoto = !!user?.photoURL;
    const childHasPhoto = !!myStudent?.photoUrl;

    // If user is admin (no child linked yet), maybe allow? 
    // For now, strict adherence to "Fairness" for parents.
    // If no child linked, canViewPhotos is false (unless we change requirement).
    // Assuming for now: Must have child + photo to participate in visual directory.
    const canViewPhotos = userHasPhoto && childHasPhoto;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Skráin</h1>
                    <p className="text-gray-500 mt-1">
                        Sameiginleg skrá yfir nemendur í {displayName}
                    </p>
                </div>
                {starredCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm animate-in zoom-in">
                        <Star size={16} fill="currentColor" />
                        <span>{starredCount} vinir</span>
                    </div>
                )}
            </header>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-nordic-blue transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="search"
                    placeholder="Leita að nemanda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all shadow-sm text-lg"
                />
            </div>

            {/* Student Count */}
            {students.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 px-1">
                    <Users size={16} />
                    <span>{sortedStudents.length} af {students.length} nemendum</span>
                </div>
            )}

            {/* Student Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedStudents.map((student) => {
                    const isExpanded = expandedCards.has(student.id);
                    const isStarred = starredStudents.has(student.id);

                    return (
                        <div
                            key={student.id}
                            className={`nordic-card group transition-all duration-300 ${isStarred ? 'ring-2 ring-amber-100 shadow-md transform -translate-y-1' : 'hover:shadow-card-hover hover:-translate-y-1'}`}
                        >
                            {/* Child Info - Clickable to expand */}
                            <div
                                onClick={() => toggleExpand(student.id)}
                                className="p-6 cursor-pointer relative"
                            >
                                {/* Star Button - Absolute Top Right */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStar(student.id); }}
                                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10 ${isStarred ? 'text-amber-400 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50'}`}
                                >
                                    <Star size={22} fill={isStarred ? 'currentColor' : 'none'} className="transition-transform active:scale-95" />
                                </button>

                                <div className="flex items-center gap-5">
                                    {/* Photo Placeholder */}
                                    <div className="relative">
                                        <div
                                            className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 text-3xl font-bold overflow-hidden shadow-sm transition-transform group-hover:scale-105 ${student.photoUrl ? 'bg-gray-100' : 'bg-gradient-to-br from-nordic-blue to-blue-600 text-white'}`}
                                        >
                                            {canViewPhotos && student.photoUrl ? (
                                                <img
                                                    src={student.photoUrl}
                                                    alt={student.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                student.name[0]
                                            )}
                                        </div>
                                        {/* Status Indicator (Optional idea for later: Online/Active) */}
                                    </div>


                                    <div className="flex-1 min-w-0 py-1">
                                        <h3 className="text-xl font-bold text-gray-900 truncate mb-1 group-hover:text-nordic-blue transition-colors">
                                            {student.name}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                                            🎂 {formatBirthDate(student.birthDate)}
                                        </p>

                                        {/* Dietary Icons as small pills */}
                                        {student.dietaryNeeds && student.dietaryNeeds.length > 0 && (
                                            <div className="flex gap-1.5 flex-wrap">
                                                {student.dietaryNeeds.map((type: DietaryNeed) => (
                                                    <div key={type} className="opacity-80 hover:opacity-100 transition-opacity" title={type}>
                                                        <DietaryIcon type={type} size={16} showLabel={false} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Action Bar / Hint */}
                                <div className={`mt-4 pt-4 flex items-center justify-between text-sm font-medium transition-colors border-t border-gray-50 ${isExpanded ? 'text-nordic-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        <span>Foreldrar</span>
                                    </div>
                                    <ChevronUp size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
                                </div>
                            </div>

                            {/* Parent Info - Expandable */}
                            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-gray-50/50 p-6 pt-2 space-y-3 pb-6 border-t border-gray-100">
                                    {parentsMap.get(student.id) && parentsMap.get(student.id)!.length > 0 ? (
                                        <div className="space-y-3">
                                            {parentsMap.get(student.id)!.map((parent: any, idx: number) => (
                                                <div key={parent.id || idx} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:border-blue-200 transition-colors">
                                                    {/* Parent Photo */}
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-400 border border-gray-50">
                                                        {canViewPhotos && parent.photoURL ? (
                                                            <img
                                                                src={parent.photoURL}
                                                                alt={parent.displayName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            (parent.displayName || '?')[0].toUpperCase()
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                                            {parent.displayName || 'Nafnlaust'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                                                            {parent.phone && parent.isPhoneVisible && (
                                                                <a
                                                                    href={`tel:${parent.phone}`}
                                                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-nordic-blue transition-colors"
                                                                >
                                                                    <Phone size={12} />
                                                                    {parent.phone}
                                                                </a>
                                                            )}
                                                            {/* Only show address if available */}
                                                            {parent.address && (
                                                                <a
                                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parent.address)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-nordic-blue transition-colors"
                                                                >
                                                                    <span>📍</span>
                                                                    <span className="truncate max-w-[150px]">{parent.address}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-center py-2 text-gray-500 italic bg-white rounded-lg border border-gray-100 border-dashed">
                                            Engir foreldrar skráðir í kerfið
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {students.length === 0 && (
                <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Users size={40} className="text-nordic-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Engir nemendur fundust</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Það lítur út fyrir að engir nemendur séu komnir í bekkinn. Bekkjarfulltrúi þarf að bæta þeim við eða senda út boðsmiða.
                    </p>
                    {/* Could add CTA here for admins */}
                </div>
            )}

            {/* Start your search empty state */}
            {students.length > 0 && sortedStudents.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-block p-4 rounded-full bg-gray-50 mb-4">
                        <Users size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Engar niðurstöður</h3>
                    <p className="text-gray-500">Enginn nemandi fannst með nafnið "{searchQuery}"</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-nordic-blue font-medium hover:underline"
                    >
                        Hreinsa leit
                    </button>
                </div>
            )}
        </div>
    );
}
