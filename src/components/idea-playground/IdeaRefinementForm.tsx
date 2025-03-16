import React, { useState } from 'react';
import { IdeaPlaygroundIdea, IdeaRefinementParams } from '../../lib/types/idea-playground.types';

interface IdeaRefinementFormProps {
  ideas: IdeaPlaygroundIdea[];
  onSubmit: (params: IdeaRefinementParams) => void;
}

const IdeaRefinementForm: React.FC<IdeaRefinementFormProps> = ({ ideas, onSubmit }) => {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [focusAreas, setFocusAreas] = useState<('problem' | 'solution' | 'market' | 'business_model' | 'go_to_market')[]>([]);
  const [specificQuestions, setSpecificQuestions] = useState<string>('');
  const [improvementDirection, setImprovementDirection] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIdeaId) return;
    
    const params: IdeaRefinementParams = {
      idea_id: selectedIdeaId,
      focus_areas: focusAreas,
      specific_questions: specificQuestions ? specificQuestions.split('\n').filter(q => q.trim()) : undefined,
      improvement_direction: improvementDirection || undefined
    };
    
    onSubmit(params);
  };

  const handleFocusAreaChange = (area: 'problem' | 'solution' | 'market' | 'business_model' | 'go_to_market') => {
    setFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area) 
        : [...prev, area]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="idea-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select an Idea to Refine
        </label>
        <select
          id="idea-select"
          value={selectedIdeaId}
          onChange={(e) => setSelectedIdeaId(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">-- Select an idea --</option>
          {ideas.map(idea => (
            <option key={idea.id} value={idea.id}>{idea.title}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Focus Areas
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="focus-problem"
              type="checkbox"
              checked={focusAreas.includes('problem')}
              onChange={() => handleFocusAreaChange('problem')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="focus-problem" className="ml-2 block text-sm text-gray-700">
              Problem Statement
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="focus-solution"
              type="checkbox"
              checked={focusAreas.includes('solution')}
              onChange={() => handleFocusAreaChange('solution')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="focus-solution" className="ml-2 block text-sm text-gray-700">
              Solution Concept
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="focus-market"
              type="checkbox"
              checked={focusAreas.includes('market')}
              onChange={() => handleFocusAreaChange('market')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="focus-market" className="ml-2 block text-sm text-gray-700">
              Market Analysis
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="focus-business"
              type="checkbox"
              checked={focusAreas.includes('business_model')}
              onChange={() => handleFocusAreaChange('business_model')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="focus-business" className="ml-2 block text-sm text-gray-700">
              Business Model
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="focus-gtm"
              type="checkbox"
              checked={focusAreas.includes('go_to_market')}
              onChange={() => handleFocusAreaChange('go_to_market')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="focus-gtm" className="ml-2 block text-sm text-gray-700">
              Go-to-Market Strategy
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="specific-questions" className="block text-sm font-medium text-gray-700 mb-1">
          Specific Questions (optional)
        </label>
        <textarea
          id="specific-questions"
          value={specificQuestions}
          onChange={(e) => setSpecificQuestions(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter specific questions, one per line"
        />
      </div>
      
      <div>
        <label htmlFor="improvement-direction" className="block text-sm font-medium text-gray-700 mb-1">
          Improvement Direction (optional)
        </label>
        <input
          type="text"
          id="improvement-direction"
          value={improvementDirection}
          onChange={(e) => setImprovementDirection(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Make it more scalable, Focus on sustainability"
        />
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={!selectedIdeaId || focusAreas.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Refine Idea
        </button>
      </div>
    </form>
  );
};

export default IdeaRefinementForm;
