'use client';

import { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface WelcomeModalProps {
    isOnboarding?: boolean;
    onClose: () => void;
}

/**
 * WelcomeModal Component
 * 
 * First-run experience greeting for new users.
 * Shows only once per user (tracked via Firestore).
 * Warm, encouraging Icelandic copy.
 */
export function WelcomeModal({ isOnboarding = false, onClose }: WelcomeModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const handleClose = async () => {
        // Mark user as having seen the welcome modal
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    hasSeenWelcome: true,
                });
            } catch (error) {
                console.error('Failed to update welcome status:', error);
            }
        }
        onClose();
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Velkomin í Bekkurinn! 🎉
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Einfalt og þægilegt kerfi fyrir foreldra og bekkjarformenn. Allt sem bekkurinn þinn þarf á einum stað.
                        </p>
                    </div>
                )}

                {/* Step 2: Features */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            Hvað geturðu gert?
                        </h2>
                        <div className="space-y-3">
                            <FeatureItem
                                icon="📅"
                                title="Halda utan um viðburði"
                                description="Sjáðu foreldrarölt, afmæli og skóladagatal"
                            />
                            <FeatureItem
                                icon="📢"
                                title="Fá tilkynningar"
                                description="Mikilvægar fréttir frá bekkjarformanni"
                            />
                            <FeatureItem
                                icon="👥"
                                title="Tengjast öðrum foreldrum"
                                description="Sjáðu tengiliðaupplýsingar bekkjarins"
                            />
                            <FeatureItem
                                icon="✅"
                                title="Bjóðast í verkefni"
                                description="Skráðu þig í foreldrarölt með einum smelli"
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Ready to Go */}
                {step === 3 && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <CheckCircle2 className="text-white" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Þú ert tilbúinn! ✨
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Við erum hér til að auðvelda þér lífið. Ef þú hefur spurningar, ekki hika við að hafa samband.
                        </p>
                        <p className="text-sm text-gray-500">
                            Gangi þér vel!
                        </p>
                    </div>
                )}

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 pt-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            Til baka
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        {step === totalSteps ? 'Byrja' : 'Áfram'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{icon}</span>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
}
