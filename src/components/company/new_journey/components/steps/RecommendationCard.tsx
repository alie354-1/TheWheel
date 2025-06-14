import React, { useState } from 'react';
import ExpandableSection from '../ui/ExpandableSection';
import { Eye } from 'lucide-react';
import { newJourneyFrameworkService } from '../../../../../lib/services/new_journey/new_journey_framework.service';
import StepQuickViewModal from '../StepQuickViewModal';
import { NewCompanyJourneyStep } from '../../../../../lib/types/new_journey.types';

export type Difficulty = 'Low' | 'Medium' | 'High';

export interface RecommendationCardProps {
  id?: string;
  title: string;
  domain: string;
  description: string;
  peerPercentage: number;
  estimatedTime: string;
  difficulty?: Difficulty;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onStart: () => void;
  onPreview?: (stepId: string) => void;
  whyItMatters?: string;
  recommendedTools?: string[];
  iconColor?: string;
  journeyId?: string;
}

/**
 * RecommendationCard - Card showing a recommended next step with peer insights
 */
const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  title,
  domain,
  description,
  peerPercentage,
  estimatedTime,
  difficulty = 'Medium',
  expandable = false,
  expanded = false,
  onToggleExpand,
  onStart,
  onPreview,
  whyItMatters,
  recommendedTools = [],
  iconColor = 'blue',
  journeyId
}) => {
  const [previewStep, setPreviewStep] = useState<NewCompanyJourneyStep | null>(null);
  // Get appropriate color classes based on iconColor
  const getIconColorClasses = () => {
    const colorMap: Record<string, { bg: string, text: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' }
    };
    
    return colorMap[iconColor] || colorMap.blue;
  };
  
  // Get domain pill color classes
  const getDomainColorClasses = () => {
    const domainMap: Record<string, { bg: string, text: string }> = {
      Product: { bg: 'bg-blue-100', text: 'text-blue-800' },
      Development: { bg: 'bg-purple-100', text: 'text-purple-800' },
      Marketing: { bg: 'bg-green-100', text: 'text-green-800' },
      Finance: { bg: 'bg-amber-100', text: 'text-amber-800' },
      Legal: { bg: 'bg-red-100', text: 'text-red-800' },
      Operations: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    
    return domainMap[domain] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };
  
  const colorClasses = getIconColorClasses();
  const domainClasses = getDomainColorClasses();
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    }
  };
  
  // Handle preview step
  const handlePreviewStep = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!id) return;
    
    try {
      // Fetch the full step data directly from the framework service
      const steps = await newJourneyFrameworkService.getFrameworkSteps();
      // Use proper typing for the canonical step
      const fullStep = steps.find((s) => s.id === id);
      
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
        
        // Call the onPreview callback if provided
        if (onPreview) {
          onPreview(id);
        }
      }
    } catch (error) {
      console.error('Error fetching step data:', error);
    }
  };
  
  // Handle close preview
  const handleClosePreview = () => {
    setPreviewStep(null);
  };
  
  return (
    <>
      <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors mb-3">
        <div className="flex items-start">
          <div className={`${colorClasses.bg} p-2 rounded-full mr-3 flex-shrink-0`}>
            <i className={`fas fa-${iconColor === 'blue' ? 'users' : iconColor === 'purple' ? 'paint-brush' : 'chart-line'} ${colorClasses.text}`}></i>
          </div>
          <div className="flex-grow">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900 mr-2">{title}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${domainClasses.bg} ${domainClasses.text}`}>{domain}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="text-sm text-gray-500">{description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="inline-flex items-center">
                    <i className="fas fa-users mr-1 text-gray-400"></i>
                    {peerPercentage}% of peers did this next
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                {expandable && (
                  <button 
                    className="text-gray-400 hover:text-indigo-600 mr-2"
                    onClick={handleToggleExpand}
                  >
                    <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
                  </button>
                )}
                <div className="flex space-x-2">
                  <button 
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={handlePreviewStep}
                    title="Preview step details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => onStart()}
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expandable content section */}
        {expandable && (
          <ExpandableSection expanded={expanded}>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-700">
                <p className="mb-2">{whyItMatters}</p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <span className="block text-xs text-gray-500">Estimated time</span>
                    <span className="font-medium">{estimatedTime}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Difficulty</span>
                    <span className="font-medium">{difficulty}</span>
                  </div>
                </div>
                {recommendedTools.length > 0 && (
                  <div>
                    <span className="block text-xs text-gray-500">Recommended tools</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {recommendedTools.map((tool, i) => (
                        <span key={i} className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ExpandableSection>
        )}
      </div>
      
      {/* Step Quick View Modal */}
      {previewStep && (
        <StepQuickViewModal
          step={previewStep}
          onClose={handleClosePreview}
          onOpenDetails={() => {
            if (onPreview && id) {
              onPreview(id);
            }
          }}
        />
      )}
    </>
  );
};

export default RecommendationCard;
