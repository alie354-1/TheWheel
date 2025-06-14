import React from 'react';
import { X, FileText } from 'lucide-react';

interface PresenterNotesPanelProps {
  notes?: string; // Notes for the current slide
  isVisible: boolean;
  onClose: () => void;
}

const PresenterNotesPanel: React.FC<PresenterNotesPanelProps> = ({
  notes,
  isVisible,
  onClose,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="presenter-notes-panel">
      <div className="presenter-notes-header">
        <div className="presenter-notes-title">
          <FileText size={18} className="mr-2" />
          Presenter Notes
        </div>
        <button
          onClick={onClose}
          className="presenter-notes-close-button"
          aria-label="Close presenter notes"
        >
          <X size={20} />
        </button>
      </div>
      <div className="presenter-notes-content">
        {notes ? (
          <div dangerouslySetInnerHTML={{ __html: notes }} />
        ) : (
          <p className="text-gray-400 italic">No notes for this slide.</p>
        )}
      </div>
    </div>
  );
};

export default PresenterNotesPanel;
