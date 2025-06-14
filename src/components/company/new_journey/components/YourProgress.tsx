import React from 'react';
import { TrendingUp, Zap, Clock, Users } from 'lucide-react';

interface DomainMaturityItem {
  domain: string;
  domainColor?: string;
  maturityLevel: 'exploring' | 'learning' | 'practicing' | 'refining' | 'teaching';
  currentState: 'active_focus' | 'maintaining' | 'future_focus' | 'dormant';
  stepsEngaged: number;
  timeInvested: number;
  teamInvolvement?: 'solo' | 'collaborative' | 'delegated';
}

interface YourProgressProps {
  progressData: DomainMaturityItem[];
}

/**
 * Component that displays the user's journey progress across different domains
 * Shows maturity levels instead of completion percentages
 * Reflects the philosophy that "the startup journey is never complete"
 */
const YourProgress: React.FC<YourProgressProps> = ({ progressData }) => {
  // Map maturity levels to readable labels and colors
  const getMaturityInfo = (level: string) => {
    switch (level) {
      case 'exploring':
        return { label: 'Exploring', colorClass: 'bg-gray-400', steps: 1 };
      case 'learning':
        return { label: 'Learning', colorClass: 'bg-amber-500', steps: 2 };
      case 'practicing':
        return { label: 'Practicing', colorClass: 'bg-blue-500', steps: 3 };
      case 'refining':
        return { label: 'Refining', colorClass: 'bg-green-500', steps: 4 };
      case 'teaching':
        return { label: 'Teaching', colorClass: 'bg-purple-500', steps: 5 };
      default:
        return { label: 'Exploring', colorClass: 'bg-gray-400', steps: 1 };
    }
  };

  // Get state label and icon
  const getStateInfo = (state: string) => {
    switch (state) {
      case 'active_focus':
        return { label: 'Active Focus', icon: <Zap className="h-3 w-3 text-amber-500" /> };
      case 'maintaining':
        return { label: 'Maintaining', icon: <Clock className="h-3 w-3 text-blue-500" /> };
      case 'future_focus':
        return { label: 'Future Focus', icon: <TrendingUp className="h-3 w-3 text-gray-500" /> };
      case 'dormant':
        return { label: 'Dormant', icon: <Clock className="h-3 w-3 text-gray-400" /> };
      default:
        return { label: 'Not Started', icon: <TrendingUp className="h-3 w-3 text-gray-400" /> };
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Your Journey</h2>
      </div>
      
      <div className="space-y-5">
        {progressData.map((item, index) => {
          const maturity = getMaturityInfo(item.maturityLevel);
          const state = getStateInfo(item.currentState);
          
          return (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800">{item.domain}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                  {state.icon} {state.label}
                </span>
              </div>
              
              {/* Maturity level indicator - 5 steps representing levels */}
              <div className="w-full flex mb-2 mt-2 gap-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div 
                    key={step} 
                    className={`h-2 flex-1 rounded-sm ${step <= maturity.steps ? maturity.colorClass : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> 
                  {item.stepsEngaged} steps engaged
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 
                  {item.timeInvested} days invested
                </span>
                {item.teamInvolvement && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> 
                    {item.teamInvolvement}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 italic">
          Your startup journey is never complete. Continue to evolve and grow across all domains.
        </div>
      </div>
    </div>
  );
};

export default YourProgress;
