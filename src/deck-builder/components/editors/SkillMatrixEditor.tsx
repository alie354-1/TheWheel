import React, { useState, useEffect } from 'react';
import { SkillMatrixData, SkillMatrixBlock } from '../../types/blocks';

interface SkillMatrixEditorProps {
  block: SkillMatrixBlock;
  onChange: (data: Partial<SkillMatrixBlock>) => void;
}

const SkillMatrixEditor: React.FC<SkillMatrixEditorProps> = ({ block, onChange }) => {
  const initialData = block.matrixData || { skills: [], team: [] };
  const [title, setTitle] = useState<string>(block.title || '');
  const [skills, setSkills] = useState<string[]>(initialData.skills);
  const [team, setTeam] = useState<SkillMatrixData['team']>(initialData.team);
  const [newSkill, setNewSkill] = useState<string>('');
  const [newTeamMemberName, setNewTeamMemberName] = useState<string>('');
  const [newTeamMemberRole, setNewTeamMemberRole] = useState<string>('');


  useEffect(() => {
    if (!skills.length && !team.length) {
      setSkills(['Sample Skill 1', 'Sample Skill 2']);
      setTeam([{ name: 'Team Member 1', role: 'Developer', scores: [3, 4] }]);
    }
  }, []);

  useEffect(() => {
    onChange({ matrixData: { skills, team }, title });
  }, [skills, team, title, onChange]);

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const addSkill = () => {
    if (newSkill.trim() === '') return;
    setSkills([...skills, newSkill.trim()]);
    // Add a default score for the new skill for all team members
    setTeam(team.map(member => ({ ...member, scores: [...member.scores, 0] })));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    // Remove scores for this skill from all team members
    setTeam(team.map(member => ({ ...member, scores: member.scores.filter((_, scoreIndex) => scoreIndex !== index) })));
  };

  const handleTeamMemberChange = (index: number, field: keyof SkillMatrixData['team'][0], value: string) => {
    const newTeam = [...team];
    (newTeam[index] as any)[field] = value;
    setTeam(newTeam);
  };
  
  const handleScoreChange = (teamMemberIndex: number, skillIndex: number, value: number) => {
    const newTeam = [...team];
    newTeam[teamMemberIndex].scores[skillIndex] = Math.max(0, Math.min(5, Number(value))); // Ensure score is between 0-5
    setTeam(newTeam);
  };

  const addTeamMember = () => {
    if (newTeamMemberName.trim() === '') return;
    setTeam([
      ...team,
      { name: newTeamMemberName.trim(), role: newTeamMemberRole.trim(), scores: Array(skills.length).fill(0) },
    ]);
    setNewTeamMemberName('');
    setNewTeamMemberRole('');
  };

  const removeTeamMember = (index: number) => {
    const newTeam = team.filter((_, i) => i !== index);
    setTeam(newTeam);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-md">
      <div>
        <label htmlFor="skillMatrixTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Matrix Title
        </label>
        <input
          type="text"
          id="skillMatrixTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Team Competencies"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Skills Management */}
      <div className="p-3 border border-gray-200 rounded-md bg-white">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Skills</h4>
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
              className="flex-grow p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
            />
            <button onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="New Skill Name"
            className="flex-grow p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
          />
          <button onClick={addSkill} className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Add Skill</button>
        </div>
      </div>

      {/* Team Management */}
      <div className="p-3 border border-gray-200 rounded-md bg-white">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Team Members</h4>
        {team.map((member, memberIndex) => (
          <div key={memberIndex} className="mb-3 p-2 border-b border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={member.name}
                placeholder="Member Name"
                onChange={(e) => handleTeamMemberChange(memberIndex, 'name', e.target.value)}
                className="flex-grow p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
              />
              <input
                type="text"
                value={member.role || ''}
                placeholder="Role (Optional)"
                onChange={(e) => handleTeamMemberChange(memberIndex, 'role', e.target.value)}
                className="flex-grow p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
              />
              <button onClick={() => removeTeamMember(memberIndex)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
            </div>
            <div className="space-y-1">
              {skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="flex items-center justify-between text-sm">
                  <label htmlFor={`score-${memberIndex}-${skillIndex}`} className="text-gray-600">{skill}:</label>
                  <input
                    type="number"
                    id={`score-${memberIndex}-${skillIndex}`}
                    value={member.scores[skillIndex] || 0}
                    onChange={(e) => handleScoreChange(memberIndex, skillIndex, parseInt(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded-md shadow-sm text-xs text-center"
                    min="0" max="5"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
          <input
            type="text"
            value={newTeamMemberName}
            onChange={(e) => setNewTeamMemberName(e.target.value)}
            placeholder="New Member Name"
            className="flex-grow p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
          />
           <input
            type="text"
            value={newTeamMemberRole}
            onChange={(e) => setNewTeamMemberRole(e.target.value)}
            placeholder="Role (Optional)"
            className="flex-grow p-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
          />
          <button onClick={addTeamMember} className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Add Member</button>
        </div>
      </div>

      {/* Preview (Simplified Heatmap-like Table) */}
      <div className="mt-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Preview (Skill Matrix)</h5>
        {skills.length > 0 && team.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="p-1.5 border-b border-r font-medium text-gray-600 bg-gray-50 text-left">Team Member</th>
                  {skills.map((skill, skillIndex) => (
                    <th key={skillIndex} className="p-1.5 border-b border-r font-medium text-gray-600 bg-gray-50 text-center">{skill}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {team.map((member, memberIndex) => (
                  <tr key={memberIndex} className="border-b">
                    <td className="p-1.5 border-r text-gray-700 font-medium">{member.name} {member.role && <span className="text-gray-500 text-xs">({member.role})</span>}</td>
                    {skills.map((_, skillIndex) => {
                      const score = member.scores[skillIndex] || 0;
                      let bgColor = 'bg-gray-100'; // Default for 0 or undefined
                      if (score === 1) bgColor = 'bg-red-200';
                      else if (score === 2) bgColor = 'bg-orange-200';
                      else if (score === 3) bgColor = 'bg-yellow-200';
                      else if (score === 4) bgColor = 'bg-lime-200';
                      else if (score === 5) bgColor = 'bg-green-300';
                      return (
                        <td key={skillIndex} className={`p-1.5 border-r text-center ${bgColor} text-gray-800`}>
                          {score}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-xs p-3 bg-gray-100 border rounded-md">Add skills and team members to see the matrix.</p>
        )}
      </div>
    </div>
  );
};

export default SkillMatrixEditor;
