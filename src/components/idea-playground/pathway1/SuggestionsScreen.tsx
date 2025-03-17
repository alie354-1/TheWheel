import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../lib/store';
import { useAIContext } from '../../../lib/services/ai/ai-context-provider';
import { ideaPlaygroundService } from '../../../lib/services/idea-playground.service';
import { ideaPathway1AIService } from '../../../lib/services/idea-pathway1-ai.service';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SuggestionCard, { Suggestion } from './SuggestionCard';
import SuggestionEditor from './SuggestionEditor';
import SuggestionMerger from './SuggestionMerger';

/**
 * Screen for displaying and managing AI-generated suggestions
 */
const SuggestionsScreen: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isLoading: aiIsLoading } = useAIContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState<number | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch the idea and generate suggestions
  useEffect(() => {
    const fetchIdeaAndGenerateSuggestions = async () => {
      if (!ideaId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get the idea from localStorage first
        const storedIdeaData = localStorage.getItem('currentIdeaData');
        let fetchedIdea;
        
        if (storedIdeaData) {
          try {
            fetchedIdea = JSON.parse(storedIdeaData);
            console.log('Retrieved idea from localStorage:', fetchedIdea);
          } catch (parseError) {
            console.error('Error parsing idea data from localStorage:', parseError);
          }
        }
        
        // If not found in localStorage, try to fetch from service
        if (!fetchedIdea) {
          fetchedIdea = await ideaPlaygroundService.getIdea(ideaId);
        }
        
        if (!fetchedIdea) {
          throw new Error('Failed to fetch idea');
        }
        
        setIdea(fetchedIdea);
        
        // Generate suggestions
        await generateSuggestions(fetchedIdea);
      } catch (err) {
        console.error('Error fetching idea or generating suggestions:', err);
        setError('Failed to load idea or generate suggestions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIdeaAndGenerateSuggestions();
  }, [ideaId]);
  
  // Generate suggestions based on the idea
  const generateSuggestions = async (ideaData: IdeaPlaygroundIdea) => {
    try {
      setIsGenerating(true);
      
      // Use the AI service to generate suggestions
      const generatedSuggestions = await ideaPathway1AIService.generateCompanySuggestions(
        ideaData,
        user?.id || 'anonymous',
        5 // Generate 5 suggestions
      );
      
      setSuggestions(generatedSuggestions);
      
      // Select the first suggestion by default
      setSelectedSuggestionIndex(0);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (index: number) => {
    setSelectedSuggestionIndex(index);
  };
  
  // Handle editing a suggestion
  const handleEditSuggestion = (index: number) => {
    setEditingSuggestionIndex(index);
  };
  
  // Handle saving an edited suggestion
  const handleSaveEditedSuggestion = (updatedSuggestion: Suggestion) => {
    if (editingSuggestionIndex === null) return;
    
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[editingSuggestionIndex] = updatedSuggestion;
    
    setSuggestions(updatedSuggestions);
    setEditingSuggestionIndex(null);
  };
  
  // Handle regenerating a suggestion
  const handleRegenerateSuggestion = async (index: number) => {
    if (!idea) return;
    
    try {
      setIsGenerating(true);
      const originalSuggestion = suggestions[index];
      
      // Use the AI service to regenerate the suggestion
      const regeneratedSuggestion = await ideaPathway1AIService.regenerateSuggestion(
        originalSuggestion,
        idea,
        user?.id || 'anonymous'
      );
      
      // Update the suggestion in the list
      const updatedSuggestions = [...suggestions];
      updatedSuggestions[index] = regeneratedSuggestion;
      setSuggestions(updatedSuggestions);
      
    } catch (err) {
      console.error('Error regenerating suggestion:', err);
      setError('Failed to regenerate suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle toggling a suggestion for merging
  const handleToggleMergeSuggestion = (index: number) => {
    if (selectedForMerge.includes(index)) {
      setSelectedForMerge(selectedForMerge.filter(i => i !== index));
    } else {
      setSelectedForMerge([...selectedForMerge, index]);
    }
  };
  
  // Handle starting the merge process
  const handleStartMerge = () => {
    if (selectedForMerge.length < 2) {
      alert('Please select at least 2 suggestions to merge.');
      return;
    }
    
    setIsMerging(true);
  };
  
  // Handle saving a merged suggestion
  const handleSaveMergedSuggestion = (mergedSuggestion: Suggestion) => {
    // Add the merged suggestion to the list
    const updatedSuggestions = [...suggestions, mergedSuggestion];
    setSuggestions(updatedSuggestions);
    
    // Select the new merged suggestion
    setSelectedSuggestionIndex(updatedSuggestions.length - 1);
    
    // Reset merge state
    setIsMerging(false);
    setSelectedForMerge([]);
  };
  
  // Handle continuing to the next screen
  const handleContinue = async () => {
    if (selectedSuggestionIndex === null || !idea) return;
    
    try {
      const selectedSuggestion = suggestions[selectedSuggestionIndex];
      
      // In a real implementation, you would update the idea with the selected suggestion
      // For example:
      // await ideaPlaygroundService.updateIdea(idea.id, {
      //   title: selectedSuggestion.title,
      //   description: selectedSuggestion.description,
      //   problem_statement: selectedSuggestion.problem_statement,
      //   solution_concept: selectedSuggestion.solution_concept,
      //   target_audience: selectedSuggestion.target_audience,
      //   unique_value: selectedSuggestion.unique_value,
      //   business_model: selectedSuggestion.business_model,
      //   marketing_strategy: selectedSuggestion.marketing_strategy,
      //   revenue_model: selectedSuggestion.revenue_model,
      //   go_to_market: selectedSuggestion.go_to_market,
      //   market_size: selectedSuggestion.market_size
      // });
      
      // Navigate to the next screen
      navigate(`/idea-hub/playground/pathway/1/problem-solution/${idea.id}`);
    } catch (err) {
      console.error('Error updating idea with selected suggestion:', err);
      setError('Failed to update idea with selected suggestion. Please try again.');
    }
  };
  
  // If editing a suggestion, show the editor
  if (editingSuggestionIndex !== null) {
    return (
      <SuggestionEditor
        suggestion={suggestions[editingSuggestionIndex]}
        onSave={handleSaveEditedSuggestion}
        onCancel={() => setEditingSuggestionIndex(null)}
      />
    );
  }
  
  // If merging suggestions, show the merger
  if (isMerging) {
    const suggestionsToMerge = selectedForMerge.map(index => suggestions[index]);
    
    return (
      <SuggestionMerger
        suggestions={suggestionsToMerge}
        onSave={handleSaveMergedSuggestion}
        onCancel={() => setIsMerging(false)}
      />
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Suggestions</h1>
        <p className="text-gray-600">
          Based on your idea, we've generated several suggestions. 
          Select one to continue, or edit/merge them to create your perfect concept.
        </p>
      </div>
      
      {isLoading || isGenerating ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Loading your idea...' : 'Generating suggestions...'}
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Original Idea Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Your Original Idea</h2>
            <p className="text-gray-700 mb-1"><span className="font-medium">Title:</span> {idea?.title}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Description:</span> {idea?.description}</p>
            {idea?.used_company_context && (
              <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                Using company context
              </div>
            )}
          </div>
          
          {/* Merge Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {selectedForMerge.length === 0 
                  ? 'Select suggestions to merge' 
                  : `${selectedForMerge.length} selected for merging`}
              </span>
              {selectedForMerge.length >= 2 && (
                <button
                  onClick={handleStartMerge}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  Merge Selected
                </button>
              )}
            </div>
            
            {selectedSuggestionIndex !== null && (
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Continue with Selected
              </button>
            )}
          </div>
          
          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="relative">
                {/* Merge Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedForMerge.includes(index)}
                    onChange={() => handleToggleMergeSuggestion(index)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <SuggestionCard
                  suggestion={suggestion}
                  isSelected={selectedSuggestionIndex === index}
                  onSelect={() => handleSelectSuggestion(index)}
                  onEdit={() => handleEditSuggestion(index)}
                  onRegenerate={() => handleRegenerateSuggestion(index)}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate('/idea-hub/playground')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back to Pathways
            </button>
            
            {selectedSuggestionIndex !== null && (
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Continue with Selected
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SuggestionsScreen;
