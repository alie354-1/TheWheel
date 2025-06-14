import React, { useEffect, useState } from 'react';
import { communityStepService, CommunityStep } from '../../lib/services/community-step.service';

const CommunityStepsList: React.FC = () => {
  const [steps, setSteps] = useState<CommunityStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const approvedSteps = await communityStepService.getCommunitySteps('approved');
        setSteps(approvedSteps);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, []);

  if (loading) {
    return <div>Loading community steps...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Community Steps</h1>
      <div className="space-y-4">
        {steps.length === 0 ? (
          <p>No community steps available yet.</p>
        ) : (
          steps.map((step) => (
            <div key={step.id} className="p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold">{step.name}</h2>
              <p className="text-gray-600 mt-2">{step.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityStepsList;
