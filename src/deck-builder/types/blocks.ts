// Canonical block/component types for the pitch deck builder MVP

export type BlockType =
  | 'text'
  | 'image'
  | 'quote'
  | 'code'
  | 'video'
  | 'list'
  | 'table'
  | 'chart'
  | 'button'
  | 'shape'
  | 'embed'
  | 'checklist'
  | 'divider'
  | 'icon'
  | 'file'
  | 'audio'
  | 'timer'
  | 'poll'
  | 'customHtml'
  // Unique pitch deck blocks
  | 'teamCard'
  | 'tractionWidget'
  | 'timeline'
  | 'marketMap'
  | 'competitorTable'
  | 'problemSolution'
  | 'logoWall'
  | 'businessModel'
  | 'testimonialCard'
  | 'useOfFunds'
  | 'ctaCard'
  | 'demoGallery'
  | 'milestoneTracker'
  | 'investmentAsk'
  | 'mapBlock'
  | 'customImage'
  // New Block Types for Enhanced Templates
  | 'metricCounter'
  | 'socialProofBadge'
  | 'opportunityIndicator'
  | 'beforeAfterComparison'
  | 'benefitCard'
  | 'competitivePositioning'
  | 'marketSegments'
  | 'advisorCard'
  | 'hiringPlan'
  | 'skillMatrix'
  | 'pressCard'
  | 'partnershipCard'
  | 'investorContactForm'
  | 'heroImage'
  // Phase 1: Enhanced Visual Components
  | 'imageGallery'
  | 'featureCard'
  | 'mediaHero'
  | 'citation'
  | 'statsDisplay'
  | 'visualQuote'
  | 'iconFeature'
  | 'imageWithCaption'
  | 'calloutBox';

export interface BaseBlock {
  id: string;
  type: BlockType;
  x: number; // position on canvas
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  selected?: boolean;
  // Common style props
  style?: Record<string, any>;
  animation?: Record<string, any>; // Added for potential animations
}

// Enhanced JSON type for complex data structures with metadata and type guards
export interface ComplexJsonData<T = any> {
  data: T | any; // The actual data - fallback to any for now
  type: 'json'; // Indicates this is a complex JSON structure
  lastModified?: string; // ISO timestamp of last modification
  version?: number; // Version number for data migration
  isValid?: boolean; // Whether the data passes validation
  validationErrors?: string[]; // Any validation errors
  metadata?: {
    editorType?: string; // Which specialized editor to use
    schema?: string; // JSON schema reference
    [key: string]: any; // Additional metadata
  };
}

// Type guards for complex JSON data
export function isComplexJsonData<T>(value: any): value is ComplexJsonData<T> {
  return value && typeof value === 'object' && value.type === 'json';
}

export function isValidComplexJsonData<T>(value: any): value is ComplexJsonData<T> {
  return isComplexJsonData(value) && value.isValid !== false;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  text: string;
  variant: 'heading' | 'subheading' | 'paragraph';
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
  storagePath?: string;
  uploading?: boolean;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
  author?: string;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: string;
  language?: string;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  src: string;
  provider?: 'youtube' | 'vimeo' | 'upload' | 'other';
}

// Individual list item structure
export interface ListItem {
  id: string; // Unique ID for React key and stable editing
  text: string;
  icon?: string; // Optional icon name (e.g., Lucide icon)
  style?: Record<string, any>; // Optional custom styles for this specific item
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  items: ListItem[];
  ordered?: boolean;
  layout?: 'vertical' | 'horizontal'; // Default to 'vertical'
  itemStyle?: Record<string, any>; // Common style for all items
  listStyle?: Record<string, any>; // Style for the UL/OL container
  spacing?: number; // Space between items in pixels
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  rows: string[][];
}

export interface ChartBlock extends BaseBlock {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble'; // Expanded chart types
  data: ChartData; // Use a structured type
  options?: Record<string, any>; // For chart.js options if needed
}

// Structured types for Chart data
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  // Other chart.js dataset properties can be added here
  [key: string]: any; // Allow other properties
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}


export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string;
  url?: string;
}

export interface ShapeBlock extends BaseBlock {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'line' | 'arrow' | string;
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  url: string;
}

export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  items: { text: string; checked: boolean }[];
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface IconBlock extends BaseBlock {
  type: 'icon';
  iconName: string;
}

export interface FileBlock extends BaseBlock {
  type: 'file';
  fileUrl: string;
  fileName: string;
}

export interface AudioBlock extends BaseBlock {
  type: 'audio';
  src: string;
}

export interface TimerBlock extends BaseBlock {
  type: 'timer';
  duration: number;
}

export interface PollBlock extends BaseBlock {
  type: 'poll';
  question: string;
  options: string[];
  results?: number[];
}

export interface CustomHtmlBlock extends BaseBlock {
  type: 'customHtml';
  html: string;
}

// Unique pitch deck blocks (compound types)
export interface TeamMember {
  name: string;
  title: string;
  photoUrl?: string;
  bio?: string;
  linkedin?: string;
}

export interface TeamCardBlock extends BaseBlock {
  type: 'teamCard';
  members: TeamMember[];
}

export interface TractionWidgetMetric {
  label: string;
  value: string;
  icon?: string;
  trend?: 'up' | 'down' | 'flat';
  description?: string;
}

export interface TractionWidgetBlock extends BaseBlock {
  type: 'tractionWidget';
  metrics: TractionWidgetMetric[];
}

export interface Milestone {
  date: string;
  label: string;
  description?: string;
  icon?: string;
  completed?: boolean;
}

export interface TimelineBlock extends BaseBlock {
  type: 'timeline';
  milestones: Milestone[];
}

export interface MarketMapBlock extends BaseBlock {
  type: 'marketMap';
  tam: number;
  sam: number;
  som: number;
  notes?: string;
}

export interface Competitor {
  name: string;
  features: { [feature: string]: boolean };
}

export interface CompetitorTableBlock extends BaseBlock {
  type: 'competitorTable';
  competitors: Competitor[];
  featureList: string[];
}

export interface ProblemSolutionBlock extends BaseBlock {
  type: 'problemSolution';
  problem: string;
  solution: string;
  icon?: string;
}

export interface Logo {
  src: string;
  alt?: string;
  url?: string;
}

export interface LogoWallBlock extends BaseBlock {
  type: 'logoWall';
  logos: Logo[];
}

export interface BusinessModelBlock extends BaseBlock {
  type: 'businessModel';
  streams: { label: string; value: string }[];
  diagramUrl?: string;
}

export interface TestimonialCardBlock extends BaseBlock {
  type: 'testimonialCard';
  quote: string;
  author: string;
  photoUrl?: string;
  logoUrl?: string;
}

export interface FundAllocation {
  name: string;
  amount: number;
  color: string;
}

export interface UseOfFundsBlock extends BaseBlock {
  type: 'useOfFunds';
  allocations: FundAllocation[];
  totalAmount: number;
  title?: string;
}

export interface CtaCardBlock extends BaseBlock {
  type: 'ctaCard';
  text: string;
  buttonLabel: string;
  buttonUrl?: string;
}

export interface DemoGalleryBlock extends BaseBlock {
  type: 'demoGallery';
  items: { type: 'image' | 'video'; src: string; caption?: string }[];
}

export interface MilestoneTrackerBlock extends BaseBlock {
  type: 'milestoneTracker';
  milestones: { label: string; completed: boolean; date?: string; description?: string }[];
}

export interface InvestmentAskBlock extends BaseBlock {
  type: 'investmentAsk';
  amount: string;
  equity: string;
  terms?: string;
}

export interface MapBlock extends BaseBlock {
  type: 'mapBlock';
  location: string;
  mapUrl?: string;
}

export interface CustomImageBlock extends BaseBlock {
  type: 'customImage';
  src: string;
  alt?: string;
  caption?: string;
  style?: Record<string, any>;
}

// Interfaces for New Block Types
export interface MetricCounterBlock extends BaseBlock {
  type: 'metricCounter';
  label: string;
  value: number;
  targetValue?: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // Animation duration in ms
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
}

export interface SocialProofBadgeBlock extends BaseBlock {
  type: 'socialProofBadge';
  text: string;
  icon?: string;
  imageUrl?: string;
  linkUrl?: string;
  source?: string;
}

export interface OpportunityIndicatorBlock extends BaseBlock {
  type: 'opportunityIndicator';
  title: string;
  value: string; // e.g., "$10B Market"
  description?: string;
  icon?: string;
}

export interface BeforeAfterComparisonBlock extends BaseBlock {
  type: 'beforeAfterComparison';
  beforeImageSrc: string;
  beforeImageAlt?: string;
  beforeLabel?: string;
  afterImageSrc: string;
  afterImageAlt?: string;
  afterLabel?: string;
  orientation?: 'horizontal' | 'vertical';
}

export interface BenefitCardBlock extends BaseBlock {
  type: 'benefitCard';
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

export interface CompetitivePositioningBlock extends BaseBlock {
  type: 'competitivePositioning';
  chartData: ComplexJsonData<CompetitivePositioningData>; // Enhanced JSON type with metadata
  title?: string;
}

export interface MarketSegmentsBlock extends BaseBlock {
  type: 'marketSegments';
  segmentData: ComplexJsonData<MarketSegmentsData>; // Enhanced JSON type with metadata
  title?: string;
}

export interface AdvisorCardBlock extends BaseBlock {
  type: 'advisorCard';
  name: string;
  title: string;
  company?: string;
  photoUrl?: string;
  bio?: string;
  linkedin?: string;
}

export interface HiringPlanBlock extends BaseBlock {
  type: 'hiringPlan';
  roles: {
    title: string;
    department: string;
    count: number;
    timeline: string; // e.g., "Q3 2024"
  }[];
  title?: string;
}

export interface SkillMatrixBlock extends BaseBlock {
  type: 'skillMatrix';
  matrixData: ComplexJsonData<SkillMatrixData>; // Enhanced JSON type with metadata
  title?: string;
}

export interface PressCardBlock extends BaseBlock {
  type: 'pressCard';
  publicationLogoUrl: string;
  headline: string;
  articleUrl: string;
  date?: string;
}

export interface PartnershipCardBlock extends BaseBlock {
  type: 'partnershipCard';
  partnerLogoUrl: string;
  partnerName: string;
  description: string;
  announcementUrl?: string;
}

export interface InvestorContactFormBlock extends BaseBlock {
  type: 'investorContactForm';
  formFields: { name: string; label: string; type: 'text' | 'email' | 'textarea'; required?: boolean }[];
  submitButtonText?: string;
  recipientEmail?: string; // For mailto or backend submission
  title?: string;
}

// Phase 1: Enhanced Visual Components Interfaces
export interface HeroImageBlock extends BaseBlock {
  type: 'heroImage';
  src: string;
  alt?: string;
  overlayText?: string;
  overlayPosition?: 'center' | 'bottom' | 'top' | 'left' | 'right';
  overlayColor?: string; // e.g. 'rgba(0,0,0,0.5)'
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface ImageGalleryBlock extends BaseBlock {
  type: 'imageGallery';
  images: { src: string; alt?: string; caption?: string }[];
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: number; // For grid/masonry
  spacing?: number; // Gap between images
  showCaptions?: 'hover' | 'always' | 'none';
}

export interface FeatureCardBlock extends BaseBlock {
  type: 'featureCard';
  title: string;
  description: string;
  imageUrl?: string;
  icon?: string; // Lucide icon name
  features?: string[]; // Array of feature strings (bullet points)
  layout?: 'horizontal' | 'vertical' | 'icon-top' | 'icon-left';
  linkUrl?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface MediaHeroBlock extends BaseBlock {
  type: 'mediaHero';
  mediaType: 'image' | 'video';
  src: string;
  alt?: string; // For image
  poster?: string; // For video
  headline: string;
  subheadline?: string;
  description?: string;
  textPosition?: 'left' | 'right' | 'overlay-center' | 'overlay-bottom';
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string; // Background for text area if not overlay
  textColor?: string;
}

export interface CitationBlock extends BaseBlock {
  type: 'citation';
  text: string; // The full citation text
  source?: string; // Optional: if you want to store parts separately
  author?: string; // Optional
  year?: string; // Optional
  citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'Vancouver' | 'IEEE'; // More options
  url?: string;
}

export interface StatItem {
  value: string; // Can be number or string like "10K+"
  label: string;
  icon?: string; // Lucide icon name
  trend?: 'up' | 'down' | 'flat';
  color?: string; // Color for the value or icon
  description?: string;
}

export interface StatsDisplayBlock extends BaseBlock {
  type: 'statsDisplay';
  stats: StatItem[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  columns?: number; // For grid layout
  cardStyle?: 'simple' | 'card' | 'pill';
}

export interface VisualQuoteBlock extends BaseBlock {
  type: 'visualQuote';
  text: string;
  author?: string;
  authorTitle?: string; // e.g., CEO, Founder
  authorImage?: string; // URL to author's photo
  companyLogo?: string; // URL to company logo
  quoteStyle?: 'minimal' | 'card' | 'banner' | 'inline-image' | 'pull-quote';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface IconFeatureBlock extends BaseBlock {
  type: 'iconFeature';
  icon: string; // Lucide icon name
  title: string;
  description: string;
  iconColor?: string;
  iconSize?: 'small' | 'medium' | 'large' | 'xlarge';
  layout?: 'vertical-center' | 'horizontal-left' | 'horizontal-center';
  titleSize?: string; // e.g., 'text-lg', 'text-xl'
  descriptionSize?: string; // e.g., 'text-sm', 'text-base'
}

export interface ImageWithCaptionBlock extends BaseBlock {
  type: 'imageWithCaption';
  src: string;
  alt?: string;
  caption: string;
  captionPosition?: 'bottom' | 'top' | 'overlay-bottom' | 'overlay-top';
  captionStyle?: 'simple' | 'card' | 'transparent-overlay';
  imageStyle?: 'rounded' | 'shadow' | 'full-bleed';
  textAlign?: 'left' | 'center' | 'right';
}

// Phase 2: Callout Box Interface
export interface CalloutBoxBlock extends BaseBlock {
  type: 'calloutBox';
  text: string;
  title?: string; // Optional title for the callout
  iconName?: string; // Lucide icon name (renamed from icon for clarity)
  iconSize?: 'small' | 'medium' | 'large'; // Optional icon size
  variant?: 'info' | 'warning' | 'success' | 'danger' | 'custom';
  backgroundColor?: string; // For custom variant
  borderColor?: string; // For custom variant
  textColor?: string; // For custom variant
  iconColor?: string; // For custom variant
}

export interface VisualComponentLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  baseWidth?: number;
  baseHeight?: number;
}

// Data structure interfaces for specialized editors
export interface CompetitivePositioningData {
  xLabel: string;
  yLabel: string;
  points: Array<{
    name: string;
    x: number; // 0-1 scale
    y: number; // 0-1 scale
    color: string;
    description?: string;
  }>;
}

export interface MarketSegmentsData {
  segments: Array<{
    name: string;
    value: number; // Percentage
    color: string;
    description?: string;
  }>;
}

export interface SkillMatrixData {
  skills: string[];
  team: Array<{
    name: string;
    scores: number[]; // 1-5 scale, maps to skills array
    role?: string;
  }>;
}

// Union of all block types
export type DeckBlock =
  | TextBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock
  | VideoBlock
  | ListBlock
  | TableBlock
  | ChartBlock
  | ButtonBlock
  | ShapeBlock
  | EmbedBlock
  | ChecklistBlock
  | DividerBlock
  | IconBlock
  | FileBlock
  | AudioBlock
  | TimerBlock
  | PollBlock
  | CustomHtmlBlock
  | TeamCardBlock
  | TractionWidgetBlock
  | TimelineBlock
  | MarketMapBlock
  | CompetitorTableBlock
  | ProblemSolutionBlock
  | LogoWallBlock
  | BusinessModelBlock
  | TestimonialCardBlock
  | UseOfFundsBlock
  | CtaCardBlock
  | DemoGalleryBlock
  | MilestoneTrackerBlock
  | InvestmentAskBlock
  | MapBlock
  | CustomImageBlock
  // Add new block types to the union
  | MetricCounterBlock
  | SocialProofBadgeBlock
  | OpportunityIndicatorBlock
  | BeforeAfterComparisonBlock
  | BenefitCardBlock
  | CompetitivePositioningBlock
  | MarketSegmentsBlock
  | AdvisorCardBlock
  | HiringPlanBlock
  | SkillMatrixBlock
  | PressCardBlock
  | PartnershipCardBlock
  | InvestorContactFormBlock
  | HeroImageBlock
  // Phase 1: Enhanced Visual Components
  | ImageGalleryBlock
  | FeatureCardBlock
  | MediaHeroBlock
  | CitationBlock
  | StatsDisplayBlock
  | VisualQuoteBlock
  | IconFeatureBlock
  | ImageWithCaptionBlock
  // Phase 2
  | CalloutBoxBlock;

// Block registry for rendering/editing (to be filled in by implementation)
export interface EditableProp {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'checkbox' | 'json' | 'string_array' | 'object_array' | 'competitive_positioning' | 'market_segments' | 'skill_matrix' | 'competitor_features' | 'chart_data' | 'rich_text_array' | 'table' | 'list' | 'traction_widget' | 'timeline' | 'use_of_funds';
  options?: { value: string; label: string }[]; // For select type
  itemSchema?: EditableProp[]; // For type 'object_array', defines the schema of each object in the array
}

export interface BlockMeta {
  label: string;
  icon: string; // Material icon name or path to SVG or Lucide icon name
  category: string; // To group components in the library
  description?: string;
  sampleData?: any;
  defaultSize?: { width: number; height: number }; // Added defaultSize
  editableProps?: EditableProp[]; // Array of props that can be edited in a generic modal
  editorComponent?: React.ComponentType<any>; // For custom editor components
}

// Import the BLOCK_REGISTRY from a separate file to keep this file manageable
import { BLOCK_REGISTRY } from './blockRegistry.ts';
// Re-export the BLOCK_REGISTRY so it can be imported from blocks.ts
export { BLOCK_REGISTRY };
