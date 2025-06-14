import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Eye, Play, ArrowRight, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { useBrowseSteps, NewJourneyStep } from '../hooks/useBrowseSteps';
import { supabase } from '../../../../lib/utils/supabaseClient';
import { newCompanyJourneyService } from '../../../../lib/services/new_journey/new_company_journey.service';
import { StepStatusType, journeyStatusService } from '../../../../lib/services/new_journey/journey-status.service';
import { newJourneyFrameworkService } from '../../../../lib/services/new_journey/new_journey_framework.service';
import StepQuickViewModal from './StepQuickViewModal';
import { NewCompanyJourneyStep } from '../../../../lib/types/new_journey.types';

interface AllStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStep: (stepId: string) => void;
  onPreviewStep: (stepId: string) => void;
  journeyId?: string; // Company journey ID to add steps to
  onStepAdded?: () => void; // Callback when a step is added
}

interface StepItem {
  id: string;
  name: string;
  description: string;
  domain: {
    id: string;
    name: string;
  };
  phase: {
    id: string;
    name: string;
  };
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status?: StepStatusType;
  isCompanyStep?: boolean;
}

/**
 * AllStepsModal component
 * 
 * A modal that displays all available journey steps with filtering and search capabilities.
 * Users can preview steps or start them directly from this modal.
 * Similar to the FrameworkStepsBrowser in the old journey system.
 */
const AllStepsModal: React.FC<AllStepsModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartStep, 
  onPreviewStep,
  journeyId,
  onStepAdded
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<{id: string, name: string}[]>([]);
  const [phases, setPhases] = useState<{id: string, name: string}[]>([]);
  const [companySteps, setCompanySteps] = useState<string[]>([]);
  const [previewStep, setPreviewStep] = useState<NewCompanyJourneyStep | null>(null);

  // Use the browse steps hook
  const { 
    availableSteps, 
    isLoading: browseLoading, 
    error: browseError 
  } = useBrowseSteps();

  // Fetch domains and phases
  useEffect(() => {
    const fetchDomainAndPhases = async () => {
      try {
        // Use the framework service to fetch domains and phases
        const [domainsData, phasesData] = await Promise.all([
          newJourneyFrameworkService.getDomains(),
          newJourneyFrameworkService.getPhases()
        ]);
        
        console.log('Domains fetched:', domainsData.length);
        console.log('Phases fetched:', phasesData.length);
        
        setDomains(domainsData || []);
        setPhases(phasesData || []);

        // Fetch company steps from the correct table with the correct field name
        const { data: companyStepsData, error: companyStepsError } = await supabase
          .from('company_journey_steps_new')
          .select('canonical_step_id');
        
        if (companyStepsError) {
          console.error('Error fetching company steps:', companyStepsError);
          setCompanySteps([]);
        } else {
          setCompanySteps(companyStepsData?.map(step => step.canonical_step_id) || []);
        }
      } catch (error) {
        console.error('Error in fetchDomainAndPhases:', error);
        // Use default data as fallback
        setDomains([
          { id: 'domain-1', name: 'Product' },
          { id: 'domain-2', name: 'Marketing' },
          { id: 'domain-3', name: 'Finance' },
          { id: 'domain-4', name: 'Operations' },
          { id: 'domain-5', name: 'Strategy' }
        ]);
        setPhases([
          { id: 'phase-1', name: 'Ideation' },
          { id: 'phase-2', name: 'Validation' },
          { id: 'phase-3', name: 'Growth' },
          { id: 'phase-4', name: 'Scaling' }
        ]);
        setCompanySteps([]);
      }
    };

    if (isOpen) {
      fetchDomainAndPhases();
    }
  }, [isOpen]);

  // Process template steps when they're loaded
  useEffect(() => {
    if (!browseLoading && availableSteps) {
      console.log('Processing available steps:', availableSteps.length);
      
      const processedSteps = availableSteps.map((step: NewJourneyStep) => {
        // Log the first few steps to debug
        if (availableSteps.indexOf(step) < 3) {
          console.log('Step details:', {
            id: step.id,
            name: step.name,
            domain: step.domain,
            phase: step.phase
          });
        }
        
        return {
          id: step.id,
          name: step.name,
          description: '', // Empty description to avoid duplication
          domain: step.domain || { id: 'unknown', name: 'General' },
          phase: step.phase || { id: 'unknown', name: 'General' },
          estimatedTime: `${step.estimatedDays || 1}-${(step.estimatedDays || 1) + 1} days`,
          difficulty: (step.difficulty === 'Low' ? 'easy' : 
                      step.difficulty === 'Medium' ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
          isCompanyStep: companySteps.includes(step.id)
        };
      });
      
      setSteps(processedSteps);
      setLoading(false);
    }
  }, [availableSteps, browseLoading, companySteps]);

  // Filter steps based on search, filters, and exclude steps that have already been added
  const filteredSteps = steps.filter(step => {
    // Exclude steps that have already been added to the company journey
    if (step.isCompanyStep) {
      return false;
    }
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Domain filter
    const matchesDomain = selectedDomain === 'all' || 
      step.domain?.id === selectedDomain;
    
    // Phase filter
    const matchesPhase = selectedPhase === 'all' || 
      step.phase?.id === selectedPhase;
    
    // Difficulty filter
    const matchesDifficulty = selectedDifficulty === 'all' || 
      step.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDomain && matchesPhase && matchesDifficulty;
  });
  
  // Log filtered steps count for debugging
  useEffect(() => {
    console.log('Filtered steps count:', filteredSteps.length);
  }, [filteredSteps.length]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle domain filter change
  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
  };

  // Handle phase filter change
  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhase(e.target.value);
  };

  // Handle difficulty filter change
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(e.target.value);
  };

  // Handle preview step
  const handlePreviewStep = async (stepId: string) => {
    try {
      // Fetch the full step data directly from the framework service
      const steps = await newJourneyFrameworkService.getFrameworkSteps();
      // Use proper typing for the canonical step
      const fullStep = steps.find((s) => s.id === stepId);
      
      if (fullStep) {
        console.log('Full step data:', fullStep);
        
        // Parse JSON fields if they're stored as strings
        let deliverables: string[] = [];
        let success_criteria: string[] = [];
        let potential_blockers: string[] = [];
        let recommended_tools: string[] = [];
        let dependencies: string[] = [];
        
        try {
          // Try to parse JSON fields if they're stored as strings
          if (typeof fullStep.deliverables === 'string') {
            const deliverableStr = fullStep.deliverables as string;
            if (deliverableStr) {
              try {
                deliverables = JSON.parse(deliverableStr.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
              } catch (e) {
                console.error('Error parsing deliverables:', e);
              }
            }
          } else if (Array.isArray(fullStep.deliverables)) {
            deliverables = fullStep.deliverables;
          }
          
          if (typeof fullStep.success_criteria === 'string') {
            const criteriaStr = fullStep.success_criteria as string;
            if (criteriaStr) {
              try {
                success_criteria = JSON.parse(criteriaStr.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
              } catch (e) {
                console.error('Error parsing success_criteria:', e);
              }
            }
          } else if (Array.isArray(fullStep.success_criteria)) {
            success_criteria = fullStep.success_criteria;
          }
          
          if (typeof fullStep.potential_blockers === 'string') {
            const blockersStr = fullStep.potential_blockers as string;
            if (blockersStr) {
              try {
                potential_blockers = JSON.parse(blockersStr.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
              } catch (e) {
                console.error('Error parsing potential_blockers:', e);
              }
            }
          } else if (Array.isArray(fullStep.potential_blockers)) {
            potential_blockers = fullStep.potential_blockers;
          }
          
          if (typeof fullStep.recommended_tools === 'string') {
            const toolsStr = fullStep.recommended_tools as string;
            if (toolsStr) {
              try {
                recommended_tools = JSON.parse(toolsStr.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
              } catch (e) {
                console.error('Error parsing recommended_tools:', e);
              }
            }
          } else if (Array.isArray(fullStep.recommended_tools)) {
            recommended_tools = fullStep.recommended_tools;
          }
          
          if (typeof fullStep.dependencies === 'string') {
            const dependenciesStr = fullStep.dependencies as string;
            if (dependenciesStr) {
              try {
                dependencies = JSON.parse(dependenciesStr.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
              } catch (e) {
                console.error('Error parsing dependencies:', e);
              }
            }
          } else if (Array.isArray(fullStep.dependencies)) {
            dependencies = fullStep.dependencies;
          }
        } catch (error) {
          console.error('Error parsing JSON fields:', error);
        }
        
        // Get domain and phase info
        // Use type assertion to access the joined tables from the framework service
        const fullStepAny = fullStep as any;
        const domainName = fullStepAny.journey_domains_new ? fullStepAny.journey_domains_new.name : 'Unknown';
        const phaseName = fullStepAny.journey_phases_new ? fullStepAny.journey_phases_new.name : 'Unknown';
        
        // Convert to NewCompanyJourneyStep format for the QuickViewModal
        const previewStepData: NewCompanyJourneyStep = {
          id: fullStep.id,
          name: fullStep.name,
          description: fullStep.description || '',
          domain: {
            id: fullStep.primary_domain_id || 'unknown',
            name: domainName,
            description: '',
            created_at: new Date().toISOString()
          } as any, // Type assertion to satisfy TypeScript
          phase: {
            id: fullStep.primary_phase_id || 'unknown',
            name: phaseName,
            description: '',
            order_index: 0,
            created_at: new Date().toISOString()
          } as any, // Type assertion to satisfy TypeScript
          status: 'not_started',
          framework_step_id: fullStep.id,
          journey_id: journeyId || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          
          // Include all available rich content from the canonical step
          deliverables: deliverables,
          success_criteria: success_criteria,
          potential_blockers: potential_blockers,
          custom_guidance: fullStep.guidance_notes || '',
          recommended_tools: recommended_tools,
          dependencies: dependencies,
          difficulty: fullStep.difficulty,
          
          // Set required properties
          is_custom_step: false
        };
        
        setPreviewStep(previewStepData);
      }
    } catch (error) {
      console.error('Error fetching step data:', error);
    }
  };
  
  // Handle close preview
  const handleClosePreview = () => {
    setPreviewStep(null);
  };

  // Handle start step
  const handleStartStep = async (stepId: string) => {
    // Since we're filtering out steps that are already in the company journey,
    // we don't need this check anymore, but keeping it for safety
    if (companySteps.includes(stepId)) {
      onStartStep(stepId);
      return;
    }
    
    // If we don't have a journey ID, we can't add the step
    if (!journeyId) {
      console.error('Cannot add step: No journey ID provided');
      return;
    }
    
    try {
      // Show loading state
      setLoading(true);
      
      // Add the step to the company journey
      const newStep = await newCompanyJourneyService.addStepToJourney(journeyId, stepId);
      
      // Get the most recent statuses to determine which status to set for new steps
      const mostRecentStatuses = await journeyStatusService.getMostRecentStatuses();
      const initialStatus = mostRecentStatuses.length > 0 ? mostRecentStatuses[0] : 'active';
      
      // Set the step status so it appears in the dashboard
      await newCompanyJourneyService.updateStepStatus(newStep.id, initialStatus);
      
      // Update local state to mark this step as added
      setCompanySteps(prev => [...prev, stepId]);
      
      // Notify parent that a step was added
      if (onStepAdded) {
        onStepAdded();
      }
      
      // Navigate to the step
      onStartStep(newStep.id);
    } catch (error) {
      console.error('Error adding step to journey:', error);
      
      // Show error message
      alert('Failed to add step to journey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Browse All Steps</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search steps..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Domain Filter */}
              <select
                className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedDomain}
                onChange={handleDomainChange}
              >
                <option value="all">All Domains</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
              
              {/* Phase Filter */}
              <select
                className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedPhase}
                onChange={handlePhaseChange}
              >
                <option value="all">All Phases</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
              
              {/* Difficulty Filter */}
              <select
                className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Steps List */}
        <div className="flex-grow overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredSteps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No steps match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-2 py-2 border-b border-gray-200 w-48">Name</th>
                    <th className="px-2 py-2 border-b border-gray-200 w-16">Domain</th>
                    <th className="px-2 py-2 border-b border-gray-200 w-16">Phase</th>
                    <th className="px-2 py-2 border-b border-gray-200 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSteps.map(step => (
                    <tr key={step.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{step.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <span className="text-xs font-medium text-gray-600">
                          {step.domain?.name || 'General'}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        <span className="text-xs font-medium text-gray-600">
                          {step.phase?.name || 'General'}
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handlePreviewStep(step.id)}
                            className="inline-flex items-center p-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            title="Preview"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          
                          <button
                            onClick={() => handleStartStep(step.id)}
                            className="inline-flex items-center p-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            disabled={loading}
                            title="Start"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <div className="text-sm text-gray-500">
            {filteredSteps.length} {filteredSteps.length === 1 ? 'step' : 'steps'} found
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    {/* Step Quick View Modal */}
    {previewStep && (
      <StepQuickViewModal
        step={previewStep}
        onClose={handleClosePreview}
        onOpenDetails={onPreviewStep}
      />
    )}
    </>
  );
};

export default AllStepsModal;
