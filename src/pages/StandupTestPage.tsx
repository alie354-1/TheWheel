import React, { useState } from 'react';
import { StandupEntry, StandupFeedback, StandupTask } from '../lib/services/standup-ai.service';
import { useStandupAIContext } from '../lib/services/ai/standup-context-provider';
import { useAuthStore } from '../lib/store';

/**
 * Test page for the standup AI service
 * This page allows testing the standup AI service with different feature flag settings
 * Uses the StandupAIContext provider for AI functionality
 */
const StandupTestPage: React.FC = () => {
  const { user, featureFlags, setFeatureFlags } = useAuthStore();
  const { generateSectionFeedback, generateTasks, isLoading } = useStandupAIContext();
  
  const [feedback, setFeedback] = useState<StandupFeedback | null>(null);
  const [tasks, setTasks] = useState<StandupTask[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [entry, setEntry] = useState<StandupEntry>({
    accomplished: 'Completed the user authentication flow and fixed several UI bugs.',
    working_on: 'Implementing the new dashboard features and improving performance.',
    blockers: 'Waiting for the design team to finalize the mockups.',
    goals: 'Complete the dashboard implementation by the end of the week.'
  });
  
  // Toggle feature flags
  const toggleFeatureFlag = (flag: string) => {
    if (featureFlags && featureFlags[flag]) {
      const newFlags = { ...featureFlags };
      newFlags[flag] = {
        ...newFlags[flag],
        enabled: !newFlags[flag].enabled
      };
      setFeatureFlags(newFlags);
    }
  };
  
  // Generate feedback for the accomplished section using the context
  const handleGenerateFeedback = async () => {
    if (!user) return;
    
    try {
      const result = await generateSectionFeedback(
        'accomplished',
        entry.accomplished,
        entry
      );
      
      setFeedback(result);
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  };
  
  // Generate tasks using the context
  const handleGenerateTasks = async () => {
    if (!user) return;
    setIsGeneratingTasks(true);
    
    try {
      const generatedTasks = await generateTasks(entry);
      setTasks(generatedTasks);
    } catch (error) {
      console.error('Error generating tasks:', error);
    } finally {
      setIsGeneratingTasks(false);
    }
  };
  
  // Update entry field
  const updateEntry = (field: keyof StandupEntry, value: string) => {
    setEntry(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Standup AI Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Feature Flags</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useRealAI"
              checked={featureFlags?.useRealAI?.enabled || false}
              onChange={() => toggleFeatureFlag('useRealAI')}
              className="mr-2"
            />
            <label htmlFor="useRealAI">Use Real AI</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useMockAI"
              checked={featureFlags?.useMockAI?.enabled || false}
              onChange={() => toggleFeatureFlag('useMockAI')}
              className="mr-2"
            />
            <label htmlFor="useMockAI">Use Mock AI</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useMultiTieredAI"
              checked={featureFlags?.multiTieredAI?.enabled || false}
              onChange={() => toggleFeatureFlag('multiTieredAI')}
              className="mr-2"
            />
            <label htmlFor="useMultiTieredAI">Use Multi-Tiered AI</label>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Standup Entry</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you accomplish?
            </label>
            <textarea
              value={entry.accomplished}
              onChange={(e) => updateEntry('accomplished', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What are you working on?
            </label>
            <textarea
              value={entry.working_on}
              onChange={(e) => updateEntry('working_on', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any blockers?
            </label>
            <textarea
              value={entry.blockers}
              onChange={(e) => updateEntry('blockers', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What are your goals?
            </label>
            <textarea
              value={entry.goals}
              onChange={(e) => updateEntry('goals', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleGenerateFeedback}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Generating...' : 'Generate Feedback'}
        </button>
        
        <button
          onClick={handleGenerateTasks}
          disabled={isGeneratingTasks || isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
        >
          {isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}
        </button>
      </div>
      
      {feedback && (
        <div className="bg-white p-4 border border-gray-300 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">AI Feedback</h2>
          <p className="mb-4">{feedback.content}</p>
          
          {feedback.follow_up_questions && feedback.follow_up_questions.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-2">Follow-up Questions:</h3>
              <ul className="list-disc pl-5">
                {feedback.follow_up_questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {tasks.length > 0 && (
        <div className="bg-white p-4 border border-gray-300 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Generated Tasks</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-semibold">{task.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{task.description}</p>
                <div className="mt-2 text-sm text-gray-500">Est. {task.estimated_hours} hour{task.estimated_hours !== 1 ? 's' : ''} • {task.task_type}</div>
                
                {task.implementation_tips && task.implementation_tips.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Implementation Tips:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {task.implementation_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {task.potential_challenges && task.potential_challenges.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Potential Challenges:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {task.potential_challenges.map((challenge, idx) => (
                        <li key={idx}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <pre className="text-xs overflow-auto p-2 bg-gray-800 text-white rounded">
          {JSON.stringify({ featureFlags }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default StandupTestPage;
