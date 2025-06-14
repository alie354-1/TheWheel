import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Skeleton } from '../ui';
import { ExpertRecommendationPanel } from './ExpertRecommendationPanel';
import { TemplateRecommendationPanel } from './TemplateRecommendationPanel';
import { PeerInsightsPanel } from './PeerInsightsPanel';

// Mock data and services for demo
const useCompany = () => {
  return { 
    company: { 
      id: 'company-1', 
      name: 'Acme Inc.', 
      stage: 'seed',
      industry: 'technology'
    } 
  };
};

interface Step {
  id: string;
  title: string;
  description: string;
  phase: string;
  order: number;
  estimatedTime: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources?: {
    articles?: { id: string; title: string; url: string }[];
    videos?: { id: string; title: string; url: string }[];
    tools?: { id: string; name: string; url: string }[];
  };
}

const mockFetchStep = async (stepId: string): Promise<Step> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: stepId,
    title: 'Create Your Minimum Viable Product',
    description: 'Build the simplest version of your product that solves the core problem for your customers. Focus on the essential features that deliver the most value.',
    phase: 'Build',
    order: 3,
    estimatedTime: '2-4 weeks',
    status: 'not_started',
    resources: {
      articles: [
        { id: 'a1', title: 'The Lean MVP Guide', url: '/resources/articles/lean-mvp-guide' },
        { id: 'a2', title: 'Validating Your MVP', url: '/resources/articles/validating-mvp' }
      ],
      videos: [
        { id: 'v1', title: 'MVP in 2 Weeks', url: '/resources/videos/mvp-in-2-weeks' }
      ],
      tools: [
        { id: 't1', name: 'Feature Prioritization Template', url: '/resources/tools/feature-prioritization' }
      ]
    }
  };
};

export const JourneyStepPage: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const { company } = useCompany();
  
  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStepData = async () => {
      if (!stepId) {
        setError('Step ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const stepData = await mockFetchStep(stepId);
        setStep(stepData);
      } catch (err) {
        console.error('Error fetching step data:', err);
        setError('Failed to load step data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, [stepId]);
  
  const handleStartStep = () => {
    // In a real app, this would update the step status in the database
    if (step) {
      setStep({ ...step, status: 'in_progress' });
    }
  };
  
  const handleCompleteStep = () => {
    // In a real app, this would update the step status in the database
    if (step) {
      setStep({ ...step, status: 'completed' });
    }
  };
  
  const handleBackToJourney = () => {
    navigate('/journey');
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToJourney}
            className="mb-4"
          >
            ← Back to Journey
          </Button>
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !step) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={handleBackToJourney}
          className="mb-4"
        >
          ← Back to Journey
        </Button>
        
        <Card className="p-6 bg-red-50 border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Step</h2>
          <p className="text-red-600">{error || 'Step not found'}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={handleBackToJourney}
        className="mb-4"
      >
        ← Back to Journey
      </Button>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{step.title}</h1>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">Phase: {step.phase}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              step.status === 'completed' ? 'bg-green-100 text-green-800' :
              step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {step.status === 'completed' ? 'Completed' :
               step.status === 'in_progress' ? 'In Progress' :
               'Not Started'}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mt-2">{step.description}</p>
        <div className="flex items-center mt-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimated time: {step.estimatedTime}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step Details</h2>
            
            <div className="prose max-w-none">
              <h3>What you'll accomplish</h3>
              <p>
                In this step, you'll create a Minimum Viable Product (MVP) that focuses on solving the core problem for your customers. 
                Your MVP should include only the essential features needed to deliver value and gather meaningful feedback.
              </p>
              
              <h3>Key activities</h3>
              <ul>
                <li>Prioritize features based on customer value and development effort</li>
                <li>Create a development plan with clear milestones</li>
                <li>Build the core functionality of your product</li>
                <li>Prepare for initial user testing</li>
              </ul>
              
              <h3>Success criteria</h3>
              <ul>
                <li>A working MVP that demonstrates your core value proposition</li>
                <li>A plan for gathering user feedback</li>
                <li>Documentation of key learnings and next steps</li>
              </ul>
            </div>
            
            {step.resources && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium mb-3">Resources</h3>
                
                {step.resources.articles && step.resources.articles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Articles</h4>
                    <ul className="space-y-1">
                      {step.resources.articles.map(article => (
                        <li key={article.id}>
                          <a 
                            href={article.url} 
                            className="text-blue-600 hover:underline"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {article.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.resources.videos && step.resources.videos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Videos</h4>
                    <ul className="space-y-1">
                      {step.resources.videos.map(video => (
                        <li key={video.id}>
                          <a 
                            href={video.url} 
                            className="text-blue-600 hover:underline"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {video.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.resources.tools && step.resources.tools.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Tools</h4>
                    <ul className="space-y-1">
                      {step.resources.tools.map(tool => (
                        <li key={tool.id}>
                          <a 
                            href={tool.url} 
                            className="text-blue-600 hover:underline"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {tool.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              {step.status === 'not_started' ? (
                <Button onClick={handleStartStep} className="w-full">
                  Start This Step
                </Button>
              ) : step.status === 'in_progress' ? (
                <Button onClick={handleCompleteStep} className="w-full">
                  Mark as Completed
                </Button>
              ) : (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        You've completed this step!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <TemplateRecommendationPanel stepId={step.id} companyId={company.id} />
          
          <PeerInsightsPanel stepId={step.id} companyId={company.id} />
        </div>
        
        <div className="space-y-6">
          <ExpertRecommendationPanel stepId={step.id} companyId={company.id} />
          
          <Card className="p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Stuck on this step? Schedule a call with one of our startup advisors for personalized guidance.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/support/schedule'}
            >
              Schedule a Call
            </Button>
          </Card>
          
          <Card className="p-4 shadow-md bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Track Your Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-blue-800">Overall Journey</span>
                  <span className="text-blue-700">12/30 steps</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-blue-800">Current Phase</span>
                  <span className="text-blue-700">3/8 steps</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '37.5%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/journey/progress'}
              >
                View Full Progress
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
