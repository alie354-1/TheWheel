import React from 'react';
import { useAuthStore } from '../../lib/store';
import PathwayRouter from './PathwayRouter';

/**
 * The main Idea Playground page component.
 * This component serves as the container for the Idea Playground experience,
 * integrating the pathway router for a guided approach to idea development.
 * Uses a modular service design that's compatible with the original pathway structure.
 */
const IdeaPlaygroundPage: React.FC = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <PathwayRouter />
      </div>
    </div>
  );
};

export default IdeaPlaygroundPage;
