// User role types
export type UserRoleType = 'founder' | 'company_member' | 'service_provider';

// Company stage types
export type CompanyStageType = 'idea_stage' | 'solid_idea' | 'existing_company';

// Setup progress type
export interface SetupProgressType {
  current_step?: string;
  completed_steps?: string[];
  form_data?: Record<string, any>;
  skipped?: boolean;
  skipped_at?: string;
}

// Enhanced profile type
export interface EnhancedProfileType {
  id?: number;
  user_id: string;
  primary_role?: UserRoleType;
  additional_roles?: UserRoleType[];
  company_stage?: CompanyStageType;
  industry?: string;
  skill_level?: string;
  goals?: string[];
  preferred_theme?: string;
  notification_preferences?: Record<string, boolean>;
  service_categories?: string[];
  expertise?: string[];
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
  setup_progress?: SetupProgressType;
  created_at?: string;
  updated_at?: string;
}

// Company invitation type
export interface CompanyInvitationType {
  id: number;
  company_id: string;
  code: string;
  email?: string;
  role?: string;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  expires_at?: string;
  used_by?: string;
  used_at?: string;
}

// Company member type
export interface CompanyMembershipType {
  id: number;
  company_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  companies?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    size?: string;
    stage?: string;
  };
}
