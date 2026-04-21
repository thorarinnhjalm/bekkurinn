'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTasks, useClaimTaskSlot, useUserClasses, useCreateTask, useSchool, useUpdateTask, useDeleteTask, useUserStudentIds, useStudents } from '@/hooks/useFirestore';
import { Edit2, Loader2, Calendar, Clock, MapPin, Plus, Info, Trash2 } from 'lucide-react'; // Users removed if unused
import { useRouter, useParams } from 'next/navigation';
import type { Task } from '@/types';
import { Babelfish } from '@/components/Babelfish';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { CreateBirthdayModal } from '@/components/modals/CreateBirthdayModal';
import { SelectChildModal } from '@/components/modals/SelectChildModal';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('calendar');

    // 1. Get User's Classes
    const { data: userClasses, isLoading: classesLoading } = useUserClasses(user?.uid || '', user?.email);
    const activeClassId = userClasses?.[0]?.id || '';
    const activeClass = userClasses?.find(c => c.id === activeClassId);
    const isAdmin = activeClass?.role === 'admin';

    // School Context
    const { data: school } = useSchool(activeClass?.schoolId);
    const isSchoolAdmin = school?.admins?.includes(user?.uid || '');

    // 2. Fetch Tasks (Class + School)
    const { data: myStudentIds } = useUserStudentIds(user?.uid, activeClassId);
    // New: Fetch actual student objects for the user (to populate selector)
    const { data: allStudents } = useStudents(activeClassId);
    const myStudents = allStudents?.filter(s => myStudentIds?.includes(s.id)) || [];

    const { data: tasksData, isLoading: tasksLoading } = useTasks(activeClassId, activeClass?.schoolId, myStudentIds, user?.uid);
    const claimSlotMutation = useClaimTaskSlot();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
    const [taskToVolunteer, setTaskToVolunteer] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [createTitle, setCreateTitle] = useState('');
    const [createDate, setCreateDate] = useState('');
    const [createTime, setCreateTime] = useState('12:00');
    const [createDesc, setCreateDesc] = useState('');
    const [createSlots, setCreateSlots] = useState(2);
    const [createIsAllDay, setCreateIsAllDay] = useState(false);
    const [scope, setScope] = useState<'class' | 'school'>('class');
    const [filter, setFilter] = useState<'all' | 'rolt' | 'birthday' | 'event'>('all');


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

    const handleVolunteerClick = (taskId: string) => {
        if (!user) return;

        // If user has multiple children in this class, show modal
        // Note: useUserStudentIds returns IDs only. We need names.
        // But we can check userClasses for the current user's children?
        // Actually, let's use the `myStudentIds`. We need to fetch student details.
        // For simplicity: If > 1 child ID, show modal.

        // Better: Fetch student objects for current user in this class.
        // We can use a hook or filter from a students list.
        // FOR NOW: Let's assume we can pass the student IDs and fetch names or use a hook.

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
            alert(t('error_signup'));
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!window.confirm(t('confirm_delete'))) return;
        try {
            await deleteTaskMutation.mutateAsync(taskId);
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert(t('error_delete'));
        }
    };

    if (authLoading || classesLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    // Filter & Sort


    const allTasks = tasksData || [];
    // Display 'event', 'rolt', 'gift_collection', 'school_event' AND 'birthday'

    // 1. Filter by Type
    const filteredTasks = allTasks.filter(t => {
        // Base allowed types
        const allowedTypes = ['event', 'rolt', 'gift_collection', 'school_event', 'birthday'];
        if (!allowedTypes.includes(t.type)) return false;

        // Specific Filter Logic
        if (filter === 'all') return true;
        if (filter === 'rolt') return t.type === 'rolt';
        if (filter === 'birthday') return t.type === 'birthday';
        if (filter === 'event') return ['event', 'school_event', 'gift_collection'].includes(t.type);

        return true;
    });

    const sortedEvents = [...filteredTasks].sort((a, b) => {
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
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-3">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-on-surface-variant leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(isAdmin || isSchoolAdmin) && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary-container"
                        >
                            <Plus size={18} />
                            {t('new_event')}
                        </button>
                    )}
                    <button
                        onClick={() => setIsBirthdayModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold hover:opacity-90 transition-all"
                    >
                        <span>🎂</span>
                        {t('register_birthday')}
                    </button>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {([
                    { id: 'all', label: t('filter_all') },
                    { id: 'event', label: t('filter_events') },
                    { id: 'rolt', label: t('filter_patrol') },
                    { id: 'birthday', label: t('filter_birthday') },
                ] as const).map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setFilter(id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                            filter === id
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface ghost-border'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Translation Notice (non-Icelandic) */}
            {locale !== 'is' && (
                <div className="max-w-4xl mx-auto p-4 bg-surface-container-low rounded-2xl flex items-start gap-3 ghost-border">
                    <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-on-surface-variant leading-relaxed italic">
                        <strong className="text-on-surface">Translation Notice:</strong> Task descriptions are automatically translated into your language. Original text is preserved for accuracy.
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

                    // Type Logic
                    const isSchool = task.type === 'school_event' || (task.schoolId && !task.classId);
                    const isBirthday = task.type === 'birthday';
                    const isRolt = task.type === 'rolt';

                    // Styling Strategy - MD3 tokens via fjord_moss palette
                    let accentBar = 'bg-outline-variant';
                    let badgeLabel = '';
                    let badgeColor = '';

                    if (isSchool) {
                        accentBar = 'bg-tertiary';
                        badgeLabel = t('type_school');
                        badgeColor = 'bg-tertiary-fixed text-on-tertiary-fixed';
                    } else if (isBirthday) {
                        accentBar = 'bg-secondary';
                        badgeLabel = t('type_birthday');
                        badgeColor = 'bg-tertiary-fixed/60 text-on-tertiary-fixed';
                    } else if (isRolt) {
                        accentBar = 'bg-primary-container';
                        badgeLabel = t('type_patrol');
                        badgeColor = 'bg-secondary-container text-on-secondary-container';
                    } else {
                        accentBar = 'bg-primary';
                        badgeLabel = t('type_class');
                        badgeColor = 'bg-primary-container/15 text-primary';
                    }

                    return (
                        <div
                            key={task.id}
                            className={`bg-surface-container-lowest rounded-3xl shadow-ambient flex flex-col md:flex-row overflow-hidden group relative ${!isTaskUpcoming ? 'opacity-70 grayscale-[0.5] hover:grayscale-0' : ''}`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Accent bar */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${accentBar}`} aria-hidden="true" />

                            {/* Date Column */}
                            <div className="md:w-48 bg-surface md:border-r border-outline-variant/20 p-6 flex flex-col justify-center items-center text-center transition-colors">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                                    {dateObj ? new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dateObj) : '---'}
                                </span>

                                {task.endDate ? (
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl font-bold text-on-surface leading-none mb-1">
                                            {dateObj ? dateObj.getDate() : '--'}-{task.endDate.toDate().getDate()}
                                        </span>
                                        <span className="text-base font-medium text-primary">
                                            {dateObj ? new Intl.DateTimeFormat(locale, { month: 'short' }).format(dateObj) : '---'}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold text-on-surface leading-none mb-1">
                                            {dateObj ? dateObj.getDate() : '--'}
                                        </span>
                                        <span className="text-base font-medium text-primary">
                                            {dateObj ? new Intl.DateTimeFormat(locale, { month: 'short' }).format(dateObj) : '---'}
                                        </span>
                                    </>
                                )}

                                {dateObj && !isAllDay && !task.endDate && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-ambient">
                                        <Clock size={12} />
                                        {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dateObj)}
                                    </div>
                                )}
                                {isAllDay && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary-container/15 px-3 py-1 rounded-full">
                                        {t('label_allday')}
                                    </div>
                                )}
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                                {badgeLabel}
                                            </span>
                                            {task.scope === 'school' && !isSchool && (
                                                <span className="px-2 py-0.5 bg-tertiary-fixed/60 text-on-tertiary-fixed rounded text-[10px] font-bold uppercase tracking-wider">{t('scope_school')}</span>
                                            )}
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold text-on-surface leading-tight">
                                            {task.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {task.type === 'gift_collection' && (
                                            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-lg uppercase tracking-wide">💵 Söfnun</span>
                                        )}

                                        {(isAdmin || isSchoolAdmin) && (
                                            <div className="flex items-center gap-1 ml-2">
                                                <button
                                                    onClick={() => setEditingTask(task)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                                                    title="Breyta"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                                                    title="Eyða"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-on-surface-variant leading-relaxed mb-4 max-w-2xl">
                                    {task.description || t('desc_empty')}
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
                                        <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl ghost-border">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">
                                                    <span>{t('volunteers')}</span>
                                                    <span>{task.slotsFilled} / {task.slotsTotal}</span>
                                                </div>
                                                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-primary' : 'bg-gradient-to-r from-primary to-primary-container'}`}
                                                        style={{ width: `${(task.slotsFilled / task.slotsTotal) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleVolunteerClick(task.id)}
                                                disabled={isFull || !isTaskUpcoming}
                                                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${isFull
                                                    ? 'bg-primary-container/15 text-primary cursor-default'
                                                    : 'text-on-primary shadow-ambient hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary-container'
                                                    }`}
                                            >
                                                {isFull ? t('full') : t('sign_up')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-2 text-sm text-on-surface-variant font-medium italic flex items-center gap-2">
                                            <Info size={14} />
                                            {t('no_signup_needed')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {sortedEvents.length === 0 && (
                    <div className="text-center py-24 bg-surface-container-lowest rounded-3xl shadow-ambient">
                        <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="text-on-surface-variant" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-on-surface">{t('empty_title')}</h3>
                        <p className="text-on-surface-variant">{t('empty_desc')}</p>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                {t('show_all')}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Simple Create Modal (Reused Logic) */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-ambient scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-primary-container left-0" />

                        <div className="text-center">
                            <div className="w-14 h-14 bg-primary-container/15 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary shadow-ambient">
                                <Edit2 size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-on-surface tracking-tight">{t('modal_title')}</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Scope Selector */}
                            {isSchoolAdmin && (
                                <div className="flex bg-surface-container-low p-1 rounded-xl">
                                    <button
                                        onClick={() => setScope('class')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'class' ? 'bg-surface-container-lowest text-on-surface shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        {t('scope_class')}
                                    </button>
                                    <button
                                        onClick={() => setScope('school')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${scope === 'school' ? 'bg-surface-container-lowest text-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        {t('scope_school')}
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_title')}</label>
                                <input
                                    type="text"
                                    value={createTitle}
                                    onChange={e => setCreateTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-on-surface"
                                    placeholder="t.d. Kökubasar"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_date')}</label>
                                    <input
                                        type="date"
                                        value={createDate}
                                        onChange={e => setCreateDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-on-surface"
                                    />
                                </div>
                                <div className={createIsAllDay ? 'opacity-30 pointer-events-none' : ''}>
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_time')}</label>
                                    <input
                                        type="time"
                                        value={createTime}
                                        onChange={e => setCreateTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-on-surface"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <input
                                    type="checkbox"
                                    id="isAllDay"
                                    checked={createIsAllDay}
                                    onChange={(e) => setCreateIsAllDay(e.target.checked)}
                                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                />
                                <label htmlFor="isAllDay" className="text-sm font-bold text-on-surface cursor-pointer">{t('label_allday')}</label>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_desc')}</label>
                                <textarea
                                    value={createDesc}
                                    onChange={e => setCreateDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium h-24 text-on-surface"
                                    placeholder="Nánari upplýsingar..."
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{t('label_slots')}</label>
                                    <input
                                        type="number"
                                        value={createSlots}
                                        onChange={e => setCreateSlots(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/40 transition-all outline-none font-medium text-on-surface"
                                        min={0}
                                    />
                                </div>
                                <div className="pt-5">
                                    <span className="text-xs text-on-surface-variant font-medium leading-tight inline-block max-w-[140px]">
                                        {t('slots_help')}
                                    </span>
                                </div>
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
                                className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container shadow-ambient hover:-translate-y-0.5 transition-all"
                            >
                                {t('publish')}
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

            {/* Birthday Modal */}
            <CreateBirthdayModal
                isOpen={isBirthdayModalOpen}
                onClose={() => setIsBirthdayModalOpen(false)}
                classId={activeClassId}
                schoolId={activeClass?.schoolId}
            />
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
