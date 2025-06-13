import React, { useState } from 'react';
import { Mail, Key } from 'lucide-react';

interface RecipientVerificationModalProps {
  recipientEmail: string;
  onVerify: (verificationCode: string) => Promise<boolean>;
  onClose: () => void;
  isVerifying: boolean;
}

export const RecipientVerificationModal: React.FC<RecipientVerificationModalProps> = ({
  recipientEmail,
  onVerify,
  onClose,
  isVerifying,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || isVerifying) return;

    setError(null);
    const success = await onVerify(verificationCode);
    if (!success) {
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verify Your Identity</h2>
        <p className="text-sm text-gray-600 mb-4">
          A verification code has been sent to <span className="font-medium">{recipientEmail}</span>. Please enter it below to access the deck.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter code..."
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !verificationCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
