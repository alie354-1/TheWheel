import React, { useState, useEffect } from 'react';
import { MarketSegmentsData, MarketSegmentsBlock } from '../../types/blocks';

interface MarketSegmentsEditorProps {
  block: MarketSegmentsBlock;
  onChange: (data: Partial<MarketSegmentsBlock>) => void;
}

const MarketSegmentsEditor: React.FC<MarketSegmentsEditorProps> = ({ block, onChange }) => {
  const [segments, setSegments] = useState<MarketSegmentsData['segments']>(block.segmentData?.segments || []);
  const [title, setTitle] = useState<string>(block.title || '');

  useEffect(() => {
    // Initialize with default segment if empty
    if (!segments.length) {
      setSegments([{ name: 'Segment 1', value: 100, color: '#FF6384', description: '' }]);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    onChange({ segmentData: { segments }, title });
  }, [segments, title, onChange]);

  const handleSegmentChange = (index: number, field: keyof MarketSegmentsData['segments'][0], value: string | number) => {
    const newSegments = [...segments];
    // Type assertion to satisfy TypeScript
    (newSegments[index] as any)[field] = field === 'value' ? Number(value) : value;
    setSegments(newSegments);
  };

  const addSegment = () => {
    setSegments([
      ...segments,
      { name: `Segment ${segments.length + 1}`, value: 0, color: '#36A2EB', description: '' },
    ]);
  };

  const removeSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    setSegments(newSegments);
  };

  const getTotalPercentage = () => {
    return segments.reduce((total, segment) => total + (segment.value || 0), 0);
  };

  const totalPercentage = getTotalPercentage();

  // Basic color palette
  const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-md">
      <div>
        <label htmlFor="marketSegmentsTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Chart Title
        </label>
        <input
          type="text"
          id="marketSegmentsTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Target Audience Breakdown"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {segments.map((segment, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded-md bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-800">Segment {index + 1}</h4>
            <button
              onClick={() => removeSegment(index)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
              disabled={segments.length <= 1}
            >
              Remove
            </button>
          </div>
          <div>
            <label htmlFor={`segmentName-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              id={`segmentName-${index}`}
              value={segment.name}
              onChange={(e) => handleSegmentChange(index, 'name', e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>
          <div>
            <label htmlFor={`segmentValue-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Value (%)</label>
            <input
              type="number"
              id={`segmentValue-${index}`}
              value={segment.value}
              onChange={(e) => handleSegmentChange(index, 'value', e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label htmlFor={`segmentColor-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id={`segmentColor-${index}`}
                value={segment.color}
                onChange={(e) => handleSegmentChange(index, 'color', e.target.value)}
                className="w-8 h-8 p-0 border-none rounded cursor-pointer"
              />
              <select 
                value={segment.color} 
                onChange={(e) => handleSegmentChange(index, 'color', e.target.value)}
                className="p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
              >
                {colorPalette.map(color => (
                  <option key={color} value={color} style={{ backgroundColor: color }}>{color}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={`segmentDescription-${index}`} className="block text-xs font-medium text-gray-600 mb-1">Description (Optional)</label>
            <textarea
              id={`segmentDescription-${index}`}
              value={segment.description || ''}
              onChange={(e) => handleSegmentChange(index, 'description', e.target.value)}
              rows={2}
              className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>
        </div>
      ))}
      <button
        onClick={addSegment}
        className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
      >
        Add Segment
      </button>
      {totalPercentage !== 100 && (
        <p className="text-xs text-red-600 mt-1">
          Total percentage is {totalPercentage}%. It should be 100%.
        </p>
      )}

      <div className="mt-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Live Preview (Simplified)</h5>
        <div className="w-full h-48 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center p-2">
          {segments.length > 0 && totalPercentage > 0 ? (
            <div className="flex h-full w-full rounded-full overflow-hidden">
              {segments.map((segment, index) => (
                segment.value > 0 && (
                  <div
                    key={index}
                    style={{
                      width: `${(segment.value / totalPercentage) * 100}%`,
                      backgroundColor: segment.color,
                    }}
                    title={`${segment.name}: ${segment.value}%`}
                  />
                )
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">Add segments with values to see a preview.</p>
          )}
        </div>
         <ul className="mt-2 text-xs space-y-1">
          {segments.map((segment, index) => (
            <li key={index} className="flex items-center">
              <span style={{ backgroundColor: segment.color }} className="w-3 h-3 rounded-full mr-2 inline-block"></span>
              {segment.name}: {segment.value}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MarketSegmentsEditor;
