/**
 * Consolidated Profile Service
 * 
 * This service combines functionality from:
 * - profile.service.ts
 * - multi-persona-profile.service.ts
 * - enhanced-profile.service.ts
 */

import { supabase } from '../../supabase';
import {
  UserProfile,
  ProfilePersona,
  ProfileSection,
  SocialLinks,
  UserPreferences,
  ProfileService
} from './types';

/**
 * MultiPersona Profile Service Implementation
 */
export class MultiPersonaProfileService implements ProfileService {
  /**
   * Get a user's profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // First check if user has a multi-persona profile
      const { data: coreData, error: coreError } = await supabase
        .from('user_core_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!coreError && coreData) {
        // User has a multi-persona profile
        // Get all personas for this user
        const { data: personasData, error: personasError } = await supabase
          .from('user_personas')
          .select('*')
          .eq('user_id', userId);

        if (personasError) {
          console.error('Error fetching personas:', personasError);
          return null;
        }

        // Get active persona
        const activePersonaId = coreData.active_persona_id;
        const activePersona = personasData.find(p => p.id === activePersonaId) || personasData[0];

        // Convert to unified UserProfile format
        return {
          id: userId,
          userId: userId,
          displayName: coreData.display_name || coreData.full_name,
          bio: coreData.bio || '',
          position: activePersona?.professional?.title,
          expertise: activePersona?.professional?.expertise_areas || [],
          interests: [],
          avatarUrl: coreData.avatar_url,
          socialLinks: this.convertSocialLinks(activePersona?.network?.social_links),
          createdAt: coreData.account_created_at,
          updatedAt: coreData.last_updated,
          preferences: {
            theme: 'light', // Default value
            language: coreData.locale || 'en',
            timezone: coreData.timezone
          },
          personas: personasData.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            role: p.professional?.title || '',
            area: p.professional?.industry || '',
            expertise: p.professional?.expertise_areas || [],
            avatarUrl: p.avatar_url || coreData.avatar_url,
            isActive: p.is_active || false,
            createdAt: p.created_at,
            updatedAt: p.last_used_at
          })),
          activePersonaId: activePersonaId
        };
      }
      
      // If no multi-persona profile, try to get enhanced profile
      const { data: enhancedData, error: enhancedError } = await supabase
        .from('enhanced_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!enhancedError && enhancedData) {
        // Convert enhanced profile to unified format
        const userProfile: UserProfile = {
          id: userId,
          userId: userId,
          displayName: '',
          bio: '',
          position: '',
          expertise: enhancedData.expertise || [],
          interests: enhancedData.goals || [],
          avatarUrl: '',
          createdAt: enhancedData.created_at,
          updatedAt: enhancedData.updated_at,
          preferences: {
            theme: enhancedData.preferred_theme as any || 'light'
          }
        };
        
        // Try to get basic user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (!userError && userData) {
          userProfile.displayName = userData.display_name || userData.full_name;
          userProfile.avatarUrl = userData.avatar_url;
        }
        
        return userProfile;
      }
      
      // If still no profile, try basic user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        return null;
      }

      // Convert basic user to unified format
      return {
        id: userId,
        userId: userId,
        displayName: userData.display_name || userData.full_name,
        bio: userData.professional_background || '',
        position: '',
        expertise: [],
        interests: [],
        avatarUrl: userData.avatar_url,
        socialLinks: userData.social_links as SocialLinks,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        preferences: {
          theme: 'light' // Default value
        }
      };
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Create a new profile
   */
  async createProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
        
      // For basic profile, insert into users table
      const { error } = await supabase
        .from('users')
        .upsert({
          id: profile.userId,
          display_name: profile.displayName,
          avatar_url: profile.avatarUrl,
          professional_background: profile.bio,
          social_links: profile.socialLinks
        });

      if (error) throw error;

      // Return the created profile
      return profile;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }

  /**
   * Update an existing profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Get current profile to determine which tables to update
      const currentProfile = await this.getProfile(userId);
      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      // If multi-persona profile exists, update that
      if (currentProfile.personas && currentProfile.personas.length > 0) {
        // Update core profile
        const { error: coreError } = await supabase
          .from('user_core_profiles')
          .update({
            display_name: updates.displayName,
            bio: updates.bio,
            avatar_url: updates.avatarUrl,
            locale: updates.preferences?.language,
            timezone: updates.preferences?.timezone
          })
          .eq('id', userId);

        if (coreError) throw coreError;

        // Update active persona if it exists
        if (currentProfile.activePersonaId) {
          // Extract updates for the active persona
          const personaUpdates: any = {};
          if (updates.position) personaUpdates['professional.title'] = updates.position;
          if (updates.expertise) personaUpdates['professional.expertise_areas'] = updates.expertise;

          if (Object.keys(personaUpdates).length > 0) {
            const { error: personaError } = await supabase
              .from('user_personas')
              .update(personaUpdates)
              .eq('id', currentProfile.activePersonaId);

            if (personaError) throw personaError;
          }
        }
      } else {
        // Otherwise, update basic profile
        const { error } = await supabase
          .from('users')
          .update({
            display_name: updates.displayName,
            avatar_url: updates.avatarUrl,
            professional_background: updates.bio,
            social_links: updates.socialLinks
          })
          .eq('id', userId);

        if (error) throw error;

        // Check if enhanced profile exists and update if needed
        const { data: enhancedExists, error: checkError } = await supabase
          .from('enhanced_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!checkError && enhancedExists) {
          const { error: enhancedError } = await supabase
            .from('enhanced_profiles')
            .update({
              expertise: updates.expertise,
              goals: updates.interests,
              preferred_theme: updates.preferences?.theme
            })
            .eq('user_id', userId);

          if (enhancedError) throw enhancedError;
        }
      }

      // Return updated profile
      const updatedProfile = await this.getProfile(userId);
      if (!updatedProfile) {
        throw new Error('Could not retrieve updated profile');
      }
      return updatedProfile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  /**
   * Get profile sections
   */
  async getProfileSections(userId: string, personaId?: string): Promise<ProfileSection[]> {
    try {
      let query = supabase
        .from('profile_sections')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      if (personaId) {
        query = query.eq('persona_id', personaId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(section => ({
        id: section.id,
        userId: section.user_id,
        personaId: section.persona_id,
        sectionType: section.section_type,
        title: section.title,
        content: section.content,
        order: section.order,
        isVisible: section.is_visible,
        createdAt: section.created_at,
        updatedAt: section.updated_at
      }));
    } catch (error) {
      console.error('Error in getProfileSections:', error);
      return [];
    }
  }

  /**
   * Add a profile section
   */
  async addProfileSection(section: Omit<ProfileSection, 'id'>): Promise<ProfileSection> {
    try {
      const { data, error } = await supabase
        .from('profile_sections')
        .insert([
          {
            user_id: section.userId,
            persona_id: section.personaId,
            section_type: section.sectionType,
            title: section.title,
            content: section.content,
            order: section.order,
            is_visible: section.isVisible
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        personaId: data.persona_id,
        sectionType: data.section_type,
        title: data.title,
        content: data.content,
        order: data.order,
        isVisible: data.is_visible,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in addProfileSection:', error);
      throw error;
    }
  }

  /**
   * Update a profile section
   */
  async updateProfileSection(sectionId: string, updates: Partial<ProfileSection>): Promise<ProfileSection> {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.order !== undefined) updateData.order = updates.order;
      if (updates.isVisible !== undefined) updateData.is_visible = updates.isVisible;

      const { data, error } = await supabase
        .from('profile_sections')
        .update(updateData)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        personaId: data.persona_id,
        sectionType: data.section_type,
        title: data.title,
        content: data.content,
        order: data.order,
        isVisible: data.is_visible,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in updateProfileSection:', error);
      throw error;
    }
  }

  /**
   * Remove a profile section
   */
  async removeProfileSection(sectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profile_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in removeProfileSection:', error);
      throw error;
    }
  }

  /**
   * Get user personas
   */
  async getPersonas(userId: string): Promise<ProfilePersona[]> {
    try {
      // First try multi-persona system
      const { data, error } = await supabase
        .from('user_personas')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching personas:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          role: p.professional?.title || '',
          area: p.professional?.industry || '',
          expertise: p.professional?.expertise_areas || [],
          avatarUrl: p.avatar_url,
          isActive: p.is_active || false,
          createdAt: p.created_at,
          updatedAt: p.last_used_at
        }));
      }

      // If no multi-persona data, create a default persona based on user profile
      const profile = await this.getProfile(userId);
      if (!profile) return [];

      // Return a single default persona
      return [{
        id: 'default',
        name: 'Default Profile',
        description: 'Default user profile',
        role: profile.position || '',
        area: '',
        expertise: profile.expertise || [],
        avatarUrl: profile.avatarUrl,
        isActive: true,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }];
    } catch (error) {
      console.error('Error in getPersonas:', error);
      return [];
    }
  }

  /**
   * Create a new persona
   */
  async createPersona(userId: string, persona: Omit<ProfilePersona, 'id'>): Promise<ProfilePersona> {
    try {
      // Check if user has a multi-persona profile
      const { data: coreExists, error: checkError } = await supabase
        .from('user_core_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      // If no core profile, create one
      if (checkError && checkError.code === 'PGRST116') {
        // Get basic user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const user = userData?.user;
        if (!user) throw new Error('User not found');

        // Create core profile
        const { error: insertError } = await supabase
          .from('user_core_profiles')
          .insert([{
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            display_name: user.user_metadata?.preferred_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            verified: user.email_confirmed_at ? true : false,
            created_at: new Date().toISOString(),
            last_active_at: new Date().toISOString(),
            system_metadata: {
              profile_version: 1,
              last_updated: new Date().toISOString(),
              two_factor_enabled: false
            }
          }]);

        if (insertError) throw insertError;
      }

      // Create the persona
      const { data, error } = await supabase
        .from('user_personas')
        .insert([{
          user_id: userId,
          name: persona.name,
          description: persona.description,
          type: 'custom',
          is_active: persona.isActive,
          is_public: false,
          avatar_url: persona.avatarUrl,
          professional: {
            title: persona.role,
            industry: persona.area,
            expertise_areas: persona.expertise,
            role_category: 'CUSTOM'
          },
          visibility_settings: {
            discoverable_as: ['custom'],
            visible_to: ['connections'],
            hidden_fields: []
          },
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // If this is active, update other personas and core profile
      if (persona.isActive) {
        await this.setActivePersona(userId, data.id);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        role: data.professional?.title || '',
        area: data.professional?.industry || '',
        expertise: data.professional?.expertise_areas || [],
        avatarUrl: data.avatar_url,
        isActive: data.is_active || false,
        createdAt: data.created_at,
        updatedAt: data.last_used_at
      };
    } catch (error) {
      console.error('Error in createPersona:', error);
      throw error;
    }
  }

  /**
   * Update a persona
   */
  async updatePersona(personaId: string, updates: Partial<ProfilePersona>): Promise<ProfilePersona> {
    try {
      // Get current persona
      const { data: current, error: fetchError } = await supabase
        .from('user_personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (fetchError) throw fetchError;

      // Prepare updates
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

      // Handle nested properties
      const professional = { ...current.professional };
      if (updates.role !== undefined) professional.title = updates.role;
      if (updates.area !== undefined) professional.industry = updates.area;
      if (updates.expertise !== undefined) professional.expertise_areas = updates.expertise;
      updateData.professional = professional;

      // Update the persona
      const { data, error } = await supabase
        .from('user_personas')
        .update(updateData)
        .eq('id', personaId)
        .select()
        .single();

      if (error) throw error;

      // If isActive status changed, handle it
      if (updates.isActive !== undefined && updates.isActive !== current.is_active) {
        if (updates.isActive) {
          await this.setActivePersona(data.user_id, personaId);
        }
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        role: data.professional?.title || '',
        area: data.professional?.industry || '',
        expertise: data.professional?.expertise_areas || [],
        avatarUrl: data.avatar_url,
        isActive: data.is_active || false,
        createdAt: data.created_at,
        updatedAt: data.last_used_at
      };
    } catch (error) {
      console.error('Error in updatePersona:', error);
      throw error;
    }
  }

  /**
   * Delete a persona
   */
  async deletePersona(personaId: string): Promise<void> {
    try {
      // Get persona info
      const { data: persona, error: fetchError } = await supabase
        .from('user_personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (fetchError) throw fetchError;

      // Don't allow deleting the last persona
      const { data: personasCount, error: countError } = await supabase
        .from('user_personas')
        .select('id')
        .eq('user_id', persona.user_id);

      if (countError) throw countError;
      if (!personasCount || personasCount.length <= 1) {
        throw new Error('Cannot delete the only persona');
      }

      // If this is the active persona, switch to another one
      if (persona.is_active) {
        const otherPersona = personasCount.find(p => p.id !== personaId);
        if (otherPersona) {
          await this.setActivePersona(persona.user_id, otherPersona.id);
        }
      }

      // Delete the persona
      const { error } = await supabase
        .from('user_personas')
        .delete()
        .eq('id', personaId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in deletePersona:', error);
      throw error;
    }
  }

  /**
   * Set active persona
   */
  async setActivePersona(userId: string, personaId: string): Promise<void> {
    try {
      // Verify the persona belongs to the user
      const { data, error } = await supabase
        .from('user_personas')
        .select('id')
        .eq('user_id', userId)
        .eq('id', personaId);

      if (error || !data || data.length === 0) {
        throw new Error('Persona not found or not owned by user');
      }

      // Update the core profile
      const { error: updateError } = await supabase
        .from('user_core_profiles')
        .update({
          active_persona_id: personaId
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Mark this persona as active
      const { error: personaError } = await supabase
        .from('user_personas')
        .update({
          is_active: true,
          last_used_at: new Date().toISOString()
        })
        .eq('id', personaId);

      if (personaError) throw personaError;

      // Mark all other personas as inactive
      const { error: otherError } = await supabase
        .from('user_personas')
        .update({
          is_active: false
        })
        .eq('user_id', userId)
        .neq('id', personaId);

      if (otherError) throw otherError;
    } catch (error) {
      console.error('Error in setActivePersona:', error);
      throw error;
    }
  }

  /**
   * Get active persona
   */
  async getActivePersona(userId: string): Promise<ProfilePersona | null> {
    try {
      // Get the active persona ID from core profile
      const { data: coreData, error: coreError } = await supabase
        .from('user_core_profiles')
        .select('active_persona_id')
        .eq('id', userId)
        .single();

      if (coreError) {
        console.error('Error fetching core profile:', coreError);
        
        // If using old profile system, return default persona
        const personas = await this.getPersonas(userId);
        if (personas.length > 0) {
          return personas[0];
        }
        return null;
      }

      if (!coreData.active_persona_id) {
        // No active persona set, find one marked as active
        const { data, error } = await supabase
          .from('user_personas')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (error) {
          // Try to get any persona
          const { data: anyPersona, error: anyError } = await supabase
            .from('user_personas')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();

          if (anyError) return null;
          
          // Set this persona as active
          await this.setActivePersona(userId, anyPersona.id);
          
          return {
            id: anyPersona.id,
            name: anyPersona.name,
            description: anyPersona.description || '',
            role: anyPersona.professional?.title || '',
            area: anyPersona.professional?.industry || '',
            expertise: anyPersona.professional?.expertise_areas || [],
            avatarUrl: anyPersona.avatar_url,
            isActive: true,
            createdAt: anyPersona.created_at,
            updatedAt: anyPersona.last_used_at
          };
        }
        
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          role: data.professional?.title || '',
          area: data.professional?.industry || '',
          expertise: data.professional?.expertise_areas || [],
          avatarUrl: data.avatar_url,
          isActive: true,
          createdAt: data.created_at,
          updatedAt: data.last_used_at
        };
      }

      // Get the active persona
      const { data: persona, error: personaError } = await supabase
        .from('user_personas')
        .select('*')
        .eq('id', coreData.active_persona_id)
        .single();

      if (personaError) {
        console.error('Error fetching active persona:', personaError);
        return null;
      }

      return {
        id: persona.id,
        name: persona.name,
        description: persona.description || '',
        role: persona.professional?.title || '',
        area: persona.professional?.industry || '',
        expertise: persona.professional?.expertise_areas || [],
        avatarUrl: persona.avatar_url,
        isActive: true,
        createdAt: persona.created_at,
        updatedAt: persona.last_used_at
      };
    } catch (error) {
      console.error('Error in getActivePersona:', error);
      return null;
    }
  }

  /**
   * Helper method to convert social links from various formats
   */
  private convertSocialLinks(links: any[] | undefined): SocialLinks | undefined {
    if (!links) return undefined;
    
    const socialLinks: SocialLinks = {};
    
    if (Array.isArray(links)) {
      // Convert from array format
      for (const link of links) {
        if (link.platform && link.url) {
          socialLinks[link.platform.toLowerCase()] = link.url;
        }
      }
    } else if (typeof links === 'object') {
      // Already in object format
      return links as SocialLinks;
    }
    
    return socialLinks;
  }
}

// Export singleton instance
export const profileServiceInstance = new MultiPersonaProfileService();