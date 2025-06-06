import { supabase } from "../../lib/supabase";

/**
 * Minimal API for instant task creation.
 * Creates a new task with just a name/title.
 * Returns the created task or throws on error.
 */
export async function createTaskQuick(name: string, stepId?: string, userId?: string) {
  if (!name) throw new Error("Task name is required");
  // Optionally, you can pass userId or get it from auth context
  const now = new Date();
  const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // tomorrow
  const { data, error } = await supabase
    .from("standup_tasks")
    .insert([
      {
        id: crypto.randomUUID(),
        title: name,
        description: "",
        priority: "medium",
        status: "pending",
        category: "personal",
        task_type: "general",
        estimated_hours: 1,
        due_date: dueDate,
        step_id: stepId || null,
        // Add more fields as needed, e.g. assigned_to: userId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
