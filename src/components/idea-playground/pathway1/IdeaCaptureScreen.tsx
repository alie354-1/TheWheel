import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../lib/store';
import { useAIContext } from '../../../lib/services/ai/ai-context-provider';
import SmartSuggestionButton from '../shared/SmartSuggestionButton';
import { profileService } from '../../../lib/services/profile.service';
import { ExtendedUserProfile } from '../../../lib/types/extended-profile.types';

// Define idea types
export type IdeaType = 'new_company' | 'new_product' | 'new_feature' | 'improvement';

interface IdeaCaptureScreenProps {
  onCreateIdea: (
    idea: { 
      title: string; 
      description: string; 
      solution_concept?: string;
      used_company_context?: boolean;
      company_id?: string;
      idea_type?: IdeaType;
    }, 
    event?: React.FormEvent
  ) => Promise<any>;
}

/**
 * Initial screen for Pathway 1 (Start with Specific Idea)
 * Allows users to input their initial idea and get AI assistance
 */
const IdeaCaptureScreen: React.FC<IdeaCaptureScreenProps> = ({ onCreateIdea }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solutionConcept, setSolutionConcept] = useState('');
  const [ideaType, setIdeaType] = useState<IdeaType>('new_company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ 
    title?: string; 
    description?: string;
    solution_concept?: string;
    idea_type?: string;
  }>({});
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [useCompanyContext, setUseCompanyContext] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isLoading: aiIsLoading } = useAIContext();
  
  // Fetch user profile to check if they have a company
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const profile = await profileService.getProfile(user.id);
        setUserProfile(profile);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Handle submitting the form and creating a new idea
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    const errors: { title?: string; description?: string; solution_concept?: string } = {};
    if (!title.trim()) {
      errors.title = 'Please enter a title for your idea';
    }
    if (!description.trim()) {
      errors.description = 'Please provide a brief description of your idea';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Reset validation errors
    setValidationErrors({});
    setIsSubmitting(true);
    
    try {
      // Create the idea
      console.log('Creating idea with title:', title, 'and description:', description, 'and solution concept:', solutionConcept);
      
      // Create the idea input object
      const ideaInput = { 
        title, 
        description,
        solution_concept: solutionConcept,
        used_company_context: useCompanyContext,
        company_id: useCompanyContext ? userProfile?.company_id : undefined,
        idea_type: ideaType
      };
      
      // Pass both the idea data AND the event to the parent component
      const newIdea = await onCreateIdea(ideaInput, e);
      
      if (!newIdea || !newIdea.id) {
        throw new Error('Failed to create idea: No valid idea returned');
      }
      
      console.log('Successfully created idea:', newIdea.id);
      
      // If we're inside a parent component flow (like QuickGeneration),
      // the navigation should be handled by the parent component
      // Only navigate directly if the parent hasn't prevented the default behavior
      if (e.defaultPrevented) {
        console.log('Navigation prevented by parent component');
        return newIdea;
      }
      
      // Otherwise, navigate to the standard pathway flow
      const nextUrl = `/idea-hub/playground/pathway/1/suggestions/${newIdea.id}`;
      console.log('Navigating to:', nextUrl);
      
      // Use window.location for more reliable navigation
      window.location.href = nextUrl;
    } catch (error) {
      console.error('Error creating idea:', error);
      
      // More detailed error message
      const errorMessage = error instanceof Error 
        ? `Failed to create your idea: ${error.message}` 
        : 'Failed to create your idea. Please try again.';
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle AI suggestion for title
  const handleTitleSuggestion = (suggestion: string) => {
    setTitle(suggestion);
  };
  
  // Handle AI suggestion for description
  const handleDescriptionSuggestion = (suggestion: string) => {
    setDescription(suggestion);
  };
  
  // Handle AI suggestion for solution concept
  const handleSolutionConceptSuggestion = (suggestion: string) => {
    setSolutionConcept(suggestion);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Capture Your Idea</h1>
        <p className="text-gray-600">
          Start by giving your idea a title and a brief description. 
          You'll refine it further in the next steps.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Idea Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What type of idea is this? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              className={`p-3 border rounded-md cursor-pointer transition-all ${
                ideaType === 'new_company' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
              onClick={() => setIdeaType('new_company')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id="type_new_company"
                  name="idea_type"
                  checked={ideaType === 'new_company'}
                  onChange={() => setIdeaType('new_company')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="type_new_company" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                  New Company
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                A completely new business venture or startup
              </p>
            </div>
            
            <div 
              className={`p-3 border rounded-md cursor-pointer transition-all ${
                ideaType === 'new_product' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
              onClick={() => setIdeaType('new_product')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id="type_new_product"
                  name="idea_type"
                  checked={ideaType === 'new_product'}
                  onChange={() => setIdeaType('new_product')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="type_new_product" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                  New Product
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                A new product for an existing company
              </p>
            </div>
            
            <div 
              className={`p-3 border rounded-md cursor-pointer transition-all ${
                ideaType === 'new_feature' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
              onClick={() => setIdeaType('new_feature')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id="type_new_feature"
                  name="idea_type"
                  checked={ideaType === 'new_feature'}
                  onChange={() => setIdeaType('new_feature')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="type_new_feature" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                  New Feature
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                A new feature for an existing product
              </p>
            </div>
            
            <div 
              className={`p-3 border rounded-md cursor-pointer transition-all ${
                ideaType === 'improvement' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
              onClick={() => setIdeaType('improvement')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id="type_improvement"
                  name="idea_type"
                  checked={ideaType === 'improvement'}
                  onChange={() => setIdeaType('improvement')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="type_improvement" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                  Improvement
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                An enhancement to an existing product or service
              </p>
            </div>
          </div>
          {validationErrors.idea_type && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.idea_type}</p>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Describe your idea in one sentence <span className="text-red-500">*</span>
            </label>
            <SmartSuggestionButton 
              fieldType="title"
              currentValue={title}
              onSuggestionSelect={handleTitleSuggestion}
            />
          </div>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-2 border rounded-md ${
              validationErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 'An AI-powered customer service tool' or 'Tutus for ponies!'"
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              What inspired this idea?
            </label>
            <SmartSuggestionButton 
              fieldType="description"
              currentValue={description}
              onSuggestionSelect={handleDescriptionSuggestion}
            />
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`w-full p-2 border rounded-md ${
              validationErrors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 'I love ponies and think they'd look great in tutus' or 'I hate waiting for customer service calls'"
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>
        
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="solution_concept" className="block text-sm font-medium text-gray-700">
            Do you see this as a product, technology, or service?
          </label>
          <SmartSuggestionButton 
            fieldType="solution"
            currentValue={solutionConcept}
            onSuggestionSelect={handleSolutionConceptSuggestion}
          />
        </div>
        <textarea
          id="solution_concept"
          value={solutionConcept}
          onChange={(e) => setSolutionConcept(e.target.value)}
          rows={3}
          className={`w-full p-2 border rounded-md ${
            validationErrors.solution_concept ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 'A physical product line of custom-made tutus' or 'A software tool that uses AI'"
        />
        {validationErrors.solution_concept && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.solution_concept}</p>
        )}
      </div>
      
      {/* Company context selection - only show if user has a company */}
      {userProfile?.company_id && userProfile?.company_name && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-800 mb-2">Company Context</h3>
          <p className="text-sm text-gray-600 mb-3">
            Is this idea for your existing company? If so, we'll use your company information to generate more relevant suggestions.
          </p>
          <button
            type="button"
            onClick={() => setUseCompanyContext(!useCompanyContext)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              useCompanyContext 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {useCompanyContext 
              ? `✓ This is a product for ${userProfile.company_name}` 
              : `This is a product for ${userProfile.company_name}`}
          </button>
          {useCompanyContext && (
            <p className="mt-2 text-sm text-indigo-600">
              AI will use your company information to generate more relevant suggestions.
            </p>
          )}
        </div>
      )}
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => window.location.href = '/idea-hub/playground'}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Pathways
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || aiIsLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
              isSubmitting || aiIsLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Continue'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <h3 className="text-sm font-medium text-gray-500">Tips for a great idea</h3>
        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Be specific about what problem your idea solves</li>
          <li>Consider who would benefit most from your solution</li>
          <li>Think about what makes your idea unique or better than existing solutions</li>
        </ul>
      </div>
    </div>
  );
};

export default IdeaCaptureScreen;
