import React from 'react';

interface SidebarHeaderProps {
  title: string;
  description?: string;
}

/**
 * SidebarHeader - Title and description for sidebar sections
 */
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  description
}) => {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-medium text-gray-900 mb-1">{title}</h2>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default SidebarHeader;
