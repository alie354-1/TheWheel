import React from 'react';
import { UnifiedIdea } from '../../lib/types/unified-idea.types';

interface IdeaComparisonPanelProps {
  ideas: UnifiedIdea[];
  onBack: () => void;
}

const IdeaComparisonPanel: React.FC<IdeaComparisonPanelProps> = ({ ideas, onBack }) => {
  // Check if we have enough ideas to compare
  if (!ideas || ideas.length < 2) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please select at least two ideas to compare.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Ideas
        </button>
      </div>
    );
  }

  // Get common fields to compare
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

      <h2 className="text-xl font-semibold mb-6">Comparing {ideas.length} Ideas</h2>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field
              </th>
              {ideas.map((idea, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Idea {index + 1}: {idea.title || 'Untitled'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.map((field) => (
              <tr key={field.key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {field.label}
                </td>
                {ideas.map((idea, index) => (
                  <td key={index} className="px-6 py-4 text-sm text-gray-500">
                    {idea[field.key as keyof UnifiedIdea] || '-'}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Strengths */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Strengths
              </td>
              {ideas.map((idea, index) => (
                <td key={index} className="px-6 py-4 text-sm text-gray-500">
                  {idea.ai_feedback?.strengths ? (
                    <ul className="list-disc pl-5">
                      {idea.ai_feedback.strengths.map((strength: string, i: number) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  ) : '-'}
                </td>
              ))}
            </tr>
            
            {/* Weaknesses */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Weaknesses
              </td>
              {ideas.map((idea, index) => (
                <td key={index} className="px-6 py-4 text-sm text-gray-500">
                  {idea.ai_feedback?.weaknesses ? (
                    <ul className="list-disc pl-5">
                      {idea.ai_feedback.weaknesses.map((weakness: string, i: number) => (
                        <li key={i}>{weakness}</li>
                      ))}
                    </ul>
                  ) : '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Similarity analysis */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Similarity Analysis</h3>
        <p className="text-gray-500 italic">
          These ideas share some common elements but differ in key aspects. Consider merging their strengths.
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Ideas
        </button>
        <button
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Merge Selected Ideas
        </button>
      </div>
    </div>
  );
};

export default IdeaComparisonPanel;
