import React, { useState } from 'react';
import { Palette, Brush, Zap, Image as ImageIcon } from 'lucide-react';

interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

interface SlideBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: { from: string; to: string; direction: string };
  image?: string;
}

interface ColorThemePanelProps {
  themes: ColorTheme[];
  currentTheme: ColorTheme;
  onThemeChange: (themeId: string) => void;
  onBackgroundChange: (background: SlideBackground) => void;
  currentBackground?: SlideBackground;
}

export function ColorThemePanel({
  themes,
  currentTheme,
  onThemeChange,
  onBackgroundChange,
  currentBackground
}: ColorThemePanelProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'background'>('themes');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Colors & Themes
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('themes')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'themes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Color Themes
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'background'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Background
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'themes' && (
          <ThemesTab
            themes={themes}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        )}

        {activeTab === 'background' && (
          <BackgroundTab
            currentBackground={currentBackground}
            onBackgroundChange={onBackgroundChange}
            currentTheme={currentTheme}
          />
        )}
      </div>
    </div>
  );
}

interface ThemesTabProps {
  themes: ColorTheme[];
  currentTheme: ColorTheme;
  onThemeChange: (themeId: string) => void;
}

function ThemesTab({ themes, currentTheme, onThemeChange }: ThemesTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Choose a Theme</h3>
        <div className="space-y-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                currentTheme.id === theme.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{theme.name}</h4>
                {currentTheme.id === theme.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              {/* Color palette preview */}
              <div className="flex space-x-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                />
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: theme.background }}
                  title="Background"
                />
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: theme.text }}
                  title="Text"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom theme colors */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Customize Colors</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Primary</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentTheme.primary}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  readOnly
                />
                <span className="text-xs text-gray-600">{currentTheme.primary}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Secondary</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentTheme.secondary}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  readOnly
                />
                <span className="text-xs text-gray-600">{currentTheme.secondary}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Accent</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentTheme.accent}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  readOnly
                />
                <span className="text-xs text-gray-600">{currentTheme.accent}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Text</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentTheme.text}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  readOnly
                />
                <span className="text-xs text-gray-600">{currentTheme.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BackgroundTabProps {
  currentBackground?: SlideBackground;
  onBackgroundChange: (background: SlideBackground) => void;
  currentTheme: ColorTheme;
}

function BackgroundTab({ currentBackground, onBackgroundChange, currentTheme }: BackgroundTabProps) {
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient' | 'image'>(
    currentBackground?.type || 'solid'
  );
  const [solidColor, setSolidColor] = useState(
    currentBackground?.color || currentTheme.background
  );
  const [gradientFrom, setGradientFrom] = useState(
    currentBackground?.gradient?.from || currentTheme.primary
  );
  const [gradientTo, setGradientTo] = useState(
    currentBackground?.gradient?.to || currentTheme.accent
  );
  const [gradientDirection, setGradientDirection] = useState(
    currentBackground?.gradient?.direction || 'to bottom right'
  );

  const handleBackgroundTypeChange = (type: 'solid' | 'gradient' | 'image') => {
    setBackgroundType(type);
    
    switch (type) {
      case 'solid':
        onBackgroundChange({ type: 'solid', color: solidColor });
        break;
      case 'gradient':
        onBackgroundChange({
          type: 'gradient',
          gradient: { from: gradientFrom, to: gradientTo, direction: gradientDirection }
        });
        break;
      case 'image':
        onBackgroundChange({ type: 'image', image: '' });
        break;
    }
  };

  const handleSolidColorChange = (color: string) => {
    setSolidColor(color);
    onBackgroundChange({ type: 'solid', color });
  };

  const handleGradientChange = () => {
    onBackgroundChange({
      type: 'gradient',
      gradient: { from: gradientFrom, to: gradientTo, direction: gradientDirection }
    });
  };

  return (
    <div className="space-y-4">
      {/* Background Type Selector */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Background Type</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleBackgroundTypeChange('solid')}
            className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 ${
              backgroundType === 'solid'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Brush className="h-5 w-5" />
            <span className="text-xs">Solid</span>
          </button>
          <button
            onClick={() => handleBackgroundTypeChange('gradient')}
            className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 ${
              backgroundType === 'gradient'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs">Gradient</span>
          </button>
          <button
            onClick={() => handleBackgroundTypeChange('image')}
            className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 ${
              backgroundType === 'image'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs">Image</span>
          </button>
        </div>
      </div>

      {/* Background Options */}
      {backgroundType === 'solid' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Solid Color</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={solidColor}
                onChange={(e) => handleSolidColorChange(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <div>
                <div className="text-sm font-medium">{solidColor}</div>
                <div className="text-xs text-gray-500">Click to change color</div>
              </div>
            </div>
            
            {/* Preset colors */}
            <div>
              <div className="text-xs text-gray-500 mb-2">Quick Colors</div>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1',
                  currentTheme.background, currentTheme.primary,
                  currentTheme.secondary, currentTheme.accent,
                  '#1f2937', '#374151'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSolidColorChange(color)}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {backgroundType === 'gradient' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Gradient</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="color"
                  value={gradientFrom}
                  onChange={(e) => {
                    setGradientFrom(e.target.value);
                    handleGradientChange();
                  }}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="color"
                  value={gradientTo}
                  onChange={(e) => {
                    setGradientTo(e.target.value);
                    handleGradientChange();
                  }}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Direction</label>
              <select
                value={gradientDirection}
                onChange={(e) => {
                  setGradientDirection(e.target.value);
                  handleGradientChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="to bottom">Top to Bottom</option>
                <option value="to right">Left to Right</option>
                <option value="to bottom right">Top Left to Bottom Right</option>
                <option value="to bottom left">Top Right to Bottom Left</option>
                <option value="45deg">45 Degrees</option>
                <option value="135deg">135 Degrees</option>
              </select>
            </div>

            {/* Gradient preview */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div
                className="h-16 w-full"
                style={{
                  background: `linear-gradient(${gradientDirection}, ${gradientFrom}, ${gradientTo})`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {backgroundType === 'image' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Background Image</h3>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload background image</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="background-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      onBackgroundChange({
                        type: 'image',
                        image: e.target?.result as string
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                htmlFor="background-upload"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded cursor-pointer hover:bg-blue-700"
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
