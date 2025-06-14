import React from 'react';
import { HiringPlanBlock, HiringRole } from '../../types/blocks.ts';
import { Input } from '../../../components/ui/input.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Label } from '../../../components/ui/label.tsx';
import { PlusCircle, Trash2 } from 'lucide-react';

interface HiringPlanEditorProps {
  block: HiringPlanBlock;
  onChange: (data: Partial<HiringPlanBlock>) => void;
}

export const HiringPlanEditor: React.FC<HiringPlanEditorProps> = ({ block, onChange }) => {
  const { roles, title } = block;

  const handleRoleChange = (index: number, field: keyof HiringRole, value: any) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    onChange({ roles: newRoles });
  };

  const addRole = () => {
    const newRole: HiringRole = { title: 'New Role', department: 'Engineering', timeline: 'Q1 2025', count: 1 };
    onChange({ roles: [...roles, newRole] });
  };

  const removeRole = (index: number) => {
    const newRoles = roles.filter((_: HiringRole, i: number) => i !== index);
    onChange({ roles: newRoles });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Roles</Label>
        {roles.map((role: HiringRole, index: number) => (
          <div key={index} className="space-y-2 p-2 border rounded">
            <Input
              value={role.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRoleChange(index, 'title', e.target.value)}
              placeholder="Role Title"
            />
            <Input
              value={role.department}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRoleChange(index, 'department', e.target.value)}
              placeholder="Department"
            />
            <Input
              value={role.timeline}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRoleChange(index, 'timeline', e.target.value)}
              placeholder="Timeline"
            />
            <Button variant="danger" size="sm" onClick={() => removeRole(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addRole}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>
    </div>
  );
};
