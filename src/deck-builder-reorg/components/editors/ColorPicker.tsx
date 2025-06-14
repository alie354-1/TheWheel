import React from 'react';
import { Editor } from '@tiptap/react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  editor?: Editor;
}

const PRESET_COLORS = [
  '#000000', '#444444', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#FFFFFF',
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, editor }) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
  const [recentColors, setRecentColors] = React.useState<string[]>(() => {
    const savedColors = localStorage.getItem('recentColors');
    return savedColors ? JSON.parse(savedColors) : [];
  });

  const addRecentColor = (color: string) => {
    const updatedColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 10);
    setRecentColors(updatedColors);
    localStorage.setItem('recentColors', JSON.stringify(updatedColors));
  };

  const currentColor = editor ? editor.getAttributes('textStyle').color : (value || '#000000');

  const handleColorChange = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
    onChange(color);
    addRecentColor(color);
    setIsColorPickerOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
        className="p-2 rounded hover:bg-gray-200 flex items-center space-x-2"
        title="Text Color"
      >
        <Palette size={16} />
        <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: currentColor }}></div>
      </button>
      {isColorPickerOpen && (
        <div className="absolute z-10 top-full mt-2 p-2 bg-white border border-gray-200 rounded-md shadow-lg min-w-[280px]">
          {recentColors.length > 0 && (
            <div className="mb-2">
              <h3 className="text-xs text-gray-500 mb-2">Recent</h3>
              <div className="grid grid-cols-5 gap-2">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-10 h-10 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <hr className="my-2" />
            </div>
          )}
          <div className="grid grid-cols-8 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-8 h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2">
            <input
              type="color"
              onInput={(event) => {
                const color = (event.target as HTMLInputElement).value;
                handleColorChange(color);
              }}
              value={currentColor}
              className="w-full h-8 p-1 border-none rounded cursor-pointer"
            />
          </div>
          <button
            onClick={() => {
              if (editor) {
                editor.chain().focus().unsetColor().run();
              }
              onChange('');
              setIsColorPickerOpen(false);
            }}
            className="w-full mt-2 p-2 text-xs text-center text-gray-700 hover:bg-gray-100 rounded"
          >
            Clear Color
          </button>
        </div>
      )}
    </div>
  );
};
