/**
 * Tests for the Journey System Compatibility Layer
 * 
 * Verifies that the compatibility views and functions work correctly
 */

import { supabase } from '../lib/supabase';

// Mock the supabase client
jest.mock('../lib/supabase', () => {
  // Create a mock query builder that can be returned by from()
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
  };
  
  // Create the mock supabase client
  const mockSupabase = {
    from: jest.fn(() => mockQueryBuilder),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null })
  };
  
  return { supabase: mockSupabase };
});

describe('Journey Compatibility Layer', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('company_challenge_progress_view', () => {
    it('should return data compatible with the old challenge progress structure', async () => {
      // Mock data returned from the view
      const mockViewData = [
        {
          challenge_id: 'step1', // Mapped from step_id
          company_id: 'company1',
          status: 'completed',
          notes: 'Completed successfully',
          completed_at: new Date().toISOString()
        },
        {
          challenge_id: 'step2', // Mapped from step_id
          company_id: 'company1',
          status: 'in_progress',
          notes: 'Working on it',
          completed_at: null
        }
      ];

      // Get the mock query builder
      const mockQueryBuilder = (supabase.from as jest.Mock)();
      
      // Mock the select call on the view
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'company_challenge_progress_view') {
          mockQueryBuilder.select.mockResolvedValue({
            data: mockViewData,
            error: null
          });
        }
        return mockQueryBuilder;
      });

      // Query the view
      const { data, error } = await supabase
        .from('company_challenge_progress_view')
        .select('*')
        .eq('company_id', 'company1');

      // Verify the result
      expect(error).toBeNull();
      expect(data).toEqual(mockViewData);
      expect(supabase.from).toHaveBeenCalledWith('company_challenge_progress_view');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('company_id', 'company1');
    });
  });

  describe('challenge_tool_recommendations_view', () => {
    it('should return data compatible with the old tool recommendation structure', async () => {
      // Mock data returned from the view
      const mockViewData = [
        {
          challenge_id: 'step1', // Mapped from step_id
          tool_id: 'tool1',
          tool_name: 'Tool 1',
          relevance_score: 0.9
        },
        {
          challenge_id: 'step1', // Mapped from step_id
          tool_id: 'tool2',
          tool_name: 'Tool 2',
          relevance_score: 0.8
        }
      ];

      // Get the mock query builder
      const mockQueryBuilder = (supabase.from as jest.Mock)();
      
      // Mock the select call on the view
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'challenge_tool_recommendations_view') {
          mockQueryBuilder.select.mockResolvedValue({
            data: mockViewData,
            error: null
          });
        }
        return mockQueryBuilder;
      });

      // Query the view
      const { data, error } = await supabase
        .from('challenge_tool_recommendations_view')
        .select('*')
        .eq('challenge_id', 'step1');

      // Verify the result
      expect(error).toBeNull();
      expect(data).toEqual(mockViewData);
      expect(supabase.from).toHaveBeenCalledWith('challenge_tool_recommendations_view');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('challenge_id', 'step1');
    });
  });

  describe('get_tool_evaluations_for_step', () => {
    it('should call the RPC function with correct parameters', async () => {
      // Mock RPC response
      const mockRpcData = [
        { tool_id: 'tool1', rating: 5, notes: 'Great tool' },
        { tool_id: 'tool2', rating: 3, notes: 'Okay tool' }
      ];
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockRpcData,
        error: null
      });

      // Call the RPC function
      const { data, error } = await supabase.rpc('get_tool_evaluations_for_step', {
        p_company_id: 'company1',
        p_step_id: 'step1'
      });

      // Verify the result
      expect(error).toBeNull();
      expect(data).toEqual(mockRpcData);
      expect(supabase.rpc).toHaveBeenCalledWith('get_tool_evaluations_for_step', {
        p_company_id: 'company1',
        p_step_id: 'step1'
      });
    });
  });

  describe('get_tool_comparison_data', () => {
    it('should call the RPC function with correct parameters', async () => {
      // Mock RPC response
      const mockRpcData = [
        { tool_id: 'tool1', name: 'Tool 1', pros: ['Easy'], cons: ['Limited'] },
        { tool_id: 'tool2', name: 'Tool 2', pros: ['Powerful'], cons: ['Complex'] }
      ];
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockRpcData,
        error: null
      });

      // Call the RPC function
      const { data, error } = await supabase.rpc('get_tool_comparison_data', {
        p_tool_ids: ['tool1', 'tool2']
      });

      // Verify the result
      expect(error).toBeNull();
      expect(data).toEqual(mockRpcData);
      expect(supabase.rpc).toHaveBeenCalledWith('get_tool_comparison_data', {
        p_tool_ids: ['tool1', 'tool2']
      });
    });
  });
});
