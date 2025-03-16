import React from 'react';
import UserManagement from '../components/admin/UserManagement';
import FeatureFlagsSettings from '../components/admin/FeatureFlagsSettings';
import OpenAISettings from '../components/admin/OpenAISettings';
import AppCredentialsSettings from '../components/admin/AppCredentialsSettings';
import ModelManagementPanel from '../components/admin/ModelManagementPanel';
import { useAuthStore } from '../lib/store';

const AdminPanel: React.FC = () => {
  const { isAdmin, isSuperAdmin } = useAuthStore();
  
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
      
      <div className="space-y-8">
        {/* User Management */}
        <UserManagement />
        
        {/* Feature Flags */}
        <FeatureFlagsSettings />
        
        {/* Hierarchical LLM System */}
        <ModelManagementPanel />
        
        {/* OpenAI Settings */}
        <OpenAISettings />
        
        {/* App Credentials */}
        {isSuperAdmin && <AppCredentialsSettings />}
      </div>
    </div>
  );
};

export default AdminPanel;
