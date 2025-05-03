/**
 * Tool-specific unit tests for JourneyUnifiedService
 * 
 * Tests the tool selection, evaluation, and custom tool functionality
 */

import { JourneyUnifiedService } from '../lib/services/journey-unified.service';
import { supabase } from '../lib/supabase';
import { Tool, CompanyStepTool } from '../lib/types/journey-unified.types';

// Mock the supabase client
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
    rpc: jest.fn().mockReturnValue({ data: null, error: null })
  };
  
  return { supabase: mockSupabase };
});

describe('JourneyUnifiedService - Tool Functionality', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToolsForStep', () => {
    it('should return tools for a step with no filters', async () => {
      const mockToolData = [
        { 
          tool: { 
            id: 'tool1', 
            name: 'Tool 1', 
            description: 'First tool', 
            type: 'software', 
            category: 'crm', 
            is_premium: false 
          } 
        },
        { 
          tool: { 
            id: 'tool2', 
            name: 'Tool 2', 
            description: 'Second tool', 
            type: 'service', 
            category: 'marketing', 
            is_premium: true 
          } 
        },
        { 
          tool: { 
            id: 'tool3', 
            name: 'Tool 3', 
            description: 'Third tool', 
            type: 'software', 
            category: 'finance', 
            is_premium: false 
          } 
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockToolData,
        error: null
      });

      const tools = await JourneyUnifiedService.getToolsForStep('step1');

      expect(supabase.from).toHaveBeenCalledWith('step_tools');
      expect(supabase.eq).toHaveBeenCalledWith('step_id', 'step1');
      expect(tools).toHaveLength(3);
      expect(tools[0].id).toBe('tool1');
      expect(tools[1].id).toBe('tool2');
      expect(tools[2].id).toBe('tool3');
    });

    it('should apply filters correctly', async () => {
      const mockToolData = [
        { 
          tool: { 
            id: 'tool1', 
            name: 'Tool 1', 
            description: 'First tool', 
            type: 'software', 
            category: 'crm', 
            is_premium: false 
          } 
        },
        { 
          tool: { 
            id: 'tool2', 
            name: 'Tool 2', 
            description: 'Second tool', 
            type: 'service', 
            category: 'marketing', 
            is_premium: true 
          } 
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.gte as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockToolData,
        error: null
      });

      const tools = await JourneyUnifiedService.getToolsForStep('step1', {
        minRelevanceScore: 0.7,
        category: 'crm',
        isPremium: false
      });

      expect(supabase.gte).toHaveBeenCalledWith('relevance_score', 0.7);
      // Category and isPremium filters are applied client-side
      expect(tools).toHaveLength(1);
      expect(tools[0].id).toBe('tool1');
      expect(tools[0].category).toBe('crm');
      expect(tools[0].is_premium).toBe(false);
    });
  });

  describe('getCompanyToolEvaluations', () => {
    it('should return evaluations for all steps when step ID is not provided', async () => {
      const mockEvals = [
        { 
          id: 'eval1', 
          company_id: 'company1', 
          step_id: 'step1', 
          tool_id: 'tool1', 
          rating: 4,
          notes: 'Good tool',
          is_custom: false
        },
        { 
          id: 'eval2', 
          company_id: 'company1', 
          step_id: 'step2', 
          tool_id: 'tool2', 
          rating: 5,
          notes: 'Excellent tool',
          is_custom: true
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockResolvedValue({
        data: mockEvals,
        error: null
      });

      const evals = await JourneyUnifiedService.getCompanyToolEvaluations('company1');

      expect(supabase.from).toHaveBeenCalledWith('company_step_tools');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 'company1');
      expect(evals).toHaveLength(2);
    });

    it('should filter evaluations by step ID when provided', async () => {
      const mockEvals = [
        { 
          id: 'eval1', 
          company_id: 'company1', 
          step_id: 'step1', 
          tool_id: 'tool1', 
          rating: 4,
          notes: 'Good tool',
          is_custom: false
        }
      ];

      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockImplementation((field, value) => {
        // This mimics Supabase behavior of chaining .eq() calls
        if (field === 'company_id') {
          return supabase;
        } else if (field === 'step_id') {
          return {
            data: mockEvals,
            error: null
          };
        }
        return supabase;
      });

      const evals = await JourneyUnifiedService.getCompanyToolEvaluations('company1', 'step1');

      expect(supabase.from).toHaveBeenCalledWith('company_step_tools');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 'company1');
      expect(supabase.eq).toHaveBeenCalledWith('step_id', 'step1');
      expect(evals).toHaveLength(1);
      expect(evals[0].step_id).toBe('step1');
    });
  });

  describe('updateToolEvaluation', () => {
    it('should update an existing evaluation record', async () => {
      // Mock existing evaluation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 'eval1' },
        error: null
      });
      
      // Mock update operation
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockResolvedValue({
        data: { id: 'eval1', rating: 5, notes: 'Updated notes' },
        error: null
      });

      const result = await JourneyUnifiedService.updateToolEvaluation(
        'company1',
        'step1',
        'tool1',
        {
          rating: 5,
          notes: 'Updated notes'
        }
      );

      expect(result).toBe(true);
      expect(supabase.update).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', 'eval1');
    });

    it('should create a new evaluation record when none exists', async () => {
      // Mock no existing evaluation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: null
      });
      
      // Mock insert operation
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockResolvedValue({
        data: { id: 'new-eval', rating: 4, notes: 'New eval' },
        error: null
      });

      const result = await JourneyUnifiedService.updateToolEvaluation(
        'company1',
        'step1',
        'tool1',
        {
          rating: 4,
          notes: 'New eval'
        }
      );

      expect(result).toBe(true);
      expect(supabase.insert).toHaveBeenCalled();
      // Verify the right data was included
      const insertCall = (supabase.insert as jest.Mock).mock.calls[0][0];
      expect(insertCall).toHaveProperty('company_id', 'company1');
      expect(insertCall).toHaveProperty('step_id', 'step1');
      expect(insertCall).toHaveProperty('tool_id', 'tool1');
      expect(insertCall).toHaveProperty('rating', 4);
      expect(insertCall).toHaveProperty('notes', 'New eval');
    });

    it('should handle selection as primary tool correctly', async () => {
      // Mock existing evaluation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 'eval1' },
        error: null
      });
      
      // Mock update operations
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockImplementation((field, value) => {
        if (field === 'id') {
          return {
            data: { id: 'eval1', selected_at: new Date().toISOString() },
            error: null
          };
        } else if (field === 'company_id' && value === 'company1') {
          if ((supabase.eq as jest.Mock).mock.calls.find(
            call => call[0] === 'step_id' && call[1] === 'step1')) {
            return {
              data: null,
              error: null
            };
          }
        }
        return supabase;
      });
      (supabase.neq as jest.Mock).mockReturnThis();

      const result = await JourneyUnifiedService.updateToolEvaluation(
        'company1',
        'step1',
        'tool1',
        {
          is_selected: true
        }
      );

      expect(result).toBe(true);
      
      // Check that the tool was marked as selected
      const updateCall = (supabase.update as jest.Mock).mock.calls[0][0];
      expect(updateCall).toHaveProperty('selected_at');
      
      // Check that other tools were deselected
      expect(supabase.neq).toHaveBeenCalledWith('tool_id', 'tool1');
    });
  });

  describe('addCustomTool', () => {
    it('should create a new custom tool', async () => {
      const customTool = {
        name: 'Custom Tool',
        description: 'A custom tool added by the company',
        url: 'https://customtool.com',
        type: 'software',
        category: 'productivity',
        is_premium: false
      };
      
      // Mock tool creation
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 'new-tool-id', ...customTool },
        error: null
      });

      const toolId = await JourneyUnifiedService.addCustomTool(
        'company1',
        customTool
      );

      expect(toolId).toBe('new-tool-id');
      expect(supabase.from).toHaveBeenCalledWith('tools');
      expect(supabase.insert).toHaveBeenCalled();
      
      // Verify the custom tool data was correctly passed
      const insertCall = (supabase.insert as jest.Mock).mock.calls[0][0];
      expect(insertCall).toHaveProperty('name', 'Custom Tool');
      expect(insertCall).toHaveProperty('description', 'A custom tool added by the company');
      expect(insertCall).toHaveProperty('type', 'software');
      expect(insertCall).toHaveProperty('is_premium', false);
    });

    it('should associate the custom tool with a step when step ID is provided', async () => {
      const customTool = {
        name: 'Custom Tool',
        description: 'A custom tool added by the company',
        url: 'https://customtool.com',
        type: 'software',
        category: 'productivity',
        is_premium: false
      };
      
      // Mock tool creation and subsequent operations
      const mockCalls: string[] = [];
      
      (supabase.from as jest.Mock).mockImplementation((table) => {
        mockCalls.push(`from:${table}`);
        return supabase;
      });
      
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockImplementation(() => {
        if (mockCalls.includes('from:tools') && !mockCalls.includes('from:step_tools')) {
          return Promise.resolve({
            data: { id: 'new-tool-id', ...customTool },
            error: null
          });
        }
        return Promise.resolve({
          data: null,
          error: null
        });
      });
      
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.neq as jest.Mock).mockReturnThis();

      const toolId = await JourneyUnifiedService.addCustomTool(
        'company1',
        customTool,
        'step1',
        true // Selected
      );

      expect(toolId).toBe('new-tool-id');
      
      // Verify the step tool association was created
      expect(mockCalls).toContain('from:step_tools');
      expect(mockCalls).toContain('from:company_step_tools');
      
      // Check association data
      const stepToolCall = (supabase.insert as jest.Mock).mock.calls.find(
        call => JSON.stringify(call).includes('step_id')
      );
      expect(stepToolCall[0]).toHaveProperty('step_id', 'step1');
      expect(stepToolCall[0]).toHaveProperty('tool_id', 'new-tool-id');
      
      // Check company tool evaluation
      const evalCall = (supabase.insert as jest.Mock).mock.calls.find(
        call => JSON.stringify(call).includes('is_custom')
      );
      expect(evalCall[0]).toHaveProperty('company_id', 'company1');
      expect(evalCall[0]).toHaveProperty('step_id', 'step1');
      expect(evalCall[0]).toHaveProperty('tool_id', 'new-tool-id');
      expect(evalCall[0]).toHaveProperty('is_custom', true);
      expect(evalCall[0]).toHaveProperty('selected_at');
    });
  });
});
