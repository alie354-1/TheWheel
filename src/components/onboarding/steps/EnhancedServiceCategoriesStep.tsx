import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/store';

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface EnhancedServiceCategoriesStepProps {
  onNext: (data: { serviceCategories: string[]; expertise: string[] }) => void;
  onBack: () => void;
  initialCategories?: string[];
  initialExpertise?: string[];
}

export const EnhancedServiceCategoriesStep: React.FC<EnhancedServiceCategoriesStepProps> = ({
  onNext,
  onBack,
  initialCategories = [],
  initialExpertise = []
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [expertise, setExpertise] = useState<string[]>(initialExpertise);
  const [currentExpertise, setCurrentExpertise] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const userId = useAuthStore(state => state.user?.id);

  const serviceCategories: ServiceCategory[] = [
    {
      id: 'legal',
      title: 'Legal Services',
      description: 'Legal advice, document drafting, and compliance',
      icon: 'gavel'
    },
    {
      id: 'financial',
      title: 'Financial Services',
      description: 'Accounting, bookkeeping, and financial planning',
      icon: 'chart-line'
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Brand strategy, digital marketing, and content creation',
      icon: 'bullhorn'
    },
    {
      id: 'design',
      title: 'Design',
      description: 'UI/UX design, graphic design, and visual identity',
      icon: 'palette'
    },
    {
      id: 'tech',
      title: 'Technology',
      description: 'Software development, IT consulting, and technical support',
      icon: 'laptop-code'
    },
    {
      id: 'hr',
      title: 'HR & Recruiting',
      description: 'Talent acquisition, HR management, and employee development',
      icon: 'users'
    },
    {
      id: 'consulting',
      title: 'Business Consulting',
      description: 'Strategic consulting, business planning, and advisory services',
      icon: 'briefcase'
    },
    {
      id: 'other',
      title: 'Other Services',
      description: 'Additional professional services not listed above',
      icon: 'ellipsis-h'
    }
  ];

  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleAddExpertise = () => {
    if (currentExpertise.trim() && !expertise.includes(currentExpertise.trim())) {
      setExpertise([...expertise, currentExpertise.trim()]);
      setCurrentExpertise('');
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter(exp => exp !== item));
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0 || !userId) return;
    
    try {
      setLoading(true);
      
      // Send to parent component to handle navigation
      onNext({
        serviceCategories: selectedCategories,
        expertise
      });
    } catch (error) {
      console.error('Error saving service categories:', error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">What services do you provide?</h2>
      <p className="text-gray-600 mb-8">
        Select the categories of services you offer to businesses. This helps us connect you with relevant opportunities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {serviceCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleToggleCategory(category.id)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCategories.includes(category.id)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:shadow'
            }`}
          >
            <div className="flex items-center">
              <div className={`rounded-full p-3 mr-3 ${
                selectedCategories.includes(category.id) ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}>
                <i className={`fas fa-${category.icon} text-lg`}></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
              {selectedCategories.includes(category.id) && (
                <div className="ml-auto">
                  <i className="fas fa-check text-blue-500"></i>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Specific Areas of Expertise</h3>
        <p className="text-gray-600 mb-4">
          Add specific skills, technologies, or areas of expertise to help businesses find you for their specific needs.
        </p>

        <div className="flex mb-4">
          <input
            type="text"
            value={currentExpertise}
            onChange={(e) => setCurrentExpertise(e.target.value)}
            className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
            placeholder="E.g., Startup Law, React Development, Brand Strategy"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddExpertise();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddExpertise}
            disabled={!currentExpertise.trim()}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {expertise.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {expertise.map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveExpertise(item)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
          disabled={selectedCategories.length === 0 || loading}
          className={`px-6 py-2 rounded-md ${
            selectedCategories.length > 0
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
