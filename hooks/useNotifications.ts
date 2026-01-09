import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    Timestamp,
    limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification, NotificationType } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        // Query: Get last 50 notifications for this user, ordered by date
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Notification[] = [];
            let unread = 0;

            snapshot.forEach((doc) => {
                const data = doc.data() as Omit<Notification, 'id'>;
                const notification = {
                    id: doc.id,
                    ...data
                } as Notification;

                items.push(notification);

                if (!notification.read) {
                    unread++;
                }
            });

            setNotifications(items);
            setUnreadCount(unread);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        try {
            const ref = doc(db, 'notifications', notificationId);
            await updateDoc(ref, {
                read: true
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        // Batch update would be better, but simpler for now
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        const promises = unreadIds.map(id => markAsRead(id));
        await Promise.all(promises);
    };

    // Helper to create a notification (for testing/client-side events)
    const createNotification = async (
        userId: string,
        title: string,
        message: string,
        type: NotificationType = 'system',
        link?: string
    ) => {
        try {
            await addDoc(collection(db, 'notifications'), {
                userId,
                title,
                message,
                type,
                link: link || null,
                read: false,
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        createNotification
    };
}
