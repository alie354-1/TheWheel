import React from 'react';
import { CompetitorTableBlock, Competitor } from '../../types/blocks.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '../../../components/ui/label.tsx';

interface CompetitorTableEditorProps {
  block: CompetitorTableBlock;
  onChange: (data: Partial<CompetitorTableBlock>) => void;
}

export const CompetitorTableEditor: React.FC<CompetitorTableEditorProps> = ({ block, onChange }) => {
  const handleCompetitorChange = (index: number, field: keyof Competitor, value: any) => {
    const newCompetitors = [...block.competitors];
    (newCompetitors[index] as any)[field] = value;
    onChange({ competitors: newCompetitors });
  };

  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      name: 'New Competitor',
      features: block.featureList.reduce((acc, feature) => {
        acc[feature] = false;
        return acc;
      }, {} as { [feature: string]: boolean }),
    };
    onChange({ competitors: [...block.competitors, newCompetitor] });
  };

  const removeCompetitor = (index: number) => {
    const newCompetitors = block.competitors.filter((_, i) => i !== index);
    onChange({ competitors: newCompetitors });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatureList = [...block.featureList];
    newFeatureList[index] = value;
    onChange({ featureList: newFeatureList });
  };

  const addFeature = () => {
    onChange({ featureList: [...block.featureList, 'New Feature'] });
  };

  const removeFeature = (index: number) => {
    const featureToRemove = block.featureList[index];
    const newFeatureList = block.featureList.filter((_, i) => i !== index);
    const newCompetitors = block.competitors.map(c => {
      const newFeatures = { ...c.features };
      delete newFeatures[featureToRemove];
      return {
        ...c,
        features: newFeatures
      };
    });
    onChange({ featureList: newFeatureList, competitors: newCompetitors });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Features</Label>
        {block.featureList.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
            />
            <Button variant="destructive" size="sm" onClick={() => removeFeature(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addFeature}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>
      <div>
        <Label>Competitors</Label>
        {block.competitors.map((competitor, index) => (
          <div key={index} className="space-y-2 p-2 border rounded">
            <Input
              value={competitor.name}
              onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)}
              placeholder="Competitor Name"
            />
            <Button variant="destructive" size="sm" onClick={() => removeCompetitor(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addCompetitor}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>
    </div>
  );
};
