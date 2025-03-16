import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea, IdeaRefinementParams } from '../../../../../lib/types/idea-playground.types';
import { AIServiceContext } from '../../services/ai-service.interface';

interface DetailedRefinementStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const DetailedRefinementStage: React.FC<DetailedRefinementStageProps> = ({ onSave }) => {
  const { state, goToNextStage, goToPreviousStage, completeCurrentStage, aiService } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refinement data
  const [refinementData, setRefinementData] = useState({
    valueProposition: idea?.unique_value || '',
    targetCustomers: idea?.target_audience || '',
    problemStatement: idea?.problem_statement || '',
    solution: idea?.solution_concept || '',
    uniqueSellingPoints: [] as string[],
    keyFeatures: [] as string[],
    competitiveAnalysis: '',
    riskFactors: [] as string[],
  });
  
  // New item inputs
  const [newUsp, setNewUsp] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newRisk, setNewRisk] = useState('');
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRefinementData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new unique selling point
  const handleAddUsp = () => {
    if (!newUsp.trim()) return;
    setRefinementData(prev => ({
      ...prev,
      uniqueSellingPoints: [...prev.uniqueSellingPoints, newUsp.trim()]
    }));
    setNewUsp('');
  };
  
  // Remove unique selling point
  const handleRemoveUsp = (index: number) => {
    setRefinementData(prev => ({
      ...prev,
      uniqueSellingPoints: prev.uniqueSellingPoints.filter((_, i) => i !== index)
    }));
  };
  
  // Add new feature
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setRefinementData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, newFeature.trim()]
    }));
    setNewFeature('');
  };
  
  // Remove feature
  const handleRemoveFeature = (index: number) => {
    setRefinementData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index)
    }));
  };
  
  // Add new risk
  const handleAddRisk = () => {
    if (!newRisk.trim()) return;
    setRefinementData(prev => ({
      ...prev,
      riskFactors: [...prev.riskFactors, newRisk.trim()]
    }));
    setNewRisk('');
  };
  
  // Remove risk
  const handleRemoveRisk = (index: number) => {
    setRefinementData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.filter((_, i) => i !== index)
    }));
  };
  
  // Generate refinements with AI
  const handleGenerateRefinements = async () => {
    if (!idea || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const aiContext: AIServiceContext = {
        userId: 'current-user',
        tier: 'standard',
      };
      
      // Create refinement params
      const refinementParams: IdeaRefinementParams = {
        idea_id: idea.id,
        focus_areas: ['problem', 'solution', 'market', 'business_model'],
      };
      
      const result = await aiService.refineIdea(idea, refinementParams, aiContext);
      
      setRefinementData({
        valueProposition: result.unique_value || refinementData.valueProposition,
        targetCustomers: result.target_audience || refinementData.targetCustomers,
        problemStatement: result.problem_statement || refinementData.problemStatement,
        solution: result.solution_concept || refinementData.solution,
        uniqueSellingPoints: result.unique_selling_points || refinementData.uniqueSellingPoints,
        keyFeatures: result.key_features || refinementData.keyFeatures,
        competitiveAnalysis: result.competitive_analysis || refinementData.competitiveAnalysis,
        riskFactors: result.risk_factors || refinementData.riskFactors,
      });
    } catch (error) {
      console.error('Error generating refinements:', error);
      alert('Failed to generate refinements. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || !idea) return;
    
    setIsLoading(true);
    try {
      // Save refinement data
      await onSave({
        unique_value: refinementData.valueProposition,
        target_audience: refinementData.targetCustomers,
        problem_statement: refinementData.problemStatement,
        solution_concept: refinementData.solution,
      });
      
      // Complete this stage
      await completeCurrentStage({
        completed_at: new Date().toISOString(),
        refinement_data: refinementData,
      });
      
      // Go to next stage
      goToNextStage();
    } catch (error) {
      console.error('Error saving refinements:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // List item component with delete button
  const ListItem = ({ 
    item, 
    onRemove 
  }: { 
    item: string, 
    onRemove: () => void 
  }) => (
    <li className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2">
      <span>{item}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
      >
        <span className="material-icons">delete</span>
      </button>
    </li>
  );
  
  // Add item input component
  const AddItemInput = ({ 
    value, 
    onChange, 
    onAdd, 
    placeholder 
  }: { 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onAdd: () => void, 
    placeholder: string 
  }) => (
    <div className="flex mb-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!value.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Detailed Refinement</h1>
      
      <p className="text-gray-600 mb-6">
        Refine your idea by defining its core elements in detail. This will help you
        clarify your thinking and prepare for market validation.
      </p>
      
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleGenerateRefinements}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="material-icons animate-spin mr-2">refresh</span>
              Generating...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">auto_awesome</span>
              Generate Refinements with AI
            </>
          )}
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Value Proposition */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="valueProposition">
              Value Proposition
            </label>
            <textarea
              id="valueProposition"
              name="valueProposition"
              value={refinementData.valueProposition}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What unique value does your idea provide to customers?"
              required
            />
          </div>
          
          {/* Target Customers */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="targetCustomers">
              Target Customers
            </label>
            <textarea
              id="targetCustomers"
              name="targetCustomers"
              value={refinementData.targetCustomers}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Who are your ideal customers? Be specific about demographics, needs, and behaviors."
              required
            />
          </div>
          
          {/* Problem Statement */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="problemStatement">
              Problem Statement
            </label>
            <textarea
              id="problemStatement"
              name="problemStatement"
              value={refinementData.problemStatement}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What specific problem does your idea solve? Why is it important?"
              required
            />
          </div>
          
          {/* Solution */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="solution">
              Solution Description
            </label>
            <textarea
              id="solution"
              name="solution"
              value={refinementData.solution}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How does your idea solve the problem? Describe your solution in detail."
              required
            />
          </div>
          
          {/* Unique Selling Points */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Unique Selling Points
            </label>
            <AddItemInput
              value={newUsp}
              onChange={(e) => setNewUsp(e.target.value)}
              onAdd={handleAddUsp}
              placeholder="Add a unique selling point"
            />
            {refinementData.uniqueSellingPoints.length > 0 ? (
              <ul className="space-y-2">
                {refinementData.uniqueSellingPoints.map((usp, index) => (
                  <ListItem
                    key={index}
                    item={usp}
                    onRemove={() => handleRemoveUsp(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No unique selling points added yet.</p>
            )}
          </div>
          
          {/* Key Features */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Key Features
            </label>
            <AddItemInput
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onAdd={handleAddFeature}
              placeholder="Add a key feature"
            />
            {refinementData.keyFeatures.length > 0 ? (
              <ul className="space-y-2">
                {refinementData.keyFeatures.map((feature, index) => (
                  <ListItem
                    key={index}
                    item={feature}
                    onRemove={() => handleRemoveFeature(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No key features added yet.</p>
            )}
          </div>
          
          {/* Competitive Analysis */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="competitiveAnalysis">
              Competitive Analysis
            </label>
            <textarea
              id="competitiveAnalysis"
              name="competitiveAnalysis"
              value={refinementData.competitiveAnalysis}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Who are your competitors? How is your solution different or better?"
            />
          </div>
          
          {/* Risk Factors */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Risk Factors
            </label>
            <AddItemInput
              value={newRisk}
              onChange={(e) => setNewRisk(e.target.value)}
              onAdd={handleAddRisk}
              placeholder="Add a risk factor"
            />
            {refinementData.riskFactors.length > 0 ? (
              <ul className="space-y-2">
                {refinementData.riskFactors.map((risk, index) => (
                  <ListItem
                    key={index}
                    item={risk}
                    onRemove={() => handleRemoveRisk(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No risk factors added yet.</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
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
            disabled={isLoading || !refinementData.valueProposition || !refinementData.problemStatement || !refinementData.solution}
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
                Continue to Market Validation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailedRefinementStage;
