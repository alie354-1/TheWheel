import React from 'react';
import CommunityStepsList from '../../components/journey/CommunityStepsList';
import { Link } from 'react-router-dom';

const CommunityStepsPage: React.FC = () => {
  return (
    <div className="p-8">
      <Link to="/journey" className="text-blue-600 hover:underline mb-4 block">
        &larr; Back to Journey
      </Link>
      <CommunityStepsList />
    </div>
  );
};

export default CommunityStepsPage;
