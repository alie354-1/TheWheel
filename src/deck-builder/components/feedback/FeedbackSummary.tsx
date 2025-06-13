import React from 'react';
import { DeckComment } from '../../types';

interface FeedbackSummaryProps {
  comments: DeckComment[];
}

export const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({ comments }) => {
  const totalComments = comments.length;
  const sentimentScores = comments.map(c => c.aiSentimentScore).filter(s => s !== null && s !== undefined) as number[];
  const averageSentiment = sentimentScores.length > 0 ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length : 0;

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  };

  const summaryContainerStyle: React.CSSProperties = {
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px',
  };

  const summaryTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const summaryItemStyle: React.CSSProperties = {
    fontSize: '14px',
    marginBottom: '5px',
  };

  return (
    <div style={summaryContainerStyle}>
      <h3 style={summaryTitleStyle}>Feedback Summary (Private)</h3>
      <div style={summaryItemStyle}>
        <strong>Total Comments:</strong> {totalComments}
      </div>
      <div style={summaryItemStyle}>
        <strong>Average Sentiment:</strong> {averageSentiment.toFixed(2)} ({getSentimentLabel(averageSentiment)})
      </div>
      {/* Key themes would be implemented here, likely derived from another AI service */}
      <div style={summaryItemStyle}>
        <strong>Key Themes:</strong> (Coming Soon)
      </div>
    </div>
  );
};
