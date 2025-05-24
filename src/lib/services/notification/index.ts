import { NotificationServiceImpl } from './notification.service';

export * from './types';
export * from './notification.service';

// Export a singleton instance
export const notificationService = new NotificationServiceImpl();