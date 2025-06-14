import React, { useState, useEffect, useCallback } from 'react';
import { DeckService } from '../../services/deckService.ts';
import { SmartShareLink, ShareType, Deck, DeckShareRecipient } from '../../types/index.ts';
import { useAuth } from '../../../lib/contexts/AuthContext.tsx';
import { Copy, X as IconX, ChevronLeft, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';

interface EnhancedSharingModalProps {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
}

type RecipientInput = Omit<DeckShareRecipient, 'id' | 'share_link_id' | 'created_at' | 'verified_at' | 'access_code'>;

const MODE_OPTIONS: { value: ShareType; label: string; description: string; tooltip: string }[] = [
  {
    value: 'feedback',
    label: 'Regular Feedback',
    description: 'Anyone with the link can leave feedback. Optionally require verification or allow anonymous feedback.',
    tooltip: 'Open feedback for anyone, or restrict with verification. Good for broad input.',
  },
  {
    value: 'expert_review',
    label: 'Expert Review',
    description: 'Only invited experts can leave feedback. Assign roles and weights. Verification is always required.',
    tooltip: 'Structured review by specific people. Assign roles and feedback weights.',
  },
  {
    value: 'view',
    label: 'View Only',
    description: 'No feedback allowed. Recipients can only view the deck.',
    tooltip: 'Share a read-only link. No comments or feedback possible.',
  },
];

const PRESET_ROLES = ['Designer', 'Business Expert', 'Investor', 'Technical Lead', 'General', 'Content', 'Form'];

export const EnhancedSharingModal: React.FC<EnhancedSharingModalProps> = ({ deck, isOpen, onClose }) => {
  const { user } = useAuth();
  
  // Stepper state: 0 = mode select, 1 = options, 2 = summary/link
  const [step, setStep] = useState(0);
  
  // Step 0: Mode selection
  const [shareType, setShareType] = useState<ShareType | null>(null);
  
  // Step 1: Mode-specific options
  const [recipients, setRecipients] = useState<RecipientInput[]>([]);
  const [newRecipient, setNewRecipient] = useState<RecipientInput>({
    email: '',
    role: 'General',
    feedback_weight: 1.0
  });
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [allowAnonymousFeedback, setAllowAnonymousFeedback] = useState(false);
  const [creatorIsAnonymous, setCreatorIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [authorNote, setAuthorNote] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState(true); // Default to true for first-time users
  
  // Step 2: Summary/link
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset all state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setShareType(null);
      setRecipients([]);
      setNewRecipient({ email: '', role: 'General', feedback_weight: 1.0 });
      setRequiresVerification(false);
      setAllowAnonymousFeedback(false);
      setCreatorIsAnonymous(false);
      setExpiresAt('');
      setGeneratedLink(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  // Step 1: Validation logic
  const canProceedToOptions = shareType !== null;
  const canProceedToSummary = (() => {
    if (shareType === 'feedback') {
      // No required fields
      return true;
    }
    if (shareType === 'expert_review') {
      // At least one recipient required, all must have email/phone, role, and weight
      return recipients.length > 0 && recipients.every(r => (r.email || r.phone) && r.role && r.feedback_weight > 0);
    }
    if (shareType === 'view') {
      return true;
    }
    return false;
  })();

  // Step 2: Generate link
  const handleGenerateLink = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to share a deck.");
      return;
    }
    if (!deck || !deck.id) {
      setError("Deck information is missing.");
      return;
    }
    if (!deck.user_id) {
      setError("Please save your deck before sharing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedLink(null);

    try {
      const options: Partial<Omit<SmartShareLink, 'id' | 'deckId' | 'shareToken' | 'createdAt' | 'updatedAt' | 'created_by'>> = {
        shareType: shareType!,
        expiresAt: expiresAt || undefined,
        requires_verification: shareType === 'expert_review' ? true : requiresVerification,
        allow_anonymous_feedback: shareType === 'feedback' ? allowAnonymousFeedback : undefined,
        creator_is_anonymous: creatorIsAnonymous,
        author_note: authorNote || undefined,
        show_tutorial: showTutorial,
      };

      const link = await DeckService.createSmartShareLink(deck.id, user.id, options);

      if (shareType === 'expert_review' && recipients.length > 0) {
        const recipientsWithCode = recipients.map(r => ({
          ...r,
          access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        }));
        await DeckService.addShareRecipients(link.id, recipientsWithCode);
      } else if (shareType === 'feedback' && recipients.length > 0 && requiresVerification) {
        const recipientsWithCode = recipients.map(r => ({
          ...r,
          access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        }));
        await DeckService.addShareRecipients(link.id, recipientsWithCode);
      }

      const shareableUrl = `${window.location.origin}/deck/shared/${link.shareToken}`;
      setGeneratedLink(shareableUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link.');
    } finally {
      setIsLoading(false);
    }
  }, [user, deck, shareType, recipients, requiresVerification, allowAnonymousFeedback, creatorIsAnonymous, expiresAt]);

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy link:', err));
    }
  };

  // UI for Step 0: Mode selection
  const renderStep0 = () => (
    <div>
      <h3 style={styles.stepTitle}>Select Sharing Mode</h3>
      <div style={styles.modeOptionsRow}>
        {MODE_OPTIONS.map(option => (
          <label
            key={option.value}
            style={{
              ...styles.modeOption,
              borderColor: shareType === option.value ? '#2563eb' : '#d1d5db',
              background: shareType === option.value ? '#eff6ff' : '#fff',
            }}
            title={option.tooltip}
          >
            <input
              type="radio"
              name="shareType"
              value={option.value}
              checked={shareType === option.value}
              onChange={() => setShareType(option.value)}
              style={styles.radioInput}
            />
            <div style={circleRadio(shareType === option.value)} />
            <div>
              <div style={styles.modeLabel}>{option.label}</div>
              <div style={styles.modeDescription}>{option.description}</div>
            </div>
          </label>
        ))}
      </div>
      <div style={styles.stepNavRow}>
        <button
          style={{ ...styles.button, ...styles.nextButton }}
          disabled={!canProceedToOptions}
          onClick={() => setStep(1)}
        >
          Next <ChevronRight size={18} style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  );

  // UI for Step 1: Mode-specific options
  const renderStep1 = () => {
    if (shareType === 'feedback') {
      return (
        <div>
          <h3 style={styles.stepTitle}>Feedback Options</h3>
          <div style={styles.optionsSection}>
            <div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={allowAnonymousFeedback}
                  onChange={e => setAllowAnonymousFeedback(e.target.checked)}
                />
                Allow anonymous feedback
              </label>
            </div>
            <div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={requiresVerification}
                  onChange={e => setRequiresVerification(e.target.checked)}
                />
                Require email/phone verification for invited recipients
              </label>
            </div>
            <div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={creatorIsAnonymous}
                  onChange={e => setCreatorIsAnonymous(e.target.checked)}
                />
                Share as anonymous creator
              </label>
            </div>
            <div>
              <label style={styles.label}>Expires At (Optional):</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                style={styles.inputField}
              />
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <div style={styles.groupLabel}>Additional Options</div>
              <div>
                <label style={styles.label}>Author Note (Optional):</label>
                <textarea
                  placeholder="Leave a note or instructions for reviewers..."
                  value={authorNote}
                  onChange={e => setAuthorNote(e.target.value)}
                  style={{ ...styles.inputField, minHeight: 80, resize: 'vertical' } as React.CSSProperties}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showTutorial}
                    onChange={e => setShowTutorial(e.target.checked)}
                  />
                  Show interactive tutorial for first-time reviewers
                </label>
                <div style={{ fontSize: '0.85em', color: '#6b7280', marginLeft: 24, marginTop: 4 }}>
                  Helps reviewers understand how to add comments, voice notes, and navigate the feedback system
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={styles.groupLabel}>Invite Specific People (optional)</div>
              {recipients.map((recipient, idx) => (
                <div key={idx} style={styles.recipientRow}>
                  <span>{recipient.email || recipient.phone} ({recipient.role}, {recipient.feedback_weight}x)</span>
                  <button
                    onClick={() => setRecipients(recipients.filter((_, i) => i !== idx))}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div style={styles.addRecipientForm}>
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={newRecipient.email || newRecipient.phone || ''}
                  onChange={e => {
                    const value = e.target.value;
                    if (value.includes('@')) {
                      setNewRecipient({ ...newRecipient, email: value, phone: undefined });
                    } else {
                      setNewRecipient({ ...newRecipient, email: undefined, phone: value });
                    }
                  }}
                  style={{ ...styles.inputField, flex: 2 }}
                />
                <select
                  value={newRecipient.role}
                  onChange={e => setNewRecipient({ ...newRecipient, role: e.target.value })}
                  style={{ ...styles.inputField, flex: 1 }}
                >
                  {PRESET_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <input
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={newRecipient.feedback_weight}
                  onChange={e => setNewRecipient({ ...newRecipient, feedback_weight: parseFloat(e.target.value) })}
                  style={{ ...styles.inputField, flex: 0.5 }}
                />
                <button
                  onClick={() => {
                    if ((newRecipient.email || newRecipient.phone) && newRecipient.role && newRecipient.feedback_weight > 0) {
                      setRecipients([...recipients, newRecipient]);
                      setNewRecipient({ email: '', role: 'General', feedback_weight: 1.0 });
                    }
                  }}
                  style={styles.addButton}
                  title="Add recipient"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
          </div>
          <div style={styles.stepNavRow}>
            <button
              style={{ ...styles.button, ...styles.backButton }}
              onClick={() => setStep(0)}
            >
              <ChevronLeft size={18} style={{ marginRight: 4 }} />
              Back
            </button>
            <button
              style={{ ...styles.button, ...styles.nextButton }}
              onClick={() => setStep(2)}
              disabled={!canProceedToSummary}
            >
              Next <ChevronRight size={18} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </div>
      );
    }

    if (shareType === 'expert_review') {
      return (
        <div>
          <h3 style={styles.stepTitle}>Expert Review Options</h3>
          <div style={styles.optionsSection}>
            <div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={creatorIsAnonymous}
                  onChange={e => setCreatorIsAnonymous(e.target.checked)}
                />
                Share as anonymous creator
              </label>
            </div>
            <div>
              <label style={styles.label}>Expires At (Optional):</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  style={styles.inputField}
                />
              </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <div style={styles.groupLabel}>Additional Options</div>
              <div>
                <label style={styles.label}>Author Note (Optional):</label>
                <textarea
                  placeholder="Leave a note or instructions for reviewers..."
                  value={authorNote}
                  onChange={e => setAuthorNote(e.target.value)}
                  style={{ ...styles.inputField, minHeight: 80, resize: 'vertical' } as React.CSSProperties}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showTutorial}
                    onChange={e => setShowTutorial(e.target.checked)}
                  />
                  Show interactive tutorial for first-time reviewers
                </label>
                <div style={{ fontSize: '0.85em', color: '#6b7280', marginLeft: 24, marginTop: 4 }}>
                  Helps reviewers understand how to add comments, voice notes, and navigate the feedback system
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={styles.groupLabel}>Invite Experts (required)</div>
              <div style={{ fontSize: '0.93em', color: '#6366f1', marginBottom: 6 }}>
                <div>
                  <strong>Role:</strong> The area of expertise for this reviewer (e.g., "Designer", "Investor", or your own custom type).
                </div>
                <div>
                  <strong>Weight:</strong> How much this expert's feedback counts. For example, 2x = double weight, 3x = triple weight. Only whole numbers allowed.
                </div>
                <div>
                  You can select a role from the list or type your own and press Enter.
                </div>
              </div>
              {recipients.map((recipient, idx) => (
                <div key={idx} style={styles.recipientRow}>
                  <span>{recipient.email || recipient.phone} ({recipient.role}, {recipient.feedback_weight}x)</span>
                  <button
                    onClick={() => setRecipients(recipients.filter((_, i) => i !== idx))}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div style={styles.addRecipientForm}>
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={newRecipient.email || newRecipient.phone || ''}
                  onChange={e => {
                    const value = e.target.value;
                    if (value.includes('@')) {
                      setNewRecipient({ ...newRecipient, email: value, phone: undefined });
                    } else {
                      setNewRecipient({ ...newRecipient, email: undefined, phone: value });
                    }
                  }}
                  style={{ ...styles.inputField, flex: 2 }}
                />
                <input
                  type="text"
                  list="expert-role-suggestions"
                  placeholder="Role (e.g. Designer, Investor, ...)"
                  value={newRecipient.role}
                  onChange={e => setNewRecipient({ ...newRecipient, role: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newRecipient.role.trim() !== '') {
                      // Add custom role to PRESET_ROLES if not present (in-memory only)
                      if (!PRESET_ROLES.includes(newRecipient.role.trim())) {
                        PRESET_ROLES.push(newRecipient.role.trim());
                      }
                    }
                  }}
                  style={{ ...styles.inputField, flex: 1 }}
                />
                <datalist id="expert-role-suggestions">
                  {PRESET_ROLES.map(role => <option key={role} value={role} />)}
                </datalist>
                <select
                  value={newRecipient.feedback_weight}
                  onChange={e => setNewRecipient({ ...newRecipient, feedback_weight: parseInt(e.target.value, 10) })}
                  style={{ ...styles.inputField, flex: 0.5 }}
                >
                  {[1, 2, 3, 4, 5].map(w => (
                    <option key={w} value={w}>{w}x</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if ((newRecipient.email || newRecipient.phone) && newRecipient.role && newRecipient.feedback_weight > 0) {
                      // Add custom role to PRESET_ROLES if not present (in-memory only)
                      if (!PRESET_ROLES.includes(newRecipient.role.trim())) {
                        PRESET_ROLES.push(newRecipient.role.trim());
                      }
                      setRecipients([...recipients, newRecipient]);
                      setNewRecipient({ email: '', role: 'General', feedback_weight: 1.0 });
                    }
                  }}
                  style={styles.addButton}
                  title="Add expert"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: 8, color: '#6366f1', fontSize: '0.9em' }}>
              Verification is always required for expert review. Anonymous feedback is not available.
            </div>
          </div>
          <div style={styles.stepNavRow}>
            <button
              style={{ ...styles.button, ...styles.backButton }}
              onClick={() => setStep(0)}
            >
              <ChevronLeft size={18} style={{ marginRight: 4 }} />
              Back
            </button>
            <button
              style={{ ...styles.button, ...styles.nextButton }}
              onClick={() => setStep(2)}
              disabled={!canProceedToSummary}
            >
              Next <ChevronRight size={18} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </div>
      );
    }

    if (shareType === 'view') {
      return (
        <div>
          <h3 style={styles.stepTitle}>View Only</h3>
          <div style={styles.optionsSection}>
            <div style={{ marginBottom: 12 }}>
              <span>This link will allow recipients to view the deck, but not leave feedback.</span>
            </div>
            <div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={creatorIsAnonymous}
                  onChange={e => setCreatorIsAnonymous(e.target.checked)}
                />
                Share as anonymous creator
              </label>
            </div>
            <div>
              <label style={styles.label}>Expires At (Optional):</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                style={styles.inputField}
              />
            </div>
          </div>
          <div style={styles.stepNavRow}>
            <button
              style={{ ...styles.button, ...styles.backButton }}
              onClick={() => setStep(0)}
            >
              <ChevronLeft size={18} style={{ marginRight: 4 }} />
              Back
            </button>
            <button
              style={{ ...styles.button, ...styles.nextButton }}
              onClick={() => setStep(2)}
              disabled={!canProceedToSummary}
            >
              Next <ChevronRight size={18} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // UI for Step 2: Summary and link
  const renderStep2 = () => (
    <div>
      <h3 style={styles.stepTitle}>Share Link</h3>
      <div style={styles.summarySection}>
        <div>
          <strong>Mode:</strong> {MODE_OPTIONS.find(opt => opt.value === shareType)?.label}
        </div>
        {shareType === 'feedback' && (
          <ul style={styles.summaryList}>
            <li>Allow anonymous feedback: {allowAnonymousFeedback ? 'Yes' : 'No'}</li>
            <li>Require verification: {requiresVerification ? 'Yes' : 'No'}</li>
            <li>Share as anonymous creator: {creatorIsAnonymous ? 'Yes' : 'No'}</li>
            <li>Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'Never'}</li>
            <li>Invited recipients: {recipients.length > 0 ? recipients.map(r => r.email || r.phone).join(', ') : 'None'}</li>
          </ul>
        )}
        {shareType === 'expert_review' && (
          <ul style={styles.summaryList}>
            <li>Verification required: Yes</li>
            <li>Share as anonymous creator: {creatorIsAnonymous ? 'Yes' : 'No'}</li>
            <li>Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'Never'}</li>
            <li>Experts invited: {recipients.length > 0 ? recipients.map(r => r.email || r.phone).join(', ') : 'None'}</li>
          </ul>
        )}
        {shareType === 'view' && (
          <ul style={styles.summaryList}>
            <li>View only: No feedback allowed</li>
            <li>Share as anonymous creator: {creatorIsAnonymous ? 'Yes' : 'No'}</li>
            <li>Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'Never'}</li>
          </ul>
        )}
      </div>
      <div style={styles.linkDisplaySection}>
        <button
          style={{ ...styles.button, width: '100%', marginBottom: 10 }}
          onClick={handleGenerateLink}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : (generatedLink ? 'Regenerate Link' : 'Generate Link')}
        </button>
        {error && <div style={styles.errorText}>{error}</div>}
        {generatedLink && (
          <div style={styles.linkBox}>
            <input
              type="text"
              value={generatedLink}
              readOnly
              style={styles.linkInput}
            />
            <button
              onClick={handleCopyLink}
              style={styles.copyButton}
              title="Copy link"
            >
              <Copy size={18} />
            </button>
          </div>
        )}
      </div>
      <div style={styles.stepNavRow}>
        <button
          style={{ ...styles.button, ...styles.backButton }}
          onClick={() => setStep(1)}
        >
          <ChevronLeft size={18} style={{ marginRight: 4 }} />
          Back
        </button>
        <button
          style={{ ...styles.button, ...styles.closeButton }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2>Share "{deck.title}"</h2>
          <button onClick={onClose} style={styles.closeButtonIcon}>
            <IconX size={20} />
          </button>
        </div>
        <div style={styles.progressBarContainer}>
          <div style={{ ...styles.progressBar, width: `${((step + 1) / 3) * 100}%` }} />
        </div>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
};

const circleRadio = (selected?: boolean): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  border: `2px solid ${selected ? '#2563eb' : '#d1d5db'}`,
  background: selected ? '#2563eb' : '#fff',
  marginTop: 2,
  marginRight: 8,
  flexShrink: 0,
  boxShadow: selected ? '0 0 0 2px #2563eb33' : undefined,
  display: 'inline-block',
});

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 20px 40px -20px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  closeButtonIcon: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    background: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: '#2563eb',
    borderRadius: 4,
    transition: 'width 0.3s'
  },
  stepTitle: {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: 12,
    color: '#1e293b'
  },
  modeOptionsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: 16
  },
  modeOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    background: '#fff',
    transition: 'border-color 0.2s, background 0.2s'
  },
  radioInput: {
    display: 'none'
  },
  modeLabel: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#1e293b',
    marginBottom: 2
  },
  modeDescription: {
    fontSize: '0.95rem',
    color: '#475569',
    marginTop: 2
  },
  stepNavRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24
  },
  button: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  nextButton: {},
  backButton: {
    backgroundColor: '#6b7280'
  },
  closeButton: {
    backgroundColor: '#6b7280'
  },
  optionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  groupLabel: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#374151',
    marginBottom: '4px'
  },
  label: {
    display: 'block',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '6px'
  },
  inputField: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    boxSizing: 'border-box'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer'
  },
  addRecipientForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  addButton: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    cursor: 'pointer',
    padding: '4px'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '4px'
  },
  recipientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  summarySection: {
    marginBottom: 16
  },
  summaryList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: '0.97em',
    color: '#374151'
  },
  linkDisplaySection: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  linkBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  linkInput: {
    flexGrow: 1,
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
  },
  copyButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.875rem',
    textAlign: 'center'
  }
};
