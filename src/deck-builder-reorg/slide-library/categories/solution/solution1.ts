import { SlideDefinition } from '../../../types/slide.types';
import ProblemSolutionBlock from '../../../../components/canvas/blocks/ProblemSolutionBlock';

const solution1: SlideDefinition = {
  id: 'solution-1',
  name: 'Solution Overview',
  description: 'Illustrate how your product or service solves the problem',
  component: ProblemSolutionBlock,
  defaultProps: {
    title: 'Our Solution',
    problem: 'Manual, error-prone workflows',
    solution: 'An AI-powered automation platform that streamlines operations',
    benefits: ['Faster execution', 'Reduced errors', 'Scalable processes']
  }
};

export default solution1;
