/**
 * Enhanced Idea Hub Page
 * Main entry point for the Enhanced Idea Hub feature
 */

import React from 'react';
import EnhancedIdeaHub from './idea-hub/EnhancedIdeaHub';

const EnhancedIdeaHubPage: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EnhancedIdeaHub />
      </div>
    </div>
  );
};

export default EnhancedIdeaHubPage;
