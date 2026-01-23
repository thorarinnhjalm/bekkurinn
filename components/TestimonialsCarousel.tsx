'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { getApprovedTestimonials } from '@/services/firestore';
import type { Testimonial } from '@/types';

interface TestimonialsCarouselProps {
    maxCount?: number;
}

export function TestimonialsCarousel({ maxCount = 5 }: TestimonialsCarouselProps) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTestimonials() {
            try {
                const data = await getApprovedTestimonials(maxCount);
                setTestimonials(data);
            } catch (error) {
                console.error('Failed to fetch testimonials:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTestimonials();
    }, [maxCount]);

    // Auto-rotate testimonials
    useEffect(() => {
        if (testimonials.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const goToPrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? testimonials.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    // Don't render if loading or no testimonials
    if (isLoading || testimonials.length === 0) {
        return null;
    }

    const current = testimonials[currentIndex];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6 space-y-4 relative overflow-hidden">
            {/* Decorative quote */}
            <Quote
                size={80}
                className="absolute top-2 right-2 text-blue-100 opacity-50 -rotate-12"
            />

            <h3 className="text-lg font-bold text-center text-gray-900 relative z-10">
                Hvað segja aðrir foreldrar?
            </h3>

            <div className="relative z-10 min-h-[140px] flex flex-col justify-center">
                {/* Testimonial Content */}
                <div
                    key={current.id}
                    className="animate-in fade-in duration-500 space-y-3"
                >
                    {/* Stars */}
                    <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={18}
                                className={`${
                                    star <= current.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-700 text-center text-sm italic leading-relaxed">
                        "{current.text}"
                    </p>

                    {/* Author */}
                    <div className="text-center">
                        <p className="font-semibold text-gray-900 text-sm">
                            {current.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {current.userRole}
                            {current.schoolName && ` • ${current.schoolName}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            {testimonials.length > 1 && (
                <div className="flex items-center justify-center gap-4 relative z-10">
                    <button
                        onClick={goToPrevious}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Fyrri umsögn"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Dots */}
                    <div className="flex gap-1.5">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentIndex
                                        ? 'bg-blue-600 w-4'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Umsögn ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={goToNext}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Næsta umsögn"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
