'use client';

import { useState } from 'react';
import { Calendar, Loader2, Users, Plus, Footprints, Clock, Check, Edit2, Trash2 } from 'lucide-react';
import { useTasks, useUserClasses, useCreateTask, useClaimTaskSlot, useUpdateTask, useDeleteTask, useSchool } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import type { Task } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * PatrolPage - V2
 * 
 * V2: Glass Cards, better list items, improved date UX and functional registration
 */

export default function PatrolPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('patrol');

    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '', user?.email);
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId, activeClass?.schoolId);
    const claimSlotMutation = useClaimTaskSlot();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    // School Context (for scope toggle in modal if needed)
    const { data: school } = useSchool(activeClass?.schoolId);
    const isSchoolAdmin = school?.admins?.includes(user?.uid || '');

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTitle, setNewTitle] = useState(t('default_title'));
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('20:00');
    const [newSlots, setNewSlots] = useState(2);

    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
        return null;
    }

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
            alert(t('error_volunteering'));
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!window.confirm(t('confirm_delete'))) return;
        try {
            await deleteTaskMutation.mutateAsync(taskId);
        } catch (err) {
            console.error("Failed to delete patrol:", err);
            alert(t('error_deleting'));
        }
    };

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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        {t('new_patrol')}
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patrols.map((patrol) => {
                    const dateObj = patrol.date?.toDate?.();
                    const isFull = patrol.slotsFilled >= patrol.slotsTotal;
                    const isJoined = patrol.volunteers?.some((v: any) => v.userId === user?.uid);

                    return (
                        <div key={patrol.id} className="glass-card p-6 flex flex-col justify-between group hover:bg-white/70 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <Footprints size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{patrol.title}</h3>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                                {dateObj ? `${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(dateObj)} kl. ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dateObj)}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Admin Controls */}
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 ml-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingTask(patrol); }}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Breyta"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(patrol.id); }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eyða"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-center justify-between text-sm font-bold text-gray-500 mb-2">
                                    <span>{t('attended')}</span>
                                    <span>{patrol.slotsFilled} / {patrol.slotsTotal}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${(patrol.slotsFilled / patrol.slotsTotal) * 100}%` }}
                                    />
                                </div>

                                <button
                                    onClick={() => !isJoined && handleVolunteer(patrol.id)}
                                    disabled={isJoined || isFull}
                                    className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isJoined
                                        ? 'bg-green-50 text-green-600 border-2 border-green-100'
                                        : isFull
                                            ? 'bg-gray-50 text-gray-400 border-2 border-gray-100'
                                            : 'border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 active:scale-95'
                                        }`}
                                >
                                    {isJoined ? (
                                        <>
                                            <Check size={18} />
                                            <span>{t('attend')}</span>
                                        </>
                                    ) : isFull ? (
                                        t('full')
                                    ) : (
                                        t('sign_up')
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {patrols.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                        <p className="text-gray-400 font-bold">{t('no_patrols')}</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                                <Footprints size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('modal_title')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('label_title')}</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium"
                                    placeholder="t.d. Kvöldrölt"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('label_date')}</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('label_time')}</label>
                                    <input
                                        type="time"
                                        value={newTime}
                                        onChange={e => setNewTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('label_slots')}</label>
                                <input
                                    type="number"
                                    value={newSlots}
                                    onChange={e => setNewSlots(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium"
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newTitle || !newDate) return;
                                    const finalDate = new Date(`${newDate}T${newTime}:00`);

                                    await createTaskMutation.mutateAsync({
                                        classId: activeClassId,
                                        schoolId: activeClass?.schoolId || null,
                                        type: 'rolt',
                                        title: newTitle,
                                        date: finalDate as any,
                                        slotsTotal: newSlots,
                                        createdBy: user?.uid || ''
                                    } as any);
                                    setIsCreating(false);
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                            >
                                {t('create')}
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
