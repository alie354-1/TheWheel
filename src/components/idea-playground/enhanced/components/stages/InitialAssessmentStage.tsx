import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../../lib/types/idea-playground.types';

interface InitialAssessmentStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const InitialAssessmentStage: React.FC<InitialAssessmentStageProps> = ({ onSave }) => {
  const { state, goToNextStage, goToPreviousStage, completeCurrentStage } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  
  // Assessment criteria
  type AssessmentData = {
    problemClarity: number;
    solutionFeasibility: number;
    marketPotential: number;
    competitiveAdvantage: number;
    resourceRequirements: number;
    notes: string;
  };
  
  const [assessment, setAssessment] = useState<AssessmentData>({
    problemClarity: 0,
    solutionFeasibility: 0,
    marketPotential: 0,
    competitiveAdvantage: 0,
    resourceRequirements: 0,
    notes: '',
  });
  
  // Calculate overall score
  const overallScore = (
    assessment.problemClarity +
    assessment.solutionFeasibility +
    assessment.marketPotential +
    assessment.competitiveAdvantage +
    assessment.resourceRequirements
  ) / 5;
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Handle rating change
  const handleRatingChange = (criterion: keyof typeof assessment, value: number) => {
    setAssessment(prev => ({
      ...prev,
      [criterion]: value
    }));
  };
  
  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAssessment(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || !idea) return;
    
    setIsLoading(true);
    try {
      // Save assessment data
      await onSave({
        // We could save assessment data to specific fields if needed
        // For now, we'll just update the description to include the assessment
        description: `${idea.description}\n\nInitial Assessment Score: ${overallScore.toFixed(1)}/5`
      });
      
      // Complete this stage
      await completeCurrentStage({
        completed_at: new Date().toISOString(),
        assessment_data: assessment,
        overall_score: overallScore
      });
      
      // Go to next stage
      goToNextStage();
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rating component
  const RatingInput = ({ 
    criterion, 
    label, 
    description 
  }: { 
    criterion: keyof Omit<AssessmentData, 'notes'>, 
    label: string, 
    description: string 
  }) => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 font-medium">
            {label}
          </label>
          <span className={`font-bold ${getScoreColor(assessment[criterion])}`}>
            {assessment[criterion]}/5
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingChange(criterion, value)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                assessment[criterion] >= value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Initial Assessment</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Idea Summary</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium">{idea?.title}</h3>
          <p className="text-gray-600">{idea?.description}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Assessment Criteria</h2>
          <p className="text-gray-600 mb-4">
            Rate each aspect of your idea on a scale of 1-5, where 1 is very weak and 5 is very strong.
          </p>
          
          <RatingInput
            criterion="problemClarity"
            label="Problem Clarity"
            description="How well-defined and significant is the problem you're solving?"
          />
          
          <RatingInput
            criterion="solutionFeasibility"
            label="Solution Feasibility"
            description="How technically feasible and practical is your proposed solution?"
          />
          
          <RatingInput
            criterion="marketPotential"
            label="Market Potential"
            description="How large and accessible is the market for your solution?"
          />
          
          <RatingInput
            criterion="competitiveAdvantage"
            label="Competitive Advantage"
            description="How strong is your advantage over existing alternatives?"
          />
          
          <RatingInput
            criterion="resourceRequirements"
            label="Resource Requirements"
            description="How reasonable are the resources needed to execute your idea?"
          />
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Overall Assessment</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    overallScore >= 4
                      ? 'bg-green-500'
                      : overallScore >= 2.5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(overallScore / 5) * 100}%` }}
                ></div>
              </div>
              <span className={`ml-4 font-bold text-xl ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(1)}/5
              </span>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
                Assessment Notes
              </label>
              <textarea
                id="notes"
                value={assessment.notes}
                onChange={handleNotesChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional thoughts, concerns, or opportunities..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStage}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md flex items-center"
          >
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">arrow_forward</span>
                Continue to Detailed Refinement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InitialAssessmentStage;
