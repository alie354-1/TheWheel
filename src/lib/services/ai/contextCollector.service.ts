import { supabase } from '../../utils/supabaseClient';
import { NewCompanyDomainProgress } from '../../types/new_journey.types';

/**
 * Context Collector Service
 * Collects context about a company's journey for AI recommendations
 */
export class ContextCollectorService {
  /**
   * Collect all relevant context about a company journey for AI processing
   */
  public async collectCompanyContext(companyJourneyId: string): Promise<any> {
    // Collect company steps
    const stepsData = await this.collectStepsData(companyJourneyId);
    
    // Collect company progress
    const progressData = await this.collectProgressData(companyJourneyId);
    
    // Collect company profile
    const profileData = await this.collectCompanyProfile(companyJourneyId);
    
    // Combine all context
    return {
      steps: stepsData,
      progress: progressData,
      profile: profileData,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Collect information about the company's steps
   */
  private async collectStepsData(companyJourneyId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('company_journey_steps_new')
        .select('*')
        .eq('journey_id', companyJourneyId);
        
      if (error) {
        console.error('Error fetching company steps:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error collecting steps data:', error);
      return [];
    }
  }
  
  /**
   * Collect information about the company's progress
   */
  private async collectProgressData(companyJourneyId: string): Promise<NewCompanyDomainProgress[]> {
    try {
      const { data, error } = await supabase
        .from('company_domain_progress')
        .select('*')
        .eq('company_journey_id', companyJourneyId);
        
      if (error) {
        console.error('Error fetching company progress:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error collecting progress data:', error);
      return [];
    }
  }
  
  /**
   * Collect information about the company profile
   */
  private async collectCompanyProfile(companyJourneyId: string): Promise<any> {
    try {
      // Get the company ID from the journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('company_journeys_new')
        .select('company_id')
        .eq('id', companyJourneyId)
        .single();
        
      if (journeyError || !journeyData) {
        console.error('Error fetching company journey:', journeyError);
        return null;
      }
      
      // Get the company profile
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', journeyData.company_id)
        .single();
        
      if (error) {
        console.error('Error fetching company profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error collecting company profile:', error);
      return null;
    }
  }
}
