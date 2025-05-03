/**
 * Tool Pathway Generator Script
 * Part of Sprint 9: Data Transformation for Journey Experience Redesign
 * 
 * This script generates default tool pathways for challenges,
 * creating recommended sequences of tools for solving specific challenges.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Pathway types
const pathwayTypes = ['recommended', 'alternative'];

// Pathway templates by challenge difficulty
const pathwayTemplates = {
  1: { // Very Easy
    minTools: 1,
    maxTools: 2,
    pathwayCount: 1
  },
  2: { // Easy
    minTools: 1,
    maxTools: 3,
    pathwayCount: 2
  },
  3: { // Medium
    minTools: 2,
    maxTools: 4,
    pathwayCount: 2
  },
  4: { // Hard
    minTools: 3,
    maxTools: 5,
    pathwayCount: 3
  },
  5: { // Very Hard
    minTools: 3,
    maxTools: 6,
    pathwayCount: 3
  }
};

// Descriptions for different pathway types
const pathwayDescriptions = {
  recommended: [
    'Standard approach using industry best practices',
    'Most efficient way to tackle this challenge',
    'Balanced approach suitable for most companies',
    'Recommended for teams with limited resources',
    'Proven methodology with high success rate'
  ],
  alternative: [
    'Alternative approach for specialized needs',
    'Advanced pathway for experienced teams',
    'Simplified approach for smaller companies',
    'Creative solution using innovative tools',
    'Budget-friendly alternative pathway'
  ]
};

/**
 * Main function to generate tool pathways
 */
async function generateToolPathways() {
  console.log('Starting tool pathway generation...');
  
  try {
    // Fetch all challenges from journey_challenges table
    const { data: challenges, error: challengesError } = await supabase
      .from('journey_challenges')
      .select('*');
    
    if (challengesError) {
      throw challengesError;
    }
    
    console.log(`Found ${challenges.length} challenges for pathway generation.`);
    
    // Fetch all tools and their relationships
    const { data: tools, error: toolsError } = await supabase
      .from('journey_tools')
      .select('*');
    
    if (toolsError) {
      throw toolsError;
    }
    
    console.log(`Found ${tools.length} tools to include in pathways.`);
    
    // Fetch tool relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('journey_tool_relationships')
      .select('*');
    
    if (relationshipsError) {
      throw relationshipsError;
    }
    
    console.log(`Found ${relationships.length} tool relationships for pathway generation.`);
    
    // Fetch challenge-tool mappings
    const { data: challengeTools, error: challengeToolsError } = await supabase
      .from('journey_challenge_tools')
      .select('*');
    
    if (challengeToolsError) {
      throw challengeToolsError;
    }
    
    // Create a map of tools by challenge
    const toolsByChallenge = {};
    challengeTools.forEach(mapping => {
      if (!toolsByChallenge[mapping.challenge_id]) {
        toolsByChallenge[mapping.challenge_id] = [];
      }
      toolsByChallenge[mapping.challenge_id].push({
        toolId: mapping.tool_id,
        isRecommended: mapping.is_recommended,
        relevanceScore: mapping.relevance_score,
        orderIndex: mapping.order_index
      });
    });
    
    // Create a map of related tools
    const relatedTools = {};
    relationships.forEach(rel => {
      if (!relatedTools[rel.source_tool_id]) {
        relatedTools[rel.source_tool_id] = [];
      }
      relatedTools[rel.source_tool_id].push({
        toolId: rel.target_tool_id,
        relationshipType: rel.relationship_type,
        strength: rel.strength
      });
    });
    
    // Batch for bulk insert
    const pathwayBatch = [];
    
    // Generate pathways for each challenge
    for (const challenge of challenges) {
      const challengeId = challenge.id;
      const difficulty = challenge.difficulty_level || 3; // Default to medium if not set
      const template = pathwayTemplates[difficulty];
      
      // Get tools for this challenge
      const challengeToolList = toolsByChallenge[challengeId] || [];
      
      // Skip if no tools are available
      if (challengeToolList.length === 0) {
        console.log(`No tools found for challenge ${challengeId}, skipping pathway generation.`);
        continue;
      }
      
      // Sort by relevance and recommendation status
      challengeToolList.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) {
          return b.isRecommended ? 1 : -1;
        }
        return b.relevanceScore - a.relevanceScore;
      });
      
      // Generate pathways based on template
      const pathwaysToGenerate = Math.min(template.pathwayCount, 
        Math.floor(challengeToolList.length / template.minTools));
      
      for (let i = 0; i < pathwaysToGenerate; i++) {
        // Determine pathway type (first is always recommended)
        const pathwayType = i === 0 ? 'recommended' : pathwayTypes[Math.floor(Math.random() * pathwayTypes.length)];
        
        // Determine number of tools in pathway
        const numTools = Math.floor(Math.random() * (template.maxTools - template.minTools + 1)) + template.minTools;
        
        // Select tools for pathway
        const pathwayTools = selectToolsForPathway(
          challengeToolList, 
          numTools, 
          relatedTools, 
          i === 0 // prioritize recommended tools for first pathway
        );
        
        // Skip if we couldn't select enough tools
        if (pathwayTools.length < template.minTools) {
          continue;
        }
        
        // Generate a random description
        const descriptions = pathwayDescriptions[pathwayType];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        // Create pathway name
        const pathwayName = i === 0 ? 
          `Standard Approach: ${challenge.name}` : 
          `Alternative ${i}: ${challenge.name}`;
        
        // Create the pathway
        pathwayBatch.push({
          name: pathwayName,
          description,
          challenge_id: challengeId,
          tool_sequence: pathwayTools.map(t => t.toolId),
          pathway_type: pathwayType,
          usage_count: Math.floor(Math.random() * 20) + 1, // Mock usage count
          avg_rating: (Math.random() * 2) + 3, // Random rating between 3-5
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    console.log(`Generated ${pathwayBatch.length} tool pathways.`);
    
    // Insert pathways in batches
    if (pathwayBatch.length > 0) {
      const { error: insertError } = await supabase
        .from('journey_tool_pathways')
        .insert(pathwayBatch);
      
      if (insertError) {
        console.error('Error inserting tool pathways:', insertError);
      } else {
        console.log('Successfully inserted tool pathways.');
      }
    }
    
    console.log('Tool pathway generation completed!');
    
  } catch (error) {
    console.error('Error generating tool pathways:', error);
  }
}

/**
 * Selects tools for a pathway based on relevance and relationships
 * @param {Array} toolList List of available tools for the challenge
 * @param {number} count Number of tools to select
 * @param {Object} relatedTools Map of related tools
 * @param {boolean} prioritizeRecommended Whether to prioritize recommended tools
 * @returns {Array} Selected tools for the pathway
 */
function selectToolsForPathway(toolList, count, relatedTools, prioritizeRecommended) {
  // Clone the list to avoid modifying the original
  const availableTools = [...toolList];
  
  // Start with highest relevance (and recommended if prioritized)
  availableTools.sort((a, b) => {
    if (prioritizeRecommended && a.isRecommended !== b.isRecommended) {
      return a.isRecommended ? -1 : 1;
    }
    return b.relevanceScore - a.relevanceScore;
  });
  
  // Always select the most relevant tool as starting point
  const selectedTools = [availableTools.shift()];
  
  // Keep selecting until we reach the count or run out of tools
  while (selectedTools.length < count && availableTools.length > 0) {
    const lastToolId = selectedTools[selectedTools.length - 1].toolId;
    
    // Check if there are related tools that complement or integrate with the last selected tool
    let candidateFound = false;
    
    if (relatedTools[lastToolId]) {
      // Find related tools that are in the available tools list
      const relatedOptions = relatedTools[lastToolId].filter(rel => 
        rel.relationshipType === 'complement' || rel.relationshipType === 'integrates_with'
      );
      
      for (const relatedOption of relatedOptions) {
        const availableIndex = availableTools.findIndex(t => t.toolId === relatedOption.toolId);
        if (availableIndex >= 0) {
          // Found a related tool in the available list
          selectedTools.push(availableTools.splice(availableIndex, 1)[0]);
          candidateFound = true;
          break;
        }
      }
    }
    
    // If no related tool found, just pick the next best available tool
    if (!candidateFound && availableTools.length > 0) {
      selectedTools.push(availableTools.shift());
    }
  }
  
  return selectedTools;
}

// Run the generation process
generateToolPathways()
  .then(() => console.log('Process completed.'))
  .catch(err => console.error('Process failed:', err));
