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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Skipulag</h1>
                    <p className="text-gray-500 mt-1">
                        Viðburðir og verkefni bekkjarins
                    </p>
                </div>
                {upcomingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm animate-in zoom-in">
                        <Calendar size={16} className="text-blue-600" />
                        <span>{upcomingCount} í vændum</span>
                    </div>
                )}
            </header>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-nordic-blue text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-nordic-blue-dark transition-all shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95"
                    >
                        <Edit2 size={18} />
                        Nýtt verkefni / viðburður
                    </button>
                </div>
            )}

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Edit2 className="text-nordic-blue" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Skrá nýtt verkefni</h2>
                            <p className="text-gray-500 text-sm mt-1">Búðu til viðburð eða verkefni fyrir bekkinn</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Heiti</label>
                                <input
                                    type="text"
                                    value={createTitle}
                                    onChange={e => setCreateTitle(e.target.value)}
                                    placeholder="t.d. Söfnun fyrir bekkjarferð"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Dagsetning / Skilafrestur</label>
                                <input
                                    type="datetime-local"
                                    value={createDate}
                                    onChange={e => setCreateDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Lýsing</label>
                                <textarea
                                    value={createDesc}
                                    onChange={e => setCreateDesc(e.target.value)}
                                    placeholder="Nánari lýsing á verkefninu..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all min-h-[100px]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fjöldi sjálfboðaliða sem vantar</label>
                                <input
                                    type="number"
                                    value={createSlots}
                                    onChange={e => setCreateSlots(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-nordic-blue transition-all"
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
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
                                className="px-6 py-2.5 bg-nordic-blue text-white font-bold rounded-xl hover:bg-nordic-blue-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                {createTaskMutation.isPending && <Loader2 className="animate-spin" size={18} />}
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
                            className={`nordic-card group flex flex-col h-full bg-white transition-all duration-300 ${upcoming ? 'hover:shadow-card-hover hover:-translate-y-1' : 'opacity-75 grayscale-[0.5]'} ${iAmVolunteering ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                        >
                            {/* Event Header */}
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            {isComplete && !iAmVolunteering && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                                                    Fullbókað
                                                </span>
                                            )}
                                            {iAmVolunteering && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                                                    <CheckCircle size={12} />
                                                    Þú ert skráð(ur)
                                                </span>
                                            )}
                                            {!upcoming && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500 uppercase tracking-wider">
                                                    Liðinn
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-nordic-blue transition-colors">
                                            {event.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                            <Calendar size={16} className="text-nordic-blue" />
                                            <span className="capitalize">{formatDate(event.date)}</span>
                                        </div>
                                    </div>

                                    {/* Edit actions */}
                                    {isAdmin && (
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingTask(event)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {event.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                        {event.description}
                                    </p>
                                )}

                                <div className="mt-auto pt-4 space-y-4 border-t border-gray-50">
                                    {/* Progress Bar Section */}
                                    {event.slotsTotal > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                <span>Þátttakendur</span>
                                                <span className={isComplete ? 'text-green-600' : 'text-nordic-blue'}>
                                                    {event.slotsFilled} / {event.slotsTotal}
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ease-out rounded-full ${isComplete ? 'bg-green-500' : 'bg-nordic-blue'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Volunteers List (Avatars) */}
                                    {event.volunteers && event.volunteers.length > 0 && (
                                        <div className="flex -space-x-2 overflow-hidden py-1">
                                            {event.volunteers.slice(0, 5).map((volunteer, idx) => (
                                                <div
                                                    key={idx}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm"
                                                    title={volunteer.name}
                                                    style={{ zIndex: 5 - idx }}
                                                >
                                                    {volunteer.name[0]}
                                                </div>
                                            ))}
                                            {event.volunteers.length > 5 && (
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm" style={{ zIndex: 0 }}>
                                                    +{event.volunteers.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {upcoming && !isComplete && !iAmVolunteering && (
                                        <button
                                            onClick={() => handleVolunteer(event.id)}
                                            disabled={claimSlotMutation.isPending}
                                            className="w-full py-3 rounded-xl bg-nordic-blue text-white font-bold hover:bg-nordic-blue-dark transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            {claimSlotMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                                            Skrá mig í verkefnið
                                        </button>
                                    )}

                                    {iAmVolunteering && upcoming && (
                                        <button
                                            disabled={true}
                                            className="w-full py-3 rounded-xl border-2 border-green-100 bg-green-50 text-green-700 font-bold flex items-center justify-center gap-2 cursor-default"
                                        >
                                            <CheckCircle size={20} />
                                            Þú ert skráð(ur)
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
                        icon={<ListTodo size={48} className="text-nordic-blue" />}
                        title="Hér er tómt eins og er"
                        description="Búðu til fyrsta verkefnið eða viðburðinn til að byrja að skipuleggja bekkinn."
                        actionLabel="Stofna fyrsta viðburðinn"
                        onAction={() => setIsCreating(true)}
                    />
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ListTodo size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Engin verkefni í gangi</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Það er ekkert á döfinni hjá bekknum eins og er. Njóttu hvíldarinnar! ☕️
                        </p>
                    </div>
                )
            )}


            {/* Summary Stats (Only if events exist) */}
            {displayTasks.length > 0 && (
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mt-12 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="bg-white/50 p-6 rounded-2xl text-center border border-gray-100">
                        <div className="text-3xl font-extrabold text-nordic-blue mb-1">
                            {upcomingCount}
                        </div>
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Í vændum
                        </div>
                    </div>
                    <div className="bg-white/50 p-6 rounded-2xl text-center border border-gray-100">
                        <div className="text-3xl font-extrabold text-gray-400 mb-1">
                            {pastCount}
                        </div>
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Liðnir
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
