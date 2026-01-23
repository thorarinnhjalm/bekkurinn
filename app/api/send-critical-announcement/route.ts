import { NextRequest, NextResponse } from 'next/server';
// import { Resend } from 'resend';
import { getClassMemberEmails, getSchoolMemberEmails, getClass, getSchool } from '@/services/firestore';
import { adminAuth } from '@/lib/firebase/admin';
import { rateLimit, getClientIpFromNextRequest } from '@/lib/rate-limit';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        // Rate limiting: 5 requests per minute per IP
        const clientIp = getClientIpFromNextRequest(req);
        const limitResult = await rateLimit(`critical-announcement:${clientIp}`, 5, 60000);

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
        const { title, content, author, scope, classId, schoolId } = await req.json();

        if (!title || !content) {
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

        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not configured');
            return NextResponse.json({ error: 'Tölvupóstþjónusta er ekki stillt' }, { status: 500 });
        }

        // 1. Fetch member emails
        let emails: string[] = [];
        if (scope === 'school' && schoolId) {
            emails = await getSchoolMemberEmails(schoolId);
        } else if (classId) {
            emails = await getClassMemberEmails(classId);
        }

        if (emails.length === 0) {
            return NextResponse.json({ message: 'Engir viðtakendur fundust' }, { status: 200 });
        }

        // 2. Send emails - DISABLED FOR NOW
        console.log('Email sending is disabled:', { emails, title });
        /*
        const results = await Promise.all(
            emails.map(email => 
                resend.emails.send({
                    ...
                })
            )
        );
        */

        return NextResponse.json({ success: true, count: emails.length, message: 'Email logic is currently disabled.' });
    } catch (error) {
        console.error('Error sending critical announcement email:', error);
        return NextResponse.json({ error: 'Gat ekki sent tölvupóst' }, { status: 500 });
    }
}
