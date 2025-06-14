import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TabNavigation - Component for switching between tabbed content sections
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  size = 'md'
}) => {
  // Size-based styles
  const sizeStyles = {
    sm: {
      padding: 'py-2 px-2',
      text: 'text-xs',
      spacing: 'space-x-4'
    },
    md: {
      padding: 'py-3 px-1',
      text: 'text-sm',
      spacing: 'space-x-6'
    },
    lg: {
      padding: 'py-4 px-2',
      text: 'text-base',
      spacing: 'space-x-8'
    }
  };

  const { padding, text, spacing } = sizeStyles[size];

  return (
    <div className={`border-b border-gray-200 mb-6 ${className}`}>
      <nav className={`-mb-px flex ${spacing}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap ${padding} border-b-2 font-medium ${text} focus:outline-none flex items-center ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon && <i className={`${tab.icon} mr-2`}></i>}
            
            <span>{tab.label}</span>
            
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
