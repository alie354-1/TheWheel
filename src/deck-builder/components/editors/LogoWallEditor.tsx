import React from 'react';
import { LogoWallBlock } from '../../types/blocks.ts';
import { Logo } from '../../types/index.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '../../../components/ui/label.tsx';

interface LogoWallEditorProps {
  block: LogoWallBlock;
  onChange: (data: Partial<LogoWallBlock>) => void;
}

export const LogoWallEditor: React.FC<LogoWallEditorProps> = ({ block, onChange }) => {
  const handleLogoChange = (index: number, field: keyof Logo, value: any) => {
    const newLogos = [...block.logos];
    newLogos[index] = { ...newLogos[index], [field]: value };
    onChange({ logos: newLogos });
  };

  const addLogo = () => {
    const newLogo: Logo = {
      src: '',
      alt: '',
    };
    onChange({ logos: [...block.logos, newLogo] });
  };

  const removeLogo = (index: number) => {
    const newLogos = block.logos.filter((_, i) => i !== index);
    onChange({ logos: newLogos });
  };

  return (
    <div className="space-y-4">
      {block.logos.map((logo, index) => (
        <div key={index} className="space-y-2 p-2 border rounded">
          <Label>Logo #{index + 1}</Label>
          <Input
            value={logo.src}
            onChange={(e) => handleLogoChange(index, 'src', e.target.value)}
            placeholder="Image URL"
          />
          <Input
            value={logo.alt}
            onChange={(e) => handleLogoChange(index, 'alt', e.target.value)}
            placeholder="Alt Text"
          />
          <Button variant="danger" size="sm" onClick={() => removeLogo(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addLogo}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Logo
      </Button>
    </div>
  );
};
