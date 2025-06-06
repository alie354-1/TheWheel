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
  // Phase 1: Enhanced Visual Components
  | 'heroImage'
  | 'imageGallery'
  | 'featureCard'
  | 'mediaHero'
  | 'citation'
  | 'statsDisplay'
  | 'visualQuote'
  | 'iconFeature'
  | 'imageWithCaption'
  | 'calloutBox'; // Added for Phase 2

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
export interface TeamCardBlock extends BaseBlock {
  type: 'teamCard';
  members: {
    name: string;
    title: string;
    photoUrl?: string;
    bio?: string;
    linkedin?: string;
  }[];
}

export interface TractionWidgetBlock extends BaseBlock {
  type: 'tractionWidget';
  metrics: {
    label: string;
    value: string;
    icon?: string;
    trend?: 'up' | 'down' | 'flat';
    description?: string;
  }[];
}

export interface TimelineBlock extends BaseBlock {
  type: 'timeline';
  milestones: {
    date: string;
    label: string;
    description?: string;
    icon?: string;
  }[];
}

export interface MarketMapBlock extends BaseBlock {
  type: 'marketMap';
  tam: number;
  sam: number;
  som: number;
  notes?: string;
}

export interface CompetitorTableBlock extends BaseBlock {
  type: 'competitorTable';
  competitors: {
    name: string;
    features: { [feature: string]: boolean };
  }[];
  featureList: string[];
}

export interface ProblemSolutionBlock extends BaseBlock {
  type: 'problemSolution';
  problem: string;
  solution: string;
  icon?: string;
}

export interface LogoWallBlock extends BaseBlock {
  type: 'logoWall';
  logos: { src: string; alt?: string; url?: string }[];
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

export interface UseOfFundsBlock extends BaseBlock {
  type: 'useOfFunds';
  categories: { label: string; percent: number }[];
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
  milestones: { label: string; completed: boolean }[];
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

export interface StatsDisplayBlock extends BaseBlock {
  type: 'statsDisplay';
  stats: {
    value: string; // Can be number or string like "10K+"
    label: string;
    icon?: string; // Lucide icon name
    trend?: 'up' | 'down' | 'flat';
    color?: string; // Color for the value or icon
    description?: string;
  }[];
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
  // Phase 1: Enhanced Visual Components
  | HeroImageBlock
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
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'checkbox' | 'json' | 'string_array' | 'object_array' | 'competitive_positioning' | 'market_segments' | 'skill_matrix' | 'competitor_features' | 'chart_data'; // Added chart_data
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
}

export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
  text: {
    label: "Text",
    icon: "Type", 
    category: "Text",
    description: "Basic text block for paragraphs, headings.",
    sampleData: { text: "Editable Text", variant: "paragraph", style: { fontSize: "16px", color: "#333333", textAlign: "left" } },
    editableProps: [
      { name: 'text', label: 'Text', type: 'textarea' },
      { 
        name: 'variant', 
        label: 'Variant', 
        type: 'select', 
        options: [
          { value: 'heading', label: 'Heading' },
          { value: 'subheading', label: 'Subheading' },
          { value: 'paragraph', label: 'Paragraph' },
        ]
      },
    ]
  },
  image: {
    label: "Image",
    icon: "Image", 
    category: "Media",
    description: "Embed an image from a URL.",
    sampleData: { src: "https://via.placeholder.com/300x200", alt: "Placeholder Image" },
    editableProps: [
      { name: 'src', label: 'Image URL', type: 'text' },
      { name: 'alt', label: 'Alt Text', type: 'text' },
    ]
  },
  quote: {
    label: "Quote",
    icon: "Quote", 
    category: "Text",
    description: "Block for displaying quotes with an optional author.",
    sampleData: { text: "This is an inspiring quote.", author: "Author Name" },
    editableProps: [
      { name: 'text', label: 'Quote Text', type: 'textarea' },
      { name: 'author', label: 'Author', type: 'text' },
    ]
  },
  code: {
    label: "Code",
    icon: "Code2", 
    category: "Text",
    description: "Display a block of formatted code.",
    sampleData: { code: "console.log('Hello, world!');", language: "javascript" },
    editableProps: [
      { name: 'code', label: 'Code', type: 'textarea' },
      { name: 'language', label: 'Language', type: 'text' },
    ]
  },
  video: {
    label: "Video",
    icon: "Video", 
    category: "Media",
    description: "Embed a video from a URL (e.g., YouTube, Vimeo).",
    sampleData: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", provider: "youtube" },
    editableProps: [
      { name: 'src', label: 'Video URL', type: 'text' },
      { 
        name: 'provider', 
        label: 'Provider', 
        type: 'select', 
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'vimeo', label: 'Vimeo' },
          { value: 'upload', label: 'Uploaded File' },
          { value: 'other', label: 'Other URL' },
        ]
      }
    ]
  },
  list: {
    label: "List",
    icon: "List", 
    category: "Text",
    description: "Create ordered or unordered lists with flexible layouts and styling.",
    sampleData: { 
      items: [
        { id: 'item-1', text: "First item" }, 
        { id: 'item-2', text: "Second item" },
        { id: 'item-3', text: "Third item with icon", icon: "CheckCircle" }
      ], 
      ordered: false,
      layout: 'vertical',
      spacing: 8,
      itemStyle: { padding: "4px", borderBottom: "1px solid #eee" },
      listStyle: { padding: "10px", backgroundColor: "#f9f9f9" }
    },
    editableProps: [
      { 
        name: 'items', 
        label: 'List Items', 
        type: 'object_array',
        itemSchema: [
          // id will be managed internally, not directly editable here
          { name: 'text', label: 'Text', type: 'textarea' }, // Textarea for potentially longer item text
          { name: 'icon', label: 'Icon (Lucide Name)', type: 'text' },
          { name: 'style', label: 'Item Custom Style (JSON)', type: 'json' },
        ]
      },
      { name: 'ordered', label: 'Ordered List (Numbered)', type: 'checkbox' },
      { 
        name: 'layout', 
        label: 'Layout', 
        type: 'select',
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ]
      },
      { name: 'spacing', label: 'Spacing Between Items (px)', type: 'number' },
      { name: 'itemStyle', label: 'Common Item Style (JSON)', type: 'json' },
      { name: 'listStyle', label: 'List Container Style (JSON)', type: 'json' },
    ]
  },
  table: {
    label: "Table",
    icon: "Table", 
    category: "Data",
    description: "Display data in a tabular format.",
    sampleData: { rows: [["Header 1", "Header 2"], ["Data A1", "Data B1"]] }, 
    editableProps: [
       { 
         name: 'rows', 
         label: 'Table Rows', 
         type: 'object_array', 
         itemSchema: [ 
           { name: 'cells', label: 'Row Cells', type: 'string_array'}
         ] 
       },
    ]
  },
  chart: {
    label: "Chart",
    icon: "BarChart3", 
    category: "Data",
    description: "Visualize data with various chart types.",
    sampleData: { chartType: "bar", data: { labels: ["A"], datasets: [{ label: "Data", data: [10]}] } },
    editableProps: [
      { 
        name: 'chartType', 
        label: 'Chart Type', 
        type: 'select',
        options: [
          { value: 'bar', label: 'Bar' },
          { value: 'line', label: 'Line' },
          { value: 'pie', label: 'Pie' },
          { value: 'doughnut', label: 'Doughnut' },
          { value: 'radar', label: 'Radar' },
          { value: 'polarArea', label: 'Polar Area' },
          { value: 'scatter', label: 'Scatter' },
          { value: 'bubble', label: 'Bubble' },
        ]
      },
      { name: 'data', label: 'Chart Data', type: 'chart_data' }, 
      { name: 'options', label: 'Chart Options (JSON)', type: 'json'}, // For advanced Chart.js options
    ]
  },
  button: {
    label: "Button",
    icon: "MousePointerSquare", 
    category: "Interactive",
    description: "Add a clickable button with a link.",
    sampleData: { label: "Click Me", url: "#" },
    editableProps: [
      { name: 'label', label: 'Button Text', type: 'text' },
      { name: 'url', label: 'Link URL', type: 'text' },
    ]
  },
  shape: {
    label: "Shape",
    icon: "Square", 
    category: "Media",
    description: "Add basic shapes like rectangles or circles.",
    sampleData: { shape: "rectangle", style: { backgroundColor: "#3b82f6" } },
    editableProps: [
      { 
        name: 'shape',
        label: 'Shape', 
        type: 'select',
        options: [
          { value: 'rectangle', label: 'Rectangle' },
          { value: 'circle', label: 'Circle' },
          { value: 'line', label: 'Line' },
          { value: 'arrow', label: 'Arrow' },
        ]
      },
    ]
  },
  embed: {
    label: "Embed",
    icon: "Globe", 
    category: "Media",
    description: "Embed content from other websites (e.g., Google Maps, Typeform).",
    sampleData: { url: "https://example.com" },
    editableProps: [
      { name: 'url', label: 'Embed URL', type: 'text' },
    ]
  },
  checklist: {
    label: "Checklist",
    icon: "CheckSquare", 
    category: "Interactive",
    description: "Create a list of checkable items.",
    sampleData: { items: [{ text: "Task 1", checked: false }, { text: "Task 2", checked: true }] },
    editableProps: [
      {
        name: 'items',
        label: 'Checklist Items',
        type: 'object_array',
        itemSchema: [
          { name: 'text', label: 'Item Text', type: 'text' },
          { name: 'checked', label: 'Checked', type: 'checkbox' },
        ],
      },
    ],
  },
  divider: {
    label: "Divider",
    icon: "Minus",
    category: "Layout",
    description: "A horizontal line to separate content.",
    sampleData: {},
    editableProps: []
  },
  icon: {
    label: "Icon",
    icon: "Smile",
    category: "Media",
    description: "Add a Lucide icon.",
    sampleData: { iconName: "Heart" },
    editableProps: [
      { name: 'iconName', label: 'Icon Name (Lucide)', type: 'text' }
    ]
  },
  file: {
    label: "File",
    icon: "File",
    category: "Media",
    description: "Link to a downloadable file.",
    sampleData: { fileUrl: "#", fileName: "document.pdf" },
    editableProps: [
      { name: 'fileUrl', label: 'File URL', type: 'text' },
      { name: 'fileName', label: 'File Name', type: 'text' },
    ]
  },
  audio: {
    label: "Audio",
    icon: "Volume2",
    category: "Media",
    description: "Embed an audio file.",
    sampleData: { src: "#" },
    editableProps: [
      { name: 'src', label: 'Audio File URL', type: 'text' },
    ]
  },
  timer: {
    label: "Timer",
    icon: "Timer",
    category: "Interactive",
    description: "A countdown timer.",
    sampleData: { duration: 60 }, // seconds
    editableProps: [
      { name: 'duration', label: 'Duration (seconds)', type: 'number' },
    ]
  },
  poll: {
    label: "Poll",
    icon: "Signal",
    category: "Interactive",
    description: "Create a simple poll.",
    sampleData: { question: "Favorite Color?", options: ["Red", "Blue", "Green"] },
    editableProps: [
      { name: 'question', label: 'Poll Question', type: 'text' },
      { name: 'options', label: 'Options (comma-separated)', type: 'string_array' },
    ]
  },
  customHtml: {
    label: "Custom HTML",
    icon: "Code",
    category: "Advanced",
    description: "Embed custom HTML code.",
    sampleData: { html: "<p>Hello <strong>World</strong></p>" },
    editableProps: [
      { name: 'html', label: 'HTML Code', type: 'textarea' },
    ]
  },
  teamCard: {
    label: "Team Card",
    icon: "Users",
    category: "Pitch Deck",
    description: "Showcase team members.",
    sampleData: { members: [{ name: "Jane Doe", title: "CEO" }] },
    editableProps: [
      { name: 'members', label: 'Team Members', type: 'object_array', itemSchema: [
        { name: 'name', label: 'Name', type: 'text'},
        { name: 'title', label: 'Title', type: 'text'},
        { name: 'photoUrl', label: 'Photo URL', type: 'text'},
        { name: 'bio', label: 'Bio', type: 'textarea'},
        { name: 'linkedin', label: 'LinkedIn URL', type: 'text'},
      ]}
    ]
  },
  tractionWidget: {
    label: "Traction Widget",
    icon: "TrendingUp",
    category: "Pitch Deck",
    description: "Display key traction metrics.",
    sampleData: { metrics: [{ label: "Users", value: "10K+"}] },
    editableProps: [
      { name: 'metrics', label: 'Metrics', type: 'object_array', itemSchema: [
        { name: 'label', label: 'Label', type: 'text'},
        { name: 'value', label: 'Value', type: 'text'},
        { name: 'icon', label: 'Icon (Lucide)', type: 'text'},
        { name: 'trend', label: 'Trend', type: 'select', options: [{value: 'up', label: 'Up'}, {value: 'down', label: 'Down'}, {value: 'flat', label: 'Flat'}]},
        { name: 'description', label: 'Description', type: 'text'},
      ]}
    ]
  },
  timeline: {
    label: "Timeline",
    icon: "GitCommit",
    category: "Pitch Deck",
    description: "Illustrate milestones over time.",
    sampleData: { milestones: [{ date: "Q1 2024", label: "Launch"}] },
    editableProps: [
      { name: 'milestones', label: 'Milestones', type: 'object_array', itemSchema: [
        { name: 'date', label: 'Date', type: 'text'},
        { name: 'label', label: 'Label', type: 'text'},
        { name: 'description', label: 'Description', type: 'textarea'},
        { name: 'icon', label: 'Icon (Lucide)', type: 'text'},
      ]}
    ]
  },
  marketMap: {
    label: "Market Map",
    icon: "Map",
    category: "Pitch Deck",
    description: "Show TAM, SAM, SOM.",
    sampleData: { tam: 1000000000, sam: 100000000, som: 10000000 },
    editableProps: [
      { name: 'tam', label: 'TAM ($)', type: 'number'},
      { name: 'sam', label: 'SAM ($)', type: 'number'},
      { name: 'som', label: 'SOM ($)', type: 'number'},
      { name: 'notes', label: 'Notes', type: 'textarea'},
    ]
  },
  competitorTable: {
    label: "Competitor Table",
    icon: "TableProperties",
    category: "Pitch Deck",
    description: "Compare features with competitors.",
    sampleData: { competitors: [{ name: "Competitor A", features: { "Feature 1": true } }], featureList: ["Feature 1"] },
    editableProps: [
      { name: 'featureList', label: 'Feature List (comma-separated)', type: 'string_array' },
      { name: 'competitors', label: 'Competitors', type: 'competitor_features' } // Uses specialized editor
    ]
  },
  problemSolution: {
    label: "Problem/Solution",
    icon: "Lightbulb",
    category: "Pitch Deck",
    description: "Outline the problem and your solution.",
    sampleData: { problem: "The problem is...", solution: "Our solution is..." },
    editableProps: [
      { name: 'problem', label: 'Problem', type: 'textarea'},
      { name: 'solution', label: 'Solution', type: 'textarea'},
      { name: 'icon', label: 'Icon (Lucide)', type: 'text'},
    ]
  },
  logoWall: {
    label: "Logo Wall",
    icon: "GalleryHorizontal",
    category: "Pitch Deck",
    description: "Display partner or client logos.",
    sampleData: { logos: [{ src: "https://via.placeholder.com/100", alt: "Logo" }] },
    editableProps: [
      { name: 'logos', label: 'Logos', type: 'object_array', itemSchema: [
        { name: 'src', label: 'Logo URL', type: 'text'},
        { name: 'alt', label: 'Alt Text', type: 'text'},
        { name: 'url', label: 'Link URL (Optional)', type: 'text'},
      ]}
    ]
  },
  businessModel: {
    label: "Business Model",
    icon: "Briefcase",
    category: "Pitch Deck",
    description: "Explain how your business makes money.",
    sampleData: { streams: [{ label: "Revenue Stream 1", value: "Description" }] },
    editableProps: [
      { name: 'streams', label: 'Revenue Streams', type: 'object_array', itemSchema: [
        { name: 'label', label: 'Stream Label', type: 'text'},
        { name: 'value', label: 'Description', type: 'textarea'},
      ]},
      { name: 'diagramUrl', label: 'Diagram URL (Optional)', type: 'text'},
    ]
  },
  testimonialCard: {
    label: "Testimonial Card",
    icon: "MessageSquare",
    category: "Pitch Deck",
    description: "Feature a customer testimonial.",
    sampleData: { quote: "Amazing product!", author: "Happy Customer" },
    editableProps: [
      { name: 'quote', label: 'Quote', type: 'textarea'},
      { name: 'author', label: 'Author', type: 'text'},
      { name: 'photoUrl', label: 'Author Photo URL', type: 'text'},
      { name: 'logoUrl', label: 'Company Logo URL', type: 'text'},
    ]
  },
  useOfFunds: {
    label: "Use of Funds",
    icon: "PieChart",
    category: "Pitch Deck",
    description: "Show how investment will be used.",
    sampleData: { categories: [{ label: "R&D", percent: 40 }] },
    editableProps: [
      { name: 'categories', label: 'Fund Categories', type: 'object_array', itemSchema: [
        { name: 'label', label: 'Category', type: 'text'},
        { name: 'percent', label: 'Percentage', type: 'number'},
      ]}
    ]
  },
  ctaCard: {
    label: "Call to Action Card",
    icon: "MousePointerClick",
    category: "Pitch Deck",
    description: "A card with a clear call to action.",
    sampleData: { text: "Invest Now!", buttonLabel: "Contact Us" },
    editableProps: [
      { name: 'text', label: 'Main Text', type: 'textarea'},
      { name: 'buttonLabel', label: 'Button Label', type: 'text'},
      { name: 'buttonUrl', label: 'Button URL', type: 'text'},
    ]
  },
  demoGallery: {
    label: "Demo Gallery",
    icon: "GalleryThumbnails",
    category: "Pitch Deck",
    description: "Showcase product demos (images/videos).",
    sampleData: { items: [{ type: "image", src: "https://via.placeholder.com/300" }] },
    editableProps: [
      { name: 'items', label: 'Gallery Items', type: 'object_array', itemSchema: [
        { name: 'type', label: 'Type', type: 'select', options: [{value: 'image', label: 'Image'}, {value: 'video', label: 'Video'}]},
        { name: 'src', label: 'Source URL', type: 'text'},
        { name: 'caption', label: 'Caption', type: 'text'},
      ]}
    ]
  },
  milestoneTracker: {
    label: "Milestone Tracker",
    icon: "CheckCircle2",
    category: "Pitch Deck",
    description: "Track progress against milestones.",
    sampleData: { milestones: [{ label: "MVP Launch", completed: true }] },
    editableProps: [
      { name: 'milestones', label: 'Milestones', type: 'object_array', itemSchema: [
        { name: 'label', label: 'Label', type: 'text'},
        { name: 'completed', label: 'Completed', type: 'checkbox'},
      ]}
    ]
  },
  investmentAsk: {
    label: "Investment Ask",
    icon: "DollarSign",
    category: "Pitch Deck",
    description: "Clearly state the investment ask.",
    sampleData: { amount: "$500K", equity: "10%" },
    editableProps: [
      { name: 'amount', label: 'Amount', type: 'text'},
      { name: 'equity', label: 'Equity Offered', type: 'text'},
      { name: 'terms', label: 'Terms (Optional)', type: 'textarea'},
    ]
  },
  mapBlock: { // Renamed from 'map' to avoid conflict
    label: "Map Block",
    icon: "MapPin",
    category: "Media",
    description: "Embed a map (e.g., Google Maps).",
    sampleData: { location: "San Francisco, CA" },
    editableProps: [
      { name: 'location', label: 'Location (for search)', type: 'text'},
      { name: 'mapUrl', label: 'Embed URL (optional, overrides location)', type: 'text'},
    ]
  },
  customImage: { // Assuming this is different from the basic 'image'
    label: "Custom Image",
    icon: "ImageIcon",
    category: "Media",
    description: "Image with more customization options.",
    sampleData: { src: "https://via.placeholder.com/400", alt: "Custom Image" },
    editableProps: [
      { name: 'src', label: 'Image URL', type: 'text' },
      { name: 'alt', label: 'Alt Text', type: 'text' },
      // Add more custom props here if needed
    ]
  },
  metricCounter: {
    label: "Metric Counter",
    icon: "Gauge",
    category: "Data",
    description: "Display a single, animated metric.",
    sampleData: { label: "Active Users", value: 1250, trend: "up" },
    editableProps: [
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'value', label: 'Value', type: 'number' },
      { name: 'targetValue', label: 'Target Value (Optional)', type: 'number' },
      { name: 'prefix', label: 'Prefix (e.g., $)', type: 'text' },
      { name: 'suffix', label: 'Suffix (e.g., %)', type: 'text' },
      { name: 'duration', label: 'Animation Duration (ms)', type: 'number' },
      { name: 'trend', label: 'Trend', type: 'select', options: [{value: 'up', label: 'Up'}, {value: 'down', label: 'Down'}, {value: 'flat', label: 'Flat'}]},
      { name: 'icon', label: 'Icon (Lucide)', type: 'text' },
    ]
  },
  socialProofBadge: {
    label: "Social Proof Badge",
    icon: "Award",
    category: "Marketing",
    description: "Small badge for social proof (e.g., 'As seen on').",
    sampleData: { text: "Featured on TechCrunch" },
    editableProps: [
      { name: 'text', label: 'Text', type: 'text' },
      { name: 'icon', label: 'Icon (Lucide)', type: 'text' },
      { name: 'imageUrl', label: 'Image URL (e.g., publication logo)', type: 'text' },
      { name: 'linkUrl', label: 'Link URL', type: 'text' },
    ]
  },
  opportunityIndicator: {
    label: "Opportunity Indicator",
    icon: "Target",
    category: "Pitch Deck",
    description: "Highlight a key opportunity or market size.",
    sampleData: { title: "Market Size", value: "$10B Annually" },
    editableProps: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'value', label: 'Value (e.g., $10B, 2x Growth)', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon (Lucide)', type: 'text' },
    ]
  },
  beforeAfterComparison: {
    label: "Before/After Comparison",
    icon: "GitCompare",
    category: "Visuals",
    description: "Showcase a transformation with two images.",
    sampleData: { beforeImageSrc: "https://via.placeholder.com/300/cccccc/000000?text=Before", afterImageSrc: "https://via.placeholder.com/300/3b82f6/ffffff?text=After" },
    editableProps: [
      { name: 'beforeImageSrc', label: 'Before Image URL', type: 'text' },
      { name: 'beforeImageAlt', label: 'Before Image Alt Text', type: 'text' },
      { name: 'beforeLabel', label: 'Before Label (Optional)', type: 'text' },
      { name: 'afterImageSrc', label: 'After Image URL', type: 'text' },
      { name: 'afterImageAlt', label: 'After Image Alt Text', type: 'text' },
      { name: 'afterLabel', label: 'After Label (Optional)', type: 'text' },
      { name: 'orientation', label: 'Orientation', type: 'select', options: [{value: 'horizontal', label: 'Horizontal'}, {value: 'vertical', label: 'Vertical'}] },
    ]
  },
  benefitCard: {
    label: "Benefit Card",
    icon: "Sparkles",
    category: "Marketing",
    description: "Highlight a key benefit or feature.",
    sampleData: { title: "Increased Efficiency", description: "Save 20% time." },
    editableProps: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon (Lucide)', type: 'text' },
      { name: 'imageUrl', label: 'Image URL (Optional)', type: 'text' },
    ]
  },
  competitivePositioning: {
    label: "Competitive Positioning",
    icon: "Crosshair",
    category: "Pitch Deck",
    description: "2x2 matrix for competitive landscape.",
    sampleData: { chartData: { type: 'json', data: { xLabel: "Price", yLabel: "Quality", points: [{ name: "Us", x: 0.8, y: 0.9, color: "#3b82f6" }] } } },
    editableProps: [
      { name: 'title', label: 'Chart Title', type: 'text' },
      { name: 'chartData', label: 'Positioning Data', type: 'competitive_positioning' } // Specialized editor
    ]
  },
  marketSegments: {
    label: "Market Segments",
    icon: "PieChart", // Or another suitable chart icon
    category: "Pitch Deck",
    description: "Visualize market segments (e.g., pie chart).",
    sampleData: { segmentData: { type: 'json', data: { segments: [{ name: "Segment A", value: 60, color: "#3b82f6" }] } } },
    editableProps: [
      { name: 'title', label: 'Chart Title', type: 'text' },
      { name: 'segmentData', label: 'Segment Data', type: 'market_segments' } // Specialized editor
    ]
  },
  advisorCard: {
    label: "Advisor Card",
    icon: "UserCheck",
    category: "Pitch Deck",
    description: "Showcase an advisor.",
    sampleData: { name: "Dr. Expert", title: "Industry Advisor" },
    editableProps: [
      { name: 'name', label: 'Name', type: 'text'},
      { name: 'title', label: 'Title', type: 'text'},
      { name: 'company', label: 'Company (Optional)', type: 'text'},
      { name: 'photoUrl', label: 'Photo URL', type: 'text'},
      { name: 'bio', label: 'Short Bio', type: 'textarea'},
      { name: 'linkedin', label: 'LinkedIn URL', type: 'text'},
    ]
  },
  hiringPlan: {
    label: "Hiring Plan",
    icon: "UserPlus",
    category: "Pitch Deck",
    description: "Outline key hires and timeline.",
    sampleData: { roles: [{ title: "Lead Engineer", department: "Tech", count: 1, timeline: "Q3 2024" }] },
    editableProps: [
      { name: 'title', label: 'Plan Title (Optional)', type: 'text' },
      { name: 'roles', label: 'Roles to Hire', type: 'object_array', itemSchema: [
        { name: 'title', label: 'Role Title', type: 'text'},
        { name: 'department', label: 'Department', type: 'text'},
        { name: 'count', label: 'Number to Hire', type: 'number'},
        { name: 'timeline', label: 'Timeline (e.g., Q3 2024)', type: 'text'},
      ]}
    ]
  },
  skillMatrix: {
    label: "Skill Matrix",
    icon: "Grid",
    category: "Pitch Deck",
    description: "Team skills assessment matrix.",
    sampleData: { matrixData: { type: 'json', data: { skills: ["Skill A"], team: [{ name: "Member 1", scores: [4] }] } } },
    editableProps: [
      { name: 'title', label: 'Matrix Title', type: 'text' },
      { name: 'matrixData', label: 'Skill Matrix Data', type: 'skill_matrix' } // Specialized editor
    ]
  },
  pressCard: {
    label: "Press Card",
    icon: "Newspaper",
    category: "Marketing",
    description: "Feature a press mention.",
    sampleData: { publicationLogoUrl: "https://via.placeholder.com/100x30?text=Publication", headline: "Startup Makes Waves" , articleUrl: "#"},
    editableProps: [
      { name: 'publicationLogoUrl', label: 'Publication Logo URL', type: 'text'},
      { name: 'headline', label: 'Headline', type: 'text'},
      { name: 'articleUrl', label: 'Article URL', type: 'text'},
      { name: 'date', label: 'Publication Date (Optional)', type: 'text'},
    ]
  },
  partnershipCard: {
    label: "Partnership Card",
    icon: "Handshake",
    category: "Marketing",
    description: "Highlight a key partnership.",
    sampleData: { partnerLogoUrl: "https://via.placeholder.com/100x30?text=Partner", partnerName: "Partner Inc.", description: "Strategic Alliance" },
    editableProps: [
      { name: 'partnerLogoUrl', label: 'Partner Logo URL', type: 'text'},
      { name: 'partnerName', label: 'Partner Name', type: 'text'},
      { name: 'description', label: 'Partnership Description', type: 'textarea'},
      { name: 'announcementUrl', label: 'Announcement URL (Optional)', type: 'text'},
    ]
  },
  investorContactForm: {
    label: "Investor Contact Form",
    icon: "Mail",
    category: "Interactive",
    description: "A form for interested investors.",
    sampleData: { formFields: [{ name: "email", label: "Your Email", type: "email", required: true }] },
    editableProps: [
      { name: 'title', label: 'Form Title (Optional)', type: 'text' },
      { name: 'formFields', label: 'Form Fields', type: 'object_array', itemSchema: [
        { name: 'name', label: 'Field Name (unique ID)', type: 'text'},
        { name: 'label', label: 'Field Label', type: 'text'},
        { name: 'type', label: 'Field Type', type: 'select', options: [
          {value: 'text', label: 'Text Input'},
          {value: 'email', label: 'Email Input'},
          {value: 'textarea', label: 'Text Area'},
        ]},
        { name: 'required', label: 'Required', type: 'checkbox'},
      ]},
      { name: 'submitButtonText', label: 'Submit Button Text', type: 'text' },
      { name: 'recipientEmail', label: 'Recipient Email (for submission)', type: 'text' },
    ]
  },
  heroImage: {
    label: "Hero Image",
    icon: "Image",
    category: "Visuals",
    description: "Large, impactful image, often with text overlay.",
    sampleData: { src: "https://via.placeholder.com/800x400", headline: "Big Headline" },
    editableProps: [
      { name: 'src', label: 'Image URL', type: 'text' },
      { name: 'alt', label: 'Alt Text', type: 'text' },
      { name: 'headline', label: 'Headline (Optional)', type: 'text' },
      { name: 'subheadline', label: 'Sub-headline (Optional)', type: 'text' },
      { name: 'overlayText', label: 'Overlay Text (Optional)', type: 'textarea' },
      { name: 'overlayPosition', label: 'Overlay Position', type: 'select', options: [
          {value: 'center', label: 'Center'}, {value: 'bottom', label: 'Bottom'}, {value: 'top', label: 'Top'}, {value: 'left', label: 'Left'}, {value: 'right', label: 'Right'}
      ]},
      { name: 'overlayColor', label: 'Overlay Color (e.g., rgba(0,0,0,0.5))', type: 'color' },
      { name: 'ctaText', label: 'CTA Button Text (Optional)', type: 'text' },
      { name: 'ctaUrl', label: 'CTA Button URL (Optional)', type: 'text' },
    ]
  },
  imageGallery: {
    label: "Image Gallery",
    icon: "GalleryVertical",
    category: "Visuals",
    description: "Display multiple images in various layouts.",
    sampleData: { images: [{ src: "https://via.placeholder.com/200" }] },
    editableProps: [
      { name: 'images', label: 'Images', type: 'object_array', itemSchema: [
        { name: 'src', label: 'Image URL', type: 'text'},
        { name: 'alt', label: 'Alt Text', type: 'text'},
        { name: 'caption', label: 'Caption (Optional)', type: 'text'},
      ]},
      { name: 'layout', label: 'Layout', type: 'select', options: [
        {value: 'grid', label: 'Grid'}, {value: 'masonry', label: 'Masonry'}, {value: 'carousel', label: 'Carousel'}
      ]},
      { name: 'columns', label: 'Columns (for Grid/Masonry)', type: 'number' },
      { name: 'spacing', label: 'Spacing (px)', type: 'number' },
      { name: 'showCaptions', label: 'Show Captions', type: 'select', options: [
        {value: 'hover', label: 'On Hover'}, {value: 'always', label: 'Always'}, {value: 'none', label: 'None'}
      ]},
    ]
  },
  featureCard: {
    label: "Feature Card",
    icon: "Star",
    category: "Content",
    description: "Card to highlight a specific feature or benefit.",
    sampleData: { title: "Amazing Feature", description: "It does this and that." },
    editableProps: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'imageUrl', label: 'Image URL (Optional)', type: 'text' },
      { name: 'icon', label: 'Icon (Lucide Name, Optional)', type: 'text' },
      { name: 'features', label: 'Bullet Points (Optional)', type: 'string_array' },
      { name: 'layout', label: 'Layout', type: 'select', options: [
        {value: 'horizontal', label: 'Horizontal'}, {value: 'vertical', label: 'Vertical'}, {value: 'icon-top', label: 'Icon Top'}, {value: 'icon-left', label: 'Icon Left'}
      ]},
      { name: 'linkUrl', label: 'Link URL (Optional)', type: 'text' },
      { name: 'linkText', label: 'Link Text (Optional)', type: 'text' },
      { name: 'backgroundColor', label: 'Background Color', type: 'color' },
      { name: 'textColor', label: 'Text Color', type: 'color' },
    ]
  },
  mediaHero: {
    label: "Media Hero",
    icon: "Film",
    category: "Visuals",
    description: "Hero section with image or video background and text.",
    sampleData: { mediaType: "image", src: "https://via.placeholder.com/800x450", headline: "Impactful Media" },
    editableProps: [
      { name: 'mediaType', label: 'Media Type', type: 'select', options: [{value: 'image', label: 'Image'}, {value: 'video', label: 'Video'}] },
      { name: 'src', label: 'Media URL', type: 'text' },
      { name: 'alt', label: 'Image Alt Text (if image)', type: 'text' },
      { name: 'poster', label: 'Video Poster URL (if video)', type: 'text' },
      { name: 'headline', label: 'Headline', type: 'text' },
      { name: 'subheadline', label: 'Sub-headline (Optional)', type: 'text' },
      { name: 'description', label: 'Description (Optional)', type: 'textarea' },
      { name: 'textPosition', label: 'Text Position', type: 'select', options: [
        {value: 'left', label: 'Left'}, {value: 'right', label: 'Right'}, {value: 'overlay-center', label: 'Overlay Center'}, {value: 'overlay-bottom', label: 'Overlay Bottom'}
      ]},
      { name: 'buttonText', label: 'Button Text (Optional)', type: 'text' },
      { name: 'buttonUrl', label: 'Button URL (Optional)', type: 'text' },
      { name: 'backgroundColor', label: 'Background Color (for text area if not overlay)', type: 'color' },
      { name: 'textColor', label: 'Text Color', type: 'color' },
    ]
  },
  citation: {
    label: "Citation",
    icon: "BookText",
    category: "Text",
    description: "Formatted citation or reference.",
    sampleData: { text: "Doe, J. (2024). The Book of Examples." },
    editableProps: [
      { name: 'text', label: 'Full Citation Text', type: 'textarea' },
      { name: 'source', label: 'Source (Optional)', type: 'text' },
      { name: 'author', label: 'Author(s) (Optional)', type: 'text' },
      { name: 'year', label: 'Year (Optional)', type: 'text' },
      { name: 'citationStyle', label: 'Citation Style', type: 'select', options: [
        {value: 'APA', label: 'APA'}, {value: 'MLA', label: 'MLA'}, {value: 'Chicago', label: 'Chicago'}, {value: 'Harvard', label: 'Harvard'}, {value: 'Vancouver', label: 'Vancouver'}, {value: 'IEEE', label: 'IEEE'}
      ]},
      { name: 'url', label: 'URL (Optional)', type: 'text' },
    ]
  },
  statsDisplay: {
    label: "Stats Display",
    icon: "TrendingUp",
    category: "Data",
    description: "Showcase multiple key statistics.",
    sampleData: { stats: [{ value: "1.2M", label: "Users" }] },
    editableProps: [
      { name: 'stats', label: 'Statistics', type: 'object_array', itemSchema: [
        { name: 'value', label: 'Value', type: 'text'},
        { name: 'label', label: 'Label', type: 'text'},
        { name: 'icon', label: 'Icon (Lucide Name)', type: 'text'}, // Keep as text for now, will use IconSelector in panel
        { name: 'trend', label: 'Trend (Optional)', type: 'select', options: [{value: 'up', label: 'Up'}, {value: 'down', label: 'Down'}, {value: 'flat', label: 'Flat'}]},
        { name: 'color', label: 'Color (Optional)', type: 'color'},
        { name: 'description', label: 'Description (Optional)', type: 'text'},
      ]},
      { name: 'layout', label: 'Layout', type: 'select', options: [
        {value: 'horizontal', label: 'Horizontal'}, {value: 'vertical', label: 'Vertical'}, {value: 'grid', label: 'Grid'}
      ]},
      { name: 'columns', label: 'Columns (for Grid)', type: 'number' },
      { name: 'cardStyle', label: 'Card Style', type: 'select', options: [
        {value: 'simple', label: 'Simple'}, {value: 'card', label: 'Card'}, {value: 'pill', label: 'Pill'}
      ]},
    ]
  },
  visualQuote: {
    label: "Visual Quote",
    icon: "Quote",
    category: "Text",
    description: "A quote with more visual emphasis, potentially author image/logo.",
    sampleData: { text: "This is a visually appealing quote.", author: "Stylish Author" },
    editableProps: [
      { name: 'text', label: 'Quote Text', type: 'textarea' },
      { name: 'author', label: 'Author (Optional)', type: 'text' },
      { name: 'authorTitle', label: 'Author Title (Optional)', type: 'text' },
      { name: 'authorImage', label: 'Author Image URL (Optional)', type: 'text' },
      { name: 'companyLogo', label: 'Company Logo URL (Optional)', type: 'text' },
      { name: 'quoteStyle', label: 'Quote Style', type: 'select', options: [
        {value: 'minimal', label: 'Minimal'}, {value: 'card', label: 'Card'}, {value: 'banner', label: 'Banner'}, {value: 'inline-image', label: 'Inline Image'}, {value: 'pull-quote', label: 'Pull Quote'}
      ]},
      { name: 'backgroundColor', label: 'Background Color', type: 'color' },
      { name: 'textColor', label: 'Text Color', type: 'color' },
      { name: 'accentColor', label: 'Accent Color', type: 'color' },
    ]
  },
  iconFeature: {
    label: "Icon Feature",
    icon: "Star", // Placeholder, choose a better one
    category: "Content",
    description: "Small content block with an icon, title, and description.",
    sampleData: { icon: "Zap", title: "Fast Performance", description: "Lightning speed." },
    editableProps: [
      { name: 'icon', label: 'Icon (Lucide Name)', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'iconColor', label: 'Icon Color (Optional)', type: 'color' },
      { name: 'iconSize', label: 'Icon Size', type: 'select', options: [
        {value: 'small', label: 'Small'}, {value: 'medium', label: 'Medium'}, {value: 'large', label: 'Large'}, {value: 'xlarge', label: 'X-Large'}
      ]},
      { name: 'layout', label: 'Layout', type: 'select', options: [
        {value: 'vertical-center', label: 'Vertical Center'}, {value: 'horizontal-left', label: 'Horizontal Left'}, {value: 'horizontal-center', label: 'Horizontal Center'}
      ]},
      { name: 'titleSize', label: 'Title Size (e.g., text-lg)', type: 'text' },
      { name: 'descriptionSize', label: 'Description Size (e.g., text-sm)', type: 'text' },
    ]
  },
  imageWithCaption: {
    label: "Image With Caption",
    icon: "ImagePlay",
    category: "Visuals",
    description: "An image with a styled caption.",
    sampleData: { src: "https://via.placeholder.com/400x300", caption: "A descriptive caption." },
    editableProps: [
      { name: 'src', label: 'Image URL', type: 'text' },
      { name: 'alt', label: 'Alt Text', type: 'text' },
      { name: 'caption', label: 'Caption', type: 'textarea' },
      { name: 'captionPosition', label: 'Caption Position', type: 'select', options: [
        {value: 'bottom', label: 'Bottom'}, {value: 'top', label: 'Top'}, {value: 'overlay-bottom', label: 'Overlay Bottom'}, {value: 'overlay-top', label: 'Overlay Top'}
      ]},
      { name: 'captionStyle', label: 'Caption Style', type: 'select', options: [
        {value: 'simple', label: 'Simple'}, {value: 'card', label: 'Card'}, {value: 'transparent-overlay', label: 'Transparent Overlay'}
      ]},
      { name: 'imageStyle', label: 'Image Style', type: 'select', options: [
        {value: 'rounded', label: 'Rounded'}, {value: 'shadow', label: 'Shadow'}, {value: 'full-bleed', label: 'Full Bleed'}
      ]},
      { name: 'textAlign', label: 'Text Align', type: 'select', options: [
        {value: 'left', label: 'Left'}, {value: 'center', label: 'Center'}, {value: 'right', label: 'Right'}
      ]},
    ]
  },
  calloutBox: {
    label: "Callout Box",
    icon: "AlertTriangle",
    category: "Content",
    description: "A box to draw attention to important information.",
    sampleData: { text: "Important note!", variant: "info" },
    editableProps: [
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'title', label: 'Title (Optional)', type: 'text' },
      { name: 'iconName', label: 'Icon Name (Lucide, Optional)', type: 'text' },
      { name: 'iconSize', label: 'Icon Size', type: 'select', options: [
        {value: 'small', label: 'Small'}, {value: 'medium', label: 'Medium'}, {value: 'large', label: 'Large'}
      ]},
      { name: 'variant', label: 'Variant', type: 'select', options: [
        {value: 'info', label: 'Info'}, {value: 'warning', label: 'Warning'}, {value: 'success', label: 'Success'}, {value: 'danger', label: 'Danger'}, {value: 'custom', label: 'Custom'}
      ]},
      { name: 'backgroundColor', label: 'Background Color (Custom)', type: 'color' },
      { name: 'borderColor', label: 'Border Color (Custom)', type: 'color' },
      { name: 'textColor', label: 'Text Color (Custom)', type: 'color' },
      { name: 'iconColor', label: 'Icon Color (Custom)', type: 'color' },
    ]
  }
};
