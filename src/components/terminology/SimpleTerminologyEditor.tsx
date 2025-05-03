import React, { useState } from 'react';
import { flattenTerminology, unflattenTerminology } from '../../lib/utils/terminology-utils';

interface SimpleTerminologyEditorProps {
  terminology: Record<string, any>;
  basePath: string;
  onSave: (key: string, value: any) => Promise<void>;
  isSaving?: boolean;
  className?: string;
}

/**
 * A simplified version of TerminologyEditor for system admin use
 */
export const SimpleTerminologyEditor: React.FC<SimpleTerminologyEditorProps> = ({
  terminology,
  basePath,
  onSave,
  isSaving = false,
  className = '',
}) => {
  const [editableTerms, setEditableTerms] = useState<Record<string, string>>(() => {
    // Flatten the terminology and convert to string values for editing
    const flatTerms = flattenTerminology(terminology);
    const stringTerms: Record<string, string> = {};
    
    Object.entries(flatTerms).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        stringTerms[key] = String(value);
      }
    });
    
    return stringTerms;
  });

  // Handle term value changes
  const handleTermChange = (key: string, value: string) => {
    setEditableTerms(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle save for a specific term
  const handleSaveTerm = async (key: string, value: string) => {
    try {
      // Convert string value back to appropriate type
      let typedValue: any = value;
      
      // Attempt to convert to number if it looks like one
      if (!isNaN(Number(value)) && value.trim() !== '') {
        typedValue = Number(value);
      } 
      // Convert to boolean if 'true' or 'false'
      else if (value.toLowerCase() === 'true') {
        typedValue = true;
      } 
      else if (value.toLowerCase() === 'false') {
        typedValue = false;
      }
      
      // Call the parent's save function with the full key path
      const fullKey = basePath ? `${basePath}.${key}` : key;
      await onSave(fullKey, typedValue);
    } catch (err) {
      console.error('Failed to save term:', err);
    }
  };

  // Group terms by category for better display
  const groupedTerms: Record<string, Record<string, string>> = {};
  
  Object.entries(editableTerms).forEach(([key, value]) => {
    const category = key.split('.')[0] || 'other';
    
    if (!groupedTerms[category]) {
      groupedTerms[category] = {};
    }
    
    groupedTerms[category][key] = value;
  });

  if (Object.keys(editableTerms).length === 0) {
    return (
      <div className={`simple-terminology-editor ${className} p-4`}>
        <p className="text-gray-500">No terminology entries found for this category.</p>
      </div>
    );
  }

  return (
    <div className={`simple-terminology-editor ${className}`}>
      <div className="overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Term</th>
              <th className="p-2 text-left">Value</th>
              <th className="p-2 text-left w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(editableTerms).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="p-2 text-sm">
                  {key}
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleTermChange(key, e.target.value)}
                    className="w-full px-2 py-1 border rounded-md"
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleSaveTerm(key, editableTerms[key])}
                    disabled={isSaving}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isSaving ? '...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
