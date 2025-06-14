/**
 * Community Journey Integration Service
 * 
 * Manages community features for the journey system including:
 * - Community step contributions and sharing
 * - Peer progress sharing and comparisons
 * - Expert engagement and recommendations
 * - Community-driven best practices
 */

import { supabase } from '../supabase';
import {
  JourneyStep,
  CompanyJourneyStep,
  JourneyStepTemplate,
  step_status
} from '../types/journey-unified.types';

export interface CommunityStepContribution {
  id: string;
  contributorId: string;
  contributorName: string;
  stepTemplate: JourneyStepTemplate;
  upvotes: number;
  downvotes: number;
  adoptionCount: number;
  successRate: number;
  communityFeedback: CommunityFeedback[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CommunityFeedback {
  id: string;
  userId: string;
  userName: string;
  stepId: string;
  rating: number;
  comment: string;
  helpful: boolean;
  createdAt: string;
}

export interface PeerProgress {
  companyId: string;
  companyName: string;
  industry: string;
  currentPhase: string;
  completionRate: number;
  recentMilestones: string[];
  isPublic: boolean;
  anonymized: boolean;
}

export interface ExpertRecommendation {
  id: string;
  expertId: string;
  expertName: string;
  expertCredentials: string;
  stepId: string;
  recommendation: string;
  reasoning: string[];
  endorsementLevel: 'suggested' | 'recommended' | 'essential';
  targetCompanyStage: string[];
  upvotes: number;
  createdAt: string;
}

export interface CommunityInsight {
  stepId: string;
  stepName: string;
  totalAttempts: number;
  successRate: number;
  averageCompletionDays: number;
  commonChallenges: string[];
  bestPractices: string[];
  recommendedTools: string[];
  expertTips: string[];
}

export const communityJourneyIntegrationService = {
  /**
   * Submit a community step contribution
   */
  async submitStepContribution(contribution: {
    contributorId: string;
    stepTemplate: Omit<JourneyStepTemplate, 'id' | 'created_at' | 'updated_at'>;
    description: string;
  }): Promise<CommunityStepContribution> {
    // Create the step template
    const { data: template, error: templateError } = await supabase
      .from('journey_step_templates')
      .insert({
        ...contribution.stepTemplate,
        is_community_created: true,
        creator_id: contribution.contributorId,
        approval_status: 'pending'
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Create community contribution record
    const { data: communityContribution, error: contributionError } = await supabase
      .from('community_step_contributions')
      .insert({
        contributor_id: contribution.contributorId,
        step_template_id: template.id,
        description: contribution.description,
        status: 'pending'
      })
      .select()
      .single();

    if (contributionError) throw contributionError;

    return {
      id: communityContribution.id,
      contributorId: contribution.contributorId,
      contributorName: 'Community Member', // Would fetch from user profile
      stepTemplate: template,
      upvotes: 0,
      downvotes: 0,
      adoptionCount: 0,
      successRate: 0,
      communityFeedback: [],
      status: 'pending',
      createdAt: communityContribution.created_at
    };
  },

  /**
   * Get community step contributions with filtering
   */
  async getCommunityContributions(filters: {
    status?: 'pending' | 'approved' | 'rejected';
    category?: string;
    difficulty?: string;
    minRating?: number;
    limit?: number;
  } = {}): Promise<CommunityStepContribution[]> {
    let query = supabase
      .from('community_step_contributions')
      .select(`
        *,
        step_template:step_template_id(*),
        contributor:contributor_id(full_name)
      `);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      contributorId: item.contributor_id,
      contributorName: (item.contributor as any)?.full_name || 'Anonymous',
      stepTemplate: item.step_template as JourneyStepTemplate,
      upvotes: item.upvotes || 0,
      downvotes: item.downvotes || 0,
      adoptionCount: item.adoption_count || 0,
      successRate: item.success_rate || 0,
      communityFeedback: [], // Would be fetched separately
      status: item.status,
      createdAt: item.created_at
    }));
  },

  /**
   * Vote on a community contribution
   */
  async voteOnContribution(contributionId: string, userId: string, vote: 'up' | 'down'): Promise<void> {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('community_contribution_votes')
      .select('*')
      .eq('contribution_id', contributionId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // Update existing vote
      await supabase
        .from('community_contribution_votes')
        .update({ vote_type: vote })
        .eq('id', existingVote.id);
    } else {
      // Create new vote
      await supabase
        .from('community_contribution_votes')
        .insert({
          contribution_id: contributionId,
          user_id: userId,
          vote_type: vote
        });
    }

    // Update vote counts on contribution
    await this.updateContributionVoteCounts(contributionId);
  },

  /**
   * Get peer progress for community comparison
   */
  async getPeerProgress(companyId: string, filters: {
    industry?: string;
    companyStage?: string;
    anonymized?: boolean;
    limit?: number;
  } = {}): Promise<PeerProgress[]> {
    // This would implement privacy-respecting peer comparison
    // For now, return mock data
    const mockPeers: PeerProgress[] = [
      {
        companyId: 'peer-1',
        companyName: filters.anonymized ? 'Company A' : 'TechStart Inc',
        industry: 'Technology',
        currentPhase: 'Build',
        completionRate: 75,
        recentMilestones: ['MVP Completed', 'First Customer Acquired'],
        isPublic: true,
        anonymized: filters.anonymized || false
      },
      {
        companyId: 'peer-2',
        companyName: filters.anonymized ? 'Company B' : 'GreenTech Solutions',
        industry: 'CleanTech',
        currentPhase: 'Scale',
        completionRate: 85,
        recentMilestones: ['Series A Raised', 'Team Expansion'],
        isPublic: true,
        anonymized: filters.anonymized || false
      }
    ];

    return mockPeers.slice(0, filters.limit || 10);
  },

  /**
   * Get expert recommendations for steps
   */
  async getExpertRecommendations(stepId?: string): Promise<ExpertRecommendation[]> {
    let query = supabase
      .from('expert_step_recommendations')
      .select(`
        *,
        expert:expert_id(full_name, credentials)
      `)
      .order('upvotes', { ascending: false });

    if (stepId) {
      query = query.eq('step_id', stepId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      expertId: item.expert_id,
      expertName: (item.expert as any)?.full_name || 'Expert',
      expertCredentials: (item.expert as any)?.credentials || '',
      stepId: item.step_id,
      recommendation: item.recommendation,
      reasoning: item.reasoning || [],
      endorsementLevel: item.endorsement_level,
      targetCompanyStage: item.target_company_stage || [],
      upvotes: item.upvotes || 0,
      createdAt: item.created_at
    }));
  },

  /**
   * Submit feedback on a step
   */
  async submitStepFeedback(feedback: {
    userId: string;
    stepId: string;
    rating: number;
    comment: string;
    helpful?: boolean;
  }): Promise<CommunityFeedback> {
    const { data, error } = await supabase
      .from('community_step_feedback')
      .insert({
        user_id: feedback.userId,
        step_id: feedback.stepId,
        rating: feedback.rating,
        comment: feedback.comment,
        helpful: feedback.helpful || false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: feedback.userId,
      userName: 'Community Member', // Would fetch from user profile
      stepId: feedback.stepId,
      rating: feedback.rating,
      comment: feedback.comment,
      helpful: feedback.helpful || false,
      createdAt: data.created_at
    };
  },

  /**
   * Get community insights for a step
   */
  async getStepCommunityInsights(stepId: string): Promise<CommunityInsight> {
    // This would aggregate real community data
    // For now, return mock insights
    return {
      stepId,
      stepName: 'Market Research',
      totalAttempts: 1250,
      successRate: 0.82,
      averageCompletionDays: 12,
      commonChallenges: [
        'Finding reliable data sources',
        'Defining target market segments',
        'Analyzing competitive landscape'
      ],
      bestPractices: [
        'Start with secondary research before primary',
        'Use multiple data sources for validation',
        'Interview potential customers early'
      ],
      recommendedTools: [
        'Google Analytics',
        'SurveyMonkey',
        'Typeform'
      ],
      expertTips: [
        'Focus on customer problems, not solutions',
        'Quantify market size with bottom-up analysis',
        'Validate assumptions with real data'
      ]
    };
  },

  /**
   * Share company progress with community
   */
  async shareProgress(companyId: string, shareData: {
    milestoneTitle: string;
    description: string;
    isPublic: boolean;
    anonymized: boolean;
  }): Promise<void> {
    await supabase
      .from('community_progress_shares')
      .insert({
        company_id: companyId,
        milestone_title: shareData.milestoneTitle,
        description: shareData.description,
        is_public: shareData.isPublic,
        anonymized: shareData.anonymized
      });
  },

  /**
   * Get community activity feed
   */
  async getCommunityActivity(limit: number = 20): Promise<Array<{
    id: string;
    type: 'milestone' | 'contribution' | 'recommendation';
    title: string;
    description: string;
    author: string;
    createdAt: string;
    upvotes?: number;
  }>> {
    // This would aggregate activity from multiple sources
    // For now, return mock activity data
    return [
      {
        id: '1',
        type: 'milestone' as const,
        title: 'MVP Launch Success',
        description: 'TechStart Inc successfully launched their MVP after 3 months of development',
        author: 'TechStart Inc',
        createdAt: new Date().toISOString(),
        upvotes: 12
      },
      {
        id: '2',
        type: 'contribution' as const,
        title: 'New Step: Customer Validation Framework',
        description: 'A comprehensive framework for validating customer needs',
        author: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        upvotes: 8
      }
    ].slice(0, limit);
  },

  /**
   * Helper method to update vote counts
   */
  async updateContributionVoteCounts(contributionId: string): Promise<void> {
    const { data: votes } = await supabase
      .from('community_contribution_votes')
      .select('vote_type')
      .eq('contribution_id', contributionId);

    const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0;
    const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0;

    await supabase
      .from('community_step_contributions')
      .update({ upvotes, downvotes })
      .eq('id', contributionId);
  }
};
