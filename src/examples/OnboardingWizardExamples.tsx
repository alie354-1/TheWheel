import React, { useState } from 'react';
import OnboardingWizard, { FeatureConfig } from '../components/ui/OnboardingWizard';

/**
 * This file demonstrates how to use the OnboardingWizard component for different features
 */

export const OnboardingWizardExamples: React.FC = () => {
  const [showIdeaPlayground, setShowIdeaPlayground] = useState(false);
  const [showTeamCollaboration, setShowTeamCollaboration] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // Example of Idea Playground feature config
  const ideaPlaygroundConfig: FeatureConfig = {
    id: 'idea-playground',
    name: 'Idea Playground',
    description: 'Develop your business ideas from concept to execution plan',
    steps: [
      {
        title: 'Define your idea concept',
        description: 'Start with a clear, concise description of your business idea'
      },
      {
        title: 'Articulate problem & solution',
        description: 'Identify the problem you solve and how your solution addresses it'
      },
      {
        title: 'Identify target audience',
        description: 'Define who will benefit most from your product or service'
      },
      {
        title: 'Develop business model',
        description: 'Outline how your idea will generate revenue and create value'
      },
      {
        title: 'Create go-to-market plan',
        description: 'Plan how you will launch your product and reach customers'
      }
    ],
    features: [
      {
        title: 'AI Assistance',
        description: 'Get suggestions, enhancement, and guidance from our AI at every step',
        colorScheme: 'indigo'
      },
      {
        title: 'Collaborative Tools',
        description: 'Share ideas with team members and collect feedback',
        colorScheme: 'purple'
      },
      {
        title: 'Export Options',
        description: 'Save your work in various formats for presentations or sharing',
        colorScheme: 'blue'
      },
      {
        title: 'Progress Tracking',
        description: 'Monitor your idea development with visual progress indicators',
        colorScheme: 'green'
      }
    ]
  };

  // Example of Team Collaboration feature config
  const teamCollaborationConfig: FeatureConfig = {
    id: 'team-collaboration',
    name: 'Team Collaboration',
    description: 'Work together with your team members efficiently and effectively',
    steps: [
      {
        title: 'Invite team members',
        description: 'Add your colleagues to your project workspace'
      },
      {
        title: 'Assign roles and permissions',
        description: 'Define who can view, edit, or administer different sections'
      },
      {
        title: 'Set up communication channels',
        description: 'Configure notifications and discussion threads'
      },
      {
        title: 'Establish workflow rules',
        description: 'Define approval processes and review cycles'
      }
    ],
    features: [
      {
        title: 'Real-time editing',
        description: 'Edit documents simultaneously with multiple team members',
        colorScheme: 'blue'
      },
      {
        title: 'Task management',
        description: 'Assign, track, and update tasks among team members',
        colorScheme: 'green'
      },
      {
        title: 'Feedback system',
        description: 'Comment and provide feedback on specific sections',
        colorScheme: 'purple'
      },
      {
        title: 'Activity timeline',
        description: 'View a chronological record of all team activities',
        colorScheme: 'indigo'
      }
    ]
  };

  // Example of Analytics Dashboard feature config
  const analyticsDashboardConfig: FeatureConfig = {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Gain insights into your business performance with powerful analytics',
    steps: [
      {
        title: 'Connect data sources',
        description: 'Link your data from various platforms and services'
      },
      {
        title: 'Create custom reports',
        description: 'Design reports that focus on your key metrics'
      },
      {
        title: 'Set up automated alerts',
        description: 'Get notified when important metrics change significantly'
      },
      {
        title: 'Share insights with stakeholders',
        description: 'Export and distribute reports to team members and clients'
      }
    ],
    features: [
      {
        title: 'Interactive visualizations',
        description: 'Explore data with dynamic charts and graphs',
        colorScheme: 'blue'
      },
      {
        title: 'AI-powered predictions',
        description: 'Get forecasts and trend analysis for your key metrics',
        colorScheme: 'red'
      },
      {
        title: 'Custom dashboards',
        description: 'Create personalized views for different team members',
        colorScheme: 'yellow'
      },
      {
        title: 'Data export options',
        description: 'Export data in various formats for further analysis',
        colorScheme: 'green'
      }
    ]
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">OnboardingWizard Component Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Idea Playground Example */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Idea Playground Onboarding</h2>
          <p className="text-gray-600 mb-4">
            A founder's journey from idea to execution plan
          </p>
          <button
            onClick={() => setShowIdeaPlayground(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Show Example
          </button>
          
          {showIdeaPlayground && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
              <OnboardingWizard
                feature={ideaPlaygroundConfig}
                onStart={() => setShowIdeaPlayground(false)}
                primaryColor="bg-indigo-600"
                startButtonText="Start Your Founder's Journey"
                className="max-w-3xl"
              />
            </div>
          )}
        </div>
        
        {/* Team Collaboration Example */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Team Collaboration Onboarding</h2>
          <p className="text-gray-600 mb-4">
            Tools for effective teamwork and communication
          </p>
          <button
            onClick={() => setShowTeamCollaboration(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Show Example
          </button>
          
          {showTeamCollaboration && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
              <OnboardingWizard
                feature={teamCollaborationConfig}
                onStart={() => setShowTeamCollaboration(false)}
                primaryColor="bg-purple-600"
                startButtonText="Get Started with Collaboration"
                skipButtonText="Skip Tour"
                onSkip={() => setShowTeamCollaboration(false)}
                className="max-w-3xl"
              />
            </div>
          )}
        </div>
        
        {/* Analytics Dashboard Example */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Analytics Dashboard Onboarding</h2>
          <p className="text-gray-600 mb-4">
            Powerful metrics and reporting tools
          </p>
          <button
            onClick={() => setShowAnalyticsDashboard(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Show Example
          </button>
          
          {showAnalyticsDashboard && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
              <OnboardingWizard
                feature={analyticsDashboardConfig}
                onStart={() => setShowAnalyticsDashboard(false)}
                primaryColor="bg-blue-600"
                startButtonText="Explore Analytics"
                skipButtonText="Skip Introduction"
                onSkip={() => setShowAnalyticsDashboard(false)}
                showTutorialOption={false}
                className="max-w-3xl"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">How to Use the OnboardingWizard</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`import React, { useState } from 'react';
import OnboardingWizard, { FeatureConfig } from '../components/ui/OnboardingWizard';

// Define your feature configuration
const myFeatureConfig: FeatureConfig = {
  id: 'my-feature',
  name: 'My Feature',
  description: 'Description of my feature',
  steps: [
    { title: 'Step 1', description: 'Description of step 1' },
    { title: 'Step 2', description: 'Description of step 2' }
  ],
  features: [
    { 
      title: 'Feature Highlight', 
      description: 'Description of feature highlight',
      colorScheme: 'blue' 
    }
  ]
};

// Use in your component
const MyComponent: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <>
      {showOnboarding && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center">
          <OnboardingWizard
            feature={myFeatureConfig}
            onStart={() => setShowOnboarding(false)}
            primaryColor="bg-blue-600"
            startButtonText="Get Started"
          />
        </div>
      )}
      
      {/* Your component content here */}
    </>
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default OnboardingWizardExamples;
