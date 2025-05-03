import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowRight, PlusCircle } from 'lucide-react';
import JourneyOverview from '../../components/company/journey/JourneyOverview';
import { Term } from '../../components/terminology/Term';

/**
 * JourneyOverviewPage
 * 
 * A consolidated view of a company's journey progress, showing completion metrics
 * and allowing quick access to steps across all phases.
 * 
 * Updated in Sprint 2 to use the unified journey system.
 */
export default function JourneyOverviewPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Since JourneyOverview component handles the journey data internally, 
  // we don't need to use the hook here anymore

  // Get company info
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
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching user company:', err);
        setError(err.message || 'Failed to load company data');
        setLoading(false);
      }
    };

    fetchUserCompany();
  }, []);

  // No need to calculate stats manually, the JourneyOverview component does this internally

  // The JourneyOverview component handles step interactions now

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error;
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {errorMessage}</p>
          <p className="mt-2">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  // If company ID is available, display the UI
  if (companyId) {

    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Term keyPath="journeyTerms.journey" fallback="Journey" /> Overview
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Track your progress across all business <Term keyPath="journeyTerms.step.plural" fallback="steps" />. 
            This overview helps you visualize where you are in your <Term keyPath="journeyTerms.journey" fallback="journey" /> and what to focus on next.
          </p>
        </header>
        
        {/* Using our reusable JourneyOverview component */}
        <JourneyOverview 
          companyId={companyId}
          onSelectStep={(stepId) => navigate(`/company/journey/step/${stepId}`)}
        />
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/company/journey/steps')}
              className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors"
            >
              <span>Browse All <Term keyPath="journeyTerms.step.plural" fallback="Steps" /></span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            {/* We'll keep this functionality if custom steps are supported */}
            <button 
              onClick={() => navigate('/company/journey/steps/create')}
              className="flex items-center justify-between bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors"
            >
              <span>Create Custom <Term keyPath="journeyTerms.step.singular" fallback="Step" /></span>
              <PlusCircle className="h-5 w-5" />
            </button>
            
          </div>
        </div>
      </div>
    );
  }

  // Fallback in case journey is null but we're not loading or in error state
  return (
    <div className="min-h-screen p-6">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>No journey data available. Please try again or contact support.</p>
      </div>
    </div>
  );
}
