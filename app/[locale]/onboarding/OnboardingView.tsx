'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { SCHOOLS } from '@/constants/schools';
import { Users, School, ArrowRight, Loader2, Plus, QrCode, Check, Globe } from 'lucide-react';
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OnboardingSchema, validateInput } from '@/lib/validation';

// Define the steps explicitly
type OnboardingStep = 'language' | 'select' | 'create' | 'join';

// Temporary local implementations until moved to services
// (Keep existing logic, just cleaner)
async function createClassLocal(data: any, userId: string) {
    const schoolPrefix = data.schoolName.substring(0, 4).toUpperCase();
    const sectionSuffix = data.section ? `-${data.section.toUpperCase().substring(0, 1)}` : '';
    const baseCode = `${schoolPrefix}-${data.grade}${sectionSuffix}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const uniqueCode = `${baseCode}-${randomSuffix}`;

    // Create a special Admin Code for Parent Team members
    const adminCode = `${uniqueCode}-ADMIN`;

    const classRef = await addDoc(collection(db, 'classes'), {
        ...data,
        section: data.section || null,
        joinCode: uniqueCode,
        parentTeamCode: adminCode, // New field for admin joining
        admins: [userId],
        createdAt: serverTimestamp(),
        confidentialityAgreedAt: serverTimestamp(),
    });

    return { id: classRef.id, joinCode: uniqueCode, parentTeamCode: adminCode };
}

// Calendar helpers
function parseICS(icsContent: string) {
    const events: any[] = [];
    const lines = icsContent.split(/\r\n|\n|\r/);
    let currentEvent: any = {};
    let inEvent = false;

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            inEvent = true;
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            inEvent = false;
            if (currentEvent.summary && currentEvent.dtstart) {
                events.push(currentEvent);
            }
        } else if (inEvent) {
            if (line.startsWith('SUMMARY:')) {
                currentEvent.summary = line.substring(8);
            } else if (line.startsWith('DTSTART;VALUE=DATE:')) {
                currentEvent.dtstart = line.substring(19);
                currentEvent.isAllDay = true;
            } else if (line.startsWith('DTSTART:')) {
                currentEvent.dtstart = line.substring(8);
                currentEvent.isAllDay = false;
            }
        }
    }
    return events;
}

function parseDate(dateStr: string): Date {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
}

export default function OnboardingView() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check query param 'step' to see if language is already selected
    const paramStep = searchParams.get('step') as OnboardingStep;
    const initialStep = ['language', 'select', 'create', 'join'].includes(paramStep) ? paramStep : 'language';

    const [step, setStep] = useState<OnboardingStep>(initialStep);

    // Update step when URL param changes
    useEffect(() => {
        const paramStep = searchParams.get('step') as OnboardingStep;
        if (paramStep && ['language', 'select', 'create', 'join'].includes(paramStep)) {
            setStep(paramStep);
        }
    }, [searchParams]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            const segments = pathname.split('/');
            const locale = segments[1] || 'is';
            router.push(`/${locale}/login`);
        }
    }, [user, authLoading, router, pathname]);

    // Create Form State
    const [formData, setFormData] = useState({
        schoolName: '',
        grade: 1,
        isSplit: true,
        section: ''
    });

    // Join Class State
    const [joinCode, setJoinCode] = useState(searchParams.get('code') || '');
    const [checkingCode, setCheckingCode] = useState(false);
    const [foundClass, setFoundClass] = useState<any>(null);
    const [isAdminCode, setIsAdminCode] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [joining, setJoining] = useState(false);

    // Auto-verify if code is present in URL
    useEffect(() => {
        const codeParam = searchParams.get('code');
        if (codeParam && !foundClass && !checkingCode && !error) {
            setJoinCode(codeParam);
            // Trigger verification automatically
            // We need to call verification logic here, but handleVerifyCode relies on state that might not be set yet.
            // Better to just set it and let user click Or use a separate effect that calls the logic if code is set.
            // Actually, let's call it safely.
            const verify = async () => {
                // Duplicate logic from handleVerifyCode but using codeParam directly
                setCheckingCode(true);
                try {
                    const q = query(collection(db, 'classes'), where('joinCode', '==', codeParam));
                    const snapshot = await getDocs(q);
                    // Admin check
                    const qAdmin = query(collection(db, 'classes'), where('parentTeamCode', '==', codeParam));
                    const snapshotAdmin = await getDocs(qAdmin);

                    if (snapshot.empty && snapshotAdmin.empty) {
                        // Don't show error immediately on auto-check to avoid flashing red if invalid?
                        // Or show it? Let's show it.
                        setError('Enginn bekkur fannst með þennan kóða.');
                        setCheckingCode(false);
                        return;
                    }

                    let classDoc;
                    if (!snapshot.empty) {
                        classDoc = snapshot.docs[0];
                    } else {
                        classDoc = snapshotAdmin.docs[0];
                        setIsAdminCode(true);
                    }
                    const cData = { id: classDoc.id, ...classDoc.data() };
                    setFoundClass(cData);

                    // Fetch students
                    const studentsQ = query(collection(db, 'students'), where('classId', '==', classDoc.id));
                    const studentsSnap = await getDocs(studentsQ);
                    const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
                    studentsList.sort((a: any, b: any) => a.name.localeCompare(b.name));
                    setStudents(studentsList);
                } catch (e) {
                    console.error(e);
                } finally {
                    setCheckingCode(false);
                }
            };
            verify();
        }
    }, [searchParams]); // Run when params change (e.g. initial load)

    // Create Student State (nested in Join flow)
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentDob, setNewStudentDob] = useState(''); // YYYY-MM-DD

    // Create Class Result
    const [createdClassInfo, setCreatedClassInfo] = useState<{ id: string, joinCode: string, parentTeamCode: string } | null>(null);

    const handleLanguageSelect = (lang: string) => {
        // Construct new path with selected locale
        // Current path format: /[locale]/onboarding
        // We replace [locale] with the selected lang
        const segments = pathname.split('/');
        if (segments.length >= 3) {
            segments[1] = lang; // Replace existing locale
            const newPath = segments.join('/');

            // Navigate to new locale with ?step=select to skip language screen
            router.replace(`${newPath}?step=select`);
            // Set state immediately for responsiveness, though page might reload
            setStep('select');
        } else {
            // Fallback
            router.push(`/${lang}/onboarding?step=select`);
        }
    };

    const handleVerifyCode = async () => {
        if (!joinCode) return;
        setCheckingCode(true);
        setError(null);
        setIsAdminCode(false);

        try {
            // Check for standard join code
            const q = query(collection(db, 'classes'), where('joinCode', '==', joinCode));
            const snapshot = await getDocs(q);

            // Also check for Parent Team Code (Admin)
            const qAdmin = query(collection(db, 'classes'), where('parentTeamCode', '==', joinCode));
            const snapshotAdmin = await getDocs(qAdmin);

            if (snapshot.empty && snapshotAdmin.empty) {
                setError('Enginn bekkur fannst með þennan kóða.');
                setCheckingCode(false);
                return;
            }

            let classDoc;
            if (!snapshot.empty) {
                classDoc = snapshot.docs[0];
            } else {
                classDoc = snapshotAdmin.docs[0];
                setIsAdminCode(true); // Mark as Admin join
            }

            const classData = { id: classDoc.id, ...classDoc.data() };
            setFoundClass(classData);

            // Fetch students
            const studentsQ = query(collection(db, 'students'), where('classId', '==', classDoc.id));
            const studentsSnap = await getDocs(studentsQ);
            const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

            // Sort students alphabetically
            studentsList.sort((a: any, b: any) => a.name.localeCompare(b.name));
            setStudents(studentsList);

        } catch (err) {
            console.error(err);
            setError('Villa við að sækja bekk.');
        } finally {
            setCheckingCode(false);
        }
    };

    const handleCreateStudentAndJoin = async () => {
        if (!user || !foundClass) return;
        if (!newStudentName.trim() || !newStudentDob) {
            setError('Vinsamlegast fylltu út nafn og fæðingardag.');
            return;
        }

        setJoining(true); // Reuse joining loading state

        try {
            // 1. Create Student
            const dobDate = new Date(newStudentDob);
            const studentRef = await addDoc(collection(db, 'students'), {
                classId: foundClass.id,
                name: newStudentName,
                birthDate: Timestamp.fromDate(dobDate),
                dietaryNeeds: [],
                photoPermission: 'allow', // Default
                createdAt: serverTimestamp(),
            });

            // 2. Link Parent
            const linkId = `${user.uid}_${foundClass.id}`;
            await setDoc(doc(db, 'parentLinks', linkId), {
                userId: user.uid,
                studentId: studentRef.id, // Link to new student
                classId: foundClass.id,
                relationship: isAdminCode ? 'Class Representative' : 'Foreldri',
                role: isAdminCode ? 'admin' : 'parent', // New Role Logic (supported by updated Firestore rules)
                status: 'approved', // Auto-approve for MVP launch
                createdAt: serverTimestamp(),
            });

            // Redirect
            const segments = pathname.split('/');
            const locale = segments[1] || 'is';
            router.push(`/${locale}/dashboard?welcome=true`);

        } catch (err) {
            console.error(err);
            setError('Villa kom upp við að stofna barn. Reyndu aftur.');
            setJoining(false);
        }
    };

    const handleJoinClass = async () => {
        if (!user) {
            setError('Þú verður að vera skráð(ur) inn.');
            return;
        }
        if (!foundClass || !selectedStudentId) return;
        setJoining(true);

        try {
            // Create Parent Link
            // We use setDoc to enforce the ID format: userId_classId
            // This is required for security rules (isClassMember) to work correctly
            const linkId = `${user.uid}_${foundClass.id}`;
            await setDoc(doc(db, 'parentLinks', linkId), {
                userId: user.uid,
                studentId: selectedStudentId,
                classId: foundClass.id,
                relationship: isAdminCode ? 'Class Representative' : 'Foreldri',
                role: isAdminCode ? 'admin' : 'parent', // New Role Logic
                status: 'approved', // Auto-approve for MVP launch
                createdAt: serverTimestamp(),
            });

            // Redirect
            const segments = pathname.split('/');
            const locale = segments[1] || 'is';
            router.push(`/${locale}/dashboard?welcome=true`);
        } catch (err) {
            console.error(err);
            setError('Gat ekki gengið í bekk.');
            setJoining(false);
        }
    };

    const handleCreate = async () => {
        if (!user) return;

        const validation = validateInput(OnboardingSchema, formData);
        if (!validation.success) {
            setError(validation.errors[0]);
            return;
        }

        if (formData.isSplit && !formData.section) {
            setError('Skráðu deild (t.d. A eða Hlíð)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const schoolObj = SCHOOLS.find(s => s.name === formData.schoolName);
            const calendarUrl = schoolObj?.icsUrl;

            const displayName = formData.isSplit
                ? `${formData.grade}. Bekkur ${formData.section} - ${formData.schoolName}`
                : `${formData.grade}. Bekkur (Árgangur) - ${formData.schoolName}`;

            const result = await createClassLocal({
                name: displayName,
                schoolName: formData.schoolName,
                grade: Number(formData.grade),
                section: formData.isSplit ? formData.section : null,
                calendarUrl
            }, user.uid);

            const classId = result.id;
            setCreatedClassInfo(result); // Store for success screen

            if (calendarUrl) {
                try {
                    const res = await fetch(`/api/proxy-calendar?url=${encodeURIComponent(calendarUrl)}`);
                    if (res.ok) {
                        const icsText = await res.text();
                        const events = parseICS(icsText);
                        const keywords = ['Starfsdagur', 'Skipulagsdagur', 'Vetrarfrí', 'Jólafrí', 'Páskafrí', 'Skólasetning', 'Skólaslit', 'Lýðveldisdagurinn', 'Sumardagurinn fyrsti', 'Frídagur'];
                        const relevantEvents = events.filter((e: any) =>
                            keywords.some(k => e.summary && e.summary.toLowerCase().includes(k.toLowerCase()))
                        );

                        const addPromises = relevantEvents.map((event: any) => {
                            const date = parseDate(event.dtstart);
                            return addDoc(collection(db, 'tasks'), {
                                classId: classId,
                                type: 'school_event',
                                title: event.summary,
                                description: 'Samkvæmt skóladagatali',
                                date: Timestamp.fromDate(date),
                                slotsTotal: 0,
                                slotsFilled: 0,
                                volunteers: [],
                                createdBy: user.uid,
                                createdAt: serverTimestamp(),
                            });
                        });
                        await Promise.all(addPromises);
                    }
                } catch (calError) {
                    console.error("Calendar sync failed:", calError);
                }
            }

            // We don't redirect immediately now, we show the codes first!
        } catch (err: any) {
            console.error(err);
            setError('Gat ekki stofnað bekk. Reyndu aftur.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 1: LANGUAGE SELECTION ---
    if (step === 'language') {
        return (
            <div className="min-h-screen bg-stone-50 p-4 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6">
                        <Globe className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Veldu tungumál</h1>
                    <p className="text-gray-500 text-lg">Select your language / Wybierz język</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    <LanguageCard
                        lang="is"
                        flag="🇮🇸"
                        name="Íslenska"
                        sub="Móðurmál"
                        onClick={() => handleLanguageSelect('is')}
                    />
                    <LanguageCard
                        lang="en"
                        flag="🇬🇧"
                        name="English"
                        sub="International"
                        onClick={() => handleLanguageSelect('en')}
                    />
                    <LanguageCard
                        lang="pl"
                        flag="🇵🇱"
                        name="Polski"
                        sub="Język polski"
                        onClick={() => handleLanguageSelect('pl')}
                    />
                    <LanguageCard
                        lang="lt"
                        flag="🇱🇹"
                        name="Lietuvių"
                        sub="Lietuvių kalba"
                        onClick={() => handleLanguageSelect('lt')}
                    />
                </div>
            </div>
        );
    }

    // --- STEP 2: SELECT MODE (Create vs Join) ---
    if (step === 'select') {
        return (
            <div className="min-h-screen bg-stone-50 p-4 flex flex-col items-center justify-center space-y-8">
                <div className="text-center space-y-2">
                    <button
                        onClick={() => setStep('language')}
                        className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 mx-auto"
                    >
                        <Globe size={14} /> Breyta tungumáli / Change language
                    </button>
                    <h1 className="text-3xl font-bold text-nordic-blue-dark">Velkomin í Bekkinn!</h1>
                    <p className="text-text-secondary">Hvernig viltu byrja?</p>
                </div>

                <div className="grid gap-4 w-full max-w-md">
                    <button
                        onClick={() => setStep('join')}
                        className="nordic-card p-6 flex items-center gap-4 hover:border-nordic-blue transition-all group text-left"
                    >
                        <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                            <Users className="text-nordic-blue" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Ganga í bekk</h3>
                            <p className="text-sm text-text-secondary">Ég er með boðskóða frá fulltrúa</p>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-nordic-blue" />
                    </button>

                    <button
                        onClick={() => setStep('create')}
                        className="nordic-card p-6 flex items-center gap-4 hover:border-amber-400 transition-all group text-left border-2 border-transparent"
                    >
                        <div className="bg-amber-50 p-3 rounded-full group-hover:bg-amber-100 transition-colors">
                            <Plus className="text-amber-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Stofna nýjan bekk</h3>
                            <p className="text-sm text-text-secondary">Ég er bekkjarfulltrúi</p>
                        </div>
                        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                    </button>
                </div>
            </div>
        );
    }

    // --- STEP 3: CREATE CLASS ---
    if (step === 'create') {
        // SUCCESS SCREEN AFTER CREATION
        if (createdClassInfo) {
            return (
                <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={40} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">Bekkur stofnaður!</h2>
                        <p className="text-gray-600">Til hamingju. Hér eru kóðarnir til að deila:</p>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4 text-left">
                            <div>
                                <p className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-1">Fyrir foreldra (Almennur aðgangur)</p>
                                <div className="text-3xl font-mono font-bold text-blue-800 bg-white p-3 rounded-lg border border-blue-200 text-center tracking-widest select-all">
                                    {createdClassInfo.joinCode}
                                </div>
                            </div>

                            <hr className="border-blue-200" />

                            <div>
                                <p className="text-sm font-semibold text-purple-900 uppercase tracking-wider mb-1">Fyrir Foreldraráð (Stjórnendur)</p>
                                <div className="text-xl font-mono font-bold text-purple-800 bg-purple-50 p-3 rounded-lg border border-purple-200 text-center tracking-widest select-all break-all">
                                    {createdClassInfo.parentTeamCode}
                                </div>
                                <p className="text-xs text-purple-700 mt-2">Dulin aðgangsheimild. Veitir stjórnendurréttindi. Deildu varlega.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const segments = pathname.split('/');
                                const locale = segments[1] || 'is';
                                router.push(`/${locale}/dashboard?welcome=true`);
                            }}
                            className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg"
                        >
                            Áfram á stjórnborð
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    <header>
                        <button onClick={() => setStep('select')} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
                            ← Til baka
                        </button>
                        <h1 className="text-2xl font-bold text-nordic-blue-dark">Stofna nýjan bekk</h1>
                        <p className="text-text-secondary">Fylltu út grunnupplýsingar</p>
                    </header>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skóli (í Kópavogi)</label>
                            <select
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-900"
                            >
                                <option value="">Veldu skóla...</option>
                                {SCHOOLS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Árgangur</label>
                            <select
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-900"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                                    <option key={g} value={g}>
                                        {g}. bekkur
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                            <label className="block text-sm font-medium text-nordic-blue-dark">Hvernig er árganginum skipt?</label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-md border cursor-pointer hover:border-blue-300">
                                <input
                                    type="radio"
                                    checked={!formData.isSplit}
                                    onChange={() => setFormData({ ...formData, isSplit: false })}
                                    name="structure"
                                    className="w-4 h-4 text-nordic-blue"
                                />
                                <div>
                                    <span className="font-semibold block text-sm">Heill árgangur saman</span>
                                    <span className="text-xs text-gray-500">Engin sérstök deildaskipting (Allur 4. bekkur)</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-md border cursor-pointer hover:border-blue-300">
                                <input
                                    type="radio"
                                    checked={formData.isSplit}
                                    onChange={() => setFormData({ ...formData, isSplit: true })}
                                    name="structure"
                                    className="w-4 h-4 text-nordic-blue"
                                />
                                <div>
                                    <span className="font-semibold block text-sm">Skipt í bekki/deildir</span>
                                    <span className="text-xs text-gray-500">T.d. 4. bekkur A, 4. bekkur B...</span>
                                </div>
                            </label>
                        </div>

                        {formData.isSplit && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nafn deildar/bekkjar</label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    placeholder="t.d. A, B, Hlíð, Melar..."
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                                    autoFocus
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all transform active:scale-95 shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" />}
                            <span>Stofna Bekk</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 4: JOIN CLASS ---
    if (step === 'join') {
        return (
            <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-6">
                    <button onClick={() => {
                        if (isCreatingStudent) {
                            setIsCreatingStudent(false);
                            setError(null);
                        } else {
                            setFoundClass(null);
                            setStep('select');
                        }
                    }} className="absolute top-4 left-4 text-gray-400">← Til baka</button>

                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="text-nordic-blue" size={32} />
                    </div>

                    {!foundClass ? (
                        <>
                            <h2 className="text-2xl font-bold">Sláðu inn boðskóða</h2>

                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="XXXX-XXXX"
                                className="w-full text-center text-2xl tracking-widest p-4 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                            />

                            <p className="text-gray-500 text-sm">
                                Sláðu inn kóðann (t.d. SALA-4B) frá fulltrúa.<br />
                                <span className="opacity-70 text-xs">Stjórnendur notaðu 'Parent Team' aðgangskóða.</span>
                            </p>

                            {error && (
                                <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
                            )}

                            <button
                                onClick={handleVerifyCode}
                                disabled={!joinCode || checkingCode}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {checkingCode && <Loader2 className="animate-spin" size={20} />}
                                Áfram
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-green-50 p-4 rounded-xl text-green-800">
                                <p className="font-bold flex items-center justify-center gap-2">
                                    <Check size={20} />
                                    {foundClass.name}
                                </p>
                                <p className="text-sm opacity-80">{foundClass.schoolName}</p>
                                {isAdminCode && (
                                    <div className="mt-2 text-xs font-bold bg-purple-100 text-purple-800 py-1 px-2 rounded-full inline-block">
                                        Admin / Stjórnandi aðgangur
                                    </div>
                                )}
                            </div>

                            {!isCreatingStudent ? (
                                <>
                                    <div className="text-left">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hvert er barnið þitt?</label>
                                        <select
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Veldu barn af listanum...</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setIsCreatingStudent(true)}
                                            className="text-sm text-blue-600 hover:text-blue-800 mt-3 flex items-center gap-1 font-medium"
                                        >
                                            <Plus size={14} /> Barnið mitt er ekki á listanum (Stofna nýtt)
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleJoinClass}
                                        disabled={!selectedStudentId || joining}
                                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {joining && <Loader2 className="animate-spin" size={20} />}
                                        Skrá mig í bekkinn
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-left">
                                        <h3 className="font-bold text-lg mb-4">Skráning nýs nemanda</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Fullt nafn barns</label>
                                                <input
                                                    type="text"
                                                    value={newStudentName}
                                                    onChange={(e) => setNewStudentName(e.target.value)}
                                                    placeholder="Jón Jónsson"
                                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Fæðingardagur</label>
                                                <input
                                                    type="date"
                                                    value={newStudentDob}
                                                    onChange={(e) => setNewStudentDob(e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setIsCreatingStudent(false)}
                                            className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 bg-white"
                                        >
                                            Hætta við
                                        </button>
                                        <button
                                            onClick={handleCreateStudentAndJoin}
                                            disabled={!newStudentName || !newStudentDob || joining}
                                            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {joining ? <Loader2 className="animate-spin" size={18} /> : 'Skrá og klára'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
}

function LanguageCard({ lang, flag, name, sub, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
        >
            <span className="text-4xl group-hover:scale-110 transition-transform">{flag}</span>
            <div>
                <h3 className="font-bold text-lg text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500">{sub}</p>
            </div>
        </button>
    );
}

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
