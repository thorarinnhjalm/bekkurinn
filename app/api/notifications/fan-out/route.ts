import { NextRequest, NextResponse } from 'next/server';
import { getClassMemberUserIds, getSchoolMemberUserIds, getClass, getSchool } from '@/services/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { rateLimit, getClientIpFromNextRequest } from '@/lib/rate-limit';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const clientIp = getClientIpFromNextRequest(req);
        const limitResult = await rateLimit(`notifications-fanout:${clientIp}`, 20, 60000);

        if (!limitResult.success) {
            return NextResponse.json({
                error: 'Of margar beiðnir. Reyndu aftur síðar.',
            }, { status: 429 });
        }

        // Authentication: Verify Firebase ID token
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Innskráning vantar' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch {
            return NextResponse.json({ error: 'Ógilt auðkenni' }, { status: 401 });
        }

        const userId = decodedToken.uid;
        const { title, message, scope, classId, schoolId, link } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: 'Fyrirsögn og innihald vantar' }, { status: 400 });
        }

        // Authorization: Verify user is admin of the class/school
        if (scope === 'school' && schoolId) {
            const school = await getSchool(schoolId);
            if (!school || !school.admins.includes(userId)) {
                return NextResponse.json({ error: 'Ekki heimild' }, { status: 403 });
            }
        } else if (classId) {
            const classData = await getClass(classId);
            if (!classData || !classData.admins.includes(userId)) {
                return NextResponse.json({ error: 'Ekki heimild' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Vantar classId eða schoolId' }, { status: 400 });
        }

        // 1. Fetch member user ids
        let targetUserIds: string[] = [];
        if (scope === 'school' && schoolId) {
            targetUserIds = await getSchoolMemberUserIds(schoolId);
        } else if (classId) {
            targetUserIds = await getClassMemberUserIds(classId);
        }

        if (targetUserIds.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'Engir viðtakendur fundust' }, { status: 200 });
        }

        // Exclude the sender from notifications if desired, but often it's good to see your own notification
        // targetUserIds = targetUserIds.filter(id => id !== userId);

        // 2. Write notifications in batches (max 500 per batch)
        const batches = [];
        for (let i = 0; i < targetUserIds.length; i += 500) {
            const batch = adminDb.batch();
            const chunk = targetUserIds.slice(i, i + 500);

            for (const uid of chunk) {
                const docRef = adminDb.collection('notifications').doc();
                batch.set(docRef, {
                    userId: uid,
                    title,
                    message,
                    type: 'system',
                    link: link || null,
                    read: false,
                    createdAt: FieldValue.serverTimestamp()
                });
            }
            batches.push(batch.commit());
        }

        await Promise.all(batches);

        return NextResponse.json({ success: true, count: targetUserIds.length });
    } catch (error) {
        console.error('Error fanning out notifications:', error);
        return NextResponse.json({ error: 'Gat ekki sent tilkynningar' }, { status: 500 });
    }
}
