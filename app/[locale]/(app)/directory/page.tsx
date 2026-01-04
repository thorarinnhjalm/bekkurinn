'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Star, ChevronUp, Users, Loader2 } from 'lucide-react';
import { DietaryIcon } from '@/components/icons/DietaryIcons';
import { useStudents } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { Student, DietaryNeed } from '@/types';

/**
 * Directory Page - Sameiginleg skrá bekkjarins
 * 
 * Child-focused cards with expandable parent info
 * Now connected to real Firestore data!
 */

// TODO: Get this from user's class membership
const CLASS_ID = '0I3MpwErmopmxnREzoV5'; // From seed script

export default function DirectoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    console.log('🔍 DirectoryPage - CLASS_ID:', CLASS_ID);
    console.log('🔍 DirectoryPage - user:', user?.uid);
    console.log('🔍 DirectoryPage - authLoading:', authLoading);

    const { data: studentsData, isLoading: studentsLoading, error } = useStudents(CLASS_ID);

    console.log('🔍 DirectoryPage - studentsData:', studentsData);
    console.log('🔍 DirectoryPage - studentsLoading:', studentsLoading);
    console.log('🔍 DirectoryPage - error:', error);

    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [starredStudents, setStarredStudents] = useState<Set<string>>(new Set());

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/is/login');
        }
    }, [authLoading, user, router]);

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

    // Format date for display
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
    if (authLoading || studentsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--sage-green)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Hleður nemendum...</p>
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

    return (
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--sage-green)' }}>Skráin</h1>
                    {starredCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{ backgroundColor: 'var(--amber)20', color: 'var(--amber-dark)' }}>
                            <Star size={14} fill="currentColor" />
                            <span>{starredCount} vinir</span>
                        </div>
                    )}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Sameiginleg skrá yfir nemendur í Salaskóli 4. Bekkur
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
                                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                                        style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
                                    >
                                        {student.name[0]}
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
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Upplýsingar um foreldra verða bættar við þegar þeir skrá sig í kerfið.
                                    </p>
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
