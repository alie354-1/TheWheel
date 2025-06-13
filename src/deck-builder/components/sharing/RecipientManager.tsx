import React from 'react';
import { DeckShareRecipient } from '../../types';
import { User, Mail, Trash2, Edit, Eye, MessageSquare } from 'lucide-react';

interface RecipientManagerProps {
  recipients: DeckShareRecipient[];
  onUpdateRecipient: (recipientId: string, updates: Partial<Pick<DeckShareRecipient, 'permissionLevel' | 'canReshare'>>) => void;
  onRemoveRecipient: (recipientId: string) => void;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({ recipients, onUpdateRecipient, onRemoveRecipient }) => {
  if (recipients.length === 0) {
    return <p className="text-sm text-gray-500">No one has been invited yet.</p>;
  }

  return (
    <div className="space-y-3">
      {recipients.map((recipient) => (
        <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {recipient.userProfile?.avatar_url ? (
                <img src={recipient.userProfile.avatar_url} alt={recipient.userProfile.display_name} className="h-10 w-10 rounded-full" />
              ) : (
                <User className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">{recipient.userProfile?.display_name || 'Pending Invitation'}</p>
              <p className="text-sm text-gray-500 flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{recipient.recipientEmail}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={recipient.permissionLevel}
              onChange={(e) => onUpdateRecipient(recipient.id, { permissionLevel: e.target.value as 'view' | 'comment' })}
              className="p-1.5 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="comment">Can Comment</option>
              <option value="view">View Only</option>
            </select>
            <label className="flex items-center space-x-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={recipient.canReshare}
                onChange={(e) => onUpdateRecipient(recipient.id, { canReshare: e.target.checked })}
              />
              <span>Re-share</span>
            </label>
            <button
              onClick={() => onRemoveRecipient(recipient.id)}
              className="text-gray-400 hover:text-red-500"
              title="Remove recipient"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
