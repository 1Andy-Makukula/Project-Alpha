import { AppNotification, NotificationPreferences, NotificationType, NotificationPriority } from '../types';

/**
 * @desc Notification management service
 * Handles notification CRUD, real-time updates, and user preferences
 * Production-ready with WebSocket support placeholder
 */

const NOTIFICATIONS_STORAGE_KEY = 'kithly_notifications';
const NOTIFICATION_PREFS_STORAGE_KEY = 'kithly_notification_preferences';

// ============================================
// MOCK DATA
// ============================================

const MOCK_NOTIFICATIONS: AppNotification[] = [
    {
        id: '1',
        userId: 'user_1',
        type: 'order',
        priority: 'high',
        title: 'Order Ready for Collection',
        message: 'Your order #KLY-ABC123 is ready for pickup at Petal Paradise.',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        actionUrl: '/orders/KLY-ABC123',
        metadata: { orderId: 'KLY-ABC123', shopId: 101 }
    },
    {
        id: '2',
        userId: 'user_1',
        type: 'payment',
        priority: 'medium',
        title: 'Payment Successful',
        message: 'Your payment of ZMK 450.00 has been processed successfully.',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        metadata: { amount: 450 }
    },
    {
        id: '3',
        userId: 'user_1',
        type: 'promotion',
        priority: 'low',
        title: '20% Off This Weekend!',
        message: 'Get 20% off on all flowers at Petal Paradise this weekend only!',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/shops/101',
        metadata: { shopId: 101 }
    }
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: true,
    shopNews: true,
    reviews: true
};

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getStoredNotifications(): AppNotification[] {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : MOCK_NOTIFICATIONS;
    } catch (error) {
        console.error('Error loading notifications:', error);
        return MOCK_NOTIFICATIONS;
    }
}

function saveNotifications(notifications: AppNotification[]): void {
    try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

function getStoredPreferences(): NotificationPreferences {
    try {
        const stored = localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch (error) {
        console.error('Error loading notification preferences:', error);
        return DEFAULT_PREFERENCES;
    }
}

function savePreferences(prefs: NotificationPreferences): void {
    try {
        localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
        console.error('Error saving notification preferences:', error);
    }
}

// ============================================
// NOTIFICATION CRUD
// ============================================

export async function getAllNotifications(userId: string): Promise<AppNotification[]> {
    // In production: return await api.get(`/notifications?userId=${userId}`);
    const notifications = getStoredNotifications();
    return notifications.filter(n => n.userId === userId);
}

export async function getUnreadNotifications(userId: string): Promise<AppNotification[]> {
    const notifications = await getAllNotifications(userId);
    return notifications.filter(n => !n.read);
}

export async function getNotificationById(id: string): Promise<AppNotification | null> {
    const notifications = getStoredNotifications();
    return notifications.find(n => n.id === id) || null;
}

export async function createNotification(
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): Promise<AppNotification> {
    const notifications = getStoredNotifications();
    const newNotification: AppNotification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification); // Add to beginning
    saveNotifications(notifications);

    // In production: return await api.post('/notifications', newNotification);
    // Also trigger push notification if enabled
    triggerPushNotification(newNotification);

    return newNotification;
}

export async function markAsRead(id: string): Promise<AppNotification | null> {
    const notifications = getStoredNotifications();
    const index = notifications.findIndex(n => n.id === id);

    if (index === -1) return null;

    notifications[index].read = true;
    saveNotifications(notifications);

    // In production: return await api.patch(`/notifications/${id}`, { read: true });
    return notifications[index];
}

export async function markAllAsRead(userId: string): Promise<boolean> {
    const notifications = getStoredNotifications();
    const updated = notifications.map(n =>
        n.userId === userId ? { ...n, read: true } : n
    );

    saveNotifications(updated);

    // In production: return await api.post(`/notifications/mark-all-read`, { userId });
    return true;
}

export async function deleteNotification(id: string): Promise<boolean> {
    const notifications = getStoredNotifications();
    const filtered = notifications.filter(n => n.id !== id);

    if (filtered.length === notifications.length) return false;

    saveNotifications(filtered);

    // In production: return await api.delete(`/notifications/${id}`);
    return true;
}

export async function deleteAllRead(userId: string): Promise<number> {
    const notifications = getStoredNotifications();
    const filtered = notifications.filter(n => !(n.userId === userId && n.read));
    const deletedCount = notifications.length - filtered.length;

    saveNotifications(filtered);

    return deletedCount;
}

// ============================================
// NOTIFICATION FILTERING
// ============================================

export async function getNotificationsByType(
    userId: string,
    type: NotificationType
): Promise<AppNotification[]> {
    const notifications = await getAllNotifications(userId);
    return notifications.filter(n => n.type === type);
}

export async function getNotificationsByPriority(
    userId: string,
    priority: NotificationPriority
): Promise<AppNotification[]> {
    const notifications = await getAllNotifications(userId);
    return notifications.filter(n => n.priority === priority);
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    // In production: return await api.get(`/users/${userId}/notification-preferences`);
    return getStoredPreferences();
}

export async function updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const current = getStoredPreferences();
    const updated = { ...current, ...preferences };

    savePreferences(updated);

    // In production: return await api.put(`/users/${userId}/notification-preferences`, updated);
    return updated;
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

/**
 * Request permission for browser push notifications
 */
export async function requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support push notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Trigger browser push notification
 */
function triggerPushNotification(notification: AppNotification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const prefs = getStoredPreferences();
    if (!prefs.push) {
        return;
    }

    try {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            badge: '/badge.png',
            tag: notification.id,
            requireInteraction: notification.priority === 'urgent'
        });
    } catch (error) {
        console.error('Error showing push notification:', error);
    }
}

// ============================================
// REAL-TIME NOTIFICATIONS (WebSocket)
// ============================================

/**
 * WebSocket connection for real-time notifications
 * In production, implement actual WebSocket connection
 */
export class NotificationSocket {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    constructor(private userId: string, private onNotification: (notification: AppNotification) => void) { }

    connect(): void {
        // In production: const ws = new WebSocket(`wss://api.kithly.com/notifications?userId=${this.userId}`);

        // Placeholder implementation
        console.log(`NotificationSocket: Would connect for user ${this.userId}`);

        // Simulate connection
        this.simulateConnection();
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private simulateConnection(): void {
        // Simulate receiving notifications (for development)
        // Remove this in production
        console.log('NotificationSocket: Simulated connection established');
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const notification: AppNotification = JSON.parse(event.data);
            this.onNotification(notification);
        } catch (error) {
            console.error('Error parsing notification:', error);
        }
    }

    private handleClose(): void {
        console.log('NotificationSocket: Connection closed');

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, this.reconnectDelay);
        }
    }
}

// ============================================
// NOTIFICATION STATISTICS
// ============================================

export async function getNotificationStats(userId: string) {
    const notifications = await getAllNotifications(userId);

    return {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {
            order: notifications.filter(n => n.type === 'order').length,
            shop: notifications.filter(n => n.type === 'shop').length,
            payment: notifications.filter(n => n.type === 'payment').length,
            promotion: notifications.filter(n => n.type === 'promotion').length,
            system: notifications.filter(n => n.type === 'system').length,
            review: notifications.filter(n => n.type === 'review').length
        },
        byPriority: {
            low: notifications.filter(n => n.priority === 'low').length,
            medium: notifications.filter(n => n.priority === 'medium').length,
            high: notifications.filter(n => n.priority === 'high').length,
            urgent: notifications.filter(n => n.priority === 'urgent').length
        }
    };
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

export function createOrderNotification(
    userId: string,
    orderId: string,
    shopName: string,
    status: 'placed' | 'ready' | 'collected'
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
    const messages = {
        placed: `Your order has been placed at ${shopName}`,
        ready: `Your order is ready for collection at ${shopName}`,
        collected: `Your order from ${shopName} has been collected. Enjoy!`
    };

    return {
        userId,
        type: 'order',
        priority: status === 'ready' ? 'high' : 'medium',
        title: `Order ${status === 'placed' ? 'Placed' : status === 'ready' ? 'Ready' : 'Collected'}`,
        message: messages[status],
        actionUrl: `/orders/${orderId}`,
        metadata: { orderId, shopId: 0 }
    };
}

export function createPaymentNotification(
    userId: string,
    amount: number,
    status: 'success' | 'failed'
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
    return {
        userId,
        type: 'payment',
        priority: status === 'failed' ? 'high' : 'medium',
        title: status === 'success' ? 'Payment Successful' : 'Payment Failed',
        message: status === 'success'
            ? `Your payment of ZMK ${amount.toFixed(2)} has been processed successfully.`
            : `Your payment of ZMK ${amount.toFixed(2)} failed. Please try again.`,
        metadata: { amount }
    };
}

export function createPromotionNotification(
    userId: string,
    shopId: number,
    shopName: string,
    offer: string
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
    return {
        userId,
        type: 'promotion',
        priority: 'low',
        title: `Special Offer from ${shopName}`,
        message: offer,
        actionUrl: `/shops/${shopId}`,
        metadata: { shopId }
    };
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

export const notify = {
    sendSMS: (phone: string, code: string, shopName: string) => {
        console.log(`[Mock SMS] To: ${phone}, Code: ${code}, Shop: ${shopName}`);
        // Create a system notification for this as well
        createNotification({
            userId: 'user_1', // Default to user_1 for now
            type: 'system',
            priority: 'high',
            title: 'Collection Code',
            message: `Your collection code for ${shopName} is ${code}`,
            metadata: { code, shopName }
        });
    }
};
