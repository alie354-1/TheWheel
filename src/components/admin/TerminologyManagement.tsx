import React, { useState, useEffect } from 'react';
import {
  SimpleTerminologyEditor,
  DynamicText,
  TitleDynamicText
} from '../terminology';
import { TerminologyService } from '../../lib/services/terminology.service';
import { supabase } from '../../lib/supabase';
import {
  DefaultTerminologyEntry,
  CompleteTerminology
} from '../../lib/types/terminology.types';

/**
 * System-level terminology management component for the admin panel
 */
const TerminologyManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [terminology, setTerminology] = useState<CompleteTerminology>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('journeyTerms');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Categories of terminology entries
  const categories = [
    { id: 'journeyTerms', label: 'Journey Terminology' },
    { id: 'toolTerms', label: 'Tools Terminology' },
    { id: 'systemTerms', label: 'System Terminology' },
  ];

  // Load default terminology on component mount
  useEffect(() => {
    loadTerminology();
  }, []);

  const loadTerminology = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const defaults = await TerminologyService.getDefaultTerminology();
      setTerminology(defaults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load terminology'));
      console.error('Error loading terminology:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Create a record to save to the terminology_defaults table
      const records = [{
        key,
        value
      }];
      
      // Save using the service method
      // Note: We're using 'system' as a dummy entity type since we're updating
      // the system default terminology
      await supabase
        .from('terminology_defaults')
        .upsert(records, { onConflict: 'key' });
      
      // Clear the cache to ensure fresh data on next load
      TerminologyService.clearCache();
      
      // Update the local state to reflect the change
      const newTerminology = { ...terminology };
      
      // Parse the key path and update the nested property
      const keyParts = key.split('.');
      let current: any = newTerminology;
      
      // Navigate to the right level
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value at the final level
      current[keyParts[keyParts.length - 1]] = value;
      
      setTerminology(newTerminology);
      setSaveSuccess(true);
      
      // After 3 seconds, hide the success message
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save terminology'));
      console.error('Error saving terminology:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentCategoryTerms = () => {
    return terminology[selectedCategory as keyof CompleteTerminology] || {};
  };

  const getCategoryDescription = (categoryId: string) => {
    switch (categoryId) {
      case 'journeyTerms':
        return 'Customize terminology related to the startup journey, phases, steps, and progress.';
      case 'toolTerms':
        return 'Modify terms used for tools, evaluations, and related functionality.';
      case 'systemTerms':
        return 'Change general application terminology, labels, and actions.';
      default:
        return 'Manage system-wide terminology settings.';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Terminology Management</h2>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
        </div>
        <button
          onClick={loadTerminology}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Terminology Management</h2>
          <p className="text-gray-600">
            Customize system-wide terminology and white-labeling settings
          </p>
        </div>
        <button
          onClick={loadTerminology}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Refresh
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>Terminology updated successfully!</p>
        </div>
      )}

      {/* Category selection tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          {categories.map((category) => (
            <li className="mr-2" key={category.id}>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                }`}
              >
                {category.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Category description */}
      <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-100">
        <p className="text-blue-800">{getCategoryDescription(selectedCategory)}</p>
      </div>

      {/* Terminology editor */}
      <div className="bg-gray-50 p-4 rounded">
        <SimpleTerminologyEditor
          terminology={getCurrentCategoryTerms()}
          basePath={selectedCategory}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

      {/* Preview section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="bg-white p-4 rounded border">
          <h4 className="text-md font-medium mb-2">Sample Text:</h4>
          <div className="space-y-2 text-gray-800">
            <p>
              Each <DynamicText keyPath="journeyTerms.mainUnit.singular" /> consists of multiple{' '}
              <DynamicText keyPath="journeyTerms.phaseUnit.plural" />, which in turn contain various{' '}
              <DynamicText keyPath="journeyTerms.stepUnit.plural" />.
            </p>
            <p>
              <TitleDynamicText keyPath="systemTerms.application.name" fallback="The Wheel" />{' '}
              helps you manage your <DynamicText keyPath="toolTerms.mainUnit.plural" fallback="tools" />{' '}
              efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminologyManagement;
