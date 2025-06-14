import React from 'react';
import { Button, Checkbox, FormControlLabel, Input, TextareaAutosize } from '@mui/material';
import { NewCompanyJourneyStep, NewStepOutcome, NewStepTask } from '../../../../lib/types/new_journey.types';

interface OutcomeCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcomeData: Partial<Omit<NewStepOutcome, 'id' | 'created_at'>>;
  onChange: (field: keyof Omit<NewStepOutcome, 'id' | 'created_at'>, value: any) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  step: NewCompanyJourneyStep;
  tasks: NewStepTask[];
}

const OutcomeCaptureModal: React.FC<OutcomeCaptureModalProps> = ({ 
  isOpen, 
  onClose, 
  outcomeData, 
  onChange, 
  onSubmit, 
  isSubmitting,
  step,
  tasks
}) => {
  if (!isOpen) {
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
        <h2 className="text-xl font-bold mb-4">Capture Outcome: {step.name}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Taken (days)</label>
            <Input
              type="number"
              fullWidth
              value={outcomeData.time_taken_days || ''}
              onChange={(e) => onChange('time_taken_days', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confidence Level (1-5)</label>
            <Input
              type="number"
              fullWidth
              value={outcomeData.confidence_level || ''}
              onChange={(e) => onChange('confidence_level', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 5 }}
            />
          </div>
          
          {tasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Results</label>
              <div className="space-y-3 border rounded p-3 bg-gray-50">
                {tasks.map(task => (
                  <div key={task.id} className="space-y-1">
                    <p className="text-sm font-medium">{task.name}</p>
                    <TextareaAutosize
                      minRows={2}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="Enter notes about this task's outcome..."
                      value={(outcomeData.task_results || {})[task.id] || ''}
                      onChange={(e) => {
                        const updatedResults = {
                          ...(outcomeData.task_results || {}),
                          [task.id]: e.target.value
                        };
                        onChange('task_results', updatedResults);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Key Learnings</label>
            <TextareaAutosize
              minRows={3}
              className="w-full border rounded p-2"
              placeholder="Enter key takeaways, one per line"
              value={(outcomeData.key_learnings || []).join('\n')}
              onChange={(e) => onChange('key_learnings', e.target.value.split('\n').filter(line => line.trim()))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <TextareaAutosize
              minRows={3}
              className="w-full border rounded p-2"
              placeholder="Enter any additional notes or context"
              value={outcomeData.notes || ''}
              onChange={(e) => onChange('notes', e.target.value)}
            />
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={outcomeData.share_anonymously || false}
                onChange={(e) => onChange('share_anonymously', e.target.checked)}
              />
            }
            label="Share results anonymously with the community"
          />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutcomeCaptureModal;
