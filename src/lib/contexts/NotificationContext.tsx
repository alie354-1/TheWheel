import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { serviceRegistry } from '../services/registry';
import { Notification, NotificationOptions, NotificationType } from '../services/notification';

export interface NotificationContextValue {
  notifications: Notification[];
  notify: (message: string, type?: NotificationType, options?: NotificationOptions) => string;
  success: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

// Create the context with a default value
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Props interface for the provider component
export interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app to provide notification methods
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Get the notification service from the registry
  const notificationService = serviceRegistry.get('notification');
  
  // State to hold the current notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(updatedNotifications => {
      setNotifications(updatedNotifications);
    });
    
    return unsubscribe;
  }, [notificationService]);
  
  // Create context value
  const contextValue: NotificationContextValue = {
    notifications,
    notify: (message, type, options) => notificationService.notify(message, type, options),
    success: (message, options) => notificationService.success(message, options),
    info: (message, options) => notificationService.info(message, options),
    warning: (message, options) => notificationService.warning(message, options),
    error: (message, options) => notificationService.error(message, options),
    dismiss: (id) => notificationService.dismiss(id),
    clear: () => notificationService.clear()
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };