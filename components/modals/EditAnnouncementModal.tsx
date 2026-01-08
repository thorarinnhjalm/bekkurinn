'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Announcement } from '@/types';

interface EditAnnouncementModalProps {
    announcement: Announcement;
    isOpen: boolean;
    onClose: () => void;
    onSave: (announcementId: string, data: Partial<Announcement>) => Promise<void>;
}

export function EditAnnouncementModal({ announcement, isOpen, onClose, onSave }: EditAnnouncementModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: announcement.title,
        content: announcement.content,
        pinned: announcement.pinned
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(announcement.id, {
                title: formData.title,
                content: formData.content,
                pinned: formData.pinned
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
                    <h2 className="text-xl font-bold text-gray-900">Breyta tilkynningu</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fyrirsögn</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Efni</label>
                        <textarea
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full p-2 border rounded-lg h-32"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit-pin"
                            checked={formData.pinned}
                            onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <label htmlFor="edit-pin" className="text-sm text-gray-700">Festa efst (Mikilvægt)</label>
                    </div>
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
                        disabled={isSaving || !formData.title || !formData.content}
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
