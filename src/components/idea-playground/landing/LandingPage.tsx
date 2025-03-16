import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Lightbulb, BarChart3, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../lib/store';

interface PathwayCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  linkTo: string;
}

const PathwayCard: React.FC<PathwayCardProps> = ({ icon: Icon, title, description, onClick, linkTo }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="ml-4 text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-end">
        <a href={linkTo} className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          Get Started <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const handlePathwaySelect = (pathway: string) => {
    // Store the selected pathway in localStorage for persistence
    localStorage.setItem('idea_playground_pathway', pathway);
    
    // Navigate to the specific pathway route
    if (pathway === 'specific_idea') {
      console.log('Navigating to pathway 1');
      setTimeout(() => {
        window.location.href = '/idea-hub/playground/pathway/1/capture';
      }, 100);
    } else if (pathway === 'industry_exploration') {
      console.log('Navigating to pathway 2');
      setTimeout(() => {
        window.location.href = '/idea-hub/playground/pathway/2/industry';
      }, 100);
    } else if (pathway === 'existing_ideas') {
      console.log('Navigating to pathway 3');
      setTimeout(() => {
        window.location.href = '/idea-hub/playground/pathway/3/library';
      }, 100);
    }
    
    console.log('Selected pathway:', pathway);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome to the Idea Playground
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose a pathway to start developing your next breakthrough idea
          </p>
        </div>
        
        {/* Pathways */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-12">
          <PathwayCard
            icon={Lightbulb}
            title="Start with a Specific Idea"
            description="Already have an idea in mind? Start here to develop and refine your concept step by step."
            onClick={() => handlePathwaySelect('specific_idea')}
            linkTo="/idea-hub/playground/pathway/1/capture"
          />
          
          <PathwayCard
            icon={BarChart3}
            title="Explore Industry Opportunities"
            description="Discover promising ideas based on industry trends and market opportunities."
            onClick={() => handlePathwaySelect('industry_exploration')}
            linkTo="/idea-hub/playground/pathway/2/industry"
          />
          
          <PathwayCard
            icon={Library}
            title="Browse & Refine Existing Ideas"
            description="Continue working on your existing ideas or refine them further."
            onClick={() => handlePathwaySelect('existing_ideas')}
            linkTo="/idea-hub/playground/pathway/3/library"
          />
        </div>
        
        {/* Quick Stats */}
        {user && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Idea Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-500">Ideas in Progress</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-500">Completed Ideas</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-500">Last Activity</p>
                <p className="text-2xl font-semibold">-</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
