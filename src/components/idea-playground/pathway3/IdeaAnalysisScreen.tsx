import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';

interface IdeaAnalysisScreenProps {
  getIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Idea Analysis Screen for Pathway 3
 * Allows users to analyze an existing idea and get AI-powered insights
 */
const IdeaAnalysisScreen: React.FC<IdeaAnalysisScreenProps> = ({
  getIdea,
}) => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { validateIdea, isLoading: aiIsLoading } = useAIContext();

  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'market' | 'feasibility' | 'business'>('overview');
  
  // Analysis results
  const [marketAnalysis, setMarketAnalysis] = useState<{
    valid: boolean;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);
  
  const [feasibilityAnalysis, setFeasibilityAnalysis] = useState<{
    valid: boolean;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);
  
  const [businessAnalysis, setBusinessAnalysis] = useState<{
    valid: boolean;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  // Load the selected idea
  useEffect(() => {
    if (ideaId) {
      const loadedIdea = getIdea(ideaId);
      setIdea(loadedIdea);
      setIsLoading(false);
    }
  }, [ideaId, getIdea]);

  // Handle running market analysis
  const handleMarketAnalysis = async () => {
    if (!idea) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await validateIdea(idea, 'market');
      setMarketAnalysis(result);
      setActiveSection('market');
    } catch (error) {
      console.error('Error analyzing market potential:', error);
      alert('Failed to analyze market potential. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle running feasibility analysis
  const handleFeasibilityAnalysis = async () => {
    if (!idea) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await validateIdea(idea, 'feasibility');
      setFeasibilityAnalysis(result);
      setActiveSection('feasibility');
    } catch (error) {
      console.error('Error analyzing feasibility:', error);
      alert('Failed to analyze feasibility. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle running business model analysis
  const handleBusinessAnalysis = async () => {
    if (!idea) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await validateIdea(idea, 'business_model');
      setBusinessAnalysis(result);
      setActiveSection('business');
    } catch (error) {
      console.error('Error analyzing business model:', error);
      alert('Failed to analyze business model. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle proceeding to refinement
  const handleRefine = () => {
    if (ideaId) {
      navigate(`/idea-hub/playground/pathway/3/refine/${ideaId}`);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Idea Analysis</h1>
        <p className="text-gray-600">
          Analyze this idea from different perspectives to identify strengths, weaknesses, and areas for improvement.
        </p>
      </div>
      
      {/* Idea overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{idea.title}</h2>
        <p className="text-gray-600 mb-6">{idea.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Problem Statement</h3>
            <p className="text-sm text-gray-600">
              {idea.problem_statement || 'No problem statement available'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Solution Concept</h3>
            <p className="text-sm text-gray-600">
              {idea.solution_concept || 'No solution concept available'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Target Audience</h3>
            <p className="text-sm text-gray-600">
              {idea.target_audience || 'No target audience defined'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Value Proposition</h3>
            <p className="text-sm text-gray-600">
              {idea.unique_value || 'No value proposition defined'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Analysis options */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[250px]">
          <button
            type="button"
            onClick={handleMarketAnalysis}
            disabled={isAnalyzing || aiIsLoading}
            className={`w-full p-4 rounded-lg text-left transition-all ${
              activeSection === 'market' 
                ? 'bg-indigo-50 border-2 border-indigo-500' 
                : 'bg-white border border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">Market Analysis</h3>
              {marketAnalysis && (
                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                  marketAnalysis.valid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {marketAnalysis.valid ? 'Promising' : 'Needs work'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Evaluate market potential, competition, and target audience fit
            </p>
          </button>
        </div>
        
        <div className="flex-1 min-w-[250px]">
          <button
            type="button"
            onClick={handleFeasibilityAnalysis}
            disabled={isAnalyzing || aiIsLoading}
            className={`w-full p-4 rounded-lg text-left transition-all ${
              activeSection === 'feasibility' 
                ? 'bg-indigo-50 border-2 border-indigo-500' 
                : 'bg-white border border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">Feasibility Analysis</h3>
              {feasibilityAnalysis && (
                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                  feasibilityAnalysis.valid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {feasibilityAnalysis.valid ? 'Feasible' : 'Challenging'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Assess technical feasibility, resource requirements, and implementation challenges
            </p>
          </button>
        </div>
        
        <div className="flex-1 min-w-[250px]">
          <button
            type="button"
            onClick={handleBusinessAnalysis}
            disabled={isAnalyzing || aiIsLoading}
            className={`w-full p-4 rounded-lg text-left transition-all ${
              activeSection === 'business' 
                ? 'bg-indigo-50 border-2 border-indigo-500' 
                : 'bg-white border border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">Business Model Analysis</h3>
              {businessAnalysis && (
                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                  businessAnalysis.valid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {businessAnalysis.valid ? 'Sustainable' : 'Risky'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Evaluate revenue potential, cost structure, and business model viability
            </p>
          </button>
        </div>
      </div>
      
      {/* Analysis results */}
      {isAnalyzing ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-r-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing... Please wait</p>
        </div>
      ) : (
        <>
          {activeSection === 'market' && marketAnalysis && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Market Analysis</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Analysis</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{marketAnalysis.feedback}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {marketAnalysis.strengths.length > 0 ? (
                      marketAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600">{strength}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No specific strengths identified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-red-700 mb-2">Weaknesses</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {marketAnalysis.weaknesses.length > 0 ? (
                      marketAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600">{weakness}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No specific weaknesses identified</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'feasibility' && feasibilityAnalysis && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Feasibility Analysis</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Analysis</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{feasibilityAnalysis.feedback}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feasibilityAnalysis.strengths.length > 0 ? (
                      feasibilityAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600">{strength}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No specific strengths identified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-red-700 mb-2">Weaknesses</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feasibilityAnalysis.weaknesses.length > 0 ? (
                      feasibilityAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600">{weakness}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No specific weaknesses identified</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'business' && businessAnalysis && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Model Analysis</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Analysis</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{businessAnalysis.feedback}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {businessAnalysis.strengths.length > 0 ? (
                      businessAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600">{strength}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No specific strengths identified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-red-700 mb-2">Weaknesses</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {businessAnalysis.weaknesses.length > 0 ? (
                      businessAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600">{weakness}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No specific weaknesses identified</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/idea-hub/playground/pathway/3/library')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back to Library
        </button>
        
        <button
          type="button"
          onClick={handleRefine}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Refine This Idea
        </button>
      </div>
    </div>
  );
};

export default IdeaAnalysisScreen;
