'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Loader2, Users, Check } from 'lucide-react';
import { useTasks, useUserClasses, useCreateTask } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';

/**
 * Patrol Page - Dagatal (Calendar with patrols)
 * 
 * Shows birthdays, class activities, and parent patrols
 * Now connected to real Firestore data!
// TODO: Get this from user's class membership (Dynamic now)
 */

export default function PatrolPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Dynamic Class ID
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '');
    const activeClassId = userClasses?.[0]?.id || '';

    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId);

    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['patrols']));
    const [isCreating, setIsCreating] = useState(false);
    const [createType, setCreateType] = useState<'rolt' | 'event'>('rolt');

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newSlots, setNewSlots] = useState(2);

    const createTaskMutation = useCreateTask();

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        router.push('/is/login');
        return null;
    }

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    // Format date for display
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Format date short (for headers)
    const formatMonth = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('is-IS', {
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Loading state
    if (authLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--nordic-blue)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Hleður dagatali...</p>
                </div>
            </div>
        );
    }

    const allTasks = tasksData || [];

    // Filter patrols (rölt) from tasks
    const patrols = allTasks.filter(task => task.type === 'rolt');
    const events = allTasks.filter(task => task.type === 'event');

    // Sort by date (ascending - soonest first)
    const sortedPatrols = [...patrols].sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || 0;
        return aTime - bTime;
    });

    const sortedEvents = [...events].sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || 0;
        return aTime - bTime;
    });

    return (
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24">
            {/* Header */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                    Dagatal
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Afmæli, viðburðir og foreldrarölt
                </p>
            </header>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex gap-3">
                    <button
                        onClick={() => { setIsCreating(true); setCreateType('rolt'); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                    >
                        + Nýtt rölt
                    </button>
                    <button
                        onClick={() => { setIsCreating(true); setCreateType('event'); }}
                        className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        + Nýr viðburður
                    </button>
                </div>
            )}

            {/* Creation Modal/Form */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900">
                            {createType === 'rolt' ? 'Skrá nýtt foreldrarölt' : 'Skrá nýjan viðburð'}
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Heiti</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder={createType === 'rolt' ? "t.d. Rölt í Breiðholti" : "t.d. Jólaklipping"}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dagsetning</label>
                                <input
                                    type="datetime-local"
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lýsing (valfrjálst)</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="w-full p-2 border rounded-lg h-24"
                                />
                            </div>

                            {createType === 'rolt' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fjöldi plássa</label>
                                    <input
                                        type="number"
                                        value={newSlots}
                                        onChange={e => setNewSlots(Number(e.target.value))}
                                        className="w-full p-2 border rounded-lg"
                                        min={1}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newTitle || !newDate) return alert('Vinsamlegast fylltu út titil og dagsetningu');

                                    try {
                                        await createTaskMutation.mutateAsync({
                                            classId: activeClassId,
                                            type: createType,
                                            title: newTitle,
                                            description: newDesc,
                                            date: new Date(newDate) as any, // Firestore handles JS Date conversion usually, or need Timestamp
                                            slotsTotal: createType === 'rolt' ? newSlots : 999, // Event usually unlimited or high
                                            createdBy: user?.uid || '',
                                        } as any); // Type cast for Timestamp workaround if needed

                                        setIsCreating(false);
                                        setNewTitle('');
                                        setNewDate('');
                                        setNewDesc('');
                                    } catch (e) {
                                        console.error(e);
                                        alert('Villa kom upp');
                                    }
                                }}
                                disabled={createTaskMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {createTaskMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                                Stofna
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Parent Patrols Section */}
            <div className="nordic-card overflow-hidden">
                <button
                    onClick={() => toggleSection('patrols')}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-opacity-50 transition-colors"
                    style={{ backgroundColor: 'var(--stone)' }}
                >
                    <div className="flex items-center gap-2">
                        <Users size={20} style={{ color: 'var(--nordic-blue)' }} />
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Foreldrarölt ({patrols.length})
                        </h2>
                    </div>
                    {expandedSections.has('patrols') ? (
                        <ChevronUp size={20} style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                        <ChevronDown size={20} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                </button>

                {expandedSections.has('patrols') && (
                    <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                        {sortedPatrols.length > 0 ? (
                            sortedPatrols.map((patrol) => (
                                <div key={patrol.id} className="p-5 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {patrol.title}
                                            </h3>
                                            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                                {formatDate(patrol.date)}
                                            </p>
                                            {patrol.description && (
                                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                    {patrol.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div
                                                className="text-xs px-2 py-1 rounded"
                                                style={{
                                                    backgroundColor: patrol.slotsFilled >= patrol.slotsTotal
                                                        ? 'var(--green-success)20'
                                                        : 'var(--amber)20',
                                                    color: patrol.slotsFilled >= patrol.slotsTotal
                                                        ? 'var(--green-success)'
                                                        : 'var(--amber-dark)'
                                                }}
                                            >
                                                {patrol.slotsFilled}/{patrol.slotsTotal}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Volunteers */}
                                    {patrol.volunteers && patrol.volunteers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {patrol.volunteers.map((volunteer, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                                                    style={{ backgroundColor: 'var(--stone)' }}
                                                >
                                                    <div
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                        style={{ backgroundColor: 'var(--nordic-blue)', color: 'white' }}
                                                    >
                                                        {volunteer.name[0]}
                                                    </div>
                                                    <span style={{ color: 'var(--text-primary)' }}>
                                                        {volunteer.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Check if user is already volunteering for THIS patrol */}
                                    {(() => {
                                        const isVolunteeringForThis = patrol.volunteers?.some((v: any) => v.uid === user?.uid);
                                        const isVolunteeringAnywhere = patrols.some(p => p.volunteers?.some((v: any) => v.uid === user?.uid));

                                        // Show button if: 
                                        // 1. Not full
                                        // 2. User is NOT volunteering anywhere yet (First come first served)
                                        // 3. OR User is volunteering for THIS one (so they can potentially withdraw - logic to be added)

                                        if (patrol.slotsFilled < patrol.slotsTotal && !isVolunteeringAnywhere) {
                                            return (
                                                <button className="nordic-button mt-3 text-sm">
                                                    Bjóðast
                                                </button>
                                            );
                                        }

                                        if (isVolunteeringForThis) {
                                            return (
                                                <div className="mt-3 text-sm font-medium text-green-700 flex items-center gap-1">
                                                    <Check size={16} /> Þú ert skráð(ur) á þessa vakt
                                                </div>
                                            );
                                        }

                                        return null;
                                    })()}
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                                Engin rölt áætluð
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Events Section */}
            <div className="nordic-card overflow-hidden">
                <button
                    onClick={() => toggleSection('events')}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-opacity-50 transition-colors"
                    style={{ backgroundColor: 'var(--stone)' }}
                >
                    <div className="flex items-center gap-2">
                        <Calendar size={20} style={{ color: 'var(--nordic-blue)' }} />
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Viðburðir ({events.length})
                        </h2>
                    </div>
                    {expandedSections.has('events') ? (
                        <ChevronUp size={20} style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                        <ChevronDown size={20} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                </button>

                {expandedSections.has('events') && (
                    <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                        {sortedEvents.length > 0 ? (
                            sortedEvents.map((event) => (
                                <div key={event.id} className="p-5 space-y-2">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {event.title}
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        {formatDate(event.date)}
                                    </p>
                                    {event.description && (
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                                Engir viðburðir áætlaðir
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Empty state */}
            {patrols.length === 0 && events.length === 0 && (
                <div className="text-center py-12">
                    <Calendar size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
                    <h3 className="text-lg font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                        Ekkert í dagatalinu enn
                    </h3>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Bekkjarformaður mun bæta við viðburðum
                    </p>
                </div>
            )}
        </div>
    );
}
