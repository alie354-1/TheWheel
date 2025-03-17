import React, { useState, useEffect } from 'react';
import { Suggestion } from './SuggestionCard';
import { useAuthStore } from '../../../lib/store';
import { ideaPathway1AIService } from '../../../lib/services/idea-pathway1-ai.service';

interface SuggestionMergerProps {
  suggestions: Suggestion[];
  onSave: (mergedSuggestion: Suggestion) => void;
  onCancel: () => void;
}

/**
 * Component for merging multiple suggestions into a single concept
 */
const SuggestionMerger: React.FC<SuggestionMergerProps> = ({
  suggestions,
  onSave,
  onCancel
}) => {
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate default merged suggestion by combining elements from all suggestions
  const generateInitialMerged = (): Suggestion => {
    // Start with the first suggestion as a base
    const baseSuggestion = suggestions[0];
    
    return {
      title: `${baseSuggestion.title} (Merged Concept)`,
      description: baseSuggestion.description,
      problem_statement: baseSuggestion.problem_statement,
      solution_concept: baseSuggestion.solution_concept,
      target_audience: baseSuggestion.target_audience,
      unique_value: baseSuggestion.unique_value,
      business_model: baseSuggestion.business_model || '',
      marketing_strategy: baseSuggestion.marketing_strategy || '',
      revenue_model: baseSuggestion.revenue_model || '',
      go_to_market: baseSuggestion.go_to_market || '',
      market_size: baseSuggestion.market_size || '',
      competition: baseSuggestion.competition || [],
      revenue_streams: baseSuggestion.revenue_streams || [],
      cost_structure: baseSuggestion.cost_structure || [],
      key_metrics: baseSuggestion.key_metrics || []
    };
  };
  
  const [mergedSuggestion, setMergedSuggestion] = useState<Suggestion>(generateInitialMerged());
  const [activeField, setActiveField] = useState<keyof Suggestion>('title');
  
  // Reset merged suggestion and generate AI suggested merge when input suggestions change
  useEffect(() => {
    // Start with a basic merged suggestion
    setMergedSuggestion(generateInitialMerged());
    
    // Generate AI-powered merged suggestion
    const generateAIMergedSuggestion = async () => {
      if (suggestions.length < 2) return;
      
      try {
        setIsGenerating(true);
        setError(null);
        
        // Call the AI service to generate a merged suggestion
        const aiMergedSuggestion = await ideaPathway1AIService.mergeSuggestions(
          suggestions,
          user?.id || 'anonymous'
        );
        
        // Update the merged suggestion with the AI-generated one
        setMergedSuggestion(aiMergedSuggestion);
      } catch (err) {
        console.error('Error generating AI-merged suggestion:', err);
        setError('Failed to generate AI-merged suggestion. Using basic merge instead.');
        // Keep using the basic merged suggestion if AI fails
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateAIMergedSuggestion();
  }, [suggestions, user?.id]);
  
  // Handle selecting a value from a specific suggestion
  const selectValueFromSuggestion = (field: keyof Suggestion, suggestionIndex: number) => {
    const value = suggestions[suggestionIndex][field];
    
    if (value !== undefined) {
      setMergedSuggestion(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Handle direct changes to fields
  const handleFieldChange = (field: keyof Suggestion, value: string | string[]) => {
    setMergedSuggestion(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle array-type field changes
  const handleArrayChange = (field: keyof Suggestion, value: string) => {
    const items = value.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    handleFieldChange(field, items);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(mergedSuggestion);
  };
  
  // Generate a combined unique list from all suggestions for a given field
  const getCombinedList = (field: keyof Suggestion): string[] => {
    const allItems: string[] = [];
    
    suggestions.forEach(suggestion => {
      const items = suggestion[field];
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (!allItems.includes(item)) {
            allItems.push(item);
          }
        });
      }
    });
    
    return allItems;
  };
  
  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Merge Suggestions</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Source Suggestions */}
        <div className="lg:col-span-2 border-r pr-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Source Suggestions</h3>
          
          <div className="space-y-6">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h4 className="font-medium text-gray-900 mb-2">Suggestion {index + 1}: {suggestion.title}</h4>
                
                <div className="space-y-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => selectValueFromSuggestion('title', index)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Use Title
                    </button>
                    <p className="text-sm text-gray-700 truncate">{suggestion.title}</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => selectValueFromSuggestion('description', index)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Use Description
                    </button>
                    <p className="text-sm text-gray-700 line-clamp-2">{suggestion.description}</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => selectValueFromSuggestion('problem_statement', index)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Use Problem Statement
                    </button>
                    <p className="text-sm text-gray-700 line-clamp-2">{suggestion.problem_statement}</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => selectValueFromSuggestion('solution_concept', index)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Use Solution Concept
                    </button>
                    <p className="text-sm text-gray-700 line-clamp-2">{suggestion.solution_concept}</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => selectValueFromSuggestion('target_audience', index)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Use Target Audience
                    </button>
                    <p className="text-sm text-gray-700 line-clamp-2">{suggestion.target_audience}</p>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => selectValueFromSuggestion('unique_value', index)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Use Unique Value
                    </button>
                    <p className="text-sm text-gray-700 line-clamp-2">{suggestion.unique_value}</p>
                  </div>
                  
                  {suggestion.business_model && (
                    <div>
                      <button
                        type="button"
                        onClick={() => selectValueFromSuggestion('business_model', index)}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Use Business Model
                      </button>
                      <p className="text-sm text-gray-700 line-clamp-1">{suggestion.business_model}</p>
                    </div>
                  )}
                  
                  {suggestion.revenue_model && (
                    <div>
                      <button
                        type="button"
                        onClick={() => selectValueFromSuggestion('revenue_model', index)}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Use Revenue Model
                      </button>
                      <p className="text-sm text-gray-700 line-clamp-1">{suggestion.revenue_model}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Combined Lists */}
          <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h4 className="font-medium text-indigo-900 mb-2">Combined Unique Lists</h4>
            
            <div className="space-y-3">
              <div>
                <button
                  type="button"
                  onClick={() => handleFieldChange('competition', getCombinedList('competition'))}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Use Combined Competition
                </button>
                <p className="text-sm text-gray-700">
                  {getCombinedList('competition').length} unique items
                </p>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => handleFieldChange('revenue_streams', getCombinedList('revenue_streams'))}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Use Combined Revenue Streams
                </button>
                <p className="text-sm text-gray-700">
                  {getCombinedList('revenue_streams').length} unique items
                </p>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => handleFieldChange('cost_structure', getCombinedList('cost_structure'))}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Use Combined Cost Structure
                </button>
                <p className="text-sm text-gray-700">
                  {getCombinedList('cost_structure').length} unique items
                </p>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => handleFieldChange('key_metrics', getCombinedList('key_metrics'))}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Use Combined Key Metrics
                </button>
                <p className="text-sm text-gray-700">
                  {getCombinedList('key_metrics').length} unique items
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Merged Result Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Merged Concept</h3>
              {isGenerating && (
                <div className="flex items-center text-indigo-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  <span className="text-sm">AI is merging concepts...</span>
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  value={mergedSuggestion.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  onFocus={() => setActiveField('title')}
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  value={mergedSuggestion.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  required
                  onFocus={() => setActiveField('description')}
                />
              </div>
              
              {/* Problem Statement */}
              <div>
                <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                <textarea
                  id="problem_statement"
                  value={mergedSuggestion.problem_statement}
                  onChange={(e) => handleFieldChange('problem_statement', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  required
                  onFocus={() => setActiveField('problem_statement')}
                />
              </div>
              
              {/* Solution Concept */}
              <div>
                <label htmlFor="solution_concept" className="block text-sm font-medium text-gray-700 mb-1">Solution Concept</label>
                <textarea
                  id="solution_concept"
                  value={mergedSuggestion.solution_concept}
                  onChange={(e) => handleFieldChange('solution_concept', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  required
                  onFocus={() => setActiveField('solution_concept')}
                />
              </div>
              
              {/* Target Audience */}
              <div>
                <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <textarea
                  id="target_audience"
                  value={mergedSuggestion.target_audience}
                  onChange={(e) => handleFieldChange('target_audience', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  required
                  onFocus={() => setActiveField('target_audience')}
                />
              </div>
              
              {/* Unique Value */}
              <div>
                <label htmlFor="unique_value" className="block text-sm font-medium text-gray-700 mb-1">Unique Value Proposition</label>
                <textarea
                  id="unique_value"
                  value={mergedSuggestion.unique_value}
                  onChange={(e) => handleFieldChange('unique_value', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  required
                  onFocus={() => setActiveField('unique_value')}
                />
              </div>
              
              {/* Business Model */}
              <div>
                <label htmlFor="business_model" className="block text-sm font-medium text-gray-700 mb-1">Business Model</label>
                <textarea
                  id="business_model"
                  value={mergedSuggestion.business_model || ''}
                  onChange={(e) => handleFieldChange('business_model', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  onFocus={() => setActiveField('business_model')}
                />
              </div>
              
              {/* Revenue Model */}
              <div>
                <label htmlFor="revenue_model" className="block text-sm font-medium text-gray-700 mb-1">Revenue Model</label>
                <textarea
                  id="revenue_model"
                  value={mergedSuggestion.revenue_model || ''}
                  onChange={(e) => handleFieldChange('revenue_model', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  onFocus={() => setActiveField('revenue_model')}
                />
              </div>
              
              {/* List Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Competition */}
                <div>
                  <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-1">Competition (one per line)</label>
                  <textarea
                    id="competition"
                    value={Array.isArray(mergedSuggestion.competition) ? mergedSuggestion.competition.join('\n') : ''}
                    onChange={(e) => handleArrayChange('competition', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    onFocus={() => setActiveField('competition')}
                  />
                </div>
                
                {/* Revenue Streams */}
                <div>
                  <label htmlFor="revenue_streams" className="block text-sm font-medium text-gray-700 mb-1">Revenue Streams (one per line)</label>
                  <textarea
                    id="revenue_streams"
                    value={Array.isArray(mergedSuggestion.revenue_streams) ? mergedSuggestion.revenue_streams.join('\n') : ''}
                    onChange={(e) => handleArrayChange('revenue_streams', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    onFocus={() => setActiveField('revenue_streams')}
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Merged Concept
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuggestionMerger;
