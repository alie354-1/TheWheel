import React from 'react';
import { MapBlock as MapBlockType } from '../../types/blocks';

interface MapEditorProps {
  block: MapBlockType;
  onChange: (block: MapBlockType) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({ block, onChange }) => {
  const locations = block.locations ?? [];

  const handleLocationChange = (idx: number, field: string, value: string) => {
    const updated = locations.map((loc, i) =>
      i === idx ? { ...loc, [field]: value } : loc
    );
    onChange({ ...block, locations: updated });
  };

  const addLocation = () => {
    onChange({
      ...block,
      locations: [...locations, { label: '', lat: '', lng: '', description: '' }]
    });
  };

  const removeLocation = (idx: number) => {
    onChange({
      ...block,
      locations: locations.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addLocation} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Location
        </button>
      </div>
      {locations.map((location, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={location.label ?? ''}
              onChange={e => handleLocationChange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Latitude</label>
            <input
              type="text"
              value={location.lat ?? ''}
              onChange={e => handleLocationChange(idx, 'lat', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Longitude</label>
            <input
              type="text"
              value={location.lng ?? ''}
              onChange={e => handleLocationChange(idx, 'lng', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={location.description ?? ''}
              onChange={e => handleLocationChange(idx, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeLocation(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default MapEditor;
