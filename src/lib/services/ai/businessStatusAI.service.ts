import { 
  DomainActivity, 
  AIAnalysis, 
  UpcomingShift, 
  BusinessStatusData,
  AIInsight 
} from '../../../components/company/new_journey/components/BusinessStatusWidget';

/**
 * Service to provide AI analysis for business status
 * In a production environment, this would connect to a real AI service
 * For now, we provide mock data and analysis
 */
export class BusinessStatusAIService {
  /**
   * Get AI analysis for a company's business status
   * @param companyId Company ID
   * @param domainData Domain activity data
   * @returns Business status data with AI insights
   */
  static async getBusinessStatusAnalysis(companyId: string): Promise<BusinessStatusData> {
    // In a real implementation, this would make API calls to AI services
    
    // For demo purposes, return mock data
    return {
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
  }

  /**
   * Generate analysis of domain balance
   * @param domains List of domains and their activity levels
   * @returns Balance assessment text
   */
  static analyzeDomainBalance(domains: { domain: string, activityLevel: string }[]): string {
    // In a real implementation, this would use ML to analyze domain balance
    const highActivityCount = domains.filter(d => d.activityLevel === 'high').length;
    const totalDomains = domains.length;
    
    if (highActivityCount === 0) {
      return 'No high-activity domains detected. Consider increasing focus in key areas.';
    } else if (highActivityCount === 1) {
      return 'Single domain focus detected. This may be appropriate for your current stage.';
    } else if (highActivityCount > 3) {
      return 'Multiple high-activity domains detected. Consider prioritizing to avoid burnout.';
    } else {
      return 'Currently well-distributed across growth areas.';
    }
  }

  /**
   * Identify potential risks based on domain activities
   * @param domains List of domains and their activity levels
   * @returns List of risk alerts
   */
  static identifyRisks(domains: DomainActivity[]): string[] {
    // In a real implementation, this would use ML to identify risks
    const risks: string[] = [];
    
    // Example simple heuristics
    const operations = domains.find(d => d.domain === 'Operations');
    const customerResearch = domains.find(d => d.domain === 'Customer Research');
    
    if (operations && operations.activityLevel === 'low' && 
        customerResearch && customerResearch.activityLevel === 'high') {
      risks.push('Operations may become bottleneck if customer research leads to rapid scaling');
    }
    
    const legal = domains.find(d => d.domain === 'Legal');
    const productDev = domains.find(d => d.domain === 'Product Development');
    
    if (legal && legal.activityLevel === 'low' && 
        productDev && productDev.activityLevel === 'high') {
      risks.push('Legal considerations may need attention as product development accelerates');
    }
    
    return risks;
  }
}

// Re-export types for convenience
export type { DomainActivity, AIAnalysis, UpcomingShift, BusinessStatusData };
