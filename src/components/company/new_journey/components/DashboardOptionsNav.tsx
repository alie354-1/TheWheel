import React from 'react';
import { NavLink } from 'react-router-dom';

interface DashboardOption {
  id: string;
  name: string;
  description: string;
  path: string;
  thumbnailUrl?: string; // Optional: for image previews
}

const options: DashboardOption[] = [
  {
    id: 'option3',
    name: 'Focused Layout',
    description: 'A three-column view with detailed context and side panels.',
    path: '/company/new-journey/option3',
    thumbnailUrl: '/screenshots/dashboard_option3_thumbnail.png', // Placeholder path
  },
  {
    id: 'option4',
    name: 'Tabbed Layout',
    description: 'A tab-based interface to switch between different views.',
    path: '/company/new-journey/option4',
    thumbnailUrl: '/screenshots/dashboard_option4_thumbnail.png', // Placeholder path
  },
];

interface DashboardOptionsNavProps {
  currentPath: string;
}

const DashboardOptionsNav: React.FC<DashboardOptionsNavProps> = ({ currentPath }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-1">Dashboard Layout Options</h2>
      <p className="text-sm text-gray-500 mb-4">
        Choose the dashboard layout that best fits your workflow.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <NavLink
            key={option.id}
            to={option.path}
            className={({ isActive }) =>
              `block p-4 rounded-lg border-2 transition-all duration-200 ease-in-out ${
                isActive || currentPath.includes(option.id)
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
              }`
            }
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-24 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                {/* Thumbnail placeholder */}
                <i className="fas fa-image text-gray-400"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default DashboardOptionsNav;
