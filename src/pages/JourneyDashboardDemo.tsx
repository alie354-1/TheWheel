import React from 'react';
import { Link } from 'react-router-dom';
import DashboardOptionsNav from '../components/company/new_journey/components/DashboardOptionsNav';

/**
 * JourneyDashboardDemo page
 * 
 * This is a demo page to showcase the two different journey dashboard layouts
 * and allow easy navigation between them
 */
const JourneyDashboardDemo: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Journey Dashboard Implementation</h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Micro Frontend Architecture</h2>
          <p className="text-gray-700 mb-4">
            The journey dashboard has been implemented using a micro frontend architecture with reusable React components.
            This implementation provides two layout options that match the HTML wireframes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Option 1 (formerly Option 3)</h3>
              <p className="text-gray-600 mb-4">Combined Layout with three panels:</p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
                <li>Left sidebar with steps list</li>
                <li>Main content with active steps and recommendations</li>
                <li>Right panel with business health metrics</li>
              </ul>
              <Link 
                to="/company/new-journey/option3" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Option 1 Layout
              </Link>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Option 2 (formerly Option 4)</h3>
              <p className="text-gray-600 mb-4">Tabbed Layout with tabs for:</p>
              <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
                <li>Current Work - Active steps and domain progress</li>
                <li>Recommended Next Steps - AI-powered recommendations</li>
                <li>Business Health - Detailed domain progress metrics</li>
              </ul>
              <Link 
                to="/company/new-journey/option4" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Option 2 Layout
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Component Structure</h3>
              <p className="text-gray-700">
                The implementation follows a micro frontend architecture with modular, reusable components:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>Layout components (Option1Layout, Option2Layout)</li>
                <li>Sidebar components (StepsSidebar, JourneyStatsBar)</li>
                <li>Step components (ActiveStepCard, RecommendationCard)</li>
                <li>Domain components (DomainProgressCard)</li>
                <li>UI components (ContentPanel, TabNavigation)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Responsive Design</h3>
              <p className="text-gray-700">
                Both layouts are fully responsive, adapting to different screen sizes:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>Desktop: Full three-panel or tabbed layout</li>
                <li>Tablet: Simplified two-panel layout</li>
                <li>Mobile: Single column layout with collapsible sections</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Data Architecture</h3>
              <p className="text-gray-700">
                Both layouts use the same data hooks to ensure consistency:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>useCompanySteps - for step data management</li>
                <li>useCompanyProgress - for domain progress tracking</li>
                <li>useAIDashboard - for AI-powered recommendations</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <DashboardOptionsNav />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyDashboardDemo;
