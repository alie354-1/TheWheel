import React from 'react';
import { NewJourneyStep } from '../../../../lib/types/new_journey.types';
import { Button } from '@mui/material';

interface QuickViewModalProps {
  step: NewJourneyStep | null;
  isOpen: boolean;
  onClose: () => void;
  onStartStep: (stepId: string) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ step, isOpen, onClose, onStartStep }) => {
  if (!isOpen || !step) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2">{step.name}</h2>
        <p className="text-gray-600 mb-6">{step.description}</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold">Details</h3>
          <p><strong>Difficulty:</strong> {step.difficulty}</p>
          <p><strong>Estimated Time:</strong> {step.estimated_days || 'N/A'} days</p>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={() => onStartStep(step.id)}>
            Start Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
