import React from 'react';
import { TutorialStep } from './OnboardingTutorial';

/**
 * Returns the tutorial steps for the specified pathway
 * This centralizes all tutorial content for the different pathways
 */
export const getPathwayTutorialSteps = (pathway: 1 | 2 | 3): TutorialStep[] => {
  switch (pathway) {
    case 1: // Start with Specific Idea
      return [
        {
          target: '.idea-capture-screen',
          title: 'Welcome to Idea Creation',
          content: 'This pathway helps you develop a specific idea from concept to execution plan. Start by giving your idea a title and description.',
          position: 'bottom'
        },
        {
          target: '.title-input',
          title: 'Name Your Idea',
          content: 'Give your idea a clear, descriptive title that captures its essence. Be specific but concise.',
          position: 'bottom'
        },
        {
          target: '.ai-assisted-input',
          title: 'AI Assistance',
          content: 'Use the AI suggestions button for help generating compelling content. Our AI can help refine your language or suggest alternative approaches.',
          position: 'right'
        },
        {
          target: '.description-textarea',
          title: 'Describe Your Idea',
          content: 'Provide a comprehensive description of your idea. What is it? How does it work? What problem does it solve?',
          position: 'top'
        },
        {
          target: '.navigation-buttons',
          title: 'Step-by-Step Process',
          content: 'Use these buttons to navigate through the idea development process. Each screen will guide you through a specific aspect of your idea.',
          position: 'top'
        }
      ];
      
    case 2: // Industry Exploration
      return [
        {
          target: '.industry-selection-screen',
          title: 'Explore Industry Opportunities',
          content: 'This pathway helps you discover promising business ideas based on industry trends and market gaps.',
          position: 'bottom'
        },
        {
          target: '.industry-categories',
          title: 'Select Industries',
          content: 'Browse or search for industries that interest you. You can select multiple industries to explore ideas at their intersection.',
          position: 'right'
        },
        {
          target: '.ai-generate-button',
          title: 'Generate Ideas',
          content: 'Click here to have our AI suggest innovative business ideas based on your selected industries and preferences.',
          position: 'bottom'
        },
        {
          target: '.idea-cards-container',
          title: 'Compare Ideas',
          content: 'Review the generated ideas and compare them side by side. You can save promising ones to refine further.',
          position: 'left'
        },
        {
          target: '.idea-refinement-tabs',
          title: 'Multi-Stage Refinement',
          content: 'After selecting an idea, you can refine it through multiple aspects - from the core concept to go-to-market strategy.',
          position: 'top'
        }
      ];
      
    case 3: // Browse & Refine Existing Ideas
      return [
        {
          target: '.idea-library-screen',
          title: 'Your Idea Library',
          content: 'This pathway helps you organize, analyze, and improve your existing ideas. Think of it as your idea management system.',
          position: 'bottom'
        },
        {
          target: '.idea-filters',
          title: 'Find Ideas Quickly',
          content: 'Use these filters to sort and search through your ideas by various criteria like status, date, or keywords.',
          position: 'right'
        },
        {
          target: '.idea-card',
          title: 'Idea Overview',
          content: 'Each card shows a summary of your idea. Click on one to view details or select it for further analysis.',
          position: 'bottom'
        },
        {
          target: '.ai-analysis-button',
          title: 'AI-Powered Analysis',
          content: 'Request an in-depth AI analysis of your idea, covering market potential, feasibility, risks, and opportunities.',
          position: 'left'
        },
        {
          target: '.export-button',
          title: 'Export Options',
          content: 'Export your idea in various formats including PDF, presentation slides, or shareable documents.',
          position: 'bottom'
        }
      ];
      
    default:
      return [];
  }
};

/**
 * A component that renders a tutorial guide for different idea playground pathways
 */
interface OnboardingContentProps {
  pathway: 1 | 2 | 3;
  onStart: () => void;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({ pathway, onStart }) => {
  const getPathwayName = (num: number): string => {
    switch (num) {
      case 1: return "Start with Specific Idea";
      case 2: return "Industry Exploration";
      case 3: return "Browse & Refine Existing Ideas";
      default: return "Idea Playground";
    }
  };
  
  const getPathwayDescription = (num: number): string => {
    switch (num) {
      case 1:
        return "Develop a specific idea from concept to execution plan. Perfect when you already have a business idea in mind.";
      case 2:
        return "Discover promising business ideas based on industry trends and market gaps. Ideal when you want to explore opportunities.";
      case 3:
        return "Organize, analyze, and improve your existing ideas. Best for managing your idea portfolio.";
      default:
        return "Explore the Idea Playground to develop and refine business ideas.";
    }
  };
  
  const getPathwayStepsPreview = (num: number): string[] => {
    switch (num) {
      case 1:
        return [
          "Define your idea concept",
          "Articulate problem & solution",
          "Identify target audience",
          "Develop business model",
          "Create go-to-market plan"
        ];
      case 2:
        return [
          "Select industries of interest",
          "Generate innovative ideas",
          "Compare and evaluate options",
          "Select and refine promising ideas",
          "Develop implementation strategy"
        ];
      case 3:
        return [
          "Browse your idea library",
          "Request AI-powered analysis",
          "Review insights and feedback",
          "Refine idea based on analysis",
          "Export and share your idea"
        ];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Welcome to Pathway {pathway}</h2>
        <p className="text-indigo-100 text-sm mt-1">
          {getPathwayName(pathway)}
        </p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">About This Pathway</h3>
          <p className="text-gray-600">
            {getPathwayDescription(pathway)}
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">What You'll Do</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            {getPathwayStepsPreview(pathway).map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Features to Explore</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-md p-3">
              <div className="font-medium text-indigo-800 mb-1">AI Assistance</div>
              <p className="text-sm text-gray-600">Get suggestions, enhancement, and guidance from our AI at every step</p>
            </div>
            <div className="bg-purple-50 rounded-md p-3">
              <div className="font-medium text-purple-800 mb-1">Collaborative Tools</div>
              <p className="text-sm text-gray-600">Share ideas with team members and collect feedback</p>
            </div>
            <div className="bg-blue-50 rounded-md p-3">
              <div className="font-medium text-blue-800 mb-1">Export Options</div>
              <p className="text-sm text-gray-600">Save your work in various formats for presentations or sharing</p>
            </div>
            <div className="bg-green-50 rounded-md p-3">
              <div className="font-medium text-green-800 mb-1">Progress Tracking</div>
              <p className="text-sm text-gray-600">Monitor your idea development with visual progress indicators</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-500">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600"
                defaultChecked={true}
              />
              <span className="ml-2">Show tutorial tips as I go</span>
            </label>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Start Pathway {pathway}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingContent;
