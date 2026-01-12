'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Star, ChevronUp, Users, Loader2, Search } from 'lucide-react';
import { DietaryIcon } from '@/components/icons/DietaryIcons';
import { useStudents, useClass, useUserParentLink } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Student, DietaryNeed } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Directory Page - Sameiginleg skrá bekkjarins
 * 
 * V2: Glass Cards, Floating Search, Animated Interactions
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
    const { data: studentsData, isLoading: studentsLoading } = useStudents(classId || '');
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
    const myStudent = students.find(s => s.id === parentLink?.studentId);
    const userHasPhoto = !!user?.photoURL;
    const childHasPhoto = !!myStudent?.photoUrl;
    const canViewPhotos = userHasPhoto && childHasPhoto;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header with Glass Effect */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
                {/* Decorative background blur */}
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />

                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Skráin</h1>
                    <p className="text-lg text-gray-500 max-w-lg">
                        Allir vinirnir í <span className="font-semibold text-nordic-blue">{displayName}</span> á einum stað.
                    </p>
                </div>
                {starredCount > 0 && (
                    <div className="glass-card px-5 py-2 flex items-center gap-2 text-amber-600 font-bold animate-in zoom-in bg-amber-50/50 border-amber-100">
                        <Star size={18} fill="currentColor" />
                        <span>{starredCount} vinir í uppáhaldi</span>
                    </div>
                )}
            </header>

            {/* Floating Search Bar */}
            <div className="sticky top-4 z-20">
                <div className="relative group max-w-2xl mx-auto shadow-2xl shadow-blue-900/5 rounded-2xl">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-nordic-blue transition-colors" />
                    </div>
                    <input
                        type="search"
                        placeholder="Leita að nemanda..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-none outline-none ring-1 ring-black/5 bg-white/90 backdrop-blur-xl focus:ring-2 focus:ring-nordic-blue/50 focus:bg-white transition-all text-lg placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Student Count */}
            {students.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <Users size={14} />
                    <span>{sortedStudents.length} af {students.length} nemendum</span>
                </div>
            )}

            {/* Student Grid - Glass Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedStudents.map((student) => {
                    const isExpanded = expandedCards.has(student.id);
                    const isStarred = starredStudents.has(student.id);
                    const parents = parentsMap.get(student.id) || [];

                    return (
                        <div
                            key={student.id}
                            className={`glass-card group relative overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-nordic-blue/20 bg-white' : 'hover:bg-white/60'} ${isStarred ? 'ring-2 ring-amber-100 bg-amber-50/10' : ''}`}
                        >
                            {/* Star Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleStar(student.id); }}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all z-10 ${isStarred ? 'text-amber-400 bg-amber-50 scale-110' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}
                            >
                                <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                            </button>

                            {/* Child Info - Clickable to expand */}
                            <div
                                onClick={() => toggleExpand(student.id)}
                                className="p-6 cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    {/* Avatar */}
                                    <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm transition-transform duration-500 group-hover:scale-105 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600">
                                        {canViewPhotos && student.photoUrl ? (
                                            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <span>{student.name[0]}</span>
                                        )}
                                        {/* Dietary Badge */}
                                        {student.dietaryNeeds?.length ? (
                                            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-gray-50 z-20" title={student.dietaryNeeds.join(', ')}>
                                                <div className="w-6 h-6">
                                                    <DietaryIcon type={student.dietaryNeeds[0] as DietaryNeed} showLabel={false} size={16} />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-nordic-blue transition-colors truncate">
                                            {student.name.split(' ')[0]} <span className="text-gray-400 font-normal">{student.name.split(' ').slice(1).join(' ')}</span>
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                                            <span>🎂</span>
                                            {student.birthDate ? formatBirthDate(student.birthDate) : 'Vantar afmælisdag'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Parent Info */}
                            {isExpanded && (
                                <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Foreldrar & Aðstandendur</h4>
                                        {parents.length > 0 ? (
                                            parents.map((parent) => (
                                                <div key={parent.id} className="flex items-start gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                                                        {parent.displayName?.[0] || 'F'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm">{parent.displayName}</p>
                                                        <p className="text-xs text-gray-500 mb-2">{parent.role === 'admin' ? 'Kennari / Stjórnandi' : 'Foreldri'}</p>

                                                        <div className="flex flex-wrap gap-2">
                                                            {parent.phoneNumber && (
                                                                <a href={`tel:${parent.phoneNumber}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors">
                                                                    <Phone size={12} /> Hringja
                                                                </a>
                                                            )}
                                                            <a href={`mailto:${parent.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
                                                                <Mail size={12} /> Senda póst
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 bg-white/50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-sm text-gray-400">Engir foreldrar skráðir ennþá</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Collapse Button */}
                                    <button
                                        onClick={() => toggleExpand(student.id)}
                                        className="w-full mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 py-2 transition-colors"
                                    >
                                        <ChevronUp size={16} />
                                        <span className="text-xs font-bold uppercase">Loka</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {sortedStudents.length === 0 && (
                <div className="glass-card p-12 text-center max-w-lg mx-auto mt-12 bg-white/50">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-gray-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Engir nemendur fundust</h3>
                    <p className="text-gray-500 mt-2">Prófaðu að breyta leitarskilyrðum eða hafðu samband við stjórnanda.</p>
                </div>
            )}
        </div>
    );
}
