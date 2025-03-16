import React, { useState } from 'react';
import { Suggestion } from './SuggestionCard';

interface SuggestionMergerProps {
  suggestions: Suggestion[];
  onSave: (mergedSuggestion: Suggestion) => void;
  onCancel: () => void;
}

/**
 * Component for merging multiple suggestions into one
 */
const SuggestionMerger: React.FC<SuggestionMergerProps> = ({
  suggestions,
  onSave,
  onCancel
}) => {
  // Create a new suggestion with empty fields
  const emptySuggestion: Suggestion = {
    title: '',
    description: '',
    problem_statement: '',
    solution_concept: '',
    target_audience: '',
    unique_value: '',
    business_model: '',
    marketing_strategy: '',
    revenue_model: '',
    go_to_market: '',
    market_size: '',
    competition: [],
    revenue_streams: [],
    cost_structure: [],
    key_metrics: []
  };
  
  // Initialize merged suggestion with empty fields
  const [mergedSuggestion, setMergedSuggestion] = useState<Suggestion>(emptySuggestion);
  
  // Handle selecting a field from a suggestion
  const handleSelectField = (field: keyof Suggestion, suggestionIndex: number) => {
    const selectedSuggestion = suggestions[suggestionIndex];
    
    if (field === 'competition' || field === 'revenue_streams' || field === 'cost_structure' || field === 'key_metrics') {
      // For array fields, merge with existing arrays
      const existingArray = mergedSuggestion[field] as string[] || [];
      const newArray = selectedSuggestion[field] as string[] || [];
      
      // Combine arrays and remove duplicates
      const combinedArray = [...existingArray, ...newArray].filter((item, index, self) => 
        self.indexOf(item) === index
      );
      
      setMergedSuggestion(prev => ({
        ...prev,
        [field]: combinedArray
      }));
    } else {
      // For text fields, replace with selected value
      setMergedSuggestion(prev => ({
        ...prev,
        [field]: selectedSuggestion[field]
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(mergedSuggestion);
  };
  
  // Generate a title for the suggestion card
  const getSuggestionTitle = (suggestion: Suggestion, index: number) => {
    return suggestion.title || `Suggestion ${index + 1}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Merge Suggestions</h2>
      <p className="text-gray-600 mb-6">
        Select the best elements from each suggestion to create a merged version.
        Click on any field from the suggestions below to add it to your merged suggestion.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Source suggestions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Source Suggestions</h3>
            
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  {getSuggestionTitle(suggestion, index)}
                </h4>
                
                <div className="space-y-3">
                  {/* Text fields */}
                  {Object.entries(suggestion).map(([key, value]) => {
                    // Skip array fields and id
                    if (
                      key === 'id' || 
                      key === 'competition' || 
                      key === 'revenue_streams' || 
                      key === 'cost_structure' || 
                      key === 'key_metrics'
                    ) {
                      return null;
                    }
                    
                    return (
                      <div key={key} className="border-b border-gray-100 pb-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectField(key as keyof Suggestion, index)}
                            className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                          >
                            Use This
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                          {value as string}
                        </p>
                      </div>
                    );
                  })}
                  
                  {/* Array fields */}
                  {['competition', 'revenue_streams', 'cost_structure', 'key_metrics'].map(key => {
                    const arrayValue = suggestion[key as keyof Suggestion] as string[] | undefined;
                    if (!arrayValue || arrayValue.length === 0) return null;
                    
                    return (
                      <div key={key} className="border-b border-gray-100 pb-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectField(key as keyof Suggestion, index)}
                            className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                          >
                            Use These
                          </button>
                        </div>
                        <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
                          {arrayValue.slice(0, 3).map((item, i) => (
                            <li key={i} className="line-clamp-1">{item}</li>
                          ))}
                          {arrayValue.length > 3 && (
                            <li className="text-gray-500">+{arrayValue.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Right column: Merged suggestion */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Merged Suggestion</h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="merged-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="merged-title"
                  value={mergedSuggestion.title}
                  onChange={(e) => setMergedSuggestion(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="merged-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="merged-description"
                  value={mergedSuggestion.description}
                  onChange={(e) => setMergedSuggestion(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Other text fields */}
              {[
                'problem_statement',
                'solution_concept',
                'target_audience',
                'unique_value',
                'business_model',
                'marketing_strategy',
                'revenue_model',
                'go_to_market',
                'market_size'
              ].map(field => (
                <div key={field}>
                  <label 
                    htmlFor={`merged-${field}`} 
                    className="block text-sm font-medium text-gray-700 mb-1 capitalize"
                  >
                    {field.replace(/_/g, ' ')}
                  </label>
                  <textarea
                    id={`merged-${field}`}
                    value={mergedSuggestion[field as keyof Suggestion] as string}
                    onChange={(e) => setMergedSuggestion(prev => ({ 
                      ...prev, 
                      [field]: e.target.value 
                    }))}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              ))}
              
              {/* Array fields */}
              {[
                { key: 'competition', label: 'Competition' },
                { key: 'revenue_streams', label: 'Revenue Streams' },
                { key: 'cost_structure', label: 'Cost Structure' },
                { key: 'key_metrics', label: 'Key Metrics' }
              ].map(({ key, label }) => {
                const arrayValue = mergedSuggestion[key as keyof Suggestion] as string[] || [];
                
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <ul className="text-sm text-gray-700 mt-1 list-disc list-inside bg-white p-2 rounded border border-gray-200 min-h-[40px]">
                      {arrayValue.length > 0 ? (
                        arrayValue.map((item, i) => (
                          <li key={i} className="mb-1">{item}</li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">No items selected</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
            Save Merged Suggestion
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuggestionMerger;
