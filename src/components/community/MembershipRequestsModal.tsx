import React, { useEffect, useState } from 'react';
import { communityService } from '../../lib/services/community';
import { GroupMembership, MembershipStatus } from '../../lib/types/community.types';

interface MembershipRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onMembershipUpdated?: () => void;
}

/**
 * MembershipRequestsModal Component
 * 
 * A modal for group admins to manage pending membership requests.
 * Allows approving or rejecting membership requests.
 */
const MembershipRequestsModal: React.FC<MembershipRequestsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  onMembershipUpdated
}) => {
  const [pendingRequests, setPendingRequests] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Fetch pending membership requests
  useEffect(() => {
    if (isOpen && groupId) {
      fetchPendingRequests();
    }
  }, [isOpen, groupId]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requests = await communityService.getPendingMemberships(groupId);
      setPendingRequests(requests);
    } catch (err) {
      console.error('Error fetching pending membership requests:', err);
      setError('Failed to load membership requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle approving or rejecting a membership request
  const handleUpdateMembershipStatus = async (membershipId: string, newStatus: MembershipStatus) => {
    try {
      setProcessingIds(prev => [...prev, membershipId]);
      setError(null);
      
      await communityService.updateMembershipStatus(membershipId, newStatus);
      
      // Remove the processed request from the list
      setPendingRequests(prev => prev.filter(request => request.id !== membershipId));
      
      // Notify parent component if needed
      if (onMembershipUpdated) {
        onMembershipUpdated();
      }
    } catch (err) {
      console.error(`Error ${newStatus === 'active' ? 'approving' : 'rejecting'} membership:`, err);
      setError(`Failed to ${newStatus === 'active' ? 'approve' : 'reject'} membership. Please try again.`);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== membershipId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Pending Membership Requests</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending membership requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-4">
                      {request.user_avatar_url ? (
                        <img 
                          src={request.user_avatar_url} 
                          alt={request.user_name || 'User'} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
                          {(request.user_name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{request.user_name || 'Anonymous User'}</h3>
                      <p className="text-sm text-gray-500">Requested to join on {new Date(request.join_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleUpdateMembershipStatus(request.id, 'rejected')}
                      disabled={processingIds.includes(request.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        processingIds.includes(request.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateMembershipStatus(request.id, 'active')}
                      disabled={processingIds.includes(request.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        processingIds.includes(request.id)
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {processingIds.includes(request.id) ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Approve'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipRequestsModal;
