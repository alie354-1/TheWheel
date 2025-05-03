import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyJourneyService } from '../../../lib/services/companyJourney.service';
import { Route } from 'lucide-react'; // Using Route icon

interface JourneyStep {
  id: string;
  name: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'; // Add status here
  // Add other relevant fields if needed from the service response, e.g., phase name
}

interface JourneyData {
  steps: JourneyStep[];
  isCustom: boolean;
  // Potentially add phase information if returned by the service
}

interface JourneyProgressWidgetProps {
  companyId: string;
}

const JourneyProgressWidget: React.FC<JourneyProgressWidgetProps> = ({ companyId }) => {
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneySummary = async () => {
      if (!companyId) return;
      setLoading(true);
      setError(null);
      try {
        // Re-using getCompanyJourney for now, might need a dedicated summary endpoint later
        const data = await companyJourneyService.getCompanyJourney(companyId);
        // TODO: Process data to find current step/phase and calculate progress
        setJourneyData(data);
      } catch (err: any) {
        console.error("Error fetching journey summary for widget:", err);
        setError(err.message || "Failed to load journey progress");
        setJourneyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneySummary();
  }, [companyId]);

  // Calculate progress and find current step
  const steps = journeyData?.steps || [];
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const currentStep = steps.find(s => s.status !== 'completed'); // Find first non-completed step
  const displayStepName = currentStep?.name || (totalSteps > 0 && completedSteps === totalSteps ? "Journey Complete!" : "Not Started");

  return (
    // Ensure card uses base-100, shadow-lg, rounded-lg, h-full
    <div className="card bg-base-100 shadow-lg rounded-lg h-full">
      {/* Ensure consistent padding */}
      <div className="card-body p-5">
        {/* Ensure consistent title styling */}
        <h3 className="card-title text-lg font-semibold mb-3 text-base-content">
          <Route className="w-5 h-5 mr-1 text-primary" />
          Journey Progress
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error text-sm p-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span>{error}</span>
          </div>
        ) : journeyData ? (
          <div className="flex flex-col justify-between flex-grow">
            <div>
              {/* Use consistent text colors */}
              <p className="text-sm mb-1 text-base-content/70">
                Next Step:
              </p>
              <p className="text-base font-medium mb-3 truncate text-base-content" title={displayStepName}>{displayStepName}</p>

              <progress
                className="progress progress-primary w-full h-2.5 rounded-full" // Adjusted height
                value={progressPercentage}
                max="100"
              ></progress>
              <p className="text-sm text-right mt-1 text-gray-500">{progressPercentage}% Complete</p>
            </div>
            <div className="card-actions justify-end mt-4"> {/* Increased margin */}
              {/* TODO: Update this link/action if tab navigation changes */}
              {/* Consider using Link component if routing is set up */}
              <Link to="/company/journey" className="btn btn-sm btn-primary btn-outline">
                View Full Journey
              </Link>
            </div>
          </div>
        ) : (
           <p className="text-sm text-gray-500">No journey data available.</p>
        )}
      </div>
    </div>
  );
};

export default JourneyProgressWidget;
