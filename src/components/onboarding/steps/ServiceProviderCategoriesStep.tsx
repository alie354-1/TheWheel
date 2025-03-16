import React, { useState } from 'react';

interface ServiceProviderCategoriesStepProps {
  onSelect: (categories: string[]) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

type CategoryOption = {
  id: string;
  label: string;
  description: string;
};

const ServiceProviderCategoriesStep: React.FC<ServiceProviderCategoriesStepProps> = ({
  onSelect,
  onSkip,
  onBack
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const serviceCategories: CategoryOption[] = [
    {
      id: 'legal',
      label: 'Legal Services',
      description: 'Corporate law, IP protection, contracts, etc.'
    },
    {
      id: 'financial',
      label: 'Financial Services',
      description: 'Accounting, fundraising, financial planning'
    },
    {
      id: 'marketing',
      label: 'Marketing & PR',
      description: 'Brand development, digital marketing, PR'
    },
    {
      id: 'design',
      label: 'Design',
      description: 'UI/UX design, graphic design, product design'
    },
    {
      id: 'development',
      label: 'Development',
      description: 'Software development, app development, web development'
    },
    {
      id: 'hr',
      label: 'HR & Recruiting',
      description: 'Talent acquisition, HR services, team building'
    },
    {
      id: 'consulting',
      label: 'Business Consulting',
      description: 'Strategic planning, market research, business advice'
    },
    {
      id: 'operations',
      label: 'Operations',
      description: 'Operations management, logistics, supply chain'
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      onSelect(selectedCategories);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">What services do you provide?</h2>
      <p className="text-center mb-6">Select all that apply. This helps us connect you with the right companies.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {serviceCategories.map(category => (
          <div
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              selectedCategories.includes(category.id)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
            }`}
          >
            <div className="flex items-start">
              <span className={`h-5 w-5 rounded border flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                selectedCategories.includes(category.id)
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-gray-300'
              }`}>
                {selectedCategories.includes(category.id) && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <div>
                <h3 className="font-medium">{category.label}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Back
          </button>
        )}
        
        <div className="space-x-3 ml-auto">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </button>
          )}
          
          <button
            onClick={handleContinue}
            disabled={selectedCategories.length === 0}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md transition ${
              selectedCategories.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-indigo-700'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderCategoriesStep;
