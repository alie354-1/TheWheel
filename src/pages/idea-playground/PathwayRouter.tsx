import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { AIContextProvider } from '../../lib/services/ai/ai-context-provider';

// Pathway 1 Components
import IdeaCaptureScreen from '../../components/idea-playground/pathway1/IdeaCaptureScreen';
import SuggestionsScreen from '../../components/idea-playground/pathway1/SuggestionsScreen';
import ProblemSolutionScreen from '../../components/idea-playground/pathway1/ProblemSolutionScreen';
import TargetValueScreen from '../../components/idea-playground/pathway1/TargetValueScreen';
import BusinessModelScreen from '../../components/idea-playground/pathway1/BusinessModelScreen';
import GoToMarketScreen from '../../components/idea-playground/pathway1/GoToMarketScreen';

// Pathway 2 Components
import IndustrySelectionScreen from '../../components/idea-playground/pathway2/IndustrySelectionScreen';
import IdeaComparisonScreen from '../../components/idea-playground/pathway2/IdeaComparisonScreen';
import IdeaRefinementScreen from '../../components/idea-playground/pathway2/IdeaRefinementScreen';

// Pathway 3 Components
import IdeaLibraryScreen from '../../components/idea-playground/pathway3/IdeaLibraryScreen';
import IdeaAnalysisScreen from '../../components/idea-playground/pathway3/IdeaAnalysisScreen';
import Pathway3RefinementScreen from '../../components/idea-playground/pathway3/IdeaRefinementScreen';

/**
 * The PathwayRouter component handles routing for the three idea development pathways.
 * It provides a selection interface for users to choose a pathway, then routes to the
 * appropriate screens based on the selected pathway.
 */
const PathwayRouter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedPathway, setSelectedPathway] = useState<number | null>(null);
  
  // Check the current URL to determine if we're already on a pathway
  React.useEffect(() => {
    const pathname = window.location.pathname;
    const pathwayMatch = pathname.match(/\/pathway\/([1-3])\/([^/]+)/);
    
    if (pathwayMatch) {
      const pathwayNumber = parseInt(pathwayMatch[1], 10);
      if (pathwayNumber >= 1 && pathwayNumber <= 3) {
        console.log('Direct navigation to pathway:', pathwayNumber);
        setSelectedPathway(pathwayNumber);
      }
    }
  }, []);
  
  // Handle pathway selection
  const handleSelectPathway = (pathwayNumber: number) => {
    console.log('Selected pathway:', pathwayNumber);
    setSelectedPathway(pathwayNumber);
    
    // Navigate to the appropriate starting screen for the pathway
    if (pathwayNumber === 1) {
      navigate('/idea-hub/playground/pathway/1/capture');
    } else if (pathwayNumber === 2) {
      navigate('/idea-hub/playground/pathway/2/industry-selection');
    } else if (pathwayNumber === 3) {
      navigate('/idea-hub/playground/pathway/3/library');
    }
  };
  
  // If no pathway is selected, show the pathway selection screen
  if (!selectedPathway) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Idea Development Pathway</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pathway 1 */}
          <div 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectPathway(1)}
          >
            <h2 className="text-xl font-semibold mb-3">Pathway 1: Start with a Specific Idea</h2>
            <p className="text-gray-600 mb-4">
              Already have an idea in mind? Start here to develop and refine your concept step by step.
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => handleSelectPathway(1)}
            >
              Get Started
            </button>
          </div>
          
          {/* Pathway 2 */}
          <div 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectPathway(2)}
          >
            <h2 className="text-xl font-semibold mb-3">Pathway 2: Explore Industry Opportunities</h2>
            <p className="text-gray-600 mb-4">
              Discover promising ideas based on industry trends and market opportunities.
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => handleSelectPathway(2)}
            >
              Get Started
            </button>
          </div>
          
          {/* Pathway 3 */}
          <div 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectPathway(3)}
          >
            <h2 className="text-xl font-semibold mb-3">Pathway 3: Browse & Refine Existing Ideas</h2>
            <p className="text-gray-600 mb-4">
              Continue working on your existing ideas or refine them further.
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => handleSelectPathway(3)}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Routes to pathway-specific screens or the enhanced workspace
  // Wrap all routes with AIContextProvider to ensure AI context is available
  return (
    <AIContextProvider>
      <Routes>
        {/* Pathway 1 Routes */}
        <Route path="1/capture" element={<IdeaCaptureScreen onCreateIdea={async (idea) => {
          console.log('Creating new idea with data:', idea);
          
          // Create a mock idea with a unique ID
          const mockIdea = {
            ...idea,
            id: 'new-idea-id-' + Date.now(),
            problem_statement: '',
            is_archived: false,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Store the idea in localStorage for the SuggestionsScreen to retrieve
          localStorage.setItem('currentIdeaData', JSON.stringify(mockIdea));
          
          return mockIdea;
        }} />} />
        <Route path="1/suggestions/:ideaId" element={<SuggestionsScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="1/problem-solution/:ideaId" element={<ProblemSolutionScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="1/target-value/:ideaId" element={<TargetValueScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="1/business-model/:ideaId" element={<BusinessModelScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="1/go-to-market/:ideaId" element={<GoToMarketScreen />} />
        
        {/* Pathway 2 Routes */}
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="2/industry-selection" element={<IndustrySelectionScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="2/idea-comparison/:industryId" element={<IdeaComparisonScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="2/idea-refinement/:ideaId" element={<IdeaRefinementScreen />} />
        
        {/* Pathway 3 Routes */}
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="3/library" element={<IdeaLibraryScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="3/analysis/:ideaId" element={<IdeaAnalysisScreen />} />
        {/* @ts-ignore - We're only focusing on the new idea pathway for now */}
        <Route path="3/refinement/:ideaId" element={<Pathway3RefinementScreen />} />
        
        {/* Default route - redirect to pathway selection */}
        <Route path="*" element={
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="mb-4">The requested pathway or screen could not be found.</p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => setSelectedPathway(null)}
            >
              Return to Pathway Selection
            </button>
          </div>
        } />
      </Routes>
    </AIContextProvider>
  );
};

export default PathwayRouter;
