'use client';

import { X, Calendar, Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    // No router needed as we stay in-app
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

                    <h2 className="text-2xl font-bold mb-2">Hvernig virkar Bekkurinn?</h2>
                    <p className="text-blue-100/90 text-sm">
                        Stutt leiðarvísir til að koma þér af stað.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                                <Search size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Skráin</h3>
                                <p className="text-sm text-gray-500">
                                    Finndu upplýsingar um foreldra og börn. Smelltu á nöfnin til að sjá nánar.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Verkefni & Viðburðir</h3>
                                <p className="text-sm text-gray-500">
                                    Skráðu þig í verkefni þegar bekkjarfulltrúar óska eftir aðstoð. Það tekur bara einn smell!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Tilkynningar</h3>
                                <p className="text-sm text-gray-500">
                                    Mikilvæg skilaboð birtast hér. Þú getur stjórnað hvernig þú færð tilkynningar í stillingum.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-nordic-blue hover:bg-nordic-blue-dark text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Ég skil, loka glugga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
