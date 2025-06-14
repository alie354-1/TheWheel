import { SlideDefinition } from '../../../types/slide.types';
import MetricCounterBlock from '../../../../components/canvas/blocks/MetricCounterBlock';

const financials1: SlideDefinition = {
  id: 'financials-1',
  name: 'Financial Highlights',
  description: 'Showcase key financial metrics and growth indicators',
  component: MetricCounterBlock,
  defaultProps: {
    title: 'Financial Highlights',
    metrics: [
      { label: 'ARR', value: '$1.2M', description: 'Annual Recurring Revenue' },
      { label: 'MoM Growth', value: '15%', description: 'Month-over-month revenue growth' },
      { label: 'Burn Rate', value: '$80K', description: 'Monthly net cash outflow' }
    ]
  }
};

export default financials1;
