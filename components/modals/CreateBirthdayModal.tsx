'use client';

import { useState, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, Users, Check, ChevronDown, ChevronUp } from 'lucide-react';
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

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('14:00');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    // Selection State
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [selectionMode, setSelectionMode] = useState<'all' | 'boys' | 'girls' | 'custom'>('all');
    const [isCustomExpanded, setIsCustomExpanded] = useState(false);

    if (!isOpen) return null;

    const handleSelectMode = (mode: 'all' | 'boys' | 'girls' | 'custom') => {
        setSelectionMode(mode);
        if (!students) return;

        const newSet = new Set<string>();

        if (mode === 'all') {
            students.forEach(s => newSet.add(s.id));
        } else if (mode === 'boys') {
            students.filter(s => s.gender === 'boy').forEach(s => newSet.add(s.id));
        } else if (mode === 'girls') {
            students.filter(s => s.gender === 'girl').forEach(s => newSet.add(s.id));
        } else {
            // Keep existing selection or start empty? Let's keep existing if switching TO custom
            // If switching FROM shortcut, maybe populate with that shortcut's selection
            if (selectedStudentIds.size === 0) {
                // specific UX choice: start with nothing?
            }
        }

        // If switching to Custom, don't overwrite if we already have a specialized set?
        // Actually, let's just apply the logic:
        if (mode !== 'custom') {
            setSelectedStudentIds(newSet);
        } else {
            // Expand custom view
            setIsCustomExpanded(true);
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
        setSelectionMode('custom'); // Switch to custom mode implicity
    };

    const handleSubmit = async () => {
        if (!title || !date || !location) return;
        if (selectedStudentIds.size === 0) {
            alert("Vinsamlegast veldu hverjum á að bjóða.");
            return;
        }

        try {
            const finalDate = new Date(`${date}T${time}:00`);

            await createTaskMutation.mutateAsync({
                classId,
                schoolId: schoolId || undefined,
                scope: 'class',
                type: 'birthday',
                title: `Afmæli: ${title}`,
                description: `${description}\n\nStaðsetning: ${location}`,
                date: Timestamp.fromDate(finalDate),
                slotsTotal: 0, // Not a volunteer task
                isAllDay: false,
                createdBy: user?.uid || '',
                originalLanguage: 'is', // Assuming UI is Icelandic
                invitees: Array.from(selectedStudentIds),
                isPrivate: true,
            });

            onClose();
        } catch (e) {
            console.error(e);
            alert("Villa kom upp við að stofna viðburð.");
        }
    };

    const studentCount = students?.length || 0;
    const selectedCount = selectedStudentIds.size;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Nýtt afmælisboð</h2>
                        <p className="text-sm text-gray-500">Búðu til viðburð og bjóddu bekknum</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Step 1: Details */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">1. Upplýsingar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-sm">Heiti (Hver á afmæli?)</label>
                                <input
                                    value={title} onChange={e => setTitle(e.target.value)}
                                    placeholder="t.d. Afmæli Jóns"
                                    className="input-base"
                                />
                            </div>
                            <div>
                                <label className="label-sm">Staðsetning</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        value={location} onChange={e => setLocation(e.target.value)}
                                        placeholder="t.d. Heima eða í Keiluhöllinni"
                                        className="input-base pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label-sm">Dagsetning</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={date} onChange={e => setDate(e.target.value)}
                                        className="input-base pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label-sm">Tímasetning</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="time"
                                        value={time} onChange={e => setTime(e.target.value)}
                                        className="input-base pl-10"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-sm">Nánari upplýsingar</label>
                                <textarea
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Eitthvað sem gestir þurfa að vita? Upplýsingar um veitingar, ofnæmi, osfrv."
                                    className="input-base h-24"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Guests */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">2. Gestalistinn</h3>
                            <span className="text-sm font-bold text-nordic-blue">{selectedCount} valdir</span>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleSelectMode('all')}
                                className={`filter-chip ${selectionMode === 'all' ? 'active' : ''}`}
                            >
                                <Users size={16} /> Allur bekkurinn
                            </button>
                            <button
                                onClick={() => handleSelectMode('boys')}
                                className={`filter-chip ${selectionMode === 'boys' ? 'active' : ''}`}
                            >
                                👦 Bara strákar
                            </button>
                            <button
                                onClick={() => handleSelectMode('girls')}
                                className={`filter-chip ${selectionMode === 'girls' ? 'active' : ''}`}
                            >
                                👧 Bara stelpur
                            </button>
                        </div>

                        {/* Custom Selection Area */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setIsCustomExpanded(!isCustomExpanded)}
                                className="w-full bg-gray-50 p-3 flex justify-between items-center text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <span>Velja einstaklinga handvirkt ({students?.length || 0})</span>
                                {isCustomExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {isCustomExpanded && (
                                <div className="p-4 max-h-60 overflow-y-auto bg-white">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {students?.map(student => (
                                            <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedStudentIds.has(student.id) ? 'bg-nordic-blue border-nordic-blue' : 'border-gray-300 bg-white'}`}>
                                                    {selectedStudentIds.has(student.id) && <Check size={12} className="text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedStudentIds.has(student.id)}
                                                    onChange={() => toggleStudent(student.id)}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{student.name}</span>
                                                {student.gender === 'boy' && <span className="text-xs text-gray-400 ml-auto">Strákur</span>}
                                                {student.gender === 'girl' && <span className="text-xs text-gray-400 ml-auto">Stelpa</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 italic">
                            * Aðeins foreldrar valinna barna munu sjá þennan viðburð.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">
                        Hætta við
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title || !date || selectedCount === 0}
                        className="flex-1 py-3 bg-nordic-blue text-white font-bold rounded-xl shadow-lg hover:bg-nordic-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Senda boðskort
                    </button>
                </div>
            </div>

            <style jsx>{`
                .label-sm {
                    @apply block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1;
                }
                .input-base {
                    @apply w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-nordic-blue focus:bg-white transition-all outline-none font-medium text-gray-900;
                }
                .filter-chip {
                    @apply px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2;
                }
                .filter-chip.active {
                    @apply bg-blue-50 border-blue-200 text-nordic-blue font-bold shadow-sm;
                }
            `}</style>
        </div>
    );
}
