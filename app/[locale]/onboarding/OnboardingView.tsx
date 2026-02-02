'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { SCHOOLS } from '@/constants/schools';
import { Users, School, ArrowRight, Loader2, Plus, QrCode, Check, Globe } from 'lucide-react';
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OnboardingSchema, validateInput } from '@/lib/validation';
import { useTranslations } from 'next-intl';
import { getAllSchools } from '@/services/firestore';

// Define the steps explicitly
type OnboardingStep = 'language' | 'select' | 'create' | 'join';

/**
 * Progress Indicator Component
 * Shows user's progress through onboarding flow
 */
function ProgressIndicator({ currentStep, totalSteps, labels }: {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}) {
    return (
        <div className="w-full max-w-md mx-auto mb-8">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className="flex-1 flex items-center">
                        <div
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${i < currentStep
                                ? 'bg-blue-600'
                                : i === currentStep
                                    ? 'bg-blue-400'
                                    : 'bg-gray-200'
                                }`}
                        />
                    </div>
                ))}
            </div>
            {/* Step label */}
            <div className="flex justify-between text-xs text-gray-500">
                <span>Skref {currentStep + 1} af {totalSteps}</span>
                {labels && labels[currentStep] && (
                    <span className="text-gray-700 font-medium">{labels[currentStep]}</span>
                )}
            </div>
        </div>
    );
}

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
            } else if (line.startsWith('DTSTART;TZID=')) {
                // Handle DTSTART;TZID=...:20240101T080000
                const parts = line.split(':');
                if (parts.length > 1) {
                    currentEvent.dtstart = parts[1];
                    currentEvent.isAllDay = parts[1].length <= 8; // Date only format is usually 8 chars YYYYMMDD
                }
            } else if (line.startsWith('DTEND;VALUE=DATE:')) {
                currentEvent.dtend = line.substring(17);
            } else if (line.startsWith('DTEND:')) {
                currentEvent.dtend = line.substring(6);
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
    const params = useParams();
    const searchParams = useSearchParams();
    const { createNotification } = useNotifications();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('onboarding');

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
            const locale = pathname.split('/')[1] || 'is';
            const returnTo = encodeURIComponent(pathname + (window.location.search || ''));
            router.push(`/${locale}/login?returnTo=${returnTo}`);
        }
    }, [user, authLoading, router, pathname]);

    // Create Form State
    const [formData, setFormData] = useState({
        schoolName: '',
        grade: 1,
        isSplit: true,
        section: ''
    });

    // School List State
    const [availableSchools, setAvailableSchools] = useState<any[]>(SCHOOLS);

    // Fetch schools on mount
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const firestoreSchools = await getAllSchools();

                // Merge strategy:
                // 1. Start with hardcoded SCHOOLS (they have verified icsUrls)
                // 2. Add any Firestore school that isn't already in the list (match by ID)
                // 3. Sort alphabetically by name

                const mergedMap = new Map();

                // Add static schools first
                SCHOOLS.forEach(s => mergedMap.set(s.id, s));

                // Add dynamic schools if not exists
                firestoreSchools.forEach(s => {
                    if (!mergedMap.has(s.id)) {
                        mergedMap.set(s.id, s);
                    }
                });

                const mergedList = Array.from(mergedMap.values());
                mergedList.sort((a, b) => a.name.localeCompare(b.name, 'is'));

                setAvailableSchools(mergedList);
            } catch (err) {
                console.error("Failed to fetch dynamic schools:", err);
                // Fallback to static list is automatic since initial state is SCHOOLS
            }
        };
        fetchSchools();
    }, []);

    // Join Class State
    const [joinCode, setJoinCode] = useState(searchParams.get('code') || '');
    const [checkingCode, setCheckingCode] = useState(false);
    const [foundClass, setFoundClass] = useState<any>(null);
    const [isAdminCode, setIsAdminCode] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [joining, setJoining] = useState(false);

    // Invite join parameters (from spouse invite link)
    const joinStudentId = searchParams.get('join');
    const joinClassId = searchParams.get('classId');
    const inviterId = searchParams.get('inviterId');

    // Auto-verify if code is present in URL
    useEffect(() => {
        const codeParam = searchParams.get('code');
        if (codeParam && !foundClass && !checkingCode && !error) {
            setJoinCode(codeParam);
            // Trigger verification automatically
            const verify = async () => {
                setCheckingCode(true);
                try {
                    const q = query(collection(db, 'classes'), where('joinCode', '==', codeParam));
                    const snapshot = await getDocs(q);
                    // Admin check
                    const qAdmin = query(collection(db, 'classes'), where('parentTeamCode', '==', codeParam));
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
    }, [searchParams]);

    // Handle invite link (join + classId parameters)
    useEffect(() => {
        async function handleInviteLink() {
            if (!joinStudentId || !joinClassId || !user) return;

            setCheckingCode(true);
            try {
                // Fetch the class directly by ID
                const classDoc = await getDocs(query(collection(db, 'classes'), where('__name__', '==', joinClassId)));
                if (classDoc.empty) {
                    setError('Bekkur fannst ekki.');
                    return;
                }

                const cData = { id: classDoc.docs[0].id, ...classDoc.docs[0].data() };
                setFoundClass(cData);

                // Fetch student by ID to verify it exists
                const studentDoc = await getDocs(query(collection(db, 'students'), where('__name__', '==', joinStudentId)));
                if (studentDoc.empty) {
                    setError('Barn fannst ekki.');
                    return;
                }

                // Auto-select this student
                setSelectedStudentId(joinStudentId);

                // Fetch all students for display
                const studentsQ = query(collection(db, 'students'), where('classId', '==', joinClassId));
                const studentsSnap = await getDocs(studentsQ);
                const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
                studentsList.sort((a: any, b: any) => a.name.localeCompare(b.name));
                setStudents(studentsList);
            } catch (e) {
                console.error(e);
                setError('Villa við að sækja gögn');
            } finally {
                setCheckingCode(false);
            }
        }
        handleInviteLink();
    }, [joinStudentId, joinClassId, user]);

    // Create Student State (nested in Join flow)
    const [isCreatingStudent, setIsCreatingStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentDob, setNewStudentDob] = useState(''); // YYYY-MM-DD

    // Create Class Result
    const [createdClassInfo, setCreatedClassInfo] = useState<{ id: string, joinCode: string, parentTeamCode: string } | null>(null);

    const handleLanguageSelect = (lang: string) => {
        const segments = pathname.split('/');
        if (segments.length >= 3) {
            segments[1] = lang;
            const newPath = segments.join('/');
            router.replace(`${newPath}?step=select`);
            setStep('select');
        } else {
            router.push(`/${lang}/onboarding?step=select`);
        }
    };

    const handleVerifyCode = async () => {
        if (!joinCode) return;
        setCheckingCode(true);
        setError(null);
        setIsAdminCode(false);

        try {
            const q = query(collection(db, 'classes'), where('joinCode', '==', joinCode));
            const snapshot = await getDocs(q);

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
                setIsAdminCode(true);
            }

            const classData = { id: classDoc.id, ...classDoc.data() };
            setFoundClass(classData);

            const studentsQ = query(collection(db, 'students'), where('classId', '==', classDoc.id));
            const studentsSnap = await getDocs(studentsQ);
            const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

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

        setJoining(true);

        try {
            const duplicate = students.find(s => s.name.toLowerCase().trim() === newStudentName.toLowerCase().trim());
            if (duplicate) {
                setError(`Barn með nafninu "${newStudentName}" er þegar í bekknum. Vinsamlegast veldu það af listanum eða hafðu samband við fulltrúa ef þetta er annað barn með sama nafn.`);
                setJoining(false);
                return;
            }

            const dobDate = new Date(newStudentDob);
            const studentRef = await addDoc(collection(db, 'students'), {
                classId: foundClass.id,
                name: newStudentName,
                birthDate: Timestamp.fromDate(dobDate),
                dietaryNeeds: [],
                photoPermission: 'allow',
                createdAt: serverTimestamp(),
            });

            const linkId = `${user.uid}_${foundClass.id}`;
            await setDoc(doc(db, 'parentLinks', linkId), {
                userId: user.uid,
                studentId: studentRef.id,
                classId: foundClass.id,
                relationship: isAdminCode ? 'Class Representative' : 'Foreldri',
                role: isAdminCode ? 'admin' : 'parent',
                status: 'approved',
                createdAt: serverTimestamp(),
            });

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
            const isClassAdmin = foundClass.admins?.includes(user.uid) || isAdminCode;
            const initialStatus = isClassAdmin ? 'approved' : 'pending';

            const linkId = `${user.uid}_${foundClass.id}`;
            await setDoc(doc(db, 'parentLinks', linkId), {
                userId: user.uid,
                studentId: selectedStudentId,
                classId: foundClass.id,
                relationship: isAdminCode ? 'Class Representative' : 'Foreldri',
                role: isAdminCode ? 'admin' : 'parent',
                status: initialStatus,
                invitedBy: inviterId || null,
                createdAt: serverTimestamp(),
            });

            if (inviterId && initialStatus === 'pending') {
                const studentName = students.find(s => s.id === selectedStudentId)?.name || 'Barnið sitt';
                await createNotification(
                    inviterId,
                    'Ný beiðni um aðgang',
                    `${user.displayName || 'Einhver'} vill tengjast ${studentName} í ${foundClass.name}.`,
                    'system',
                    `/${locale}/dashboard`
                );
            }

            if (initialStatus === 'pending') {
                router.push(`/${locale}/dashboard?pending=true`);
            } else {
                router.push(`/${locale}/dashboard?welcome=true`);
            }
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
            const schoolObj = availableSchools.find(s => s.name === formData.schoolName);
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
            setCreatedClassInfo(result);

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

                            let endDate = null;
                            if (event.dtend) {
                                // ICS DTEND is exclusive for all-day events (the day AFTER the event ends)
                                // Only set endDate if it differs from start date by more than 1 day
                                const endD = parseDate(event.dtend);

                                // Calculate difference in days
                                const diffTime = Math.abs(endD.getTime() - date.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                if (diffDays > 1) {
                                    // It IS a multi-day event.
                                    // Ideally, we store the exclusive end date or inclusive?
                                    // Let's store the inclusive end date (DTEND - 1 day) for display purposes if we want "Feb 19 - Feb 21"
                                    // standard ICS practice: Feb 19 to Feb 22 means 19, 20, 21.

                                    // Let's subtract 1 day from DTEND just to get the last ACTIVE day
                                    endD.setDate(endD.getDate() - 1);
                                    endDate = Timestamp.fromDate(endD);
                                }
                            }

                            return addDoc(collection(db, 'tasks'), {
                                classId: classId,
                                schoolId: formData.schoolName ? null : null, // Future proofing
                                type: 'school_event',
                                title: event.summary,
                                description: 'Samkvæmt skóladagatali',
                                date: Timestamp.fromDate(date),
                                endDate: endDate, // Add endDate
                                isAllDay: event.isAllDay ?? true,
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
                    <h1 className="text-3xl font-bold text-gray-900">{t('language_select_title')}</h1>
                    <p className="text-gray-500 text-lg">{t('language_select_subtitle')}</p>
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
                <div className="w-full max-w-md">
                    <ProgressIndicator
                        currentStep={0}
                        totalSteps={2}
                        labels={['Velja aðferð', 'Ljúka skráningu']}
                    />
                </div>
                <div className="text-center space-y-2">
                    <button
                        onClick={() => setStep('language')}
                        className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 mx-auto"
                    >
                        <Globe size={14} /> {t('change_language')}
                    </button>
                    <h1 className="text-3xl font-bold text-nordic-blue-dark">{t('welcome_main_title')}</h1>
                    <p className="text-text-secondary">{t('welcome_select_method')}</p>
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
                            <h3 className="font-bold text-lg">{t('join_class')}</h3>
                            <p className="text-sm text-text-secondary">{t('join_class_desc')}</p>
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
                            <h3 className="font-bold text-lg">{t('create_class')}</h3>
                            <p className="text-sm text-text-secondary">{t('create_class_role_desc')}</p>
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

                        <h2 className="text-2xl font-bold text-gray-900">{t('success_title')}</h2>
                        <p className="text-gray-600">{t('success_desc')}</p>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4 text-left">
                            <div>
                                <p className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-1">{t('code_parents_label')}</p>
                                <div className="text-3xl font-mono font-bold text-blue-800 bg-white p-3 rounded-lg border border-blue-200 text-center tracking-widest select-all">
                                    {createdClassInfo.joinCode}
                                </div>
                            </div>

                            <hr className="border-blue-200" />

                            <div>
                                <p className="text-sm font-semibold text-purple-900 uppercase tracking-wider mb-1">{t('code_admin_label')}</p>
                                <div className="text-xl font-mono font-bold text-purple-800 bg-purple-50 p-3 rounded-lg border border-purple-200 text-center tracking-widest select-all break-all">
                                    {createdClassInfo.parentTeamCode}
                                </div>
                                <p className="text-xs text-purple-700 mt-2">{t('code_admin_warning')}</p>
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
                            {t('continue_dashboard')}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                    <ProgressIndicator
                        currentStep={1}
                        totalSteps={2}
                        labels={['Velja aðferð', 'Stofna bekk']}
                    />
                    <header>
                        <button onClick={() => setStep('select')} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
                            ← Til baka
                        </button>
                        <h1 className="text-2xl font-bold text-nordic-blue-dark">{t('create_class_title')}</h1>
                        <p className="text-text-secondary">{t('create_class_subtitle')}</p>
                    </header>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('school_label')}</label>
                            <select
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-900"
                            >
                                <option value="">Veldu skóla...</option>
                                {availableSchools.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
                            </select>
                            <div className="mt-1 text-xs text-right text-gray-500">
                                {t('missing_school')} <a href="mailto:thorarinnhjalmarsson@gmail.com?subject=Vantar skóla á lista" className="text-blue-600 hover:underline">{t('contact_us_school')}</a>
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('section_label')}</label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    placeholder={t.raw('split_grade_desc').split(' ')[0]} // Using part of example or just generic placeholder? Let's use generic from t if possible, or keep simple
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
                            {loading && <Loader2 className="animate-spin" />}
                            <span>{t('create_btn')}</span>
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
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-6 relative">
                    <ProgressIndicator
                        currentStep={1}
                        totalSteps={2}
                        labels={['Velja aðferð', 'Ganga í bekk']}
                    />
                    <button onClick={() => {
                        if (isCreatingStudent) {
                            setIsCreatingStudent(false);
                            setError(null);
                        } else {
                            if (user) {
                                // If logged in, go back to dashboard/profile instead of 'select' mode
                                const segments = pathname.split('/');
                                const locale = segments[1] || 'is';
                                router.push(`/${locale}/user/profile`);
                            } else {
                                setFoundClass(null);
                                setStep('select');
                            }
                        }
                    }} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors font-medium flex items-center gap-1">
                        <ArrowRight className="rotate-180" size={16} />
                        Til baka
                    </button>

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

                            {user && (
                                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex gap-2 items-start text-left">
                                    <Globe size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>
                                        Ertu að leita að kóðanum þínum? <br />
                                        <a href={`/${pathname.split('/')[1] || 'is'}/dashboard`} className="underline font-bold hover:text-blue-900">
                                            Skoðaðu mælaborðið
                                        </a>
                                    </span>
                                </div>
                            )}

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
                                        className="w-full bg-[#4A7C9E] text-white py-3 rounded-xl font-bold hover:bg-[#2E5A75] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                                            className="px-4 py-3 bg-[#4A7C9E] text-white rounded-xl font-bold hover:bg-[#2E5A75] disabled:opacity-50 flex justify-center items-center gap-2"
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
