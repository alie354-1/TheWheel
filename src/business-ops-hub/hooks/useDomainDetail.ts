/**
 * Business Operations Hub - useDomainDetail Hook
 * 
 * Hook for working with a specific business domain and its steps
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  BusinessDomain, 
  DomainStep,
  DomainStepDetail,
  DomainStepStatus,
  UpdateStepParams
} from '../types/domain.types';
import { 
  GroupedDomainSteps, 
  ExtendedDomainStep,
  CreateStepParams
} from '../types/domain-extended.types';
import * as domainService from '../services/domain.service';
import { useCompany } from '../../lib/hooks/useCompany';

interface DomainDetailState {
  domain: BusinessDomain | null;
  steps: DomainStepDetail[];
  groupedSteps: GroupedDomainSteps;
  stepTree: DomainStep[]; // Hierarchical step tree for subtasks
  loadingDomain: boolean;
  loadingSteps: boolean;
  error: Error | null;
}

interface UseDomainDetail {
  domain: BusinessDomain | null;
  steps: DomainStepDetail[];
  groupedSteps: GroupedDomainSteps;
  loadingDomain: boolean;
  loadingSteps: boolean;
  error: Error | null;
  refreshSteps: () => Promise<void>;
  updateDomain: (updates: Partial<BusinessDomain>) => Promise<BusinessDomain>;
  createStep: (params: CreateStepParams) => Promise<DomainStep>;
  updateStep: (stepId: string, updates: UpdateStepParams) => Promise<DomainStep>;
  deleteStep: (stepId: string) => Promise<void>;
  updateStepStatus: (stepId: string, status: DomainStepStatus) => Promise<void>;
  addStepNotes: (stepId: string, notes: string) => Promise<void>;
  assignStepToTeamMember: (stepId: string, userId: string, userName: string) => Promise<void>;
  groupStepsByPhase: (steps: DomainStepDetail[]) => GroupedDomainSteps;
}

/**
 * Hook for working with a specific business domain and its steps
 */
export function useDomainDetail(domainId: string): UseDomainDetail {
  const [state, setState] = useState<DomainDetailState>({
    domain: null,
    steps: [] as DomainStepDetail[],
    groupedSteps: {
      name: "All Steps",
      order: 0,
      steps: [] as DomainStepDetail[]
    },
    stepTree: [],
    loadingDomain: true,
    loadingSteps: true,
    error: null
  });

  // Group steps by phase
  const groupStepsByPhase = useCallback((steps: DomainStepDetail[]): GroupedDomainSteps => {
    // Create a mapping of phases to steps
    const phaseGroups: Record<string, {
      phaseId: string;
      phaseName: string; 
      phaseOrder: number;
      steps: any[];
    }> = {};
    
    steps.forEach(step => {
      // Extract phase information from step (these would be part of DomainStepDetail)
      const phaseId = step.phase_name ? step.phase_name.toLowerCase().replace(/\s+/g, '_') : 'unassigned';
      const phaseName = step.phase_name || 'Unassigned';
      const phaseOrder = step.phase_order || 999;
      
      if (!phaseGroups[phaseId]) {
        phaseGroups[phaseId] = {
          phaseId,
          phaseName,
          phaseOrder,
          steps: []
        };
      }
      
      phaseGroups[phaseId].steps.push(step);
    });
    
    // Sort steps within each phase
    Object.keys(phaseGroups).forEach(phaseId => {
      phaseGroups[phaseId].steps.sort((a: any, b: any) => {
        if (a.step_order !== undefined && b.step_order !== undefined) {
          return a.step_order - b.step_order;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    });
    
    // Find the phase with the most steps or use the first one
    let mainPhaseId = Object.keys(phaseGroups)[0] || 'unassigned';
    if (Object.keys(phaseGroups).length > 0) {
      mainPhaseId = Object.keys(phaseGroups).reduce((a, b) => 
        phaseGroups[a].steps.length > phaseGroups[b].steps.length ? a : b
      );
    }
    
    // Create a GroupedDomainSteps object according to our interface
    const mainPhase = phaseGroups[mainPhaseId] || { 
      phaseId: 'unassigned', 
      phaseName: 'Unassigned', 
      phaseOrder: 999, 
      steps: [] 
    };
    
    return {
      name: mainPhase.phaseName,
      order: mainPhase.phaseOrder,
      steps: mainPhase.steps,
      phaseId: mainPhase.phaseId,
      phaseName: mainPhase.phaseName,
      phaseOrder: mainPhase.phaseOrder
    };
  }, []);

  const { currentCompany, loading: companyLoading } = useCompany();

  // Fetch domain data
  useEffect(() => {
    const fetchDomain = async () => {
      setState(prev => ({ ...prev, loadingDomain: true, error: null }));

      try {
        // Use company-specific domain fetcher
        if (!currentCompany?.id) {
          setState(prev => ({ ...prev, domain: null, loadingDomain: false }));
          return;
        }
        const domain = await domainService.getCompanyDomainById(domainId, currentCompany.id);
        setState(prev => ({ ...prev, domain, loadingDomain: false }));
      } catch (error) {
        console.error(`Error fetching domain ${domainId}:`, error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error(String(error)),
          loadingDomain: false
        }));
      }
    };

    if (domainId && currentCompany?.id) {
      fetchDomain();
    }
  }, [domainId, currentCompany?.id]);

  // Fetch domain steps
  const refreshSteps = useCallback(async () => {
    if (!domainId) return;
    // Wait for companyLoading to be false before erroring
    if (companyLoading) {
      setState(prev => ({
        ...prev,
        loadingSteps: true,
        error: null
      }));
      return;
    }
    if (!currentCompany?.id) {
      setState(prev => ({
        ...prev,
        loadingSteps: false,
        error: new Error("No company selected. Please select or set up a company.")
      }));
      return;
    }

    setState(prev => ({ ...prev, loadingSteps: true }));

    try {
      const companyId = currentCompany.id;
      const steps = await domainService.getDomainSteps(domainId, companyId);
      const groupedSteps = groupStepsByPhase(steps);

      // Fetch hierarchical step tree for subtasks
      const stepTree = await domainService.getDomainStepTree(domainId, companyId);

      // Recursively attach dependencies and blockers to each step in the tree
      async function attachDepsToTree(tree: DomainStep[]): Promise<DomainStep[]> {
        return Promise.all(tree.map(async (step) => {
          const [dependencies, blockers] = await Promise.all([
            domainService.getTaskDependencies(step.id),
            domainService.getTaskBlockers(step.id)
          ]);
          let subtasks: DomainStep[] | undefined = undefined;
          if (step.subtasks && step.subtasks.length > 0) {
            subtasks = await attachDepsToTree(step.subtasks);
          }
          return {
            ...step,
            dependencies,
            blockers,
            subtasks
          };
        }));
      }
      const stepTreeWithDeps = await attachDepsToTree(stepTree);

      setState(prev => ({ 
        ...prev, 
        steps,
        groupedSteps,
        stepTree: stepTreeWithDeps,
        loadingSteps: false 
      }));
    } catch (error) {
      console.error(`Error fetching steps for domain ${domainId}:`, error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error(String(error)),
        loadingSteps: false 
      }));
    }
  }, [domainId, groupStepsByPhase]);

  // Initialize - fetch steps
  useEffect(() => {
    if (domainId) {
      refreshSteps();
    }
  }, [domainId, refreshSteps]);

  // Update domain
  const updateDomain = useCallback(async (updates: Partial<BusinessDomain>): Promise<BusinessDomain> => {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
    
    try {
      const updatedDomain = await domainService.updateDomain(domainId, updates);
      
      setState(prev => ({
        ...prev,
        domain: updatedDomain
      }));
      
      return updatedDomain;
    } catch (error) {
      console.error(`Error updating domain ${domainId}:`, error);
      throw error;
    }
  }, [domainId]);

  // Create step
  const createStep = useCallback(async (params: CreateStepParams): Promise<DomainStep> => {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
    
    try {
      // Convert to our service parameter format
      const createParams: Omit<DomainStep, 'id' | 'created_at' | 'updated_at'> = {
        domain_id: domainId,
        step_id: params.step_id,
        company_id: params.company_id,
        priority: params.priority || 0,
        custom_name: params.custom_name || null,
        custom_description: params.custom_description || null,
        custom_difficulty: params.custom_difficulty || null,
        custom_time_estimate: params.custom_time_estimate || null,
        notes: params.notes || null
      };
      
      const newStep = await domainService.createDomainStep(createParams);
      
      setState(prev => {
        const updatedSteps = [...prev.steps, newStep as unknown as DomainStepDetail];
        return {
          ...prev,
          steps: updatedSteps,
          groupedSteps: groupStepsByPhase(updatedSteps)
        };
      });
      
      return newStep;
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  }, [domainId, groupStepsByPhase]);

  // Update step
  const updateStep = useCallback(async (stepId: string, updates: UpdateStepParams): Promise<DomainStep> => {
    try {
      const updatedStep = await domainService.updateDomainStep(stepId, updates);
      
      setState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.id === stepId ? { ...step, ...updatedStep } as unknown as DomainStepDetail : step
        );
        
        return {
          ...prev,
          steps: updatedSteps,
          groupedSteps: groupStepsByPhase(updatedSteps)
        };
      });
      
      return updatedStep;
    } catch (error) {
      console.error(`Error updating step ${stepId}:`, error);
      throw error;
    }
  }, [groupStepsByPhase]);

  // Delete step
  const deleteStep = useCallback(async (stepId: string): Promise<void> => {
    try {
      await domainService.deleteDomainStep(stepId);
      
      setState(prev => {
        const updatedSteps = prev.steps.filter(step => step.id !== stepId);
        return {
          ...prev,
          steps: updatedSteps,
          groupedSteps: groupStepsByPhase(updatedSteps)
        };
      });
    } catch (error) {
      console.error(`Error deleting step ${stepId}:`, error);
      throw error;
    }
  }, [groupStepsByPhase]);

  // Update step status
  const updateStepStatus = useCallback(async (stepId: string, status: DomainStepStatus): Promise<void> => {
    try {
      // We need to create a proper update object that matches what the service expects
      const statusUpdate: Partial<DomainStep> = { 
        status_id: status // Assuming status_id is the correct field name
      } as Partial<DomainStep>;
      
      await domainService.updateDomainStep(stepId, statusUpdate);
      
      setState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.id === stepId ? { ...step, status } : step
        );
        
        return {
          ...prev,
          steps: updatedSteps,
          groupedSteps: groupStepsByPhase(updatedSteps)
        };
      });
    } catch (error) {
      console.error(`Error updating status for step ${stepId}:`, error);
      throw error;
    }
  }, [groupStepsByPhase]);

  // Add step notes
  const addStepNotes = useCallback(async (stepId: string, notes: string): Promise<void> => {
    try {
      // Since there's no direct addStepNotes method, we'll update the step with notes in metadata
      const metadata = { notes };
      await domainService.updateDomainStep(stepId, { 
        notes
      } as Partial<DomainStep>);
      
      setState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.id === stepId ? { 
            ...step, 
            notes
          } : step
        );
        
        return {
          ...prev,
          steps: updatedSteps,
          groupedSteps: groupStepsByPhase(updatedSteps)
        };
      });
    } catch (error) {
      console.error(`Error adding notes to step ${stepId}:`, error);
      throw error;
    }
  }, [groupStepsByPhase]);

  // Assign step to team member
  const assignStepToTeamMember = useCallback(async (stepId: string, userId: string, userName: string): Promise<void> => {
    try {
      // Since there's no direct assignStepToTeamMember method, we'll update the step
      await domainService.updateDomainStep(stepId, { 
        assigned_to: userId,
        assigned_to_name: userName
      } as Partial<DomainStep>);
      
      setState(prev => {
        const updatedSteps = prev.steps.map(step => 
          step.id === stepId ? { 
            ...step, 
            assigned_to: userId,
            assigned_to_name: userName
          } : step
        );
        
        return {
          ...prev,
          steps: updatedSteps,
          groupedSteps: groupStepsByPhase(updatedSteps)
        };
      });
    } catch (error) {
      console.error(`Error assigning step ${stepId} to team member:`, error);
      throw error;
    }
  }, [groupStepsByPhase]);

  return {
    domain: state.domain,
    steps: state.steps,
    groupedSteps: state.groupedSteps,
    stepTree: state.stepTree,
    loadingDomain: state.loadingDomain,
    loadingSteps: state.loadingSteps,
    error: state.error,
    refreshSteps,
    updateDomain,
    createStep,
    updateStep,
    deleteStep,
    updateStepStatus,
    addStepNotes,
    assignStepToTeamMember,
    groupStepsByPhase
  };
}

export default useDomainDetail;
