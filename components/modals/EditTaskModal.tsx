'use client';

import { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import type { Task } from '@/types';

interface EditTaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: string, data: Partial<Task>) => Promise<void>;
}

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || '',
        date: task.date?.toDate?.() ? formatDateForInput(task.date.toDate()) : '',
        slotsTotal: task.slotsTotal
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(task.id, {
                title: formData.title,
                description: formData.description,
                date: new Date(formData.date) as any,
                slotsTotal: formData.slotsTotal
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Breyta verkefni</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Heiti</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dagsetning</label>
                        <input
                            type="datetime-local"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lýsing</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border rounded-lg h-24"
                        />
                    </div>

                    {task.type === 'rolt' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fjöldi plássa</label>
                            <input
                                type="number"
                                value={formData.slotsTotal}
                                onChange={e => setFormData({ ...formData, slotsTotal: Number(e.target.value) })}
                                className="w-full p-2 border rounded-lg"
                                min={task.slotsFilled} // Can't go below filled slots
                            />
                            {formData.slotsTotal < task.slotsFilled && (
                                <p className="text-xs text-red-600 mt-1">
                                    Getur ekki verið minna en {task.slotsFilled} (núverandi skráningar)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                    >
                        Hætta við
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !formData.title || !formData.date}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving && <Loader2 className="animate-spin" size={16} />}
                        Vista
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
