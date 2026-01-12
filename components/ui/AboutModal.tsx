'use client';

import { X, Heart, Shield, Smartphone, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-nordic-blue p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-2xl font-bold mb-2">Hvað er Bekkurinn?</h2>
                    <p className="text-blue-100/90 text-sm">
                        Einfalt kerfi sem sparar þér tíma og heldur utan um bekkinn.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Allt í símanum</h3>
                                <p className="text-sm text-gray-500">
                                    Foreldralistar, viðburðir og tilkynningar. Allt aðgengilegt í vasanum, hvar sem er.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Öruggt og lokað</h3>
                                <p className="text-sm text-gray-500">
                                    Enginn kemst inn nema með boðskóða. Gögnin eru ykkar og við seljum þau ekki.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                                <Heart size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Búið til af foreldrum</h3>
                                <p className="text-sm text-gray-500">
                                    Við smíðuðum þetta kerfi af því að við vorum þreytt á Facebook hópum.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => {
                                // Close modal and navigate
                                onClose();
                                router.push('/is/why-us');
                            }}
                            className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 group"
                        >
                            <span className="text-sm">Lesa meira</span>
                            <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-nordic-blue hover:bg-nordic-blue-dark text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Skiljið!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
