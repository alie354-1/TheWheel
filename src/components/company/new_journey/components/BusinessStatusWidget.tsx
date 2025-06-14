import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, CheckCircle, Activity, Clock, PauseCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompanyProgress } from '../hooks/useCompanyProgress';
import { BusinessStatusAIService } from '../../../../lib/services/ai/businessStatusAI.service';

// Types for our business status data
export interface AIInsight {
  type: 'observation' | 'suggestion' | 'alert';
  content: string;
}

export interface DomainActivity {
  domain: string;
  activityLevel: 'high' | 'medium' | 'low' | 'dormant';
  currentActivity: string;
  maturityLevel: 'exploring' | 'learning' | 'practicing' | 'refining' | 'teaching';
  aiInsights: AIInsight[];
}

export interface AIAnalysis {
  balanceAssessment: string;
  riskAlerts: string[];
  opportunities: string[];
  patternMatches: string[];
}

export interface UpcomingShift {
  timeframe: string;
  description: string;
  isPrediction: boolean;
}

export interface BusinessStatusData {
  activeDomains: DomainActivity[];
  backgroundDomains: DomainActivity[];
  aiAnalysis: AIAnalysis;
  upcomingShifts: UpcomingShift[];
}

// Mock data for initial implementation
const mockBusinessStatusData: BusinessStatusData = {
  activeDomains: [
    {
      domain: 'Customer Research',
      activityLevel: 'high',
      currentActivity: 'Daily activity, conducting interviews',
      maturityLevel: 'practicing',
      aiInsights: [
        { 
          type: 'observation', 
          content: 'Interview frequency increased 40% vs typical early-stage pattern' 
        },
        { 
          type: 'suggestion', 
          content: 'Consider systematizing feedback collection' 
        }
      ]
    },
    {
      domain: 'Product Development',
      activityLevel: 'high',
      currentActivity: 'Regular progress, building core features',
      maturityLevel: 'learning',
      aiInsights: [
        { 
          type: 'observation', 
          content: 'Development velocity matches 70th percentile for seed-stage startups' 
        },
        { 
          type: 'suggestion', 
          content: 'Architecture decisions upcoming - review technical debt patterns' 
        }
      ]
    },
    {
      domain: 'Marketing Strategy',
      activityLevel: 'medium',
      currentActivity: 'Recently started, exploring channels',
      maturityLevel: 'exploring',
      aiInsights: [
        { 
          type: 'observation', 
          content: 'Channel exploration timing aligns with successful PMF companies' 
        },
        { 
          type: 'suggestion', 
          content: 'A/B testing framework recommended based on similar company patterns' 
        }
      ]
    }
  ],
  backgroundDomains: [
    {
      domain: 'Operations',
      activityLevel: 'low',
      currentActivity: 'Running smoothly, weekly check-ins',
      maturityLevel: 'practicing',
      aiInsights: [
        { 
          type: 'observation', 
          content: 'Current operational load sustainable for next 8 weeks' 
        },
        { 
          type: 'alert', 
          content: 'Similar companies typically need operations focus at 25-employee mark' 
        }
      ]
    },
    {
      domain: 'Legal',
      activityLevel: 'low',
      currentActivity: 'Handled, quarterly reviews scheduled',
      maturityLevel: 'learning',
      aiInsights: [
        { 
          type: 'alert', 
          content: 'IP protection gaps detected based on product development activity' 
        },
        { 
          type: 'suggestion', 
          content: 'Patent review recommended within 90 days' 
        }
      ]
    },
    {
      domain: 'Fundraising',
      activityLevel: 'dormant',
      currentActivity: 'Paused, will restart when needed',
      maturityLevel: 'practicing',
      aiInsights: [
        { 
          type: 'observation', 
          content: 'Based on burn rate and milestones, funding runway until Q3 2025' 
        },
        { 
          type: 'observation', 
          content: '73% of similar companies start fundraising 6 months before runway end' 
        }
      ]
    }
  ],
  aiAnalysis: {
    balanceAssessment: 'Currently well-distributed across growth areas',
    riskAlerts: [
      'Operations may become bottleneck if customer research leads to rapid scaling'
    ],
    opportunities: [
      'Marketing timing optimal - competitors in your space average 3-month delay'
    ],
    patternMatches: [
      'Your focus sequence matches successful Series A companies 82% of time'
    ]
  },
  upcomingShifts: [
    {
      timeframe: 'Next 2 weeks',
      description: 'Marketing strategy moving from exploration to execution',
      isPrediction: false
    },
    {
      timeframe: 'Next month',
      description: 'Operations will need dedicated attention (hiring, systems)',
      isPrediction: true
    },
    {
      timeframe: 'Next quarter',
      description: 'Fundraising preparation recommended based on milestone trajectory',
      isPrediction: true
    },
    {
      timeframe: 'Ongoing trend',
      description: 'Customer research will naturally decrease as product validation increases',
      isPrediction: true
    }
  ]
};

// Helper function to get activity level colors
const getActivityLevelColor = (level: string): string => {
  switch (level) {
    case 'high':
      return 'text-blue-600';
    case 'medium':
      return 'text-green-600';
    case 'low':
      return 'text-gray-600';
    case 'dormant':
      return 'text-gray-400';
    default:
      return 'text-gray-600';
  }
};

// Helper function to get insight icon
const getInsightIcon = (type: string): JSX.Element => {
  switch (type) {
    case 'observation':
      return <Lightbulb className="h-3.5 w-3.5 text-blue-500" />;
    case 'suggestion':
      return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    case 'alert':
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return <Lightbulb className="h-3.5 w-3.5 text-blue-500" />;
  }
};

// Helper function to get activity level icon
const getActivityLevelIcon = (level: string): JSX.Element => {
  switch (level) {
    case 'high':
      return <Activity className="h-4 w-4 text-blue-600" />;
    case 'medium':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'low':
      return <Clock className="h-4 w-4 text-gray-600" />;
    case 'dormant':
      return <PauseCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <Activity className="h-4 w-4 text-blue-600" />;
  }
};

// Domain item component
const DomainItem: React.FC<{ domain: DomainActivity }> = ({ domain }) => {
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          {getActivityLevelIcon(domain.activityLevel)}
          <Link 
            to={`/company/new-journey/domain/${encodeURIComponent(domain.domain)}`} 
            className={`ml-2 font-medium ${getActivityLevelColor(domain.activityLevel)} hover:underline`}
          >
            {domain.domain}
          </Link>
        </div>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
          {domain.maturityLevel.charAt(0).toUpperCase() + domain.maturityLevel.slice(1)}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        {domain.currentActivity}
      </p>
      
      <div className="space-y-1">
        {domain.aiInsights.map((insight, idx) => (
          <div key={idx} className="flex items-start text-xs">
            <span className="mr-1.5 mt-0.5">
              {getInsightIcon(insight.type)}
            </span>
            <span className="text-gray-600">
              {insight.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Active Areas Section component
const ActiveAreasSection: React.FC<{ domains: DomainActivity[] }> = ({ domains }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <Activity className="h-4 w-4 text-indigo-500 mr-1.5" />
        Active Areas
      </h4>
      <div className="space-y-1">
        {domains.map((domain, idx) => (
          <DomainItem key={idx} domain={domain} />
        ))}
      </div>
    </div>
  );
};

// Background Operations Section component
const BackgroundOperationsSection: React.FC<{ domains: DomainActivity[] }> = ({ domains }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <Clock className="h-4 w-4 text-indigo-500 mr-1.5" />
        Background Operations
      </h4>
      <div className="space-y-1">
        {domains.map((domain, idx) => (
          <DomainItem key={idx} domain={domain} />
        ))}
      </div>
    </div>
  );
};

// AI Business Analysis Section component
const AIBusinessAnalysisSection: React.FC<{ analysis: AIAnalysis }> = ({ analysis }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <Lightbulb className="h-4 w-4 text-indigo-500 mr-1.5" />
        AI Business Analysis
      </h4>
      
      <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-700 mb-2">
        {analysis.balanceAssessment}
      </div>
      
      {analysis.riskAlerts.length > 0 && (
        <div className="mb-2">
          {analysis.riskAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-start text-xs mb-1 last:mb-0">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1.5 mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}
      
      {analysis.opportunities.length > 0 && (
        <div className="mb-2">
          {analysis.opportunities.map((opportunity, idx) => (
            <div key={idx} className="flex items-start text-xs mb-1 last:mb-0">
              <TrendingUp className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" />
              <span>{opportunity}</span>
            </div>
          ))}
        </div>
      )}
      
      {analysis.patternMatches.length > 0 && (
        <div>
          {analysis.patternMatches.map((pattern, idx) => (
            <div key={idx} className="flex items-start text-xs mb-1 last:mb-0">
              <CheckCircle className="h-3.5 w-3.5 text-blue-500 mr-1.5 mt-0.5" />
              <span>{pattern}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Upcoming Shifts Section component
const UpcomingShiftsSection: React.FC<{ shifts: UpcomingShift[] }> = ({ shifts }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <TrendingUp className="h-4 w-4 text-indigo-500 mr-1.5" />
        Upcoming Shifts
      </h4>
      
      <div className="space-y-2">
        {shifts.map((shift, idx) => (
          <div key={idx} className="flex items-baseline">
            <ChevronRight className="h-3 w-3 text-indigo-400 mr-1.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-indigo-600 mr-1">{shift.timeframe}:</span>
              <span className="text-xs text-gray-600">{shift.description}</span>
              {shift.isPrediction && (
                <span className="ml-1 text-xs italic text-gray-400">(AI prediction)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main BusinessStatusWidget component
const BusinessStatusWidget: React.FC<{ companyJourneyId?: string }> = ({ companyJourneyId = 'journey1' }) => {
  const [businessStatusData, setBusinessStatusData] = useState<BusinessStatusData>(mockBusinessStatusData);
  const [loading, setLoading] = useState(true);
  
  // Use the company progress hook for real maturity data
  const { progressData, engagementMetrics, formattedProgressData, loading: progressLoading } = useCompanyProgress(companyJourneyId);
  
  // Fetch AI analysis when component mounts
  useEffect(() => {
    const fetchBusinessStatus = async () => {
      try {
        setLoading(true);
        // Get AI insights and business status data
        const data = await BusinessStatusAIService.getBusinessStatusAnalysis(companyJourneyId);
        setBusinessStatusData(data);
      } catch (error) {
        console.error('Error fetching business status data:', error);
        // Fall back to mock data on error
        setBusinessStatusData(mockBusinessStatusData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessStatus();
  }, [companyJourneyId]);
  
  // Display loading state while data is being fetched
  if (loading || progressLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-indigo-500 mr-2" />
          Business Status
        </h3>
        
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center">
        <Activity className="h-5 w-5 text-indigo-500 mr-2" />
        Business Status
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Your startup journey is never complete. Continue to evolve and grow across all domains.
      </p>
      
      <div className="space-y-4">
        <ActiveAreasSection domains={businessStatusData.activeDomains} />
        <BackgroundOperationsSection domains={businessStatusData.backgroundDomains} />
        <AIBusinessAnalysisSection analysis={businessStatusData.aiAnalysis} />
        <UpcomingShiftsSection shifts={businessStatusData.upcomingShifts} />
      </div>
    </div>
  );
};

export default BusinessStatusWidget;
