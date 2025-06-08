import React, { useState } from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { communityService } from '../../lib/services/community';
import { 
  CreateCommunityGroupRequest, 
  GroupCategory, 
  AccessTier 
} from '../../lib/types/community.types';

interface CreateGroupFormProps {
  onSubmit: (groupId: string) => void;
  onCancel: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

/**
 * CreateGroupForm Component
 * 
 * Form for creating a new community group with validation and error handling.
 */
const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  onSubmit,
  onCancel,
  setIsSubmitting
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCommunityGroupRequest>({
    name: '',
    description: '',
    group_type: 'stage_cohort',
    access_level: 'core_portfolio',
    requires_approval: true
  });

  // Group type options with descriptions
  const groupTypeOptions = [
    { 
      value: 'stage_cohort', 
      label: 'Stage Cohort', 
      description: 'Groups based on company stage (pre-seed, seed, etc.)' 
    },
    { 
      value: 'functional_guild', 
      label: 'Functional Guild', 
      description: 'Groups focused on specific business functions (marketing, engineering, etc.)' 
    },
    { 
      value: 'industry_chamber', 
      label: 'Industry Chamber', 
      description: 'Groups organized around industry verticals (fintech, healthtech, etc.)' 
    },
    { 
      value: 'geographic_hub', 
      label: 'Geographic Hub', 
      description: 'Groups based on geographic location' 
    },
    { 
      value: 'special_program', 
      label: 'Special Program', 
      description: 'Groups for special initiatives or programs' 
    }
  ];

  // Access level options with descriptions
  const accessLevelOptions = [
    { 
      value: 'core_portfolio', 
      label: 'Core Portfolio', 
      description: 'Limited to core portfolio companies' 
    },
    { 
      value: 'alumni_network', 
      label: 'Alumni Network', 
      description: 'Available to portfolio companies and alumni' 
    },
    { 
      value: 'extended_ecosystem', 
      label: 'Extended Ecosystem', 
      description: 'Available to the broader ecosystem partners' 
    },
    { 
      value: 'public', 
      label: 'Public', 
      description: 'Open to all platform users' 
    }
  ];

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Group name is required');
      }

      if (!user?.id) {
        throw new Error('You must be logged in to create a group');
      }

      // Create the group
      const newGroup = await communityService.createGroup(formData, user.id);
      
      // Call onSubmit with the new group ID
      onSubmit(newGroup.id);
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Group Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Group Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter group name"
          required
        />
      </div>

      {/* Group Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the purpose and focus of this group"
        ></textarea>
      </div>

      {/* Group Type */}
      <div>
        <label htmlFor="group_type" className="block text-sm font-medium text-gray-700 mb-1">
          Group Type <span className="text-red-500">*</span>
        </label>
        <select
          id="group_type"
          name="group_type"
          value={formData.group_type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {groupTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {groupTypeOptions.find(option => option.value === formData.group_type)?.description}
        </p>
      </div>

      {/* Access Level */}
      <div>
        <label htmlFor="access_level" className="block text-sm font-medium text-gray-700 mb-1">
          Access Level <span className="text-red-500">*</span>
        </label>
        <select
          id="access_level"
          name="access_level"
          value={formData.access_level}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {accessLevelOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {accessLevelOptions.find(option => option.value === formData.access_level)?.description}
        </p>
      </div>

      {/* Member Limit */}
      <div>
        <label htmlFor="max_members" className="block text-sm font-medium text-gray-700 mb-1">
          Member Limit
        </label>
        <input
          type="number"
          id="max_members"
          name="max_members"
          value={formData.max_members || ''}
          onChange={handleChange}
          min="0"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Leave blank for unlimited"
        />
        <p className="mt-1 text-sm text-gray-500">
          Maximum number of members allowed (leave blank for unlimited)
        </p>
      </div>

      {/* Requires Approval */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id="requires_approval"
            name="requires_approval"
            checked={formData.requires_approval}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="requires_approval" className="font-medium text-gray-700">
            Require Approval for New Members
          </label>
          <p className="text-gray-500">
            When enabled, new members must be approved by a group admin before joining
          </p>
        </div>
      </div>

      {/* Cover Image URL */}
      <div>
        <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL
        </label>
        <input
          type="url"
          id="cover_image_url"
          name="cover_image_url"
          value={formData.cover_image_url || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Icon URL */}
      <div>
        <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 mb-1">
          Icon URL
        </label>
        <input
          type="url"
          id="icon_url"
          name="icon_url"
          value={formData.icon_url || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/icon.jpg"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Group
        </button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
