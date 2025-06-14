import React, { useEffect, useState } from 'react';
import { communityStepService, CommunityStep } from '../../lib/services/community-step.service';

const CommunitySubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<CommunityStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const pendingSteps = await communityStepService.getCommunitySteps('pending_review');
        setSubmissions(pendingSteps);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await communityStepService.updateStepStatus(id, 'approved');
      setSubmissions(submissions.filter(s => s.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await communityStepService.updateStepStatus(id, 'rejected');
      setSubmissions(submissions.filter(s => s.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Community Step Submissions</h1>
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <p>No pending submissions.</p>
        ) : (
          submissions.map((step) => (
            <div key={step.id} className="p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold">{step.name}</h2>
              <p className="text-gray-600 mt-2">{step.description}</p>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleApprove(step.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(step.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunitySubmissionsPage;
