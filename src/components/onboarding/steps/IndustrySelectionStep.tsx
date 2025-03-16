import React from 'react';
import { IndustryCategory } from '../../../lib/services/onboarding.service';

interface IndustrySelectionStepProps {
  onSelect: (industry: IndustryCategory) => void;
  onSkip?: () => void;
}

const IndustrySelectionStep: React.FC<IndustrySelectionStepProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">What industry are you in?</h2>
      <p className="mb-6 text-gray-600">
        We'll provide resources and recommendations specific to your industry.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => onSelect(IndustryCategory.TECHNOLOGY)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Technology</div>
          <div className="text-sm text-gray-600">Software, Hardware, IT, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.HEALTHCARE)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Healthcare</div>
          <div className="text-sm text-gray-600">Health Services, Medical Devices, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.FINANCE)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Finance</div>
          <div className="text-sm text-gray-600">Banking, Insurance, FinTech, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.EDUCATION)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Education</div>
          <div className="text-sm text-gray-600">EdTech, Schools, E-learning, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.RETAIL)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Retail</div>
          <div className="text-sm text-gray-600">E-commerce, Physical Stores, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.MANUFACTURING)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Manufacturing</div>
          <div className="text-sm text-gray-600">Production, Industrial, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.ENTERTAINMENT)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Entertainment</div>
          <div className="text-sm text-gray-600">Media, Gaming, Content Creation, etc.</div>
        </button>
        
        <button 
          onClick={() => onSelect(IndustryCategory.OTHER)}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 text-left rounded-lg transition"
        >
          <div className="font-semibold">Other</div>
          <div className="text-sm text-gray-600">Not listed here</div>
        </button>
      </div>
      
      {onSkip && (
        <div className="mt-6 text-center">
          <button 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default IndustrySelectionStep;
