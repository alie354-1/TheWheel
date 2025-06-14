import React from 'react';
import ExpandableSection from '../ui/ExpandableSection';

export interface NextTask {
  id: string;
  text: string;
  done: boolean;
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  domain?: string;
  status?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
}

export interface ActiveStepCardProps {
  step: Step;
  progress: number;
  lastWorkedOn: string;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onContinue: (id: string) => void;
  nextTasks?: NextTask[];
  // Additional metadata for expanded view
  startDate?: string;
  dueDate?: string;
  timeSpent?: string;
  tools?: string[];
}

/**
 * ActiveStepCard - Card showing a step in progress with expandable details
 */
const ActiveStepCard: React.FC<ActiveStepCardProps> = ({
  step,
  progress,
  lastWorkedOn,
  expandable = false,
  expanded = false,
  onToggleExpand,
  onContinue,
  nextTasks = [],
  startDate,
  dueDate,
  timeSpent,
  tools = []
}) => {
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    }
  };
  
  const getTagColorClasses = (tag: string) => {
    const tagMap: Record<string, { bg: string, text: string }> = {
      Research: { bg: 'bg-blue-100', text: 'text-blue-800' },
      Validation: { bg: 'bg-purple-100', text: 'text-purple-800' },
      Product: { bg: 'bg-green-100', text: 'text-green-800' },
      Marketing: { bg: 'bg-amber-100', text: 'text-amber-800' },
      Finance: { bg: 'bg-red-100', text: 'text-red-800' },
      Legal: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    
    return tagMap[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3 flex-shrink-0">
            <i className="fas fa-tasks"></i>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
            
            {/* Tags */}
            {step.tags && step.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {step.tags.map((tag, index) => {
                  const { bg, text } = getTagColorClasses(tag);
                  return (
                    <span key={index} className={`inline-block px-2 py-0.5 text-xs rounded-full ${bg} ${text}`}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
            
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <i className="fas fa-clock mr-1"></i>
              Last worked on: {lastWorkedOn}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {expandable && (
            <button 
              className="text-gray-400 hover:text-indigo-600 mb-2"
              onClick={handleToggleExpand}
            >
              <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
            </button>
          )}
          <button 
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={() => onContinue(step.id)}
          >
            Continue
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Expandable content section */}
      {expandable && (
        <ExpandableSection expanded={expanded}>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              {startDate && (
                <div>
                  <span className="block text-gray-500">Started</span>
                  <span className="font-medium text-gray-700">{startDate}</span>
                </div>
              )}
              {dueDate && (
                <div>
                  <span className="block text-gray-500">Due</span>
                  <span className="font-medium text-gray-700">{dueDate}</span>
                </div>
              )}
              {timeSpent && (
                <div>
                  <span className="block text-gray-500">Time invested</span>
                  <span className="font-medium text-gray-700">{timeSpent}</span>
                </div>
              )}
            </div>
            
            {/* Next tasks */}
            {nextTasks.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Next Tasks</h4>
                <ul className="space-y-1">
                  {nextTasks.map(task => (
                    <li key={task.id} className="flex items-start text-sm">
                      <div className={`mt-0.5 mr-2 flex-shrink-0 h-4 w-4 rounded border ${task.done ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                        {task.done && <i className="fas fa-check text-xs text-green-500"></i>}
                      </div>
                      <span className={`text-xs ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Tools */}
            {tools.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Suggested Tools</h4>
                <div className="flex flex-wrap gap-1">
                  {tools.map((tool, index) => (
                    <span key={index} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ExpandableSection>
      )}
    </div>
  );
};

export default ActiveStepCard;
