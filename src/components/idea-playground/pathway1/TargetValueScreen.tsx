import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SmartSuggestionButton from '../shared/SmartSuggestionButton';

interface TargetValueScreenProps {
  onUpdateIdea: (id: string, updates: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  getIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Target Audience & Value Proposition Screen for Pathway 1
 * Allows users to define who their solution is for and what unique value it provides
 */
const TargetValueScreen: React.FC<TargetValueScreenProps> = ({
  onUpdateIdea,
  getIdea,
}) => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { isLoading: aiIsLoading } = useAIContext();

  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [targetAudience, setTargetAudience] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ 
    target_audience?: string; 
    unique_value?: string 
  }>({});

  // Load the idea data
  useEffect(() => {
    if (ideaId) {
      const loadedIdea = getIdea(ideaId);
      setIdea(loadedIdea);
      
      if (loadedIdea) {
        setTargetAudience(loadedIdea.target_audience || '');
        setUniqueValue(loadedIdea.unique_value || '');
      }
      
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Handle saving the target audience and value proposition
  const handleSave = async () => {
    if (!ideaId) return;
    
    // Validate the form
    const errors: { target_audience?: string; unique_value?: string } = {};
    if (!targetAudience.trim()) {
      errors.target_audience = 'Please describe your target audience';
    }
    if (!uniqueValue.trim()) {
      errors.unique_value = 'Please explain your unique value proposition';
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
        target_audience: targetAudience,
        unique_value: uniqueValue
      });
      // Navigate to the next screen
      navigate(`/idea-hub/playground/pathway/1/business-model/${ideaId}`);
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle smart suggestions
  const handleAudienceSuggestion = (suggestion: string) => {
    setTargetAudience(suggestion);
  };

  const handleValueSuggestion = (suggestion: string) => {
    setUniqueValue(suggestion);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Define Target Audience & Value</h1>
        <p className="text-gray-600">
          Identify who your solution is for and why they should care about it.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h2 className="font-semibold text-blue-800">{idea.title}</h2>
          <p className="text-blue-700 text-sm mt-1">{idea.description}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
              Who is your target audience?
            </label>
            <SmartSuggestionButton 
              fieldType="audience"
              currentValue={targetAudience}
              onSuggestionSelect={handleAudienceSuggestion}
            />
          </div>
          <textarea
            id="target_audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.target_audience ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your ideal customers or users. Be specific about demographics, behaviors, and needs."
          />
          {validationErrors.target_audience && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.target_audience}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Focus on specific demographics, behaviors, pain points, and decision-making factors of your audience.</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="unique_value" className="block text-sm font-medium text-gray-700">
              What unique value do you provide?
            </label>
            <SmartSuggestionButton 
              fieldType="value"
              currentValue={uniqueValue}
              onSuggestionSelect={handleValueSuggestion}
            />
          </div>
          <textarea
            id="unique_value"
            value={uniqueValue}
            onChange={(e) => setUniqueValue(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.unique_value ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Explain the unique benefits your solution offers and why your target audience would choose it over alternatives."
          />
          {validationErrors.unique_value && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.unique_value}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Highlight the specific benefits your solution provides, focus on what makes your approach unique, and connect directly to your audience's needs.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(`/idea-hub/playground/pathway/1/problem-solution/${ideaId}`)}
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

export default TargetValueScreen;
