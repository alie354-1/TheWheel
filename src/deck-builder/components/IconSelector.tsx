import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconSelectorProps {
  value: string | undefined;
  onChange: (iconName: string | undefined) => void;
  className?: string;
}

const iconNames = Object.keys(LucideIcons).filter(
  (key) => typeof (LucideIcons as any)[key] === 'object' && (LucideIcons as any)[key].displayName // Filter for actual icon components
);

export function IconSelector({ value, onChange, className }: IconSelectorProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className={`w-full px-2 py-1 border border-gray-300 rounded text-sm ${className}`}
    >
      <option value="">None</option>
      {iconNames.map((iconName) => (
        <option key={iconName} value={iconName}>
          {iconName}
        </option>
      ))}
    </select>
  );
}
