import { SlideDefinition } from '../../../types/slide.types';
import IconFeatureBlock from '../../../../components/canvas/blocks/IconFeatureBlock';

const features1: SlideDefinition = {
  id: 'features-1',
  name: 'Key Features',
  description: 'Highlight the most important features of your product',
  component: IconFeatureBlock,
  defaultProps: {
    title: 'Product Features',
    features: [
      { icon: '⚡️', title: 'Fast Setup', description: 'Get started in minutes with minimal configuration.' },
      { icon: '🔒', title: 'Secure by Design', description: 'Built-in encryption and access controls.' },
      { icon: '📈', title: 'Scalable', description: 'Handles growth from startup to enterprise.' }
    ]
  }
};

export default features1;
