import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { locales } from '@/i18n-config';
import { CLOSED_APP_SEGMENTS, closedPageRedirect, isClosedApi } from '@/lib/closedRoutes';

// next-intl middleware er hermt: prófið snýst um hvað er stöðvað ÁÐUR en það tekur við.
vi.mock('next-intl/middleware', () => ({
    default: () => () => new Response('intl', { status: 200, headers: { 'x-test': 'intl' } }),
}));

import middleware, { config } from '@/middleware';

const MARKETING = [
    '',
    '/how-it-works',
    '/samanburdur',
    '/bekkjarsattmali',
    '/foreldrarolt',
    '/handbok',
    '/handbok/bekkjarsattmali',
    '/handbok/hlutverk',
    '/handbok/log-og-reglur',
    '/handbok/personuvernd',
    '/handbok/vidburdir',
    '/contact',
    '/privacy',
    '/terms',
];

const API_ROUTES = [
    '/api/translate',
    '/api/notifications/fan-out',
    '/api/send-critical-announcement',
    '/api/proxy-calendar',
    '/api/plausible-stats',
    '/api/cron/reminders',
];

describe('closedPageRedirect', () => {
    it('vísar hverri lokaðri leið á forsíðu sama tungumáls, á öllum tungumálum', () => {
        for (const locale of locales) {
            for (const segment of CLOSED_APP_SEGMENTS) {
                expect(closedPageRedirect(`/${locale}/${segment}`)).toBe(`/${locale}`);
                expect(closedPageRedirect(`/${locale}/${segment}/`)).toBe(`/${locale}`);
                expect(closedPageRedirect(`/${locale}/${segment}/eitthvad/dypra`)).toBe(`/${locale}`);
            }
        }
    });

    it('vísar slóð án tungumáls á íslensku forsíðuna', () => {
        expect(closedPageRedirect('/login')).toBe('/is');
        expect(closedPageRedirect('/dashboard')).toBe('/is');
        expect(closedPageRedirect('/user/profile')).toBe('/is');
    });

    it('lætur ekki blekkjast af hástöfum eða kóðuðum stöfum', () => {
        expect(closedPageRedirect('/is/Login')).toBe('/is');
        expect(closedPageRedirect('/is/%6Cogin')).toBe('/is');
        expect(closedPageRedirect('/is//onboarding')).toBe('/is');
        expect(closedPageRedirect('/is/dashboard.segments/_tree.segment.rsc')).toBe('/is');
        expect(closedPageRedirect('/is/dashboard.rsc')).toBe('/is');
        expect(closedPageRedirect('/is/dashboard%2Fx')).toBe('/is');
    });

    it('snertir ekki kynningarsíðurnar', () => {
        expect(closedPageRedirect('/')).toBeNull();
        for (const locale of locales) {
            for (const path of MARKETING) {
                expect(closedPageRedirect(`/${locale}${path}`)).toBeNull();
            }
        }
    });

    it('lokar ekki síðum sem byrja eins og lokuð leið eða hafa hana dýpra í slóðinni', () => {
        expect(closedPageRedirect('/is/handbok/settings')).toBeNull();
        expect(closedPageRedirect('/is/loginn')).toBeNull();
        expect(closedPageRedirect('/is/calendar-info')).toBeNull();
    });
});

describe('isClosedApi', () => {
    it('lokar öllum API-slóðum', () => {
        for (const path of API_ROUTES) expect(isClosedApi(path)).toBe(true);
        expect(isClosedApi('/api')).toBe(true);
        expect(isClosedApi('/API/translate')).toBe(true);
    });

    it('snertir ekki síður', () => {
        expect(isClosedApi('/')).toBe(false);
        expect(isClosedApi('/is')).toBe(false);
        expect(isClosedApi('/is/apix')).toBe(false);
        expect(isClosedApi('/apiary')).toBe(false);
    });
});

describe('middleware', () => {
    const run = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
        middleware(new NextRequest(`https://www.bekkurinn.is${path}`, init));

    it('svarar 410 á öllum API-slóðum, líka POST með auðkenni', async () => {
        for (const path of API_ROUTES) {
            for (const method of ['GET', 'POST']) {
                const res = run(path, { method, headers: { authorization: 'Bearer eitthvad' } });
                expect(res.status).toBe(410);
                expect(res.headers.get('x-test')).toBeNull();
            }
        }
    });

    it('vísar innskráningu, nýskráningu og app-leiðum tímabundið á forsíðuna og fellir niður fyrirspurn', () => {
        const res = run('/is/onboarding?step=join&code=SALA-4-B-1234&inviterId=abc');
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('https://www.bekkurinn.is/is');

        for (const segment of CLOSED_APP_SEGMENTS) {
            const r = run(`/en/${segment}`);
            expect(r.status).toBe(307);
            expect(r.headers.get('location')).toBe('https://www.bekkurinn.is/en');
        }
    });

    it('hleypir kynningarsíðum óbreyttum áfram í next-intl', () => {
        for (const path of ['/', '/is', '/is/handbok/personuvernd', '/pl/samanburdur', '/is/contact']) {
            const res = run(path);
            expect(res.status).toBe(200);
            expect(res.headers.get('x-test')).toBe('intl');
        }
    });

    it('matcher nær yfir API-slóðir', () => {
        expect(config.matcher).toContain('/api/:path*');
    });
});
