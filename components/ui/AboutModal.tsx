'use client';

import { X, UserPlus, Cake, ShieldCheck, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-nordic-blue p-6 text-white relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <HelpCircle className="text-white" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold">Hjálp & Leiðbeiningar</h2>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* Topic 1: Spouses */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <div className="flex gap-3 mb-2">
                            <div className="bg-green-100 p-2 rounded-lg text-green-700 h-fit">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Hvernig býð ég maka?</h3>
                                <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                                    Farðu í <strong>Stillingar</strong> (prófílmyndin þín). Þar finnurðu barnið þitt og hnappinn <span className="text-green-700 font-medium">„Afrita boðshlekk“</span>. Sendu hlekkinn á makann til að tengja hann við sama barn.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Topic 2: Birthdays */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <div className="flex gap-3 mb-2">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-700 h-fit">
                                <Cake size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Hvernig skrái ég afmæli?</h3>
                                <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                                    Afmælisdagurinn er skráður <strong>þegar barni er bætt við</strong> (við nýskráningu eða í stillingum). Þetta birtist í bekkjarlistanum svo enginn gleymist á afmælisdaginn!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Topic 3: Data Privacy */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <div className="flex gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700 h-fit">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Hvaða upplýsingar sjást?</h3>
                                <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                                    Aðrir foreldrar sjá <strong>nöfn, símanúmer (ef þú leyfir) og afmælisdaga</strong>. Kennarar/stjórnendur sjá einnig upplýsingar um ofnæmi til öryggis. Engin gögn eru seld þriðja aðila.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-nordic-blue hover:bg-nordic-blue-dark text-white font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Ég skil, loka glugga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
