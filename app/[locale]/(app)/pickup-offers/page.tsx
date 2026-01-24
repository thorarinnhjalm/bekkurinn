'use client';

import { useState, useEffect } from 'react';
import { Car, Plus, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPickupOffersForParent, getPickupOffersByParent } from '@/services/firestore';
import { CreatePickupOfferModal } from '@/components/modals/CreatePickupOfferModal';
import { PickupOfferCard } from '@/components/cards/PickupOfferCard';
import type { PickupOffer } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Pickup Offers Page
 * Peer-to-peer carpool coordination
 */

export default function PickupOffersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('pickup_offers');

    const [classId, setClassId] = useState<string | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentName, setStudentName] = useState<string>('');

    const [receivedOffers, setReceivedOffers] = useState<PickupOffer[]>([]);
    const [myOffers, setMyOffers] = useState<PickupOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);

    // Get user's class
    useEffect(() => {
        async function fetchUserClass() {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'classes'),
                    where('admins', 'array-contains', user.uid)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const sortedDocs = snapshot.docs.sort((a, b) => {
                        const tA = a.data().createdAt?.toMillis() || 0;
                        const tB = b.data().createdAt?.toMillis() || 0;
                        return tB - tA;
                    });
                    setClassId(sortedDocs[0].id);
                }
            } catch (error) {
                console.error('Error finding class:', error);
            }
        }
        if (!authLoading && user) fetchUserClass();
    }, [user, authLoading]);

    // Get user's student
    useEffect(() => {
        async function fetchUserStudent() {
            if (!user || !classId) return;
            try {
                // Get parent link for this user/class
                const linksQuery = query(
                    collection(db, 'parentLinks'),
                    where('userId', '==', user.uid),
                    where('classId', '==', classId),
                    where('status', '==', 'approved')
                );
                const linksSnap = await getDocs(linksQuery);

                if (!linksSnap.empty) {
                    const linkData = linksSnap.docs[0].data();
                    setStudentId(linkData.studentId);

                    // Get student name
                    const studentQuery = query(
                        collection(db, 'students'),
                        where('__name__', '==', linkData.studentId)
                    );
                    const studentSnap = await getDocs(studentQuery);
                    if (!studentSnap.empty) {
                        setStudentName(studentSnap.docs[0].data().name);
                    }
                }
            } catch (error) {
                console.error('Error finding student:', error);
            }
        }
        fetchUserStudent();
    }, [user, classId]);

    // Fetch offers
    useEffect(() => {
        async function fetchOffers() {
            if (!user?.uid || !classId) return;

            setIsLoading(true);
            try {
                const [received, created] = await Promise.all([
                    getPickupOffersForParent(user.uid, classId),
                    getPickupOffersByParent(user.uid, classId),
                ]);

                setReceivedOffers(received);
                setMyOffers(created);
            } catch (error) {
                console.error('Error fetching offers:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchOffers();
    }, [user, classId]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [authLoading, user, router, locale]);

    const refreshOffers = async () => {
        if (!user?.uid || !classId) return;
        try {
            const [received, created] = await Promise.all([
                getPickupOffersForParent(user.uid, classId),
                getPickupOffersByParent(user.uid, classId),
            ]);
            setReceivedOffers(received);
            setMyOffers(created);
        } catch (error) {
            console.error('Error refreshing offers:', error);
        }
    };

    // Loading state
    if (authLoading || isLoading || !classId) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--nordic-blue)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-30 -z-10" />

                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{t('title')}</h1>
                    <p className="text-lg text-gray-500 max-w-lg">
                        {t('subtitle')}
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                >
                    <Plus size={20} />
                    {t('offer_help')}
                </button>
            </header>

            {/* Received Offers Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Car size={24} className="text-green-600" />
                    {t('received_offers')}
                </h2>

                {receivedOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {receivedOffers.map(offer => (
                            <PickupOfferCard
                                key={offer.id}
                                offer={offer}
                                currentUserId={user?.uid || ''}
                                currentUserName={user?.displayName || ''}
                                currentUserStudentId={studentId || undefined}
                                currentUserStudentName={studentName || undefined}
                                onUpdate={refreshOffers}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center bg-white/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('empty_received_title')}</h3>
                        <p className="text-gray-500">
                            {t('empty_received_desc')}
                        </p>
                    </div>
                )}
            </section>

            {/* My Offers Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('my_offers')}</h2>

                {myOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myOffers.map(offer => (
                            <PickupOfferCard
                                key={offer.id}
                                offer={offer}
                                currentUserId={user?.uid || ''}
                                currentUserName={user?.displayName || ''}
                                currentUserStudentId={studentId || undefined}
                                currentUserStudentName={studentName || undefined}
                                onUpdate={refreshOffers}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center bg-white/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Car className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('empty_created_title')}</h3>
                        <p className="text-gray-500 mb-4">
                            {t('empty_created_desc')}
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition"
                        >
                            {t('create_offer')}
                        </button>
                    </div>
                )}
            </section>

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePickupOfferModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        refreshOffers(); // Refresh after creating
                    }}
                    userId={user?.uid || ''}
                    userName={user?.displayName || ''}
                    studentId={studentId || ''}
                    classId={classId || ''}
                />
            )}
        </div>
    );
}
