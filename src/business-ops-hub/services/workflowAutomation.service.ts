import { supabase } from "../../lib/supabase";

export interface WorkflowAutomation {
  id: string;
  company_id: string;
  domain_id?: string | null;
  trigger_type: string;
  trigger_config: any;
  // Legacy single-action fields (for backward compatibility)
  action_type: string;
  action_config: any;
  // New multi-step/conditional fields
  actions?: Array<{
    type: string;
    config: any;
    [key: string]: any;
  }>;
  conditions?: any; // Structure for conditional logic (if/then/else)
  is_active: boolean;
  created_at: string;
}

const workflowAutomationService = {
  async listAutomations(companyId: string, domainId?: string): Promise<WorkflowAutomation[]> {
    let query = supabase
      .from("workflow_automations")
      .select("*")
      .eq("company_id", companyId);
    if (domainId) query = query.eq("domain_id", domainId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async createAutomation(automation: Omit<WorkflowAutomation, "id" | "created_at">): Promise<WorkflowAutomation> {
    const { data, error } = await supabase
      .from("workflow_automations")
      .insert(automation)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateAutomation(id: string, updates: Partial<WorkflowAutomation>): Promise<WorkflowAutomation> {
    const { data, error } = await supabase
      .from("workflow_automations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteAutomation(id: string): Promise<void> {
    const { error } = await supabase
      .from("workflow_automations")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
};

/**
 * Executes a workflow automation: evaluates conditions, executes actions, logs results.
 * @param automation The automation to execute (with actions/conditions)
 * @param context The runtime context (e.g., event, user, step, etc.)
 */
export async function executeAutomation(automation: WorkflowAutomation, context: any): Promise<void> {
  try {
    // 1. Evaluate conditions (if present)
    let actionsToRun: any[] = [];
    if (automation.conditions) {
      // Simple branching: find first branch where all "if" keys match context
      const cond = automation.conditions;
      if (cond.branches && Array.isArray(cond.branches)) {
        let matched = false;
        for (const branch of cond.branches) {
          if (branch.if && Object.entries(branch.if).every(([k, v]) => context[k] === v)) {
            actionsToRun = branch.then || [];
            matched = true;
            break;
          }
        }
        if (!matched && cond.else) {
          actionsToRun = cond.else;
        }
      }
    }
    // 2. If no conditions, use actions array or fallback to single action
    if (actionsToRun.length === 0) {
      if (automation.actions && Array.isArray(automation.actions)) {
        actionsToRun = automation.actions;
      } else if (automation.action_type && automation.action_config) {
        actionsToRun = [{ type: automation.action_type, config: automation.action_config }];
      }
    }
    // 3. Execute each action in order
    for (const action of actionsToRun) {
      // TODO: Implement actual action execution logic (assign, notify, update_status, etc.)
      // Example:
      // if (action.type === "assign") { await assignTask(action.config, context); }
      // else if (action.type === "notify") { await sendNotification(action.config, context); }
      // else if (action.type === "update_status") { await updateStatus(action.config, context); }
      // else { /* Unknown action type */ }
      // For now, just log the action
      console.log("Executing action:", action.type, action.config, "with context:", context);
    }
    // 4. Log successful run (TODO: replace with persistent logging)
    console.log("Automation executed successfully:", automation.id);
  } catch (err) {
    // Log error (TODO: replace with persistent error logging)
    console.error("Error executing automation:", automation.id, err);
    // Optionally: rethrow or handle error
  }
}

export default workflowAutomationService;
