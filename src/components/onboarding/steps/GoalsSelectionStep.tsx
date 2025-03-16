import React, { useState } from 'react';

interface GoalsSelectionStepProps {
  onSelect: (goals: string[]) => void;
  onSkip?: () => void;
}

const GoalsSelectionStep: React.FC<GoalsSelectionStepProps> = ({ onSelect, onSkip }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  const goals = [
    {
      id: 'networking',
      title: 'Networking',
      description: 'Connect with other professionals and businesses'
    },
    {
      id: 'fundraising',
      title: 'Fundraising',
      description: 'Find investors and funding opportunities'
    },
    {
      id: 'learning',
      title: 'Learning',
      description: 'Access educational resources and training'
    },
    {
      id: 'team_building',
      title: 'Team Building',
      description: 'Find and recruit team members'
    },
    {
      id: 'market_research',
      title: 'Market Research',
      description: 'Research markets and validate ideas'
    },
    {
      id: 'scaling',
      title: 'Scaling',
      description: 'Grow and expand your business'
    },
    {
      id: 'compliance',
      title: 'Compliance',
      description: 'Navigate legal and regulatory requirements'
    },
    {
      id: 'mentorship',
      title: 'Mentorship',
      description: 'Find mentors or become a mentor'
    }
  ];

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onSelect(selectedGoals);
    } else {
      alert('Please select at least one goal');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">What are your goals?</h2>
      <p className="mb-6 text-gray-600">
        Select all that apply. We'll recommend features that help you achieve these goals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {goals.map(goal => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 border rounded-lg cursor-pointer transition ${
              selectedGoals.includes(goal.id)
                ? 'bg-indigo-100 border-indigo-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedGoals.includes(goal.id)}
                onChange={() => toggleGoal(goal.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-3"
              />
              <div>
                <div className="font-semibold">{goal.title}</div>
                <div className="text-sm text-gray-600">{goal.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        {onSkip && (
          <button 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition ml-auto"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default GoalsSelectionStep;
