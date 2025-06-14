import React from 'react';
import { Link } from 'react-router-dom';

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * DashboardHeader - Header component for journey dashboard pages
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = 'Journey Dashboard',
  subtitle,
  actions
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo or Brand */}
          <Link to="/journey" className="flex items-center">
            <div className="bg-indigo-600 text-white p-2 rounded-md mr-3">
              <i className="fas fa-map-signs"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-4">
          {actions}

          {/* Default actions if no custom actions provided */}
          {!actions && (
            <>
              <button className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-bell"></i>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-cog"></i>
              </button>
              <button className="text-gray-500 hover:text-gray-700 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <i className="fas fa-user text-gray-500"></i>
                </div>
                <span>Profile</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
