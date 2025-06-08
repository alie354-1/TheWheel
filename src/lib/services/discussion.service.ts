/**
 * Discussion Service
 * 
 * This service handles all operations related to discussion threads, replies, and reactions.
 * It provides methods for creating, retrieving, updating, and deleting discussion entities.
 */

import { supabase } from '../supabase';
import {
  DiscussionThread,
  ThreadReply,
  ContentReaction,
  ExpertResponse,
  CreateDiscussionThreadRequest,
  CreateThreadReplyRequest,
  DiscussionThreadFilters,
  PaginationParams,
  PaginatedResponse,
  ContentEntity,
  ReactionCategory,
  ResolutionState
} from '../types/community.types';

/**
 * Discussion Service
 * Handles all discussion-related operations
 */
export const discussionService = {
  /**
   * Get all discussion threads with optional filtering and pagination
   */
  async getThreads(
    filters?: DiscussionThreadFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DiscussionThread>> {
    try {
      let query = supabase
        .from('discussion_threads')
        .select(`
          *,
          author:author_id (
            id,
            full_name,
            avatar_url
          )
        `);

      // Apply filters
      if (filters?.group_id) {
        query = query.eq('group_id', filters.group_id);
      }

      if (filters?.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      if (filters?.thread_type) {
        query = query.eq('thread_type', filters.thread_type);
      }

      if (filters?.priority_level) {
        query = query.eq('priority_level', filters.priority_level);
      }

      if (filters?.resolution_status) {
        query = query.eq('resolution_status', filters.resolution_status);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search_term) {
        query = query.or(`title.ilike.%${filters.search_term}%,content.ilike.%${filters.search_term}%`);
      }

      if (filters?.is_pinned !== undefined) {
        query = query.eq('is_pinned', filters.is_pinned);
      }

      // Apply sorting
      if (filters?.sort_by) {
        const direction = filters.sort_direction || 'desc';
        query = query.order(filters.sort_by, { ascending: direction === 'asc' });
      } else {
        // Default sorting by last activity
        query = query.order('last_activity_at', { ascending: false });
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('discussion_threads')
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
        console.error('Error fetching discussion threads:', error);
        throw error;
      }

      // Process the data to include author information
      const processedData = data?.map(thread => ({
        ...thread,
        author_name: thread.author?.full_name,
        author_avatar_url: thread.author?.avatar_url,
        author: undefined // Remove the nested author object
      })) || [];

      return {
        data: processedData,
        total: count || 0,
        page: pagination?.page || 1,
        page_size: pagination?.page_size || 10,
        total_pages: Math.ceil((count || 0) / (pagination?.page_size || 10))
      };
    } catch (error) {
      console.error('Error in getThreads:', error);
      throw error;
    }
  },

  /**
   * Get a single discussion thread by ID
   */
  async getThread(threadId: string): Promise<DiscussionThread | null> {
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .select(`
          *,
          author:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', threadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null;
        }
        console.error('Error fetching discussion thread:', error);
        throw error;
      }

      // Increment view count
      await supabase
        .from('discussion_threads')
        .update({
          view_count: (data.view_count || 0) + 1
        })
        .eq('id', threadId);

      // Process the data to include author information
      return {
        ...data,
        author_name: data.author?.full_name,
        author_avatar_url: data.author?.avatar_url,
        author: undefined // Remove the nested author object
      };
    } catch (error) {
      console.error('Error in getThread:', error);
      throw error;
    }
  },

  /**
   * Create a new discussion thread
   */
  async createThread(threadData: CreateDiscussionThreadRequest, authorId: string): Promise<DiscussionThread> {
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .insert({
          ...threadData,
          author_id: authorId,
          view_count: 0,
          reply_count: 0,
          unique_participants: 1,
          last_activity_at: new Date().toISOString(),
          resolution_status: 'open',
          is_pinned: false,
          is_locked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating discussion thread:', error);
        throw error;
      }

      // Get author information
      const { data: authorData } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', authorId)
        .single();

      return {
        ...data,
        author_name: authorData?.full_name,
        author_avatar_url: authorData?.avatar_url
      };
    } catch (error) {
      console.error('Error in createThread:', error);
      throw error;
    }
  },

  /**
   * Update an existing discussion thread
   */
  async updateThread(
    threadId: string, 
    updates: {
      title?: string;
      content?: string;
      thread_type?: string;
      priority_level?: string;
      confidentiality_level?: string;
      tags?: string[];
      is_pinned?: boolean;
      is_locked?: boolean;
    }
  ): Promise<DiscussionThread> {
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId)
        .select(`
          *,
          author:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating discussion thread:', error);
        throw error;
      }

      // Process the data to include author information
      return {
        ...data,
        author_name: data.author?.full_name,
        author_avatar_url: data.author?.avatar_url,
        author: undefined // Remove the nested author object
      };
    } catch (error) {
      console.error('Error in updateThread:', error);
      throw error;
    }
  },

  /**
   * Update the resolution status of a thread
   */
  async updateResolutionStatus(
    threadId: string,
    status: ResolutionState,
    userId: string,
    note?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('discussion_threads')
        .update({
          resolution_status: status,
          resolution_note: note,
          resolved_by: userId,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId);

      if (error) {
        console.error('Error updating resolution status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateResolutionStatus:', error);
      throw error;
    }
  },

  /**
   * Delete a discussion thread
   */
  async deleteThread(threadId: string): Promise<void> {
    try {
      // Delete all replies first (cascade delete should handle this, but just to be safe)
      await supabase
        .from('thread_replies')
        .delete()
        .eq('thread_id', threadId);

      // Delete the thread
      const { error } = await supabase
        .from('discussion_threads')
        .delete()
        .eq('id', threadId);

      if (error) {
        console.error('Error deleting discussion thread:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteThread:', error);
      throw error;
    }
  },

  /**
   * Get all replies for a thread
   */
  async getReplies(threadId: string): Promise<ThreadReply[]> {
    try {
      const { data, error } = await supabase
        .from('thread_replies')
        .select(`
          *,
          author:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching thread replies:', error);
        throw error;
      }

      // Get reactions for all replies
      const replyIds = data?.map(reply => reply.id) || [];
      
      if (replyIds.length === 0) {
        return [];
      }

      const { data: reactions } = await supabase
        .from('content_reactions')
        .select('*')
        .eq('content_type', 'reply')
        .in('content_id', replyIds);

      // Group reactions by reply ID
      const reactionsByReplyId: Record<string, ContentReaction[]> = {};
      reactions?.forEach(reaction => {
        if (!reactionsByReplyId[reaction.content_id]) {
          reactionsByReplyId[reaction.content_id] = [];
        }
        reactionsByReplyId[reaction.content_id].push(reaction);
      });

      // Process the data to include author information and reactions
      return data?.map(reply => ({
        ...reply,
        author_name: reply.author?.full_name,
        author_avatar_url: reply.author?.avatar_url,
        author: undefined, // Remove the nested author object
        reactions: reactionsByReplyId[reply.id] || []
      })) || [];
    } catch (error) {
      console.error('Error in getReplies:', error);
      throw error;
    }
  },

  /**
   * Create a new reply to a thread
   */
  async createReply(replyData: CreateThreadReplyRequest, authorId: string): Promise<ThreadReply> {
    try {
      // Create the reply
      const { data, error } = await supabase
        .from('thread_replies')
        .insert({
          ...replyData,
          author_id: authorId,
          is_accepted_answer: false,
          is_expert_response: false,
          reaction_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating thread reply:', error);
        throw error;
      }

      // Update the thread's last activity and reply count
      await supabase
        .from('discussion_threads')
        .update({
          last_activity_at: new Date().toISOString(),
          last_reply_id: data.id,
          reply_count: supabase.rpc('increment_reply_count', { thread_id: replyData.thread_id }),
          // Also update unique participants if this is a new participant
          unique_participants: supabase.rpc('update_unique_participants', { 
            thread_id: replyData.thread_id, 
            new_participant_id: authorId 
          })
        })
        .eq('id', replyData.thread_id);

      // Get author information
      const { data: authorData } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', authorId)
        .single();

      return {
        ...data,
        author_name: authorData?.full_name,
        author_avatar_url: authorData?.avatar_url,
        reactions: []
      };
    } catch (error) {
      console.error('Error in createReply:', error);
      throw error;
    }
  },

  /**
   * Update an existing reply
   */
  async updateReply(
    replyId: string,
    updates: {
      content?: string;
      reply_type?: string;
      is_accepted_answer?: boolean;
    }
  ): Promise<ThreadReply> {
    try {
      const { data, error } = await supabase
        .from('thread_replies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId)
        .select(`
          *,
          author:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating thread reply:', error);
        throw error;
      }

      // Get reactions for this reply
      const { data: reactions } = await supabase
        .from('content_reactions')
        .select('*')
        .eq('content_type', 'reply')
        .eq('content_id', replyId);

      // Process the data to include author information and reactions
      return {
        ...data,
        author_name: data.author?.full_name,
        author_avatar_url: data.author?.avatar_url,
        author: undefined, // Remove the nested author object
        reactions: reactions || []
      };
    } catch (error) {
      console.error('Error in updateReply:', error);
      throw error;
    }
  },

  /**
   * Delete a reply
   */
  async deleteReply(replyId: string, threadId: string): Promise<void> {
    try {
      // Delete the reply
      const { error } = await supabase
        .from('thread_replies')
        .delete()
        .eq('id', replyId);

      if (error) {
        console.error('Error deleting thread reply:', error);
        throw error;
      }

      // Update the thread's reply count
      await supabase
        .from('discussion_threads')
        .update({
          reply_count: supabase.rpc('decrement_reply_count', { thread_id: threadId })
        })
        .eq('id', threadId);
    } catch (error) {
      console.error('Error in deleteReply:', error);
      throw error;
    }
  },

  /**
   * Mark a reply as an accepted answer
   */
  async markAsAcceptedAnswer(replyId: string, threadId: string): Promise<void> {
    try {
      // First, unmark any previously accepted answers for this thread
      await supabase
        .from('thread_replies')
        .update({
          is_accepted_answer: false,
          updated_at: new Date().toISOString()
        })
        .eq('thread_id', threadId)
        .eq('is_accepted_answer', true);

      // Then mark this reply as the accepted answer
      const { error } = await supabase
        .from('thread_replies')
        .update({
          is_accepted_answer: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId);

      if (error) {
        console.error('Error marking reply as accepted answer:', error);
        throw error;
      }

      // Update the thread's resolution status
      await supabase
        .from('discussion_threads')
        .update({
          resolution_status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId);
    } catch (error) {
      console.error('Error in markAsAcceptedAnswer:', error);
      throw error;
    }
  },

  /**
   * Add a reaction to a content item (thread or reply)
   */
  async addReaction(
    contentType: ContentEntity,
    contentId: string,
    userId: string,
    reactionType: ReactionCategory
  ): Promise<ContentReaction> {
    try {
      // Check if the reaction already exists
      const { data: existingReaction } = await supabase
        .from('content_reactions')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Reaction already exists, return it
        return existingReaction;
      }

      // Create the reaction
      const { data, error } = await supabase
        .from('content_reactions')
        .insert({
          content_type: contentType,
          content_id: contentId,
          user_id: userId,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding reaction:', error);
        throw error;
      }

      // Update the reaction count on the content item
      if (contentType === 'reply') {
        await supabase
          .from('thread_replies')
          .update({
            reaction_count: supabase.rpc('increment_reaction_count', { reply_id: contentId })
          })
          .eq('id', contentId);
      }

      return data;
    } catch (error) {
      console.error('Error in addReaction:', error);
      throw error;
    }
  },

  /**
   * Remove a reaction from a content item
   */
  async removeReaction(
    contentType: ContentEntity,
    contentId: string,
    userId: string,
    reactionType: ReactionCategory
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_reactions')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType);

      if (error) {
        console.error('Error removing reaction:', error);
        throw error;
      }

      // Update the reaction count on the content item
      if (contentType === 'reply') {
        await supabase
          .from('thread_replies')
          .update({
            reaction_count: supabase.rpc('decrement_reaction_count', { reply_id: contentId })
          })
          .eq('id', contentId);
      }
    } catch (error) {
      console.error('Error in removeReaction:', error);
      throw error;
    }
  },

  /**
   * Get all reactions for a content item
   */
  async getReactions(contentType: ContentEntity, contentId: string): Promise<ContentReaction[]> {
    try {
      const { data, error } = await supabase
        .from('content_reactions')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) {
        console.error('Error fetching reactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReactions:', error);
      throw error;
    }
  },

  /**
   * Mark a reply as an expert response
   */
  async markAsExpertResponse(
    replyId: string,
    expertId: string,
    expertiseArea: string,
    confidenceScore: number
  ): Promise<ExpertResponse> {
    try {
      // First, get the thread ID for this reply
      const { data: reply } = await supabase
        .from('thread_replies')
        .select('thread_id')
        .eq('id', replyId)
        .single();

      if (!reply) {
        throw new Error('Reply not found');
      }

      // Mark the reply as an expert response
      await supabase
        .from('thread_replies')
        .update({
          is_expert_response: true,
          expert_confidence_score: confidenceScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId);

      // Create an expert response record
      const { data, error } = await supabase
        .from('expert_responses')
        .insert({
          thread_id: reply.thread_id,
          reply_id: replyId,
          expert_id: expertId,
          expertise_area: expertiseArea,
          confidence_score: confidenceScore,
          verification_status: 'self_reported',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking as expert response:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in markAsExpertResponse:', error);
      throw error;
    }
  },

  /**
   * Verify an expert response
   */
  async verifyExpertResponse(
    expertResponseId: string,
    verifierId: string
  ): Promise<ExpertResponse> {
    try {
      const { data, error } = await supabase
        .from('expert_responses')
        .update({
          verification_status: 'verified',
          verified_by: verifierId,
          verified_at: new Date().toISOString()
        })
        .eq('id', expertResponseId)
        .select()
        .single();

      if (error) {
        console.error('Error verifying expert response:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in verifyExpertResponse:', error);
      throw error;
    }
  },

  /**
   * Get all expert responses for a thread
   */
  async getExpertResponsesForThread(threadId: string): Promise<ExpertResponse[]> {
    try {
      const { data, error } = await supabase
        .from('expert_responses')
        .select(`
          *,
          expert:expert_id (
            id,
            full_name,
            avatar_url
          ),
          verifier:verified_by (
            id,
            full_name
          )
        `)
        .eq('thread_id', threadId);

      if (error) {
        console.error('Error fetching expert responses:', error);
        throw error;
      }

      // Process the data to include expert and verifier information
      return data?.map(response => ({
        ...response,
        expert_name: response.expert?.full_name,
        expert_avatar_url: response.expert?.avatar_url,
        verifier_name: response.verifier?.full_name,
        expert: undefined, // Remove the nested expert object
        verifier: undefined // Remove the nested verifier object
      })) || [];
    } catch (error) {
      console.error('Error in getExpertResponsesForThread:', error);
      throw error;
    }
  }
};
