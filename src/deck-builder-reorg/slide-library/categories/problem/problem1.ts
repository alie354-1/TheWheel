import { SlideDefinition } from '../../../types/slide.types';
import ProblemSolutionBlock from '../../../../components/canvas/blocks/ProblemSolutionBlock';

const problem1: SlideDefinition = {
  id: 'problem-1',
  name: 'Problem Slide - Clear Pain Point',
  description: 'Highlights the core problem your target audience faces.',
  category: 'problem',
  component: ProblemSolutionBlock,
  defaultProps: {
    problemStatement: 'Small businesses struggle to manage cash flow effectively.',
    supportingDetails: 'Lack of real-time insights and fragmented tools lead to poor financial decisions.'
  }
};

export default problem1;
