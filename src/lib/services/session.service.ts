import { supabase } from '@/lib/supabase';

/**
 * Interface for expert sessions
 */
export interface ExpertSession {
  id: string;
  connect_request_id: string;
  expert_id: string;
  requester_id: string;
  session_title?: string;
  session_goals?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing expert sessions
 */
export const sessionService = {
  /**
   * Create a new expert session
   * @param data The session data
   * @returns The created session
   */
  async createSession(data: Omit<ExpertSession, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ExpertSession | null> {
    const { data: session, error } = await supabase
      .from('expert_sessions')
      .insert({
        ...data,
        status: 'scheduled',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    return session;
  },

  /**
   * Get sessions for an expert
   * @param expertId The expert's ID
   * @param status Optional status filter
   * @returns Array of sessions
   */
  async getSessionsByExpert(expertId: string, status?: string): Promise<ExpertSession[]> {
    let query = supabase
      .from('expert_sessions')
      .select('*')
      .eq('expert_id', expertId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get upcoming sessions for an expert
   * @param expertId The expert's ID
   * @returns Array of upcoming sessions
   */
  async getUpcomingSessionsByExpert(expertId: string): Promise<ExpertSession[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('expert_sessions')
      .select('*')
      .eq('expert_id', expertId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get sessions for a user
   * @param userId The user's ID
   * @param status Optional status filter
   * @returns Array of sessions
   */
  async getSessionsByUser(userId: string, status?: string): Promise<ExpertSession[]> {
    let query = supabase
      .from('expert_sessions')
      .select('*')
      .eq('requester_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get upcoming sessions for a user
   * @param userId The user's ID
   * @returns Array of upcoming sessions
   */
  async getUpcomingSessionsByUser(userId: string): Promise<ExpertSession[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('expert_sessions')
      .select('*')
      .eq('requester_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific session by ID
   * @param sessionId The session ID
   * @returns The session
   */
  async getSessionById(sessionId: string): Promise<ExpertSession | null> {
    const { data, error } = await supabase
      .from('expert_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a session
   * @param sessionId The session ID
   * @param updates The updates to apply
   * @returns The updated session
   */
  async updateSession(sessionId: string, updates: Partial<Omit<ExpertSession, 'id' | 'created_at' | 'updated_at'>>): Promise<ExpertSession | null> {
    const { data, error } = await supabase
      .from('expert_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a session's status
   * @param sessionId The session ID
   * @param status The new status
   * @returns The updated session
   */
  async updateSessionStatus(sessionId: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<ExpertSession | null> {
    return this.updateSession(sessionId, { status });
  },

  /**
   * Add notes to a session
   * @param sessionId The session ID
   * @param notes The session notes
   * @returns The updated session
   */
  async addSessionNotes(sessionId: string, notes: string): Promise<ExpertSession | null> {
    return this.updateSession(sessionId, { notes });
  },

  /**
   * Reschedule a session
   * @param sessionId The session ID
   * @param scheduledAt The new scheduled time
   * @param durationMinutes Optional new duration
   * @returns The updated session
   */
  async rescheduleSession(sessionId: string, scheduledAt: string, durationMinutes?: number): Promise<ExpertSession | null> {
    const updates: Partial<ExpertSession> = { scheduled_at: scheduledAt };
    
    if (durationMinutes) {
      updates.duration_minutes = durationMinutes;
    }
    
    return this.updateSession(sessionId, updates);
  },

  /**
   * Get all sessions for a user (both as requester and expert)
   * @param userId The user's ID
   * @returns Array of sessions with additional details
   */
  async getUserSessions(userId: string): Promise<any[]> {
    // Get sessions where the user is the requester
    const { data: requesterSessions, error: requesterError } = await supabase
      .from('expert_sessions')
      .select('*')
      .eq('requester_id', userId);

    if (requesterError) {
      console.error('Error fetching user sessions as requester:', requesterError);
      throw requesterError;
    }

    // Get sessions where the user is the expert
    const { data: expertSessions, error: expertError } = await supabase
      .from('expert_sessions')
      .select('*')
      .eq('expert_id', userId);

    if (expertError) {
      console.error('Error fetching user sessions as expert:', expertError);
      throw expertError;
    }

    // Process requester sessions to add placeholder expert details
    const processedRequesterSessions = (requesterSessions || []).map(session => ({
      ...session,
      expert_name: "Expert User", // Placeholder
      expert_avatar_url: undefined,
      hourly_rate: undefined,
      start_time: session.scheduled_at,
      is_expert: false
    }));

    // Process expert sessions to add placeholder requester details
    const processedExpertSessions = (expertSessions || []).map(session => ({
      ...session,
      requester_name: "Requester User", // Placeholder
      requester_avatar_url: undefined,
      hourly_rate: undefined,
      start_time: session.scheduled_at,
      is_expert: true
    }));

    // Combine both sets of data
    return [...processedRequesterSessions, ...processedExpertSessions];
  }
};
