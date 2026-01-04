'use client';

import { useState } from 'react';
import { Phone, Mail, Star, ChevronUp, Users } from 'lucide-react';
import { DietaryIcon } from '@/components/icons/DietaryIcons';

/**
 * Directory Page - Sameiginleg skrá bekkjarins
 * 
 * Child-focused cards with expandable parent info
 * Ability to star friends to sort at top
 * Responsive: Mobile single column, Tablet 2 cols, Desktop 3 cols
 */

interface Student {
    id: number;
    name: string;
    photo: string | null;
    birthDate: string;
    dietary: readonly ('peanut' | 'gluten' | 'dairy' | 'vegan' | 'pork')[];
    starred: boolean;
    parents: {
        name: string;
        phone: string;
        email: string;
        photo: string | null;
    }[];
}

// Initial mock data - all 15 students
const initialStudents: Student[] = [
    { id: 1, name: 'Ari Jónsson', photo: null, birthDate: '15. janúar 2016', dietary: ['peanut'], starred: false, parents: [{ name: 'Anna Jónsdóttir', phone: '+354 691 2345', email: 'anna.jonsdottir@example.is', photo: null }, { name: 'Ágúst Jónsson', phone: '+354 692 3456', email: 'agust.jonsson@example.is', photo: null }] },
    { id: 2, name: 'Auður Sigurðardóttir', photo: null, birthDate: '22. mars 2016', dietary: [], starred: true, parents: [{ name: 'Birna Sigurðardóttir', phone: '+354 693 4567', email: 'birna.sigurdardottir@example.is', photo: null }, { name: 'Baldur Sigurðsson', phone: '+354 694 5678', email: 'baldur.sigurdsson@example.is', photo: null }] },
    { id: 3, name: 'Baldur Gunnarsson', photo: null, birthDate: '8. júní 2016', dietary: ['gluten', 'dairy'], starred: false, parents: [{ name: 'Dóra Gunnarsdóttir', phone: '+354 695 6789', email: 'dora.gunnarsdottir@example.is', photo: null }, { name: 'Dagur Gunnarsson', phone: '+354 696 7890', email: 'dagur.gunnarsson@example.is', photo: null }] },
    { id: 4, name: 'Bryndís Ólafsdóttir', photo: null, birthDate: '14. september 2016', dietary: [], starred: true, parents: [{ name: 'Elsa Ólafsdóttir', phone: '+354 697 8901', email: 'elsa.olafsdottir@example.is', photo: null }, { name: 'Emil Ólafsson', phone: '+354 698 9012', email: 'emil.olafsson@example.is', photo: null }] },
    { id: 5, name: 'Dagur Kristjánsson', photo: null, birthDate: '3. apríl 2016', dietary: ['vegan'], starred: false, parents: [{ name: 'Freyja Kristjánsdóttir', phone: '+354 699 0123', email: 'freyja.kristjansdottir@example.is', photo: null }, { name: 'Friðrik Kristjánsson', phone: '+354 691 1234', email: 'fridrik.kristjansson@example.is', photo: null }] },
    { id: 6, name: 'Elín Magnúsdóttir', photo: null, birthDate: '17. nóvember 2016', dietary: [], starred: false, parents: [{ name: 'Guðrún Magnúsdóttir', phone: '+354 692 2345', email: 'gudrun.magnusdottir@example.is', photo: null }, { name: 'Gunnar Magnússon', phone: '+354 693 3456', email: 'gunnar.magnusson@example.is', photo: null }] },
    { id: 7, name: 'Einar Einarsson', photo: null, birthDate: '29. júlí 2016', dietary: ['pork'], starred: false, parents: [{ name: 'Helga Einarsdóttir', phone: '+354 694 4567', email: 'helga.einarsdottir@example.is', photo: null }, { name: 'Halldór Einarsson', phone: '+354 695 5678', email: 'halldor.einarsson@example.is', photo: null }] },
    { id: 8, name: 'Finnur Þorsteinsson', photo: null, birthDate: '11. febrúar 2016', dietary: [], starred: false, parents: [{ name: 'Inga Þorsteinsdóttir', phone: '+354 696 6789', email: 'inga.thorsteinsdottir@example.is', photo: null }, { name: 'Ívar Þorsteinsson', phone: '+354 697 7890', email: 'ivar.thorsteinsson@example.is', photo: null }] },
    { id: 9, name: 'Guðrún Jónsdóttir', photo: null, birthDate: '25. maí 2016', dietary: ['gluten'], starred: false, parents: [{ name: 'Katrín Jónsdóttir', phone: '+354 698 8901', email: 'katrin.jonsdottir@example.is', photo: null }, { name: 'Jónas Jónsson', phone: '+354 699 9012', email: 'jonas.jonsson@example.is', photo: null }] },
    { id: 10, name: 'Gunnar Sigurðsson', photo: null, birthDate: '7. október 2016', dietary: [], starred: false, parents: [{ name: 'Lilja Sigurðardóttir', phone: '+354 691 0123', email: 'lilja.sigurdardottir@example.is', photo: null }, { name: 'Kristján Sigurðsson', phone: '+354 692 1234', email: 'kristjan.sigurdsson@example.is', photo: null }] },
    { id: 11, name: 'Hlynur Gunnarsson', photo: null, birthDate: '19. desember 2016', dietary: ['dairy'], starred: false, parents: [{ name: 'María Gunnarsdóttir', phone: '+354 693 2345', email: 'maria.gunnarsdottir@example.is', photo: null }, { name: 'Magnús Gunnarsson', phone: '+354 694 3456', email: 'magnus.gunnarsson@example.is', photo: null }] },
    { id: 12, name: 'Hrafnhildur Ólafsdóttir', photo: null, birthDate: '2. ágúst 2016', dietary: [], starred: false, parents: [{ name: 'Ragna Ólafsdóttir', phone: '+354 695 4567', email: 'ragna.olafsdottir@example.is', photo: null }, { name: 'Óskar Ólafsson', phone: '+354 696 5678', email: 'oskar.olafsson@example.is', photo: null }] },
    { id: 13, name: 'Íris Kristjánsdóttir', photo: null, birthDate: '13. janúar 2016', dietary: ['peanut', 'gluten'], starred: false, parents: [{ name: 'Saga Kristjánsdóttir', phone: '+354 697 6789', email: 'saga.kristjansdottir@example.is', photo: null }, { name: 'Pétur Kristjánsson', phone: '+354 698 7890', email: 'petur.kristjansson@example.is', photo: null }] },
    { id: 14, name: 'Jón Magnússon', photo: null, birthDate: '26. apríl 2016', dietary: [], starred: false, parents: [{ name: 'Sigrún Magnúsdóttir', phone: '+354 699 8901', email: 'sigrun.magnusdottir@example.is', photo: null }, { name: 'Ragnar Magnússon', phone: '+354 691 9012', email: 'ragnar.magnusson@example.is', photo: null }] },
    { id: 15, name: 'Kolbrún Einarsdóttir', photo: null, birthDate: '9. september 2016', dietary: [], starred: false, parents: [{ name: 'Þóra Einarsdóttir', phone: '+354 692 0123', email: 'thora.einarsdottir@example.is', photo: null }, { name: 'Sigurður Einarsson', phone: '+354 693 1234', email: 'sigurdur.einarsson@example.is', photo: null }] },
];

export default function DirectoryPage() {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const toggleStar = (studentId: number) => {
        setStudents(students.map(s => s.id === studentId ? { ...s, starred: !s.starred } : s));
    };

    const toggleExpand = (studentId: number) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(studentId)) {
            newExpanded.delete(studentId);
        } else {
            newExpanded.add(studentId);
        }
        setExpandedCards(newExpanded);
    };

    // Sort: starred first, then alphabetically
    const sortedStudents = [...students]
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (a.starred && !b.starred) return -1;
            if (!a.starred && b.starred) return 1;
            return a.name.localeCompare(b.name, 'is');
        });

    const starredCount = students.filter(s => s.starred).length;

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
                <p style={{ color: 'var(--text-secondary)' }}>Sameiginleg skrá yfir nemendur og foreldra</p>
            </header>

            {/* Search */}
            <div className="nordic-card p-4">
                <input type="search" placeholder="Leita að nemanda..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--paper)' }} />
            </div>

            {/* Student Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedStudents.map((student) => {
                    const isExpanded = expandedCards.has(student.id);
                    return (
                        <div key={student.id} className="nordic-card overflow-hidden transition-all"
                            style={{ borderColor: student.starred ? 'var(--amber)' : 'var(--border-light)', borderWidth: student.starred ? '2px' : '1px' }}>

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
                                    style={{ color: student.starred ? 'var(--amber)' : 'var(--text-tertiary)' }}
                                >
                                    <Star size={20} fill={student.starred ? 'currentColor' : 'none'} />
                                </button>

                                <div className="flex items-start gap-3 pr-10">
                                    {/* Photo Placeholder */}
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                                        style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}>{student.name[0]}</div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{student.name}</h3>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{student.birthDate}</p>

                                        {/* Dietary Icons */}
                                        {student.dietary.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {student.dietary.map((type) => <DietaryIcon key={type} type={type} size={14} showLabel={false} />)}
                                            </div>
                                        )}

                                        {/* Expansion hint */}
                                        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {isExpanded ? <ChevronUp size={14} /> : <Users size={14} />}
                                            <span>{isExpanded ? 'Fela foreldra' : `${student.parents.length} foreldrar`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parent Info - Expandable */}
                            {isExpanded && (
                                <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--paper)' }}>
                                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Foreldrar</p>
                                    {student.parents.map((parent, pIdx) => (
                                        <div key={pIdx} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                                style={{ backgroundColor: 'var(--stone)', color: 'var(--text-primary)' }}>{parent.name[0]}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{parent.name}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{parent.phone}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={`tel:${parent.phone}`} className="tap-target p-2" onClick={(e) => e.stopPropagation()}>
                                                    <Phone size={16} style={{ color: 'var(--sage-green)' }} />
                                                </a>
                                                <a href={`mailto:${parent.email}`} className="tap-target p-2" onClick={(e) => e.stopPropagation()}>
                                                    <Mail size={16} style={{ color: 'var(--sage-green)' }} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
