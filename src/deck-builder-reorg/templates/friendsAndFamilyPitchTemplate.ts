import { DeckDataTemplate, SectionType, BlockType, VisualComponent } from '../types';
import { SECTION_DEFAULTS } from './defaults';
import { generateUUID } from '../utils/uuid';
import { BLOCK_REGISTRY } from '../types/blocks';

const friendsAndFamilyPitchTemplate: DeckDataTemplate = {
  id: 'friends-family-pitch-v1',
  name: 'Friends & Family Pitch',
  description: 'A personal and straightforward template for seeking early support from your network.',
  category: 'Personal', // Or 'Early Stage'
  thumbnailUrl: 'https://via.placeholder.com/300x200?text=Friends+%26+Family', // Placeholder
  deck: {
    id: generateUUID(),
    title: 'Help Us Build [Your Project/Company Name]',
    user_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: [
      {
        id: generateUUID(),
        type: 'hero' as SectionType,
        title: 'Our Story & Why We\'re Doing This',
        order: 0,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'Our Journey to [Your Project/Company Name]', 
              variant: 'heading' 
            },
            layout: { x: 50, y: 100, width: 700, height: 80 },
            order: 0,
            style: { fontSize: '40px', fontWeight: 'bold', textAlign: 'center' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'A personal message about our passion and the inspiration behind this venture. We believe we can make a difference in [area of impact].', 
              variant: 'paragraph' 
            },
            layout: { x: 50, y: 200, width: 700, height: 120 },
            order: 1,
            style: { fontSize: '18px', textAlign: 'center', color: '#333' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'problem' as SectionType,
        title: 'The Problem We\'re Passionate About',
        order: 1,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Have you ever noticed how [relatable problem/frustration]? We have too, and it affects [who it affects] by [how it affects them].',
              variant: 'subheading' 
            },
            layout: { x: 60, y: 100, width: 680, height: 120 },
            order: 0,
            style: { fontSize: '24px', lineHeight: '1.5', textAlign: 'center', marginBottom: '25px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'For example, [give a specific, easy-to-understand example of the problem in action]. This isn\'t just an inconvenience; it\'s a real challenge for many.',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 245, width: 640, height: 100 }, 
            order: 1,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px' }
          },
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'We believe solving this can make a big difference by [positive outcome of solving it].',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 365, width: 640, height: 80 }, 
            order: 2,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'center', fontStyle: 'italic', color: '#4A5568' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'solution' as SectionType,
        title: 'Our Idea & Early Progress',
        order: 2,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Describe your innovative solution and how it directly addresses the problem.',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 120, width: 680, height: 60 }, 
            order: 0,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', marginBottom: '20px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              // Using explicit bullet characters and newlines for better control if markdown list isn't styled well by default
              text: '• Key Feature 1: How it solves a core pain point.\n\n• Key Feature 2: Unique selling proposition.\n\n• Key Feature 3: Demonstrable benefit to the user.',
              variant: 'paragraph' // Using paragraph, assuming text renderer handles newlines
            },
            // Adjust layout based on typical slide dimensions and content.
            // x: 80 for indentation of bullets, y: needs to be after the paragraph.
            // Since y positioning is absolute, this is tricky without knowing paragraph height.
            // For now, let's assume a starting y and ensure height is numeric.
            // A better approach would be a layout system that flows elements.
            // y: 120 (start of prev) + 60 (height of prev) + 20 (marginBottom) = 200
            layout: { x: 80, y: 200, width: 640, height: 120 }, 
            order: 1,
            style: { fontSize: '16px', lineHeight: '1.7', textAlign: 'left' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'team' as SectionType,
        title: 'Why Us? Our Commitment',
        order: 3,
        components: [
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'We are [Your Name(s)], and we\'re deeply committed to solving [the problem] because [your personal connection or motivation].',
              variant: 'subheading' 
            },
            layout: { x: 60, y: 100, width: 680, height: 100 },
            order: 0,
            style: { fontSize: '22px', lineHeight: '1.5', textAlign: 'center', marginBottom: '30px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: '**[Founder 1 Name]:** [Briefly, your role or key skill, e.g., "The Idea Person," "The Builder," "Passionate about X"]. My goal is to [personal goal related to the project].',
              variant: 'paragraph'
            },
            layout: { x: 80, y: 230, width: 640, height: 100 }, 
            order: 1,
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'left', backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '6px', marginBottom: '20px' }
          },
          // Add another block here for a second founder if applicable, adjusting layout.y of the next block
          { 
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Together, we\'re putting our hearts and minds into making this a success, and your support means the world to us.',
              variant: 'paragraph'
            },
            layout: { x: 60, y: 350, width: 680, height: 80 }, // Adjust y if more founder blocks are added
            order: 2, 
            style: { fontSize: '18px', lineHeight: '1.6', textAlign: 'center', fontStyle: 'italic', color: '#333333' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'funding' as SectionType,
        title: 'How You Can Help Us Get Started',
        order: 4,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'We\'re seeking [Amount, e.g., $10,000 - $50,000] to [Key Milestones, e.g., build the first version, initial marketing].', 
              variant: 'heading' 
            },
            layout: { x: 50, y: 80, width: 700, height: 80 },
            order: 0,
            style: { fontSize: '28px', fontWeight: 'bold', textAlign: 'center' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              ...(BLOCK_REGISTRY.text.sampleData || {}), 
              text: 'Your support will be instrumental in helping us [achieve specific goal]. We\'re offering [simple terms, e.g., convertible note, SAFE, or just support].', 
              variant: 'paragraph' 
            },
            layout: { x: 50, y: 180, width: 700, height: 100 },
            order: 1,
            style: { fontSize: '18px', textAlign: 'center' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'next-steps' as SectionType,
        title: 'Join Our Journey / Thank You',
        order: 5,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: "Thank you for believing in us and our vision. We'd love for you to be a part of this journey.",
              variant: 'paragraph'
            },
            layout: { x: 50, y: 100, width: 700, height: 100 },
            order: 0,
            style: { fontSize: '20px', textAlign: 'center' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.text.sampleData || {}),
              text: 'Email: your-email@example.com\nPhone: (555) 555-5555\nWebsite: your-website.com',
              variant: 'paragraph'
            },
            layout: { x: 150, y: 220, width: 500, height: 100 },
            order: 1,
            style: { fontSize: '16px', textAlign: 'center', whiteSpace: 'pre-line' }
          },
          {
            id: generateUUID(),
            type: 'ctaCard' as BlockType,
            data: {
              ...(BLOCK_REGISTRY.ctaCard.sampleData || {}),
              text: 'Support Our Dream!',
              buttonLabel: 'Learn More / Contribute',
              buttonUrl: '#' // Placeholder for a link or contact
            },
            layout: { x: 250, y: 340, width: 300, height: 100 },
            order: 2,
            style: { textAlign: 'center' }
          }
        ]
      }
    ],
  },
};

export default friendsAndFamilyPitchTemplate;
