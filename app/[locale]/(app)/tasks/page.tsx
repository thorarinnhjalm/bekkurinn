import { Gift, PartyPopper, Cake, Users } from 'lucide-react';
import { DietaryIcon } from '@/components/icons/DietaryIcons';

/**
 * Tasks Page - "Reddingar" (Logistics Management)
 * 
 * Features:
 * - Event management (Christmas party, etc.)
 * - Multi-slot tasks (Bake Cake 0/3)
 * - Gift collection workflows
 * - Dietary awareness integration
 */

export default function TasksPage() {
    // Mock data with birthday party showing dietary restrictions
    const mockEvents = [
        {
            id: 1,
            type: 'birthday',
            title: 'Afmælisveisla Ara - 10 ára!',
            date: '2026-01-15',
            host: 'Anna Jónsdóttir',
            attendees: [
                { name: 'Ari Jónsson', dietary: ['peanut'] },
                { name: 'Baldur Gunnarsson', dietary: ['gluten', 'dairy'] },
                { name: 'Dagur Kristjánsson', dietary: ['vegan'] },
                { name: 'Einar Einarsson', dietary: ['pork'] },
                { name: 'Guðrún Jónsdóttir', dietary: ['gluten'] },
                { name: 'Íris Kristjánsdóttir', dietary: ['peanut', 'gluten'] },
                { name: 'Auður Sigurðardóttir', dietary: [] },
                { name: 'Jón Magnússon', dietary: [] },
            ],
        },
        {
            id: 2,
            type: 'event',
            title: 'Jólahátíð bekkjarins',
            date: '2026-12-20',
            tasks: [
                { name: 'Baka kökur', slots: 3, filled: 1 },
                { name: 'Skreyta sal', slots: 2, filled: 2 },
                { name: 'Taka upp eftir að', slots: 2, filled: 0 },
            ],
        },
        {
            id: 3,
            type: 'gift',
            title: 'Gjöf fyrir kennara',
            date: '2026-06-15',
            goal: 'Safna fyrir bókakort',
            collected: 15,
            target: 30,
        },
    ];

    return (
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--sage-green)' }}>
                    Skipulag
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Viðburðir og verkefni bekkjarins
                </p>
            </header>

            {/* Events List */}
            <div className="space-y-4">
                {mockEvents.map((event) => (
                    <div key={event.id} className="nordic-card p-5 space-y-4">
                        {/* Event Header */}
                        <div className="flex items-start gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'var(--sage-green)' }}
                            >
                                {event.type === 'event' ? (
                                    <PartyPopper size={24} color="white" />
                                ) : (
                                    <Gift size={24} color="white" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                    {event.title}
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    {new Date(event.date).toLocaleDateString('is-IS', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Event Tasks */}
                        {event.type === 'event' && event.tasks && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Verkefni sem þarf að leysa:
                                </p>

                                {event.tasks.map((task, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg"
                                        style={{ backgroundColor: 'var(--paper)' }}>
                                        <div className="flex items-center gap-2">
                                            <Cake size={16} style={{ color: 'var(--text-tertiary)' }} />
                                            <span className="text-sm font-medium">{task.name}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                {task.filled}/{task.slots}
                                            </span>

                                            {task.filled < task.slots ? (
                                                <button
                                                    className="px-4 py-2 rounded-lg text-sm font-medium"
                                                    style={{
                                                        backgroundColor: 'var(--sage-green)',
                                                        color: 'white'
                                                    }}
                                                >
                                                    Bjóðast
                                                </button>
                                            ) : (
                                                <span className="text-sm font-medium" style={{ color: 'var(--green-success)' }}>
                                                    ✓ Bókað
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Birthday Party Attendees with Dietary Info */}
                        {event.type === 'birthday' && event.attendees && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        Staðfest mæting ({event.attendees.length} börn)
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        Gestgjafi: {event.host}
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    {event.attendees.map((attendee, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-lg"
                                            style={{ backgroundColor: 'var(--paper)' }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Users size={16} style={{ color: 'var(--text-tertiary)' }} />
                                                <span className="text-sm font-medium">{attendee.name}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {attendee.dietary.length > 0 ? (
                                                    attendee.dietary.map((type) => (
                                                        <DietaryIcon
                                                            key={type}
                                                            type={type as any}
                                                            size={16}
                                                            showLabel={false}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                        Engar sérþarfir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dietary Summary */}
                                <div className="p-3 rounded-lg border" style={{
                                    borderColor: 'var(--amber-light)',
                                    backgroundColor: 'var(--amber-light)20'
                                }}>
                                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        ⚠️ Athugið við matarval:
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <DietaryIcon type="peanut" size={14} />
                                        <DietaryIcon type="gluten" size={14} />
                                        <DietaryIcon type="dairy" size={14} />
                                        <DietaryIcon type="vegan" size={14} />
                                        <DietaryIcon type="pork" size={14} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gift Collection Progress */}
                        {event.type === 'gift' && event.collected !== undefined && event.target !== undefined && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        {event.goal}
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--sage-green)' }}>
                                        {event.collected}/{event.target} foreldrar
                                    </span>
                                </div>

                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-light)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(event.collected / event.target) * 100}%`,
                                            backgroundColor: 'var(--sage-green)'
                                        }}
                                    />
                                </div>

                                <button className="nordic-button w-full text-sm">
                                    Staðfesta þátttöku
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Task Button (Admin only - will be conditional) */}
            <div className="nordic-card p-4 text-center" style={{ borderStyle: 'dashed', borderColor: 'var(--border-medium)' }}>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Aðeins stjórn getur búið til verkefni
                </p>
            </div>
        </div>
    );
}
