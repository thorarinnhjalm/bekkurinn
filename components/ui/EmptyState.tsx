'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    actionHref?: string;
    secondaryLabel?: string;
    onSecondary?: () => void;
    secondaryHref?: string;
}

/**
 * EmptyState Component
 * 
 * Educational empty state for guiding users when lists are empty.
 * Supports both button actions and Link navigation.
 */
export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    actionHref,
    secondaryLabel,
    onSecondary,
    secondaryHref,
}: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-4">
            {/* Icon */}
            <div className="flex justify-center mb-4 text-surface/80">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 text-on-surface">
                {title}
            </h3>

            {/* Description */}
            <p
                className="text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* Actions */}
            {(actionLabel || secondaryLabel) && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {/* Primary Action */}
                    {actionLabel && (
                        actionHref ? (
                            <Link
                                href={actionHref}
                                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-container transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                            >
                                {actionLabel}
                            </Link>
                        ) : onAction ? (
                            <button
                                onClick={onAction}
                                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-container transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                            >
                                {actionLabel}
                            </button>
                        ) : null
                    )}

                    {/* Secondary Action */}
                    {secondaryLabel && (
                        secondaryHref ? (
                            <Link
                                href={secondaryHref}
                                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-medium hover:bg-surface-container-high transition-all"
                            >
                                {secondaryLabel}
                            </Link>
                        ) : onSecondary ? (
                            <button
                                onClick={onSecondary}
                                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-medium hover:bg-surface-container-high transition-all"
                            >
                                {secondaryLabel}
                            </button>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
}
