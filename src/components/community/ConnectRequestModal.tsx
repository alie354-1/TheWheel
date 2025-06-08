import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ConnectRequestModalProps {
  expertId: string;
  expertName: string;
  onClose: () => void;
  onSubmit: (message: string, expertiseArea?: string) => void;
}

export const ConnectRequestModal: React.FC<ConnectRequestModalProps> = ({
  expertId,
  expertName,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');
  const [expertiseArea, setExpertiseArea] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(message, expertiseArea);
    } finally {
      setIsSubmitting(false);
    }
  };

  // These are example expertise areas - in a real implementation, these would come from a service
  const expertiseAreas = [
    'Business Strategy',
    'Marketing',
    'Sales',
    'Product Development',
    'Finance',
    'Operations',
    'Human Resources',
    'Technology',
    'Leadership',
    'Entrepreneurship',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connect with {expertName}</h2>
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="expertise-area" className="block font-medium">
              What would you like to connect about?
            </label>
            <select
              id="expertise-area"
              value={expertiseArea}
              onChange={(e) => setExpertiseArea(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an area of expertise</option>
              {expertiseAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="block font-medium">
              Message
            </label>
            <textarea
              id="message"
              placeholder={`Introduce yourself to ${expertName} and explain why you'd like to connect...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!message.trim() || isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectRequestModal;
