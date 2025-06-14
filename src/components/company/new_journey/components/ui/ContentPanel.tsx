import React from 'react';

interface ContentPanelProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * ContentPanel - A consistent container for content sections
 */
const ContentPanel: React.FC<ContentPanelProps> = ({
  title,
  description,
  children,
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden mb-5 ${className}`}>
      {/* Header section with title, description, and actions */}
      {(title || description || actions) && (
        <div className="border-b border-gray-200 p-4 bg-gray-50 flex justify-between items-start">
          {/* Title and description */}
          <div>
            {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          
          {/* Action buttons/links */}
          {actions && (
            <div className="flex items-center space-x-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content section */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ContentPanel;
