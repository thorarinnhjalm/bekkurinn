/**
 * Environment-Aware Logger
 * 
 * Provides conditional logging based on environment.
 * - Debug logs only in development
 * - Errors always logged (for production monitoring)
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    /**
     * Debug-level logs (verbose, only in development)
     */
    debug: isDevelopment ? console.log : () => { },

    /**
     * Info-level logs (important but not critical)
     */
    info: isDevelopment ? console.info : () => { },

    /**
     * Warning logs (always logged)
     */
    warn: console.warn,

    /**
     * Error logs (always logged, can be sent to monitoring service)
     */
    error: (message: string, error?: Error | unknown) => {
        console.error(message, error);

        // TODO: Send to error tracking service in production
        // if (!isDevelopment && typeof window !== 'undefined') {
        //     Sentry.captureException(error, { extra: { message } });
        // }
    },
};

/**
 * Performance timer for development debugging
 */
export function createTimer(label: string) {
    if (!isDevelopment) return { end: () => { } };

    const start = performance.now();
    return {
        end: () => {
            const duration = performance.now() - start;
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        },
    };
}
