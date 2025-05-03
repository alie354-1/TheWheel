import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JourneyChallenge, JourneyPhase } from '../../lib/types/journey-challenges.types';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';
import { ChallengeList } from '../../components/company/journey/ChallengeList';
import { PhaseProgress } from '../../components/company/journey/PhaseProgress';
import { supabase } from '../../lib/supabase';
import { Filter, Search, Sliders, ArrowLeft } from 'lucide-react';

/**
 * JourneyChallengesPage
 * 
 * Displays all challenges in a filterable, searchable grid.
 * Can be filtered by phase if phase query parameter is provided.
 */
export default function JourneyChallengesPage() {
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase');
  const navigate = useNavigate();
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [challenges, setChallenges] = useState<JourneyChallenge[]>([]);
  const [progressData, setProgressData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<JourneyPhase | null>(null);
  
  // Get company info on mount
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
      }
    };
    
    fetchUserCompany();
  }, []);

  // Load data once company is identified
  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;
      
      try {
        setLoading(true);
        
        // Load phases
        const phases = await JourneyChallengesService.getPhases();
        setPhases(phases);
        
        // Set selected phase if phaseId is provided
        if (phaseId) {
          const phase = phases.find(p => p.id === phaseId);
          if (phase) {
            setSelectedPhase(phase);
          }
        }
        
        // Load challenges (filtered by phase if specified)
        const challenges = await JourneyChallengesService.getChallenges(phaseId || undefined);
        setChallenges(challenges);
        
        // Load progress data
        const progress = await JourneyChallengesService.getCompanyProgress(companyId);
        setProgressData(progress);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading journey data:', err);
        setError(err.message || 'Failed to load journey data');
        setLoading(false);
      }
    };
    
    loadData();
  }, [companyId, phaseId]);

  // Handle starting a challenge
  const handleStartChallenge = async (challenge: JourneyChallenge) => {
    if (!companyId) return;
    
    try {
      await JourneyChallengesService.updateChallengeStatus(
        companyId,
        challenge.id,
        'in_progress'
      );
      
      // Navigate to challenge detail page
      navigate(`/company/journey/challenge/${challenge.id}`);
    } catch (err: any) {
      console.error('Error starting challenge:', err);
      setError(err.message || 'Failed to start challenge');
    }
  };
  
  // Handle customizing a challenge
  const handleCustomizeChallenge = (challenge: JourneyChallenge) => {
    navigate(`/company/journey/challenge/${challenge.id}/edit`);
  };
  
  // Handle marking a challenge as irrelevant
  const handleMarkIrrelevant = async (challenge: JourneyChallenge) => {
    if (!companyId) return;
    
    try {
      await JourneyChallengesService.updateChallengeStatus(
        companyId,
        challenge.id,
        'skipped'
      );
      
      // Update local state
      setProgressData(prevData => ({
        ...prevData,
        [challenge.id]: {
          ...prevData[challenge.id],
          status: 'skipped'
        }
      }));
    } catch (err: any) {
      console.error('Error marking challenge as irrelevant:', err);
      setError(err.message || 'Failed to update challenge status');
    }
  };
  
  // Handle viewing a challenge's details
  const handleChallengeClick = (challenge: JourneyChallenge) => {
    navigate(`/company/journey/challenge/${challenge.id}`);
  };
  
  // Calculate phases progress for sidebar
  const getPhaseProgress = (phase: JourneyPhase) => {
    const phaseChallenges = challenges.filter(c => c.phase_id === phase.id);
    const completedCount = phaseChallenges.filter(c => 
      progressData[c.id]?.status === 'completed'
    ).length;
    
    return {
      completedCount,
      totalCount: phaseChallenges.length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
          <p className="mt-2">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button if phase is selected */}
      <header className="mb-8 flex items-center">
        {selectedPhase && (
          <button 
            onClick={() => navigate('/company/journey/challenges')}
            className="mr-4 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedPhase ? selectedPhase.name : 'Business Challenges'}
          </h1>
          <p className="text-gray-600 max-w-3xl">
            {selectedPhase 
              ? selectedPhase.description
              : 'Browse all business challenges across your journey. Filter, search, or select a phase to find relevant challenges.'}
          </p>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Phase sidebar (only shown on full challenges page) */}
        {!selectedPhase && (
          <div className="lg:w-1/4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phases</h2>
            {phases.map(phase => (
              <PhaseProgress
                key={phase.id}
                name={phase.name}
                description={phase.description}
                {...getPhaseProgress(phase)}
                onClick={() => navigate(`/company/journey/challenges?phase=${phase.id}`)}
              />
            ))}
          </div>
        )}
        
        {/* Main content */}
        <div className={`${selectedPhase ? 'w-full' : 'lg:w-3/4'}`}>
          <ChallengeList
            challenges={challenges}
            progressData={progressData}
            phaseId={selectedPhase?.id}
            onChallengeClick={handleChallengeClick}
            onStartClick={handleStartChallenge}
            onCustomizeClick={handleCustomizeChallenge}
            onMarkIrrelevantClick={handleMarkIrrelevant}
          />
        </div>
      </div>
    </div>
  );
}
