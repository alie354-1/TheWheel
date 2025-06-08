import { supabase } from '@/lib/supabase';

/**
 * Interface for connection requests between users and experts
 */
export interface ConnectRequest {
  id: string;
  requester_id: string;
  expert_id: string;
  message?: string;
  expertise_area?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  // Extended properties from joins
  expert_name?: string;
  expert_avatar_url?: string;
  requester_name?: string;
  requester_avatar_url?: string;
}

/**
 * Service for managing connection requests between users and experts
 * Fixed version that handles foreign key constraints properly
 */
export const connectService = {
  /**
   * Create a new connection request
   * @param data The connection request data
   * @returns The created connection request
   */
  async createConnectRequest(data: Omit<ConnectRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ConnectRequest | null> {
    // First, verify that the expert exists in expert_profiles
    const { data: expertProfile, error: expertError } = await supabase
      .from('expert_profiles')
      .select('user_id')
      .eq('id', data.expert_id)
      .single();

    if (expertError) {
      console.error('Error finding expert profile:', expertError);
      throw new Error(`Expert profile not found: ${expertError.message}`);
    }

    // Use the user_id from the expert profile for the expert_id
    const { data: request, error } = await supabase
      .from('expert_connect_requests')
      .insert({
        requester_id: data.requester_id,
        expert_id: expertProfile.user_id, // Use the user_id from the expert profile
        message: data.message,
        expertise_area: data.expertise_area,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating connection request:', error);
      throw error;
    }

    return request;
  },

  /**
   * Get connection requests for an expert
   * @param expertId The expert's ID
   * @param status Optional status filter
   * @returns Array of connection requests
   */
  async getConnectRequestsByExpert(expertId: string, status?: string): Promise<ConnectRequest[]> {
    // First, get the user_id from the expert profile
    const { data: expertProfile, error: expertError } = await supabase
      .from('expert_profiles')
      .select('user_id')
      .eq('id', expertId)
      .single();

    if (expertError) {
      console.error('Error finding expert profile:', expertError);
      throw new Error(`Expert profile not found: ${expertError.message}`);
    }

    let query = supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('expert_id', expertProfile.user_id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching connection requests:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get connection requests for a user
   * @param userId The user's ID
   * @param status Optional status filter
   * @returns Array of connection requests
   */
  async getConnectRequestsByUser(userId: string, status?: string): Promise<ConnectRequest[]> {
    let query = supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('requester_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching connection requests:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific connection request by ID
   * @param requestId The connection request ID
   * @returns The connection request
   */
  async getConnectRequestById(requestId: string): Promise<ConnectRequest | null> {
    const { data, error } = await supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Error fetching connection request:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update the status of a connection request
   * @param requestId The connection request ID
   * @param updates The updates to apply
   * @returns The updated connection request
   */
  async updateConnectRequestStatus(requestId: string, updates: { status: 'accepted' | 'declined' }): Promise<ConnectRequest | null> {
    const { data, error } = await supabase
      .from('expert_connect_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating connection request:', error);
      throw error;
    }

    return data;
  },

  /**
   * Check if a connection exists between a user and an expert
   * @param userId The user's ID
   * @param expertId The expert's ID
   * @returns The connection request if it exists
   */
  async checkConnectionExists(userId: string, expertId: string): Promise<ConnectRequest | null> {
    // First, get the user_id from the expert profile
    const { data: expertProfile, error: expertError } = await supabase
      .from('expert_profiles')
      .select('user_id')
      .eq('id', expertId)
      .single();

    if (expertError) {
      console.error('Error finding expert profile:', expertError);
      throw new Error(`Expert profile not found: ${expertError.message}`);
    }

    const { data, error } = await supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('requester_id', userId)
      .eq('expert_id', expertProfile.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking connection:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get all users connected to an expert
   * @param expertId The expert's ID
   * @returns Array of connected users
   */
  async getConnectedUsers(expertId: string): Promise<any[]> {
    // First, get the user_id from the expert profile
    const { data: expertProfile, error: expertError } = await supabase
      .from('expert_profiles')
      .select('user_id')
      .eq('id', expertId)
      .single();

    if (expertError) {
      console.error('Error finding expert profile:', expertError);
      throw new Error(`Expert profile not found: ${expertError.message}`);
    }

    const { data, error } = await supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('expert_id', expertProfile.user_id)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching connected users:', error);
      throw error;
    }

    // Return the requester IDs
    return (data || []).map(connection => ({
      id: connection.requester_id,
      name: "Requester User", // Placeholder
      avatar_url: undefined
    }));
  },

  /**
   * Get all experts connected to a user
   * @param userId The user's ID
   * @returns Array of connected experts
   */
  async getConnectedExperts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('requester_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching connected experts:', error);
      throw error;
    }

    // For each expert_id (which is a user_id), find the corresponding expert profile
    const expertProfiles = [];
    for (const connection of (data || [])) {
      const { data: profile, error: profileError } = await supabase
        .from('expert_profiles')
        .select('id, user_name')
        .eq('user_id', connection.expert_id)
        .single();

      if (!profileError && profile) {
        expertProfiles.push({
          id: profile.id,
          name: profile.user_name || "Expert User",
          avatar_url: undefined
        });
      }
    }

    return expertProfiles;
  },

  /**
   * Get all connection requests for a user (both as requester and expert)
   * @param userId The user's ID
   * @returns Array of connection requests
   */
  async getUserConnectRequests(userId: string): Promise<ConnectRequest[]> {
    // First get requests where the user is the requester
    const { data: requesterData, error: requesterError } = await supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('requester_id', userId);

    if (requesterError) {
      console.error('Error fetching user connection requests as requester:', requesterError);
      throw requesterError;
    }

    // Then get requests where the user is the expert
    const { data: expertData, error: expertError } = await supabase
      .from('expert_connect_requests')
      .select('*')
      .eq('expert_id', userId);

    if (expertError) {
      console.error('Error fetching user connection requests as expert:', expertError);
      throw expertError;
    }

    // Process requester data to add placeholder expert info
    const processedRequesterData = (requesterData || []).map(request => ({
      ...request,
      expert_name: "Expert User", // Placeholder
      expert_avatar_url: undefined
    }));

    // Process expert data to add placeholder requester info
    const processedExpertData = (expertData || []).map(request => ({
      ...request,
      requester_name: "Requester User", // Placeholder
      requester_avatar_url: undefined
    }));

    // Combine both sets of data
    return [...processedRequesterData, ...processedExpertData];
  }
};
