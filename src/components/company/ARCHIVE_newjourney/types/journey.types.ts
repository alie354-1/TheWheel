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
  description: string;
  phase_id: string;
  domain_id: string;
  suggested_order_index?: number;
  estimated_time_days?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  startup_principle_id?: string;
  methodology_category?: string;
  objectives?: string;
  success_criteria?: any;
  deliverables?: any;
  guidance?: string;
  resources?: any;
  applicability_criteria?: any;
  target_company_stages?: any;
  target_industries?: any;
  is_core_step?: boolean;
  usage_frequency?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
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
