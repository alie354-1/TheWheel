import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { companyJourneyService } from '../../../lib/services/companyJourney.service';
import { toast } from 'sonner';
import { useAuth } from '../../../lib/hooks/useAuth';
import DescriptionSection from './StepDetails/DescriptionSection';
import GuidanceSection from './StepDetails/GuidanceSection';
import OptionsSection from './StepDetails/OptionsSection';
import ChecklistSection from './StepDetails/ChecklistSection';
import TipsSection from './StepDetails/TipsSection';
import ResourcesSection from './StepDetails/ResourcesSection';
import NotesSection from './StepDetails/NotesSection';
import FeedbackSection from './StepDetails/FeedbackSection';
import ActionSection from './StepDetails/ActionSection';
import ToolSelector from './ToolSelector/ToolSelector';
import AdviceCard from './StepDetails/AdviceCard';
import { RecommendationsPanel } from './StepRecommendations';

interface JourneyStepDetailsProps {
  companyId: string;
}

interface StepDetails {
  id: string;
  name: string;
  description?: string;
  guidance?: string;
  phase_id: string;
  phase_name?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  options?: Array<any>;
  resources?: Array<any>;
  checklists?: Array<any>;
  tips?: Array<any>;
  ask_expert_enabled?: boolean;
  ask_wheel_enabled?: boolean;
  need_explanation?: string;
  has_tool?: string;
  tool_explanation?: string;
  steps_without?: string;
  effort_difficulty?: string;
  staff_freelancer?: string;
  key_considerations?: string;
  bootstrap_milestone?: string;
  founder_skills_needed?: string;
}

const JourneyStepDetails: React.FC<JourneyStepDetailsProps> = ({ companyId }) => {
  const { stepId } = useParams<{ stepId: string }>();
  const { user } = useAuth();
  const [step, setStep] = useState<StepDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [dismissedAdvice, setDismissedAdvice] = useState<Record<string, boolean>>({});

  // UUID validation function
  const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  // Check if stepId is a valid UUID
  useEffect(() => {
    if (stepId && !isValidUUID(stepId)) {
      setError("Invalid step ID provided.");
      setLoading(false);
    }
  }, [stepId]);

  const handleDismissAdvice = async (key: string) => {
    if (!user || !stepId || !isValidUUID(stepId)) return;

    const { error } = await supabase.from('dismissed_advice_cards').insert({
      user_id: user.id,
      step_id: stepId,
      advice_key: key,
    });

    if (error) {
      if (error.code === '23505') { // unique constraint violation
          setDismissedAdvice((prev) => ({ ...prev, [key]: true }));
      } else {
          console.error('Dismiss advice error:', error);
          toast.error(`Failed to dismiss advice: ${error.message}`);
      }
    } else {
      setDismissedAdvice((prev) => ({ ...prev, [key]: true }));
    }
  };

  useEffect(() => {
    const fetchStepDetailsAndDismissals = async () => {
      if (!stepId || !companyId || !user) return;
      
      // Skip database queries if stepId is not a valid UUID
      if (!isValidUUID(stepId)) {
        setError("Invalid step ID provided.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const [{ data: stepData, error: stepError }, { data: dismissedData, error: dismissedError }] = await Promise.all([
          supabase
            .from('journey_steps')
            .select(`
              *,
              journey_phases!inner(id, name)
            `)
            .eq('id', stepId)
            .single(),
          supabase
            .from('dismissed_advice_cards')
            .select('advice_key')
            .eq('user_id', user.id)
            .eq('step_id', stepId)
        ]);

        if (stepError) throw stepError;
        if (dismissedError) throw dismissedError;

        const stepDetails: StepDetails = {
          ...stepData,
          phase_name: stepData.journey_phases?.name,
        };

        const dismissedAdviceMap = dismissedData.reduce((acc, curr) => {
          acc[curr.advice_key] = true;
          return acc;
        }, {} as Record<string, boolean>);

        setStep(stepDetails);
        setDismissedAdvice(dismissedAdviceMap);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStepDetailsAndDismissals();
  }, [stepId, companyId, user]);

  if (loading) {
    return <div className="flex items-center justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error || !step) {
    return <div className="alert alert-error shadow-md">Error: {error || 'Step not found'}</div>;
  }

  return (
    <div className="container mx-auto grid grid-cols-12 gap-6 p-8">
      <div className="col-span-9 space-y-6">
        <div className="card bg-base-100 shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">{step.name}</h1>
          <AdviceCard title="Test Advice" content="This is a test advice card to confirm visibility." onDismiss={() => handleDismissAdvice("test_advice")} />
          {step.phase_name && <div className="mb-4 text-lg text-gray-600">Phase: {step.phase_name}</div>}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Key Information</h2>
            {step.description && (
              <AdviceCard title="Step Description" content={step.description} onDismiss={() => handleDismissAdvice("description")} />
            )}
            {step.guidance && (
              <AdviceCard title="Guidance" content={step.guidance} onDismiss={() => handleDismissAdvice("guidance")} />
            )}
            {step.need_explanation && <AdviceCard title="Planning Required" content={step.need_explanation} onDismiss={() => handleDismissAdvice("need_explanation")} />}
            {step.has_tool && <AdviceCard title="Recommended Tools" content={step.has_tool} onDismiss={() => handleDismissAdvice("has_tool")} />}
            {step.tool_explanation && <AdviceCard title="Tool Details" content={step.tool_explanation} onDismiss={() => handleDismissAdvice("tool_explanation")} />}
          </div>

          <div className="space-y-4 mt-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Considerations</h2>
            {step.steps_without && <AdviceCard title="Steps Without This" content={step.steps_without} onDismiss={() => handleDismissAdvice("steps_without")} />}
            {step.effort_difficulty && <AdviceCard title="Effort/Difficulty" content={step.effort_difficulty} onDismiss={() => handleDismissAdvice("effort_difficulty")} />}
            {step.staff_freelancer && <AdviceCard title="Staff/Freelancer Needed" content={step.staff_freelancer} onDismiss={() => handleDismissAdvice("staff_freelancer")} />}
            {step.key_considerations && <AdviceCard title="Key Considerations" content={step.key_considerations} onDismiss={() => handleDismissAdvice("key_considerations")} />}
          </div>

          <div className="space-y-4 mt-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Milestones & Skills</h2>
            {step.bootstrap_milestone && <AdviceCard title="Bootstrap Milestone" content={step.bootstrap_milestone} onDismiss={() => handleDismissAdvice("bootstrap_milestone")} />}
            {step.founder_skills_needed && <AdviceCard title="Founder Skills Needed" content={step.founder_skills_needed} onDismiss={() => handleDismissAdvice("founder_skills_needed")} />}
          </div>
          {(step.options?.length ?? 0) > 0 && <OptionsSection options={step.options!} />}
          {(step.resources?.length ?? 0) > 0 && <ResourcesSection resources={step.resources!} />}
          {(step.checklists?.length ?? 0) > 0 && <ChecklistSection checklists={step.checklists!} />}
          {(step.tips?.length ?? 0) > 0 && <TipsSection tips={step.tips!} />}
        </div>

        <NotesSection
          notes={notes}
          onSave={async (newNotes) => {
            if (!isValidUUID(stepId || '')) {
              toast.error("Cannot save notes: Invalid step ID");
              return;
            }
            setIsSavingNotes(true);
            try {
              await companyJourneyService.saveStepNotes(companyId, stepId!, newNotes);
              setNotes(newNotes);
              toast.success("Notes saved.");
            } catch (err) {
              toast.error("Failed to save notes.");
            } finally {
              setIsSavingNotes(false);
            }
          }}
          isSaving={isSavingNotes}
        />

        <FeedbackSection
          feedbackList={[]}
          onSubmit={async (rating, comment) => {
            if (user && stepId && isValidUUID(stepId)) {
              try {
                await companyJourneyService.submitStepFeedback(stepId, user.id, rating, comment);
                toast.success("Feedback submitted.");
              } catch (err) {
                toast.error("Failed to submit feedback.");
              }
            } else {
              toast.error("Cannot submit feedback: Invalid step ID");
            }
          }}
        />
      </div>

      <div className="col-span-3 sticky top-4 self-start space-y-4">
        <RecommendationsPanel 
          stepId={stepId}
          onStepSelect={(selectedStepId) => {
            if (selectedStepId && isValidUUID(selectedStepId)) {
              window.location.href = `/company/${companyId}/journey/step/${selectedStepId}`;
            }
          }}
          className="mb-4"
        />
      
        <div className="card bg-base-100 shadow-md mb-4">
          <div className="card-body">
            <h3 className="card-title text-lg">Tool Selection</h3>
            <p className="text-sm text-base-content/70 mb-4">
              Explore recommended tools for this step, compare options, and select the best fit for your needs.
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => setShowToolSelector(true)}
            >
              Explore & Compare Tools
            </button>
          </div>
        </div>
        
        <ActionSection
          status={step.status || "not_started"}
          isFocusArea={false}
          isTogglingFocus={false}
          isCompleting={false}
          isSkipping={false}
          onMarkComplete={() => {}}
          onSkipStep={() => {}}
          onToggleFocus={() => {}}
          askExpertEnabled={step.ask_expert_enabled || false}
          onAskExpert={() => {}}
          askWheelEnabled={step.ask_wheel_enabled || false}
          onAskWheel={() => {}}
          onTrackManually={() => {}}
          onInvestigateTools={() => setShowToolSelector(true)}
        />
      </div>

      <ToolSelector
        open={showToolSelector}
        onClose={() => setShowToolSelector(false)}
        stepId={stepId || ""}
        companyId={companyId}
        userId={user?.id || ""}
      />
    </div>
  );
};

export default JourneyStepDetails;
