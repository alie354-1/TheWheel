/**
 * Business Operations Hub - StepList Component
 * 
 * Displays domain steps organized by phase
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { DomainStepStatus, DomainStepDetail } from '../types/domain.types';

import { DomainStep } from '../types/domain.types';

interface StepListProps {
  domainId: string;
  groupedSteps?: any;
  stepTree?: DomainStep[];
  isLoading?: boolean;
}

/**
 * Helper to get status badge class based on status
 */
const getStatusBadgeClass = (status: DomainStepStatus): string => {
  switch (status) {
    case DomainStepStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case DomainStepStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case DomainStepStatus.NOT_STARTED:
      return 'bg-gray-100 text-gray-800';
    case DomainStepStatus.SKIPPED:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * StepList component - displays domain steps organized by phase
 */
export const StepList: React.FC<StepListProps> = ({
  domainId,
  groupedSteps,
  stepTree,
  isLoading = false
}) => {
  // Recursive render for step tree (subtasks)
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderStepTree = (steps: DomainStep[], level = 0) => {
    if (!steps || steps.length === 0) return null;
    return (
      <ul className={level === 0 ? "space-y-2" : "ml-6 space-y-1"}>
        {steps.map(step => {
          const hasSubtasks = step.subtasks && step.subtasks.length > 0;
          const isExpanded = expanded[step.id] ?? true;
          // Rollup: parent is complete if all subtasks are complete
          const rollupStatus = hasSubtasks
            ? step.subtasks!.every(s => (s as any).status === "completed")
              ? "completed"
              : step.subtasks!.some(s => (s as any).status === "in_progress")
                ? "in_progress"
                : "not_started"
            : (step as any).status;
          return (
            <li key={step.id}>
              <div className={`flex items-center border border-gray-200 rounded-md p-2 ${level > 0 ? "bg-gray-50" : "bg-white"}`}>
                {hasSubtasks && (
                  <button
                    className="mr-2 text-xs text-blue-600 hover:underline"
                    onClick={() => toggleExpand(step.id)}
                    aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                  >
                    {isExpanded ? "▼" : "►"}
                  </button>
                )}
                <Link
                  to={`/business-ops-hub/${domainId}/steps/${step.id}`}
                  className="flex-1"
                >
                  <span className="font-medium text-gray-900">{(step as any).custom_name || (step as any).name}</span>
                  {(step as any).description && (
                    <span className="ml-2 text-sm text-gray-600">{(step as any).description}</span>
                  )}
                  {/* Dependency indicator */}
                  {step.dependencies && step.dependencies.length > 0 && (
                    <span className="ml-2 text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Depends on {step.dependencies.length} task{step.dependencies.length > 1 ? "s" : ""}
                    </span>
                  )}
                </Link>
                {/* Blocked badge */}
                {step.blockers && step.blockers.length > 0 && (
                  <span className="ml-2 inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                    Blocked
                  </span>
                )}
                <span
                  className={`ml-4 inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                    rollupStatus as DomainStepStatus
                  )}`}
                >
                  {rollupStatus.replace('_', ' ')}
                </span>
                {/* Manual priority override controls */}
                {(step as any).is_priority_locked ? (
                  <span className="ml-2 flex items-center text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                    Priority manually set
                    <button
                      className="ml-2 text-orange-700 underline"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (window.confirm('Unlock and return to automatic prioritization?')) {
                          // @ts-ignore
                          await import('../services/domain.service').then(svc =>
                            svc.unlockTaskPriority(step.id)
                          );
                          window.location.reload();
                        }
                      }}
                      title="Unlock and return to automatic prioritization"
                    >
                      Undo
                    </button>
                  </span>
                ) : (
                  <button
                    className="ml-2 text-xs text-gray-500 underline"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (window.confirm('Lock this task\'s priority at its current position?')) {
                        // @ts-ignore
                        await import('../services/domain.service').then(svc =>
                          svc.lockTaskPriority(step.id, (step as any).priority_order ?? 0)
                        );
                        window.location.reload();
                      }
                    }}
                    title="Lock this task's priority at its current position"
                  >
                    Lock Priority
                  </button>
                )}
              </div>
              {hasSubtasks && isExpanded && renderStepTree(step.subtasks!, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  // Fallback to flat/grouped steps if no stepTree provided
  const steps = groupedSteps?.steps || [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(phase => (
          <div key={phase} className="bg-white rounded-lg shadow-md p-4">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(step => (
                <div key={step} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (stepTree && stepTree.length > 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-4">
            Steps & Subtasks
          </h3>
          {renderStepTree(stepTree)}
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Steps Available</h3>
        <p className="text-gray-500">
          This domain doesn't have any steps defined yet.
        </p>
      </div>
    );
  }

  // Fallback: flat/grouped steps
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-semibold mb-4">
          {groupedSteps?.name || "All Steps"}
        </h3>
        <div className="space-y-2">
          {steps.length > 0 ? (
            steps.map((step: any) => (
                <Link
                  key={step.id}
                  to={`/business-ops-hub/${domainId}/steps/${step.id}`}
                  className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      {step.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {step.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                          step.status
                        )}`}
                      >
                        {step.status.replace('_', ' ')}
                      </span>
                      {/* Manual priority override controls */}
                      {step.is_priority_locked ? (
                        <span className="mt-1 flex items-center text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                          Priority manually set
                          <button
                            className="ml-2 text-orange-700 underline"
                            onClick={async (e) => {
                              e.preventDefault();
                              if (window.confirm('Unlock and return to automatic prioritization?')) {
                                // @ts-ignore
                                await import('../services/domain.service').then(svc =>
                                  svc.unlockTaskPriority(step.id)
                                );
                                window.location.reload();
                              }
                            }}
                            title="Unlock and return to automatic prioritization"
                          >
                            Undo
                          </button>
                        </span>
                      ) : (
                        <button
                          className="mt-1 text-xs text-gray-500 underline"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (window.confirm('Lock this task\'s priority at its current position?')) {
                              // @ts-ignore
                              await import('../services/domain.service').then(svc =>
                                svc.lockTaskPriority(step.id, step.priority_order ?? 0)
                              );
                              window.location.reload();
                            }
                          }}
                          title="Lock this task's priority at its current position"
                        >
                          Lock Priority
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                      {step.time_estimate && (
                        <div className="mr-4">
                          <span className="font-medium">Est. Time:</span> {step.time_estimate} min
                        </div>
                      )}
                      {step.difficulty && (
                        <div>
                          <span className="font-medium">Difficulty:</span>{' '}
                          {Array(Math.min(5, Math.max(1, Math.round(step.difficulty / 2))))
                            .fill('★')
                            .join('')}
                        </div>
                      )}
                  </div>
                </Link>
              ))
          ) : (
            <div className="text-center py-4 text-gray-500 italic">
              No steps available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepList;
