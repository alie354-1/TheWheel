import { SectionType, VisualComponent } from '../types/index.ts';
import { BLOCK_REGISTRY, BlockType } from '../types/blocks.ts';
import { generateUUID } from '../utils/uuid.ts';

// Define some professional color constants for consistency
const PALETTE = {
  textPrimary: '#1A202C', // Very Dark Gray (almost black)
  textSecondary: '#4A5568', // Medium Gray-Blue
  accentPrimary: '#3B82F6', // Medium Blue (Tailwind Blue 500)
  accentSecondary: '#60A5FA', // Lighter Blue
  backgroundLight: '#F7FAFC', // Very Light Gray for cards/sections
  backgroundSlide: '#FFFFFF', // White for slide background
  borderLight: '#E2E8F0', // Light Gray Border
  success: '#38A169', // Green
  warning: '#DD6B20', // Orange
  danger: '#E53E3E', // Red
  highlight: '#EDF2F7', // Light blue-gray for highlights
};

// Standard font sizes (consider a modular scale)
const FONT_SIZES = {
  heroTitle: '52px',
  slideTitleLarge: '40px',
  slideTitleMedium: '32px',
  subheadingLarge: '26px',
  subheadingMedium: '22px',
  bodyExtraLarge: '20px',
  bodyLarge: '18px',
  bodyRegular: '16px',
  bodySmall: '14px',
  caption: '12px',
};

// Common style objects
const COMMON_STYLES = {
  slideTitle: {
    fontSize: FONT_SIZES.slideTitleLarge,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    textAlign: 'center' as const,
    lineHeight: '1.2',
    padding: '0 0 10px 0',
  },
  slideSubtitle: {
    fontSize: FONT_SIZES.subheadingMedium,
    fontWeight: 'normal',
    color: PALETTE.textSecondary,
    textAlign: 'center' as const,
    lineHeight: '1.4',
    marginBottom: '30px',
  },
  contentTitle: {
    fontSize: FONT_SIZES.subheadingLarge,
    fontWeight: '600' as const,
    color: PALETTE.textPrimary,
    marginBottom: '15px',
    textAlign: 'left' as const,
  },
  paragraph: {
    fontSize: FONT_SIZES.bodyLarge,
    color: PALETTE.textPrimary,
    lineHeight: '1.7',
    marginBottom: '20px',
    textAlign: 'left' as const,
  },
  listItem: {
    fontSize: FONT_SIZES.bodyRegular,
    color: PALETTE.textPrimary,
    lineHeight: '1.8',
    padding: '8px 0',
  },
  cardContainer: {
    backgroundColor: PALETTE.backgroundLight,
    border: `1px solid ${PALETTE.borderLight}`,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  centeredText: {
    textAlign: 'center' as const,
  }
};

const SLIDE_WIDTH = 800;
const SLIDE_HEIGHT = 600;
const SLIDE_PADDING = 50;

export const SECTION_DEFAULTS: Record<SectionType, { title: string; components: VisualComponent[] }> = {
  'hero': {
    title: 'Title Slide',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: {
          text: 'Your Groundbreaking Idea or Company Name',
          variant: 'heading',
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT * 0.35, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 120 },
        order: 1,
        style: {
          ...COMMON_STYLES.centeredText,
          fontSize: FONT_SIZES.heroTitle,
          fontWeight: 'bold',
          color: PALETTE.textPrimary,
          lineHeight: '1.2',
        }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: {
          text: 'A concise and compelling tagline that captures the essence of your venture and sparks curiosity.',
          variant: 'subheading',
        },
        layout: { x: SLIDE_PADDING + 50, y: SLIDE_HEIGHT * 0.35 + 130, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 80 },
        order: 2,
        style: {
          ...COMMON_STYLES.centeredText,
          fontSize: FONT_SIZES.subheadingLarge,
          color: PALETTE.textSecondary,
          lineHeight: '1.4',
        }
      },
      {
        id: generateUUID(),
        type: 'image' as BlockType,
        data: {
            src: 'https://via.placeholder.com/180x60/FFFFFF/CCCCCC?text=Your+Logo',
            alt: 'Company Logo Placeholder'
        },
        layout: { x: (SLIDE_WIDTH - 180) / 2, y: SLIDE_HEIGHT * 0.15, width: 180, height: 60},
        order: 0,
        style: { objectFit: 'contain' }
      }
    ]
  },
  'problem': {
    title: 'The Problem We\'re Solving',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'The Critical Challenge', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Clearly articulate the significant problem your target audience faces. Make it relatable and emphasize its impact and scale.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 80 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge }
      },
      {
        id: generateUUID(),
        type: 'list' as BlockType,
        data: {
          items: [
            { id: generateUUID(), text: 'Pain Point 1: Describe the specific challenge and who experiences it. Quantify if possible.', icon: 'AlertCircle' },
            { id: generateUUID(), text: 'Pain Point 2: Elaborate on the consequences and costs of this problem (time, money, frustration).', icon: 'TrendingDown' },
            { id: generateUUID(), text: 'Pain Point 3: Highlight why existing solutions are inadequate or the urgency to solve it now.', icon: 'XCircle' }
          ],
          ordered: false,
          itemStyle: { ...COMMON_STYLES.listItem, paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px' },
          listStyle: { marginLeft: '0px' }
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 150, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 220 },
        order: 2,
        style: {}
      },
      {
        id: generateUUID(),
        type: 'calloutBox' as BlockType,
        data: {
            text: 'Key Statistic: X% of [Target Audience] struggle with [Problem], leading to an estimated $Y in [Loss/Inefficiency] annually.',
            variant: 'warning',
            iconName: 'BarChartBig'
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 390, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 100 },
        order: 3,
        style: { ...COMMON_STYLES.cardContainer, fontSize: FONT_SIZES.bodyRegular, padding: '15px' }
      }
    ]
  },
  'solution': {
    title: 'Our Innovative Solution',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Our Unique Approach', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Describe your groundbreaking solution. How does it directly address the identified problem in a novel or significantly better way? Focus on the core value proposition.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 80 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge }
      },
      {
        id: generateUUID(),
        type: 'featureCard' as BlockType,
        data: {
            title: 'Core Feature / Benefit 1',
            description: 'Explain this key aspect of your solution and the significant value it delivers to the user.',
            icon: 'Zap',
            layout: 'icon-left' as const,
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 150, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2, height: 180 },
        order: 2,
        style: COMMON_STYLES.cardContainer
      },
      {
        id: generateUUID(),
        type: 'featureCard' as BlockType,
        data: {
            title: 'Unique Selling Proposition (USP)',
            description: 'What makes your solution stand out? Highlight its unique advantages and key differentiators.',
            icon: 'Star',
            layout: 'icon-left' as const,
        },
        layout: { x: SLIDE_PADDING + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2) + 20, y: SLIDE_PADDING + 150, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2, height: 180 },
        order: 3,
        style: COMMON_STYLES.cardContainer
      },
       {
        id: generateUUID(),
        type: 'featureCard' as BlockType,
        data: {
            title: 'Demonstrable User Impact',
            description: 'Quantify or clearly describe the positive, tangible impact your solution has on the user or customer.',
            icon: 'TrendingUp',
            layout: 'icon-left' as const,
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 150 + 180 + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 120 },
        order: 4,
        style: COMMON_STYLES.cardContainer
      }
    ]
  },
  'market': {
    title: 'Market Opportunity',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Understanding Our Market', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Define your target market: Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM). Provide sources if possible.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 80 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyRegular, textAlign: 'center' as const, marginBottom: '20px' }
      },
      {
        id: generateUUID(),
        type: 'marketMap' as BlockType,
        data: {
          tam: 10000000000,
          sam: 2000000000,
          som: 200000000,
          notes: "Source: Industry Report XYZ (2024), Internal Analysis. Market growth rate: X% CAGR."
        },
        layout: { x: SLIDE_PADDING + 100, y: SLIDE_PADDING + 150, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 200, height: 300 },
        order: 2,
        style: { ...COMMON_STYLES.cardContainer, padding: '30px' }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Key market trends supporting this opportunity: [e.g., Growth in X sector, Shift in consumer behavior Y, New regulations Z]', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 470, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 3,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodySmall, color: PALETTE.textSecondary, textAlign: 'center' as const }
      }
    ]
  },
  'executiveSummary': {
    title: 'Executive Summary',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'A Snapshot of Our Venture', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Provide a compelling and concise overview of your business: the core problem you solve, your unique solution, key achievements or traction, your primary business model, the core team strength, and your funding ask (if applicable). This should be a high-level summary that grabs attention.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 120 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyRegular }
      },
      {
        id: generateUUID(),
        type: 'statsDisplay' as BlockType,
        data: {
            stats: [
                { value: "[Problem Area]", label: "Targeting a $XB market in [Industry]", icon: "Target", description: "Briefly explain market size significance." },
                { value: "[Unique Solution]", label: "Proprietary [Technology/Approach] offering [Key Benefit]", icon: "Lightbulb", description: "Highlight what makes it unique." },
                { value: "[Key Metric]", label: "[e.g., 10k+ Users / $Xk MRR / X% MoM Growth]", icon: "TrendingUp", description: "Showcase most impressive traction." }
            ],
            layout: 'grid' as const,
            columns: 3,
            cardStyle: 'card' as const,
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 200, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 280 },
        order: 2,
        style: { gap: '20px' }
      }
    ]
  },
  'business-model': {
    title: 'Our Business Model',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'How We Generate Value & Revenue', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Clearly explain your revenue streams, pricing strategy, and customer acquisition channels. How will your business make money and scale sustainably?', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 80 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '30px' }
      },
      {
        id: generateUUID(),
        type: 'businessModel' as BlockType,
        data: {
          streams: [
            { label: "Primary Revenue Stream (e.g., SaaS Subscription)", value: "Detail pricing tiers (e.g., Basic: $X/mo, Pro: $Y/mo) and core value for each." },
            { label: "Secondary Revenue Stream (e.g., Premium Services, Partnerships)", value: "Explain how this complements the primary stream and its potential." },
            { label: "Key Customer Segments", value: "Identify your primary target customer profiles (e.g., SMBs, Enterprise, Specific Demographics)." }
          ],
          diagramUrl: "https://via.placeholder.com/600x200/EDF2F7/4A5568?text=Business+Model+Canvas+or+Flowchart+Placeholder"
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 160, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 350 },
        order: 2,
        style: { ...COMMON_STYLES.cardContainer, padding: '25px' }
      }
    ]
  },
  'competition': {
    title: 'Competitive Landscape',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Our Position in the Market', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Identify key competitors and highlight your unique differentiators and sustainable advantages. How are you better or different?', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '20px' }
      },
      {
        id: generateUUID(),
        type: 'competitorTable' as BlockType,
        data: {
          featureList: ["Key Feature A", "Unique Feature B", "Pricing Model", "Target Segment"],
          competitors: [
            { name: "Your Company", features: { "Key Feature A": true, "Unique Feature B": true, "Pricing Model": true, "Target Segment": true } },
            { name: "Competitor 1", features: { "Key Feature A": true, "Unique Feature B": false, "Pricing Model": false, "Target Segment": true } },
            { name: "Competitor 2", features: { "Key Feature A": false, "Unique Feature B": true, "Pricing Model": true, "Target Segment": false } },
          ]
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 140, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 280 },
        order: 2,
        style: { }
      },
      {
        id: generateUUID(),
        type: 'calloutBox' as BlockType,
        data: {
            title: 'Our Edge:',
            text: 'Clearly state your primary competitive advantage (e.g., "Proprietary technology offering 2x speed at half the cost." or "First-mover in a niche with strong network effects.")',
            variant: 'info',
            iconName: 'ShieldCheck'
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 440, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 100 },
        order: 3,
        style: { ...COMMON_STYLES.cardContainer, fontSize: FONT_SIZES.bodyRegular, padding: '15px' }
      }
    ]
  },
  'team': {
    title: 'Our Core Team',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'The People Behind The Vision', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Introduce the core team members, highlighting relevant experience, key achievements, and domain expertise that make them the right people to execute this vision.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '30px' }
      },
      {
        id: generateUUID(),
        type: 'teamCard' as BlockType,
        data: {
          members: [
            { name: "Founder/CEO Name", title: "Chief Executive Officer", photoUrl: "https://via.placeholder.com/120x120/CBD5E0/4A5568?text=Photo", bio: "10+ years in [Industry], previously [Key Achievement/Role]. Passionate about solving [Problem].", linkedin: "#" },
          ]
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 140, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 320 },
        order: 2,
        style: { ...COMMON_STYLES.cardContainer, textAlign: 'center' as const }
      },
      {
        id: generateUUID(),
        type: 'teamCard' as BlockType,
        data: {
          members: [
            { name: "Co-founder/CTO Name", title: "Chief Technology Officer", photoUrl: "https://via.placeholder.com/120x120/CBD5E0/4A5568?text=Photo", bio: "Expert in [Technology Stack], built [Previous Product/System]. Led engineering teams at [Previous Company].", linkedin: "#" },
          ]
        },
        layout: { x: SLIDE_PADDING + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3) + 20, y: SLIDE_PADDING + 140, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 320 },
        order: 3,
        style: { ...COMMON_STYLES.cardContainer, textAlign: 'center' as const }
      },
      {
        id: generateUUID(),
        type: 'teamCard' as BlockType,
        data: {
          members: [
            { name: "Advisor/Key Role Name", title: "Title (e.g., Head of Marketing)", photoUrl: "https://via.placeholder.com/120x120/CBD5E0/4A5568?text=Photo", bio: "Specializes in [Expertise Area]. Track record of [Achievement].", linkedin: "#" },
          ]
        },
        layout: { x: SLIDE_PADDING + 2*(((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3) + 20), y: SLIDE_PADDING + 140, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 320 },
        order: 4,
        style: { ...COMMON_STYLES.cardContainer, textAlign: 'center' as const }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Optional: Briefly mention key advisors or missing key roles you plan to hire.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 480, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 },
        order: 5,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodySmall, color: PALETTE.textSecondary, textAlign: 'center' as const }
      }
    ]
  },
  'financials': {
    title: 'Financial Projections',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Our Financial Outlook (3-5 Years)', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Present key financial projections (e.g., revenue, users, EBITDA). Highlight key assumptions and drivers behind these numbers.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '20px' }
      },
      {
        id: generateUUID(),
        type: 'chart' as BlockType,
        data: {
          chartType: 'bar' as const,
          data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
              { label: 'Projected Revenue ($M)', data: [0.5, 2, 5, 12, 25], backgroundColor: PALETTE.accentPrimary, borderColor: PALETTE.accentPrimary },
              { label: 'Projected Users (K)', data: [10, 50, 150, 400, 1000], backgroundColor: PALETTE.accentSecondary, borderColor: PALETTE.accentSecondary, type: 'line' as any, yAxisID: 'yUsers' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Revenue ($M)'} },
              yUsers: { beginAtZero: true, position: 'right' as const, title: { display: true, text: 'Users (K)'}, grid: { drawOnChartArea: false } }
            }
          }
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 130, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 320 },
        order: 2,
        style: {}
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Key Assumptions: [e.g., Customer Acquisition Cost (CAC) of $X, Average Revenue Per User (ARPU) of $Y, Churn rate of Z%]', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 460, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 3,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodySmall, color: PALETTE.textSecondary }
      }
    ]
  },
  'funding': {
    title: 'Funding Ask & Use of Funds',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Our Investment Opportunity', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'investmentAsk' as BlockType,
        data: {
          amount: "$1,000,000",
          equity: "15-20% (SAFE or Priced Round)",
          terms: "Seeking seed funding to achieve [Key Milestone 1, e.g., 50k MAU] and [Key Milestone 2, e.g., $1M ARR] within 18-24 months."
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2, height: 250 },
        order: 1,
        style: { ...COMMON_STYLES.cardContainer, textAlign: 'center' as const, padding: '30px' }
      },
      {
        id: generateUUID(),
        type: 'useOfFunds' as BlockType,
        data: {
          categories: [
            { label: "Product Development & Engineering (New Features, Scalability)", percent: 40 },
            { label: "Sales & Marketing (Team Expansion, Campaigns)", percent: 30 },
            { label: "Operations & G&A (Team Growth, Infrastructure)", percent: 20 },
            { label: "Contingency / Working Capital", percent: 10 }
          ]
        },
        layout: { x: SLIDE_PADDING + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2) + 20, y: SLIDE_PADDING + 70, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2, height: 250 },
        order: 2,
        style: { ...COMMON_STYLES.cardContainer, padding: '30px' }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'With this investment, we project reaching [Next Major Goal, e.g., profitability, Series A readiness] by [Date/Timeframe].', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 350, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 80 },
        order: 3,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginTop: '30px' }
      }
    ]
  },
  'next-steps': {
    title: 'Call to Action / Next Steps',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Let\'s Build the Future Together', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT * 0.25, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 70 },
        order: 0,
        style: { ...COMMON_STYLES.slideTitle, fontSize: FONT_SIZES.slideTitleLarge }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'We are seeking partners who share our vision and are excited to join us on this journey. We invite you to discuss how we can collaborate.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING + 50, y: SLIDE_HEIGHT * 0.25 + 90, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 80 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyExtraLarge, textAlign: 'center' as const, color: PALETTE.textSecondary }
      },
      {
        id: generateUUID(),
        type: 'ctaCard' as BlockType,
        data: {
          text: "Ready to learn more or discuss this opportunity?",
          buttonLabel: "Schedule a Meeting",
          buttonUrl: "mailto:your.email@example.com?subject=Meeting Request: [Your Company Name]"
        },
        layout: { x: (SLIDE_WIDTH - 400) / 2, y: SLIDE_HEIGHT * 0.25 + 200, width: 400, height: 180 },
        order: 2,
        style: { ...COMMON_STYLES.cardContainer, textAlign: 'center' as const, padding: '30px' }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Contact: [Your Name] | [Your Title] | [your.email@example.com] | [Your Phone (Optional)] | [website.com]', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 40, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 },
        order: 3,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodySmall, textAlign: 'center' as const, color: PALETTE.textSecondary }
      }
    ]
  },
  'problemSolution': {
    title: 'Problem & Solution Overview',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'The Challenge & Our Answer', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'calloutBox' as BlockType,
        data: {
            title: 'The Core Problem',
            text: 'Succinctly restate the primary pain point your target audience experiences. Use strong, evocative language.',
            variant: 'warning',
            iconName: 'AlertOctagon'
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2, height: SLIDE_HEIGHT - (SLIDE_PADDING * 2) - 100 },
        order: 1,
        style: { ...COMMON_STYLES.cardContainer, padding: '25px' }
      },
      {
        id: generateUUID(),
        type: 'calloutBox' as BlockType,
        data: {
            title: 'Our Unique Solution',
            text: 'Clearly explain how your solution directly and effectively addresses that core problem. Emphasize the key benefit or differentiator.',
            variant: 'success',
            iconName: 'CheckCircle'
        },
        layout: { x: SLIDE_PADDING + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2) + 20, y: SLIDE_PADDING + 70, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 20) / 2, height: SLIDE_HEIGHT - (SLIDE_PADDING * 2) - 100 },
        order: 2,
        style: { ...COMMON_STYLES.cardContainer, padding: '25px' }
      }
    ]
  },
  'demoGallery': {
    title: 'Product Showcase / Demo',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'See Our Solution in Action', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Visually demonstrate key features or the user experience of your product/service. Use high-quality images or short video clips.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '20px' }
      },
      {
        id: generateUUID(),
        type: 'demoGallery' as BlockType,
        data: {
          items: [
            { type: 'image', src: 'https://via.placeholder.com/700x400/CBD5E0/4A5568?text=Product+Screenshot+1', caption: 'Caption for Feature 1: Highlights a key user benefit.' },
            { type: 'image', src: 'https://via.placeholder.com/700x400/A0AEC0/2D3748?text=Product+Screenshot+2', caption: 'Caption for Feature 2: Shows ease of use or unique UI.' },
            { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: 'Short Video Demo (placeholder)' }
          ]
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 130, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 400 },
        order: 2,
        style: { }
      }
    ]
  },
  'ctaCard': {
    title: 'Ready to Take the Next Step?',
    components: [
      {
        id: generateUUID(),
        type: 'ctaCard' as BlockType,
        data: {
          text: 'Interested in learning more, investing, or partnering with us?',
          buttonLabel: 'Contact Us Today',
          buttonUrl: 'mailto:your.email@example.com?subject=Inquiry%20from%20Deck'
        },
        layout: { x: (SLIDE_WIDTH - 450) / 2, y: (SLIDE_HEIGHT - 250) / 2, width: 450, height: 250 },
        order: 0,
        style: { ...COMMON_STYLES.cardContainer, textAlign: 'center' as const, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }
      }
    ]
  },
  'blank': {
    title: 'Blank Slide',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Use this blank canvas to build your custom slide. Add components from the library.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT/2 - 30, width: SLIDE_WIDTH - (SLIDE_PADDING*2), height: 60 },
        order: 0,
        style: { fontSize: FONT_SIZES.bodyRegular, color: PALETTE.textSecondary, textAlign: 'center' as const, fontStyle: 'italic' }
      }
    ]
  },
  'productRoadmap': {
    title: 'Our Product Roadmap',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Future Milestones & Vision', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Visual timeline of key product development milestones, feature releases, and strategic initiatives for the next 12-24 months.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '20px' }
      },
      {
        id: generateUUID(),
        type: 'timeline' as BlockType,
        data: {
          milestones: [
            { date: "Current Q / Next Q", label: "MVP Launch / Key Feature X", description: "Core features delivered, initial user feedback.", icon: "Rocket" },
            { date: "Q+1 / H2 Year", label: "User Growth / Feature Set Y", description: "Target X users, roll out enhancements based on feedback.", icon: "Users" },
            { date: "Year+1 Q1/Q2", label: "New Product Line / Market Expansion", description: "Explore adjacent markets or new offerings.", icon: "Globe" },
            { date: "Year+1 Q3/Q4", label: "Strategic Partnerships / Scale Operations", description: "Integrate with key players, prepare for larger scale.", icon: "Handshake" }
          ]
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 130, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 380 },
        order: 2,
        style: { }
      }
    ]
  },
  'keyMetricsDashboard': {
    title: 'Key Metrics & Traction',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Our Performance Snapshot', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Showcase your most important Key Performance Indicators (KPIs) and recent traction. Use real data if available.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 60, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyLarge, textAlign: 'center' as const, marginBottom: '20px' }
      },
      {
        id: generateUUID(),
        type: 'tractionWidget' as BlockType,
        data: {
          metrics: [
            { label: "Monthly Active Users (MAU)", value: "15,000+", trend: "up" as const, icon: "Users", description: "+20% MoM" },
            { label: "Customer Acquisition Cost (CAC)", value: "$50", trend: "down" as const, icon: "DollarSign", description: "Optimizing marketing spend" },
            { label: "Monthly Recurring Revenue (MRR)", value: "$25,000+", trend: "up" as const, icon: "BarChart", description: "Growing steadily" },
            { label: "Customer Churn Rate", value: "2.5%", trend: "down" as const, icon: "LogOut", description: "Improving retention" }
          ]
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 130, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 200 },
        order: 2,
        style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }
      },
      {
        id: generateUUID(),
        type: 'chart' as BlockType,
        data: {
          chartType: 'line' as const,
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ label: 'User Growth Over Time', data: [5000, 6500, 8000, 10500, 12000, 15000], borderColor: PALETTE.accentPrimary, tension: 0.1, fill: false }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 350, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 180 },
        order: 3,
        style: {}
      }
    ]
  },
  'faqSlide': {
    title: 'Frequently Asked Questions',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Common Questions & Answers', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING - 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'list' as BlockType,
        data: {
          items: [
            { id: generateUUID(), text: 'Q1: What is the core technology behind your solution?', icon: 'HelpCircle' },
            { id: generateUUID(), text: 'A1: Our solution leverages [Proprietary AI Algorithm / Unique Framework / Patented Process] to deliver [Key Benefit]. We focus on [Specific Aspect].', style: { paddingLeft: '20px', color: PALETTE.textSecondary } },
            { id: generateUUID(), text: 'Q2: How do you plan to acquire customers and scale?', icon: 'HelpCircle' },
            { id: generateUUID(), text: 'A2: Our go-to-market strategy includes [Channel 1, e.g., targeted digital marketing], [Channel 2, e.g., strategic partnerships], and [Channel 3, e.g., content marketing].', style: { paddingLeft: '20px', color: PALETTE.textSecondary } },
            { id: generateUUID(), text: 'Q3: What are the biggest risks and how are you mitigating them?', icon: 'HelpCircle' },
            { id: generateUUID(), text: 'A3: Key risks include [Risk 1] and [Risk 2]. We are mitigating these by [Mitigation Strategy 1] and [Mitigation Strategy 2].', style: { paddingLeft: '20px', color: PALETTE.textSecondary } },
          ],
          ordered: false,
          itemStyle: { ...COMMON_STYLES.listItem, fontSize: FONT_SIZES.bodyRegular, borderBottom: `1px dashed ${PALETTE.borderLight}` },
          listStyle: { }
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: SLIDE_HEIGHT - (SLIDE_PADDING*2) - 50 },
        order: 1,
        style: {}
      }
    ]
  },
  'contactUs': {
    title: 'Get In Touch / Contact Us',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'We\'d Love to Hear From You!', variant: 'heading' },
        layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT * 0.2, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 70 },
        order: 0,
        style: { ...COMMON_STYLES.slideTitle, fontSize: FONT_SIZES.slideTitleLarge }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Whether you have questions, want to explore a partnership, or discuss investment opportunities, please reach out.', variant: 'paragraph' },
        layout: { x: SLIDE_PADDING + 50, y: SLIDE_HEIGHT * 0.2 + 90, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 80 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, fontSize: FONT_SIZES.bodyExtraLarge, textAlign: 'center' as const, color: PALETTE.textSecondary }
      },
      {
        id: generateUUID(),
        type: 'iconFeature' as BlockType,
        data: {
            icon: 'Mail', title: 'Email Us', description: 'your.email@example.com', layout: 'horizontal-left' as const,
            titleSize: FONT_SIZES.bodyLarge, descriptionSize: FONT_SIZES.bodyLarge, iconColor: PALETTE.accentPrimary
        },
        layout: { x: (SLIDE_WIDTH - 500)/2, y: SLIDE_HEIGHT * 0.2 + 200, width: 500, height: 60 },
        order: 2,
        style: { padding: '10px 0' }
      },
      {
        id: generateUUID(),
        type: 'iconFeature' as BlockType,
        data: {
            icon: 'Globe', title: 'Visit Our Website', description: 'www.example.com', layout: 'horizontal-left' as const,
            titleSize: FONT_SIZES.bodyLarge, descriptionSize: FONT_SIZES.bodyLarge, iconColor: PALETTE.accentPrimary
        },
        layout: { x: (SLIDE_WIDTH - 500)/2, y: SLIDE_HEIGHT * 0.2 + 270, width: 500, height: 60 },
        order: 3,
        style: { padding: '10px 0' }
      },
      {
        id: generateUUID(),
        type: 'iconFeature' as BlockType,
        data: {
            icon: 'Phone', title: 'Call Us (Optional)', description: '(555) 123-4567', layout: 'horizontal-left' as const,
            titleSize: FONT_SIZES.bodyLarge, descriptionSize: FONT_SIZES.bodyLarge, iconColor: PALETTE.accentPrimary
        },
        layout: { x: (SLIDE_WIDTH - 500)/2, y: SLIDE_HEIGHT * 0.2 + 340, width: 500, height: 60 },
        order: 4,
        style: { padding: '10px 0' }
      }
    ]
  },
  'custom': {
    title: 'Custom Slide',
    components: [
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: {
          text: 'Build Your Unique Slide',
          variant: 'heading',
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING -10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 },
        order: 0,
        style: COMMON_STYLES.slideTitle
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: {
          text: 'Use this blank canvas to add components from the library and create content tailored to your specific needs. Drag and drop elements, resize, and style them to craft the perfect message.',
          variant: 'paragraph'
        },
        layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 120 },
        order: 1,
        style: { ...COMMON_STYLES.paragraph, textAlign: 'center' as const, fontSize: FONT_SIZES.bodyLarge, color: PALETTE.textSecondary }
      },
      {
        id: generateUUID(),
        type: 'shape' as BlockType,
        data: {
            shape: 'rectangle'
        },
        layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 220, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 250 },
        order: 2,
        style: {
            backgroundColor: 'rgba(237, 242, 247, 0.5)',
            border: `2px dashed ${PALETTE.borderLight}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: PALETTE.textSecondary,
            fontSize: FONT_SIZES.bodyRegular,
        }
      },
      {
        id: generateUUID(),
        type: 'text' as BlockType,
        data: { text: 'Drag Components Here', variant: 'subheading' },
        layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 220 + (250/2) - 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 40 },
        order: 3,
        style: { textAlign: 'center' as const, color: PALETTE.textSecondary, fontSize: FONT_SIZES.subheadingMedium }
      }
    ]
  }
};
