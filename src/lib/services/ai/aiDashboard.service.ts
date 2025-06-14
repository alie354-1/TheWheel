import { supabase } from '../../utils/supabaseClient';
import { ContextCollectorService } from './contextCollector.service';
import { AIPersistenceService } from './aiPersistence.service';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  domain: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  peerPercentage: number;
  estimatedTime: string;
  difficulty: string;
  tools: string[];
}

export interface AIPeerInsight {
  id: string;
  content: string;
  authorName: string;
  authorCompany: string;
  authorInitials: string;
  date: string;
  relevantDomain: string;
}

export interface AIBusinessHealth {
  overall: 'Healthy' | 'Needs Attention' | 'Critical';
  domainInsights: {
    domain: string;
    status: string;
    maturityLevel: number;
    strengths: string[];
    focusAreas: string[];
    description: string;
    timeInvested: string;
    stepsEngaged: number;
    isActiveFocus: boolean;
  }[];
}

/**
 * AI Dashboard Service
 * Responsible for generating AI-powered content for the dashboard
 */
export class AIDashboardService {
  private contextCollector: ContextCollectorService;
  private persistenceService: AIPersistenceService;

  constructor() {
    this.contextCollector = new ContextCollectorService();
    this.persistenceService = new AIPersistenceService();
  }

  /**
   * Get recommended next steps for the company journey
   */
  public async getRecommendedSteps(companyJourneyId: string, limit: number = 4, forceRefresh: boolean = false): Promise<AIRecommendation[]> {
    // Always get fresh recommendations when the dashboard loads
    // This ensures we're pulling from the canonical steps based on current company state
    if (!forceRefresh) {
      forceRefresh = true; // Force refresh to always get latest recommendations
    }
    
    // Check cache only if explicitly requested (which we're not doing anymore)
    const cachedRecommendations = await this.persistenceService.getRecommendations(companyJourneyId);
    
    if (cachedRecommendations.length > 0 && !forceRefresh) {
      return cachedRecommendations.slice(0, limit);
    }
    
    try {
      // Generate new recommendations based on company context and progress
      const companyContext = await this.contextCollector.collectCompanyContext(companyJourneyId);
      
      // Get all available framework steps
      const { data: frameworkSteps, error: stepsError } = await supabase
        .from('journey_framework_steps_new')
        .select(`
          id,
          name,
          description,
          primary_domain_id,
          primary_phase_id,
          difficulty,
          estimated_days,
          recommended_tools,
          journey_domains_new:primary_domain_id (id, name),
          journey_phases_new:primary_phase_id (id, name)
        `);
      
      if (stepsError) {
        console.error('Error fetching framework steps:', stepsError);
        throw stepsError;
      }
      
      // Get company's current steps
      const { data: companySteps, error: companyStepsError } = await supabase
        .from('company_journey_steps_new')
        .select(`
          id,
          canonical_step_id,
          status,
          started_at,
          completed_at
        `)
        .eq('journey_id', companyJourneyId);
      
      if (companyStepsError) {
        console.error('Error fetching company steps:', companyStepsError);
        throw companyStepsError;
      }
      
      // Get company information
      const { data: companyJourney, error: companyError } = await supabase
        .from('company_journeys_new')
        .select(`
          id,
          company_id,
          companies (
            id,
            name,
            industry,
            size,
            stage
          )
        `)
        .eq('id', companyJourneyId)
        .single();
      
      if (companyError) {
        console.error('Error fetching company information:', companyError);
        throw companyError;
      }
      
      // Extract completed and in-progress step IDs
      const completedStepIds = companySteps
        ?.filter(step => step.status === 'completed')
        .map(step => step.canonical_step_id) || [];
      
      const inProgressStepIds = companySteps
        ?.filter(step => ['active', 'in_progress'].includes(step.status))
        .map(step => step.canonical_step_id) || [];
      
      // Filter out steps that are already completed or in progress
      const availableSteps = frameworkSteps?.filter(step => 
        !completedStepIds.includes(step.id) && 
        !inProgressStepIds.includes(step.id)
      ) || [];
      
      // Determine next best steps based on company context and available steps
      // In a real implementation, this would use an AI model to rank steps
      // For now, we'll use a simple algorithm based on domain progression
      
      // Get domains the company has worked on
      const activeDomainIds = new Set<string>();
      companySteps?.forEach(step => {
        const frameworkStep = frameworkSteps?.find(fs => fs.id === step.canonical_step_id);
        if (frameworkStep?.primary_domain_id) {
          activeDomainIds.add(frameworkStep.primary_domain_id);
        }
      });
      
      // Score each available step
      const scoredSteps = availableSteps.map(step => {
        let score = 0;
        
        // Prefer steps in domains the company is already working on
        if (activeDomainIds.has(step.primary_domain_id)) {
          score += 30;
        }
        
        // Prefer easier steps
        if (step.difficulty === 'Low') {
          score += 20;
        } else if (step.difficulty === 'Medium') {
          score += 10;
        }
        
        // Prefer steps with shorter estimated time
        if (step.estimated_days && step.estimated_days <= 3) {
          score += 15;
        } else if (step.estimated_days && step.estimated_days <= 7) {
          score += 10;
        }
        
        return {
          step,
          score
        };
      });
      
      // Sort by score (descending)
      scoredSteps.sort((a, b) => b.score - a.score);
      
      // Take top N steps
      const topSteps = scoredSteps.slice(0, limit);
      
      // Convert to AIRecommendation format
      const recommendations: AIRecommendation[] = topSteps.map(({ step }) => {
        // Parse recommended tools if it's a string
        let tools: string[] = [];
        if (typeof step.recommended_tools === 'string') {
          try {
            tools = JSON.parse(step.recommended_tools.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
          } catch (e) {
            console.error('Error parsing recommended_tools:', e);
          }
        } else if (Array.isArray(step.recommended_tools)) {
          tools = step.recommended_tools;
        }
        
        // Calculate peer percentage (would be from real data in production)
        const peerPercentage = Math.floor(Math.random() * 40) + 60; // 60-99%
        
        return {
          id: step.id, // Use the actual canonical step ID
          title: step.name,
          description: step.description || '',
          domain: step.journey_domains_new && typeof step.journey_domains_new === 'object' ? (step.journey_domains_new as any).name : 'General',
          priority: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
          reason: `Based on your progress in ${step.journey_domains_new && typeof step.journey_domains_new === 'object' ? (step.journey_domains_new as any).name : 'your journey'}`,
          peerPercentage,
          estimatedTime: step.estimated_days ? 
            (step.estimated_days <= 3 ? `${step.estimated_days} days` : 
             step.estimated_days <= 7 ? `1 week` : 
             `${Math.ceil(step.estimated_days / 7)} weeks`) : 
            '1-2 weeks',
          difficulty: step.difficulty || 'Medium',
          tools
        };
      });
      
      // Store recommendations for future use
      await this.persistenceService.storeRecommendations(companyJourneyId, recommendations);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback to sample data if there's an error
      const fallbackRecommendations: AIRecommendation[] = [
        {
          id: 'rec-1',
          title: 'Create User Personas',
          description: 'Create detailed profiles of your target users to better understand their needs and pain points.',
          domain: 'Product',
          priority: 'High',
          reason: 'Based on your progress in customer discovery',
          peerPercentage: 86,
          estimatedTime: '3-5 days',
          difficulty: 'Medium',
          tools: ['Miro', 'Figma', 'UXPressia']
        },
        {
          id: 'rec-2',
          title: 'Build MVP Prototype',
          description: 'Develop a minimal viable product to start validating your core features with real users.',
          domain: 'Development',
          priority: 'Medium',
          reason: 'Required for early user testing and validation',
          peerPercentage: 64,
          estimatedTime: '1-3 weeks',
          difficulty: 'High',
          tools: ['Figma', 'InVision', 'Adobe XD']
        },
        {
          id: 'rec-3',
          title: 'Create Financial Model',
          description: 'Build a comprehensive financial model to forecast your business growth and cash requirements.',
          domain: 'Finance',
          priority: 'Medium',
          reason: 'Critical for your business model and fundraising',
          peerPercentage: 53,
          estimatedTime: '1-2 weeks',
          difficulty: 'Medium',
          tools: ['Excel', 'Google Sheets', 'Causal']
        },
        {
          id: 'rec-4',
          title: 'Competitive Analysis',
          description: 'Research and document key competitors to identify market opportunities and threats.',
          domain: 'Research',
          priority: 'High',
          reason: 'Will help refine your value proposition',
          peerPercentage: 72,
          estimatedTime: '1 week',
          difficulty: 'Medium',
          tools: ['Google', 'Crunchbase', 'SimilarWeb']
        }
      ];
      
      // Store fallback recommendations
      await this.persistenceService.storeRecommendations(companyJourneyId, fallbackRecommendations);
      
      return fallbackRecommendations.slice(0, limit);
    }
  }

  /**
   * Get peer insights for the company journey
   */
  public async getPeerInsights(companyJourneyId: string, limit: number = 3, forceRefresh: boolean = false): Promise<AIPeerInsight[]> {
    // Check for cached insights
    const cachedInsights = await this.persistenceService.getPeerInsights(companyJourneyId);
    
    if (cachedInsights.length > 0 && !forceRefresh) {
      return cachedInsights.slice(0, limit);
    }
    
    // Generate new insights if needed
    const companyContext = await this.contextCollector.collectCompanyContext(companyJourneyId);
    
    // Sample data - would be AI-generated in production
    const insights: AIPeerInsight[] = [
      {
        id: 'insight-1',
        content: 'We found customer interviews critical to pivot our product focus early. This saved us months of development in the wrong direction.',
        authorName: 'Sarah Kim',
        authorCompany: 'Fintech Startup',
        authorInitials: 'SK',
        date: '1 week ago',
        relevantDomain: 'Product'
      },
      {
        id: 'insight-2',
        content: 'Setting up analytics from day one helped us identify which features were most valuable to users and which we could delay building.',
        authorName: 'Mark Johnson',
        authorCompany: 'DataFlow',
        authorInitials: 'MJ',
        date: '2 weeks ago',
        relevantDomain: 'Analytics'
      },
      {
        id: 'insight-3',
        content: 'Our competitive analysis revealed an underserved niche that became our initial target market. Always look for gaps competitors are missing.',
        authorName: 'Alex Chen',
        authorCompany: 'Quantum',
        authorInitials: 'AC',
        date: '3 weeks ago',
        relevantDomain: 'Research'
      }
    ];
    
    // Store insights for future use
    await this.persistenceService.storePeerInsights(companyJourneyId, insights);
    
    return insights.slice(0, limit);
  }

  /**
   * Get business health assessment
   */
  public async getBusinessHealth(companyJourneyId: string, forceRefresh: boolean = false): Promise<AIBusinessHealth> {
    // Check for cached health assessment
    const cachedHealth = await this.persistenceService.getBusinessHealth(companyJourneyId);
    
    if (cachedHealth && !forceRefresh) {
      return cachedHealth;
    }
    
    // Generate new health assessment if needed
    const companyContext = await this.contextCollector.collectCompanyContext(companyJourneyId);
    
    // Sample data - would be AI-generated in production
    const healthAssessment: AIBusinessHealth = {
      overall: 'Healthy',
      domainInsights: [
        {
          domain: 'Product Development',
          status: 'On Track',
          maturityLevel: 3,
          strengths: [
            'Strong product-market fit indicators',
            'Clear user problem definition'
          ],
          focusAreas: [
            'Customer validation needs more data',
            'Feature prioritization not finalized'
          ],
          description: 'Your product development is progressing well with good initial validation.',
          timeInvested: '14 days',
          stepsEngaged: 5,
          isActiveFocus: true
        },
        {
          domain: 'Market Research',
          status: 'On Track',
          maturityLevel: 4,
          strengths: [
            'Clear value proposition articulated',
            'Target market well-defined'
          ],
          focusAreas: [
            'Competitor analysis could be deeper'
          ],
          description: 'Your market research is thorough and provides a solid foundation.',
          timeInvested: '21 days',
          stepsEngaged: 7,
          isActiveFocus: false
        },
        {
          domain: 'Funding Strategy',
          status: 'Needs Attention',
          maturityLevel: 2,
          strengths: [
            'Initial budget planning completed'
          ],
          focusAreas: [
            'Financial projections are incomplete',
            'Fundraising strategy not defined'
          ],
          description: 'Your funding strategy requires more attention to support growth plans.',
          timeInvested: '8 days',
          stepsEngaged: 3,
          isActiveFocus: false
        }
      ]
    };
    
    // Store health assessment for future use
    await this.persistenceService.storeBusinessHealth(companyJourneyId, healthAssessment);
    
    return healthAssessment;
  }
}

// Singleton instance
export const aiDashboardService = new AIDashboardService();
