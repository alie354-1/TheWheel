import { DeckDataTemplate, SectionType, BlockType, VisualComponent } from '../types';
import { SECTION_DEFAULTS } from './defaults';
import { generateUUID } from '../utils/uuid';
import { BLOCK_REGISTRY } from '../types/blocks';

const seriesAPitchTemplate: DeckDataTemplate = {
  id: 'series-a-pitch-v1',
  name: 'Series A Pitch Deck',
  description: 'Comprehensive template for Series A funding, emphasizing growth, metrics, and market expansion.',
  category: 'VC Pitch',
  thumbnailUrl: 'https://via.placeholder.com/300x200?text=Series+A+Pitch', // Placeholder
  deck: {
    id: generateUUID(),
    title: 'Series A Investment: Scaling [Your Company Name]',
    user_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: [
      {
        id: generateUUID(),
        type: 'hero' as SectionType,
        title: '[Your Company Name]: Scaling Proven Success',
        order: 0,
        components: [
          { 
            id: generateUUID(),
            type: 'image' as BlockType, // Assuming 'image' type exists in BlockType
            data: { 
              src: 'https://via.placeholder.com/160x90?text=Your+Logo', 
              alt: 'Company Logo' 
            },
            layout: { x: 320, y: 80, width: 160, height: 90 },
            order: 0,
            style: { objectFit: 'contain' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'Scaling [Your Company Name] to Market Leadership', 
              variant: 'heading' 
            },
            layout: { x: 50, y: 200, width: 700, height: 120 },
            order: 1,
            style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.2' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'Building on proven product-market fit to capture a [X billion/million] market opportunity and redefine the [Industry Name] landscape.', 
              variant: 'subheading' 
            },
            layout: { x: 100, y: 340, width: 600, height: 100 },
            order: 2,
            style: { fontSize: '22px', textAlign: 'center', color: '#4A5568', lineHeight: '1.5' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'keyMetricsDashboard' as SectionType, // or just 'custom' if type drives specific rendering
        title: 'Proven Traction & Key Metrics',
        order: 1,
        components: [
          { // Metric Card 1: ARR/MRR
            id: generateUUID(),
            type: 'text' as BlockType, // Assuming 'text' can be styled into a card
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'ARR / MRR\n\n$[X]M / $[Y]K', // Title and Value, extra newline for spacing
              variant: 'paragraph' // Use a base variant
            },
            layout: { x: 60, y: 100, width: 200, height: 140 }, 
            order: 0,
            style: { 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center', 
              fontSize: '18px', // For the label part
              fontWeight: 'bold', // For the label part
              whiteSpace: 'pre-line' // To respect \n for value separation
            }
          },
          { // Metric Card 2: Customer Growth
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Customer Growth (MoM)\n\n[Z]%',
              variant: 'paragraph'
            },
            layout: { x: 300, y: 100, width: 200, height: 140 }, 
            order: 1,
            style: { 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center', 
              fontSize: '18px', 
              fontWeight: 'bold',
              whiteSpace: 'pre-line'
            }
          },
          { // Metric Card 3: LTV/CAC Ratio
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'LTV/CAC Ratio\n\n[Ratio]',
              variant: 'paragraph'
            },
            layout: { x: 540, y: 100, width: 200, height: 140 },
            order: 2,
            style: { 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center', 
              fontSize: '18px', 
              fontWeight: 'bold',
              whiteSpace: 'pre-line'
            }
          },
          { // Explanatory note
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Key metrics demonstrate strong product-market fit and efficient growth. Detailed financial model available in appendix.',
              variant: 'paragraph' 
            },
            layout: { x: 60, y: 280, width: 680, height: 60 }, // y = 100 + 140 + 40
            order: 3,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'center', color: '#6c757d' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'market' as SectionType,
        title: 'Large & Growing Market',
        order: 2,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Total Addressable Market (TAM): $[X] Billion\nServiceable Addressable Market (SAM): $[Y] Billion\nServiceable Obtainable Market (SOM): $[Z] Million (Year 1 Target)',
              variant: 'paragraph' 
            },
            layout: { x: 60, y: 100, width: 680, height: 120 },
            order: 0,
            style: { fontSize: '20px', lineHeight: '1.6', textAlign: 'left', marginBottom: '25px', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Key Market Drivers:**\n• [Driver 1, e.g., Increasing adoption of cloud technologies]\n• [Driver 2, e.g., Regulatory changes favoring new solutions]\n\n**Growth Trends:**\n• The market is projected to grow at a CAGR of [X]% over the next 5 years, driven by [key factors].',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 245, width: 680, height: 180 }, 
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.7', textAlign: 'left', whiteSpace: 'pre-line', marginBottom: '20px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '(Illustrative Chart: A bar chart could visually represent the market growth from TAM to SAM to SOM, or year-over-year market size increase.)',
              variant: 'paragraph' // Using paragraph for consistency, styling as caption
            },
            layout: { x: 60, y: 445, width: 680, height: 50 }, 
            order: 2,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'problem' as SectionType,
        title: 'The Evolving Problem',
        order: 3,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'The [Industry/Market] faces a significant and evolving challenge: [Concisely state the core problem and its increasing complexity or scale].',
              variant: 'subheading' 
            },
            layout: { x: 60, y: 100, width: 680, height: 100 },
            order: 0,
            style: { fontSize: '24px', lineHeight: '1.5', textAlign: 'center', marginBottom: '30px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Deep Dive: Pain Point 1**\n[Elaborate on the first critical aspect of the problem, quantifying its impact where possible. Why is this urgent?]',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 230, width: 330, height: 180 }, 
            order: 1,
            style: { 
              fontSize: '16px', 
              lineHeight: '1.6', 
              textAlign: 'left', 
              backgroundColor: '#fff9e6', 
              padding: '15px', 
              borderRadius: '6px',
              whiteSpace: 'pre-line'
            }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Deep Dive: Pain Point 2**\n[Elaborate on the second critical aspect. How does this affect the target audience or market broadly?]',
              variant: 'paragraph'
            },
            layout: { x: 410, y: 230, width: 330, height: 180 }, 
            order: 2,
            style: { 
              fontSize: '16px', 
              lineHeight: '1.6', 
              textAlign: 'left', 
              backgroundColor: '#fff9e6', 
              padding: '15px', 
              borderRadius: '6px',
              whiteSpace: 'pre-line'
            }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'This complex problem results in [quantifiable negative outcomes, e.g., lost revenue, inefficiency] for businesses and users alike, creating a clear need for a better solution.',
              variant: 'paragraph' 
            },
            layout: { x: 60, y: 430, width: 680, height: 70 }, 
            order: 3,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center', fontStyle: 'italic', color: '#555555' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'solution' as SectionType,
        title: 'Our Scalable Solution',
        order: 4,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our platform, [Product Name], offers a robust and scalable solution to [reiterate core problem], enabling users/customers to [achieve key outcome].',
              variant: 'subheading'
            },
            layout: { x: 60, y: 100, width: 680, height: 80 },
            order: 0,
            style: { fontSize: '22px', lineHeight: '1.5', textAlign: 'center', marginBottom: '30px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Core Feature/Benefit 1: [e.g., Advanced Analytics Engine]**\n[Detailed explanation of the feature and its benefit, focusing on scalability or unique value for Series A context.]',
              variant: 'paragraph'
            },
            layout: { x: 40, y: 210, width: 220, height: 200 },
            order: 1,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'center', padding: '15px', backgroundColor: '#eef2f9', borderRadius: '8px', whiteSpace: 'pre-line' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Core Feature/Benefit 2: [e.g., Seamless Integration APIs]**\n[Detailed explanation, emphasizing ease of adoption and enterprise readiness.]',
              variant: 'paragraph'
            },
            layout: { x: 290, y: 210, width: 220, height: 200 },
            order: 2,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'center', padding: '15px', backgroundColor: '#eef2f9', borderRadius: '8px', whiteSpace: 'pre-line' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Core Feature/Benefit 3: [e.g., AI-Powered Personalization]**\n[Detailed explanation, highlighting innovation and future growth potential.]',
              variant: 'paragraph'
            },
            layout: { x: 540, y: 210, width: 220, height: 200 },
            order: 3,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'center', padding: '15px', backgroundColor: '#eef2f9', borderRadius: '8px', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'This combination of features provides a comprehensive and defensible solution, poised for rapid market adoption and expansion.',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 440, width: 680, height: 60 },
            order: 4,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center', fontStyle: 'italic', color: '#4A5568' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'business-model' as SectionType,
        title: 'Refined Business Model & Unit Economics',
        order: 5,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our primary revenue is generated through [e.g., SaaS subscriptions, transaction fees, licensing]. We offer [e.g., tiered pricing plans] tailored to different customer segments.',
              variant: 'paragraph' 
            },
            layout: { x: 60, y: 100, width: 680, height: 100 },
            order: 0,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', marginBottom: '30px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Pricing & LTV:**\nAverage Revenue Per User (ARPU): $[X]\nCustomer Lifetime Value (LTV): $[Y]\nKey Pricing Tiers: [Briefly describe tiers]',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 230, width: 330, height: 150 }, 
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**CAC & Margins:**\nCustomer Acquisition Cost (CAC): $[Z]\nLTV:CAC Ratio: [Ratio, e.g., 3:1 or higher]\nGross Margin: [X]%',
              variant: 'paragraph'
            },
            layout: { x: 410, y: 230, width: 330, height: 150 }, 
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'This model is designed for scalability, with strong unit economics supporting rapid expansion and a clear path to profitability.',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 410, width: 680, height: 60 }, 
            order: 3,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center', fontStyle: 'italic', color: '#4A5568' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'competition' as SectionType,
        title: 'Competitive Moat',
        order: 6,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'The competitive landscape includes [direct competitors, indirect alternatives, and status quo]. While some offer partial solutions, none fully address the core problem with our unique approach and technology.',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 100, width: 680, height: 100 },
            order: 0,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', marginBottom: '30px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Competitor A:** [Brief description of Competitor A and their main offering.]\n**Our Advantage:** [How your solution is superior or different, e.g., better technology, unique feature, stronger IP.]',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 230, width: 330, height: 150 }, 
            order: 1,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line', marginBottom: '20px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Competitor B:** [Brief description of Competitor B and their main offering.]\n**Our Advantage:** [How your solution is superior or different for this competitor.]',
              variant: 'paragraph'
            },
            layout: { x: 410, y: 230, width: 330, height: 150 }, 
            order: 2,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line', marginBottom: '20px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Our Moat:** Our competitive advantage is built on [e.g., proprietary technology, strong network effects, unique data insights, key partnerships, and a superior team].',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 400, width: 680, height: 80 }, 
            order: 3,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center', fontWeight: 'bold', color: '#333333' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'team' as SectionType,
        title: 'Experienced Leadership',
        order: 7,
        components: [
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: { src: 'https://via.placeholder.com/120x120?text=Leader+1', alt: 'Leader 1 Photo' },
            layout: { x: 60, y: 100, width: 120, height: 120 },
            order: 0,
            style: { borderRadius: '50%', objectFit: 'cover' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '[Leader 1 Name]\n[Title, e.g., CEO & Co-founder]',
              variant: 'subheading'
            },
            layout: { x: 200, y: 110, width: 180, height: 60 },
            order: 1,
            style: { fontSize: '18px', fontWeight: 'bold', lineHeight: '1.3', textAlign: 'left' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '[Bio highlighting relevant experience, past successes, and leadership skills. e.g., "Ex-[Previous Company], scaled X to Y."]',
              variant: 'paragraph'
            },
            layout: { x: 200, y: 170, width: 180, height: 120 },
            order: 2,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'left' }
          },
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: { src: 'https://via.placeholder.com/120x120?text=Leader+2', alt: 'Leader 2 Photo' },
            layout: { x: 420, y: 100, width: 120, height: 120 },
            order: 3,
            style: { borderRadius: '50%', objectFit: 'cover' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '[Leader 2 Name]\n[Title, e.g., CTO & Co-founder]',
              variant: 'subheading'
            },
            layout: { x: 560, y: 110, width: 180, height: 60 },
            order: 4,
            style: { fontSize: '18px', fontWeight: 'bold', lineHeight: '1.3', textAlign: 'left' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '[Bio for Leader 2, focusing on technical expertise, product vision, or operational excellence relevant for scaling.]',
              variant: 'paragraph'
            },
            layout: { x: 560, y: 170, width: 180, height: 120 },
            order: 5,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'left' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
                ...(BLOCK_REGISTRY.text.sampleData || {}),
                text: 'Strengthened by key hires in [Function A] and [Function B], and advised by industry veterans from [Advisor Company 1] and [Advisor Company 2].',
                variant: 'paragraph'
            },
            layout: { x: 60, y: 320, width: 680, height: 80 },
            order: 6,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center', color: '#4A5568', marginTop: '20px' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'financials' as SectionType,
        title: 'Financial Performance & Projections',
        order: 8,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our financial performance demonstrates strong execution and market validation, with a clear path to significant scale and profitability.',
              variant: 'subheading'
            },
            layout: { x: 60, y: 80, width: 680, height: 60 },
            order: 0,
            style: { fontSize: '22px', lineHeight: '1.5', textAlign: 'center', marginBottom: '25px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Historical Performance (Key Highlights):**\n• **Year [YYYY-1]:** $[X]M Revenue ([Y]% YoY Growth)\n• **Year [YYYY]:** $[A]M Revenue ([B]% YoY Growth)\n• Key Achievements: [e.g., Reached profitability, Secured X enterprise clients]',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 165, width: 330, height: 180 }, 
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Financial Projections (Next 3 Years):**\n• **Year [YYYY+1]:** $[C]M Revenue (Target)\n• **Year [YYYY+2]:** $[D]M Revenue (Target)\n• **Year [YYYY+3]:** $[E]M Revenue (Target)\n• Key Assumptions: [e.g., Market expansion, New product lines]',
              variant: 'paragraph'
            },
            layout: { x: 410, y: 165, width: 330, height: 180 }, 
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '(Visuals: Include charts for revenue growth, key SaaS metrics like MRR, Churn, LTV/CAC projections. Detailed financial statements in appendix.)',
              variant: 'paragraph' // Using paragraph for consistency, styling as caption
            },
            layout: { x: 60, y: 365, width: 680, height: 60 }, 
            order: 3,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'center', color: '#6c757d', fontStyle: 'italic', marginTop: '15px' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'funding' as SectionType,
        title: 'Series A Ask & Growth Plan',
        order: 9,
        components: [
          { 
            id: generateUUID(),
            type: 'investmentAsk' as BlockType, 
            data: {
              ...(BLOCK_REGISTRY.investmentAsk?.sampleData || {}), 
              amount: "$[Amount, e.g., 5-10]M Series A",
              roundDetails: "Seeking strategic partners to fuel our next phase of growth.",
              equity: "[X-Y]% Preferred Equity",
              termsSummary: "Standard Series A terms, details in data room." 
            },
            layout: { x: 60, y: 100, width: 680, height: 150 }, 
            order: 0,
            style: { /* Assuming 'investmentAsk' component has its own rich styling */ }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Strategic Allocation of Capital:',
              variant: 'subheading'
            },
            layout: { x: 60, y: 280, width: 680, height: 40 }, 
            order: 1,
            style: { fontSize: '22px', fontWeight: 'bold', textAlign: 'left', marginBottom: '15px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '• **Scale Sales & Marketing (X%):** [e.g., Expand sales team, International marketing campaigns, Channel partnerships]\n\n• **Product Development & R&D (Y%):** [e.g., Launch V2 platform, Develop new AI modules, Expand IP portfolio]\n\n• **Team Expansion & Operations (Z%):** [e.g., Key executive hires, Scale customer support, Enhance operational infrastructure]',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 335, width: 640, height: 200 }, 
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.7', textAlign: 'left', whiteSpace: 'pre-line' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'productRoadmap' as SectionType,
        title: 'Future Vision & Product Expansion',
        order: 10,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our roadmap focuses on expanding market reach, enhancing product capabilities, and driving long-term value.',
              variant: 'subheading'
            },
            layout: { x: 60, y: 100, width: 680, height: 60 },
            order: 0,
            style: { fontSize: '22px', lineHeight: '1.5', textAlign: 'center', marginBottom: '30px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Next 12 Months: Scale & Enhance**\n• [Key Initiative 1.1, e.g., Launch Product X in New Verticals]\n• [Key Initiative 1.2, e.g., Achieve Y MAU/ARR]\n• [Key Initiative 1.3, e.g., Strategic Hires in Z department]',
              variant: 'paragraph'
            },
            layout: { x: 40, y: 190, width: 220, height: 220 }, 
            order: 1,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'left', padding: '15px', backgroundColor: '#e6f7ff', borderRadius: '6px', whiteSpace: 'pre-line' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**12-24 Months: Expand & Innovate**\n• [Key Initiative 2.1, e.g., International Expansion to [Region]]\n• [Key Initiative 2.2, e.g., Introduce AI-driven Feature Set Y]\n• [Key Initiative 2.3, e.g., Explore M&A Opportunities]',
              variant: 'paragraph'
            },
            layout: { x: 290, y: 190, width: 220, height: 220 }, 
            order: 2,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'left', padding: '15px', backgroundColor: '#e6f7ff', borderRadius: '6px', whiteSpace: 'pre-line' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Long-Term Vision (24+ Months):**\n• [Key Initiative 3.1, e.g., Become Market Leader in [Specific Niche]]\n• [Key Initiative 3.2, e.g., Platform Ecosystem Development]\n• [Key Initiative 3.3, e.g., IPO / Strategic Exit Considerations]',
              variant: 'paragraph'
            },
            layout: { x: 540, y: 190, width: 220, height: 220 }, 
            order: 3,
            style: { fontSize: '15px', lineHeight: '1.6', textAlign: 'left', padding: '15px', backgroundColor: '#e6f7ff', borderRadius: '6px', whiteSpace: 'pre-line' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'contactUs' as SectionType,
        title: 'Invest in the Future',
        order: 11,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Partner With Us to Shape the Future of [Industry/Market]',
              variant: 'heading'
            },
            layout: { x: 60, y: 120, width: 680, height: 80 },
            order: 0,
            style: { fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', lineHeight: '1.3' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'We are seeking partners who share our vision and are ready to join us on this exciting journey of growth and innovation.\n\nFor inquiries and further discussion:\n\n[Key Contact Person Name]\n[Title]\n[Email Address]\n[Phone Number (Optional)]\n[Company Website]',
              variant: 'paragraph'
            },
            layout: { x: 100, y: 230, width: 600, height: 200 }, 
            order: 1,
            style: { fontSize: '18px', lineHeight: '1.7', textAlign: 'center', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'image' as BlockType, 
            data: { src: 'https://via.placeholder.com/120x60?text=Logo', alt: 'Company Logo' },
            layout: { x: 340, y: 450, width: 120, height: 60 }, 
            order: 2,
            style: { objectFit: 'contain' }
          }
        ]
      }
    ],
  },
};

export default seriesAPitchTemplate;
