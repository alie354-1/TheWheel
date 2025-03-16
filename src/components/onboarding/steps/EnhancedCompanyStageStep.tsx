import React, { useState } from 'react';
import { CompanyStageType } from '../../../lib/types/enhanced-profile.types';

interface EnhancedCompanyStageStepProps {
  onNext: (data: { companyStage: CompanyStageType }) => void;
  onBack: () => void;
  initialValue?: CompanyStageType;
}

export const EnhancedCompanyStageStep: React.FC<EnhancedCompanyStageStepProps> = ({
  onNext,
  onBack,
  initialValue
}) => {
  const [companyStage, setCompanyStage] = useState<CompanyStageType | null>(initialValue || null);
  const [loading, setLoading] = useState(false);

  const stageOptions = [
    {
      id: 'idea_stage' as CompanyStageType,
      title: 'Idea Stage',
      description: 'I have an idea but haven\'t formally established a company yet',
      icon: 'lightbulb',
      color: 'blue',
      featuredModule: 'Idea Playground'
    },
    {
      id: 'solid_idea' as CompanyStageType,
      title: 'Solid Idea',
      description: 'I have a well-defined concept and am ready to establish my company',
      icon: 'clipboard-check',
      color: 'green',
      featuredModule: 'Company Formation'
    },
    {
      id: 'existing_company' as CompanyStageType,
      title: 'Existing Company',
      description: 'I already have an established company and want to enter its information',
      icon: 'building',
      color: 'purple',
      featuredModule: 'Team Management'
    }
  ];

  const handleContinue = () => {
    if (!companyStage) return;
    
    setLoading(true);
    
    // Send to parent component to handle navigation
    onNext({ companyStage });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">What stage is your company in?</h2>
      <p className="text-gray-600 mb-8">
        Select the stage that best describes your current situation. This helps us tailor the experience to your needs.
      </p>
      
      <div className="space-y-4 mb-10">
        {stageOptions.map((stage) => (
          <div
            key={stage.id}
            onClick={() => setCompanyStage(stage.id)}
            className={`border rounded-lg p-5 cursor-pointer transition-all ${
              companyStage === stage.id
                ? `border-${stage.color}-500 bg-${stage.color}-50 shadow-md`
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
          >
            <div className="flex items-start">
              <div className={`rounded-full p-3 mr-4 mt-1 ${
                companyStage === stage.id ? `bg-${stage.color}-500 text-white` : 'bg-gray-100'
              }`}>
                <i className={`fas fa-${stage.icon} text-lg`}></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{stage.title}</h3>
                <p className="text-gray-600 mt-1">{stage.description}</p>
                
                {companyStage === stage.id && (
                  <div className="mt-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${stage.color}-100 text-${stage.color}-800`}>
                      <i className="fas fa-star mr-1"></i>
                      Recommended: {stage.featuredModule}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      After selecting this option, we'll guide you through the next steps and show you the relevant features.
                    </p>
                  </div>
                )}
              </div>
              
              {companyStage === stage.id && (
                <div className="ml-4">
                  <div className={`rounded-full h-6 w-6 flex items-center justify-center bg-${stage.color}-500 text-white`}>
                    <i className="fas fa-check text-sm"></i>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!companyStage || loading}
          className={`px-6 py-2 rounded-md ${
            companyStage && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};
