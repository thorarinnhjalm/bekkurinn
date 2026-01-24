'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Check, X, User } from 'lucide-react';
import type { ParentLink } from '@/types';

interface PendingApprovalsProps {
    classId: string;
    myStudentId?: string;
    isAdmin?: boolean;
}

export default function PendingApprovals({ classId, myStudentId, isAdmin }: PendingApprovalsProps) {
    const [requests, setRequests] = useState<(ParentLink & { requesterName?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRequests() {
            if (!classId) return;
            if (!isAdmin && !myStudentId) return;

            try {
                // Base query: All pending for this class
                let q = query(
                    collection(db, 'parentLinks'),
                    where('classId', '==', classId),
                    where('status', '==', 'pending')
                );

                // If not an admin, filter specifically to my student(s)
                if (!isAdmin && myStudentId) {
                    q = query(q, where('studentId', '==', myStudentId));
                }

                const snapshot = await getDocs(q);
                const pendingLinks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParentLink));

                // Fetch user details for each request to show name
                const enriched = await Promise.all(pendingLinks.map(async (link) => {
                    const userDoc = await getDoc(doc(db, 'users', link.userId));
                    const userData = userDoc.data();
                    return {
                        ...link,
                        requesterName: userData?.displayName || userData?.email || 'Óþekktur notandi'
                    };
                }));

                setRequests(enriched);
            } catch (error) {
                console.error("Error fetching pending approvals:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRequests();
    }, [classId, myStudentId]);

    const handleApprove = async (linkId: string) => {
        setProcessingId(linkId);
        try {
            await updateDoc(doc(db, 'parentLinks', linkId), {
                status: 'approved',
                approvedAt: new Date(), // Firestore converts JS Date to Timestamp usually, or use serverTimestamp if imported
            });
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== linkId));
        } catch (error) {
            console.error("Error approving:", error);
            alert("Error approving request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeny = async (linkId: string) => {
        if (!confirm("Ertu viss um að þú viljir hafna þessari beiðni?")) return;
        setProcessingId(linkId);
        try {
            await deleteDoc(doc(db, 'parentLinks', linkId));
            setRequests(prev => prev.filter(r => r.id !== linkId));
        } catch (error) {
            console.error("Error denying:", error);
            alert("Error rejecting request.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return null; // Don't show anything while checking
    if (requests.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <User size={20} />
                Beiðnir um aðgang ({requests.length})
            </h3>
            <div className="space-y-3">
                {requests.map(req => (
                    <div key={req.id} className="bg-white p-3 rounded-lg border border-amber-100 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="font-medium text-gray-900">{req.requesterName}</p>
                            <p className="text-xs text-gray-500">Vill tengjast barninu þínu</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleApprove(req.id)}
                                disabled={!!processingId}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Samþykkja"
                            >
                                {processingId === req.id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                            </button>
                            <button
                                onClick={() => handleDeny(req.id)}
                                disabled={!!processingId}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Hafna"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
