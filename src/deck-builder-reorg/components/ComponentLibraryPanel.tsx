import React, { useState } from "react";
import { 
  Type, Image, Quote, Code, Video, List, Table, BarChart3, MousePointer, Square, Globe, CheckCircle, Minus, Star, FileText, Music, TimerIcon, BarChart, Code2, Users, TrendingUp, CalendarDays, PieChart as PieChartIcon, Columns, RefreshCcwIcon, LayoutGrid, Briefcase, MessageSquare, DollarSign, MapPin, Box, Flag, X, Plus, // Added X and Plus
  LayoutPanelLeft, SlidersHorizontal, ThumbsUp, Landmark, // Existing category icons
  Palette, // For Visual category
  FileText as FileTextIcon, // For Content category (re-using FileText for now)
  Info as InfoIconLucide, AlertTriangle as AlertTriangleIcon, CheckCircle2 as CheckCircleIcon, AlertOctagon as AlertOctagonIcon, // For CalloutBox variants
  Presentation as PresentationIcon, // For HeroImage, MediaHero
  Award as AwardIcon, // For StatsDisplay, IconFeature
  BookText as BookTextIcon, // For Citation
  Zap as ZapIcon, // For FeatureCard
  Quote as QuoteLucideIcon, // For VisualQuote
  GalleryHorizontal as GalleryHorizontalIcon, // For ImageGallery
} from "lucide-react"; 
import { BLOCK_REGISTRY, BlockType } from "../types/blocks";

export interface Component { // Define and export Component interface
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  component: { type: BlockType; sampleData?: any };
}

// Map block type to Lucide icon component
const ICON_MAP: Record<string, React.ElementType> = {
  text: Type,
  image: Image,
  quote: Quote,
  code: Code,
  video: Video,
  list: List,
  table: Table,
  chart: BarChart3,
  button: MousePointer,
  shape: Square,
  embed: Globe,
  checklist: CheckCircle,
  divider: Minus,
  icon: Star,
  file: FileText,
  audio: Music,
  timer: TimerIcon,
  poll: BarChart, 
  customHtml: Code2,
  teamCard: Users,
  tractionWidget: TrendingUp,
  timeline: CalendarDays,
  marketMap: PieChartIcon,
  competitorTable: Columns, // Changed from Table to Columns for variety
  problemSolution: RefreshCcwIcon,
  logoWall: LayoutGrid, // Changed from Grid
  businessModel: Briefcase,
  testimonialCard: MessageSquare, // Changed from MessageCircle
  useOfFunds: PieChartIcon, // Re-using PieChartIcon
  ctaCard: MousePointer,
  demoGallery: Image,
  milestoneTracker: Flag, // This was causing the error
  investmentAsk: DollarSign,
  mapBlock: MapPin,
  customImage: Image, 
  // Phase 1 Visual Components
  heroImage: PresentationIcon,
  imageGallery: GalleryHorizontalIcon,
  featureCard: ZapIcon,
  mediaHero: PresentationIcon,
  citation: BookTextIcon,
  statsDisplay: AwardIcon, // Or TrendingUp
  visualQuote: QuoteLucideIcon,
  iconFeature: AwardIcon, // Or Star
  imageWithCaption: Image,
  // Phase 2 Components
  calloutBox: InfoIconLucide, // Default icon for the category, specific icon in renderer
  default: Box, // Fallback icon
};

const CATEGORY_MAP: Record<string, string> = {
  text: "Text",
  image: "Media",
  quote: "Text",
  code: "Text",
  video: "Media",
  list: "Text",
  table: "Data",
  chart: "Data",
  button: "Interactive",
  shape: "Media",
  embed: "Media",
  checklist: "Interactive",
  divider: "Layout", // Changed from Text to Layout
  icon: "Media",
  file: "Media",
  audio: "Media",
  timer: "Interactive",
  poll: "Interactive",
  customHtml: "Advanced", // Changed from Interactive to Advanced
  teamCard: "Business",
  tractionWidget: "Business",
  timeline: "Business",
  marketMap: "Business",
  competitorTable: "Business",
  problemSolution: "Business",
  logoWall: "Business",
  businessModel: "Business",
  testimonialCard: "Social Proof", // Changed from Business to Social Proof
  useOfFunds: "Financials", // Changed from Business to Financials
  ctaCard: "Interactive",
  demoGallery: "Media",
  milestoneTracker: "Business",
  investmentAsk: "Financials", 
  mapBlock: "Business",
  customImage: "Media", 
  // Phase 1 Visual Components
  heroImage: "Visual",
  imageGallery: "Visual",
  featureCard: "Content",
  mediaHero: "Visual",
  citation: "Text",
  statsDisplay: "Data", // Or Visual
  visualQuote: "Visual",
  iconFeature: "Content",
  imageWithCaption: "Media",
  // Phase 2 Components
  calloutBox: "Text",
  // New Block Types for Enhanced Templates (ensure these are covered if added to BLOCK_REGISTRY)
  metricCounter: "Data",
  socialProofBadge: "Social Proof",
  opportunityIndicator: "Business",
  beforeAfterComparison: "Visual",
  benefitCard: "Content",
  competitivePositioning: "Business",
  marketSegments: "Business",
  advisorCard: "Team", // New Category
  hiringPlan: "Team",
  skillMatrix: "Team",
  pressCard: "Social Proof",
  partnershipCard: "Business",
  investorContactForm: "Interactive",
};

const componentCategories = [
  { id: "Text", name: "Text", icon: <Type className="h-4 w-4" /> },
  { id: "Media", name: "Media", icon: <Image className="h-4 w-4" /> },
  { id: "Visual", name: "Visual", icon: <Palette className="h-4 w-4" /> }, // New Category
  { id: "Content", name: "Content", icon: <FileTextIcon className="h-4 w-4" /> }, // New Category
  { id: "Data", name: "Data", icon: <BarChart3 className="h-4 w-4" /> }, // Was Charts
  { id: "Layout", name: "Layout", icon: <LayoutPanelLeft className="h-4 w-4" /> },
  { id: "Interactive", name: "Interactive", icon: <MousePointer className="h-4 w-4" /> },
  { id: "Business", name: "Business", icon: <Briefcase className="h-4 w-4" /> },
  { id: "Team", name: "Team", icon: <Users className="h-4 w-4" /> }, // New Category
  { id: "Social Proof", name: "Social Proof", icon: <ThumbsUp className="h-4 w-4" /> },
  { id: "Financials", name: "Financials", icon: <Landmark className="h-4 w-4" /> },
  { id: "Advanced", name: "Advanced", icon: <SlidersHorizontal className="h-4 w-4" /> },
];

interface ComponentLibraryPanelProps {
  onAddComponent: (componentType: BlockType) => void; // Changed prop type
  onClose?: () => void;
  onCreateCustomComponent?: (type: "image" | "html") => void;
}

export function ComponentLibraryPanel({
  onAddComponent,
  onClose,
  onCreateCustomComponent
}: ComponentLibraryPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Text");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate the full list of components from BLOCK_REGISTRY
  // Dynamically generate all components from BLOCK_REGISTRY, grouped by category
  const components = Object.entries(BLOCK_REGISTRY).map(([type, meta]) => {
    const IconComponent = ICON_MAP[type] || ICON_MAP.default; // Use direct component reference
    return {
      id: type,
      name: meta.label,
      icon: <IconComponent className="h-4 w-4" />, // Render the component directly
      category: CATEGORY_MAP[type] || "Other",
      description: meta.description || "",
      component: {
        type: type as BlockType,
        sampleData: meta.sampleData || {}
      }
    };
  });

  const filteredComponents = components.filter((component) => {
    const matchesCategory =
      activeCategory === "all" ||
      component.category === activeCategory ||
      component.category === componentCategories.find((c) => c.id === activeCategory)?.name;
    const matchesSearch =
      searchQuery === "" ||
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {componentCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center space-x-1 transition-colors ${
                activeCategory === category.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Custom Component Buttons */}
        {onCreateCustomComponent && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Create Custom Components</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onCreateCustomComponent("image")}
                className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
              >
                <Image className="h-3 w-3" />
                <span>Custom Image</span>
              </button>
              <button
                onClick={() => onCreateCustomComponent("html")}
                className="px-3 py-2 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1"
              >
                <Code2 className="h-3 w-3" />
                <span>HTML Component</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {filteredComponents.map((component) => (
            <ComponentItemCard
              key={component.id}
              component={component}
              onAdd={() => onAddComponent(component.component.type)} // Pass only the type
            />
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No components found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ComponentItemCardProps {
  component: {
    id: string;
    name: string;
    icon: React.ReactNode;
    category: string;
    description: string;
    component: { type: BlockType; sampleData?: any };
  };
  onAdd: () => void;
}

function ComponentItemCard({ component, onAdd }: ComponentItemCardProps) {
  return (
    <div
      onClick={onAdd}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
          {component.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {component.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {component.description}
          </p>
        </div>

        {/* Add indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Plus className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
