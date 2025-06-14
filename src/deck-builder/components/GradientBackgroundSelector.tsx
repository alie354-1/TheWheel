import React from 'react';

interface GradientBackgroundSelectorProps {
  onSelect: (background: string) => void;
}

const gradients = [
  { name: 'Twilight', value: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' },
  { name: 'Sunset', value: 'linear-gradient(to right, #ff7e5f, #feb47b)' },
  { name: 'Ocean', value: 'linear-gradient(to right, #2193b0, #6dd5ed)' },
  { name: 'Forest', value: 'linear-gradient(to right, #134e5e, #71b280)' },
  { name: 'Grapefruit', value: 'linear-gradient(to right, #ff9966, #ff5e62)' },
  { name: 'Mint', value: 'linear-gradient(to right, #91eac9, #29abe2)' },
  { name: 'Cherry', value: 'linear-gradient(to right, #eb3349, #f45c43)' },
  { name: 'Amethyst', value: 'linear-gradient(to right, #9d50bb, #6e48aa)' },
];

export const GradientBackgroundSelector: React.FC<GradientBackgroundSelectorProps> = ({ onSelect }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Gradient Presets
      </label>
      <select
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a gradient</option>
        {gradients.map((gradient) => (
          <option key={gradient.name} value={gradient.value}>
            {gradient.name}
          </option>
        ))}
      </select>
    </div>
  );
};
