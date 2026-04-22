'use client';

import { useState } from 'react';
import { Loader2, Plus, Footprints, Check, Edit2, Trash2 } from 'lucide-react';
import { useTasks, useUserClasses, useCreateTask, useClaimTaskSlot, useUpdateTask, useDeleteTask, useSchool, useUserStudentIds, useStudents } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { SelectChildModal } from '@/components/modals/SelectChildModal';
import type { Task } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * PatrolPage — Foreldrarölt (fjord_moss redesign)
 */

export default function PatrolPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('patrol');

    const { data: userClasses } = useUserClasses(user?.uid || '', user?.email);
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId, activeClass?.schoolId);

    // Student Logic for selector
    const { data: myStudentIds } = useUserStudentIds(user?.uid, activeClassId);
    const { data: allStudents } = useStudents(activeClassId);
    const myStudents = allStudents?.filter(s => myStudentIds?.includes(s.id)) || [];

    const claimSlotMutation = useClaimTaskSlot();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    // School Context
    const { data: school } = useSchool(activeClass?.schoolId);
    const isSchoolAdmin = school?.admins?.includes(user?.uid || '');

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToVolunteer, setTaskToVolunteer] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState(t('default_title'));
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('20:00');
    const [newSlots, setNewSlots] = useState(2);

    if (!authLoading && !user) {
        router.push(`/${locale}/login`);
        return null;
    }

    const handleVolunteerClick = (taskId: string) => {
        if (!user) return;
        setTaskToVolunteer(taskId);
    };

    const confirmVolunteer = async (studentId?: string, studentName?: string) => {
        if (!user || !taskToVolunteer) return;
        try {
            await claimSlotMutation.mutateAsync({
                taskId: taskToVolunteer,
                userId: user.uid,
                userName: user.displayName || 'Foreldri',
                studentId,
                studentName
            });
            setTaskToVolunteer(null);
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
            <div className="min-h-screen flex items-center justify-center pt-24 text-primary">
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
                    <h1 className="text-3xl font-bold text-on-surface tracking-tight">{t('title')}</h1>
                    <p className="text-on-surface-variant mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-on-primary shadow-ambient bg-gradient-to-r from-primary to-primary-container hover:-translate-y-0.5 transition-all"
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
                        <div key={patrol.id} className="bg-surface-container-lowest rounded-3xl shadow-ambient p-6 flex flex-col justify-between group hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center">
                                            <Footprints size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-on-surface leading-tight">{patrol.title}</h3>
                                            <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wide">
                                                {dateObj ? `${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(dateObj)} kl. ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dateObj)}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Admin Controls */}
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 ml-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingTask(patrol); }}
                                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/15 rounded-xl transition-all"
                                                title="Breyta"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(patrol.id); }}
                                                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-xl transition-all"
                                                title="Eyða"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-center justify-between text-sm font-bold text-on-surface-variant mb-2">
                                    <span>{t('attended')}</span>
                                    <span>{patrol.slotsFilled} / {patrol.slotsTotal}</span>
                                </div>
                                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-primary' : 'bg-gradient-to-r from-primary to-primary-container'}`}
                                        style={{ width: `${(patrol.slotsFilled / patrol.slotsTotal) * 100}%` }}
                                    />
                                </div>

                                <button
                                    onClick={() => !isJoined && handleVolunteerClick(patrol.id)}
                                    disabled={isJoined || isFull}
                                    className={`w-full py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${isJoined
                                        ? 'bg-primary-container/15 text-primary ring-1 ring-primary/30'
                                        : isFull
                                            ? 'bg-surface-container-low text-on-surface-variant'
                                            : 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-ambient hover:-translate-y-0.5 active:scale-95'
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
                    <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-3xl shadow-ambient">
                        <p className="text-on-surface-variant font-bold">{t('no_patrols')}</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-ambient scale-100 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mx-auto mb-4 text-on-secondary-container shadow-ambient">
                                <Footprints size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-on-surface tracking-tight">{t('modal_title')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_title')}</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-on-surface"
                                    placeholder="t.d. Kvöldrölt"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_date')}</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-sm text-on-surface"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_time')}</label>
                                    <input
                                        type="time"
                                        value={newTime}
                                        onChange={e => setNewTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-sm text-on-surface"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_slots')}</label>
                                <input
                                    type="number"
                                    value={newSlots}
                                    onChange={e => setNewSlots(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-on-surface"
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
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
                                className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container shadow-ambient hover:-translate-y-0.5 transition-all"
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

            {/* Child Selection Modal */}
            <SelectChildModal
                isOpen={!!taskToVolunteer}
                onClose={() => setTaskToVolunteer(null)}
                children={myStudents}
                onSelect={(sid, sname) => confirmVolunteer(sid, sname)}
            />
        </div>
    );
}
