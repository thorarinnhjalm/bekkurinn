'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { approveParentLink, deleteParentLink, getUser, getClass } from '@/services/firestore';
import type { ParentLink } from '@/types';

interface ApprovalsTabProps {
    initialPendingLinks: ParentLink[];
    onRefresh: () => void;
}

export default function ApprovalsTab({ initialPendingLinks, onRefresh }: ApprovalsTabProps) {
    const [pendingLinks, setPendingLinks] = useState(initialPendingLinks);
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const handleApprove = async (link: ParentLink) => {
        setProcessingIds(prev => [...prev, link.id]);
        try {
            await approveParentLink(link.id, 'admin-console');
            setPendingLinks(prev => prev.filter(l => l.id !== link.id));
            onRefresh();
        } catch (error) {
            alert('Error approving');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== link.id));
        }
    };

    const handleReject = async (link: ParentLink) => {
        if (!confirm('Ertu viss um að þú viljir hafna þessari beiðni?')) return;

        setProcessingIds(prev => [...prev, link.id]);
        try {
            await deleteParentLink(link.id);
            setPendingLinks(prev => prev.filter(l => l.id !== link.id));
            onRefresh();
        } catch (error) {
            alert('Error rejecting');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== link.id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-5xl mx-auto">
            <div className="professional-card p-6">
                <div className="mb-6">
                    <h3 className="font-bold text-2xl text-gray-900">Samþykktir foreldra</h3>
                    <p className="text-gray-600 mt-2">
                        Hér eru öll pending foreldra sem bíða samþykktar til að fá aðgang að bekk barns síns.
                    </p>
                </div>

                {pendingLinks.length > 0 ? (
                    <div className="space-y-3">
                        {pendingLinks.map(link => (
                            <PendingApprovalRow
                                key={link.id}
                                link={link}
                                isProcessing={processingIds.includes(link.id)}
                                onApprove={() => handleApprove(link)}
                                onReject={() => handleReject(link)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <p className="text-xl font-bold text-gray-900">No pending approvals!</p>
                        <p className="text-gray-600 mt-2">Allar beiðnir hafa verið afgreiddar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PendingApprovalRow({
    link,
    isProcessing,
    onApprove,
    onReject
}: {
    link: ParentLink;
    isProcessing: boolean;
    onApprove: () => void;
    onReject: () => void;
}) {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [classInfo, setClassInfo] = useState<any>(null);

    // Fetch user and class info
    useState(() => {
        getUser(link.userId).then(setUserInfo);
        getClass(link.classId).then(setClassInfo);
    });

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-nordic-blue transition-colors">
            <div className="flex-1">
                <div className="font-bold text-gray-900">
                    {userInfo?.displayName || 'Loading...'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {userInfo?.email} • {classInfo?.name || 'Loading class...'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Beiðni send: {link.createdAt?.toDate?.().toLocaleDateString('is-IS')}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {isProcessing ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Check size={16} />
                    )}
                    Samþykkja
                </button>
                <button
                    onClick={onReject}
                    disabled={isProcessing}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <X size={16} />
                    Hafna
                </button>
            </div>
        </div>
    );
}
