import React from 'react';

const availableFonts = [
  'Inter, system-ui, sans-serif',
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
];

interface FontSelectionProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
}

export const FontSelection: React.FC<FontSelectionProps> = ({ selectedFont, onFontChange }) => {
  return (
    <div>
      <label htmlFor="font-select" className="block text-sm font-medium text-gray-700 mb-2">
        Font Family
      </label>
      <select
        id="font-select"
        value={selectedFont}
        onChange={(e) => onFontChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableFonts.map(font => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font.split(',')[0]}
          </option>
        ))}
      </select>
    </div>
  );
};
