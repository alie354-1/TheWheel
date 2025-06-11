import React from 'react';
import { Link, useParams } from 'react-router-dom';
import CreateDiscussionForm from '../../components/community/CreateDiscussionForm';

/**
 * Create Discussion Page
 * 
 * A page for creating new discussion threads.
 * Can optionally accept a groupId parameter to pre-select the group.
 */
const CreateDiscussionPage: React.FC = () => {
  const { groupId } = useParams<{ groupId?: string }>();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/community/discussions" className="text-blue-600 hover:text-blue-800">
          ← Back to discussions
        </Link>
      </div>
      
      <CreateDiscussionForm groupId={groupId} />
    </div>
  );
};

export default CreateDiscussionPage;
