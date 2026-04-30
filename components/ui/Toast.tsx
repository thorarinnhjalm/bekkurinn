'use client';

import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';


/**
 * Toast Notification System for Bekkurinn
 * 
 * Simple, elegant toast notifications using Zustand for state management.
 * 
 * Usage:
 * ```tsx
 * import { toast } from '@/lib/toast';
 * 
 * toast.success('Vistun tókst!');
 * toast.error('Villa kom upp');
 * toast.info('Athugaðu þetta');
 * ```
 */

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (message, type, duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);

        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }],
        }));

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    clearAll: () => set({ toasts: [] }),
}));

// Convenient helper functions
export const toast = {
    success: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'success', duration),

    error: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'error', duration),

    info: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'info', duration),
};

/**
 * ToastContainer Component
 * Renders all active toasts
 * Should be placed once in the app layout
 */
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div
            className="fixed bottom-0 right-0 p-4 z-50 space-y-2 pointer-events-none"
            style={{
                maxWidth: '400px',
            }}
        >
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />,
    };

    const styles = {
        success: {
            bg: 'bg-primary-container/15',
            border: 'border-primary/30',
            text: 'text-primary',
            icon: 'text-primary',
        },
        error: {
            bg: 'bg-error-container/40',
            border: 'border-error/30',
            text: 'text-error',
            icon: 'text-error',
        },
        info: {
            bg: 'bg-primary-container/15',
            border: 'border-primary/30',
            text: 'text-primary',
            icon: 'text-primary',
        },
    };

    const style = styles[toast.type];

    return (
        <div
            className={`
                ${style.bg} ${style.border} ${style.text}
                border rounded-lg shadow-lg p-4 
                flex items-start gap-3
                animate-slideIn
                pointer-events-auto
                max-w-full
            `}
            role="alert"
        >
            <div className={style.icon}>{icons[toast.type]}</div>

            <p className="flex-1 text-sm font-medium">{toast.message}</p>

            <button
                onClick={onClose}
                className={`${style.text} hover:opacity-70 transition-opacity shrink-0`}
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div>
    );
}
