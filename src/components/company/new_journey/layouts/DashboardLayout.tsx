import React, { ReactNode } from 'react';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  isLoading?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * DashboardLayout - Primary layout for journey dashboard pages
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  isLoading = false,
  className = '',
  title,
  subtitle
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader title={title} subtitle={subtitle} />
      
      {/* Main content */}
      <div className={`flex flex-1 ${className}`}>
        {/* Sidebar (if provided) */}
        {sidebar && (
          <div className="w-64 border-r border-gray-200 bg-white flex-shrink-0 h-full overflow-y-auto">
            {sidebar}
          </div>
        )}
        
        {/* Main content area */}
        <div className={`flex-1 overflow-auto p-6 ${sidebar ? 'ml-0' : 'ml-0'}`}>
          {isLoading ? (
            <div className="py-20">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
              <p className="text-center mt-4 text-gray-500">Loading dashboard...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
