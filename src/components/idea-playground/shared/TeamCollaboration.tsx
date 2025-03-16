import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/store';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';

// Team member types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  dateAdded: string;
}

// Comment types
interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  createdAt: string;
  section?: string;
  resolved: boolean;
}

interface TeamCollaborationProps {
  idea: IdeaPlaygroundIdea;
  onMemberAdd: (email: string, role: string) => Promise<void>;
  onMemberRemove: (memberId: string) => Promise<void>;
  onMemberRoleChange: (memberId: string, newRole: string) => Promise<void>;
  onCommentAdd: (text: string, section?: string) => Promise<void>;
  onCommentResolve: (commentId: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
}

/**
 * Team Collaboration Component
 * Enables users to collaborate with team members, manage permissions,
 * and add comments to various sections of the idea
 */
const TeamCollaboration: React.FC<TeamCollaborationProps> = ({
  idea,
  onMemberAdd,
  onMemberRemove,
  onMemberRoleChange,
  onCommentAdd,
  onCommentResolve,
  onCommentDelete,
}) => {
  // State for team members and comments
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'comments'>('members');
  
  // UI state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'editor' | 'viewer'>('editor');
  const [newComment, setNewComment] = useState('');
  const [commentSection, setCommentSection] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Current user from auth store
  const { user } = useAuthStore();
  
  // Get user display name from email or id
  const getUserDisplayName = () => {
    if (!user) return 'You';
    
    if (typeof user.email === 'string') {
      return user.email.split('@')[0];
    }
    
    return `User-${user.id.substring(0, 5)}`;
  };

  // Mock data for team members
  useEffect(() => {
    // In a real implementation, this would fetch team members from the backend
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        name: 'You',
        email: user?.email || 'you@example.com',
        role: 'owner',
        status: 'active',
        dateAdded: new Date().toISOString(),
      }
    ];
    
    // Use saved members from localStorage if available
    const savedMembers = localStorage.getItem(`team-members-${idea.id}`);
    if (savedMembers) {
      try {
        const parsedMembers = JSON.parse(savedMembers);
        setMembers([...mockMembers, ...parsedMembers]);
      } catch (e) {
        console.error('Error parsing saved members:', e);
        setMembers(mockMembers);
      }
    } else {
      setMembers(mockMembers);
    }
  }, [idea.id, user?.email]);

  // Mock data for comments
  useEffect(() => {
    // In a real implementation, this would fetch comments from the backend
    const savedComments = localStorage.getItem(`comments-${idea.id}`);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        console.error('Error parsing saved comments:', e);
        setComments([]);
      }
    } else {
      setComments([]);
    }
  }, [idea.id]);

  // Save members to localStorage when they change
  useEffect(() => {
    if (members.length > 0) {
      // Filter out the owner (you) before saving
      const membersToSave = members.filter(m => m.role !== 'owner');
      localStorage.setItem(`team-members-${idea.id}`, JSON.stringify(membersToSave));
    }
  }, [members, idea.id]);

  // Save comments to localStorage when they change
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem(`comments-${idea.id}`, JSON.stringify(comments));
    } else {
      localStorage.removeItem(`comments-${idea.id}`);
    }
  }, [comments, idea.id]);

  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle adding a new team member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberEmail.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    // Check if the email is already in the members list
    if (members.some(m => m.email === newMemberEmail)) {
      setError('This user is already a member of this project');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend API
      await onMemberAdd(newMemberEmail, newMemberRole);
      
      // Add the new member to the local state
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        name: newMemberEmail.split('@')[0], // Use the first part of the email as a name
        email: newMemberEmail,
        role: newMemberRole,
        status: 'pending',
        dateAdded: new Date().toISOString(),
      };
      
      setMembers([...members, newMember]);
      setNewMemberEmail('');
      setSuccess('Invitation sent successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a team member
  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend API
      await onMemberRemove(memberId);
      
      // Remove the member from the local state
      setMembers(members.filter(m => m.id !== memberId));
      setSuccess('Member removed successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle changing a team member's role
  const handleRoleChange = async (memberId: string, newRole: 'editor' | 'viewer') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend API
      await onMemberRoleChange(memberId, newRole);
      
      // Update the member's role in the local state
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      setSuccess('Role updated successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error changing role:', error);
      setError('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the backend API
      await onCommentAdd(newComment, commentSection);
      
      // Add the new comment to the local state
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment,
        userId: user?.id || 'user-1',
        userName: getUserDisplayName(),
        userAvatarUrl: undefined, // We don't have avatar URLs in the current user object
        createdAt: new Date().toISOString(),
        section: commentSection,
        resolved: false,
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
      setSuccess('Comment added successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resolving a comment
  const handleResolveComment = async (commentId: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the backend API
      await onCommentResolve(commentId);
      
      // Mark the comment as resolved in the local state
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, resolved: true } : c
      ));
    } catch (error) {
      console.error('Error resolving comment:', error);
      setError('Failed to resolve comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the backend API
      await onCommentDelete(commentId);
      
      // Remove the comment from the local state
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            type="button"
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'members'
                ? 'bg-white border-b-2 border-indigo-500 text-indigo-600'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            } flex-1`}
            onClick={() => setActiveTab('members')}
          >
            Team Members
          </button>
          <button
            type="button"
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'comments'
                ? 'bg-white border-b-2 border-indigo-500 text-indigo-600'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            } flex-1`}
            onClick={() => setActiveTab('comments')}
          >
            Comments & Feedback
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {/* Team Members Tab */}
        {activeTab === 'members' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
            
            {/* Add new member form */}
            <form onSubmit={handleAddMember} className="mb-6 p-4 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Invite a team member</h4>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                  required
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'editor' | 'viewer')}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Invite'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Editor:</span> Can edit the idea and add comments.
                <span className="font-medium ml-2">Viewer:</span> Can only view the idea and add comments.
              </p>
            </form>
            
            {/* Team members list */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={`${member.name}'s avatar`}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <span className="text-xs font-medium text-indigo-800">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                              {member.role === 'owner' && (
                                <span className="ml-2 text-xs text-gray-500">(You)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {member.role === 'owner' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Owner
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as 'editor' | 'viewer')}
                            disabled={isLoading}
                            className="text-sm border-gray-300 rounded-md py-1"
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {member.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(member.dateAdded)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {member.role !== 'owner' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {members.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">No team members yet.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comments & Feedback</h3>
            
            {/* Add new comment form */}
            <form onSubmit={handleAddComment} className="mb-6 p-4 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add a comment</h4>
              <div className="mb-3">
                <textarea
                  placeholder="Type your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex flex-col md:flex-row gap-2 items-end justify-between">
                <div>
                  <label htmlFor="comment-section" className="block text-xs text-gray-700 mb-1">
                    Section (optional)
                  </label>
                  <select
                    id="comment-section"
                    value={commentSection || ''}
                    onChange={(e) => setCommentSection(e.target.value || undefined)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">General</option>
                    <option value="overview">Overview</option>
                    <option value="problem">Problem Statement</option>
                    <option value="solution">Solution Concept</option>
                    <option value="audience">Target Audience</option>
                    <option value="value">Value Proposition</option>
                    <option value="business">Business Model</option>
                    <option value="marketing">Marketing Strategy</option>
                    <option value="go-to-market">Go-to-Market Plan</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
            
            {/* Comments list */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No comments yet.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 border rounded-md ${
                      comment.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {comment.userAvatarUrl ? (
                            <img
                              src={comment.userAvatarUrl}
                              alt={`${comment.userName}'s avatar`}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium text-indigo-800">
                              {comment.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {comment.userName}
                            {comment.section && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {comment.section.charAt(0).toUpperCase() + comment.section.slice(1)}
                              </span>
                            )}
                            {comment.resolved && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Resolved
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatDate(comment.createdAt)}
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!comment.resolved && (
                          <button
                            type="button"
                            onClick={() => handleResolveComment(comment.id)}
                            disabled={isLoading}
                            className="text-xs text-green-600 hover:text-green-900"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isLoading}
                          className="text-xs text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCollaboration;
