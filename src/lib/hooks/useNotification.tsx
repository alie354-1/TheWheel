import { useContext, useState, useEffect } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { serviceRegistry } from '../services/registry';
import { Notification, NotificationOptions, NotificationType } from '../services/notification';

export interface UseNotificationReturn {
  // Basic notification methods
  notify: (message: string, type?: NotificationType, options?: NotificationOptions) => string;
  success: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  
  // Management methods
  dismiss: (id: string) => void;
  clear: () => void;
  
  // Current notifications
  notifications: Notification[];
}

export const useNotification = (): UseNotificationReturn => {
  // First try to get from context
  const context = useContext(NotificationContext);
  
  if (context) {
    return context;
  }
  
  // Fallback to direct service access if not in context
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Get notification service from registry
  const notificationService = serviceRegistry.get('notification');
  
  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(updatedNotifications => {
      setNotifications(updatedNotifications);
    });
    
    return unsubscribe;
  }, [notificationService]);
  
  // Proxy the service methods
  const notify = (message: string, type?: NotificationType, options?: NotificationOptions): string => {
    return notificationService.notify(message, type, options);
  };
  
  const success = (message: string, options?: NotificationOptions): string => {
    return notificationService.success(message, options);
  };
  
  const info = (message: string, options?: NotificationOptions): string => {
    return notificationService.info(message, options);
  };
  
  const warning = (message: string, options?: NotificationOptions): string => {
    return notificationService.warning(message, options);
  };
  
  const error = (message: string, options?: NotificationOptions): string => {
    return notificationService.error(message, options);
  };
  
  const dismiss = (id: string): void => {
    notificationService.dismiss(id);
  };
  
  const clear = (): void => {
    notificationService.clear();
  };
  
  return {
    notifications,
    notify,
    success,
    info,
    warning,
    error,
    dismiss,
    clear
  };
};