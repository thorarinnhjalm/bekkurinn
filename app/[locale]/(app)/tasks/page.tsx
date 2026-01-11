'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useClass, useTasks, useClaimTaskSlot, useUnclaimTaskSlot, useUserClasses, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useFirestore';
import { Edit2, Trash2, Loader2, Calendar, Users, ChevronDown, ChevronUp, Clock, Gift, GraduationCap, School, MapPin, AlertCircle, CheckCircle, UserPlus, ListTodo } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Task } from '@/types';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { EmptyState } from '@/components/ui/EmptyState';


/**
 * Tasks Page - Skipulag (Organization/Event Coordination)
 * 
 * Manage event tasks and volunteer coordination
 * Now connected to real Firestore data!
 */

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // 1. Get User's Classes
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '');
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    // 2. Fetch Tasks for that Class
    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId);

    // 3. Mutation for volunteering
    const claimSlotMutation = useClaimTaskSlot();
    const createTaskMutation = useCreateTask();

    // Create State
    const [isCreating, setIsCreating] = useState(false);
    const [createTitle, setCreateTitle] = useState('');
    const [createDate, setCreateDate] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [createSlots, setCreateSlots] = useState(2);

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        router.push('/is/login');
        return null;
    }

    // Format date for display with capitalization
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const formatted = new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        }).format(date);

        // Capitalize first letter
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    // Check if date is upcoming or past
    const isUpcoming = (timestamp: any) => {
        if (!timestamp?.toDate) return false;
        const date = timestamp.toDate();
        // Reset time to end of day for comparison to keep "today's" events active
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return date >= now;
    };

    const handleVolunteer = async (taskId: string) => {
        if (!user) return;
        try {
            await claimSlotMutation.mutateAsync({
                taskId,
                userId: user.uid,
                userName: user.displayName || 'Foreldri',
            });
        } catch (err) {
            console.error("Failed to volunteer:", err);
            alert("Gat ekki skráð þig. Vinsamlegast reyndu aftur.");
        }
    };

    // Loading state
    if (authLoading || classesLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--nordic-blue)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Hleður verkefnum...</p>
                </div>
            </div>
        );
    }

    // If no class found
    if (!activeClass && !classesLoading) {
        return (
            <div className="min-h-screen p-4 flex items-center justify-center pt-24">
                <div className="text-center space-y-4">
                    <p>Þú ert ekki skráð(ur) í neinn bekk.</p>
                    <button
                        onClick={() => router.push('/is/onboarding')}
                        className="nordic-button"
                    >
                        Ganga í bekk
                    </button>
                </div>
            </div>
        );
    }

    const allTasks = tasksData || [];

    // Get only event type tasks and rolt (patrol)
    // Actually, 'Skipulag' usually shows everything relevant. 
    // Filter out specific school_events if they clutter too much, but for now show all 'event' and 'rolt'.
    // The previous implementation filtered: `const events = allTasks.filter(task => task.type === 'event'); `
    // I will stick to that if that was the intention, but user might want to see everything.
    // Let's broaden it to tasks that require volunteering (rolt + event + gift_collection).
    // Or just Keep it as 'event' per original code if ONLY events are shown here.
    // Audit check: "Skipulag (Task List)".

    // Let's filter for visual clarity: all tasks.
    const displayTasks = allTasks.filter(t => ['event', 'rolt', 'gift_collection'].includes(t.type));

    // Sort by date (upcoming first, then past)
    const sortedEvents = [...displayTasks].sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || 0;
        const now = Date.now();

        const aUpcoming = aTime > now;
        const bUpcoming = bTime > now;

        // Upcoming events first
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;

        // Within same category, sort by date
        return aTime - bTime;
    });

    const upcomingCount = displayTasks.filter(e => isUpcoming(e.date)).length;
    const pastCount = displayTasks.length - upcomingCount;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                            Skipulag
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{activeClass?.name || 'Bekkurinn'}</p>
                    </div>
                    {upcomingCount > 0 && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{ backgroundColor: 'var(--nordic-blue)20', color: 'var(--sage-dark)' }}
                        >
                            <Calendar size={14} />
                            <span>{upcomingCount} í vændum</span>
                        </div>
                    )}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Viðburðir og verkefni bekkjarins
                </p>
            </header>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                    >
                        + Nýtt verkefni / viðburður
                    </button>
                </div>
            )}

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900">Skrá nýtt verkefni</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Heiti</label>
                                <input
                                    type="text"
                                    value={createTitle}
                                    onChange={e => setCreateTitle(e.target.value)}
                                    placeholder="t.d. Söfnun fyrir bekkjarferð"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dagsetning / Skilafrestur</label>
                                <input
                                    type="datetime-local"
                                    value={createDate}
                                    onChange={e => setCreateDate(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lýsing</label>
                                <textarea
                                    value={createDesc}
                                    onChange={e => setCreateDesc(e.target.value)}
                                    placeholder="Nánari lýsing á verkefninu..."
                                    className="w-full p-2 border rounded-lg h-24"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fjöldi sjálfboðaliða sem vantar</label>
                                <input
                                    type="number"
                                    value={createSlots}
                                    onChange={e => setCreateSlots(Number(e.target.value))}
                                    className="w-full p-2 border rounded-lg"
                                    min={1}
                                />
                            </div>
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
                                    if (!createTitle || !createDate) return alert('Vinsamlegast fylltu út titil og dagsetningu');

                                    try {
                                        await createTaskMutation.mutateAsync({
                                            classId: activeClassId,
                                            type: 'event', // Generic event type for tasks page too
                                            title: createTitle,
                                            description: createDesc,
                                            date: new Date(createDate) as any,
                                            slotsTotal: createSlots,
                                            createdBy: user?.uid || '',
                                        } as any);

                                        setIsCreating(false);
                                        setCreateTitle('');
                                        setCreateDate('');
                                        setCreateDesc('');
                                        setCreateSlots(2);
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


            {/* Event Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr`}>
                {sortedEvents.map((event) => {
                    const upcoming = isUpcoming(event.date);
                    const progress = event.slotsTotal > 0
                        ? (event.slotsFilled / event.slotsTotal) * 100
                        : 0;
                    const isComplete = event.slotsFilled >= event.slotsTotal;

                    // Check if I specifically have volunteered
                    const iAmVolunteering = event.volunteers?.some(v => v.userId === user?.uid);

                    return (
                        <div
                            key={event.id}
                            className="nordic-card overflow-hidden transition-all hover:shadow-md flex flex-col h-full"
                            style={{
                                opacity: upcoming ? 1 : 0.7,
                                borderColor: iAmVolunteering ? 'var(--green-success)' : (isComplete ? 'var(--border-light)' : 'var(--border-light)'),
                                borderWidth: iAmVolunteering || isComplete ? '1px' : '1px',
                                boxShadow: iAmVolunteering ? '0 0 0 1px var(--green-success)' : 'none'
                            }}
                        >
                            {/* Event Header */}
                            <div className="p-5 space-y-3 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <h2 className="text-xl font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                                {event.title}
                                            </h2>
                                            {!upcoming && (
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: 'var(--text-tertiary)20',
                                                        color: 'var(--text-tertiary)'
                                                    }}
                                                >
                                                    Liðinn
                                                </span>
                                            )}
                                            {isComplete && !iAmVolunteering && (
                                                <div
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                                >
                                                    <CheckCircle size={12} />
                                                    <span>Fullbókað</span>
                                                </div>
                                            )}
                                            {iAmVolunteering && (
                                                <div
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: 'var(--green-success)', color: 'white' }}
                                                >
                                                    <CheckCircle size={12} />
                                                    <span>Þú ert skráð(ur)</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            <Calendar size={16} />
                                            <span>{formatDate(event.date)}</span>
                                        </div>

                                        {event.description && (
                                            <p className="mt-2 text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingTask(event)}
                                                className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                                title="Breyta"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Ertu viss um að þú viljir eyða "${event.title}"?`)) {
                                                        try {
                                                            await deleteTaskMutation.mutateAsync(event.id);
                                                        } catch (error) {
                                                            console.error('Delete error:', error);
                                                            alert('Villa kom upp við að eyða');
                                                        }
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                                                title="Eyða"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 space-y-3">
                                    {/* Progress Bar */}
                                    {event.slotsTotal > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    Þátttakendur
                                                </span>
                                                <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                                                    {event.slotsFilled}/{event.slotsTotal}
                                                </span>
                                            </div>
                                            <div
                                                className="h-2 rounded-full overflow-hidden"
                                                style={{ backgroundColor: 'var(--stone)' }}
                                            >
                                                <div
                                                    className="h-full transition-all duration-300"
                                                    style={{
                                                        width: `${progress}% `,
                                                        backgroundColor: (isComplete || iAmVolunteering)
                                                            ? 'var(--green-success)'
                                                            : 'var(--nordic-blue)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Volunteers List */}
                                    {event.volunteers && event.volunteers.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                                                Skráðir þátttakendur
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {event.volunteers.map((volunteer, idx) => (
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
                                                            {volunteer.userId === user?.uid ? 'Þú' : volunteer.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {upcoming && !isComplete && !iAmVolunteering && (
                                        <button
                                            onClick={() => handleVolunteer(event.id)}
                                            disabled={claimSlotMutation.isPending}
                                            className="nordic-button w-full flex items-center justify-center gap-2"
                                        >
                                            {claimSlotMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                            Skrá mig
                                        </button>
                                    )}

                                    {iAmVolunteering && upcoming && (
                                        <button
                                            onClick={() => {/* Unclaim logic not implemented yet in this view but could be added */ }}
                                            className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                                        >
                                            Skráður (Hafa samband til að afbóka)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {displayTasks.length === 0 && (
                isAdmin ? (
                    <EmptyState
                        icon={<ListTodo size={56} strokeWidth={1.5} />}
                        title="Hér er tómt eins og er 📋"
                        description="Viðburðir og verkefni sem þú býrð til birtast hér.<br/>Byrjaðu með að skrá fyrsta viðburðinn til að skipuleggja bekkinn!"
                        actionLabel="Stofna fyrsta viðburðinn"
                        onAction={() => setIsCreating(true)}
                    />
                ) : (
                    <EmptyState
                        icon={<ListTodo size={56} strokeWidth={1.5} />}
                        title="Engin verkefni enn 👀"
                        description="Þegar bekkjarformaðurinn býr til viðburði eða biður um aðstoð munt þú sjá þau hér.<br/>Vertu rólegur – við látum þig vita þegar eitthvað kemur upp!"
                    />
                )
            )}


            {/* Summary Stats (Only if events exist) */}
            {displayTasks.length > 0 && (
                <div className="nordic-card p-5">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--nordic-blue)' }}>
                                {upcomingCount}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                Í vændum
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--text-tertiary)' }}>
                                {pastCount}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                Liðnir
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={async (taskId, data) => {
                        await updateTaskMutation.mutateAsync({ taskId, data });
                    }}
                />
            )}
        </div>
    );
}
