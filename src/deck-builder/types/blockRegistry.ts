import { BlockMeta, BlockType } from './blocks.ts';

// Basic block registry with minimal entries for all block types
export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
  // Basic blocks
  text: {
    label: "Text",
    icon: "Type", 
    category: "Text",
    description: "Basic text block for paragraphs, headings.",
    editableProps: [
      { name: "text", label: "Text", type: "textarea" },
      { name: "variant", label: "Variant", type: "select", options: [
        { value: "heading", label: "Heading" },
        { value: "subheading", label: "Subheading" },
        { value: "paragraph", label: "Paragraph" }
      ]}
    ]
  },
  image: {
    label: "Image",
    icon: "Image", 
    category: "Media",
    description: "Embed an image from a URL.",
    editableProps: [
      { name: "src", label: "Image URL", type: "text" },
      { name: "alt", label: "Alt Text", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
      { name: "link", label: "Link URL", type: "text" }
    ]
  },
  quote: {
    label: "Quote",
    icon: "Quote", 
    category: "Text",
    description: "Block for displaying quotes with an optional author.",
    editableProps: [
      { name: "text", label: "Quote Text", type: "textarea" },
      { name: "author", label: "Author", type: "text" }
    ]
  },
  code: {
    label: "Code",
    icon: "Code2", 
    category: "Text",
    description: "Display a block of formatted code.",
    editableProps: [
      { name: "code", label: "Code", type: "textarea" },
      { name: "language", label: "Language", type: "text" }
    ]
  },
  video: {
    label: "Video",
    icon: "Video", 
    category: "Media",
    description: "Embed a video from a URL (e.g., YouTube, Vimeo).",
    editableProps: [
      { name: "src", label: "Video URL", type: "text" },
      { name: "provider", label: "Provider", type: "select", options: [
        { value: "youtube", label: "YouTube" },
        { value: "vimeo", label: "Vimeo" },
        { value: "upload", label: "Upload" },
        { value: "other", label: "Other" }
      ]},
      { name: "caption", label: "Caption", type: "text" },
      { name: "autoplay", label: "Autoplay", type: "checkbox" },
      { name: "loop", label: "Loop", type: "checkbox" }
    ]
  },
  list: {
    label: "List",
    icon: "List", 
    category: "Text",
    description: "Create ordered or unordered lists.",
    editableProps: [
      { name: "items", label: "List Items", type: "string_array" },
      { name: "ordered", label: "Ordered", type: "checkbox" },
      { name: "layout", label: "Layout", type: "select", options: [
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" }
      ]}
    ]
  },
  table: {
    label: "Table",
    icon: "Table",
    category: "Data",
    description: "Display data in a table.",
    editableProps: [
      { name: "rows", label: "Rows", type: "table" }
    ]
  },
  chart: {
    label: "Chart",
    icon: "BarChart",
    category: "Data",
    description: "Display data in a chart.",
    editableProps: [
      { name: "chartType", label: "Chart Type", type: "select", options: [
        { value: "bar", label: "Bar" },
        { value: "line", label: "Line" },
        { value: "pie", label: "Pie" },
        { value: "doughnut", label: "Doughnut" },
        { value: "radar", label: "Radar" },
        { value: "polarArea", label: "Polar Area" },
        { value: "scatter", label: "Scatter" },
        { value: "bubble", label: "Bubble" }
      ]},
      { name: "data", label: "Chart Data", type: "chart_data" }
    ]
  },
  button: {
    label: "Button",
    icon: "MousePointerSquare",
    category: "Interactive",
    description: "A clickable button that can link to a URL.",
    editableProps: [
      { name: "label", label: "Button Label", type: "text" },
      { name: "url", label: "Button URL", type: "text" }
    ]
  },
  shape: {
    label: "Shape",
    icon: "Shapes",
    category: "Visual",
    description: "Add basic shapes like rectangles, circles, and lines.",
    editableProps: [
      { name: "shape", label: "Shape", type: "select", options: [
        { value: "rectangle", label: "Rectangle" },
        { value: "circle", label: "Circle" },
        { value: "line", label: "Line" },
        { value: "arrow", label: "Arrow" }
      ]}
    ]
  },
  embed: {
    label: "Embed",
    icon: "Link",
    category: "Media",
    description: "Embed external content from a URL.",
    editableProps: [
      { name: "url", label: "Embed URL", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "height", label: "Height (px)", type: "number" }
    ]
  },
  checklist: {
    label: "Checklist",
    icon: "CheckSquare",
    category: "Interactive",
    description: "Create a list of checkable items.",
    editableProps: [
      { name: "items", label: "Items", type: "object_array", itemSchema: [
        { name: "text", label: "Text", type: "text" },
        { name: "checked", label: "Checked", type: "checkbox" }
      ]},
      { name: "allowReorder", label: "Allow Reorder", type: "checkbox" },
      { name: "showProgress", label: "Show Progress", type: "checkbox" }
    ]
  },
  divider: {
    label: "Divider",
    icon: "Minus",
    category: "Layout",
    description: "Add a horizontal line to separate content."
  },
  icon: {
    label: "Icon",
    icon: "Star",
    category: "Media",
    description: "Add an icon from a library of icons.",
    editableProps: [
      { name: "icon", label: "Icon Name", type: "text" },
      { name: "color", label: "Color", type: "color" },
      { name: "size", label: "Size (px)", type: "number" },
      { name: "label", label: "Label", type: "text" },
      { name: "link", label: "Link URL", type: "text" }
    ]
  },
  file: {
    label: "File",
    icon: "File",
    category: "Media",
    description: "Add a downloadable file.",
    editableProps: [
      { name: "src", label: "File URL", type: "text" },
      { name: "label", label: "File Label", type: "text" }
    ]
  },
  audio: {
    label: "Audio",
    icon: "Music",
    category: "Media",
    description: "Add audio content.",
    editableProps: [
      { name: "src", label: "Audio URL", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
      { name: "autoplay", label: "Autoplay", type: "checkbox" },
      { name: "loop", label: "Loop", type: "checkbox" }
    ]
  },
  timer: {
    label: "Timer",
    icon: "Clock",
    category: "Interactive",
    description: "Add a countdown timer.",
    editableProps: [
      { name: "duration", label: "Duration (seconds)", type: "number" },
      { name: "label", label: "Label", type: "text" },
      { name: "autoStart", label: "Auto Start", type: "checkbox" },
      { name: "showProgress", label: "Show Progress", type: "checkbox" }
    ]
  },
  poll: {
    label: "Poll",
    icon: "BarChart2",
    category: "Interactive",
    description: "Create an interactive poll.",
    editableProps: [
      { name: "question", label: "Question", type: "text" },
      { name: "options", label: "Options", type: "string_array" },
      { name: "allowMultiple", label: "Allow Multiple Selection", type: "checkbox" },
      { name: "showResults", label: "Show Results", type: "checkbox" }
    ]
  },
  customHtml: {
    label: "Custom HTML",
    icon: "Code",
    category: "Advanced",
    description: "Add custom HTML code.",
    editableProps: [
      { name: "html", label: "HTML Content", type: "textarea" },
      { name: "sandbox", label: "Sandbox Iframe", type: "checkbox" }
    ]
  },
  
  // Pitch deck specific blocks
  teamCard: {
    label: "Team Card",
    icon: "Users",
    category: "Team",
    description: "Display team member information.",
    editableProps: [
      { name: "members", label: "Team Members", type: "object_array", itemSchema: [
        { name: "name", label: "Name", type: "text" },
        { name: "title", label: "Title", type: "text" },
        { name: "photoUrl", label: "Photo URL", type: "text" },
        { name: "bio", label: "Bio", type: "textarea" },
        { name: "linkedin", label: "LinkedIn", type: "text" }
      ]}
    ]
  },
  tractionWidget: {
    label: "Traction Widget",
    icon: "TrendingUp",
    category: "Metrics",
    description: "Show key traction metrics.",
    editableProps: [
      { name: "metrics", label: "Metrics", type: "object_array", itemSchema: [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Value", type: "text" },
        { name: "icon", label: "Icon", type: "text" },
        { name: "trend", label: "Trend", type: "select", options: [
          { value: "up", label: "Up" },
          { value: "down", label: "Down" },
          { value: "flat", label: "Flat" }
        ]},
        { name: "description", label: "Description", type: "textarea" }
      ]}
    ]
  },
  timeline: {
    label: "Timeline",
    icon: "GitBranch",
    category: "Progress",
    description: "Display a timeline of events or milestones."
  },
  marketMap: {
    label: "Market Map",
    icon: "PieChart",
    category: "Market",
    description: "Visualize TAM, SAM, and SOM."
  },
  competitorTable: {
    label: "Competitor Table",
    icon: "Grid",
    category: "Competition",
    description: "Compare features with competitors."
  },
  problemSolution: {
    label: "Problem Solution",
    icon: "Lightbulb",
    category: "Value Proposition",
    description: "Present a problem and your solution.",
    editableProps: [
      { name: "problem", label: "Problem", type: "textarea" },
      { name: "solution", label: "Solution", type: "textarea" },
      { name: "icon", label: "Icon", type: "text" }
    ]
  },
  logoWall: {
    label: "Logo Wall",
    icon: "Award",
    category: "Social Proof",
    description: "Display logos of partners or customers.",
    editableProps: [
      { name: "logos", label: "Logos", type: "object_array", itemSchema: [
        { name: "src", label: "Logo URL", type: "text" },
        { name: "alt", label: "Alt Text", type: "text" },
        { name: "url", label: "Link URL", type: "text" }
      ]}
    ]
  },
  businessModel: {
    label: "Business Model",
    icon: "DollarSign",
    category: "Business",
    description: "Explain your business model."
  },
  testimonialCard: {
    label: "Testimonial Card",
    icon: "MessageCircle",
    category: "Social Proof",
    description: "Display customer testimonials.",
    editableProps: [
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "author", label: "Author", type: "text" },
      { name: "photoUrl", label: "Photo URL", type: "text" },
      { name: "logoUrl", label: "Logo URL", type: "text" }
    ]
  },
  useOfFunds: {
    label: "Use of Funds",
    icon: "PieChart",
    category: "Financials",
    description: "Show how investment will be used.",
    editableProps: [
      { name: "allocations", label: "Allocations", type: "object_array", itemSchema: [
        { name: "name", label: "Name", type: "text" },
        { name: "amount", label: "Amount", type: "number" },
        { name: "color", label: "Color", type: "color" }
      ]},
      { name: "totalAmount", label: "Total Amount", type: "number" },
      { name: "title", label: "Title", type: "text" }
    ]
  },
  ctaCard: {
    label: "CTA Card",
    icon: "ExternalLink",
    category: "Call to Action",
    description: "Add a call-to-action card."
  },
  demoGallery: {
    label: "Demo Gallery",
    icon: "Monitor",
    category: "Product",
    description: "Showcase product demos."
  },
  milestoneTracker: {
    label: "Milestone Tracker",
    icon: "Flag",
    category: "Progress",
    description: "Track progress against milestones.",
    editableProps: [
      { name: "milestones", label: "Milestones", type: "object_array", itemSchema: [
        { name: "label", label: "Label", type: "text" },
        { name: "completed", label: "Completed", type: "checkbox" },
        { name: "date", label: "Date", type: "text" },
        { name: "description", label: "Description", type: "textarea" }
      ]}
    ]
  },
  investmentAsk: {
    label: "Investment Ask",
    icon: "DollarSign",
    category: "Financials",
    description: "Present your investment request."
  },
  mapBlock: {
    label: "Map",
    icon: "Map",
    category: "Location",
    description: "Display a map location."
  },
  customImage: {
    label: "Custom Image",
    icon: "Image",
    category: "Media",
    description: "Add a custom image with styling options.",
    editableProps: [
      { name: "src", label: "Image URL", type: "text" },
      { name: "alt", label: "Alt Text", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
      { name: "borderRadius", label: "Border Radius", type: "number" },
      { name: "shadow", label: "Shadow", type: "checkbox" },
      { name: "background", label: "Background Color", type: "color" }
    ]
  },
  
  // Enhanced template blocks
  metricCounter: {
    label: "Metric Counter",
    icon: "Hash",
    category: "Metrics",
    description: "Display a key metric with animation.",
    editableProps: [
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value", type: "number" },
      { name: "targetValue", label: "Target Value", type: "number" },
      { name: "prefix", label: "Prefix", type: "text" },
      { name: "suffix", label: "Suffix", type: "text" },
      { name: "duration", label: "Animation Duration (ms)", type: "number" },
      { name: "trend", label: "Trend", type: "select", options: [
        { value: "up", label: "Up" },
        { value: "down", label: "Down" },
        { value: "flat", label: "Flat" }
      ]},
      { name: "icon", label: "Icon", type: "text" }
    ]
  },
  socialProofBadge: {
    label: "Social Proof Badge",
    icon: "Award",
    category: "Social Proof",
    description: "Show recognition or awards."
  },
  opportunityIndicator: {
    label: "Opportunity Indicator",
    icon: "Target",
    category: "Market",
    description: "Highlight market opportunities."
  },
  beforeAfterComparison: {
    label: "Before/After Comparison",
    icon: "Shuffle",
    category: "Product",
    description: "Compare before and after states."
  },
  benefitCard: {
    label: "Benefit Card",
    icon: "Check",
    category: "Value Proposition",
    description: "Highlight key benefits."
  },
  competitivePositioning: {
    label: "Competitive Positioning",
    icon: "Crosshair",
    category: "Competition",
    description: "Position your product against competitors."
  },
  marketSegments: {
    label: "Market Segments",
    icon: "PieChart",
    category: "Market",
    description: "Visualize market segments."
  },
  advisorCard: {
    label: "Advisor Card",
    icon: "User",
    category: "Team",
    description: "Showcase advisors."
  },
  hiringPlan: {
    label: "Hiring Plan",
    icon: "Users",
    category: "Team",
    description: "Present your hiring roadmap."
  },
  skillMatrix: {
    label: "Skill Matrix",
    icon: "Grid",
    category: "Team",
    description: "Display team skills and expertise."
  },
  pressCard: {
    label: "Press Card",
    icon: "FileText",
    category: "Social Proof",
    description: "Showcase press coverage."
  },
  partnershipCard: {
    label: "Partnership Card",
    icon: "Handshake",
    category: "Partnerships",
    description: "Highlight key partnerships."
  },
  investorContactForm: {
    label: "Investor Contact Form",
    icon: "Mail",
    category: "Call to Action",
    description: "Add a contact form for investors."
  },
  heroImage: {
    label: "Hero Image",
    icon: "Image",
    category: "Media",
    description: "Add a large hero image with overlay text.",
    editableProps: [
      { name: "src", label: "Image URL", type: "text" },
      { name: "alt", label: "Alt Text", type: "text" },
      { name: "headline", label: "Headline", type: "text" },
      { name: "subheadline", label: "Subheadline", type: "text" },
      { name: "overlay", label: "Overlay Text", type: "textarea" }
    ]
  },
  
  // Enhanced visual components
  imageGallery: {
    label: "Image Gallery",
    icon: "Images",
    category: "Media",
    description: "Display multiple images in a gallery.",
    editableProps: [
      { name: "images", label: "Images", type: "object_array", itemSchema: [
        { name: "src", label: "Image URL", type: "text" },
        { name: "alt", label: "Alt Text", type: "text" },
        { name: "caption", label: "Caption", type: "text" }
      ]},
      { name: "layout", label: "Layout", type: "select", options: [
        { value: "grid", label: "Grid" },
        { value: "masonry", label: "Masonry" },
        { value: "carousel", label: "Carousel" }
      ]}
    ]
  },
  featureCard: {
    label: "Feature Card",
    icon: "Zap",
    category: "Product",
    description: "Highlight product features."
  },
  mediaHero: {
    label: "Media Hero",
    icon: "Film",
    category: "Media",
    description: "Add a hero section with media and text.",
    editableProps: [
      { name: "mediaType", label: "Media Type", type: "select", options: [
        { value: "image", label: "Image" },
        { value: "video", label: "Video" }
      ]},
      { name: "src", label: "Media URL", type: "text" },
      { name: "alt", label: "Alt Text", type: "text" },
      { name: "headline", label: "Headline", type: "text" },
      { name: "subheadline", label: "Subheadline", type: "text" },
      { name: "overlay", label: "Overlay Text", type: "textarea" }
    ]
  },
  citation: {
    label: "Citation",
    icon: "BookOpen",
    category: "Text",
    description: "Add a citation or reference.",
    editableProps: [
      { name: "text", label: "Citation Text", type: "textarea" },
      { name: "source", label: "Source", type: "text" },
      { name: "url", label: "Source URL", type: "text" }
    ]
  },
  statsDisplay: {
    label: "Stats Display",
    icon: "BarChart",
    category: "Metrics",
    description: "Display multiple statistics.",
    editableProps: [
      { name: "stats", label: "Stats", type: "object_array", itemSchema: [
        { name: "label", label: "Label", type: "text" },
        { name: "value", label: "Value", type: "text" },
        { name: "icon", label: "Icon", type: "text" },
        { name: "color", label: "Color", type: "color" },
        { name: "description", label: "Description", type: "textarea" }
      ]},
      { name: "layout", label: "Layout", type: "select", options: [
        { value: "grid", label: "Grid" },
        { value: "list", label: "List" },
        { value: "card", label: "Card" }
      ]}
    ]
  },
  visualQuote: {
    label: "Visual Quote",
    icon: "MessageSquare",
    category: "Social Proof",
    description: "Add a visually styled quote.",
    editableProps: [
      { name: "text", label: "Quote Text", type: "textarea" },
      { name: "author", label: "Author", type: "text" },
      { name: "background", label: "Background Color", type: "color" },
      { name: "icon", label: "Icon", type: "text" }
    ]
  },
  iconFeature: {
    label: "Icon Feature",
    icon: "Star",
    category: "Product",
    description: "Feature with icon and description.",
    editableProps: [
      { name: "icon", label: "Icon", type: "text" },
      { name: "label", label: "Label", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "color", label: "Color", type: "color" }
    ]
  },
  imageWithCaption: {
    label: "Image with Caption",
    icon: "Image",
    category: "Media",
    description: "Image with a caption.",
    editableProps: [
      { name: "src", label: "Image URL", type: "text" },
      { name: "alt", label: "Alt Text", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
      { name: "position", label: "Caption Position", type: "select", options: [
        { value: "below", label: "Below" },
        { value: "overlay", label: "Overlay" }
      ]}
    ]
  },
  calloutBox: {
    label: "Callout Box",
    icon: "AlertCircle",
    category: "Text",
    description: "Highlight important information.",
    editableProps: [
      { name: "text", label: "Text", type: "textarea" },
      { name: "variant", label: "Variant", type: "select", options: [
        { value: "info", label: "Info" },
        { value: "warning", label: "Warning" },
        { value: "success", label: "Success" },
        { value: "error", label: "Error" }
      ]},
      { name: "icon", label: "Icon", type: "text" },
      { name: "background", label: "Background Color", type: "color" }
    ]
  }
};
