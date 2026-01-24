'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { updateDoc, doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
    Loader2, User, UserPlus, Check, Calendar, Phone, MapPin, Globe,
    ChevronDown, Heart, Copy, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { locales } from '@/i18n-config';
import Link from 'next/link';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

const DIETARY_OPTIONS = [
    { value: 'dairy', label: 'Mjólk / Laktósi' },
    { value: 'gluten', label: 'Glúten' },
    { value: 'egg', label: 'Egg' },
    { value: 'peanut', label: 'Jarðhnetur' },
    { value: 'treenuts', label: 'Hnetur' },
    { value: 'fish', label: 'Fiskur' },
    { value: 'shellfish', label: 'Skelfiski' },
    { value: 'soy', label: 'Soja' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pork', label: 'Svínakjöt' },
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
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
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
    const t = useTranslations('user');
    const tCommon = useTranslations('common');
    const tDietary = useTranslations('dietary');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State for user profile details
    const [userPhone, setUserPhone] = useState('');
    const [userIsPhoneVisible, setUserIsPhoneVisible] = useState(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState('');
    const [userAddress, setUserAddress] = useState('');

    const [students, setStudents] = useState<any[]>([]);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [classId, setClassId] = useState<string>('');
    const [expandedChild, setExpandedChild] = useState<string | null>(null);
    const [otherParents, setOtherParents] = useState<Map<string, any[]>>(new Map());

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

    // Fetch other parents for each student (using classId like directory page does)
    useEffect(() => {
        async function fetchOtherParents() {
            if (!user || students.length === 0 || !classId) return;

            const parentsMap = new Map<string, any[]>();

            // Fetch ALL parent links for the class (same approach as directory page)
            const linksQuery = query(
                collection(db, 'parentLinks'),
                where('classId', '==', classId)
            );
            const linksSnap = await getDocs(linksQuery);
            const allClassLinks = linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

            // Get student IDs we care about
            const myStudentIds = new Set(students.map(s => s.id));

            // Filter links: for our students, not current user, not rejected
            const relevantLinks = allClassLinks.filter((link: any) => {
                if (link.userId === user.uid) return false;
                if (!myStudentIds.has(link.studentId)) return false;
                const status = (link.status || '').toLowerCase();
                return status !== 'rejected' && status !== 'denied';
            });

            // Get unique user IDs
            const otherUserIds = [...new Set(relevantLinks.map((link: any) => link.userId))];

            if (otherUserIds.length > 0) {
                // Fetch user data for other parents
                const usersQuery = query(
                    collection(db, 'users'),
                    where('__name__', 'in', otherUserIds)
                );
                const usersSnap = await getDocs(usersQuery);
                const usersData = new Map<string, any>();
                usersSnap.docs.forEach(d => {
                    usersData.set(d.id, { id: d.id, ...d.data() });
                });

                // Build map: studentId -> array of parent user objects
                relevantLinks.forEach((link: any) => {
                    const parentUser = usersData.get(link.userId);
                    if (parentUser) {
                        const existing = parentsMap.get(link.studentId) || [];
                        existing.push(parentUser);
                        parentsMap.set(link.studentId, existing);
                    }
                });
            }

            setOtherParents(parentsMap);
        }
        fetchOtherParents();
    }, [user, students, classId]);

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

    const handleSaveUser = async () => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: userPhotoUrl,
                phone: userPhone,
                isPhoneVisible: userIsPhoneVisible,
                address: userAddress
            }, { merge: true });
            showToast('Vistað', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        }
    };

    const handleSaveStudentPhoto = async (studentId: string, url: string) => {
        try {
            await updateDoc(doc(db, 'students', studentId), { photoUrl: url });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, photoUrl: url } : s));
            showToast('Mynd uppfærð', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        }
    };

    const handleSaveStudentName = async (studentId: string, newName: string) => {
        if (!newName.trim()) return;
        try {
            await updateDoc(doc(db, 'students', studentId), { name: newName });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
            showToast('Nafn uppfært', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
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
        try {
            const birthDate = Timestamp.fromDate(new Date(dateString));
            await updateDoc(doc(db, 'students', studentId), { birthDate });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, birthDate } : s));
            showToast('Afmælisdagur vistaður', 'success');
        } catch (e) {
            console.error(e);
            showToast('Villa við vistun', 'error');
        }
    };

    const handleCopyInviteLink = (studentId: string) => {
        const inviteLink = `${window.location.origin}/${locale}/onboarding?join=${studentId}&classId=${classId}&inviterId=${user?.uid}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            showToast('Hlekkur afritaður', 'success');
        }).catch(() => {
            showToast('Villa við að afrita', 'error');
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <p className="text-gray-500">Vinsamlegast skráðu þig inn.</p>
            </div>
        );
    }

    if (loadingLinks) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin text-[#1E3A5F]" />
                    <p className="text-gray-500">Hleður gögnum...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 pt-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <header className="relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{t('title')}</h1>
                <p className="text-lg text-gray-500">
                    {t('subtitle')}
                </p>
            </header>

            {/* My Profile Card */}
            <section className="glass-card p-6">
                <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-semibold shadow-sm bg-blue-50 text-blue-700 overflow-hidden flex-shrink-0">
                        {userPhotoUrl ? (
                            <img src={userPhotoUrl} alt={user.displayName || ''} className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} className="text-blue-400" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 truncate">{user.displayName || 'Notandi'}</h2>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {/* Phone */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Phone size={18} className="text-gray-500" />
                        </div>
                        <input
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            onBlur={handleSaveUser}
                            placeholder={t('phone_placeholder')}
                            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 outline-none transition-all"
                        />
                    </div>

                    {/* Phone Visibility */}
                    <div className="flex items-center justify-between pl-14">
                        <span className="text-sm text-gray-600">{t('show_in_list')}</span>
                        <button
                            onClick={() => {
                                setUserIsPhoneVisible(!userIsPhoneVisible);
                                setTimeout(handleSaveUser, 100);
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors ${userIsPhoneVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${userIsPhoneVisible ? 'left-5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <MapPin size={18} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                            <AddressAutocomplete
                                defaultValue={userAddress}
                                onSelect={(addr) => {
                                    setUserAddress(addr.fullAddress);
                                    setTimeout(handleSaveUser, 100);
                                }}
                                placeholder={t('address_placeholder')}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="pt-2">
                        <ImageUploader
                            currentImageUrl={userPhotoUrl}
                            onUploadComplete={(url) => {
                                setUserPhotoUrl(url);
                                setTimeout(handleSaveUser, 100);
                            }}
                            storagePath={`users/${user?.uid}/profile`}
                            label={t('upload_photo')}
                        />
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-start gap-4 pt-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Globe size={18} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tungumál / Language</label>
                            <div className="flex flex-wrap gap-2">
                                {locales.map((l) => (
                                    <Link
                                        key={l}
                                        href={`/${l}${window.location.pathname.replace(/^\/[a-z]{2}/, '')}${window.location.search}`}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${locale === l
                                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {l.toUpperCase()}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Children Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{t('my_children')}</h2>
                    <a
                        href={`/${locale}/onboarding?step=join`}
                        className="text-sm font-semibold text-[#1E3A5F] hover:underline flex items-center gap-1"
                    >
                        <UserPlus size={16} />
                        {t('add_child')}
                    </a>
                </div>

                {students.length > 0 ? (
                    <div className="space-y-4">
                        {students.map(student => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                otherParents={otherParents.get(student.id) || []}
                                isExpanded={expandedChild === student.id}
                                onToggleExpand={() => setExpandedChild(expandedChild === student.id ? null : student.id)}
                                onSavePhoto={(url) => handleSaveStudentPhoto(student.id, url)}
                                onSaveName={(name) => handleSaveStudentName(student.id, name)}
                                onSaveDietaryNeeds={(needs) => handleSaveStudentDietaryNeeds(student.id, needs)}
                                onSaveGender={(gender) => handleSaveStudentGender(student.id, gender)}
                                onSaveBirthDate={(date) => handleSaveStudentBirthDate(student.id, date)}
                                onCopyInvite={() => handleCopyInviteLink(student.id)}
                                t={t}
                                tDietary={tDietary}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Heart size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-4">{t('no_children')}</p>
                        <a
                            href={`/${locale}/onboarding?step=join`}
                            className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#2E4A6F] transition"
                        >
                            <UserPlus size={18} />
                            {t('add_child')}
                        </a>
                    </div>
                )}
            </section>
        </div>
    );
}

function StudentCard({
    student,
    otherParents,
    isExpanded,
    onToggleExpand,
    onSavePhoto,
    onSaveName,
    onSaveDietaryNeeds,
    onSaveGender,
    onSaveBirthDate,
    onCopyInvite,
    t,
    tDietary
}: {
    student: any;
    otherParents: any[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onSavePhoto: (url: string) => void;
    onSaveName: (name: string) => void;
    onSaveDietaryNeeds: (needs: string[]) => void;
    onSaveGender: (gender: string) => void;
    onSaveBirthDate: (date: string) => void;
    onCopyInvite: () => void;
    t: any;
    tDietary: any;
}) {
    const [editedName, setEditedName] = useState(student.name);
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
        <div className={`glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-[#1E3A5F]/20' : ''}`}>
            {/* Header - Always visible */}
            <button
                onClick={onToggleExpand}
                className="w-full p-5 flex items-center gap-4 hover:bg-gray-50/50 transition text-left"
            >
                <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-blue-600">{initials}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{student.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                        {birthDateDisplay && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar size={14} />
                                {birthDateDisplay}
                            </span>
                        )}
                        {otherParents.length > 0 && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <User size={14} />
                                {otherParents[0].displayName?.split(' ')[0] || 'Maki'}
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
                <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-5 animate-in slide-in-from-top-2">

                    {/* Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{t('child_card.name_label')}</label>
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={() => editedName !== student.name && onSaveName(editedName)}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{t('child_card.birthday_label')}</label>
                        <input
                            type="date"
                            value={editedBirthDate}
                            onChange={(e) => {
                                setEditedBirthDate(e.target.value);
                                onSaveBirthDate(e.target.value);
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]/20 outline-none transition-all"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{t('child_card.gender_label')}</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'boy', label: t('child_card.boy') },
                                { value: 'girl', label: t('child_card.girl') },
                                { value: 'other', label: t('child_card.other') }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onSaveGender(option.value)}
                                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${student.gender === option.value
                                        ? 'bg-[#1E3A5F] text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dietary Needs */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{t('child_card.dietary_label')}</label>
                        <div className="flex flex-wrap gap-2">
                            {DIETARY_OPTIONS.map((option) => {
                                const isSelected = dietaryNeeds.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => toggleDietaryNeed(option.value)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isSelected
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {/* Use tDietary to translate option labels */}
                                        {tDietary(option.value)}
                                        {isSelected && <Check size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{t('child_card.photo_label')}</label>
                        <ImageUploader
                            currentImageUrl={student.photoUrl || ''}
                            onUploadComplete={(url) => onSavePhoto(url)}
                            storagePath={`students/${student.id}/profile`}
                            label=""
                        />
                    </div>

                    {/* Other Parents */}
                    {otherParents.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                {t('child_card.other_parents_label')}
                            </label>
                            <div className="space-y-2">
                                {otherParents.map((parent) => (
                                    <div key={parent.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {parent.photoURL ? (
                                                <img src={parent.photoURL} alt={parent.displayName || ''} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} className="text-green-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{parent.displayName || t('child_card.parent')}</p>
                                            <p className="text-xs text-green-600">{t('child_card.connected')}</p>
                                        </div>
                                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Invite - always visible (up to 4 parents allowed) */}
                    {otherParents.length < 3 && (
                        <div className={otherParents.length === 0 ? 'pt-2 border-t border-gray-200' : 'pt-3'}>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                {t('child_card.invite_parent')}
                            </label>
                            <button
                                onClick={handleCopyInvite}
                                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${copiedInvite
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                                    }`}
                            >
                                {copiedInvite ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        {t('child_card.copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        {t('child_card.copy_invite_link')}
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                {t('child_card.max_parents_help')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
