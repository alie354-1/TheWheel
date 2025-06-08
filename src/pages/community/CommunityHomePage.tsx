import React from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';
import CommunityDashboard from '../../components/community/CommunityDashboard';

/**
 * Community Home Page
 * 
 * Main landing page for the community features.
 * Uses the CommunityDashboard component to display:
 * - Recent groups
 * - Active discussions
 * - Upcoming events
 */
const CommunityHomePage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
        <p className="text-gray-600">Connect, collaborate, and grow with other members of The Wheel community.</p>
      </div>
      
      {user ? (
        <CommunityDashboard 
          userId={user.id} 
          showGroups={true}
          showDiscussions={true}
          showEvents={true}
          groupsLimit={3}
          discussionsLimit={5}
          eventsLimit={3}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Please log in: </strong>
          <span className="block sm:inline">You need to be logged in to view community content.</span>
        </div>
      )}
    </div>
  );
};

export default CommunityHomePage;
