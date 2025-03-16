import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SmartSuggestionButton from '../shared/SmartSuggestionButton';

interface IdeaRefinementScreenProps {
  onUpdateIdea: (id: string, updates: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  getIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Idea Refinement Screen for Pathway 2
 * Allows users to refine all aspects of their selected idea with AI assistance
 */
const IdeaRefinementScreen: React.FC<IdeaRefinementScreenProps> = ({
  onUpdateIdea,
  getIdea,
}) => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { enhanceIdea, isLoading: aiIsLoading } = useAIContext();

  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionConcept, setSolutionConcept] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [marketingStrategy, setMarketingStrategy] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load the selected idea
  useEffect(() => {
    if (ideaId) {
      const loadedIdea = getIdea(ideaId);
      setIdea(loadedIdea);
      
      if (loadedIdea) {
        setTitle(loadedIdea.title || '');
        setDescription(loadedIdea.description || '');
        setProblemStatement(loadedIdea.problem_statement || '');
        setSolutionConcept(loadedIdea.solution_concept || '');
        setTargetAudience(loadedIdea.target_audience || '');
        setUniqueValue(loadedIdea.unique_value || '');
        setBusinessModel(loadedIdea.business_model || '');
        setMarketingStrategy(loadedIdea.marketing_strategy || '');
      }
      
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Validate form inputs
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = 'Please provide a title for your idea';
    }
    
    if (!description.trim()) {
      errors.description = 'Please provide a description for your idea';
    }
    
    if (!problemStatement.trim()) {
      errors.problem_statement = 'Please describe the problem your idea solves';
    }
    
    if (!solutionConcept.trim()) {
      errors.solution_concept = 'Please describe your proposed solution';
    }
    
    // Other fields are optional but encouraged
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle saving the refined idea
  const handleSave = async () => {
    if (!ideaId || !validateForm()) return;
    
    setIsSaving(true);
    
    try {
      await onUpdateIdea(ideaId, {
        title,
        description,
        problem_statement: problemStatement,
        solution_concept: solutionConcept,
        target_audience: targetAudience,
        unique_value: uniqueValue,
        business_model: businessModel,
        marketing_strategy: marketingStrategy
      });
      
      // Success! Show a completion message and navigate back to the idea playground
      alert('Congratulations! Your idea has been refined and saved.');
      navigate('/idea-hub/playground');
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle enhancing the idea with AI
  const handleEnhanceWithAI = async () => {
    if (!idea) return;
    
    setIsEnhancing(true);
    
    try {
      const enhancedIdea = await enhanceIdea({
        title,
        description,
        problem: problemStatement,
        solution: solutionConcept,
        audience: targetAudience,
        value: uniqueValue
      });
      
      // Update state with enhanced idea fields
      if (enhancedIdea.title) setTitle(enhancedIdea.title);
      if (enhancedIdea.description) setDescription(enhancedIdea.description);
      if (enhancedIdea.problem) setProblemStatement(enhancedIdea.problem);
      if (enhancedIdea.solution) setSolutionConcept(enhancedIdea.solution);
      if (enhancedIdea.audience) setTargetAudience(enhancedIdea.audience);
      if (enhancedIdea.value) setUniqueValue(enhancedIdea.value);
    } catch (error) {
      console.error('Error enhancing idea:', error);
      alert('Failed to enhance your idea. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle smart suggestions
  const handleSuggestion = (field: string, suggestion: string) => {
    switch (field) {
      case 'title':
        setTitle(suggestion);
        break;
      case 'description':
        setDescription(suggestion);
        break;
      case 'problem':
        setProblemStatement(suggestion);
        break;
      case 'solution':
        setSolutionConcept(suggestion);
        break;
      case 'audience':
        setTargetAudience(suggestion);
        break;
      case 'value':
        setUniqueValue(suggestion);
        break;
      case 'model':
        setBusinessModel(suggestion);
        break;
      case 'strategy':
        setMarketingStrategy(suggestion);
        break;
    }
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Refine Your Idea</h1>
        <p className="text-gray-600">
          Enhance and refine your selected idea with AI assistance. Focus on strengthening each aspect of your business concept.
        </p>
        
        <div className="mt-4 flex justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => navigate('/idea-hub/playground/pathway/2/idea-comparison')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back to Comparison
            </button>
            
            <button
              type="button"
              onClick={handleEnhanceWithAI}
              disabled={isEnhancing || aiIsLoading}
              className={`px-4 py-2 bg-purple-600 text-white rounded-md ${
                isEnhancing || aiIsLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-700'
              }`}
            >
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </button>
          </div>
          
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
            {isSaving ? 'Saving...' : 'Complete & Save'}
          </button>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Sections">
          <button
            onClick={() => setActiveSection('overview')}
            className={`py-4 px-1 ${
              activeSection === 'overview'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('problem-solution')}
            className={`py-4 px-1 ${
              activeSection === 'problem-solution'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap font-medium text-sm`}
          >
            Problem & Solution
          </button>
          <button
            onClick={() => setActiveSection('audience-value')}
            className={`py-4 px-1 ${
              activeSection === 'audience-value'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap font-medium text-sm`}
          >
            Audience & Value
          </button>
          <button
            onClick={() => setActiveSection('business-marketing')}
            className={`py-4 px-1 ${
              activeSection === 'business-marketing'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap font-medium text-sm`}
          >
            Business & Marketing
          </button>
        </nav>
      </div>
      
      {/* Overview section */}
      {activeSection === 'overview' && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Idea Title
              </label>
              <SmartSuggestionButton 
                fieldType="title"
                currentValue={title}
                onSuggestionSelect={(suggestion) => handleSuggestion('title', suggestion)}
              />
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter a concise and memorable title for your idea"
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Idea Description
              </label>
              <SmartSuggestionButton 
                fieldType="description"
                currentValue={description}
                onSuggestionSelect={(suggestion) => handleSuggestion('description', suggestion)}
              />
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`w-full p-2 border rounded-md ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide a brief description of your business idea"
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Problem & Solution section */}
      {activeSection === 'problem-solution' && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="problem_statement" className="block text-sm font-medium text-gray-700">
                Problem Statement
              </label>
              <SmartSuggestionButton 
                fieldType="problem"
                currentValue={problemStatement}
                onSuggestionSelect={(suggestion) => handleSuggestion('problem', suggestion)}
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
              placeholder="Describe the specific problem, pain point, or opportunity your idea addresses"
            />
            {validationErrors.problem_statement && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.problem_statement}</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="solution_concept" className="block text-sm font-medium text-gray-700">
                Solution Concept
              </label>
              <SmartSuggestionButton 
                fieldType="solution"
                currentValue={solutionConcept}
                onSuggestionSelect={(suggestion) => handleSuggestion('solution', suggestion)}
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
              placeholder="Describe your solution approach, how it works, and why it's effective"
            />
            {validationErrors.solution_concept && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.solution_concept}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Audience & Value section */}
      {activeSection === 'audience-value' && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <SmartSuggestionButton 
                fieldType="audience"
                currentValue={targetAudience}
                onSuggestionSelect={(suggestion) => handleSuggestion('audience', suggestion)}
              />
            </div>
            <textarea
              id="target_audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe your ideal customers or users. Be specific about demographics, behaviors, and needs"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="unique_value" className="block text-sm font-medium text-gray-700">
                Unique Value Proposition
              </label>
              <SmartSuggestionButton 
                fieldType="value"
                currentValue={uniqueValue}
                onSuggestionSelect={(suggestion) => handleSuggestion('value', suggestion)}
              />
            </div>
            <textarea
              id="unique_value"
              value={uniqueValue}
              onChange={(e) => setUniqueValue(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Explain the unique benefits your solution offers and why your target audience would choose it over alternatives"
            />
          </div>
        </div>
      )}
      
      {/* Business & Marketing section */}
      {activeSection === 'business-marketing' && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="business_model" className="block text-sm font-medium text-gray-700">
                Business Model
              </label>
              <SmartSuggestionButton 
                fieldType="model"
                currentValue={businessModel}
                onSuggestionSelect={(suggestion) => handleSuggestion('model', suggestion)}
              />
            </div>
            <textarea
              id="business_model"
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe how your business will create, deliver, and capture value. Include your key activities, resources, and partnerships"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="marketing_strategy" className="block text-sm font-medium text-gray-700">
                Marketing Strategy
              </label>
              <SmartSuggestionButton 
                fieldType="strategy"
                currentValue={marketingStrategy}
                onSuggestionSelect={(suggestion) => handleSuggestion('strategy', suggestion)}
              />
            </div>
            <textarea
              id="marketing_strategy"
              value={marketingStrategy}
              onChange={(e) => setMarketingStrategy(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe your marketing approach. Which channels will you use to reach customers? What messaging and positioning will you adopt?"
            />
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/idea-hub/playground/pathway/2/idea-comparison')}
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
          {isSaving ? 'Saving...' : 'Complete & Save'}
        </button>
      </div>
    </div>
  );
};

export default IdeaRefinementScreen;
