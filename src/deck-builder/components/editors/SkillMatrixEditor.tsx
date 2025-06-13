import React from "react";
import { SkillMatrixBlock, SkillMatrixData } from "../../types/blocks.ts";
import { Input } from "../../../components/ui/input.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { PlusCircle, Trash2 } from "lucide-react";
import { Label } from "../../../components/ui/label.tsx";

interface SkillMatrixEditorProps {
  value: Omit<SkillMatrixBlock, "type" | "id">;
  onChange: (data: Omit<SkillMatrixBlock, "type" | "id">) => void;
}

export const SkillMatrixEditor: React.FC<SkillMatrixEditorProps> = ({ value, onChange }) => {
  const { title, matrixData } = value;

  const handleMatrixDataChange = (data: Partial<SkillMatrixData>) => {
    onChange({ ...value, matrixData: { ...matrixData, data: { ...matrixData.data, ...data } } });
  };

  const handleSkillChange = (idx: number, skillName: string) => {
    const updatedSkills = matrixData.data.skills.map((s: string, i: number) =>
      i === idx ? skillName : s
    );
    handleMatrixDataChange({ skills: updatedSkills });
  };

  const handleTeamMemberChange = (idx: number, field: "name" | "scores", fieldValue: any) => {
    const updatedTeam = matrixData.data.team.map((t: any, i: number) =>
      i === idx ? { ...t, [field]: fieldValue } : t
    );
    handleMatrixDataChange({ team: updatedTeam });
  };

  const handleScoreChange = (teamIdx: number, scoreIdx: number, score: number) => {
    const updatedScores = matrixData.data.team[teamIdx].scores.map((s: number, i: number) =>
      i === scoreIdx ? score : s
    );
    handleTeamMemberChange(teamIdx, "scores", updatedScores);
  };

  const handleAddSkill = () => {
    const newSkills = [...matrixData.data.skills, "New Skill"];
    const newTeam = matrixData.data.team.map((t: any) => ({ ...t, scores: [...t.scores, 0] }));
    handleMatrixDataChange({ skills: newSkills, team: newTeam });
  };

  const handleRemoveSkill = (idx: number) => {
    const newSkills = matrixData.data.skills.filter((_: any, i: number) => i !== idx);
    const newTeam = matrixData.data.team.map((t: any) => ({ ...t, scores: t.scores.filter((_: any, i: number) => i !== idx) }));
    handleMatrixDataChange({ skills: newSkills, team: newTeam });
  };

  const handleAddTeamMember = () => {
    const newMember = { name: "New Member", scores: Array(matrixData.data.skills.length).fill(0) };
    handleMatrixDataChange({ team: [...matrixData.data.team, newMember] });
  };

  const handleRemoveTeamMember = (idx: number) => {
    const newTeam = matrixData.data.team.filter((_: any, i: number) => i !== idx);
    handleMatrixDataChange({ team: newTeam });
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold mb-2">Skill Matrix</div>
      <Label>
        Title
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. Team Skills"
        />
      </Label>
      <div className="space-y-2">
        <Label>Skills</Label>
        {matrixData.data.skills.map((skill: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={skill}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSkillChange(idx, e.target.value)}
            />
            <Button variant="danger" size="sm" onClick={() => handleRemoveSkill(idx)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={handleAddSkill}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Team Members</Label>
        {matrixData.data.team.map((member: any, teamIdx: number) => (
          <div key={teamIdx} className="space-y-2 p-2 border rounded">
            <div className="flex items-center gap-2">
              <Input
                value={member.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTeamMemberChange(teamIdx, "name", e.target.value)}
                placeholder="Team Member Name"
              />
              <Button variant="danger" size="sm" onClick={() => handleRemoveTeamMember(teamIdx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {matrixData.data.skills.map((skill: string, skillIdx: number) => (
                <div key={skillIdx}>
                  <Label>{skill}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={member.scores[skillIdx]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(teamIdx, skillIdx, parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={handleAddTeamMember}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>
    </div>
  );
};
