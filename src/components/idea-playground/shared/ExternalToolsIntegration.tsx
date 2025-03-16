import React, { useState, useEffect } from 'react';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';

// Supported external tool types
type ExternalToolType = 'calendar' | 'tasks' | 'notes' | 'project' | 'docs' | 'other';

// Integration configuration
interface ToolConfiguration {
  type: ExternalToolType;
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  authUrl?: string;
  apiKey?: string;
  scopes?: string[];
}

// Actions that can be performed with external tools
interface ToolAction {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  toolId: string;
  action: (idea: IdeaPlaygroundIdea) => Promise<void>;
}

interface ExternalToolsIntegrationProps {
  idea: IdeaPlaygroundIdea;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

// Default tool configurations
const DEFAULT_TOOLS: ToolConfiguration[] = [
  {
    type: 'calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: 'Schedule meetings and set reminders for your idea development milestones',
    isConnected: false,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/calendar']
  },
  {
    type: 'tasks',
    name: 'Trello',
    icon: '📋',
    description: 'Create task boards to track the development of your idea',
    isConnected: false,
    authUrl: 'https://trello.com/1/authorize'
  },
  {
    type: 'tasks',
    name: 'Asana',
    icon: '✅',
    description: 'Organize tasks and track progress on your idea implementation',
    isConnected: false,
    authUrl: 'https://app.asana.com/-/oauth_authorize'
  },
  {
    type: 'notes',
    name: 'Notion',
    icon: '📝',
    description: 'Create rich documentation for your idea and share with team members',
    isConnected: false,
    authUrl: 'https://api.notion.com/v1/oauth/authorize'
  },
  {
    type: 'project',
    name: 'GitHub',
    icon: '💻',
    description: 'Manage code repositories and track technical development',
    isConnected: false,
    authUrl: 'https://github.com/login/oauth/authorize'
  },
  {
    type: 'docs',
    name: 'Google Docs',
    icon: '📄',
    description: 'Create and collaborate on documents for your idea',
    isConnected: false,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/documents']
  }
];

// Default actions
const DEFAULT_ACTIONS: ToolAction[] = [
  {
    id: 'calendar-milestone',
    name: 'Schedule Milestone',
    description: 'Add a milestone to your calendar',
    iconUrl: '📅',
    toolId: 'Google Calendar',
    action: async (idea) => {
      // Mock implementation - in a real app this would call the Google Calendar API
      console.log(`Scheduling milestone for ${idea.title}`);
      // Return a resolved promise after a delay to simulate API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  {
    id: 'trello-board',
    name: 'Create Trello Board',
    description: 'Create a new Trello board for this idea',
    iconUrl: '📋',
    toolId: 'Trello',
    action: async (idea) => {
      console.log(`Creating Trello board for ${idea.title}`);
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  {
    id: 'asana-project',
    name: 'Create Asana Project',
    description: 'Create a new Asana project for this idea',
    iconUrl: '✅',
    toolId: 'Asana',
    action: async (idea) => {
      console.log(`Creating Asana project for ${idea.title}`);
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  {
    id: 'notion-page',
    name: 'Create Notion Page',
    description: 'Create a new Notion page for this idea',
    iconUrl: '📝',
    toolId: 'Notion',
    action: async (idea) => {
      console.log(`Creating Notion page for ${idea.title}`);
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  {
    id: 'github-repo',
    name: 'Create GitHub Repository',
    description: 'Create a new GitHub repository for this idea',
    iconUrl: '💻',
    toolId: 'GitHub',
    action: async (idea) => {
      console.log(`Creating GitHub repository for ${idea.title}`);
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  {
    id: 'gdocs-document',
    name: 'Create Google Doc',
    description: 'Create a new Google Doc for this idea',
    iconUrl: '📄',
    toolId: 'Google Docs',
    action: async (idea) => {
      console.log(`Creating Google Doc for ${idea.title}`);
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
];

/**
 * External Tools Integration Component
 * Provides integration with popular external tools like calendars, task managers,
 * note-taking apps, and more to help users organize and manage their ideas
 */
const ExternalToolsIntegration: React.FC<ExternalToolsIntegrationProps> = ({
  idea,
  onSuccess,
  onError
}) => {
  const [tools, setTools] = useState<ToolConfiguration[]>([]);
  const [actions, setActions] = useState<ToolAction[]>([]);
  const [activeTab, setActiveTab] = useState<'connect' | 'actions'>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolConfiguration | null>(null);
  const [selectedAction, setSelectedAction] = useState<ToolAction | null>(null);

  // Load tools from localStorage or use defaults
  useEffect(() => {
    const savedTools = localStorage.getItem('wheel99-external-tools');
    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        console.error('Error parsing saved tools:', e);
        setTools(DEFAULT_TOOLS);
      }
    } else {
      setTools(DEFAULT_TOOLS);
    }
  }, []);

  // Filter actions based on connected tools
  useEffect(() => {
    const connectedToolIds = tools.filter(t => t.isConnected).map(t => t.name);
    const availableActions = DEFAULT_ACTIONS.filter(action => 
      connectedToolIds.includes(action.toolId)
    );
    setActions(availableActions);
  }, [tools]);

  // Save tools to localStorage when they change
  useEffect(() => {
    if (tools.length > 0) {
      localStorage.setItem('wheel99-external-tools', JSON.stringify(tools));
    }
  }, [tools]);

  // Handle connecting to a tool
  const handleConnect = async (tool: ToolConfiguration) => {
    setIsLoading(true);
    setSelectedTool(tool);
    
    try {
      // In a real application, this would launch OAuth flow or API key setup
      // For this mock implementation, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the tool's connection status
      const updatedTools = tools.map(t => 
        t.name === tool.name ? { ...t, isConnected: true } : t
      );
      
      setTools(updatedTools);
      onSuccess(`Connected to ${tool.name} successfully!`);
    } catch (error) {
      console.error(`Error connecting to ${tool.name}:`, error);
      onError(`Failed to connect to ${tool.name}. Please try again.`);
    } finally {
      setIsLoading(false);
      setSelectedTool(null);
    }
  };

  // Handle disconnecting from a tool
  const handleDisconnect = async (tool: ToolConfiguration) => {
    setIsLoading(true);
    setSelectedTool(tool);
    
    try {
      // In a real application, this would revoke OAuth tokens or delete API keys
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the tool's connection status
      const updatedTools = tools.map(t => 
        t.name === tool.name ? { ...t, isConnected: false } : t
      );
      
      setTools(updatedTools);
      onSuccess(`Disconnected from ${tool.name} successfully!`);
    } catch (error) {
      console.error(`Error disconnecting from ${tool.name}:`, error);
      onError(`Failed to disconnect from ${tool.name}. Please try again.`);
    } finally {
      setIsLoading(false);
      setSelectedTool(null);
    }
  };

  // Handle performing an action
  const handleAction = async (action: ToolAction) => {
    setIsLoading(true);
    setSelectedAction(action);
    
    try {
      await action.action(idea);
      onSuccess(`${action.name} completed successfully!`);
    } catch (error) {
      console.error(`Error performing action ${action.name}:`, error);
      onError(`Failed to ${action.name.toLowerCase()}. Please try again.`);
    } finally {
      setIsLoading(false);
      setSelectedAction(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            type="button"
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'connect'
                ? 'bg-white border-b-2 border-indigo-500 text-indigo-600'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            } flex-1`}
            onClick={() => setActiveTab('connect')}
          >
            Connect Tools
          </button>
          <button
            type="button"
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'actions'
                ? 'bg-white border-b-2 border-indigo-500 text-indigo-600'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            } flex-1`}
            onClick={() => setActiveTab('actions')}
          >
            Actions
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'connect' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">External Tools</h3>
            <p className="text-sm text-gray-500 mb-4">
              Connect to external tools to enhance your idea development process.
            </p>
            
            <div className="space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className={`p-4 border rounded-md ${
                    isLoading && selectedTool?.name === tool.name
                      ? 'animate-pulse bg-gray-50'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{tool.icon}</span>
                      <div>
                        <h4 className="text-md font-medium text-gray-900">{tool.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                      </div>
                    </div>
                    
                    <div>
                      {tool.isConnected ? (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(tool)}
                          disabled={isLoading}
                          className={`text-sm px-3 py-1 rounded-md ${
                            isLoading && selectedTool?.name === tool.name
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {isLoading && selectedTool?.name === tool.name
                            ? 'Disconnecting...'
                            : 'Disconnect'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnect(tool)}
                          disabled={isLoading}
                          className={`text-sm px-3 py-1 rounded-md ${
                            isLoading && selectedTool?.name === tool.name
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          {isLoading && selectedTool?.name === tool.name
                            ? 'Connecting...'
                            : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {tool.isConnected && (
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Connected
                    </div>
                  )}
                </div>
              ))}
              
              {tools.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No external tools available.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'actions' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Actions</h3>
            <p className="text-sm text-gray-500 mb-4">
              Use these actions to integrate your idea with external tools.
            </p>
            
            {actions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">No actions available. Connect tools first.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('connect')}
                  className="mt-4 text-sm px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Connect Tools
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 border rounded-md ${
                      isLoading && selectedAction?.id === action.id
                        ? 'animate-pulse bg-gray-50'
                        : 'bg-white hover:shadow-md transition-shadow duration-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{action.iconUrl}</span>
                      <h4 className="text-md font-medium text-gray-900">{action.name}</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{action.description}</p>
                    <button
                      type="button"
                      onClick={() => handleAction(action)}
                      disabled={isLoading}
                      className={`w-full text-sm px-3 py-2 rounded-md ${
                        isLoading && selectedAction?.id === action.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isLoading && selectedAction?.id === action.id
                        ? 'Processing...'
                        : action.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalToolsIntegration;
