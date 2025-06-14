import { supabase } from '../../../lib/supabase';
import { 
  NewAdaptiveSuggestion, 
  NewCompanyJourneyStep, 
  NewPeerInsight,
  NewDomainProgress,
  NewStepOutcome,
  NewAnonymizedOutcome
} from '../../types/new_journey.types';

/**
 * Service for handling journey features like outcome capturing,
 * adaptive suggestions, and community insights.
 */
export const newJourneyFeaturesService = {
  /**
   * Capture outcome data for a completed step
   */
  async captureOutcome(outcomeData: Omit<NewStepOutcome, 'id' | 'created_at'>): Promise<NewStepOutcome> {
    const { data, error } = await supabase
      .from('journey_step_outcomes')
      .insert(outcomeData)
      .select('*')
      .single();

    if (error) throw new Error(`Error capturing outcome: ${error.message}`);
    return data;
  },

  /**
   * Get adaptive suggestions based on an outcome
   */
  async getAdaptiveSuggestions(outcomeId: string): Promise<NewAdaptiveSuggestion[]> {
    const { data, error } = await supabase
      .from('journey_ai_recommendations')
      .select('*')
      .eq('related_step_id', outcomeId)
      .order('confidence_score', { ascending: false });

    if (error) throw new Error(`Error fetching adaptive suggestions: ${error.message}`);
    return data || [];
  },

  /**
   * Contribute anonymized outcome to the community
   */
  async contributeToCommmunity(contributionData: Omit<NewAnonymizedOutcome, 'id' | 'created_at'>): Promise<NewAnonymizedOutcome> {
    const { data, error } = await supabase
      .from('journey_anonymized_insights')
      .insert({
        ...contributionData,
        success_level: contributionData.success_level || 0
      })
      .select('*')
      .single();

    if (error) throw new Error(`Error contributing to community: ${error.message}`);
    return data;
  },

  /**
   * Process standup bot message
   */
  async processStandupMessage(message: string, companyStepId: string): Promise<any> {
    // This would integrate with a language model in production
    // For now, return a simple mock response
    return {
      extracted_progress: {
        tasks_updated: [
          { task_id: 'mock-task-1', is_completed: true }
        ],
        confidence_score: 0.85
      },
      suggested_actions: [
        { type: 'update_task', task_id: 'mock-task-2', action: 'mark_complete' }
      ]
    };
  },

  /**
   * Get community insights for a specific framework step
   */
  async getCommunityInsights(frameworkStepId: string): Promise<any> {
    const { data, error } = await supabase
      .from('journey_anonymized_insights')
      .select('*')
      .eq('canonical_step_id', frameworkStepId);

    if (error) throw new Error(`Error fetching community insights: ${error.message}`);
    return data || [];
  },

  /**
   * Get recommended next step for a journey
   */
  async getRecommendedNextStep(journeyId: string): Promise<NewCompanyJourneyStep | null> {
    // In a real implementation, this would use AI or algorithms to determine the best next step
    // For now, simply get the first not_started step
    const { data, error } = await supabase
      .from('company_journey_steps_new')
      .select('*, phase:journey_phases_new(*), domain:journey_domains_new(*)')
      .eq('journey_id', journeyId)
      .eq('status', 'not_started')
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error when no rows are returned, which is fine - just return null
      throw new Error(`Error fetching recommended step: ${error.message}`);
    }

    return data || null;
  },

  /**
   * Get peer insights for a journey
   */
  async getPeerInsights(journeyId: string): Promise<NewPeerInsight[]> {
    // In a real implementation, this would fetch insights from a peer insights table
    // For now, return mock data
    return [
      {
        id: '1',
        text: '68% of founders in your industry spend 2 weeks on customer interviews',
        type: 'time',
        percentage: 68,
        source: 'community',
        related_domain_id: 'market-research'
      },
      {
        id: '2',
        text: 'Top tool used by peers: Zoom (83% usage)',
        type: 'tool',
        percentage: 83,
        source: 'community',
        related_step_id: 'customer-interviews'
      },
      {
        id: '3',
        text: 'Common blocker: Getting enough interview candidates',
        type: 'blocker',
        source: 'community',
        related_step_id: 'customer-interviews'
      },
      {
        id: '4',
        text: 'Tip: Prepare 5-7 open-ended questions for better interviews',
        type: 'tip',
        source: 'expert',
        related_step_id: 'customer-interviews'
      }
    ];
  },

  /**
   * Get progress by domain for a journey using the new maturity-based approach
   */
  async getProgressByDomain(journeyId: string): Promise<NewDomainProgress[]> {
    // Don't attempt to fetch if journeyId is empty
    if (!journeyId) {
      console.error('Empty journeyId provided to getProgressByDomain');
      return [];
    }
    
    try {
      // First check if we have domain progress data in the domain progress table
      // Note: This table might not exist yet, so we'll handle the error gracefully
      let domainProgress = null;
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('company_domain_progress_with_domain')
          .select('*')
          .eq('company_journey_id', journeyId);

        if (progressError && progressError.code !== '42P01') {
          // 42P01 is "relation does not exist" error
          throw progressError;
        }
        domainProgress = progressData;
      } catch (error: any) {
        console.log('company_domain_progress_with_domain view not found, using fallback approach');
        domainProgress = null;
      }
      
      // If we have data in the new table, use it
      if (domainProgress && domainProgress.length > 0) {
        return domainProgress.map(progress => {
          const domain = progress.domain as any;
          return {
            domain_id: progress.domain_id,
            domain_name: domain?.name || 'Unknown Domain',
            maturity_level: progress.maturity_level,
            current_state: progress.current_state,
            total_steps_engaged: progress.total_steps_engaged,
            time_invested_days: progress.time_invested_days,
            days_since_last_activity: progress.last_activity_date ? 
              Math.floor((Date.now() - new Date(progress.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)) : 
              undefined,
            team_involvement_level: progress.team_involvement_level,
            color: domain?.color
          };
        });
      }

      // Otherwise, get steps and calculate a more basic version of progress
      const { data: steps, error: stepsError } = await supabase
        .from('company_journey_steps_new')
        .select('domain_id, status, created_at, completed_at, started_at, domain:journey_domains_new(id, name, color)')
        .eq('journey_id', journeyId);

      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
        return [];
      }
      
      if (!steps || steps.length === 0) return [];

    // Group steps by domain and calculate progress metrics
    const domainMap = new Map<string, { 
      domain_id: string; 
      domain_name: string; 
      color?: string;
      total_steps: number; 
      completed_steps: number;
      active_steps: number;
      earliest_activity?: Date;
      latest_activity?: Date;
      total_days_invested: number;
    }>();

    steps.forEach(step => {
      if (!step.domain_id || !step.domain) return;
      
      const domain = step.domain as any;
      const domainId = step.domain_id;
      
      if (!domainMap.has(domainId)) {
        domainMap.set(domainId, {
          domain_id: domainId,
          domain_name: domain.name,
          // Use the color field instead of color_hex
          color: domain.color || '#6366F1', // Default to indigo if color is missing
          total_steps: 0,
          completed_steps: 0,
          active_steps: 0,
          total_days_invested: 0
        });
      }
      
      const domainData = domainMap.get(domainId)!;
      domainData.total_steps++;
      
      if (step.status === 'complete') {
        domainData.completed_steps++;
        
        // Track earliest/latest activity
        if (step.completed_at) {
          const completedDate = new Date(step.completed_at);
          if (!domainData.latest_activity || completedDate > domainData.latest_activity) {
            domainData.latest_activity = completedDate;
          }
          
          // Calculate time invested
          if (step.started_at) {
            const startedDate = new Date(step.started_at);
            if (!domainData.earliest_activity || startedDate < domainData.earliest_activity) {
              domainData.earliest_activity = startedDate;
            }
            
            // Add days spent on this step
            const daysSpent = Math.max(1, Math.floor((completedDate.getTime() - startedDate.getTime()) / (1000 * 60 * 60 * 24)));
            domainData.total_days_invested += daysSpent;
          }
        }
      } else if (step.status === 'active') {
        domainData.active_steps++;
        
        // Track activity dates for active steps too
        if (step.started_at) {
          const startedDate = new Date(step.started_at);
          if (!domainData.earliest_activity || startedDate < domainData.earliest_activity) {
            domainData.earliest_activity = startedDate;
          }
          if (!domainData.latest_activity || startedDate > domainData.latest_activity) {
            domainData.latest_activity = startedDate;
          }
        }
      }
    });

    // Convert to our new progress model
    return Array.from(domainMap.values()).map(domain => {
      // Determine maturity level based on completed steps
      let maturityLevel: 'exploring' | 'learning' | 'practicing' | 'refining' | 'teaching';
      const completionPercentage = domain.total_steps > 0 ? 
        Math.round((domain.completed_steps / domain.total_steps) * 100) : 0;
      
      if (completionPercentage >= 75) maturityLevel = 'refining';
      else if (completionPercentage >= 50) maturityLevel = 'practicing';
      else if (completionPercentage >= 25 || domain.completed_steps > 0) maturityLevel = 'learning';
      else maturityLevel = 'exploring';
      
      // Determine current state
      let currentState: 'active_focus' | 'maintaining' | 'future_focus' | 'dormant';
      if (domain.active_steps > 0) currentState = 'active_focus';
      else if (domain.completed_steps > 0) currentState = 'maintaining';
      else currentState = 'future_focus';
      
      // Calculate days since last activity
      let daysSinceLastActivity: number | undefined;
      if (domain.latest_activity) {
        daysSinceLastActivity = Math.floor((Date.now() - domain.latest_activity.getTime()) / (1000 * 60 * 60 * 24));
        
        // If it's been more than 30 days since last activity, consider it dormant
        if (daysSinceLastActivity > 30 && currentState === 'maintaining') {
          currentState = 'dormant';
        }
      }
      
      return {
        domain_id: domain.domain_id,
        domain_name: domain.domain_name,
        maturity_level: maturityLevel,
        current_state: currentState,
        total_steps_engaged: domain.completed_steps + domain.active_steps,
        time_invested_days: domain.total_days_invested,
        days_since_last_activity: daysSinceLastActivity,
        team_involvement_level: 'solo', // Default value for fallback approach
        color: domain.color
      };
    });
    } catch (error) {
      console.error('Error in getProgressByDomain:', error);
      return [];
    }
  }
};
