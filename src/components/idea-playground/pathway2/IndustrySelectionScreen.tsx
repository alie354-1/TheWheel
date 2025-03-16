import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { useAuthStore } from '../../../lib/store';

// Predefined list of industries with icons and descriptions
const INDUSTRIES = [
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    description: 'Software, hardware, AI, IoT, and digital platforms',
    examples: 'AI apps, SaaS solutions, smart devices, productivity tools, blockchain applications'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    description: 'Medical services, wellness, telehealth, and biotech',
    examples: 'Telemedicine platforms, wellness apps, medical devices, health monitoring systems'
  },
  {
    id: 'education',
    name: 'Education',
    icon: '🎓',
    description: 'E-learning, training, edtech, and knowledge platforms',
    examples: 'Online courses, learning management systems, educational games, tutoring platforms'
  },
  {
    id: 'fintech',
    name: 'Financial Technology',
    icon: '💰',
    description: 'Banking, payments, investing, and financial services',
    examples: 'Payment solutions, investment platforms, financial planning tools, banking apps'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: '🛒',
    description: 'Online retail, marketplaces, and consumer products',
    examples: 'Niche marketplaces, subscription boxes, direct-to-consumer brands, shopping tools'
  },
  {
    id: 'sustainability',
    name: 'Sustainability',
    icon: '🌱',
    description: 'Clean energy, sustainability, and environmental solutions',
    examples: 'Carbon tracking apps, sustainable products, recycling solutions, clean energy services'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    description: 'Media, gaming, content creation, and experiences',
    examples: 'Content platforms, gaming services, creator tools, streaming innovations'
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    icon: '🍽️',
    description: 'Food delivery, restaurant tech, and culinary innovations',
    examples: 'Meal planning services, ghost kitchens, food delivery platforms, restaurant tech'
  },
  {
    id: 'custom',
    name: 'Custom Industry',
    icon: '✨',
    description: 'Enter your own industry of interest',
    examples: 'Any specific market sector, niche, or industry combination'
  }
];

interface IndustrySelectionScreenProps {
  onCreateIdea: (idea: { title: string; description: string }) => Promise<any>;
}

/**
 * Industry Selection Screen for Pathway 2
 * Allows users to explore industry-specific opportunities and generate multiple ideas
 */
const IndustrySelectionScreen: React.FC<IndustrySelectionScreenProps> = ({ onCreateIdea }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isLoading: aiIsLoading } = useAIContext();

  // If custom is selected, show the custom input
  useEffect(() => {
    if (selectedIndustry === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
  }, [selectedIndustry]);

  // Handle submitting the selected industry
  const handleSubmit = async () => {
    // Validate the selection
    if (!selectedIndustry) {
      setValidationError('Please select an industry');
      return;
    }
    
    if (selectedIndustry === 'custom' && !customIndustry.trim()) {
      setValidationError('Please enter your custom industry');
      return;
    }
    
    // Reset validation error
    setValidationError(null);
    setIsSubmitting(true);
    
    try {
      // Get the industry name for the description
      const industryName = selectedIndustry === 'custom' 
        ? customIndustry 
        : INDUSTRIES.find(i => i.id === selectedIndustry)?.name || '';
      
      // Create an initial idea based on the industry
      const newIdea = await onCreateIdea({
        title: industryName,
        description: `Industry exploration: ${industryName}`
      });
      
      // Navigate to the idea comparison screen with the generated ideas
      navigate('/idea-hub/playground/pathway/2/idea-comparison');
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore Industry Opportunities</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select an industry to explore business opportunities and receive AI-generated business ideas tailored to this market.
        </p>
      </div>
      
      {validationError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {validationError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {INDUSTRIES.map((industry) => (
          <div
            key={industry.id}
            className={`bg-white rounded-lg shadow-md p-5 cursor-pointer border-2 transition-all ${
              selectedIndustry === industry.id
                ? 'border-indigo-500 shadow-lg'
                : 'border-transparent hover:border-indigo-200'
            }`}
            onClick={() => setSelectedIndustry(industry.id)}
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{industry.icon}</span>
              <h3 className="text-lg font-medium text-gray-900">{industry.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{industry.description}</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Examples:</span> {industry.examples}
            </p>
          </div>
        ))}
      </div>
      
      {showCustom && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <label htmlFor="custom-industry" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Industry
          </label>
          <input
            id="custom-industry"
            type="text"
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your industry of interest"
          />
          <p className="mt-2 text-xs text-gray-500">
            Be specific to get the most relevant idea suggestions. For example, "sustainable fashion" is better than just "fashion".
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/idea-hub/playground')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back to Pathways
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || aiIsLoading}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
            isSubmitting || aiIsLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Generating Ideas...' : 'Generate Ideas'}
        </button>
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">How This Works</h3>
        <p className="text-sm text-blue-700">
          After selecting an industry, our AI will generate multiple business ideas tailored to that sector. 
          You'll be able to compare these ideas and select the most promising one to refine further.
        </p>
      </div>
    </div>
  );
};

export default IndustrySelectionScreen;
