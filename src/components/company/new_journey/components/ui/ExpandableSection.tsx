import React from 'react';

interface ExpandableSectionProps {
  expanded: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * ExpandableSection - A reusable component for collapsible content
 */
const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  expanded,
  children,
  className = ''
}) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default ExpandableSection;
