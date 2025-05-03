import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import JourneyStepDetails from '../../components/company/journey/JourneyStepDetails';
import ChallengeEditor from '../../components/company/journey/ChallengeEditor';
import { supabase } from '../../lib/supabase';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';
import { JourneyChallenge } from '../../lib/types/journey-challenges.types';

interface JourneyStepPageProps {
  mode?: 'view' | 'edit' | 'create';
}

const JourneyStepPage: React.FC<JourneyStepPageProps> = ({ mode = 'view' }) => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { stepId, challengeId } = useParams<{ stepId?: string; challengeId?: string }>();
  const navigate = useNavigate();
  
  // The ID to use - either stepId (legacy) or challengeId (new)
  const currentId = challengeId || stepId;
  
  // State for challenge data if we're in edit mode
  const [challenge, setChallenge] = useState<JourneyChallenge | null>(null);

  // Get the current user's company
  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        // Get user's company
        const { data: memberships, error: membershipError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id);
        
        if (membershipError) throw membershipError;
        if (!memberships || memberships.length === 0) {
          throw new Error('No company found for user');
        }

        // Use the first company (MVP assumes single company per user)
        setCompanyId(memberships[0].company_id);
      } catch (err: any) {
        console.error('Error fetching user company:', err);
        setError(err.message || 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCompany();
  }, []);

  // Load challenge data if in edit mode
  useEffect(() => {
    const fetchChallenge = async () => {
      if (mode !== 'view' && currentId && companyId) {
        try {
          const challenge = await JourneyChallengesService.getChallenge(currentId);
          setChallenge(challenge);
        } catch (err: any) {
          console.error('Error fetching challenge:', err);
          // Don't set error - the main loading effect will handle that
        }
      }
    };
    
    if (currentId && companyId) {
      fetchChallenge();
    }
  }, [currentId, companyId, mode]);

  const handleChallengeSubmit = (challenge: any) => {
    // Navigate back to overview
    navigate(`/company/${companyId}/journey/overview`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !companyId) {
    return (
      <div className="alert alert-error shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error: {error || 'No company found'}</span>
      </div>
    );
  }

  // Determine the back link based on mode
  const getBackLink = () => {
    if (mode === 'edit' || mode === 'create') {
      return `/company/${companyId}/journey/overview`;
    }
    return `/company/${companyId}/journey/challenges`;
  };

  // Determine the back text based on mode
  const getBackText = () => {
    if (mode === 'edit') {
      return 'Cancel Editing';
    } else if (mode === 'create') {
      return 'Cancel Creation';
    }
    return 'Back to Journey';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to={getBackLink()} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center w-fit">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {getBackText()}
        </Link>
      </div>
      
      {mode === 'view' && (
        <JourneyStepDetails companyId={companyId} />
      )}
      
      {(mode === 'edit' || mode === 'create') && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {mode === 'create' ? 'Create New Challenge' : 'Edit Challenge'}
          </h1>
          <ChallengeEditor 
            challengeId={currentId}
            phaseId={challenge?.phase_id} 
            onSave={handleChallengeSubmit}
            onCancel={() => navigate(getBackLink())}
          />
        </div>
      )}
    </div>
  );
};

export default JourneyStepPage;
