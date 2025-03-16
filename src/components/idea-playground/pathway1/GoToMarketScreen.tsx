import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SmartSuggestionButton from '../shared/SmartSuggestionButton';

interface GoToMarketScreenProps {
  onUpdateIdea: (id: string, updates: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  getIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Go-to-Market Screen for Pathway 1
 * Allows users to define their marketing strategy and launch plan
 */
const GoToMarketScreen: React.FC<GoToMarketScreenProps> = ({
  onUpdateIdea,
  getIdea,
}) => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { isLoading: aiIsLoading } = useAIContext();

  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [marketingStrategy, setMarketingStrategy] = useState('');
  const [goToMarket, setGoToMarket] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ 
    marketing_strategy?: string; 
    go_to_market?: string 
  }>({});

  // Load the idea data
  useEffect(() => {
    if (ideaId) {
      const loadedIdea = getIdea(ideaId);
      setIdea(loadedIdea);
      
      if (loadedIdea) {
        setMarketingStrategy(loadedIdea.marketing_strategy || '');
        setGoToMarket(loadedIdea.go_to_market || '');
      }
      
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Handle saving the marketing strategy and go-to-market plan
  const handleSave = async () => {
    if (!ideaId) return;
    
    // Validate the form
    const errors: { marketing_strategy?: string; go_to_market?: string } = {};
    if (!marketingStrategy.trim()) {
      errors.marketing_strategy = 'Please describe your marketing strategy';
    }
    if (!goToMarket.trim()) {
      errors.go_to_market = 'Please outline your go-to-market plan';
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
        marketing_strategy: marketingStrategy,
        go_to_market: goToMarket
      });
      
      // Success! Show a completion message and navigate back to the idea playground
      alert('Congratulations! You have completed the idea development process.');
      navigate('/idea-hub/playground');
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle smart suggestions
  const handleMarketingStrategySuggestion = (suggestion: string) => {
    setMarketingStrategy(suggestion);
  };

  const handleGoToMarketSuggestion = (suggestion: string) => {
    setGoToMarket(suggestion);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Define Marketing & Launch Strategy</h1>
        <p className="text-gray-600">
          Outline how you'll reach customers and bring your product to market.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h2 className="font-semibold text-blue-800">{idea.title}</h2>
          <p className="text-blue-700 text-sm mt-1">{idea.description}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="marketing_strategy" className="block text-sm font-medium text-gray-700">
              Marketing Strategy
            </label>
            <SmartSuggestionButton 
              fieldType="strategy"
              currentValue={marketingStrategy}
              onSuggestionSelect={handleMarketingStrategySuggestion}
            />
          </div>
          <textarea
            id="marketing_strategy"
            value={marketingStrategy}
            onChange={(e) => setMarketingStrategy(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.marketing_strategy ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your marketing approach. Which channels will you use to reach customers? What messaging and positioning will you adopt?"
          />
          {validationErrors.marketing_strategy && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.marketing_strategy}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Specify your key marketing channels, consider your messaging strategy, and think about how you'll build your brand.</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="go_to_market" className="block text-sm font-medium text-gray-700">
              Go-to-Market Plan
            </label>
            <SmartSuggestionButton 
              fieldType="strategy"
              currentValue={goToMarket}
              onSuggestionSelect={handleGoToMarketSuggestion}
            />
          </div>
          <textarea
            id="go_to_market"
            value={goToMarket}
            onChange={(e) => setGoToMarket(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.go_to_market ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Outline your launch strategy. How will you roll out your product? What milestones do you need to hit? What resources will you need?"
          />
          {validationErrors.go_to_market && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.go_to_market}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Consider your launch timeline, key milestones, customer acquisition goals, and initial marketing activities.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(`/idea-hub/playground/pathway/1/business-model/${ideaId}`)}
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
            {isSaving ? 'Saving...' : 'Complete & Finish'}
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-green-800 mb-2">Final Step!</h3>
        <p className="text-green-700">
          You're at the final stage of developing your idea. After this, you'll have a fully fleshed out business concept ready for evaluation or implementation.
        </p>
      </div>
    </div>
  );
};

export default GoToMarketScreen;
