/**
 * Tool Data Enhancement Script
 * Part of Sprint 9: Data Transformation for Journey Experience Redesign
 * 
 * This script enhances existing tool records with additional categorization
 * and metadata to support the new challenge-based journey system.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Tool categories mapping
const toolCategories = {
  'analytics': {
    primaryCategory: 'Analytics',
    secondaryCategories: ['Data', 'Business Intelligence'],
    toolType: 'SaaS'
  },
  'marketing': {
    primaryCategory: 'Marketing',
    secondaryCategories: ['Advertising', 'Growth'],
    toolType: 'SaaS'
  },
  'sales': {
    primaryCategory: 'Sales',
    secondaryCategories: ['CRM', 'Revenue'],
    toolType: 'SaaS'
  },
  'finance': {
    primaryCategory: 'Finance',
    secondaryCategories: ['Accounting', 'Budgeting'],
    toolType: 'SaaS'
  },
  'productivity': {
    primaryCategory: 'Productivity',
    secondaryCategories: ['Collaboration', 'Project Management'],
    toolType: 'SaaS'
  },
  'operations': {
    primaryCategory: 'Operations',
    secondaryCategories: ['Process', 'Management'],
    toolType: 'SaaS'
  },
  'legal': {
    primaryCategory: 'Legal',
    secondaryCategories: ['Compliance', 'Contracts'],
    toolType: 'Service'
  },
  'hr': {
    primaryCategory: 'HR',
    secondaryCategories: ['Recruiting', 'People Management'],
    toolType: 'SaaS'
  },
  'development': {
    primaryCategory: 'Development',
    secondaryCategories: ['Engineering', 'Software'],
    toolType: 'SaaS'
  },
  'design': {
    primaryCategory: 'Design',
    secondaryCategories: ['UX/UI', 'Creative'],
    toolType: 'SaaS'
  },
  'communication': {
    primaryCategory: 'Communication',
    secondaryCategories: ['Collaboration', 'Messaging'],
    toolType: 'SaaS'
  },
  'customer_support': {
    primaryCategory: 'Customer Support',
    secondaryCategories: ['Service', 'Feedback'],
    toolType: 'SaaS'
  },
  'templates': {
    primaryCategory: 'Templates',
    secondaryCategories: ['Documents', 'Frameworks'],
    toolType: 'Template'
  },
  'other': {
    primaryCategory: 'Other',
    secondaryCategories: [],
    toolType: 'SaaS'
  }
};

// Tool metadata templates
const toolMetadataTemplates = {
  'SaaS': {
    features: ['Easy setup', 'Cloud-based', 'Regular updates'],
    learningCurve: 'Medium',
    integrationLevel: 'Medium',
    typicalTimeInvestment: '1-4 weeks',
    bestFor: ['Teams of 2-50', 'Digital-first businesses'],
    limitations: ['May require subscription', 'Internet connection required']
  },
  'Template': {
    features: ['Ready to use', 'Customizable', 'Time-saving'],
    learningCurve: 'Low',
    integrationLevel: 'Low',
    typicalTimeInvestment: '1-3 days',
    bestFor: ['Quick implementation', 'Standard processes'],
    limitations: ['Limited customization', 'May need updates over time']
  },
  'Framework': {
    features: ['Comprehensive methodology', 'Best practices', 'Structured approach'],
    learningCurve: 'High',
    integrationLevel: 'Medium',
    typicalTimeInvestment: '2-8 weeks',
    bestFor: ['Complex problems', 'Long-term planning'],
    limitations: ['Requires commitment', 'May need expertise to implement']
  },
  'Service': {
    features: ['Expert assistance', 'Customized solutions', 'Ongoing support'],
    learningCurve: 'Medium',
    integrationLevel: 'High',
    typicalTimeInvestment: '1-6 months',
    bestFor: ['Specialized needs', 'Critical business functions'],
    limitations: ['Higher cost', 'Dependency on provider']
  }
};

// Pricing models based on premium status
const pricingModels = {
  true: ['Subscription', 'One-time', 'Custom'],
  false: ['Free', 'Freemium']
};

/**
 * Main function to enhance tool data
 */
async function enhanceToolData() {
  console.log('Starting tool data enhancement...');
  
  try {
    // Fetch all tools from journey_step_tools table
    const { data: stepTools, error: stepToolsError } = await supabase
      .from('journey_step_tools')
      .select('*');
    
    if (stepToolsError) {
      throw stepToolsError;
    }
    
    console.log(`Found ${stepTools.length} tools to enhance.`);
    
    // Process each tool
    for (const tool of stepTools) {
      // Derive category from existing data or default to 'other'
      const categoryKey = tool.category?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'other';
      const category = toolCategories[categoryKey] || toolCategories.other;
      
      // Derive tool type from existing data or default based on category
      const toolType = tool.type || category.toolType;
      
      // Get metadata template based on tool type
      const metadataTemplate = toolMetadataTemplates[toolType] || toolMetadataTemplates.SaaS;
      
      // Randomly select a pricing model based on premium status
      const possibleModels = pricingModels[String(tool.is_premium)];
      const pricingModel = possibleModels[Math.floor(Math.random() * possibleModels.length)];
      
      // Prepare enhanced tool data
      const enhancedTool = {
        id: tool.id,
        name: tool.name,
        description: tool.description || `${tool.name} is a tool for ${category.primaryCategory.toLowerCase()} tasks.`,
        url: tool.url,
        logo_url: tool.logo_url,
        
        // Enhanced categorization
        primary_category: category.primaryCategory,
        secondary_categories: category.secondaryCategories,
        tool_type: toolType,
        
        // Pricing and accessibility
        is_premium: tool.is_premium,
        pricing_model: pricingModel,
        starting_price: tool.is_premium ? 9.99 + (Math.random() * 90) : null,
        
        // Tool metadata
        features: metadataTemplate.features,
        learning_curve: metadataTemplate.learningCurve,
        integration_level: metadataTemplate.integrationLevel,
        typical_time_investment: metadataTemplate.typicalTimeInvestment,
        best_for: metadataTemplate.bestFor,
        limitations: metadataTemplate.limitations,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert enhanced tool into journey_tools table
      const { error: insertError } = await supabase
        .from('journey_tools')
        .upsert(enhancedTool);
      
      if (insertError) {
        console.error(`Error enhancing tool ${tool.id}:`, insertError);
      } else {
        console.log(`Enhanced tool: ${tool.name}`);
      }
    }
    
    console.log('Tool data enhancement completed successfully!');
    
  } catch (error) {
    console.error('Error enhancing tool data:', error);
  }
}

// Run the enhancement process
enhanceToolData()
  .then(() => console.log('Process completed.'))
  .catch(err => console.error('Process failed:', err));
