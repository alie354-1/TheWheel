import { supabase } from "../supabase";

// Fetch all phases and steps for a company, including custom steps and progress
export async function getCompanyJourneyBoard(companyId: string) {
  // Fetch phases
  const phasesRes = await supabase.from("journey_phases").select("*").order("order_index", { ascending: true });
  // Fetch steps
  const stepsRes = await supabase.from("journey_steps").select("*");
  // Fetch company progress
  const progressRes = await supabase.from("company_progress").select("*").eq("company_id", companyId);
  // Fetch custom steps
  const customStepsRes = await supabase.from("company_custom_steps").select("*").eq("company_id", companyId);

  return {
    phases: phasesRes.data || [],
    steps: stepsRes.data || [],
    progress: progressRes.data || [],
    customSteps: customStepsRes.data || [],
  };
}

// Update step status, order, notes, parallel, archived
export async function updateCompanyStep(companyId: string, stepId: string, updates: Partial<{
  status: string;
  order_index: number;
  notes: string;
  can_be_parallel: boolean;
  archived: boolean;
}>) {
  return supabase.from("company_progress").update(updates).eq("company_id", companyId).eq("step_id", stepId);
}

// Add a custom step
export async function addCompanyCustomStep(companyId: string, phaseId: string, name: string, description?: string) {
  return supabase.from("company_custom_steps").insert([{ company_id: companyId, phase_id: phaseId, name, description }]);
}

// Update a custom step
export async function updateCompanyCustomStep(stepId: string, updates: Partial<{ name: string; description: string; order_index: number; can_be_parallel: boolean; archived: boolean; }>) {
  return supabase.from("company_custom_steps").update(updates).eq("id", stepId);
}

// Delete a custom step
export async function deleteCompanyCustomStep(stepId: string) {
  return supabase.from("company_custom_steps").delete().eq("id", stepId);
}

// Fetch AI recommendations and Q&A
export async function getCompanyJourneyAIRecommendations(companyId: string) {
  return supabase.from("company_journey_ai_recommendations").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
}

export async function askCompanyJourneyAIQuestion(companyId: string, stepId: string, question: string) {
  // This would call an AI service and store the result
  // For now, just insert the question and a placeholder answer
  return supabase.from("company_journey_ai_questions").insert([{
    company_id: companyId,
    step_id: stepId,
    question,
    answer: "This is a placeholder AI answer. (Replace with real AI integration.)",
    ai_model: "initial-generic"
  }]);
}
