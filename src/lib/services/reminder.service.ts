import { supabase } from "../supabase";

export interface Reminder {
  id: string;
  user_id: string;
  company_id: string;
  type: string;
  title: string;
  body?: string;
  schedule: string;
  next_run: string;
  channels: string[];
  is_active: boolean;
  last_sent?: string;
  created_at: string;
  updated_at: string;
}

class ReminderService {
  /**
   * Create a new reminder
   */
  async createReminder(reminder: Omit<Reminder, "id" | "created_at" | "updated_at" | "last_sent">): Promise<Reminder | null> {
    const { data, error } = await supabase
      .from("reminders")
      .insert(reminder)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating reminder:", error);
      return null;
    }
    return data as Reminder;
  }

  /**
   * Update a reminder
   */
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | null> {
    const { data, error } = await supabase
      .from("reminders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating reminder:", error);
      return null;
    }
    return data as Reminder;
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting reminder:", error);
      return false;
    }
    return true;
  }

  /**
   * List reminders for a user
   */
  async listReminders(userId: string, companyId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .order("next_run");
    if (error) {
      console.error("Error listing reminders:", error);
      return [];
    }
    return data as Reminder[];
  }

  /**
   * (To be run by a scheduled job) Process due reminders and send notifications
   */
  async processDueReminders(): Promise<void> {
    // TODO: Query reminders where next_run <= now() and is_active = true
    // For each, send notification via notificationService, update last_sent and next_run
    // Support recurring schedules (parse cron/interval)
    // Support channels: in-app, email, Slack
    // Log errors and successes
  }
}

export const reminderService = new ReminderService();
