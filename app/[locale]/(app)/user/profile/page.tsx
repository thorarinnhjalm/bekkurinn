'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useParams } from 'next/navigation';
import { updateDoc, doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
    Loader2, User, UserPlus, Check, Calendar, Phone, MapPin,
    Eye, EyeOff, ChevronDown, Pencil, X, Camera,
    Utensils, Heart, Copy, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

const DIETARY_OPTIONS: { value: string; label: string; emoji: string }[] = [
    { value: 'peanut', label: 'Jarðhnetur', emoji: '🥜' },
    { value: 'gluten', label: 'Glúten', emoji: '🌾' },
    { value: 'dairy', label: 'Mjólk / Laktósa', emoji: '🥛' },
    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
    { value: 'pork', label: 'Svínakjöt', emoji: '🐷' },
];

const ICELANDIC_MONTHS = [
    'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní',
    'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'
];

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
            {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{message}</span>
        </div>
    );
}

export default function UserProfilePage() {
    const { user } = useAuth();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State for user profile details
    const [userPhone, setUserPhone] = useState('');
    const [userIsPhoneVisible, setUserIsPhoneVisible] = useState(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    const [links, setLinks] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [classId, setClassId] = useState<string>('');
    const [expandedChild, setExpandedChild] = useState<string | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Fetch user links and students
    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            const q = query(collection(db, 'parentLinks'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const linksData = snapshot.docs.map(d => d.data());
            setLinks(linksData);

            const studentIds = linksData.map(l => l.studentId);
            if (studentIds.length > 0) {
                const qStudents = query(collection(db, 'students'), where('__name__', 'in', studentIds));
                const snapStudents = await getDocs(qStudents);
                const studentsData = snapStudents.docs.map(d => ({ id: d.id, ...d.data() }));
                setStudents(studentsData);
                if (studentsData.length === 1) {
                    setExpandedChild(studentsData[0].id);
                }
                if (linksData.length > 0) {
                    setClassId(linksData[0].classId);
                }
            }
            setLoadingLinks(false);
        }
        fetchData();
    }, [user]);

    // Fetch User Profile Data
    useEffect(() => {
        if (!user) return;
        getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid))).then(sn => {
            if (!sn.empty) {
                const d = sn.docs[0].data();
                if (d.phone) setUserPhone(d.phone);
                if (d.isPhoneVisible !== undefined) setUserIsPhoneVisible(d.isPhoneVisible);
                if (d.photoURL) setUserPhotoUrl(d.photoURL);
                else if (user.photoURL) setUserPhotoUrl(user.photoURL);
                if (d.address) setUserAddress(d.address);
            } else if (user.photoURL) {
                setUserPhotoUrl(user.photoURL);
            }
        });
    }, [user]);

    const handleSaveUser = async (field?: string) => {
        if (!user) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: userPhotoUrl,
                phone: userPhone,
                isPhoneVisible: userIsPhoneVisible,
                address: userAddress
            }, { merge: true });
            showToast(field ? `${field} vistað!` : 'Upplýsingar vistaðar!', 'success');
            setIsEditingPhone(false);
            setIsEditingAddress(false);
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentPhoto = async (studentId: string, url: string) => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'students', studentId), { photoUrl: url });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, photoUrl: url } : s));
            showToast('Mynd uppfærð!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun myndar', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentName = async (studentId: string, newName: string) => {
        if (!newName.trim()) {
            showToast('Nafn má ekki vera tómt', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'students', studentId), { name: newName });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
            showToast('Nafn uppfært!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun nafns', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentDietaryNeeds = async (studentId: string, needs: string[]) => {
        try {
            await updateDoc(doc(db, 'students', studentId), { dietaryNeeds: needs });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, dietaryNeeds: needs } : s));
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        }
    };

    const handleSaveStudentGender = async (studentId: string, gender: string) => {
        try {
            await updateDoc(doc(db, 'students', studentId), { gender });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, gender } : s));
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        }
    };

    const handleSaveStudentBirthDate = async (studentId: string, dateString: string) => {
        if (!dateString) return;
        setIsSaving(true);
        try {
            const birthDate = Timestamp.fromDate(new Date(dateString));
            await updateDoc(doc(db, 'students', studentId), { birthDate });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, birthDate } : s));
            showToast('Afmælisdagur vistaður!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyInviteLink = (studentId: string) => {
        const inviteLink = `${window.location.origin}/${locale}/onboarding?join=${studentId}&classId=${classId}&inviterId=${user?.uid}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            showToast('Hlekkur afritaður!', 'success');
        }).catch(() => {
            showToast('Villa við að afrita', 'error');
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Vinsamlegast skráðu þig inn.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Hero Header */}
            <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E5A7F] pt-20 pb-24 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-5">
                        {/* Profile Photo */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-xl">
                                {userPhotoUrl ? (
                                    <img src={userPhotoUrl} alt={user.displayName || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-white/60" />
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">{user.displayName || 'Notandi'}</h1>
                            <p className="text-blue-200 text-sm mt-1">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80">
                                    {students.length} {students.length === 1 ? 'barn' : 'börn'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content - Pulled up over hero */}
            <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-4">

                {/* Contact Info Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-[#1E3A5F]" />
                            Tengiliðaupplýsingar
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {/* Phone */}
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Phone size={18} className="text-blue-600" />
                                </div>
                                {isEditingPhone ? (
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="tel"
                                            value={userPhone}
                                            onChange={(e) => setUserPhone(e.target.value)}
                                            placeholder="Símanúmer"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveUser('Símanúmer')}
                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setIsEditingPhone(false)}
                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500">Símanúmer</p>
                                        <p className="font-medium text-gray-900 truncate">
                                            {userPhone || <span className="text-gray-400">Ekki skráð</span>}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!isEditingPhone && (
                                <button
                                    onClick={() => setIsEditingPhone(true)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}
                        </div>

                        {/* Phone Visibility Toggle */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    {userIsPhoneVisible ? <Eye size={18} className="text-purple-600" /> : <EyeOff size={18} className="text-purple-600" />}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Birta símanúmer</p>
                                    <p className="text-sm text-gray-500">Sjáanlegt í bekkjarlista</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setUserIsPhoneVisible(!userIsPhoneVisible);
                                    setTimeout(() => handleSaveUser(), 100);
                                }}
                                className={`relative w-12 h-7 rounded-full transition-colors ${userIsPhoneVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${userIsPhoneVisible ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Address */}
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin size={18} className="text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-gray-500">Heimilisfang</p>
                                        {!isEditingAddress && (
                                            <button
                                                onClick={() => setIsEditingAddress(true)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {isEditingAddress ? (
                                        <div className="space-y-2">
                                            <AddressAutocomplete
                                                defaultValue={userAddress}
                                                onSelect={(addr) => {
                                                    setUserAddress(addr.fullAddress);
                                                }}
                                                placeholder="Sláðu inn heimilisfang..."
                                                className="w-full"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveUser('Heimilisfang')}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium flex items-center justify-center gap-1"
                                                >
                                                    <Check size={14} />
                                                    Vista
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingAddress(false)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm"
                                                >
                                                    Hætta við
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {userAddress || <span className="text-gray-400">Ekki skráð</span>}
                                            </p>
                                            {userAddress && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userAddress)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                                >
                                                    Opna í kortum →
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Children Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold text-gray-900">Börnin mín</h2>
                        <a
                            href={`/${locale}/onboarding?step=join`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <UserPlus size={16} />
                            Bæta við
                        </a>
                    </div>

                    {loadingLinks ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
                            <Loader2 className="animate-spin mx-auto text-[#1E3A5F]" size={32} />
                        </div>
                    ) : students.length > 0 ? (
                        <div className="space-y-3">
                            {students.map(student => (
                                <StudentCard
                                    key={student.id}
                                    student={student}
                                    inviteLink={`${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/onboarding?join=${student.id}&classId=${classId}&inviterId=${user?.uid || ''}`}
                                    isExpanded={expandedChild === student.id}
                                    onToggleExpand={() => setExpandedChild(expandedChild === student.id ? null : student.id)}
                                    onSavePhoto={(url) => handleSaveStudentPhoto(student.id, url)}
                                    onSaveName={(name) => handleSaveStudentName(student.id, name)}
                                    onSaveDietaryNeeds={(needs) => handleSaveStudentDietaryNeeds(student.id, needs)}
                                    onSaveGender={(gender) => handleSaveStudentGender(student.id, gender)}
                                    onSaveBirthDate={(date) => handleSaveStudentBirthDate(student.id, date)}
                                    onCopyInvite={() => handleCopyInviteLink(student.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart size={28} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">Engin börn tengd við aðganginn þinn</p>
                            <a
                                href={`/${locale}/onboarding?step=join`}
                                className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2E4A6F] transition"
                            >
                                <UserPlus size={18} />
                                Bæta við barni
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StudentCard({
    student,
    inviteLink,
    isExpanded,
    onToggleExpand,
    onSavePhoto,
    onSaveName,
    onSaveDietaryNeeds,
    onSaveGender,
    onSaveBirthDate,
    onCopyInvite
}: {
    student: any;
    inviteLink: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onSavePhoto: (url: string) => void;
    onSaveName: (name: string) => void;
    onSaveDietaryNeeds: (needs: string[]) => void;
    onSaveGender: (gender: string) => void;
    onSaveBirthDate: (date: string) => void;
    onCopyInvite: () => void;
}) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(student.name);
    const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);
    const [dietaryNeeds, setDietaryNeeds] = useState<string[]>(student.dietaryNeeds || []);
    const [copiedInvite, setCopiedInvite] = useState(false);

    const formatDateForInput = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toISOString().split('T')[0];
    };

    const [editedBirthDate, setEditedBirthDate] = useState(formatDateForInput(student.birthDate));

    const formatBirthDateDisplay = (timestamp: any) => {
        if (!timestamp?.toDate) return null;
        const date = timestamp.toDate();
        return `${date.getDate()}. ${ICELANDIC_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    };

    const toggleDietaryNeed = (value: string) => {
        const newNeeds = dietaryNeeds.includes(value)
            ? dietaryNeeds.filter(n => n !== value)
            : [...dietaryNeeds, value];
        setDietaryNeeds(newNeeds);
        onSaveDietaryNeeds(newNeeds);
    };

    const handleCopyInvite = () => {
        onCopyInvite();
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
    };

    const birthDateDisplay = formatBirthDateDisplay(student.birthDate);
    const initials = student.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={onToggleExpand}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-left"
            >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden border border-blue-200 flex-shrink-0">
                    {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-bold text-blue-600">{initials}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{student.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {birthDateDisplay && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {birthDateDisplay}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-gray-500" />
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">

                    {/* Name Edit */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Nafn</label>
                        {isEditingName ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        onSaveName(editedName);
                                        setIsEditingName(false);
                                    }}
                                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditedName(student.name);
                                        setIsEditingName(false);
                                    }}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="w-full px-3 py-2 bg-gray-50 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition group"
                            >
                                <span className="font-medium text-gray-900">{student.name}</span>
                                <Pencil size={14} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Calendar size={12} />
                            Afmælisdagur
                        </label>
                        {isEditingBirthDate ? (
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={editedBirthDate}
                                    onChange={(e) => setEditedBirthDate(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        onSaveBirthDate(editedBirthDate);
                                        setIsEditingBirthDate(false);
                                    }}
                                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditedBirthDate(formatDateForInput(student.birthDate));
                                        setIsEditingBirthDate(false);
                                    }}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingBirthDate(true)}
                                className="w-full px-3 py-2 bg-gray-50 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition group"
                            >
                                <span className={birthDateDisplay ? 'font-medium text-gray-900' : 'text-gray-400'}>
                                    {birthDateDisplay || 'Ekki skráður'}
                                </span>
                                <Pencil size={14} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Kyn</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'boy', label: 'Strákur' },
                                { value: 'girl', label: 'Stelpa' },
                                { value: 'other', label: 'Annað' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onSaveGender(option.value)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${student.gender === option.value
                                        ? 'bg-[#1E3A5F] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dietary Needs */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Utensils size={12} />
                            Ofnæmi og mataræði
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DIETARY_OPTIONS.map((option) => {
                                const isSelected = dietaryNeeds.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => toggleDietaryNeed(option.value)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${isSelected
                                            ? 'bg-red-100 text-red-700 ring-2 ring-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span>{option.emoji}</span>
                                        {option.label}
                                        {isSelected && <Check size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Upplýsingar birtast foreldrum í bekknum til að tryggja öryggi.
                        </p>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Camera size={12} />
                            Mynd
                        </label>
                        <ImageUploader
                            currentImageUrl={student.photoUrl || ''}
                            onUploadComplete={(url) => onSavePhoto(url)}
                            storagePath={`students/${student.id}/profile`}
                            label=""
                        />
                    </div>

                    {/* Invite Partner */}
                    <div className="pt-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                            Bjóða maka / hinu foreldrinu
                        </label>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={inviteLink}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm focus:outline-none"
                            />
                            <button
                                onClick={handleCopyInvite}
                                className={`px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${copiedInvite
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}
                            >
                                {copiedInvite ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
