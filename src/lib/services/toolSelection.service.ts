import { supabase } from "../supabase";
import { ScorecardCriterion } from "../../components/company/journey/ToolSelector/ScorecardBuilder";
import { PersonalizedToolRecommendation } from "../types/journey-steps.types";

/**
 * Get tools associated with a specific step
 * 
 * Retrieves all tools that are recommended for a particular journey step
 */
export async function getStepTools(stepId: string) {
  return supabase
    .from("journey_step_tools")
    .select("*")
    .eq("step_id", stepId)
    .order("ranking", { ascending: true });
}

/**
 * Get personalized tool recommendations for a company and step
 * 
 * This uses the enhanced database function that takes into account:
 * - Company profile and industry
 * - Step requirements and goals
 * - Company's previous tool selections
 * - Similar companies' tool choices
 */
export async function getPersonalizedToolRecommendations(companyId: string, stepId: string) {
  try {
    return supabase.rpc("get_personalized_tool_recommendations", { 
      company_id: companyId, 
      step_id: stepId 
    });
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    // Fallback to standard recommendations if personalized function fails
    return getStepTools(stepId);
  }
}

/**
 * Get custom tools that a company has added for a specific step
 */
export async function getCompanyCustomTools(companyId: string, stepId: string) {
  return supabase
    .from("company_custom_tools")
    .select("*")
    .eq("company_id", companyId)
    .eq("step_id", stepId);
}

/**
 * Add a custom tool for a company's step
 * 
 * This allows companies to add tools that aren't in our standard database
 */
export async function addCompanyCustomTool(
  companyId: string, 
  stepId: string, 
  tool: { name: string; url: string; description?: string; logo_url?: string }
) {
  return supabase
    .from("company_custom_tools")
    .insert([{ 
      ...tool, 
      company_id: companyId, 
      step_id: stepId,
      added_at: new Date().toISOString()
    }]);
}

/**
 * Save a scorecard definition for evaluating tools
 * 
 * Scorecards provide criteria for comparing different tools
 */
export async function saveScorecardDefinition(
  companyId: string, 
  toolId: string, 
  stepId: string, 
  criteria: ScorecardCriterion[], 
  userId: string, 
  name: string
) {
  return supabase
    .from("company_tool_scorecards")
    .insert([{
      company_id: companyId,
      tool_id: toolId,
      step_id: stepId,
      created_by: userId,
      name,
      criteria,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    }]);
}

/**
 * Get scorecard definitions for a company and step
 */
export async function getScorecardDefinitions(companyId: string, stepId: string) {
  return supabase
    .from("company_tool_scorecards")
    .select("*")
    .eq("company_id", companyId)
    .eq("step_id", stepId);
}

/**
 * Save a tool evaluation based on a scorecard
 */
export async function saveToolEvaluation(
  scorecardId: string, 
  toolId: string, 
  userId: string, 
  responses: Record<string, any>, 
  notes: string
) {
  return supabase
    .from("company_tool_scorecard_responses")
    .insert([{
      scorecard_id: scorecardId,
      tool_id: toolId,
      user_id: userId,
      responses,
      notes,
      evaluated_at: new Date().toISOString()
    }]);
}

/**
 * Get all evaluations for a specific tool and step
 */
export async function getToolEvaluations(toolId: string, stepId: string) {
  // Join with users and scorecards for richer data
  return supabase
    .from("company_tool_scorecard_responses as resp")
    .select(`
      *,
      user:users(id, full_name, avatar_url),
      scorecard:company_tool_scorecards(*)
    `)
    .eq("resp.tool_id", toolId)
    .eq("scorecard.step_id", stepId);
}

/**
 * Upload a document related to a tool evaluation
 * 
 * These could be screenshots, PDFs, or other materials
 */
export async function uploadToolDocument(
  companyId: string, 
  toolId: string, 
  userId: string, 
  fileUrl: string, 
  fileType?: string, 
  description?: string
) {
  return supabase
    .from("company_tool_documents")
    .insert([{
      company_id: companyId,
      tool_id: toolId,
      user_id: userId,
      file_url: fileUrl,
      file_type: fileType,
      description,
      uploaded_at: new Date().toISOString()
    }]);
}

/**
 * Get all documents uploaded for a tool
 */
export async function getToolDocuments(toolId: string) {
  return supabase
    .from("company_tool_documents")
    .select(`
      *,
      user:users(id, full_name, avatar_url)
    `)
    .eq("tool_id", toolId);
}

/**
 * Select a tool to use for a specific step
 * 
 * This marks the company's final selection
 */
export async function selectCompanyToolForStep(
  companyId: string, 
  stepId: string, 
  toolId: string
) {
  return supabase
    .from("company_journey_step_tools")
    .upsert([{
      company_id: companyId,
      step_id: stepId,
      tool_id: toolId,
      selected_at: new Date().toISOString()
    }], { 
      onConflict: "company_id,step_id" 
    });
}

/**
 * Get all tools selected by a company across all steps
 */
export async function getAllCompanySelectedTools(companyId: string) {
  return supabase
    .from("company_journey_step_tools as sel")
    .select(`
      *,
      step:journey_steps_enhanced(*),
      tool:journey_step_tools(*)
    `)
    .eq("sel.company_id", companyId);
}

/**
 * Find similar companies using the same tools
 * 
 * This helps with building community insights
 */
export async function getSimilarCompaniesUsingTool(
  companyId: string,
  toolId: string,
  limit: number = 5
) {
  return supabase.rpc("get_similar_companies_using_tool", {
    p_company_id: companyId,
    p_tool_id: toolId,
    p_limit: limit
  });
}

/**
 * Compare usage statistics between tools across all companies
 * 
 * This provides aggregate insights about tool popularity
 */
export async function compareToolUsageStatistics(toolIds: string[]) {
  return supabase.rpc("compare_tool_usage_statistics", {
    p_tool_ids: toolIds
  });
}

export default {
  getStepTools,
  getPersonalizedToolRecommendations,
  getCompanyCustomTools,
  addCompanyCustomTool,
  saveScorecardDefinition,
  getScorecardDefinitions,
  saveToolEvaluation,
  getToolEvaluations,
  uploadToolDocument,
  getToolDocuments,
  selectCompanyToolForStep,
  getAllCompanySelectedTools,
  getSimilarCompaniesUsingTool,
  compareToolUsageStatistics
};
