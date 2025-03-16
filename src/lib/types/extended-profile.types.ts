import { UserProfile } from './profile.types';

export interface ExtendedUserProfile extends UserProfile {
  company_id?: string;
  company_name?: string;
  company_role?: string;
  company_logo_url?: string;
  company_description?: string;
  company_industry?: string;
  company_size?: string;
  company_stage?: string;
  company_website?: string;
  company_founded_date?: string;
  company_location?: string;
  company_mission?: string;
  company_vision?: string;
  company_values?: string[];
  company_products?: string[];
  company_services?: string[];
  company_target_market?: string;
  company_competitors?: string[];
  company_funding_status?: string;
  company_funding_amount?: number;
  company_funding_rounds?: number;
  company_investors?: string[];
  company_team_size?: number;
  company_team_members?: {
    id: string;
    name: string;
    role: string;
    avatar_url?: string;
  }[];
  company_metrics?: Record<string, any>;
  company_goals?: {
    id: string;
    title: string;
    description?: string;
    status: 'not_started' | 'in_progress' | 'completed';
    due_date?: string;
  }[];
  company_settings?: Record<string, any>;
}
