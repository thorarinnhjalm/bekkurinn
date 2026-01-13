'use client';

import { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import type { Task } from '@/types';

interface EditTaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: string, data: Partial<Task>) => Promise<void>;
    isSchoolAdmin?: boolean;
}

export function EditTaskModal({ task, isOpen, onClose, onSave, isSchoolAdmin }: EditTaskModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || '',
        date: task.date?.toDate?.() ? formatDateForInput(task.date.toDate()) : '',
        slotsTotal: task.slotsTotal,
        isAllDay: task.isAllDay || false,
        scope: task.scope || 'class'
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
                date: finalDate as any,
                slotsTotal: formData.slotsTotal,
                isAllDay: formData.isAllDay,
                scope: formData.scope as any
            });
            onClose();
        } catch (error) {
            console.error('Save error:', error);
            alert('Villa kom upp');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-nordic-blue to-purple-600 left-0" />

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Breyta verkefni</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Scope Selector */}
                    {isSchoolAdmin && (
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setFormData({ ...formData, scope: 'class' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.scope === 'class' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Bekkur
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, scope: 'school' })}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.scope === 'school' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Allur Skólinn
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Heiti</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
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
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <input
                            type="checkbox"
                            id="editIsAllDay"
                            checked={formData.isAllDay}
                            onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-nordic-blue focus:ring-nordic-blue"
                        />
                        <label htmlFor="editIsAllDay" className="text-sm font-bold text-gray-700 cursor-pointer">Allan daginn</label>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Lýsing</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium h-24"
                        />
                    </div>

                    {task.slotsTotal > 0 && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Fjöldi plássa</label>
                            <input
                                type="number"
                                value={formData.slotsTotal}
                                onChange={e => setFormData({ ...formData, slotsTotal: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium"
                                min={task.slotsFilled}
                            />
                            {formData.slotsTotal < task.slotsFilled && (
                                <p className="text-xs text-red-600 mt-1 font-bold">
                                    Getur ekki verið minna en {task.slotsFilled} (núverandi skráningar)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Hætta við
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !formData.title || !formData.date}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-br from-nordic-blue to-nordic-blue-dark shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
