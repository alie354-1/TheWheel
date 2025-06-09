import React from 'react';
import CommunityStepSubmission from '../../components/journey/CommunityStepSubmission';
import { Link } from 'react-router-dom';

const SubmitStepPage: React.FC = () => {
  return (
    <div className="p-8">
      <Link to="/journey" className="text-blue-600 hover:underline mb-4 block">
        &larr; Back to Journey
      </Link>
      <CommunityStepSubmission />
    </div>
  );
};

export default SubmitStepPage;
