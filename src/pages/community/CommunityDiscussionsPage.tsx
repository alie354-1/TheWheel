import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { discussionService } from '../../lib/services/community';
import { useAuth } from '../../lib/contexts/AuthContext';
import { DiscussionThread, DiscussionThreadFilters, PaginationParams, ThreadReply, ContentEntity, ExpertResponse } from '../../lib/types/community.types';
import ThreadReactionButtons from '../../components/community/ThreadReactionButtons';
import AcceptAnswerButton from '../../components/community/AcceptAnswerButton';
import ExpertResponseBadge from '../../components/community/ExpertResponseBadge';
import MarkAsExpertResponseButton from '../../components/community/MarkAsExpertResponseButton';
import { expertService } from '../../lib/services/community';
import { supabase } from '../../lib/supabase';

/**
 * Community Discussions Page
 * 
 * Displays a list of discussion threads with filtering and pagination.
 * Also handles single thread view when a threadId is provided.
 */
const CommunityDiscussionsPage: React.FC = () => {
  const { threadId } = useParams<{ threadId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [currentThread, setCurrentThread] = useState<DiscussionThread | null>(null);
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [expertResponses, setExpertResponses] = useState<Record<string, ExpertResponse>>({});
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DiscussionThreadFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    page_size: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [replyContent, setReplyContent] = useState('');
  const [isUserThreadAuthor, setIsUserThreadAuthor] = useState(false);
  const [isUserExpert, setIsUserExpert] = useState(false);
  const [expertProfile, setExpertProfile] = useState<any>(null);

  // Check if the current user is an expert
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (!user?.id) {
        setIsUserExpert(false);
        setExpertProfile(null);
        return;
      }
      
      try {
        const profile = await expertService.getExpertProfile(user.id);
        if (profile) {
          setIsUserExpert(true);
          setExpertProfile(profile);
        } else {
          setIsUserExpert(false);
          setExpertProfile(null);
        }
      } catch (err) {
        console.error('Error checking expert status:', err);
        setIsUserExpert(false);
        setExpertProfile(null);
      }
    };
    
    checkExpertStatus();
  }, [user?.id]);

  // Fetch single thread or list of threads based on presence of threadId
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (threadId) {
          // Fetch single thread and its replies
          const [thread, threadReplies] = await Promise.all([
            discussionService.getThread(threadId),
            discussionService.getReplies(threadId)
          ]);
          
          // Fetch expert responses for the thread
          const expertResponsesData = await discussionService.getExpertResponsesForThread(threadId);
          
          // Convert expert responses array to a map for easier lookup
          const expertResponsesMap: Record<string, ExpertResponse> = {};
          expertResponsesData.forEach((response: ExpertResponse) => {
            if (response.reply_id) {
              expertResponsesMap[response.reply_id] = response;
            }
          });
          
          setCurrentThread(thread);
          setReplies(threadReplies);
          setExpertResponses(expertResponsesMap);
          setThreads([]);
          
          // Check if current user is the thread author
          if (user?.id && thread) {
            setIsUserThreadAuthor(user.id === thread.author_id);
          } else {
            setIsUserThreadAuthor(false);
          }
        } else {
          // Fetch list of threads
          const response = await discussionService.getThreads(filters, pagination);
          setThreads(response.data);
          setTotalPages(response.total_pages);
          setCurrentThread(null);
          setReplies([]);
          setIsUserThreadAuthor(false);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching discussions:', err);
        setError('Failed to load discussions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [threadId, filters, pagination, user?.id]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<DiscussionThreadFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle reply submission
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!threadId || !replyContent.trim() || !user?.id) return;
    
    try {
      const newReply = await discussionService.createReply({
        thread_id: threadId,
        content: replyContent
      }, user.id);
      
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    }
  };
  
  // Handle accepting an answer
  const handleAcceptAnswer = async (replyId: string) => {
    if (!threadId || !user?.id || !isUserThreadAuthor) return;
    
    try {
      await discussionService.markAsAcceptedAnswer(replyId, threadId);
      
      // Update the replies list to reflect the change
      setReplies(prev => 
        prev.map(reply => ({
          ...reply,
          is_accepted_answer: reply.id === replyId
        }))
      );
    } catch (err) {
      console.error('Error accepting answer:', err);
      setError('Failed to mark answer as accepted. Please try again.');
    }
  };
  
  // Handle marking a reply as an expert response
  const handleMarkAsExpertResponse = async (replyId: string, isExpert: boolean) => {
    if (!threadId || !user?.id || !isUserExpert || !expertProfile) return;
    
    try {
      // Refresh the replies to show the expert response badge
      const updatedReplies = await discussionService.getReplies(threadId);
      setReplies(updatedReplies);
      
      // Refresh expert responses
      const expertResponsesData = await discussionService.getExpertResponsesForThread(threadId);
      const expertResponsesMap: Record<string, ExpertResponse> = {};
      expertResponsesData.forEach((response: ExpertResponse) => {
        if (response.reply_id) {
          expertResponsesMap[response.reply_id] = response;
        }
      });
      setExpertResponses(expertResponsesMap);
    } catch (err) {
      console.error('Error refreshing after marking as expert response:', err);
      setError('Failed to update the display. Please refresh the page.');
    }
  };
  
  // Handle reactions
  const handleReaction = async (contentType: ContentEntity, contentId: string) => {
    // This is just a placeholder to refresh data after a reaction
    if (threadId) {
      const updatedReplies = await discussionService.getReplies(threadId);
      setReplies(updatedReplies);
    }
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

  // Single thread view
  if (currentThread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/community/discussions" className="text-blue-600 hover:text-blue-800">
            ← Back to all discussions
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{currentThread.title}</h1>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                currentThread.resolution_status === 'resolved' 
                  ? 'bg-green-100 text-green-800' 
                  : currentThread.resolution_status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentThread.resolution_status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                currentThread.priority_level === 'high' 
                  ? 'bg-red-100 text-red-800' 
                  : currentThread.priority_level === 'normal'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentThread.priority_level}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <span className="font-medium">{currentThread.author_name || 'Anonymous'}</span>
            </div>
            <span className="mx-2">•</span>
            <span>{new Date(currentThread.created_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{currentThread.view_count} views</span>
            <span className="mx-2">•</span>
            <span>{currentThread.reply_count} replies</span>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-line">{currentThread.content}</p>
          </div>
          
          {currentThread.tags && currentThread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentThread.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <ThreadReactionButtons 
              contentType="thread"
              contentId={currentThread.id}
              initialReactions={[
                { reaction_type: 'like', count: 0, userHasReacted: false },
                { reaction_type: 'helpful', count: 0, userHasReacted: false },
                { reaction_type: 'insightful', count: 0, userHasReacted: false }
              ]}
              onReactionChange={() => handleReaction('thread', currentThread.id)}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Replies ({replies.length})
          </h2>
          
          {replies.length > 0 ? (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div 
                  key={reply.id} 
                  className={`bg-white rounded-lg shadow-sm p-4 border ${
                    reply.is_accepted_answer ? 'border-green-300 bg-green-50' : 'border-gray-100'
                  }`}
                >
                  {reply.is_accepted_answer && (
                    <div className="flex items-center text-green-700 mb-2">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Accepted Answer</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
                      <span className="font-medium">{reply.author_name || 'Anonymous'}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                    
                    {reply.is_expert_response && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-blue-600 font-medium">Expert</span>
                      </>
                    )}
                  </div>
                  
                  <div className="prose max-w-none mb-2">
                    <p className="whitespace-pre-line">{reply.content}</p>
                  </div>
                  
                  {reply.is_expert_response && expertResponses[reply.id] && (
                    <div className="mb-3">
                      <ExpertResponseBadge
                        expertiseArea={expertResponses[reply.id].expertise_area}
                        confidenceScore={expertResponses[reply.id].confidence_score}
                        verificationStatus={expertResponses[reply.id].verification_status}
                        verifiedBy={expertResponses[reply.id].verified_by}
                        verifiedAt={expertResponses[reply.id].verified_at}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <ThreadReactionButtons 
                      contentType="reply"
                      contentId={reply.id}
                      initialReactions={reply.reactions?.map(r => ({
                        reaction_type: r.reaction_type,
                        count: 1,
                        userHasReacted: r.user_id === user?.id
                      })) || []}
                      onReactionChange={() => handleReaction('reply', reply.id)}
                    />
                    
                    <div className="flex space-x-4">
                      {!reply.is_accepted_answer && currentThread && (
                        <AcceptAnswerButton
                          threadId={currentThread.id}
                          replyId={reply.id}
                          isAccepted={reply.is_accepted_answer}
                          isThreadAuthor={isUserThreadAuthor}
                          onAcceptChange={() => handleAcceptAnswer(reply.id)}
                        />
                      )}
                      
                      {isUserExpert && expertProfile && user?.id !== reply.author_id && (
                        <MarkAsExpertResponseButton
                          threadId={currentThread?.id || ''}
                          replyId={reply.id}
                          isExpertResponse={reply.is_expert_response}
                          onUpdate={(isExpert: boolean) => handleMarkAsExpertResponse(reply.id, isExpert)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No replies yet. Be the first to reply!</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Post a Reply</h3>
          
          <form onSubmit={handleReplySubmit}>
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Write your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                disabled={!replyContent.trim()}
              >
                Post Reply
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Discussions list view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Discussions</h1>
        <p className="text-gray-600">Join conversations, ask questions, and share your knowledge.</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="thread-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="thread-type"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.thread_type || ''}
              onChange={(e) => handleFilterChange({ 
                thread_type: e.target.value ? (e.target.value as any) : undefined 
              })}
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="question">Question</option>
              <option value="showcase">Showcase</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="resolution-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="resolution-status"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.resolution_status || ''}
              onChange={(e) => handleFilterChange({ 
                resolution_status: e.target.value ? (e.target.value as any) : undefined 
              })}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort-by"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.sort_by || 'last_activity_at'}
              onChange={(e) => handleFilterChange({ 
                sort_by: e.target.value as any, 
                sort_direction: 'desc'
              })}
            >
              <option value="last_activity_at">Recent Activity</option>
              <option value="created_at">Newest</option>
              <option value="reply_count">Most Replies</option>
              <option value="view_count">Most Views</option>
            </select>
          </div>
          
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search discussions..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              value={filters.search_term || ''}
              onChange={(e) => handleFilterChange({ search_term: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mb-6">
        <Link 
          to="/community/discussions/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Discussion
        </Link>
      </div>
      
      {/* Discussions List */}
      {threads.length > 0 ? (
        <div className="space-y-4 mb-8">
          {threads.map((thread) => (
            <div key={thread.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    <Link to={`/community/discussions/${thread.id}`} className="hover:text-blue-600">
                      {thread.title}
                    </Link>
                  </h2>
                  <div className="flex items-center space-x-2">
                    {thread.is_pinned && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Pinned
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      thread.resolution_status === 'resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : thread.resolution_status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {thread.resolution_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
                    <span className="font-medium">{thread.author_name || 'Anonymous'}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{thread.reply_count} replies</span>
                  <span className="mx-2">•</span>
                  <span>{thread.view_count} views</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{thread.content}</p>
                
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {thread.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link 
                  to={`/community/discussions/${thread.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Discussion →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or start a new discussion.</p>
          <Link 
            to="/community/discussions/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-block"
          >
            Start a Discussion
          </Link>
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
    </div>
  );
};

export default CommunityDiscussionsPage;
