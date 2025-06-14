import React, { useEffect, useState } from 'react';
import { recommendationService, ExpertRecommendation } from '../../lib/services/recommendation';
import { Avatar, Button, Card, Skeleton, Badge } from '../ui';

// Mock auth hook for demo
const useAuth = () => ({ user: { id: 'mock-user-id' } });

interface ExpertRecommendationPanelProps {
  stepId: string;
  companyId: string;
}

export const ExpertRecommendationPanel: React.FC<ExpertRecommendationPanelProps> = ({ 
  stepId, 
  companyId 
}) => {
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<ExpertRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const recommendations = await recommendationService.getStepRecommendations(companyId, stepId);
        setExperts(recommendations.expertRecommendations.slice(0, 3)); // Show top 3 experts
      } catch (err) {
        console.error('Error fetching expert recommendations:', err);
        setError('Failed to load expert recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && stepId) {
      fetchRecommendations();
    }
  }, [companyId, stepId]);

  const handleConnectClick = (expertId: string) => {
    // Navigate to expert connection page
    window.location.href = `/community/experts/connect/${expertId}?step=${stepId}&source=journey`;
  };

  const handleViewProfile = (expertId: string) => {
    // Navigate to expert profile page
    window.location.href = `/community/experts/profile/${expertId}?step=${stepId}&source=journey`;
  };

  if (loading) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Expert Recommendations</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Expert Recommendations</h3>
        <div className="bg-red-50 p-3 rounded-md text-red-600">
          {error}
        </div>
      </Card>
    );
  }

  if (experts.length === 0) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Expert Recommendations</h3>
        <div className="text-center py-6 text-gray-500">
          <p>No expert recommendations available for this step yet.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = '/community/experts?source=journey'}
          >
            Browse All Experts
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Expert Recommendations</h3>
        <Button 
          variant="link" 
          className="text-sm"
          onClick={() => window.location.href = '/community/experts?source=journey'}
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {experts.map((expert) => (
          <div key={expert.expertId} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50">
            <Avatar 
              src={`/api/avatar/${expert.expertId}`} 
              fallback={expert.name?.[0] || 'E'} 
              className="h-12 w-12"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h4 className="font-medium truncate">{expert.name || 'Expert'}</h4>
                <Badge variant="outline" className="ml-2 text-xs">
                  {expert.successRate >= 0.8 ? 'Top Rated' : 'Recommended'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {expert.specialization?.join(', ') || 'Startup Expert'}
              </p>
              
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {(expert.successRate * 5).toFixed(1)}
                </span>
                
                {expert.avgCompletionTime && (
                  <span className="ml-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {expert.avgCompletionTime} days avg.
                  </span>
                )}
                
                {expert.pricePoint && (
                  <span className="ml-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${expert.pricePoint}/hr
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                onClick={() => handleConnectClick(expert.expertId)}
              >
                Connect
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleViewProfile(expert.expertId)}
              >
                Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3">
          Working with an expert can help you complete this step faster and with better results.
        </p>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/community/experts/search?step=' + stepId}
        >
          Find More Experts
        </Button>
      </div>
    </Card>
  );
};
