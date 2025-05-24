/**
 * Tests for useJourneySteps hook
 * 
 * Tests the functionality of the useJourneySteps hook
 */

import { useJourneySteps } from '../lib/hooks/useJourneySteps';
import { JourneyUnifiedService } from '../lib/services/journey-unified.service';
import { renderHookWithProviders, waitForHookToLoad, createMockSupabaseClient } from './hook-testing-utils';
import { JourneyStep, CompanyJourneyStep } from '../lib/types/journey-unified.types';

// Mock the JourneyUnifiedService
jest.mock('../lib/services/journey-unified.service', () => {
  return {
    JourneyUnifiedService: {
      getSteps: jest.fn(),
      getCompanyProgress: jest.fn()
    }
  };
});

describe('useJourneySteps', () => {
  // Mock data
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
    },
    {
      id: 'step2',
      name: 'Step 2',
      description: 'Second step',
      phase_id: 'phase1',
      difficulty_level: 2,
      estimated_time_min: 15,
      estimated_time_max: 30,
      order_index: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const mockCompanyProgress: CompanyJourneyStep[] = [
    {
      id: 'progress1',
      company_id: 'company1',
      step_id: 'step1',
      status: 'completed',
      completion_percentage: 100,
      order_index: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    },
    {
      id: 'progress2',
      company_id: 'company1',
      step_id: 'step2',
      status: 'in_progress',
      completion_percentage: 50,
      order_index: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch steps without company ID', async () => {
    // Mock the service methods
    (JourneyUnifiedService.getSteps as jest.Mock).mockResolvedValue(mockSteps);

    // Render the hook
    const { result } = renderHookWithProviders(() => useJourneySteps());

    // Wait for the hook to finish loading
    await waitForHookToLoad(result);

    // Verify the service was called correctly
    expect(JourneyUnifiedService.getSteps).toHaveBeenCalled();
    expect(JourneyUnifiedService.getCompanyProgress).not.toHaveBeenCalled();

    // Verify the result
    expect(result.current.steps).toEqual(mockSteps);
    expect(result.current.companyProgress).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch steps with company ID', async () => {
    // Mock the service methods
    (JourneyUnifiedService.getSteps as jest.Mock).mockResolvedValue(mockSteps);
    (JourneyUnifiedService.getCompanyProgress as jest.Mock).mockResolvedValue(mockCompanyProgress);

    // Render the hook with company ID
    const { result } = renderHookWithProviders(() => useJourneySteps({ companyId: 'company1' }));

    // Wait for the hook to finish loading
    await waitForHookToLoad(result);

    // Verify the service was called correctly
    expect(JourneyUnifiedService.getSteps).toHaveBeenCalled();
    expect(JourneyUnifiedService.getCompanyProgress).toHaveBeenCalledWith('company1');

    // Verify the result
    expect(result.current.steps).toEqual(mockSteps);
    expect(result.current.companyProgress).toEqual(mockCompanyProgress);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should filter steps by phase ID', async () => {
    // Mock the service methods
    (JourneyUnifiedService.getSteps as jest.Mock).mockResolvedValue(mockSteps);

    // Render the hook with phase ID
    const { result } = renderHookWithProviders(() => useJourneySteps({ phaseId: 'phase1' }));

    // Wait for the hook to finish loading
    await waitForHookToLoad(result);

    // Verify the service was called correctly
    expect(JourneyUnifiedService.getSteps).toHaveBeenCalledWith({ phaseId: 'phase1' });

    // Verify the result
    expect(result.current.steps).toEqual(mockSteps);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    // Mock the service methods to throw an error
    const mockError = new Error('Failed to fetch steps');
    (JourneyUnifiedService.getSteps as jest.Mock).mockRejectedValue(mockError);

    // Render the hook
    const { result } = renderHookWithProviders(() => useJourneySteps());

    // Wait for the hook to finish loading
    await waitForHookToLoad(result);

    // Verify the result
    expect(result.current.steps).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('should merge steps with company progress', async () => {
    // Mock the service methods
    (JourneyUnifiedService.getSteps as jest.Mock).mockResolvedValue(mockSteps);
    (JourneyUnifiedService.getCompanyProgress as jest.Mock).mockResolvedValue(mockCompanyProgress);

    // Render the hook with company ID
    const { result } = renderHookWithProviders(() => useJourneySteps({ companyId: 'company1' }));

    // Wait for the hook to finish loading
    await waitForHookToLoad(result);

    // Verify the stepsWithProgress result
    const stepsWithProgress = result.current.stepsWithProgress as (JourneyStep & { progress: CompanyJourneyStep | null })[];
    expect(stepsWithProgress).toHaveLength(2);
    
    // Check the first step
    expect(stepsWithProgress[0].id).toBe('step1');
    expect(stepsWithProgress[0].progress).toBeTruthy();
    expect(stepsWithProgress[0].progress?.status).toBe('completed');
    expect(stepsWithProgress[0].progress?.completion_percentage).toBe(100);
    
    // Check the second step
    expect(stepsWithProgress[1].id).toBe('step2');
    expect(stepsWithProgress[1].progress).toBeTruthy();
    expect(stepsWithProgress[1].progress?.status).toBe('in_progress');
    expect(stepsWithProgress[1].progress?.completion_percentage).toBe(50);
  });

  it('should update step progress', async () => {
    // Mock the service methods
    (JourneyUnifiedService.getSteps as jest.Mock).mockResolvedValue(mockSteps);
    (JourneyUnifiedService.getCompanyProgress as jest.Mock).mockResolvedValue(mockCompanyProgress);
    
    // Mock the updateStepProgress method
    const mockUpdateStepProgress = jest.fn().mockResolvedValue(true);
    (JourneyUnifiedService as any).updateStepProgress = mockUpdateStepProgress;

    // Render the hook with company ID
    const { result } = renderHookWithProviders(() => useJourneySteps({ companyId: 'company1' }));

    // Wait for the hook to finish loading
    await waitForHookToLoad(result);

    // Call the updateStepProgress method
    const updateData = { status: 'completed' as const, completion_percentage: 100 };
    await result.current.updateStepProgress('step2', updateData);

    // Verify the service was called correctly
    expect(mockUpdateStepProgress).toHaveBeenCalledWith('company1', 'step2', updateData);
    
    // Verify that loadSteps was called again to refresh the data
    expect(JourneyUnifiedService.getSteps).toHaveBeenCalledTimes(2);
    expect(JourneyUnifiedService.getCompanyProgress).toHaveBeenCalledTimes(2);
  });
});
