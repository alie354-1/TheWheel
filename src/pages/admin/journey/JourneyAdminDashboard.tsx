import React from "react";
import DomainStepManager from "../../../components/admin/DomainStepManager";

/**
 * JourneyAdminDashboard.tsx
 * Central admin dashboard for managing journey structure.
 * Intended to link to PhaseManager, DomainManager, ToolManager, StepTemplateManager.
 */

const JourneyAdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Journey Management Dashboard</h1>
      <p className="mb-6 text-gray-700">
        Use the tools below to manage the global journey structure including phases, domains, steps, and tools.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Manage Domain Steps</h2>
          <DomainStepManager
            domainId="example-domain-id"
            companyId="example-company-id"
            onClose={() => {}}
          />
        </div>

        {/* Placeholder cards for future managers */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Phase Manager</h2>
          <p className="text-sm text-gray-600">Coming soon...</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Domain Manager</h2>
          <p className="text-sm text-gray-600">Coming soon...</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Tool Manager</h2>
          <p className="text-sm text-gray-600">Coming soon...</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Step Template Manager</h2>
          <p className="text-sm text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default JourneyAdminDashboard;
