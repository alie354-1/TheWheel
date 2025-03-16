import { supabase } from '../supabase';
import {
  CoreIdentity,
  Persona,
  UserProfile,
  SystemMetadata,
  OnboardingState
} from '../types/multi-persona-profile.types';

/**
 * Enhanced ProfileService for the multi-persona system
 * 
 * This service handles all operations related to user profiles, personas,
 * and persona context switching.
 */
export class MultiPersonaProfileService {
  /**
   * Get a user's complete profile with all personas
   * 
   * @param userId The user's ID
   * @returns Promise with the complete user profile or null
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Get core profile
      const { data: coreData, error: coreError } = await supabase
        .from('user_core_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (coreError) {
        // If profile doesn't exist, create a default one
        if (coreError.code === 'PGRST116') {
          return this.createDefaultProfile(userId);
        }
        console.error('Error fetching core profile:', coreError);
        return null;
      }

      // Get all personas for this user
      const { data: personasData, error: personasError } = await supabase
        .from('user_personas')
        .select('*')
        .eq('user_id', userId);

      if (personasError) {
        console.error('Error fetching personas:', personasError);
        return null;
      }

      // Construct complete user profile
      const profile: UserProfile = {
        core: coreData as CoreIdentity,
        active_persona_id: coreData.active_persona_id,
        system: coreData.system_metadata as SystemMetadata || this.getDefaultSystemMetadata(),
        global_settings: {
          default_persona_id: personasData.find(p => p.is_active)?.id,
          auto_switch_personas: false,
          cross_persona_notifications: true
        }
      };

      return profile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Get all personas belonging to a user
   * 
   * @param userId The user's ID
   * @returns Promise with array of personas
   */
  async getPersonas(userId: string): Promise<Persona[]> {
    try {
      const { data, error } = await supabase
        .from('user_personas')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching personas:', error);
        return [];
      }

      return data as Persona[];
    } catch (error) {
      console.error('Error in getPersonas:', error);
      return [];
    }
  }

  /**
   * Get a user's currently active persona
   * 
   * @param userId The user's ID
   * @returns Promise with the active persona or null
   */
  async getActivePersona(userId: string): Promise<Persona | null> {
    try {
      // First try to get the persona marked in the core profile
      const profile = await this.getProfile(userId);
      
      if (profile?.active_persona_id) {
        const { data, error } = await supabase
          .from('user_personas')
          .select('*')
          .eq('id', profile.active_persona_id)
          .single();

        if (!error && data) {
          return data as Persona;
        }
      }

      // If no active persona in core profile, find one marked as active
      const { data, error } = await supabase
        .from('user_personas')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        // If no active persona found, get the first persona or create a default one
        const personas = await this.getPersonas(userId);
        if (personas.length > 0) {
          // Set the first persona as active
          await this.setActivePersona(userId, personas[0].id);
          return personas[0];
        } else {
          // Create a default persona
          const newPersona = await this.createDefaultPersona(userId);
          return newPersona;
        }
      }

      return data as Persona;
    } catch (error) {
      console.error('Error in getActivePersona:', error);
      return null;
    }
  }

  /**
   * Get a specific persona by ID
   * 
   * @param personaId The persona's ID
   * @returns Promise with the persona or null
   */
  async getPersonaById(personaId: string): Promise<Persona | null> {
    try {
      const { data, error } = await supabase
        .from('user_personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (error) {
        console.error('Error fetching persona:', error);
        return null;
      }

      return data as Persona;
    } catch (error) {
      console.error('Error in getPersonaById:', error);
      return null;
    }
  }

  /**
   * Create a new persona for a user
   * 
   * @param userId The user's ID
   * @param personaData Initial data for the new persona
   * @returns Promise with the created persona or null
   */
  async createPersona(userId: string, personaData: Partial<Persona>): Promise<Persona | null> {
    try {
      // Ensure core profile exists
      const profile = await this.getProfile(userId);
      if (!profile) {
        console.error('Cannot create persona: User profile not found');
        return null;
      }

      const type = personaData.type || 'custom';
      
      // Apply defaults based on type
      const defaultData = this.getDefaultPersonaData(type);
      const mergedData = {
        ...defaultData,
        ...personaData,
        user_id: userId,
        created_at: new Date().toISOString()
      };

      // Insert the new persona
      const { data, error } = await supabase
        .from('user_personas')
        .insert([mergedData])
        .select()
        .single();

      if (error) {
        console.error('Error creating persona:', error);
        return null;
      }

      // Create onboarding state for this persona
      await this.createOnboardingState(userId, data.id);

      return data as Persona;
    } catch (error) {
      console.error('Error in createPersona:', error);
      return null;
    }
  }

  /**
   * Update an existing persona
   * 
   * @param personaId The persona's ID
   * @param updates Updates to apply to the persona
   * @returns Promise with the updated persona or null
   */
  async updatePersona(personaId: string, updates: Partial<Persona>): Promise<Persona | null> {
    try {
      // Fetch current persona to verify ownership
      const current = await this.getPersonaById(personaId);
      if (!current) {
        console.error('Persona not found');
        return null;
      }

      // Apply updates
      const { data, error } = await supabase
        .from('user_personas')
        .update({
          ...updates,
          // Don't allow these fields to be updated directly
          user_id: undefined,
          id: undefined,
          created_at: undefined
        })
        .eq('id', personaId)
        .select()
        .single();

      if (error) {
        console.error('Error updating persona:', error);
        return null;
      }

      return data as Persona;
    } catch (error) {
      console.error('Error in updatePersona:', error);
      return null;
    }
  }

  /**
   * Delete a persona
   * 
   * @param personaId The persona's ID
   * @returns Promise<boolean> indicating success
   */
  async deletePersona(personaId: string): Promise<boolean> {
    try {
      // Fetch current persona to verify it exists
      const persona = await this.getPersonaById(personaId);
      if (!persona) {
        console.error('Persona not found');
        return false;
      }

      // Don't allow deleting the last persona
      const { data: personasCount, error: countError } = await supabase
        .from('user_personas')
        .select('id')
        .eq('user_id', persona.user_id);

      if (countError || !personasCount || personasCount.length <= 1) {
        console.error('Cannot delete the only persona');
        return false;
      }

      // If this is the active persona, switch to another one
      if (persona.is_active) {
        const otherPersona = personasCount.find(p => p.id !== personaId);
        if (otherPersona) {
          await this.setActivePersona(persona.user_id, otherPersona.id);
        }
      }

      // Delete onboarding state first (foreign key constraint)
      await supabase
        .from('onboarding_state')
        .delete()
        .eq('persona_id', personaId);

      // Delete the persona
      const { error } = await supabase
        .from('user_personas')
        .delete()
        .eq('id', personaId);

      if (error) {
        console.error('Error deleting persona:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePersona:', error);
      return false;
    }
  }

  /**
   * Set a specific persona as the active one
   * 
   * @param userId The user's ID
   * @param personaId The persona to set as active
   * @returns Promise<boolean> indicating success
   */
  async setActivePersona(userId: string, personaId: string): Promise<boolean> {
    try {
      // Verify the persona belongs to the user
      const { data, error } = await supabase
        .from('user_personas')
        .select('id')
        .eq('user_id', userId)
        .eq('id', personaId);

      if (error || !data || data.length === 0) {
        console.error('Persona not found or not owned by user');
        return false;
      }

      // Update the core profile
      const { error: updateError } = await supabase
        .from('user_core_profiles')
        .update({
          active_persona_id: personaId
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating active persona in core profile:', updateError);
        return false;
      }

      // Mark this persona as active
      const { error: personaError } = await supabase
        .from('user_personas')
        .update({
          is_active: true,
          last_used_at: new Date().toISOString()
        })
        .eq('id', personaId);

      if (personaError) {
        console.error('Error marking persona as active:', personaError);
        return false;
      }

      // Mark all other personas as inactive
      const { error: otherError } = await supabase
        .from('user_personas')
        .update({
          is_active: false
        })
        .eq('user_id', userId)
        .neq('id', personaId);

      if (otherError) {
        console.error('Error marking other personas as inactive:', otherError);
        // Non-critical error, don't return false
      }

      // Record the persona switch
      await this.recordPersonaSwitch(userId, personaId, 'manual');

      return true;
    } catch (error) {
      console.error('Error in setActivePersona:', error);
      return false;
    }
  }

  /**
   * Evaluate context rules to determine if a persona switch is needed
   * 
   * @param userId The user's ID
   * @param context The current context type
   * @param contextValue The current context value
   * @returns Promise with the persona ID to switch to, or null if no switch needed
   */
  async evaluateContextRules(
    userId: string, 
    context: string, 
    contextValue: string
  ): Promise<string | null> {
    try {
      // Get rules for this user and context, ordered by priority
      const { data, error } = await supabase
        .from('persona_context_rules')
        .select('*')
        .eq('user_id', userId)
        .eq('context', context)
        .order('priority', { ascending: false });

      if (error || !data || data.length === 0) {
        return null; // No rules found
      }

      // Test each rule in priority order
      for (const rule of data) {
        try {
          const pattern = new RegExp(rule.condition);
          if (pattern.test(contextValue)) {
            // Found a matching rule
            return rule.persona_id;
          }
        } catch (e) {
          console.error('Invalid regex in rule:', rule.condition, e);
          continue;
        }
      }

      return null; // No matching rules
    } catch (error) {
      console.error('Error in evaluateContextRules:', error);
      return null;
    }
  }

  /**
   * Add a new context switching rule
   * 
   * @param userId The user's ID
   * @param personaId The persona to switch to
   * @param context The context type
   * @param condition The regex condition
   * @param priority The rule priority (higher = evaluated first)
   * @returns Promise<boolean> indicating success
   */
  async addContextRule(
    userId: string,
    personaId: string,
    context: string,
    condition: string,
    priority: number = 0
  ): Promise<boolean> {
    try {
      // Verify the persona exists and belongs to the user
      const { data, error } = await supabase
        .from('user_personas')
        .select('id')
        .eq('user_id', userId)
        .eq('id', personaId);

      if (error || !data || data.length === 0) {
        console.error('Persona not found or not owned by user');
        return false;
      }

      // Add the rule
      const { error: ruleError } = await supabase
        .from('persona_context_rules')
        .insert([{
          user_id: userId,
          persona_id: personaId,
          context,
          condition,
          priority
        }]);

      if (ruleError) {
        console.error('Error adding context rule:', ruleError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addContextRule:', error);
      return false;
    }
  }

  /**
   * Get onboarding state for a specific persona
   * 
   * @param userId The user's ID
   * @param personaId The persona ID
   * @returns Promise with the onboarding state or null
   */
  async getOnboardingState(userId: string, personaId: string): Promise<OnboardingState | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_state')
        .select('*')
        .eq('user_id', userId)
        .eq('persona_id', personaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No row found
          return this.createOnboardingState(userId, personaId);
        }
        console.error('Error fetching onboarding state:', error);
        return null;
      }

      return data as OnboardingState;
    } catch (error) {
      console.error('Error in getOnboardingState:', error);
      return null;
    }
  }

  /**
   * Update onboarding state for a specific persona
   * 
   * @param userId The user's ID
   * @param personaId The persona ID
   * @param updates Updates to apply to the onboarding state
   * @returns Promise with the updated state or null
   */
  async updateOnboardingState(
    userId: string,
    personaId: string,
    updates: Partial<OnboardingState>
  ): Promise<OnboardingState | null> {
    try {
      // Ensure onboarding state exists
      const current = await this.getOnboardingState(userId, personaId);
      if (!current) {
        console.error('Onboarding state not found');
        return null;
      }

      // Apply updates
      const { data, error } = await supabase
        .from('onboarding_state')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('persona_id', personaId)
        .select()
        .single();

      if (error) {
        console.error('Error updating onboarding state:', error);
        return null;
      }

      return data as OnboardingState;
    } catch (error) {
      console.error('Error in updateOnboardingState:', error);
      return null;
    }
  }

  /**
   * Check if onboarding is complete for a specific persona
   * 
   * @param userId The user's ID
   * @param personaId The persona ID
   * @returns Promise<boolean> indicating if onboarding is complete
   */
  async isOnboardingComplete(userId: string, personaId: string): Promise<boolean> {
    try {
      const state = await this.getOnboardingState(userId, personaId);
      return state?.is_complete || false;
    } catch (error) {
      console.error('Error in isOnboardingComplete:', error);
      return false;
    }
  }

  /**
   * Check if any of the user's personas need onboarding
   * 
   * @param userId The user's ID
   * @returns Promise<{needsOnboarding: boolean, personaId?: string}>
   */
  async checkOnboardingNeeded(userId: string): Promise<{needsOnboarding: boolean, personaId?: string}> {
    try {
      // Get all personas
      const personas = await this.getPersonas(userId);
      
      // Check each persona's onboarding state
      for (const persona of personas) {
        const complete = await this.isOnboardingComplete(userId, persona.id);
        if (!complete) {
          return { needsOnboarding: true, personaId: persona.id };
        }
      }
      
      return { needsOnboarding: false };
    } catch (error) {
      console.error('Error in checkOnboardingNeeded:', error);
      return { needsOnboarding: false };
    }
  }

  // Private helper methods

  /**
   * Create a default profile for a new user
   */
  private async createDefaultProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Try to get user data from auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error('Error fetching auth user data:', authError);
        return null;
      }

      const user = authData.user;
      
      // Create core profile
      const coreProfile: CoreIdentity = {
        id: userId,
        email: user.email || '',
        full_name: null,
        avatar_url: null,
        verified: user.email_confirmed_at !== null,
        account_created_at: user.created_at || new Date().toISOString(),
        account_status: 'active'
      };
      
      // Create system metadata with 2FA info
      const systemMetadata: SystemMetadata = {
        profile_version: 1,
        last_updated: new Date().toISOString(),
        two_factor_enabled: user.factors ? user.factors.length > 0 : false
      };

      const { error: coreError } = await supabase
        .from('user_core_profiles')
        .insert([coreProfile]);

      if (coreError) {
        console.error('Error creating core profile:', coreError);
        return null;
      }

      // Create default persona
      const persona = await this.createDefaultPersona(userId);
      if (!persona) {
        console.error('Error creating default persona');
        return null;
      }

      // Set as active persona
      await this.setActivePersona(userId, persona.id);

      // Use the system metadata we created with 2FA info

      // Return the complete profile
      return {
        core: coreProfile,
        active_persona_id: persona.id,
        system: systemMetadata,
        global_settings: {
          default_persona_id: persona.id,
          auto_switch_personas: false,
          cross_persona_notifications: true
        }
      };
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      return null;
    }
  }

  /**
   * Create a default persona for a user
   */
  private async createDefaultPersona(userId: string): Promise<Persona | null> {
    try {
      const defaultData = this.getDefaultPersonaData('custom');
      
      // Insert the new persona
      const { data, error } = await supabase
        .from('user_personas')
        .insert([{
          ...defaultData,
          user_id: userId,
          name: 'Primary Profile',
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating default persona:', error);
        return null;
      }

      // Create onboarding state for this persona
      await this.createOnboardingState(userId, data.id);

      return data as Persona;
    } catch (error) {
      console.error('Error in createDefaultPersona:', error);
      return null;
    }
  }

  /**
   * Create onboarding state for a persona
   */
  private async createOnboardingState(userId: string, personaId: string): Promise<OnboardingState | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_state')
        .insert([{
          user_id: userId,
          persona_id: personaId,
          current_step: 'welcome',
          completed_steps: [],
          form_data: {},
          is_complete: false,
          last_updated: new Date().toISOString(),
          metrics: {
            step_completion_times: {},
            total_time_spent: 0
          }
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating onboarding state:', error);
        return null;
      }

      return data as OnboardingState;
    } catch (error) {
      console.error('Error in createOnboardingState:', error);
      return null;
    }
  }

  /**
   * Record a persona switch for analytics and ML recommendations
   */
  private async recordPersonaSwitch(
    userId: string,
    toPersonaId: string,
    trigger: 'manual' | 'auto' | 'rule',
    context?: string
  ): Promise<void> {
    try {
      // Get the current active persona ID
      const profile = await this.getProfile(userId);
      const fromPersonaId = profile?.active_persona_id;

      if (fromPersonaId === toPersonaId) {
        return; // No switch actually happening
      }

      // Record the switch
      await supabase
        .from('persona_switch_history')
        .insert([{
          user_id: userId,
          from_persona_id: fromPersonaId,
          to_persona_id: toPersonaId,
          trigger,
          context,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error recording persona switch:', error);
    }
  }

  /**
   * Get default persona data based on type
   */
  private getDefaultPersonaData(type: string): Partial<Persona> {
    const base = {
      is_public: false,
      visibility_settings: {
        discoverable_as: [type] as ('founder' | 'service_provider' | 'company_member' | 'investor' | 'advisor')[],
        visible_to: ['public'] as ('public' | 'connections' | 'specific_companies' | 'specific_users')[],
        hidden_fields: []
      }
    };

    switch (type) {
      case 'founder':
        return {
          ...base,
          name: 'Founder Profile',
          type: 'founder',
          professional: {
            role_category: RoleCategory.FOUNDER
          }
        };
      case 'service_provider':
        return {
          ...base,
          name: 'Service Provider Profile',
          type: 'service_provider',
          professional: {
            role_category: RoleCategory.SERVICE_PROVIDER
          }
        };
      case 'company_member':
        return {
          ...base,
          name: 'Company Member Profile',
          type: 'company_member',
          professional: {
            role_category: RoleCategory.COMPANY_MEMBER
          }
        };
      case 'investor':
        return {
          ...base,
          name: 'Investor Profile',
          type: 'investor',
          professional: {
            role_category: RoleCategory.INVESTOR
          }
        };
      case 'advisor':
        return {
          ...base,
          name: 'Advisor Profile',
          type: 'advisor',
          professional: {
            role_category: RoleCategory.ADVISOR
          }
        };
      default:
        return {
          ...base,
          name: 'Custom Profile',
          type: 'custom',
          professional: {
            role_category: RoleCategory.CUSTOM
          }
        };
    }
  }

  /**
   * Get default system metadata
   */
  private getDefaultSystemMetadata(): SystemMetadata {
    return {
      profile_version: 1,
      last_updated: new Date().toISOString(),
      two_factor_enabled: false
    };
  }
}

// Define enum here to avoid circular import
enum RoleCategory {
  FOUNDER = 'FOUNDER',
  COMPANY_MEMBER = 'COMPANY_MEMBER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  INVESTOR = 'INVESTOR',
  ADVISOR = 'ADVISOR',
  COMMUNITY_MEMBER = 'COMMUNITY_MEMBER',
  CUSTOM = 'CUSTOM'
}

// Export singleton instance
export const multiPersonaProfileService = new MultiPersonaProfileService();
