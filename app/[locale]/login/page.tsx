'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogIn, Users, Calendar, MessageSquare, Shield } from 'lucide-react';
import Image from 'next/image';

/**
 * Login Page - Bekkurinn
 * 
 * Landing page with Google sign-in
 * Nordic minimalist design with clear value propositions
 */

export default function LoginPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to directory if already logged in
        if (user && !loading) {
            router.push('/is/directory');
        }
    }, [user, loading, router]);

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-lg" style={{ color: 'var(--sage-green)' }}>
                    Hleður...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--paper)' }}>

            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--sage-green)' }}>
                            <Users size={40} color="white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold" style={{ color: 'var(--sage-green)' }}>
                            Bekkurinn
                        </h1>
                        <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                            Sameiginleg skrá bekkjarins
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="nordic-card p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                        Allt sem þú þarft fyrir bekkinn
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}>
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium">Sameiginleg skrá</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Upplýsingar um öll börnin og foreldra
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}>
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium">Dagatal</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Afmæli, viðburðir og foreldrarölt
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}>
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium">Auglýsingatafla</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Tilkynningar frá bekkjarformönnum
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium">Persónuvernd</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    GDPR-samþykkt með fullri gagnavernd
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign In Button */}
                <div className="space-y-4">
                    <button
                        onClick={handleSignIn}
                        className="nordic-button w-full justify-center gap-3 py-4 text-lg"
                    >
                        <LogIn size={24} />
                        <span>Skrá inn með Google</span>
                    </button>

                    <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                        Með því að skrá þig inn samþykkir þú að fara með allar<br />
                        upplýsingar með fullum trúnaði
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <p>Fyrir foreldra í grunnskólum á Íslandi</p>
                </div>
            </div>
        </div>
    );
}
