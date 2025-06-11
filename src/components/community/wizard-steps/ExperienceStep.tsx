import React, { useState, useEffect } from 'react';
import { ExpertProfile, StartupStage } from '../../../lib/types/community.types';

interface ExperienceStepProps {
  formData: Partial<ExpertProfile>;
  updateFormData: (data: Partial<ExpertProfile>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

// Predefined industries
const INDUSTRIES = [
  'SaaS',
  'Fintech',
  'Healthtech',
  'E-commerce',
  'Marketplace',
  'Enterprise',
  'Consumer',
  'Hardware',
  'AI/ML',
  'Blockchain',
  'Climate Tech',
  'Edtech',
  'Gaming',
  'Media',
  'Biotech',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Transportation',
  'Energy'
];

// Predefined functional areas
const FUNCTIONAL_AREAS = [
  'Product Management',
  'Engineering',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Design',
  'Data Science',
  'Research',
  'Business Development',
  'Strategy',
  'Consulting',
  'Executive Leadership'
];

// Startup stages
const STARTUP_STAGES: StartupStage[] = [
  'pre_seed',
  'seed',
  'series_a',
  'series_b',
  'series_c_plus',
  'growth',
  'exit'
];

// Helper function to format stage for display
const formatStage = (stage: StartupStage): string => {
  switch (stage) {
    case 'pre_seed': return 'Pre-Seed';
    case 'seed': return 'Seed';
    case 'series_a': return 'Series A';
    case 'series_b': return 'Series B';
    case 'series_c_plus': return 'Series C+';
    case 'growth': return 'Growth';
    case 'exit': return 'Exit (IPO/Acquisition)';
    default: return stage;
  }
};

/**
 * Third step of the expert profile wizard
 * Collects information about industry and functional experience
 */
const ExperienceStep: React.FC<ExperienceStepProps> = ({
  formData,
  updateFormData,
  goToNextStep,
  goToPreviousStep
}) => {
  // Initialize industry experience
  const [industryExperience, setIndustryExperience] = useState<Record<string, any>>(
    formData.industry_experience || {}
  );
  
  // Initialize functional experience
  const [functionalExperience, setFunctionalExperience] = useState<Record<string, any>>(
    formData.functional_experience || {}
  );
  
  // Initialize company stages experienced
  const [stagesExperienced, setStagesExperienced] = useState<StartupStage[]>(
    formData.company_stages_experienced || []
  );
  
  // Form validation
  const [isValid, setIsValid] = useState(false);
  
  // Validate the form
  useEffect(() => {
    const hasIndustryExperience = Object.keys(industryExperience).length > 0;
    const hasFunctionalExperience = Object.keys(functionalExperience).length > 0;
    setIsValid(hasIndustryExperience || hasFunctionalExperience);
  }, [industryExperience, functionalExperience]);

  // Handle industry experience toggle
  const toggleIndustry = (industry: string) => {
    const updatedExperience = { ...industryExperience };
    
    if (updatedExperience[industry]) {
      delete updatedExperience[industry];
    } else {
      updatedExperience[industry] = { years: 1 };
    }
    
    setIndustryExperience(updatedExperience);
  };

  // Handle functional experience toggle
  const toggleFunctionalArea = (area: string) => {
    const updatedExperience = { ...functionalExperience };
    
    if (updatedExperience[area]) {
      delete updatedExperience[area];
    } else {
      updatedExperience[area] = { years: 1 };
    }
    
    setFunctionalExperience(updatedExperience);
  };

  // Update years of experience
  const updateYears = (type: 'industry' | 'functional', key: string, years: number) => {
    if (type === 'industry') {
      setIndustryExperience({
        ...industryExperience,
        [key]: { ...industryExperience[key], years }
      });
    } else {
      setFunctionalExperience({
        ...functionalExperience,
        [key]: { ...functionalExperience[key], years }
      });
    }
  };

  // Toggle company stage
  const toggleStage = (stage: StartupStage) => {
    if (stagesExperienced.includes(stage)) {
      setStagesExperienced(stagesExperienced.filter(s => s !== stage));
    } else {
      setStagesExperienced([...stagesExperienced, stage]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValid) {
      updateFormData({
        industry_experience: Object.keys(industryExperience).length > 0 ? industryExperience : undefined,
        functional_experience: Object.keys(functionalExperience).length > 0 ? functionalExperience : undefined,
        company_stages_experienced: stagesExperienced.length > 0 ? stagesExperienced : undefined
      });
      goToNextStep();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Experience</h3>
      <p className="text-gray-600 mb-6">
        Tell us about your industry and functional experience to help match you with relevant opportunities.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Industry Experience */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry Experience
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select the industries where you have professional experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {INDUSTRIES.map((industry) => (
              <div 
                key={industry}
                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                  industryExperience[industry] ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleIndustry(industry)}
              >
                <div className="flex items-center justify-between">
                  <span className={industryExperience[industry] ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                    {industry}
                  </span>
                  {industryExperience[industry] && (
                    <div 
                      className="ml-2" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={industryExperience[industry].years}
                        onChange={(e) => updateYears('industry', industry, parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md text-sm p-1"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                          <option key={year} value={year}>
                            {year} {year === 1 ? 'year' : 'years'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Functional Experience */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Functional Experience
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select the functional areas where you have professional experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {FUNCTIONAL_AREAS.map((area) => (
              <div 
                key={area}
                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                  functionalExperience[area] ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleFunctionalArea(area)}
              >
                <div className="flex items-center justify-between">
                  <span className={functionalExperience[area] ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                    {area}
                  </span>
                  {functionalExperience[area] && (
                    <div 
                      className="ml-2" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={functionalExperience[area].years}
                        onChange={(e) => updateYears('functional', area, parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md text-sm p-1"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                          <option key={year} value={year}>
                            {year} {year === 1 ? 'year' : 'years'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Stages */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Stages
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Select the company stages you have experience with.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {STARTUP_STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => toggleStage(stage)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  stagesExperienced.includes(stage)
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {formatStage(stage)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`px-6 py-2 rounded-md font-medium ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperienceStep;
