import { X, User } from 'lucide-react';
import { Student } from '@/types';

interface SelectChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    onSelect: (studentId: string, studentName: string) => void;
    title?: string;
}

export function SelectChildModal({ isOpen, onClose, students, onSelect, title }: SelectChildModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-on-surface tracking-tight">
                        {title || 'Hver skráist?'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface-variant">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-on-surface-variant text-sm">
                    Veldu barnið sem þú ert að skrá þig fyrir svo við getum haldið utan um skiptingu á milli barna.
                </p>

                <div className="space-y-3">
                    {students.map(child => (
                        <button
                            key={child.id}
                            onClick={() => onSelect(child.id, child.name)}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-outline-variant/30 hover:border-primary hover:bg-primary-container/15 transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant group-hover:bg-surface-container-lowest group-hover:text-primary transition-colors">
                                <User size={20} />
                            </div>
                            <span className="font-bold text-on-surface group-hover:text-primary">{child.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
