import { supabase } from "@/lib/supabase";
import { DomainStep } from "../types/domain-extended.types";
import stringSimilarity from "string-similarity";
import openai from "@/lib/openai-client"; // Import OpenAI client

// --- GENERIC STUBS FOR ALL REQUIRED EXPORTS ---

/**
 * Get all steps for a domain.
 */
export async function getDomainSteps(domain_id: string, company_id?: string | null) {
  let query = supabase.from("domain_steps").select("*").eq("domain_id", domain_id);
  if (company_id) query = query.eq("company_id", company_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Remove a step from a domain.
 */
export async function removeStepFromDomain(domain_id: string, step_id: string) {
  const { data, error } = await supabase
    .from("domain_steps")
    .delete()
    .eq("domain_id", domain_id)
    .eq("step_id", step_id);
  if (error) throw error;
  return data;
}

/**
 * Get LLM step suggestions for a domain (stub).
 */
export async function getLLMStepSuggestionsForDomain(domain_id: string, company_id?: string | null) {
  // For now, just return empty array or all steps not in the domain
  const allSteps = await supabase.from("journey_steps").select("*");
  const domainSteps = await getDomainSteps(domain_id, company_id);
  const existingStepIds = new Set(domainSteps.map((ds: any) => ds.step_id));
  return (allSteps.data || []).filter((step: any) => !existingStepIds.has(step.id));
}

/**
 * Assign a task to a user (stub).
 */
export async function assignTaskToUser(task_id: string, user_id: string) {
  const { data, error } = await supabase
    .from("domain_tasks")
    .update({ assignee_id: user_id })
    .eq("id", task_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Copy steps from a global domain to a company domain (stub).
 */
export async function copyStepsFromGlobalDomain(global_domain_id: string, company_domain_id: string, company_id: string) {
  const globalSteps = await getDomainSteps(global_domain_id, null);
  const stepIds = globalSteps.map((ds: any) => ds.step_id);
  return await batchAddStepsToDomain(company_domain_id, stepIds, { company_id });
}

/**
 * Get suggested steps for a domain (stub).
 */
export async function getSuggestedStepsForDomain(domain_id: string) {
  // For now, just return all steps not in the domain
  const allSteps = await supabase.from("journey_steps").select("*");
  const domainSteps = await getDomainSteps(domain_id, null);
  const existingStepIds = new Set(domainSteps.map((ds: any) => ds.step_id));
  return (allSteps.data || []).filter((step: any) => !existingStepIds.has(step.id));
}

/**
 * Lock task priority (stub).
 */
export async function lockTaskPriority(step_id: string, priority_order: number) {
  const { data, error } = await supabase
    .from("domain_steps")
    .update({ priority_order, priority_locked: true })
    .eq("id", step_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Unlock task priority (stub).
 */
export async function unlockTaskPriority(step_id: string) {
  const { data, error } = await supabase
    .from("domain_steps")
    .update({ priority_locked: false })
    .eq("id", step_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get task comments (stub).
 */
export async function getTaskComments(task_id: string) {
  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", task_id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Add a comment to a task (stub).
 */
export async function addTaskComment(task_id: string, user_id: string, content: string) {
  const { data, error } = await supabase
    .from("task_comments")
    .insert([{ task_id, user_id, content }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Track a decision event (stub).
 * @param event Object containing event details (type, user_id, domain_id, etc).
 * @returns The created event record or throws on error.
 */
export async function trackDecisionEvent(event: Record<string, any>) {
  const { data, error } = await supabase
    .from("decision_events")
    .insert([event])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- END GENERIC STUBS ---

/**
 * Generate step recommendations for a domain.
 * This is a generic implementation; adjust logic as needed.
 * @param domain_id The domain id.
 * @param options (optional) Additional options for recommendation logic.
 * @returns Array of recommended steps.
 */
export async function generateStepRecommendations(domain_id: string, options: Record<string, any> = {}) {
  // Example: Recommend steps not yet added to the domain, sorted by some criteria
  // 1. Get all steps
  const { data: allSteps, error: stepsError } = await supabase
    .from("journey_steps")
    .select("*");
  if (stepsError) throw stepsError;

  // 2. Get steps already in the domain
  const { data: domainSteps, error: domainStepsError } = await supabase
    .from("domain_steps")
    .select("step_id")
    .eq("domain_id", domain_id);
  if (domainStepsError) throw domainStepsError;

  const existingStepIds = new Set(domainSteps.map((ds: any) => ds.step_id));
  // 3. Recommend steps not yet in the domain
  const recommendations = allSteps.filter((step: any) => !existingStepIds.has(step.id));
  // Optionally, sort or filter further based on options
  return recommendations;
}

/**
 * Add a step to a domain.
 * @param domain_id The domain id.
 * @param step_id The step id.
 * @param fields (optional) Additional fields to set on the domain_step.
 * @returns The created domain_step record or throws on error.
 */
export async function addStepToDomain(domain_id: string, step_id: string, fields: Record<string, any> = {}) {
  const { data, error } = await supabase
    .from("domain_steps")
    .insert([
      {
        domain_id,
        step_id,
        ...fields,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Batch add steps to a domain.
 * @param domain_id The domain id.
 * @param step_ids Array of step ids to add.
 * @param fields (optional) Additional fields to set on each domain_step.
 * @returns Array of created domain_step records or throws on error.
 */
export async function batchAddStepsToDomain(domain_id: string, step_ids: string[], fields: Record<string, any> = {}) {
  const inserts = step_ids.map((step_id) => ({
    domain_id,
    step_id,
    ...fields,
  }));
  const { data, error } = await supabase
    .from("domain_steps")
    .insert(inserts)
    .select();
  if (error) throw error;
  return data;
}

/**
 * Update a domain step by id.
 * @param id The domain_step id.
 * @param fields Fields to update (status, notes, etc).
 * @returns The updated domain_step record or throws on error.
 */
export async function updateDomainStep(id: string, fields: Record<string, any>) {
  const { data, error } = await supabase
    .from("domain_steps")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get priority tasks for a domain or company.
 * This is a generic implementation; adjust table/fields as needed.
 * @param company_id (optional) - filter by company
 * @param domain_id (optional) - filter by domain
 * @returns Array of priority tasks
 */
export async function getPriorityTasks({ company_id, domain_id }: { company_id?: string; domain_id?: string }) {
  let query = supabase.from("domain_tasks").select("*").eq("priority", "high");
  if (company_id) query = query.eq("company_id", company_id);
  if (domain_id) query = query.eq("domain_id", domain_id);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Get all global business domains (where company_id is null).
 */
export async function getGlobalBusinessDomains() {
  const { data, error } = await supabase
    .from("business_domains")
    .select("*")
    .is("company_id", null)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Get all company domains for a given company_id.
 */
export async function getAllCompanyDomains(company_id: string) {
  const { data, error } = await supabase
    .from("business_domains")
    .select("*")
    .eq("company_id", company_id)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Alias for getAllCompanyDomains for compatibility.
 */
export const getAllDomains = getAllCompanyDomains;

/**
 * Get a single company domain by id and company_id.
 */

export async function getCompanyDomainById(id: string, company_id: string) {
  const { data, error } = await supabase
    .from("business_domains")
    .select("*")
    .eq("id", id)
    .eq("company_id", company_id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Alias for getCompanyDomainById for compatibility.
 */
export const getDomainById = getCompanyDomainById;

// ... (existing code above remains unchanged)

/**
 * LLM-powered: Suggest domains for a step using OpenAI, returning ranked suggestions with explanations.
 */
export const getLLMDomainSuggestionsForStep = async (
  stepId: string,
  companyId: string | null
): Promise<{ domain: any; score: number; explanation: string }[]> => {
  // 1. Fetch the step
  const { data: step, error: stepError } = await supabase
    .from("journey_steps")
    .select("*")
    .eq("id", stepId)
    .single();
  if (stepError || !step) {
    console.error("Failed to fetch step for LLM domain suggestions:", stepError);
    return [];
  }

  // 2. Fetch all domains
  const { data: domains, error: domainsError } = await supabase
    .from("business_domains")
    .select("*")
    .is("company_id", companyId);
  if (domainsError || !domains) {
    console.error("Failed to fetch domains for LLM domain suggestions:", domainsError);
    return [];
  }

  // 3. Prepare prompt for OpenAI
  const prompt = `
You are an expert business process analyst. Given the following journey step and a list of possible business domains, rank the domains by their relevance to the step and provide a brief explanation for each score.

Journey Step:
Name: ${step.name}
Description: ${step.description || "N/A"}

Business Domains:
${domains.map((domain, i) => `Domain ${i + 1}:
Name: ${domain.name}
Description: ${domain.description || "N/A"}`).join("\n\n")}

Instructions:
- For each domain, provide a relevance score from 0 to 1 (1 = perfect fit, 0 = not relevant).
- For each domain, provide a 1-2 sentence explanation of the score.
- Return the results as a JSON array of objects: [{domainIndex, score, explanation}].
`;

  // 4. Call OpenAI
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your environment.");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant for business process mapping." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    // Extract JSON from the response
    const responseText = completion.choices[0].message.content || "";
    const jsonStart = responseText.indexOf("[");
    const jsonEnd = responseText.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON array found in LLM response.");
    const jsonString = responseText.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);

    // Map results to domains
    return parsed
      .filter((r: any) => typeof r.domainIndex === "number" && domains[r.domainIndex])
      .map((r: any) => ({
        domain: domains[r.domainIndex],
        score: r.score,
        explanation: r.explanation,
      }))
      .sort((a: any, b: any) => b.score - a.score);
  } catch (err: any) {
    console.error("Failed to get LLM domain suggestions:", err);
    throw new Error(
      "OpenAI LLM call failed: " +
        (err?.message || err?.toString() || "Unknown error. Check your API key and network.")
    );
  }
};

/**
 * Create a new company domain.
 * @param params { name: string, description?: string, company_id?: string }
 * @returns The created domain record or throws on error.
 */
export async function createCompanyDomain(params: { name: string; description?: string; company_id?: string }) {
  const { data, error } = await supabase
    .from("business_domains")
    .insert([
      {
        name: params.name,
        description: params.description || null,
        company_id: params.company_id || null,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Alias for createCompanyDomain for compatibility.
 */
export const createDomain = createCompanyDomain;

/**
 * Update a company domain.
 * @param id The domain id.
 * @param fields Fields to update (name, description, etc).
 * @returns The updated domain record or throws on error.
 */
export async function updateCompanyDomain(id: string, fields: { name?: string; description?: string; company_id?: string }) {
  const { data, error } = await supabase
    .from("business_domains")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Alias for updateCompanyDomain for compatibility.
 */
export const updateDomain = updateCompanyDomain;

/**
 * Delete a company domain.
 * @param id The domain id.
 * @returns The deleted domain record or throws on error.
 */

export async function deleteCompanyDomain(id: string) {
  const { data, error } = await supabase
    .from("business_domains")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Alias for deleteCompanyDomain for compatibility.
 */
export const deleteDomain = deleteCompanyDomain;

/**
 * Add a dependency between two steps (e.g., consideration, relates_to, is_sub_task_of).
 * @param task_id The step that has the dependency (e.g., the main step).
 * @param depends_on_task_id The step being considered/related/sub-tasked.
 * @param type The type of dependency ('consideration', 'relates_to', 'is_sub_task_of', etc).
 * @returns The created dependency record or throws on error.
 */
export async function addTaskDependency(
  task_id: string,
  depends_on_task_id: string,
  type: string = "consideration"
) {
  const { data, error } = await supabase
    .from("task_dependencies")
    .insert([
      {
        task_id,
        depends_on_task_id,
        type,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Add a sub-task relationship between two steps.
 * @param parent_task_id The parent step id.
 * @param sub_task_id The sub-task step id.
 * @returns The created dependency record or throws on error.
 */
export async function addSubTaskDependency(
  parent_task_id: string,
  sub_task_id: string
) {
  const { data, error } = await supabase
    .from("task_dependencies")
    .insert([
      {
        task_id: parent_task_id,
        depends_on_task_id: sub_task_id,
        type: "is_sub_task_of",
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Remove a sub-task relationship by dependency id.
 * @param dependencyId The id of the dependency row.
 * @returns The deleted dependency record or throws on error.
 */
export async function removeSubTaskDependency(dependencyId: string) {
  const { data, error } = await supabase
    .from("task_dependencies")
    .delete()
    .eq("id", dependencyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ... (rest of the file unchanged)
