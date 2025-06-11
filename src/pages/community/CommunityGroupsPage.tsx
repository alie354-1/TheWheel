import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { communityService } from '../../lib/services/community';
import { 
  CommunityGroup, 
  CommunityGroupFilters, 
  PaginationParams,
  MembershipStatus,
  GroupMembership,
  GroupRole
} from '../../lib/types/community.types';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useUserRole } from '../../lib/hooks/useUserRole';
import CreateGroupModal from '../../components/community/CreateGroupModal';
import MembershipRequestsModal from '../../components/community/MembershipRequestsModal';

/**
 * Community Groups Page
 * 
 * Displays a list of community groups with filtering and pagination.
 * Also handles single group view when a groupId is provided.
 */
const CommunityGroupsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId?: string }>();
  const { user } = useAuth();
  const { isSystemAdmin } = useUserRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<CommunityGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CommunityGroupFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    page_size: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<{[groupId: string]: {
    isMember: boolean;
    status: MembershipStatus | null;
    role: GroupRole | null;
  }}>({});
  const [groupMembers, setGroupMembers] = useState<GroupMembership[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Fetch single group or list of groups based on presence of groupId
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (groupId) {
        // Fetch single group
        const group = await communityService.getGroup(groupId);
        setCurrentGroup(group);
        setGroups([]);
        
        // Check membership status for the current group
        if (user?.id && group) {
          const membership = await communityService.checkUserMembership(group.id, user.id);
          setMembershipStatus({
            [group.id]: {
              isMember: membership.isMember,
              status: membership.status,
              role: membership.role
            }
          });
          
          // Fetch group members
          setLoadingMembers(true);
          try {
            const members = await communityService.getGroupMembers(group.id);
            setGroupMembers(members);
            
            // Count pending requests if user is system admin, group admin or moderator
            if (isSystemAdmin || membership.role === 'admin' || membership.role === 'moderator') {
              const pendingRequests = await communityService.getPendingMemberships(group.id);
              setPendingRequestsCount(pendingRequests.length);
            }
            // If user is not a member but is a system admin, still fetch pending requests
            else if (isSystemAdmin && !membership.isMember) {
              const pendingRequests = await communityService.getPendingMemberships(group.id);
              setPendingRequestsCount(pendingRequests.length);
            }
          } catch (err) {
            console.error('Error fetching group members:', err);
          } finally {
            setLoadingMembers(false);
          }
        }
      } else {
        // Fetch list of groups
        const response = await communityService.getGroups(filters, pagination);
        setGroups(response.data);
        setTotalPages(response.total_pages);
        setCurrentGroup(null);
        
        // Check membership status for all groups
        if (user?.id && response.data.length > 0) {
          const membershipData: {[groupId: string]: {
            isMember: boolean;
            status: MembershipStatus | null;
            role: GroupRole | null;
          }} = {};
          
          // Check membership for each group
          await Promise.all(response.data.map(async (group) => {
            const membership = await communityService.checkUserMembership(group.id, user.id);
            membershipData[group.id] = {
              isMember: membership.isMember,
              status: membership.status,
              role: membership.role
            };
          }));
          
          setMembershipStatus(membershipData);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching community groups:', err);
      setError('Failed to load community groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [groupId, filters, pagination, user?.id]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle group creation success
  const handleGroupCreated = (groupId: string) => {
    // Navigate to the new group page
    navigate(`/community/groups/${groupId}`);
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId: string) => {
    if (!user?.id) {
      setError('You must be logged in to join a group');
      return;
    }

    try {
      setIsJoining(true);
      setJoinSuccess(null);
      setError(null);

      // Join the group
      await communityService.joinGroup(groupId, user.id);
      
      // Update membership status
      setMembershipStatus(prev => ({
        ...prev,
        [groupId]: {
          isMember: true,
          status: 'active',
          role: 'member'
        }
      }));
      
      // Show success message
      setJoinSuccess('Successfully joined the group!');
      
      // Refresh the group data
      fetchData();
    } catch (err: any) {
      console.error('Error joining group:', err);
      setError(err.message || 'Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Handle leaving a group
  const handleLeaveGroup = async (groupId: string) => {
    if (!user?.id) {
      setError('You must be logged in to leave a group');
      return;
    }

    try {
      setIsLeaving(true);
      setJoinSuccess(null);
      setError(null);

      // Leave the group
      await communityService.leaveGroup(groupId, user.id);
      
      // Update membership status immediately in the UI
      setMembershipStatus(prev => ({
        ...prev,
        [groupId]: {
          isMember: false,
          status: null,
          role: null
        }
      }));
      
      // Show success message
      setJoinSuccess('Successfully left the group.');
      
      // Force a complete refresh of the data
      setTimeout(() => {
        fetchData();
      }, 500); // Small delay to ensure database operation completes
    } catch (err: any) {
      console.error('Error leaving group:', err);
      setError(err.message || 'Failed to leave group. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CommunityGroupFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Single group view
  if (currentGroup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/community/groups" className="text-blue-600 hover:text-blue-800">
            ← Back to all groups
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentGroup.name}</h1>
              {(isSystemAdmin || membershipStatus[currentGroup.id]?.role === 'admin' || membershipStatus[currentGroup.id]?.role === 'moderator') && (
                <button
                  onClick={() => setIsRequestsModalOpen(true)}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <span>Manage Requests</span>
                  {pendingRequestsCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}
            </div>
            {membershipStatus[currentGroup.id]?.isMember ? (
              <button 
                className={`${
                  isLeaving ? 'bg-gray-400' : 'bg-gray-600 hover:bg-gray-700'
                } text-white font-medium py-2 px-4 rounded flex items-center`}
                onClick={() => handleLeaveGroup(currentGroup.id)}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Leaving...
                  </>
                ) : (
                  membershipStatus[currentGroup.id]?.status === 'pending' ? 
                    'Membership Pending' : 
                    'Leave Group'
                )}
              </button>
            ) : (
              <button 
                className={`${
                  isJoining ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-2 px-4 rounded flex items-center`}
                onClick={() => handleJoinGroup(currentGroup.id)}
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  'Join Group'
                )}
              </button>
            )}
          </div>
          
          {joinSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{joinSuccess}</span>
            </div>
          )}
          
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-medium text-gray-700">Type:</span> {currentGroup.group_type}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-medium text-gray-700">Members:</span> {currentGroup.member_count}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-700">Created:</span> {new Date(currentGroup.created_at).toLocaleDateString()}
            </div>
            <p className="text-gray-700 whitespace-pre-line">{currentGroup.description}</p>
          </div>
          
          {/* Group Members Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Members</h2>
            {loadingMembers ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : groupMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {groupMembers.map(member => (
                  <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-3">
                      {member.user_avatar_url ? (
                        <img 
                          src={member.user_avatar_url} 
                          alt={member.user_name || 'User'} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
                          {(member.user_name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{member.user_name || 'Anonymous User'}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold mr-1 ${
                          member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          member.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                        <span>Joined {new Date(member.join_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No members found.</p>
            )}
          </div>
          
          {/* Recent Activity Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <p className="text-gray-500 italic">Group activity will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  // Groups list view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Groups</h1>
        <p className="text-gray-600">Join groups to connect with other members who share your interests.</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="group-type" className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
            <select
              id="group-type"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.group_type || ''}
              onChange={(e) => handleFilterChange({ 
                group_type: e.target.value ? (e.target.value as any) : undefined 
              })}
            >
              <option value="">All Types</option>
              <option value="stage_cohort">Stage Cohort</option>
              <option value="functional_guild">Functional Guild</option>
              <option value="industry_chamber">Industry Chamber</option>
              <option value="geographic_hub">Geographic Hub</option>
              <option value="special_program">Special Program</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort-by"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.sort_by || 'created_at'}
              onChange={(e) => handleFilterChange({ 
                sort_by: e.target.value as any, 
                sort_direction: e.target.value === 'member_count' ? 'desc' : 'asc'
              })}
            >
              <option value="created_at">Newest</option>
              <option value="name">Name</option>
              <option value="member_count">Most Members</option>
            </select>
          </div>
          
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search groups..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              value={filters.search_term || ''}
              onChange={(e) => handleFilterChange({ search_term: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col mb-6">
        {joinSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{joinSuccess}</span>
          </div>
        )}
        <div className="flex justify-end">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Group
          </button>
        </div>
      </div>
      
      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(groups as CommunityGroup[]).map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  <Link to={`/community/groups/${group.id}`} className="hover:text-blue-600">
                    {group.name}
                  </Link>
                </h2>
                <div className="text-sm text-gray-500 mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-semibold mr-2">
                    {group.group_type}
                  </span>
                  <span>{group.member_count} members</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{group.description}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    to={`/community/groups/${group.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Group →
                  </Link>
                  {membershipStatus[group.id]?.isMember ? (
                    <span className="text-sm text-green-600 font-medium px-3 py-1">
                      {membershipStatus[group.id]?.status === 'pending' ? 
                        'Pending' : 
                        'Member'}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleJoinGroup(group.id);
                      }}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or create a new group.</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Group
          </button>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  pagination.page === i + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
              disabled={pagination.page === totalPages}
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleGroupCreated}
      />
      
      {/* Membership Requests Modal */}
      {currentGroup && (
        <MembershipRequestsModal
          isOpen={isRequestsModalOpen}
          onClose={() => setIsRequestsModalOpen(false)}
          groupId={currentGroup.id}
          onMembershipUpdated={() => {
            fetchData();
            setIsRequestsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CommunityGroupsPage;
