import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityService, discussionService, eventService } from '../../lib/services/community';
import CreateGroupModal from './CreateGroupModal';
import './CommunityDashboard.css';

interface CommunityDashboardProps {
  userId: string;
  showGroups?: boolean;
  showDiscussions?: boolean;
  showEvents?: boolean;
  groupsLimit?: number;
  discussionsLimit?: number;
  eventsLimit?: number;
  className?: string;
}

/**
 * CommunityDashboard Component
 * 
 * A reusable dashboard component for displaying community information.
 * Can be configured to show/hide different sections and control the number of items displayed.
 */
const CommunityDashboard: React.FC<CommunityDashboardProps> = ({
  userId,
  showGroups = true,
  showDiscussions = true,
  showEvents = true,
  groupsLimit = 3,
  discussionsLimit = 5,
  eventsLimit = 3,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        
        // Prepare fetch promises based on what we need to show
        const fetchPromises: Promise<any>[] = [];
        
        if (showGroups) {
          fetchPromises.push(communityService.getGroups(undefined, { page: 1, page_size: groupsLimit }));
          fetchPromises.push(communityService.getUserGroups(userId));
        } else {
          // Push null placeholders to maintain array positions
          fetchPromises.push(Promise.resolve(null));
          fetchPromises.push(Promise.resolve(null));
        }
        
        if (showDiscussions) {
          fetchPromises.push(discussionService.getThreads(
            { sort_by: 'last_activity_at', sort_direction: 'desc' }, 
            { page: 1, page_size: discussionsLimit }
          ));
        } else {
          fetchPromises.push(Promise.resolve(null));
        }
        
        if (showEvents) {
          fetchPromises.push(eventService.getUpcomingEvents(eventsLimit));
        } else {
          fetchPromises.push(Promise.resolve(null));
        }
        
        // Fetch data in parallel for better performance
        const [groupsData, userGroupsData, discussionsData, eventsData] = await Promise.all(fetchPromises);
        
        if (showGroups) {
          setGroups(groupsData.data || []);
          setUserGroups(userGroupsData.data || []);
        }
        
        if (showDiscussions) {
          setDiscussions(discussionsData.data || []);
        }
        
        if (showEvents) {
          setEvents(eventsData || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching community data:', err);
        setError('Failed to load community data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [userId, showGroups, showDiscussions, showEvents, groupsLimit, discussionsLimit, eventsLimit]);

  // Handle group creation success
  const handleGroupCreated = (groupId: string) => {
    // Navigate to the new group page
    navigate(`/community/groups/${groupId}`);
  };

  if (loading) {
    return (
      <div className="community-dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-dashboard-error">
        <div className="error-message">
          <strong>Error: </strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`community-dashboard ${className}`}>
      <div className="community-dashboard-grid">
        {showGroups && (
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">
              <svg className="dashboard-icon" viewBox="0 0 24 24">
                <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM12 4a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 4z" />
              </svg>
              Community Groups
            </h2>
            
            {userGroups.length > 0 && (
              <div className="dashboard-section">
                <h3 className="dashboard-section-title">Your Groups</h3>
                <ul className="dashboard-list">
                  {userGroups.map((group) => (
                    <li key={`user-${group.id}`} className="dashboard-list-item">
                      <Link to={`/community/groups/${group.id}`} className="dashboard-link">
                        {group.name}
                      </Link>
                      <p className="dashboard-item-description">{group.description?.substring(0, 60)}...</p>
                      <div className="dashboard-item-meta">{group.member_count} members</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="dashboard-section">
              <h3 className="dashboard-section-title">All Groups</h3>
              {groups.length > 0 ? (
                <ul className="dashboard-list">
                  {groups.map((group) => (
                    <li key={group.id} className="dashboard-list-item">
                      <Link to={`/community/groups/${group.id}`} className="dashboard-link">
                        {group.name}
                      </Link>
                      <p className="dashboard-item-description">{group.description?.substring(0, 60)}...</p>
                      <div className="dashboard-item-meta">{group.member_count} members</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard-empty-state">No community groups available yet.</p>
              )}
            </div>
            
            <div className="dashboard-card-footer">
              <div className="flex justify-between items-center">
                <Link to="/community/groups" className="dashboard-view-all">
                  View all groups →
                </Link>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="dashboard-create-button"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}

        {showDiscussions && (
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">
              <svg className="dashboard-icon" viewBox="0 0 24 24">
                <path d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8z" />
              </svg>
              Recent Discussions
            </h2>
            {discussions.length > 0 ? (
              <ul className="dashboard-list">
                {discussions.map((thread) => (
                  <li key={thread.id} className="dashboard-list-item">
                    <Link to={`/community/discussions/${thread.id}`} className="dashboard-link">
                      {thread.title}
                    </Link>
                    <div className="dashboard-item-meta">
                      <span>{thread.reply_count} replies</span>
                      <span className="meta-separator">•</span>
                      <span>Last activity: {new Date(thread.last_activity_at).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty-state">No discussions available yet.</p>
            )}
            <div className="dashboard-card-footer">
              <Link to="/community/discussions" className="dashboard-view-all">
                View all discussions →
              </Link>
            </div>
          </div>
        )}

        {showEvents && (
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">
              <svg className="dashboard-icon" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
              </svg>
              Upcoming Events
            </h2>
            {events.length > 0 ? (
              <ul className="dashboard-list">
                {events.map((event) => (
                  <li key={event.id} className="dashboard-list-item">
                    <Link to={`/community/events/${event.id}`} className="dashboard-link">
                      {event.title}
                    </Link>
                    <p className="dashboard-item-description">{event.description?.substring(0, 60)}...</p>
                    <div className="dashboard-item-meta">
                      {new Date(event.start_date).toLocaleDateString()} • {event.event_format}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty-state">No upcoming events available yet.</p>
            )}
            <div className="dashboard-card-footer">
              <Link to="/community/events" className="dashboard-view-all">
                View all events →
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="community-dashboard-actions">
        <Link to="/community/experts" className="dashboard-action-card dashboard-action-experts">
          <h2>Find Experts</h2>
          <p>Connect with industry experts who can help you on your journey.</p>
          <span className="dashboard-action-button">Browse Experts</span>
        </Link>
        
        <Link to="/community/my-connections" className="dashboard-action-card dashboard-action-connections">
          <h2>My Expert Connections</h2>
          <p>Manage your connections, contracts, and payments with experts.</p>
          <span className="dashboard-action-button">View Connections</span>
        </Link>
        
        <Link to="/community/achievements" className="dashboard-action-card dashboard-action-achievements">
          <h2>Your Achievements</h2>
          <p>Track your community contributions and earned achievements.</p>
          <span className="dashboard-action-button">View Achievements</span>
        </Link>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleGroupCreated}
      />
    </div>
  );
};

export default CommunityDashboard;
