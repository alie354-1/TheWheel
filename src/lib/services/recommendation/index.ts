/**
 * Recommendation Service
 * 
 * Provides personalized recommendations for journey steps, including:
 * - Expert recommendations
 * - Template recommendations
 * - Peer insights
 */

// Expert recommendation types
export interface ExpertRecommendation {
  expertId: string;
  name?: string;
  specialization?: string[];
  successRate: number; // 0-1 scale
  relevanceScore: number; // 0-1 scale
  avgCompletionTime?: string; // e.g. "3 days"
  pricePoint?: number; // hourly rate
  availability?: string; // e.g. "Next available: June 15"
}

// Template recommendation types
export interface TemplateRecommendation {
  templateId: string;
  name?: string;
  description?: string;
  type: 'deck' | 'document' | 'tool';
  relevanceScore: number; // 0-1 scale
  usageRate: number; // number of times used
  previewUrl?: string;
}

// Peer insight types
export interface PeerInsight {
  relevanceScore: number; // 0-1 scale
  avgTimeToComplete?: string; // e.g. "14 days"
  commonBlockers?: string[];
  successStrategies?: string[];
  outcomeMetrics?: any[]; // e.g. [{metric: "Conversion Rate", value: "3.2%"}]
}

// Combined recommendations for a step
export interface StepRecommendations {
  stepId: string;
  companyId: string;
  expertRecommendations: ExpertRecommendation[];
  templateRecommendations: TemplateRecommendation[];
  peerInsights: PeerInsight;
}

// Mock implementation for demo purposes
class RecommendationService {
  /**
   * Get personalized recommendations for a specific journey step
   */
  async getStepRecommendations(companyId: string, stepId: string): Promise<StepRecommendations> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      stepId,
      companyId,
      expertRecommendations: [
        {
          expertId: 'expert-1',
          name: 'Sarah Johnson',
          specialization: ['MVP Development', 'Product Strategy'],
          successRate: 0.92,
          relevanceScore: 0.95,
          avgCompletionTime: '18 days',
          pricePoint: 150,
          availability: 'Available next week'
        },
        {
          expertId: 'expert-2',
          name: 'Michael Chen',
          specialization: ['Technical MVP', 'Agile Development'],
          successRate: 0.88,
          relevanceScore: 0.87,
          avgCompletionTime: '21 days',
          pricePoint: 125,
          availability: 'Available tomorrow'
        },
        {
          expertId: 'expert-3',
          name: 'Priya Patel',
          specialization: ['Product Management', 'User Testing'],
          successRate: 0.85,
          relevanceScore: 0.82,
          avgCompletionTime: '24 days',
          pricePoint: 110,
          availability: 'Available this week'
        }
      ],
      templateRecommendations: [
        {
          templateId: 'template-1',
          name: 'MVP Feature Prioritization Matrix',
          description: 'Prioritize your MVP features based on impact vs. effort to ensure you are building the right things first.',
          type: 'document',
          relevanceScore: 0.95,
          usageRate: 1243
        },
        {
          templateId: 'template-2',
          name: 'Technical MVP Specification',
          description: 'A structured template for documenting your MVP technical requirements and architecture.',
          type: 'document',
          relevanceScore: 0.87,
          usageRate: 876
        },
        {
          templateId: 'template-3',
          name: 'MVP Pitch Deck',
          description: 'Present your MVP to potential users, investors, or partners with this focused pitch deck template.',
          type: 'deck',
          relevanceScore: 0.75,
          usageRate: 654
        }
      ],
      peerInsights: {
        relevanceScore: 0.85,
        avgTimeToComplete: '23 days',
        commonBlockers: [
          'Feature creep - adding too many features to the initial MVP',
          'Technical debt from rushing implementation',
          'Lack of clear success metrics for the MVP'
        ],
        successStrategies: [
          'Focus on solving one core problem extremely well',
          'Get a working prototype in front of users within 2 weeks',
          'Use off-the-shelf components where possible instead of building custom',
          'Define clear success metrics before starting development'
        ],
        outcomeMetrics: [
          { metric: 'User Acquisition Cost', value: '$32' },
          { metric: 'Conversion Rate', value: '3.8%' },
          { metric: 'Time to First Paying Customer', value: '45 days' }
        ]
      }
    };
  }

  /**
   * Get recommendations for experts across all journey steps
   */
  async getExpertRecommendations(companyId: string): Promise<ExpertRecommendation[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        expertId: 'expert-1',
        name: 'Sarah Johnson',
        specialization: ['MVP Development', 'Product Strategy'],
        successRate: 0.92,
        relevanceScore: 0.95
      },
      {
        expertId: 'expert-2',
        name: 'Michael Chen',
        specialization: ['Technical MVP', 'Agile Development'],
        successRate: 0.88,
        relevanceScore: 0.87
      },
      {
        expertId: 'expert-4',
        name: 'David Wilson',
        specialization: ['Go-to-Market Strategy', 'Customer Development'],
        successRate: 0.91,
        relevanceScore: 0.82
      },
      {
        expertId: 'expert-5',
        name: 'Elena Rodriguez',
        specialization: ['Fundraising', 'Pitch Coaching'],
        successRate: 0.94,
        relevanceScore: 0.79
      }
    ];
  }

  /**
   * Get recommendations for templates across all journey steps
   */
  async getTemplateRecommendations(companyId: string): Promise<TemplateRecommendation[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        templateId: 'template-1',
        name: 'MVP Feature Prioritization Matrix',
        type: 'document',
        relevanceScore: 0.95,
        usageRate: 1243
      },
      {
        templateId: 'template-3',
        name: 'MVP Pitch Deck',
        type: 'deck',
        relevanceScore: 0.87,
        usageRate: 876
      },
      {
        templateId: 'template-6',
        name: 'Customer Interview Script',
        type: 'document',
        relevanceScore: 0.82,
        usageRate: 1087
      },
      {
        templateId: 'template-8',
        name: 'Financial Projection Tool',
        type: 'tool',
        relevanceScore: 0.78,
        usageRate: 932
      }
    ];
  }
}

export const recommendationService = new RecommendationService();
