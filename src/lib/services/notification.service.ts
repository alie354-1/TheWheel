import { supabase } from '../supabase';
import { Notification } from '../types/journey-unified.types';

/**
 * Notification Service
 * 
 * Provides methods for managing the notification system.
 * Handles sending, delivering, and querying notifications.
 */
export class NotificationService {
  
  /**
   * Send a notification to a user (in-app, email, Slack)
   */
  async sendNotification(
    userId: string,
    companyId: string,
    eventType: string,
    title: string,
    body: string,
    resourceType?: string,
    resourceId?: string,
    actionUrl?: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    channels: string[] = ['in-app']
  ): Promise<Notification | null> {
    try {
      let notification: Notification | null = null;
      // In-app notification
      if (channels.includes("in-app")) {
        const { data, error } = await supabase
          .rpc('send_notification', {
            p_user_id: userId,
            p_company_id: companyId,
            p_event_type: eventType,
            p_title: title,
            p_body: body,
            p_resource_type: resourceType,
            p_resource_id: resourceId,
            p_action_url: actionUrl,
            p_priority: priority
          });
        if (error) throw error;
        if (data) {
          const { data: notif, error: notifError } = await supabase
            .from('notifications')
            .select('*')
            .eq('id', data)
            .single();
          if (notifError) throw notifError;
          notification = notif as Notification;
        }
      }
      // Email notification
      if (channels.includes("email")) {
        await this.sendEmailNotification(userId, title, body);
      }
      // Slack notification
      if (channels.includes("slack")) {
        await this.sendSlackNotification(userId, title, body);
      }
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Send a personalized nudge notification to a user.
   */
  async sendNudge(
    userId: string,
    domainId: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('domain_notifications')
        .insert([
          {
            user_id: userId,
            domain_id: domainId,
            title,
            message,
            notification_type: 'nudge',
            priority,
            status: 'unread',
            created_at: new Date().toISOString()
          }
        ]);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending nudge notification:', error);
      return null;
    }
  }

  /**
   * Send an email notification (stub - implement with SMTP or email API)
   */
  async sendEmailNotification(userId: string, subject: string, body: string): Promise<void> {
    // TODO: Look up user email, send via SMTP or email API (e.g., SendGrid, SES)
    console.log(`[Email] To user ${userId}: ${subject} - ${body}`);
  }

  /**
   * Send a Slack notification (stub - implement with Slack webhook or API)
   */
  async sendSlackNotification(userId: string, title: string, body: string): Promise<void> {
    // TODO: Look up user Slack ID or channel, send via Slack webhook or API
    console.log(`[Slack] To user ${userId}: ${title} - ${body}`);
  }

  /**
   * Get user notifications with optional filtering
   */
  async getUserNotifications(
    userId: string,
    options: {
      isRead?: boolean;
      eventTypes?: string[];
      startDate?: string;
      endDate?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      // Apply filters
      if (options.isRead !== undefined) {
        query = query.eq('is_read', options.isRead);
      }
      
      if (options.eventTypes && options.eventTypes.length > 0) {
        query = query.in('event_type', options.eventTypes);
      }
      
      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      
      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }
      
      if (options.priority) {
        query = query.eq('priority', options.priority);
      }
      
      // Apply pagination
      if (options.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return data as Notification[];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_read', { 
          p_notification_id: notificationId,
          p_user_id: userId
        });
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[], userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('mark_notifications_read', { 
          p_notification_ids: notificationIds,
          p_user_id: userId
        });
        
      if (error) throw error;
      
      return data || 0;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      return 0;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      // First, count how many unread notifications there are
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      // Then mark them all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error; 
      
      return unreadCount || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(
    userId: string,
    companyId: string
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('event_type');
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return [];
    }
  }

  /**
   * Update notification preferences for a specific event type
   */
  async updateNotificationPreference(
    userId: string,
    companyId: string,
    eventType: string,
    updates: {
      isEnabled?: boolean;
      channels?: string[];
      batchFrequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
      quietHoursStart?: string;
      quietHoursEnd?: string;
    }
  ): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.isEnabled !== undefined) {
        updateData.is_enabled = updates.isEnabled;
      }
      
      if (updates.channels) {
        updateData.channels = updates.channels;
      }
      
      if (updates.batchFrequency) {
        updateData.batch_frequency = updates.batchFrequency;
      }
      
      if (updates.quietHoursStart) {
        updateData.quiet_hours_start = updates.quietHoursStart;
      }
      
      if (updates.quietHoursEnd) {
        updateData.quiet_hours_end = updates.quietHoursEnd;
      }
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('notification_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .eq('event_type', eventType);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      return false;
    }
  }

  /**
   * Create default notification preferences for a user
   */
  async createDefaultNotificationPreferences(
    userId: string,
    companyId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('create_default_notification_preferences', {
          p_user_id: userId,
          p_company_id: companyId
        });
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
      return false;
    }
  }

  /**
   * Get pending notification batches that are ready to be delivered
   * This would typically be called by a scheduled job
   */
  async getPendingNotificationBatches(
    batchType?: 'hourly' | 'daily' | 'weekly',
    limit = 100
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('notification_batches')
        .select('*')
        .eq('is_delivered', false)
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for')
        .limit(limit);
        
      if (batchType) {
        query = query.eq('batch_type', batchType);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting pending notification batches:', error);
      return [];
    }
  }

  /**
   * Mark a notification batch as delivered
   */
  async markBatchDelivered(batchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_batches')
        .update({
          is_delivered: true,
          delivered_at: new Date().toISOString()
        })
        .eq('id', batchId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking batch as delivered:', error);
      return false;
    }
  }

  /**
   * Get smart alerts for a company
   */
  async getSmartAlerts(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*, smart_alert_conditions(*)')
        .eq('company_id', companyId)
        .eq('is_enabled', true);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting smart alerts:', error);
      return [];
    }
  }

  /**
   * Update the last triggered time for a smart alert
   */
  async updateSmartAlertLastTriggered(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({
          last_triggered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating smart alert last triggered:', error);
      return false;
    }
  }
}

// Create an instance to export
export const notificationService = new NotificationService();
