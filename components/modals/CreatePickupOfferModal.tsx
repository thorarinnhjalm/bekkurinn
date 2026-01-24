'use client';

import { useState, useEffect } from 'react';
import { X, Car, Clock, Users, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Timestamp } from 'firebase/firestore';
import { createPickupOffer, getStarredFriendsParents, getAllClassParents } from '@/services/firestore';
import type { CreatePickupOfferInput } from '@/types';

interface CreatePickupOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    studentId: string; // The user's child's ID
    classId: string;
}

export function CreatePickupOfferModal({
    isOpen,
    onClose,
    userId,
    userName,
    studentId,
    classId,
}: CreatePickupOfferModalProps) {
    const [time, setTime] = useState('14:00');
    const [slots, setSlots] = useState(2);
    const [description, setDescription] = useState('');
    const [onlyStarredFriends, setOnlyStarredFriends] = useState(true);
    const [targetParentCount, setTargetParentCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const t = useTranslations('pickup_offers.modal');

    // Calculate target parent count whenever onlyStarredFriends changes
    useEffect(() => {
        async function calculateTargets() {
            if (!isOpen) return;

            try {
                let parentIds: string[];
                if (onlyStarredFriends) {
                    parentIds = await getStarredFriendsParents(userId, classId);
                } else {
                    parentIds = await getAllClassParents(classId);
                    // Exclude self
                    parentIds = parentIds.filter(id => id !== userId);
                }
                setTargetParentCount(parentIds.length);
            } catch (error) {
                console.error('Error calculating targets:', error);
            }
        }
        calculateTargets();
    }, [isOpen, onlyStarredFriends, userId, classId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            // Get target parents
            let sentToParents: string[];
            if (onlyStarredFriends) {
                sentToParents = await getStarredFriendsParents(userId, classId);
                if (sentToParents.length === 0) {
                    setError(t('no_starred'));
                    setIsSaving(false);
                    return;
                }
            } else {
                sentToParents = await getAllClassParents(classId);
                // Exclude self
                sentToParents = sentToParents.filter(id => id !== userId);
            }

            // Get today's date at 00:00
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const offerData: CreatePickupOfferInput = {
                classId,
                offeredBy: userId,
                offeredByName: userName,
                offeredByStudentId: studentId,
                title: `${t('title_default')} ${time}`,
                description: description.trim() || undefined,
                date: Timestamp.fromDate(today),
                time,
                availableSlots: slots,
                sentToParents,
                onlyStarredFriends,
                isActive: true,
            };

            await createPickupOffer(offerData);

            // Success! Close modal
            onClose();

            // Reset form
            setTime('14:00');
            setSlots(2);
            setDescription('');
            setOnlyStarredFriends(true);

            // Show success message (could use a toast notification system)
            alert(t('send_success', { count: sentToParents.length }));
        } catch (error: any) {
            console.error('Error creating pickup offer:', error);
            setError(error.message || t('create_error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Car className="text-green-600" size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('modal_title')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <Info size={16} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Clock size={16} />
                            {t('label_time')}
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg"
                        />
                    </div>

                    {/* Available Slots */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Users size={16} />
                            {t('label_slots')}
                        </label>
                        <select
                            value={slots}
                            onChange={(e) => setSlots(Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg"
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num} {num === 1 ? 'barn' : 'börn'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('label_desc')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('placeholder_desc')}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                        />
                    </div>

                    {/* Targeting Option */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={onlyStarredFriends}
                                onChange={(e) => setOnlyStarredFriends(e.target.checked)}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{t('label_target')}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {onlyStarredFriends
                                        ? t('target_friends', { count: targetParentCount })
                                        : t('target_all', { count: targetParentCount })
                                    }
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('sending')}
                                </>
                            ) : (
                                <>
                                    <Car size={18} />
                                    {t('submit')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
