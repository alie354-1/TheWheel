import { GeneralLLMService, QueryContext as BaseQueryContext } from './general-llm.service';

// Extend QueryContext to include context property
export interface QueryContext extends BaseQueryContext {
  context?: string;
}
import { CompanyModelService } from './company-model.service';
import { ideaMemoryService, IdeaIteration, IdeaMemory } from './idea-memory.service';
import { v4 as uuidv4 } from 'uuid';
import { generalLLMService } from './general-llm.service';
import { companyModelService } from './company-model.service';
import { supabase } from '../supabase';

export interface BusinessIdea {
  id?: string;
  version?: number;
  title: string;
  description: string;
  problem_statement?: string;
  solution_concept?: string;
  target_audience?: string;
  unique_value?: string;
  business_model?: string;
  marketing_strategy?: string;
  revenue_model?: string;
  go_to_market?: string;
  market_size?: string;
  competition?: string[];
  revenue_streams?: string[];
  cost_structure?: string[];
  key_metrics?: string[];
}

export interface IdeaFeedback {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  suggestions: string[];
  market_insights: string[];
  validation_tips: string[];
}

export interface BusinessSuggestions {
  target_audience: string[];
  sales_channels: string[];
  pricing_model: string[];
  customer_type: string[];
  integration_needs: string[];
}

export interface IdeaVariation {
  id: string;
  title: string;
  description: string;
  differentiator: string;
  targetMarket: string;
  revenueModel: string;
  isSelected?: boolean;
  isEditing?: boolean;
}

export interface ComponentVariation {
  id: string;
  text: string;
  isSelected?: boolean;
  rating?: number;
  notes?: string;
}

export type ComponentType = 
  | 'problem_statement' 
  | 'solution_concept' 
  | 'target_audience' 
  | 'unique_value'
  | 'business_model'
  | 'marketing_strategy'
  | 'revenue_model'
  | 'go_to_market';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class IdeaGenerationService {
  constructor(
    private generalLLMService: GeneralLLMService = generalLLMService,
    private companyModelService: CompanyModelService = companyModelService
  ) {}
  
  async generateBusinessIdeas(context: QueryContext): Promise<BusinessIdea[]> {
    try {
      const prompt = this.createBusinessIdeasPrompt(context);
      
      const response = await this.generalLLMService.query(prompt, context);
      
      // Parse the JSON response
      const content = response.content || '';
      
      // Try to extract JSON if it exists
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\[\s*{[\s\S]*}\s*\]/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          // Ensure the response is an array
          const ideasArray = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          return ideasArray.map(idea => ({
            title: idea.title || 'Untitled Idea',
            description: idea.description || '',
            problem_statement: idea.problem_statement || '',
            solution_concept: idea.solution_concept || '',
            target_audience: idea.target_audience || '',
            unique_value: idea.unique_value || '',
            market_size: idea.market_size || '',
            competition: Array.isArray(idea.competition) ? idea.competition : [],
            revenue_streams: Array.isArray(idea.revenue_streams) ? idea.revenue_streams : [],
            cost_structure: Array.isArray(idea.cost_structure) ? idea.cost_structure : [],
            key_metrics: Array.isArray(idea.key_metrics) ? idea.key_metrics : []
          }));
        } catch (parseError) {
          console.error('Error parsing JSON from ideas:', parseError);
          return this.getFallbackIdeas();
        }
      }
      
      return this.getFallbackIdeas();
    } catch (error) {
      console.error('Error generating business ideas:', error);
      return this.getFallbackIdeas();
    }
  }
  
  async refineIdea(idea: BusinessIdea, context: QueryContext): Promise<IdeaFeedback> {
    try {
      // Get idea memory for context if available
      let ideaMemory: IdeaMemory | null = null;
      if (idea.id) {
        try {
          ideaMemory = await ideaMemoryService.getMemory(context.userId, idea.id);
        } catch (memoryError) {
          console.log('Error getting idea memory, continuing without it:', memoryError);
          // Continue without memory if there's an error (e.g., table doesn't exist)
        }
      }
      
      // Create the prompt with or without memory context
      const prompt = this.createIdeaRefinementPrompt(idea, ideaMemory);
      
      // Try to get a response from the LLM service
      let response;
      try {
        response = await this.generalLLMService.query(prompt, context);
      } catch (queryError) {
        console.error('Error querying LLM service:', queryError);
        return this.getFallbackFeedback();
      }
      
      // Parse the JSON response
      const content = response.content || '';
      
      // Try to extract JSON if it exists
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          const feedback = {
            strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : [],
            weaknesses: Array.isArray(parsedData.weaknesses) ? parsedData.weaknesses : [],
            opportunities: Array.isArray(parsedData.opportunities) ? parsedData.opportunities : [],
            threats: Array.isArray(parsedData.threats) ? parsedData.threats : [],
            suggestions: Array.isArray(parsedData.suggestions) ? parsedData.suggestions : [],
            market_insights: Array.isArray(parsedData.market_insights) ? parsedData.market_insights : [],
            validation_tips: Array.isArray(parsedData.validation_tips) ? parsedData.validation_tips : []
          };
          
          // Try to save the feedback to idea memory, but don't fail if it doesn't work
          if (idea.id) {
            try {
              await ideaMemoryService.addIteration(
                context.userId,
                idea.id,
                {
                  version: idea.version || 1,
                  title: idea.title,
                  description: idea.description,
                  problem_statement: idea.problem_statement,
                  solution_concept: idea.solution_concept,
                  target_audience: idea.target_audience,
                  unique_value: idea.unique_value,
                  feedback
                }
              );
            } catch (saveError) {
              console.log('Error saving idea memory, continuing:', saveError);
              // Continue even if saving fails
            }
          }
          
          return feedback;
        } catch (parseError) {
          console.error('Error parsing JSON from feedback:', parseError);
          return this.getFallbackFeedback();
        }
      }
      
      return this.getFallbackFeedback();
    } catch (error) {
      console.error('Error refining idea:', error);
      return this.getFallbackFeedback();
    }
  }
  
  async analyzeMarket(idea: BusinessIdea, context: QueryContext): Promise<any> {
    try {
      const prompt = this.createMarketAnalysisPrompt(idea);
      
      const response = await this.generalLLMService.query(prompt, context);
      
      // Parse the JSON response
      const content = response.content || '';
      
      // Try to extract JSON if it exists
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (parseError) {
          console.error('Error parsing JSON from market analysis:', parseError);
          return this.getFallbackMarketAnalysis();
        }
      }
      
      return this.getFallbackMarketAnalysis();
    } catch (error) {
      console.error('Error analyzing market:', error);
      return this.getFallbackMarketAnalysis();
    }
  }
  
  async generateBusinessModel(idea: BusinessIdea, context: QueryContext): Promise<BusinessSuggestions> {
    try {
      const prompt = this.createBusinessModelPrompt(idea);
      
      const response = await this.generalLLMService.query(prompt, context);
      
      // Parse the JSON response
      const content = response.content || '';
      
      // Try to extract JSON if it exists
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          return {
            target_audience: Array.isArray(parsedData.target_audience) ? parsedData.target_audience : [],
            sales_channels: Array.isArray(parsedData.sales_channels) ? parsedData.sales_channels : [],
            pricing_model: Array.isArray(parsedData.pricing_model) ? parsedData.pricing_model : [],
            customer_type: Array.isArray(parsedData.customer_type) ? parsedData.customer_type : [],
            integration_needs: Array.isArray(parsedData.integration_needs) ? parsedData.integration_needs : []
          };
        } catch (parseError) {
          console.error('Error parsing JSON from business model:', parseError);
          return this.getFallbackBusinessModel();
        }
      }
      
      return this.getFallbackBusinessModel();
    } catch (error) {
      console.error('Error generating business model:', error);
      return this.getFallbackBusinessModel();
    }
  }
  
  async generateIdeaVariations(idea: BusinessIdea, context: QueryContext): Promise<IdeaVariation[]> {
    try {
      const prompt = this.createIdeaVariationsPrompt(idea);
      
      const response = await this.generalLLMService.query(prompt, context);
      
      // Parse the JSON response
      const content = response.content || '';
      
      // Try to extract JSON if it exists
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\[\s*{[\s\S]*}\s*\]/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          // Ensure the response is an array
          const variationsArray = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          return variationsArray.map(variation => ({
            id: variation.id || uuidv4(),
            title: variation.title || 'Untitled Variation',
            description: variation.description || '',
            differentiator: variation.differentiator || '',
            targetMarket: variation.targetMarket || '',
            revenueModel: variation.revenueModel || '',
            isSelected: false,
            isEditing: false
          }));
        } catch (parseError) {
          console.error('Error parsing JSON from variations:', parseError);
          return this.getFallbackVariations();
        }
      }
      
      return this.getFallbackVariations();
    } catch (error) {
      console.error('Error generating idea variations:', error);
      return this.getFallbackVariations();
    }
  }
  
  async chatResponse(message: string, history: Message[], context: QueryContext): Promise<string> {
    try {
      const prompt = this.createChatPrompt(message, history);
      
      const response = await this.generalLLMService.query(prompt, context);
      
      return response.content || "I'm sorry, I couldn't generate a response at this time.";
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I'm sorry, I couldn't generate a response at this time. Please try again later.";
    }
  }
  
  async generateComponentVariations(
    idea: BusinessIdea, 
    componentType: ComponentType, 
    context: QueryContext
  ): Promise<ComponentVariation[]> {
    try {
      // Create a context-specific prompt for the component type
      const prompt = this.createComponentVariationPrompt(idea, componentType);
      
      // Add a context marker to ensure we're not in standup context
      const enhancedContext: QueryContext = { 
        ...context, 
        // Mark this as idea generation context
        context: 'idea_generation'
      };
      
      const response = await this.generalLLMService.query(prompt, context);
      
      // Parse the response to extract variations
      const content = response.content || '';
      
      // Try to extract variations from the response
      const variations: ComponentVariation[] = [];
      
      // First try to parse as JSON if it's formatted that way
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\[\s*{[\s\S]*}\s*\]/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          // Ensure the response is an array
          const variationsArray = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          return variationsArray.map(variation => ({
            id: variation.id || uuidv4(),
            text: variation.text || variation.content || variation.description || 'No content provided',
            isSelected: false,
            rating: 0,
            notes: ''
          }));
        } catch (parseError) {
          console.error(`Error parsing JSON for ${componentType} variations:`, parseError);
          // Fall back to text parsing
        }
      }
      
      // If JSON parsing failed, try to extract variations from text
      const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
      
      // Extract numbered or bulleted items
      for (const line of lines) {
        const match = line.match(/^(\d+[\.\):]|[\-\*•])\s+(.+)$/);
        if (match) {
          variations.push({
            id: uuidv4(),
            text: match[2].trim(),
            isSelected: false,
            rating: 0,
            notes: ''
          });
        }
      }
      
      // If we couldn't extract variations properly, create them from the whole response
      if (variations.length === 0) {
        // Split by double newlines to try to separate paragraphs
        const paragraphs = content.split('\n\n').filter((p: string) => p.trim().length > 0);
        
        for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
          variations.push({
            id: uuidv4(),
            text: paragraphs[i].trim(),
            isSelected: false,
            rating: 0,
            notes: ''
          });
        }
      }
      
      // Limit to 5 variations
      return variations.slice(0, 5);
    } catch (error) {
      console.error(`Error generating ${componentType} variations:`, error);
      return this.getFallbackComponentVariations(componentType);
    }
  }
  
  async saveComponentVariation(
    ideaId: string,
    userId: string,
    componentType: ComponentType,
    variation: ComponentVariation
  ): Promise<boolean> {
    try {
      // Save the variation to the database
      const { error } = await supabase
        .from('idea_variations')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          component_type: componentType,
          variation_text: variation.text,
          is_selected: variation.isSelected || false,
          rating: variation.rating || 0,
          notes: variation.notes || ''
        });
        
      if (error) {
        console.error('Error saving component variation:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveComponentVariation:', error);
      return false;
    }
  }
  
  async getComponentVariations(
    ideaId: string,
    userId: string,
    componentType: ComponentType
  ): Promise<ComponentVariation[]> {
    try {
      // Get variations from the database
      const { data, error } = await supabase
        .from('idea_variations')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('user_id', userId)
        .eq('component_type', componentType)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching component variations:', error);
        return [];
      }
      
      // Map the database records to ComponentVariation objects
      return (data || []).map(record => ({
        id: record.id,
        text: record.variation_text,
        isSelected: record.is_selected,
        rating: record.rating,
        notes: record.notes
      }));
    } catch (error) {
      console.error('Error in getComponentVariations:', error);
      return [];
    }
  }
  
  // Helper methods to create prompts
  
  private createBusinessIdeasPrompt(context: QueryContext): string {
    return `You are an experienced startup advisor and idea generator. Generate 3 innovative business ideas based on current market trends and opportunities.

Each idea should include:
- A compelling title
- A concise description
- A clear problem statement
- A solution concept
- Target audience
- Unique value proposition
- Estimated market size
- Potential competitors
- Possible revenue streams
- Basic cost structure
- Key metrics for success

Format your response as a JSON array of business ideas.`;
  }
  
  private createIdeaRefinementPrompt(idea: BusinessIdea, ideaMemory?: IdeaMemory | null): string {
    // Determine if this is a new idea or an iteration
    const isNewIdea = !ideaMemory || ideaMemory.iterations.length === 0;
    
    // Get previous feedback if available
    const previousFeedback = !isNewIdea ? 
      ideaMemory?.iterations[ideaMemory.iterations.length - 1]?.feedback : null;
    
    return `You are an experienced startup advisor analyzing this business idea:
  
Title: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problem_statement || 'Not specified'}
Solution Concept: ${idea.solution_concept || 'Not specified'}
Target Audience: ${idea.target_audience || 'Not specified'}
Unique Value: ${idea.unique_value || 'Not specified'}

${previousFeedback ? `Previous feedback: ${JSON.stringify(previousFeedback)}` : ''}

Provide constructive feedback on this idea using the following structure:

\`\`\`json
{
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "weaknesses": [
    "Specific weakness 1",
    "Specific weakness 2"
  ],
  "opportunities": [
    "Specific opportunity 1",
    "Specific opportunity 2"
  ],
  "threats": [
    "Specific threat 1",
    "Specific threat 2"
  ],
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2"
  ],
  "market_insights": [
    "Market insight 1",
    "Market insight 2"
  ],
  "validation_tips": [
    "Validation tip 1",
    "Validation tip 2"
  ]
}
\`\`\`

Be specific, actionable, and direct. Focus on helping the entrepreneur improve their idea.`;
  }
  
  private createMarketAnalysisPrompt(idea: BusinessIdea): string {
    return `You are a market research expert analyzing this business idea:
  
Title: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problem_statement || 'Not specified'}
Target Audience: ${idea.target_audience || 'Not specified'}

Provide a comprehensive market analysis using the following structure:

\`\`\`json
{
  "customer_profiles": [
    {
      "segment": "Segment name",
      "description": "Detailed description",
      "needs": ["Need 1", "Need 2"],
      "pain_points": ["Pain point 1", "Pain point 2"],
      "buying_behavior": "Description of buying behavior"
    }
  ],
  "early_adopters": [
    {
      "type": "Type of early adopter",
      "characteristics": ["Characteristic 1", "Characteristic 2"],
      "acquisition_strategy": "How to acquire these customers"
    }
  ],
  "sales_channels": [
    {
      "channel": "Channel name",
      "effectiveness": 0.8,
      "cost": "Cost description",
      "timeline": "Timeline to establish"
    }
  ],
  "pricing_insights": [
    {
      "model": "Pricing model name",
      "price_point": "Price point range",
      "justification": "Justification for this pricing"
    }
  ],
  "market_size": {
    "tam": "Total addressable market size",
    "sam": "Serviceable addressable market size",
    "som": "Serviceable obtainable market size",
    "growth_rate": "Annual growth rate"
  }
}
\`\`\`

Be specific, data-driven, and realistic in your analysis.`;
  }
  
  private createBusinessModelPrompt(idea: BusinessIdea): string {
    return `You are a business model expert analyzing this business idea:
  
Title: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problem_statement || 'Not specified'}
Target Audience: ${idea.target_audience || 'Not specified'}

Generate business model suggestions using the following structure:

\`\`\`json
{
  "target_audience": [
    "Specific audience segment 1",
    "Specific audience segment 2",
    "Specific audience segment 3",
    "Specific audience segment 4",
    "Specific audience segment 5"
  ],
  "sales_channels": [
    "Specific sales channel 1",
    "Specific sales channel 2",
    "Specific sales channel 3",
    "Specific sales channel 4",
    "Specific sales channel 5"
  ],
  "pricing_model": [
    "Specific pricing model 1",
    "Specific pricing model 2",
    "Specific pricing model 3",
    "Specific pricing model 4",
    "Specific pricing model 5"
  ],
  "customer_type": [
    "Specific customer type 1",
    "Specific customer type 2",
    "Specific customer type 3",
    "Specific customer type 4",
    "Specific customer type 5"
  ],
  "integration_needs": [
    "Specific integration need 1",
    "Specific integration need 2",
    "Specific integration need 3",
    "Specific integration need 4",
    "Specific integration need 5"
  ]
}
\`\`\`

Provide specific, realistic, and diverse options for each category.`;
  }
  
  private createIdeaVariationsPrompt(idea: BusinessIdea): string {
    return `You are a creative business strategist. Generate 3 variations of this business idea:
  
Title: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problem_statement || 'Not specified'}
Target Audience: ${idea.target_audience || 'Not specified'}

Create variations that explore different approaches, business models, or target markets while solving the same core problem.

Format your response as a JSON array:

\`\`\`json
[
  {
    "id": "1",
    "title": "Variation title",
    "description": "Detailed description",
    "differentiator": "Key differentiator from original idea",
    "targetMarket": "Specific target market",
    "revenueModel": "Revenue model description"
  }
]
\`\`\`

Be creative but realistic. Each variation should be viable and distinct.`;
  }
  
  private createChatPrompt(message: string, history: Message[]): string {
    // Format the conversation history
    const formattedHistory = history.map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    return `You are an AI co-founder helping an entrepreneur develop their business ideas. You provide insightful, direct, and actionable advice based on startup best practices.

Previous conversation:
${formattedHistory}

User's latest message: ${message}

Respond as a knowledgeable co-founder would - be direct, specific, and focused on helping the entrepreneur succeed. Draw from your knowledge of startups, business models, and market dynamics. Ask probing questions when appropriate to help clarify the entrepreneur's thinking.`;
  }
  
  // Fallback methods
  
  private getFallbackIdeas(): BusinessIdea[] {
    return [
      {
        title: 'AI-Powered Customer Service Platform',
        description: 'A platform that uses AI to automate customer service interactions while maintaining a personal touch.',
        problem_statement: 'Customer service is expensive and often inefficient.',
        solution_concept: 'AI chatbots with advanced NLP capabilities that can handle complex customer inquiries.',
        target_audience: 'E-commerce and SaaS companies',
        unique_value: 'Reduces customer service costs by 50% while improving satisfaction scores.',
        market_size: '$5B annually',
        competition: ['Zendesk', 'Intercom', 'Drift'],
        revenue_streams: ['Subscription model', 'Usage-based pricing'],
        cost_structure: ['AI development', 'Cloud infrastructure', 'Sales and marketing'],
        key_metrics: ['Resolution rate', 'Customer satisfaction', 'Response time']
      }
    ];
  }
  
  private getFallbackFeedback(): IdeaFeedback {
    return {
      strengths: [
        'Clear value proposition',
        'Addresses a real market need'
      ],
      weaknesses: [
        'Target market may be too broad',
        'Revenue model needs refinement'
      ],
      opportunities: [
        'Potential for expansion into adjacent markets',
        'Partnership opportunities with complementary services'
      ],
      threats: [
        'Competitive landscape is crowded',
        'Technology changes could disrupt the model'
      ],
      suggestions: [
        'Narrow focus to a specific industry vertical initially',
        'Develop a clearer differentiation strategy'
      ],
      market_insights: [
        'Market is growing at 15% annually',
        'Early adopters tend to be mid-sized companies'
      ],
      validation_tips: [
        'Interview 10 potential customers in your target market',
        'Create a simple landing page to test messaging'
      ]
    };
  }
  
  private getFallbackMarketAnalysis(): any {
    return {
      customer_profiles: [
        {
          segment: "Early Adopters",
          description: "Tech-savvy professionals aged 25-40",
          needs: ["Efficiency", "Innovation", "Cost savings"],
          pain_points: ["Time-consuming processes", "Manual work"],
          buying_behavior: "Research-driven, willing to try new solutions"
        }
      ],
      early_adopters: [
        {
          type: "Tech Startups",
          characteristics: ["Innovation-focused", "Quick to adopt", "Value-driven"],
          acquisition_strategy: "Direct outreach and community engagement"
        }
      ],
      sales_channels: [
        {
          channel: "Direct Sales",
          effectiveness: 0.8,
          cost: "High initial investment",
          timeline: "3-6 months"
        }
      ],
      pricing_insights: [
        {
          model: "Tiered Subscription",
          price_point: "$49-299/month",
          justification: "Aligned with market expectations and value delivery"
        }
      ],
      market_size: {
        tam: "$50B annually",
        sam: "$10B annually",
        som: "$500M annually",
        growth_rate: "15% YoY"
      }
    };
  }
  
  private getFallbackBusinessModel(): BusinessSuggestions {
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
  
  private getFallbackVariations(): IdeaVariation[] {
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
  
  private getFallbackComponentVariations(componentType: ComponentType): ComponentVariation[] {
    // Default variations based on component type
    switch (componentType) {
      case 'problem_statement':
        return [
          { id: uuidv4(), text: 'Customers struggle with inefficient customer service processes that waste time and resources.', isSelected: false },
          { id: uuidv4(), text: 'Small businesses lack affordable tools to provide enterprise-grade customer support.', isSelected: false },
          { id: uuidv4(), text: 'Current customer service solutions are too complex for non-technical users to implement effectively.', isSelected: false },
          { id: uuidv4(), text: 'Companies are losing customers due to slow response times and poor service experiences.', isSelected: false },
          { id: uuidv4(), text: 'Remote teams struggle to coordinate customer support across different time zones and channels.', isSelected: false }
        ];
      case 'solution_concept':
        return [
          { id: uuidv4(), text: 'A SaaS platform with AI-powered chatbots that can handle 80% of customer inquiries automatically.', isSelected: false },
          { id: uuidv4(), text: 'An integrated customer service toolkit with smart routing, knowledge base, and analytics.', isSelected: false },
          { id: uuidv4(), text: 'A mobile-first customer support app that allows businesses to respond to customers from anywhere.', isSelected: false },
          { id: uuidv4(), text: 'A hybrid solution combining automated responses with seamless human handoff for complex issues.', isSelected: false },
          { id: uuidv4(), text: 'A white-label customer service platform that businesses can customize to match their brand.', isSelected: false }
        ];
      case 'target_audience':
        return [
          { id: uuidv4(), text: 'E-commerce businesses with 5-50 employees handling high volumes of similar customer inquiries.', isSelected: false },
          { id: uuidv4(), text: 'SaaS companies looking to scale their customer support without increasing headcount.', isSelected: false },
          { id: uuidv4(), text: 'Small retail businesses transitioning to omnichannel sales and support.', isSelected: false },
          { id: uuidv4(), text: 'Professional service firms (law, accounting, consulting) seeking to improve client communication.', isSelected: false },
          { id: uuidv4(), text: 'Direct-to-consumer brands focused on providing premium customer experiences.', isSelected: false }
        ];
      case 'unique_value':
        return [
          { id: uuidv4(), text: 'Reduces customer service costs by 40% while improving customer satisfaction scores by 25%.', isSelected: false },
          { id: uuidv4(), text: 'The only solution that seamlessly integrates with all major e-commerce and CRM platforms out of the box.', isSelected: false },
          { id: uuidv4(), text: 'Provides actionable insights from customer interactions to improve products and services.', isSelected: false },
          { id: uuidv4(), text: 'Enables small businesses to provide enterprise-level customer service at an affordable price point.', isSelected: false },
          { id: uuidv4(), text: 'Uses proprietary AI to learn from each interaction, continuously improving response quality.', isSelected: false }
        ];
      case 'business_model':
        return [
          { id: uuidv4(), text: 'Tiered SaaS subscription model with pricing based on volume of customer interactions.', isSelected: false },
          { id: uuidv4(), text: 'Freemium model with basic features free and advanced AI capabilities as paid upgrades.', isSelected: false },
          { id: uuidv4(), text: 'Usage-based pricing with monthly minimums and volume discounts for larger customers.', isSelected: false },
          { id: uuidv4(), text: 'Enterprise licensing model with annual contracts and custom implementation services.', isSelected: false },
          { id: uuidv4(), text: 'Platform + marketplace model where third-party developers can sell add-ons and integrations.', isSelected: false }
        ];
      case 'marketing_strategy':
        return [
          { id: uuidv4(), text: 'Content marketing focused on customer service ROI and automation best practices.', isSelected: false },
          { id: uuidv4(), text: 'Partner-led growth through integrations with popular e-commerce and CRM platforms.', isSelected: false },
          { id: uuidv4(), text: 'Free assessment tool that analyzes current customer service metrics and suggests improvements.', isSelected: false },
          { id: uuidv4(), text: 'Industry-specific case studies highlighting cost savings and customer satisfaction improvements.', isSelected: false },
          { id: uuidv4(), text: 'Community-building strategy with forums for customer service professionals to share best practices.', isSelected: false }
        ];
      case 'revenue_model':
        return [
          { id: uuidv4(), text: 'Monthly subscription with tiered pricing based on number of users and features.', isSelected: false },
          { id: uuidv4(), text: 'Per-seat pricing with unlimited customer interactions and all features included.', isSelected: false },
          { id: uuidv4(), text: 'Core platform subscription plus usage-based billing for AI-powered interactions.', isSelected: false },
          { id: uuidv4(), text: 'Annual enterprise contracts with professional services and custom implementation.', isSelected: false },
          { id: uuidv4(), text: 'Marketplace revenue share from third-party integrations and add-ons.', isSelected: false }
        ];
      case 'go_to_market':
        return [
          { id: uuidv4(), text: 'Target e-commerce segment first with direct sales and content marketing.', isSelected: false },
          { id: uuidv4(), text: 'Launch with freemium model to build user base, then upsell premium features.', isSelected: false },
          { id: uuidv4(), text: 'Partner with e-commerce platforms for distribution and co-marketing.', isSelected: false },
          { id: uuidv4(), text: 'Focus on specific vertical (e.g., fashion retail) to establish strong case studies before expanding.', isSelected: false },
          { id: uuidv4(), text: 'Use product-led growth with self-service onboarding and in-product upsells.', isSelected: false }
        ];
      default:
        return [
          { id: uuidv4(), text: 'Variation 1 for ' + componentType, isSelected: false },
          { id: uuidv4(), text: 'Variation 2 for ' + componentType, isSelected: false },
          { id: uuidv4(), text: 'Variation 3 for ' + componentType, isSelected: false },
          { id: uuidv4(), text: 'Variation 4 for ' + componentType, isSelected: false },
          { id: uuidv4(), text: 'Variation 5 for ' + componentType, isSelected: false }
        ];
    }
  }
  
  private createComponentVariationPrompt(idea: BusinessIdea, componentType: ComponentType): string {
    // Base prompt that's common for all component types
    const basePrompt = `You are a creative business strategist helping refine this business idea:
  
Title: ${idea.title}
Description: ${idea.description}
Problem Statement: ${idea.problem_statement || 'Not specified'}
Solution Concept: ${idea.solution_concept || 'Not specified'}
Target Audience: ${idea.target_audience || 'Not specified'}
Unique Value: ${idea.unique_value || 'Not specified'}

`;
    
    // Component-specific prompts
    let componentPrompt = '';
    switch (componentType) {
      case 'problem_statement':
        componentPrompt = `Generate 5 different ways to frame the problem this business idea solves. Each variation should be distinct and highlight different aspects or perspectives of the problem.`;
        break;
      case 'solution_concept':
        componentPrompt = `Generate 5 different approaches to solving the problem identified in this business idea. Each variation should propose a distinct solution concept or implementation strategy.`;
        break;
      case 'target_audience':
        componentPrompt = `Generate 5 different target audience segments for this business idea. Each variation should describe a specific customer segment with unique characteristics, needs, and pain points.`;
        break;
      case 'unique_value':
        componentPrompt = `Generate 5 different unique value propositions for this business idea. Each variation should articulate a distinct competitive advantage or benefit that would appeal to customers.`;
        break;
      case 'business_model':
        componentPrompt = `Generate 5 different business models for this idea. Each variation should outline a distinct approach to creating, delivering, and capturing value.`;
        break;
      case 'marketing_strategy':
        componentPrompt = `Generate 5 different marketing strategies for this business idea. Each variation should outline a distinct approach to reaching and acquiring customers.`;
        break;
      case 'revenue_model':
        componentPrompt = `Generate 5 different revenue models for this business idea. Each variation should describe a distinct approach to monetization and pricing.`;
        break;
      case 'go_to_market':
        componentPrompt = `Generate 5 different go-to-market strategies for this business idea. Each variation should outline a distinct approach to launching and scaling the business.`;
        break;
      default:
        componentPrompt = `Generate 5 different variations for the ${componentType} aspect of this business idea. Each variation should be distinct and offer a different perspective or approach.`;
    }
    
    // Format instructions
    const formatInstructions = `
Format your response as a JSON array of objects, each with a 'text' field containing the variation:

\`\`\`json
[
  {
    "text": "First variation text here"
  },
  {
    "text": "Second variation text here"
  },
  ...
]
\`\`\`

Be creative but realistic. Each variation should be viable, distinct, and expressed in a clear, concise manner.`;
    
    return basePrompt + componentPrompt + formatInstructions;
  }
}

export const ideaGenerationService = new IdeaGenerationService(generalLLMService, companyModelService);
