import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedIdeaProvider } from '../../lib/contexts/UnifiedIdeaContext';
import UnifiedIdeaWorkspace from '../../components/unified-idea/UnifiedIdeaWorkspace';

const UnifiedWorkflow: React.FC = () => {
  const { workspaceId, ideaId } = useParams<{ workspaceId?: string; ideaId?: string }>();
  const [initialStep, setInitialStep] = useState(0);

  // Set initial step based on URL parameters
  useEffect(() => {
    const stepParam = new URLSearchParams(window.location.search).get('step');
    if (stepParam) {
      const step = parseInt(stepParam);
      if (!isNaN(step) && step >= 0 && step <= 4) {
        setInitialStep(step);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedIdeaProvider
        initialWorkspaceId={workspaceId}
        initialIdeaId={ideaId}
        initialStep={initialStep}
      >
        <UnifiedIdeaWorkspace />
      </UnifiedIdeaProvider>
    </div>
  );
};

export default UnifiedWorkflow;
