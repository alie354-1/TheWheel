import React, { useState } from "react";

interface AIRecommendationPanelProps {
  recommendations: string[];
  aiInfo?: string;
  onAskQuestion: (question: string) => void;
  aiAnswer?: string;
  loading?: boolean;
}

const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  recommendations,
  aiInfo,
  onAskQuestion,
  aiAnswer,
  loading,
}) => {
  const [question, setQuestion] = useState("");

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question.trim());
      setQuestion("");
    }
  };

  return (
    <div className="card bg-base-100 shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">AI Recommendations & Q&A</h3>
      {aiInfo && (
        <div className="mb-2 text-info">
          <span className="font-semibold">AI Context:</span> {aiInfo}
        </div>
      )}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Recommendations:</span>
          <ul className="ml-4 list-disc">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleAsk} className="flex gap-2 mb-2">
        <input
          className="input input-bordered flex-grow"
          placeholder="Ask the AI about your journey..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={loading || !question.trim()}>
          {loading ? <span className="loading loading-spinner loading-xs"></span> : "Ask"}
        </button>
      </form>
      {aiAnswer && (
        <div className="mt-2 bg-base-200 rounded p-2">
          <span className="font-semibold">AI Answer:</span> {aiAnswer}
        </div>
      )}
    </div>
  );
};

export default AIRecommendationPanel;
