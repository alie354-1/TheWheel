import { supabase } from "@/lib/supabase";

/**
 * Log an action on a domain step (add, remove, edit) for auditing and analytics.
 * @param companyId - The company performing the action
 * @param domainId - The domain being modified
 * @param stepId - The step being modified (can be null for domain-level actions)
 * @param userId - The user performing the action
 * @param action - 'add', 'remove', or 'edit'
 * @param details - Optional JSON with extra info (reason, previous values, etc.)
 */
export async function logDomainStepAction(
  companyId: string,
  domainId: string,
  stepId: string | null,
  userId: string | null,
  action: "add" | "remove" | "edit",
  details?: Record<string, any>
): Promise<void> {
  const { error } = await supabase.from("domain_step_logs").insert([
    {
      company_id: companyId,
      domain_id: domainId,
      step_id: stepId,
      user_id: userId,
      action,
      details: details ? details : null,
    },
  ]);
  if (error) {
    // Don't throw, but log for debugging
    console.error("Failed to log domain step action:", error);
  }
}
