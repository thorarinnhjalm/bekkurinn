'use client';

import { LostItem } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useDeleteLostItem, useUpdateLostItem } from '@/hooks/useFirestore';
import { Trash2, CheckCircle, MapPin, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

interface LostItemCardProps {
    item: LostItem;
    isAdmin: boolean;
}

export function LostItemCard({ item, isAdmin }: LostItemCardProps) {
    const { user } = useAuth();
    const deleteMutation = useDeleteLostItem();
    const updateMutation = useUpdateLostItem();
    const t = useTranslations('lost_found.card');
    const locale = useLocale();

    // Check if current user is the author
    const isAuthor = user?.uid === item.createdBy;
    const canManage = isAdmin || isAuthor;

    const handleDelete = async () => {
        if (confirm(t('confirm_delete'))) {
            await deleteMutation.mutateAsync(item.id);
        }
    };

    const handleClaim = async () => {
        if (confirm(t('confirm_claim'))) {
            await updateMutation.mutateAsync({
                id: item.id,
                data: { isClaimed: true, claimedBy: user?.uid }
            });
        }
    };

    const isLost = item.type === 'lost';

    return (
        <div className={`
            relative overflow-hidden transition-all duration-200
            bg-white border rounded-lg shadow-sm
            ${item.isClaimed ? 'opacity-60 grayscale' : 'hover:shadow-md hover:border-gray-300'}
            ${isLost ? 'border-red-100' : 'border-blue-100'}
        `}>
            {/* Image (if exists) */}
            {item.imageUrl ? (
                <div className="aspect-square relative bg-gray-50">
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                    {item.isClaimed && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-3 py-1 bg-green-500 text-white font-bold rounded-full text-sm shadow-sm">
                                {t('found_badge')}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className={`aspect-square flex flex-col items-center justify-center p-6 text-center
                    ${isLost ? 'bg-red-50 text-red-400' : 'bg-blue-50 text-blue-400'}
                `}>
                    <span className="text-4xl mb-2">{isLost ? '❓' : '🎒'}</span>
                    <span className="text-xs font-bold uppercase tracking-wide opacity-70">
                        {isLost ? t('lost') : t('found')}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                    <span className={`
                        text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md
                        ${isLost ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}
                    `}>
                        {isLost ? t('lost_label') : t('found_label')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(item.createdAt?.seconds * 1000).toLocaleDateString(locale)}
                    </span>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
                    {item.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{item.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{item.author}</span>
                    </div>
                </div>

                {/* Actions */}
                {canManage && !item.isClaimed && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleClaim}
                            className="flex-1 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-md hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5 border border-green-100"
                        >
                            <CheckCircle size={14} />
                            {isLost ? t('solved') : t('claim_mine')}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-9 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors border border-gray-200"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
