import { DeckDataTemplate, VisualComponent, BlockType, DeckTheme, DeckSection, SectionType } from '../types';
import { generateUUID } from '../utils/uuid';
import { BLOCK_REGISTRY } from '../types/blocks';

const artisticFlowTheme: DeckTheme = {
  id: 'creative-flow-theme-01',
  name: 'Artistic Flow',
  colors: {
    primary: '#3A3A3A', // Dark Charcoal
    secondary: '#607D8B', // Blue Grey
    accent: '#FFC107', // Amber
    background: '#ECEFF1', // Light Grey Blue
    text: '#212121', // Near Black
    slideBackground: '#FFFFFF', // White
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Lato', sans-serif",
    caption: "'Lato', sans-serif",
  },
};

const creativePortfolioTemplate: DeckDataTemplate = {
  id: 'creative-portfolio-enhanced-v1', // Unique ID for this template
  name: 'Enhanced Creative Portfolio',
  description: 'A visually-driven template for artists and designers, enhanced with richer components and placeholders.',
  thumbnailUrl: 'https://placehold.co/300x200.png/607D8B/FFFFFF?text=Creative+Portfolio',
  category: 'Portfolio',
  deck: {
    id: generateUUID(),
    title: 'My Creative Portfolio',
    user_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    theme: artisticFlowTheme,
    sections: [
      // Section 1: Cover Page
      {
        id: generateUUID(),
        title: 'Cover Page',
        type: 'hero' as SectionType,
        order: 0,
        components: [
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: {
              src: 'https://placehold.co/900x600.png/3A3A3A/FFFFFF?text=Full+Bleed+Hero+Image',
              alt: 'Abstract creative background',
            },
            layout: { x: 0, y: 0, width: 900, height: 600 },
            style: { objectFit: 'cover', filter: 'brightness(0.7)' },
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              text: '[Your Name / Brand]',
              variant: 'heading',
              level: 1,
            },
            layout: { x: 50, y: 240, width: 800, height: 70 },
            style: {
              fontSize: '60px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: artisticFlowTheme.colors.slideBackground,
              textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
            },
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              text: '[Your Title / Creative Discipline e.g., Visual Artist & Designer]',
              variant: 'subheading',
              level: 2,
            },
            layout: { x: 50, y: 320, width: 800, height: 40 },
            style: {
              fontSize: '28px',
              textAlign: 'center',
              color: artisticFlowTheme.colors.accent,
              fontStyle: 'italic',
              textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
            },
          },
        ] as VisualComponent[],
        slideStyle: { backgroundColor: artisticFlowTheme.colors.primary },
      },
      // Section 2: About Me
      {
        id: generateUUID(),
        title: 'About Me',
        type: 'problemSolution' as SectionType, // Using this for a structured intro
        order: 1,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { text: 'My Creative Journey', variant: 'heading', level: 2 },
            layout: { x: 50, y: 40, width: 800, height: 50 },
            style: { fontSize: '40px', fontWeight: 'bold', color: artisticFlowTheme.colors.primary, textAlign: 'left' },
          },
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: { src: 'https://placehold.co/200x200.png/607D8B/FFFFFF?text=Your+Photo', alt: 'Profile photo' },
            layout: { x: 50, y: 120, width: 200, height: 200 },
            style: { borderRadius: '50%', objectFit: 'cover', border: `3px solid ${artisticFlowTheme.colors.accent}` },
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: {
              text: "A passionate and innovative [Your Profession] with a knack for creating compelling visual narratives. My work focuses on [Your Specialization/Interest e.g., minimalist design and impactful branding]. I believe in the power of design to communicate, inspire, and solve complex problems. This portfolio showcases my dedication to craft and creative exploration.",
              variant: 'paragraph',
            },
            layout: { x: 280, y: 120, width: 570, height: 200 },
            style: { fontSize: '17px', color: artisticFlowTheme.colors.text, lineHeight: '1.6' },
          },
          {
            id: generateUUID(),
            type: 'list' as BlockType,
            layout: { x: 50, y: 350, width: 800, height: 180 },
            data: {
              items: [
                'Expertise: [Skill 1, e.g., Brand Identity], [Skill 2, e.g., Web Design], [Skill 3, e.g., Illustration]',
                'Tools: [Tool 1, e.g., Adobe Creative Suite], [Tool 2, e.g., Figma], [Tool 3, e.g., Procreate]',
                'Philosophy: "[Your concise creative philosophy or motto]"'
              ],
              ordered: false
            },
            style: { fontSize: '16px', color: artisticFlowTheme.colors.secondary, lineHeight: '1.6', backgroundColor: artisticFlowTheme.colors.background, padding: '15px', borderRadius: '8px' }
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: artisticFlowTheme.colors.slideBackground },
      },
      // Section 3: Featured Work 1
      {
        id: generateUUID(),
        title: 'Featured Work 1',
        type: 'demoGallery' as SectionType,
        order: 2,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { text: 'Project Title 1: [Name of Your Project]', variant: 'heading', level: 3 },
            layout: { x: 50, y: 30, width: 800, height: 40 },
            style: { fontSize: '32px', fontWeight: '600', color: artisticFlowTheme.colors.primary, textAlign: 'left' },
          },
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: { src: 'https://placehold.co/700x400.png/FFC107/3A3A3A?text=Project+Showcase+1', alt: 'Featured Work 1' },
            layout: { x: 50, y: 90, width: 700, height: 400 },
            style: { objectFit: 'contain', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.15)' },
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { text: 'Brief description of the project, its goals, and your role. Highlight key achievements or techniques used. What was the client\'s problem and how did your work solve it?', variant: 'caption' },
            layout: { x: 50, y: 510, width: 700, height: 60 },
            style: { fontSize: '15px', color: artisticFlowTheme.colors.secondary, textAlign: 'center', fontStyle: 'italic' },
          },
        ] as VisualComponent[],
        slideStyle: { backgroundColor: artisticFlowTheme.colors.slideBackground },
      },
      // Section 4: Contact
      {
        id: generateUUID(),
        title: 'Contact',
        type: 'ctaCard' as SectionType,
        order: 3,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { text: "Let's Create Together", variant: 'heading', level: 2 },
            layout: { x: 50, y: 120, width: 800, height: 60 },
            style: { fontSize: '48px', fontWeight: 'bold', color: artisticFlowTheme.colors.primary, textAlign: 'center' },
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { text: "Available for collaborations, commissions, and exciting new projects. I'd love to hear about your vision and how we can bring it to life.", variant: 'paragraph' },
            layout: { x: 50, y: 200, width: 800, height: 60 },
            style: { fontSize: '20px', color: artisticFlowTheme.colors.text, textAlign: 'center', lineHeight: '1.5' },
          },
          {
            id: generateUUID(),
            type: 'button' as BlockType,
            data: { label: "your.email@example.com", url: "mailto:your.email@example.com" },
            layout: { x: 300, y: 300, width: 300, height: 55 },
            style: {
              backgroundColor: artisticFlowTheme.colors.accent,
              color: artisticFlowTheme.colors.text,
              fontSize: '18px',
              borderRadius: '30px',
              padding: '15px 30px',
              fontWeight: 'bold',
              border: 'none',
              boxShadow: '0 5px 10px rgba(0,0,0,0.15)',
            },
          },
          {
            id: generateUUID(),
            type: 'logoWall',
            layout: { x: 325, y: 380, width: 250, height: 50 },
            data: {
              logos: [
                { src: 'https://placehold.co/40x40.png/607D8B/FFFFFF?text=LI', alt: 'LinkedIn', url: '#' },
                { src: 'https://placehold.co/40x40.png/607D8B/FFFFFF?text=IG', alt: 'Instagram', url: '#' },
                { src: 'https://placehold.co/40x40.png/607D8B/FFFFFF?text=BH', alt: 'Behance', url: '#' },
              ]
            },
            style: { justifyContent: 'center', gap: '25px' }
          }
        ] as VisualComponent[],
        slideStyle: { backgroundColor: artisticFlowTheme.colors.background },
      }
    ] as DeckSection[],
  }
};

export default creativePortfolioTemplate;
