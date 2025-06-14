import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const productFeaturesTemplate: DeckDataTemplate = {
  id: 'product-features',
  name: 'Product Features',
  description: 'A template to showcase the key features of your product.',
  category: 'Product',
  deck: {
    id: 'deck-product-features',
    title: 'Product Features',
    sections: [
      {
        id: 'section-features',
        type: 'featureShowcase',
        title: 'Key Features',
        components: SECTION_DEFAULTS.featureShowcase.components,
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
      id: 'theme-product-features',
      name: 'Product Features',
      colors: {
        primary: '#03A9F4',
        secondary: '#FF5722',
        accent: '#4CAF50',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#E1F5FE',
      },
      fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Lato, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default productFeaturesTemplate;
