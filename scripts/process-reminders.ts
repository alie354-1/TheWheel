/**
 * Script to process due reminders and send notifications (BOH-403.1)
 * To be run by a scheduled job (e.g., cron, serverless function)
 */
import { reminderService } from "../src/lib/services/reminder.service";
import { notificationService } from "../src/lib/services/notification.service";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (assumes env vars are set)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const now = new Date().toISOString();
  // Query due reminders
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("is_active", true)
    .lte("next_run", now);

  if (error) {
    console.error("Error querying reminders:", error);
    return;
  }
  if (!reminders || reminders.length === 0) {
    console.log("No due reminders.");
    return;
  }

  for (const reminder of reminders) {
    try {
      // Send notification via notificationService
      await notificationService.sendNotification(
        reminder.user_id,
        reminder.company_id,
        "reminder",
        reminder.title,
        reminder.body || "",
        undefined,
        undefined,
        undefined,
        "normal"
      );
      // TODO: Integrate with Slack/email APIs if channels include those

      // Calculate next_run for recurring reminders (simple daily/weekly/cron support)
      let nextRun = null;
      if (reminder.schedule === "daily") {
        nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (reminder.schedule === "weekly") {
        nextRun = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else {
        // TODO: Parse cron expression for next occurrence
        nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // Update last_sent and next_run
      await supabase
        .from("reminders")
        .update({
          last_sent: now,
          next_run: nextRun.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reminder.id);

      console.log(`Reminder sent for user ${reminder.user_id}: ${reminder.title}`);
    } catch (err) {
      console.error("Error processing reminder:", reminder.id, err);
    }
  }
}

main().catch(console.error);
