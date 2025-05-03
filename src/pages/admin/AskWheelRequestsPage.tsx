import React, { useState, useEffect } from 'react';
import { askWheelService, AskWheelRequest } from '../../lib/services/askWheel.service';
import { supabase } from '../../lib/supabase';

interface RequestWithDetails extends AskWheelRequest {
  journey_steps?: {
    id: string;
    name: string;
    phase_id: string;
  };
  users?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

const AskWheelRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  // Fetch all requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the current user ID
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }
        
        // Check if user is an admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {
          throw new Error('Error checking admin status');
        }
        
        if (!roleData) {
          throw new Error('Unauthorized: Admin access required');
        }
        
        // Fetch all requests with details
        const { data: requestsData, error: requestsError } = await supabase
          .from('ask_wheel_requests')
          .select(`
            *,
            journey_steps (
              id,
              name,
              phase_id
            ),
            users (
              id,
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (requestsError) {
          throw new Error(`Failed to fetch requests: ${requestsError.message}`);
        }
        
        setRequests(requestsData || []);
      } catch (err: any) {
        console.error('Error fetching requests:', err);
        setError(err.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  // Handle responding to a request
  const handleSubmitResponse = async () => {
    if (!selectedRequest || !responseText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the current user ID
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      // Submit the response
      const updatedRequest = await askWheelService.respondToQuestion(
        selectedRequest.id!,
        responseText,
        user.id
      );
      
      // Update the requests list
      setRequests(prev => 
        prev.map(req => 
          req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
        )
      );
      
      // Reset the form
      setResponseText('');
      setSelectedRequest(null);
      
    } catch (err: any) {
      console.error('Error submitting response:', err);
      alert('Failed to submit response: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter requests based on status
  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'submitted';
    if (filter === 'resolved') return req.status === 'resolved';
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ask The Wheel Requests</h1>
      
      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="tabs tabs-boxed">
          <a 
            className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </a>
          <a 
            className={`tab ${filter === 'pending' ? 'tab-active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </a>
          <a 
            className={`tab ${filter === 'resolved' ? 'tab-active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </a>
        </div>
        
        <div className="text-sm text-base-content/70">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-base-content/70">
          No requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map(request => (
            <div 
              key={request.id} 
              className={`card bg-base-100 shadow-md ${selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-lg">
                    Question about {request.journey_steps?.name || 'a step'}
                    {request.status === 'submitted' && (
                      <div className="badge badge-primary">New</div>
                    )}
                    {request.status === 'resolved' && (
                      <div className="badge badge-success">Resolved</div>
                    )}
                  </h2>
                  <div className="text-sm text-base-content/70">
                    {new Date(request.created_at!).toLocaleDateString()}
                  </div>
                </div>
                
                <p className="text-base-content/80 mt-2">
                  {request.question_text}
                </p>
                
                <div className="text-sm text-base-content/70 mt-2">
                  From: {request.users?.full_name || request.users?.email || 'Unknown user'}
                </div>
                
                {request.response_text && (
                  <div className="mt-4 bg-base-200 p-4 rounded-lg">
                    <div className="font-medium mb-2">Response:</div>
                    <p>{request.response_text}</p>
                    <div className="text-sm text-base-content/70 mt-2">
                      Responded: {new Date(request.responded_at!).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {request.status !== 'resolved' && (
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                      }}
                    >
                      Respond
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Respond to Question</h3>
            
            <div className="mb-4">
              <div className="font-medium">Question:</div>
              <p className="text-base-content/80">{selectedRequest.question_text}</p>
              <div className="text-sm text-base-content/70 mt-2">
                From: {selectedRequest.users?.full_name || selectedRequest.users?.email || 'Unknown user'}
              </div>
            </div>
            
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Your Response</span>
              </label>
              <textarea 
                className="textarea textarea-bordered" 
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedRequest(null);
                  setResponseText('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSubmitResponse}
                disabled={isSubmitting || !responseText.trim()}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  'Submit Response'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskWheelRequestsPage;
