import { SlideDefinition } from '../../../types/slide.types';
import HeroImageBlock from '../../../../components/canvas/blocks/HeroImageBlock';

const hero1: SlideDefinition = {
  id: 'hero-1',
  name: 'Hero Slide - Bold Intro',
  description: 'A strong visual opening slide with a headline and background image.',
  category: 'hero',
  component: HeroImageBlock,
  defaultProps: {
    headline: 'Revolutionizing the Future',
    subheadline: 'Our mission is to transform how businesses operate',
    backgroundImageUrl: '/images/hero-default.jpg'
  }
};

export default hero1;
