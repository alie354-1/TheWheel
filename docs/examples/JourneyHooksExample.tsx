/**
 * THIS IS A DOCUMENTATION EXAMPLE FILE ONLY
 * 
 * This file demonstrates patterns for using the Journey hooks.
 * It may show TypeScript errors as it's meant to illustrate usage patterns
 * rather than be compiled directly. In a real application, you would
 * need to adjust property names to match your actual data structure.
 */
import React, { useState } from 'react';
import { 
  useCompanyJourney, 
  useStepProgress, 
  useJourneySteps, 
  useJourneyTools 
} from '../../src/lib/hooks';

// Example component showing useCompanyJourney usage
export const CompanyJourneyExample: React.FC = () => {
  const companyId = '123e4567-e89b-12d3-a456-426614174000'; // Example company ID
  const { 
    phases, 
    phaseProgress, 
    companySteps, 
    isLoading, 
    error, 
    updateStepProgress, 
    completionPercentage 
  } = useCompanyJourney(companyId);

  if (isLoading) return <div>Loading journey data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Handler for updating a step's status
  const handleStatusChange = async (stepId: string, status: 'not_started' | 'in_progress' | 'completed' | 'skipped') => {
    try {
      await updateStepProgress(stepId, { status });
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to update step:', err);
      // Error handling could be added here
    }
  };

  return (
    <div className="company-journey">
      <h2>Company Journey</h2>
      <div className="progress-overview">
        <h3>Overall Progress: {completionPercentage.toFixed(0)}%</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercentage}%` }} 
          />
        </div>
      </div>

      <div className="phases">
        {phaseProgress.map(phase => (
          <div key={phase.id} className="phase-card">
            <h3>{phase.name}</h3>
            <div className="phase-stats">
              <div>Completed: {phase.completed_steps} / {phase.steps_count}</div>
              <div>In Progress: {phase.in_progress_steps}</div>
              <div>Completion: {phase.completion_percentage.toFixed(0)}%</div>
            </div>
          </div>
        ))}
      </div>

      <div className="steps-list">
        <h3>Steps</h3>
        {companySteps.map(step => (
          <div key={step.step_id} className={`step-item status-${step.status}`}>
            <div className="step-info">
              <div className="step-name">{step.name}</div>
              <div className="step-status">{step.status}</div>
            </div>
            <div className="step-actions">
              <button onClick={() => handleStatusChange(step.step_id, 'not_started')}>
                Reset
              </button>
              <button onClick={() => handleStatusChange(step.step_id, 'in_progress')}>
                Start
              </button>
              <button onClick={() => handleStatusChange(step.step_id, 'completed')}>
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example component showing useStepProgress usage
export const StepProgressExample: React.FC<{ companyId: string, stepId: string }> = ({ 
  companyId, 
  stepId 
}) => {
  const { 
    stepDetails, 
    stepProgress, 
    selectedTool, 
    recommendedTools, 
    isLoading, 
    error, 
    updateProgress, 
    selectTool,
    rateTool 
  } = useStepProgress(companyId, stepId);

  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  if (isLoading) return <div>Loading step data...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!stepDetails) return <div>Step not found</div>;

  const handleStatusChange = async (status: 'not_started' | 'in_progress' | 'completed' | 'skipped') => {
    try {
      await updateProgress({ status });
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to update status:', err);
      // Error handling could be added here
    }
  };

  const handleToolSelect = async (toolId: string) => {
    try {
      await selectTool(toolId);
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to select tool:', err);
      // Error handling could be added here
    }
  };

  const handleToolRating = async (toolId: string) => {
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    try {
      await rateTool(toolId, rating, notes);
      setRating(0);
      setNotes('');
      // Success notification could be added here
    } catch (err) {
      console.error('Failed to rate tool:', err);
      // Error handling could be added here
    }
  };

  return (
    <div className="step-progress">
      <h2>{stepDetails.name}</h2>
      <div className="step-description">{stepDetails.description}</div>
      
      <div className="step-status">
        <h3>Current Status: {stepProgress?.status || 'Not Started'}</h3>
        <div className="status-actions">
          <button onClick={() => handleStatusChange('not_started')}>Reset</button>
          <button onClick={() => handleStatusChange('in_progress')}>Start</button>
          <button onClick={() => handleStatusChange('completed')}>Complete</button>
          <button onClick={() => handleStatusChange('skipped')}>Skip</button>
        </div>
      </div>

      <div className="tools-section">
        <h3>Recommended Tools</h3>
        <div className="tools-list">
          {recommendedTools.map(tool => (
            <div key={tool.id} className="tool-card">
              <div className="tool-name">{tool.name}</div>
              <div className="tool-description">{tool.description}</div>
              <button 
                onClick={() => handleToolSelect(tool.id)}
                disabled={selectedTool?.id === tool.id}
              >
                {selectedTool?.id === tool.id ? 'Selected' : 'Select'}
              </button>

              {selectedTool?.id === tool.id && (
                <div className="rating-section">
                  <h4>Rate this tool</h4>
                  <div className="rating-inputs">
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={rating || ''} 
                      onChange={e => setRating(parseInt(e.target.value, 10))}
                      placeholder="Rating (1-5)"
                    />
                    <textarea 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Notes (optional)"
                    />
                    <button onClick={() => handleToolRating(tool.id)}>
                      Submit Rating
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example for useJourneySteps and useJourneyTools
export const JourneyAdminExample: React.FC = () => {
  const { steps, isLoading: stepsLoading, error: stepsError, createStep, updateStep } = useJourneySteps();
  const { tools, isLoading: toolsLoading, error: toolsError, createTool } = useJourneyTools();

  if (stepsLoading || toolsLoading) return <div>Loading data...</div>;
  if (stepsError) return <div>Steps Error: {stepsError.message}</div>;
  if (toolsError) return <div>Tools Error: {toolsError.message}</div>;

  return (
    <div className="journey-admin">
      <h2>Journey Administration</h2>
      
      <div className="steps-management">
        <h3>Steps Management ({steps.length} total)</h3>
        <div className="steps-grid">
          {steps.slice(0, 5).map(step => (
            <div key={step.id} className="step-card">
              <div className="step-name">{step.name}</div>
              <div className="step-phase">Phase: {step.phase_name}</div>
              <div className="step-difficulty">Difficulty: {step.difficulty_level}</div>
            </div>
          ))}
          {steps.length > 5 && <div className="more-indicator">+ {steps.length - 5} more</div>}
        </div>
      </div>

      <div className="tools-management">
        <h3>Tools Management ({tools.length} total)</h3>
        <div className="tools-grid">
          {tools.slice(0, 5).map(tool => (
            <div key={tool.id} className="tool-card">
              <div className="tool-name">{tool.name}</div>
              <div className="tool-type">Type: {tool.type}</div>
              {tool.url && <div className="tool-url">URL: {tool.url}</div>}
            </div>
          ))}
          {tools.length > 5 && <div className="more-indicator">+ {tools.length - 5} more</div>}
        </div>
      </div>
    </div>
  );
};
