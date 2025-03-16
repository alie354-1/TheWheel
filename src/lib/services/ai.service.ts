// Mock responses for all AI calls
const MOCK_RESPONSES = {
  tasks: {
    feedback: {
      strengths: [
        "Clear focus on key deliverables",
        "Good progress on core features",
        "Proactive problem identification"
      ],
      areas_for_improvement: [
        "Consider breaking down larger tasks",
        "Document technical decisions"
      ],
      opportunities: [
        "Potential for automation",
        "Integration possibilities"
      ],
      risks: [
        "Technical debt accumulation",
        "Resource constraints"
      ],
      strategic_recommendations: [
        "Implement automated testing",
        "Create technical documentation",
        "Review architecture decisions"
      ]
    },
    follow_up_questions: [
      "Have you considered alternative approaches?",
      "What metrics will you use to measure success?",
      "Are there any dependencies to consider?"
    ],
    tasks: [
      {
        title: "Implement Core Feature",
        description: "Build the main functionality based on requirements",
        priority: "high",
        estimated_hours: 8,
        task_type: "Feature Development",
        implementation_tips: [
          "Start with basic functionality",
          "Add error handling",
          "Include unit tests"
        ],
        potential_challenges: [
          "Complex edge cases",
          "Performance considerations",
          "Integration points"
        ],
        success_metrics: [
          "All tests passing",
          "Performance benchmarks met",
          "Code review approved"
        ],
        resources: [
          {
            title: "Best Practices Guide",
            url: "https://docs.example.com/best-practices",
            type: "article",
            description: "Comprehensive guide for implementation",
            source_type: "web",
            tags: ["documentation", "best-practices", "guide"]
          },
          {
            title: "Implementation Tutorial",
            url: "https://community.example.com/tutorials/123",
            type: "guide",
            description: "Step-by-step implementation guide from the community",
            source_type: "community",
            tags: ["tutorial", "implementation", "community"]
          },
          {
            title: "Expert Analysis",
            url: "https://experts.example.com/analysis/456",
            type: "article",
            description: "In-depth analysis by industry experts",
            source_type: "expert",
            tags: ["analysis", "expert", "insights"]
          }
        ],
        learning_resources: [
          {
            title: "Advanced Techniques",
            url: "https://learn.example.com/course-123",
            type: "course",
            platform: "Learning Platform",
            description: "In-depth course on implementation",
            source_type: "expert",
            tags: ["course", "advanced", "implementation"]
          },
          {
            title: "Community Workshop",
            url: "https://community.example.com/workshops/789",
            type: "workshop",
            platform: "Community Platform",
            description: "Hands-on workshop by community leaders",
            source_type: "community",
            tags: ["workshop", "hands-on", "community"]
          },
          {
            title: "Documentation Guide",
            url: "https://docs.example.com/guide-456",
            type: "guide",
            platform: "Documentation",
            description: "Official documentation and examples",
            source_type: "web",
            tags: ["documentation", "examples", "official"]
          }
        ],
        tools: [
          {
            name: "Development Tool",
            url: "https://tools.example.com/dev-tool",
            category: "Development",
            description: "Essential tool for implementation",
            source_type: "web",
            tags: ["development", "essential", "tool"]
          },
          {
            title: "Community Plugin",
            url: "https://community.example.com/plugins/123",
            category: "Extensions",
            description: "Community-developed plugin for enhanced functionality",
            source_type: "community",
            tags: ["plugin", "community", "extension"]
          },
          {
            title: "Expert Framework",
            url: "https://experts.example.com/frameworks/789",
            category: "Frameworks",
            description: "Professional-grade development framework",
            source_type: "expert",
            tags: ["framework", "professional", "development"]
          }
        ]
      }
    ]
  }
};

export interface AIService {
  generateTasks: (input: any) => Promise<any>;
  generateMarketAnalysis: (idea: any) => Promise<any>;
  generateMarketSuggestions: (idea: any) => Promise<any>;
  generateIdeaVariations: (idea: any) => Promise<any>;
}

class MockAIService implements AIService {
  async generateTasks(input: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_RESPONSES.tasks;
  }

  async generateMarketAnalysis(idea: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      customer_profiles: [
        {
          segment: "Early Adopters",
          description: "Tech-savvy professionals aged 25-40",
          needs: ["Efficiency", "Innovation", "Cost savings"],
          pain_points: ["Time-consuming processes", "Manual work"],
          buying_behavior: "Research-driven, willing to try new solutions",
          sources: [
            {
              name: "Market Research Report 2025",
              url: "https://example.com/report",
              type: "research_report",
              year: 2025
            }
          ]
        }
      ],
      early_adopters: [
        {
          type: "Tech Startups",
          characteristics: ["Innovation-focused", "Quick to adopt", "Value-driven"],
          acquisition_strategy: "Direct outreach and community engagement",
          sources: [
            {
              name: "Startup Ecosystem Report",
              url: "https://example.com/startup-report",
              type: "market_research",
              year: 2025
            }
          ]
        }
      ],
      sales_channels: [
        {
          channel: "Direct Sales",
          effectiveness: 0.8,
          cost: "High initial investment",
          timeline: "3-6 months",
          sources: [
            {
              name: "Sales Strategy Analysis",
              url: "https://example.com/sales",
              type: "industry_report",
              year: 2025
            }
          ]
        }
      ],
      pricing_insights: [
        {
          model: "Tiered Subscription",
          price_point: "$49-299/month",
          justification: "Aligned with market expectations and value delivery",
          sources: [
            {
              name: "Pricing Study 2025",
              url: "https://example.com/pricing",
              type: "market_research",
              year: 2025
            }
          ]
        }
      ],
      market_size: {
        tam: "$50B annually",
        sam: "$10B annually",
        som: "$500M annually",
        growth_rate: "15% YoY",
        sources: [
          {
            name: "Industry Analysis",
            url: "https://example.com/analysis",
            type: "market_report",
            year: 2025
          }
        ]
      }
    };
  }

  async generateMarketSuggestions(idea: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      target_audience: [
        "Small Business Owners",
        "Startup Founders", 
        "Enterprise Companies",
        "Digital Agencies",
        "E-commerce Businesses"
      ],
      sales_channels: [
        "Direct Sales",
        "Online Platform",
        "Partner Network",
        "Resellers",
        "Marketplaces"
      ],
      pricing_model: [
        "Subscription",
        "Usage-based",
        "Freemium",
        "Enterprise",
        "Marketplace Fee"
      ],
      customer_type: [
        "B2B",
        "Enterprise",
        "SMB",
        "Startups",
        "Agencies"
      ],
      integration_needs: [
        "CRM Systems",
        "Payment Processors",
        "Communication Tools",
        "Analytics Platforms",
        "Project Management"
      ]
    };
  }

  async generateIdeaVariations(idea: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: "1",
        title: "Premium SaaS Solution",
        description: "Enterprise-grade software with advanced features",
        differentiator: "AI-powered automation and analytics",
        targetMarket: "Large enterprises",
        revenueModel: "Annual subscription with tiered pricing",
        isSelected: false,
        isEditing: false
      },
      {
        id: "2",
        title: "Freemium Model",
        description: "Basic features free, premium features paid",
        differentiator: "Easy onboarding and scalability",
        targetMarket: "Small businesses and startups",
        revenueModel: "Freemium with premium tiers",
        isSelected: false,
        isEditing: false
      },
      {
        id: "3",
        title: "Marketplace Platform",
        description: "Two-sided marketplace connecting providers and users",
        differentiator: "Network effects and commission model",
        targetMarket: "Service providers and consumers",
        revenueModel: "Transaction fees and subscriptions",
        isSelected: false,
        isEditing: false
      }
    ];
  }
}

export const aiService = new MockAIService();