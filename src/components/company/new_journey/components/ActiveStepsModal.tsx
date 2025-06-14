import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Eye, Play, ArrowRight, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { useBrowseSteps, NewJourneyStep } from '../hooks/useBrowseSteps';
import { supabase } from '../../../../lib/utils/supabaseClient';
import { newCompanyJourneyService } from '../../../../lib/services/new_journey/new_company_journey.service';
import { 
  StepStatusType, 
  journeyStatusService 
} from '../../../../lib/services/new_journey/journey-status.service';
import { newJourneyFrameworkService } from '../../../../lib/services/new_journey/new_journey_framework.service';

interface ActiveStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStep: (stepId: string) => void;
  journeyId?: string; // Company journey ID
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
  companyStepId?: string; // ID of the company step (not the template step)
}

/**
 * ActiveStepsModal component
 * 
 * A modal that displays all active steps in the company journey with filtering and search capabilities.
 * Users can continue working on steps directly from this modal.
 */
const ActiveStepsModal: React.FC<ActiveStepsModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenStep,
  journeyId
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
  const [companySteps, setCompanySteps] = useState<{id: string, canonical_step_id: string, status: string}[]>([]);

  // Use the browse steps hook to get all template steps
  const { 
    availableSteps, 
    isLoading: browseLoading, 
    error: browseError 
  } = useBrowseSteps();

  // Fetch domains, phases, and company steps
  useEffect(() => {
    const fetchData = async () => {
      if (!journeyId) {
        setLoading(false);
        return;
      }
      
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

        // Get active statuses from the journey status service
        const activeStatuses = await journeyStatusService.getActiveStatuses();

        // Fetch company steps from the correct table with the correct field name
        const { data: companyStepsData, error: companyStepsError } = await supabase
          .from('company_journey_steps_new')
          .select('id, canonical_step_id, status')
          .eq('journey_id', journeyId)
          .in('status', activeStatuses); // Only get steps that should be shown in active list
        
        if (companyStepsError) {
          console.error('Error fetching company steps:', companyStepsError);
          setCompanySteps([]);
        } else {
          setCompanySteps(companyStepsData || []);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
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
      fetchData();
    }
  }, [isOpen, journeyId]);

  // Process template steps when they're loaded
  useEffect(() => {
    if (!browseLoading && availableSteps && companySteps.length > 0) {
      // Create a map of canonical step IDs to company step IDs for quick lookup
      const companyStepMap = new Map<string, {id: string, status: string}>();
      companySteps.forEach(step => {
        companyStepMap.set(step.canonical_step_id, {id: step.id, status: step.status});
      });
      
      console.log('Company steps map created with', companyStepMap.size, 'entries');
      
      // Filter and process only the steps that are in the company journey
      const activeSteps = availableSteps
        .filter((step: NewJourneyStep) => companyStepMap.has(step.id))
        .map((step: NewJourneyStep) => {
          const companyStep = companyStepMap.get(step.id);
          
          // Log the first few steps to debug
          if (availableSteps.indexOf(step) < 3) {
            console.log('Processing active step:', {
              id: step.id,
              name: step.name,
              domain: step.domain,
              phase: step.phase,
              companyStepId: companyStep?.id,
              status: companyStep?.status
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
            status: companyStep?.status as StepStatusType,
            isCompanyStep: true,
            companyStepId: companyStep?.id
          };
        });
      
      console.log('Active steps processed:', activeSteps.length);
      
      setSteps(activeSteps);
      setLoading(false);
    } else if (!browseLoading && availableSteps) {
      // If there are no company steps, show an empty list
      setSteps([]);
      setLoading(false);
    }
  }, [availableSteps, browseLoading, companySteps]);

  // Filter steps based on search and filters
  const filteredSteps = steps.filter(step => {
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
    console.log('Filtered active steps count:', filteredSteps.length);
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

  // Handle continue step
  const handleContinueStep = (stepId: string, companyStepId?: string) => {
    if (companyStepId) {
      onOpenStep(companyStepId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Active Steps</h2>
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
                placeholder="Search active steps..."
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
              <p className="text-gray-500">No active steps found. Start a new step from the Browse All Steps panel.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-2 py-2 border-b border-gray-200 w-48">Name</th>
                    <th className="px-2 py-2 border-b border-gray-200 w-20">Status</th>
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
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          step.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          step.status === 'not_started' ? 'bg-gray-100 text-gray-800' :
                          step.status === 'complete' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.status === 'active' ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </>
                          ) : step.status === 'not_started' ? (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Started
                            </>
                          ) : step.status === 'complete' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Skipped
                            </>
                          )}
                        </span>
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
                      <td className="px-2 py-1 text-sm font-medium">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleContinueStep(step.id, step.companyStepId)}
                            className="inline-flex items-center p-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                            disabled={loading}
                            title="Continue"
                          >
                            <ArrowRight className="h-3 w-3" />
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
            {filteredSteps.length} {filteredSteps.length === 1 ? 'active step' : 'active steps'} found
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
  );
};

export default ActiveStepsModal;
