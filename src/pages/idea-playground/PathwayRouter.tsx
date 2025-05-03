import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { AIContextProvider } from '../../lib/services/ai/ai-context-provider';

/**
 * Pathway selection component that allows users to choose
 * which idea development pathway they want to follow
 */
const PathwayRouter: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  
  const pathways = [
    {
      id: 'quick-idea',
      title: 'Quick Idea Generation',
      description: 'Generate business ideas quickly with AI assistance.',
      icon: '⚡️',
      color: 'bg-blue-100 border-blue-300'
    },
    {
      id: 'guided-refinement',
      title: 'Guided Refinement',
      description: 'Step-by-step refinement of your business ideas with structured guidance.',
      icon: '🔍',
      color: 'bg-green-100 border-green-300'
    },
    {
      id: 'explore-merge',
      title: 'Explore & Merge',
      description: 'Generate multiple variations of your idea and merge the best aspects.',
      icon: '🔀',
      color: 'bg-purple-100 border-purple-300'
    }
  ];
  
  const handlePathwaySelect = (pathwayId: string) => {
    setSelectedPathway(pathwayId);
    
    // Navigate to the appropriate pathway component
    switch (pathwayId) {
      case 'quick-idea':
        navigate('/idea-hub/quick-generation');
        break;
      case 'guided-refinement':
        navigate('/idea-hub/refinement');
        break;
      case 'explore-merge':
        navigate('/idea-hub/exploration');
        break;
    }
  };
  
  return (
    <AIContextProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Idea Development Path</h1>
          <p className="text-gray-600 mb-8 text-center">
            Select the pathway that best fits your current needs and working style
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {pathways.map(pathway => (
              <div 
                key={pathway.id}
                className={`${pathway.color} border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => handlePathwaySelect(pathway.id)}
              >
                <div className="text-4xl mb-4">{pathway.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{pathway.title}</h3>
                <p className="text-gray-700">{pathway.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Not sure where to start? The Quick Idea Generation pathway is a great place to begin!
            </p>
          </div>
        </div>
      </div>
    </AIContextProvider>
  );
};

export default PathwayRouter;
