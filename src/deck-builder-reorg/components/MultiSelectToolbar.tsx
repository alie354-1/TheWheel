import React from 'react';
import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalDistributeStart,
  AlignHorizontalDistributeEnd,
  AlignVerticalDistributeStart,
  AlignVerticalDistributeCenter,
  AlignVerticalDistributeEnd,
  Copy,
  BringToFront,
  SendToBack,
  Trash2,
  Group,
  Ungroup
} from 'lucide-react';

interface MultiSelectToolbarProps {
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (distribution: 'horizontal' | 'vertical') => void;
  onMatchSize: (dimension: 'width' | 'height' | 'both') => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
}

export const MultiSelectToolbar: React.FC<MultiSelectToolbarProps> = ({
  onAlign,
  onDistribute,
  onMatchSize,
  onGroup,
  onUngroup,
  onBringToFront,
  onSendToBack,
  onDelete,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 z-50">
      <div className="flex items-center space-x-1">
        <button onClick={() => onAlign('left')} className="p-2 hover:bg-gray-100 rounded" title="Align Left"><AlignHorizontalDistributeStart size={18} /></button>
        <button onClick={() => onAlign('center')} className="p-2 hover:bg-gray-100 rounded" title="Align Center"><AlignHorizontalDistributeCenter size={18} /></button>
        <button onClick={() => onAlign('right')} className="p-2 hover:bg-gray-100 rounded" title="Align Right"><AlignHorizontalDistributeEnd size={18} /></button>
      </div>
      <div className="border-l h-6 border-gray-300" />
      <div className="flex items-center space-x-1">
        <button onClick={() => onAlign('top')} className="p-2 hover:bg-gray-100 rounded" title="Align Top"><AlignVerticalDistributeStart size={18} /></button>
        <button onClick={() => onAlign('middle')} className="p-2 hover:bg-gray-100 rounded" title="Align Middle"><AlignVerticalDistributeCenter size={18} /></button>
        <button onClick={() => onAlign('bottom')} className="p-2 hover:bg-gray-100 rounded" title="Align Bottom"><AlignVerticalDistributeEnd size={18} /></button>
      </div>
      <div className="border-l h-6 border-gray-300" />
      <div className="flex items-center space-x-1">
        <button onClick={() => onDistribute('horizontal')} className="p-2 hover:bg-gray-100 rounded" title="Distribute Horizontal">H</button>
        <button onClick={() => onDistribute('vertical')} className="p-2 hover:bg-gray-100 rounded" title="Distribute Vertical">V</button>
      </div>
      <div className="border-l h-6 border-gray-300" />
      <div className="flex items-center space-x-1">
        <button onClick={() => onMatchSize('width')} className="p-2 hover:bg-gray-100 rounded" title="Match Width">W</button>
        <button onClick={() => onMatchSize('height')} className="p-2 hover:bg-gray-100 rounded" title="Match Height">H</button>
        <button onClick={() => onMatchSize('both')} className="p-2 hover:bg-gray-100 rounded" title="Match Size">S</button>
      </div>
      <div className="border-l h-6 border-gray-300" />
      <div className="flex items-center space-x-1">
        <button onClick={onGroup} className="p-2 hover:bg-gray-100 rounded" title="Group"><Group size={18} /></button>
        <button onClick={onUngroup} className="p-2 hover:bg-gray-100 rounded" title="Ungroup"><Ungroup size={18} /></button>
      </div>
      <div className="border-l h-6 border-gray-300" />
      <div className="flex items-center space-x-1">
        <button onClick={onBringToFront} className="p-2 hover:bg-gray-100 rounded" title="Bring to Front"><BringToFront size={18} /></button>
        <button onClick={onSendToBack} className="p-2 hover:bg-gray-100 rounded" title="Send to Back"><SendToBack size={18} /></button>
      </div>
      <div className="border-l h-6 border-gray-300" />
      <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-100 rounded" title="Delete Selected"><Trash2 size={18} /></button>
    </div>
  );
};
