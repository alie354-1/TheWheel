import React, { useState } from 'react';
import { CreateCommunityGroupRequest } from '../../lib/types/community.types';
import CreateGroupForm from './CreateGroupForm';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

/**
 * CreateGroupModal Component
 * 
 * A modal dialog for creating a new community group.
 * Can be opened from the CommunityGroupsPage or CommunityDashboard.
 */
const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal when clicking outside or on close button
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Handle successful group creation
  const handleSuccess = (groupId: string) => {
    if (onSuccess) {
      onSuccess(groupId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-6"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 p-4 md:p-6">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">Create New Community Group</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 md:p-6">
          <CreateGroupForm 
            onSubmit={handleSuccess} 
            onCancel={onClose} 
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
