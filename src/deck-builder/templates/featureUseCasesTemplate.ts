import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const featureUseCasesTemplate: DeckDataTemplate = {
  id: 'feature-use-cases',
  name: 'Feature Use Cases',
  description: 'A template to illustrate various use cases for a feature.',
  category: 'Product',
  deck: {
    id: 'deck-feature-use-cases',
    title: 'Feature Use Cases',
    sections: [
      {
        id: 'section-use-case-1',
        type: 'featureShowcase',
        title: 'Use Case 1',
        components: SECTION_DEFAULTS.featureShowcase.components,
        order: 0,
      },
      {
        id: 'section-use-case-2',
        type: 'featureShowcase',
        title: 'Use Case 2',
        components: SECTION_DEFAULTS.featureShowcase.components,
        order: 1,
      },
    ],
    theme: {
      id: 'theme-feature-use-cases',
      name: 'Feature Use Cases',
      colors: {
        primary: '#4CAF50',
        secondary: '#FFEB3B',
        accent: '#FF5722',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#F1F8E9',
      },
      fonts: {
        heading: 'Oswald, sans-serif',
        body: 'Roboto, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default featureUseCasesTemplate;
