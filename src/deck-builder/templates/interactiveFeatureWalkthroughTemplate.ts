import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const interactiveFeatureWalkthroughTemplate: DeckDataTemplate = {
  id: 'interactive-feature-walkthrough',
  name: 'Interactive Feature Walkthrough',
  description: 'A template for an interactive walkthrough of a feature.',
  category: 'Product',
  deck: {
    id: 'deck-interactive-feature-walkthrough',
    title: 'Interactive Feature Walkthrough',
    sections: [
      {
        id: 'section-walkthrough',
        type: 'interactiveDemo',
        title: 'Walkthrough',
        components: SECTION_DEFAULTS.interactiveDemo.components,
        order: 0,
      },
      {
        id: 'section-q-and-a',
        type: 'text',
        title: 'Q&A',
        components: SECTION_DEFAULTS.text.components,
        order: 1,
      },
    ],
    theme: {
      id: 'theme-interactive-feature-walkthrough',
      name: 'Interactive Feature Walkthrough',
      colors: {
        primary: '#009688',
        secondary: '#FFC107',
        accent: '#795548',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#E0F2F1',
      },
      fonts: {
        heading: 'Merriweather, serif',
        body: 'Open Sans, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default interactiveFeatureWalkthroughTemplate;
