import { 
  AIServiceContext, 
  AIServiceInterface,
  BusinessModelParams,
  BusinessModelResponse,
  GoToMarketParams,
  GoToMarketResponse,
  IdeaEnhancementParams,
  IdeaEnhancementResponse,
  IdeaResponse,
  IdeaRefinementResponse,
  IdeaValidationParams,
  MarketAnalysisParams,
  MarketAnalysisResponse,
  MilestoneParams,
  MilestoneResponse,
  ValidationResponse
} from './ai-service.interface';
import { 
  IdeaGenerationParams, 
  IdeaPlaygroundIdea, 
  IdeaRefinementParams 
} from '../../../../lib/types/idea-playground.types';

/**
 * Mock AI Service
 * This class provides mock implementations of the AI service methods
 * for development and testing purposes.
 */
export class MockAIService implements AIServiceInterface {
  /**
   * Generate ideas based on the provided parameters
   * @param params The idea generation parameters
   * @param context The AI service context
   * @returns A promise that resolves to an array of idea responses
   */
  async generateIdeas(
    params: IdeaGenerationParams,
    context: AIServiceContext
  ): Promise<IdeaResponse[]> {
    // Simulate API delay
    await this.delay(1000);

    // Generate 1-3 ideas based on the parameters
    const count = params.count || Math.floor(Math.random() * 3) + 1;
    const ideas: IdeaResponse[] = [];

    for (let i = 0; i < count; i++) {
      ideas.push(this.generateMockIdea(params));
    }

    return ideas;
  }

  /**
   * Refine an existing idea based on the provided parameters
   * @param idea The idea to refine
   * @param params The idea refinement parameters
   * @param context The AI service context
   * @returns A promise that resolves to an idea refinement response
   */
  async refineIdea(
    idea: IdeaPlaygroundIdea,
    params: IdeaRefinementParams,
    context: AIServiceContext
  ): Promise<IdeaRefinementResponse> {
    // Simulate API delay
    await this.delay(1500);

    // Create a refined version of the idea
    const refinedIdea: IdeaRefinementResponse = {};

    // Only refine the fields specified in the focus areas
    if (params.focus_areas.includes('problem')) {
      refinedIdea.problem_statement = this.enhanceText(idea.problem_statement);
    }

    if (params.focus_areas.includes('solution')) {
      refinedIdea.solution_concept = this.enhanceText(idea.solution_concept);
    }

    if (params.focus_areas.includes('market')) {
      refinedIdea.target_audience = this.enhanceText(idea.target_audience);
      refinedIdea.market_size = this.enhanceText(idea.market_size);
    }

    if (params.focus_areas.includes('business_model')) {
      refinedIdea.business_model = this.enhanceText(idea.business_model);
      refinedIdea.revenue_model = this.enhanceText(idea.revenue_model);
    }

    if (params.focus_areas.includes('go_to_market')) {
      refinedIdea.go_to_market = this.enhanceText(idea.go_to_market);
      refinedIdea.marketing_strategy = this.enhanceText(idea.marketing_strategy);
    }

    return refinedIdea;
  }

  /**
   * Enhance an idea based on the provided parameters
   * @param params The idea enhancement parameters
   * @param context The AI service context
   * @returns A promise that resolves to an idea enhancement response
   */
  async enhanceIdea(
    params: IdeaEnhancementParams,
    context: AIServiceContext
  ): Promise<IdeaEnhancementResponse> {
    // Simulate API delay
    await this.delay(1200);

    // Create an enhanced version of the idea
    return {
      title: params.title,
      description: this.enhanceText(params.description),
      problemStatement: `The ${params.industry || 'industry'} faces significant challenges with ${params.problemArea || 'various issues'}, particularly affecting ${params.targetAudience || 'users'}. Current solutions are inadequate because they lack innovation, scalability, and user-centric design.`,
      solutionConcept: `Our solution leverages ${params.technologyFocus || 'technology'} to create a platform that addresses these challenges through an intuitive interface, powerful backend systems, and seamless integration with existing workflows.`,
      targetAudience: params.targetAudience ? this.enhanceText(params.targetAudience) : 'Businesses and individuals who need a better solution for their problems.',
      uniqueValue: `Unlike competitors, our solution offers unique advantages in terms of usability, performance, and cost-effectiveness. We differentiate through ${params.innovationLevel || 'incremental'} innovation and deep understanding of user needs.`,
      businessModel: 'Our business model combines subscription-based pricing with premium features, creating a sustainable revenue stream while providing value at multiple price points.',
      marketingStrategy: 'We will employ a multi-channel marketing approach focusing on content marketing, social media engagement, and strategic partnerships to build brand awareness and drive user acquisition.',
      revenueModel: 'Revenue will be generated through tiered subscription plans, enterprise licensing, and value-added services that enhance the core offering.',
      goToMarket: 'Our go-to-market strategy involves a phased rollout, starting with early adopters and expanding to broader market segments as we refine our product based on user feedback.',
      marketSize: 'The total addressable market is estimated at $500M-$1B annually, with a serviceable obtainable market of approximately $100M in the first three years.',
    };
  }

  /**
   * Analyze the market for an idea
   * @param idea The idea to analyze
   * @param params The market analysis parameters
   * @param context The AI service context
   * @returns A promise that resolves to a market analysis response
   */
  async analyzeMarket(
    idea: IdeaPlaygroundIdea,
    params: MarketAnalysisParams,
    context: AIServiceContext
  ): Promise<MarketAnalysisResponse> {
    // Simulate API delay
    await this.delay(2000);

    // Generate mock market analysis
    return {
      market_size: `The ${params.industry || 'industry'} market is estimated at $500M-$1B annually, with a projected CAGR of 15-20% over the next five years.`,
      target_segments: [
        {
          name: 'Enterprise Customers',
          description: 'Large organizations with complex needs and substantial budgets',
          size: '$300M annually',
          growth_rate: '12% annually',
          pain_points: [
            'Integration with legacy systems',
            'Compliance and security concerns',
            'Scalability challenges'
          ]
        },
        {
          name: 'SMB Segment',
          description: 'Small and medium-sized businesses seeking cost-effective solutions',
          size: '$150M annually',
          growth_rate: '18% annually',
          pain_points: [
            'Limited technical resources',
            'Budget constraints',
            'Need for quick implementation'
          ]
        },
        {
          name: 'Startups and Innovators',
          description: 'Early-stage companies and innovation-focused teams',
          size: '$50M annually',
          growth_rate: '25% annually',
          pain_points: [
            'Rapid scaling requirements',
            'Limited capital',
            'Need for competitive differentiation'
          ]
        }
      ],
      competitors: [
        {
          name: 'Established Leader Inc.',
          description: 'Market incumbent with comprehensive but legacy solutions',
          strengths: [
            'Brand recognition',
            'Large customer base',
            'Extensive feature set'
          ],
          weaknesses: [
            'Outdated technology',
            'High pricing',
            'Slow innovation cycle'
          ],
          market_share: '35%'
        },
        {
          name: 'Innovative Disruptor',
          description: 'Recent entrant with cutting-edge technology',
          strengths: [
            'Modern technology stack',
            'User-friendly interface',
            'Aggressive pricing'
          ],
          weaknesses: [
            'Limited market presence',
            'Incomplete feature set',
            'Unproven scalability'
          ],
          market_share: '15%'
        },
        {
          name: 'Value Provider Co.',
          description: 'Mid-market solution focused on affordability',
          strengths: [
            'Competitive pricing',
            'Solid core features',
            'Strong customer support'
          ],
          weaknesses: [
            'Limited advanced capabilities',
            'Generic offering',
            'Minimal innovation'
          ],
          market_share: '20%'
        }
      ],
      trends: [
        'Increasing demand for AI-powered solutions',
        'Shift toward cloud-based deployment',
        'Growing emphasis on user experience and design',
        'Rising importance of data security and privacy',
        'Integration with existing ecosystems becoming critical'
      ],
      opportunities: [
        'Underserved mid-market segment seeking advanced features at reasonable prices',
        'Growing demand for specialized solutions in specific verticals',
        'Increasing willingness to switch from legacy providers',
        'Emerging markets with limited competitive presence',
        'Partnership potential with complementary solution providers'
      ],
      threats: [
        'Rapid technological change requiring continuous innovation',
        'Potential entry of major tech platforms into the space',
        'Price pressure from low-cost alternatives',
        'Evolving regulatory landscape',
        'Economic uncertainty affecting customer budgets'
      ],
      recommendations: [
        'Focus on differentiation through unique features addressing specific pain points',
        'Develop a tiered pricing strategy to capture different market segments',
        'Prioritize user experience and intuitive design as competitive advantages',
        'Build strategic partnerships to accelerate market entry and expansion',
        'Invest in continuous innovation to stay ahead of market trends'
      ]
    };
  }

  /**
   * Generate a business model for an idea
   * @param idea The idea to generate a business model for
   * @param params The business model parameters
   * @param context The AI service context
   * @returns A promise that resolves to a business model response
   */
  async generateBusinessModel(
    idea: IdeaPlaygroundIdea,
    params: BusinessModelParams,
    context: AIServiceContext
  ): Promise<BusinessModelResponse> {
    // Simulate API delay
    await this.delay(1800);

    // Generate mock business model
    return {
      revenue_streams: [
        'Subscription-based SaaS model with tiered pricing',
        'Enterprise licensing for large organizations',
        'Implementation and customization services',
        'Premium support packages',
        'API access and integration fees'
      ],
      cost_structure: [
        'Product development and engineering (35%)',
        'Sales and marketing (30%)',
        'Customer support and success (15%)',
        'General and administrative (10%)',
        'Infrastructure and operations (10%)'
      ],
      key_resources: [
        'Technical talent and engineering team',
        'Intellectual property and proprietary algorithms',
        'Cloud infrastructure and hosting',
        'Customer data and insights',
        'Brand and reputation'
      ],
      key_activities: [
        'Product development and innovation',
        'Customer acquisition and marketing',
        'Customer success and support',
        'Platform maintenance and scaling',
        'Market research and competitive analysis'
      ],
      key_partners: [
        'Technology infrastructure providers',
        'Integration partners and complementary solutions',
        'Industry associations and thought leaders',
        'Resellers and distribution channels',
        'Academic and research institutions'
      ],
      channels: [
        'Direct sales team for enterprise clients',
        'Self-service web platform for SMB segment',
        'Partner and reseller network',
        'Content marketing and inbound lead generation',
        'Industry events and conferences'
      ],
      customer_relationships: [
        'High-touch account management for enterprise clients',
        'Community-driven support for self-service users',
        'Automated onboarding and training resources',
        'Regular check-ins and success reviews',
        'User feedback loops and product councils'
      ],
      unit_economics: {
        cac: 1200,
        ltv: 7500,
        margin: 0.75,
        payback_period: 9
      },
      pricing_strategy: 'We recommend a value-based pricing strategy with tiered offerings that align with different customer segments. Entry-level pricing should be competitive to drive adoption, while premium tiers should capture additional value from enterprise features. Consider offering annual discounts to improve cash flow and reduce churn.',
      scalability_assessment: 'The business model shows strong scalability potential due to the SaaS delivery model and high gross margins. Key scaling challenges will include managing customer acquisition costs as you target larger enterprises and maintaining service quality during rapid growth phases. Infrastructure costs should scale sub-linearly with revenue due to economies of scale in cloud services.'
    };
  }

  /**
   * Create a go-to-market plan for an idea
   * @param idea The idea to create a go-to-market plan for
   * @param params The go-to-market parameters
   * @param context The AI service context
   * @returns A promise that resolves to a go-to-market response
   */
  async createGoToMarketPlan(
    idea: IdeaPlaygroundIdea,
    params: GoToMarketParams,
    context: AIServiceContext
  ): Promise<GoToMarketResponse> {
    // Simulate API delay
    await this.delay(2000);

    // Generate mock go-to-market plan
    return {
      launch_strategy: `Our launch strategy follows a phased approach targeting ${params.target_market} with a focus on early adopters who can provide valuable feedback. We'll start with a limited release to a select group of customers, gather feedback, refine the product, and then expand to broader market segments. This approach minimizes risk while maximizing learning opportunities.`,
      marketing_channels: [
        {
          channel: 'Content Marketing',
          approach: 'Develop thought leadership content addressing key pain points and industry challenges',
          expected_roi: 'High - 3-4x investment over 12 months',
          timeline: 'Start immediately, ongoing'
        },
        {
          channel: 'Social Media',
          approach: 'Build presence on LinkedIn and Twitter with targeted content and engagement',
          expected_roi: 'Medium - 2-3x investment over 12 months',
          timeline: 'Start immediately, ongoing'
        },
        {
          channel: 'Industry Events',
          approach: 'Participate in key conferences and trade shows with speaking opportunities',
          expected_roi: 'Medium - 1.5-2x investment',
          timeline: 'Q2-Q4'
        },
        {
          channel: 'Email Marketing',
          approach: 'Develop nurture campaigns for different segments and buyer journey stages',
          expected_roi: 'High - 4-5x investment',
          timeline: 'Start in month 2, ongoing'
        },
        {
          channel: 'Paid Advertising',
          approach: 'Targeted digital ads on industry platforms and search engines',
          expected_roi: 'Medium - 2x investment',
          timeline: 'Start in month 3, ongoing'
        }
      ],
      sales_strategy: 'Our sales strategy combines a consultative approach for enterprise clients with a streamlined self-service process for smaller customers. We\'ll employ a solution selling methodology focused on addressing specific pain points and demonstrating clear ROI. The sales team will be structured with industry-specific expertise to speak the language of our target customers and address their unique challenges.',
      partnerships: [
        'Technology integration partners',
        'Industry association endorsements',
        'Complementary solution providers',
        'Consulting firms and implementation partners',
        'Educational institutions for case studies'
      ],
      milestones: [
        {
          name: 'Beta Launch',
          description: 'Release to initial set of beta customers for feedback and validation',
          timeline: 'Month 1',
          success_criteria: 'Onboard 10 beta customers, collect feedback on core features'
        },
        {
          name: 'Official Product Launch',
          description: 'Public release with full feature set and marketing campaign',
          timeline: 'Month 3',
          success_criteria: 'Acquire 50 paying customers, achieve 80% satisfaction rating'
        },
        {
          name: 'Channel Partner Program',
          description: 'Establish formal program for resellers and implementation partners',
          timeline: 'Month 6',
          success_criteria: 'Sign 5 partners, generate 20% of new leads through partner channel'
        },
        {
          name: 'Enterprise Feature Release',
          description: 'Launch advanced features targeting enterprise customers',
          timeline: 'Month 9',
          success_criteria: 'Sign 3 enterprise customers, increase average deal size by 30%'
        },
        {
          name: 'International Expansion',
          description: 'Expand marketing and sales efforts to international markets',
          timeline: 'Month 12',
          success_criteria: 'Generate 15% of revenue from international customers'
        }
      ],
      kpis: [
        'Customer Acquisition Cost (CAC)',
        'Monthly Recurring Revenue (MRR)',
        'Customer Lifetime Value (LTV)',
        'Conversion Rate by Stage',
        'Churn Rate',
        'Net Promoter Score (NPS)',
        'Feature Adoption Rate',
        'Sales Cycle Length'
      ],
      budget_allocation: {
        'Product Development': '35%',
        'Marketing': '25%',
        'Sales': '20%',
        'Customer Success': '15%',
        'Operations': '5%'
      }
    };
  }

  /**
   * Validate an idea with experiments
   * @param idea The idea to validate
   * @param params The idea validation parameters
   * @param context The AI service context
   * @returns A promise that resolves to a validation response
   */
  async validateIdea(
    idea: IdeaPlaygroundIdea,
    params: IdeaValidationParams,
    context: AIServiceContext
  ): Promise<ValidationResponse> {
    // Simulate API delay
    await this.delay(1500);

    // Generate mock validation plan based on the selected method
    let validationPlan = '';
    let experimentDesign = '';
    let successCriteria = '';
    let expectedOutcomes = '';
    const keyHypotheses = [...(params.custom_hypotheses || [])];
    const potentialPivots = [];
    const resourcesNeeded = [];

    switch (params.validation_method) {
      case 'customer_interviews':
        validationPlan = `Conduct in-depth interviews with 15-20 potential customers from the target audience to validate key assumptions about the problem, solution, and willingness to pay. Focus on understanding their current workflows, pain points, and reactions to the proposed solution.`;
        experimentDesign = `1. Identify and recruit interview participants from the target audience\n2. Develop a structured interview script with open-ended questions\n3. Conduct 30-45 minute interviews, recording with permission\n4. Analyze responses for patterns and insights\n5. Document findings and implications`;
        successCriteria = `At least 70% of interviewees confirm the problem is significant and current solutions are inadequate. At least 50% express interest in the proposed solution and willingness to try it.`;
        expectedOutcomes = `Deeper understanding of customer needs, refined value proposition, and validated problem-solution fit. Potential discovery of additional use cases or features not initially considered.`;
        
        if (keyHypotheses.length === 0) {
          keyHypotheses.push(
            `Target customers experience significant pain with their current solutions`,
            `The proposed solution addresses key pain points better than alternatives`,
            `Customers are willing to switch from current solutions`,
            `The target audience has budget and authority to purchase`
          );
        }
        
        potentialPivots.push(
          `Shift to a different target audience if current segment doesn't show sufficient interest`,
          `Modify the solution based on specific feedback about missing features`,
          `Adjust pricing model if willingness to pay differs from assumptions`
        );
        
        resourcesNeeded.push(
          `Interview script and discussion guide`,
          `Participant recruitment budget ($50-100 per interview)`,
          `Recording and transcription tools`,
          `Analysis framework for qualitative data`
        );
        break;
        
      case 'surveys':
        validationPlan = `Deploy a quantitative survey to 200+ potential customers to validate market size, problem importance, and solution appeal. Use a mix of multiple-choice, rating scales, and open-ended questions to gather both quantitative and qualitative data.`;
        experimentDesign = `1. Design survey with clear, unbiased questions\n2. Test survey with small sample to refine questions\n3. Distribute through relevant channels (industry forums, social media, email lists)\n4. Collect responses over 2-3 weeks\n5. Analyze data and identify key insights`;
        successCriteria = `Minimum 100 completed surveys with >80% completion rate. Statistical significance in key metrics. Clear patterns in responses that validate or invalidate core hypotheses.`;
        expectedOutcomes = `Quantified market size and segmentation data. Prioritized feature list based on customer preferences. Validated willingness to pay and pricing sensitivity.`;
        
        if (keyHypotheses.length === 0) {
          keyHypotheses.push(
            `The target market size is sufficient to support a viable business`,
            `The problem affects a significant percentage of the target audience`,
            `Customers rate the problem as important enough to seek a new solution`,
            `The proposed solution features align with customer priorities`
          );
        }
        
        potentialPivots.push(
          `Refocus on specific market segments that show highest interest`,
          `Reprioritize features based on customer importance ratings`,
          `Adjust pricing strategy based on willingness to pay data`
        );
        
        resourcesNeeded.push(
          `Survey design and distribution platform`,
          `Incentives for survey completion ($500-1000 budget)`,
          `Data analysis tools`,
          `Marketing channels for survey distribution`
        );
        break;
        
      case 'prototype_testing':
        validationPlan = `Create a minimal viable prototype of the solution and conduct usability testing with 8-12 potential users. Observe their interactions, gather feedback, and measure key usability metrics to validate the solution concept and user experience.`;
        experimentDesign = `1. Develop clickable prototype or minimal functional version\n2. Create testing scenarios and tasks\n3. Recruit participants from target audience\n4. Conduct moderated testing sessions (in-person or remote)\n5. Collect qualitative feedback and quantitative metrics`;
        successCriteria = `Users can complete key tasks with minimal assistance. At least 70% of users express positive sentiment about the solution. Specific usability metrics (time on task, error rate) meet predefined targets.`;
        expectedOutcomes = `Validated user experience design. Identified usability issues and improvement opportunities. Refined understanding of user workflows and expectations.`;
        
        if (keyHypotheses.length === 0) {
          keyHypotheses.push(
            `Users can intuitively understand and navigate the solution`,
            `The solution effectively addresses the core user needs`,
            `Users find sufficient value to continue using the solution`,
            `The proposed workflow aligns with user expectations`
          );
        }
        
        potentialPivots.push(
          `Redesign user interface based on observed pain points`,
          `Simplify or expand feature set based on user feedback`,
          `Adjust target user persona based on who finds most value`
        );
        
        resourcesNeeded.push(
          `Prototyping tools or development resources`,
          `Usability testing platform or facility`,
          `Participant recruitment and incentives ($100-150 per participant)`,
          `Recording and analysis tools`
        );
        break;
        
      case 'market_research':
        validationPlan = `Conduct comprehensive market research combining industry reports, competitor analysis, and expert interviews to validate market opportunity, competitive landscape, and industry trends. Focus on identifying market gaps and potential differentiation points.`;
        experimentDesign = `1. Gather and analyze industry reports and market data\n2. Conduct competitive analysis of 5-7 key players\n3. Interview 3-5 industry experts or analysts\n4. Synthesize findings into market opportunity assessment\n5. Identify key differentiators and positioning strategy`;
        successCriteria = `Identified market gap with sufficient size and growth potential. Clear differentiation opportunities versus competitors. Validated alignment with industry trends and customer needs.`;
        expectedOutcomes = `Comprehensive market landscape understanding. Refined positioning strategy and competitive differentiation. Validated market size and growth projections.`;
        
        if (keyHypotheses.length === 0) {
          keyHypotheses.push(
            `The market size and growth rate support a viable business opportunity`,
            `Current solutions leave significant unmet needs in the market`,
            `The proposed solution has clear differentiation from competitors`,
            `Industry trends align favorably with the solution concept`
          );
        }
        
        potentialPivots.push(
          `Reposition to target underserved market segments`,
          `Adjust feature set to address gaps in competitor offerings`,
          `Align more closely with emerging industry trends`
        );
        
        resourcesNeeded.push(
          `Access to industry reports and market data ($1000-3000)`,
          `Competitive intelligence tools`,
          `Budget for expert interviews or consulting ($200-500 per interview)`,
          `Analysis framework for market assessment`
        );
        break;
    }

    return {
      validation_plan: validationPlan,
      key_hypotheses: keyHypotheses,
      experiment_design: experimentDesign,
      success_criteria: successCriteria,
      expected_outcomes: expectedOutcomes,
      potential_pivots: potentialPivots,
      resources_needed: resourcesNeeded
    };
  }

  /**
   * Generate milestones for an idea
   * @param idea The idea to generate milestones for
   * @param params The milestone parameters
   * @param context The AI service context
   * @returns A promise that resolves to an array of milestone responses
   */
  async generateMilestones(
    idea: IdeaPlaygroundIdea,
    params: MilestoneParams,
    context: AIServiceContext
  ): Promise<MilestoneResponse[]> {
    // Simulate API delay
    await this.delay(1500);

    // Generate mock milestones based on the timeline
    const milestones: MilestoneResponse[] = [];
    
    if (params.timeline === 'short_term' || params.timeline === 'medium_term' || params.timeline === 'long_term') {
      milestones.push({
        name: 'MVP Development',
        description: 'Develop a minimum viable product with core features to validate the solution with early users',
        target_date: '3 months from start',
        success_criteria: 'Functional product with core features, ready for beta testing',
        required_resources: ['Development team', 'Product management', 'Basic infrastructure'],
        dependencies: ['Finalized product requirements', 'Technical architecture'],
        risks: ['Scope creep', 'Technical challenges', 'Resource constraints']
      });
    }
    
    if (params.timeline === 'medium_term' || params.timeline === 'long_term') {
      milestones.push({
        name: 'Market Launch',
        description: 'Official product launch with marketing campaign and sales enablement',
        target_date: '6 months from start',
        success_criteria: 'Acquisition of first 50 paying customers, positive user feedback',
        required_resources: ['Marketing budget', 'Sales team', 'Customer support'],
        dependencies: ['Successful MVP validation', 'Marketing materials', 'Pricing strategy'],
        risks: ['Market reception', 'Competitive response', 'Scaling challenges']
      });
      
      milestones.push({
        name: 'First Major Feature Release',
        description: 'Launch of additional features based on early customer feedback',
        target_date: '9 months from start',
        success_criteria: 'Increased user engagement, positive feedback on new features',
        required_resources: ['Development team', 'Product management', 'QA resources'],
        dependencies: ['Customer feedback analysis', 'Feature prioritization'],
        risks: ['Development delays', 'Feature adoption', 'Technical debt']
      });
    }
    
    if (params.timeline === 'long_term') {
      milestones.push({
        name: 'Series A Funding',
        description: 'Secure significant funding to accelerate growth and expansion',
        target_date: '12-18 months from start',
        success_criteria: 'Successful funding round with favorable terms',
        required_resources: ['Pitch deck', 'Financial projections', 'Legal support'],
        dependencies: ['Proven traction', 'Clear growth metrics', 'Market validation'],
        risks: ['Funding environment', 'Valuation expectations', 'Investor alignment']
      });
      
      milestones.push({
        name: 'International Expansion',
        description: 'Expand product and operations to key international markets',
        target_date: '18-24 months from start',
        success_criteria: 'Successful launch in 2-3 new markets with growing user base',
        required_resources: ['International team', 'Localization resources', 'Market research'],
        dependencies: ['Domestic market success', 'Product scalability', 'Market selection'],
        risks: ['Cultural adaptation', 'Regulatory compliance', 'Operational complexity']
      });
    }
    
    return milestones;
  }

  /**
   * Helper method to generate a mock idea
   * @param params The idea generation parameters
   * @returns A mock idea response
   */
  private generateMockIdea(params: IdeaGenerationParams): IdeaResponse {
    const industries = [
      'Healthcare',
      'Education',
      'Finance',
      'Retail',
      'Manufacturing',
      'Transportation',
      'Entertainment'
    ];
    
    const technologies = [
      'Artificial Intelligence',
      'Blockchain',
      'Internet of Things',
      'Augmented Reality',
      'Cloud Computing',
      'Big Data Analytics',
      'Mobile Technology'
    ];
    
    const businessModels = [
      'Subscription-based SaaS',
      'Marketplace',
      'Freemium',
      'Transaction fees',
      'Advertising',
      'Licensing',
      'Hardware + Software'
    ];
    
    const industry = params.industry || this.getRandomItem(industries);
    const technology = params.technology || this.getRandomItem(technologies);
    const businessModel = params.business_model_preference || this.getRandomItem(businessModels);
    const targetAudience = params.target_audience || `${industry} professionals and organizations seeking efficiency and innovation`;
    
    return {
      title: `${technology} Platform for ${industry} Optimization`,
      description: `A comprehensive solution leveraging ${technology} to transform how ${industry} organizations operate, improving efficiency, reducing costs, and enhancing outcomes.`,
      problem_statement: `${industry} organizations face significant challenges with outdated processes, data silos, and inefficient workflows, leading to increased costs, reduced productivity, and suboptimal outcomes.`,
      solution_concept: `Our platform uses ${technology} to integrate disparate systems, automate routine tasks, and provide actionable insights, enabling organizations to streamline operations and make data-driven decisions.`,
      target_audience: targetAudience,
      unique_value: `Unlike existing solutions, our platform offers seamless integration, intuitive user experience, and advanced analytics capabilities specifically tailored for ${industry} use cases.`,
      business_model: `${businessModel} with tiered pricing based on organization size and feature requirements, providing flexibility and scalability.`,
      marketing_strategy: `Targeted content marketing, industry partnerships, and thought leadership to establish credibility and generate qualified leads within the ${industry} ecosystem.`,
      revenue_model: `Primary revenue through ${businessModel.toLowerCase()}, with additional income from implementation services, premium support, and custom integrations.`,
      go_to_market: `Phased approach starting with early adopters for validation, followed by broader market expansion through industry events, digital marketing, and strategic partnerships.`,
      market_size: `The global ${industry} technology market is valued at $XX billion with projected annual growth of 12-15%, presenting a significant opportunity for innovative solutions.`
    };
  }

  /**
   * Helper method to enhance text
   * @param text The text to enhance
   * @returns Enhanced text
   */
  private enhanceText(text: string): string {
    // In a real implementation, this would call an AI service
    // For mock purposes, we'll just add some text
    return text + ' (Enhanced with additional details and clarity for better understanding and impact.)';
  }

  /**
   * Helper method to get a random item from an array
   * @param items The array of items
   * @returns A random item from the array
   */
  private getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Helper method to simulate API delay
   * @param ms The delay in milliseconds
   * @returns A promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
