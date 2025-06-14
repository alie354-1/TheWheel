import React from 'react';
import StepCard from './StepCard';
import ActiveStepCard, { Step, NextTask } from './ActiveStepCard';

export interface StepsListProps {
  steps: Step[];
  activeSteps?: Step[];
  completedSteps?: Step[];
  onStepClick?: (stepId: string) => void;
  onContinueStep?: (stepId: string) => void;
  filterByStatus?: string[];
  filterByDomain?: string[];
  searchTerm?: string;
  showEmptyState?: boolean;
}

/**
 * StepsList - A list of journey steps with filtering capabilities
 */
const StepsList: React.FC<StepsListProps> = ({
  steps,
  activeSteps = [],
  completedSteps = [],
  onStepClick,
  onContinueStep,
  filterByStatus = [],
  filterByDomain = [],
  searchTerm = '',
  showEmptyState = true
}) => {
  // Filter steps based on criteria
  const filteredSteps = steps.filter(step => {
    // Filter by status if specified
    if (filterByStatus.length > 0 && step.status && !filterByStatus.includes(step.status)) {
      return false;
    }
    
    // Filter by domain if specified
    if (filterByDomain.length > 0 && step.domain && !filterByDomain.includes(step.domain)) {
      return false;
    }
    
    // Filter by search term if specified
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = step.title.toLowerCase().includes(searchLower);
      const descriptionMatch = step.description ? step.description.toLowerCase().includes(searchLower) : false;
      const domainMatch = step.domain ? step.domain.toLowerCase().includes(searchLower) : false;
      
      if (!titleMatch && !descriptionMatch && !domainMatch) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sample active step data for demo purposes
  const sampleNextTasks: NextTask[] = [
    { id: 'task1', text: 'Review competitor analysis', done: true },
    { id: 'task2', text: 'Schedule team meeting', done: false },
    { id: 'task3', text: 'Draft initial requirements', done: false }
  ];
  
  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <i className="fas fa-tasks text-gray-400 text-xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No steps found</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Try changing your filters or search term to see more steps.
      </p>
    </div>
  );
  
  if (filteredSteps.length === 0 && showEmptyState) {
    return <EmptyState />;
  }
  
  return (
    <div className="space-y-1">
      {/* Active steps section */}
      {activeSteps.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">In Progress</h3>
          {activeSteps.map(step => (
            <ActiveStepCard
              key={step.id}
              step={step}
              progress={65}
              lastWorkedOn="Yesterday"
              expandable={true}
              expanded={false}
              onToggleExpand={() => {}}
              onContinue={onContinueStep || (() => {})}
              nextTasks={sampleNextTasks}
              startDate="Jun 2, 2025"
              dueDate="Jun 15, 2025"
              timeSpent="4h 30m"
              tools={['Figma', 'Miro', 'Google Docs']}
            />
          ))}
        </div>
      )}
      
      {/* Regular steps */}
      {filteredSteps.length > 0 && (
        <div>
          {filterByStatus.length === 0 && <h3 className="text-sm font-medium text-gray-700 mb-2">Available Steps</h3>}
          {filteredSteps.map(step => (
            <StepCard
              key={step.id}
              id={step.id}
              title={step.title}
              description={step.description}
              domain={step.domain}
              status={step.status}
              tags={step.tags}
              priority={step.priority}
              completionPercentage={30}
              onClick={onStepClick}
            />
          ))}
        </div>
      )}
      
      {/* Completed steps section */}
      {completedSteps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Completed</h3>
          {completedSteps.map(step => (
            <StepCard
              key={step.id}
              id={step.id}
              title={step.title}
              description={step.description}
              domain={step.domain}
              status="Completed"
              tags={step.tags}
              priority={step.priority}
              completedOn="Jun 1, 2025"
              onClick={onStepClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StepsList;
