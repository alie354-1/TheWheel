import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageCircle, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Term } from '../../../terminology/Term';

interface StepAssistantProps {
  stepId: string;
  stepName: string;
  stepDescription?: string;
  stepDifficulty?: 'easy' | 'medium' | 'hard';
  className?: string;
}

/**
 * StepAssistant Component
 * 
 * A contextual AI-powered assistant that provides guidance for completing journey steps.
 * Part of the Sprint 2 implementation of the Journey System.
 */
export const StepAssistant: React.FC<StepAssistantProps> = ({
  stepId,
  stepName,
  stepDescription,
  stepDifficulty = 'medium',
  className = '',
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'guidance' | 'tips' | 'warnings'>('guidance');
  const [guidanceSuggestions, setGuidanceSuggestions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load assistance data
  useEffect(() => {
    // Simulate API call to get AI-powered assistance
    setLoading(true);
    setTimeout(() => {
      // In a real implementation, this would come from an AI service
      setGuidanceSuggestions([
        `Break down the "${stepName}" task into smaller, manageable subtasks.`,
        `Consider allocating 2-3 hours for this ${stepDifficulty} level step.`,
        `Review the documentation and examples before starting.`,
        `Don't hesitate to ask for help if you get stuck.`
      ]);
      
      setTips([
        `Tools like ${getRandomToolSuggestion()} can help you complete this step more efficiently.`,
        `This step builds on concepts from earlier phases - revisit those if needed.`,
        `Consider collaborating with team members who have complementary skills.`,
        `Document your process as you go for easier reviews later.`
      ]);
      
      setWarnings([
        `Many users struggle with ${getCommonPitfall(stepDifficulty)} in this step.`,
        `Don't rush through the validation phase - it's critical for success.`,
        `Be aware that this step may take longer than initially estimated.`,
        `Watch out for common misconceptions about ${stepName.toLowerCase()}.`
      ]);
      
      setLoading(false);
    }, 1000);
  }, [stepId, stepName, stepDifficulty]);

  // Helper functions for generating contextual content
  const getRandomToolSuggestion = (difficulty = stepDifficulty) => {
    const tools = {
      easy: ['Simple Planner', 'BasicTrack', 'EasyDoc'],
      medium: ['MidLevel Analytics', 'ProjectVision', 'TeamSync'],
      hard: ['AdvancedModeling', 'EnterpriseFlow', 'ExpertSystem']
    };
    
    const options = tools[difficulty] || tools.medium;
    return options[Math.floor(Math.random() * options.length)];
  };
  
  const getCommonPitfall = (difficulty: string) => {
    const pitfalls = {
      easy: 'underestimating the details',
      medium: 'scope management',
      hard: 'resource allocation and dependencies'
    };
    
    return pitfalls[difficulty as keyof typeof pitfalls] || 'time management';
  };

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'guidance':
        return (
          <ul className="space-y-2">
            {guidanceSuggestions.map((suggestion, index) => (
              <li key={`guidance-${index}`} className="flex items-start">
                <span className="text-blue-500 font-medium mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        );
      case 'tips':
        return (
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={`tip-${index}`} className="flex items-start">
                <span className="text-green-500 font-medium mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        );
      case 'warnings':
        return (
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={`warning-${index}`} className="flex items-start">
                <span className="text-orange-500 font-medium mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`step-assistant bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <HelpCircle className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium text-gray-800">
            <Term keyPath="assistants.stepAssistant" fallback="Step Assistant" />
          </h3>
        </div>
        <div className="flex items-center">
          {expanded ? 
            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
            <ChevronDown className="h-5 w-5 text-gray-500" />
          }
        </div>
      </div>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {/* Introduction */}
          <p className="text-sm text-gray-600 mb-4">
            Get AI-powered assistance for completing the <span className="font-medium">{stepName}</span> step.
          </p>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'guidance' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('guidance')}
            >
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                Guidance
              </div>
            </button>
            
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'tips' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tips')}
            >
              <div className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                Tips
              </div>
            </button>
            
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'warnings' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('warnings')}
            >
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Watch Out
              </div>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="text-sm text-gray-700">
            {renderTabContent()}
          </div>
          
          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
            <span>Contextual AI assistance based on your journey</span>
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                // In a real implementation, this would open a feedback form
                alert('Feedback feature would open here');
              }}
            >
              Improve suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepAssistant;
