/**
 * Journey Content Management Service
 * - CRUD operations for journey phases, steps, tools, resources, tips, checklists
 * - Import/export helpers
 */
import { supabase } from '../supabase';

// Define the expected shape of the transformed row data coming from the component
interface TransformedRowData {
  // Common fields added by the component for linking/creation
  csv_phase_order?: number;
  csv_step_order?: number;
  csv_phase_name?: string;

  // Fields mapped directly to journey_steps columns
  name?: string; // From CSV 'Task' OR 'Tool (Name)'
  description?: string; // From CSV 'Summary' for tools, or mapped for steps
  guidance?: string;
  order_index?: number; // From CSV 'Step' or 'Phase'
  order?: number; // From CSV 'Step' or 'Phase'
  estimated_duration?: string;
  required?: boolean; // From CSV 'Need to Do? (Yes/No)'
  is_company_formation_step?: boolean;
  ask_wheel_enabled?: boolean;
  ask_expert_enabled?: boolean;
  use_tool_enabled?: boolean;
  diy_enabled?: boolean;
  need_to_do?: boolean; // From CSV 'Need to Do? (Yes/No)'
  need_explanation?: string; // From CSV 'Explanation for Need'
  dedicated_tool?: boolean; // From CSV 'Dedicated Tool? (Yes/No)'
  tool_explanation?: string; // From CSV 'Explanation for Tool Need'
  steps_without_tool?: string; // From CSV 'Steps w/o Tool'
  effort_difficulty?: string; // From CSV 'Effort/Difficulty'
  staff_freelancers?: string; // From CSV 'Staff/Freelancers (Optional)'
  key_considerations?: string; // From CSV 'Key Considerations'
  bootstrap_mindset?: string; // From CSV 'Bootstrap Mindset'
  founder_skills?: string; // From CSV 'Founder Skills Needed'

  // Fields mapped directly to journey_step_tools columns
  url?: string; // From CSV 'Website'
  category?: string; // From CSV 'Category'
  subcategory?: string; // From CSV 'Subcategory'
  pros?: string; // From CSV 'Pros'
  cons?: string; // From CSV 'Cons'
  customer_stage?: string; // From CSV 'Usual Customer Stage'
  founded?: string; // From CSV 'Founded'
  last_funding_round?: string; // From CSV 'Last Funding Round'
  comp_svc_pkg?: string; // From CSV 'Comp. Svc. Pkg. (1-3)'
  ease_of_use?: string; // From CSV 'Ease of Use (1-3)'
  affordability?: string; // From CSV 'Affordability (1-3)'
  customer_support?: string; // From CSV 'Customer Support (1-3)'
  speed_of_setup?: string; // From CSV 'Speed of Setup (1-3)'
  customization?: string; // From CSV 'Customization (1-3)'
  range_of_services?: string; // From CSV 'Range of Services (1-3)'
  integration?: string; // From CSV 'Integration (1-3)'
  pro_assistance?: string; // From CSV 'Pro. Assistance (1-3)'
  reputation?: string; // From CSV 'Reputation (1-3)'
  reasoning_comp_svc_pkg?: string; // From CSV 'Reasoning: Comp Svc Pkg'
  reasoning_ease_of_use?: string; // From CSV 'Reasoning: Ease of Use'
  reasoning_affordability?: string; // From CSV 'Reasoning: Affordability'
  reasoning_customer_support?: string; // From CSV 'Reasoning: Customer Support'
  reasoning_speed_of_setup?: string; // From CSV 'Reasoning: Speed of Setup'
  reasoning_customization?: string; // From CSV 'Reasoning: Customization'
  reasoning_range_of_services?: string; // From CSV 'Reasoning: Range of Services'
  reasoning_integration?: string; // From CSV 'Reasoning: Integration'
  reasoning_pro_assistance?: string; // From CSV 'Reasoning: Pro Assistance'
  reasoning_reputation?: string; // From CSV 'Reasoning: Reputation'
  logo_url?: string;
  type?: string;
  ranking?: number;
  is_premium?: boolean;

  // Allow any other properties potentially added during transformation
  [key: string]: any;
}


export const journeyContentService = {
  // --- Phases ---
  async getPhases() {
    console.log("Fetching journey phases...");
    const { data, error } = await supabase
      .from('journey_phases')
      .select('*')
      // Use order_index primarily, fall back to order if needed, then name
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching phases:', error.message);
      throw new Error(`Failed to fetch phases: ${error.message}`);
    }
    console.log("Phases fetched:", data?.length);
    return data || [];
  },
  // Upserts phase based on name
  async upsertPhase(phase: { name: string; order?: number; order_index?: number; [key: string]: any }) {
    console.log("Upserting phase:", phase.name);
    // Ensure name is provided and not empty
    if (!phase.name || phase.name.trim() === '') {
        // This case should ideally be caught earlier, but throw here for safety
        throw new Error('Phase name is required and cannot be empty for upsert.');
    }
    const { data, error } = await supabase
      .from('journey_phases')
      .upsert([phase], { onConflict: 'name' }) // Assumes 'name' has a unique constraint
      .select()
      .single();

    if (error) {
      console.error('Error upserting phase:', error.message);
      throw new Error(`Failed to upsert phase "${phase.name}": ${error.message}`);
    }
    console.log("Phase upserted:", data);
    return data;
  },
  async updatePhase(phaseId: string, updates: Record<string, any>) {
    console.log("Updating phase:", phaseId, "with", updates);
    const { data, error } = await supabase
      .from('journey_phases')
      .update(updates)
      .eq('id', phaseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating phase:', error.message);
      throw new Error(`Failed to update phase ${phaseId}: ${error.message}`);
    }
    console.log("Phase updated:", data);
    return data;
  },
  async deletePhase(phaseId: string) {
    console.log("Deleting phase:", phaseId);
    const { error } = await supabase
      .from('journey_phases')
      .delete()
      .eq('id', phaseId);

    if (error) {
      console.error('Error deleting phase:', error.message);
      throw new Error(`Failed to delete phase ${phaseId}: ${error.message}`);
    }
    console.log("Phase deleted successfully:", phaseId);
    return true;
  },

  // --- Steps ---
  async getSteps(phaseId: string) {
    console.log("Fetching steps for phase:", phaseId);
    const { data, error } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('phase_id', phaseId)
      // Use order_index primarily, fall back to order if needed, then name
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching steps:', error.message);
      return []; // Return empty array on error
    }
    console.log("Steps fetched:", data?.length);
    return data || [];
  },
  // Upserts step based on phase_id and name
  async upsertStep(phaseId: string, step: { name: string; order?: number; order_index?: number; [key: string]: any }) {
    console.log("Upserting step:", step.name, "for phase:", phaseId);
     // Ensure phaseId and name are provided and not empty
     if (!phaseId || !step.name || step.name.trim() === '') {
        // This case should ideally be caught earlier, but throw here for safety
        throw new Error('Phase ID and Step name are required and cannot be empty for upsert.');
     }
    const stepData = { ...step, phase_id: phaseId };
    const { data, error } = await supabase
      .from('journey_steps')
      .upsert([stepData], { onConflict: 'phase_id, name' }) // Assumes unique constraint on (phase_id, name)
      .select()
      .single();

    if (error) {
      console.error('Error upserting step:', error.message);
      throw new Error(`Failed to upsert step "${step.name}" in phase ${phaseId}: ${error.message}`);
    }
    console.log("Step upserted:", data);
    return data;
  },
  async updateStep(stepId: string, updates: Record<string, any>) {
    console.log("Updating step:", stepId, "with", updates);
    const { data, error } = await supabase
      .from('journey_steps')
      .update(updates)
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      console.error('Error updating step:', error.message);
      throw new Error(`Failed to update step ${stepId}: ${error.message}`);
    }
    console.log("Step updated:", data);
    return data;
  },
  async deleteStep(stepId: string) {
    console.log("Deleting step:", stepId);
    const { error } = await supabase
      .from('journey_steps')
      .delete()
      .eq('id', stepId);

    if (error) {
      console.error('Error deleting step:', error.message);
      throw new Error(`Failed to delete step ${stepId}: ${error.message}`);
    }
    console.log("Step deleted successfully:", stepId);
    return true;
  },

  // --- Tools (journey_step_tools) ---
  async getTools(stepId: string) {
    console.log("Fetching tools for step:", stepId);
    const { data, error } = await supabase
      .from('journey_step_tools')
      .select('*')
      .eq('step_id', stepId)
      .order('ranking', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tools for step:', error.message);
      throw new Error(`Failed to fetch tools for step ${stepId}: ${error.message}`);
    }
    console.log("Tools fetched for step:", data?.length);
    return data || [];
  },
  // Upserts a tool directly linked to a step based on step_id and name
  async upsertToolForStep(stepId: string, tool: { name: string; url?: string; [key: string]: any }) {
     console.log("Upserting tool:", tool.name, "for step:", stepId);
     // Ensure stepId and name are provided and not empty
     if (!stepId || !tool.name || tool.name.trim() === '') {
        // This case should ideally be caught earlier, but throw here for safety
        throw new Error('Step ID and Tool name are required and cannot be empty for upsert.');
     }
     // Ensure URL is at least an empty string if not provided, as it might be NOT NULL in DB
     const toolData = { ...tool, step_id: stepId, url: tool.url ?? '' };
     const { data, error } = await supabase
       .from('journey_step_tools')
       .upsert([toolData], { onConflict: 'step_id, name' }) // Assumes unique constraint on (step_id, name)
       .select()
       .single();

     if (error) {
       console.error('Error upserting tool for step:', error.message);
       throw new Error(`Failed to upsert tool "${tool.name}" for step ${stepId}: ${error.message}`);
     }
     console.log("Tool upserted for step:", data);
     return data;
   },
  async updateTool(toolId: string, updates: Record<string, any>) {
    console.log("Updating tool:", toolId, "with", updates);
    const { data, error } = await supabase
      .from('journey_step_tools')
      .update(updates)
      .eq('id', toolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tool:', error.message);
      throw new Error(`Failed to update tool ${toolId}: ${error.message}`);
    }
    console.log("Tool updated:", data);
    return data;
  },
  async deleteTool(toolId: string) {
    console.log("Deleting tool:", toolId);
    const { error } = await supabase
      .from('journey_step_tools')
      .delete()
      .eq('id', toolId);

    if (error) {
      console.error('Error deleting tool:', error.message);
      throw new Error(`Failed to delete tool ${toolId}: ${error.message}`);
    }
    console.log("Tool deleted successfully.");
    return true;
  },

  // --- Resources, Tips, Checklists (TODO) ---
  // ...

  // --- Import Function ---
  async importWithMapping(
    sheetType: 'phase_step' | 'tool' | 'mixed' | 'unknown', // Use type passed from component
    transformedRows: TransformedRowData[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    console.log(`Starting import for sheet type: ${sheetType}`);
    const totalOperations = transformedRows.length;
    let completedOperations = 0;

    const updateProgress = () => {
      completedOperations++;
      if (onProgress) {
        const progress = totalOperations > 0 ? Math.round((completedOperations / totalOperations) * 100) : 100;
        onProgress(progress);
      }
    };

    const phaseOrderToIdMap = new Map<number, string>();
    const stepOrderToIdMap = new Map<number, string>(); // Map CSV Step Order to DB Step ID

    // --- Process Phases and Steps First (if applicable) ---
    if (sheetType === 'phase_step' || sheetType === 'mixed') {
      console.log("Processing Phases and Steps...");
      for (const row of transformedRows) {
        try {
          const phaseOrder = row.csv_phase_order;
          const phaseName = row.csv_phase_name;
          const stepOrder = row.csv_step_order;
          const stepName = row.name; // Mapped from 'Task'

          // Validation for required fields
          if (phaseOrder === undefined || !phaseName || phaseName.trim() === '' ||
              stepOrder === undefined || !stepName || stepName.trim() === '') {
            console.warn('Skipping row due to missing/empty required order/name fields:', row);
            updateProgress();
            continue;
          }

          let phaseId = phaseOrderToIdMap.get(phaseOrder);

          // 1. Upsert Phase if not already processed
          if (!phaseId) {
             console.log(`Phase order ${phaseOrder} not seen, upserting phase: ${phaseName}`);
             const phaseData = {
               name: phaseName, // Already checked non-empty
               order: phaseOrder,
               order_index: phaseOrder,
               description: row.description,
               icon: row.icon,
               color: row.color
             };
             Object.keys(phaseData).forEach(key => (phaseData as any)[key] === undefined && delete (phaseData as any)[key]);
             const newPhase = await this.upsertPhase(phaseData);
             phaseId = newPhase.id;
             phaseOrderToIdMap.set(phaseOrder, phaseId);
             console.log(`Upserted phase ${phaseName} with ID ${phaseId}`);
          }

          // 2. Upsert Step
          console.log(`Upserting step: ${stepName} (CSV Order: ${stepOrder}) for phase ID: ${phaseId}`);
          const stepFields = {
            name: stepName, // Already checked non-empty
            phase_id: phaseId,
            order: stepOrder,
            order_index: stepOrder,
            description: row.description,
            guidance: row.guidance,
            estimated_duration: row.estimated_duration,
            required: row.required,
            is_company_formation_step: row.is_company_formation_step,
            ask_wheel_enabled: row.ask_wheel_enabled,
            ask_expert_enabled: row.ask_expert_enabled,
            use_tool_enabled: row.use_tool_enabled,
            diy_enabled: row.diy_enabled,
            need_to_do: row.need_to_do,
            need_explanation: row.need_explanation,
            dedicated_tool: row.dedicated_tool,
            tool_explanation: row.tool_explanation,
            steps_without_tool: row.steps_without_tool,
            effort_difficulty: row.effort_difficulty,
            staff_freelancers: row.staff_freelancers,
            key_considerations: row.key_considerations,
            bootstrap_mindset: row.bootstrap_mindset,
            founder_skills: row.founder_skills
          };
          Object.keys(stepFields).forEach(key => (stepFields as any)[key] === undefined && delete (stepFields as any)[key]);
          const newStep = await this.upsertStep(phaseId, stepFields);
          stepOrderToIdMap.set(stepOrder, newStep.id);

          updateProgress();

        } catch (rowError: any) {
          console.error(`Error processing phase/step row: ${JSON.stringify(row)}`, rowError.message);
          updateProgress();
          continue;
        }
      }
      console.log("Phases and Steps processing finished.");
      console.log("Phase Map (CSV Order -> ID):", phaseOrderToIdMap);
      console.log("Step Map (CSV Order -> ID):", stepOrderToIdMap);
    }

    // --- Process Tools (if applicable) ---
    if (sheetType === 'tool' || sheetType === 'mixed') {
      console.log("Processing Tools...");

      // Build step map from DB if only importing tools
      if (sheetType === 'tool' && stepOrderToIdMap.size === 0) {
          console.log("Fetching existing steps to build ID map for tool linking...");
          const allPhases = await this.getPhases();
          for (const phase of allPhases) {
              const steps = await this.getSteps(phase.id);
              for (const step of steps) {
                  const orderKey = step.order_index ?? step.order;
                  if (orderKey !== undefined && orderKey !== null) {
                      if (!stepOrderToIdMap.has(orderKey)) {
                         stepOrderToIdMap.set(orderKey, step.id);
                      } else {
                          console.warn(`Duplicate step order key ${orderKey} found while building map. Using first encountered ID: ${stepOrderToIdMap.get(orderKey)}`);
                      }
                  }
              }
          }
          console.log("Step ID map built from existing data:", stepOrderToIdMap.size, "entries");
      }

      for (const row of transformedRows) {
         const toolName = row.name; // Mapped from 'Tool (Name)'
         const stepOrder = row.csv_step_order;

         // Skip if essential tool info is missing for this row
         if (!toolName || toolName.trim() === '' || stepOrder === undefined) {
             if (sheetType === 'tool') updateProgress();
             continue;
         }

         try {
             const stepId = stepOrderToIdMap.get(stepOrder);
             if (!stepId) {
                 console.warn(`Could not find step ID for step order ${stepOrder} in map. Skipping tool: ${toolName}`);
                 if (sheetType === 'tool') updateProgress();
                 continue;
             }

             console.log(`Upserting tool: ${toolName} for step ID: ${stepId} (CSV Step Order: ${stepOrder})`);
             const toolData = {
                 name: toolName, // Already checked non-empty
                 description: row.description,
                 url: row.url, // Null check handled in upsertToolForStep
                 category: row.category,
                 subcategory: row.subcategory,
                 pros: row.pros,
                 cons: row.cons,
                 customer_stage: row.customer_stage,
                 founded: row.founded,
                 last_funding_round: row.last_funding_round,
                 comp_svc_pkg: row.comp_svc_pkg,
                 ease_of_use: row.ease_of_use,
                 affordability: row.affordability,
                 customer_support: row.customer_support,
                 speed_of_setup: row.speed_of_setup,
                 customization: row.customization,
                 range_of_services: row.range_of_services,
                 integration: row.integration,
                 pro_assistance: row.pro_assistance,
                 reputation: row.reputation,
                 reasoning_comp_svc_pkg: row.reasoning_comp_svc_pkg,
                 reasoning_ease_of_use: row.reasoning_ease_of_use,
                 reasoning_affordability: row.reasoning_affordability,
                 reasoning_customer_support: row.reasoning_customer_support,
                 reasoning_speed_of_setup: row.reasoning_speed_of_setup,
                 reasoning_customization: row.reasoning_customization,
                 reasoning_range_of_services: row.reasoning_range_of_services,
                 reasoning_integration: row.reasoning_integration,
                 reasoning_pro_assistance: row.reasoning_pro_assistance,
                 reasoning_reputation: row.reasoning_reputation,
                 logo_url: row.logo_url,
                 type: row.type,
                 ranking: row.ranking,
                 is_premium: row.is_premium
             };
             Object.keys(toolData).forEach(key => (toolData as any)[key] === undefined && delete (toolData as any)[key]);

             // No need for extra null check here, upsertToolForStep handles it
             await this.upsertToolForStep(stepId, toolData);

             if (sheetType === 'tool') updateProgress();

         } catch (toolError: any) {
             console.error(`Error processing tool row: ${JSON.stringify(row)}`, toolError.message);
             if (sheetType === 'tool') updateProgress();
             continue;
         }
      }
      console.log("Tools processing finished.");
    }

    if (onProgress) onProgress(100);
    console.log("Import process finished completely.");
  },

  async exportToExcel() {
    // TODO: Export journey content to Excel/CSV
  },

  // Linking/Unlinking Tasks
  async linkTaskToStep(taskId: string, stepId: string) {
    // TODO: Link a task to a journey step
  },
  async unlinkTaskFromStep(taskId: string, stepId: string) {
    // TODO: Unlink a task from a journey step
  },

};
