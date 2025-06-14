import React, { useState } from 'react';
import { DeckService } from '../../services/deckService';
import { DeckComment, Deck, SmartShareLink, ExpertiseLevel, ShareType } from '../../types';

interface AnonymousCommentFormProps {
  deckId: string;
  shareToken: string;
  reviewerSessionId?: string;
  reviewerDisplayName?: string | null; // Added to accept pre-filled name
  disabled?: boolean; // Added to control form interaction
  onCommentSubmitted: (comment: DeckComment) => void;
  currentDeck: Deck; // To get slideId if needed, or pass slideId directly
  shareLink: SmartShareLink; // To access focusAreas if needed
}

export const AnonymousCommentForm: React.FC<AnonymousCommentFormProps> = ({
  deckId,
  shareToken,
  reviewerSessionId,
  reviewerDisplayName: initialReviewerDisplayName, // Use the prop
  disabled, // Use the prop
  onCommentSubmitted,
  currentDeck,
  shareLink,
}) => {
  const [textContent, setTextContent] = useState('');
  // Pre-fill authorDisplayName if provided by prop, otherwise, it's an empty string for user input
  const [authorDisplayName, setAuthorDisplayName] = useState(initialReviewerDisplayName || '');
  const [declaredRole, setDeclaredRole] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel | ''>('');
  const [focusArea, setFocusArea] = useState(''); // If comments are tied to focus areas
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assuming for now comments are general to the deck or a specific slide if context is available
  // For simplicity, this example makes general comments to the deck.
  // A more advanced version would allow selecting a slide or element.
  const currentSlideId = currentDeck.sections[0]?.id; // Example: comment on the first slide

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    if (!reviewerSessionId) {
        setError('Reviewer session is not available. Cannot submit comment.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const commentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' | 'reviewerSessionId' | 'feedbackWeight' | 'aiSentimentScore' | 'aiExpertiseScore' | 'aiImprovementCategory'> = {
        deckId,
        slideId: currentSlideId, // This needs to be dynamic based on what slide is viewed
        textContent,
        authorDisplayName: authorDisplayName.trim() || 'Anonymous',
        declaredRole: declaredRole.trim() || undefined,
        // expertiseLevel: expertiseLevel || undefined, // Add if expertise_level is on deck_comments
        // focusArea: focusArea || undefined, // Add if focus_area is on deck_comments
        commentType: 'General', // Changed from 'Feedback' to 'General'
        status: 'Open',
        urgency: 'None', // Added default urgency
      };
      
      // Update reviewer session with declared role and name if provided
      await DeckService.createOrUpdateReviewerSession(shareToken, reviewerSessionId, {
        declaredRole: declaredRole.trim() || undefined,
        reviewerName: authorDisplayName.trim() || undefined,
        expertiseLevel: expertiseLevel || undefined,
      });

      const newComment = await DeckService.addComment(deckId, commentData, shareToken, reviewerSessionId);
      onCommentSubmitted(newComment);
      setTextContent('');
      setAuthorDisplayName('');
      setDeclaredRole('');
      setExpertiseLevel('');
      setFocusArea('');
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError(err instanceof Error ? err.message : 'Failed to submit comment.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAdvancedFields = shareLink.shareType === 'expert_review';

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Leave Feedback</h3>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Your feedback..."
        rows={4}
        style={styles.textarea}
        disabled={isLoading || disabled}
      />
      <input
        type="text"
        value={authorDisplayName}
        onChange={(e) => setAuthorDisplayName(e.target.value)}
        placeholder="Your Name (Optional)"
        style={styles.input}
        disabled={isLoading || disabled}
      />
      
      {showAdvancedFields && (
        <>
          <input
            type="text"
            value={declaredRole}
            onChange={(e) => setDeclaredRole(e.target.value)}
            placeholder="Your Role (e.g., Investor, Designer - Optional)"
            style={styles.input}
            disabled={isLoading || disabled}
          />
          <select 
            value={expertiseLevel} 
            onChange={(e) => setExpertiseLevel(e.target.value as ExpertiseLevel | '')}
            style={styles.input}
            disabled={isLoading || disabled}
          >
            <option value="">Select Expertise Level (Optional)</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
            <option value="n/a">N/A</option>
          </select>
          {shareLink.focusAreas && shareLink.focusAreas.length > 0 && (
            <select 
              value={focusArea} 
              onChange={(e) => setFocusArea(e.target.value)}
              style={styles.input}
              disabled={isLoading || disabled}
            >
              <option value="">Focus Area (Optional)</option>
              {shareLink.focusAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          )}
        </>
      )}

      {error && <p style={styles.errorText}>{error}</p>}
      <button type="submit" disabled={isLoading || disabled} style={styles.button}>
        {isLoading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginBottom: '20px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '1em',
  },
  errorText: {
    color: 'red',
    fontSize: '0.9em',
  },
};
