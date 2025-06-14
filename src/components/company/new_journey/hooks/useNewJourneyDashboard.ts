import { useState, useEffect } from 'react';

export interface DomainProgress {
  id: string;
  name: string;
  percentage: number;
}

export interface RecommendedStep {
  id: string;
  name: string;
  domain: {
    id: string;
    name: string;
  };
  phase: {
    id: string;
    name: string;
  };
  reasoning: string;
}

export interface PeerInsight {
  id: string;
  type: 'recommendation' | 'milestone' | 'contribution';
  title: string;
  description: string;
  author: string;
  createdAt: string;
  upvotes?: number;
}

/**
 * Hook to fetch and manage the dashboard data for the journey system.
 */
const useNewJourneyDashboard = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressByDomain, setProgressByDomain] = useState<DomainProgress[]>([]);
  const [recommendedStep, setRecommendedStep] = useState<RecommendedStep | null>(null);
  const [peerInsights, setPeerInsights] = useState<PeerInsight[]>([]);

  // Extract fetchDashboardData function to make it reusable
  const fetchDashboardData = async (showLoading = true) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Only show loading state on initial fetch or when explicitly requested
      if (showLoading) {
        setIsLoading(true);
      }
      
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock domain progress
      const mockProgress: DomainProgress[] = [
        { id: 'domain-1', name: 'Strategy', percentage: 80 },
        { id: 'domain-2', name: 'Product', percentage: 60 },
        { id: 'domain-3', name: 'Marketing', percentage: 40 },
        { id: 'domain-4', name: 'Sales', percentage: 30 },
        { id: 'domain-5', name: 'Finance', percentage: 50 },
        { id: 'domain-6', name: 'Legal', percentage: 90 },
        { id: 'domain-7', name: 'Operations', percentage: 20 },
        { id: 'domain-8', name: 'Team', percentage: 45 }
      ];
      
      // Mock recommended step
      const mockRecommendedStep: RecommendedStep = {
        id: 'step-2',
        name: 'Conduct Market Research',
        domain: { id: 'domain-2', name: 'Product' },
        phase: { id: 'phase-2', name: 'Validation' },
        reasoning: 'Based on your completion of Vision & Mission, your next logical step is to validate your market assumptions through research. This is a critical step for ensuring product-market fit.'
      };
      
      // Mock peer insights
      const mockPeerInsights: PeerInsight[] = [
        {
          id: 'insight-1',
          type: 'recommendation',
          title: 'Use customer interviews for deeper insights',
          description: 'We found that conducting at least 10 customer interviews provided much richer data than just using surveys.',
          author: 'SaaS Founder',
          createdAt: '2025-06-01T15:30:00Z',
          upvotes: 24
        },
        {
          id: 'insight-2',
          type: 'milestone',
          title: 'Completed our first MVP in 6 weeks',
          description: 'By focusing on core features only and using a low-code platform, we were able to launch our first MVP in just 6 weeks.',
          author: 'FinTech Founder',
          createdAt: '2025-05-28T10:15:00Z',
          upvotes: 18
        },
        {
          id: 'insight-3',
          type: 'contribution',
          title: 'Pricing strategy template',
          description: 'I\'ve uploaded a pricing strategy template that helped us model different scenarios before launch.',
          author: 'E-commerce Founder',
          createdAt: '2025-05-15T09:45:00Z',
          upvotes: 32
        }
      ];
      
      setProgressByDomain(mockProgress);
      setRecommendedStep(mockRecommendedStep);
      setPeerInsights(mockPeerInsights);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with loading indicator
    fetchDashboardData(true);
    
    // Set up polling interval (every 45 seconds)
    const pollingInterval = setInterval(() => {
      fetchDashboardData(false); // Don't show loading indicator on polling updates
    }, 45000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [userId]);

  const startRecommendedStep = async (): Promise<boolean> => {
    if (!recommendedStep) return false;
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just simulate success
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Started recommended step ${recommendedStep.id}`);
      return true;
    } catch (err) {
      console.error('Error starting recommended step:', err);
      setError('Failed to start step. Please try again later.');
      return false;
    }
  };

  return {
    isLoading,
    error,
    progressByDomain,
    recommendedStep,
    peerInsights,
    startRecommendedStep,
    refreshDashboard: () => fetchDashboardData(true) // Expose refresh function with loading indicator
  };
};

export { useNewJourneyDashboard };
