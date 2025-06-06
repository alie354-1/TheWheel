/**
 * Enhanced Feature Flags Settings Component
 * 
 * An improved version of the feature flags admin UI that uses the new consolidated
 * feature flags service and provides better organization and functionality.
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCw, AlertCircle, Check, Layers, Eye, EyeOff, RefreshCw, User, Building } from 'lucide-react';
import { useFeatureFlags } from '../../lib/hooks/useFeatureFlags';
import { FeatureFlagCategory, FeatureFlagDefinition, FeatureFlagGroup } from '../../lib/services/feature-flags';
import { featureFlagsService } from '../../lib/services/feature-flags';

const EnhancedFeatureFlagsSettings: React.FC = () => {
  const { 
    flags, 
    initialized,
    getGroupedDefinitions, 
    updateFeatureFlag,
    resetToDefaults,
    clearOverrides
  } = useFeatureFlags();
  
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [groups, setGroups] = useState<FeatureFlagGroup[]>([]);
  
  // Load all feature flag groups on component mount
  useEffect(() => {
    if (initialized) {
      const flagGroups = featureFlagsService.getGroupedDefinitions();
      setGroups(flagGroups);

      // Set default active tab
      if (flagGroups.length > 0 && !activeTab) {
        setActiveTab(flagGroups[0].name);
      }
    }
  }, [initialized, activeTab]);
  
  // No-op: Save button is removed, saving is instant on toggle
  const handleSave = async () => {};
  
  /**
   * Handle toggling a feature flag (instant save)
   */
  const toggleFlag = async (key: string, type: 'enabled' | 'visible') => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const currentFlag = flags[key];
      if (currentFlag) {
        await updateFeatureFlag(key, { [type]: !currentFlag[type] });
        setSuccess('Saved');
        setTimeout(() => setSuccess(''), 1000);
      }
    } catch (error: any) {
      console.error(`Error updating feature flag ${key}:`, error);
      setError(`Error updating ${key}: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle resetting all feature flags to defaults
   */
  const handleReset = async () => {
    if (window.confirm('Reset all feature flags to default values? This cannot be undone.')) {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      try {
        await resetToDefaults();
        setSuccess('Feature flags reset to defaults!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        console.error('Error resetting feature flags:', error);
        setError(error.message || JSON.stringify(error));
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  /**
   * Handle clearing all overrides
   */
  const handleClearOverrides = () => {
    if (window.confirm('Clear all user and company overrides? This will revert to global settings.')) {
      clearOverrides();
      setSuccess('Overrides cleared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };
  
  if (!initialized) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RotateCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading feature flags...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Feature Management
        </h3>
        
        <div className="flex space-x-3">
          <button
            onClick={handleClearOverrides}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            title="Clear all user and company overrides"
          >
            <User className="h-4 w-4 mr-1" />
            <Building className="h-4 w-4 mr-1" />
            Clear Overrides
          </button>
          
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            title="Reset all flags to defaults"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset to Defaults
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 rounded-md">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => setActiveTab(group.name)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === group.name
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {group.category === FeatureFlagCategory.NAVIGATION ? (
                <Settings className="h-4 w-4 mr-2" />
              ) : (
                <Layers className="h-4 w-4 mr-2" />
              )}
              {group.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Tab Content */}
      {groups.map((group) => (
        <div
          key={group.name}
          className={activeTab === group.name ? 'block' : 'hidden'}
        >
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900">{group.name}</h4>
            <p className="text-sm text-gray-500">{group.description}</p>
          </div>

          <div className="space-y-4">
            {group.features.map((feature) => {
              const isVisible = flags[feature.key]?.visible;
              return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    style={{
                      opacity: isVisible ? 1 : 0.5,
                      cursor: isVisible ? "pointer" : "not-allowed",
                      position: "relative",
                    }}
                    title={
                      isVisible
                        ? "Click to toggle visibility"
                        : "Coming soon"
                    }
                  >
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{feature.name}</h5>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                    {flags[feature.key]?.override && (
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Override
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Visibility toggle */}
                    <button
                      onClick={() => {
                        // Only allow toggling visibility if enabled
                        if (flags[feature.key]?.enabled) {
                          toggleFlag(feature.key, 'visible');
                        }
                      }}
                      className="p-1 rounded-full hover:bg-gray-200"
                      title={flags[feature.key]?.enabled ? (isVisible ? 'Hide from navigation' : 'Show in navigation') : 'Enable the feature to toggle visibility'}
                      disabled={!flags[feature.key]?.enabled}
                    >
                      {flags[feature.key]?.enabled
                        ? (isVisible ? (
                            <Eye className="h-5 w-5 text-gray-600" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ))
                        : (
                            <EyeOff className="h-5 w-5 text-gray-300" />
                          )
                      }
                    </button>
                    {/* Enabled/disabled toggle */}
                    <button
                      onClick={() => toggleFlag(feature.key, 'enabled')}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        flags[feature.key]?.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                      title={flags[feature.key]?.enabled ? 'Turn off feature' : 'Turn on feature'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          flags[feature.key]?.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* No Save button needed, saving is instant */}
      <div className="mt-6 flex justify-end">
        {isLoading && (
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </span>
        )}
        {success && !isLoading && (
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600">
            <Check className="h-4 w-4 mr-2" />
            {success}
          </span>
        )}
      </div>
    </div>
  );
};

export default EnhancedFeatureFlagsSettings;
