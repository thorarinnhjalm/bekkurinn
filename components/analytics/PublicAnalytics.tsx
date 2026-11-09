'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Analytics } from '@vercel/analytics/next';
import { auth } from '@/lib/firebase/config';

/**
 * Vercel Web Analytics á opnum síðum.
 *
 * Mælingin fer aðeins í gang þegar staðfest er að enginn er innskráður.
 * Sé einhver innskráður (t.d. gömul lota í vafra) er ekkert mælt, og það
 * sama gildir þar til innskráningarstaðan er þekkt.
 */
export function PublicAnalytics() {
    const [signedOut, setSignedOut] = useState(false);

    useEffect(() => {
        return onAuthStateChanged(
            auth,
            (user) => setSignedOut(user === null),
            () => setSignedOut(false)
        );
    }, []);

    if (!signedOut) return null;
    return <Analytics />;
}
