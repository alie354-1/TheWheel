import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import { X, Palette, Type, Image, Download, Upload, RotateCcw } from 'lucide-react';
import { FontSelection } from './FontSelection.tsx';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  background?: string;
  textColor: string;
  textColorOnPrimary?: string; // Color of text on primaryColor backgrounds
  textColorOnSecondary?: string; // Color of text on secondaryColor backgrounds
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  slideSize?: 'standard' | 'wide' | 'square';
  logo?: string;
  backgroundPattern?: string;
  slideTransition?: 'none' | 'fade' | 'slide' | 'zoom';
}

interface ThemeCustomizationPanelProps {
  deck: any; // Consider using a more specific Deck type if available
  initialSettings?: Partial<ThemeSettings>; // Make initialSettings optional
  onThemeChange: (theme: Partial<ThemeSettings>) => void;
  onClose: () => void;
}

export function ThemeCustomizationPanel({ deck, initialSettings, onThemeChange, onClose }: ThemeCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'branding' | 'effects'>('colors');
  
  // Initialize theme state with initialSettings or defaults
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const defaults: ThemeSettings = {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      textColorOnPrimary: '#ffffff', // Default: white text on primary color
      textColorOnSecondary: '#1f2937', // Default: dark text on secondary color
      fontFamily: 'Inter',
      fontSize: 'medium',
      slideTransition: 'fade'
    };
    return { ...defaults, ...initialSettings };
  });

  // Effect to update internal theme if initialSettings prop changes from parent
  useEffect(() => {
    if (initialSettings) {
      // Merge deeply to avoid overwriting entire objects if only partial updates are passed
      setTheme(prevTheme => ({ 
        ...prevTheme, 
        ...initialSettings,
        // Ensure nested objects like 'colors' are also merged if present in initialSettings
        // This example assumes ThemeSettings is flat for simplicity here, adjust if nested.
      }));
    }
  }, [initialSettings]);

  const predefinedThemes = [
    {
      name: 'Corporate Blue',
      colors: {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#06b6d4',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        textColorOnPrimary: '#ffffff',
        textColorOnSecondary: '#1f2937',
      }
    },
    {
      name: 'Modern Green',
      colors: {
        primaryColor: '#047857',
        secondaryColor: '#10b981',
        accentColor: '#34d399',
        backgroundColor: '#f9fafb',
        textColor: '#111827',
        textColorOnPrimary: '#ffffff',
        textColorOnSecondary: '#065f46',
      }
    },
    {
      name: 'Creative Purple',
      colors: {
        primaryColor: '#7c3aed',
        secondaryColor: '#a855f7',
        accentColor: '#c084fc',
        backgroundColor: '#faf5ff',
        textColor: '#581c87',
        textColorOnPrimary: '#ffffff',
        textColorOnSecondary: '#ffffff',
      }
    },
    {
      name: 'Professional Gray',
      colors: {
        primaryColor: '#374151',
        secondaryColor: '#6b7280',
        accentColor: '#9ca3af',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        textColorOnPrimary: '#ffffff',
        textColorOnSecondary: '#ffffff',
      }
    },
    {
      name: 'Energetic Orange',
      colors: {
        primaryColor: '#ea580c',
        secondaryColor: '#f97316',
        accentColor: '#fb923c',
        backgroundColor: '#fffbeb',
        textColor: '#9a3412',
        textColorOnPrimary: '#ffffff',
        textColorOnSecondary: '#ffffff',
      }
    },
    {
      name: 'Dark Mode',
      colors: {
        primaryColor: '#60a5fa', // Light blue for primary actions
        secondaryColor: '#3b82f6', // Slightly darker blue for secondary
        accentColor: '#93c5fd', // Lighter accent
        backgroundColor: '#1f2937', // Dark gray background
        textColor: '#e5e7eb', // Light gray text
        textColorOnPrimary: '#0f172a', // Dark text on light blue primary
        textColorOnSecondary: '#ffffff', // White text on darker blue secondary
      }
    }
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Merriweather', value: 'Merriweather' }
  ];

  const handleThemeUpdate = (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const applyPredefinedTheme = (predefinedTheme: any) => {
    // Pass only the color part of the predefined theme
    handleThemeUpdate(predefinedTheme.colors);
  };

  const resetToDefault = () => {
    const defaultTheme: ThemeSettings = { // Ensure type consistency
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      textColorOnPrimary: '#ffffff',
      textColorOnSecondary: '#1f2937',
      fontFamily: 'Inter',
      fontSize: 'medium' as const,
      slideTransition: 'fade' as const
    };
    setTheme(defaultTheme);
    onThemeChange(defaultTheme);
  };

  const tabs = [
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'branding', name: 'Branding', icon: Image },
    { id: 'effects', name: 'Effects', icon: Download }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Theme Customization</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetToDefault}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Reset to Default"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Predefined Themes */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Themes</h4>
              <div className="grid grid-cols-2 gap-2">
                {predefinedThemes.map((predefinedTheme) => (
                  <button
                    key={predefinedTheme.name}
                    onClick={() => applyPredefinedTheme(predefinedTheme)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 text-left"
                  >
                    <div className="flex space-x-1 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: predefinedTheme.colors.primaryColor }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: predefinedTheme.colors.secondaryColor }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: predefinedTheme.colors.accentColor }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-900">{predefinedTheme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Colors</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => handleThemeUpdate({ primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={theme.primaryColor}
                      onChange={(e) => handleThemeUpdate({ primaryColor: e.target.value })}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => handleThemeUpdate({ secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={theme.secondaryColor}
                      onChange={(e) => handleThemeUpdate({ secondaryColor: e.target.value })}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => handleThemeUpdate({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => handleThemeUpdate({ accentColor: e.target.value })}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => handleThemeUpdate({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={theme.backgroundColor}
                      onChange={(e) => handleThemeUpdate({ backgroundColor: e.target.value })}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6">
            <FontSelection
              selectedFont={theme.fontFamily}
              onFontChange={(font) => handleThemeUpdate({ fontFamily: font })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <div className="flex space-x-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleThemeUpdate({ fontSize: size })}
                    className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                      theme.fontSize === size
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => handleThemeUpdate({ textColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) => handleThemeUpdate({ textColor: e.target.value })}
                  className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Font Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
              <div 
                style={{ 
                  fontFamily: theme.fontFamily,
                  color: theme.textColor,
                  fontSize: theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px'
                }}
              >
                <h3 className="text-xl font-bold mb-2">Sample Heading</h3>
                <p className="mb-2">This is how your text will look with the selected typography settings.</p>
                <p className="text-sm">Font: {theme.fontFamily} • Size: {theme.fontSize}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload your logo</p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG up to 2MB</p>
                <button className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Choose File
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['top-left', 'top-center', 'top-right'].map((position) => (
                  <button
                    key={position}
                    className="p-2 border border-gray-300 rounded text-xs hover:border-blue-300 hover:bg-blue-50"
                  >
                    {position.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Pattern
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button className="aspect-square border border-gray-300 rounded bg-white hover:border-blue-300">
                  <span className="text-xs">None</span>
                </button>
                <button className="aspect-square border border-gray-300 rounded bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-300" />
                <button className="aspect-square border border-gray-300 rounded bg-gradient-to-r from-gray-50 to-gray-100 hover:border-blue-300" />
                <button className="aspect-square border border-gray-300 rounded bg-gradient-to-br from-purple-50 to-pink-50 hover:border-blue-300" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slide Transition
              </label>
              <select
                value={theme.slideTransition}
                onChange={(e) => handleThemeUpdate({ slideTransition: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Speed
              </label>
              <div className="flex space-x-2">
                {['slow', 'normal', 'fast'].map((speed) => (
                  <button
                    key={speed}
                    className="px-3 py-2 rounded-md text-sm font-medium capitalize bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shadow Effects
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Drop shadows on cards</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Hover effects</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Subtle animations</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => {
            onThemeChange(theme);
            onClose();
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Apply Theme
        </button>
      </div>
    </div>
  );
}
