import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const featureDeepDiveTemplate: DeckDataTemplate = {
  id: 'feature-deep-dive',
  name: 'Feature Deep Dive',
  description: 'A template for a detailed explanation of a single feature.',
  category: 'Product',
  deck: {
    id: 'deck-feature-deep-dive',
    title: 'Feature Deep Dive',
    sections: [
      {
        id: 'section-feature-overview',
        type: 'featureDeepDive',
        title: 'Feature Overview',
        components: SECTION_DEFAULTS.featureDeepDive.components,
        order: 0,
      },
      {
        id: 'section-technical-details',
        type: 'text',
        title: 'Technical Details',
        components: SECTION_DEFAULTS.text.components,
        order: 1,
      },
    ],
    theme: {
      id: 'theme-feature-deep-dive',
      name: 'Feature Deep Dive',
      colors: {
        primary: '#3F51B5',
        secondary: '#FF9800',
        accent: '#8BC34A',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#E8EAF6',
      },
      fonts: {
        heading: 'Lato, sans-serif',
        body: 'Roboto, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default featureDeepDiveTemplate;
