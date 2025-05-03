/**
 * Enhanced Idea Hub API Service
 * Handles communication with the backend for idea-related operations
 */

import { supabase, handleSupabaseError } from '../supabaseClient';
import { EnhancedIdeaPlaygroundIdea, IdeaFilters, OwnershipType } from '../../types';

/**
 * Fetch ideas from the database with optional filtering
 */
export const fetchIdeas = async (filters?: IdeaFilters): Promise<EnhancedIdeaPlaygroundIdea[]> => {
  try {
    // Start with the base query
    let query = supabase
      .from('idea_playground_ideas')
      .select('*');
    
    // Apply filters if provided
    if (filters) {
      if (filters.ideaType && filters.ideaType.length > 0) {
        query = query.in('idea_type', filters.ideaType);
      }
      
      if (filters.integrationStatus && filters.integrationStatus.length > 0) {
        query = query.in('integration_status', filters.integrationStatus);
      }
      
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      
      if (filters.isSaved) {
        query = query.eq('is_saved', true);
      }
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error fetching ideas: ${error.message}`);
    }
    
    // Transform the data to match our enhanced idea structure
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title || 'Untitled Idea',
      description: item.description || '',
      
      // Ownership and creator information
      creatorId: item.creator_id,
      ownershipType: (item.ownership_type || 'personal') as OwnershipType,
      
      ideaType: (item.idea_type || 'new_feature') as any,
      companyId: item.company_id,
      companyName: item.company_name,
      companyContext: item.company_context || {},
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_saved: item.is_saved || false,
      integration: {
        status: (item.integration_status || 'draft') as any,
        approvedBy: item.approved_by,
        approvalDate: item.approval_date,
        targetFeatureId: item.target_feature_id
      }
    })) as EnhancedIdeaPlaygroundIdea[];
    
  } catch (error) {
    console.error('Error in fetchIdeas:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

/**
 * Create a new idea
 */
export const createIdea = async (ideaData: Partial<EnhancedIdeaPlaygroundIdea>): Promise<string | null> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Transform the enhanced idea structure to match the database schema
    const dbData = {
      title: ideaData.title || 'New Idea',
      description: ideaData.description || '',
      idea_type: ideaData.ideaType || 'new_feature',
      
      // Set creator and ownership
      creator_id: user.id,
      ownership_type: ideaData.ownershipType || 'personal',
      
      company_id: ideaData.companyId,
      company_name: ideaData.companyName,
      company_context: ideaData.companyContext || {},
      integration_status: ideaData.integration?.status || 'draft',
      approved_by: ideaData.integration?.approvedBy,
      approval_date: ideaData.integration?.approvalDate,
      target_feature_id: ideaData.integration?.targetFeatureId,
      is_saved: ideaData.is_saved || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('idea_playground_ideas')
      .insert(dbData)
      .select('id')
      .single();
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error creating idea: ${error.message}`);
    }
    
    return data?.id || null;
    
  } catch (error) {
    console.error('Error in createIdea:', error);
    return null;
  }
};

/**
 * Update an existing idea
 */
export const updateIdea = async (id: string, ideaData: Partial<EnhancedIdeaPlaygroundIdea>): Promise<boolean> => {
  try {
    // Transform the enhanced idea structure to match the database schema
    const dbData = {
      title: ideaData.title,
      description: ideaData.description,
      idea_type: ideaData.ideaType,
      company_id: ideaData.companyId,
      company_name: ideaData.companyName,
      company_context: ideaData.companyContext,
      integration_status: ideaData.integration?.status,
      approved_by: ideaData.integration?.approvedBy,
      approval_date: ideaData.integration?.approvalDate,
      target_feature_id: ideaData.integration?.targetFeatureId,
      is_saved: ideaData.is_saved,
      updated_at: new Date().toISOString()
    };
    
    // Remove undefined values
    const cleanedData: Record<string, any> = {};
    
    // Only include defined values
    Object.entries(dbData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    });
    
    const { error } = await supabase
      .from('idea_playground_ideas')
      .update(cleanedData)
      .eq('id', id);
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error updating idea: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in updateIdea:', error);
    return false;
  }
};

/**
 * Toggle saved status for an idea
 */
export const toggleSaveIdea = async (id: string): Promise<boolean> => {
  try {
    // First get the current status
    const { data: idea, error: fetchError } = await supabase
      .from('idea_playground_ideas')
      .select('is_saved')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      handleSupabaseError(fetchError);
      throw new Error(`Error fetching idea: ${fetchError.message}`);
    }
    
    // Toggle the saved status
    const { error: updateError } = await supabase
      .from('idea_playground_ideas')
      .update({
        is_saved: !(idea?.is_saved || false),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) {
      handleSupabaseError(updateError);
      throw new Error(`Error updating idea: ${updateError.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in toggleSaveIdea:', error);
    return false;
  }
};

/**
 * Delete an idea
 */
export const deleteIdea = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('idea_playground_ideas')
      .delete()
      .eq('id', id);
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error deleting idea: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in deleteIdea:', error);
    return false;
  }
};

/**
 * Save user view preferences
 */
export const saveUserViewPreference = async (userId: string, viewType: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('idea_hub_user_preferences')
      .upsert({
        user_id: userId,
        default_view: viewType,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error saving view preference: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in saveUserViewPreference:', error);
    return false;
  }
};

/**
 * Push idea to company feature
 */
export const pushIdeaToCompanyFeature = async (ideaId: string): Promise<boolean> => {
  try {
    // First, get the idea details
    const { data: idea, error: ideaError } = await supabase
      .from('idea_playground_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    
    if (ideaError) {
      handleSupabaseError(ideaError);
      throw new Error(`Error fetching idea: ${ideaError.message}`);
    }
    
    if (!idea.company_id) {
      throw new Error('Cannot push idea to company: No company associated with this idea');
    }
    
    // Update the idea status
    const { error: updateError } = await supabase
      .from('idea_playground_ideas')
      .update({
        integration_status: 'pending_approval',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);
    
    if (updateError) {
      handleSupabaseError(updateError);
      throw new Error(`Error updating idea status: ${updateError.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in pushIdeaToCompanyFeature:', error);
    return false;
  }
};

/**
 * Convert idea to company
 */
export const convertIdeaToCompany = async (ideaId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would create a new company record
    // and update the idea with the new company ID
    
    // For now, just update the idea status
    const { error } = await supabase
      .from('idea_playground_ideas')
      .update({
        integration_status: 'implemented',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error updating idea status: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in convertIdeaToCompany:', error);
    return false;
  }
};

/**
 * Get idea by ID
 */
export const getIdeaById = async (id: string): Promise<EnhancedIdeaPlaygroundIdea | null> => {
  try {
    const { data, error } = await supabase
      .from('idea_playground_ideas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error fetching idea: ${error.message}`);
    }
    
    if (!data) {
      return null;
    }
    
    // Transform to our enhanced idea structure
    return {
      id: data.id,
      title: data.title || 'Untitled Idea',
      description: data.description || '',
      
      // Ownership and creator information
      creatorId: data.creator_id,
      ownershipType: (data.ownership_type || 'personal') as OwnershipType,
      
      ideaType: (data.idea_type || 'new_feature') as any,
      companyId: data.company_id,
      companyName: data.company_name,
      companyContext: data.company_context || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_saved: data.is_saved || false,
      integration: {
        status: (data.integration_status || 'draft') as any,
        approvedBy: data.approved_by,
        approvalDate: data.approval_date,
        targetFeatureId: data.target_feature_id
      }
    };
    
  } catch (error) {
    console.error('Error in getIdeaById:', error);
    return null;
  }
};

/**
 * Promote a personal idea to a company idea
 */
export const promoteIdeaToCompany = async (ideaId: string, companyId: string): Promise<boolean> => {
  try {
    // Call the database function we created in the migration
    const { data, error } = await supabase
      .rpc('promote_idea_to_company', {
        idea_id: ideaId,
        target_company_id: companyId
      });
    
    if (error) {
      handleSupabaseError(error);
      throw new Error(`Error promoting idea to company: ${error.message}`);
    }
    
    // The function returns a boolean indicating success
    return data || false;
    
  } catch (error) {
    console.error('Error in promoteIdeaToCompany:', error);
    return false;
  }
};

// Export all functions as a single object for easier imports
export const ideaHubApi = {
  fetchIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
  toggleSaveIdea,
  saveUserViewPreference,
  pushIdeaToCompanyFeature,
  convertIdeaToCompany,
  getIdeaById,
  promoteIdeaToCompany
};
