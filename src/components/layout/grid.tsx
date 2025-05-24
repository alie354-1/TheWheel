/**
 * Grid Component
 * 
 * A CSS Grid-based layout component for creating responsive grid layouts.
 */

import React from 'react';

export interface GridProps {
  /** The content to render inside the grid */
  children: React.ReactNode;
  /** The number of columns on mobile screens */
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** The number of columns on small screens (sm) */
  smCols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** The number of columns on medium screens (md) */
  mdCols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** The number of columns on large screens (lg) */
  lgCols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** The gap between grid items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  gap = 'md',
  className = '',
}) => {
  // Column classes
  const getColumnsClasses = () => {
    const colClasses = [];
    
    // Base columns (mobile)
    colClasses.push(`grid-cols-${cols}`);
    
    // Small screens and up
    if (smCols) colClasses.push(`sm:grid-cols-${smCols}`);
    
    // Medium screens and up
    if (mdCols) colClasses.push(`md:grid-cols-${mdCols}`);
    
    // Large screens and up
    if (lgCols) colClasses.push(`lg:grid-cols-${lgCols}`);
    
    return colClasses.join(' ');
  };

  // Gap classes
  const getGapClass = () => {
    if (gap === 'none') return '';
    
    const gapMap = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };
    
    return gapMap[gap] || '';
  };

  // Combine classes
  const gridClasses = [
    'grid',
    getColumnsClasses(),
    getGapClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};