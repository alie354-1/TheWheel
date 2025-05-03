import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * JourneyStepsRedirect Component
 * 
 * This component redirects from old challenge URLs to new step URLs
 * maintaining backward compatibility.
 */
const JourneyStepsRedirect: React.FC = () => {
  const { companyId = '', challengeId = '' } = useParams<{ companyId: string, challengeId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect from the challenge URL to the step URL
    if (challengeId) {
      navigate(`/company/${companyId}/journey/step/${challengeId}`, { replace: true });
    } else {
      navigate(`/company/${companyId}/journey/steps`, { replace: true });
    }
  }, [companyId, challengeId, navigate]);
  
  // Show loading message while redirect happens
  return <div className="p-8 text-center">Redirecting to journey steps...</div>;
};

export default JourneyStepsRedirect;
