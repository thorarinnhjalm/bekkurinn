import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, getClientIp } from '../lib/rate-limit';

describe('Rate Limiting', () => {
    describe('rateLimit', () => {
        it('allows requests within limit', async () => {
            const identifier = `test-${Date.now()}`;
            const result = await rateLimit(identifier, 5, 60000);

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it('tracks remaining requests correctly', async () => {
            const identifier = `test-track-${Date.now()}`;

            await rateLimit(identifier, 5, 60000);
            const result = await rateLimit(identifier, 5, 60000);

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(3);
        });

        it('blocks requests after limit exceeded', async () => {
            const identifier = `test-block-${Date.now()}`;
            const limit = 3;

            // Use up the limit
            for (let i = 0; i < limit; i++) {
                await rateLimit(identifier, limit, 60000);
            }

            // This should be blocked
            const result = await rateLimit(identifier, limit, 60000);

            expect(result.success).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.resetAt).toBeDefined();
        });

        it('uses custom limit and window', async () => {
            const identifier = `test-custom-${Date.now()}`;
            const result = await rateLimit(identifier, 100, 1000);

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(99);
        });
    });

    describe('getClientIp', () => {
        it('extracts IP from x-forwarded-for header', () => {
            const mockRequest = {
                headers: {
                    get: (name: string) => {
                        if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
                        return null;
                    }
                }
            } as unknown as Request;

            const ip = getClientIp(mockRequest);
            expect(ip).toBe('192.168.1.1');
        });

        it('extracts IP from x-real-ip header', () => {
            const mockRequest = {
                headers: {
                    get: (name: string) => {
                        if (name === 'x-real-ip') return '10.0.0.5';
                        return null;
                    }
                }
            } as unknown as Request;

            const ip = getClientIp(mockRequest);
            expect(ip).toBe('10.0.0.5');
        });

        it('returns "unknown" when no IP headers present', () => {
            const mockRequest = {
                headers: {
                    get: () => null
                }
            } as unknown as Request;

            const ip = getClientIp(mockRequest);
            expect(ip).toBe('unknown');
        });

        it('handles multiple IPs in x-forwarded-for', () => {
            const mockRequest = {
                headers: {
                    get: (name: string) => {
                        if (name === 'x-forwarded-for') return '  203.0.113.50  , 198.51.100.178, 192.0.2.1';
                        return null;
                    }
                }
            } as unknown as Request;

            const ip = getClientIp(mockRequest);
            expect(ip).toBe('203.0.113.50');
        });
    });
});
