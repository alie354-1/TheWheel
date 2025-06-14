import React from 'react';
import { Eye, Contrast } from 'lucide-react'; // Using Contrast for high-contrast icon

export interface AccessibilitySettings { // Export the interface
  highContrast: boolean;
  // Future settings: largeText, etc.
}

interface AccessibilityToolbarProps {
  settings: AccessibilitySettings;
  onUpdate: (newSettings: Partial<AccessibilitySettings>) => void;
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ settings, onUpdate }) => {
  const toggleHighContrast = () => {
    onUpdate({ highContrast: !settings.highContrast });
  };

  return (
    <div className="accessibility-toolbar">
      <button
        onClick={toggleHighContrast}
        title={settings.highContrast ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode'}
        aria-pressed={settings.highContrast}
        className="preview-control-button" // Reuse styles from preview.css
      >
        <Contrast className="h-4 w-4" />
        <span className="sr-only">
          {settings.highContrast ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode'}
        </span>
      </button>
      {/* Add more accessibility toggles here in the future */}
    </div>
  );
};

export default AccessibilityToolbar;
