'use client';

import { LostItem } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useDeleteLostItem, useUpdateLostItem } from '@/hooks/useFirestore';
import { Trash2, CheckCircle, MapPin, User } from 'lucide-react';
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
            bg-surface-container-lowest rounded-2xl shadow-ambient
            ${item.isClaimed ? 'opacity-60 grayscale' : 'hover:-translate-y-0.5'}
        `}>
            {/* Image (if exists) */}
            {item.imageUrl ? (
                <div className="aspect-square relative bg-surface-container-low">
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                    {item.isClaimed && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-3 py-1 bg-primary text-on-primary font-bold rounded-full text-sm shadow-ambient">
                                {t('found_badge')}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className={`aspect-square flex flex-col items-center justify-center p-6 text-center
                    ${isLost ? 'bg-error-container/40 text-error' : 'bg-secondary-container text-on-secondary-container'}
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
                        text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full
                        ${isLost ? 'bg-error-container/40 text-error' : 'bg-secondary-container text-on-secondary-container'}
                    `}>
                        {isLost ? t('lost_label') : t('found_label')}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                        {new Date(item.createdAt?.seconds * 1000).toLocaleDateString(locale)}
                    </span>
                </div>

                <div>
                    <h3 className="font-bold text-on-surface leading-tight mb-1">{item.title}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{item.description}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/30">
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
                            className="flex-1 py-2 bg-primary-container/15 text-primary text-xs font-semibold rounded-full hover:bg-primary-container/25 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <CheckCircle size={14} />
                            {isLost ? t('solved') : t('claim_mine')}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-9 flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-full transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
