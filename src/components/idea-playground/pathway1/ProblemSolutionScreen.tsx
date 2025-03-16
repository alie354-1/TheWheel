import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SmartSuggestionButton from '../shared/SmartSuggestionButton';

interface ProblemSolutionScreenProps {
  onUpdateIdea: (id: string, updates: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  getIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Problem & Solution Screen for Pathway 1
 * Allows users to define the problem they're solving and their solution
 */
const ProblemSolutionScreen: React.FC<ProblemSolutionScreenProps> = ({
  onUpdateIdea,
  getIdea,
}) => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { isLoading: aiIsLoading } = useAIContext();

  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionConcept, setSolutionConcept] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ 
    problem_statement?: string; 
    solution_concept?: string 
  }>({});

  // Load the idea data
  useEffect(() => {
    if (ideaId) {
      const loadedIdea = getIdea(ideaId);
      setIdea(loadedIdea);
      
      if (loadedIdea) {
        setProblemStatement(loadedIdea.problem_statement || '');
        setSolutionConcept(loadedIdea.solution_concept || '');
      }
      
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Handle saving the problem and solution
  const handleSave = async () => {
    if (!ideaId) return;
    
    // Validate the form
    const errors: { problem_statement?: string; solution_concept?: string } = {};
    if (!problemStatement.trim()) {
      errors.problem_statement = 'Please describe the problem your idea solves';
    }
    if (!solutionConcept.trim()) {
      errors.solution_concept = 'Please describe your proposed solution';
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
        problem_statement: problemStatement,
        solution_concept: solutionConcept
      });
      // Navigate to the next screen
      navigate(`/idea-hub/playground/pathway/1/target-value/${ideaId}`);
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle smart suggestions
  const handleProblemSuggestion = (suggestion: string) => {
    setProblemStatement(suggestion);
  };

  const handleSolutionSuggestion = (suggestion: string) => {
    setSolutionConcept(suggestion);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Define Problem & Solution</h1>
        <p className="text-gray-600">
          Clearly articulate the problem you're solving and your proposed solution.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h2 className="font-semibold text-blue-800">{idea.title}</h2>
          <p className="text-blue-700 text-sm mt-1">{idea.description}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700">
              What problem does your idea solve?
            </label>
            <SmartSuggestionButton 
              fieldType="problem"
              currentValue={problemStatement}
              onSuggestionSelect={handleProblemSuggestion}
            />
          </div>
          <textarea
            id="problem_statement"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.problem_statement ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the specific problem, pain point, or opportunity your idea addresses."
          />
          {validationErrors.problem_statement && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.problem_statement}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Be specific, quantify the impact if possible, and explain who experiences this problem.</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="solution_concept" className="block text-sm font-medium text-gray-700">
              How does your idea solve this problem?
            </label>
            <SmartSuggestionButton 
              fieldType="solution"
              currentValue={solutionConcept}
              onSuggestionSelect={handleSolutionSuggestion}
            />
          </div>
          <textarea
            id="solution_concept"
            value={solutionConcept}
            onChange={(e) => setSolutionConcept(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded-md ${
              validationErrors.solution_concept ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your solution approach, how it works, and why it's effective."
          />
          {validationErrors.solution_concept && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.solution_concept}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Tips: Focus on how your solution addresses the root causes, what makes it unique, and why it's better than alternatives.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(`/idea-hub/playground/pathway/1/capture`)}
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

export default ProblemSolutionScreen;
