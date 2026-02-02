'use client';

import { useState, useEffect } from 'react';
import { X, Star, Send, Heart } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createTestimonial, hasUserSubmittedTestimonial } from '@/services/firestore';
import { useTranslations } from 'next-intl';

interface TestimonialPromptProps {
    /** Minimum days since signup before showing prompt */
    minDaysActive?: number;
    /** Show only once per session */
    oncePerSession?: boolean;
}

export function TestimonialPrompt({ minDaysActive = 7, oncePerSession = true }: TestimonialPromptProps) {
    const t = useTranslations('testimonials');
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [text, setText] = useState('');
    // Initial role needs to be localized, but useTranslations hook can't be used in useState initializer typically if static?
    // Actually it's fine inside component.
    // However, we want to store the *English* or *Key* in DB? Or just the string?
    // The previous implementation stored the localized string. 
    // To keep it simple, we'll default to the first key's translation.
    const [role, setRole] = useState('');

    useEffect(() => {
        if (!role) setRole(t('role_parent'));
    }, [t, role]);
    // We will set this in useEffect to valid localized string if needed, or just use English key internally?
    // Admin view expects string. Let's just initialize with empty or update in useEffect.

    // Better: Allow role to be the translation key internally? 
    // No, existing database has "Parent", "Foreldri" etc. 
    // Let's stick to storing the localized string for display, OR change AdminView to display keys.
    // Given the request, "er það ekki?", user wants localized UI. 
    // I will initialize role with t('role_parent') in a useEffect to avoid hydration mismatch if possible, 
    // or just use 'Parent' as default and let user switch?
    // Let's use a useEffect to set default role to localized 'Parent'

    const [schoolName, setSchoolName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkIfShouldShow();
    }, [user]);

    const checkIfShouldShow = async () => {
        if (!user) return;

        // Check session storage
        if (oncePerSession && sessionStorage.getItem('testimonialPromptShown')) {
            return;
        }

        // Check if user already submitted
        const hasSubmitted = await hasUserSubmittedTestimonial(user.uid);
        if (hasSubmitted) return;

        // Check if user has been active long enough (using createdAt from user metadata)
        // For now, we'll use a simple localStorage check
        const firstVisit = localStorage.getItem('bekkurinn_first_visit');
        if (!firstVisit) {
            localStorage.setItem('bekkurinn_first_visit', Date.now().toString());
            return;
        }

        const daysSinceFirst = (Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24);
        if (daysSinceFirst < minDaysActive) return;

        // Random chance to show (don't annoy users every time)
        if (Math.random() > 0.3) return;

        // Show the prompt
        setIsVisible(true);
        if (oncePerSession) {
            sessionStorage.setItem('testimonialPromptShown', 'true');
        }
    };

    const handleSubmit = async () => {
        if (!user || rating === 0 || text.trim().length < 10) {
            setError(t('error_stars'));
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createTestimonial({
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userRole: role,
                schoolName: schoolName || undefined,
                text: text.trim(),
                rating,
            });
            setIsSubmitted(true);
        } catch (err) {
            setError(t('error_generic'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Loka"
                >
                    <X size={20} />
                </button>

                {isSubmitted ? (
                    // Thank you state
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-green-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('thank_you_title')}</h2>
                        <p className="text-gray-600 mb-6">
                            {t('thank_you_desc')}
                        </p>
                        <button
                            onClick={handleClose}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                ) : (
                    // Form state
                    <div className="space-y-5">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {t('prompt_title')}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {t('prompt_subtitle')}
                            </p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Text Input */}
                        <div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={t('placeholder')}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 text-sm"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-400 text-right mt-1">{text.length}/500</p>
                        </div>

                        {/* Role Selection */}
                        <div className="flex gap-2">
                            {['role_parent', 'role_class_rep', 'role_teacher'].map((rKey) => (
                                <button
                                    key={rKey}
                                    type="button"
                                    onClick={() => setRole(t(rKey))}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${role === t(rKey)
                                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                        }`}
                                >
                                    {t(rKey)}
                                </button>
                            ))}
                        </div>

                        {/* School Name (optional) */}
                        <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            placeholder={t('school_optional')}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />

                        {/* Error */}
                        {error && (
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} />
                                    {t('submit')}
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
                        >
                            {t('later')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
