import { notificationService } from '../src/lib/services/notification.service';
import { supabase } from '../src/lib/supabase';

/**
 * Script to generate personalized nudges for users based on activity and analytics.
 * This can be run as a scheduled job (e.g., daily).
 */
async function generatePersonalizedNudges() {
  // 1. Find users with overdue tasks or low activity
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, company_id')
    .eq('is_active', true);

  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }

  for (const user of users || []) {
    // Example: Check for overdue tasks
    const { data: overdueTasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, due_date, domain_id')
      .eq('user_id', user.id)
      .eq('status', 'incomplete')
      .lt('due_date', new Date().toISOString());

    if (taskError) continue;

    if (overdueTasks && overdueTasks.length > 0) {
      for (const task of overdueTasks) {
        // Send a nudge for each overdue task
        await notificationService.sendNudge(
          user.id,
          task.domain_id,
          `Reminder: Overdue Task`,
          `You have an overdue task: "${task.title}". Please complete it as soon as possible.`,
          'high'
        );
      }
    }

    // Example: Check for low tool adoption (stub logic)
    // In a real implementation, query analytics for tool adoption rate
    // If tool adoption is low, send a nudge
    // await notificationService.sendNudge(
    //   user.id,
    //   someDomainId,
    //   `Try a Recommended Tool`,
    //   `Boost your productivity by trying a recommended tool in your domain.`,
    //   'normal'
    // );

    // Example: Check for inactivity (stub logic)
    // If user hasn't logged in for X days, send a nudge
    // await notificationService.sendNudge(
    //   user.id,
    //   someDomainId,
    //   `We Miss You!`,
    //   `It's been a while since your last visit. Log in to see what's new and keep your progress on track.`,
    //   'normal'
    // );
  }

  console.log('Personalized nudges generated.');
}

generatePersonalizedNudges().then(() => process.exit(0));
