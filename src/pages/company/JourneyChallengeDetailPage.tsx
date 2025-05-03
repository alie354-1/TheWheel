import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JourneyChallenge, challenge_status } from '../../lib/types/journey-challenges.types';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';
import { StatusBadge, DifficultyIndicator, EstimatedTime } from '../../components/company/journey/ChallengeCard';
import { ArrowLeft, Check, PlayCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * JourneyChallengeDetailPage
 * 
 * Displays detailed information about a specific challenge and allows users to interact with it.
 */
export default function JourneyChallengeDetailPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<JourneyChallenge | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [status, setStatus] = useState<challenge_status>('not_started');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  
  // Get company info on mount
  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');
        
        const { data: memberships, error: membershipError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id);
        
        if (membershipError) throw membershipError;
        if (!memberships || memberships.length === 0) {
          throw new Error('No company found for user');
        }
        
        setCompanyId(memberships[0].company_id);
      } catch (err: any) {
        console.error('Error fetching user company:', err);
        setError(err.message || 'Failed to load company data');
      }
    };
    
    fetchUserCompany();
  }, []);

  // Load challenge data
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!challengeId || !companyId) return;
      
      try {
        setLoading(true);
        
        // Load challenge details
        const challengeData = await JourneyChallengesService.getChallenge(challengeId);
        setChallenge(challengeData);
        
        // Load progress data
        const progressData = await JourneyChallengesService.getCompanyProgress(companyId);
        if (progressData[challengeId]) {
          setStatus(progressData[challengeId].status);
        }
        
        // Load recommended tools
        const toolsData = await JourneyChallengesService.getChallengeTools(challengeId);
        setTools(toolsData);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading challenge data:', err);
        setError(err.message || 'Failed to load challenge');
        setLoading(false);
      }
    };
    
    loadChallengeData();
  }, [challengeId, companyId]);

  // Handle status updates
  const updateStatus = async (newStatus: challenge_status) => {
    if (!companyId || !challengeId) return;
    
    try {
      await JourneyChallengesService.updateChallengeStatus(companyId, challengeId, newStatus);
      setStatus(newStatus);
    } catch (err: any) {
      console.error('Error updating challenge status:', err);
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error || 'Challenge not found'}</p>
          <p className="mt-2">
            <button 
              onClick={() => navigate('/company/journey/challenges')}
              className="text-red-700 underline hover:text-red-800"
            >
              Return to challenges
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button and header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/company/journey/challenges')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to challenges
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <StatusBadge status={status} />
              <DifficultyIndicator level={challenge.difficulty_level} />
              <EstimatedTime 
                minMinutes={challenge.estimated_time_min} 
                maxMinutes={challenge.estimated_time_max} 
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="space-x-3">
            {status === 'not_started' && (
              <button
                onClick={() => updateStatus('in_progress')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Challenge
              </button>
            )}
            
            {status === 'in_progress' && (
              <button
                onClick={() => updateStatus('completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Check className="h-5 w-5 mr-2" />
                Mark Complete
              </button>
            )}
            
            {(status === 'not_started' || status === 'in_progress') && (
              <button
                onClick={() => updateStatus('skipped')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Skip Challenge
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-600">{challenge.description || 'No description available.'}</p>
          </section>
          
          {/* Key outcomes */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Outcomes</h2>
            {challenge.key_outcomes && challenge.key_outcomes.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {challenge.key_outcomes && challenge.key_outcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No outcomes specified.</p>
            )}
          </section>
          
          {/* Notes section - placeholder for future implementation */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Add your notes about this challenge here..."
            ></textarea>
            <button className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
              Save Notes
            </button>
          </section>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommended tools */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Tools</h2>
            {tools.length > 0 ? (
              <div className="space-y-4">
                {tools.map((toolRec) => (
                  <div key={toolRec.id} className="border border-gray-100 p-3 rounded-md hover:bg-gray-50">
                    <h3 className="font-medium text-gray-800">{toolRec.tool?.name || 'Tool'}</h3>
                    <p className="text-sm text-gray-600 mt-1">{toolRec.tool?.description || 'No description'}</p>
                    {toolRec.tool?.url && (
                      <a
                        href={toolRec.tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Learn more
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tools have been recommended for this challenge.</p>
            )}
          </section>
          
          {/* Additional resources - placeholder for future implementation */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resources</h2>
            <p className="text-gray-500">Additional resources will be available in Sprint 2.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
