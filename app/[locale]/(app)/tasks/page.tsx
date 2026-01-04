'use client';

import { Calendar, Users, CheckCircle, Loader2, ListTodo } from 'lucide-react';
import { useTasks } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

/**
 * Tasks Page - Skipulag (Organization/Event Coordination)
 * 
 * Manage event tasks and volunteer coordination
 * Now connected to real Firestore data!
 */

// TODO: Get this from user's class membership
const CLASS_ID = '0I3MpwErmopmxnREzoV5'; // From seed script

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { data: tasksData, isLoading: tasksLoading } = useTasks(CLASS_ID);

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        router.push('/is/login');
        return null;
    }

    // Format date for display
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        }).format(date);
    };

    // Check if date is upcoming or past
    const isUpcoming = (timestamp: any) => {
        if (!timestamp?.toDate) return false;
        const date = timestamp.toDate();
        return date.getTime() > Date.now();
    };

    // Loading state
    if (authLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--sage-green)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Hleður verkefnum...</p>
                </div>
            </div>
        );
    }

    const allTasks = tasksData || [];

    // Get only event type tasks
    const events = allTasks.filter(task => task.type === 'event');

    // Sort by date (upcoming first, then past)
    const sortedEvents = [...events].sort((a, b) => {
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

    const upcomingCount = events.filter(e => isUpcoming(e.date)).length;
    const pastCount = events.length - upcomingCount;

    return (
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--sage-green)' }}>
                        Skipulag
                    </h1>
                    {upcomingCount > 0 && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{ backgroundColor: 'var(--sage-green)20', color: 'var(--sage-dark)' }}
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

            {/* Event Cards */}
            <div className="space-y-4">
                {sortedEvents.map((event) => {
                    const upcoming = isUpcoming(event.date);
                    const progress = event.slotsTotal > 0
                        ? (event.slotsFilled / event.slotsTotal) * 100
                        : 0;
                    const isComplete = event.slotsFilled >= event.slotsTotal;

                    return (
                        <div
                            key={event.id}
                            className="nordic-card overflow-hidden"
                            style={{
                                opacity: upcoming ? 1 : 0.7,
                                borderColor: isComplete ? 'var(--green-success)' : 'var(--border-light)',
                                borderWidth: isComplete ? '2px' : '1px',
                            }}
                        >
                            {/* Event Header */}
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                                            {isComplete && (
                                                <div
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: 'var(--green-success)', color: 'white' }}
                                                >
                                                    <CheckCircle size={12} />
                                                    <span>Fullbókað</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            <Calendar size={16} />
                                            <span>{formatDate(event.date)}</span>
                                        </div>

                                        {event.description && (
                                            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

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
                                                    width: `${progress}%`,
                                                    backgroundColor: isComplete
                                                        ? 'var(--green-success)'
                                                        : 'var(--sage-green)',
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
                                                        style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
                                                    >
                                                        {volunteer.name[0]}
                                                    </div>
                                                    <span style={{ color: 'var(--text-primary)' }}>
                                                        {volunteer.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                {upcoming && !isComplete && (
                                    <button className="nordic-button w-full">
                                        Skrá mig
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {events.length === 0 && (
                <div className="text-center py-12">
                    <ListTodo size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
                    <h3 className="text-lg font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                        Engin verkefni enn
                    </h3>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Bekkjarformaður mun bæta við viðburðum og verkefnum
                    </p>
                </div>
            )}

            {/* Summary Stats */}
            {events.length > 0 && (
                <div className="nordic-card p-5">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--sage-green)' }}>
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
        </div>
    );
}
