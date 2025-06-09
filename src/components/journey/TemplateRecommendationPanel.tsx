import React, { useEffect, useState } from 'react';
import { recommendationService, TemplateRecommendation } from '../../lib/services/recommendation';
import { Card, Button, Skeleton, Badge } from '../ui';

interface TemplateRecommendationPanelProps {
  stepId: string;
  companyId: string;
}

export const TemplateRecommendationPanel: React.FC<TemplateRecommendationPanelProps> = ({ 
  stepId, 
  companyId 
}) => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const recommendations = await recommendationService.getStepRecommendations(companyId, stepId);
        setTemplates(recommendations.templateRecommendations.slice(0, 3)); // Show top 3 templates
      } catch (err) {
        console.error('Error fetching template recommendations:', err);
        setError('Failed to load template recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && stepId) {
      fetchRecommendations();
    }
  }, [companyId, stepId]);

  const handleUseTemplate = (templateId: string, type: 'deck' | 'document' | 'tool') => {
    // Navigate to template usage page
    window.location.href = `/${type}s/use/${templateId}?step=${stepId}&source=journey`;
  };

  const handlePreviewTemplate = (templateId: string, type: 'deck' | 'document' | 'tool', previewUrl?: string) => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      // Navigate to template preview page
      window.location.href = `/${type}s/preview/${templateId}?step=${stepId}&source=journey`;
    }
  };

  if (loading) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Template Recommendations</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-24 w-32 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
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
        <h3 className="text-lg font-semibold mb-4">Template Recommendations</h3>
        <div className="bg-red-50 p-3 rounded-md text-red-600">
          {error}
        </div>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Template Recommendations</h3>
        <div className="text-center py-6 text-gray-500">
          <p>No template recommendations available for this step yet.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = '/templates?source=journey'}
          >
            Browse All Templates
          </Button>
        </div>
      </Card>
    );
  }

  const getTypeLabel = (type: 'deck' | 'document' | 'tool') => {
    switch (type) {
      case 'deck':
        return 'Pitch Deck';
      case 'document':
        return 'Document';
      case 'tool':
        return 'Tool';
      default:
        return 'Resource';
    }
  };

  return (
    <Card className="p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Template Recommendations</h3>
        <Button 
          variant="link" 
          className="text-sm"
          onClick={() => window.location.href = '/templates?source=journey'}
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.templateId} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50">
            <div className="h-24 w-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
              {template.type === 'deck' ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              ) : template.type === 'document' ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm0 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V2zm2 1h6v8H7V3zm8 11a1 1 0 01-1 1H6a1 1 0 110-2h8a1 1 0 011 1z" clipRule="evenodd" />
                  <path d="M7 16a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zM9 15a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h4 className="font-medium truncate">{template.name || `Untitled ${getTypeLabel(template.type)}`}</h4>
                <Badge variant="outline" className="ml-2 text-xs">
                  {getTypeLabel(template.type)}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {template.description || `A ${template.type} template for this step`}
              </p>
              
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {(template.relevanceScore * 5).toFixed(1)}
                </span>
                
                <span className="ml-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {template.usageRate} uses
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                onClick={() => handleUseTemplate(template.templateId, template.type)}
              >
                Use
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handlePreviewTemplate(template.templateId, template.type, template.previewUrl)}
              >
                Preview
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3">
          Using proven templates can save you time and improve your results for this step.
        </p>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/templates/search?step=' + stepId}
        >
          Find More Templates
        </Button>
      </div>
    </Card>
  );
};
