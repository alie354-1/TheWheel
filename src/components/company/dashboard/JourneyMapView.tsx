import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyJourneyService } from '../../../lib/services/companyJourney.service';
import { supabase } from '../../../lib/supabase'; // For fetching progress

// Interfaces based on schema
interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  icon?: string; // Assuming icon names or paths
  color?: string;
  steps: JourneyStep[]; // Steps will be grouped under phases
}

interface JourneyStep {
  id: string;
  phase_id: string;
  name: string;
  description?: string;
  order_index: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'; // Added status from progress
}

interface CompanyProgress {
  step_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  // Add other fields if needed, e.g., completed_at
}

interface JourneyMapViewProps {
  companyId: string;
}

const JourneyMapView: React.FC<JourneyMapViewProps> = ({ companyId }) => {
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneyData = async () => {
      if (!companyId) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch phases and steps separately
        const { data: phasesData, error: phasesError } = await supabase
          .from('journey_phases')
          .select('*')
          .order('order_index', { ascending: true });
        if (phasesError) throw phasesError;

        const { data: stepsData, error: stepsError } = await supabase
          .from('journey_steps')
          .select('*')
          .order('order_index', { ascending: true });
        if (stepsError) throw stepsError;

        // Fetch company progress
        const { data: progressData, error: progressError } = await supabase
          .from('company_progress')
          .select('step_id, status')
          .eq('company_id', companyId);
        if (progressError) throw progressError;

        const progressMap = new Map<string, CompanyProgress['status']>();
        (progressData || []).forEach(p => progressMap.set(p.step_id, p.status));

        // Combine data
        const structuredPhases: JourneyPhase[] = (phasesData || []).map(phase => ({
          ...phase,
          steps: (stepsData || [])
            .filter(step => step.phase_id === phase.id)
            .map(step => ({
              ...step,
              status: progressMap.get(step.id) || 'not_started'
            }))
        }));

        setPhases(structuredPhases);

      } catch (err: any) {
        console.error("Error fetching journey map data:", err);
        setError(err.message || "Failed to load journey map");
        setPhases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyData();
  }, [companyId]);

  // Helper to get status color
  const getStatusColor = (status?: JourneyStep['status']): string => {
    switch (status) {
      case 'completed': return 'bg-success text-success-content';
      case 'in_progress': return 'bg-info text-info-content';
      case 'skipped': return 'bg-warning text-warning-content';
      case 'not_started':
      default: return 'bg-base-300 text-base-content';
    }
  };

   // Helper to get border color based on status
   const getBorderColorClass = (status?: JourneyStep['status']): string => {
    switch (status) {
      case 'completed': return 'border-success';
      case 'in_progress': return 'border-info';
      case 'skipped': return 'border-warning';
      case 'not_started':
      default: return 'border-base-300'; // Default border
    }
  };


  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error: {error}</span>
        </div>
      ) : phases.length === 0 ? (
         <p className="text-center text-gray-500 py-10">No journey phases found.</p>
      ) : (
        <div className="space-y-6">
          {phases.map((phase) => (
            <div key={phase.id} className="card card-compact bg-base-100 shadow-md">
              <div className="card-body">
                 <h4 className="card-title text-lg font-semibold text-primary cursor-pointer">
                   Phase {phase.order_index + 1}: {phase.name}
                 </h4>
                 {phase.description && <p className="text-sm text-base-content/70 mb-4">{phase.description}</p>}

                 {phase.steps.length === 0 ? (
                   <p className="text-sm text-gray-500 italic pl-4">No steps in this phase.</p>
                 ) : (
                   <div className="space-y-3 pl-4">
                     {phase.steps.map((step) => {
                       // Using explicit return and corrected structure
                       return (
                         <div
                           key={step.id}
                           // Apply border color using classes instead of inline style
                           className={`flex items-center gap-3 border-l-4 pl-3 py-1 ${getBorderColorClass(step.status)}`}
                         >
                           <div className="flex-1 min-w-0">
                             <span className="font-medium text-base-content truncate block" title={step.name}>
                               {step.name}
                             </span>
                           </div>
                           <span className={`badge badge-sm ${getStatusColor(step.status)} flex-shrink-0`}>
                             {step.status?.replace('_', ' ')}
                           </span>
                           <Link 
                             to={`/company/journey/step/${step.id}`} 
                             className="btn btn-xs btn-ghost text-primary flex-shrink-0" 
                             title="Go to step"
                           >
                             ➔
                           </Link>
                         </div>
                       );
                     })}
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JourneyMapView;
