import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  FileText, 
  Info, 
  Lightbulb,
  AlertTriangle, 
  MessageSquare, 
  Play, 
  Plus, 
  Users, 
  File, 
  Wrench, 
  Video, 
  ChevronRight, 
  ChevronDown
} from 'lucide-react';
import { useDomainDetails, DomainStep, DomainTask, DomainResource, CommunityInsight } from '../hooks/useDomainDetails';

const DomainDetailPage: React.FC = () => {
  const { domainName } = useParams<{ domainName: string }>();
  const navigate = useNavigate();
  const companyJourneyId = 'journey1'; // In a real app, this would come from context or props
  
  // Fetch domain details using our custom hook
  const { 
    domain, 
    steps, 
    tasks, 
    resources, 
    insights, 
    loading, 
    error 
  } = useDomainDetails(domainName || '', companyJourneyId);
  
  // State for accordion open/closed
  const [openSections, setOpenSections] = useState({
    steps: true,
    resources: true,
    insights: true
  });
  
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get activity level color
  const getActivityLevelColor = (level: string): string => {
    switch (level) {
      case 'high':
        return 'text-blue-600 bg-blue-50';
      case 'medium':
        return 'text-green-600 bg-green-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      case 'dormant':
        return 'text-gray-400 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'not_started':
        return 'text-gray-600 bg-gray-50';
      case 'skipped':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Get importance color
  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-amber-600 bg-amber-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };
  
  // Get difficulty icon
  const getDifficultyIcon = (difficulty: string): JSX.Element => {
    switch (difficulty) {
      case 'beginner':
        return <span className="text-green-600">●</span>;
      case 'intermediate':
        return <span className="flex"><span className="text-blue-600">●</span><span className="text-blue-600 ml-0.5">●</span></span>;
      case 'advanced':
        return <span className="flex"><span className="text-amber-600">●</span><span className="text-amber-600 ml-0.5">●</span><span className="text-amber-600 ml-0.5">●</span></span>;
      default:
        return <span className="text-green-600">●</span>;
    }
  };
  
  // Get resource type icon
  const getResourceTypeIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-indigo-500" />;
      case 'template':
        return <File className="h-4 w-4 text-indigo-500" />;
      case 'tool':
        return <Wrench className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-indigo-500" />;
    }
  };
  
  // Get insight type icon
  const getInsightTypeIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-4 w-4 text-indigo-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success_story':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-indigo-500" />;
    }
  };
  
  // Get maturity level description
  const getMaturityDescription = (level: string): string => {
    switch (level) {
      case 'exploring':
        return 'You are in the early discovery phase, learning about this domain.';
      case 'learning':
        return 'You are actively acquiring knowledge and skills in this domain.';
      case 'practicing':
        return 'You are regularly applying knowledge in this domain.';
      case 'refining':
        return 'You are optimizing and improving processes in this domain.';
      case 'teaching':
        return 'You have mastered this domain and can guide others.';
      default:
        return 'You are actively engaged in this domain.';
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !domain) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <h2 className="text-lg font-medium mb-2">Error Loading Domain</h2>
          <p>{error || 'Domain not found'}</p>
          <button 
            onClick={() => navigate('/company/new-journey')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/company/new-journey')}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      {/* Domain header */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{domain.domain}</h1>
            <div className="mt-2 flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityLevelColor(domain.activityLevel)}`}>
                {domain.activityLevel.charAt(0).toUpperCase() + domain.activityLevel.slice(1)} Activity
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm text-gray-500 capitalize">{domain.maturityLevel} maturity</span>
            </div>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Step
          </button>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Activity</h3>
          <p className="text-sm text-gray-600 mb-4">{domain.currentActivity}</p>
          
          <h3 className="text-sm font-medium text-gray-700 mb-2">Maturity</h3>
          <div className="bg-indigo-50 rounded-md p-4 mb-4">
            <p className="text-sm text-indigo-900">{getMaturityDescription(domain.maturityLevel)}</p>
          </div>
          
          <h3 className="text-sm font-medium text-gray-700 mb-2">AI Insights</h3>
          <div className="space-y-2">
            {domain.aiInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start text-sm">
                {insight.type === 'observation' && <Lightbulb className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />}
                {insight.type === 'suggestion' && <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />}
                {insight.type === 'alert' && <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />}
                <p className="text-gray-700">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Steps section */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('steps')}
        >
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Play className="h-5 w-5 text-indigo-500 mr-2" />
            Steps & Tasks
          </h2>
          {openSections.steps ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {openSections.steps && (
          <div className="mt-4 space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="border border-gray-200 rounded-md overflow-hidden">
                {/* Step header */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">{step.name}</h3>
                      <div className="mt-1 flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                          {step.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {step.timeEstimate}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          Difficulty: {getDifficultyIcon(step.difficulty)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanceColor(step.importance)}`}>
                          {step.importance.charAt(0).toUpperCase() + step.importance.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Start Step
                    </button>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                </div>
                
                {/* Step tasks */}
                <div className="divide-y divide-gray-200">
                  {tasks
                    .filter(task => task.stepId === step.id)
                    .map((task) => (
                      <div key={task.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {task.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : task.status === 'in_progress' ? (
                              <Play className="h-5 w-5 text-blue-500" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{task.name}</h4>
                              <p className="text-xs text-gray-500">{task.timeEstimate}</p>
                            </div>
                          </div>
                          
                          <button className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            {task.status === 'completed' ? 'View' : task.status === 'in_progress' ? 'Continue' : 'Start'}
                          </button>
                        </div>
                        <p className="mt-1 ml-8 text-xs text-gray-600">{task.description}</p>
                      </div>
                    ))
                  }
                  <div className="p-4">
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-2" />
                Add New Step
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Resources section */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('resources')}
        >
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 text-indigo-500 mr-2" />
            Resources
          </h2>
          {openSections.resources ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {openSections.resources && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{getResourceTypeIcon(resource.type)}</div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{resource.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                      <p className="mt-1 text-xs text-gray-600">{resource.description}</p>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View Resource
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Community Insights section */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('insights')}
        >
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 text-indigo-500 mr-2" />
            Community Insights
          </h2>
          {openSections.insights ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {openSections.insights && (
          <div className="mt-4 space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex-shrink-0">
                    {getInsightTypeIcon(insight.type)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-xs uppercase font-semibold text-gray-500 mr-2">
                        {insight.type.split('_').join(' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        From {insight.source}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">{insight.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-center p-4 border border-gray-200 rounded-md bg-gray-50">
              <MessageSquare className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-sm text-gray-600">Share your own insight with the community</span>
              <button className="ml-4 inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainDetailPage;
