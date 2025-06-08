import React, { useState } from 'react';

interface AcceptAnswerButtonProps {
  threadId: string;
  replyId: string;
  isAccepted: boolean;
  isThreadAuthor: boolean;
  onAcceptChange: () => void;
}

/**
 * AcceptAnswerButton Component
 * 
 * A button that allows thread authors to mark a reply as the accepted answer.
 * Only visible to the thread author and only for replies that aren't already accepted.
 */
const AcceptAnswerButton: React.FC<AcceptAnswerButtonProps> = ({
  threadId,
  replyId,
  isAccepted,
  isThreadAuthor,
  onAcceptChange
}) => {
  const [loading, setLoading] = useState(false);
  
  // If user is not the thread author or the reply is already accepted, don't render the button
  if (!isThreadAuthor || isAccepted) {
    return null;
  }
  
  const handleAcceptAnswer = async () => {
    try {
      setLoading(true);
      await onAcceptChange();
    } catch (err) {
      console.error('Error accepting answer:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      type="button"
      className="text-sm flex items-center text-green-600 hover:text-green-700"
      onClick={handleAcceptAnswer}
      disabled={loading}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      Mark as Accepted Answer
    </button>
  );
};

export default AcceptAnswerButton;
