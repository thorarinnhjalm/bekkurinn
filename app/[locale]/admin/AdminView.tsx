'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, School, Users, Shield, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SUPER_ADMINS = [
    'thorarinnhjalmarsson@gmail.com', // Giska á þetta út frá path
    'hallo@bekkurinn.is'
];

interface ClassData {
    id: string;
    schoolName: string;
    name: string;
    grade: number;
    section?: string;
    joinCode?: string;
    admins: string[];
}

export default function AdminView() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [fetching, setFetching] = useState(true);
    const [expandedSchools, setExpandedSchools] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && user) {
            if (!SUPER_ADMINS.includes(user.email || '')) {
                // Not authorized
                // router.push('/is/dashboard'); 
                // Commented out for dev ease, un-comment for prod
            }
            fetchClasses();
        }
    }, [user, loading, router]);

    const fetchClasses = async () => {
        try {
            const q = query(collection(db, 'classes'), orderBy('schoolName'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
            setClasses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    // Group by school
    const schools = classes.reduce((acc, cls) => {
        const school = cls.schoolName || 'Óþekktur skóli';
        if (!acc[school]) acc[school] = [];
        acc[school].push(cls);
        return acc;
    }, {} as Record<string, ClassData[]>);

    const toggleSchool = (school: string) => {
        setExpandedSchools(prev =>
            prev.includes(school) ? prev.filter(s => s !== school) : [...prev, school]
        );
    };

    if (loading || fetching) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;

    if (!user || (!SUPER_ADMINS.includes(user.email || ''))) {
        return (
            <div className="p-8 text-center text-red-600">
                <Shield className="mx-auto mb-4" size={48} />
                <h1 className="text-2xl font-bold">Aðgangur bannaður</h1>
                <p>Þú hefur ekki réttindi til að skoða þessa síðu ({user?.email}).</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <header className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kerfisstjórn</h1>
                    <p className="text-gray-500">Yfirlit yfir alla skóla og bekki</p>
                </div>
                <button
                    onClick={() => router.push('/is/dashboard')}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    <Users size={20} />
                    Fara í mitt Mælaborð
                </button>
            </header>

            <div className="grid gap-4">
                {Object.entries(schools).map(([schoolName, schoolClasses]) => {
                    const isExpanded = expandedSchools.includes(schoolName);
                    return (
                        <div key={schoolName} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSchool(schoolName)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <School className="text-nordic-blue" />
                                    <span className="font-bold text-lg text-gray-800">{schoolName}</span>
                                    <span className="bg-white px-2 py-0.5 rounded text-xs border text-gray-500 font-mono">
                                        {schoolClasses.length} bekkir
                                    </span>
                                </div>
                                {isExpanded ? <ChevronDown className="text-gray-500" /> : <ChevronRight className="text-gray-500" />}
                            </button>

                            {isExpanded && (
                                <div className="p-0 divide-y divide-gray-100">
                                    {schoolClasses.map(cls => (
                                        <div key={cls.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>{cls.grade}. bekkur</span>
                                                    {cls.section && <span>• {cls.section}</span>}
                                                    <span>• {cls.admins.length} stjórnendur</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="bg-stone-100 px-3 py-1.5 rounded border flex items-center gap-2">
                                                    <span className="text-xs text-stone-500 uppercase font-bold">Boðskóði</span>
                                                    <code className="text-nordic-blue font-bold font-mono">{cls.joinCode || 'N/A'}</code>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(cls.joinCode || ''); alert('Afritað!') }}
                                                        className="text-gray-400 hover:text-nordic-blue"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
