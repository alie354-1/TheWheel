/**
 * Achievement Service
 * 
 * This service handles all operations related to user achievements and contribution scores.
 * It provides methods for creating, retrieving, and managing achievements and scores.
 */

import { supabase } from '../supabase';
import {
  Achievement,
  ContributionScore,
  AchievementCategory,
  AchievementTier,
  ScoringPeriodType
} from '../types/community.types';

/**
 * Achievement Service
 * Handles all achievement-related operations
 */
export const achievementService = {
  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });

      if (error) {
        console.error('Error fetching user achievements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserAchievements:', error);
      throw error;
    }
  },

  /**
   * Get public achievements for a user
   */
  async getPublicAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('earned_date', { ascending: false });

      if (error) {
        console.error('Error fetching public achievements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPublicAchievements:', error);
      throw error;
    }
  },

  /**
   * Award an achievement to a user
   */
  async awardAchievement(
    userId: string,
    achievementType: AchievementCategory,
    achievementName: string,
    tier: AchievementTier = 'bronze',
    description?: string,
    isPublic: boolean = true,
    badgeImageUrl?: string
  ): Promise<Achievement> {
    try {
      // Check if the user already has this achievement
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_name', achievementName)
        .single();

      // If the user already has this achievement at the same or higher tier, don't award it again
      if (existingAchievement) {
        const tierValues = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
        const existingTierValue = tierValues[existingAchievement.tier as AchievementTier] || 0;
        const newTierValue = tierValues[tier] || 0;

        if (newTierValue <= existingTierValue) {
          return existingAchievement;
        }

        // If the new tier is higher, update the existing achievement
        const { data, error } = await supabase
          .from('achievements')
          .update({
            tier,
            achievement_description: description || existingAchievement.achievement_description,
            is_public: isPublic,
            badge_image_url: badgeImageUrl || existingAchievement.badge_image_url,
            earned_date: new Date().toISOString()
          })
          .eq('id', existingAchievement.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating achievement:', error);
          throw error;
        }

        return data;
      }

      // Create a new achievement
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          achievement_type: achievementType,
          achievement_name: achievementName,
          achievement_description: description,
          tier,
          earned_date: new Date().toISOString(),
          is_public: isPublic,
          badge_image_url: badgeImageUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error awarding achievement:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in awardAchievement:', error);
      throw error;
    }
  },

  /**
   * Update an achievement's visibility
   */
  async updateAchievementVisibility(
    achievementId: string,
    isPublic: boolean
  ): Promise<Achievement> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .update({
          is_public: isPublic
        })
        .eq('id', achievementId)
        .select()
        .single();

      if (error) {
        console.error('Error updating achievement visibility:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAchievementVisibility:', error);
      throw error;
    }
  },

  /**
   * Get contribution scores for a user
   */
  async getUserContributionScores(
    userId: string,
    period?: ScoringPeriodType
  ): Promise<ContributionScore[]> {
    try {
      let query = supabase
        .from('contribution_scores')
        .select('*')
        .eq('user_id', userId);

      if (period) {
        query = query.eq('scoring_period', period);
      }

      const { data, error } = await query.order('period_start', { ascending: false });

      if (error) {
        console.error('Error fetching contribution scores:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserContributionScores:', error);
      throw error;
    }
  },

  /**
   * Get a user's all-time contribution score
   */
  async getAllTimeScore(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('contribution_scores')
        .select('total_score')
        .eq('user_id', userId)
        .eq('scoring_period', 'all_time')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, return 0
          return 0;
        }
        console.error('Error fetching all-time score:', error);
        throw error;
      }

      return data?.total_score || 0;
    } catch (error) {
      console.error('Error in getAllTimeScore:', error);
      throw error;
    }
  },

  /**
   * Update a user's contribution score
   */
  async updateContributionScore(
    userId: string,
    period: ScoringPeriodType,
    updates: {
      knowledge_sharing_points?: number;
      introduction_credits?: number;
      mentorship_impact_score?: number;
      community_building_score?: number;
    }
  ): Promise<ContributionScore> {
    try {
      // Get the current period dates
      const periodDates = this.getPeriodDates(period);
      
      // Check if a score record already exists for this period
      const { data: existingScore } = await supabase
        .from('contribution_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('scoring_period', period)
        .eq('period_start', periodDates.start)
        .single();

      let result;

      if (existingScore) {
        // Calculate the new total score
        const newTotal = (
          (existingScore.knowledge_sharing_points + (updates.knowledge_sharing_points || 0)) +
          (existingScore.introduction_credits + (updates.introduction_credits || 0)) +
          (existingScore.mentorship_impact_score + (updates.mentorship_impact_score || 0)) +
          (existingScore.community_building_score + (updates.community_building_score || 0))
        );

        // Update the existing score
        const { data, error } = await supabase
          .from('contribution_scores')
          .update({
            knowledge_sharing_points: existingScore.knowledge_sharing_points + (updates.knowledge_sharing_points || 0),
            introduction_credits: existingScore.introduction_credits + (updates.introduction_credits || 0),
            mentorship_impact_score: existingScore.mentorship_impact_score + (updates.mentorship_impact_score || 0),
            community_building_score: existingScore.community_building_score + (updates.community_building_score || 0),
            total_score: newTotal,
            calculated_at: new Date().toISOString()
          })
          .eq('id', existingScore.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating contribution score:', error);
          throw error;
        }

        result = data;
      } else {
        // Calculate the total score
        const totalScore = (
          (updates.knowledge_sharing_points || 0) +
          (updates.introduction_credits || 0) +
          (updates.mentorship_impact_score || 0) +
          (updates.community_building_score || 0)
        );

        // Create a new score record
        const { data, error } = await supabase
          .from('contribution_scores')
          .insert({
            user_id: userId,
            scoring_period: period,
            period_start: periodDates.start,
            period_end: periodDates.end,
            knowledge_sharing_points: updates.knowledge_sharing_points || 0,
            introduction_credits: updates.introduction_credits || 0,
            mentorship_impact_score: updates.mentorship_impact_score || 0,
            community_building_score: updates.community_building_score || 0,
            total_score: totalScore,
            calculated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating contribution score:', error);
          throw error;
        }

        result = data;
      }

      // Also update the all-time score
      await this.updateAllTimeScore(userId);

      return result;
    } catch (error) {
      console.error('Error in updateContributionScore:', error);
      throw error;
    }
  },

  /**
   * Update a user's all-time contribution score
   */
  async updateAllTimeScore(userId: string): Promise<ContributionScore> {
    try {
      // Get all scores except all_time
      const { data: scores } = await supabase
        .from('contribution_scores')
        .select('*')
        .eq('user_id', userId)
        .neq('scoring_period', 'all_time');

      // Calculate the total scores
      let knowledgeSharing = 0;
      let introductions = 0;
      let mentorship = 0;
      let communityBuilding = 0;

      scores?.forEach(score => {
        knowledgeSharing += score.knowledge_sharing_points || 0;
        introductions += score.introduction_credits || 0;
        mentorship += score.mentorship_impact_score || 0;
        communityBuilding += score.community_building_score || 0;
      });

      const totalScore = knowledgeSharing + introductions + mentorship + communityBuilding;

      // Check if an all-time record already exists
      const { data: existingAllTime } = await supabase
        .from('contribution_scores')
        .select('id')
        .eq('user_id', userId)
        .eq('scoring_period', 'all_time')
        .single();

      let result;

      if (existingAllTime) {
        // Update the existing all-time record
        const { data, error } = await supabase
          .from('contribution_scores')
          .update({
            knowledge_sharing_points: knowledgeSharing,
            introduction_credits: introductions,
            mentorship_impact_score: mentorship,
            community_building_score: communityBuilding,
            total_score: totalScore,
            calculated_at: new Date().toISOString()
          })
          .eq('id', existingAllTime.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating all-time score:', error);
          throw error;
        }

        result = data;
      } else {
        // Create a new all-time record
        const { data, error } = await supabase
          .from('contribution_scores')
          .insert({
            user_id: userId,
            scoring_period: 'all_time',
            period_start: new Date(0).toISOString(), // Beginning of time
            period_end: new Date(8640000000000000).toISOString(), // End of time
            knowledge_sharing_points: knowledgeSharing,
            introduction_credits: introductions,
            mentorship_impact_score: mentorship,
            community_building_score: communityBuilding,
            total_score: totalScore,
            calculated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating all-time score:', error);
          throw error;
        }

        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error in updateAllTimeScore:', error);
      throw error;
    }
  },

  /**
   * Get top contributors for a period
   */
  async getTopContributors(
    period: ScoringPeriodType = 'all_time',
    limit: number = 10
  ): Promise<any[]> {
    try {
      const periodDates = this.getPeriodDates(period);
      
      const { data, error } = await supabase
        .from('contribution_scores')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('scoring_period', period)
        .eq('period_start', periodDates.start)
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top contributors:', error);
        throw error;
      }

      // Process the data to include user information
      return data?.map(score => ({
        ...score,
        user_name: score.user?.full_name,
        user_avatar_url: score.user?.avatar_url,
        user: undefined // Remove the nested user object
      })) || [];
    } catch (error) {
      console.error('Error in getTopContributors:', error);
      throw error;
    }
  },

  /**
   * Calculate percentile ranks for all users in a period
   */
  async calculatePercentileRanks(period: ScoringPeriodType): Promise<void> {
    try {
      const periodDates = this.getPeriodDates(period);
      
      // Get all scores for this period
      const { data: scores } = await supabase
        .from('contribution_scores')
        .select('id, total_score')
        .eq('scoring_period', period)
        .eq('period_start', periodDates.start)
        .order('total_score', { ascending: false });

      if (!scores || scores.length === 0) {
        return;
      }

      // Calculate percentile ranks
      const totalUsers = scores.length;
      
      for (let i = 0; i < scores.length; i++) {
        const rank = i + 1;
        const percentile = 100 - ((rank - 1) / totalUsers) * 100;
        
        // Update the percentile rank
        await supabase
          .from('contribution_scores')
          .update({
            percentile_rank: parseFloat(percentile.toFixed(2))
          })
          .eq('id', scores[i].id);
      }
    } catch (error) {
      console.error('Error in calculatePercentileRanks:', error);
      throw error;
    }
  },

  /**
   * Helper method to get period start and end dates
   */
  getPeriodDates(period: ScoringPeriodType): { start: string; end: string } {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
        start = new Date(now.getFullYear(), now.getMonth(), diff);
        end = new Date(now.getFullYear(), now.getMonth(), diff + 7);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 0);
        break;
      case 'all_time':
        start = new Date(0);
        end = new Date(8640000000000000); // End of time
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  },

  /**
   * Check if a user qualifies for any achievements based on their contribution scores
   */
  async checkForAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get the user's all-time score
      const { data: allTimeScore } = await supabase
        .from('contribution_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('scoring_period', 'all_time')
        .single();

      if (!allTimeScore) {
        return [];
      }

      const newAchievements: Achievement[] = [];

      // Check for knowledge sharing achievements
      if (allTimeScore.knowledge_sharing_points >= 100) {
        const achievement = await this.awardAchievement(
          userId,
          'knowledge_sharing',
          'Knowledge Guru',
          'platinum',
          'Shared valuable knowledge that helped 100+ community members'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.knowledge_sharing_points >= 50) {
        const achievement = await this.awardAchievement(
          userId,
          'knowledge_sharing',
          'Knowledge Expert',
          'gold',
          'Shared valuable knowledge that helped 50+ community members'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.knowledge_sharing_points >= 25) {
        const achievement = await this.awardAchievement(
          userId,
          'knowledge_sharing',
          'Knowledge Contributor',
          'silver',
          'Shared valuable knowledge that helped 25+ community members'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.knowledge_sharing_points >= 10) {
        const achievement = await this.awardAchievement(
          userId,
          'knowledge_sharing',
          'Knowledge Sharer',
          'bronze',
          'Shared valuable knowledge that helped 10+ community members'
        );
        newAchievements.push(achievement);
      }

      // Check for networking achievements
      if (allTimeScore.introduction_credits >= 50) {
        const achievement = await this.awardAchievement(
          userId,
          'networking',
          'Super Connector',
          'platinum',
          'Made 50+ valuable introductions within the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.introduction_credits >= 25) {
        const achievement = await this.awardAchievement(
          userId,
          'networking',
          'Network Builder',
          'gold',
          'Made 25+ valuable introductions within the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.introduction_credits >= 10) {
        const achievement = await this.awardAchievement(
          userId,
          'networking',
          'Connector',
          'silver',
          'Made 10+ valuable introductions within the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.introduction_credits >= 5) {
        const achievement = await this.awardAchievement(
          userId,
          'networking',
          'Networker',
          'bronze',
          'Made 5+ valuable introductions within the community'
        );
        newAchievements.push(achievement);
      }

      // Check for mentorship achievements
      if (allTimeScore.mentorship_impact_score >= 100) {
        const achievement = await this.awardAchievement(
          userId,
          'mentorship',
          'Master Mentor',
          'platinum',
          'Provided exceptional mentorship that significantly impacted other founders'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.mentorship_impact_score >= 50) {
        const achievement = await this.awardAchievement(
          userId,
          'mentorship',
          'Senior Mentor',
          'gold',
          'Provided valuable mentorship that helped many founders succeed'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.mentorship_impact_score >= 25) {
        const achievement = await this.awardAchievement(
          userId,
          'mentorship',
          'Mentor',
          'silver',
          'Provided mentorship that helped founders overcome challenges'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.mentorship_impact_score >= 10) {
        const achievement = await this.awardAchievement(
          userId,
          'mentorship',
          'Advisor',
          'bronze',
          'Provided helpful advice to other founders'
        );
        newAchievements.push(achievement);
      }

      // Check for community building achievements
      if (allTimeScore.community_building_score >= 100) {
        const achievement = await this.awardAchievement(
          userId,
          'community_building',
          'Community Leader',
          'platinum',
          'Made exceptional contributions to building and strengthening the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.community_building_score >= 50) {
        const achievement = await this.awardAchievement(
          userId,
          'community_building',
          'Community Champion',
          'gold',
          'Made significant contributions to building and strengthening the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.community_building_score >= 25) {
        const achievement = await this.awardAchievement(
          userId,
          'community_building',
          'Community Builder',
          'silver',
          'Made valuable contributions to building and strengthening the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.community_building_score >= 10) {
        const achievement = await this.awardAchievement(
          userId,
          'community_building',
          'Community Contributor',
          'bronze',
          'Made helpful contributions to building and strengthening the community'
        );
        newAchievements.push(achievement);
      }

      // Check for overall contribution achievements
      if (allTimeScore.total_score >= 250) {
        const achievement = await this.awardAchievement(
          userId,
          'collaboration',
          'Community MVP',
          'platinum',
          'Made extraordinary contributions across all areas of the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.total_score >= 100) {
        const achievement = await this.awardAchievement(
          userId,
          'collaboration',
          'Community Star',
          'gold',
          'Made outstanding contributions across multiple areas of the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.total_score >= 50) {
        const achievement = await this.awardAchievement(
          userId,
          'collaboration',
          'Active Collaborator',
          'silver',
          'Made valuable contributions across multiple areas of the community'
        );
        newAchievements.push(achievement);
      } else if (allTimeScore.total_score >= 25) {
        const achievement = await this.awardAchievement(
          userId,
          'collaboration',
          'Community Member',
          'bronze',
          'Made helpful contributions to the community'
        );
        newAchievements.push(achievement);
      }

      return newAchievements;
    } catch (error) {
      console.error('Error in checkForAchievements:', error);
      throw error;
    }
  }
};
