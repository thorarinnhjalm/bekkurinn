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
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24 max-w-5xl mx-auto">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>Skráin</h1>
                    {starredCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{ backgroundColor: 'var(--amber)20', color: 'var(--amber-dark)' }}>
                            <Star size={14} fill="currentColor" />
                            <span>{starredCount} vinir</span>
                        </div>
                    )}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Sameiginleg skrá yfir nemendur í {displayName}
                </p>
            </header>

            {/* Search */}
            <div className="nordic-card p-4">
                <input
                    type="search"
                    placeholder="Leita að nemanda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--paper)' }}
                />
            </div>

            {/* Student Count */}
            {students.length > 0 && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <Users size={16} />
                    <span>{sortedStudents.length} af {students.length} nemendum</span>
                </div>
            )}

            {/* Student Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedStudents.map((student) => {
                    const isExpanded = expandedCards.has(student.id);
                    const isStarred = starredStudents.has(student.id);

                    return (
                        <div
                            key={student.id}
                            className="nordic-card overflow-hidden transition-all"
                            style={{
                                borderColor: isStarred ? 'var(--amber)' : 'var(--border-light)',
                                borderWidth: isStarred ? '2px' : '1px'
                            }}
                        >
                            {/* Child Info - Clickable to expand */}
                            <div
                                onClick={() => toggleExpand(student.id)}
                                className="p-5 cursor-pointer hover:bg-opacity-50 transition-colors relative"
                                style={{ backgroundColor: isExpanded ? 'var(--stone)' : 'transparent' }}
                            >
                                {/* Star Button - Top Right */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStar(student.id); }}
                                    className="absolute top-3 right-3 tap-target p-2 rounded-lg transition-colors z-10"
                                    style={{ color: isStarred ? 'var(--amber)' : 'var(--text-tertiary)' }}
                                >
                                    <Star size={20} fill={isStarred ? 'currentColor' : 'none'} />
                                </button>

                                <div className="flex items-start gap-3 pr-10">
                                    {/* Photo Placeholder */}
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold overflow-hidden bg-gray-200"
                                        style={{ backgroundColor: 'var(--nordic-blue)', color: 'white' }}
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

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                            {student.name}
                                        </h3>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            {formatBirthDate(student.birthDate)}
                                        </p>

                                        {/* Dietary Icons */}
                                        {student.dietaryNeeds && student.dietaryNeeds.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {student.dietaryNeeds.map((type: DietaryNeed) => (
                                                    <DietaryIcon key={type} type={type} size={14} showLabel={false} />
                                                ))}
                                            </div>
                                        )}

                                        {/* Expansion hint */}
                                        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {isExpanded ? <ChevronUp size={14} /> : <Users size={14} />}
                                            <span>{isExpanded ? 'Fela foreldra' : 'Smelltu til að sjá foreldra'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parent Info - Expandable */}
                            {isExpanded && (
                                <div
                                    className="border-t px-5 py-4 space-y-3"
                                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--paper)' }}
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                                        Foreldrar
                                    </p>
                                    {parentsMap.get(student.id) && parentsMap.get(student.id)!.length > 0 ? (
                                        <div className="space-y-3">
                                            {parentsMap.get(student.id)!.map((parent: any, idx: number) => (
                                                <div key={parent.id || idx} className="bg-stone-50 p-3 rounded-lg flex items-start gap-3">
                                                    {/* Parent Photo */}
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-500">
                                                        {canViewPhotos && parent.photoURL ? (
                                                            <img
                                                                src={parent.photoURL}
                                                                alt={parent.displayName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            (parent.displayName || '?')[0]
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                            {parent.displayName || 'Nafnlaust'}
                                                        </p>
                                                        {parent.phone && parent.isPhoneVisible && (
                                                            <a
                                                                href={`tel:${parent.phone}`}
                                                                className="flex items-center gap-2 text-sm mt-1 hover:underline"
                                                                style={{ color: 'var(--nordic-blue)' }}
                                                            >
                                                                <Phone size={14} />
                                                                {parent.phone}
                                                            </a>
                                                        )}
                                                        {parent.address && (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parent.address)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-xs mt-1 hover:underline"
                                                                style={{ color: 'var(--text-secondary)' }}
                                                            >
                                                                🗺️ {parent.address}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            Upplýsingar um foreldra verða bættar við þegar þeir skrá sig í kerfið.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {students.length === 0 && (
                <div className="text-center py-12">
                    <Users size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
                    <h3 className="text-lg font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                        Engir nemendur enn
                    </h3>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Bekkjarformaður þarf að bæta nemendum við
                    </p>
                </div>
            )}
        </div>
    );
}
