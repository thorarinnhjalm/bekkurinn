'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Users, Gift, Calendar, Bell } from 'lucide-react';

interface ExitIntentPopupProps {
    onSignUp?: () => void;
}

export function ExitIntentPopup({ onSignUp }: ExitIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    const handleExitIntent = useCallback((e: MouseEvent) => {
        // Only trigger when mouse leaves towards the top of the viewport
        if (e.clientY <= 5 && !hasTriggered) {
            // Check if popup was already shown in this session
            const alreadyShown = sessionStorage.getItem('exitIntentShown');
            if (!alreadyShown) {
                setIsVisible(true);
                setHasTriggered(true);
                sessionStorage.setItem('exitIntentShown', 'true');
            }
        }
    }, [hasTriggered]);

    useEffect(() => {
        document.addEventListener('mouseout', handleExitIntent);
        return () => {
            document.removeEventListener('mouseout', handleExitIntent);
        };
    }, [handleExitIntent]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleSignUp = () => {
        setIsVisible(false);
        onSignUp?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Loka"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={32} className="text-blue-600" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">
                        Bíddu aðeins!
                    </h2>

                    <p className="text-gray-600">
                        Vissu þú að með Bekkurinn færðu:
                    </p>

                    <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="p-1.5 bg-green-100 rounded-full">
                                <Calendar size={16} className="text-green-600" />
                            </div>
                            <span>Sjálfvirka afmælisáminningu fyrir alla í bekk</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="p-1.5 bg-purple-100 rounded-full">
                                <Bell size={16} className="text-purple-600" />
                            </div>
                            <span>Tilkynningar um viðburði og verkefni</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="p-1.5 bg-orange-100 rounded-full">
                                <Gift size={16} className="text-orange-600" />
                            </div>
                            <span>Óskilamunaskrá og fleira — allt ókeypis!</span>
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={handleSignUp}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        >
                            Já, ég vil skrá mig!
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                        >
                            Nei takk, ég kíki aftur seinna
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
