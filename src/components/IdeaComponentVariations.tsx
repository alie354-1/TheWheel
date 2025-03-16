import React, { useState } from 'react';
import { 
  RefreshCw,
  Check,
  Edit3,
  Users,
  Zap,
  AlertCircle,
  BarChart4,
  TrendingUp,
  DollarSign,
  Rocket
} from 'lucide-react';
import { 
  ideaGenerationService, 
  BusinessIdea, 
  ComponentVariation as IComponentVariation,
  ComponentType 
} from '../lib/services/idea-generation.service';
import { ideaMemoryService } from '../lib/services/idea-memory.service';

interface IdeaComponentVariationsProps {
  idea: BusinessIdea;
  userId?: string;
  onSelectVariation: (componentType: ComponentType, text: string) => void;
}

export default function IdeaComponentVariations({ idea, userId, onSelectVariation }: IdeaComponentVariationsProps) {
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<ComponentType | null>(null);
  const [error, setError] = useState('');
  
  // State for component variations
  const [problemStatementVariations, setProblemStatementVariations] = useState<IComponentVariation[]>([]);
  const [solutionConceptVariations, setSolutionConceptVariations] = useState<IComponentVariation[]>([]);
  const [targetAudienceVariations, setTargetAudienceVariations] = useState<IComponentVariation[]>([]);
  const [uniqueValueVariations, setUniqueValueVariations] = useState<IComponentVariation[]>([]);
  const [businessModelVariations, setBusinessModelVariations] = useState<IComponentVariation[]>([]);
  const [marketingStrategyVariations, setMarketingStrategyVariations] = useState<IComponentVariation[]>([]);
  const [revenueModelVariations, setRevenueModelVariations] = useState<IComponentVariation[]>([]);
  const [goToMarketVariations, setGoToMarketVariations] = useState<IComponentVariation[]>([]);

  // Function to generate variations for a specific component
  const generateComponentVariations = async (componentType: ComponentType) => {
    if (!idea.title || !idea.description) {
      setError('Please provide at least a title and description');
      return;
    }

    setIsGeneratingVariations(componentType);
    setError('');

    try {
      // Check if enhanced idea generation is enabled
      const isEnhanced = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', userId);
      
      if (isEnhanced) {
        // Use the new ideaGenerationService
        const context = {
          userId: userId || '',
          companyId: undefined,
          useExistingModels: true
        };
        
        // Generate variations using the idea generation service
        const variations = await generateVariationsForComponent(idea, componentType, context);
        
        // Update the appropriate state based on the component type
        switch (componentType) {
          case 'problem_statement':
            setProblemStatementVariations(variations);
            break;
          case 'solution_concept':
            setSolutionConceptVariations(variations);
            break;
          case 'target_audience':
            setTargetAudienceVariations(variations);
            break;
          case 'unique_value':
            setUniqueValueVariations(variations);
            break;
          case 'business_model':
            setBusinessModelVariations(variations);
            break;
          case 'marketing_strategy':
            setMarketingStrategyVariations(variations);
            break;
          case 'revenue_model':
            setRevenueModelVariations(variations);
            break;
          case 'go_to_market':
            setGoToMarketVariations(variations);
            break;
        }
      } else {
        // Fallback to mock data
        const mockVariations = generateMockVariations(componentType);
        
        // Update the appropriate state based on the component type
        switch (componentType) {
          case 'problem_statement':
            setProblemStatementVariations(mockVariations);
            break;
          case 'solution_concept':
            setSolutionConceptVariations(mockVariations);
            break;
          case 'target_audience':
            setTargetAudienceVariations(mockVariations);
            break;
          case 'unique_value':
            setUniqueValueVariations(mockVariations);
            break;
          case 'business_model':
            setBusinessModelVariations(mockVariations);
            break;
          case 'marketing_strategy':
            setMarketingStrategyVariations(mockVariations);
            break;
          case 'revenue_model':
            setRevenueModelVariations(mockVariations);
            break;
          case 'go_to_market':
            setGoToMarketVariations(mockVariations);
            break;
        }
      }
    } catch (error: any) {
      console.error(`Error generating ${componentType} variations:`, error);
      setError(error.message);
    } finally {
      setIsGeneratingVariations(null);
    }
  };
  
  // Helper function to generate variations for a component using the idea generation service
  const generateVariationsForComponent = async (
    idea: BusinessIdea, 
    componentType: ComponentType, 
    context: any
  ): Promise<IComponentVariation[]> => {
    try {
      // Create a prompt for the specific component
      const componentPrompt = `Generate 5 different variations of the ${componentType.replace('_', ' ')} for this business idea:
      
Title: ${idea.title}
Description: ${idea.description}
Current ${componentType === 'problem_statement' ? idea.problem_statement : 
         componentType === 'solution_concept' ? idea.solution_concept :
         componentType === 'target_audience' ? idea.target_audience :
         componentType === 'unique_value' ? idea.unique_value : 'Not specified'}

Each variation should be distinct and offer a different perspective or approach.`;
      
      // Use the chat response function to get variations
      const response = await ideaGenerationService.chatResponse(componentPrompt, [], context);
      
      // Parse the response to extract variations
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      
      // Extract numbered or bulleted items
      const variations: IComponentVariation[] = [];
      for (const line of lines) {
        const match = line.match(/^(\d+[\.\):]|[\-\*•])\s+(.+)$/);
        if (match) {
          variations.push({
            id: Math.random().toString(36).substring(2, 9),
            text: match[2].trim(),
            isSelected: false
          });
        }
      }
      
      // If we couldn't extract variations properly, create them from the whole response
      if (variations.length === 0) {
        // Split by double newlines to try to separate paragraphs
        const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0);
        
        for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
          variations.push({
            id: Math.random().toString(36).substring(2, 9),
            text: paragraphs[i].trim(),
            isSelected: false
          });
        }
      }
      
      // Limit to 5 variations
      return variations.slice(0, 5);
    } catch (error) {
      console.error('Error generating variations:', error);
      return generateMockVariations(componentType);
    }
  };
  
  // Helper function to generate mock variations for a component
  const generateMockVariations = (componentType: ComponentType): IComponentVariation[] => {
    const variations: IComponentVariation[] = [];
    
    // Generate mock variations based on the component type
    switch (componentType) {
      case 'problem_statement':
        variations.push(
          { id: '1', text: 'Customers struggle with inefficient customer service processes that waste time and resources.', isSelected: false },
          { id: '2', text: 'Small businesses lack affordable tools to provide enterprise-grade customer support.', isSelected: false },
          { id: '3', text: 'Current customer service solutions are too complex for non-technical users to implement effectively.', isSelected: false },
          { id: '4', text: 'Companies are losing customers due to slow response times and poor service experiences.', isSelected: false },
          { id: '5', text: 'Remote teams struggle to coordinate customer support across different time zones and channels.', isSelected: false }
        );
        break;
      case 'solution_concept':
        variations.push(
          { id: '1', text: 'A SaaS platform with AI-powered chatbots that can handle 80% of customer inquiries automatically.', isSelected: false },
          { id: '2', text: 'An integrated customer service toolkit with smart routing, knowledge base, and analytics.', isSelected: false },
          { id: '3', text: 'A mobile-first customer support app that allows businesses to respond to customers from anywhere.', isSelected: false },
          { id: '4', text: 'A hybrid solution combining automated responses with seamless human handoff for complex issues.', isSelected: false },
          { id: '5', text: 'A white-label customer service platform that businesses can customize to match their brand.', isSelected: false }
        );
        break;
      case 'target_audience':
        variations.push(
          { id: '1', text: 'E-commerce businesses with 5-50 employees handling high volumes of similar customer inquiries.', isSelected: false },
          { id: '2', text: 'SaaS companies looking to scale their customer support without increasing headcount.', isSelected: false },
          { id: '3', text: 'Small retail businesses transitioning to omnichannel sales and support.', isSelected: false },
          { id: '4', text: 'Professional service firms (law, accounting, consulting) seeking to improve client communication.', isSelected: false },
          { id: '5', text: 'Direct-to-consumer brands focused on providing premium customer experiences.', isSelected: false }
        );
        break;
      case 'unique_value':
        variations.push(
          { id: '1', text: 'Reduces customer service costs by 40% while improving customer satisfaction scores by 25%.', isSelected: false },
          { id: '2', text: 'The only solution that seamlessly integrates with all major e-commerce and CRM platforms out of the box.', isSelected: false },
          { id: '3', text: 'Provides actionable insights from customer interactions to improve products and services.', isSelected: false },
          { id: '4', text: 'Enables small businesses to provide enterprise-level customer service at an affordable price point.', isSelected: false },
          { id: '5', text: 'Uses proprietary AI to learn from each interaction, continuously improving response quality.', isSelected: false }
        );
        break;
      case 'business_model':
        variations.push(
          { id: '1', text: 'Tiered SaaS subscription model with pricing based on volume of customer interactions.', isSelected: false },
          { id: '2', text: 'Freemium model with basic features free and advanced AI capabilities as paid upgrades.', isSelected: false },
          { id: '3', text: 'Usage-based pricing with monthly minimums and volume discounts for larger customers.', isSelected: false },
          { id: '4', text: 'Enterprise licensing model with annual contracts and custom implementation services.', isSelected: false },
          { id: '5', text: 'Platform + marketplace model where third-party developers can sell add-ons and integrations.', isSelected: false }
        );
        break;
      case 'marketing_strategy':
        variations.push(
          { id: '1', text: 'Content marketing focused on customer service ROI and automation best practices.', isSelected: false },
          { id: '2', text: 'Partner-led growth through integrations with popular e-commerce and CRM platforms.', isSelected: false },
          { id: '3', text: 'Free assessment tool that analyzes current customer service metrics and suggests improvements.', isSelected: false },
          { id: '4', text: 'Industry-specific case studies highlighting cost savings and customer satisfaction improvements.', isSelected: false },
          { id: '5', text: 'Community-building strategy with forums for customer service professionals to share best practices.', isSelected: false }
        );
        break;
      case 'revenue_model':
        variations.push(
          { id: '1', text: 'Monthly subscription with tiered pricing based on number of users and features.', isSelected: false },
          { id: '2', text: 'Per-seat pricing with unlimited customer interactions and all features included.', isSelected: false },
          { id: '3', text: 'Core platform subscription plus usage-based billing for AI-powered interactions.', isSelected: false },
          { id: '4', text: 'Annual enterprise contracts with professional services and custom implementation.', isSelected: false },
          { id: '5', text: 'Marketplace revenue share from third-party integrations and add-ons.', isSelected: false }
        );
        break;
      case 'go_to_market':
        variations.push(
          { id: '1', text: 'Target e-commerce segment first with direct sales and content marketing.', isSelected: false },
          { id: '2', text: 'Launch with freemium model to build user base, then upsell premium features.', isSelected: false },
          { id: '3', text: 'Partner with e-commerce platforms for distribution and co-marketing.', isSelected: false },
          { id: '4', text: 'Focus on specific vertical (e.g., fashion retail) to establish strong case studies before expanding.', isSelected: false },
          { id: '5', text: 'Use product-led growth with self-service onboarding and in-product upsells.', isSelected: false }
        );
        break;
    }
    
    return variations;
  };
  
  // Function to select a variation
  const selectVariation = (componentType: ComponentType, variationId: string) => {
    let selectedText = '';
    
    // Update the appropriate state based on the component type
    switch (componentType) {
      case 'problem_statement':
        setProblemStatementVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'solution_concept':
        setSolutionConceptVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'target_audience':
        setTargetAudienceVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'unique_value':
        setUniqueValueVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'business_model':
        setBusinessModelVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'marketing_strategy':
        setMarketingStrategyVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'revenue_model':
        setRevenueModelVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
      case 'go_to_market':
        setGoToMarketVariations(prev => 
          prev.map(v => {
            const isSelected = v.id === variationId;
            if (isSelected) selectedText = v.text;
            return { ...v, isSelected };
          })
        );
        break;
    }
    
    // Call the onSelectVariation callback with the selected text
    if (selectedText) {
      onSelectVariation(componentType, selectedText);
    }
  };
  
  // Function to render variations for a component
  const renderVariations = (componentType: ComponentType, variations: IComponentVariation[]) => {
    return (
      <div className="mt-4 space-y-3">
        {variations.map((variation) => (
          <div 
            key={variation.id} 
            className={`p-3 rounded-md border ${variation.isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-700">{variation.text}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => selectVariation(componentType, variation.id)}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded 
                    ${variation.isSelected 
                      ? 'text-white bg-indigo-600 hover:bg-indigo-700' 
                      : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'}`}
                >
                  {variation.isSelected ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </>
                  ) : 'Select'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Problem Statement Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Problem Statement Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different ways to frame the problem your idea solves</p>
          </div>
          <button
            onClick={() => generateComponentVariations('problem_statement')}
            disabled={isGeneratingVariations === 'problem_statement'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'problem_statement' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {problemStatementVariations.length > 0 && renderVariations('problem_statement', problemStatementVariations)}
      </div>
      
      {/* Solution Concept Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Solution Concept Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different approaches to solving the problem</p>
          </div>
          <button
            onClick={() => generateComponentVariations('solution_concept')}
            disabled={isGeneratingVariations === 'solution_concept'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'solution_concept' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {solutionConceptVariations.length > 0 && renderVariations('solution_concept', solutionConceptVariations)}
      </div>
      
      {/* Target Audience Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Target Audience Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different potential user segments</p>
          </div>
          <button
            onClick={() => generateComponentVariations('target_audience')}
            disabled={isGeneratingVariations === 'target_audience'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'target_audience' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {targetAudienceVariations.length > 0 && renderVariations('target_audience', targetAudienceVariations)}
      </div>
      
      {/* Unique Value Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Unique Value Proposition Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different ways to express your value proposition</p>
          </div>
          <button
            onClick={() => generateComponentVariations('unique_value')}
            disabled={isGeneratingVariations === 'unique_value'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'unique_value' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {uniqueValueVariations.length > 0 && renderVariations('unique_value', uniqueValueVariations)}
      </div>
      
      {/* Business Model Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Business Model Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different approaches to creating and capturing value</p>
          </div>
          <button
            onClick={() => generateComponentVariations('business_model')}
            disabled={isGeneratingVariations === 'business_model'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <BarChart4 className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'business_model' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {businessModelVariations.length > 0 && renderVariations('business_model', businessModelVariations)}
      </div>
      
      {/* Marketing Strategy Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Marketing Strategy Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different approaches to reaching and acquiring customers</p>
          </div>
          <button
            onClick={() => generateComponentVariations('marketing_strategy')}
            disabled={isGeneratingVariations === 'marketing_strategy'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <TrendingUp className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'marketing_strategy' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {marketingStrategyVariations.length > 0 && renderVariations('marketing_strategy', marketingStrategyVariations)}
      </div>
      
      {/* Revenue Model Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Revenue Model Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different approaches to monetization and pricing</p>
          </div>
          <button
            onClick={() => generateComponentVariations('revenue_model')}
            disabled={isGeneratingVariations === 'revenue_model'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <DollarSign className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'revenue_model' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {revenueModelVariations.length > 0 && renderVariations('revenue_model', revenueModelVariations)}
      </div>
      
      {/* Go-to-Market Variations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Go-to-Market Strategy Variations</h3>
            <p className="text-xs text-gray-500 mt-1">Generate different approaches to launching and scaling your business</p>
          </div>
          <button
            onClick={() => generateComponentVariations('go_to_market')}
            disabled={isGeneratingVariations === 'go_to_market'}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <Rocket className="h-3 w-3 mr-1" />
            {isGeneratingVariations === 'go_to_market' ? 'Generating...' : 'Generate Variations'}
          </button>
        </div>
        {goToMarketVariations.length > 0 && renderVariations('go_to_market', goToMarketVariations)}
      </div>
    </div>
  );
}
