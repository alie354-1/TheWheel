import React, { useState, useEffect } from 'react';
import { CompetitivePositioningData, CompetitivePositioningBlock } from '../../types/blocks';

interface CompetitivePositioningEditorProps {
  block: CompetitivePositioningBlock;
  onChange: (data: Partial<CompetitivePositioningBlock>) => void;
}

const CompetitivePositioningEditor: React.FC<CompetitivePositioningEditorProps> = ({ block, onChange }) => {
  const initialData = block.chartData || { xLabel: 'Price', yLabel: 'Features', points: [] };
  const [title, setTitle] = useState<string>(block.title || '');
  const [xLabel, setXLabel] = useState<string>(initialData.xLabel);
  const [yLabel, setYLabel] = useState<string>(initialData.yLabel);
  const [points, setPoints] = useState<CompetitivePositioningData['points']>(initialData.points);

  useEffect(() => {
    if (!points.length) {
      setPoints([{ name: 'Our Product', x: 0.7, y: 0.8, color: '#007AFF', description: '' }]);
    }
  }, []);

  useEffect(() => {
    onChange({ chartData: { xLabel, yLabel, points }, title });
  }, [xLabel, yLabel, points, title, onChange]);

  const handlePointChange = (index: number, field: keyof CompetitivePositioningData['points'][0], value: string | number) => {
    const newPoints = [...points];
    (newPoints[index] as any)[field] = (field === 'x' || field === 'y') ? Number(value) : value;
    setPoints(newPoints);
  };

  const addPoint = () => {
    setPoints([
      ...points,
      { name: `Competitor ${points.length}`, x: 0.5, y: 0.5, color: '#FF9500', description: '' },
    ]);
  };

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };
  
  const colorPalette = ['#007AFF', '#FF9500', '#34C759', '#FF2D55', '#AF52DE', '#5856D6'];

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-md">
      <div>
        <label htmlFor="competitivePositioningTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Chart Title
        </label>
        <input
          type="text"
          id="competitivePositioningTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Market Landscape"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="xLabel" className="block text-sm font-medium text-gray-700 mb-1">X-Axis Label</label>
          <input
            type="text"
            id="xLabel"
            value={xLabel}
            onChange={(e) => setXLabel(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
          />
        </div>
        <div>
          <label htmlFor="yLabel" className="block text-sm font-medium text-gray-700 mb-1">Y-Axis Label</label>
          <input
            type="text"
            id="yLabel"
            value={yLabel}
            onChange={(e) => setYLabel(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
          />
        </div>
      </div>

      {points.map((point, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded-md bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-800">Point {index + 1}</h4>
            <button
              onClick={() => removePoint(index)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
              disabled={points.length <= 1}
            >
              Remove
            </button>
          </div>
          <div>
            <label htmlFor={`pointName-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              id={`pointName-${index}`}
              value={point.name}
              onChange={(e) => handlePointChange(index, 'name', e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`pointX-${index}`} className="block text-xs font-medium text-gray-600 mb-1">X Value (0-1)</label>
              <input
                type="number"
                id={`pointX-${index}`}
                value={point.x}
                onChange={(e) => handlePointChange(index, 'x', parseFloat(e.target.value))}
                className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
                min="0" max="1" step="0.01"
              />
            </div>
            <div>
              <label htmlFor={`pointY-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Y Value (0-1)</label>
              <input
                type="number"
                id={`pointY-${index}`}
                value={point.y}
                onChange={(e) => handlePointChange(index, 'y', parseFloat(e.target.value))}
                className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
                min="0" max="1" step="0.01"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`pointColor-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Color</label>
             <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id={`pointColor-${index}`}
                  value={point.color}
                  onChange={(e) => handlePointChange(index, 'color', e.target.value)}
                  className="w-8 h-8 p-0 border-none rounded cursor-pointer"
                />
                <select 
                  value={point.color} 
                  onChange={(e) => handlePointChange(index, 'color', e.target.value)}
                  className="p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  {colorPalette.map(color => (
                    <option key={color} value={color} style={{ backgroundColor: color }}>{color}</option>
                  ))}
                </select>
              </div>
          </div>
          <div>
            <label htmlFor={`pointDescription-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Description (Optional)</label>
            <textarea
              id={`pointDescription-${index}`}
              value={point.description || ''}
              onChange={(e) => handlePointChange(index, 'description', e.target.value)}
              rows={2}
              className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>
        </div>
      ))}
      <button
        onClick={addPoint}
        className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
      >
        Add Point
      </button>

      <div className="mt-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Live Preview (2x2 Matrix)</h5>
        <div className="w-full h-64 bg-gray-100 border border-gray-300 rounded-md relative p-4">
          {/* Y-Axis Label */}
          <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-xs text-gray-600">{yLabel}</span>
          {/* X-Axis Label */}
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-600">{xLabel}</span>
          {/* Grid lines */}
          <div className="absolute top-0 left-10 right-0 bottom-10 border-l border-b border-gray-400">
            <div className="absolute w-full h-1/2 border-b border-dashed border-gray-300 top-0"></div>
            <div className="absolute h-full w-1/2 border-r border-dashed border-gray-300 left-0"></div>
          </div>
          
          {points.map((p, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{
                bottom: `calc(10% + ${p.y * 80}%)`, // Scaled to fit within 10%-90% area
                left: `calc(10% + ${p.x * 80}%)`,   // Scaled to fit within 10%-90% area
                backgroundColor: p.color,
              }}
              title={`${p.name} (X: ${p.x}, Y: ${p.y})`}
            >
              <span className="text-white text-[8px] font-bold">{i+1}</span>
            </div>
          ))}
        </div>
        <ul className="mt-2 text-xs space-y-1">
          {points.map((p, i) => (
            <li key={i} className="flex items-center">
              <span style={{ backgroundColor: p.color }} className="w-3 h-3 rounded-full mr-2 inline-block"></span>
              {i+1}. {p.name} (X: {p.x}, Y: {p.y})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompetitivePositioningEditor;
