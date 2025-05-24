import React, { useState } from 'react';
import UserManagement from '../components/admin/UserManagement';
import FeatureFlagsSettings from '../components/admin/FeatureFlagsSettings';
import OpenAISettings from '../components/admin/OpenAISettings';
import AppCredentialsSettings from '../components/admin/AppCredentialsSettings';
import ModelManagementPanel from '../components/admin/ModelManagementPanel';
import TerminologyManagement from '../components/admin/TerminologyManagement';
import DomainList from '../components/admin/DomainList';
import BulkDomainStepMapper from '../components/admin/BulkDomainStepMapper';
import { useAuthStore } from '../lib/store';

import StepToDomainAIMapping from '../components/admin/StepToDomainAIMapping';

const TABS = [
  { key: "users", label: "User Management" },
  { key: "domains", label: "Domain & Step Mapping" },
  { key: "stepToDomainAI", label: "Step-to-Domain AI Mapping" },
  { key: "flags", label: "Feature Flags" },
  { key: "terminology", label: "Terminology" },
  { key: "models", label: "Model Management" },
  { key: "openai", label: "OpenAI Settings" },
  { key: "credentials", label: "App Credentials" },
];

const AdminPanel: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState("users");
  const [showBulkMapper, setShowBulkMapper] = useState(false);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'Platform Admin' || 
                 profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'Platform Admin';
  // Check if user has super admin privileges
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'Platform Admin' || 
                      profile?.role === 'superadmin' || profile?.role === 'Platform Admin';

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="mb-6 border-b">
        <nav className="flex gap-4">
          {TABS.map(tab => {
            if (tab.key === "credentials" && !isSuperAdmin) return null;
            return (
              <button
                key={tab.key}
                className={`px-4 py-2 border-b-2 ${activeTab === tab.key ? "border-blue-600 text-blue-700 font-semibold" : "border-transparent text-gray-600"}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div>
        {activeTab === "users" && <UserManagement />}
        {activeTab === "domains" && (
          <div>
            <div className="flex gap-2 mb-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => setShowBulkMapper(true)}
              >
                Bulk Domain-Step Mapping
              </button>
            </div>
            <DomainList />
            {showBulkMapper && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <BulkDomainStepMapper onClose={() => setShowBulkMapper(false)} />
              </div>
            )}
          </div>
        )}
        {activeTab === "stepToDomainAI" && <StepToDomainAIMapping />}
        {activeTab === "flags" && <FeatureFlagsSettings />}
        {activeTab === "terminology" && <TerminologyManagement />}
        {activeTab === "models" && <ModelManagementPanel />}
        {activeTab === "openai" && <OpenAISettings />}
        {activeTab === "credentials" && isSuperAdmin && <AppCredentialsSettings />}
      </div>
    </div>
  );
};

export default AdminPanel;
