import React, { useState, useCallback } from 'react';
import { DeckService } from '../../services/deckService.ts';

interface RecipientVerificationModalProps {
  shareToken: string;
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (verified: boolean) => void;
}

export const RecipientVerificationModal: React.FC<RecipientVerificationModalProps> = ({
  shareToken,
  isOpen,
  onClose,
  onVerificationSuccess,
}) => {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerification = useCallback(async () => {
    if (!identifier || !accessCode) {
      setError('Please enter both your email/phone and the access code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await DeckService.verifyRecipientAccess(shareToken, identifier, accessCode);
      if (result.success) {
        setMessage(result.message);
        onVerificationSuccess(true);
        setTimeout(() => onClose(), 1500); // Close modal after a short delay on success
      } else {
        setError(result.message);
        onVerificationSuccess(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      onVerificationSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [shareToken, identifier, accessCode, onClose, onVerificationSuccess]);

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2>Verification Required</h2>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>
        <p style={styles.instructions}>
          To access this deck, please enter the email or phone number it was shared with and the access code you received.
        </p>
        <div style={styles.formGroup}>
          <label htmlFor="identifier" style={styles.label}>Email or Phone Number</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={styles.input}
            placeholder="e.g., user@example.com or 1234567890"
            disabled={isLoading}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="accessCode" style={styles.label}>Access Code</label>
          <input
            type="text"
            id="accessCode"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            style={styles.input}
            placeholder="Enter your 6-character code"
            disabled={isLoading}
          />
        </div>
        {error && <p style={styles.errorText}>{error}</p>}
        {message && <p style={styles.successText}>{message}</p>}
        <button onClick={handleVerification} disabled={isLoading} style={styles.verifyButton}>
          {isLoading ? 'Verifying...' : 'Verify & Access Deck'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 20px 40px -20px rgba(0,0,0,0.2)',
      width: '100%',
      maxWidth: '480px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '12px',
      borderBottom: '1px solid #e5e7eb',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
    },
    instructions: {
      fontSize: '0.875rem',
      color: '#4b5563',
      lineHeight: 1.5,
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '8px',
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#374151',
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
    },
    verifyButton: {
      padding: '12px 18px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: '#2563eb',
      color: 'white',
      fontSize: '1rem',
      fontWeight: 500,
      marginTop: '8px',
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.875rem',
      textAlign: 'center',
      margin: 0,
    },
    successText: {
      color: '#10b981',
      fontSize: '0.875rem',
      textAlign: 'center',
      margin: 0,
    },
  };
  
  export default RecipientVerificationModal;
