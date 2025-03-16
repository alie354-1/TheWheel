/**
 * Multi-Persona Profile System Type Definitions
 * 
 * This file contains all type definitions for the multi-persona profile system,
 * enabling users to maintain separate professional identities within the platform.
 */

/*** CORE IDENTITY MODULE ***/

/**
 * Core identity information shared across all personas
 */
export interface CoreIdentity {
  id: string;                    // Primary identifier (matches auth.users)
  email: string;                 // Primary email
  secondary_emails?: string[];   // Backup emails for notifications/recovery
  full_name: string | null;      // User's full name
  display_name?: string;         // How the user prefers to be addressed
  avatar_url?: string | null;    // Profile picture URL
  bio?: string;                  // Short personal description
  pronouns?: string;             // Preferred pronouns
  verified: boolean;             // Email verification status
  account_created_at: string;    // ISO timestamp
  last_active_at?: string;       // For activity tracking
  locale?: string;               // Language/region preference (i18n)
  timezone?: string;             // For time-sensitive features
  accessibility_needs?: string[];// For inclusive design
  account_status: 'active' | 'inactive' | 'suspended' | 'deleted';
}

/*** PROFESSIONAL IDENTITY MODULE ***/

/**
 * Professional identity information
 */
export interface ProfessionalIdentity {
  // Career Information
  title?: string;                // Job title
  industry?: string;             // Primary industry
  secondary_industries?: string[]; // Additional industries of interest
  role_category?: RoleCategory;  // Founder/Member/Provider/Investor
  role_subcategory?: string;     // Specific role within category
  
  // Skills & Expertise
  skills?: Skill[];              // Array of skills with proficiency levels
  expertise_areas?: string[];    // Domains of expertise
  experience_level?: ExperienceLevel; // Overall seniority
  certifications?: Certification[]; // Professional certifications
  
  // Background
  education?: Education[];       // Academic background
  work_history?: WorkExperience[]; // Professional experience
  founding_history?: FoundingExperience[]; // Previous startups
  
  // Professional preferences
  mentorship_status?: 'seeking' | 'offering' | 'both' | 'none'; // Mentorship interest
  collaboration_interests?: string[]; // Types of collaborations interested in
  investment_interests?: InvestmentInterest[]; // For investors
  service_offerings?: ServiceOffering[]; // For service providers
}

export enum RoleCategory {
  FOUNDER = 'FOUNDER',
  COMPANY_MEMBER = 'COMPANY_MEMBER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  INVESTOR = 'INVESTOR',
  ADVISOR = 'ADVISOR',
  COMMUNITY_MEMBER = 'COMMUNITY_MEMBER',
  CUSTOM = 'CUSTOM'
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface Skill {
  name: string;
  proficiency: ExperienceLevel;
  years_experience?: number;
  last_used?: string;           // ISO date when last professionally used
}

export interface Certification {
  name: string;
  issuer: string;
  date_earned: string;          // ISO date
  expiration_date?: string;     // ISO date if applicable
  verification_url?: string;    // Link to verify certification
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;           // ISO date
  end_date?: string;            // ISO date or 'present'
  achievements?: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  description?: string;
  start_date: string;           // ISO date
  end_date?: string;            // ISO date or 'present'
  is_current: boolean;
  achievements?: string[];
  references?: Reference[];     // Professional references
}

export interface Reference {
  name: string;
  title?: string;
  company?: string;
  contact?: string;
  relationship: string;
}

export interface FoundingExperience {
  company_name: string;
  industry: string;
  role: string;
  start_date: string;
  end_date?: string;
  current_status: 'operating' | 'acquired' | 'merged' | 'closed';
  funding_raised?: number;
  exit_valuation?: number;
  team_size?: number;
  description?: string;
}

export interface InvestmentInterest {
  stage: string[];             // Pre-seed, Seed, Series A, etc.
  amount_range: {
    min?: number;
    max?: number;
  };
  industries: string[];
  thesis?: string;             // Investment philosophy
}

export interface ServiceOffering {
  category: string;
  description: string;
  expertise_level: ExperienceLevel;
  rate_type: 'hourly' | 'project' | 'retainer';
  availability: 'part_time' | 'full_time' | 'contract';
}

/*** NETWORK & SOCIAL MODULE ***/

/**
 * Network and social information
 */
export interface NetworkIdentity {
  // Network Connections
  connections?: Connection[];     // Platform connections
  connection_groups?: Group[];    // Organized connection groups
  followers_count?: number;
  following_count?: number;
  blocked_users?: string[];      // IDs of blocked users
  
  // Social Properties
  social_links?: SocialLink[];   // External social profiles
  public_visibility?: Visibility; // Profile visibility settings
  contact_preferences?: ContactPreferences; // How to be reached
  endorsements?: Endorsement[];  // Skills endorsements from others
  testimonials?: Testimonial[];  // Recommendations from others
  
  // Community Engagement
  community_roles?: string[];    // Roles in platform communities
  contributions?: Contribution[]; // Platform contributions
  reputation_score?: number;     // Based on platform activities
  karma_points?: number;         // Community recognition
  badges?: Badge[];              // Achievements and recognitions
}

export interface Connection {
  user_id: string;
  relationship: 'colleague' | 'mentor' | 'mentee' | 'investor' | 'partner' | 'other';
  connected_at: string;         // ISO timestamp
  notes?: string;               // Private connection notes
}

export interface Group {
  name: string;
  members: string[];            // User IDs
  description?: string;
}

export interface SocialLink {
  platform: string;             // LinkedIn, Twitter, GitHub, etc.
  url: string;
  username?: string;
  verified: boolean;            // Whether ownership is verified
}

export interface Visibility {
  profile_discoverable: boolean; // Can be found in search
  show_email: boolean;
  show_skills: boolean;
  show_experience: boolean;
  show_education: boolean;
  show_investments: boolean;
  show_services: boolean;
  show_connections: boolean;
}

export interface ContactPreferences {
  allow_direct_messages: boolean;
  allow_connection_requests: boolean;
  allow_meeting_requests: boolean;
  preferred_contact_method?: 'email' | 'platform' | 'phone';
  response_time_expectation?: string; // E.g., "Within 48 hours"
}

export interface Endorsement {
  skill: string;
  endorsed_by: string;          // User ID
  endorsed_at: string;          // ISO timestamp
  strength?: ExperienceLevel;
}

export interface Testimonial {
  content: string;
  author_id: string;
  created_at: string;           // ISO timestamp
  relationship: string;
  is_public: boolean;
}

export interface Contribution {
  type: 'article' | 'event' | 'resource' | 'comment' | 'question' | 'answer';
  id: string;                   // Reference to the contribution
  created_at: string;           // ISO timestamp
  engagement_metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  awarded_at: string;           // ISO timestamp
  category: 'achievement' | 'participation' | 'expertise' | 'special';
}

/*** COMPANY AFFILIATION MODULE ***/

/**
 * Company affiliation information
 */
export interface CompanyAffiliations {
  // Primary Company
  primary_company_id?: string;
  primary_company_role?: string;
  primary_company_title?: string;
  primary_company_join_date?: string; // ISO date
  
  // Additional Companies
  companies?: CompanyAssociation[];
  past_companies?: CompanyAssociation[];
  
  // Company Relationships
  reports_to?: string;          // User ID of manager
  direct_reports?: string[];    // User IDs of those reporting to this user
  team_id?: string;             // Team within company
  department?: string;          // Department within company
  
  // Company-specific
  employee_id?: string;         // Company's internal ID
  access_level?: string;        // Company system access level
  authorized_features?: string[]; // Company features this user can access
}

export interface CompanyAssociation {
  company_id: string;
  role: string;
  title?: string;
  relationship_type: 'employee' | 'founder' | 'advisor' | 'investor' | 'board' | 'contractor';
  start_date: string;           // ISO date
  end_date?: string;            // ISO date if applicable
  ownership_stake?: number;     // Percentage ownership if applicable
  is_public: boolean;           // Whether this association is publicly visible
}

/*** PROJECT CONTEXT MODULE ***/

/**
 * Current project context information
 */
export interface ProjectContext {
  // Startup/Idea Context
  current_startup_stage?: 'ideation' | 'validation' | 'early_development' | 'mvp' | 'launch' | 'growth';
  current_company_valuation?: number;
  current_funding_round?: string;
  funding_status?: 'bootstrapped' | 'pre-seed' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'profitable';
  
  // Goals & Metrics
  personal_goals?: Goal[];
  current_okrs?: OKR[];         // Objectives and Key Results
  kpis_tracked?: KPI[];         // Key Performance Indicators
  milestones?: Milestone[];
  
  // Project Focus
  current_challenges?: string[];
  areas_seeking_help?: string[];
  current_priorities?: Priority[];
}

export interface Goal {
  description: string;
  category: 'professional' | 'business' | 'personal' | 'learning';
  target_date?: string;         // ISO date
  progress?: number;            // 0-100 percentage
  status: 'not_started' | 'in_progress' | 'completed' | 'deferred';
}

export interface OKR {
  objective: string;
  key_results: {
    description: string;
    target: number;
    current: number;
    unit: string;
  }[];
  time_frame: string;           // E.g., "Q1 2025"
  status: 'on_track' | 'at_risk' | 'off_track' | 'completed';
}

export interface KPI {
  name: string;
  description?: string;
  current_value: number;
  target_value: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface Milestone {
  name: string;
  description?: string;
  due_date: string;             // ISO date
  status: 'upcoming' | 'in_progress' | 'completed' | 'missed';
  associated_goals?: string[];  // References to related goals
}

export interface Priority {
  task: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'this_week' | 'this_month' | 'this_quarter';
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
}

/*** AI & PERSONALIZATION MODULE ***/

/**
 * AI personalization information
 */
export interface AIPersonalization {
  // Communication Preferences
  communication_style_preference?: 'detailed' | 'concise' | 'visual' | 'technical' | 'simple';
  content_interests?: string[];
  content_format_preferences?: ('text' | 'video' | 'audio' | 'interactive')[];
  
  // AI Interaction History
  interaction_history?: {
    total_conversations?: number;
    frequent_topics?: string[];
    favorite_tools?: string[];
    saved_prompts?: SavedPrompt[];
  };
  
  // Learning & Growth
  learning_path?: {
    current_focus?: string;
    completed_topics?: string[];
    skill_goals?: string[];
    preferred_learning_style?: string;
  };
  
  // Personalization Flags
  feature_usage?: Record<string, {
    last_used?: string;         // ISO timestamp
    usage_count?: number;
    proficiency?: 'novice' | 'intermediate' | 'advanced';
  }>;
  
  // Recommendation Engine Data
  content_engagement?: {
    clicked_topics?: Record<string, number>;
    time_spent?: Record<string, number>; // Seconds spent on topic
    favorited_items?: string[];
  };
}

export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
  tags?: string[];
  created_at: string;
  last_used_at?: string;
  usage_count: number;
}

/*** BILLING & COMPLIANCE MODULE ***/

/**
 * Billing and compliance information
 */
export interface BillingCompliance {
  // Subscription & Billing
  subscription_tier?: 'free' | 'pro' | 'business' | 'enterprise';
  subscription_start_date?: string; // ISO date
  subscription_renewal_date?: string; // ISO date
  billing_cycle?: 'monthly' | 'annual' | 'quarterly';
  payment_method_id?: string;
  
  // Usage & Limits
  usage_metrics?: {
    api_calls?: number;
    storage_used?: number;      // In bytes
    premium_features_used?: string[];
  };
  plan_limits?: {
    max_projects?: number;
    max_storage?: number;       // In bytes
    max_collaborators?: number;
  };
  
  // Legal & Compliance
  terms_accepted?: {
    version: string;
    date_accepted: string;      // ISO timestamp
    ip_address?: string;
  };
  data_processing_consents?: Record<string, {
    consented: boolean;
    date: string;               // ISO timestamp
  }>;
  gdpr_requests?: {
    data_export?: {
      requested_at: string;     // ISO timestamp
      fulfilled_at?: string;    // ISO timestamp
      status: 'pending' | 'processing' | 'completed' | 'denied';
    };
    data_deletion?: {
      requested_at: string;     // ISO timestamp
      fulfilled_at?: string;    // ISO timestamp
      status: 'pending' | 'processing' | 'completed' | 'denied';
    };
  };
}

/*** SYSTEM & METADATA MODULE ***/

/**
 * System and metadata information
 */
export interface SystemMetadata {
  // Version Control
  profile_version: number;      // Incremented on major changes
  last_updated: string;         // ISO timestamp
  update_history?: {
    timestamp: string;          // ISO timestamp
    fields_changed: string[];
    updated_by: 'user' | 'system' | 'admin';
  }[];
  
  // Security
  security_level?: 'standard' | 'enhanced' | 'maximum';
  two_factor_enabled: boolean;
  last_password_change?: string; // ISO timestamp
  login_history?: {
    timestamp: string;          // ISO timestamp
    ip_address: string;
    device_info: string;
    location?: string;
  }[];
  
  // Platform-specific
  is_beta_tester?: boolean;
  feature_flags?: Record<string, boolean>;
  experiment_groups?: string[]; // A/B test groups
  referral_code?: string;
  referred_by?: string;         // User ID who referred them
  
  // Legacy Data
  legacy_user_id?: string;      // ID from previous system if migrated
  imported_from?: string;       // Source of imported data
  import_date?: string;         // ISO timestamp of data import
}

/*** MULTI-PERSONA SYSTEM ***/

/**
 * Complete user profile with multiple personas
 */
export interface UserProfile {
  // Core identity (shared across all personas)
  core: CoreIdentity;
  
  // Primary active persona ID
  active_persona_id?: string;
  
  // Shared metadata and system information
  system: SystemMetadata;
  
  // Global settings that apply across all personas
  global_settings?: {
    default_persona_id?: string;
    auto_switch_personas?: boolean;
    cross_persona_notifications?: boolean;
  };
}

/**
 * Individual persona representing a specific role or identity
 */
export interface Persona {
  id: string;
  user_id: string;              // Reference to the core profile
  name: string;                 // Name for this persona (e.g., "Founder Profile")
  type: 'founder' | 'service_provider' | 'company_member' | 'investor' | 'advisor' | 'community' | 'custom';
  icon?: string;                // Visual identifier
  is_public: boolean;           // Whether this persona is publicly discoverable
  is_active: boolean;           // Whether this persona is currently in use
  created_at: string;           // ISO timestamp
  last_used_at?: string;        // When this persona was last active
  
  // Persona-specific modules
  professional?: ProfessionalIdentity;
  network?: NetworkIdentity;
  company_affiliations?: CompanyAffiliations;
  project_context?: ProjectContext;
  personalization?: AIPersonalization;
  billing?: BillingCompliance;  // Optional for some persona types
  
  // Persona-specific visibility controls
  visibility_settings: {
    discoverable_as: ('founder' | 'service_provider' | 'company_member' | 'investor' | 'advisor')[];
    visible_to: ('public' | 'connections' | 'specific_companies' | 'specific_users')[];
    hidden_fields: string[];    // Fields to hide in this persona
    specific_users?: string[];  // User IDs that can view this persona
    company_specific_views?: {  // Company-specific customizations
      company_id: string;
      visible_fields: string[];
      hidden_fields: string[];
    }[];
  };
}

/*** CONTEXT SWITCHING SYSTEM ***/

/**
 * Rules and history for context-based persona switching
 */
export interface PersonaContextSwitching {
  // Rules for auto-switching between personas
  auto_switch_rules?: {
    context: 'url_path' | 'company_view' | 'feature_usage' | 'time_of_day' | 'referring_site';
    condition: string;          // Pattern to match
    switch_to_persona_id: string;
  }[];
  
  // Default presentation contexts
  context_defaults?: {
    dashboard_persona_id?: string;
    messaging_persona_id?: string;
    directory_persona_id?: string;
    company_specific?: {
      company_id: string;
      persona_id: string;
    }[];
  };
  
  // History tracking for ML-based suggestions
  switching_history?: {
    timestamp: string;          // ISO timestamp
    from_persona_id: string;
    to_persona_id: string;
    trigger: 'manual' | 'auto' | 'rule';
    context?: string;
  }[];
}

/*** ONBOARDING STATE ***/

/**
 * Onboarding state for a specific persona
 */
export interface OnboardingState {
  id: string;
  user_id: string;
  persona_id: string;
  current_step: string;
  completed_steps: string[];
  form_data: Record<string, any>;
  is_complete: boolean;
  last_updated: string;         // ISO timestamp
  metrics?: {
    step_completion_times?: Record<string, string>;
    total_time_spent?: number;  // In seconds
    completion_date?: string;   // ISO timestamp
  };
}

/*** APP SETTINGS (SEPARATED FROM PROFILE) ***/

/**
 * Application settings separated from user profile
 */
export interface AppSettings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    digest: boolean;
  };
  display: {
    compactView: boolean;
    showTips: boolean;
    cardSize: 'small' | 'medium' | 'large';
  };
  features: Record<string, boolean>;
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}
