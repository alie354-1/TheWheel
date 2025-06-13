import React from 'react';
import { AdvisorCardBlock } from '../../types/blocks.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Textarea } from '../../../components/ui/textarea.tsx';
import { Label } from '../../../components/ui/label.tsx';

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ name: e.target.value })}
        />
      </div>
      <div>
        <Label>Title</Label>
        <Input
          value={block.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ title: e.target.value })}
        />
      </div>
      <div>
        <Label>Company</Label>
        <Input
          value={block.company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ company: e.target.value })}
        />
      </div>
      <div>
        <Label>Photo URL</Label>
        <Input
          value={block.photoUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ photoUrl: e.target.value })}
        />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea
          value={block.bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ bio: e.target.value })}
        />
      </div>
      <div>
        <Label>LinkedIn URL</Label>
        <Input
          value={block.linkedin}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ linkedin: e.target.value })}
        />
      </div>
    </div>
  );
};
