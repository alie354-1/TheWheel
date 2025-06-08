/**
 * Event Service
 * 
 * This service handles all operations related to community events and registrations.
 * It provides methods for creating, retrieving, updating, and deleting event entities.
 */

import { supabase } from '../supabase';
import {
  CommunityEvent,
  EventRegistration,
  CreateCommunityEventRequest,
  CommunityEventFilters,
  PaginationParams,
  PaginatedResponse,
  EventStatus,
  RegistrationStatus
} from '../types/community.types';

/**
 * Event Service
 * Handles all event-related operations
 */
export const eventService = {
  /**
   * Get all community events with optional filtering and pagination
   */
  async getEvents(
    filters?: CommunityEventFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<CommunityEvent>> {
    try {
      let query = supabase
        .from('community_events')
        .select(`
          *,
          organizer:organizer_id (
            id,
            full_name,
            avatar_url
          ),
          event_registrations(count)
        `);

      // Apply filters
      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters?.event_format) {
        query = query.eq('event_format', filters.event_format);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.organizer_id) {
        query = query.eq('organizer_id', filters.organizer_id);
      }

      if (filters?.target_groups && filters.target_groups.length > 0) {
        query = query.contains('target_groups', filters.target_groups);
      }

      if (filters?.date_range) {
        query = query
          .gte('start_date', filters.date_range.start)
          .lte('end_date', filters.date_range.end);
      }

      if (filters?.search_term) {
        query = query.or(`title.ilike.%${filters.search_term}%,description.ilike.%${filters.search_term}%`);
      }

      // Apply sorting
      if (filters?.sort_by) {
        const direction = filters.sort_direction || 'asc';
        query = query.order(filters.sort_by, { ascending: direction === 'asc' });
      } else {
        // Default sorting by start date
        query = query.order('start_date', { ascending: true });
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('community_events')
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
        console.error('Error fetching community events:', error);
        throw error;
      }

      // Process the data to include organizer information and attendee count
      const processedData = data?.map(event => {
        const attendeeCount = event.event_registrations?.[0]?.count || 0;
        delete event.event_registrations;
        
        return {
          ...event,
          organizer_name: event.organizer?.full_name,
          organizer_avatar_url: event.organizer?.avatar_url,
          organizer: undefined, // Remove the nested organizer object
          attendee_count: attendeeCount
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
      console.error('Error in getEvents:', error);
      throw error;
    }
  },

  /**
   * Get a single community event by ID
   */
  async getEvent(eventId: string): Promise<CommunityEvent | null> {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          organizer:organizer_id (
            id,
            full_name,
            avatar_url
          ),
          event_registrations(count)
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null;
        }
        console.error('Error fetching community event:', error);
        throw error;
      }

      // Process the data to include organizer information and attendee count
      const attendeeCount = data.event_registrations?.[0]?.count || 0;
      delete data.event_registrations;

      return {
        ...data,
        organizer_name: data.organizer?.full_name,
        organizer_avatar_url: data.organizer?.avatar_url,
        organizer: undefined, // Remove the nested organizer object
        attendee_count: attendeeCount
      };
    } catch (error) {
      console.error('Error in getEvent:', error);
      throw error;
    }
  },

  /**
   * Create a new community event
   */
  async createEvent(eventData: CreateCommunityEventRequest, organizerId: string): Promise<CommunityEvent> {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .insert({
          ...eventData,
          organizer_id: organizerId,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating community event:', error);
        throw error;
      }

      // Get organizer information
      const { data: organizerData } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', organizerId)
        .single();

      return {
        ...data,
        organizer_name: organizerData?.full_name,
        organizer_avatar_url: organizerData?.avatar_url,
        attendee_count: 0
      };
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  },

  /**
   * Update an existing community event
   */
  async updateEvent(
    eventId: string,
    updates: {
      title?: string;
      description?: string;
      event_type?: string;
      start_date?: string;
      end_date?: string;
      timezone?: string;
      is_recurring?: boolean;
      recurrence_pattern?: Record<string, any>;
      max_attendees?: number;
      registration_deadline?: string;
      requires_approval?: boolean;
      target_groups?: string[];
      co_organizers?: string[];
      event_format?: string;
      location_details?: Record<string, any>;
      preparation_materials?: Record<string, any>;
      status?: EventStatus;
    }
  ): Promise<CommunityEvent> {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select(`
          *,
          organizer:organizer_id (
            id,
            full_name,
            avatar_url
          ),
          event_registrations(count)
        `)
        .single();

      if (error) {
        console.error('Error updating community event:', error);
        throw error;
      }

      // Process the data to include organizer information and attendee count
      const attendeeCount = data.event_registrations?.[0]?.count || 0;
      delete data.event_registrations;

      return {
        ...data,
        organizer_name: data.organizer?.full_name,
        organizer_avatar_url: data.organizer?.avatar_url,
        organizer: undefined, // Remove the nested organizer object
        attendee_count: attendeeCount
      };
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  },

  /**
   * Cancel a community event
   */
  async cancelEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_events')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) {
        console.error('Error cancelling community event:', error);
        throw error;
      }

      // Update all registrations to cancelled
      await supabase
        .from('event_registrations')
        .update({
          status: 'cancelled'
        })
        .eq('event_id', eventId);
    } catch (error) {
      console.error('Error in cancelEvent:', error);
      throw error;
    }
  },

  /**
   * Delete a community event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      // Delete all registrations first (cascade delete should handle this, but just to be safe)
      await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId);

      // Delete the event
      const { error } = await supabase
        .from('community_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting community event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  },

  /**
   * Get all registrations for an event
   */
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });

      if (error) {
        console.error('Error fetching event registrations:', error);
        throw error;
      }

      // Process the data to include user information
      return data?.map(registration => ({
        ...registration,
        user_name: registration.user?.full_name,
        user_avatar_url: registration.user?.avatar_url,
        user: undefined // Remove the nested user object
      })) || [];
    } catch (error) {
      console.error('Error in getEventRegistrations:', error);
      throw error;
    }
  },

  /**
   * Register a user for an event
   */
  async registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
    try {
      // Check if the user is already registered
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existingRegistration) {
        // If registration exists but is cancelled, reactivate it
        if (existingRegistration.status === 'cancelled') {
          const { data, error } = await supabase
            .from('event_registrations')
            .update({
              status: 'registered',
              registration_date: new Date().toISOString()
            })
            .eq('id', existingRegistration.id)
            .select()
            .single();

          if (error) {
            console.error('Error reactivating event registration:', error);
            throw error;
          }

          return data;
        }
        
        // If already registered, just return the existing registration
        return existingRegistration;
      }

      // Check if the event requires approval
      const { data: event } = await supabase
        .from('community_events')
        .select('requires_approval, max_attendees')
        .eq('id', eventId)
        .single();

      // Check if the event is at capacity
      if (event?.max_attendees) {
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .in('status', ['registered', 'confirmed']);

        if (count && count >= event.max_attendees) {
          // Event is at capacity, add to waitlist
          const { data, error } = await supabase
            .from('event_registrations')
            .insert({
              event_id: eventId,
              user_id: userId,
              registration_date: new Date().toISOString(),
              status: 'waitlisted',
              attended: false
            })
            .select()
            .single();

          if (error) {
            console.error('Error adding to waitlist:', error);
            throw error;
          }

          return data;
        }
      }

      // Set initial status based on approval requirement
      const initialStatus = event?.requires_approval ? ('pending' as RegistrationStatus) : ('registered' as RegistrationStatus);

      // Create new registration
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          registration_date: new Date().toISOString(),
          status: initialStatus,
          attended: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering for event:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in registerForEvent:', error);
      throw error;
    }
  },

  /**
   * Cancel a user's registration for an event
   */
  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'cancelled'
        })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error cancelling event registration:', error);
        throw error;
      }

      // If there's a waitlist, move the next person up
      const { data: waitlistedRegistrations } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'waitlisted')
        .order('registration_date', { ascending: true })
        .limit(1);

      if (waitlistedRegistrations && waitlistedRegistrations.length > 0) {
        await supabase
          .from('event_registrations')
          .update({
            status: 'registered'
          })
          .eq('id', waitlistedRegistrations[0].id);
      }
    } catch (error) {
      console.error('Error in cancelRegistration:', error);
      throw error;
    }
  },

  /**
   * Update a registration status
   */
  async updateRegistrationStatus(
    registrationId: string,
    status: RegistrationStatus
  ): Promise<EventRegistration> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          status
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating registration status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateRegistrationStatus:', error);
      throw error;
    }
  },

  /**
   * Mark attendance for a registration
   */
  async markAttendance(
    registrationId: string,
    attended: boolean
  ): Promise<EventRegistration> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          attended,
          status: attended ? 'attended' : 'no_show'
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) {
        console.error('Error marking attendance:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in markAttendance:', error);
      throw error;
    }
  },

  /**
   * Submit feedback for an event
   */
  async submitFeedback(
    eventId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<EventRegistration> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          feedback_rating: rating,
          feedback_comment: comment
        })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      throw error;
    }
  },

  /**
   * Get all events a user is registered for
   */
  async getUserEvents(userId: string): Promise<CommunityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          status,
          community_events (
            *,
            organizer:organizer_id (
              id,
              full_name,
              avatar_url
            ),
            event_registrations(count)
          )
        `)
        .eq('user_id', userId)
        .not('status', 'eq', 'cancelled')
        .order('registration_date', { ascending: false });

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      // Process the data to extract event information
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(registration => {
        const event = registration.community_events as any;
        const attendeeCount = event.event_registrations?.[0]?.count || 0;
        
        // Create a properly typed event object
        const processedEvent: CommunityEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          event_type: event.event_type,
          start_date: event.start_date,
          end_date: event.end_date,
          timezone: event.timezone,
          is_recurring: event.is_recurring,
          recurrence_pattern: event.recurrence_pattern,
          max_attendees: event.max_attendees,
          registration_deadline: event.registration_deadline,
          requires_approval: event.requires_approval,
          target_groups: event.target_groups,
          organizer_id: event.organizer_id,
          co_organizers: event.co_organizers,
          event_format: event.event_format,
          location_details: event.location_details,
          preparation_materials: event.preparation_materials,
          status: event.status,
          created_at: event.created_at,
          updated_at: event.updated_at,
          organizer_name: event.organizer?.full_name,
          organizer_avatar_url: event.organizer?.avatar_url,
          attendee_count: attendeeCount
        };
        
        // Add registration status as a custom property
        return {
          ...processedEvent,
          registration_status: registration.status
        };
      });
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      throw error;
    }
  },

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 5): Promise<CommunityEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          organizer:organizer_id (
            id,
            full_name,
            avatar_url
          ),
          event_registrations(count)
        `)
        .gt('start_date', now)
        .eq('status', 'scheduled')
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching upcoming events:', error);
        throw error;
      }

      // Process the data to include organizer information and attendee count
      return data?.map(event => {
        const attendeeCount = event.event_registrations?.[0]?.count || 0;
        delete event.event_registrations;
        
        return {
          ...event,
          organizer_name: event.organizer?.full_name,
          organizer_avatar_url: event.organizer?.avatar_url,
          organizer: undefined, // Remove the nested organizer object
          attendee_count: attendeeCount
        };
      }) || [];
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      throw error;
    }
  }
};
