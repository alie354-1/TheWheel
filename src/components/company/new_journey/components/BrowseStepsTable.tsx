import React from 'react';
import { NewJourneyStep } from '../../../../lib/types/new_journey.types';
import { Button } from '@mui/material';

interface BrowseStepsTableProps {
  steps: NewJourneyStep[];
  onStartStep: (stepId: string) => void;
  onQuickView: (step: NewJourneyStep) => void;
}

const BrowseStepsTable: React.FC<BrowseStepsTableProps> = ({ steps, onStartStep, onQuickView }) => {
  return (
    <div className="bg-white rounded shadow p-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-4">Name</th>
            <th className="text-left py-2 px-4">Status</th>
            <th className="text-left py-2 px-4">Progress</th>
            <th className="text-left py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {steps.map(step => (
            <tr key={step.id} className="border-t">
              <td className="py-2 px-4">{step.name}</td>
              <td className="py-2 px-4">Ready</td>
              <td className="py-2 px-4">0%</td>
              <td className="py-2 px-4">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickView(step)}
                  sx={{ mr: 1 }}
                >
                  Quick View
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onStartStep(step.id)}
                  sx={{ mr: 1 }}
                >
                  Start Step
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => window.location.assign(`/company/new-journey/step/${step.id}`)}
                >
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrowseStepsTable;
