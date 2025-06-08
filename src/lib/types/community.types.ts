/**
 * Community Module Types
 * 
 * This file contains TypeScript interfaces and types for the community module.
 * These types are based on the database schema and provide type safety for
 * all community-related operations.
 */

// Enum types from the database schema
export type StartupStage = 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c_plus' | 'growth' | 'exit';

export type IndustryVertical = 'saas' | 'fintech' | 'healthtech' | 'climate' | 'ai_ml' | 
                              'enterprise' | 'consumer' | 'marketplace' | 'hardware' | 'biotech' | 'other';

export type CompanyStatus = 'active' | 'acquired' | 'ipo' | 'shutdown' | 'on_hold';

export type ConfidentialityTier = 'public' | 'group' | 'private' | 'sensitive';

export type GroupCategory = 'stage_cohort' | 'functional_guild' | 'industry_chamber' | 'geographic_hub' | 'special_program';

export type AccessTier = 'core_portfolio' | 'alumni_network' | 'extended_ecosystem' | 'public';

export type GroupRole = 'admin' | 'moderator' | 'member' | 'observer';

export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'rejected' | 'banned';

export type DiscussionType = 'general' | 'question' | 'showcase' | 'announcement' | 'hot_seat' | 'poll';

export type PriorityTier = 'urgent' | 'high' | 'normal' | 'low';

export type ResolutionState = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ReplyCategory = 'comment' | 'answer' | 'follow_up' | 'clarification';

export type ContentEntity = 'thread' | 'reply' | 'comment';

export type ReactionCategory = 'like' | 'helpful' | 'insightful' | 'agree' | 'disagree' | 'question';

export type VerificationState = 'pending' | 'verified' | 'disputed' | 'self_reported';

export type EventCategory = 'forge_session' | 'breakthrough_board' | 'demo_day' | 'think_tank' | 'networking' | 'workshop';

export type EventFormatType = 'virtual' | 'in_person' | 'hybrid';

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export type RegistrationStatus = 'registered' | 'waitlisted' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';

export type ScoringPeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';

export type AchievementCategory = 'knowledge_sharing' | 'networking' | 'mentorship' | 'innovation' | 'collaboration' | 'community_building';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type EndorsementLevel = 'strong' | 'moderate' | 'basic';

// Main entity interfaces

export interface PortfolioCompany {
  id: string;
  name: string;
  description?: string;
  stage: StartupStage;
  vertical: IndustryVertical;
  founded_date?: string;
  team_size?: number;
  headquarters_location?: string;
  website_url?: string;
  logo_url?: string;
  status: CompanyStatus;
  confidentiality_level: ConfidentialityTier;
  created_at: string;
  updated_at: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  group_type: GroupCategory;
  access_level: AccessTier;
  auto_join_criteria?: Record<string, any>;
  max_members?: number;
  requires_approval: boolean;
  is_archived: boolean;
  cover_image_url?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  member_count?: number; // Computed field
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  join_date: string;
  status: MembershipStatus;
  contribution_score: number;
  last_active_at?: string;
  // User information from join
  user_name?: string;
  user_avatar_url?: string;
  // Additional computed fields
  users?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface DiscussionThread {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  content: string;
  thread_type: DiscussionType;
  priority_level: PriorityTier;
  confidentiality_level: ConfidentialityTier;
  tags?: string[];
  mentioned_users?: string[];
  attachments?: Record<string, any>[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  unique_participants: number;
  last_activity_at: string;
  last_reply_id?: string;
  resolution_status: ResolutionState;
  resolution_note?: string;
  resolved_by?: string;
  resolved_at?: string;
  ai_summary?: string;
  ai_keywords?: string[];
  created_at: string;
  updated_at: string;
  // Computed fields
  author_name?: string;
  author_avatar_url?: string;
}

export interface ThreadReply {
  id: string;
  thread_id: string;
  author_id: string;
  parent_reply_id?: string;
  content: string;
  reply_type: ReplyCategory;
  mentioned_users?: string[];
  attachments?: Record<string, any>[];
  is_accepted_answer: boolean;
  is_expert_response: boolean;
  expert_confidence_score?: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  author_name?: string;
  author_avatar_url?: string;
  reactions?: ContentReaction[];
}

export interface ContentReaction {
  id: string;
  content_type: ContentEntity;
  content_id: string;
  user_id: string;
  reaction_type: ReactionCategory;
  created_at: string;
}

export interface ExpertResponse {
  id: string;
  thread_id?: string;
  reply_id?: string;
  expert_id: string;
  expertise_area: string;
  confidence_score: number;
  verification_status: VerificationState;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  event_type: EventCategory;
  start_date: string;
  end_date: string;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern?: Record<string, any>;
  max_attendees?: number;
  registration_deadline?: string;
  requires_approval: boolean;
  target_groups?: string[];
  organizer_id: string;
  co_organizers?: string[];
  event_format: EventFormatType;
  location_details?: Record<string, any>;
  preparation_materials?: Record<string, any>;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  // Computed fields
  organizer_name?: string;
  organizer_avatar_url?: string;
  attendee_count?: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_date: string;
  status: RegistrationStatus;
  attended: boolean;
  feedback_rating?: number;
  feedback_comment?: string;
}

export interface ContributionScore {
  id: string;
  user_id: string;
  scoring_period: ScoringPeriodType;
  period_start: string;
  period_end: string;
  knowledge_sharing_points: number;
  introduction_credits: number;
  mentorship_impact_score: number;
  community_building_score: number;
  total_score: number;
  percentile_rank?: number;
  calculated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: AchievementCategory;
  achievement_name: string;
  achievement_description?: string;
  tier: AchievementTier;
  earned_date: string;
  is_public: boolean;
  badge_image_url?: string;
  created_at: string;
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  primary_expertise_areas: string[];
  secondary_expertise_areas?: string[];
  industry_experience?: Record<string, any>;
  functional_experience?: Record<string, any>;
  company_stages_experienced?: StartupStage[];
  mentorship_capacity: number;
  success_stories?: string[];
  languages_spoken?: string[];
  timezone?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  user_name?: string;
  user_avatar_url?: string;
  endorsement_count?: number;
}

export interface ExpertEndorsement {
  id: string;
  expert_id: string;
  endorser_id: string;
  expertise_area: string;
  level: EndorsementLevel;
  comment?: string;
  created_at: string;
  updated_at: string;
  // Computed fields from joins
  endorser?: {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
  };
}

export interface RecommendationInteraction {
  id: string;
  user_id: string;
  recommendation_type: string;
  recommended_item_id: string;
  recommended_item_type: string;
  user_action?: string;
  feedback_rating?: number;
  outcome_success?: boolean;
  context_factors?: Record<string, any>;
  interaction_timestamp: string;
}

// Request and response types for API interactions

export interface CreateCommunityGroupRequest {
  name: string;
  description?: string;
  group_type: GroupCategory;
  access_level: AccessTier;
  auto_join_criteria?: Record<string, any>;
  max_members?: number;
  requires_approval?: boolean;
  cover_image_url?: string;
  icon_url?: string;
}

export interface UpdateCommunityGroupRequest {
  name?: string;
  description?: string;
  group_type?: GroupCategory;
  access_level?: AccessTier;
  auto_join_criteria?: Record<string, any>;
  max_members?: number;
  requires_approval?: boolean;
  is_archived?: boolean;
  cover_image_url?: string;
  icon_url?: string;
}

export interface CreateDiscussionThreadRequest {
  group_id: string;
  title: string;
  content: string;
  thread_type?: DiscussionType;
  priority_level?: PriorityTier;
  confidentiality_level?: ConfidentialityTier;
  tags?: string[];
  mentioned_users?: string[];
  attachments?: Record<string, any>[];
}

export interface CreateThreadReplyRequest {
  thread_id: string;
  content: string;
  parent_reply_id?: string;
  reply_type?: ReplyCategory;
  mentioned_users?: string[];
  attachments?: Record<string, any>[];
}

export interface CreateCommunityEventRequest {
  title: string;
  description?: string;
  event_type: EventCategory;
  start_date: string;
  end_date: string;
  timezone?: string;
  is_recurring?: boolean;
  recurrence_pattern?: Record<string, any>;
  max_attendees?: number;
  registration_deadline?: string;
  requires_approval?: boolean;
  target_groups?: string[];
  co_organizers?: string[];
  event_format?: EventFormatType;
  location_details?: Record<string, any>;
  preparation_materials?: Record<string, any>;
}

export interface CreateExpertProfileRequest {
  primary_expertise_areas: string[];
  secondary_expertise_areas?: string[];
  industry_experience?: Record<string, any>;
  functional_experience?: Record<string, any>;
  company_stages_experienced?: StartupStage[];
  mentorship_capacity?: number;
  success_stories?: string[];
  languages_spoken?: string[];
  timezone?: string;
}

export interface CommunityProfileSummary {
  user_id: string;
  user_name: string;
  user_avatar_url?: string;
  primary_role?: string;
  company_name?: string;
  joined_date: string;
  group_memberships: {
    group_id: string;
    group_name: string;
    group_type: GroupCategory;
    role: GroupRole;
  }[];
  contribution_score?: number;
  achievements: {
    achievement_name: string;
    achievement_type: AchievementCategory;
    tier: AchievementTier;
    earned_date: string;
    badge_image_url?: string;
  }[];
  expert_areas?: string[];
  recent_activity?: {
    activity_type: string;
    entity_id: string;
    entity_type: string;
    timestamp: string;
    summary: string;
  }[];
}

// Filter and pagination types

export interface CommunityGroupFilters {
  group_type?: GroupCategory;
  access_level?: AccessTier;
  search_term?: string;
  is_archived?: boolean;
  user_is_member?: boolean;
  sort_by?: 'name' | 'created_at' | 'member_count' | 'activity';
  sort_direction?: 'asc' | 'desc';
}

export interface DiscussionThreadFilters {
  group_id?: string;
  author_id?: string;
  thread_type?: DiscussionType;
  priority_level?: PriorityTier;
  resolution_status?: ResolutionState;
  tags?: string[];
  search_term?: string;
  is_pinned?: boolean;
  sort_by?: 'created_at' | 'last_activity_at' | 'reply_count' | 'view_count';
  sort_direction?: 'asc' | 'desc';
}

export interface CommunityEventFilters {
  event_type?: EventCategory;
  event_format?: EventFormatType;
  status?: EventStatus;
  organizer_id?: string;
  target_groups?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search_term?: string;
  sort_by?: 'start_date' | 'created_at' | 'title';
  sort_direction?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
