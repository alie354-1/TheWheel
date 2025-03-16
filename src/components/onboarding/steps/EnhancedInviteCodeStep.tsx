import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import { enhancedOnboardingService } from '../../../lib/services/enhanced-onboarding.service';
import { enhancedProfileService } from '../../../lib/services/enhanced-profile.service';

interface EnhancedInviteCodeStepProps {
  onNext: (data: { inviteCode: string }) => void;
  onBack: () => void;
  initialValue?: string;
}

export const EnhancedInviteCodeStep: React.FC<EnhancedInviteCodeStepProps> = ({
  onNext,
  onBack,
  initialValue
}) => {
  const [inviteCode, setInviteCode] = useState<string>(initialValue || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const userId = useAuthStore(state => state.user?.id);

  const handleVerifyInvitation = async () => {
    if (!inviteCode.trim() || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Verify the invitation code
      const invitation = await enhancedProfileService.getCompanyInvitation(inviteCode.trim());
      
      if (!invitation) {
        setError('Invalid invitation code or the invitation has expired.');
        return;
      }
      
      setSuccess('Invitation verified successfully. You will be added to the company.');
    } catch (error) {
      console.error('Error verifying invitation:', error);
      setError('An error occurred while verifying the invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value);
    // Clear any previous error/success messages
    setError(null);
    setSuccess(null);
  };

  const handleContinue = async () => {
    if (!inviteCode.trim() || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Verify the invitation one more time if not already verified
      if (!success) {
        const invitation = await enhancedProfileService.getCompanyInvitation(inviteCode.trim());
        
        if (!invitation) {
          setError('Invalid invitation code or the invitation has expired.');
          setLoading(false);
          return;
        }
      }
      
      // Accept the invitation (this will be done in the service)
      const accepted = await enhancedOnboardingService.acceptInvitation(userId, inviteCode.trim());
      
      if (!accepted) {
        setError('Failed to accept the invitation. Please try again.');
        setLoading(false);
        return;
      }
      
      // Send to parent component to handle navigation
      onNext({ inviteCode: inviteCode.trim() });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('An error occurred while accepting the invitation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Join Your Company</h2>
      <p className="text-gray-600 mb-8">
        Enter the invitation code you received from your company administrator to join your company workspace.
      </p>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="mb-6">
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
            Invitation Code
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="inviteCode"
              id="inviteCode"
              value={inviteCode}
              onChange={handleInputChange}
              className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              placeholder="Enter your invitation code (e.g., ABC123)"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleVerifyInvitation}
              disabled={!inviteCode.trim() || loading}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              <i className="fas fa-exclamation-circle mr-1"></i> {error}
            </div>
          )}
          
          {success && (
            <div className="mt-2 text-sm text-green-600">
              <i className="fas fa-check-circle mr-1"></i> {success}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <i className="fas fa-info-circle mr-1"></i> Don't have an invitation code? Ask your company administrator to send you one.
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">What happens when you join a company?</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>You'll be added to your company's workspace</li>
          <li>You'll get access to company resources and teams</li>
          <li>Your profile will be updated to reflect your company membership</li>
          <li>You can still maintain your personal profile and set additional roles</li>
        </ul>
      </div>

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!inviteCode.trim() || loading}
          className={`px-6 py-2 rounded-md ${
            inviteCode.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};
