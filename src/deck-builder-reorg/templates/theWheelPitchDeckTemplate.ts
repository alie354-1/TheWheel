import { DeckDataTemplate, SectionType, DeckTheme, DeckThemeColors, DeckThemeFonts } from '../types/index.ts';
import { BlockType } from '../types/blocks.ts';
import { generateUUID } from '../utils/uuid.ts';

// Define a default theme for this template
const THE_WHEEL_THEME_COLORS: DeckThemeColors = {
  primary: '#4F46E5', // Indigo
  secondary: '#7C3AED', // Violet
  accent: '#EC4899', // Pink
  background: '#F9FAFB', // Light Gray
  text: '#1F2937',    // Dark Gray
  slideBackground: 'linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)', 
};

const THE_WHEEL_THEME_FONTS: DeckThemeFonts = {
  heading: '"Inter", sans-serif',
  body: '"Inter", sans-serif',
  caption: '"Inter", sans-serif',
};

const THE_WHEEL_THEME: DeckTheme = {
  id: 'the-wheel-deck-theme-v1',
  name: 'The Wheel Default Theme',
  colors: THE_WHEEL_THEME_COLORS,
  fonts: THE_WHEEL_THEME_FONTS,
};

const SLIDE_WIDTH = 800;
const SLIDE_HEIGHT = 600;
const SLIDE_PADDING = 40; 

const commonTextStyles = {
  fontFamily: THE_WHEEL_THEME_FONTS.body,
  color: THE_WHEEL_THEME.colors.text, 
};

const slideTitleStyle = {
  ...commonTextStyles,
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#FFFFFF', 
  textAlign: 'center' as const,
  lineHeight: '1.2',
};

const slideSubtitleStyle = {
  ...commonTextStyles,
  fontSize: '24px',
  fontWeight: 'normal',
  color: 'rgba(255, 255, 255, 0.85)', 
  textAlign: 'center' as const,
  lineHeight: '1.4',
  marginTop: '10px',
};

const bodyTextStyle = {
  ...commonTextStyles,
  fontSize: '14px',
  lineHeight: '1.4',
  color: THE_WHEEL_THEME.colors.text,
};

const headingStyle = {
  ...commonTextStyles,
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#111827', 
  textAlign: 'center' as const,
  marginBottom: '10px',
};

const subHeadingStyle = {
  ...commonTextStyles,
  fontSize: '20px',
  color: '#374151', 
  textAlign: 'center' as const,
  marginBottom: '20px',
  lineHeight: '1.5',
};

const cardBaseStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};


export const theWheelPitchDeckTemplate: DeckDataTemplate = {
  id: 'the-wheel-pitch-deck-v1',
  name: 'The Wheel - Startup Pitch (14 Slides)',
  description: 'A 14-slide standard pitch deck based on The Wheel\'s presentation.',
  category: 'vc-pitch',
  thumbnailUrl: '', 
  deck: {
    id: 'deck-the-wheel-pitch-v1',
    title: 'The Wheel Pitch Deck',
    theme: THE_WHEEL_THEME,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'system-template', 
    sections: [
      // Slide 1: Title Slide
      {
        id: generateUUID(),
        type: 'hero' as SectionType,
        title: 'The Wheel - Title',
        order: 1,
        slideStyle: { background: THE_WHEEL_THEME.colors.slideBackground },
        components: [
          {
            id: generateUUID(), type: 'text' as BlockType,
            data: { text: 'The Wheel', variant: 'heading' },
            layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT * 0.38, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 70 },
            order: 1, style: { ...slideTitleStyle, fontSize: '64px' }
          },
          {
            id: generateUUID(), type: 'text' as BlockType,
            data: { text: 'Intelligent Startup Infrastructure for Founders and Funds', variant: 'subheading' },
            layout: { x: SLIDE_PADDING + 50, y: SLIDE_HEIGHT * 0.38 + 80, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 60 },
            order: 2, style: { ...slideSubtitleStyle, fontSize: '28px' }
          },
        ],
      },
      // Slide 2: The Big Problem
      {
        id: generateUUID(), type: 'problem' as SectionType, title: 'The Big Problem', order: 2,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Big Problem', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } }, 
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Startups don't fail because of bad ideas. They fail from execution chaos.", variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 40 + 5, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '10px' } }, 
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Too many tools, no structure:\nFounders drowning in disconnected point solutions, leading to operational friction and wasted resources.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 40 + 5 + 30 + 10, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 110 }, order: 3, style: { ...bodyTextStyle, fontSize: '11px', textAlign: 'center' as const, ...cardBaseStyle, padding: '10px', backgroundColor: '#F3E8FF', lineHeight: 1.2 } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Generic advice, no guidance:\nOne-size-fits-all advice doesn't account for unique startup needs, stages, or market dynamics.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3) + 20, y: SLIDE_PADDING + 40 + 5 + 30 + 10, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 110 }, order: 4, style: { ...bodyTextStyle, fontSize: '11px', textAlign: 'center' as const, ...cardBaseStyle, padding: '10px', backgroundColor: '#F3E8FF', lineHeight: 1.2 } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Founders overwhelmed, building alone:\nThe journey from idea to company is complex and often isolating, especially for lean teams.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 2 * (((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3) + 20), y: SLIDE_PADDING + 40 + 5 + 30 + 10, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 110 }, order: 5, style: { ...bodyTextStyle, fontSize: '11px', textAlign: 'center' as const, ...cardBaseStyle, padding: '10px', backgroundColor: '#F3E8FF', lineHeight: 1.2 } }, 
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Stark Reality:', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: (SLIDE_PADDING + 40 + 5 + 30 + 10) + 110 + 5, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 25 }, order: 6, style: { ...subHeadingStyle, fontSize: '16px', color: '#374151', textAlign: 'center' as const, fontWeight: '600', marginBottom: '3px' } }, // Y: 240
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: 'Approximately 21.5% of new businesses fail within the first year, and 48.4% by the fifth year. (LendingTree, analysis of U.S. Bureau of Labor Statistics data, March 2024). Some reports suggest up to 90% of startups ultimately fail over a longer timeframe.' }, { id: generateUUID(), text: 'A primary reason for failure is running out of cash or failing to raise new capital (38% of cases). (Preprints.org, citing CB Insights 2024 data)' } ], ordered: false, itemStyle: { fontSize: '8px', lineHeight: '1.0', padding: '2px 0', color: '#7F1D1D' }, }, layout: { x: SLIDE_PADDING + 20, y: (SLIDE_PADDING + 40 + 5 + 30 + 10) + 110 + 5 + 25 + 3, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40, height: 65 }, order: 7, style: { ...cardBaseStyle, backgroundColor: '#FEE2E2', padding: '10px', border: '1px solid #FCA5A5' } }, // Y: 268, H: 65. Ends 333
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Meanwhile, VCs face their own challenges:', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: ((SLIDE_PADDING + 40 + 5 + 30 + 10) + 110 + 5 + 25 + 3) + 65 + 5, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 25 }, order: 8, style: { ...subHeadingStyle, fontSize: '16px', color: '#374151', textAlign: 'center' as const, fontWeight: '600', marginBottom: '3px', marginTop: '5px' } }, // Y: 338
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Scaling support:\nDifficulty providing consistent, high-value support.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: (((SLIDE_PADDING + 40 + 5 + 30 + 10) + 110 + 5) + 25 + 3) + 65 + 5 + 25 + 3, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 55 }, order: 9, style: { ...bodyTextStyle, fontSize: '9px', textAlign: 'center' as const, ...cardBaseStyle, padding: '5px', backgroundColor: '#E0E7FF', lineHeight: 1.1 } }, // Y: 366
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Differentiated value:\nPressure to show unique value to LPs & founders.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3) + 20, y: (((SLIDE_PADDING + 40 + 5 + 30 + 10) + 110 + 5) + 25 + 3) + 65 + 5 + 25 + 3, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 55 }, order: 10, style: { ...bodyTextStyle, fontSize: '9px', textAlign: 'center' as const, ...cardBaseStyle, padding: '5px', backgroundColor: '#E0E7FF', lineHeight: 1.1 } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Portfolio risk:\nApprox. 75% of VC-backed startups don't return cash to investors. (flowtrace, citing WSJ - Shikhar Ghosh)", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 2 * (((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3) + 20), y: (((SLIDE_PADDING + 40 + 5 + 30 + 10) + 110 + 5) + 25 + 3) + 65 + 5 + 25 + 3, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3, height: 55 }, order: 11, style: { ...bodyTextStyle, fontSize: '9px', textAlign: 'center' as const, ...cardBaseStyle, padding: '5px', backgroundColor: '#E0E7FF', lineHeight: 1.1 } }, // Ends 366 + 55 = 421
        ],
      },
      // Slide 3: The Wheel's Solution
      {
        id: generateUUID(), type: 'solution' as SectionType, title: "The Wheel's Solution", order: 3,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "The Wheel's Solution", variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } }, 
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "The Wheel provides an intelligent, adaptive infrastructure to navigate the startup journey.", variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 40 + 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 70 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '30px' } }, // Y: 90, H:70, MB:30. Next Y: 190
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "For Founders:\nA smart, guided system to transform an idea into a thriving company - providing clarity, structure, and momentum from day one.", variant: 'paragraph'}, layout: { x: SLIDE_PADDING + 20, y: 190, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, height: 150 }, order: 3, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', textAlign: 'left' as const, padding: '20px' } }, // Ends 340
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "For VCs:\nA private, white-labeled support and insights layer to embed their unique value, playbooks, and expertise directly into every portfolio company's workflow.", variant: 'paragraph'}, layout: { x: SLIDE_PADDING + 40 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, y: 190, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, height: 150 }, order: 4, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', textAlign: 'left' as const, padding: '20px' } }, // Ends 340
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Powered by a Three-Layer AI Engine:', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: 340 + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 5, style: { ...subHeadingStyle, fontSize: '16px', color: '#1F2937', fontWeight: '600', textAlign: 'center' as const, marginBottom: '10px' } }, // Y: 360, H:30, MB:10. Next Y: 400
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Our AI learns and adapts across:', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: 400, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 6, style: { ...bodyTextStyle, fontSize: '14px', color: '#4B5563', textAlign: 'center' as const, marginBottom: '15px' } }, // Y: 400, H:30, MB:15. Next Y: 445
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: '1. Individual Startup Data: Tailoring recommendations.' }, { id: generateUUID(), text: '2. Segment Patterns: Identifying best practices.' }, { id: generateUUID(), text: '3. Global Ecosystem Insights: Continuously incorporating learnings.' }, ], ordered: false, itemStyle: { fontSize: '14px', lineHeight: '1.6', color: '#374151', padding: '4px 0' }, }, layout: { x: SLIDE_PADDING + 60, y: 445, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 120, height: 110 }, order: 7, style: { ...cardBaseStyle, padding: '15px 20px', backgroundColor: '#F9FAFB' } }, // Y: 445, H:110. Ends 555
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Wheel turns chaos into predictable progress.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: 555 + 15, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 8, style: { ...bodyTextStyle, fontSize: '18px', fontWeight: '600', color: '#10B981', textAlign: 'center' as const } }, // Y: 570. Ends 600.
        ],
      },
      // Slide 4: Dual Customer Personas
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'Dual Customer Personas', order: 4,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Dual Customer Personas', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'We serve two interconnected customers critical to startup success:', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 45, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '40px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: '', variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 20, y: SLIDE_PADDING + 100, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, height: 380 }, order: 3, style: { ...cardBaseStyle, backgroundColor: '#EEF2FF', padding: '20px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Founder', variant: 'heading' }, layout: { x: SLIDE_PADDING + 40, y: SLIDE_PADDING + 120, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, height: 30 }, order: 4, style: { ...headingStyle, fontSize: '22px', color: THE_WHEEL_THEME_COLORS.primary, textAlign: 'left' as const, marginBottom: '15px'} },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "• Profile: First/second-time founders, often solo or tiny teams (60%+ of new startups. Startup Genome, GSER 2023).\n• Needs: Clarity, structure, momentum, guided support.\n• Pain Points: Overwhelm, analysis paralysis, reinventing the wheel.\n• First-time founders have an 18% success rate. (Founders Forum Group)", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 40, y: SLIDE_PADDING + 160, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, height: 280 }, order: 5, style: { ...bodyTextStyle, fontSize: '14px', lineHeight: '1.7', textAlign: 'left' as const } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: '', variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 40 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, y: SLIDE_PADDING + 100, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, height: 380 }, order: 6, style: { ...cardBaseStyle, backgroundColor: '#F0FFF4', padding: '20px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Venture Capital Firm', variant: 'heading' }, layout: { x: SLIDE_PADDING + 60 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, y: SLIDE_PADDING + 120, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, height: 30 }, order: 7, style: { ...headingStyle, fontSize: '22px', color: '#2F855A', textAlign: 'left' as const, marginBottom: '15px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "• Profile: Seed/pre-seed funds, 10-100+ portfolio companies.\n• Needs: Scalable support, operational leverage (avg. seed firm <5 employees for 25+ companies. SVB State of Startups, 2022), differentiated value.\n• Pain Points: Inconsistent support, demonstrating value beyond capital.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 60 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, y: SLIDE_PADDING + 160, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, height: 280 }, order: 8, style: { ...bodyTextStyle, fontSize: '14px', lineHeight: '1.7', textAlign: 'left' as const } },
        ],
      },
      // Slide 5: Product Experience (The Journey)
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'Product Experience (The Journey)', order: 5,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Product Experience (The Journey)', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Wheel guides founders through a dynamic, AI-powered journey:', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 45, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '30px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "1. Onboard:\nDefine role, stage, goals, company type. VCs can customize flows.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 100, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 70 }, order: 3, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', padding: '15px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "2. Recommend:\nAI-curated path, resources, templates. VCs embed playbooks.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 100 + 70 + 15, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 70 }, order: 4, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', padding: '15px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "3. Execute:\nActionable tasks, embedded tools & integrations.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 100 + (70 + 15) * 2, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 70 }, order: 5, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', padding: '15px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "4. Track & Adapt:\nProgress dashboards. AI refines path (pivoting can boost growth 3.6x. Exploding Topics, citing Startup Genome).", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 100 + (70 + 15) * 3, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 85 }, order: 6, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', padding: '15px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'AI adapts everything as they go, ensuring the right support at the right time.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 55, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 7, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: '600', color: '#10B981', textAlign: 'center' as const } },
        ],
      },
      // Slide 6: VC White-Label Layer
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'VC White-Label Layer', order: 6,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'VC White-Label Layer', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Empowering VCs to scale their unique value proposition.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '40px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: '', variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 40, y: SLIDE_PADDING + 130, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, height: 280 }, order: 3, style: { ...cardBaseStyle, backgroundColor: '#F3E8FF', padding: '25px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'VCs Get:', variant: 'heading' }, layout: { x: SLIDE_PADDING + 60, y: SLIDE_PADDING + 150, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 140) / 2, height: 30 }, order: 4, style: { ...headingStyle, fontSize: '20px', color: THE_WHEEL_THEME_COLORS.primary, textAlign: 'left' as const, marginBottom: '10px'} },
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: 'Custom Onboarding Flows' }, { id: generateUUID(), text: 'Embedded Playbooks, Vendors, Intros' }, { id: generateUUID(), text: 'Optional Engagement Insights (Aggregated)' }, { id: generateUUID(), text: 'Fully Branded Platform Experience' }, ], ordered: false, itemStyle: { fontSize: '14px', lineHeight: '1.8', color: THE_WHEEL_THEME_COLORS.text, padding: '5px 0' }, }, layout: { x: SLIDE_PADDING + 60, y: SLIDE_PADDING + 190, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 140) / 2, height: 180 }, order: 5, style: { } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: '', variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 60 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, y: SLIDE_PADDING + 130, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, height: 280 }, order: 6, style: { ...cardBaseStyle, backgroundColor: '#D1FAE5', padding: '25px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Founders Get:', variant: 'heading' }, layout: { x: SLIDE_PADDING + 80 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, y: SLIDE_PADDING + 150, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 140) / 2, height: 30 }, order: 7, style: { ...headingStyle, fontSize: '20px', color: '#065F46', textAlign: 'left' as const, marginBottom: '10px'} },
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: "VC's best thinking, contextually delivered." }, { id: generateUUID(), text: 'Structured way to leverage VC support.' }, ], ordered: false, itemStyle: { fontSize: '14px', lineHeight: '1.8', color: '#065F46', padding: '5px 0' }, }, layout: { x: SLIDE_PADDING + 80 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100) / 2, y: SLIDE_PADDING + 190, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 140) / 2, height: 100 }, order: 8, style: { } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'This transforms VC support from reactive to proactive and deeply embedded.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 9, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: '600', color: THE_WHEEL_THEME_COLORS.secondary, textAlign: 'center' as const } },
        ],
      },
      // Slide 7: Market Opportunity
      {
        id: generateUUID(), type: 'market' as SectionType, title: 'Market Opportunity', order: 7,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Market Opportunity', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The startup ecosystem is vast, dynamic, and ripe for intelligent infrastructure.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 45, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '25px' } },
          { 
            id: generateUUID(), type: 'text' as BlockType, 
            data: { text: "5.49 million new U.S. business applications in 2023. (U.S. Census Bureau via Oberlo)\nApprox. 1.72 million YTD April 2025. (U.S. Census Bureau via YCharts; e.g. April 2025 Report)", variant: 'paragraph' }, 
            layout: { x: SLIDE_PADDING + 20, y: SLIDE_PADDING + 90, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3, height: 150 }, 
            order: 3, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '12px', lineHeight: '1.5', padding: '10px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const } 
          },
          { 
            id: generateUUID(), type: 'text' as BlockType, 
            data: { text: "Over 61,000 tech employees laid off YTD May 2025. (Layoffs.fyi via Times of India)", variant: 'paragraph' }, 
            layout: { x: SLIDE_PADDING + 20 + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3) + 20, y: SLIDE_PADDING + 90, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3, height: 150 }, 
            order: 4, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '12px', lineHeight: '1.5', padding: '10px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const } 
          },
          { 
            id: generateUUID(), type: 'text' as BlockType, 
            data: { text: "$2.9B spent annually by early-stage companies on tools/services. (PitchBook-NVCA Q2 2023)", variant: 'paragraph' }, 
            layout: { x: SLIDE_PADDING + 20 + 2*(((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3) + 20), y: SLIDE_PADDING + 90, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3, height: 150 }, 
            order: 5, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '12px', lineHeight: '1.5', padding: '10px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const } 
          },
          { 
            id: generateUUID(), type: 'text' as BlockType, 
            data: { text: "Global early-stage (Seed & Series A) VC funding: $24B in Q1 2025. (Crunchbase News)", variant: 'paragraph' }, 
            layout: { x: SLIDE_PADDING + 20, y: SLIDE_PADDING + 90 + 150 + 20, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3, height: 150 }, 
            order: 6, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '12px', lineHeight: '1.5', padding: '10px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const } 
          },
          { 
            id: generateUUID(), type: 'text' as BlockType, 
            data: { text: "SaaS co's spend 107% of ARR across depts. (SaaS Capital 2024)", variant: 'paragraph' }, 
            layout: { x: SLIDE_PADDING + 20 + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3) + 20, y: SLIDE_PADDING + 90 + 150 + 20, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3, height: 150 }, 
            order: 7, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '12px', lineHeight: '1.5', padding: '10px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const } 
          },
          { 
            id: generateUUID(), type: 'text' as BlockType, 
            data: { text: "2,000+ venture firms judged by founder experience. (TechCrunch VC Survey, 2023)", variant: 'paragraph' }, 
            layout: { x: SLIDE_PADDING + 20 + 2*(((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3) + 20), y: SLIDE_PADDING + 90 + 150 + 20, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 3, height: 150 }, 
            order: 8, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '12px', lineHeight: '1.5', padding: '10px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const } 
          },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Huge whitespace: No one owns the structured, intelligent startup journey at scale.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 9, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: 'bold', color: '#DC2626', textAlign: 'center' as const, backgroundColor: '#FEE2E2', padding: '10px', borderRadius: '4px' } },
        ],
      },
      // Slide 8: Why Now
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'Why Now', order: 8,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Why Now', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Converging trends create a unique window of opportunity for The Wheel.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '40px' } },
          ...[
            { title: "Rise of Remote & Distributed Teams", description: "Remote startup founding up 30% since 2020. (First Round, State of Startups 2023)", layout: { x: SLIDE_PADDING + 30, y: SLIDE_PADDING + 130, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, height: 150 } },
            { title: "AI & LLM Maturity", description: "Personalized, scalable support now feasible. (Gartner AI Trends)", layout: { x: SLIDE_PADDING + 50 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, y: SLIDE_PADDING + 130, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, height: 150 } },
            { title: "VCs Need Operational Leverage", description: "Seeking tools for scalability and founder stickiness. Active early-stage investment continues ($24B in Q1 2025. Crunchbase News).", layout: { x: SLIDE_PADDING + 30, y: SLIDE_PADDING + 130 + 150 + 20, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, height: 150 } },
            { title: "Founder Expectations Evolving", description: "Seeking genuine partnership and operational support beyond capital.", layout: { x: SLIDE_PADDING + 50 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, y: SLIDE_PADDING + 130 + 150 + 20, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, height: 150 } },
          ].map((card, index) => ({ id: generateUUID(), type: 'text' as BlockType, data: { text: `${card.title}\n${card.description}`, variant: 'paragraph' }, layout: card.layout, order: 3 + index, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '14px', lineHeight: '1.6', padding: '20px', textAlign: 'left' as const } })), 
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The market is ready for a new category of intelligent startup infrastructure.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 7, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: '600', color: '#10B981', textAlign: 'center' as const } },
        ],
      },
      // Slide 9: Traction + Roadmap
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'Traction + Roadmap', order: 9,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Traction + Roadmap', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 10, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Building momentum and validating our vision.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 55, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '30px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: {text: ''}, layout: { x: SLIDE_PADDING + 20, y: SLIDE_PADDING + 110, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, height: 380 }, order: 3, style: { ...cardBaseStyle, backgroundColor: '#E0F2F7', padding: '20px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Current Traction:', variant: 'heading' }, layout: { x: SLIDE_PADDING + 40, y: SLIDE_PADDING + 130, width: ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2) - 40 , height: 25 }, order: 4, style: { ...headingStyle, fontSize: '20px', color: THE_WHEEL_THEME_COLORS.primary, textAlign: 'left' as const, marginBottom: '15px'} },
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: 'MVP Ready: Core platform developed.' }, { id: generateUUID(), text: 'Strong Founder Interest: 100+ on waitlist.' }, { id: generateUUID(), text: 'Early VC Partnerships: Onboarding initial partners.' }, ], ordered: false, itemStyle: { fontSize: '15px', lineHeight: '1.8', color: THE_WHEEL_THEME_COLORS.text, padding: '5px 0' }, }, layout: { x: SLIDE_PADDING + 40, y: SLIDE_PADDING + 165, width: ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2) - 40, height: 150 }, order: 5, style: { } },
          { id: generateUUID(), type: 'text' as BlockType, data: {text: ''}, layout: { x: SLIDE_PADDING + 40 + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2), y: SLIDE_PADDING + 110, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2, height: 380 }, order: 6, style: { ...cardBaseStyle, backgroundColor: '#E6FFFA', padding: '20px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Upcoming Milestones:', variant: 'heading' }, layout: { x: SLIDE_PADDING + 60 + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2), y: SLIDE_PADDING + 130, width: ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2) - 40, height: 25 }, order: 7, style: { ...headingStyle, fontSize: '20px', color: '#047857', textAlign: 'left' as const, marginBottom: '15px'} },
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: 'Summer 2025: Beta cohort launch.' }, { id: generateUUID(), text: 'Q3 2025: Full product launch for founders.' }, { id: generateUUID(), text: 'Q4 2025: Scale VC white-label onboarding.' }, { id: generateUUID(), text: '2026: Expand integrations, marketplace.' }, ], ordered: false, itemStyle: { fontSize: '15px', lineHeight: '1.8', color: '#047857', padding: '5px 0' }, }, layout: { x: SLIDE_PADDING + 60 + ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2), y: SLIDE_PADDING + 165, width: ((SLIDE_WIDTH - (SLIDE_PADDING * 2) - 60) / 2) - 40, height: 200 }, order: 8, style: { } },
        ],
      },
      // Slide 10: Business Model
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'Business Model', order: 10,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Business Model', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Dual revenue streams aligned with customer value.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '40px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Founders (B2C SaaS)\n\n• Freemium: Core journey access.\n• Premium ($49/mo): Advanced AI, integrations, templates.\n• Focus: Value, Community, Affordability.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 30, y: SLIDE_PADDING + 130, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, height: 280 }, order: 3, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', lineHeight: '1.7', padding: '25px', textAlign: 'left' as const, backgroundColor: '#EDE9FE' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "VCs/Accelerators (B2B White-Label)\n\n• Tiered SaaS: Based on AUM / # Portfolio Co's.\n• Example: $5k-$25k+/year per fund.\n• Focus: Scalability, Customization, Insights.", variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 50 + (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, y: SLIDE_PADDING + 130, width: (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 80) / 2, height: 280 }, order: 4, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '15px', lineHeight: '1.7', padding: '25px', textAlign: 'left' as const, backgroundColor: '#E0E7FF' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Projected: 70% B2C, 30% B2B revenue mix by Year 3.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 5, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: '600', color: THE_WHEEL_THEME_COLORS.secondary, textAlign: 'center' as const, backgroundColor: '#F3E8FF', padding: '10px', borderRadius: '4px' } },
        ],
      },
      // Slide 11: Team
      {
        id: generateUUID(), type: 'team' as SectionType, title: 'Our Team', order: 11,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Our Team', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Experienced builders passionate about empowering startups.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '50px' } },
          ...[
            { name: 'Alex Cohen', title: 'CEO & Product Visionary\n(Prev. Founder, Google PM)', imageUrl: '/assets/placeholder-profile.png' },
            { name: 'Dr. Jordan Lee', title: 'CTO & AI Lead\n(PhD AI, ex-OpenAI Researcher)', imageUrl: '/assets/placeholder-profile.png' },
            { name: 'Maria Santos', title: 'Head of Growth & Community\n(Startup Ecosystem Veteran)', imageUrl: '/assets/placeholder-profile.png' },
          ].map((member, index) => {
            const cardWidth = (SLIDE_WIDTH - (SLIDE_PADDING * 2) - 40) / 3; 
            const cardX = SLIDE_PADDING + index * (cardWidth + 20);
            return [
              { id: generateUUID(), type: 'image' as BlockType, data: { src: member.imageUrl, alt: member.name }, layout: { x: cardX + (cardWidth - 100) / 2, y: SLIDE_PADDING + 140, width: 100, height: 100 }, order: 3 + index * 2, style: { borderRadius: '50%', backgroundColor: '#E0E7FF', objectFit: 'cover' as const } },
              { id: generateUUID(), type: 'text' as BlockType, data: { text: `${member.name}\n${member.title}`, variant: 'paragraph' }, layout: { x: cardX, y: SLIDE_PADDING + 140 + 100 + 15, width: cardWidth, height: 100 }, order: 4 + index * 2, style: { ...bodyTextStyle, fontSize: '14px', lineHeight: '1.5', textAlign: 'center' as const, color: THE_WHEEL_THEME_COLORS.text } }
            ];
          }).flat(),
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Advisors from top VCs & successful exited founders.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 3 + 3 * 2, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: '600', color: THE_WHEEL_THEME_COLORS.accent, textAlign: 'center' as const, backgroundColor: '#FFF1F2', padding: '10px', borderRadius: '4px' } },
        ],
      },
      // Slide 12: The Ask
      {
        id: generateUUID(), type: 'custom' as SectionType, title: 'The Ask', order: 12,
        slideStyle: { background: THE_WHEEL_THEME.colors.slideBackground },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'The Ask', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 30, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 60 }, order: 1, style: { ...slideTitleStyle, fontSize: '52px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'We are raising a $1.5M Seed Round', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 120, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 50 }, order: 2, style: { ...slideSubtitleStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.accent, fontWeight: 'bold' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'To achieve key milestones over the next 18 months:', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 120 + 50 + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 3, style: { ...slideSubtitleStyle, fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' as const } },
          { id: generateUUID(), type: 'list' as BlockType, data: { items: [ { id: generateUUID(), text: 'Scale to 1,000 active founders & 20 VC partners' }, { id: generateUUID(), text: 'Achieve $50k MRR' }, { id: generateUUID(), text: 'Expand core AI capabilities & integrations' }, { id: generateUUID(), text: 'Build out initial GTM & community team' }, ], ordered: false, itemStyle: { fontSize: '18px', lineHeight: '1.8', color: '#FFFFFF', padding: '6px 0' }, }, layout: { x: SLIDE_PADDING + 100, y: SLIDE_PADDING + 120 + 50 + 20 + 30 + 30, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 200, height: 200 }, order: 4, style: { textAlign: 'left' as const } },
        ],
      },
      // Slide 13: Financial Projections
      {
        id: generateUUID(), type: 'financials' as SectionType, title: 'Financial Projections', order: 13,
        slideStyle: { backgroundColor: THE_WHEEL_THEME.colors.background },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Financial Projections', variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 20, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 40 }, order: 1, style: { ...headingStyle, fontSize: '36px', color: THE_WHEEL_THEME_COLORS.primary } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Conservative estimates showing strong growth potential.', variant: 'subheading' }, layout: { x: SLIDE_PADDING, y: SLIDE_PADDING + 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 2, style: { ...subHeadingStyle, fontSize: '18px', color: THE_WHEEL_THEME_COLORS.secondary, marginBottom: '40px' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Chart/Table: Year 1-5 Projections (Revenue, Users, Key Metrics)', variant: 'paragraph' }, layout: { x: SLIDE_PADDING + 50, y: SLIDE_PADDING + 150, width: SLIDE_WIDTH - (SLIDE_PADDING * 2) - 100, height: 250 }, order: 3, style: { ...cardBaseStyle, ...bodyTextStyle, fontSize: '16px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, textAlign: 'center' as const, border: `2px dashed ${THE_WHEEL_THEME_COLORS.secondary}`, backgroundColor: '#F3E8FF' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: 'Detailed financial model available upon request.', variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT - SLIDE_PADDING - 70, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 30 }, order: 4, style: { ...bodyTextStyle, fontSize: '16px', fontWeight: 'normal', color: THE_WHEEL_THEME_COLORS.text, textAlign: 'center' as const } },
        ],
      },
      // Slide 14: Contact / Thank You
      {
        id: generateUUID(), type: 'contact' as SectionType, title: 'Contact Us', order: 14,
        slideStyle: { background: THE_WHEEL_THEME.colors.slideBackground },
        components: [
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Let's Build the Future of Startups, Together.", variant: 'heading' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT * 0.3, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 100 }, order: 1, style: { ...slideTitleStyle, fontSize: '44px', color: '#FFFFFF' } },
          { id: generateUUID(), type: 'text' as BlockType, data: { text: "Alex Cohen\nCEO, The Wheel\nalex@thewheel.com\nthewheel.com", variant: 'paragraph' }, layout: { x: SLIDE_PADDING, y: SLIDE_HEIGHT * 0.3 + 120, width: SLIDE_WIDTH - (SLIDE_PADDING * 2), height: 150 }, order: 2, style: { ...slideSubtitleStyle, fontSize: '22px', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.9)'} },
        ],
      },
    ],
  },
};
