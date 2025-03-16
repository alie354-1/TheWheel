import { GeneralLLMService, QueryContext } from './general-llm.service';

export class MockGeneralLLMService implements GeneralLLMService {
  constructor() {}
  
  async query(input: string, context: QueryContext): Promise<any> {
    console.log('Mock LLM Service - Query:', input);
    console.log('Mock LLM Service - Context:', context);
    
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock response based on the input
    if (input.includes('idea generator') || input.includes('startup advisor')) {
      return {
        role: 'assistant',
        content: `\`\`\`json
[
  {
    "title": "Smart Home Energy Optimizer",
    "description": "An AI-powered system that learns household energy usage patterns and automatically optimizes consumption to reduce bills and environmental impact.",
    "problem_statement": "Households waste significant energy through inefficient usage patterns and lack of real-time optimization.",
    "solution_concept": "A combination of smart plugs, AI algorithms, and a user-friendly app that monitors, learns, and automatically adjusts energy usage.",
    "target_audience": "Environmentally conscious homeowners and renters looking to reduce energy bills",
    "unique_value": "Fully automated optimization requiring minimal user input while delivering measurable savings",
    "business_model": "Hardware sales with subscription service for advanced features and insights",
    "marketing_strategy": "Partnerships with utility companies and green energy providers for customer acquisition",
    "revenue_model": "One-time hardware purchase plus monthly subscription for premium features",
    "go_to_market": "Direct-to-consumer online sales with utility company partnerships",
    "market_size": "The global smart home energy management market is projected to reach $6.5 billion by 2025",
    "competition": ["Nest", "Sense Energy Monitor", "Wiser Energy"],
    "revenue_streams": ["Hardware sales", "Premium subscription", "Utility company partnerships", "Data insights"],
    "cost_structure": ["Hardware manufacturing", "Software development", "Marketing", "Customer support"],
    "key_metrics": ["Energy savings percentage", "User acquisition cost", "Subscription retention rate", "Hardware margin"]
  },
  {
    "title": "Personalized Nutrition Delivery Service",
    "description": "A meal delivery service that creates personalized nutrition plans based on individual health data, dietary preferences, and fitness goals.",
    "problem_statement": "Generic meal plans fail to address individual nutritional needs and health goals.",
    "solution_concept": "AI-driven nutrition planning combined with chef-prepared meals delivered directly to customers.",
    "target_audience": "Health-conscious professionals, fitness enthusiasts, and individuals with specific dietary requirements",
    "unique_value": "Truly personalized nutrition based on individual biometric data and preferences",
    "business_model": "Subscription-based meal delivery with tiered pricing based on customization level",
    "marketing_strategy": "Partnerships with fitness centers, nutritionists, and targeted social media campaigns",
    "revenue_model": "Weekly or monthly subscription fees with add-on options for supplements and snacks",
    "go_to_market": "Launch in major metropolitan areas with high concentrations of health-conscious professionals",
    "market_size": "The personalized nutrition market is expected to reach $16.6 billion by 2026",
    "competition": ["Blue Apron", "Trifecta Nutrition", "Territory Foods"],
    "revenue_streams": ["Meal subscriptions", "Supplement sales", "Nutrition consultation services", "Corporate wellness programs"],
    "cost_structure": ["Food ingredients", "Preparation facilities", "Delivery logistics", "Nutritionist staff"],
    "key_metrics": ["Customer retention rate", "Average order value", "Customer acquisition cost", "Meal preparation efficiency"]
  },
  {
    "title": "Remote Team Collaboration Platform",
    "description": "An all-in-one platform designed specifically for remote teams that combines project management, communication, and virtual team-building activities.",
    "problem_statement": "Remote teams struggle with fragmented tools, lack of cohesion, and diminished team culture.",
    "solution_concept": "A unified platform that integrates work management with team culture-building features.",
    "target_audience": "Remote-first companies and distributed teams across various industries",
    "unique_value": "Seamless integration of productivity tools with team culture and relationship building",
    "business_model": "SaaS subscription with tiered pricing based on team size and features",
    "marketing_strategy": "Content marketing focused on remote work best practices and targeted outreach to remote-first companies",
    "revenue_model": "Monthly or annual subscription fees with enterprise pricing for larger organizations",
    "go_to_market": "Freemium model for small teams with conversion path to paid tiers",
    "market_size": "The team collaboration software market is projected to reach $35 billion by 2027",
    "competition": ["Slack", "Microsoft Teams", "Asana", "Monday.com"],
    "revenue_streams": ["Subscription fees", "Enterprise contracts", "Integration marketplace", "Professional services"],
    "cost_structure": ["Software development", "Server infrastructure", "Customer support", "Sales and marketing"],
    "key_metrics": ["Monthly active users", "Conversion rate", "Team engagement score", "Feature adoption rate"]
  }
]
\`\`\``
      };
    } else if (input.includes('company relevance')) {
      return {
        role: 'assistant',
        content: `\`\`\`json
{
  "existingMarkets": [
    "Small business software market",
    "Productivity tools market"
  ],
  "customerSynergies": [
    "Existing customers would benefit from streamlined workflows",
    "Complements current product offerings"
  ],
  "complementaryProducts": [
    "Project management software",
    "Team collaboration tools"
  ],
  "strategicFit": "This idea aligns well with the company's focus on productivity enhancement and workflow optimization."
}
\`\`\``
      };
    } else {
      return {
        role: 'assistant',
        content: 'I\'ve analyzed your request and have some insights to share. This is a mock response from the AI assistant. In a real implementation, this would contain detailed, contextual information based on your specific query.'
      };
    }
  }
}

export const mockGeneralLLMService = new MockGeneralLLMService();
