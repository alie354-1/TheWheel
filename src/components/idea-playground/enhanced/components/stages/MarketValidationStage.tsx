import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../../lib/types/idea-playground.types';
import { AIServiceContext } from '../../services/ai-service.interface';

interface MarketValidationStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const MarketValidationStage: React.FC<MarketValidationStageProps> = ({ onSave }) => {
  const { state, goToNextStage, goToPreviousStage, completeCurrentStage, aiService, addExperiment } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Validation method selection
  const [validationMethod, setValidationMethod] = useState<'customer_interviews' | 'surveys' | 'prototype_testing' | 'market_research'>('customer_interviews');
  
  // Validation plan data
  const [validationPlan, setValidationPlan] = useState({
    validation_plan: '',
    key_hypotheses: [] as string[],
    experiment_design: '',
    success_criteria: '',
    expected_outcomes: '',
    potential_pivots: [] as string[],
    resources_needed: [] as string[],
  });
  
  // Custom hypothesis
  const [customHypothesis, setCustomHypothesis] = useState('');
  
  // Handle validation method change
  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationMethod(e.target.value as 'customer_interviews' | 'surveys' | 'prototype_testing' | 'market_research');
  };
  
  // Generate validation plan
  const handleGenerateValidationPlan = async () => {
    if (!idea) return;
    
    setIsGenerating(true);
    try {
      const validationParams = {
        idea_id: idea.id,
        validation_method: validationMethod,
        custom_hypotheses: customHypothesis ? [customHypothesis] : [],
      };
      
      const aiContext: AIServiceContext = {
        userId: 'current-user',
        tier: 'standard',
      };
      
      const result = await aiService.validateIdea(idea, validationParams, aiContext);
      
      setValidationPlan({
        validation_plan: result.validation_plan || '',
        key_hypotheses: result.key_hypotheses || [],
        experiment_design: result.experiment_design || '',
        success_criteria: result.success_criteria || '',
        expected_outcomes: result.expected_outcomes || '',
        potential_pivots: result.potential_pivots || [],
        resources_needed: result.resources_needed || [],
      });
    } catch (error) {
      console.error('Error generating validation plan:', error);
      alert('Failed to generate validation plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add custom hypothesis
  const handleAddHypothesis = () => {
    if (!customHypothesis.trim()) return;
    
    setValidationPlan(prev => ({
      ...prev,
      key_hypotheses: [...prev.key_hypotheses, customHypothesis],
    }));
    
    setCustomHypothesis('');
  };
  
  // Remove hypothesis
  const handleRemoveHypothesis = (index: number) => {
    setValidationPlan(prev => ({
      ...prev,
      key_hypotheses: prev.key_hypotheses.filter((_, i) => i !== index),
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || !idea) return;

    setIsLoading(true);
    try {
      // We'll store the validation data in the completion_data
      // No need to save to the idea directly as these aren't properties of IdeaPlaygroundIdea
      const validationData = {
        validation_plan: validationPlan.validation_plan,
        validation_method: validationMethod,
      };
      
      // If onSave is provided, we can use it to save any standard idea properties
      if (onSave) {
        await onSave({
          // Update any standard IdeaPlaygroundIdea properties if needed
          // For example, we could update the description or status
        });
      }
      
      // Add experiment to idea
      await addExperiment({
        idea_id: idea.id,
        name: `${validationMethod.replace('_', ' ')} Validation`,
        hypothesis: validationPlan.key_hypotheses.join('\n'),
        methodology: validationPlan.validation_plan,
        success_criteria: validationPlan.success_criteria,
        status: 'planned',
        created_at: new Date().toISOString(),
      });
      
      await completeCurrentStage({ 
        validation_data: validationData,
        completed_at: new Date().toISOString(),
      });
      
      goToNextStage();
    } catch (error) {
      console.error('Error saving validation plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Market Validation</h1>
      
      <p className="text-gray-600 mb-6">
        Validate your idea with real-world experiments to test key assumptions and reduce risk.
        This stage helps you gather evidence to support or refine your business concept.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Validation Method</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="validation_method">
              Select a validation method
            </label>
            <select
              id="validation_method"
              value={validationMethod}
              onChange={handleMethodChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="customer_interviews">Customer Interviews</option>
              <option value="surveys">Surveys</option>
              <option value="prototype_testing">Prototype Testing</option>
              <option value="market_research">Market Research</option>
            </select>
            
            <div className="mt-2 text-sm text-gray-500">
              {validationMethod === 'customer_interviews' && (
                <p>Conduct in-depth interviews with potential customers to understand their needs and pain points.</p>
              )}
              {validationMethod === 'surveys' && (
                <p>Collect quantitative data from a larger sample to validate market size and interest.</p>
              )}
              {validationMethod === 'prototype_testing' && (
                <p>Create a simple prototype and observe how users interact with it to validate usability and value.</p>
              )}
              {validationMethod === 'market_research' && (
                <p>Analyze existing market data, competitor offerings, and industry trends to validate opportunity.</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="custom_hypothesis">
              Add Custom Hypothesis (Optional)
            </label>
            <div className="flex">
              <input
                type="text"
                id="custom_hypothesis"
                value={customHypothesis}
                onChange={(e) => setCustomHypothesis(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a hypothesis you want to test"
              />
              <button
                type="button"
                onClick={handleAddHypothesis}
                disabled={!customHypothesis.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGenerateValidationPlan}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            {isGenerating ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Generating Plan...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">science</span>
                Generate Validation Plan
              </>
            )}
          </button>
        </div>
        
        {validationPlan.validation_plan && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Validation Plan</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Plan Overview</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                {validationPlan.validation_plan}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Key Hypotheses to Test</h3>
              <ul className="space-y-2">
                {validationPlan.key_hypotheses.map((hypothesis, index) => (
                  <li key={index} className="flex items-start p-2 bg-gray-50 rounded-md">
                    <span className="material-icons text-blue-500 mr-2 mt-0.5">check_circle</span>
                    <span className="flex-grow">{hypothesis}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHypothesis(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Experiment Design</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                {validationPlan.experiment_design}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Success Criteria</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                {validationPlan.success_criteria}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Expected Outcomes</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                {validationPlan.expected_outcomes}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Potential Pivots</h3>
              <ul className="space-y-2">
                {validationPlan.potential_pivots.map((pivot, index) => (
                  <li key={index} className="flex items-start p-2 bg-gray-50 rounded-md">
                    <span className="material-icons text-orange-500 mr-2 mt-0.5">alt_route</span>
                    <span>{pivot}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Resources Needed</h3>
              <ul className="space-y-2">
                {validationPlan.resources_needed.map((resource, index) => (
                  <li key={index} className="flex items-start p-2 bg-gray-50 rounded-md">
                    <span className="material-icons text-green-500 mr-2 mt-0.5">inventory</span>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStage}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md flex items-center"
          >
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !validationPlan.validation_plan}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">arrow_forward</span>
                Continue to Business Model
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarketValidationStage;
