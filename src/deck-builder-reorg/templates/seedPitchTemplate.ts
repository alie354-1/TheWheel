import { DeckDataTemplate, SectionType, BlockType, VisualComponent } from '../types';
import { SECTION_DEFAULTS } from './defaults';
import { generateUUID } from '../utils/uuid';
import { BLOCK_REGISTRY } from '../types/blocks';

const seedPitchTemplate: DeckDataTemplate = {
  id: 'seed-pitch-v1',
  name: 'Seed Stage Pitch',
  description: 'A concise template for early-stage seed funding rounds, focusing on vision, team, and MVP.',
  category: 'VC Pitch',
  thumbnailUrl: 'https://via.placeholder.com/300x200?text=Seed+Pitch', // Placeholder
  deck: {
    id: generateUUID(),
    title: 'Seed Investment Opportunity: [Your Company Name]',
    user_id: '', 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: [
      {
        id: generateUUID(),
        type: 'hero' as SectionType,
        title: 'The Big Vision: [Your Company Name]',
        order: 0,
        components: [
          { 
            id: generateUUID(),
            type: 'image' as BlockType, // Assuming 'image' type exists in BlockType
            data: { 
              src: 'https://via.placeholder.com/150x80?text=Your+Logo', 
              alt: 'Company Logo' 
            },
            layout: { x: 325, y: 100, width: 150, height: 80 }, // Centered, above title
            order: 0,
            style: { objectFit: 'contain' } // Ensures logo scales nicely
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: '[Your Company Name]: [Your Compelling One-Liner Vision]', 
              variant: 'heading' 
            },
            layout: { x: 50, y: 210, width: 700, height: 120 }, // Adjusted y, estimated height for larger text
            order: 1,
            style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.2' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'Solving [Specific Problem] for [Target Audience] with [Unique Solution/Approach].', 
              variant: 'subheading' 
            },
            layout: { x: 100, y: 350, width: 600, height: 90 }, // Adjusted y, narrower width, estimated height
            order: 2,
            style: { fontSize: '22px', textAlign: 'center', color: '#4A5568', lineHeight: '1.5' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'problem' as SectionType,
        title: 'The Problem We Solve',
        order: 1,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'The Current Challenge: [Clearly state the primary problem]',
              variant: 'subheading'
            },
            layout: { x: 60, y: 100, width: 680, height: 60 },
            order: 0,
            style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**1. Pain Point:** [Describe the first major pain point for the target audience. Be specific and relatable.]',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 190, width: 640, height: 80 },
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**2. Existing Inefficiencies:** [Describe why current solutions are inadequate or what gaps exist.]',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 290, width: 640, height: 80 },
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'solution' as SectionType,
        title: 'Our Unique Solution & MVP',
        order: 2,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our innovative solution, [Product/Service Name], directly addresses the identified problems by offering [brief explanation of how it works and key differentiators].',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 100, width: 680, height: 80 },
            order: 0,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', marginBottom: '25px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '• **Key Benefit 1:** [Describe compelling benefit]\n\n• **Key Benefit 2:** [Describe compelling benefit]\n\n• **Key Benefit 3:** [Describe compelling benefit]',
              variant: 'paragraph' 
            },
            layout: { x: 80, y: 205, width: 640, height: 150 }, // y = 100 (prev y) + 80 (prev height) + 25 (prev margin)
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.7', textAlign: 'left', marginBottom: '25px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Minimum Viable Product (MVP) highlights: [Key MVP Feature 1], [Key MVP Feature 2]. Current status: [e.g., Live with X users, In Beta].',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 380, width: 680, height: 100 }, // y = 205 (prev y) + 150 (prev height) + 25 (prev margin)
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.5', backgroundColor: '#e9f5ff', padding: '15px', borderRadius: '6px', color: '#333' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'market' as SectionType,
        title: 'Target Market & Early Traction',
        order: 3,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our target market is the [description of market segment] segment, estimated at [market size, e.g., $X Billion]. We are initially focusing on [specific niche or early adopters].',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 100, width: 680, height: 100 },
            order: 0,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px' }
          },
          { 
            id: generateUUID(),
            type: 'tractionWidget' as BlockType, // Assuming this type exists in BlockType
            data: {
              ...(BLOCK_REGISTRY.tractionWidget?.sampleData || {}),
              title: 'Early Traction Highlights',
              metrics: [
                { label: 'Sign-ups / Beta Users', value: '[Number]', trend: 'up' },
                { label: 'Key Pilot Program', value: '[Name of Partner/Program]', details: '[Brief outcome or status]' },
                { label: 'Waitlist Size', value: '[Number]', trend: 'neutral' }
              ]
            },
            layout: { x: 60, y: 220, width: 680, height: 200 }, // y = 100 (prev y) + 100 (prev height) + 20 (prev margin)
            order: 1,
            style: { /* Add any necessary wrapper styles for tractionWidget if needed */ }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'team' as SectionType,
        title: 'The Founding Team',
        order: 4,
        components: [
          // Founder 1
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: { src: 'https://via.placeholder.com/120x120?text=Founder+1', alt: 'Founder 1 Photo' },
            layout: { x: 60, y: 100, width: 120, height: 120 },
            order: 0,
            style: { borderRadius: '50%', objectFit: 'cover' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '[Founder 1 Name]\n[Title/Role]',
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
              text: '[Brief bio for Founder 1, highlighting key expertise and experience relevant to the venture.]',
              variant: 'paragraph'
            },
            layout: { x: 200, y: 170, width: 180, height: 100 },
            order: 2,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'left' }
          },
          // Founder 2
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: { src: 'https://via.placeholder.com/120x120?text=Founder+2', alt: 'Founder 2 Photo' },
            layout: { x: 420, y: 100, width: 120, height: 120 },
            order: 3,
            style: { borderRadius: '50%', objectFit: 'cover' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '[Founder 2 Name]\n[Title/Role]',
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
              text: '[Brief bio for Founder 2, highlighting key expertise and experience relevant to the venture.]',
              variant: 'paragraph'
            },
            layout: { x: 560, y: 170, width: 180, height: 100 },
            order: 5,
            style: { fontSize: '14px', lineHeight: '1.5', textAlign: 'left' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
                ...(BLOCK_REGISTRY.text.sampleData || {}),
                text: 'Our team combines [strength A] and [strength B] to uniquely tackle this challenge. We are supported by [mention key advisors if any].',
                variant: 'paragraph'
            },
            layout: { x: 60, y: 300, width: 680, height: 60 },
            order: 6,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center', fontStyle: 'italic', color: '#4A5568' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'funding' as SectionType,
        title: 'Seed Funding Ask & Use of Funds',
        order: 5,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Seeking: $[Amount] Seed Funding',
              variant: 'heading'
            },
            layout: { x: 60, y: 100, width: 680, height: 80 },
            order: 0,
            style: { fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: '40px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Allocation of Funds:',
              variant: 'subheading'
            },
            layout: { x: 60, y: 220, width: 680, height: 40 }, // y = 100 + 80 + 40
            order: 1,
            style: { fontSize: '22px', fontWeight: 'bold', textAlign: 'left', marginBottom: '15px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '• **Product Development (X%):** [Specifics, e.g., Finalize MVP, Add key features]\n\n• **Marketing & Sales (Y%):** [Specifics, e.g., Launch campaigns, Build sales team]\n\n• **Operations (Z%):** [Specifics, e.g., Key hires, Infrastructure]',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 275, width: 640, height: 180 }, // y = 220 + 40 + 15
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.8', textAlign: 'left' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'productRoadmap' as SectionType,
        title: '6-12 Month Roadmap',
        order: 6,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Our 6-12 Month Execution Plan',
              variant: 'subheading'
            },
            layout: { x: 60, y: 100, width: 680, height: 60 },
            order: 0,
            style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Phase 1 (Months 1-3):** [Key Objective, e.g., Launch Beta, Secure Pilot Customers]\n  - [Key Result 1]\n  - [Key Result 2]',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 190, width: 640, height: 100 },
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px', whiteSpace: 'pre-line' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**Phase 2 (Months 4-6):** [Key Objective, e.g., Achieve X Users, Iterate based on Feedback]\n  - [Key Result 1]\n  - [Key Result 2]',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 310, width: 640, height: 100 },
            order: 2,
            style: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px', whiteSpace: 'pre-line' }
          }
          // Consider adding a Phase 3 for a 12-month view if appropriate
        ]
      },
      {
        id: generateUUID(),
        type: 'contactUs' as SectionType,
        title: 'Join Us',
        order: 7,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Let\'s Build the Future Together',
              variant: 'heading'
            },
            layout: { x: 60, y: 120, width: 680, height: 70 },
            order: 0,
            style: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'We are excited about the opportunity to discuss how we can partner to make [Your Company Vision] a reality.\n\n[Your Name]\n[Your Title]\n[Your Email]\n[Your Phone (Optional)]\n[Website]',
              variant: 'paragraph'
            },
            layout: { x: 150, y: 220, width: 500, height: 180 },
            order: 1,
            style: { fontSize: '18px', lineHeight: '1.7', textAlign: 'center', whiteSpace: 'pre-line' }
          },
          { 
            id: generateUUID(),
            type: 'image' as BlockType, // Assuming 'image' type exists
            data: { src: 'https://via.placeholder.com/100x50?text=Logo', alt: 'Company Logo Small' },
            layout: { x: 350, y: 420, width: 100, height: 50 },
            order: 2,
            style: { objectFit: 'contain' }
          }
        ]
      }
    ],
  },
};

export default seedPitchTemplate;
