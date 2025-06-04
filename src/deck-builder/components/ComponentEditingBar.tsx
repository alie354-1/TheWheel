import React from "react";
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
    </div>
  );
};
