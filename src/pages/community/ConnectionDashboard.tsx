import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { connectService, ConnectRequest } from '@/lib/services/connect.service';
import { sessionService, ExpertSession } from '@/lib/services/session.service';
import { availabilityService, ExpertAvailability } from '@/lib/services/availability.service';
import { toast } from '@/lib/utils/toast';
import { Button } from '@/components/ui/button';
import ExpertAvailabilityManager from '@/components/community/ExpertAvailabilityManager';

const ConnectionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [connectRequests, setConnectRequests] = useState<ConnectRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<ExpertSession[]>([]);
  const [availability, setAvailability] = useState<ExpertAvailability[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load connection requests
      const requests = await connectService.getConnectRequestsByExpert(user.id, 'pending');
      setConnectRequests(requests);

      // Load upcoming sessions
      const sessions = await sessionService.getUpcomingSessionsByExpert(user.id);
      setUpcomingSessions(sessions);

      // Load availability
      const availabilitySlots = await availabilityService.getExpertAvailability(user.id);
      setAvailability(availabilitySlots);

      // Load connected users
      const users = await connectService.getConnectedUsers(user.id);
      setConnectedUsers(users);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error Loading Data', 'There was an error loading your dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await connectService.updateConnectRequestStatus(requestId, { status: 'accepted' });
      toast.success('Request Accepted', 'You have accepted the connection request.');
      
      // Refresh the requests list
      const requests = await connectService.getConnectRequestsByExpert(user?.id || '', 'pending');
      setConnectRequests(requests);
      
      // Refresh connected users
      const users = await connectService.getConnectedUsers(user?.id || '');
      setConnectedUsers(users);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Error', 'There was an error accepting the request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await connectService.updateConnectRequestStatus(requestId, { status: 'declined' });
      toast.success('Request Declined', 'You have declined the connection request.');
      
      // Refresh the requests list
      const requests = await connectService.getConnectRequestsByExpert(user?.id || '', 'pending');
      setConnectRequests(requests);
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Error', 'There was an error declining the request. Please try again.');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await sessionService.updateSessionStatus(sessionId, 'cancelled');
      toast.success('Session Cancelled', 'The session has been cancelled.');
      
      // Refresh the sessions list
      const sessions = await sessionService.getUpcomingSessionsByExpert(user?.id || '');
      setUpcomingSessions(sessions);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Error', 'There was an error cancelling the session. Please try again.');
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await sessionService.updateSessionStatus(sessionId, 'completed');
      toast.success('Session Completed', 'The session has been marked as completed.');
      
      // Refresh the sessions list
      const sessions = await sessionService.getUpcomingSessionsByExpert(user?.id || '');
      setUpcomingSessions(sessions);
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Error', 'There was an error marking the session as completed. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Expert Connection Dashboard</h1>
        <p>Please sign in to access your connection dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Expert Connection Dashboard</h1>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Expert Connection Dashboard</h1>
      
      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('requests')}
        >
          Connection Requests {connectRequests.length > 0 && `(${connectRequests.length})`}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'sessions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('sessions')}
        >
          Upcoming Sessions {upcomingSessions.length > 0 && `(${upcomingSessions.length})`}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'connections' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('connections')}
        >
          My Connections {connectedUsers.length > 0 && `(${connectedUsers.length})`}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'availability' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('availability')}
        >
          Manage Availability
        </button>
      </div>
      
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Connection Requests</h2>
          
          {connectRequests.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You have no pending connection requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{(request as any).requester?.first_name} {(request as any).requester?.last_name}</h3>
                      <p className="text-sm text-gray-500">Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                      {request.expertise_area && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Area of Interest:</span> {request.expertise_area}
                        </p>
                      )}
                      {request.message && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Message:</p>
                          <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{request.message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          
          {upcomingSessions.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You have no upcoming sessions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {session.session_title || 'Session with'} {(session as any).connect_request?.requester?.first_name} {(session as any).connect_request?.requester?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(session.scheduled_at).toLocaleDateString()} at {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">Duration: {session.duration_minutes} minutes</p>
                      
                      {session.session_goals && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Session Goals:</p>
                          <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{session.session_goals}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCancelSession(session.id)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteSession(session.id)}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">My Connections</h2>
          
          {connectedUsers.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You have no active connections yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center space-x-3">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={`${user.first_name} ${user.last_name}`} 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{user.first_name} {user.last_name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Message
                    </Button>
                    <Button size="sm" className="w-full">
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'availability' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Manage Availability</h2>
          
          {user && <ExpertAvailabilityManager expertId={user.id} />}
        </div>
      )}
    </div>
  );
};

export default ConnectionDashboard;
