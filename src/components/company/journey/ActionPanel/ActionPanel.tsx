import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Settings, Bookmark, Zap, ArrowRight } from 'lucide-react';
import { NextBestSteps } from '../../journey/StepRecommendations/NextBestSteps';
import { Term } from '../../../terminology/Term';
import { useJourneyPageData } from '../../../../lib/hooks/useJourneyPageData';
import { useRecommendationAnalytics } from '../../../../lib/hooks/useRecommendationAnalytics';

interface ActionPanelProps {
  companyId: string;
  onStepSelect: (stepId: string) => void;
  className?: string;
}

/**
 * ActionPanel component
 * 
 * Displays personalized recommendations and quick links for the journey steps.
 * Part of the Sprint 3 Journey System implementation.
 */
export const ActionPanel: React.FC<ActionPanelProps> = ({
  companyId,
  onStepSelect,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'quick-links'>('recommendations');
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  const analytics = useRecommendationAnalytics();
  
  // Get journey data from the common hook
  const { phases, steps, companySteps } = useJourneyPageData(companyId);

  // Load quick links (steps marked as important or frequently accessed)
  useEffect(() => {
    // In a real implementation, these would come from an API endpoint or user preferences
    const frequentSteps = steps
      .slice(0, 3)
      .map(step => {
        const companyStep = companySteps.find(cs => cs.step_id === step.id);
        const phase = phases.find(p => p.id === step.phase_id);
        
        return {
          id: step.id,
          name: step.name,
          description: step.description,
          status: companyStep?.status || 'not_started',
          phaseName: phase?.name || 'Unknown Phase',
          phaseColor: phase?.color || '#4F46E5'
        };
      });
    
    setQuickLinks(frequentSteps);
  }, [steps, companySteps, phases]);

  // Track panel usage with analytics
  const trackPanelAction = (action: string) => {
    analytics.trackFeatureUsage('action_panel', { action });
  };

  const handleTabChange = (tab: 'recommendations' | 'quick-links') => {
    setActiveTab(tab);
    trackPanelAction(`switch_tab_${tab}`);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    trackPanelAction(isExpanded ? 'collapse' : 'expand');
  };

  const handleStepSelect = (stepId: string) => {
    trackPanelAction('select_step');
    onStepSelect(stepId);
  };

  const handleQuickLinkClick = (stepId: string) => {
    trackPanelAction('use_quick_link');
    onStepSelect(stepId);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            <Term keyPath="journeyTerms.actionPanel" fallback="Action Panel" />
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleExpand}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
        
        {/* Tab navigation */}
        {isExpanded && (
          <div className="flex border-b border-gray-200 mt-4">
            <button
              className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'recommendations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('recommendations')}
            >
              <Term keyPath="journeyTerms.recommendations" fallback="Recommendations" />
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'quick-links'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('quick-links')}
            >
              <Term keyPath="journeyTerms.quickLinks" fallback="Quick Links" />
            </button>
          </div>
        )}
      </div>

      {/* Panel content - Collapsible */}
      {isExpanded && (
        <div className="p-4">
          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div>
              <NextBestSteps
                companyId={companyId} // Pass companyId prop down
                limit={3}
                onStepSelect={handleStepSelect}
                showFilters={true}
                className="mb-4"
              />
            </div>
          )}

          {/* Quick Links Tab */}
          {activeTab === 'quick-links' && (
            <div className="space-y-4">
              {quickLinks.length > 0 ? (
                <div className="space-y-3">
                  {quickLinks.map((link) => (
                    <div
                      key={link.id}
                      onClick={() => handleQuickLinkClick(link.id)}
                      className="flex items-start p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <div 
                        className="w-2 h-full rounded-full mr-3" 
                        style={{ backgroundColor: link.phaseColor }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{link.name}</h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              link.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : link.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {link.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{link.phaseName}</p>
                      </div>
                      <div className="ml-2">
                        <ArrowRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bookmark className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p>No quick links found. Steps you visit frequently will appear here.</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <Term keyPath="journeyTerms.savedFilters" fallback="Saved Filters" />
                </h4>
                {savedFilters.length > 0 ? (
                  <div className="space-y-2">
                    {savedFilters.map((filter, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        <span>{filter.name}</span>
                        <Zap size={14} className="text-yellow-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>
                      No saved filters yet. Save your frequently used filters for quick access.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionPanel;
