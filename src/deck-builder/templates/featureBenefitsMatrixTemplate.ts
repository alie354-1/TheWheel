import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const featureBenefitsMatrixTemplate: DeckDataTemplate = {
  id: 'feature-benefits-matrix',
  name: 'Feature-Benefits Matrix',
  description: 'A template to map features to their corresponding customer benefits.',
  category: 'Product',
  deck: {
    id: 'deck-feature-benefits-matrix',
    title: 'Feature-Benefits Matrix',
    sections: [
      {
        id: 'section-feature-benefits',
        type: 'featureBenefits',
        title: 'Feature-Benefits Matrix',
        components: SECTION_DEFAULTS.featureBenefits.components,
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
      id: 'theme-benefits-matrix',
      name: 'Benefits Matrix',
      colors: {
        primary: '#2196F3',
        secondary: '#FFC107',
        accent: '#4CAF50',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#E3F2FD',
      },
      fonts: {
        heading: 'Oswald, sans-serif',
        body: 'Open Sans, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default featureBenefitsMatrixTemplate;
