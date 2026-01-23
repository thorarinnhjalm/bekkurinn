'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useParams } from 'next/navigation';
import { updateDoc, doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Save, User, UserPlus, Check, Calendar } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';

const DIETARY_OPTIONS: { value: string; label: string }[] = [
    { value: 'peanut', label: 'Jarðhnetur' },
    { value: 'gluten', label: 'Glúten' },
    { value: 'dairy', label: 'Mjólk / Laktósa' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pork', label: 'Svínakjöt' },
];

export default function UserProfilePage() {
    const { user } = useAuth();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const [isSaving, setIsSaving] = useState(false);

    // State for user profile details
    const [userPhone, setUserPhone] = useState('');
    const [userIsPhoneVisible, setUserIsPhoneVisible] = useState(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState('');
    const [userAddress, setUserAddress] = useState('');

    const [links, setLinks] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [classId, setClassId] = useState<string>('');

    // Fetch user links and students
    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            // Get all parent links
            const q = query(collection(db, 'parentLinks'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const linksData = snapshot.docs.map(d => d.data());
            setLinks(linksData);

            // Get students for these links
            const studentIds = linksData.map(l => l.studentId);
            if (studentIds.length > 0) {
                const qStudents = query(collection(db, 'students'), where('__name__', 'in', studentIds));
                const snapStudents = await getDocs(qStudents);
                setStudents(snapStudents.docs.map(d => ({ id: d.id, ...d.data() })));
                // Get classId from first link
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

    const handleSaveUser = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: userPhotoUrl,
                phone: userPhone,
                isPhoneVisible: userIsPhoneVisible,
                address: userAddress
            }, { merge: true });
            alert('Upplýsingar vistaðar!');
        } catch (e) {
            console.error(e);
            alert('Villa við vistun');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentPhoto = async (studentId: string, url: string) => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'students', studentId), { photoUrl: url });
            // Update local state
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, photoUrl: url } : s));
            alert('Mynd barns uppfærð!');
        } catch (e) {
            console.error(e);
            alert('Villa við vistun á mynd barns');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentName = async (studentId: string, newName: string) => {
        if (!newName.trim()) {
            alert('Nafn má ekki vera tómt.');
            return;
        }
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'students', studentId), { name: newName });
            // Update local state
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
            alert('Nafn uppfært!');
        } catch (e) {
            console.error(e);
            alert('Villa við vistun á nafni');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentDietaryNeeds = async (studentId: string, needs: string[]) => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'students', studentId), { dietaryNeeds: needs });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, dietaryNeeds: needs } : s));
        } catch (e) {
            console.error(e);
            alert('Villa við vistun á mataræði');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentGender = async (studentId: string, gender: string) => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'students', studentId), { gender });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, gender } : s));
        } catch (e) {
            console.error(e);
            alert('Villa við vistun á kyni');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentBirthDate = async (studentId: string, dateString: string) => {
        if (!dateString) return;
        setIsSaving(true);
        try {
            const birthDate = Timestamp.fromDate(new Date(dateString));
            await updateDoc(doc(db, 'students', studentId), { birthDate });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, birthDate } : s));
        } catch (e) {
            console.error(e);
            alert('Villa við vistun á afmælisdegi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyInviteLink = (studentId: string) => {
        const inviteLink = `${window.location.origin}/${locale}/onboarding?join=${studentId}&classId=${classId}&inviterId=${user?.uid}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            alert('Hlekkur afritaður! Deildu honum með hinu foreldrinu eða maka.');
        }).catch(() => {
            alert('Villa við að afrita hlekk');
        });
    };

    if (!user) return <div>Vinsamlegast skráðu þig inn.</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-8 pb-24 pt-24">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Minn Aðgangur</h1>
                <p className="text-gray-500">Stillingar fyrir þig og börnin þín</p>
            </header>

            {/* MY PROFILE */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="text-nordic-blue" />
                    Mínar upplýsingar
                </h2>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="space-y-2">
                        <ImageUploader
                            currentImageUrl={userPhotoUrl}
                            onUploadComplete={(url) => setUserPhotoUrl(url)}
                            storagePath={`users/${user?.uid}/profile`}
                            label="Prófílmynd"
                        />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nafn</label>
                            <input
                                type="text"
                                value={user.displayName || ''}
                                disabled
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Símanúmer</label>
                                <input
                                    type="tel"
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                    placeholder="S. 123 4567"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nordic-blue outline-none"
                                />
                            </div>

                            <div className="flex items-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={userIsPhoneVisible}
                                        onChange={(e) => setUserIsPhoneVisible(e.target.checked)}
                                        className="w-5 h-5 text-nordic-blue rounded border-gray-300 focus:ring-nordic-blue"
                                    />
                                    <span className="text-sm text-gray-700">Birta númer í bekkjarlista</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Heimilisfang</label>
                            <AddressAutocomplete
                                defaultValue={userAddress}
                                onSelect={(addr) => {
                                    setUserAddress(addr.fullAddress);
                                    // Optionally save coordinates if needed later:
                                    // updateUserLocation(addr.location);
                                }}
                                placeholder="Sláðu inn heimilisfang..."
                                className="w-full"
                            />
                            {userAddress && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-nordic-blue hover:underline mt-1 inline-block"
                                >
                                    🗺️ Opna í kortum
                                </a>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Veldu heimilisfang úr listanum til að fá nákvæma staðsetningu.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mynd (Slóð / URL)</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={userPhotoUrl}
                                    onChange={(e) => setUserPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nordic-blue outline-none"
                                />
                                <button
                                    onClick={handleSaveUser}
                                    disabled={isSaving}
                                    className="bg-[#4A7C9E] text-white px-6 py-2 rounded-lg hover:bg-[#2E5A75] transition flex items-center gap-2 font-bold shadow-sm justify-center"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Vista
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                * Í augnablikinu styðjum við aðeins beina myndaslóð (URL).
                                Ef þú skráðir þig með Google er sjálfgefin mynd notuð.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MY CHILDREN */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Börnin mín</h2>

                {loadingLinks ? (
                    <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-nordic-blue" /></div>
                ) : students.length > 0 ? (
                    students.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onSave={(url) => handleSaveStudentPhoto(student.id, url)}
                            onSaveName={(name) => handleSaveStudentName(student.id, name)}
                            onSaveDietaryNeeds={(needs) => handleSaveStudentDietaryNeeds(student.id, needs)}
                            onSaveGender={(gender) => handleSaveStudentGender(student.id, gender)}
                            onSaveBirthDate={(date) => handleSaveStudentBirthDate(student.id, date)}
                            onCopyInvite={() => handleCopyInviteLink(student.id)}
                            userId={user?.uid || ''}
                        />
                    ))
                ) : (
                    <div className="text-center bg-gray-50 p-8 rounded-xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-500 mb-4">Engin börn tengd við aðganginn þinn</p>
                        <a
                            href={`/${locale}/onboarding?step=join`}
                            className="inline-flex items-center gap-2 text-nordic-blue font-bold hover:underline"
                        >
                            <UserPlus size={18} />
                            Bæta við barni
                        </a>
                    </div>
                )}
            </section>

            {/* Add Child Button (Always visible option) */}
            {students.length > 0 && (
                <div className="text-center pt-4">
                    <a
                        href={`/${locale}/onboarding?step=join`}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-nordic-blue transition font-medium"
                    >
                        <UserPlus size={18} />
                        Bæta við öðru barni
                    </a>
                </div>
            )}
        </div>
    );
}

function StudentCard({ student, onSave, onSaveName, onSaveDietaryNeeds, onSaveGender, onSaveBirthDate, onCopyInvite, userId }: {
    student: any,
    onSave: (url: string) => void,
    onSaveName: (name: string) => void,
    onSaveDietaryNeeds: (needs: string[]) => void,
    onSaveGender: (gender: string) => void,
    onSaveBirthDate: (date: string) => void,
    onCopyInvite: () => void,
    userId: string
}) {
    const [photoUrl, setPhotoUrl] = useState(student.photoUrl || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(student.name);
    const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);

    // Format birthDate for the date input (YYYY-MM-DD)
    const formatDateForInput = (timestamp: any) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toISOString().split('T')[0];
    };

    const [editedBirthDate, setEditedBirthDate] = useState(formatDateForInput(student.birthDate));

    // Format birthDate for display
    const formatBirthDateDisplay = (timestamp: any) => {
        if (!timestamp?.toDate) return 'Ekki skráður';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('is-IS', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Dietary Needs State
    const [dietaryNeeds, setDietaryNeeds] = useState<string[]>(student.dietaryNeeds || []);

    const toggleDietaryNeed = (value: string) => {
        const newNeeds = dietaryNeeds.includes(value)
            ? dietaryNeeds.filter(n => n !== value)
            : [...dietaryNeeds, value];

        setDietaryNeeds(newNeeds);
        onSaveDietaryNeeds(newNeeds); // Auto-save for better UX on toggles
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600 overflow-hidden border-2 border-amber-200 flex-shrink-0">
                {photoUrl ? (
                    <img src={photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                    student.name[0]
                )}
            </div>

            <div className="flex-1 w-full space-y-6">
                {/* NAME & INFO */}
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-lg font-bold border-b-2 border-nordic-blue outline-none flex-1"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        onSaveName(editedName);
                                        setIsEditingName(false);
                                    }}
                                    className="text-[#4A7C9E] hover:text-[#2E5A75] text-sm font-medium"
                                >
                                    ✓ Vista
                                </button>
                                <button
                                    onClick={() => {
                                        setEditedName(student.name);
                                        setIsEditingName(false);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    ✗
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{student.name}</h3>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="text-gray-400 hover:text-nordic-blue text-sm"
                                    title="Breyta nafni"
                                >
                                    ✎
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-500">Nemandi</p>
                    </div>
                </div>

                {/* BIRTHDATE */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-nordic-blue" />
                        Afmælisdagur
                    </label>
                    {isEditingBirthDate ? (
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={editedBirthDate}
                                onChange={(e) => setEditedBirthDate(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nordic-blue outline-none"
                                autoFocus
                            />
                            <button
                                onClick={() => {
                                    onSaveBirthDate(editedBirthDate);
                                    setIsEditingBirthDate(false);
                                }}
                                className="text-[#4A7C9E] hover:text-[#2E5A75] text-sm font-medium"
                            >
                                ✓ Vista
                            </button>
                            <button
                                onClick={() => {
                                    setEditedBirthDate(formatDateForInput(student.birthDate));
                                    setIsEditingBirthDate(false);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                                ✗
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700">
                                🎂 {formatBirthDateDisplay(student.birthDate)}
                            </span>
                            <button
                                onClick={() => setIsEditingBirthDate(true)}
                                className="text-gray-400 hover:text-nordic-blue text-sm"
                                title="Breyta afmælisdegi"
                            >
                                ✎
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        Afmælisdagur birtist í bekkjarlistanum og áminningar eru sendar.
                    </p>
                </div>

                {/* GENDER SELECTOR */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kyn</label>
                    <div className="flex bg-gray-50 p-1 rounded-lg inline-flex">
                        {[
                            { value: 'boy', label: 'Strákur' },
                            { value: 'girl', label: 'Stelpa' },
                            { value: 'other', label: 'Annað / Kvár' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onSaveGender(option.value)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${student.gender === option.value
                                    ? 'bg-white text-nordic-blue shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Notað til að bjóða í afmæli (t.d. "Bjóða öllum strákum").
                    </p>
                </div>

                {/* DIETARY NEEDS */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ofnæmi og mataræði</label>
                    <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map((option) => {
                            const isSelected = dietaryNeeds.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => toggleDietaryNeed(option.value)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${isSelected
                                        ? 'bg-red-50 border-red-200 text-red-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {isSelected && <Check size={14} />}
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Veldu það sem við á. Upplýsingar birtast umsjónarkennara og foreldrum í bekknum til að tryggja öryggi (t.d. í afmælum).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* PHOTO UPLOAD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mynd barns (Upphleðsla)</label>
                        <ImageUploader
                            currentImageUrl={photoUrl}
                            onUploadComplete={(url) => {
                                setPhotoUrl(url);
                                onSave(url);
                            }}
                            storagePath={`students/${student.id}/profile`}
                            label=""
                        />
                    </div>

                    {/* PHOTO URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mynd barns (Slóð / URL)</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm"
                            />
                            <button
                                onClick={() => onSave(photoUrl)}
                                className="bg-[#4A7C9E] text-white px-3 py-2 rounded-lg hover:bg-[#2E5A75] transition text-sm flex items-center justify-center gap-1 font-medium shadow-sm"
                            >
                                <Save size={14} />
                                Vista
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Þessi mynd birtist í bekkjarlistanum fyrir aðra foreldra (ef þú uppfyllir skilyrði).
                        </p>
                    </div>

                </div>

                {/* INVITE SPOUSE/PARTNER */}
                <div className="pt-3 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <UserPlus size={16} className="text-nordic-blue" />
                        Bjóða maka / hinu foreldrinu
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Deildu þessum hlekk með hinu foreldrinu eða maka svo hann/hún geti tengst sama barni.
                    </p>
                    <button
                        onClick={onCopyInvite}
                        className="w-full px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <UserPlus size={16} />
                        Afrita boðshlekk
                    </button>
                </div>
            </div>
        </div>
    );
}
