/**
 * Community Service
 * 
 * This service handles all operations related to communities, groups, and memberships.
 * It provides methods for creating, retrieving, updating, and deleting community entities.
 */

import { supabase } from '../supabase';
import {
  CommunityGroup,
  GroupMembership,
  CreateCommunityGroupRequest,
  UpdateCommunityGroupRequest,
  CommunityGroupFilters,
  PaginationParams,
  PaginatedResponse,
  GroupRole,
  MembershipStatus,
  CommunityProfileSummary,
  GroupCategory
} from '../types/community.types';

/**
 * Community Service
 * Handles all community-related operations
 */
export const communityService = {
  /**
   * Get all community groups with optional filtering and pagination
   */
  async getGroups(
    filters?: CommunityGroupFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<CommunityGroup>> {
    try {
      let query = supabase
        .from('community_groups')
        .select('*, group_memberships(count)')
        .eq('is_archived', filters?.is_archived ?? false);

      // Apply filters
      if (filters?.group_type) {
        query = query.eq('group_type', filters.group_type);
      }

      if (filters?.access_level) {
        query = query.eq('access_level', filters.access_level);
      }

      if (filters?.search_term) {
        query = query.or(`name.ilike.%${filters.search_term}%,description.ilike.%${filters.search_term}%`);
      }

      // Apply user membership filter if needed
      if (filters?.user_is_member !== undefined && filters.user_is_member) {
        // This requires a more complex query with a join
        // For simplicity, we'll handle this separately
        const { data: userMemberships } = await supabase
          .from('group_memberships')
          .select('group_id')
          .eq('user_id', supabase.auth.getUser())
          .eq('status', 'active');

        if (userMemberships && userMemberships.length > 0) {
          const groupIds = userMemberships.map(m => m.group_id);
          query = query.in('id', groupIds);
        } else if (filters.user_is_member) {
          // If user is not a member of any group but we're filtering for membership
          return {
            data: [],
            total: 0,
            page: pagination?.page || 1,
            page_size: pagination?.page_size || 10,
            total_pages: 0
          };
        }
      }

      // Apply sorting
      if (filters?.sort_by) {
        const direction = filters.sort_direction || 'asc';
        if (filters.sort_by === 'member_count') {
          // Special handling for member_count which is a computed field
          query = query.order('group_memberships.count', { ascending: direction === 'asc' });
        } else {
          query = query.order(filters.sort_by, { ascending: direction === 'asc' });
        }
      } else {
        // Default sorting
        query = query.order('created_at', { ascending: false });
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('community_groups')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      if (pagination) {
        const { page, page_size } = pagination;
        const from = (page - 1) * page_size;
        const to = from + page_size - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching community groups:', error);
        throw error;
      }

      // Process the data to extract member count
      const processedData = data?.map(group => {
        const memberCount = group.group_memberships?.[0]?.count || 0;
        delete group.group_memberships;
        return {
          ...group,
          member_count: memberCount
        };
      }) || [];

      return {
        data: processedData,
        total: count || 0,
        page: pagination?.page || 1,
        page_size: pagination?.page_size || 10,
        total_pages: Math.ceil((count || 0) / (pagination?.page_size || 10))
      };
    } catch (error) {
      console.error('Error in getGroups:', error);
      throw error;
    }
  },

  /**
   * Get a single community group by ID or slug
   */
  async getGroup(idOrSlug: string): Promise<CommunityGroup | null> {
    try {
      // Determine if the input is a UUID or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase
        .from('community_groups')
        .select('*, group_memberships(count)');
      
      if (isUuid) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }
      
      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null;
        }
        console.error('Error fetching community group:', error);
        throw error;
      }

      // Process the data to extract member count
      const memberCount = data.group_memberships?.[0]?.count || 0;
      delete data.group_memberships;

      return {
        ...data,
        member_count: memberCount
      };
    } catch (error) {
      console.error('Error in getGroup:', error);
      throw error;
    }
  },

  /**
   * Create a new community group
   */
  async createGroup(groupData: CreateCommunityGroupRequest, createdBy: string): Promise<CommunityGroup> {
    try {
      // Generate a slug from the name
      const slug = groupData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Start a transaction
      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          ...groupData,
          slug,
          created_by: createdBy,
          is_archived: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating community group:', error);
        throw error;
      }

      // Automatically add the creator as an admin member
      await this.joinGroup(data.id, createdBy, 'admin');

      return {
        ...data,
        member_count: 1 // Start with 1 member (the creator)
      };
    } catch (error) {
      console.error('Error in createGroup:', error);
      throw error;
    }
  },

  /**
   * Update an existing community group
   */
  async updateGroup(groupId: string, groupData: UpdateCommunityGroupRequest): Promise<CommunityGroup> {
    try {
      // If name is being updated, update the slug as well
      let updatedData: any = { ...groupData };
      if (groupData.name) {
        const slug = groupData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        updatedData.slug = slug;
      }

      const { data, error } = await supabase
        .from('community_groups')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) {
        console.error('Error updating community group:', error);
        throw error;
      }

      // Get member count
      const { count } = await supabase
        .from('group_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'active');

      return {
        ...data,
        member_count: count || 0
      };
    } catch (error) {
      console.error('Error in updateGroup:', error);
      throw error;
    }
  },

  /**
   * Archive a community group (soft delete)
   */
  async archiveGroup(groupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_groups')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId);

      if (error) {
        console.error('Error archiving community group:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in archiveGroup:', error);
      throw error;
    }
  },

  /**
   * Get all members of a community group
   */
  async getGroupMembers(groupId: string): Promise<GroupMembership[]> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('join_date', { ascending: false });

      if (error) {
        console.error('Error fetching group members:', error);
        throw error;
      }

      // Process the data to include user information
      return data?.map(membership => ({
        ...membership,
        user_name: membership.users?.full_name,
        user_avatar_url: membership.users?.avatar_url
      })) || [];
    } catch (error) {
      console.error('Error in getGroupMembers:', error);
      throw error;
    }
  },

  /**
   * Join a community group
   */
  async joinGroup(
    groupId: string, 
    userId: string, 
    role: GroupRole = 'member'
  ): Promise<GroupMembership> {
    try {
      // Check if the user is already a member
      const { data: existingMembership } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existingMembership) {
        // If membership exists but is inactive, reactivate it
        if (existingMembership.status !== 'active') {
          const { data, error } = await supabase
            .from('group_memberships')
            .update({
              status: 'active',
              role,
              last_active_at: new Date().toISOString()
            })
            .eq('id', existingMembership.id)
            .select()
            .single();

          if (error) {
            console.error('Error reactivating group membership:', error);
            throw error;
          }

          return data;
        }
        
        // If already active, just return the existing membership
        return existingMembership;
      }

      // Check if the group requires approval
      const { data: group } = await supabase
        .from('community_groups')
        .select('requires_approval')
        .eq('id', groupId)
        .single();

      // Set initial status based on approval requirement
      const initialStatus: MembershipStatus = group?.requires_approval ? 'pending' : 'active';

      // Create new membership
      const { data, error } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupId,
          user_id: userId,
          role,
          status: initialStatus,
          join_date: new Date().toISOString(),
          contribution_score: 0,
          last_active_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error joining group:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in joinGroup:', error);
      throw error;
    }
  },

  /**
   * Leave a community group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .update({
          status: 'inactive'
          // Removed updated_at field as it doesn't exist in the table
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving group:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in leaveGroup:', error);
      throw error;
    }
  },

  /**
   * Update membership status (approve or reject)
   */
  async updateMembershipStatus(
    membershipId: string,
    newStatus: MembershipStatus
  ): Promise<GroupMembership> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .update({
          status: newStatus
          // Removed updated_at field as it doesn't exist in the table
        })
        .eq('id', membershipId)
        .select()
        .single();

      if (error) {
        console.error('Error updating membership status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateMembershipStatus:', error);
      throw error;
    }
  },

  /**
   * Get pending membership requests for a group
   */
  async getPendingMemberships(groupId: string): Promise<GroupMembership[]> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('join_date', { ascending: false });

      if (error) {
        console.error('Error fetching pending memberships:', error);
        throw error;
      }

      // Process the data to include user information
      return data?.map(membership => ({
        ...membership,
        user_name: membership.users?.full_name,
        user_avatar_url: membership.users?.avatar_url
      })) || [];
    } catch (error) {
      console.error('Error in getPendingMemberships:', error);
      throw error;
    }
  },

  /**
   * Update a user's role in a community group
   */
  async updateMemberRole(
    groupId: string, 
    userId: string, 
    newRole: GroupRole
  ): Promise<GroupMembership> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .update({
          role: newRole
          // Removed updated_at field as it doesn't exist in the table
        })
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating member role:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateMemberRole:', error);
      throw error;
    }
  },

  /**
   * Check if a user is a member of a specific group
   */
  async checkUserMembership(groupId: string, userId: string): Promise<{
    isMember: boolean;
    status: MembershipStatus | null;
    role: GroupRole | null;
  }> {
    try {
      // Use a more basic query approach to avoid 406 errors
      const { data, error } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking user membership:', error);
        throw error;
      }

      // If no data or empty array, user is not a member
      if (!data || data.length === 0) {
        return { isMember: false, status: null, role: null };
      }

      // Get the first membership record
      const membership = data[0];
      
      // Only consider active memberships as being a member
      const isMember = membership.status === 'active';
      
      return {
        isMember: isMember,
        status: membership.status,
        role: isMember ? membership.role : null
      };
    } catch (error) {
      console.error('Error in checkUserMembership:', error);
      // Return a default value instead of throwing to make the API more resilient
      return { isMember: false, status: null, role: null };
    }
  },

  /**
   * Get all groups a user is a member of
   */
  async getUserGroups(userId: string): Promise<CommunityGroup[]> {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          community_groups (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('join_date', { ascending: false });

      if (error) {
        console.error('Error fetching user groups:', error);
        throw error;
      }

      // Process the data to extract group information
      return data?.map(membership => membership.community_groups as CommunityGroup) || [];
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      throw error;
    }
  },

  /**
   * Get a user's community profile summary
   * This includes group memberships, achievements, and recent activity
   */
  async getCommunityProfile(userId: string): Promise<CommunityProfileSummary | null> {
    try {
      // Get user basic info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          // User not found
          return null;
        }
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      // Get enhanced profile if available
      const { data: enhancedProfile } = await supabase
        .from('enhanced_profiles')
        .select('primary_role, company_id')
        .eq('user_id', userId)
        .single();

      // Get company name if available
      let companyName = '';
      if (enhancedProfile?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('name')
          .eq('id', enhancedProfile.company_id)
          .single();
        
        companyName = companyData?.name || '';
      }

      // Get group memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('group_memberships')
        .select(`
          id,
          role,
          group_id,
          community_groups (
            id,
            name,
            group_type
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (membershipError) {
        console.error('Error fetching group memberships:', membershipError);
        throw membershipError;
      }

      // Define the structure for group data
      interface GroupData {
        id: string;
        name: string;
        group_type: string;
      }

      // Get achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }

      // Get expert profile if available
      const { data: expertProfile } = await supabase
        .from('expert_profiles')
        .select('primary_expertise_areas')
        .eq('user_id', userId)
        .single();

      // Get recent activity (simplified version)
      // In a real implementation, this would be more complex and include various activity types
      const { data: recentThreads } = await supabase
        .from('discussion_threads')
        .select('id, title, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentReplies } = await supabase
        .from('thread_replies')
        .select('id, thread_id, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort recent activity
      const recentActivity = [
        ...(recentThreads?.map(thread => ({
          activity_type: 'thread_created',
          entity_id: thread.id,
          entity_type: 'thread',
          timestamp: thread.created_at,
          summary: `Created discussion: ${thread.title}`
        })) || []),
        ...(recentReplies?.map(reply => ({
          activity_type: 'reply_created',
          entity_id: reply.id,
          entity_type: 'reply',
          timestamp: reply.created_at,
          summary: `Replied to a discussion`
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 5);

      // Get contribution score
      const { data: contributionData } = await supabase
        .from('contribution_scores')
        .select('total_score')
        .eq('user_id', userId)
        .eq('scoring_period', 'all_time')
        .single();

      return {
        user_id: userId,
        user_name: userData.full_name,
        user_avatar_url: userData.avatar_url,
        primary_role: enhancedProfile?.primary_role,
        company_name: companyName,
        joined_date: userData.created_at,
        group_memberships: memberships?.map(membership => {
          const group = membership.community_groups as unknown as GroupData;
          return {
            group_id: membership.group_id,
            group_name: group.name,
            group_type: group.group_type as GroupCategory,
            role: membership.role
          };
        }) || [],
        contribution_score: contributionData?.total_score || 0,
        achievements: achievements?.map(achievement => ({
          achievement_name: achievement.achievement_name,
          achievement_type: achievement.achievement_type,
          tier: achievement.tier,
          earned_date: achievement.earned_date,
          badge_image_url: achievement.badge_image_url
        })) || [],
        expert_areas: expertProfile?.primary_expertise_areas || [],
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error in getCommunityProfile:', error);
      throw error;
    }
  }
};
