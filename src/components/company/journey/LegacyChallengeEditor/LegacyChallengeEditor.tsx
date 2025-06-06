import React, { useState, useEffect } from 'react';
import { difficulty_level, JourneyChallenge } from '../../../../lib/types/journey-challenges.types';
import { JourneyChallengesService } from '../../../../lib/services/journeyChallenges.service';

interface ChallengeEditorProps {
  challengeId?: string; // If provided, we're editing an existing challenge
  phaseId?: string; // Default phase ID for new challenges
  onSave: (challenge: JourneyChallenge) => void;
  onCancel: () => void;
}

/**
 * ChallengeEditor component
 * 
 * Form for creating or editing journey challenges
 */
export const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
  challengeId,
  phaseId,
  onSave,
  onCancel
}) => {
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | undefined>(phaseId);
  const [difficultyLevel, setDifficultyLevel] = useState<difficulty_level>(3);
  const [estimatedTimeMin, setEstimatedTimeMin] = useState(30);
  const [estimatedTimeMax, setEstimatedTimeMax] = useState(60);
  const [keyOutcomes, setKeyOutcomes] = useState<string[]>(['']);
  const [orderIndex, setOrderIndex] = useState(0);
  
  // Load phases and challenge data if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load phases
        const phasesData = await JourneyChallengesService.getPhases();
        setPhases(phasesData);
        
        // If we have a challengeId, load the challenge data
        if (challengeId) {
          const challengeData = await JourneyChallengesService.getChallenge(challengeId);
          
          // Populate form with challenge data
          setName(challengeData.name);
          setDescription(challengeData.description || '');
          setSelectedPhaseId(challengeData.phase_id);
          setDifficultyLevel(challengeData.difficulty_level);
          setEstimatedTimeMin(challengeData.estimated_time_min);
          setEstimatedTimeMax(challengeData.estimated_time_max);
          setKeyOutcomes(challengeData.key_outcomes || ['']);
          setOrderIndex(challengeData.order_index);
        } else {
          // For new challenges, find the max order_index for the selected phase
          if (selectedPhaseId && phasesData.length > 0) {
            const challenges = await JourneyChallengesService.getChallenges(selectedPhaseId);
            const maxOrderIndex = challenges.reduce((max, challenge) => 
              Math.max(max, challenge.order_index || 0), 0);
            setOrderIndex(maxOrderIndex + 10); // Add some space for ordering
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    
    loadData();
  }, [challengeId, phaseId, selectedPhaseId]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setError('Challenge name is required');
      return;
    }
    
    if (!selectedPhaseId) {
      setError('Phase selection is required');
      return;
    }
    
    // Filter empty key outcomes
    const filteredKeyOutcomes = keyOutcomes.filter(outcome => outcome.trim() !== '');
    
    try {
      setSaving(true);
      
      const challengeData: Partial<JourneyChallenge> = {
        name,
        description: description.trim() || undefined,
        phase_id: selectedPhaseId,
        difficulty_level: difficultyLevel,
        estimated_time_min: estimatedTimeMin,
        estimated_time_max: estimatedTimeMax,
        key_outcomes: filteredKeyOutcomes.length > 0 ? filteredKeyOutcomes : undefined,
        order_index: orderIndex
      };
      
      let savedChallenge;
      
      if (challengeId) {
        // Update existing challenge
        savedChallenge = await JourneyChallengesService.updateChallenge(challengeId, challengeData);
      } else {
        // Create new challenge
        savedChallenge = await JourneyChallengesService.createChallenge(challengeData);
      }
      
      setSaving(false);
      onSave(savedChallenge);
    } catch (err: any) {
      console.error('Error saving challenge:', err);
      setError(err.message || 'Failed to save challenge');
      setSaving(false);
    }
  };
  
  // Handle key outcomes changes
  const handleKeyOutcomeChange = (index: number, value: string) => {
    const updatedOutcomes = [...keyOutcomes];
    updatedOutcomes[index] = value;
    setKeyOutcomes(updatedOutcomes);
  };
  
  const addKeyOutcome = () => {
    setKeyOutcomes([...keyOutcomes, '']);
  };
  
  const removeKeyOutcome = (index: number) => {
    if (keyOutcomes.length <= 1) return;
    
    const updatedOutcomes = [...keyOutcomes];
    updatedOutcomes.splice(index, 1);
    setKeyOutcomes(updatedOutcomes);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {challengeId ? 'Edit Challenge' : 'Create New Challenge'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Basic challenge details */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Name *
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="phase" className="block text-sm font-medium text-gray-700 mb-1">
              Phase *
            </label>
            <select
              id="phase"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={selectedPhaseId || ''}
              onChange={(e) => setSelectedPhaseId(e.target.value)}
              required
            >
              <option value="">Select a phase</option>
              {phases.map(phase => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(Number(e.target.value) as difficulty_level)}
              >
                <option value={1}>1 - Easy</option>
                <option value={2}>2 - Moderate</option>
                <option value={3}>3 - Standard</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="min-time" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Time (minutes)
              </label>
              <input
                type="number"
                id="min-time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={estimatedTimeMin}
                onChange={(e) => setEstimatedTimeMin(Number(e.target.value))}
                min={0}
              />
            </div>
            
            <div>
              <label htmlFor="max-time" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Time (minutes)
              </label>
              <input
                type="number"
                id="max-time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={estimatedTimeMax}
                onChange={(e) => setEstimatedTimeMax(Number(e.target.value))}
                min={estimatedTimeMin}
              />
            </div>
          </div>
        </div>
        
        {/* Key outcomes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Outcomes
          </label>
          
          <div className="space-y-2">
            {keyOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  value={outcome}
                  onChange={(e) => handleKeyOutcomeChange(index, e.target.value)}
                  placeholder="Enter an expected outcome"
                />
                
                <button
                  type="button"
                  onClick={() => removeKeyOutcome(index)}
                  className="p-2 text-gray-500 hover:text-red-500"
                  disabled={keyOutcomes.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addKeyOutcome}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add another outcome
          </button>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : (challengeId ? 'Update Challenge' : 'Create Challenge')}
          </button>
        </div>
      </form>
    </div>
  );
};
