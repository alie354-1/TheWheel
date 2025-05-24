import React, { useState, ReactNode } from 'react';

type TabProps = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export const Tab: React.FC<TabProps> = ({ value, label, disabled }) => {
  return null; // Rendering handled by parent Tabs component
};

type TabsProps = {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'bordered' | 'lifted' | 'boxed';
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({
  children,
  value,
  onChange,
  variant = 'default',
  className = '',
}) => {
  // Extract tab props from children
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Tab
  ) as React.ReactElement<TabProps>[];

  // Get classNames based on variant
  const getTabsClassNames = () => {
    let baseClass = 'tabs';
    
    switch (variant) {
      case 'bordered':
        baseClass += ' tabs-bordered border-b border-base-300';
        break;
      case 'lifted':
        baseClass += ' tabs-lifted';
        break;
      case 'boxed':
        baseClass += ' tabs-boxed';
        break;
      default:
        break;
    }
    
    return `${baseClass} ${className}`;
  };
  
  // Get classNames for individual tab
  const getTabClassNames = (tabValue: string) => {
    let baseClass = 'tab tab-bordered gap-2 px-4 py-2 transition-all duration-200 ease-in-out';
    
    if (value === tabValue) {
      baseClass += ' tab-active text-primary border-primary font-medium';
    } else {
      baseClass += ' text-base-content hover:text-primary hover:border-base-300';
    }
    
    return baseClass;
  };

  return (
    <div role="tablist" className={getTabsClassNames()}>
      {tabs.map((tab) => {
        const { value: tabValue, label, disabled } = tab.props;
        
        return (
          <button
            key={tabValue}
            role="tab"
            className={getTabClassNames(tabValue)}
            onClick={() => !disabled && onChange(tabValue)}
            aria-selected={value === tabValue}
            disabled={disabled}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};