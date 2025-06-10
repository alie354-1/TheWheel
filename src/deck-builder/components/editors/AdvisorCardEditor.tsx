import React from 'react';
import { AdvisorCardBlock } from '../../types/blocks';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';

interface AdvisorCardEditorProps {
  block: AdvisorCardBlock;
  onChange: (data: Partial<AdvisorCardBlock>) => void;
}

export const AdvisorCardEditor: React.FC<AdvisorCardEditorProps> = ({ block, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={block.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div>
        <Label>Title</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div>
        <Label>Company</Label>
        <Input
          value={block.company}
          onChange={(e) => onChange({ company: e.target.value })}
        />
      </div>
      <div>
        <Label>Photo URL</Label>
        <Input
          value={block.photoUrl}
          onChange={(e) => onChange({ photoUrl: e.target.value })}
        />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea
          value={block.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
        />
      </div>
      <div>
        <Label>LinkedIn URL</Label>
        <Input
          value={block.linkedin}
          onChange={(e) => onChange({ linkedin: e.target.value })}
        />
      </div>
    </div>
  );
};
