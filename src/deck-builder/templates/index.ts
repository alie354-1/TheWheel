import { Template, SectionType } from '../types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'vc-pitch-standard',
    name: 'VC Pitch (Standard)',
    description: 'Classic 10-slide format for investor presentations',
    category: 'vc-pitch',
    sections: [
      'hero',
      'problem',
      'solution',
      'market',
      'business-model',
      'competition',
      'team',
      'financials',
      'funding',
      'next-steps'
    ]
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Focus on showcasing your product features and benefits',
    category: 'product-demo',
    sections: [
      'hero',
      'problem',
      'solution',
      'team',
      'next-steps'
    ]
  },
  {
    id: 'market-opportunity',
    name: 'Market Opportunity',
    description: 'Emphasize market size and business opportunity',
    category: 'market-opportunity',
    sections: [
      'hero',
      'market',
      'problem',
      'solution',
      'business-model',
      'financials',
      'next-steps'
    ]
  }
];

export const SECTION_DEFAULTS: Record<SectionType, { title: string; content: Record<string, any> }> = {
  'hero': {
    title: 'Company Overview',
    content: {
      headline: 'Your Company Name',
      tagline: 'One-line description of what you do',
      logo: null
    }
  },
  'problem': {
    title: 'Problem',
    content: {
      headline: 'The Problem We\'re Solving',
      description: 'Describe the pain point your target customers face',
      painPoints: ['Pain point 1', 'Pain point 2', 'Pain point 3']
    }
  },
  'solution': {
    title: 'Solution',
    content: {
      headline: 'Our Solution',
      description: 'How you solve the problem better than anyone else',
      keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3']
    }
  },
  'market': {
    title: 'Market Size',
    content: {
      headline: 'Market Opportunity',
      tam: '$X billion Total Addressable Market',
      sam: '$X billion Serviceable Addressable Market',
      som: '$X billion Serviceable Obtainable Market'
    }
  },
  'business-model': {
    title: 'Business Model',
    content: {
      headline: 'How We Make Money',
      revenueStreams: ['Revenue stream 1', 'Revenue stream 2'],
      pricing: 'Pricing strategy overview'
    }
  },
  'competition': {
    title: 'Competition',
    content: {
      headline: 'Competitive Landscape',
      competitors: ['Competitor 1', 'Competitor 2', 'Competitor 3'],
      advantage: 'Our competitive advantage'
    }
  },
  'team': {
    title: 'Team',
    content: {
      headline: 'Meet the Team',
      members: [
        { name: 'Founder Name', role: 'CEO', bio: 'Brief background' }
      ]
    }
  },
  'financials': {
    title: 'Financials',
    content: {
      headline: 'Financial Projections',
      revenue: 'Revenue projections',
      metrics: 'Key metrics and traction'
    }
  },
  'funding': {
    title: 'Funding',
    content: {
      headline: 'Funding Ask',
      amount: '$X million',
      useOfFunds: ['Use 1 (X%)', 'Use 2 (Y%)', 'Use 3 (Z%)']
    }
  },
  'next-steps': {
    title: 'Next Steps',
    content: {
      headline: 'What\'s Next',
      callToAction: 'Contact us to learn more',
      contact: 'your.email@company.com'
    }
  }
};
