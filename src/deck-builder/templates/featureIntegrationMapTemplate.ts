import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const featureIntegrationMapTemplate: DeckDataTemplate = {
  id: 'feature-integration-map',
  name: 'Feature Integration Map',
  description: 'A template to show how your features integrate with other tools and platforms.',
  category: 'Product',
  deck: {
    id: 'deck-feature-integration-map',
    title: 'Feature Integration Map',
    sections: [
      {
        id: 'section-feature-comparison',
        type: 'featureComparison',
        title: 'Feature Integration Map',
        components: SECTION_DEFAULTS.featureComparison.components,
        order: 0,
      },
      {
        id: 'section-cta',
        type: 'ctaCard',
        title: 'Call to Action',
        components: SECTION_DEFAULTS.ctaCard.components,
        order: 1,
      },
    ],
    theme: {
      id: 'theme-integration-map',
      name: 'Integration Map',
      colors: {
        primary: '#4CAF50',
        secondary: '#FF9800',
        accent: '#E91E63',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#F1F8E9',
      },
      fonts: {
        heading: 'Roboto Condensed, sans-serif',
        body: 'Roboto, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default featureIntegrationMapTemplate;
