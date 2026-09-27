import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Megaphone, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';

interface WelcomeWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        title: 'Velkomin í Bekkinn!',
        description: 'Miðstöð upplýsinga fyrir bekkinn á einum stað. Hér er stutt ferðalag um helstu aðgerðir.',
        icon: '👋',
        image: null
    },
    {
        title: 'Bekkjarlistinn',
        description: 'Hér sérðu upplýsingar um alla nemendur og foreldra. Þú getur breytt upplýsingum um þitt barn hvenær sem er.',
        icon: <Users className="w-8 h-8 text-primary" />,
        color: 'bg-primary-container/15'
    },
    {
        title: 'Viðburðir & Rölt',
        description: 'Skráðu þig í foreldrarölt eða sjáðu hvað er framundan í skólastarfinu.',
        icon: <Calendar className="w-8 h-8 text-on-tertiary-fixed" />,
        color: 'bg-tertiary-fixed/40'
    },
    {
        title: 'Auglýsingatafla',
        description: 'Mikilvægar tilkynningar frá bekkjarfulltrúum birtast hér. Fylgstu með nýjustu fréttum.',
        icon: <Megaphone className="w-8 h-8 text-primary" />,
        color: 'bg-primary-container/15'
    }
];

export default function WelcomeWizard({ isOpen, onClose }: WelcomeWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="h-1 bg-surface-container-high w-full">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 text-center space-y-6">
                        {/* Icon / Decor */}
                        <div className="flex justify-center">
                            {STEPS[currentStep].icon === '👋' ? (
                                <div className="text-6xl animate-wave">👋</div>
                            ) : (
                                <div className={`p-6 rounded-full ${STEPS[currentStep].color} transition-colors duration-300`}>
                                    {STEPS[currentStep].icon}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <motion.h2
                                key={`title-${currentStep}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-bold text-on-surface"
                            >
                                {STEPS[currentStep].title}
                            </motion.h2>
                            <motion.p
                                key={`desc-${currentStep}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-on-surface-variant leading-relaxed"
                            >
                                {STEPS[currentStep].description}
                            </motion.p>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-xl transition-colors"
                            >
                                Loka
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-2 py-3 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                {isLastStep ? (
                                    <>
                                        <span>Byrja að nota</span>
                                        <Check size={18} />
                                    </>
                                ) : (
                                    <>
                                        <span>Næsta</span>
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
