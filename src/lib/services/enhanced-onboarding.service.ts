import { supabase } from '../supabase';
import { UserRoleType, CompanyStageType } from '../types/enhanced-profile.types';

export interface EnhancedOnboardingData {
  primaryRole?: UserRoleType;
  additionalRoles?: UserRoleType[];
  companyStage?: CompanyStageType;
  inviteCode?: string;
  serviceCategories?: string[];
  expertise?: string[];
  industryCategory?: string;
  skillLevel?: string;
  goals?: string[];
  preferredTheme?: string;
  notificationPreferences?: Record<string, boolean>;
}

export interface OnboardingStep {
  key: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  roles?: UserRoleType[];
}

class EnhancedOnboardingService {
  private steps: OnboardingStep[] = [
    {
      key: 'welcome',
      title: 'Welcome',
      description: 'Welcome to Wheel99',
      isRequired: true
    },
    {
      key: 'role_selection',
      title: 'Your Role',
      description: 'Tell us about your role',
      isRequired: true
    },
    {
      key: 'company_stage',
      title: 'Company Stage',
      description: 'What stage is your company in?',
      isRequired: true,
      roles: ['founder']
    },
    {
      key: 'invite_code',
      title: 'Join Company',
      description: 'Enter your company invitation code',
      isRequired: true,
      roles: ['company_member']
    },
    {
      key: 'service_categories',
      title: 'Services',
      description: 'What services do you provide?',
      isRequired: true,
      roles: ['service_provider']
    },
    {
      key: 'industry_selection',
      title: 'Industry',
      description: 'Select your industry'
    },
    {
      key: 'skill_level',
      title: 'Experience',
      description: 'Your experience level'
    },
    {
      key: 'goals',
      title: 'Goals',
      description: 'What are your goals?'
    },
    {
      key: 'preferences',
      title: 'Preferences',
      description: 'Set your preferences'
    },
    {
      key: 'completion',
      title: 'Complete',
      description: 'All set up!'
    }
  ];

  /**
   * Get all onboarding steps
   * If role is provided, filter steps by role
   */
  getOnboardingSteps(role?: UserRoleType): OnboardingStep[] {
    if (!role) {
      return this.steps;
    }

    return this.steps.filter(step => {
      // Include step if:
      // 1. It has no role restriction, or
      // 2. The specified role is in the step's roles array
      return !step.roles || step.roles.includes(role);
    });
  }

  /**
   * Get the next step based on the current step and user role
   */
  getNextStep(currentStep: string, role?: UserRoleType): OnboardingStep | null {
    const steps = this.getOnboardingSteps(role);
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    
    if (currentIndex === -1 || currentIndex >= steps.length - 1) {
      return null;
    }
    
    return steps[currentIndex + 1];
  }

  /**
   * Get the previous step based on the current step and user role
   */
  getPreviousStep(currentStep: string, role?: UserRoleType): OnboardingStep | null {
    const steps = this.getOnboardingSteps(role);
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    
    if (currentIndex <= 0) {
      return null;
    }
    
    return steps[currentIndex - 1];
  }

  /**
   * Save onboarding data to the database
   */
  async saveOnboardingData(userId: string, currentStep: string, data: Partial<EnhancedOnboardingData>): Promise<boolean> {
    try {
      // Get existing profile
      const { data: profile, error: profileError } = await supabase
        .from('enhanced_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // Not found error
        console.error('Error fetching profile:', profileError);
        return false;
      }

      // Build updated profile data
      const newProfileData: Record<string, any> = {};
      
      // Map data fields to profile fields
      if (data.primaryRole) newProfileData.primary_role = data.primaryRole;
      if (data.additionalRoles) newProfileData.additional_roles = data.additionalRoles;
      if (data.companyStage) newProfileData.company_stage = data.companyStage;
      if (data.serviceCategories) newProfileData.service_categories = data.serviceCategories;
      if (data.expertise) newProfileData.expertise = data.expertise;
      if (data.industryCategory) newProfileData.industry = data.industryCategory;
      if (data.skillLevel) newProfileData.skill_level = data.skillLevel;
      if (data.goals) newProfileData.goals = data.goals;
      if (data.preferredTheme) newProfileData.preferred_theme = data.preferredTheme;
      
      // Update onboarding progress
      newProfileData.setup_progress = {
        current_step: currentStep,
        form_data: {
          ...(profile?.setup_progress?.form_data || {}),
          ...data
        },
        completed_steps: [
          ...(profile?.setup_progress?.completed_steps || []),
          currentStep
        ]
      };

      // Update or insert profile
      let updateResult;
      if (profile) {
        updateResult = await supabase
          .from('enhanced_profiles')
          .update(newProfileData)
          .eq('user_id', userId);
      } else {
        newProfileData.user_id = userId;
        updateResult = await supabase
          .from('enhanced_profiles')
          .insert([newProfileData]);
      }

      if (updateResult.error) {
        console.error('Error updating profile:', updateResult.error);
        return false;
      }

      // Process specific data
      if (data.inviteCode) {
        // Accept invitation if provided
        await this.processInviteCode(userId, data.inviteCode);
      }

      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return false;
    }
  }

  /**
   * Process a company invitation code
   */
  private async processInviteCode(userId: string, inviteCode: string): Promise<boolean> {
    try {
      // Get invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('company_invitations')
        .select('company_id, role')
        .eq('code', inviteCode)
        .eq('status', 'active')
        .single();

      if (inviteError) {
        console.error('Error fetching invitation:', inviteError);
        return false;
      }

      if (!invitation) {
        console.error('Invalid invitation code');
        return false;
      }

      // Add user to company
      const { error: memberError } = await supabase
        .from('company_members')
        .insert([{
          company_id: invitation.company_id,
          user_id: userId,
          role: invitation.role || 'member',
          joined_at: new Date().toISOString()
        }]);

      if (memberError) {
        console.error('Error adding user to company:', memberError);
        return false;
      }

      // Mark invitation as used
      const { error: updateError } = await supabase
        .from('company_invitations')
        .update({ 
          status: 'used',
          used_by: userId,
          used_at: new Date().toISOString()
        })
        .eq('code', inviteCode);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error processing invitation:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async markOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('enhanced_profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking onboarding complete:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      return false;
    }
  }

  /**
   * Skip onboarding
   */
  async skipOnboarding(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('enhanced_profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          setup_progress: {
            skipped: true,
            skipped_at: new Date().toISOString()
          }
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error skipping onboarding:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      return false;
    }
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(userId: string, inviteCode: string): Promise<boolean> {
    return await this.processInviteCode(userId, inviteCode);
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
