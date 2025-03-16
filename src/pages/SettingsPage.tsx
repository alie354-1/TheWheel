import React, { useState } from 'react';
import { Cog, Users, Link, Flag } from 'lucide-react';
import OpenAISettings from '../components/admin/OpenAISettings';
import AppCredentialsSettings from '../components/admin/AppCredentialsSettings';
import FeatureFlagsSettings from '../components/admin/FeatureFlagsSettings';
import UserManagement from '../components/admin/UserManagement';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Cog className="h-6 w-6" />
          System Settings
        </h1>

        <div className="mt-6">
          <div className="bg-white shadow rounded-lg">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`${
                    activeTab === 'integrations'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Integrations
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`${
                    activeTab === 'features'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Features
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'users' && (
                <UserManagement />
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <OpenAISettings />
                  <AppCredentialsSettings />
                </div>
              )}

              {activeTab === 'features' && (
                <FeatureFlagsSettings />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
