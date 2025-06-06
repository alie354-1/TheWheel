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
  /*
  useEffect(() => {
    // TODO: Implement subscribe method in notificationService or use a different approach
    // const unsubscribe = notificationService.subscribe(updatedNotifications => {
    //   setNotifications(updatedNotifications);
    // });
    // return unsubscribe;
    console.warn("NotificationService.subscribe is not implemented. Real-time notifications will not work.");
    return () => {}; // Return an empty function for cleanup
  }, [notificationService]);
  */
  
  // Create context value
  const contextValue: NotificationContextValue = {
    notifications,
    // Provide dummy implementations for now
    notify: (message, type, options) => { console.warn(`Notification.notify called (not implemented): ${message}`); return 'mock-id'; },
    success: (message, options) => { console.warn(`Notification.success called (not implemented): ${message}`); return 'mock-id'; },
    info: (message, options) => { console.warn(`Notification.info called (not implemented): ${message}`); return 'mock-id'; },
    warning: (message, options) => { console.warn(`Notification.warning called (not implemented): ${message}`); return 'mock-id'; },
    error: (message, options) => { console.warn(`Notification.error called (not implemented): ${message}`); return 'mock-id'; },
    dismiss: (id) => { console.warn(`Notification.dismiss called (not implemented): ${id}`); },
    clear: () => { console.warn(`Notification.clear called (not implemented)`); setNotifications([]); }
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };
