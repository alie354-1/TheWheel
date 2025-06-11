import { supabase } from '../supabase';
import { expertService } from './expert.service';
import { StartupStage } from '../types/community.types';

/**
 * Sample Data Service
 * 
 * Provides methods for adding sample data to the database
 */
class SampleDataService {
  /**
   * Add a sample expert profile for the current user
   * 
   * @param userId The ID of the user
   * @returns The created expert profile
   */
  async addSampleExpertProfile(userId: string) {
    try {
      console.log('Adding sample expert profile for user ID:', userId);
      
      // Check if profile already exists
      const existingProfile = await expertService.getExpertProfile(userId);
      
      if (existingProfile) {
        console.log('Expert profile already exists for user ID:', userId);
        return existingProfile;
      }
      
      // Create sample expert profile
      const expertProfile = {
        user_id: userId,
        primary_expertise_areas: ['Startup Strategy', 'Product Development', 'Fundraising'],
        secondary_expertise_areas: ['Marketing', 'Team Building', 'Business Development'],
        industry_experience: {
          years: 10,
          industries: ['SaaS', 'Fintech', 'E-commerce'],
          roles: ['Founder', 'CTO', 'Product Manager']
        },
        functional_experience: {
          areas: ['Engineering', 'Product', 'Strategy'],
          skills: ['Leadership', 'Technical Architecture', 'Agile Methodologies']
        },
        company_stages_experienced: ['seed', 'series_a', 'series_b'] as StartupStage[],
        mentorship_capacity: 5,
        success_stories: [
          'Helped a startup raise $2M in seed funding',
          'Guided a team through a successful product launch',
          'Mentored 3 founders who went on to build successful companies'
        ],
        languages_spoken: ['English', 'Spanish'],
        timezone: 'America/New_York'
      };
      
      const result = await expertService.upsertExpertProfile(expertProfile);
      console.log('Sample expert profile created:', result.id);
      
      return result;
    } catch (error) {
      console.error('Error adding sample expert profile:', error);
      throw error;
    }
  }
}

export const sampleDataService = new SampleDataService();
