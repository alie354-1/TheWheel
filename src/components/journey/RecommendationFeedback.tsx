import React, { useState } from 'react';

const RecommendationFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return <div className="text-center text-green-600">Thank you for your feedback!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border-t border-gray-200">
      <h4 className="font-semibold">Was this recommendation helpful?</h4>
      <div className="flex items-center gap-4 mt-2">
        <button type="button" className="px-3 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200">
          Yes
        </button>
        <button type="button" className="px-3 py-1 rounded-full bg-red-100 text-red-800 hover:bg-red-200">
          No
        </button>
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Tell us more..."
        className="w-full mt-2 p-2 border rounded"
      />
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
        Submit Feedback
      </button>
    </form>
  );
};

export default RecommendationFeedback;
