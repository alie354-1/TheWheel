import React from 'react';
import { useStore } from '@nanostores/react';
import { deckBuilderStore, updateBlockData, setSelectedBlock, DeckSlide } from '../../store/deckBuilder.store'; 
import { 
  BLOCK_REGISTRY, 
  DeckBlock, 
  EditableProp, 
  MarketSegmentsBlock, 
  CompetitivePositioningBlock, 
  SkillMatrixBlock, 
  BlockType,
  CompetitorTableBlock,
  ListItem, // Ensured ListItem is imported
  ChartBlock, // Added ChartBlock
  ChartData // Added ChartData
} from '../../../../deck-builder/types/blocks'; 
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Checkbox } from '@/components/ui/checkbox'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import { Button } from '@/components/ui/button'; 
import { Trash2 } from 'lucide-react'; 
// Import new editors
import MarketSegmentsEditor from '../../../../deck-builder/components/editors/MarketSegmentsEditor'; 
import CompetitivePositioningEditor from '../../../../deck-builder/components/editors/CompetitivePositioningEditor'; 
import SkillMatrixEditor from '../../../../deck-builder/components/editors/SkillMatrixEditor'; 
import CompetitorFeaturesEditor from '../../../../deck-builder/components/editors/CompetitorFeaturesEditor';
import ChartDataEditor from '../../../../deck-builder/components/editors/ChartDataEditor'; // Import ChartDataEditor
import { generateUUID } from '../../../../deck-builder/utils/uuid'; 

export const InspectorPanel: React.FC = () => {
  const $deckBuilderStore = useStore(deckBuilderStore);
  const selectedBlockId = $deckBuilderStore.selectedBlockId;
  const selectedSlide = $deckBuilderStore.slides.find((s: DeckSlide) => s.id === $deckBuilderStore.selectedSlideId);
  
  const selectedBlock = selectedSlide?.blocks.find((b: DeckBlock) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Select a block to edit its properties.
      </div>
    );
  }

  const blockType = selectedBlock.type as BlockType;
  const blockMeta = BLOCK_REGISTRY[blockType];
  if (!blockMeta?.editableProps) {
    return (
      <div className="p-4 text-sm text-gray-500">
        This block type has no editable properties.
      </div>
    );
  }

  const handlePropChange = (propName: string, value: any) => {
    if (selectedBlockId) {
      updateBlockData(selectedBlockId, { [propName]: value });
    }
  };
  
  const handleSpecializedEditorChange = (updatedData: Partial<DeckBlock>) => {
    if (selectedBlockId) {
      updateBlockData(selectedBlockId, updatedData);
    }
  };

  const renderEditableProp = (
    propConfig: EditableProp, 
    dataObject: any, 
    onChangeCallback: (propName: string, newValue: any) => void, 
    parentBlockData: DeckBlock 
  ) => {
    const currentValue = dataObject[propConfig.name];

    switch (propConfig.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={currentValue || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeCallback(propConfig.name, e.target.value)}
            className="mt-1"
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={currentValue || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChangeCallback(propConfig.name, e.target.value)}
            className="mt-1"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const numValue = parseFloat(e.target.value);
              onChangeCallback(propConfig.name, isNaN(numValue) ? 0 : numValue);
            }}
            className="mt-1"
          />
        );
      case 'color':
        return (
          <Input
            type="color"
            value={currentValue || '#000000'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeCallback(propConfig.name, e.target.value)}
            className="mt-1 h-10"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={!!currentValue}
            onCheckedChange={(checked: boolean | 'indeterminate') => onChangeCallback(propConfig.name, checked)}
            className="mt-1"
          />
        );
      case 'select':
        return (
          <Select value={currentValue} onValueChange={(val: string) => onChangeCallback(propConfig.name, val)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={`Select ${propConfig.label}`} />
            </SelectTrigger>
            <SelectContent>
              {propConfig.options?.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'market_segments':
        return (
          <MarketSegmentsEditor
            block={dataObject as MarketSegmentsBlock} 
            onChange={handleSpecializedEditorChange}
          />
        );
      case 'competitive_positioning':
        return (
          <CompetitivePositioningEditor
            block={dataObject as CompetitivePositioningBlock}
            onChange={handleSpecializedEditorChange}
          />
        );
      case 'skill_matrix':
        return (
          <SkillMatrixEditor
            block={dataObject as SkillMatrixBlock}
            onChange={handleSpecializedEditorChange}
          />
        );
      case 'competitor_features': {
        const castParentBlock = parentBlockData as CompetitorTableBlock;
        return (
          <CompetitorFeaturesEditor
            value={currentValue} 
            onChange={(newFeaturesValue) => onChangeCallback(propConfig.name, newFeaturesValue)}
            featureList={castParentBlock?.featureList || []}
          />
        );
      }
      case 'chart_data': {
        // Ensure dataObject is ChartBlock to access chartType
        const chartBlock = dataObject as ChartBlock; 
        return (
          <ChartDataEditor
            value={currentValue as ChartData || { labels: [], datasets: [] }} // Pass the data object
            onChange={(newData) => onChangeCallback(propConfig.name, newData)} // This should update the 'data' prop on the ChartBlock
            chartType={chartBlock.chartType} 
          />
        );
      }
      case 'object_array': {
        const items: any[] = Array.isArray(currentValue) ? currentValue : [];
        const itemSchema = propConfig.itemSchema;

        if (!itemSchema) {
          return <p className="text-xs text-red-500 mt-1">No itemSchema defined for object_array.</p>;
        }

        const handleAddItem = () => {
          const newItem: any = { id: generateUUID() };
          itemSchema.forEach(schemaProp => {
            newItem[schemaProp.name] = schemaProp.type === 'object_array' ? [] : 
                                       schemaProp.type === 'json' ? {} : 
                                       schemaProp.type === 'number' ? 0 :
                                       schemaProp.type === 'checkbox' ? false :
                                       ''; // Default for text/textarea etc.
          });
          onChangeCallback(propConfig.name, [...items, newItem]);
        };

        const handleRemoveItem = (indexToRemove: number) => {
          onChangeCallback(propConfig.name, items.filter((_, index) => index !== indexToRemove));
        };

        const handleItemChange = (itemIndex: number, itemName: string, itemValue: any) => {
          const updatedItems = items.map((item, idx) => 
            idx === itemIndex ? { ...item, [itemName]: itemValue } : item
          );
          onChangeCallback(propConfig.name, updatedItems);
        };

        return (
          <div className="space-y-3 mt-1">
            {items.map((item, index) => (
              <div key={item.id || index} className="p-3 border rounded-md space-y-2 bg-gray-50">
                {itemSchema.map(schemaProp => (
                  <div key={schemaProp.name}>
                    <Label className="text-xs font-medium text-gray-600">{schemaProp.label}</Label>
                    {renderEditableProp(
                      schemaProp, 
                      item, 
                      (itemName, itemValue) => handleItemChange(index, itemName, itemValue),
                      parentBlockData 
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
              Add {propConfig.label.replace(/s$/, '').replace('List ', '')} 
            </Button>
          </div>
        );
      }
      case 'json': // Basic JSON editor as a fallback
        return (
          <Textarea
            value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                onChangeCallback(propConfig.name, JSON.parse(e.target.value));
              } catch (err) {
                // Handle JSON parse error, maybe set an error state or log
                console.error("Invalid JSON:", err);
              }
            }}
            className="mt-1 font-mono text-xs"
            rows={5}
          />
        );
      default:
        return <p className="text-xs text-gray-400 mt-1">Editor not available for type: {propConfig.type}</p>;
    }
  };

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto bg-white border-l border-gray-200">
      <div className="pb-2 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{blockMeta.label} Properties</h3>
        <p className="text-xs text-gray-500">ID: {selectedBlock.id}</p>
      </div>
      
      {blockMeta.editableProps.map((prop: EditableProp) => (
        <div key={prop.name} className="space-y-1">
          <Label htmlFor={prop.name} className="text-sm font-medium text-gray-700">{prop.label}</Label>
          {renderEditableProp(prop, selectedBlock, handlePropChange, selectedBlock)}
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200">
        <button 
          onClick={() => setSelectedBlock(null)} 
          className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Deselect Block
        </button>
      </div>
    </div>
  );
};
