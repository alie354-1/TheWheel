import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/utils/supabaseClient';

/**
 * StepRedirectHandler component
 * 
 * This component determines whether a step ID belongs to a template step or a company journey step
 * and redirects to the appropriate route.
 */
const StepRedirectHandler: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const determineStepType = async () => {
      if (!stepId) {
        setError('No step ID provided');
        return;
      }

      try {
        // First, check if this is a company journey step
        const { data: companyStepData, error: companyStepError } = await supabase
          .from('company_new_journey_steps')
          .select('id')
          .eq('id', stepId)
          .single();

        if (companyStepData) {
          // This is a company journey step, redirect to company step route
          navigate(`/company/new-journey/company-step/${stepId}`, { replace: true });
          return;
        }

        // If not a company step, check if it's a template step
        const { data: templateStepData, error: templateStepError } = await supabase
          .from('journey_new_steps')
          .select('id')
          .eq('id', stepId)
          .single();

        if (templateStepData) {
          // This is a template step, redirect to template step route
          navigate(`/company/new-journey/template-step/${stepId}`, { replace: true });
          return;
        }

        // If we get here, the step ID doesn't exist in either table
        setError(`Step with ID ${stepId} not found`);
      } catch (error) {
        console.error('Error determining step type:', error);
        setError('An error occurred while determining step type');
      } finally {
        setLoading(false);
      }
    };

    determineStepType();
  }, [stepId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => navigate('/company/new-journey')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return null;
};

export default StepRedirectHandler;
