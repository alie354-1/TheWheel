/**
 * Unit tests for JourneyUnifiedService
 * 
 * Tests the core functionality of the unified journey system service
 */

import { JourneyUnifiedService } from '../lib/services/journey-unified.service';
import { supabase } from '../lib/supabase';
import {
  JourneyPhase,
  JourneyStep,
  CompanyJourneyStep,
  JourneyStepComplete
} from '../lib/types/journey-unified.types';

// Mock the supabase client
// Using @ts-ignore to bypass type checking for jest mock functions
// In a real implementation, we would create proper type definitions for mock objects
// @ts-ignore - ignoring TS errors for mocking
jest.mock('../lib/supabase', () => {
  // Create a mock of all methods used by our service
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
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
    rpc: jest.fn().mockReturnValue({ data: 10, error: null })
  };
  
  return { supabase: mockSupabase };
});

describe('JourneyUnifiedService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPhases', () => {
    it('should return phases ordered by order_index', async () => {
      const mockPhases: JourneyPhase[] = [
        {
          id: 'phase1',
          name: 'Phase 1',
          description: 'First phase',
          order_index: 10,
          color: '#3B82F6',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'phase2',
          name: 'Phase 2',
          description: 'Second phase',
          order_index: 20,
          color: '#10B981',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockPhases,
        error: null
      });

      const phases = await JourneyUnifiedService.getPhases();

      expect(supabase.from).toHaveBeenCalledWith('journey_phases');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.order).toHaveBeenCalledWith('order_index');
      expect(phases).toEqual(mockPhases);
    });

    it('should return empty array on error', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Test error' }
      });

      const phases = await JourneyUnifiedService.getPhases();

      expect(phases).toEqual([]);
    });
  });

  describe('getSteps', () => {
    it('should return steps with no filters', async () => {
      const mockSteps: JourneyStep[] = [
        {
          id: 'step1',
          name: 'Step 1',
          description: 'First step',
          phase_id: 'phase1',
          difficulty_level: 3,
          estimated_time_min: 30,
          estimated_time_max: 60,
          order_index: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockSteps,
        error: null
      });

      const steps = await JourneyUnifiedService.getSteps();

      expect(supabase.from).toHaveBeenCalledWith('journey_steps');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.order).toHaveBeenCalledWith('order_index');
      expect(steps).toEqual(mockSteps);
    });

    it('should apply phaseId filter when provided', async () => {
      const mockSteps: JourneyStep[] = [
        {
          id: 'step1',
          name: 'Step 1',
          description: 'First step',
          phase_id: 'phase1',
          difficulty_level: 3,
          estimated_time_min: 30,
          estimated_time_max: 60,
          order_index: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockSteps,
        error: null
      });

      const steps = await JourneyUnifiedService.getSteps({ phaseId: 'phase1' });

      expect(supabase.from).toHaveBeenCalledWith('journey_steps');
      expect(supabase.eq).toHaveBeenCalledWith('phase_id', 'phase1');
      expect(steps).toEqual(mockSteps);
    });
  });

  describe('getStepComplete', () => {
    it('should return complete step with all related data', async () => {
      const mockStep = {
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
        phase: {
          id: 'phase1',
          name: 'Phase 1',
          order_index: 10
        }
      };

      const mockTools = [
        { tool: { id: 'tool1', name: 'Tool 1' } },
        { tool: { id: 'tool2', name: 'Tool 2' } }
      ];

      // Set up mock responses
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockImplementation(() => {
        // This is a bit of a hack to handle different responses based on the call sequence
        if ((supabase.from as jest.Mock).mock.calls.slice(-1)[0][0] === 'journey_steps') {
          return Promise.resolve({ data: mockStep, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });
      
      (supabase.order as jest.Mock).mockImplementation(() => {
        if ((supabase.from as jest.Mock).mock.calls.slice(-1)[0][0] === 'step_tools') {
          return Promise.resolve({ data: mockTools, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const result = await JourneyUnifiedService.getStepComplete('step1');

      expect(result).toBeTruthy();
      expect(result?.id).toBe('step1');
      expect(result?.phase).toBeTruthy();
      expect(result?.tools).toHaveLength(2);
    });
  });

  describe('updateStepProgress', () => {
    it('should update existing record when found', async () => {
      // Mock existing record
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 'progress1' },
        error: null
      });
      
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockResolvedValue({
        data: { id: 'progress1', status: 'completed' },
        error: null
      });

      const result = await JourneyUnifiedService.updateStepProgress(
        'company1',
        'step1',
        {
          status: 'completed',
          notes: 'Completed successfully'
        }
      );

      expect(result).toBe(true);
      expect(supabase.update).toHaveBeenCalled();
    });

    it('should insert new record when not found', async () => {
      // Mock no existing record
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: null
      });
      
      // Mock RPC call for order index
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 10,
        error: null
      });
      
      // Mock insert
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockResolvedValue({
        data: { id: 'new-progress' },
        error: null
      });

      const result = await JourneyUnifiedService.updateStepProgress(
        'company1',
        'step1',
        {
          status: 'in_progress',
          completion_percentage: 50
        }
      );

      expect(result).toBe(true);
      expect(supabase.insert).toHaveBeenCalled();
    });
  });
  
  describe('getToolsForStep', () => {
    it('should return tools for a step', async () => {
      const mockTools = [
        { tool: { id: 'tool1', name: 'Tool 1', is_premium: false, type: 'software' } },
        { tool: { id: 'tool2', name: 'Tool 2', is_premium: true, type: 'service' } }
      ];
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockTools,
        error: null
      });

      const tools = await JourneyUnifiedService.getToolsForStep('step1');
      
      expect(tools).toHaveLength(2);
      expect(tools[0].id).toBe('tool1');
      expect(tools[1].id).toBe('tool2');
    });
    
    it('should apply filters correctly', async () => {
      const mockTools = [
        { tool: { id: 'tool1', name: 'Tool 1', is_premium: false, type: 'software', category: 'crm' } },
        { tool: { id: 'tool2', name: 'Tool 2', is_premium: true, type: 'service', category: 'finance' } }
      ];
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.gte as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockTools,
        error: null
      });

      const tools = await JourneyUnifiedService.getToolsForStep('step1', {
        minRelevanceScore: 0.7,
        category: 'crm',
        isPremium: false
      });
      
      expect(supabase.gte).toHaveBeenCalledWith('relevance_score', 0.7);
      // The category and isPremium filters are applied at the JS level, not the DB level
      expect(tools).toHaveLength(1);
      expect(tools[0].id).toBe('tool1');
    });
  });
});
