import { useState, useEffect } from 'react';
import { BusinessStatusAIService } from '../../../../lib/services/ai/businessStatusAI.service';
import { DomainActivity } from '../components/BusinessStatusWidget';

interface DomainStep {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  timeEstimate: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface DomainTask {
  id: string;
  stepId: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  timeEstimate: string;
}

interface DomainResource {
  id: string;
  type: 'article' | 'video' | 'template' | 'tool';
  name: string;
  description: string;
  url: string;
  relevance: 'direct' | 'related' | 'supplementary';
}

interface CommunityInsight {
  id: string;
  type: 'tip' | 'warning' | 'success_story';
  content: string;
  source: 'founder' | 'expert' | 'data';
  relevance: number; // 0-100
}

interface DomainDetails {
  domain: DomainActivity;
  steps: DomainStep[];
  tasks: DomainTask[];
  resources: DomainResource[];
  insights: CommunityInsight[];
  loading: boolean;
  error: string | null;
  refreshDomainDetails?: () => Promise<void>;
}

export function useDomainDetails(domainName: string, companyJourneyId: string): DomainDetails {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState<DomainActivity | null>(null);
  const [steps, setSteps] = useState<DomainStep[]>([]);
  const [tasks, setTasks] = useState<DomainTask[]>([]);
  const [resources, setResources] = useState<DomainResource[]>([]);
  const [insights, setInsights] = useState<CommunityInsight[]>([]);

  // Extract fetchDomainDetails function to make it reusable
  const fetchDomainDetails = async (showLoading = true) => {
    if (!domainName) {
      return;
    }

    try {
      // Only show loading state on initial fetch or when explicitly requested
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch domain info from BusinessStatusAIService
      const businessStatus = await BusinessStatusAIService.getBusinessStatusAnalysis(companyJourneyId);
      
      // Find the domain in either active or background domains
      const domainData = 
        businessStatus.activeDomains.find(d => d.domain === domainName) || 
        businessStatus.backgroundDomains.find(d => d.domain === domainName);
      
      if (!domainData) {
        throw new Error(`Domain ${domainName} not found`);
      }
      
      setDomain(domainData);
      
      // Generate mock data based on domain name
      const mockSteps = generateMockSteps(domainName);
      const mockTasks = generateMockTasks(domainName, mockSteps);
      const mockResources = generateMockResources(domainName);
      const mockInsights = generateMockInsights(domainName);
      
      setSteps(mockSteps);
      setTasks(mockTasks);
      setResources(mockResources);
      setInsights(mockInsights);
      
    } catch (err) {
      console.error('Error fetching domain details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up polling for domain details
  useEffect(() => {
    // Initial fetch with loading indicator
    fetchDomainDetails(true);
    
    // Set up polling interval (every 40 seconds)
    const pollingInterval = setInterval(() => {
      fetchDomainDetails(false); // Don't show loading indicator on polling updates
    }, 40000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [domainName, companyJourneyId]);
  
  // Helper functions to generate mock data
  function generateMockSteps(domain: string): DomainStep[] {
    return [
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-step-1`,
        name: domain === 'Customer Research' ? 'Conduct Customer Interviews' :
              domain === 'Product Development' ? 'Build MVP Features' :
              domain === 'Marketing Strategy' ? 'Define Target Audience' :
              domain === 'Operations' ? 'Set Up Basic Operations' :
              domain === 'Legal' ? 'Establish Legal Entity' :
              'Prepare Fundraising Materials',
        description: `This is the first step in ${domain}. It's essential to establish a strong foundation.`,
        status: 'in_progress',
        timeEstimate: '2-4 weeks',
        difficulty: 'intermediate',
        importance: 'high'
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-step-2`,
        name: domain === 'Customer Research' ? 'Analyze Feedback Patterns' :
              domain === 'Product Development' ? 'Test Core Features' :
              domain === 'Marketing Strategy' ? 'Create Marketing Plan' :
              domain === 'Operations' ? 'Implement Basic Processes' :
              domain === 'Legal' ? 'File Initial Patents/Trademarks' :
              'Prepare Pitch Deck',
        description: `This step builds on your initial ${domain.toLowerCase()} work and helps refine your approach.`,
        status: 'not_started',
        timeEstimate: '1-2 weeks',
        difficulty: 'intermediate',
        importance: 'medium'
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-step-3`,
        name: domain === 'Customer Research' ? 'Create Persona Documents' :
              domain === 'Product Development' ? 'Optimize Performance' :
              domain === 'Marketing Strategy' ? 'Launch Initial Campaign' :
              domain === 'Operations' ? 'Document Workflows' :
              domain === 'Legal' ? 'Draft Customer Agreements' :
              'Investor Outreach Strategy',
        description: `This step helps solidify your ${domain.toLowerCase()} strategy and prepare for scaling.`,
        status: 'not_started',
        timeEstimate: '1-3 weeks',
        difficulty: 'advanced',
        importance: 'high'
      }
    ];
  }
  
  function generateMockTasks(domain: string, steps: DomainStep[]): DomainTask[] {
    return [
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-task-1`,
        stepId: steps[0].id,
        name: domain === 'Customer Research' ? 'Create Interview Script' :
              domain === 'Product Development' ? 'Define Core Features' :
              domain === 'Marketing Strategy' ? 'Research Competitor Audiences' :
              domain === 'Operations' ? 'Set Up Project Management Tool' :
              domain === 'Legal' ? 'Select Legal Structure' :
              'Create Investor List',
        description: `First task in ${steps[0].name}`,
        status: 'completed',
        timeEstimate: '2-3 days'
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-task-2`,
        stepId: steps[0].id,
        name: domain === 'Customer Research' ? 'Schedule 5 Interviews' :
              domain === 'Product Development' ? 'Create Technical Specs' :
              domain === 'Marketing Strategy' ? 'Define Audience Demographics' :
              domain === 'Operations' ? 'Define Basic Workflow' :
              domain === 'Legal' ? 'File Formation Documents' :
              'Research Potential Investors',
        description: `Second task in ${steps[0].name}`,
        status: 'in_progress',
        timeEstimate: '1 week'
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-task-3`,
        stepId: steps[0].id,
        name: domain === 'Customer Research' ? 'Conduct Interviews' :
              domain === 'Product Development' ? 'Implement Basic Functionality' :
              domain === 'Marketing Strategy' ? 'Create Audience Personas' :
              domain === 'Operations' ? 'Document Core Processes' :
              domain === 'Legal' ? 'Open Business Bank Account' :
              'Draft Executive Summary',
        description: `Third task in ${steps[0].name}`,
        status: 'not_started',
        timeEstimate: '1-2 weeks'
      }
    ];
  }
  
  function generateMockResources(domain: string): DomainResource[] {
    return [
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-resource-1`,
        type: 'article',
        name: `Guide to ${domain} for Startups`,
        description: `A comprehensive guide to ${domain.toLowerCase()} specifically for early-stage startups.`,
        url: '#',
        relevance: 'direct'
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-resource-2`,
        type: 'template',
        name: domain === 'Customer Research' ? 'Interview Template' :
              domain === 'Product Development' ? 'Product Spec Template' :
              domain === 'Marketing Strategy' ? 'Marketing Plan Template' :
              domain === 'Operations' ? 'Process Documentation Template' :
              domain === 'Legal' ? 'Legal Checklist' :
              'Pitch Deck Template',
        description: `A ready-to-use template for your ${domain.toLowerCase()} work.`,
        url: '#',
        relevance: 'direct'
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-resource-3`,
        type: 'tool',
        name: domain === 'Customer Research' ? 'Survey Tool Recommendation' :
              domain === 'Product Development' ? 'Development Tools' :
              domain === 'Marketing Strategy' ? 'Marketing Analytics Tools' :
              domain === 'Operations' ? 'Workflow Management Tools' :
              domain === 'Legal' ? 'Document Management Tools' :
              'Investor CRM Tools',
        description: `Recommended tools for effective ${domain.toLowerCase()}.`,
        url: '#',
        relevance: 'supplementary'
      }
    ];
  }
  
  function generateMockInsights(domain: string): CommunityInsight[] {
    return [
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-insight-1`,
        type: 'tip',
        content: domain === 'Customer Research' ? 'Always ask open-ended questions in interviews.' :
                domain === 'Product Development' ? 'Start with a minimal viable feature set and iterate.' :
                domain === 'Marketing Strategy' ? 'Test multiple channels before committing budget.' :
                domain === 'Operations' ? 'Document processes as you create them, not after.' :
                domain === 'Legal' ? 'Get founder agreements in writing early, even with friends.' :
                'Research investors before reaching out to ensure fit.',
        source: 'founder',
        relevance: 95
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-insight-2`,
        type: 'warning',
        content: domain === 'Customer Research' ? 'Avoid leading questions that bias responses.' :
                domain === 'Product Development' ? 'Don\'t overengineer early versions of your product.' :
                domain === 'Marketing Strategy' ? 'Avoid spreading budget too thin across many channels.' :
                domain === 'Operations' ? 'Don\'t create processes that are too rigid for a startup.' :
                domain === 'Legal' ? 'Don\'t use generic templates without legal review.' :
                'Don\'t approach investors without warm introductions when possible.',
        source: 'expert',
        relevance: 90
      },
      {
        id: `${domain.toLowerCase().replace(/\s+/g, '-')}-insight-3`,
        type: 'success_story',
        content: `"Our ${domain.toLowerCase()} strategy helped us grow 3x faster than expected. We focused on ${
          domain === 'Customer Research' ? 'truly understanding user pain points' :
          domain === 'Product Development' ? 'solving one problem exceptionally well' :
          domain === 'Marketing Strategy' ? 'content marketing that addressed customer questions' :
          domain === 'Operations' ? 'automating repetitive tasks early' :
          domain === 'Legal' ? 'proper IP protection from day one' :
          'targeting investors with domain expertise'
        } which made all the difference."`,
        source: 'founder',
        relevance: 85
      }
    ];
  }
  
  return {
    domain: domain as DomainActivity,
    steps,
    tasks,
    resources,
    insights,
    loading,
    error,
    refreshDomainDetails: () => fetchDomainDetails(true) // Expose refresh function with loading indicator
  };
}

export type { DomainStep, DomainTask, DomainResource, CommunityInsight, DomainDetails };
