import React from 'react';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming ShadCN UI path
import { Label } from '@/components/ui/label';     // Assuming ShadCN UI path

interface CompetitorFeaturesEditorProps {
  value: { [feature: string]: boolean }; // Current features for the competitor
  onChange: (newValue: { [feature: string]: boolean }) => void;
  featureList: string[]; // List of all available features from the parent block
  // It's assumed the InspectorPanel or object_array renderer will pass this from the main CompetitorTableBlock
}

const CompetitorFeaturesEditor: React.FC<CompetitorFeaturesEditorProps> = ({
  value,
  onChange,
  featureList,
}) => {
  const handleFeatureToggle = (featureName: string, checked: boolean | 'indeterminate') => {
    const newFeatures = { ...value };
    if (typeof checked === 'boolean') {
      newFeatures[featureName] = checked;
    }
    // If indeterminate, we might treat it as false or handle as a third state if needed
    // For now, only boolean changes are processed.
    onChange(newFeatures);
  };

  if (!featureList || featureList.length === 0) {
    return (
      <p className="text-xs text-gray-500 py-2">
        No features defined in the main block's 'Feature List'. Please add features there first.
      </p>
    );
  }

  return (
    <div className="space-y-2 p-2 border border-gray-200 rounded-md bg-gray-50 my-1">
      <p className="text-xs font-medium text-gray-700">Toggle Features:</p>
      {featureList.map((featureName) => (
        <div key={featureName} className="flex items-center space-x-2">
          <Checkbox
            id={`feature-${featureName}`}
            checked={!!value[featureName]}
            onCheckedChange={(checked: boolean | 'indeterminate') => handleFeatureToggle(featureName, checked)}
          />
          <Label htmlFor={`feature-${featureName}`} className="text-sm font-normal text-gray-600 cursor-pointer">
            {featureName}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default CompetitorFeaturesEditor;
