import { NextResponse } from 'next/server';

const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY;
const PLAUSIBLE_SITE_ID = process.env.NEXT_PUBLIC_PLAUSIBLE_SITE_ID || 'bekkurinn.is';

export async function GET() {
    if (!PLAUSIBLE_API_KEY) {
        return NextResponse.json(
            { error: 'Plausible API key not configured' },
            { status: 503 }
        );
    }

    try {
        // Fetch aggregate stats for the last 30 days
        const aggregateResponse = await fetch(
            `https://plausible.io/api/v1/stats/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=30d&metrics=visitors,pageviews,bounce_rate,visit_duration`,
            {
                headers: {
                    'Authorization': `Bearer ${PLAUSIBLE_API_KEY}`,
                },
                next: { revalidate: 300 } // Cache for 5 minutes
            }
        );

        if (!aggregateResponse.ok) {
            throw new Error(`Plausible API error: ${aggregateResponse.status}`);
        }

        const aggregateData = await aggregateResponse.json();

        // Fetch top pages
        const pagesResponse = await fetch(
            `https://plausible.io/api/v1/stats/breakdown?site_id=${PLAUSIBLE_SITE_ID}&period=30d&property=event:page&limit=5`,
            {
                headers: {
                    'Authorization': `Bearer ${PLAUSIBLE_API_KEY}`,
                },
                next: { revalidate: 300 }
            }
        );

        let topPages = [];
        if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json();
            topPages = pagesData.results || [];
        }

        // Fetch realtime visitors
        const realtimeResponse = await fetch(
            `https://plausible.io/api/v1/stats/realtime/visitors?site_id=${PLAUSIBLE_SITE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${PLAUSIBLE_API_KEY}`,
                },
                next: { revalidate: 30 } // Cache for 30 seconds
            }
        );

        let realtimeVisitors = 0;
        if (realtimeResponse.ok) {
            realtimeVisitors = await realtimeResponse.json();
        }

        return NextResponse.json({
            period: '30d',
            aggregate: aggregateData.results,
            topPages,
            realtimeVisitors,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Plausible API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
