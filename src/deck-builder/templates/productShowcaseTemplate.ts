import { DeckDataTemplate, SectionType } from '../types/index.ts';
import { SECTION_DEFAULTS } from './defaults.ts';

const productShowcaseTemplate: DeckDataTemplate = {
  id: 'product-showcase',
  name: 'Product Showcase',
  description: 'A template to showcase your product with images and descriptions.',
  category: 'Product',
  deck: {
    id: 'deck-product-showcase',
    title: 'Product Showcase',
    sections: [
      {
        id: 'section-hero',
        type: 'hero',
        title: 'Product Showcase',
        components: SECTION_DEFAULTS.hero.components,
        order: 0,
      },
      {
        id: 'section-gallery',
        type: 'image',
        title: 'Gallery',
        components: SECTION_DEFAULTS.image.components,
        order: 1,
      },
      {
        id: 'section-cta',
        type: 'ctaCard',
        title: 'Call to Action',
        components: SECTION_DEFAULTS.ctaCard.components,
        order: 2,
      },
    ],
    theme: {
      id: 'theme-product-showcase',
      name: 'Product Showcase',
      colors: {
        primary: '#673AB7',
        secondary: '#FFEB3B',
        accent: '#00BCD4',
        background: '#FFFFFF',
        text: '#212121',
        slideBackground: '#EDE7F6',
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Raleway, sans-serif',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export default productShowcaseTemplate;
