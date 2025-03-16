export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'superadmin';
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
}

export interface FeatureFlags {
  [key: string]: {
    enabled: boolean;
    visible: boolean;
  };
}
