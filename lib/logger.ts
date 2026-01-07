/**
 * Logger Utility for Bekkurinn
 * 
 * Conditional logging that respects environment.
 * Only shows logs in development mode.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private isDev = process.env.NODE_ENV === 'development';

    info(...args: any[]) {
        if (this.isDev) {
            console.log('[INFO]', ...args);
        }
    }

    warn(...args: any[]) {
        if (this.isDev) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args: any[]) {
        // Always log errors, even in production
        console.error('[ERROR]', ...args);
    }

    debug(...args: any[]) {
        if (this.isDev) {
            console.log('[DEBUG]', ...args);
        }
    }

    // Special security logger - always logs but sanitizes
    security(message: string, data?: Record<string, any>) {
        const sanitized = data ? {
            ...data,
            // Remove sensitive fields
            password: undefined,
            token: undefined,
            apiKey: undefined,
        } : {};

        console.error('[SECURITY]', message, sanitized);
    }
}

export const logger = new Logger();
