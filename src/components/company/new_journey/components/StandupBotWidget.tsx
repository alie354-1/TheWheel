import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Minimize, Maximize } from 'lucide-react';
import { useStandupBotIntegration } from '../hooks/useStandupBotIntegration';
import { NewCompanyJourneyStep, NewStepTask } from '../../../../lib/types/new_journey.types';

interface StandupBotWidgetProps {
  companyId: string;
  journeyId: string;
  step: NewCompanyJourneyStep;
  tasks: NewStepTask[];
  onTasksCompleted: (taskIds: string[]) => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
}

const StandupBotWidget: React.FC<StandupBotWidgetProps> = ({
  companyId,
  journeyId,
  step,
  tasks,
  onTasksCompleted,
  isExpanded,
  onExpandToggle
}) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    sendMessage,
    isLoading,
    completedTaskIds
  } = useStandupBotIntegration({
    companyId,
    journeyId,
    stepId: step.id,
    taskIds: tasks.map(task => task.id)
  });

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Notify parent component when tasks are completed
  useEffect(() => {
    if (completedTaskIds.length > 0) {
      onTasksCompleted(completedTaskIds);
    }
  }, [completedTaskIds, onTasksCompleted]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendMessage(userInput);
      setUserInput('');
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={onExpandToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-indigo-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Standup Bot</span>
        </div>
        <Maximize className="h-4 w-4 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-indigo-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Standup Bot</h3>
        </div>
        <button onClick={onExpandToggle} className="text-gray-400 hover:text-gray-500">
          <Minimize className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-3/4 rounded-lg px-4 py-2 text-sm ${
                message.sender === 'bot'
                  ? 'bg-white text-gray-800 border border-gray-200'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3/4 rounded-lg px-4 py-2 text-sm bg-white text-gray-800 border border-gray-200">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your update here..."
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="bg-indigo-600 text-white rounded-r-md px-3 py-2 flex items-center justify-center disabled:bg-indigo-400"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default StandupBotWidget;
