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
 * Idea Refinement Screen for Pathway 3
 * Allows users to refine an analyzed idea based on AI feedback
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
  const [goToMarket, setGoToMarket] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeSection, setActiveSection] = useState<'basics' | 'problem-solution' | 'audience-value' | 'business-model' | 'go-to-market'>('basics');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setGoToMarket(loadedIdea.go_to_market || '');
      }
      
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Validate form inputs
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    
    // Only validate fields in the active section
    if (activeSection === 'problem-solution') {
      if (!problemStatement.trim()) {
        errors.problem_statement = 'Problem statement is required';
      }
      
      if (!solutionConcept.trim()) {
        errors.solution_concept = 'Solution concept is required';
      }
    }
    
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
        marketing_strategy: marketingStrategy,
        go_to_market: goToMarket
      });
      
      setSuccessMessage('Changes saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle enhancing the current section with AI
  const handleEnhanceSection = async () => {
    if (!idea) return;
    
    setIsEnhancing(true);
    
    try {
      // Package the data based on the current section
      let enhancementData: any = {};
      let enhancedResult: any = {};
      
      switch (activeSection) {
        case 'basics':
          enhancementData = {
            title,
            description
          };
          enhancedResult = await enhanceIdea(enhancementData);
          if (enhancedResult.title) setTitle(enhancedResult.title);
          if (enhancedResult.description) setDescription(enhancedResult.description);
          break;
          
        case 'problem-solution':
          enhancementData = {
            problem: problemStatement,
            solution: solutionConcept
          };
          enhancedResult = await enhanceIdea(enhancementData);
          if (enhancedResult.problem) setProblemStatement(enhancedResult.problem);
          if (enhancedResult.solution) setSolutionConcept(enhancedResult.solution);
          break;
          
        case 'audience-value':
          enhancementData = {
            audience: targetAudience,
            value: uniqueValue
          };
          enhancedResult = await enhanceIdea(enhancementData);
          if (enhancedResult.audience) setTargetAudience(enhancedResult.audience);
          if (enhancedResult.value) setUniqueValue(enhancedResult.value);
          break;
          
        case 'business-model':
          enhancementData = {
            title,
            description,
            business_model: businessModel,
            revenue_model: marketingStrategy
          };
          enhancedResult = await enhanceIdea(enhancementData);
          if (enhancedResult.business_model) setBusinessModel(enhancedResult.business_model);
          if (enhancedResult.revenue_model) setMarketingStrategy(enhancedResult.revenue_model);
          break;
          
        case 'go-to-market':
          enhancementData = {
            title,
            description,
            market_strategy: goToMarket
          };
          enhancedResult = await enhanceIdea(enhancementData);
          if (enhancedResult.market_strategy) setGoToMarket(enhancedResult.market_strategy);
          break;
      }
      
      setSuccessMessage('AI enhancements applied!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error enhancing section:', error);
      alert('Failed to enhance this section. Please try again.');
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
      case 'market':
        setGoToMarket(suggestion);
        break;
    }
  };

  // Handle completing the refinement process
  const handleComplete = async () => {
    if (!ideaId) return;
    
    // Save any unsaved changes first
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
        marketing_strategy: marketingStrategy,
        go_to_market: goToMarket
      });
      
      // Navigate back to library
      alert('Your idea has been refined and saved!');
      navigate('/idea-hub/playground/pathway/3/library');
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Failed to save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-r-transparent rounded-full"></div>
      </div>
    );
  }

  // Render empty state if idea not found
  if (!idea) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800">Idea not found</h2>
        <p className="mt-2 text-gray-600">The idea you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/idea-hub/playground/pathway/3/library')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Refine Your Idea</h1>
        <p className="text-gray-600">
          Improve your idea based on the analysis feedback. Use the AI enhancement feature to get suggestions for each section.
        </p>
      </div>
      
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Section tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSection('basics')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'basics'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } rounded-l-md border border-gray-300`}
          >
            Basics
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('problem-solution')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'problem-solution'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Problem & Solution
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('audience-value')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'audience-value'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Audience & Value
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('business-model')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'business-model'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Business Model
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('go-to-market')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'go-to-market'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } rounded-r-md border border-gray-300`}
          >
            Go-to-Market
          </button>
        </div>
      </div>
      
      {/* Enhancement/Save buttons */}
      <div className="mb-6 flex justify-between items-center">
        <button
          type="button"
          onClick={handleEnhanceSection}
          disabled={isEnhancing || aiIsLoading}
          className={`px-4 py-2 bg-purple-600 text-white rounded-md ${
            isEnhancing || aiIsLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-purple-700'
          }`}
        >
          {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
        </button>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 bg-green-600 text-white rounded-md ${
            isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      {/* Section content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Basics section */}
        {activeSection === 'basics' && (
          <div className="space-y-6">
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
                placeholder="Provide a brief but comprehensive description of your business idea"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Problem & Solution section */}
        {activeSection === 'problem-solution' && (
          <div className="space-y-6">
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
                placeholder="Clearly describe the problem, pain point, or opportunity your idea addresses"
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
                placeholder="Explain how your solution works and why it effectively addresses the problem"
              />
              {validationErrors.solution_concept && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.solution_concept}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Audience & Value section */}
        {activeSection === 'audience-value' && (
          <div className="space-y-6">
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
                placeholder="Describe your ideal customers or users in detail"
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
                placeholder="Articulate the unique benefits your solution offers and why customers would choose it"
              />
            </div>
          </div>
        )}
        
        {/* Business Model section */}
        {activeSection === 'business-model' && (
          <div className="space-y-6">
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
                placeholder="Describe how your business will create, deliver, and capture value"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="marketing_strategy" className="block text-sm font-medium text-gray-700">
                  Revenue Model
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
                placeholder="Detail how your business will make money, including pricing strategies and revenue streams"
              />
            </div>
          </div>
        )}
        
        {/* Go-to-Market section */}
        {activeSection === 'go-to-market' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="go_to_market" className="block text-sm font-medium text-gray-700">
                  Go-to-Market Strategy
                </label>
                <SmartSuggestionButton 
                  fieldType="strategy"
                  currentValue={goToMarket}
                  onSuggestionSelect={(suggestion) => handleSuggestion('market', suggestion)}
                />
              </div>
              <textarea
                id="go_to_market"
                value={goToMarket}
                onChange={(e) => setGoToMarket(e.target.value)}
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Outline how you'll launch and market your product, including channels, marketing tactics, and key milestones"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate(`/idea-hub/playground/pathway/3/analyze/${ideaId}`)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back to Analysis
        </button>
        
        <button
          type="button"
          onClick={handleComplete}
          disabled={isSaving || isEnhancing || aiIsLoading}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
            isSaving || isEnhancing || aiIsLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700'
          }`}
        >
          Complete & Finish
        </button>
      </div>
    </div>
  );
};

export default IdeaRefinementScreen;
