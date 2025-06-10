import { DeckDataTemplate, SectionType, BlockType, VisualComponent } from '../types/index.ts'; 
import { SECTION_DEFAULTS } from './defaults.ts'; 
import { generateUUID } from '../utils/uuid.ts';

const techPitchTemplate: DeckDataTemplate = {
  id: 'tech-pitch-v1',
  name: 'Tech-Focused Pitch',
  description: 'A template for showcasing technology, architecture, and technical advantages.',
  category: 'Technical',
  thumbnailUrl: 'https://via.placeholder.com/300x200?text=Tech+Pitch', // Placeholder
  deck: {
    id: generateUUID(),
    title: 'Innovative Tech Solution Pitch',
    user_id: '', // Will be set by useDeck or service
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Potentially a tech-specific theme could be defined and referenced here
    // theme: techTheme, 
    sections: [
      {
        id: generateUUID(),
        type: 'hero' as SectionType,
        title: 'Revolutionizing [Industry] with [Technology]',
        order: 0,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              text: 'Revolutionizing [Industry] with [Groundbreaking Technology]', 
              variant: 'heading' 
            },
            layout: { x: 50, y: 100, width: 700, height: 120 },
            order: 0,
            style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              text: 'Our unique approach to [problem domain] delivers unparalleled performance and scalability.', 
              variant: 'subheading' 
            },
            layout: { x: 50, y: 230, width: 700, height: 60 },
            order: 1,
            style: { fontSize: '22px', textAlign: 'center', color: '#4A5568' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'problem' as SectionType,
        title: 'The Technical Challenge',
        order: 1,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              text: 'Current solutions for [problem domain] suffer from [limitation 1, limitation 2, limitation 3]. This results in [negative impact].', 
              variant: 'paragraph' 
            },
            layout: { x: 50, y: 50, width: 700, height: 150 },
            order: 0,
            style: { fontSize: '18px' }
          },
          {
            id: generateUUID(),
            type: 'image' as BlockType,
            data: {
              src: 'https://via.placeholder.com/600x300?text=Diagram+of+Current+Limitations',
              alt: 'Current Limitations Diagram'
            },
            layout: {x: 100, y: 220, width: 600, height: 300},
            order: 1,
            style: {}
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'solution' as SectionType,
        title: 'Our Innovative Technology',
        order: 2,
        components: [
          {
            id: generateUUID(),
            type: 'text' as BlockType,
            data: { 
              text: 'Our [Technology Name] leverages [key innovation 1] and [key innovation 2] to overcome these challenges.', 
              variant: 'paragraph' 
            },
            layout: { x: 50, y: 50, width: 700, height: 100 },
            order: 0,
            style: { fontSize: '18px' }
          },
          {
            id: generateUUID(),
            type: 'text' as BlockType, // Placeholder for architecture diagram
            data: { 
              text: '[Architecture Diagram: Showcasing core components and data flow. Consider using an Image block or a specialized diagram block if available.]', 
              variant: 'paragraph' 
            },
            layout: { x: 50, y: 160, width: 700, height: 200 },
            order: 1,
            style: { fontSize: '16px', fontStyle: 'italic', textAlign: 'center', border: '1px dashed #cbd5e0', padding: '20px' }
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'demoGallery' as SectionType,
        title: 'Technology in Action',
        order: 3,
        components: (SECTION_DEFAULTS['demoGallery']?.components || []).map((c: VisualComponent) => ({...c, id: generateUUID()})) // Use default and regenerate IDs
      },
      {
        id: generateUUID(),
        type: 'keyMetricsDashboard' as SectionType,
        title: 'Performance & Scalability',
        order: 4,
        components: [
          ...(SECTION_DEFAULTS['keyMetricsDashboard']?.components || []).map((c: VisualComponent) => ({...c, id: generateUUID()})),
          { // Add a specific tech metric
            id: generateUUID(),
            type: 'tractionWidget' as BlockType,
            data: { 
              metrics: [
                { label: "Processing Speed", value: "10x Faster", trend: "up" },
                { label: "Data Throughput", value: "5 Gbps", trend: "up" },
                { label: "Latency", value: "<50ms", trend: "down" }
              ]
            },
            layout: { x: 50, y: 320, width: 700, height: 150 }, // Adjust layout as needed
            order: (SECTION_DEFAULTS['keyMetricsDashboard']?.components.length || 0) + 1,
            style: {}
          }
        ]
      },
      {
        id: generateUUID(),
        type: 'productRoadmap' as SectionType,
        title: 'Technology Roadmap',
        order: 5,
        components: (SECTION_DEFAULTS['productRoadmap']?.components || []).map((c: VisualComponent) => ({...c, id: generateUUID()}))
      },
      {
        id: generateUUID(),
        type: 'team' as SectionType,
        title: 'Our Engineering Team',
        order: 6,
        components: (SECTION_DEFAULTS['team']?.components || []).map((c: VisualComponent) => ({...c, id: generateUUID()})) // Customize with tech lead bios
      },
      {
        id: generateUUID(),
        type: 'next-steps' as SectionType,
        title: 'Next Steps & Collaboration',
        order: 7,
        components: [
          {
            id: generateUUID(),
            type: 'ctaCard' as BlockType,
            data: {
              text: "Let's discuss a pilot program or technical deep-dive.",
              buttonLabel: "Schedule Technical Call",
              buttonUrl: "#"
            },
            layout: { x: 200, y: 150, width: 400, height: 150 },
            order: 0,
            style: { textAlign: 'center' }
          }
        ]
      }
    ],
  },
};

export default techPitchTemplate;
