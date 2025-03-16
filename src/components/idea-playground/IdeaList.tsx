import React from 'react';
import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';
import IdeaCard from '../idea-playground/IdeaCard';

interface IdeaListProps {
  ideas: IdeaPlaygroundIdea[];
  isLoading: boolean;
}

const IdeaList: React.FC<IdeaListProps> = ({ ideas, isLoading }) => {
  console.log('IdeaList - ideas:', ideas);
  console.log('IdeaList - isLoading:', isLoading);
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Generating ideas...</p>
      </div>
    );
  }

  if (ideas.length === 0 && !isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No ideas yet. Generate some ideas to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
};

export default IdeaList;
