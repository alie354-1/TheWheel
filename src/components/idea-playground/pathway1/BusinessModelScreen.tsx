import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SmartSuggestionButton from '../shared/SmartSuggestionButton';

interface BusinessModelScreenProps {
  onUpdateIdea: (id: string, updates: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  getIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Business Model Screen for Pathway 1
 * Allows users to define their business model and revenue strategy
 */
const BusinessModelScreen: React.FC<BusinessModelScreenProps> = ({
  onUpdateIdea,
  getIdea,
}) => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { isLoading: aiIsLoading } = useAIContext();

  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [businessModel, setBusinessModel] = useState('');
  const [revenueModel, setRevenueModel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ 
    business_model?: string; 
    revenue_model?: string 
  }>({});

  // Load the idea data
  useEffect(() => {
    if (ideaId) {
      const loadedIdea = getIdea(ideaId);
      setIdea(loadedIdea);
      
      if (loadedIdea) {
        setBusinessModel(loadedIdea.business_model || '');
        setRevenueModel(loadedIdea.revenue_model || '');
      }
      
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Handle saving the business model and revenue model
  const handleSave = async () => {
    if (!ideaId) return;
    
    // Validate the form
    const errors: { business_model?: string; revenue_model?: string } = {};
    if (!businessModel.trim()) {
      errors.business_model = 'Please describe your business model';
    }
    if (!revenueModel.trim()) {
      errors.revenue_model = 'Please outline your revenue model';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Reset validation errors
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      await onUpdateIdea(ideaId, {
        business_model: businessModel,
        revenue_model: revenueModel
      });
      // Navigate to the next screen
      navigate(`/idea-hub/playground/pathway/1/go-to-market/${ideaId}`);
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle smart suggestions
  const handleBusinessModelSuggestion = (suggestion: string) => {
    setBusinessModel(suggestion);
  };

  const handleRevenueModelSuggestion = (suggestion: string) => {
    setRevenueModel(suggestion);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-r-transparent rounded-full"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800">Idea not found</h2>
        <p className="mt-2 text-gray-600">The idea you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/idea-hub/playground')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Playground
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Define Business & Revenue Model</h1>
        <p className="text-gray-600">
          Outline how your business will operate and generate revenue.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h2 className="font-semibold text-blue-800">{idea.title}</h2>
          <p className="text-blue-700 text-sm mt-1">{idea.description}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="business_model" className="block text-sm font-medium text-gray-700">
              Business Model
            </label>
            <SmartSuggestionButton 
              fieldType="model"
              currentValue={businessModel}
              onSuggestionSelect={handleBusinessModelSuggestion}
            />
          </div>
          <textarea
            id="business_model"
            value={businessModel}
            onChange={(e) => setBusinessModel(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.business_model ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe how your business will create, deliver, and capture value. Include your key activities, resources, and partnerships."
          />
          {validationErrors.business_model && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.business_model}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Consider your cost structure, key resources needed, and how you'll deliver value to customers.</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="revenue_model" className="block text-sm font-medium text-gray-700">
              Revenue Model
            </label>
            <SmartSuggestionButton 
              fieldType="model"
              currentValue={revenueModel}
              onSuggestionSelect={handleRevenueModelSuggestion}
            />
          </div>
          <textarea
            id="revenue_model"
            value={revenueModel}
            onChange={(e) => setRevenueModel(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.revenue_model ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Explain how your business will make money. Describe your pricing strategy, revenue streams, and unit economics if applicable."
          />
          {validationErrors.revenue_model && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.revenue_model}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Be specific about your pricing model, payment structure (subscription, one-time, etc.), and expected margins.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(`/idea-hub/playground/pathway/1/target-value/${ideaId}`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || aiIsLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
              isSaving || aiIsLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelScreen;
