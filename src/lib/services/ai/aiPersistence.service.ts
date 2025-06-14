import { supabase } from '../../utils/supabaseClient';
import { 
  AIRecommendation, 
  AIPeerInsight, 
  AIBusinessHealth 
} from './aiDashboard.service';

/**
 * AI Persistence Service
 * Handles caching and persistence of AI-generated data
 */
export class AIPersistenceService {
  // Table names
  private readonly RECOMMENDATIONS_TABLE = 'ai_generated_recommendations';
  private readonly INSIGHTS_TABLE = 'ai_generated_insights';
  private readonly HEALTH_TABLE = 'ai_business_health_summaries';
  
  /**
   * Store recommendations for a company journey
   */
  public async storeRecommendations(companyJourneyId: string, recommendations: AIRecommendation[]): Promise<void> {
    try {
      // Get the company ID from the journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('company_journeys_new')
        .select('company_id')
        .eq('id', companyJourneyId)
        .single();
        
      if (journeyError || !journeyData) {
        console.error('Error fetching company journey:', journeyError);
        return;
      }
      
      // First, remove old recommendations
      await supabase
        .from(this.RECOMMENDATIONS_TABLE)
        .delete()
        .eq('company_id', journeyData.company_id);
      
      // Then insert new ones
      const { error } = await supabase
        .from(this.RECOMMENDATIONS_TABLE)
        .insert(
          recommendations.map(rec => ({
            company_id: journeyData.company_id,
            content: {
              id: rec.id,
              title: rec.title,
              description: rec.description,
              domain: rec.domain,
              priority: rec.priority,
              reason: rec.reason,
              peerPercentage: rec.peerPercentage,
              estimatedTime: rec.estimatedTime,
              difficulty: rec.difficulty,
              tools: rec.tools
            },
            context_hash: 'initial-context-' + Date.now(), // Simplified for now
            status: 'fresh',
            generation_model: 'gpt-4',
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
          }))
        );
      
      if (error) {
        console.error('Error storing recommendations:', error);
      }
    } catch (error) {
      console.error('Error in storeRecommendations:', error);
    }
  }
  
  /**
   * Get cached recommendations for a company journey
   */
  public async getRecommendations(companyJourneyId: string): Promise<AIRecommendation[]> {
    try {
      let companyId = null;
      
      try {
        // Get the company ID from the journey
        const { data: journeyData, error: journeyError } = await supabase
          .from('company_journeys_new')
          .select('company_id')
          .eq('id', companyJourneyId)
          .single();
          
        if (!journeyError && journeyData) {
          companyId = journeyData.company_id;
        }
      } catch (innerError) {
        console.error('Failed to fetch company journey:', innerError);
        // Continue with mock data
      }
      
      // If we have a valid company ID, try to fetch from database
      if (companyId) {
        const now = new Date().toISOString();
        
        try {
          const { data, error } = await supabase
            .from(this.RECOMMENDATIONS_TABLE)
            .select('*')
            .eq('company_id', companyId)
            .gt('expires_at', now);
            
          if (!error && data && data.length > 0) {
            // Convert from DB format to AIRecommendation format
            return data.map(item => ({
              id: item.content.id,
              title: item.content.title,
              description: item.content.description,
              domain: item.content.domain,
              priority: item.content.priority,
              reason: item.content.reason,
              peerPercentage: item.content.peerPercentage,
              estimatedTime: item.content.estimatedTime,
              difficulty: item.content.difficulty,
              tools: item.content.tools
            }));
          }
        } catch (dbError) {
          console.error('Error fetching recommendations:', dbError);
          // Fall through to mock data
        }
      }
      
      // Return mock data if database fetch failed or returned no results
      return [
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
        }
      ];
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return [];
    }
  }
  
  /**
   * Store peer insights for a company journey
   */
  public async storePeerInsights(companyJourneyId: string, insights: AIPeerInsight[]): Promise<void> {
    try {
      // Get the company ID from the journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('company_journeys_new')
        .select('company_id')
        .eq('id', companyJourneyId)
        .single();
        
      if (journeyError || !journeyData) {
        console.error('Error fetching company journey:', journeyError);
        return;
      }
      
      // First, remove old insights
      await supabase
        .from(this.INSIGHTS_TABLE)
        .delete()
        .eq('company_id', journeyData.company_id);
      
      // Then insert new ones
      const { error } = await supabase
        .from(this.INSIGHTS_TABLE)
        .insert(
          insights.map(insight => ({
            company_id: journeyData.company_id,
            content: insight.content,
            author_profile: {
              name: insight.authorName,
              company: insight.authorCompany,
              initials: insight.authorInitials
            },
            context_hash: 'initial-context-' + Date.now(), // Simplified for now
            relevance_score: 0.8, // Default value
            generation_model: 'gpt-4',
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days expiry
          }))
        );
      
      if (error) {
        console.error('Error storing insights:', error);
      }
    } catch (error) {
      console.error('Error in storePeerInsights:', error);
    }
  }
  
  /**
   * Get cached peer insights for a company journey
   */
  public async getPeerInsights(companyJourneyId: string): Promise<AIPeerInsight[]> {
    try {
      let companyId = null;
      
      try {
        // Get the company ID from the journey
        const { data: journeyData, error: journeyError } = await supabase
          .from('company_journeys_new')
          .select('company_id')
          .eq('id', companyJourneyId)
          .single();
          
        if (!journeyError && journeyData) {
          companyId = journeyData.company_id;
        }
      } catch (innerError) {
        console.error('Failed to fetch company journey:', innerError);
        // Continue with mock data
      }
      
      // If we have a valid company ID, try to fetch from database
      if (companyId) {
        const now = new Date().toISOString();
        
        try {
          const { data, error } = await supabase
            .from(this.INSIGHTS_TABLE)
            .select('*')
            .eq('company_id', companyId)
            .gt('expires_at', now);
            
          if (!error && data && data.length > 0) {
            // Convert from DB format to AIPeerInsight format
            return data.map(item => ({
              id: item.id,
              content: item.content,
              authorName: item.author_profile?.name || 'Anonymous',
              authorCompany: item.author_profile?.company || 'Unknown Company',
              authorInitials: item.author_profile?.initials || 'XX',
              date: new Date(item.generated_at).toLocaleDateString(),
              relevantDomain: 'General' // Default value since we don't have this in the DB schema
            }));
          }
        } catch (dbError) {
          console.error('Error fetching insights:', dbError);
          // Fall through to mock data
        }
      }
      
      // Return mock data if database fetch failed or returned no results
      return [
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
    } catch (error) {
      console.error('Error in getPeerInsights:', error);
      return [];
    }
  }
  
  /**
   * Store business health assessment for a company journey
   */
  public async storeBusinessHealth(companyJourneyId: string, health: AIBusinessHealth): Promise<void> {
    try {
      // Get the company ID from the journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('company_journeys_new')
        .select('company_id')
        .eq('id', companyJourneyId)
        .single();
        
      if (journeyError || !journeyData) {
        console.error('Error fetching company journey:', journeyError);
        return;
      }
      
      // First, remove old assessment
      await supabase
        .from(this.HEALTH_TABLE)
        .delete()
        .eq('company_id', journeyData.company_id);
      
      // Then insert new one
      const { error } = await supabase
        .from(this.HEALTH_TABLE)
        .insert({
          company_id: journeyData.company_id,
          content: {
            overall: health.overall,
            domainInsights: health.domainInsights
          },
          context_hash: 'initial-context-' + Date.now(), // Simplified for now
          generation_model: 'gpt-4',
          generated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
        });
      
      if (error) {
        console.error('Error storing business health:', error);
      }
    } catch (error) {
      console.error('Error in storeBusinessHealth:', error);
    }
  }
  
  /**
   * Get cached business health assessment for a company journey
   */
  public async getBusinessHealth(companyJourneyId: string): Promise<AIBusinessHealth | null> {
    try {
      let companyId = null;
      
      try {
        // Get the company ID from the journey
        const { data: journeyData, error: journeyError } = await supabase
          .from('company_journeys_new')
          .select('company_id')
          .eq('id', companyJourneyId)
          .single();
          
        if (!journeyError && journeyData) {
          companyId = journeyData.company_id;
        }
      } catch (innerError) {
        console.error('Failed to fetch company journey:', innerError);
        // Continue with mock data
      }
      
      // If we have a valid company ID, try to fetch from database
      if (companyId) {
        const now = new Date().toISOString();
        
        try {
          const { data, error } = await supabase
            .from(this.HEALTH_TABLE)
            .select('*')
            .eq('company_id', companyId)
            .gt('expires_at', now)
            .limit(1)
            .single();
            
          if (!error && data) {
            // Convert from DB format to AIBusinessHealth format
            return {
              overall: data.content.overall,
              domainInsights: data.content.domainInsights
            };
          }
        } catch (dbError) {
          console.error('Error fetching business health:', dbError);
          // Fall through to mock data
        }
      }
      
      // Return mock data if database fetch failed or returned no results
      return {
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
    } catch (error) {
      console.error('Error in getBusinessHealth:', error);
      return null;
    }
  }
}
