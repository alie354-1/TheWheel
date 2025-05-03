import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';

/**
 * Component for toggling LLM provider settings
 * Allows users to switch between OpenAI and Hugging Face, and configure
 * which specialized models to use within Hugging Face
 */
const LLMProviderSettings: React.FC = () => {
  const { featureFlags, setFeatureFlags } = useAuthStore();
  
  // Local state for the toggle switches
  const [useHuggingFace, setUseHuggingFace] = useState(featureFlags.useHuggingFace?.enabled || false);
  const [useCompanyModel, setUseCompanyModel] = useState(featureFlags.useHFCompanyModel?.enabled || false);
  const [useAbstractionModel, setUseAbstractionModel] = useState(featureFlags.useHFAbstractionModel?.enabled || false);
  
  // Sync feature flags with local state
  useEffect(() => {
    setUseHuggingFace(featureFlags.useHuggingFace?.enabled || false);
    setUseCompanyModel(featureFlags.useHFCompanyModel?.enabled || false);
    setUseAbstractionModel(featureFlags.useHFAbstractionModel?.enabled || false);
  }, [featureFlags]);
  
  // Handle toggle changes
  const handleHuggingFaceToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setUseHuggingFace(isEnabled);
    setFeatureFlags({
      useHuggingFace: { enabled: isEnabled, visible: true }
    });
    
    // If turning off Hugging Face, also turn off sub-features
    if (!isEnabled) {
      setUseCompanyModel(false);
      setUseAbstractionModel(false);
      setFeatureFlags({
        useHFCompanyModel: { enabled: false, visible: true },
        useHFAbstractionModel: { enabled: false, visible: true }
      });
    }
    
    // Reset the LLM service instance to apply the change
    try {
      const { resetGeneralLLMService } = require('../../lib/services/general-llm.service');
      resetGeneralLLMService();
      console.log('LLM service reset with new provider:', isEnabled ? 'Hugging Face' : 'OpenAI');
    } catch (error) {
      console.error('Error resetting LLM service:', error);
    }
  };
  
  const handleCompanyModelToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setUseCompanyModel(isEnabled);
    setFeatureFlags({
      useHFCompanyModel: { enabled: isEnabled, visible: true }
    });
  };
  
  const handleAbstractionModelToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setUseAbstractionModel(isEnabled);
    setFeatureFlags({
      useHFAbstractionModel: { enabled: isEnabled, visible: true }
    });
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">LLM Provider Settings</h2>
      
      <div className="space-y-4">
        {/* Hugging Face Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Use Hugging Face</h3>
            <p className="text-sm text-gray-500">
              Switch from OpenAI to the Hugging Face LLM microservice
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={useHuggingFace}
              onChange={handleHuggingFaceToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {/* Company Model Toggle - Only shown if Hugging Face is enabled */}
        {useHuggingFace && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-blue-200">
            <div>
              <h3 className="font-medium">Use Company-Specific Model</h3>
              <p className="text-sm text-gray-500">
                Use the model fine-tuned with company data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useCompanyModel}
                onChange={handleCompanyModelToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}
        
        {/* Abstraction Model Toggle - Only shown if Hugging Face is enabled */}
        {useHuggingFace && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-blue-200">
            <div>
              <h3 className="font-medium">Use Abstraction Model</h3>
              <p className="text-sm text-gray-500">
                Use the model trained on business patterns and abstractions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useAbstractionModel}
                onChange={handleAbstractionModelToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}
      </div>
      
      {/* Server Status Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-medium mb-2">LLM Microservice Status</h3>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${useHuggingFace ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <p className="text-sm">
            {useHuggingFace 
              ? 'Using Hugging Face LLM microservice'
              : 'Using OpenAI (Hugging Face microservice inactive)'}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {useHuggingFace 
            ? 'Connected to Hugging Face LLM microservice at: ' + (import.meta.env.VITE_LLM_SERVICE_URL || 'http://localhost:3001/api')
            : 'Enable Hugging Face to use the LLM microservice'}
        </p>
      </div>
      
      {/* Info and Help */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
        <p className="font-medium">About LLM Providers</p>
        <p className="mt-1">
          The Hugging Face LLM microservice provides a custom AI service that includes specialized models for company-specific contexts and business pattern abstraction.
        </p>
        <p className="mt-1">
          Make sure the LLM microservice is running before enabling Hugging Face.
        </p>
      </div>
    </div>
  );
};

export default LLMProviderSettings;
