import React from 'react';

interface StepsSidebarProps {
  width?: string;
  children?: React.ReactNode;
}

/**
 * StepsSidebar - Container for sidebar elements with consistent styling
 */
const StepsSidebar: React.FC<StepsSidebarProps> = ({
  width = '280px',
  children
}) => {
  return (
    <div className="space-y-5">
      {children}
    </div>
  );
};

export default StepsSidebar;
