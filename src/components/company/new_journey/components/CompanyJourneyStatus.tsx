import React from 'react';
import { TrendingUp, ChevronRight, CheckCircle, Clock, Zap } from 'lucide-react';
import { MaturityLevel, CurrentState } from '../../../../lib/types/new_journey.types';

interface MaturityStats {
  domain: string;
  level: MaturityLevel;
  state: CurrentState;
  timeInvested: number;
  primaryActivity?: string;
}

interface CompanyJourneyStatusProps {
  stats: MaturityStats[];
  totalTimeInvested: number;
  activeFocusDomains: number;
  nextMilestone?: string;
  currentFocus?: string;
}

/**
 * Component that displays the company's journey status using maturity levels
 * Demonstrates the principle that "the startup journey is never complete"
 */
const CompanyJourneyStatus: React.FC<CompanyJourneyStatusProps> = ({
  stats,
  totalTimeInvested,
  activeFocusDomains,
  nextMilestone = "Product Validation",
  currentFocus = "Customer Research"
}) => {
  // Map maturity levels to readable labels and colors
  const getMaturityLabel = (level: MaturityLevel) => {
    switch (level) {
      case 'exploring': return { text: 'Exploring', color: 'text-gray-500' };
      case 'learning': return { text: 'Learning', color: 'text-purple-600' };
      case 'practicing': return { text: 'Practicing', color: 'text-green-600' };
      case 'refining': return { text: 'Refining', color: 'text-blue-600' };
      case 'teaching': return { text: 'Teaching', color: 'text-amber-600' };
      default: return { text: 'Exploring', color: 'text-gray-500' };
    }
  };

  // Map state to icon and text
  const getStateInfo = (state: CurrentState) => {
    switch (state) {
      case 'active_focus': return { icon: <Zap size={14} className="text-amber-500" />, text: 'Active Focus' };
      case 'maintaining': return { icon: <CheckCircle size={14} className="text-green-500" />, text: 'Maintaining' };
      case 'future_focus': return { icon: <ChevronRight size={14} className="text-blue-500" />, text: 'Future Focus' };
      case 'dormant': return { icon: <Clock size={14} className="text-gray-500" />, text: 'Dormant' };
      default: return { icon: <Clock size={14} className="text-gray-500" />, text: 'Not Started' };
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
      <h3 className="font-medium text-gray-800 mb-3">Journey Status</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your startup journey is never complete. Continue to evolve and grow across all domains.
      </p>
      
      <div className="space-y-4">
        {/* Domain Maturity & Engagement */}
        <div className="border-b border-gray-100 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Domain Maturity & Engagement</h4>
          <div className="space-y-2">
            {stats.map((domain, index) => {
              const maturity = getMaturityLabel(domain.level);
              const state = getStateInfo(domain.state);
              
              return (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{domain.domain}:</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${maturity.color}`}>
                      {maturity.text}
                    </span>
                    <span className="text-xs text-gray-400 mx-1">•</span>
                    <span className="flex items-center text-xs text-gray-500 gap-1">
                      {state.icon} {state.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Current Focus */}
        <div className="border-b border-gray-100 pb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Focus</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Focus Areas:</span>
              <span className="font-medium">{activeFocusDomains} domains</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Primary Focus:</span>
              <span className="font-medium text-indigo-600">{currentFocus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Next Milestone:</span>
              <span className="font-medium text-green-600">{nextMilestone}</span>
            </div>
          </div>
        </div>
        
        {/* Time Investment */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Time Investment</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">This Month:</span>
              <span className="font-medium">47 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="font-medium">{totalTimeInvested} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyJourneyStatus;
