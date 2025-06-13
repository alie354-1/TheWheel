import React from 'react';
import { FeedbackCategory } from '../../types';

interface CategoryFilterTabsProps {
  selectedCategory: FeedbackCategory | 'All';
  onSelectCategory: (category: FeedbackCategory | 'All') => void;
  commentCounts: Record<FeedbackCategory | 'All', number>;
}

const categories: (FeedbackCategory | 'All')[] = ['All', 'Content', 'Form', 'General'];

export const CategoryFilterTabs: React.FC<CategoryFilterTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  commentCounts,
}) => {
  return (
    <div className="flex items-center border-b border-gray-200">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {category}
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
            {commentCounts[category] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
};
