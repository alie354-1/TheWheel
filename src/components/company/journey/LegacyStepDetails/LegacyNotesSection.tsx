import React, { useState } from "react";

interface NotesSectionProps {
  notes: string;
  onSave: (notes: string) => void;
  isSaving?: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onSave, isSaving }) => {
  const [value, setValue] = useState(notes);

  const handleSave = () => {
    if (value !== notes) {
      onSave(value);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Notes</h2>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Add your notes here..."
        />
        <div className="mt-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving || value === notes}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Save Notes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
