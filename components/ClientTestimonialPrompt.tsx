'use client';

import { TestimonialPrompt } from './TestimonialPrompt';

/**
 * Client-side wrapper for TestimonialPrompt
 * Use this in server components/layouts
 */
export function ClientTestimonialPrompt() {
    return <TestimonialPrompt minDaysActive={7} oncePerSession={true} />;
}
