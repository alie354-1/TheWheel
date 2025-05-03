import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { generalLLMService, resetGeneralLLMService } from '../lib/services/general-llm.service';

/**
 * Test component to demonstrate the Hugging Face LLM integration
 */
const LLMProviderTest: React.FC = () => {
  // Access feature flags
  const { featureFlags, setFeatureFlags } = useAuthStore();
  
  // Local state
  const [prompt, setPrompt] = useState('Generate a business idea for a tech startup');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState<'base' | 'company' | 'abstraction'>('base');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState(featureFlags.useHuggingFace?.enabled ? 'huggingface' : 'openai');

  // Reset state when provider changes
  useEffect(() => {
    setResponse('');
    setError(null);
  }, [provider]);

  // Generate response
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      // Update feature flags based on selected provider and model
      await updateFeatureFlags();
      
      // Generate text using the generalLLMService
      const result = await generalLLMService.query(prompt, {
        userId: 'test-user',
        companyId: 'test-company',
        useCompanyModel: modelType === 'company',
        useAbstraction: modelType === 'abstraction',
        context: modelType,
        temperature: 0.7
      });
      
      // Set the response
      setResponse(result.content);
    } catch (err) {
      console.error('Error generating text:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Update feature flags based on selected provider and model
  const updateFeatureFlags = async () => {
    const useHuggingFace = provider === 'huggingface';
    
    // Update provider flags
    setFeatureFlags({
      useHuggingFace: { enabled: useHuggingFace, visible: true },
      useHFCompanyModel: { enabled: useHuggingFace && modelType === 'company', visible: true },
      useHFAbstractionModel: { enabled: useHuggingFace && modelType === 'abstraction', visible: true }
    });
    
    // Reset the service to pick up the new provider
    resetGeneralLLMService();
  };

  // Handle provider change
  const handleProviderChange = (newProvider: 'openai' | 'huggingface') => {
    setProvider(newProvider);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">LLM Provider Test</h2>
      
      {/* Provider Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Provider</h3>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="provider"
              value="openai"
              checked={provider === 'openai'}
              onChange={() => handleProviderChange('openai')}
              className="mr-2"
            />
            OpenAI
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="provider"
              value="huggingface"
              checked={provider === 'huggingface'}
              onChange={() => handleProviderChange('huggingface')}
              className="mr-2"
            />
            Hugging Face
          </label>
        </div>
      </div>
      
      {/* Model Selection (only for Hugging Face) */}
      {provider === 'huggingface' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Model Type</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="modelType"
                value="base"
                checked={modelType === 'base'}
                onChange={() => setModelType('base')}
                className="mr-2"
              />
              Base Model
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="modelType"
                value="company"
                checked={modelType === 'company'}
                onChange={() => setModelType('company')}
                className="mr-2"
              />
              Company Model
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="modelType"
                value="abstraction"
                checked={modelType === 'abstraction'}
                onChange={() => setModelType('abstraction')}
                className="mr-2"
              />
              Abstraction Model
            </label>
          </div>
        </div>
      )}
      
      {/* Prompt Input */}
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Prompt
        </label>
        <textarea
          id="prompt"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {loading ? 'Generating...' : 'Generate Response'}
        </button>
      </div>
      
      {/* Response Output */}
      {response && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Response</h3>
          <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
            {response}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Provider: {provider}, Model: {provider === 'huggingface' ? modelType : 'gpt-4'}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Connection Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md text-sm">
        <h3 className="font-medium mb-2">Connection Information</h3>
        <p>
          <span className="font-semibold">Current Provider:</span> {provider}
        </p>
        {provider === 'huggingface' && (
          <>
            <p>
              <span className="font-semibold">Service URL:</span> {import.meta.env.VITE_LLM_SERVICE_URL || 'http://localhost:3001/api'}
            </p>
            <p>
              <span className="font-semibold">Model Type:</span> {modelType}
            </p>
            <p className="mt-2 text-xs text-blue-600">
              Make sure the LLM microservice is running at the URL above before testing.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LLMProviderTest;
