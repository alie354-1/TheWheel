export interface UserProfile {
  theme?: 'light' | 'dark';
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'superadmin' | 'Platform Admin'; // Add 'Platform Admin'
  is_public: boolean;
  allows_messages: boolean;
  professional_background?: string;
  social_links?: Record<string, string>;
  settings?: Record<string, any>;
  setup_progress?: {
    current_step: string;
    completed_steps: string[];
    form_data: Record<string, any>;
    last_updated?: string;
  };
  // theme?: 'light' | 'dark'; // This was already present, removing duplicate
}

/**
 * User interface matching the new users table schema
 */
export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  email_verified?: boolean;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  metadata?: Record<string, any>;
  // Custom fields for compatibility with legacy profile logic
  setup_progress?: {
    current_step: string;
    completed_steps: string[];
    form_data: Record<string, any>;
    last_updated?: string;
  };
  role?: string;
  is_public?: boolean;
  allows_messages?: boolean;
  professional_background?: string;
  social_links?: Record<string, string>;
}

export interface FeatureFlags {
  [key: string]: {
    enabled: boolean;
    visible: boolean;
  };
}

// Interface for the user_learning_profiles table data
export interface UserLearningProfile {
  user_id: string; // Matches the primary key which is the user's ID
  learning_style_preference?: string | null;
  preferred_content_types?: string[] | null;
  pace_preference?: number | null; // Assuming smallint maps to number
  engagement_level?: number | null; // Assuming float maps to number
  skill_gaps?: Record<string, any> | null; // Assuming jsonb maps to an object
  preferences_payload?: Record<string, any> | null; // Assuming jsonb maps to an object
  created_at: string;
  updated_at: string;
}
