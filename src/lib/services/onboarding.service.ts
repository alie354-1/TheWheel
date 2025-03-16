import { supabase } from '../supabase';

export enum UserRole {
  FOUNDER = 'FOUNDER',
  COMPANY_MEMBER = 'COMPANY_MEMBER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER'
}

export enum CompanyStage {
  IDEA_STAGE = 'IDEA_STAGE',
  SOLID_IDEA = 'SOLID_IDEA',
  FORMED_COMPANY = 'FORMED_COMPANY'
}

export enum IndustryCategory {
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  EDUCATION = 'EDUCATION',
  RETAIL = 'RETAIL',
  MANUFACTURING = 'MANUFACTURING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER'
}

export enum UserSkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT'
}

export interface OnboardingData {
  userRole?: UserRole;
  companyStage?: CompanyStage;
  industryCategory?: IndustryCategory;
  skillLevel?: UserSkillLevel;
  goals?: string[];
  preferredTheme?: 'light' | 'dark' | 'system';
  notificationPreferences?: Record<string, boolean>;
}

interface FeatureInfo {
  title: string;
  description: string;
  path: string;
  priority: number;
}

interface SetupProgress {
  current_step: string;
  form_data: OnboardingData;
  completed_steps: string[];
  last_updated: string;
}

class OnboardingService {
  private features: Record<string, FeatureInfo> = {
    idea_playground: {
      title: 'Idea Playground',
      description: 'Explore and develop business ideas with AI assistance',
      path: '/idea-hub/playground',
      priority: 10
    },
    company_formation: {
      title: 'Company Formation',
      description: 'Tools and resources to help form your company legally',
      path: '/company/setup',
      priority: 20
    },
    market_research: {
      title: 'Market Research',
      description: 'Analyze markets and validate your idea',
      path: '/idea-hub/market-validation',
      priority: 30
    },
    idea_refinement: {
      title: 'Idea Refinement',
      description: 'Refine and iterate on your business concept',
      path: '/idea-hub/refinement',
      priority: 40
    },
    cofounder_bot: {
      title: 'AI Cofounder',
      description: 'Brainstorm and plan with an AI cofounder',
      path: '/idea-hub/cofounder-bot',
      priority: 50
    },
    team_management: {
      title: 'Team Management',
      description: 'Manage your team and company structure',
      path: '/company/team',
      priority: 60
    },
    networking: {
      title: 'Networking',
      description: 'Connect with other founders and professionals',
      path: '/community',
      priority: 70
    }
  };

  // Get recommended features based on user profile and onboarding choices
  async getRecommendedFeatures(userId: string): Promise<string[]> {
    try {
      // Get the user profile from the database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('setup_progress')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!profile?.setup_progress?.form_data) {
        return ['idea_playground', 'cofounder_bot', 'networking'];
      }

      const formData = profile.setup_progress.form_data as OnboardingData;
      const recommendations: string[] = [];
      
      // Recommend features based on user role
      if (formData.userRole === UserRole.FOUNDER) {
        // Recommend features based on company stage
        if (formData.companyStage === CompanyStage.IDEA_STAGE) {
          recommendations.push('idea_playground', 'market_research', 'idea_refinement', 'cofounder_bot');
        } else if (formData.companyStage === CompanyStage.SOLID_IDEA) {
          recommendations.push('company_formation', 'market_research', 'idea_refinement');
        } else if (formData.companyStage === CompanyStage.FORMED_COMPANY) {
          recommendations.push('team_management', 'networking');
        }
      } else if (formData.userRole === UserRole.COMPANY_MEMBER) {
        recommendations.push('team_management', 'networking');
      } else if (formData.userRole === UserRole.SERVICE_PROVIDER) {
        recommendations.push('networking', 'market_research');
      }

      // Add recommendations based on skill level
      if (formData.skillLevel === UserSkillLevel.BEGINNER) {
        if (!recommendations.includes('cofounder_bot')) {
          recommendations.push('cofounder_bot');
        }
      }

      // Add recommendations based on goals
      if (formData.goals?.includes('networking')) {
        if (!recommendations.includes('networking')) {
          recommendations.push('networking');
        }
      }

      if (formData.goals?.includes('market_research')) {
        if (!recommendations.includes('market_research')) {
          recommendations.push('market_research');
        }
      }

      // Return unique features, ensuring no duplicates
      return [...new Set(recommendations)];
    } catch (error) {
      console.error('Error getting recommended features:', error);
      return ['idea_playground']; // Default recommendation
    }
  }

  // Get feature information for display
  getFeatureInfo(featureId: string): FeatureInfo {
    return this.features[featureId] || {
      title: 'Feature',
      description: 'Feature description',
      path: '/dashboard',
      priority: 999
    };
  }

  // Save onboarding data to the database
  async saveOnboardingData(userId: string, stepData: Record<string, any>): Promise<void> {
    try {
      // Get existing setup progress
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('setup_progress')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Create or update setup progress
      const setupProgress: SetupProgress = profile?.setup_progress || {
        current_step: 'welcome',
        form_data: {},
        completed_steps: [],
        last_updated: new Date().toISOString()
      };

      // Update form data with new step data
      setupProgress.form_data = {
        ...setupProgress.form_data,
        ...stepData
      };

      // Update timestamp
      setupProgress.last_updated = new Date().toISOString();

      // Save to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ setup_progress: setupProgress })
        .eq('id', userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  }

  // Update current step in setup progress
  async updateCurrentStep(userId: string, step: string): Promise<void> {
    try {
      // Get existing setup progress
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('setup_progress')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Create or update setup progress
      const setupProgress: SetupProgress = profile?.setup_progress || {
        current_step: 'welcome',
        form_data: {},
        completed_steps: [],
        last_updated: new Date().toISOString()
      };

      // Update current step
      setupProgress.current_step = step;

      // If this is a new completed step, add to completed_steps
      if (!setupProgress.completed_steps.includes(step)) {
        setupProgress.completed_steps.push(step);
      }

      // Update timestamp
      setupProgress.last_updated = new Date().toISOString();

      // Save to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ setup_progress: setupProgress })
        .eq('id', userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating current step:', error);
      throw error;
    }
  }

  // Skip onboarding
  async skipOnboarding(userId: string): Promise<void> {
    try {
      // Set up a minimal setup progress that marks onboarding as complete
      const setupProgress: SetupProgress = {
        current_step: 'completion',
        form_data: {},
        completed_steps: ['welcome', 'complete'],
        last_updated: new Date().toISOString()
      };

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({ setup_progress: setupProgress })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      throw error;
    }
  }

  // Get personalized welcome message based on user profile
  async getPersonalizedWelcome(userId: string): Promise<string> {
    try {
      // Get the user profile from the database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Default welcome message
      if (!profile) {
        return 'Welcome to Wheel99!';
      }

      // Personalized welcome based on name
      if (profile.full_name) {
        return `Welcome to Wheel99, ${profile.full_name.split(' ')[0]}!`;
      }

      return 'Welcome to Wheel99!';
    } catch (error) {
      console.error('Error getting personalized welcome:', error);
      return 'Welcome to Wheel99!';
    }
  }
}

export const onboardingService = new OnboardingService();
