import React from 'react';
import { X, Clock, CheckCircle, AlertTriangle, ExternalLink, AlertCircle, Plus } from 'lucide-react';
import { NewCompanyJourneyStep } from '../../../../lib/types/new_journey.types';

interface StepQuickViewModalProps {
  step: NewCompanyJourneyStep | null;
  onClose: () => void;
  onOpenDetails: (stepId: string) => void;
}

/**
 * Modal component for quickly viewing step details
 * Displayed when clicking the quick view button in the sidebar
 */
const StepQuickViewModal: React.FC<StepQuickViewModalProps> = ({
  step,
  onClose,
  onOpenDetails
}) => {
  if (!step) return null;

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Status badge
  const getStatusBadge = () => {
    switch (step.status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'complete':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'not_started':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Started
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Skipped
          </span>
        );
      default:
        return null;
    }
  };

  // Domain and Phase badges
  const DomainPhaseBadges = () => (
    <div className="flex flex-wrap gap-2 mb-3">
      {step.domain && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          🏢 {step.domain.name}
        </span>
      )}
      {step.phase && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
          📊 {step.phase.name}
        </span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{step.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Domain and Phase Badges */}
          <DomainPhaseBadges />
          
          {/* Description */}
          <div>
            <p className="text-sm text-gray-600">
              {step.description || 'No description provided.'}
            </p>
          </div>
          
          {/* Deliverables */}
          {step.deliverables && step.deliverables.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">What you'll create:</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                {step.deliverables.slice(0, 3).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                {step.deliverables.length > 3 && (
                  <li className="text-gray-500 italic">
                    +{step.deliverables.length - 3} more deliverables
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Success Criteria */}
          {step.success_criteria && step.success_criteria.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">How you'll know it's done:</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                {step.success_criteria.slice(0, 3).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                {step.success_criteria.length > 3 && (
                  <li className="text-gray-500 italic">
                    +{step.success_criteria.length - 3} more criteria
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Recommended Tools */}
          {step.recommended_tools && step.recommended_tools.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Recommended tools:</h3>
              <p className="mt-1 text-sm text-gray-600">
                {step.recommended_tools.join(', ')}
              </p>
            </div>
          )}
          
          {/* Dependencies */}
          {step.dependencies && step.dependencies.length > 0 && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Dependencies:</h3>
                  <p className="text-sm text-amber-700">
                    {step.dependencies.join(', ')} should be completed first
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Custom Guidance */}
          {step.custom_guidance && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Guidance:</h3>
                  <p className="text-sm text-blue-700">
                    {step.custom_guidance}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex flex-col gap-2">
          <button
            onClick={() => onOpenDetails(step.id)}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Details
          </button>
          
          <button
            onClick={onClose}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepQuickViewModal;
