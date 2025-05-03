import React, { useState, useEffect } from 'react';
import { Bot, Save, AlertCircle, Check, RotateCw, Trash2, Info } from 'lucide-react';
import axios from 'axios';
import { appSettingsService } from '../../lib/services/app-settings.service';
import { featureFlagsService } from '../../lib/services/feature-flags.service';

interface ModelConfig {
  model_id: string;
}

interface HuggingFaceSettings {
  api_key: string;
  spaces: {
    base: ModelConfig;
    company: ModelConfig;
    abstraction: ModelConfig;
  };
  default_tier: 'base' | 'company' | 'abstraction';
  enabled: boolean;
}

// Example models to suggest to users
const EXAMPLE_MODELS = {
  base: 'mistralai/Mistral-7B-Instruct-v0.2',
  company: 'meta-llama/Llama-2-13b-chat-hf',
  abstraction: 'google/flan-t5-xxl'
};

export default function HuggingFaceSettings() {
  const [settings, setSettings] = useState<HuggingFaceSettings>({
    api_key: '',
    spaces: {
      base: { model_id: '' },
      company: { model_id: '' },
      abstraction: { model_id: '' }
    },
    default_tier: 'base',
    enabled: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const huggingfaceSettings = await appSettingsService.getGlobalSettings('huggingface');
      
      if (huggingfaceSettings) {
        // Handle backward compatibility with old format that had URL properties
        const compatSettings = {
          ...huggingfaceSettings,
          spaces: {
            base: { model_id: huggingfaceSettings.spaces?.base?.model_id || '' },
            company: { model_id: huggingfaceSettings.spaces?.company?.model_id || '' },
            abstraction: { model_id: huggingfaceSettings.spaces?.abstraction?.model_id || '' },
          }
        };
        setSettings(compatSettings);
      }
    } catch (error) {
      console.error('Error loading Hugging Face settings:', error);
      setError('Failed to load settings. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!settings.api_key) {
        throw new Error('API key is required');
      }
      
      // Get the model ID to test with
      const modelType = settings.default_tier;
      const modelId = settings.spaces[modelType]?.model_id || EXAMPLE_MODELS[modelType];
      
      if (!modelId) {
        throw new Error(`Model ID for ${modelType} tier is required`);
      }

      // Make a simple test query to the Hugging Face API
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`,
        { 
          inputs: 'Test query from the application. Please respond with "Success" if you receive this.',
          parameters: { max_new_tokens: 10 }
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setSuccess('Hugging Face connection successful! Model is working properly.');
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error testing Hugging Face connection:', error);
      
      // Provide helpful error messages based on error type
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed: Your Hugging Face API key is invalid or expired.');
        } else if (error.response.status === 404) {
          setError(`Model not found: The model ID "${settings.spaces[settings.default_tier]?.model_id}" doesn't exist or isn't accessible with your API key.`);
        } else {
          setError(`API error (${error.response.status}): ${error.response.data?.error || error.message}`);
        }
      } else if (error.request) {
        setError('Network error: Could not connect to Hugging Face API. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to test Hugging Face connection');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const validateApiKey = (key: string): boolean => {
    return typeof key === 'string' && key.trim().startsWith('hf_') && key.length > 5;
  };

  const handleApiKeyChange = (newKey: string) => {
    setSettings({
      ...settings,
      api_key: newKey
    });
    
    // Clear previous errors when user is typing
    if (error && error.includes('API key')) {
      setError('');
    }
  };

  const handleSave = async () => {
    const apiKey = settings.api_key.trim();
    
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    if (!validateApiKey(apiKey)) {
      setError('Invalid API key format. Hugging Face API keys should start with "hf_"');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update the api_key with trimmed version
      const settingsToSave = {
        ...settings,
        api_key: apiKey
      };
      // For any tier without a model ID, set a default one
      const updatedSettings = {
        ...settings,
        spaces: {
          base: { 
            model_id: settings.spaces.base.model_id || EXAMPLE_MODELS.base 
          },
          company: { 
            model_id: settings.spaces.company.model_id || EXAMPLE_MODELS.company 
          },
          abstraction: { 
            model_id: settings.spaces.abstraction.model_id || EXAMPLE_MODELS.abstraction 
          }
        }
      };

      // Save settings using the global app settings service
      const result = await appSettingsService.updateGlobalSettings('huggingface', updatedSettings);
      
      if (!result) {
        throw new Error('Failed to update settings');
      }
      
      // Update feature flags to enable/disable Hugging Face
      await featureFlagsService.saveFeatureFlags({
        useHuggingFace: {
          enabled: settings.enabled,
          visible: true
        }
      });
      
      // Reset the LLM service to pick up the new settings
      featureFlagsService.resetLLMService();
      
      setSettings(updatedSettings);
      setSuccess('Hugging Face settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving Hugging Face settings:', error);
      setError(error.message || 'Failed to save Hugging Face settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the API key? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      // Update with empty API key
      const updatedSettings = {
        ...settings,
        api_key: '',
        enabled: false
      };

      // Update the settings in the database
      const result = await appSettingsService.updateGlobalSettings('huggingface', updatedSettings);
      
      if (!result) {
        throw new Error('Failed to update settings');
      }
      
      // Update feature flags to disable Hugging Face
      await featureFlagsService.saveFeatureFlags({
        useHuggingFace: {
          enabled: false,
          visible: true
        }
      });
      
      // Reset the LLM service to pick up the new settings
      featureFlagsService.resetLLMService();

      setSettings(updatedSettings);
      setSuccess('API key deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      setError(error.message || 'Failed to delete API key');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          Hugging Face Settings
        </h3>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Configure Hugging Face as an alternative to OpenAI for all AI features.
              This requires a Hugging Face API key and model IDs for the models you want to use.
            </p>
          </div>
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

      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
            Enable Hugging Face (Use Hugging Face instead of OpenAI)
          </label>
        </div>

        <div>
          <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="password"
              id="api_key"
              value={settings.api_key}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="flex-1 min-w-0 block rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="hf_..."
            />
            {settings.api_key && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Get your API key from{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-900"
            >
              Hugging Face Settings
            </a>
          </p>
        </div>

        <div>
          <label htmlFor="default_tier" className="block text-sm font-medium text-gray-700">
            Default Tier
          </label>
          <select
            id="default_tier"
            value={settings.default_tier}
            onChange={(e) => setSettings({ 
              ...settings, 
              default_tier: e.target.value as 'base' | 'company' | 'abstraction'
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="base">Base Model</option>
            <option value="company">Company Model</option>
            <option value="abstraction">Abstraction Model</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Select which model tier to use by default
          </p>
        </div>

        {/* Base Model Configuration */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Base Model Configuration</h4>
          <div>
            <label htmlFor="base_model_id" className="block text-sm font-medium text-gray-700">
              Model ID
            </label>
            <input
              type="text"
              id="base_model_id"
              value={settings.spaces.base.model_id}
              onChange={(e) => setSettings({
                ...settings,
                spaces: {
                  ...settings.spaces,
                  base: {
                    ...settings.spaces.base,
                    model_id: e.target.value
                  }
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={EXAMPLE_MODELS.base}
            />
            <p className="mt-2 text-sm text-gray-500">
              Model ID for general queries (e.g., {EXAMPLE_MODELS.base})
            </p>
          </div>
        </div>

        {/* Company Model Configuration */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Company Model Configuration</h4>
          <div>
            <label htmlFor="company_model_id" className="block text-sm font-medium text-gray-700">
              Model ID
            </label>
            <input
              type="text"
              id="company_model_id"
              value={settings.spaces.company.model_id}
              onChange={(e) => setSettings({
                ...settings,
                spaces: {
                  ...settings.spaces,
                  company: {
                    ...settings.spaces.company,
                    model_id: e.target.value
                  }
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={EXAMPLE_MODELS.company}
            />
            <p className="mt-2 text-sm text-gray-500">
              Model ID for company-specific queries (e.g., {EXAMPLE_MODELS.company})
            </p>
          </div>
        </div>

        {/* Abstraction Model Configuration */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Abstraction Model Configuration</h4>
          <div>
            <label htmlFor="abstraction_model_id" className="block text-sm font-medium text-gray-700">
              Model ID
            </label>
            <input
              type="text"
              id="abstraction_model_id"
              value={settings.spaces.abstraction.model_id}
              onChange={(e) => setSettings({
                ...settings,
                spaces: {
                  ...settings.spaces,
                  abstraction: {
                    ...settings.spaces.abstraction,
                    model_id: e.target.value
                  }
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={EXAMPLE_MODELS.abstraction}
            />
            <p className="mt-2 text-sm text-gray-500">
              Model ID for abstraction-level queries (e.g., {EXAMPLE_MODELS.abstraction})
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={testConnection}
            disabled={isTesting || !settings.api_key}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
