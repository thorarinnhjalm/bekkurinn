'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { updateDoc, doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Save, User, UserPlus } from 'lucide-react';
import { ImageUploader } from '@/components/upload/ImageUploader';

export default function UserProfilePage({ params }: { params: { locale: string } }) {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // State for user profile details
    const [userPhone, setUserPhone] = useState('');
    const [userIsPhoneVisible, setUserIsPhoneVisible] = useState(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState('');

    const [links, setLinks] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingLinks, setLoadingLinks] = useState(true);

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
                isPhoneVisible: userIsPhoneVisible
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
            alert('Mynd barns uppfærð!');
        } catch (e) {
            console.error(e);
            alert('Villa við vistun á mynd barns');
        } finally {
            setIsSaving(false);
        }
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
                            <label className="block text-sm font-medium text-gray-700">Mynd (Slóð / URL)</label>
                            <div className="flex gap-2">
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
                                    className="bg-nordic-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold shadow-sm"
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
                        />
                    ))
                ) : (
                    <div className="text-center bg-gray-50 p-8 rounded-xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-500 mb-4">Engin börn tengd við aðganginn þinn</p>
                        <a
                            href={`/${params.locale || 'is'}/onboarding?step=join`}
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
                        href={`/${params.locale || 'is'}/onboarding?step=join`}
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

function StudentCard({ student, onSave }: { student: any, onSave: (url: string) => void }) {
    const [photoUrl, setPhotoUrl] = useState(student.photoUrl || '');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600 overflow-hidden border-2 border-amber-200 flex-shrink-0">
                {photoUrl ? (
                    <img src={photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                    student.name[0]
                )}
            </div>

            <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-sm text-gray-500">Nemandi</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mynd barns (Slóð / URL)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm"
                        />
                        <button
                            onClick={() => onSave(photoUrl)}
                            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-1 font-medium"
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
        </div>
    );
}
