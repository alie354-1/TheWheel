import React, { useState } from "react";
import { VisualComponent, VisualComponentLayout } from "../types/index.ts"; // Added .ts
import { BlockType } from "../types/blocks.ts"; // Added .ts

interface ComponentEditingBarProps {
  component: VisualComponent;
  onUpdateLayout: (layout: Partial<VisualComponentLayout>) => void;
  onUpdateStyle: (style: Partial<React.CSSProperties>) => void;
  onUpdateData: (data: any) => void;
}

export const ComponentEditingBar: React.FC<ComponentEditingBarProps> = ({
  component,
  onUpdateLayout,
  onUpdateStyle,
  onUpdateData,
}) => {
  const [showBorderOptions, setShowBorderOptions] = useState(false);
  const [showEffectOptions, setShowEffectOptions] = useState(false);
  const [showArrangeOptions, setShowArrangeOptions] = useState(false);
  
  // Size handlers
  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      onUpdateLayout({ [dimension]: numValue });
    }
  };

  // Z-index handlers
  const handleZIndexChange = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    const currentZ = component.layout.zIndex || 0;
    let newZ = currentZ;
    
    switch (direction) {
      case 'front':
        newZ = 999;
        break;
      case 'back':
        newZ = 0;
        break;
      case 'forward':
        newZ = currentZ + 1;
        break;
      case 'backward':
        newZ = Math.max(0, currentZ - 1);
        break;
    }
    
    onUpdateLayout({ zIndex: newZ });
  };

  // Arrangement handlers
  const handleAlign = (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (!component) return;
    let layout: Partial<VisualComponentLayout> = {};
    // Assuming canvas dimensions for alignment calculations (e.g., 960x540)
    // These might need to be dynamic if the canvas size changes
    const canvasWidth = component.layout.baseWidth || 960; // Fallback to 960
    const canvasHeight = component.layout.baseHeight || 540; // Fallback to 540

    if (type === "left") layout.x = 0;
    if (type === "center") layout.x = canvasWidth / 2 - (component.layout.width / 2);
    if (type === "right") layout.x = canvasWidth - component.layout.width;
    if (type === "top") layout.y = 0;
    if (type === "middle") layout.y = canvasHeight / 2 - (component.layout.height / 2);
    if (type === "bottom") layout.y = canvasHeight - component.layout.height;
    console.log(`[ComponentEditingBar] Aligning ${type}:`, { currentLayout: component.layout, newLayoutCalc: layout });
    onUpdateLayout(layout);
  };

  // Style handlers
  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = { fontSize: e.target.value };
    console.log('[ComponentEditingBar] Updating font size:', newStyle);
    onUpdateStyle(newStyle);
  };
  const handleFontColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { color: e.target.value };
    console.log('[ComponentEditingBar] Updating font color:', newStyle);
    onUpdateStyle(newStyle);
  };
  const handleBgColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { backgroundColor: e.target.value };
    console.log('[ComponentEditingBar] Updating background color:', newStyle);
    onUpdateStyle(newStyle);
  };
  const handleTextAlign = (align: "left" | "center" | "right" | "justify") => {
    const newStyle = { textAlign: align };
    console.log('[ComponentEditingBar] Updating text align:', newStyle);
    onUpdateStyle(newStyle);
  };

  // Border handlers
  const handleBorderWidth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = { borderWidth: e.target.value };
    console.log('[ComponentEditingBar] Updating border width:', newStyle);
    onUpdateStyle(newStyle);
  };

  const handleBorderStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = { borderStyle: e.target.value };
    console.log('[ComponentEditingBar] Updating border style:', newStyle);
    onUpdateStyle(newStyle);
  };

  const handleBorderColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { borderColor: e.target.value };
    console.log('[ComponentEditingBar] Updating border color:', newStyle);
    onUpdateStyle(newStyle);
  };

  const handleBorderRadius = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = { borderRadius: e.target.value };
    console.log('[ComponentEditingBar] Updating border radius:', newStyle);
    onUpdateStyle(newStyle);
  };

  // Effect handlers
  const handleShadow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shadows = {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    };
    const newStyle = { boxShadow: shadows[e.target.value as keyof typeof shadows] };
    console.log('[ComponentEditingBar] Updating shadow:', newStyle);
    onUpdateStyle(newStyle);
  };

  const handleOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { opacity: parseFloat(e.target.value) / 100 };
    console.log('[ComponentEditingBar] Updating opacity:', newStyle);
    onUpdateStyle(newStyle);
  };

  // Text-specific controls (data update)
  const handleTextDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (component.type === 'text') {
      const newData = { ...component.data, text: e.target.value };
      console.log('[ComponentEditingBar] Updating text data:', newData);
      onUpdateData(newData);
    }
  };


  const isText = component.type === "text";

  return (
    <div
      className="fixed left-1/2 top-4 z-[100] flex items-center space-x-2 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-1.5 text-xs"
      style={{ transform: "translateX(-50%)" }}
      onClick={(e) => e.stopPropagation()} 
    >
      <span className="font-medium text-gray-600 mr-1">Arrange:</span>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleAlign("left")} title="Align Left">L</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleAlign("center")} title="Align Center">C</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleAlign("right")} title="Align Right">R</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleAlign("top")} title="Align Top">T</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleAlign("middle")} title="Align Middle">M</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleAlign("bottom")} title="Align Bottom">B</button>
      
      <span className="mx-1 border-l border-gray-300 h-5" />
      
      <span className="font-medium text-gray-600 mr-1">Style:</span>
      <select
        onChange={handleFontSize}
        value={component.style?.fontSize || "16px"}
        className="text-xs p-0.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        title="Font Size"
      >
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="32px">32</option>
        <option value="40px">40</option>
        <option value="48px">48</option>
        <option value="64px">64</option>
        <option value="72px">72</option>
        <option value="96px">96</option>
        <option value="128px">128</option>
      </select>
      <input 
        type="color" 
        onChange={handleFontColor} 
        value={typeof component.style?.color === 'string' ? component.style.color : "#222222"} 
        title="Font Color" 
        className="w-5 h-5 p-0 border-none rounded cursor-pointer"
      />
      <input 
        type="color" 
        onChange={handleBgColor} 
        value={typeof component.style?.backgroundColor === 'string' ? component.style.backgroundColor : "#ffffff"} 
        title="Background Color" 
        className="w-5 h-5 p-0 border-none rounded cursor-pointer"
      />
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleTextAlign("left")} title="Left Align">L</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleTextAlign("center")} title="Center Align">C</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleTextAlign("right")} title="Right Align">R</button>
      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleTextAlign("justify")} title="Justify">J</button>

      {isText && (
        <>
          <span className="mx-1 border-l border-gray-300 h-5" />
          <span className="font-medium text-gray-600 mr-1">Content:</span>
          <input 
            type="text"
            value={component.data?.text || ''}
            onChange={handleTextDataChange}
            className="text-xs p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 w-32"
            placeholder="Edit text..."
          />
        </>
      )}
      
      <span className="mx-1 border-l border-gray-300 h-5" />
      
      <span className="font-medium text-gray-600 mr-1">Size & Arrange:</span>
      <button 
        onClick={() => setShowArrangeOptions(!showArrangeOptions)}
        className={`p-1 hover:bg-gray-100 rounded ${showArrangeOptions ? 'bg-gray-100' : ''}`}
        title="Size & Arrange Options"
      >
        S/A
      </button>
      
      {showArrangeOptions && (
        <>
          <div className="flex items-center">
            <span className="text-xs mr-1">W:</span>
            <input
              type="number"
              value={component.layout.width}
              onChange={(e) => handleSizeChange('width', e.target.value)}
              className="text-xs w-12 p-0.5 border border-gray-300 rounded"
              min="20"
            />
          </div>
          <div className="flex items-center">
            <span className="text-xs mr-1">H:</span>
            <input
              type="number"
              value={component.layout.height}
              onChange={(e) => handleSizeChange('height', e.target.value)}
              className="text-xs w-12 p-0.5 border border-gray-300 rounded"
              min="20"
            />
          </div>
          <button
            onClick={() => handleZIndexChange('forward')}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Bring Forward"
          >
            ↑
          </button>
          <button
            onClick={() => handleZIndexChange('backward')}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Send Backward"
          >
            ↓
          </button>
          <button
            onClick={() => handleZIndexChange('front')}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Bring to Front"
          >
            ⇈
          </button>
          <button
            onClick={() => handleZIndexChange('back')}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Send to Back"
          >
            ⇊
          </button>
        </>
      )}

      <span className="mx-1 border-l border-gray-300 h-5" />
      
      <span className="font-medium text-gray-600 mr-1">Border:</span>
      <button 
        onClick={() => setShowBorderOptions(!showBorderOptions)}
        className={`p-1 hover:bg-gray-100 rounded ${showBorderOptions ? 'bg-gray-100' : ''}`}
        title="Border Options"
      >
        B
      </button>
      
      {showBorderOptions && (
        <>
          <select
            onChange={handleBorderWidth}
            value={component.style?.borderWidth || "0px"}
            className="text-xs p-0.5 border border-gray-300 rounded"
            title="Border Width"
          >
            <option value="0px">0</option>
            <option value="1px">1</option>
            <option value="2px">2</option>
            <option value="3px">3</option>
            <option value="4px">4</option>
          </select>
          <select
            onChange={handleBorderStyle}
            value={component.style?.borderStyle || "solid"}
            className="text-xs p-0.5 border border-gray-300 rounded"
            title="Border Style"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
          <input
            type="color"
            onChange={handleBorderColor}
            value={typeof component.style?.borderColor === 'string' ? component.style.borderColor : "#000000"}
            title="Border Color"
            className="w-5 h-5 p-0 border-none rounded cursor-pointer"
          />
          <select
            onChange={handleBorderRadius}
            value={component.style?.borderRadius || "0px"}
            className="text-xs p-0.5 border border-gray-300 rounded"
            title="Border Radius"
          >
            <option value="0px">0</option>
            <option value="4px">4</option>
            <option value="8px">8</option>
            <option value="12px">12</option>
            <option value="16px">16</option>
            <option value="24px">24</option>
            <option value="9999px">Full</option>
          </select>
        </>
      )}

      <span className="mx-1 border-l border-gray-300 h-5" />
      
      <span className="font-medium text-gray-600 mr-1">Effects:</span>
      <button 
        onClick={() => setShowEffectOptions(!showEffectOptions)}
        className={`p-1 hover:bg-gray-100 rounded ${showEffectOptions ? 'bg-gray-100' : ''}`}
        title="Effect Options"
      >
        E
      </button>
      
      {showEffectOptions && (
        <>
          <select
            onChange={handleShadow}
            value={
              component.style?.boxShadow === 'none' ? 'none' :
              component.style?.boxShadow === '0 1px 3px rgba(0,0,0,0.12)' ? 'sm' :
              component.style?.boxShadow === '0 4px 6px rgba(0,0,0,0.1)' ? 'md' :
              component.style?.boxShadow === '0 10px 15px rgba(0,0,0,0.1)' ? 'lg' :
              component.style?.boxShadow === '0 20px 25px rgba(0,0,0,0.1)' ? 'xl' : 'none'
            }
            className="text-xs p-0.5 border border-gray-300 rounded"
            title="Shadow"
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">X-Large</option>
            <option value="2xl">2X-Large</option>
            <option value="inner">Inner</option>
          </select>
          <div className="flex items-center">
            <span className="text-xs mr-1">Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={((component.style?.opacity as number) || 1) * 100}
              onChange={handleOpacity}
              className="w-16"
              title="Opacity"
            />
            <span className="text-xs ml-1">{Math.round(((component.style?.opacity as number) || 1) * 100)}%</span>
          </div>
        </>
      )}
    </div>
  );
};
