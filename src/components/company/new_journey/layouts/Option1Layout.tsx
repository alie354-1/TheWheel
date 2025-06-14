import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';

interface Option1LayoutProps {
  sidebar: ReactNode;
  mainContent: ReactNode;
  rightPanel: ReactNode;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

/**
 * Option1Layout - Three-panel layout with sidebar, main content, and right panel
 * (Formerly Option3)
 */
const Option1Layout: React.FC<Option1LayoutProps> = ({
  sidebar,
  mainContent,
  rightPanel,
  title = 'Journey Dashboard',
  subtitle,
  isLoading = false
}) => {
  return (
    <DashboardLayout isLoading={isLoading} title={title} subtitle={subtitle}>
      <div className="flex flex-1 h-full">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white flex-shrink-0 h-full overflow-y-auto">
          {sidebar}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {mainContent}
        </div>
        
        {/* Right Panel */}
        <div className="w-72 border-l border-gray-200 bg-white flex-shrink-0 h-full overflow-y-auto">
          {rightPanel}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Option1Layout;
