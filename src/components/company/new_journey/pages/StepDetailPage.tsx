import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Info, CheckCircle, XCircle, AlertTriangle, MessageSquare, 
  Wrench, FileText, Users, ArrowLeft, ArrowRight, Clock
} from 'lucide-react';
import { supabase } from '../../../../lib/utils/supabaseClient';
import StepTasksChecklist from '../components/StepTasksChecklist';

interface StepDetailProps {
  mode?: 'template' | 'company';
}

interface StepDetail {
  id: string;
  name: string;
  description: string;
  domain: string;
  phase: string;
  whyThisMatters: string;
  deliverables: string[];
  successCriteria: string[];
  dependencies: { id: string; name: string }[];
  potentialBlockers: string[];
  recommendedTools: { name: string; url: string; description: string }[];
  tasks: {
    id: string;
    name: string;
    isCompleted: boolean;
  }[];
  aiSuggestions: string[];
  communityInsights: {
    averageCompletion: string;
    successRate: string;
    commonTools: string[];
  };
}

/**
 * Component that displays detailed information about a journey step
 * Includes tasks, resources, and community insights
 * 
 * @param mode - 'template' for viewing template steps, 'company' for viewing company journey steps
 */
const StepDetailPage: React.FC<StepDetailProps> = ({ mode = 'template' }) => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<StepDetail | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch real step data from the database
  useEffect(() => {
    const fetchStepData = async () => {
      if (!stepId) return;
      
      try {
        // Determine which table to query based on mode
        const tableName = mode === 'company' ? 'company_new_journey_steps' : 'journey_new_steps';
        console.log(`Fetching step data from ${tableName} with ID: ${stepId}`);
        
        // Query the appropriate table
        const { data: stepData, error: stepError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', stepId)
          .single();
        
        if (stepError) {
          console.error('Error fetching step data:', stepError);
          // If we can't find the step, create a new one with a proper UUID
          const newStepId = crypto.randomUUID();
          console.log('Creating new step with UUID:', newStepId);
          
          // This is mock data for demo purposes
          setStep({
            id: newStepId,
            name: 'Define Vision & Mission',
            description: 'Create a clear and compelling vision and mission statement that will guide your company strategy and align team members.',
            domain: 'Strategy',
            phase: 'Ideation',
            whyThisMatters: 'A clear vision and mission serves as a north star for all company decisions, from product development to hiring. It helps align stakeholders around core purpose and provides a foundation for strategic planning.',
            deliverables: [
              'Vision statement draft (1-2 sentences)',
              'Mission statement draft (1-2 paragraphs)',
              'Presentation for stakeholder review',
              'Documentation for company handbook'
            ],
            successCriteria: [
              'Stakeholder approval ≥80%',
              'Team members can articulate vision/mission when asked',
              'Vision/mission influences product roadmap decisions',
              'Mission connects to tangible business goals'
            ],
            dependencies: [
              { id: 'step-market-research', name: 'Market Research' }
            ],
            potentialBlockers: [
              'Difficulty scheduling stakeholder meetings',
              'Competing visions among leadership',
              'Insufficient market/customer research'
            ],
            recommendedTools: [
              { 
                name: 'Miro', 
                url: 'https://miro.com', 
                description: 'Collaborative whiteboarding for brainstorming sessions'
              },
              { 
                name: 'Notion', 
                url: 'https://notion.so', 
                description: 'Document collaboration for drafting and feedback'
              }
            ],
            tasks: [
              { id: 'task-1', name: 'Research vision statements of similar companies', isCompleted: false },
              { id: 'task-2', name: 'Draft initial vision statement (1-2 sentences)', isCompleted: false },
              { id: 'task-3', name: 'Draft initial mission statement (1-2 paragraphs)', isCompleted: false },
              { id: 'task-4', name: 'Schedule stakeholder review meeting', isCompleted: false },
              { id: 'task-5', name: 'Gather and incorporate feedback', isCompleted: false },
              { id: 'task-6', name: 'Finalize and document in company handbook', isCompleted: false }
            ],
            aiSuggestions: [
              'Consider how your vision statement addresses the "why" behind your company',
              'Ensure your mission statement includes actionable components',
              'Schedule one-on-one conversations with key stakeholders before group review'
            ],
            communityInsights: {
              averageCompletion: '1.8 days',
              successRate: '94%',
              commonTools: ['Miro', 'Figma', 'Notion']
            }
          });
        } else {
          // We found the step in the database, use that data
          console.log('Found step in database:', stepData);
          
          // Convert database step to our StepDetail format
          // In a real implementation, this would fetch all the related data
          setStep({
            id: stepData.id,
            name: stepData.name || 'Untitled Step',
            description: stepData.description || 'No description available',
            domain: stepData.domain?.name || 'General',
            phase: stepData.phase?.name || 'General',
            whyThisMatters: stepData.why_this_matters || 'No information available',
            deliverables: stepData.deliverables || [],
            successCriteria: stepData.success_criteria || [],
            dependencies: stepData.dependencies || [],
            potentialBlockers: stepData.potential_blockers || [],
            recommendedTools: stepData.recommended_tools || [],
            tasks: stepData.tasks || [],
            aiSuggestions: stepData.ai_suggestions || [],
            communityInsights: {
              averageCompletion: stepData.average_completion || 'Unknown',
              successRate: stepData.success_rate || 'Unknown',
              commonTools: stepData.common_tools || []
            }
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching step data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, [stepId]);

  const handleTaskToggle = (taskId: string) => {
    if (!step) return;
    
    setStep({
      ...step,
      tasks: step.tasks.map(task => 
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    });
  };

  const handleMarkComplete = async () => {
    if (mode === 'template') {
      // For template steps, we need to create a company step first
      alert('Starting this step! In a real implementation, this would create a company step.');
      // Here we would create a company step and then redirect to it
      navigate('/company/new-journey');
    } else {
      // For company steps, we mark it as complete
      alert('Step marked as complete! In a real implementation, this would update the database.');
      navigate('/company/new-journey');
    }
  };

  const handleSkip = () => {
    if (mode === 'template') {
      // For template steps, just go back
      navigate('/company/new-journey');
    } else {
      // For company steps, mark as skipped
      alert('Step skipped! In a real implementation, this would update the database.');
      navigate('/company/new-journey');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/company/new-journey');
  };

  if (loading || !step) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const completedTasksCount = step.tasks.filter(task => task.isCompleted).length;
  const totalTasksCount = step.tasks.length;
  const progressPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={handleBackToDashboard}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{step.name}</h1>
            <div className="flex items-center mt-1 space-x-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {step.domain}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {step.phase}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Progress: {progressPercentage}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-3">
            <button
              onClick={handleSkip}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {mode === 'template' ? 'Back' : 'Skip'}
              {mode === 'template' ? <ArrowLeft className="ml-2 h-4 w-4" /> : <XCircle className="ml-2 h-4 w-4" />}
            </button>
            
            <button
              onClick={handleMarkComplete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {mode === 'template' ? 'Start Step' : 'Mark Complete'}
              <CheckCircle className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details & Tasks
          </button>
          
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('resources')}
          >
            Resources & Tools
          </button>
          
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'community'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('community')}
          >
            Community & AI
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Description */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700">{step.description}</p>
              </div>
              
              {/* Why This Matters */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Info className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Why This Matters</h2>
                </div>
                <p className="text-gray-700">{step.whyThisMatters}</p>
              </div>
              
              {/* Tasks */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  <span className="text-sm text-gray-500">{completedTasksCount} of {totalTasksCount} completed</span>
                </div>
                
                {/* Use the StepTasksChecklist component with the current step ID */}
                <StepTasksChecklist stepId={step.id} />
              </div>
              
              {/* Deliverables & Success Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Deliverables</h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {step.deliverables.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Success Criteria</h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {step.successCriteria.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'resources' && (
            <>
              {/* Recommended Tools */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Wrench className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Recommended Tools</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.recommendedTools.map((tool, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-gray-900">{tool.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{tool.description}</p>
                      <a 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Visit website →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Templates */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Templates</h2>
                </div>
                
                <div className="border border-dashed border-gray-300 rounded-md p-8 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Templates will be available soon</p>
                </div>
              </div>
              
              {/* Dependencies & Blockers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Dependencies</h2>
                  {step.dependencies.length > 0 ? (
                    <ul className="space-y-2">
                      {step.dependencies.map((dep, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <ArrowRight className="h-4 w-4 text-gray-400 mr-2" />
                          {dep.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No dependencies for this step</p>
                  )}
                </div>
                
                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Potential Blockers</h2>
                  <ul className="space-y-2">
                    {step.potentialBlockers.map((blocker, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        {blocker}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'community' && (
            <>
              {/* AI Suggestions */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-5 text-indigo-500 mr-2 font-bold">AI</div>
                  <h2 className="text-lg font-medium text-gray-900">AI Suggestions</h2>
                </div>
                
                <div className="space-y-3">
                  {step.aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-indigo-50 p-3 rounded-md">
                      <p className="text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Community Intelligence */}
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Community Intelligence</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Average completion time</p>
                    <p className="text-lg font-semibold text-gray-900">{step.communityInsights.averageCompletion}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Success rate</p>
                    <p className="text-lg font-semibold text-gray-900">{step.communityInsights.successRate}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Popular tools</p>
                    <p className="text-lg font-semibold text-gray-900">{step.communityInsights.commonTools.join(', ')}</p>
                  </div>
                </div>
                
                <div className="border border-dashed border-gray-300 rounded-md p-6">
                  <h3 className="font-medium text-gray-700 mb-2">Community Discussion</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Connect with other founders who have completed this step to learn from their experiences.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Discussions
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* Standup Bot Widget */}
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Standup Bot</h2>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-4">
              <div className="flex items-start mb-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  B
                </div>
                <div className="ml-3 bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-gray-700">What did you accomplish on this step today?</p>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <input
                type="text"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Type your standup update..."
              />
              <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Send
              </button>
            </div>
          </div>
          
          {/* Need Help Card */}
          <div className="bg-indigo-50 shadow-sm rounded-lg p-6 border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">Need Help?</h3>
            <p className="text-sm text-indigo-700 mb-4">
              Get personalized guidance for this step from our AI assistant or connect with an expert founder.
            </p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Ask AI Assistant
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50">
                Connect with Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDetailPage;
