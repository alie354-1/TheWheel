import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../../lib/types/idea-playground.types';
import { AIServiceContext } from '../../services/ai-service.interface';

interface IdeaGenerationStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const IdeaGenerationStage: React.FC<IdeaGenerationStageProps> = ({ onSave }) => {
  const { state, goToNextStage, completeCurrentStage, aiService } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: idea?.title || '',
    description: idea?.description || '',
    industry: '',
    problemArea: '',
    targetAudience: '',
    technologyFocus: '',
    innovationLevel: 'incremental' as 'incremental' | 'disruptive' | 'radical',
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Generate idea with AI
  const handleGenerateIdea = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const aiContext: AIServiceContext = {
        userId: 'current-user',
        tier: 'standard',
      };
      
      const enhancementParams = {
        title: formData.title || 'New Idea',
        description: formData.description || 'Description pending',
        industry: formData.industry,
        problemArea: formData.problemArea,
        targetAudience: formData.targetAudience,
        technologyFocus: formData.technologyFocus,
        innovationLevel: formData.innovationLevel,
      };
      
      const enhancedIdea = await aiService.enhanceIdea(enhancementParams, aiContext);
      
      // Update form with enhanced idea
      setFormData(prev => ({
        ...prev,
        title: enhancedIdea.title,
        description: enhancedIdea.description,
      }));
      
    } catch (error) {
      console.error('Error generating idea:', error);
      alert('Failed to generate idea. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    
    setIsLoading(true);
    try {
      // Save idea data
      await onSave({
        title: formData.title,
        description: formData.description,
        problem_statement: formData.problemArea,
        target_audience: formData.targetAudience,
      });
      
      // Complete this stage
      await completeCurrentStage({
        completed_at: new Date().toISOString(),
        form_data: formData,
      });
      
      // Go to next stage
      goToNextStage();
    } catch (error) {
      console.error('Error saving idea:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Idea Generation</h1>
      
      <p className="text-gray-600 mb-6">
        Start by capturing the essence of your business idea. You can either enter the details manually
        or use our AI assistant to help you generate and refine your concept.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic idea information */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Idea Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a concise title for your idea"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Brief Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your idea in a few sentences"
              required
            />
          </div>
          
          {/* Additional parameters for AI generation */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">AI Generation Parameters (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="industry">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Healthcare, Finance, Education"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="problemArea">
                  Problem Area
                </label>
                <input
                  type="text"
                  id="problemArea"
                  name="problemArea"
                  value={formData.problemArea}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What problem are you solving?"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="targetAudience">
                  Target Audience
                </label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Who will use your product/service?"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="technologyFocus">
                  Technology Focus
                </label>
                <input
                  type="text"
                  id="technologyFocus"
                  name="technologyFocus"
                  value={formData.technologyFocus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AI, Blockchain, Mobile"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="innovationLevel">
                  Innovation Level
                </label>
                <select
                  id="innovationLevel"
                  name="innovationLevel"
                  value={formData.innovationLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="incremental">Incremental (Improve existing solutions)</option>
                  <option value="disruptive">Disruptive (Challenge existing market)</option>
                  <option value="radical">Radical (Create entirely new market)</option>
                </select>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGenerateIdea}
              disabled={isGenerating}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="material-icons animate-spin mr-2">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">auto_awesome</span>
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !formData.title || !formData.description}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">arrow_forward</span>
                Continue to Initial Assessment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaGenerationStage;
