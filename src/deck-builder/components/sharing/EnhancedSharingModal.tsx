import React, { useState, useEffect, useCallback } from 'react';
import { DeckService } from '../../services/deckService';
import { SmartShareLink, ShareType, Deck } from '../../types'; // Added Deck
import { useAuth } from '../../../lib/contexts/AuthContext';
import { Settings, Copy, X as IconX, ChevronDown, ChevronUp } from 'lucide-react';

interface EnhancedSharingModalProps {
  deck: Deck; // Changed from deckId to full Deck object
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedSharingModal: React.FC<EnhancedSharingModalProps> = ({ deck, isOpen, onClose }) => {
  const { user } = useAuth();
  const [shareType, setShareType] = useState<ShareType>('feedback');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced settings state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({});
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true); // Default to true as per spec
  const [expiresAt, setExpiresAt] = useState<string>('');

  const PRESET_ROLES = ['Designer', 'Business Expert', 'Investor', 'Technical Lead', 'General'];
  const PRESET_FOCUS_AREAS = ['Content & Story', 'Visual Design', 'Business Logic', 'Market Fit'];


  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal is closed
      setShareType('feedback');
      setGeneratedLink(null);
      setIsLoading(false);
      setError(null);
      setShowAdvanced(false);
      setTargetRoles([]);
      setCustomWeights({});
      setFocusAreas([]);
      setAiAnalysisEnabled(true);
      setExpiresAt('');
    }
  }, [isOpen]);

  const handleGenerateLink = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to share a deck.");
      return;
    }
    if (!deck || !deck.id) {
      setError("Deck information is missing.");
      return;
    }
    // Check if the deck has been saved at least once by checking for user_id (owner_id in DB)
    if (!deck.user_id) {
      setError("Please save your deck before sharing.");
      setIsLoading(false); // Ensure loading is false if we return early
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedLink(null);

    try {
      const options: Partial<Omit<SmartShareLink, 'id' | 'deckId' | 'shareToken' | 'createdAt' | 'updatedAt' | 'created_by'>> = {
        shareType,
        targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
        focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
        customWeights: Object.keys(customWeights).length > 0 ? customWeights : undefined,
        aiAnalysisEnabled,
        expiresAt: expiresAt || undefined,
      };

      console.log('[EnhancedSharingModal] Attempting to create share link with deck.id:', deck.id, 'and user.id:', user.id, 'deck.user_id (owner):', deck.user_id);
      
      const link = await DeckService.createSmartShareLink(deck.id, user.id, options);
      // Adjust URL structure as needed, e.g. /share/deck/[token] or /d/s/[token]
      const shareableUrl = `${window.location.origin}/deck/shared/${link.shareToken}`; 
      setGeneratedLink(shareableUrl);

    } catch (err) {
      console.error("Error generating share link:", err);
      setError(err instanceof Error ? err.message : 'Failed to generate share link.');
    } finally {
      setIsLoading(false);
    }
  }, [user, deck, shareType, targetRoles, focusAreas, customWeights, aiAnalysisEnabled, expiresAt]);

  // Removed useEffect for auto-generating link to make it more explicit.
  // Link generation will now primarily be triggered by button clicks.

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
        .then(() => {
          // Consider using a toast notification for better UX
          alert('Link copied to clipboard!');
        })
        .catch(err => console.error('Failed to copy link:', err));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2>Share "{deck.title}"</h2>
          <button onClick={onClose} style={styles.closeButtonIcon}><IconX size={20} /></button>
        </div>

        {/* Level 1: Basic Share Options */}
        <div style={styles.shareOptionsGroup}>
          <label style={styles.groupLabel}>Sharing Options:</label>
          {(['view', 'feedback', 'expert_review'] as ShareType[]).map(type => (
            <label key={type} style={styles.radioLabel}>
              <input
                type="radio"
                name="shareType"
                value={type}
                checked={shareType === type}
                onChange={(e) => {
                  setShareType(e.target.value as ShareType);
                  setGeneratedLink(null); // Clear previous link when type changes
                  setError(null); // Clear previous error
                }}
              />
              {type === 'view' ? 'View Only' : type === 'feedback' ? 'Get Feedback' : 'Expert Review (Guided Feedback)'}
            </label>
          ))}
        </div>

        {/* Button to generate link for simple types if not expert_review and advanced settings are not shown */}
        {!generatedLink && !isLoading && !error && (shareType === 'view' || shareType === 'feedback') && !showAdvanced && (
          <button 
            onClick={handleGenerateLink} 
            style={{...styles.button, marginTop: '10px', width: '100%'}}
          >
            Generate {shareType === 'view' ? 'View' : 'Feedback'} Link
          </button>
        )}

        {/* Generated Link Display */}
        {(generatedLink || isLoading || error) && (
          <div style={styles.linkDisplaySection}>
            {isLoading && <p>Generating link...</p>}
            {error && <p style={styles.errorText}>{error}</p>}
            {generatedLink && !isLoading && (
              <div style={styles.linkBox}>
                <input type="text" value={generatedLink} readOnly style={styles.linkInput} />
                <button onClick={handleCopyLink} style={styles.copyButton} title="Copy link">
                  <Copy size={18} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Toggle for Advanced Settings */}
        <div style={styles.advancedSettingsToggle} onClick={() => {
          setShowAdvanced(!showAdvanced);
          // If opening advanced settings and no link exists for view/feedback, or if it's expert_review, don't auto-generate.
          // If closing advanced settings and a link was generated via advanced, it remains.
          // If closing advanced and switching to view/feedback, user will need to click "Generate" if no link exists.
          setGeneratedLink(null); // Clear link when toggling advanced settings to force regeneration with new context
          setError(null);
        }}>
          <Settings size={16} style={{ marginRight: '8px' }} />
          Advanced Settings
          {showAdvanced ? <ChevronUp size={20} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={20} style={{ marginLeft: 'auto' }} />}
        </div>

        {/* Level 2: Advanced Settings (Conditional Rendering) */}
        {showAdvanced && (
          <div style={styles.advancedSection}>
            <p className="text-sm text-gray-600 mb-3">
              Configure options for 'Expert Review' or fine-tune any share type.
            </p>
            {/* Placeholder for advanced options like roles, weights, focus areas, AI analysis, expiration */}
            <div>
              <label htmlFor="targetRoles" style={styles.label}>Target Roles (comma-separated):</label>
              <input 
                type="text" 
                id="targetRoles" 
                value={targetRoles.join(', ')} 
                onChange={(e) => setTargetRoles(e.target.value.split(',').map(role => role.trim()).filter(role => role))}
                placeholder="e.g., investor, designer"
                style={styles.inputField}
              />
            </div>
             <div>
              <label htmlFor="focusAreas" style={styles.label}>Focus Areas (comma-separated):</label>
              <input 
                type="text" 
                id="focusAreas" 
                value={focusAreas.join(', ')} 
                onChange={(e) => setFocusAreas(e.target.value.split(',').map(area => area.trim()).filter(area => area))}
                placeholder="e.g., financials, go-to-market"
                style={styles.inputField}
              />
            </div>
            <div>
              <label htmlFor="aiAnalysisEnabled" style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  id="aiAnalysisEnabled" 
                  checked={aiAnalysisEnabled} 
                  onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                />
                Enable AI Analysis
              </label>
            </div>
            <div>
              <label htmlFor="expiresAt" style={styles.label}>Expires At (Optional):</label>
              <input 
                type="datetime-local" 
                id="expiresAt" 
                value={expiresAt} 
                onChange={(e) => setExpiresAt(e.target.value)} 
                style={styles.inputField}
              />
            </div>
            
            {/* Generate/Update button for advanced settings if shareType is expert_review or if settings changed */}
            {(shareType === 'expert_review' || generatedLink) && ( // Show if expert review or if a link was already generated (implying changes might need new link)
                 <button 
                    onClick={handleGenerateLink} 
                    disabled={isLoading} 
                    style={{...styles.button, marginTop: '15px', width: '100%'}}
                  >
                {isLoading ? 'Generating...' : (generatedLink ? 'Update & Regenerate Link' : 'Generate Link with Advanced Settings')}
              </button>
            )}
          </div>
        )}
         <button onClick={onClose} style={{...styles.button, ...styles.closeAction}}>Close</button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white', padding: '24px', borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 20px 40px -20px rgba(0,0,0,0.2)',
    width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px',
    maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: '16px', borderBottom: '1px solid #e5e7eb'
  },
  closeButtonIcon: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px'
  },
  shareOptionsGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  groupLabel: { fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', padding: '8px', borderRadius: '6px' }, // Removed hover style
  linkDisplaySection: { marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  linkBox: { display: 'flex', alignItems: 'center', gap: '8px' },
  linkInput: {
    flexGrow: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
    fontSize: '0.875rem', backgroundColor: '#fff',
  }, // Removed readOnly style
  copyButton: {
    padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
    backgroundColor: '#e5e7eb', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  advancedSettingsToggle: {
    display: 'flex', alignItems: 'center', cursor: 'pointer',
    padding: '10px 12px', borderRadius: '6px', backgroundColor: '#f3f4f6',
    color: '#374151', fontSize: '0.875rem', fontWeight: 500,
    marginTop: '12px'
  },
  advancedSection: {
    padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '12px',
    display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fdfdff'
  },
  label: { display: 'block', fontWeight: 500, fontSize: '0.875rem', color: '#374151', marginBottom: '6px' },
  inputField: {
    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
    fontSize: '0.875rem', boxSizing: 'border-box'
  },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#374151', cursor: 'pointer' },
  button: {
    padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer',
    backgroundColor: '#2563eb', color: 'white', fontSize: '0.875rem', fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  closeAction: { backgroundColor: '#6b7280', marginTop: '10px', width: '100%' },
  errorText: { color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' },
};

export default EnhancedSharingModal;
