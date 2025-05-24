/**
 * Notification Service
 * Provides a centralized service for managing application notifications
 */

import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationListener, NotificationOptions, NotificationPosition, NotificationService, NotificationType } from './types';

export class NotificationServiceImpl implements NotificationService {
  private notifications: Notification[] = [];
  private listeners: NotificationListener[] = [];
  private defaultOptions: NotificationOptions = {
    duration: 5000, // Default 5 seconds
    position: 'top-right',
    dismissible: true
  };

  /**
   * Creates a new notification
   */
  notify(message: string, type: NotificationType = 'info', options?: NotificationOptions): string {
    const id = options?.id || uuidv4();
    
    // Merge with default options
    const mergedOptions = {
      ...this.defaultOptions,
      ...options
    };
    
    const notification: Notification = {
      id,
      type,
      message,
      title: options?.title,
      duration: mergedOptions.duration!,
      dismissible: mergedOptions.dismissible!,
      position: mergedOptions.position as NotificationPosition,
      timestamp: new Date(),
      actionText: options?.actionText,
      actionFn: options?.actionFn,
      onDismiss: options?.onDismiss
    };
    
    // Add notification to the store
    this.notifications.push(notification);
    
    // Notify listeners
    this.notifyListeners();
    
    // Auto-dismiss if duration is set
    if (notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }
    
    return id;
  }

  /**
   * Convenience method for success notifications
   */
  success(message: string, options?: NotificationOptions): string {
    return this.notify(message, 'success', options);
  }

  /**
   * Convenience method for info notifications
   */
  info(message: string, options?: NotificationOptions): string {
    return this.notify(message, 'info', options);
  }

  /**
   * Convenience method for warning notifications
   */
  warning(message: string, options?: NotificationOptions): string {
    return this.notify(message, 'warning', options);
  }

  /**
   * Convenience method for error notifications
   */
  error(message: string, options?: NotificationOptions): string {
    return this.notify(message, 'error', options);
  }

  /**
   * Dismiss notification by ID
   */
  dismiss(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    
    if (notification) {
      // Call onDismiss callback if provided
      if (notification.onDismiss) {
        notification.onDismiss();
      }
      
      // Remove from list
      this.notifications = this.notifications.filter(n => n.id !== id);
      
      // Notify listeners
      this.notifyListeners();
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Check if notification exists
   */
  exists(id: string): boolean {
    return this.notifications.some(n => n.id === id);
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get notification by ID
   */
  get(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    
    // Immediately notify the new listener of current state
    listener(this.getAll());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Set default options for notifications
   */
  setDefaultOptions(options: NotificationOptions): void {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options
    };
  }

  /**
   * Get default options
   */
  getDefaultOptions(): NotificationOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(listener => listener(notifications));
  }
}