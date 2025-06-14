/**
 * Journey System Types (Step-Centered)
 * Matches the canonical schema for phases, domains, steps, tools, and step_tools.
 */

export interface Phase {
  id: string;
  key: string;
  name: string;
}

export interface Domain {
  id: string;
  key: string;
  name: string;
}

export interface Step {
  id: string;
  name: string;
  primary_phase_id: string;
  primary_domain_id: string;
  secondary_phase_id?: string;
  secondary_domain_id?: string;
  description: string;
  difficulty: 'Low' | 'Medium' | 'High';
  time_estimate: string;
  coverage_notes: string;
  howto_without_tools: string;
  audience: string;
  active: boolean;
  snippet_references: string[];
  resource_links: string[];
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  summary: string;
  pros: string[];
  cons: string[];
  usual_customer_stage: string;
  founded?: string;
  last_funding_round?: string;
  comp_svc_pkg: number;
  ease_of_use: number;
  affordability: number;
  customer_support: number;
  speed_of_setup: number;
  customization: number;
  range_of_services: number;
  integration: number;
  pro_assistance: number;
  reputation: number;
  reasoning_comp_svc_pkg: string;
  reasoning_ease_of_use: string;
  reasoning_affordability: string;
  reasoning_customer_support: string;
  reasoning_speed_of_setup: string;
  reasoning_customization: string;
  reasoning_range_of_services: string;
  reasoning_integration: string;
  reasoning_pro_assistance: string;
  reasoning_reputation: string;
  created_at: string;
}

export interface StepTool {
  step_id: string;
  tool_id: string;
}
