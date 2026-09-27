'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Firebase Connection Test Component
 * Displays connection status in the UI
 */

export function FirebaseStatus() {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const testConnection = async () => {
            try {
                // Try to read from Firestore (will fail gracefully if no collections exist)
                await getDocs(collection(db, 'classes'));
                setStatus('connected');
            } catch (err) {
                // Even permission errors mean we're connected
                const errCode = err instanceof Error && 'code' in err ? (err as Error & { code: string }).code : '';
                const errMsg = err instanceof Error ? err.message : '';
                if (errCode === 'permission-denied' || errMsg.includes('permission')) {
                    setStatus('connected');
                } else {
                    setStatus('error');
                    setError(errMsg);
                }
            }
        };

        testConnection();
    }, []);

    if (status === 'checking') {
        return (
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <span className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse"
                    style={{ backgroundColor: 'var(--amber)' }} />
                Tengist Firebase...
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-xs" style={{ color: 'var(--red)' }}>
                <span className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: 'var(--red)' }} />
                Firebase villa: {error}
            </div>
        );
    }

    return (
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: 'var(--green-success)' }} />
            Firebase tengt ✓
        </div>
    );
}
