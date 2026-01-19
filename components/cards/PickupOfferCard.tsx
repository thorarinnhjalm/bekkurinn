'use client';

import { Car, Clock, Users, Check, X } from 'lucide-react';
import { acceptPickupOffer, cancelPickupOffer } from '@/services/firestore';
import type { PickupOffer } from '@/types';
import { useState } from 'react';

interface PickupOfferCardProps {
    offer: PickupOffer;
    currentUserId: string;
    currentUserName: string;
    currentUserStudentId?: string;
    currentUserStudentName?: string;
    onUpdate: () => void; // Callback to refresh data after accept/cancel
}

export function PickupOfferCard({
    offer,
    currentUserId,
    currentUserName,
    currentUserStudentId,
    currentUserStudentName,
    onUpdate,
}: PickupOfferCardProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const isMyOffer = offer.offeredBy === currentUserId;
    const slotsRemaining = offer.availableSlots - offer.acceptances.length;
    const isFull = slotsRemaining <= 0;

    // Check if current user has already accepted
    const myAcceptance = offer.acceptances.find(
        a => a.parentId === currentUserId && a.studentId === currentUserStudentId
    );
    const hasAccepted = !!myAcceptance;

    const handleAccept = async () => {
        if (!currentUserStudentId || !currentUserStudentName) {
            setError('Engin nemandi tengdur');
            return;
        }

        setError('');
        setIsProcessing(true);

        try {
            await acceptPickupOffer(
                offer.id,
                currentUserId,
                currentUserName,
                currentUserStudentId,
                currentUserStudentName
            );
            onUpdate(); // Refresh the list
        } catch (err: any) {
            setError(err.message || 'Villa kom upp');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Ertu viss um að þú viljir hætta við þetta tilboð?')) return;

        setIsProcessing(true);
        try {
            await cancelPickupOffer(offer.id);
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Villa kom upp');
        } finally {
            setIsProcessing(false);
        }
    };

    // Format date
    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const offerDate = new Date(date);
        offerDate.setHours(0, 0, 0, 0);

        if (offerDate.getTime() === today.getTime()) {
            return 'Í dag';
        }
        return new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long'
        }).format(date);
    };

    return (
        <div className={`glass-card p-5 space-y-4 transition-all ${hasAccepted ? 'ring-2 ring-green-200 bg-green-50/30' : ''} ${isFull && !hasAccepted ? 'opacity-60' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isMyOffer ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <Car className={isMyOffer ? 'text-blue-600' : 'text-green-600'} size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{offer.title}</h3>
                        <p className="text-sm text-gray-600">
                            {isMyOffer ? 'Þitt tilboð' : `${offer.offeredByName}`}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                {hasAccepted && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        <Check size={14} />
                        Samþykkt
                    </span>
                )}
                {isFull && !hasAccepted && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                        Fullt
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{formatDate(offer.date)} kl {offer.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span className={slotsRemaining === 0 ? 'text-gray-400' : 'text-green-600 font-bold'}>
                        {slotsRemaining} {slotsRemaining === 1 ? 'pláss' : 'pláss'} laus
                    </span>
                </div>
            </div>

            {/* Description */}
            {offer.description && (
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {offer.description}
                </p>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Acceptances List (for offer creator) */}
            {isMyOffer && offer.acceptances.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-bold text-gray-700 mb-2">
                        {offer.acceptances.length} {offer.acceptances.length === 1 ? 'barn' : 'börn'} samþykkt:
                    </p>
                    <ul className="space-y-1">
                        {offer.acceptances.map((acceptance, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                <Check size={14} className="text-green-600" />
                                {acceptance.studentName} ({acceptance.parentName})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
                {!isMyOffer && !hasAccepted && !isFull && (
                    <button
                        onClick={handleAccept}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={16} />
                                Samþykkja fyrir {currentUserStudentName || 'barn'}
                            </>
                        )}
                    </button>
                )}

                {isMyOffer && offer.isActive && (
                    <button
                        onClick={handleCancel}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <X size={16} />
                                Hætta við tilboð
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
