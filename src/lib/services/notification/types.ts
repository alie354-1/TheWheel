/**
 * Notification Service Types
 * Defines types for notification management
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface NotificationOptions {
  duration?: number; // Duration in milliseconds
  position?: NotificationPosition;
  dismissible?: boolean; // Can user dismiss the notification?
  actionText?: string; // Optional action button text
  actionFn?: () => void; // Optional action function
  onDismiss?: () => void; // Optional dismiss callback
  id?: string; // Optional custom ID
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration: number;
  dismissible: boolean;
  position: NotificationPosition;
  timestamp: Date;
  actionText?: string;
  actionFn?: () => void;
  onDismiss?: () => void;
}

export interface NotificationStore {
  notifications: Notification[];
  add: (notification: Notification) => void;
  remove: (id: string) => void;
  clear: () => void;
}

// Event listener type
export type NotificationListener = (notifications: Notification[]) => void;

// Interface for the Notification Service
export interface NotificationService {
  // Add a notification
  notify: (message: string, type?: NotificationType, options?: NotificationOptions) => string;
  
  // Convenience methods for different notification types
  success: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  
  // Remove notification by ID
  dismiss: (id: string) => void;
  
  // Remove all notifications
  clear: () => void;
  
  // Check if notification exists
  exists: (id: string) => boolean;
  
  // Get all current notifications
  getAll: () => Notification[];
  
  // Get a specific notification
  get: (id: string) => Notification | undefined;
  
  // Event listeners
  subscribe: (listener: NotificationListener) => () => void;
  
  // Configuration
  setDefaultOptions: (options: NotificationOptions) => void;
  getDefaultOptions: () => NotificationOptions;
}