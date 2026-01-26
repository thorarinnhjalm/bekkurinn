import { X, User } from 'lucide-react';
import { Student } from '@/types';

interface SelectChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: Student[];
    onSelect: (studentId: string, studentName: string) => void;
    title?: string;
}

export function SelectChildModal({ isOpen, onClose, children, onSelect, title }: SelectChildModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {title || 'Hver skráist?'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-500 text-sm">
                    Veldu barnið sem þú ert að skrá þig fyrir svo við getum haldið utan um skiptingu á milli barna.
                </p>

                <div className="space-y-3">
                    {children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => onSelect(child.id, child.name)}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-nordic-blue hover:bg-blue-50 transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-nordic-blue transition-colors">
                                <User size={20} />
                            </div>
                            <span className="font-bold text-gray-900 group-hover:text-nordic-blue">{child.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
