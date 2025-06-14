import { DeckDataTemplate, VisualComponent, DeckSection, SectionType, DeckTheme, BlockType as IndexBlockType } from '../types/index.ts';
import { generateUUID } from '../utils/uuid.ts';
import { BLOCK_REGISTRY, BlockType as BlocksBlockType } from '../types/blocks.ts';

const vibrantStartupTheme: DeckTheme = {
  id: 'startup-vibrant-theme-01',
  name: 'Startup Vibrant Pro',
  colors: {
    primary: '#4A90E2', // Bright Blue
    secondary: '#50E3C2', // Aqua Green
    accent: '#F5A623', // Orange
    background: '#F7F9FA', // Lightest Gray
    text: '#333333', // Dark Gray for text
    slideBackground: '#FFFFFF', // White
  },
  fonts: {
    heading: "'Inter', 'Helvetica Neue', sans-serif",
    body: "'Inter', 'Helvetica Neue', sans-serif",
    caption: "'Inter', 'Helvetica Neue', sans-serif",
  },
};

const startupPitchTemplate: DeckDataTemplate = {
  id: 'startup-pitch-enhanced-v1', // Unique ID for this template
  name: 'Enhanced Startup Pitch',
  description: 'A classic startup pitch deck, enhanced with richer components and better placeholder content.',
  thumbnailUrl: 'https://placehold.co/300x200.png/4A90E2/FFFFFF?text=Startup+Pitch',
  category: 'Business',
  deck: {
    id: generateUUID(),
    title: 'My Awesome Startup Pitch',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    theme: vibrantStartupTheme,
    sections: [
      // Section 1: Hero/Title Slide
      {
        id: generateUUID(),
        title: 'Introduction', // Retain specific title for this template
        type: 'hero' as SectionType,
        order: 0,
        components: [ // Replace components with structure from SECTION_DEFAULTS.hero, then customize
          {
            id: generateUUID(),
            type: 'image' as BlocksBlockType,
            data: {
                src: 'https://placehold.co/180x60.png/4A90E2/FFFFFF?text=Startup+Logo', // Customized placeholder
                alt: 'Startup Logo Placeholder'
            },
            layout: { x: (800 - 180) / 2, y: 600 * 0.15, width: 180, height: 60}, // Using SLIDE_WIDTH, SLIDE_HEIGHT from defaults logic
            order: 0,
            style: { objectFit: 'contain' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlocksBlockType,
            data: {
              text: 'StartupName: The Future Is Now', // Customized text
              variant: 'heading',
            },
            layout: { x: 50, y: 600 * 0.35, width: 800 - (50 * 2), height: 120 },
            order: 1,
            style: {
              textAlign: 'center' as const,
              fontSize: '52px', // FONT_SIZES.heroTitle
              fontWeight: 'bold',
              color: vibrantStartupTheme.colors.primary, // Use template theme color
              lineHeight: '1.2',
            }
          },
          {
            id: generateUUID(),
            type: 'text' as BlocksBlockType,
            data: {
              text: 'Tagline: Revolutionizing the way you [verb] [noun] with [key innovation].', // Customized text
              variant: 'subheading',
            },
            layout: { x: 50 + 50, y: (600 * 0.35) + 130, width: 800 - (50 * 2) - 100, height: 80 },
            order: 2,
            style: {
              textAlign: 'center' as const,
              fontSize: '26px', // FONT_SIZES.subheadingLarge
              color: vibrantStartupTheme.colors.text, // Use template theme color
              lineHeight: '1.4',
            }
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      },
      // Section 2: Problem
      {
        id: generateUUID(),
        title: 'The Problem', // Keep specific title
        type: 'problem' as SectionType,
        order: 1,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlocksBlockType,
            layout: { x: 50, y: 50, width: 700, height: 70 }, // Lowered Y, adjusted height
            data: { text: 'The Critical Challenge We\'re Tackling', variant: 'heading' },
            order: 0,
            style: { 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: vibrantStartupTheme.colors.primary,
              textAlign: 'center' as const,
              lineHeight: '1.3',
            },
          },
          {
            id: generateUUID(),
            type: 'text' as BlocksBlockType,
            layout: { x: 50, y: 135, width: 700, height: 100 }, // Lowered Y, increased height
            data: { text: 'Existing solutions for [Task Y] are slow, expensive, and inefficient, costing businesses an average of [Quantifiable Loss] annually. Users are frustrated by [Pain Point 1] and [Pain Point 2].', variant: 'paragraph' },
            order: 1,
            style: { 
              fontSize: '17px',
              color: vibrantStartupTheme.colors.text,
              lineHeight: '1.6',
              textAlign: 'left' as const,
              marginBottom: '20px',
            }
          },
          {
            id: generateUUID(),
            type: 'list' as BlocksBlockType,
            layout: { x: 50, y: 255, width: 700, height: 160 }, // Lowered Y, adjusted height
            data: {
              items: [
                { id: generateUUID(), text: 'Pain Point 1: Describe the specific challenge and who experiences it. Quantify if possible.', icon: 'AlertCircle' },
                { id: generateUUID(), text: 'Pain Point 2: Elaborate on the consequences and costs of this problem (time, money, frustration).', icon: 'TrendingDown' },
                { id: generateUUID(), text: 'Pain Point 3: Highlight why existing solutions are inadequate or the urgency to solve it now.', icon: 'XCircle' }
              ],
              ordered: false,
              itemStyle: { fontSize: '15px', color: vibrantStartupTheme.colors.text, padding: '8px 0px 8px 10px', display: 'flex', alignItems: 'center', gap: '8px' },
              listStyle: { marginLeft: '0px', listStyleType: 'none', paddingLeft: '0px' }
            },
            order: 2,
            style: { marginBottom: '20px' }
          },
          {
            id: generateUUID(),
            type: 'calloutBox' as BlocksBlockType,
            layout: { x: 50, y: 435, width: 700, height: 110 }, // Lowered Y, adjusted height
            data: {
                title: 'Impact Snapshot', 
                text: 'Key Statistic: X% of [Target Audience] struggle with [Problem], leading to an estimated $Y in [Loss/Inefficiency] annually.',
                variant: 'warning',
                iconName: 'BarChartBig'
            },
            order: 3,
            style: { 
              backgroundColor: vibrantStartupTheme.colors.background, 
              border: `1px solid ${vibrantStartupTheme.colors.accent}`, 
              borderRadius: '8px', 
              padding: '15px', // Standardized padding
              fontSize: '15px',
              color: vibrantStartupTheme.colors.text,
            }
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      },
      // Section 3: Solution
      {
        id: generateUUID(),
        title: 'Our Solution',
        type: 'solution' as SectionType,
        order: 2,
        components: [
          {
            id: generateUUID(),
            type: 'text',
            layout: { x: 50, y: 50, width: 800, height: 50 },
            data: { text: 'Our Innovative Approach', variant: 'heading', level: 2, textAlign: 'center' },
            style: { fontSize: '40px', color: vibrantStartupTheme.colors.primary },
          },
          {
            id: generateUUID(),
            type: 'problemSolution',
            layout: { x: 100, y: 120, width: 700, height: 150 },
            data: { problem: '', solution: 'Our platform, StartupName, offers a 10x faster, 50% cheaper, and fully integrated approach to [Task Y], featuring [Unique Feature 1] and [Unique Feature 2].', icon: 'CheckCircle' },
            style: { backgroundColor: vibrantStartupTheme.colors.background, padding: '25px', borderRadius: '12px', border: `1px solid ${vibrantStartupTheme.colors.secondary}` },
          },
          {
            id: generateUUID(),
            type: 'demoGallery',
            layout: { x: 150, y: 300, width: 600, height: 250 },
            data: {
              items: [
                { type: 'image', src: 'https://placehold.co/280x180.png/26A69A/FFFFFF?text=Solution+UI+1', caption: 'Dashboard Overview' },
                { type: 'image', src: 'https://placehold.co/280x180.png/00ACC1/FFFFFF?text=Solution+UI+2', caption: 'Key Feature in Action' }
              ]
            },
            style: { itemBorderRadius: '8px', gap: '15px' },
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      },
      // Section 4: Market Size
      {
        id: generateUUID(),
        title: 'Market Size',
        type: 'market' as SectionType,
        order: 3,
        components: [
          {
            id: generateUUID(),
            type: 'text',
            layout: { x: 50, y: 50, width: 800, height: 50 },
            data: { text: 'The Market Opportunity', variant: 'heading', level: 2, textAlign: 'center' },
            style: { fontSize: '40px', color: vibrantStartupTheme.colors.primary },
          },
          {
            id: generateUUID(),
            type: 'marketMap',
            layout: { x: 75, y: 130, width: 350, height: 300 },
            data: { tam: 20000000000, sam: 5000000000, som: 500000000, notes: 'Source: Industry Report 2024. CAGR: 12%.' },
            style: { backgroundColor: vibrantStartupTheme.colors.background, padding: '20px', borderRadius: '12px', titleFontSize: '18px', valueFontSize: '20px' },
          },
          {
            id: generateUUID(),
            type: 'chart',
            layout: { x: 475, y: 130, width: 350, height: 300 },
            data: { chartType: 'bar', data: { labels: ['2022', '2023', '2024E'], datasets: [{label: 'Market Growth (USD M)', data: [50, 80, 120], backgroundColor: vibrantStartupTheme.colors.secondary}]}, title: 'Market Growth (USD M)'},
            style: { backgroundColor: vibrantStartupTheme.colors.background, padding: '20px', borderRadius: '12px' },
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      },
      // Section 5: Team
      {
        id: generateUUID(),
        title: 'Our Team',
        type: 'team' as SectionType,
        order: 4,
        components: [
          {
            id: generateUUID(),
            type: 'text',
            layout: { x: 50, y: 50, width: 800, height: 50 },
            data: { text: 'The Experts Behind StartupName', variant: 'heading', level: 2, textAlign: 'center' },
            style: { fontSize: '40px', color: vibrantStartupTheme.colors.primary },
          },
          {
            id: generateUUID(),
            type: 'teamCard',
            layout: { x: 50, y: 130, width: 800, height: 420 },
            data: {
              members: [
                { name: 'Alice Wonderland', title: 'CEO & Visionary', photoUrl: 'https://placehold.co/100x100.png/4A90E2/FFFFFF?text=AW', bio: '10+ years in industry, serial entrepreneur with a passion for [Specific Area].' },
                { name: 'Bob The Builder', title: 'CTO & Lead Architect', photoUrl: 'https://placehold.co/100x100.png/50E3C2/FFFFFF?text=BB', bio: 'Expert in scalable systems & AI, ex-BigTech. Built platforms serving millions.' },
                { name: 'Carol Danvers', title: 'CMO & Growth Hacker', photoUrl: 'https://placehold.co/100x100.png/F5A623/FFFFFF?text=CD', bio: 'Proven track record in user acquisition and brand building for SaaS companies.' },
              ]
            },
            style: { memberCardBackgroundColor: vibrantStartupTheme.colors.background, memberNameColor: vibrantStartupTheme.colors.primary, memberTitleColor: vibrantStartupTheme.colors.secondary, bioColor: vibrantStartupTheme.colors.text, gap: '20px' },
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      },
      // Section 6: Traction (formerly next-steps)
      {
        id: generateUUID(),
        title: 'Traction & Milestones', // Updated title
        type: 'next-steps' as SectionType, // Keeping original type for structural consistency
        order: 5,
        components: [
          {
            id: generateUUID(),
            type: 'text',
            layout: { x: 50, y: 50, width: 800, height: 50 },
            data: { text: 'Our Progress So Far', variant: 'heading', level: 2, textAlign: 'center' },
            style: { fontSize: '40px', color: vibrantStartupTheme.colors.primary },
          },
          {
            id: generateUUID(),
            type: 'tractionWidget',
            layout: { x: 100, y: 130, width: 700, height: 180 },
            data: {
              metrics: [
                { label: 'Users Signed Up', value: '1,200+', trend: 'up', icon: 'Users', description: 'Organic growth + Beta Program' },
                { label: 'Monthly Revenue (Pilot)', value: '$5,000+', trend: 'up', icon: 'DollarSign', description: 'From 5 pilot customers' },
                { label: 'Key Partnerships', value: '3 Secured', trend: 'up', icon: 'Briefcase', description: 'With industry leaders' },
              ]
            },
            style: { backgroundColor: vibrantStartupTheme.colors.background, padding: '20px', borderRadius: '12px', metricValueFontSize: '22px', labelFontSize: '16px' },
          },
          {
            id: generateUUID(),
            type: 'milestoneTracker',
            layout: { x: 100, y: 340, width: 700, height: 200 },
            data: {
              milestones: [
                { label: 'MVP Launched', completed: true },
                { label: 'First 100 Users Acquired', completed: true },
                { label: 'Secure Seed Funding ($500K)', completed: false },
                { label: 'Public Launch Q4 2024', completed: false },
                { label: 'Reach 10,000 Active Users', completed: false },
              ]
            },
            style: { backgroundColor: vibrantStartupTheme.colors.background, padding: '20px', borderRadius: '12px', completedColor: vibrantStartupTheme.colors.secondary, pendingColor: vibrantStartupTheme.colors.accent, labelFontSize: '16px' },
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      },
      // Section 7: Call to Action (formerly funding)
      {
        id: generateUUID(),
        title: 'Funding Ask & Call to Action', // Updated title
        type: 'funding' as SectionType, // Keeping original type
        order: 6,
        components: [
          {
            id: generateUUID(),
            type: 'text',
            layout: { x: 50, y: 80, width: 800, height: 50 },
            data: { text: 'Join Us in Building the Future!', variant: 'heading', level: 2, textAlign: 'center' },
            style: { fontSize: '40px', color: vibrantStartupTheme.colors.primary },
          },
          {
            id: generateUUID(),
            type: 'investmentAsk', // Using the dedicated component
            layout: { x: 150, y: 160, width: 600, height: 180 },
            data: { amount: '$500,000 Seed Round', equity: 'For 15% Equity (SAFE Note)', terms: 'To scale operations, expand marketing, and reach new markets. Detailed financial model available.' },
            style: { backgroundColor: vibrantStartupTheme.colors.background, padding: '25px', borderRadius: '12px', textAlign: 'center', amountFontSize: '28px', termsFontSize: '16px' },
          },
          {
            id: generateUUID(),
            type: 'ctaCard',
            layout: { x: 250, y: 370, width: 400, height: 150 },
            data: { text: 'Let\'s discuss this opportunity.', buttonLabel: 'Contact Us: invest@startupname.com', buttonUrl: 'mailto:invest@startupname.com' },
            style: { backgroundColor: vibrantStartupTheme.colors.primary, color: '#FFFFFF', padding: '25px', borderRadius: '12px', textAlign: 'center', buttonBackgroundColor: vibrantStartupTheme.colors.accent, buttonTextColor: '#FFFFFF', textFontSize: '18px' },
          },
        ] as VisualComponent[],
        slideStyle: { backgroundColor: vibrantStartupTheme.colors.slideBackground }
      }
    ] as DeckSection[],
  }
};

export default startupPitchTemplate;
