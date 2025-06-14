import React from 'react';
import { X } from 'lucide-react';

interface AdviceCardProps {
  title: string;
  content: string;
  onDismiss: () => void;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ title, content, onDismiss }) => {
  return (
    <div className="card bg-base-200 shadow-md p-4 relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-base-content">{content}</p>
    </div>
  );
};

export default AdviceCard;
