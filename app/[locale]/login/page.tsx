'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogIn, Users, Shield, Check, X } from 'lucide-react';
import { ExitIntentPopup } from '@/components/ExitIntentPopup';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';

/**
 * Login Page - Bekkurinn
 * 
 * Landing page with Google sign-in and Email auth.
 * Nordic minimalist design with clear value propositions and privacy explanation.
 * Centered layout as per user request.
 */

export default function LoginPage() {
    const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = (params.locale as string) || 'is';
    const returnTo = searchParams.get('returnTo');

    const [isIAB, setIsIAB] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent;
        if (ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram') || ua.includes('Messenger')) {
            setIsIAB(true);
        }
    }, []);

    const [loginMethod, setLoginMethod] = useState<'social' | 'email'>('social');
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mailLoading, setMailLoading] = useState(false);

    useEffect(() => {
        // Redirect to dashboard if already logged in
        if (user && !loading) {
            if (returnTo) {
                router.push(returnTo);
            } else {
                router.push(`/${locale}/dashboard`);
            }
        }
    }, [user, loading, router, returnTo, locale]);

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
            setError('Innskráning mistókst.');
        }
    };

    const handleEmailAuth = async () => {
        if (!email || !password) {
            setError('Vinsamlegast fylltu út öll svæði.');
            return;
        }

        setMailLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                await signInWithEmail(email, password);
            } else {
                if (!name) {
                    setError('Vinsamlegast skráðu nafn.');
                    setMailLoading(false);
                    return;
                }
                await signUpWithEmail(email, password, name);
            }
        } catch (err: any) {
            console.error(err);
            // Handle Firebase Auth errors
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Rangt netfang eða lykilorð.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Netfangið er þegar í notkun.');
            } else if (err.code === 'auth/weak-password') {
                setError('Lykilorðið er of stutt (lágmark 6 stafir).');
            } else {
                setError('Villa kom upp. Vinsamlegast reyndu aftur.');
            }
        } finally {
            setMailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-lg" style={{ color: 'var(--nordic-blue)' }}>
                    Hleður...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface flex-col gap-4">
            {isIAB && (
                <div className="w-full max-w-md bg-tertiary-fixed/40 border border-tertiary/40 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <span className="text-xl">⚠️</span>
                    <div className="text-sm text-on-tertiary-fixed">
                        <p className="font-bold">In-App vafri greindur</p>
                        <p className="">Google innskráning gæti hrunið hér. Mælt er með að opna þessa síðu í <strong>Safari</strong> eða <strong>Chrome</strong> fyrir bestu upplifun.</p>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary shadow-md">
                            <Users size={40} color="white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-on-surface">
                            Bekkurinn
                        </h1>
                        <p className="text-lg mt-2 text-on-surface-variant">
                            Hættu að leita í Excel-skrám og Facebook-hópum
                        </p>
                        <p className="text-sm mt-2 text-on-surface-variant">
                            Bekkjarlisti • Afmæli • Óskilamunir • Viðburðir — allt á einum stað
                        </p>
                    </div>
                </div>

                {/* Explanatory Box (Why Login?) - CENTERED REDESIGN */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 space-y-6">
                    <h2 className="text-xl font-bold text-center text-on-surface">
                        Af hverju að skrá sig inn?
                    </h2>

                    <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-primary-container/15 rounded-full text-primary mb-1">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-on-surface mb-1">Öryggi og Persónuvernd</p>
                                <p className="max-w-xs mx-auto">Við biðjum um innskráningu til að tryggja öryggi upplýsinga um börn og foreldra. Aðeins staðfestir foreldrar fá aðgang.</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-primary-container/15 rounded-full text-primary mb-1">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-on-surface mb-1">Einn aðgangur</p>
                                <p className="max-w-xs mx-auto">Þú getur séð alla bekkina þína á einum stað og samnýtt upplýsingar með öðrum foreldrum.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Method Toggle */}
                <div className="bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/30 flex shadow-sm">
                    <button
                        onClick={() => setLoginMethod('social')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'social' ? 'bg-primary-container/15 text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Google
                    </button>
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-primary-container/15 text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Netfang
                    </button>
                </div>

                {loginMethod === 'social' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        {error && (
                            <div className="bg-error-container/40 text-error p-3 rounded-lg text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        <button
                            onClick={handleSignIn}
                            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-sm"
                        >
                            <LogIn size={24} />
                            <span>Skrá inn með Google</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        {error && (
                            <div className="bg-error-container/40 text-error p-3 rounded-lg text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1">Netfang</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1">Lykilorð</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-on-surface mb-1">Nafn</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                    placeholder="Jón Jónsson"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleEmailAuth}
                            disabled={mailLoading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-container transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg active:scale-[0.98]"
                        >
                            {mailLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {mode === 'login' ? 'Skrá inn' : 'Nýskráning (Sign up)'}
                        </button>

                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError(null);
                            }}
                            className="w-full text-sm text-on-surface-variant hover:text-on-surface py-2 transition-colors"
                        >
                            {mode === 'login' ? 'Vantar þig aðgang? Nýskráning' : 'Áttu aðgang? Skráðu þig inn'}
                        </button>
                    </div>
                )}

                <p className="text-xs text-center text-on-surface-variant">
                    Með því að skrá þig inn samþykkir þú{' '}
                    <a href={`/${locale}/terms`} className="underline hover:text-on-surface-variant">
                        notkunarskilmála
                    </a>{' '}
                    og{' '}
                    <a href={`/${locale}/privacy`} className="underline hover:text-on-surface-variant">
                        persónuverndarstefnu
                    </a>{' '}
                    okkar
                </p>

                {/* Why not Facebook? Comparison Section */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-center text-on-surface">
                        Af hverju ekki Facebook?
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                            <div className="font-semibold text-on-surface-variant text-center pb-2 border-b border-outline-variant/30">
                                Facebook hópar
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant">
                                <X size={16} className="text-error/70 flex-shrink-0" />
                                <span>Upplýsingar týnast í straumi</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant">
                                <X size={16} className="text-error/70 flex-shrink-0" />
                                <span>Erfitt að finna símanúmer</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant">
                                <X size={16} className="text-error/70 flex-shrink-0" />
                                <span>Engin afmælisáminnning</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant">
                                <X size={16} className="text-error/70 flex-shrink-0" />
                                <span>Auglýsingar og truflun</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="font-semibold text-primary text-center pb-2 border-b border-primary/20">
                                Bekkurinn
                            </div>
                            <div className="flex items-center gap-2 text-on-surface">
                                <Check size={16} className="text-primary flex-shrink-0" />
                                <span>Allt skipulagt á einum stað</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface">
                                <Check size={16} className="text-primary flex-shrink-0" />
                                <span>Bekkjarlisti með símum</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface">
                                <Check size={16} className="text-primary flex-shrink-0" />
                                <span>Sjálfvirk afmælisáminnning</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface">
                                <Check size={16} className="text-primary flex-shrink-0" />
                                <span>Engar auglýsingar, aldrei</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Carousel */}
                <TestimonialsCarousel maxCount={5} />

                {/* Footer */}
                <div className="text-center text-sm text-on-surface-variant space-y-2">
                    <p>Fyrir foreldra í grunnskólum á Íslandi</p>
                    <div className="flex items-center justify-center gap-4">
                        <a href={`/${locale}/how-it-works`} className="hover:text-on-surface-variant transition-colors">
                            Hvernig virkar þetta?
                        </a>
                        <span>•</span>
                        <a href={`/${locale}/contact`} className="hover:text-on-surface-variant transition-colors">
                            Hafðu samband
                        </a>
                    </div>
                </div>
            </div>

            {/* Exit Intent Popup */}
            <ExitIntentPopup
                onSignUp={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    handleSignIn();
                }}
            />
        </div>
    );
}
