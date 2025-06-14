import { tools } from "../data/placeholder-tools";
import type { Phase, Domain, Step, Tool } from "../types/journey.types";
import { supabase } from "../../../../lib/supabase.ts";

/**
 * JourneyService
 * Provides access to journey data from the database.
 */
export class JourneyService {
  // Fetch phases from the database
  static async getPhases(): Promise<Phase[]> {
    const { data, error } = await supabase.from("journey_phases").select("*");
    if (error) {
      console.error("Failed to fetch phases from DB:", error);
      return [];
    }
    return data as Phase[];
  }

  // Fetch domains from the database
  static async getDomains(): Promise<Domain[]> {
    const { data, error } = await supabase.from("journey_domains").select("*");
    if (error) {
      console.error("Failed to fetch domains from DB:", error);
      return [];
    }
    return data as Domain[];
  }

  // Fetch steps from the database
  static async getSteps(): Promise<Step[]> {
    const { data, error } = await supabase.from("journey_step_templates").select("*");
    if (error) {
      console.error("Failed to fetch steps from DB:", error);
      return [];
    }
    return data as Step[];
  }

  // Fetch a single step by ID from the database
  static async getStepById(stepId: string): Promise<Step | undefined> {
    const { data, error } = await supabase.from("journey_step_templates").select("*").eq("id", stepId).single();
    if (error) {
      console.error("Failed to fetch step from DB:", error);
      return undefined;
    }
    return data as Step;
  }

  static getTools(): Tool[] {
    return tools;
  }

  static getToolsForStep(stepId: string): Tool[] {
    // Placeholder: In a real system, this would use a step_tools mapping.
    // For now, return all tools for demonstration.
    return tools;
  }
}
