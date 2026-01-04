'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default function TestPage() {
    const [status, setStatus] = useState('Testing...');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function test() {
            try {
                setStatus('Connecting to Firestore...');

                // Test basic connection
                const classesRef = collection(db, 'classes');
                setStatus('Fetching classes...');

                const snapshot = await getDocs(classesRef);
                setStatus('Success!');

                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setData(docs);
            } catch (err: any) {
                setStatus('Error!');
                setError({
                    message: err.message,
                    code: err.code,
                    stack: err.stack
                });
            }
        }

        test();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Firestore Connection Test</h1>

            <h2>Status: {status}</h2>

            {error && (
                <div style={{ background: '#fee', padding: '1rem', marginTop: '1rem' }}>
                    <h3>Error:</h3>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {data && (
                <div style={{ background: '#efe', padding: '1rem', marginTop: '1rem' }}>
                    <h3>Data Retrieved ({data.length} documents):</h3>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}

            <div style={{ marginTop: '2rem', background: '#eef', padding: '1rem' }}>
                <h3>Environment Check:</h3>
                <pre>
                    API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing'}<br />
                    Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '✗ Missing'}<br />
                    Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '✗ Missing'}
                </pre>
            </div>
        </div>
    );
}
