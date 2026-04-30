'use client';

import { useState } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { useUnclaimTaskSlot } from '@/hooks/useFirestore';

interface EditTaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: string, data: Partial<Task>) => Promise<void>;
    isSchoolAdmin?: boolean;
}

export function EditTaskModal({ task, isOpen, onClose, onSave, isSchoolAdmin }: EditTaskModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const unclaimMutation = useUnclaimTaskSlot();
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || '',
        date: task.date?.toDate?.() ? formatDateForInput(task.date.toDate()) : '',
        slotsTotal: task.slotsTotal,
        isAllDay: task.isAllDay || false,
        scope: task.scope || 'class',
        volunteerReminderHours: task.volunteerReminderHours || 24
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // If isAllDay, ensure time is T00:00:00
            let finalDate = new Date(formData.date);
            if (formData.isAllDay) {
                const dateOnly = formData.date.split('T')[0];
                finalDate = new Date(`${dateOnly}T00:00:00`);
            }

            await onSave(task.id, {
                title: formData.title,
                description: formData.description,
                date: Timestamp.fromDate(finalDate),
                slotsTotal: formData.slotsTotal,
                volunteerReminderHours: formData.slotsTotal > 0 ? formData.volunteerReminderHours : undefined,
                isAllDay: formData.isAllDay,
                scope: formData.scope as 'class' | 'school'
            });
            onClose();
        } catch (error) {
            console.error('Save error:', error);
            alert('Error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveVolunteer = async (userId: string) => {
        if (!confirm('Ertu viss um að þú viljir fjarlægja þennan sjálfboðaliða?')) return;
        try {
            await unclaimMutation.mutateAsync({ taskId: task.id, userId });
        } catch (error) {
            console.error(error);
            alert('Gat ekki fjarlægt sjálfboðaliða');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 w-full h-2 bg-linear-to-r from-nordic-blue to-purple-600 left-0" />

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-on-surface tracking-tight">Breyta verkefni</h2>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-on-surface-variant transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Scope Selector */}
                    {isSchoolAdmin && (
                        <div className="flex bg-surface-container-high p-1 rounded-xl">
                            <button
                                onClick={() => setFormData({ ...formData, scope: 'class' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.scope === 'class' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Bekkur
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, scope: 'school' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.scope === 'school' ? 'bg-surface-container-lowest text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Allur Skólinn
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Heiti</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">
                                {formData.isAllDay ? 'Dagsetning' : 'Dagsetning og tími'}
                            </label>
                            <input
                                type={formData.isAllDay ? 'date' : 'datetime-local'}
                                value={formData.isAllDay ? formData.date.split('T')[0] : formData.date}
                                onChange={e => {
                                    let newDate = e.target.value;
                                    if (formData.isAllDay && !newDate.includes('T')) {
                                        newDate = `${newDate}T00:00`;
                                    }
                                    setFormData({ ...formData, date: newDate });
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <input
                            type="checkbox"
                            id="editIsAllDay"
                            checked={formData.isAllDay}
                            onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <label htmlFor="editIsAllDay" className="text-sm font-bold text-on-surface cursor-pointer">Allan daginn</label>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Lýsing</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none font-medium h-24"
                        />
                    </div>

                    {task.slotsTotal > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Fjöldi plássa</label>
                                <input
                                    type="number"
                                    value={formData.slotsTotal}
                                    onChange={e => setFormData({ ...formData, slotsTotal: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none font-medium"
                                    min={task.slotsFilled}
                                />
                                {formData.slotsTotal < task.slotsFilled && (
                                    <p className="text-xs text-error mt-1 font-bold">
                                        Getur ekki verið minna en {task.slotsFilled}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Áminning sjálfboðaliða</label>
                                <select
                                    value={formData.volunteerReminderHours}
                                    onChange={e => setFormData({ ...formData, volunteerReminderHours: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl bg-surface border-2 border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all outline-none font-medium"
                                >
                                    <option value={12}>12 klst fyrir</option>
                                    <option value={24}>24 klst fyrir</option>
                                    <option value={48}>48 klst fyrir (2 dögum)</option>
                                    <option value={168}>1 viku fyrir</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Volunteer List */}
                    {task.volunteers && task.volunteers.length > 0 && (
                        <div className="pt-4 border-t border-outline-variant/30">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 mb-2 block">Skráðir sjálfboðaliðar</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto bg-surface rounded-xl p-2">
                                {task.volunteers.map((vol, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 shadow-sm">
                                        <div>
                                            <p className="font-bold text-sm text-on-surface">{vol.name}</p>
                                            {vol.studentName && (
                                                <p className="text-xs text-on-surface-variant">Fyrir: {vol.studentName}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveVolunteer(vol.userId)}
                                            className="text-surface/80 hover:text-error transition-colors p-1"
                                            title="Fjarlægja"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface transition-colors"
                    >
                        Hætta við
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !formData.title || !formData.date}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-linear-to-br from-nordic-blue to-nordic-blue-dark shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving && <Loader2 className="animate-spin" size={18} />}
                        Vista breytingar
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
