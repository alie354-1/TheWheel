import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { discussionService, communityService } from '../../lib/services/community';
import { useAuth } from '../../lib/contexts/AuthContext';
import { 
  DiscussionType, 
  PriorityTier, 
  ConfidentialityTier 
} from '../../lib/types/community.types';

interface CreateDiscussionFormProps {
  groupId?: string;
  onSuccess?: (threadId: string) => void;
  onCancel?: () => void;
}

/**
 * CreateDiscussionForm Component
 * 
 * A form for creating new discussion threads.
 * Can be used in a modal or as a standalone page.
 */
const CreateDiscussionForm: React.FC<CreateDiscussionFormProps> = ({
  groupId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [threadType, setThreadType] = useState<DiscussionType>('general');
  const [priorityLevel, setPriorityLevel] = useState<PriorityTier>('normal');
  const [confidentialityLevel, setConfidentialityLevel] = useState<ConfidentialityTier>('group');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(groupId);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch user's groups if no groupId is provided
  useEffect(() => {
    if (!groupId && user?.id) {
      const fetchGroups = async () => {
        try {
          // Use communityService to get user's groups
          const userGroups = await communityService.getUserGroups(user.id);
          
          // Transform the data to match the expected format
          const formattedGroups = userGroups.map(group => ({
            id: group.id,
            name: group.name
          }));
          
          setGroups(formattedGroups);
          
          if (formattedGroups.length > 0) {
            setSelectedGroupId(formattedGroups[0].id);
          }
        } catch (err) {
          console.error('Error fetching user groups:', err);
          setError('Failed to load your groups. Please try again.');
        }
      };
      
      fetchGroups();
    }
  }, [groupId, user?.id]);

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('You must be logged in to create a discussion');
      return;
    }

    if (!selectedGroupId) {
      setError('Please select a group for this discussion');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newThread = await discussionService.createThread({
        group_id: selectedGroupId,
        title,
        content,
        thread_type: threadType,
        priority_level: priorityLevel,
        confidentiality_level: confidentialityLevel,
        tags: tags.length > 0 ? tags : undefined
      }, user.id);
      
      setLoading(false);
      
      // Handle success
      if (onSuccess) {
        onSuccess(newThread.id);
      } else {
        navigate(`/community/discussions/${newThread.id}`);
      }
    } catch (err: any) {
      setLoading(false);
      console.error('Error creating discussion:', err);
      setError(err.message || 'Failed to create discussion. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Discussion</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Group Selection (if no groupId provided) */}
        {!groupId && (
          <div className="mb-4">
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
              Group <span className="text-red-500">*</span>
            </label>
            <select
              id="group"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              required
            >
              <option value="">Select a group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        
        {/* Content */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your discussion topic in detail"
            required
          ></textarea>
        </div>
        
        {/* Thread Type */}
        <div className="mb-4">
          <label htmlFor="thread-type" className="block text-sm font-medium text-gray-700 mb-1">
            Discussion Type
          </label>
          <select
            id="thread-type"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={threadType}
            onChange={(e) => setThreadType(e.target.value as DiscussionType)}
          >
            <option value="general">General Discussion</option>
            <option value="question">Question</option>
            <option value="showcase">Showcase</option>
            <option value="announcement">Announcement</option>
            <option value="hot_seat">Hot Seat</option>
            <option value="poll">Poll</option>
          </select>
        </div>
        
        {/* Priority Level */}
        <div className="mb-4">
          <label htmlFor="priority-level" className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level
          </label>
          <select
            id="priority-level"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(e.target.value as PriorityTier)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        {/* Confidentiality Level */}
        <div className="mb-4">
          <label htmlFor="confidentiality-level" className="block text-sm font-medium text-gray-700 mb-1">
            Confidentiality Level
          </label>
          <select
            id="confidentiality-level"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confidentialityLevel}
            onChange={(e) => setConfidentialityLevel(e.target.value as ConfidentialityTier)}
          >
            <option value="public">Public</option>
            <option value="group">Group Only</option>
            <option value="private">Private</option>
            <option value="sensitive">Sensitive</option>
          </select>
        </div>
        
        {/* Tags */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (up to 5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded flex items-center">
                {tag}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={() => removeTag(tag)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              id="tags"
              className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (press Enter or comma to add)"
              disabled={tags.length >= 5}
            />
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-r-md"
              onClick={addTag}
              disabled={tags.length >= 5 || !tagInput.trim()}
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter or comma to add a tag. Tags help others find your discussion.
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Discussion'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDiscussionForm;
