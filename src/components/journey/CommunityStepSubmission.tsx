import React, { useState } from 'react';
import { communityStepService } from '../../lib/services/community-step.service';
import { useAuth } from '../../lib/hooks/useAuth';

const CommunityStepSubmission: React.FC = () => {
  const { user } = useAuth();
  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a step.');
      return;
    }
    try {
      await communityStepService.submitStep({
        name: stepName,
        description,
        user_id: user.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (submitted) {
    return <div className="text-center text-green-600">Thank you for your submission! It is now under review.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Submit a Step to the Community</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="stepName" className="block font-semibold mb-1">Step Name</label>
        <input
          type="text"
          id="stepName"
          value={stepName}
          onChange={(e) => setStepName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block font-semibold mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
        Submit for Review
      </button>
    </form>
  );
};

export default CommunityStepSubmission;
