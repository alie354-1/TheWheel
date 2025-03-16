import React, { useState, useEffect } from 'react';
import { BaseSuggestion } from '../../shared/idea/SuggestionCard';
import { Suggestion } from './SuggestionCard';

interface SuggestionEditorProps {
  suggestion: Suggestion;
  onSave: (updatedSuggestion: Suggestion) => void;
  onCancel: () => void;
}

/**
 * Component for editing a suggestion's fields
 */
const SuggestionEditor: React.FC<SuggestionEditorProps> = ({
  suggestion,
  onSave,
  onCancel
}) => {
  const [editedSuggestion, setEditedSuggestion] = useState<Suggestion>({...suggestion});
  
  // Ensure array fields are arrays
  useEffect(() => {
    const normalizedSuggestion = {...editedSuggestion};
    
    // Convert string fields to arrays if needed
    const arrayFields = ['competition', 'revenue_streams', 'cost_structure', 'key_metrics'];
    arrayFields.forEach(field => {
      const value = normalizedSuggestion[field];
      if (value !== undefined && !Array.isArray(value)) {
        normalizedSuggestion[field] = [value as string];
      } else if (value === undefined) {
        normalizedSuggestion[field] = [];
      }
    });
    
    setEditedSuggestion(normalizedSuggestion);
  }, []);
  
  // Handle text field changes
  const handleChange = (field: keyof Suggestion, value: string) => {
    setEditedSuggestion((prev: Suggestion) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle array field changes
  const handleArrayChange = (field: keyof Suggestion, index: number, value: string) => {
    if (!Array.isArray(editedSuggestion[field])) return;
    
    const newArray = [...(editedSuggestion[field] as string[])];
    newArray[index] = value;
    
    setEditedSuggestion((prev: Suggestion) => ({
      ...prev,
      [field]: newArray
    }));
  };
  
  // Add a new item to an array field
  const handleAddArrayItem = (field: keyof Suggestion) => {
    if (!Array.isArray(editedSuggestion[field])) {
      setEditedSuggestion((prev: Suggestion) => ({
        ...prev,
        [field]: ['']
      }));
      return;
    }
    
    setEditedSuggestion((prev: Suggestion) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };
  
  // Remove an item from an array field
  const handleRemoveArrayItem = (field: keyof Suggestion, index: number) => {
    if (!Array.isArray(editedSuggestion[field])) return;
    
    const newArray = [...(editedSuggestion[field] as string[])];
    newArray.splice(index, 1);
    
    setEditedSuggestion((prev: Suggestion) => ({
      ...prev,
      [field]: newArray
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedSuggestion);
  };
  
  // Helper function to safely render array fields
  const renderArrayField = (field: keyof BaseSuggestion, label: string, buttonLabel: string) => {
    const fieldValue = editedSuggestion[field];
    const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
    
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem(field as keyof Suggestion)}
            className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-200"
          >
            {buttonLabel}
          </button>
        </div>
        
        {arrayValue.map((item, index) => (
          <div key={`${field}-${index}`} className="flex mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(field as keyof Suggestion, index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder={`${label} item`}
            />
            <button
              type="button"
              onClick={() => handleRemoveArrayItem(field as keyof Suggestion, index)}
              className="ml-2 px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Suggestion</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={editedSuggestion.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={editedSuggestion.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Problem Statement */}
          <div>
            <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700 mb-1">
              Problem Statement
            </label>
            <textarea
              id="problem_statement"
              value={typeof editedSuggestion.problem_statement === 'string' ? editedSuggestion.problem_statement : ''}
              onChange={(e) => handleChange('problem_statement', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Solution Concept */}
          <div>
            <label htmlFor="solution_concept" className="block text-sm font-medium text-gray-700 mb-1">
              Solution Concept
            </label>
            <textarea
              id="solution_concept"
              value={typeof editedSuggestion.solution_concept === 'string' ? editedSuggestion.solution_concept : ''}
              onChange={(e) => handleChange('solution_concept', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Target Audience */}
          <div>
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <textarea
              id="target_audience"
              value={typeof editedSuggestion.target_audience === 'string' ? editedSuggestion.target_audience : ''}
              onChange={(e) => handleChange('target_audience', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Unique Value */}
          <div>
            <label htmlFor="unique_value" className="block text-sm font-medium text-gray-700 mb-1">
              Unique Value
            </label>
            <textarea
              id="unique_value"
              value={typeof editedSuggestion.unique_value === 'string' ? editedSuggestion.unique_value : ''}
              onChange={(e) => handleChange('unique_value', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Business Model */}
          <div>
            <label htmlFor="business_model" className="block text-sm font-medium text-gray-700 mb-1">
              Business Model
            </label>
            <textarea
              id="business_model"
              value={typeof editedSuggestion.business_model === 'string' ? editedSuggestion.business_model : ''}
              onChange={(e) => handleChange('business_model', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Marketing Strategy */}
          <div>
            <label htmlFor="marketing_strategy" className="block text-sm font-medium text-gray-700 mb-1">
              Marketing Strategy
            </label>
            <textarea
              id="marketing_strategy"
              value={typeof editedSuggestion.marketing_strategy === 'string' ? editedSuggestion.marketing_strategy : ''}
              onChange={(e) => handleChange('marketing_strategy', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Revenue Model */}
          <div>
            <label htmlFor="revenue_model" className="block text-sm font-medium text-gray-700 mb-1">
              Revenue Model
            </label>
            <textarea
              id="revenue_model"
              value={typeof editedSuggestion.revenue_model === 'string' ? editedSuggestion.revenue_model : ''}
              onChange={(e) => handleChange('revenue_model', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Go to Market */}
          <div>
            <label htmlFor="go_to_market" className="block text-sm font-medium text-gray-700 mb-1">
              Go-to-Market Strategy
            </label>
            <textarea
              id="go_to_market"
              value={typeof editedSuggestion.go_to_market === 'string' ? editedSuggestion.go_to_market : ''}
              onChange={(e) => handleChange('go_to_market', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {/* Market Size */}
          <div>
            <label htmlFor="market_size" className="block text-sm font-medium text-gray-700 mb-1">
              Market Size
            </label>
            <textarea
              id="market_size"
              value={typeof editedSuggestion.market_size === 'string' ? editedSuggestion.market_size : ''}
              onChange={(e) => handleChange('market_size', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        {/* Array Fields */}
        <div className="space-y-6">
          {renderArrayField('competition', 'Competition', '+ Add Competitor')}
          {renderArrayField('revenue_streams', 'Revenue Streams', '+ Add Revenue Stream')}
          {renderArrayField('cost_structure', 'Cost Structure', '+ Add Cost Item')}
          {renderArrayField('key_metrics', 'Key Metrics', '+ Add Metric')}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuggestionEditor;
