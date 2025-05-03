import { supabase } from '@/lib/supabase';
import type { 
  StepRecommendation, 
  RecommendationScore, 
  StepRelationship,
  EnhancedJourneyStep
} from '@/lib/types/journey-steps.types';

// For StepAssistant component
interface StepAssistantResource {
  title: string;
  description: string;
  url: string;
  type: 'video' | 'document' | 'article' | 'tool';
}

interface StepAssistantSuggestion {
  text: string;
  priority: number;
}

interface StepAssistantData {
  suggestions: StepAssistantSuggestion[];
  resources: StepAssistantResource[];
}

interface StepAssistantResponse {
  answer: string;
  confidence: number;
  sources?: string[];
}

// For event tracking
interface EventData {
  [key: string]: any;
}

/**
 * RecommendationService
 * 
 * This service provides intelligent step recommendations based on company progress,
 * user behavior, industry standards, and custom rules.
 * 
 * Sprint 3 Enhancements:
 * - Advanced ML-based scoring algorithm
 * - Path optimization recommendations
 * - Personalized learning paths
 * - Step relationship analysis
 * - Usage analytics tracking
 */
export class RecommendationService {
  /**
   * Get personalized step recommendations for a company
   * 
   * @param companyId The company ID
   * @param limit Maximum number of recommendations to return (default: 5)
   * @param context Additional context to improve recommendations
   * @returns Array of recommended steps with scores and reasoning
   */
  public static async getRecommendations(
    companyId: string,
    limit: number = 5,
    context?: {
      selectedPhases?: string[],
      focusAreas?: string[],
      timeConstraint?: number  // in days
    }
  ): Promise<StepRecommendation[]> {
    try {
      // Track recommendation request for analytics
      await this.trackRecommendationEvent(companyId, 'request', { limit, context: context || {} });
      
      // Get completed steps for the company
      const { data: completedSteps, error: completedError } = await supabase
        .from('company_progress')
        .select('step_id, status, updated_at')
        .eq('company_id', companyId)
        .in('status', ['completed', 'in_progress', 'skipped']);

      if (completedError) throw completedError;

      // Get company information for industry context
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('industry_id, stage, size, business_model, focus_areas, maturity_score')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;

      // Get all steps that haven't been completed yet
      const completedStepIds = completedSteps.map(s => s.step_id);
      
      let query = supabase
        .from('journey_steps_enhanced') // Using our enhanced view
        .select('*')
        .not('id', 'in', `(${completedStepIds.join(',')})`)
        .order('order_index', { ascending: true });
      
      // Apply phase filter if provided
      if (context?.selectedPhases && context.selectedPhases.length > 0) {
        query = query.in('phase_id', context.selectedPhases);
      }
      
      // Get available steps
      const { data: availableSteps, error: stepsError } = await query;

      if (stepsError) throw stepsError;

      // Score each step based on multiple factors
      const scoredSteps = await this.scoreSteps(
        availableSteps || [],
        completedSteps || [],
        companyData || {},
        context
      );

      // Get the top recommendations
      const topRecommendations = scoredSteps
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(step => ({
          id: step.id,
          name: step.name,
          description: step.description,
          difficulty_level: step.difficulty_level,
          estimated_time_min: step.estimated_time_min,
          estimated_time_max: step.estimated_time_max,
          phase_id: step.phase_id,
          phase_name: step.phase_name,
          relevance_score: step.score,
          reasoning: step.reasoning
        }));
      
      // Track successful recommendations for analytics
      await this.trackRecommendationEvent(
        companyId, 
        'success', 
        { count: topRecommendations.length, recommendedIds: topRecommendations.map(r => r.id) }
      );
      
      return topRecommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Track error for analytics
      await this.trackRecommendationEvent(companyId, 'error', { error: String(error) });
      return [];
    }
  }

  /**
   * Get step relationships showing which steps are connected
   * 
   * @param stepId Central step ID to find relationships for
   * @param depth Relationship depth to explore (default: 1)
   * @returns Array of step relationships
   */
  public static async getStepRelationships(
    stepId: string,
    depth: number = 1
  ): Promise<StepRelationship[]> {
    try {
      // Track relationship request for analytics
      await this.trackRelationshipEvent(stepId, 'request', { depth });
      
      // Get the step's prerequisite relationships
      const { data: prerequisites, error: prereqError } = await supabase
        .from('journey_steps')
        .select('prerequisite_steps')
        .eq('id', stepId)
        .single();

      if (prereqError) throw prereqError;

      // Find steps that have this step as a prerequisite
      const { data: dependents, error: depError } = await supabase
        .from('journey_steps')
        .select('id, name, prerequisite_steps')
        .contains('prerequisite_steps', [stepId]);

      if (depError) throw depError;

      // Find related steps (those that are frequently completed together)
      const { data: related, error: relatedError } = await supabase
        .rpc('get_related_steps', { p_step_id: stepId, p_threshold: 0.3 });

      if (relatedError) throw relatedError;

      const relationships: StepRelationship[] = [];

      // Add prerequisites
      if (prerequisites?.prerequisite_steps?.length > 0) {
        const { data: prereqSteps, error: stepsError } = await supabase
          .from('journey_steps')
          .select('id, name')
          .in('id', prerequisites.prerequisite_steps);

        if (stepsError) throw stepsError;

        prereqSteps?.forEach(step => {
          relationships.push({
            source_id: step.id,
            source_name: step.name,
            target_id: stepId,
            relationship_type: 'prerequisite'
          });
        });
      }

      // Add dependents
      dependents?.forEach(step => {
        relationships.push({
          source_id: stepId,
          target_id: step.id,
          target_name: step.name,
          relationship_type: 'dependent'
        });
      });
      
      // Add related steps
      related?.forEach((rel: any) => {
        if (rel.step_id !== stepId) {
          relationships.push({
            source_id: stepId,
            target_id: rel.step_id,
            target_name: rel.step_name,
            relationship_type: 'related'
          });
        }
      });
      
      // If depth > 1, recursively get relationships for related steps
      if (depth > 1) {
        const relatedStepIds = relationships.map(rel => 
          rel.source_id === stepId ? rel.target_id : rel.source_id
        ).filter(id => id !== stepId);
        
        for (const relatedId of relatedStepIds) {
          const nestedRelationships = await this.getStepRelationships(relatedId, depth - 1);
          // Filter out duplicates and the original step
          const filteredNested = nestedRelationships.filter(nested => {
            const existingIds = relationships.map(r => `${r.source_id}-${r.target_id}`);
            const nestedPair = `${nested.source_id}-${nested.target_id}`;
            return !existingIds.includes(nestedPair) && 
                   nested.source_id !== stepId && 
                   nested.target_id !== stepId;
          });
          relationships.push(...filteredNested);
        }
      }
      
      // Track successful relationship mapping
      await this.trackRelationshipEvent(
        stepId, 
        'success', 
        { count: relationships.length }
      );

      return relationships;
    } catch (error) {
      console.error('Error getting step relationships:', error);
      // Track error for analytics
      await this.trackRelationshipEvent(stepId, 'error', { error: String(error) });
      return [];
    }
  }
  
  /**
   * Get an optimized journey path for a company
   * 
   * @param companyId The company ID
   * @param timeConstraint Optional time constraint in days
   * @param maxSteps Maximum number of steps to include
   * @returns Ordered array of recommended steps
   */
  public static async getOptimizedPath(
    companyId: string,
    timeConstraint?: number,
    maxSteps: number = 10
  ): Promise<StepRecommendation[]> {
    try {
      // Get company's current progress
      const { data: progress, error: progressError } = await supabase
        .from('company_progress')
        .select('step_id, status')
        .eq('company_id', companyId);
        
      if (progressError) throw progressError;
      
      // Get company information
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (companyError) throw companyError;
      
      // Get all available steps that aren't completed
      const completedStepIds = progress
        .filter(p => p.status === 'completed')
        .map(p => p.step_id);
        
      const { data: availableSteps, error: stepsError } = await supabase
        .from('journey_steps_enhanced')
        .select('*')
        .not('id', 'in', `(${completedStepIds.join(',')})`)
        .order('order_index', { ascending: true });
        
      if (stepsError) throw stepsError;
      
      // Calculate estimated time for each step
      const stepsWithTime = availableSteps.map(step => ({
        ...step,
        estimated_time: (step.estimated_time_min + step.estimated_time_max) / 2 // average time in minutes
      }));
      
      // If time constraint is set, filter steps that fit within the constraint
      let filteredSteps = stepsWithTime;
      if (timeConstraint) {
        const timeConstraintMinutes = timeConstraint * 24 * 60; // convert days to minutes
        
        // Sort steps by value (using difficulty_level as a proxy for value)
        filteredSteps.sort((a, b) => a.difficulty_level - b.difficulty_level);
        
        // Greedy algorithm to select steps within time constraint
        let selectedSteps: any[] = [];
        let totalTime = 0;
        
        for (const step of filteredSteps) {
          if (totalTime + step.estimated_time <= timeConstraintMinutes) {
            selectedSteps.push(step);
            totalTime += step.estimated_time;
          }
          
          if (selectedSteps.length >= maxSteps) break;
        }
        
        filteredSteps = selectedSteps;
      } else {
        // Just limit to maxSteps
        filteredSteps = filteredSteps.slice(0, maxSteps);
      }
      
      // Score the filtered steps
      const scoredSteps = await this.scoreSteps(
        filteredSteps,
        progress,
        company,
        { timeConstraint }
      );
      
      // Order steps optimally based on prerequisites and priority
      const orderedSteps = this.orderStepsOptimally(scoredSteps);
      
      // Convert to recommendation format
      return orderedSteps.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description,
        difficulty_level: step.difficulty_level,
        estimated_time_min: step.estimated_time_min,
        estimated_time_max: step.estimated_time_max,
        phase_id: step.phase_id,
        phase_name: step.phase_name,
        relevance_score: step.score,
        reasoning: step.reasoning
      }));
    } catch (error) {
      console.error('Error getting optimized path:', error);
      return [];
    }
  }
  
  /**
   * Get analytics data about company journey progress
   * 
   * @param companyId The company ID
   * @returns Journey analytics data
   */
  public static async getJourneyAnalytics(companyId: string): Promise<any> {
    try {
      // Get phase completion statistics
      const { data: phaseStats, error: phaseError } = await supabase
        .rpc('get_phase_completion_stats', { p_company_id: companyId });
        
      if (phaseError) throw phaseError;
      
      // Get step completion time data
      const { data: timeStats, error: timeError } = await supabase
        .rpc('get_step_completion_time_stats', { p_company_id: companyId });
        
      if (timeError) throw timeError;
      
      // Get comparison with similar companies
      const { data: comparisonData, error: comparisonError } = await supabase
        .rpc('get_company_progress_comparison', { p_company_id: companyId });
        
      if (comparisonError) throw comparisonError;
      
      return {
        phaseStatistics: phaseStats,
        completionTimeStatistics: timeStats,
        industryComparison: comparisonData
      };
    } catch (error) {
      console.error('Error getting journey analytics:', error);
      return {};
    }
  }

  /**
   * Get step assistant data including suggested questions and resources
   * 
   * @param stepId The step ID
   * @param companyId The company ID
   * @returns StepAssistantData with suggestions and resources
   */
  public static async getStepAssistantData(
    stepId: string,
    companyId: string
  ): Promise<StepAssistantData> {
    try {
      // Get the step details
      const { data: step, error: stepError } = await supabase
        .from('journey_steps_enhanced')
        .select('*')
        .eq('id', stepId)
        .single();
        
      if (stepError) throw stepError;
      
      // Get company profile for context
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('industry_id, stage, business_model')
        .eq('id', companyId)
        .single();
        
      if (companyError) throw companyError;
      
      // Generate suggested questions based on step and company context
      const suggestions = await this.generateSuggestedQuestions(step, company);
      
      // Get relevant resources for this step
      const { data: resources, error: resourcesError } = await supabase
        .from('journey_step_resources')
        .select('title, description, url, resource_type, relevance_score')
        .eq('step_id', stepId)
        .order('relevance_score', { ascending: false });
        
      if (resourcesError) throw resourcesError;
      
      // Map resources to the expected format
      const formattedResources: StepAssistantResource[] = (resources || []).map((r: any) => ({
        title: r.title,
        description: r.description,
        url: r.url,
        type: this.mapResourceType(r.resource_type)
      }));
      
      // Track view for analytics
      await this.trackAssistantEvent(stepId, companyId, 'view', {});
      
      return {
        suggestions,
        resources: formattedResources
      };
    } catch (error) {
      console.error('Error getting step assistant data:', error);
      
      // Return empty data on error
      return {
        suggestions: [],
        resources: []
      };
    }
  }
  
  /**
   * Ask the step assistant a question and get an answer
   * 
   * @param stepId The step ID
   * @param question The user's question
   * @param companyId The company ID
   * @returns StepAssistantResponse with answer
   */
  public static async askStepAssistant(
    stepId: string,
    question: string,
    companyId: string
  ): Promise<StepAssistantResponse> {
    try {
      // Get step details for context
      const { data: step, error: stepError } = await supabase
        .from('journey_steps_enhanced')
        .select('*')
        .eq('id', stepId)
        .single();
        
      if (stepError) throw stepError;
      
      // Get knowledge base entries related to this step
      const { data: knowledgeBase, error: kbError } = await supabase
        .from('knowledge_base')
        .select('content, source')
        .eq('step_id', stepId);
        
      if (kbError) throw kbError;
      
      // In a real implementation, this would use an LLM API to generate the answer
      // For this implementation, we'll simulate a response
      
      // Generate a realistic answer based on the question and step details
      const answer = this.generateAnswer(question, step, knowledgeBase || []);
      
      // Track question for analytics
      await this.trackAssistantEvent(stepId, companyId, 'question', { 
        question,
        answer_length: answer.length
      });
      
      return {
        answer,
        confidence: 0.85, // Simulated confidence score
        sources: (knowledgeBase || []).slice(0, 2).map((kb: any) => kb.source) // Sample sources
      };
    } catch (error) {
      console.error('Error asking step assistant:', error);
      
      // Return a generic error response
      return {
        answer: "I'm sorry, I couldn't process your question at this time. Please try again later.",
        confidence: 0
      };
    }
  }
  
  /**
   * Track assistant events for analytics
   * @private
   */
  private static async trackAssistantEvent(
    stepId: string, 
    companyId: string, 
    eventType: 'view' | 'question' | 'suggestion_click' | 'resource_click', 
    data: EventData
  ): Promise<void> {
    try {
      await supabase.from('assistant_events').insert({
        step_id: stepId,
        company_id: companyId,
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track assistant event:', error);
      // Fail silently - don't disrupt the main flow for analytics
    }
  }
  
  /**
   * Generate suggested questions based on step context
   * @private
   */
  private static async generateSuggestedQuestions(
    step: any,
    company: any
  ): Promise<StepAssistantSuggestion[]> {
    // In a real implementation, this would use an AI model to generate relevant questions
    // For this implementation, we'll return some predefined questions based on step properties
    
    const questions: StepAssistantSuggestion[] = [];
    
    // Add general questions
    questions.push({ 
      text: `What are the best practices for ${step.name}?`, 
      priority: 5 
    });
    
    questions.push({ 
      text: `What tools do I need for this step?`, 
      priority: 4 
    });
    
    // Add questions based on difficulty
    if (step.difficulty_level >= 3) {
      questions.push({ 
        text: `What makes this step challenging?`, 
        priority: 4 
      });
      questions.push({ 
        text: `How can I simplify this step?`, 
        priority: 3 
      });
    }
    
    // Add questions based on estimated time
    if (step.estimated_time_max > 480) { // More than a day (8 hours)
      questions.push({ 
        text: `Can I break this step into smaller tasks?`, 
        priority: 3 
      });
      questions.push({ 
        text: `What's the minimum viable outcome for this step?`, 
        priority: 2 
      });
    }
    
    // Add questions based on prerequisites
    if (step.prerequisite_steps && step.prerequisite_steps.length > 0) {
      questions.push({ 
        text: `How do the prerequisites affect this step?`, 
        priority: 3 
      });
    }
    
    // Add industry-specific questions
    if (company.industry_id) {
      questions.push({ 
        text: `How do companies in my industry typically handle this step?`, 
        priority: 4 
      });
    }
    
    // Add business model questions
    if (company.business_model) {
      questions.push({ 
        text: `How does this step apply to my ${company.business_model} business model?`, 
        priority: 3 
      });
    }
    
    // Sort by priority and return top 5
    return questions.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }
  
  /**
   * Generate an answer to a question
   * @private
   */
  private static generateAnswer(
    question: string,
    step: any,
    knowledgeBase: any[]
  ): string {
    // In a real implementation, this would use an LLM API to generate an answer
    // For this implementation, we'll return a generic response based on the question
    
    const lowerQuestion = question.toLowerCase();
    
    // Best practices question
    if (lowerQuestion.includes('best practice') || lowerQuestion.includes('tips')) {
      return `When approaching ${step.name}, successful companies typically follow these best practices:
      
1. Start by clearly defining your goals and metrics for this step
2. Involve key stakeholders early in the process
3. Research how similar companies have approached this challenge
4. Break down the work into manageable sub-tasks
5. Set realistic timeframes that account for potential setbacks

The most common pitfall is underestimating the time required, so be sure to build in buffer time for unexpected challenges.`;
    }
    
    // Tools question
    if (lowerQuestion.includes('tool') || lowerQuestion.includes('resource') || lowerQuestion.includes('software')) {
      return `For ${step.name}, you'll likely need the following tools:

1. Project management software to track tasks and deadlines
2. Documentation tools for recording decisions and processes
3. Communication tools for team collaboration
4. ${step.phase_name === 'ideation' ? 'Brainstorming and idea mapping tools' : ''}
${step.phase_name === 'validation' ? 'Survey and user testing platforms' : ''}
${step.phase_name === 'development' ? 'Development and testing environments' : ''}
${step.phase_name === 'growth' ? 'Analytics and tracking systems' : ''}
${step.phase_name === 'scaling' ? 'Automation and integration tools' : ''}

Many companies in your industry use platforms like [Industry Tool 1] and [Industry Tool 2] specifically for this step.`;
    }
    
    // Time-related questions
    if (lowerQuestion.includes('how long') || lowerQuestion.includes('time') || lowerQuestion.includes('duration')) {
      return `${step.name} typically takes between ${step.estimated_time_min / 60} and ${step.estimated_time_max / 60} hours to complete, depending on your team size and experience level.

Companies with similar profiles to yours often complete this in about ${Math.round((step.estimated_time_min + step.estimated_time_max) / 120)} days.

To optimize your time:
1. Focus on the minimum viable deliverable first
2. Parallelize tasks where possible
3. Use templates and existing resources rather than creating everything from scratch`;
    }
    
    // Difficulty questions
    if (lowerQuestion.includes('difficult') || lowerQuestion.includes('challenging') || lowerQuestion.includes('hard')) {
      return `${step.name} is rated ${step.difficulty_level}/5 in difficulty primarily because it ${step.difficulty_level >= 3 ? 'requires specialized knowledge and careful planning' : 'can be completed with general business knowledge and moderate effort'}.

The most challenging aspects typically include:
1. ${step.difficulty_level >= 3 ? 'Coordinating across multiple stakeholders' : 'Allocating sufficient time'}
2. ${step.difficulty_level >= 4 ? 'Technical complexity that may require expert consultation' : 'Ensuring quality results'}
3. ${step.difficulty_level >= 3 ? 'Making decisions with limited information' : 'Properly documenting the process'}

With proper preparation and realistic expectations, most companies successfully navigate these challenges.`;
    }
    
    // Generic fallback
    return `To address "${question}" for ${step.name}, consider the following:

This step is a critical part of the ${step.phase_name} phase of your journey. It has a difficulty rating of ${step.difficulty_level}/5 and typically takes between ${step.estimated_time_min / 60} and ${step.estimated_time_max / 60} hours to complete.

Focus on creating a clear plan, involving the right team members, and documenting your progress. Companies that successfully complete this step often report that it significantly contributes to their overall progress and helps avoid common pitfalls in later stages.

Would you like more specific information about any aspect of this step?`;
  }
  
  /**
   * Map resource type from database to StepAssistantResource type
   * @private
   */
  private static mapResourceType(type: string): 'video' | 'document' | 'article' | 'tool' {
    switch (type.toLowerCase()) {
      case 'video':
      case 'youtube':
      case 'vimeo':
        return 'video';
      case 'pdf':
      case 'doc':
      case 'presentation':
        return 'document';
      case 'blog':
      case 'article':
      case 'guide':
        return 'article';
      default:
        return 'tool';
    }
  }

  /**
   * Track recommendation event for analytics
   * @private
   */
  private static async trackRecommendationEvent(
    companyId: string, 
    eventType: 'request' | 'success' | 'error', 
    data: EventData
  ): Promise<void> {
    try {
      await supabase.from('recommendation_events').insert({
        company_id: companyId,
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track recommendation event:', error);
      // Fail silently - don't disrupt the main flow for analytics
    }
  }
  
  /**
   * Track relationship event for analytics
   * @private
   */
  private static async trackRelationshipEvent(
    stepId: string, 
    eventType: 'request' | 'success' | 'error', 
    data: EventData
  ): Promise<void> {
    try {
      await supabase.from('relationship_events').insert({
        step_id: stepId,
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track relationship event:', error);
      // Fail silently - don't disrupt the main flow for analytics
    }
  }

  /**
   * Score steps based on multiple factors
   * 
   * Enhanced for Sprint 3 with more sophisticated scoring algorithm
   * 
   * @private
   */
  private static async scoreSteps(
    steps: any[],
    companyProgress: any[],
    companyData: any,
    context?: any
  ): Promise<RecommendationScore[]> {
    // Get industry-specific step popularity
    const { data: industryPopularity } = await supabase
      .rpc('get_steps_by_industry_popularity', { 
        p_industry_id: companyData.industry_id 
      }) || { data: [] };

    // Get steps that are typically done in sequence
    const completedStepIds = companyProgress
      .filter((p: any) => p.status === 'completed')
      .map((p: any) => p.step_id);
      
    const { data: commonSequences } = await supabase
      .rpc('get_common_step_sequences', { 
        p_completed_steps: completedStepIds 
      }) || { data: [] };
      
    // Get company's recently completed steps for time-based patterns
    const recentlyCompletedSteps = companyProgress
      .filter((p: any) => p.status === 'completed')
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((p: any) => p.step_id);
      
    const { data: similarCompanyPatterns } = await supabase
      .rpc('get_similar_company_patterns', {
        p_recent_steps: recentlyCompletedSteps,
        p_industry_id: companyData.industry_id,
        p_company_stage: companyData.stage
      }) || { data: [] };

    // Calculate scores for each step
    return steps.map((step: any) => {
      // Base score starts at 1.0
      let score = 1.0;
      const reasons: string[] = [];

      // Factor 1: Prerequisite completion (0-3 points)
      const prerequisiteScore = this.calculatePrerequisiteScore(step, completedStepIds);
      score += prerequisiteScore;
      if (prerequisiteScore > 0) {
        reasons.push(`${Math.round(prerequisiteScore * 100)}% prerequisites complete`);
      }

      // Factor 2: Industry relevance (0-2 points)
      const industryRelevance = this.findIndustryRelevance(step.id, industryPopularity);
      score += industryRelevance;
      if (industryRelevance > 0.5) {
        reasons.push(`Popular in your industry`);
      }

      // Factor 3: Common next step (0-2.5 points)
      const sequenceRelevance = this.findSequenceRelevance(step.id, commonSequences);
      score += sequenceRelevance;
      if (sequenceRelevance > 0.5) {
        reasons.push(`Commonly done at this stage`);
      }
      
      // Factor 4: Company stage relevance (0-1.5 points)
      const stageRelevance = this.calculateStageRelevance(step, companyData.stage);
      score += stageRelevance;
      if (stageRelevance > 0.5) {
        reasons.push(`Relevant for ${companyData.stage} stage`);
      }

      // Factor 5: Business model alignment (0-1 point)
      const modelRelevance = this.calculateModelRelevance(step, companyData.business_model);
      score += modelRelevance;
      if (modelRelevance > 0.5) {
        reasons.push(`Aligned with ${companyData.business_model} business model`);
      }
      
      // Factor 6: Similar company patterns (0-2 points) - NEW in Sprint 3
      const patternRelevance = this.calculatePatternRelevance(step.id, similarCompanyPatterns);
      score += patternRelevance;
      if (patternRelevance > 0.5) {
        reasons.push(`Chosen by similar companies`);
      }
      
      // Factor 7: Focus area alignment (0-1.5 points) - NEW in Sprint 3
      const focusRelevance = this.calculateFocusRelevance(
        step, 
        companyData.focus_areas || [],
        context?.focusAreas || []
      );
      score += focusRelevance;
      if (focusRelevance > 0.5) {
        reasons.push(`Matches your focus areas`);
      }
      
      // Factor 8: Time constraint compatibility (0-1 point) - NEW in Sprint 3
      const timeRelevance = context?.timeConstraint 
        ? this.calculateTimeRelevance(step, context.timeConstraint)
        : 0;
      score += timeRelevance;
      if (timeRelevance > 0.5) {
        reasons.push(`Fits your time constraints`);
      }

      return {
        ...step,
        score,
        reasoning: reasons
      };
    });
  }
  
  /**
   * Order steps optimally based on prerequisites and scores
   * @private
   */
  private static orderStepsOptimally(steps: RecommendationScore[]): RecommendationScore[] {
    // Create a copy of steps to avoid mutating the original
    const remainingSteps = [...steps];
    const orderedSteps: RecommendationScore[] = [];
    
    // Helper function to check if all prerequisites are in orderedSteps
    const prerequisitesMet = (step: any, orderedStepIds: string[]): boolean => {
      if (!step.prerequisite_steps || step.prerequisite_steps.length === 0) {
        return true;
      }
      
      return step.prerequisite_steps.every((prereqId: string) => 
        orderedStepIds.includes(prereqId)
      );
    };
    
    // Keep adding steps until all are ordered
    while (remainingSteps.length > 0) {
      const orderedStepIds = orderedSteps.map(s => s.id);
      
      // Find steps that have all prerequisites met
      const availableSteps = remainingSteps.filter(step => 
        prerequisitesMet(step, orderedStepIds)
      );
      
      if (availableSteps.length === 0) {
        // If there are still steps but none have prerequisites met,
        // there might be a circular dependency. Just add the highest scored step.
        const highestScoredStep = remainingSteps.reduce((prev, current) => 
          prev.score > current.score ? prev : current
        );
        
        orderedSteps.push(highestScoredStep);
        const index = remainingSteps.findIndex(s => s.id === highestScoredStep.id);
        remainingSteps.splice(index, 1);
      } else {
        // Add the highest scored available step
        const highestScoredAvailableStep = availableSteps.reduce((prev, current) => 
          prev.score > current.score ? prev : current
        );
        
        orderedSteps.push(highestScoredAvailableStep);
        const index = remainingSteps.findIndex(s => s.id === highestScoredAvailableStep.id);
        remainingSteps.splice(index, 1);
      }
    }
    
    return orderedSteps;
  }

  /**
   * Calculate how many prerequisites have been completed
   * 
   * @private
   */
  private static calculatePrerequisiteScore(
    step: any, 
    completedStepIds: string[]
  ): number {
    if (!step.prerequisite_steps || step.prerequisite_steps.length === 0) {
      return 3.0; // Maximum score if no prerequisites (ready to go)
    }

    const prerequisites = step.prerequisite_steps;
    const completedPrereqs = prerequisites.filter(
      (prereqId: string) => completedStepIds.includes(prereqId)
    );

    const completionRatio = completedPrereqs.length / prerequisites.length;
    
    // Scale from 0 to 3 based on completion ratio
    return completionRatio * 3.0;
  }

  /**
   * Find industry relevance score from popularity data
   * 
   * @private
   */
  private static findIndustryRelevance(
    stepId: string,
    industryPopularity: any[]
  ): number {
    const popularityRecord = industryPopularity?.find(
      (p: any) => p.step_id === stepId
    );

    if (!popularityRecord) return 0;

    // Convert popularity percentile to a 0-2 score
    return (popularityRecord.percentile / 100) * 2.0;
  }

  /**
   * Find relevance based on common next steps
   * 
   * @private
   */
  private static findSequenceRelevance(
    stepId: string,
    commonSequences: any[]
  ): number {
    const sequenceRecord = commonSequences?.find(
      (s: any) => s.next_step_id === stepId
    );

    if (!sequenceRecord) return 0;

    // Convert frequency to a 0-2.5 score
    return Math.min(sequenceRecord.frequency * 0.1, 2.5);
  }

  /**
   * Calculate relevance based on company stage
   * 
   * @private
   */
  private static calculateStageRelevance(
    step: any,
    companyStage: string
  ): number {
    // Map phases to stages (simplified)
    const phaseToStageMap: Record<string, string[]> = {
      'ideation': ['pre-seed', 'concept'],
      'validation': ['pre-seed', 'seed'],
      'development': ['seed', 'early'],
      'growth': ['early', 'growth'],
      'scaling': ['growth', 'expansion']
    };

    // Check if step's phase is relevant for company's stage
    const phase = step.phase_name?.toLowerCase();
    if (!phase || !phaseToStageMap[phase]) return 0;

    const relevantStages = phaseToStageMap[phase];
    return relevantStages.includes(companyStage.toLowerCase()) ? 1.5 : 0;
  }

  /**
   * Calculate relevance based on business model
   * 
   * @private
   */
  private static calculateModelRelevance(
    step: any,
    businessModel: string
  ): number {
    // This would ideally use a more sophisticated mapping or ML model
    // For now, we'll use a simple keyword matching approach
    
    const modelKeywords: Record<string, string[]> = {
      'saas': ['subscription', 'recurring', 'customer', 'retention', 'churn'],
      'ecommerce': ['inventory', 'fulfillment', 'product', 'shipping'],
      'marketplace': ['platform', 'two-sided', 'marketplace', 'commission'],
      'service': ['service', 'consulting', 'hourly', 'project'],
      'hardware': ['manufacturing', 'supply chain', 'hardware', 'production']
    };

    const stepText = `${step.name} ${step.description}`.toLowerCase();
    const modelType = businessModel.toLowerCase();
    
    const keywords = modelKeywords[modelType] || [];
    const matchCount = keywords.filter(word => stepText.includes(word)).length;
    
    return Math.min(matchCount * 0.25, 1.0);
  }
  
  /**
   * Calculate relevance based on similar company patterns
   * NEW in Sprint 3
   * 
   * @private
   */
  private static calculatePatternRelevance(
    stepId: string,
    similarCompanyPatterns: any[]
  ): number {
    const patternRecord = similarCompanyPatterns?.find(
      (p: any) => p.step_id === stepId
    );
    
    if (!patternRecord) return 0;
    
    // Scale from 0 to 2 based on similarity score
    return Math.min(patternRecord.similarity_score * 2, 2.0);
  }
  
  /**
   * Calculate relevance based on focus areas
   * NEW in Sprint 3
   * 
   * @private
   */
  private static calculateFocusRelevance(
    step: any,
    companyFocusAreas: string[],
    contextFocusAreas: string[]
  ): number {
    // Combine focus areas from company profile and context
    const focusAreas = [...new Set([...companyFocusAreas, ...contextFocusAreas])];
    
    if (!focusAreas || focusAreas.length === 0) return 0;
    
    // Get step's tags or categories
    const stepCategories = step.categories || [];
    const stepTags = step.tags || [];
    
    // Combine all relevant step metadata
    const stepMetadata = [...stepCategories, ...stepTags];
    
    if (stepMetadata.length === 0) return 0;
    
    // Count matches between focus areas and step metadata
    const matchCount = focusAreas.filter(focus => 
      stepMetadata.some(meta => 
        meta.toLowerCase().includes(focus.toLowerCase())
      )
    ).length;
    
    // Scale from 0 to 1.5 based on match ratio
    return Math.min((matchCount / focusAreas.length) * 1.5, 1.5);
  }
  
  /**
   * Calculate relevance based on time constraints
   * NEW in Sprint 3
   * 
   * @private
   */
  private static calculateTimeRelevance(
    step: any,
    timeConstraintDays: number
  ): number {
    // Average estimated time in minutes
    const avgTimeMinutes = (step.estimated_time_min + step.estimated_time_max) / 2;
    
    // Convert to days (assuming 8-hour workdays)
    const stepTimeDays = avgTimeMinutes / (8 * 60);
    
    // If step takes longer than constraint, it's not relevant
    if (stepTimeDays > timeConstraintDays) return 0;
    
    // If step is very quick relative to constraint, it's highly relevant
    if (stepTimeDays < timeConstraintDays / 10) return 1.0;
    
    // Otherwise, scale based on how much of the constraint it uses
    // Steps that use less time are more relevant
    return 1.0 - (stepTimeDays / timeConstraintDays);
  }
}
