/**
 * Extended unit tests for JourneyUnifiedService
 * 
 * Tests for the new methods added in Sprint 1 Week 2:
 * - compareTools (alias for compareTool)
 * - Enhanced tests for getStepComplete
 */

import { JourneyUnifiedService } from '../lib/services/journey-unified.service';
import { supabase } from '../lib/supabase';
import {
  JourneyPhase,
  JourneyStep,
  CompanyJourneyStep,
  JourneyStepComplete,
  Tool
} from '../lib/types/journey-unified.types';

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

// Mock the analytics service
jest.mock('../lib/services/analytics.service', () => ({
  trackEvent: jest.fn(),
}));

describe('JourneyUnifiedService - Extended Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStepComplete', () => {
    it('should return complete step with all related data', async () => {
      // Mock step data
      const mockStep: JourneyStep = {
        id: 'step1',
        name: 'Step 1',
        description: 'Step description',
        phase_id: 'phase1',
        difficulty_level: 3,
        estimated_time_min: 30,
        estimated_time_max: 60,
        order_index: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prerequisite_steps: ['step0']
      };

      // Mock phase data
      const mockPhase: JourneyPhase = {
        id: 'phase1',
        name: 'Phase 1',
        description: 'Phase description',
        order_index: 10,
        color: '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock tools data
      const mockTools: Tool[] = [
        {
          id: 'tool1',
          name: 'Tool 1',
          description: 'Tool 1 description',
          url: 'https://tool1.com',
          logo_url: 'https://tool1.com/logo.png',
          type: 'software',
          category: 'productivity',
          pricing_model: 'freemium',
          is_premium: false
        },
        {
          id: 'tool2',
          name: 'Tool 2',
          description: 'Tool 2 description',
          url: 'https://tool2.com',
          logo_url: 'https://tool2.com/logo.png',
          type: 'service',
          category: 'marketing',
          pricing_model: 'subscription',
          is_premium: true
        }
      ];

      // Mock prerequisite step
      const mockPrereqStep: JourneyStep = {
        id: 'step0',
        name: 'Prerequisite Step',
        description: 'Must be completed first',
        phase_id: 'phase1',
        difficulty_level: 2,
        estimated_time_min: 15,
        estimated_time_max: 30,
        order_index: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock company progress
      const mockProgress: CompanyJourneyStep = {
        id: 'progress1',
        company_id: 'company1',
        step_id: 'step1',
        status: 'in_progress',
        notes: 'Working on it',
        completion_percentage: 50,
        order_index: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock selected tool
      const mockSelectedTool: Tool = mockTools[0];

      // Get the mock query builder
      const mockQueryBuilder = (supabase.from as jest.Mock)();
      
      // Set up mock responses for different tables
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'journey_steps') {
          mockQueryBuilder.single.mockResolvedValueOnce({
            data: mockStep,
            error: null
          });
        } else if (table === 'journey_phases') {
          mockQueryBuilder.single.mockResolvedValueOnce({
            data: mockPhase,
            error: null
          });
        } else if (table === 'step_tools') {
          mockQueryBuilder.order.mockResolvedValueOnce({
            data: mockTools.map(tool => ({ tools: tool })),
            error: null
          });
        } else if (table === 'company_journey_steps') {
          mockQueryBuilder.single.mockResolvedValueOnce({
            data: mockProgress,
            error: null
          });
        } else if (table === 'company_step_tools') {
          mockQueryBuilder.order.mockResolvedValueOnce({
            data: [{ tool_id: 'tool1', is_selected: true }],
            error: null
          });
        }
        return mockQueryBuilder;
      });
      
      // Mock getStepById for prerequisite step
      (supabase.from as jest.Mock).mockImplementationOnce((table: string) => {
        if (table === 'journey_steps') {
          mockQueryBuilder.single.mockResolvedValueOnce({
            data: mockPrereqStep,
            error: null
          });
        }
        return mockQueryBuilder;
      });

      // Call the method with company ID
      const result = await JourneyUnifiedService.getStepComplete('step1', 'company1');

      // Verify the result
      expect(result).toBeTruthy();
      expect(result.id).toBe('step1');
      expect(result.phase_name).toBe('Phase 1');
      expect(result.phase_color).toBe('#3B82F6');
      expect(result.tools).toHaveLength(2);
      expect(result.prerequisites).toBeDefined();
      expect(result.prerequisites!.length).toBe(1);
      expect(result.prerequisites![0].id).toBe('step0');
      expect(result.company_progress).toBeTruthy();
      expect(result.company_progress?.status).toBe('in_progress');
      expect(result.selected_tool).toBeTruthy();
      expect(result.selected_tool?.id).toBe('tool1');
    });

    it('should handle missing data gracefully', async () => {
      // Mock step data but with missing related data
      const mockStep: JourneyStep = {
        id: 'step1',
        name: 'Step 1',
        description: 'Step description',
        phase_id: 'phase1',
        difficulty_level: 3,
        estimated_time_min: 30,
        estimated_time_max: 60,
        order_index: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Get the mock query builder
      const mockQueryBuilder = (supabase.from as jest.Mock)();
      
      // Set up mock responses
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'journey_steps') {
          mockQueryBuilder.single.mockResolvedValueOnce({
            data: mockStep,
            error: null
          });
        } else {
          // Return null for all other tables to simulate missing data
          mockQueryBuilder.single.mockResolvedValue({
            data: null,
            error: null
          });
          mockQueryBuilder.order.mockResolvedValue({
            data: [],
            error: null
          });
        }
        return mockQueryBuilder;
      });

      // Call the method
      const result = await JourneyUnifiedService.getStepComplete('step1');

      // Verify the result handles missing data gracefully
      expect(result).toBeTruthy();
      expect(result.id).toBe('step1');
      expect(result.phase_name).toBe('');
      expect(result.phase_color).toBe('');
      expect(result.tools).toHaveLength(0);
      expect(result.prerequisites).toHaveLength(0);
      expect(result.company_progress).toBeUndefined();
      expect(result.selected_tool).toBeUndefined();
    });

    it('should throw an error when step is not found', async () => {
      // Get the mock query builder
      const mockQueryBuilder = (supabase.from as jest.Mock)();
      
      // Mock step not found
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'journey_steps') {
          mockQueryBuilder.single.mockResolvedValueOnce({
            data: null,
            error: { code: 'PGRST116', message: 'Not found' }
          });
        }
        return mockQueryBuilder;
      });

      // Call the method and expect it to throw
      await expect(JourneyUnifiedService.getStepComplete('nonexistent')).rejects.toThrow(
        'Step with ID nonexistent not found'
      );
    });
  });

  describe('compareTools', () => {
    it('should call the RPC function with tool IDs', async () => {
      const toolIds = ['tool1', 'tool2', 'tool3'];
      const mockComparisonData = [
        {
          tool_id: 'tool1',
          name: 'Tool 1',
          pros: ['Easy to use', 'Free tier'],
          cons: ['Limited features'],
          rating_avg: 4.5
        },
        {
          tool_id: 'tool2',
          name: 'Tool 2',
          pros: ['Full featured', 'Good support'],
          cons: ['Expensive', 'Steep learning curve'],
          rating_avg: 4.0
        }
      ];

      // Mock RPC response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockComparisonData,
        error: null
      });

      // Call the method
      const result = await JourneyUnifiedService.compareTools(toolIds);

      // Verify RPC was called correctly
      expect(supabase.rpc).toHaveBeenCalledWith('get_tool_comparison_data', { p_tool_ids: toolIds });
      
      // Verify result
      expect(result).toEqual(mockComparisonData);
    });

    it('should return empty array when no tool IDs are provided', async () => {
      const result = await JourneyUnifiedService.compareTools([]);
      
      // Verify RPC was not called
      expect(supabase.rpc).not.toHaveBeenCalled();
      
      // Verify empty result
      expect(result).toEqual([]);
    });

    it('should throw an error when RPC fails', async () => {
      const toolIds = ['tool1', 'tool2'];
      
      // Mock RPC error
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC error' }
      });

      // Call the method and expect it to throw
      await expect(JourneyUnifiedService.compareTools(toolIds)).rejects.toThrow('RPC error');
    });

    it('should be an alias for compareTool method', async () => {
      // Spy on the compareTool method
      const compareToolSpy = jest.spyOn(JourneyUnifiedService, 'compareTool');
      
      const toolIds = ['tool1', 'tool2'];
      
      // Call compareTools
      await JourneyUnifiedService.compareTools(toolIds);
      
      // Verify compareTool was called with the same arguments
      expect(compareToolSpy).toHaveBeenCalledWith(toolIds);
    });
  });
});
