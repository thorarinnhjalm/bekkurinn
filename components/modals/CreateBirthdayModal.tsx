'use client';

import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Check, ChevronDown, ChevronUp, ChevronRight, User } from 'lucide-react';
import { useCreateTask, useStudents } from '@/hooks/useFirestore';
import { useAuth } from '@/components/providers/AuthProvider';
import { Timestamp } from 'firebase/firestore';

interface CreateBirthdayModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    schoolId?: string;
}

export function CreateBirthdayModal({ isOpen, onClose, classId, schoolId }: CreateBirthdayModalProps) {
    const { user } = useAuth();
    const createTaskMutation = useCreateTask();
    const { data: students } = useStudents(classId);

    const [step, setStep] = useState<1 | 2>(1);

    // Details State
    const [birthdayHostIds, setBirthdayHostIds] = useState<Set<string>>(new Set());
    const [title, setTitle] = useState('');
    const [isHostSelectOpen, setIsHostSelectOpen] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('14:00');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    // Selection State
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState<'all' | 'boys' | 'girls' | 'custom'>('all');

    if (!isOpen) return null;

    const handleSelectMode = (mode: 'all' | 'boys' | 'girls') => {
        setSelectionMode(mode);
        if (!students) return;

        const newSet = new Set<string>();
        if (mode === 'all') {
            students.forEach(s => newSet.add(s.id));
        } else if (mode === 'boys') {
            students.filter(s => s.gender === 'boy').forEach(s => newSet.add(s.id));
        } else if (mode === 'girls') {
            students.filter(s => s.gender === 'girl').forEach(s => newSet.add(s.id));
        }
        setSelectedStudentIds(newSet);
        setSelectedStudentIds(newSet);
    };

    const toggleHost = (studentId: string) => {
        const newSet = new Set(birthdayHostIds);
        if (newSet.has(studentId)) {
            newSet.delete(studentId);
        } else {
            newSet.add(studentId);
        }
        setBirthdayHostIds(newSet);

        // Auto-generate title
        if (newSet.size === 0) {
            setTitle('');
        } else {
            const names = Array.from(newSet).map(id => students?.find(s => s.id === id)?.name.split(' ')[0]);
            if (names.length === 1) setTitle(`${names[0]}`);
            else if (names.length === 2) setTitle(`${names[0]} og ${names[1]}`);
            else {
                const last = names.pop();
                setTitle(`${names.join(', ')} og ${last}`);
            }
        }
    };

    const toggleStudent = (studentId: string) => {
        const newSet = new Set(selectedStudentIds);
        if (newSet.has(studentId)) {
            newSet.delete(studentId);
        } else {
            newSet.add(studentId);
        }
        setSelectedStudentIds(newSet);
        setSelectionMode('custom');
    };

    const handleSubmit = async () => {
        try {
            const finalDate = new Date(`${date}T${time}:00`);

            // Ensure hosts are invited
            const allInvitees = new Set([...Array.from(selectedStudentIds), ...Array.from(birthdayHostIds)]);

            await createTaskMutation.mutateAsync({
                classId,
                ...(schoolId ? { schoolId } : {}),
                scope: 'class',
                type: 'birthday',
                title: `Afmæli: ${title}`,
                description: `${description}\n\nStaðsetning: ${location}`,
                date: Timestamp.fromDate(finalDate),
                slotsTotal: 0,
                isAllDay: false,
                createdBy: user?.uid || '',
                originalLanguage: 'is',
                invitees: Array.from(allInvitees),
                isPrivate: true,
            });

            onClose();
            // Reset for next time
            setStep(1);
            setBirthdayHostIds(new Set());
            setTitle('');
            setDate('');
            setLocation('');
            setDescription('');
        } catch (e) {
            console.error(e);
            alert("Error creating event.");
        }
    };

    const studentCount = students?.length || 0;
    const selectedCount = selectedStudentIds.size;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-purple-400" />
                    <div>
                        <h2 className="text-2xl font-black text-on-surface tracking-tight">
                            {step === 1 ? 'Nýtt afmælisboð' : 'Hverjum á að bjóða?'}
                        </h2>
                        <p className="text-sm text-on-surface-variant font-medium">
                            {step === 1 ? 'Settu upp smáatriðin' : 'Veldu gestalistann'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                        <X size={24} className="text-on-surface-variant" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                            <div className="relative">
                                <label className="label-modern">Hver á afmæli?</label>
                                <div
                                    onClick={() => setIsHostSelectOpen(!isHostSelectOpen)}
                                    className="input-modern flex flex-wrap gap-2 items-center cursor-pointer min-h-[50px]"
                                >
                                    {birthdayHostIds.size === 0 && <span className="text-on-surface-variant">Veldu afmælisbarn...</span>}
                                    {Array.from(birthdayHostIds).map(id => {
                                        const s = students?.find(st => st.id === id);
                                        return (
                                            <span key={id} className="bg-primary-container/20 text-primary px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                                {s?.name.split(' ')[0]}
                                                <X size={12} className="hover:text-primary" onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleHost(id);
                                                }} />
                                            </span>
                                        );
                                    })}
                                    <ChevronDown size={16} className="ml-auto text-on-surface-variant" />
                                </div>

                                {isHostSelectOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 z-10 max-h-60 overflow-y-auto p-2">
                                        {students?.map(student => (
                                            <div
                                                key={student.id}
                                                onClick={() => {
                                                    toggleHost(student.id);
                                                    setIsHostSelectOpen(false);
                                                }}
                                                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-surface cursor-pointer ${birthdayHostIds.has(student.id) ? 'bg-primary-container/15' : ''}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${birthdayHostIds.has(student.id) ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                                    {student.name[0]}
                                                </div>
                                                <span className="text-sm font-medium text-on-surface">{student.name}</span>
                                                {birthdayHostIds.has(student.id) && <Check size={14} className="ml-auto text-primary" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-modern">Dagur</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={date} onChange={e => setDate(e.target.value)}
                                            className="input-modern"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-modern">Klukkan</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={time} onChange={e => setTime(e.target.value)}
                                            className="input-modern"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label-modern">Staðsetning</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3.5 text-on-surface-variant" />
                                    <input
                                        value={location} onChange={e => setLocation(e.target.value)}
                                        placeholder="Heimilisfang eða staður"
                                        className="input-modern pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label-modern">Nánari lýsing</label>
                                <textarea
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Nánari upplýsingar fyrir gesti..."
                                    className="input-modern h-24 resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {/* Quick Select Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleSelectMode('all')}
                                    className={`quick-select-card ${selectionMode === 'all' ? 'active ring-2 ring-nordic-blue bg-primary-container/15' : ''}`}
                                >
                                    <span className="text-2xl mb-1">🎉</span>
                                    <span className="text-xs font-bold">Allir</span>
                                </button>
                                <button
                                    onClick={() => handleSelectMode('boys')}
                                    className={`quick-select-card ${selectionMode === 'boys' ? 'active ring-2 ring-primary/50 bg-primary-container/15' : ''}`}
                                >
                                    <span className="text-2xl mb-1">👦</span>
                                    <span className="text-xs font-bold">Strákar</span>
                                </button>
                                <button
                                    onClick={() => handleSelectMode('girls')}
                                    className={`quick-select-card ${selectionMode === 'girls' ? 'active ring-2 ring-secondary/50 bg-secondary-container/30' : ''}`}
                                >
                                    <span className="text-2xl mb-1">👧</span>
                                    <span className="text-xs font-bold">Stelpur</span>
                                </button>
                            </div>

                            <div className="border-t border-outline-variant/30 my-4" />

                            {/* Detailed List */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gestalistinn</h3>
                                    <span className="text-xs font-bold bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-full">
                                        {selectedCount} valdir
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                    {students?.map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleStudent(student.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedStudentIds.has(student.id)
                                                ? 'bg-primary-container/15/50 border-primary/30 shadow-sm'
                                                : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/30'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedStudentIds.has(student.id) ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                                                }`}>
                                                {selectedStudentIds.has(student.id) ? <Check size={14} /> : student.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold ${selectedStudentIds.has(student.id) ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                                    {student.name}
                                                </p>
                                            </div>
                                            {student.gender === 'boy' && <span className="text-lg">👦</span>}
                                            {student.gender === 'girl' && <span className="text-lg">👧</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/30 bg-surface/50 flex gap-4">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface transition-colors"
                        >
                            Til baka
                        </button>
                    )}

                    {step === 1 ? (
                        <button
                            onClick={() => {
                                if (title && date && location) setStep(2);
                                else alert('Please fill in all fields');
                            }}
                            className="flex-1 bg-on-surface text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            Áfram <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedCount === 0}
                            className="flex-1 bg-gradient-to-r from-nordic-blue to-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            Senda boðskort ({selectedCount})
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .label-modern {
                    @apply block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1;
                }
                .input-modern {
                    @apply w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/20/50 transition-all outline-none font-medium text-on-surface placeholder:text-on-surface-variant;
                }
                .quick-select-card {
                    @apply flex flex-col items-center justify-center p-4 rounded-xl bg-surface border border-outline-variant/30 hover:bg-surface-container-lowest hover:shadow-md transition-all text-on-surface-variant;
                }
            `}</style>
        </div>
    );
}
