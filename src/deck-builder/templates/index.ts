import { Template, SectionType, VisualComponent, DeckDataTemplate, Deck, DeckSection } from '../types/index.ts';
// BLOCK_REGISTRY, BlockType, and generateUUID are no longer needed here as SECTION_DEFAULTS is moved
import startupPitchTemplate from './startupPitchTemplate.ts';
import creativePortfolioTemplate from './creativePortfolioTemplate.ts';
import techPitchTemplate from './techPitchTemplate.ts';
import seriesAPitchTemplate from './seriesAPitchTemplate.ts';
import friendsAndFamilyPitchTemplate from './friendsAndFamilyPitchTemplate.ts';
import { theWheelPitchDeckTemplate } from './theWheelPitchDeckTemplate.ts'; // Import the new template
import { SECTION_DEFAULTS } from './defaults.ts'; // Import SECTION_DEFAULTS from the new file

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'vc-pitch-standard',
    name: 'VC Pitch (Standard)',
    description: 'Classic 10-slide format for investor presentations',
    category: 'vc-pitch',
    sections: [
      'hero',
      'problem',
      'solution',
      'market',
      'business-model',
      'competition',
      'team',
      'financials',
      'funding',
      'next-steps'
    ]
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Focus on showcasing your product features and benefits',
    category: 'product-demo',
    sections: [
      'hero',
      'problem',
      'solution',
      'team',
      'next-steps'
    ]
  },
  {
    id: 'market-opportunity',
    name: 'Market Opportunity',
    description: 'Emphasize market size and business opportunity',
    category: 'market-opportunity',
    sections: [
      'hero',
      'market',
      'problem',
      'solution',
      'business-model',
      'financials',
      'next-steps'
    ]
  }
];

// SECTION_DEFAULTS has been moved to defaults.ts

// Export the new populated template
export const POPULATED_DECK_TEMPLATES: DeckDataTemplate[] = [
  // Ensure these are the direct imports of the *enhanced* template files
  startupPitchTemplate, 
  creativePortfolioTemplate,
  techPitchTemplate, // Add the new tech pitch template
  seriesAPitchTemplate, // Add the new Series A pitch template
  friendsAndFamilyPitchTemplate, // Add the new Friends & Family pitch template
  theWheelPitchDeckTemplate, // Add the new Wheel pitch deck template
];

// Re-export types that might be useful for consumers of templates
export type { DeckDataTemplate, Deck, DeckSection, VisualComponent, SectionType, Template };
