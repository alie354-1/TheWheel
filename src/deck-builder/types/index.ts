// Phase 1 - Simplified Types for Modern Pitch Deck Builder
import type { BlockType as ImportedBlockType } from './blocks.ts'; // Import BlockType

export interface Deck {
  id: string;
  title: string;
  sections: DeckSection[];
  template_id?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  theme?: DeckTheme; // Added theme property
  last_feedback_activity_at?: string; // Added for collaborative feedback
  feedback_summary?: any; // Added for AI-generated feedback summary (JSONB)
}

export interface DeckThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  slideBackground?: string;
}

export interface DeckThemeFonts {
  heading: string;
  body: string;
  caption?: string;
}

export interface DeckTheme {
  id: string;
  name: string;
  colors: DeckThemeColors;
  fonts: DeckThemeFonts;
  // Add more theme properties as needed
  // e.g., defaultComponentStyles, slideTransitions, etc.
}

export interface DeckSection {
  id: string;
  type: SectionType;
  title: string;
  // content: any; // Removed
  // contentIsHtml?: boolean; // Removed
  components: VisualComponent[]; // Added
  order: number;
  slideStyle?: React.CSSProperties; // Optional custom styles for the section/slide background
  presenter_notes?: string; // Added for presenter notes
  width?: number;
  height?: number;
}

export interface VisualComponentLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  baseWidth?: number; // Added for scaling calculations
  baseHeight?: number; // Added for scaling calculations
}

export interface VisualComponent {
  id: string;
  type: import('./blocks.ts').BlockType; // Ensure BlockType is imported or correctly referenced
  data: any; // Component-specific data, e.g., { textContent: string, format: 'text' | 'html' } for text
  layout: VisualComponentLayout;
  order: number; // For sequence and layering if zIndex is not used, or for list views
  style?: React.CSSProperties; // Optional custom styles for the component's wrapper
}

export type SectionType = 
  | 'hero'
  | 'problem'
  | 'solution'
  | 'market'
  | 'business-model'
  | 'competition'
  | 'team'
  | 'financials'
  | 'funding'
  | 'next-steps'
  | 'problemSolution' // Added for creative template
  | 'demoGallery'     // Added for creative template
  | 'ctaCard'         // Added for creative template
  | 'blank'          // For adding a blank slide
  // "Extra Slides" for gallery
  | 'executiveSummary'
  | 'productRoadmap'
  | 'keyMetricsDashboard'
  | 'faqSlide'
  | 'contactUs'
  | 'custom'; // Added for HTML imported sections

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'vc-pitch' | 'product-demo' | 'market-opportunity' | 'technical';
  sections: SectionType[];
  preview_image?: string;
}

// Represents a fully populated deck template with all components and data
export interface DeckDataTemplate {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., 'Business', 'Creative', 'Education'
  thumbnailUrl?: string; // URL for a preview image
  deck: Deck; // The actual deck data, which includes the theme
}

// Re-export BlockType for use in other modules
// Also make BlockType available internally for ProposedContentDataType
export type { ImportedBlockType as BlockType }; // Re-export with the original name
export type { TractionWidgetMetric, Milestone, FundAllocation, TeamMember, Competitor, Logo, TractionWidgetMetric as TractionMetric } from './blocks.ts';

// Types for Collaborative Feedback System

export interface DeckCommentReactionItem {
  userId: string;
  reactionType: string; // e.g., '👍', '❤️'
}

export interface DeckComment {
  id: string;
  deckId: string;
  slideId: string;
  elementId?: string; // If anchored to a specific visual component
  parentCommentId?: string | null; // For threading
  authorUserId?: string | null; // Nullable for guest comments
  authorDisplayName?: string;
  coordinates?: { x: number; y: number }; // If comment is placed on a specific point
  textContent: string;
  richTextContent?: any; // For structured/formatted text (e.g., TipTap JSON)
  voiceNoteUrl?: string;
  voiceTranscription?: string;
  markupData?: any; // SVG or JSON data for drawings
  commentType: 'General' | 'Suggestion' | 'Question' | 'Praise' | 'Concern';
  urgency: 'Critical' | 'Important' | 'Suggestion' | 'None';
  status: 'Open' | 'Resolved' | 'InProgress' | 'Archived';
  createdAt: string;
  updatedAt: string;
  replies?: DeckComment[]; // Nested replies
  reactions?: DeckCommentReactionItem[];
  // New fields for Unified Sharing System
  reviewerSessionId?: string; // Links to ReviewerSession
  declaredRole?: string; // Role declared by reviewer for this comment
  feedbackWeight?: number; // Final calculated weight
  aiSentimentScore?: number; // AI-analyzed sentiment
  aiExpertiseScore?: number; // AI-analyzed expertise
  aiImprovementCategory?: string; // AI-assigned category
  focusArea?: string; // If comment relates to a specific focus area
  feedback_category: FeedbackCategory; // Added for Content vs. Form classification
  component_id?: string; // Added for component-level feedback
  is_edited?: boolean;
  edit_history?: {
    textContent: string;
    feedback_category: FeedbackCategory;
    editedAt: string;
  }[];
}

export type FeedbackCategory = 'Content' | 'Form' | 'General';

// Types for Unified Smart Sharing System
export type ShareType = 'view' | 'feedback' | 'expert_review';

export interface SmartShareLink {
  id: string;
  deckId: string;
  shareToken: string;
  shareType: ShareType;
  targetRoles?: string[]; // e.g., ['designer', 'investor']
  focusAreas?: string[]; // e.g., ['content', 'visual_design']
  aiAnalysisEnabled: boolean;
  customWeights?: Record<string, number>; // e.g., {"designer": 1.5, "investor": 2.0}
  created_by?: string; // User ID of creator
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  // New fields for enhanced sharing
  requires_verification?: boolean;
  allow_anonymous_feedback?: boolean;
  creator_is_anonymous?: boolean;
}

export interface DeckShareRecipient {
  id: string;
  share_link_id: string;
  email?: string;
  phone?: string;
  role: string;
  feedback_weight: number;
  created_at: string;
  verified_at?: string;
  access_code?: string;
  can_reshare?: boolean;
}

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert' | 'n/a';

export interface ReviewerSession {
  id: string;
  shareToken: string;
  sessionId: string; // Browser fingerprint or unique session ID
  declaredRole?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  expertiseLevel?: ExpertiseLevel;
  ipAddress?: string;
  userAgent?: string;
  userId?: string; // If reviewer is a logged-in platform user
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface AIFeedbackInsight {
  id: string;
  deckId: string;
  shareToken?: string;
  analysisType: string; // e.g., 'overall_sentiment', 'key_themes', 'improvement_suggestions'
  insights: any; // JSONB in DB
  confidenceScore?: number;
  generatedAt: string;
  updatedAt?: string; // Made optional to align with DB schema for ai_feedback_insights
}


export interface DeckReviewAssignment {
  id: string;
  deckId: string;
  userId?: string | null; // Nullable for invite-by-email guests not yet signed up
  invitedEmail?: string;
  displayName?: string;
  role: 'Owner' | 'Editor' | 'Reviewer' | 'Advisor' | 'Investor' | 'Viewer';
  feedbackWeight: number;
  expertiseTags?: string[];
  accessToken?: string | null; // For guest access via link
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeckAiUpdateProposal {
  id: string;
  deckId: string;
  slideId: string; // ID of the slide this proposal pertains to
  elementId?: string; // Optional: ID of the specific element within the slide
  changeType: 
    | 'TextEdit' 
    | 'ImageSwap' 
    | 'ChartUpdate' 
    | 'NewElement' 
    | 'ReorderElement' 
    | 'DeleteElement' 
    | 'NewSlide' 
    | 'ReorderSlide';
  description: string; // AI's explanation
  originalContentSnapshot?: any; // Snapshot of content before the proposed change
  proposedContentData: ProposedContentDataType; // The actual proposed change data, now strongly typed
  sourceCommentIds?: string[]; // Array of comment IDs that led to this proposal
  aiConfidenceScore?: number; // AI's confidence in the proposal
  weightedFeedbackScore?: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Modified' | 'Archived';
  ownerActionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// For Content Intelligence System (Phase 3)
export interface DeckLearningInsight {
  id: string; // UUID
  insightType: 'TemplateSuggestion' | 'ComponentFeedbackPattern' | 'HighEngagementPattern' | string; // string for flexibility
  sourceDataQuery?: string; // Optional: Query used to derive this insight
  description: string;
  details: any; // JSONB: Specifics of the insight
  severity?: 'High' | 'Medium' | 'Low'; // For feedback patterns
  confidenceScore?: number;
  status: 'New' | 'Reviewed' | 'Actioned' | 'Dismissed';
  createdAt: string; // TIMESTAMPTZ
  updatedAt: string; // TIMESTAMPTZ
  tags?: string[];
}

// Types for AI Service interaction (for ai-generate-slide-rewrite-from-feedback Edge Function)

// Input types for the Edge Function payload
export type AiServiceCommentInput = Pick<DeckComment, 'id' | 'textContent' | 'authorDisplayName' | 'commentType' | 'declaredRole'>;

export type AiServiceSlideElementInput = Pick<VisualComponent, 'id' | 'type' | 'data'>;

export type AiServiceSlideContentInput = {
  title: DeckSection['title'];
  elements: AiServiceSlideElementInput[];
};

export interface AiServiceRequestPayload {
  deckId: string;
  slideId: string;
  comments: AiServiceCommentInput[];
  slideContent: AiServiceSlideContentInput;
  aggregatedInsightsSummary?: string; // New field for insights summary
}

// Output type from the Edge Function, returned by aiService.generateSlideRewriteSuggestions
export interface AiGeneratedSuggestion {
  proposalCategory: 'ContentEdit' | 'NewSlideElement' | 'SlideRestructure' | 'GeneralAdvice';
  
  targetElementId?: string; 
  originalContentSnippet?: string; 
  
  suggestedContent?: any; // For ContentEdit: e.g., { newText: "..." }, { newImageUrl: "..." }
  
  newElementData?: { 
    componentType: ImportedBlockType; 
    data: any;                       
    layout?: VisualComponentLayout;
  };

  restructureOperation?: 'ReorderElement' | 'DeleteElement' | 'AddNewSlideAfter' | 'ReorderSlide';
  restructureDetails?: { [key: string]: any; };

  description: string; 
  reasoning?: string;
  confidenceScore: number;
}


// Specific data structures for DeckAiUpdateProposal.proposedContentData
export interface TextEditProposedData {
  newTextContent: string;
  // originalTextContent is implicitly in originalContentSnapshot if the proposal targets an existing element
}

export interface NewElementProposedData {
  componentType: ImportedBlockType; // The type of VisualComponent to create
  data: any; // The data for the new component (e.g., { textContent: "..." } for a text block)
  layout?: VisualComponentLayout; // Optional: suggested layout for the new element
  targetOrder?: number; // Optional: suggested order if it's a root-level component in a section
}

export interface ImageSwapProposedData {
  newImageUrl: string;
  newAltText?: string;
  // originalImageUrl would be in originalContentSnapshot.data.src
}

export interface ChartUpdateProposedData {
  newData: any; // e.g., new series, updated values
  newChartOptions?: any;
  // original chart data/options would be in originalContentSnapshot.data
}

export interface ReorderElementProposedData {
  // elementId is already a top-level field in DeckAiUpdateProposal
  newOrder: number; // New order index within its parent (e.g., slide section)
  newLayout?: VisualComponentLayout; // Optional: if reordering also implies a layout change
}

// For DeleteElement, no specific proposedContentData is needed as elementId is top-level.
// The absence of proposedContentData or an empty object {} could signify deletion.

export interface NewSlideProposedData {
  newSlideData: Omit<DeckSection, 'id' | 'order'>; // Data for the new slide, ID and order will be set on creation
  targetOrder: number; // Suggested order index for the new slide in the deck
}

export interface ReorderSlideProposedData {
  // slideId is already a top-level field in DeckAiUpdateProposal if the proposal targets an existing slide for reordering
  // If it's about reordering a specific slide:
  // slideToMoveId: string; // This might be redundant if slideId at top level means "the slide being affected"
  newOrder: number; // New order index for the slide
}

// Union type for proposedContentData to be used in DeckAiUpdateProposal
export type ProposedContentDataType =
  | TextEditProposedData
  | NewElementProposedData
  | ImageSwapProposedData
  | ChartUpdateProposedData
  | ReorderElementProposedData
  | NewSlideProposedData
  | ReorderSlideProposedData
  | Record<string, any> // Fallback for other types or generic JSON
  | null; // For proposals like 'DeleteElement' where data isn't needed
