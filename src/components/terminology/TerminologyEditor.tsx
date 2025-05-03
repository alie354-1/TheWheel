import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/hooks';
import { useTerminology } from './TerminologyProvider';
import { TerminologyService } from '../../lib/services/terminology.service';
import { 
  TerminologyEntityType, 
  TerminologyOverrideBehavior,
  TerminologyValue
} from '../../lib/types/terminology.types';
import { flattenTerminology, unflattenTerminology } from '../../lib/utils/terminology-utils';
import { predefinedTerminologySets } from '../../lib/utils/terminology-utils';

interface TerminologyEditorProps {
  entityType: TerminologyEntityType;
  entityId: string;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * TerminologyEditor component for customizing terminology
 * 
 * Allows users to modify terminology for a specific entity context
 */
export const TerminologyEditor: React.FC<TerminologyEditorProps> = ({
  entityType,
  entityId,
  onSave,
  onCancel,
  className = '',
}) => {
  const { terminology, refreshTerminology } = useTerminology();
  const { user } = useAuth();
  
  const [editableTerms, setEditableTerms] = useState<Record<string, string>>({});
  const [overrideBehaviors, setOverrideBehaviors] = useState<Record<string, TerminologyOverrideBehavior>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('journeyTerms');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Prepare categories from the terminology structure
  const categories = Object.keys(terminology).filter(key => 
    typeof terminology[key] === 'object' && 
    !Array.isArray(terminology[key]) &&
    key !== 'behaviors'
  );

  // Extract the category-specific terms from the full terminology
  const getCategoryTerms = (category: string) => {
    if (!terminology[category] || typeof terminology[category] !== 'object') {
      return {};
    }
    
    return flattenTerminology(terminology[category] as Record<string, any>, category);
  };

  // Initialize editable terms when terminology or selected category changes
  useEffect(() => {
    if (terminology && Object.keys(terminology).length > 0) {
      const flatTerms = getCategoryTerms(selectedCategory);
      
      // Convert all values to strings for editing
      const stringTerms: Record<string, string> = {};
      Object.entries(flatTerms).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          stringTerms[key] = String(value);
        }
      });
      
      setEditableTerms(stringTerms);
    }
  }, [terminology, selectedCategory]);

  // Handle template selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    
    if (templateName && predefinedTerminologySets[templateName]) {
      const template = predefinedTerminologySets[templateName];
      const flatTemplate = flattenTerminology(template);
      
      // Update only terms from the selected category
      const updatedTerms = { ...editableTerms };
      
      Object.entries(flatTemplate).forEach(([key, value]) => {
        if (key.startsWith(selectedCategory) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
          updatedTerms[key] = String(value);
        }
      });
      
      setEditableTerms(updatedTerms);
      
      // Set all override behaviors to 'replace'
      const newBehaviors: Record<string, TerminologyOverrideBehavior> = {};
      Object.keys(updatedTerms).forEach(key => {
        newBehaviors[key] = 'replace';
      });
      setOverrideBehaviors(newBehaviors);
    }
  };

  // Handle term value changes
  const handleTermChange = (key: string, value: string) => {
    setEditableTerms(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle override behavior changes
  const handleBehaviorChange = (key: string, behavior: TerminologyOverrideBehavior) => {
    setOverrideBehaviors(prev => ({
      ...prev,
      [key]: behavior
    }));
  };

  // Save terminology changes
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Convert string values back to appropriate types
      const typedTerms: Record<string, TerminologyValue> = {};
      Object.entries(editableTerms).forEach(([key, value]) => {
        // Attempt to convert to number if it looks like one
        if (!isNaN(Number(value)) && value.trim() !== '') {
          typedTerms[key] = Number(value);
        } 
        // Convert to boolean if 'true' or 'false'
        else if (value.toLowerCase() === 'true') {
          typedTerms[key] = true;
        } 
        else if (value.toLowerCase() === 'false') {
          typedTerms[key] = false;
        } 
        // Otherwise keep as string
        else {
          typedTerms[key] = value;
        }
      });
      
      // Group by category to rebuild the nested structure
      const categorizedTerms: Record<string, Record<string, TerminologyValue>> = {};
      Object.entries(typedTerms).forEach(([key, value]) => {
        // Extract category from the key (format: category.path.to.term)
        const category = key.split('.')[0];
        if (!categorizedTerms[category]) {
          categorizedTerms[category] = {};
        }
        
        // Remove the category prefix
        const termKey = key.substring(category.length + 1);
        categorizedTerms[category][termKey] = value;
      });
      
      // Unflatten each category
      const updatedTerminology: Record<string, any> = {};
      Object.entries(categorizedTerms).forEach(([category, terms]) => {
        updatedTerminology[category] = unflattenTerminology(terms);
      });
      
      // For each term, create a database record with the appropriate override behavior
      const records = Object.entries(typedTerms).map(([key, value]) => ({
        key,
        value,
        override_behavior: overrideBehaviors[key] || 'replace' as TerminologyOverrideBehavior
      }));

      let tableName: string;
      let idColumn: string;

      switch (entityType) {
        case 'partner':
          tableName = 'partner_terminology';
          idColumn = 'partner_id';
          break;
        case 'organization':
          tableName = 'organization_terminology';
          idColumn = 'organization_id';
          break;
        case 'company':
          tableName = 'company_terminology';
          idColumn = 'company_id';
          break;
        case 'team':
          tableName = 'team_terminology';
          idColumn = 'team_id';
          break;
        case 'user':
          tableName = 'user_terminology_preferences';
          idColumn = 'user_id';
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      // Save only terms from the selected category
      const categoryRecords = records.filter(record => record.key.startsWith(selectedCategory));
      
      // Delete existing terminology for this category
      await TerminologyService.deleteTerminologyForCategory(entityType, entityId, selectedCategory);
      
      // Insert new terminology
      if (categoryRecords.length > 0) {
        await TerminologyService.saveTerminology(entityType, entityId, categoryRecords);
      }
      
      // Refresh terminology context
      await refreshTerminology();
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Failed to save terminology:', err);
      setError('Failed to save terminology. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`terminology-editor ${className}`}>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customize Terminology</h2>
        
        <div className="flex space-x-4">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Select a template...</option>
            {Object.keys(predefinedTerminologySets).map(template => (
              <option key={template} value={template}>
                {template.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="overflow-y-auto max-h-[60vh]">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Term Name</th>
              <th className="p-2 text-left">Value</th>
              <th className="p-2 text-left">Override Behavior</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(editableTerms).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="p-2">
                  {key.split('.').slice(1).join('.')}
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
                  <select
                    value={overrideBehaviors[key] || 'replace'}
                    onChange={(e) => handleBehaviorChange(key, e.target.value as TerminologyOverrideBehavior)}
                    className="px-2 py-1 border rounded-md"
                  >
                    <option value="replace">Replace</option>
                    <option value="merge">Merge</option>
                    <option value="suggest">Suggest</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-end space-x-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isSaving}
          >
            Cancel
          </button>
        )}
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
