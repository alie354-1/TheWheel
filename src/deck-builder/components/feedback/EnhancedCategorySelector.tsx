import React from 'react';
import { FeedbackCategory } from '../../types';
import { MessageCircle, Brush, Sliders } from 'lucide-react';

interface EnhancedCategorySelectorProps {
  selectedCategory: FeedbackCategory;
  onSelectCategory: (category: FeedbackCategory) => void;
}

const categoryConfig = {
  Content: { icon: MessageCircle, color: 'text-blue-500', label: 'Content', description: 'Feedback on the slide’s message, story, and data.' },
  Form: { icon: Brush, color: 'text-green-500', label: 'Form/Style', description: 'Feedback on the slide’s design, layout, and visuals.' },
  General: { icon: Sliders, color: 'text-gray-500', label: 'General', description: 'General feedback or comments that apply to the whole deck.' },
};

export const EnhancedCategorySelector: React.FC<EnhancedCategorySelectorProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
      {Object.entries(categoryConfig).map(([key, { icon: Icon, color, label, description }]) => (
        <button
          key={key}
          onClick={() => onSelectCategory(key as FeedbackCategory)}
          className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedCategory === key
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:bg-gray-200'
          }`}
          title={description}
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};
