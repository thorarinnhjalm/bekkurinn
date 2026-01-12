import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getClassMemberEmails, getSchoolMemberEmails } from '@/services/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { title, content, author, scope, classId, schoolId } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Fyrirsögn og innihald vantar' }, { status: 400 });
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

        // 2. Send emails
        // Note: Resend batch sending or individual sending
        // For now, let's use batching if possible, or individual for simplicity and better error tracking
        const results = await Promise.all(
            emails.map(email =>
                resend.emails.send({
                    from: 'Bekkurinn <tilkynningar@bekkurinn.is>',
                    to: email,
                    subject: `MIKILVÆGT: ${title}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                            <div style="background: #4A7C9E; color: white; padding: 24px; text-align: center;">
                                <h1 style="margin: 0; font-size: 24px;">Bekkurinn</h1>
                                <p style="margin: 8px 0 0; opacity: 0.8;">Mikilvæg tilkynning</p>
                            </div>
                            <div style="padding: 32px;">
                                <h2 style="color: #111; margin-top: 0;">${title}</h2>
                                <p style="color: #555; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
                                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
                                    <p style="margin: 0;">Sendandi: <strong>${author}</strong></p>
                                    <p style="margin: 4px 0 0;">Þetta er mikilvæg tilkynning sem er send á alla foreldra.</p>
                                </div>
                            </div>
                            <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #aaa;">
                                <p>&copy; ${new Date().getFullYear()} Bekkurinn - Allur réttur áskilinn</p>
                            </div>
                        </div>
                    `
                })
            )
        );

        return NextResponse.json({ success: true, count: emails.length });
    } catch (error) {
        console.error('Error sending critical announcement email:', error);
        return NextResponse.json({ error: 'Gat ekki sent tölvupóst' }, { status: 500 });
    }
}
