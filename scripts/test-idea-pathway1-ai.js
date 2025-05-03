// Script to test the AI response parsing in idea-pathway1-ai.service.ts

// Use CommonJS requires since we're in a Node.js script
const { ideaPathway1AIService } = require('../src/lib/services/idea-pathway1-ai.service');
const { generalLLMService } = require('../src/lib/services/general-llm.service');

// Mock the generalLLMService.query method to return different test cases
const originalQuery = generalLLMService.query;
generalLLMService.query = async (prompt, options) => {
  console.log('Testing with mock AI response...');
  
  // Return a properly formatted response object that mimics the OpenAI response shape
  return {
    content: getMockResponse(),
    role: 'assistant'
  };
};

// Test idea
const testIdea = {
  id: 'test-idea-123',
  title: 'Smart Home Automation System',
  description: 'A system that automates various aspects of home management like climate control, security, and energy efficiency.',
  solution_concept: 'Using IoT devices and AI to create a seamless home management experience',
  used_company_context: false
};

// Function to get a mock response - adjust this to test different response formats
function getMockResponse() {
  // Test with various malformed JSON responses that might be causing the error
  
  // Case 1: Valid JSON array but with an extra comma
  return `
    Here are some business ideas based on your prompt:
    
    [
      {
        "title": "Smart Home Central Hub",
        "description": "A central control system for all smart home devices",
        "problem_statement": "Too many different apps needed to control various smart devices",
        "solution_concept": "Single interface that controls all IoT devices regardless of manufacturer",
        "target_audience": "Smart home enthusiasts and tech-savvy homeowners",
        "unique_value": "Universal compatibility with major IoT ecosystems",
        "business_model": "Hardware sales + subscription",
        "marketing_strategy": "Partner with home builders and contractors",
        "revenue_model": "Direct hardware sales + premium subscription",
        "go_to_market": "Launch with early adopter program",
        "market_size": "USD 25-30 billion by 2027",
        "competition": ["Amazon Echo", "Google Home", "Samsung SmartThings", "Apple HomeKit"],
        "revenue_streams": ["Hardware sales", "Premium subscription", "Integration fees from third-party manufacturers", "Data insights for partners"],
        "cost_structure": ["Hardware manufacturing", "Software development", "Marketing", "Customer support", "Server infrastructure"],
        "key_metrics": ["Active users", "Subscription renewal rate", "Devices per household", "Customer acquisition cost", "Lifetime value"],
        "strengths": ["Universal compatibility", "Single interface convenience", "Reduced complexity"],
        "weaknesses": ["Requires cooperation from manufacturers", "Complex integration requirements"],
        "opportunities": ["Growing smart home market", "Increasing consumer frustration with fragmented systems"],
        "threats": ["Big tech competitors", "Manufacturer closed ecosystems"]
      },
      {
        "title": "Energy Optimization AI",
        "description": "Machine learning system that manages home energy usage to reduce costs",
        "problem_statement": "High energy bills and inefficient usage of electricity",
        "solution_concept": "AI that learns usage patterns and automatically optimizes energy consumption",
        "target_audience": "Cost-conscious homeowners and environmental advocates",
        "unique_value": "Proven 30% reduction in energy costs",
        "business_model": "SaaS with hardware sensors",
        "marketing_strategy": "Partnership with utility companies and energy providers",
        "revenue_model": "Subscription based on percentage of savings",
        "go_to_market": "Pilot with selected utility companies",
        "market_size": "USD 5-7 billion by 2026",
        "competition": ["Sense Energy Monitor", "Nest", "Ecobee"],
        "revenue_streams": ["Monthly subscription", "Hardware sales", "Utility company partnerships", "Carbon credit marketplace"],
        "cost_structure": ["R&D", "Hardware manufacturing", "AI model training", "Sales and marketing", "Operations"],
        "key_metrics": ["Energy savings percentage", "Customer retention", "Utility partnerships", "Hardware units sold"],
        "strengths": ["Measurable ROI for customers", "Environmentally friendly", "Passive savings requires no behavior change"],
        "weaknesses": ["Dependent on accurate sensors", "Requires historical data to be effective"],
        "opportunities": ["Rising energy costs", "Government incentives for energy efficiency", "Corporate ESG goals"],
        "threats": ["Regulatory changes", "Low-cost competitors", "Changing utility pricing models"]
      },
    ]
  `;
  
  // Case 2: JSON with formatting issues (missing quotes, extra commas, etc.)
  /* return `
    Here are some innovative business ideas:
    
    [
      {
        "title": "Smart Home Hub", 
        "description": "A central system for smart devices",
        problem_statement: "Too many different apps and interfaces",
        "solution_concept": "Universal controller for all smart devices",
        "target_audience": "Homeowners with multiple smart devices",
        "unique_value": "Single interface convenience",
        "business_model": "Hardware + subscription",
        "marketing_strategy": "Direct to consumer and partnerships",
        "revenue_model": "One-time purchase plus optional subscription",
        "go_to_market": "Online direct sales",
        "market_size": "$50 billion by 2026",
        "competition": ["Amazon", "Google", "Apple"],
        "revenue_streams": ["Hardware sales", "Premium subscription", "Partnership fees",],
        "cost_structure": ["Manufacturing", "R&D", "Marketing", "Operations",],
        "key_metrics": ["Units sold", "Active users", "Subscription rate",],
        "strengths": ["Convenience", "Universal compatibility"],
        "weaknesses": ["Competition from tech giants"],
        "opportunities": ["Growing market", "Consumer frustration with fragmentation"],
        "threats": ["Big tech competition", "Changing standards"]
      }
    ]
  `; */
  
  // Case 3: Multiple JSON objects without proper array notation
  /* return `
    Here are several business ideas based on your concept:
    
    {
      "title": "Home Energy AI",
      "description": "AI-powered energy management system",
      "problem_statement": "High energy costs and inefficiency",
      "solution_concept": "Smart optimization of energy usage",
      "target_audience": "Environmentally conscious homeowners",
      "unique_value": "30% reduction in energy bills",
      "business_model": "Hardware with subscription",
      "marketing_strategy": "Utility partnerships",
      "revenue_model": "Upfront cost plus subscription",
      "go_to_market": "Direct to consumer",
      "market_size": "$10 billion by 2028",
      "competition": ["Nest", "Ecobee", "Sense"],
      "revenue_streams": ["Hardware", "Subscription", "Data insights"],
      "cost_structure": ["Manufacturing", "R&D", "Marketing"],
      "key_metrics": ["Energy saved", "Customer retention", "Units sold"],
      "strengths": ["Measurable ROI", "Environmental impact"],
      "weaknesses": ["Installation complexity"],
      "opportunities": ["Rising energy costs", "Climate awareness"],
      "threats": ["Big tech competition", "Regulatory changes"]
    }
    
    {
      "title": "Smart Security Suite",
      "description": "Integrated home security system",
      "problem_statement": "Fragmented home security solutions",
      "solution_concept": "Unified security platform with AI alerts",
      "target_audience": "Security-conscious homeowners",
      "unique_value": "Comprehensive protection with minimal false alarms",
      "business_model": "Hardware plus monitoring subscription",
      "marketing_strategy": "Insurance partnerships and direct",
      "revenue_model": "Hardware sales and monthly monitoring",
      "go_to_market": "Security dealer channel",
      "market_size": "$15 billion by 2025",
      "competition": ["ADT", "SimpliSafe", "Ring"],
      "revenue_streams": ["Equipment", "Monitoring", "Insurance discounts"],
      "cost_structure": ["Hardware", "Software", "Monitoring centers"],
      "key_metrics": ["Monthly recurring revenue", "Customer acquisition cost"],
      "strengths": ["AI-powered alerts", "Comprehensive solution"],
      "weaknesses": ["Price point higher than DIY solutions"],
      "opportunities": ["Remote work increasing home importance"],
      "threats": ["DIY security systems", "Big tech entry"]
    }
  `; */
}

// Run the test
async function runTest() {
  try {
    console.log('Starting test of idea-pathway1-ai.service.ts...');
    
    // Call the service method that was having issues
    const suggestions = await ideaPathway1AIService.generateCompanySuggestions(
      testIdea,
      'test-user-123',
      2
    );
    
    console.log('Successfully parsed AI response!');
    console.log(`Generated ${suggestions.length} suggestions`);
    console.log('First suggestion:', JSON.stringify(suggestions[0], null, 2));
    
    // Test successful
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Restore the original query method
    generalLLMService.query = originalQuery;
  }
}

// Run the test
runTest();
