import React from 'react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { useAuthStore } from '../../lib/store';
import IdeaComponentVariations from '../IdeaComponentVariations';

const ComponentVariations: React.FC = () => {
  const { user } = useAuthStore();
  const { ideaData, setIdeaData } = useIdeaContext();

  const handleSelectVariation = (componentType: string, text: string) => {
    setIdeaData(prev => ({
      ...prev,
      [componentType]: text
    }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 mb-4">
        Explore different variations for each component of your business idea. Select the ones that best fit your vision.
      </p>
      
      <IdeaComponentVariations 
        idea={{
          title: ideaData.title,
          description: ideaData.description,
          problem_statement: ideaData.problem_statement,
          solution_concept: ideaData.solution_concept,
          target_audience: ideaData.target_audience,
          unique_value: ideaData.unique_value,
          business_model: ideaData.business_model,
          marketing_strategy: ideaData.marketing_strategy,
          revenue_model: ideaData.revenue_model,
          go_to_market: ideaData.go_to_market
        }}
        userId={user?.id}
        onSelectVariation={handleSelectVariation}
      />
    </div>
  );
};

export default ComponentVariations;
