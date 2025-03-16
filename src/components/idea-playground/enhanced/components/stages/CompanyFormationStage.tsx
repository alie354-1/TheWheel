import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../../lib/types/idea-playground.types';

interface CompanyFormationStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  onExport?: (idea: IdeaPlaygroundIdea) => void;
}

const CompanyFormationStage: React.FC<CompanyFormationStageProps> = ({ onSave, onExport }) => {
  const { state, goToPreviousStage, completeCurrentStage } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  
  // Company formation data
  const [formationData, setFormationData] = useState({
    companyName: '',
    legalStructure: '',
    missionStatement: '',
    visionStatement: '',
    coreValues: [] as string[],
    foundingTeam: [] as {
      name: string;
      role: string;
      expertise: string;
    }[],
    fundingNeeds: '',
    intellectualProperty: '',
    regulatoryConsiderations: '',
    nextSteps: [] as string[],
  });
  
  // New item inputs
  const [newValue, setNewValue] = useState('');
  const [newStep, setNewStep] = useState('');
  
  // New team member form
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    expertise: '',
  });
  
  // Legal structure options
  const legalStructureOptions = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 'c_corporation', label: 'C Corporation' },
    { value: 's_corporation', label: 'S Corporation' },
    { value: 'b_corporation', label: 'B Corporation' },
    { value: 'nonprofit', label: 'Nonprofit' },
  ];
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormationData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new core value
  const handleAddValue = () => {
    if (!newValue.trim()) return;
    
    setFormationData(prev => ({
      ...prev,
      coreValues: [...prev.coreValues, newValue.trim()]
    }));
    
    setNewValue('');
  };
  
  // Remove core value
  const handleRemoveValue = (index: number) => {
    setFormationData(prev => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== index)
    }));
  };
  
  // Add new next step
  const handleAddStep = () => {
    if (!newStep.trim()) return;
    
    setFormationData(prev => ({
      ...prev,
      nextSteps: [...prev.nextSteps, newStep.trim()]
    }));
    
    setNewStep('');
  };
  
  // Remove next step
  const handleRemoveStep = (index: number) => {
    setFormationData(prev => ({
      ...prev,
      nextSteps: prev.nextSteps.filter((_, i) => i !== index)
    }));
  };
  
  // Handle team member form changes
  const handleTeamMemberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTeamMember(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new team member
  const handleAddTeamMember = () => {
    if (!newTeamMember.name.trim() || !newTeamMember.role.trim()) return;
    
    setFormationData(prev => ({
      ...prev,
      foundingTeam: [...prev.foundingTeam, { ...newTeamMember }]
    }));
    
    setNewTeamMember({
      name: '',
      role: '',
      expertise: '',
    });
  };
  
  // Remove team member
  const handleRemoveTeamMember = (index: number) => {
    setFormationData(prev => ({
      ...prev,
      foundingTeam: prev.foundingTeam.filter((_, i) => i !== index)
    }));
  };
  
  // Generate company name suggestion based on idea
  const generateCompanyNameSuggestion = () => {
    if (!idea) return;
    
    // This is a simple example - in a real app, you might use AI for this
    const words = idea.title.split(' ').filter(word => 
      !['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet', 'to', 'of', 'in', 'on', 'at', 'by'].includes(word.toLowerCase())
    );
    
    if (words.length >= 2) {
      // Combine first letters of two significant words
      const suggestion = words[0].substring(0, Math.min(3, words[0].length)) + 
                         words[1].substring(0, Math.min(3, words[1].length));
      
      setFormationData(prev => ({
        ...prev,
        companyName: suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
      }));
    } else if (words.length === 1) {
      // Use the one significant word with a suffix
      const suffixes = ['ify', 'ly', 'io', 'ify', 'able', 'ize'];
      const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const suggestion = words[0] + randomSuffix;
      
      setFormationData(prev => ({
        ...prev,
        companyName: suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || !idea) return;
    
    setIsLoading(true);
    try {
      // Save company formation data
      await onSave({
        // We could save specific fields if needed
        description: `${idea.description}\n\nCompany Name: ${formationData.companyName}\nLegal Structure: ${formationData.legalStructure}`
      });
      
      // Complete this stage
      await completeCurrentStage({
        completed_at: new Date().toISOString(),
        formation_data: formationData,
      });
      
      // Show success message or redirect
      alert('Congratulations! You have completed all stages of your idea development.');
    } catch (error) {
      console.error('Error saving company formation data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle export
  const handleExport = () => {
    if (!onExport || !idea) return;
    onExport(idea);
  };
  
  // List item component with delete button
  const ListItem = ({ 
    item, 
    onRemove 
  }: { 
    item: string, 
    onRemove: () => void 
  }) => (
    <li className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2">
      <span>{item}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
      >
        <span className="material-icons">delete</span>
      </button>
    </li>
  );
  
  // Add item input component
  const AddItemInput = ({ 
    value, 
    onChange, 
    onAdd, 
    placeholder 
  }: { 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onAdd: () => void, 
    placeholder: string 
  }) => (
    <div className="flex mb-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!value.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Company Formation Readiness</h1>
      
      <p className="text-gray-600 mb-6">
        Prepare for the formal establishment of your company by defining key elements
        such as company name, legal structure, mission, and founding team.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Company Name */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Company Name</h2>
            
            <div className="flex mb-4">
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formationData.companyName}
                onChange={handleInputChange}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your company name"
                required
              />
              <button
                type="button"
                onClick={generateCompanyNameSuggestion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
              >
                Suggest
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              Choose a name that reflects your brand identity and is available as a domain name.
            </p>
          </div>
          
          {/* Legal Structure */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Legal Structure</h2>
            
            <select
              id="legalStructure"
              name="legalStructure"
              value={formationData.legalStructure}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a legal structure</option>
              {legalStructureOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <p className="text-sm text-gray-500 mt-2">
              The legal structure affects taxation, liability, and fundraising capabilities.
            </p>
          </div>
          
          {/* Mission and Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission Statement */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Mission Statement</h2>
              
              <textarea
                id="missionStatement"
                name="missionStatement"
                value={formationData.missionStatement}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What is your company's purpose?"
                required
              />
              
              <p className="text-sm text-gray-500 mt-2">
                A clear statement of why your company exists and what it aims to accomplish.
              </p>
            </div>
            
            {/* Vision Statement */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Vision Statement</h2>
              
              <textarea
                id="visionStatement"
                name="visionStatement"
                value={formationData.visionStatement}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What future does your company aim to create?"
                required
              />
              
              <p className="text-sm text-gray-500 mt-2">
                A description of the future you're trying to create through your company.
              </p>
            </div>
          </div>
          
          {/* Core Values */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Core Values</h2>
            <p className="text-gray-600 mb-4">
              Define the principles that will guide your company's culture and decision-making.
            </p>
            
            <AddItemInput
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onAdd={handleAddValue}
              placeholder="Add a core value"
            />
            
            {formationData.coreValues.length > 0 ? (
              <ul className="space-y-2">
                {formationData.coreValues.map((value, index) => (
                  <ListItem
                    key={index}
                    item={value}
                    onRemove={() => handleRemoveValue(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No core values added yet.</p>
            )}
          </div>
          
          {/* Founding Team */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Founding Team</h2>
            <p className="text-gray-600 mb-4">
              Identify the key people who will help build your company.
            </p>
            
            <div className="bg-white p-4 rounded-md mb-4 border border-gray-200">
              <h3 className="font-medium mb-3">Add Team Member</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newTeamMember.name}
                    onChange={handleTeamMemberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="role">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={newTeamMember.role}
                    onChange={handleTeamMemberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CEO, CTO, CMO"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="expertise">
                    Expertise
                  </label>
                  <input
                    type="text"
                    id="expertise"
                    name="expertise"
                    value={newTeamMember.expertise}
                    onChange={handleTeamMemberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Marketing, Engineering"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddTeamMember}
                disabled={!newTeamMember.name.trim() || !newTeamMember.role.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Add Team Member
              </button>
            </div>
            
            {formationData.foundingTeam.length > 0 ? (
              <div className="space-y-3">
                {formationData.foundingTeam.map((member, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex-grow">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-gray-700">{member.role}</p>
                      {member.expertise && (
                        <p className="text-sm text-gray-600">Expertise: {member.expertise}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No team members added yet.</p>
            )}
          </div>
          
          {/* Additional Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Funding Needs */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Funding Needs</h2>
              
              <textarea
                id="fundingNeeds"
                name="fundingNeeds"
                value={formationData.fundingNeeds}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your initial funding requirements"
              />
            </div>
            
            {/* Intellectual Property */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Intellectual Property</h2>
              
              <textarea
                id="intellectualProperty"
                name="intellectualProperty"
                value={formationData.intellectualProperty}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any patents, trademarks, or other IP considerations"
              />
            </div>
            
            {/* Regulatory Considerations */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Regulatory Considerations</h2>
              
              <textarea
                id="regulatoryConsiderations"
                name="regulatoryConsiderations"
                value={formationData.regulatoryConsiderations}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any regulations or compliance requirements"
              />
            </div>
            
            {/* Next Steps */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
              
              <AddItemInput
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onAdd={handleAddStep}
                placeholder="Add a next step"
              />
              
              {formationData.nextSteps.length > 0 ? (
                <ul className="space-y-2">
                  {formationData.nextSteps.map((step, index) => (
                    <ListItem
                      key={index}
                      item={step}
                      onRemove={() => handleRemoveStep(index)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No next steps added yet.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStage}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md flex items-center"
          >
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </button>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md flex items-center"
            >
              <span className="material-icons mr-2">download</span>
              Export
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !formationData.companyName || !formationData.legalStructure || !formationData.missionStatement || !formationData.visionStatement}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-icons animate-spin mr-2">refresh</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">check_circle</span>
                  Complete
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyFormationStage;
