import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const interactiveDemoTemplate: DeckDataTemplate = {
  id: 'interactive-demo',
  name: 'Interactive Demo',
  description: 'A template for an interactive product demonstration.',
  category: 'Product',
  deck: {
    id: 'deck-interactive-demo',
    title: 'Interactive Demo',
    sections: [
      {
        id: 'section-demo',
        type: 'interactiveDemo',
        title: 'Interactive Demo',
        components: SECTION_DEFAULTS.interactiveDemo.components,
        order: 0,
      },
      {
        id: 'section-feedback',
        type: 'text',
        title: 'Feedback',
        components: SECTION_DEFAULTS.text.components,
        order: 1,
      },
    ],
    theme: {
      id: 'theme-interactive-demo',
      name: 'Interactive Demo',
      colors: {
        primary: '#FF4081',
        secondary: '#536DFE',
        accent: '#FFC107',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#FCE4EC',
      },
      fonts: {
        heading: 'Roboto, sans-serif',
        body: 'Roboto, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default interactiveDemoTemplate;
