'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTasks, useClaimTaskSlot, useUserClasses, useCreateTask, useSchool, useUpdateTask, useDeleteTask } from '@/hooks/useFirestore';
import { Edit2, Loader2, Calendar, Clock, MapPin, Plus, Info, Trash2 } from 'lucide-react'; // Users removed if unused
import { useRouter, useParams } from 'next/navigation';
import type { Task } from '@/types';
import { Babelfish } from '@/components/Babelfish';
import { EditTaskModal } from '@/components/modals/EditTaskModal';

/**
 * Tasks Page - Skipulag V2
 * 
 * V2: Glass Cards, Masonry-style list, Floating Action Button
 */

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    // 1. Get User's Classes
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '');
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    // School Context
    const { data: school } = useSchool(activeClass?.schoolId);
    const isSchoolAdmin = school?.admins?.includes(user?.uid || '');

    // 2. Fetch Tasks (Class + School)
    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId, activeClass?.schoolId);
    const claimSlotMutation = useClaimTaskSlot();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [createTitle, setCreateTitle] = useState('');
    const [createDate, setCreateDate] = useState('');
    const [createTime, setCreateTime] = useState('12:00');
    const [createDesc, setCreateDesc] = useState('');
    const [createSlots, setCreateSlots] = useState(2);
    const [createIsAllDay, setCreateIsAllDay] = useState(false);
    const [scope, setScope] = useState<'class' | 'school'>('class');

    // Redirect
    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
        return null;
    }

    // Helpers
    const isUpcoming = (timestamp: any) => {
        if (!timestamp?.toDate) return false;
        const date = timestamp.toDate();
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

    const handleDelete = async (taskId: string) => {
        if (!window.confirm('Ertu viss um að þú viljir eyða þessu verkefni?')) return;
        try {
            await deleteTaskMutation.mutateAsync(taskId);
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Gat ekki eytt verkefni.");
        }
    };

    if (authLoading || classesLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 size={40} className="animate-spin text-nordic-blue" />
            </div>
        );
    }

    // Filter & Sort
    const allTasks = tasksData || [];
    // Display 'event', 'rolt', 'gift_collection' AND now 'school_event' (mapped from 'event' with scope='school')
    // Ideally we just check if it's NOT a patrol event if we wanted to hide those, but let's show all types relevant.
    // The previous filter was: ['event', 'rolt', 'gift_collection'].includes(t.type)
    // We should ensure 'event' type covers school events or check for scope.
    const displayTasks = allTasks.filter(t => ['event', 'rolt', 'gift_collection', 'school_event'].includes(t.type));

    const sortedEvents = [...displayTasks].sort((a, b) => {
        const aTime = a.date?.toDate?.()?.getTime() || 0;
        const bTime = b.date?.toDate?.()?.getTime() || 0;
        const now = Date.now();
        const aUpcoming = aTime > now;
        const bUpcoming = bTime > now;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        return aTime - bTime;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
            {/* Background blobs */}
            <div className="fixed top-20 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none" />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 animate-in fade-in slide-in-from-left-2">
                        <Calendar size={12} />
                        Skipulag skólans
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Verkefni & Viðburðir</h1>
                    <p className="text-xl text-gray-500 max-w-xl mt-2 leading-relaxed">
                        Hér er yfirlit yfir allt sem þarf að gera. Skráðu þig sem sjálfboðaliða og taktu þátt!
                    </p>
                </div>
                {(isAdmin || isSchoolAdmin) && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-premium flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <Plus size={20} />
                        Nýr viðburður
                    </button>
                )}
            </header>

            {/* Global Translation Notice (if not Icelandic) */}
            {locale !== 'is' && (
                <div className="max-w-4xl mx-auto p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed italic">
                        <strong>Translation Notice:</strong> Task descriptions are automatically translated into your language. Original text is preserved for accuracy.
                    </p>
                </div>
            )}

            {/* Events Grid */}
            <div className="grid grid-cols-1 gap-6">
                {sortedEvents.map((task, index) => {
                    const dateObj = task.date?.toDate?.();
                    const isTaskUpcoming = isUpcoming(task.date);
                    const isFull = task.slotsTotal > 0 && task.slotsFilled >= task.slotsTotal;
                    const isAllDay = task.isAllDay || task.type === 'school_event';

                    return (
                        <div
                            key={task.id}
                            className={`glass-card p-0 flex flex-col md:flex-row overflow-hidden group ${!isTaskUpcoming ? 'opacity-70 grayscale-[0.5] hover:grayscale-0' : ''}`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Scope Strip */}
                            {task.scope === 'school' && (
                                <div className="md:w-2 bg-purple-500 w-full h-2 md:h-auto" />
                            )}

                            {/* Date Column */}
                            <div className="md:w-48 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 p-6 flex flex-col justify-center items-center text-center group-hover:bg-blue-50/30 transition-colors">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    {dateObj ? dateObj.toLocaleDateString('is-IS', { weekday: 'short' }) : '---'}
                                </span>
                                <span className="text-4xl font-black text-gray-900 leading-none mb-1">
                                    {dateObj ? dateObj.getDate() : '--'}
                                </span>
                                <span className="text-lg font-medium text-nordic-blue">
                                    {dateObj ? dateObj.toLocaleDateString('is-IS', { month: 'short' }) : '---'}
                                </span>
                                {dateObj && !isAllDay && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                                        <Clock size={12} />
                                        {dateObj.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                                {isAllDay && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                        Allan daginn
                                    </div>
                                )}
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-nordic-blue transition-colors">
                                            {task.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Status Badge */}
                                        {task.scope === 'school' && <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg uppercase tracking-wide">Allur Skólinn</span>}
                                        {task.type === 'rolt' && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wide">Rölt</span>}
                                        {task.type === 'gift_collection' && <span className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-lg uppercase tracking-wide">Söfnun</span>}

                                        {/* Admin Controls */}
                                        {(isAdmin || isSchoolAdmin) && (
                                            <div className="flex items-center gap-1 ml-2">
                                                <button
                                                    onClick={() => setEditingTask(task)}
                                                    className="p-1.5 text-gray-400 hover:text-nordic-blue hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Breyta"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eyða"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 leading-relaxed mb-4 max-w-2xl">
                                    {task.description || "Engin lýsing."}
                                </p>

                                {task.description && (
                                    <div className="mb-6">
                                        <Babelfish
                                            text={task.description}
                                            originalLanguage={task.originalLanguage}
                                            targetLanguage={locale}
                                        />
                                    </div>
                                )}

                                {/* Progress / Action Area */}
                                <div className="mt-auto">
                                    {(task.slotsTotal > 0) ? (
                                        <div className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                                                    <span>Sjálfboðaliðar</span>
                                                    <span>{task.slotsFilled} / {task.slotsTotal}</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-green-500' : 'bg-nordic-blue'}`}
                                                        style={{ width: `${(task.slotsFilled / task.slotsTotal) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleVolunteer(task.id)}
                                                disabled={isFull || !isTaskUpcoming}
                                                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${isFull
                                                    ? 'bg-green-100 text-green-700 cursor-default'
                                                    : 'bg-white border-2 border-nordic-blue text-nordic-blue hover:bg-nordic-blue hover:text-white'
                                                    }`}
                                            >
                                                {isFull ? 'Fullmannað' : 'Skrá mig'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-2 text-sm text-gray-400 font-medium italic">
                                            Engin skráning nauðsynleg.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {sortedEvents.length === 0 && (
                    <div className="text-center py-24 glass-card">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Ekkert á dagskrá</h3>
                        <p className="text-gray-500">Njóttu þess að hafa ekkert fyrir stafni!</p>
                    </div>
                )}
            </div>

            {/* Simple Create Modal (Reused Logic) */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-nordic-blue to-purple-600 left-0" />

                        <div className="text-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-nordic-blue shadow-sm">
                                <Edit2 size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Nýtt verkefni</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Scope Selector */}
                            {isSchoolAdmin && (
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setScope('class')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'class' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Bekkur
                                    </button>
                                    <button
                                        onClick={() => setScope('school')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'school' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Allur Skólinn
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Heiti</label>
                                <input
                                    type="text"
                                    value={createTitle}
                                    onChange={e => setCreateTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                                    placeholder="t.d. Kökubasar"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Dagsetning</label>
                                    <input
                                        type="date"
                                        value={createDate}
                                        onChange={e => setCreateDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className={createIsAllDay ? 'opacity-30 pointer-events-none' : ''}>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Klukkan</label>
                                    <input
                                        type="time"
                                        value={createTime}
                                        onChange={e => setCreateTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <input
                                    type="checkbox"
                                    id="isAllDay"
                                    checked={createIsAllDay}
                                    onChange={(e) => setCreateIsAllDay(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-nordic-blue focus:ring-nordic-blue"
                                />
                                <label htmlFor="isAllDay" className="text-sm font-bold text-gray-700 cursor-pointer">Allan daginn</label>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Lýsing</label>
                                <textarea
                                    value={createDesc}
                                    onChange={e => setCreateDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium h-24"
                                    placeholder="Nánari upplýsingar..."
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Fjöldi sjálfboðaliða</label>
                                    <input
                                        type="number"
                                        value={createSlots}
                                        onChange={e => setCreateSlots(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                                        min={0}
                                    />
                                </div>
                                <div className="pt-5">
                                    <span className="text-xs text-gray-400 font-medium leading-tight inline-block max-w-[140px]">
                                        Settu 0 ef þetta er aðeins upplýsinga-viðburður.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Hætta við
                            </button>
                            <button
                                onClick={async () => {
                                    if (!createTitle || !createDate) return;
                                    const finalDate = createIsAllDay
                                        ? new Date(`${createDate}T00:00:00`)
                                        : new Date(`${createDate}T${createTime}:00`);

                                    await createTaskMutation.mutateAsync({
                                        classId: scope === 'class' ? activeClassId : null,
                                        schoolId: scope === 'school' ? (activeClass?.schoolId || null) : (activeClass?.schoolId || null),
                                        scope: scope,
                                        type: 'event',
                                        title: createTitle,
                                        description: createDesc,
                                        date: finalDate as any,
                                        slotsTotal: createSlots,
                                        isAllDay: createIsAllDay,
                                        createdBy: user?.uid || '',
                                        originalLanguage: locale,
                                    } as any);
                                    setIsCreating(false);
                                    setCreateTitle(''); setCreateDesc(''); setScope('class');
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-br from-nordic-blue to-nordic-blue-dark shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Birta verkefni
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    isOpen={!!editingTask}
                    isSchoolAdmin={isSchoolAdmin}
                    onClose={() => setEditingTask(null)}
                    onSave={async (id, data) => {
                        await updateTaskMutation.mutateAsync({ taskId: id, data });
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
}
