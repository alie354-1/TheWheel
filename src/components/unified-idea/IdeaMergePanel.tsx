import React, { useState } from 'react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';
import { useUnifiedIdeaContext } from '../../lib/contexts/UnifiedIdeaContext';

interface IdeaMergePanelProps {
  ideas: UnifiedIdea[];
  onBack: () => void;
}

const IdeaMergePanel: React.FC<IdeaMergePanelProps> = ({ ideas, onBack }) => {
  const { generateIdeas } = useUnifiedIdeaContext();
  
  // Check if we have enough ideas to merge
  if (!ideas || ideas.length < 2) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please select at least two ideas to merge.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Ideas
        </button>
      </div>
    );
  }

  // State for the merged idea
  const [mergedIdea, setMergedIdea] = useState<Partial<UnifiedIdea>>({
    title: 'Merged: ' + ideas.map(i => i.title).join(' + '),
    description: '',
    problem_statement: '',
    solution_concept: '',
    target_audience: '',
    unique_value: '',
    business_model: '',
    revenue_model: '',
    marketing_strategy: '',
    go_to_market: '',
    refinement_stage: 'draft'
  });

  // Handle input changes
  const handleInputChange = (field: keyof UnifiedIdea, value: string) => {
    setMergedIdea({
      ...mergedIdea,
      [field]: value
    });
  };

  // Handle selecting a component from an idea
  const handleSelectComponent = (field: keyof UnifiedIdea, ideaIndex: number) => {
    if (ideas[ideaIndex]) {
      setMergedIdea({
        ...mergedIdea,
        [field]: ideas[ideaIndex][field] || ''
      });
    }
  };

  // Handle creating the merged idea
  const handleCreateMergedIdea = async () => {
    try {
      // Use generateIdeas with a custom prompt that includes the merged idea data
      await generateIdeas({
        count: 1,
        topic: mergedIdea.title || 'Merged Idea',
        context: mergedIdea.description || '',
        title: mergedIdea.title || 'Merged Idea',
        problem: mergedIdea.problem_statement || ''
      });
      onBack(); // Go back to exploration view
    } catch (error) {
      console.error('Error creating merged idea:', error);
    }
  };

  // Fields to merge
  const fields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'problem_statement', label: 'Problem Statement' },
    { key: 'solution_concept', label: 'Solution Concept' },
    { key: 'target_audience', label: 'Target Audience' },
    { key: 'unique_value', label: 'Unique Value' },
    { key: 'business_model', label: 'Business Model' },
    { key: 'revenue_model', label: 'Revenue Model' },
    { key: 'marketing_strategy', label: 'Marketing Strategy' },
    { key: 'go_to_market', label: 'Go-to-Market Strategy' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          ← Back to Ideas
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-6">Merge Ideas</h2>
      <p className="mb-6 text-gray-500">
        Create a new idea by combining elements from the selected ideas. Click on a value from any idea to use it in the merged idea.
      </p>

      {/* Merge form */}
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.key} className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            
            {/* Source options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              {ideas.map((idea, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectComponent(field.key as keyof UnifiedIdea, index)}
                  className="p-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                >
                  <span className="block font-medium text-xs text-gray-500 mb-1">
                    Idea {index + 1}: {idea.title || 'Untitled'}
                  </span>
                  <span className="block text-gray-700 truncate">
                    {idea[field.key as keyof UnifiedIdea] || '-'}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Merged value */}
            <textarea
              value={mergedIdea[field.key as keyof UnifiedIdea] as string || ''}
              onChange={(e) => handleInputChange(field.key as keyof UnifiedIdea, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
              placeholder={`Enter merged ${field.label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateMergedIdea}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Merged Idea
        </button>
      </div>
    </div>
  );
};

export default IdeaMergePanel;
