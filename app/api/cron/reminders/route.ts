import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const maxDuration = 60; // Allow 60 seconds for execution
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Fallback for manual testing dynamically
        if(request.url.includes('testing123')) {
           // allow bypass for dev
        } else {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    try {
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Fetch tasks happening in the next week
        const tasksSnapshot = await adminDb.collection('tasks')
            .where('date', '>=', now)
            .where('date', '<=', oneWeekFromNow)
            .get();

        let batch = adminDb.batch();
        let opsCount = 0;
        let totalOps = 0;

        const commitBatch = async () => {
            if (opsCount > 0) {
                await batch.commit();
                batch = adminDb.batch();
                totalOps += opsCount;
                opsCount = 0;
            }
        };

        for (const doc of tasksSnapshot.docs) {
            const task = doc.data();
            const taskId = doc.id;
            const taskDate = task.date.toDate();
            
            const hoursUntilEvent = (taskDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            // 1. Volunteer Reminders
            if (task.slotsTotal > 0 && !task.volunteerReminderSent && task.volunteerReminderHours) {
                // Buffer of +0.5 hours to account for cron execution delays
                if (hoursUntilEvent <= task.volunteerReminderHours + 0.5) { 
                    
                    if (task.volunteers && Array.isArray(task.volunteers)) {
                        for (const vol of task.volunteers) {
                            if (vol.userId) {
                                const notifRef = adminDb.collection('notifications').doc();
                                batch.set(notifRef, {
                                    userId: vol.userId,
                                    title: `Áminning: ${task.title}`,
                                    message: `Vaktin þín / skráningin þín er á næstunni!`,
                                    type: 'reminder',
                                    link: `/${task.originalLanguage || 'is'}/calendar`, 
                                    read: false,
                                    createdAt: new Date(),
                                });
                                opsCount++;
                                if(opsCount >= 450) await commitBatch();
                            }
                        }
                    }
                    
                    const taskRef = adminDb.collection('tasks').doc(taskId);
                    batch.update(taskRef, { volunteerReminderSent: true });
                    opsCount++;
                    if(opsCount >= 450) await commitBatch();
                }
            }

            // 2. General Audience Reminders (1 hour before, triggers when hours <= 1.5)
            if (!task.generalReminderSent) {
                if (hoursUntilEvent <= 1.5 && hoursUntilEvent > 0) {
                    let targetUserIds: string[] = [];

                    if (task.scope === 'class' && task.classId) {
                        const linksSnap = await adminDb.collection('parentLinks')
                            .where('classId', '==', task.classId)
                            .where('status', '==', 'approved')
                            .get();
                        targetUserIds = linksSnap.docs.map(l => l.data().userId);
                    } else if (task.scope === 'school' && task.schoolId) {
                        const classesSnap = await adminDb.collection('classes').where('schoolId', '==', task.schoolId).get();
                        const classIds = classesSnap.docs.map(d => d.id);
                        
                        if (classIds.length > 0) {
                            const chunks = [];
                            for(let i = 0; i < classIds.length; i+=10) {
                                chunks.push(classIds.slice(i, i+10));
                            }
                            
                            for(const chunk of chunks) {
                                const linksSnap = await adminDb.collection('parentLinks')
                                    .where('classId', 'in', chunk)
                                    .where('status', '==', 'approved')
                                    .get();
                                linksSnap.docs.forEach(l => {
                                    if(!targetUserIds.includes(l.data().userId)) {
                                        targetUserIds.push(l.data().userId);
                                    }
                                });
                            }
                        }
                    }
                    
                    let finalUserIds = new Set<string>();
                    
                    if (task.type === 'birthday' && task.invitees && task.invitees.length > 0) {
                        const inviteesSet = new Set(task.invitees);
                        const linksSnap = await adminDb.collection('parentLinks')
                            .where('classId', '==', task.classId)
                            .where('status', '==', 'approved')
                            .get();
                        
                        linksSnap.docs.forEach(d => {
                            const data = d.data();
                            if (inviteesSet.has(data.studentId)) {
                                finalUserIds.add(data.userId);
                            }
                        });
                    } else {
                        targetUserIds.forEach(id => finalUserIds.add(id));
                    }

                    for(const uid of finalUserIds) {
                        const notifRef = adminDb.collection('notifications').doc();
                        batch.set(notifRef, {
                            userId: uid,
                            title: `Áminning: ${task.title}`,
                            message: `Viðburður hefst innan við klukkustundar!`,
                            type: 'reminder',
                            link: `/${task.originalLanguage || 'is'}/calendar`,
                            read: false,
                            createdAt: new Date(),
                        });
                        opsCount++;
                        if(opsCount >= 450) await commitBatch();
                    }

                    const taskRef = adminDb.collection('tasks').doc(taskId);
                    batch.update(taskRef, { generalReminderSent: true });
                    opsCount++;
                    if(opsCount >= 450) await commitBatch();
                }
            }
        }

        await commitBatch();

        return NextResponse.json({ success: true, processedOps: totalOps });

    } catch (error) {
        console.error("Cron Reminder Error: ", error);
        return new Response('Server Error', { status: 500 });
    }
}
