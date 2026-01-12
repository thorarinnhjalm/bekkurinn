'use client';

import { useState } from 'react';
import { Calendar, Loader2, Users, Plus, Footprints } from 'lucide-react';
import { useTasks, useUserClasses, useCreateTask } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

/**
 * Patrol Page - V2
 * 
 * V2: Glass Cards, better list items
 */

export default function PatrolPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '');
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId, activeClass?.schoolId);

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newSlots, setNewSlots] = useState(2);
    const createTaskMutation = useCreateTask();

    if (!authLoading && !user) {
        router.push('/is/login');
        return null;
    }

    if (authLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 text-nordic-blue">
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    const patrols = (tasksData || []).filter(task => task.type === 'rolt').sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || 0;
        // Upcoming first
        const now = Date.now();
        const aUpcoming = aTime > now;
        const bUpcoming = bTime > now;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        return aTime - bTime;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Foreldrarölt</h1>
                    <p className="text-gray-500 mt-1">
                        Skráðu þig á röltið og taktu þátt í samfélaginu
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Nýtt rölt
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patrols.map((patrol) => {
                    const dateObj = patrol.date?.toDate?.();
                    return (
                        <div key={patrol.id} className="glass-card p-6 flex flex-col justify-between group hover:bg-white/70 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <Footprints size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{patrol.title}</h3>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                            {dateObj ? dateObj.toLocaleDateString('is-IS', { month: 'short', day: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-center justify-between text-sm font-bold text-gray-500 mb-2">
                                    <span>Mættir</span>
                                    <span>{patrol.slotsFilled} / {patrol.slotsTotal}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${(patrol.slotsFilled / patrol.slotsTotal) * 100}%` }}
                                    />
                                </div>

                                <button className="w-full py-2 rounded-xl border-2 border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-50 transition-colors">
                                    Skoða / Skrá
                                </button>
                            </div>
                        </div>
                    );
                })}

                {patrols.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                        <p className="text-gray-400 font-bold">Engin rölt skráð á næstunni</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-4 shadow-2xl">
                        <h2 className="text-2xl font-bold">Nýtt rölt</h2>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                            placeholder="Heiti (t.d. Kvöldrölt)"
                        />
                        <input
                            type="datetime-local"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 text-gray-500 font-bold">Hætta við</button>
                            <button
                                onClick={async () => {
                                    if (!newTitle || !newDate) return;
                                    await createTaskMutation.mutateAsync({
                                        classId: activeClassId,
                                        type: 'rolt',
                                        title: newTitle,
                                        date: new Date(newDate),
                                        slotsTotal: newSlots,
                                        createdBy: user?.uid || ''
                                    } as any);
                                    setIsCreating(false);
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg"
                            >
                                Stofna
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
