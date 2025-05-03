/**
 * Tool Relationship Generator Script
 * Part of Sprint 9: Data Transformation for Journey Experience Redesign
 * 
 * This script generates tool relationships for the tool pathway feature,
 * creating connections between related tools based on categories and functions.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Relationship types with descriptions
const relationshipTypes = {
  'alternative': 'Can be used instead of the source tool with similar functionality',
  'complement': 'Works well alongside the source tool to enhance functionality',
  'supersedes': 'Newer version or improved replacement for the source tool',
  'precedes': 'Should be used before the source tool in a workflow',
  'integrates_with': 'Has built-in integration capabilities with the source tool'
};

/**
 * Main function to generate tool relationships
 */
async function generateToolRelationships() {
  console.log('Starting tool relationship generation...');
  
  try {
    // Fetch all tools from journey_tools table
    const { data: tools, error: toolsError } = await supabase
      .from('journey_tools')
      .select('*');
    
    if (toolsError) {
      throw toolsError;
    }
    
    console.log(`Found ${tools.length} tools for relationship generation.`);
    
    // Create a lookup of tools by category
    const toolsByCategory = {};
    tools.forEach(tool => {
      const category = tool.primary_category;
      if (!toolsByCategory[category]) {
        toolsByCategory[category] = [];
      }
      toolsByCategory[category].push(tool);
    });
    
    // Track created relationships to avoid duplicates
    const createdRelationships = new Set();
    
    // Batch for bulk insert
    const relationshipBatch = [];
    
    // Generate relationships
    for (const tool of tools) {
      // Find tools in the same category for 'alternative' relationships
      const sameCategory = toolsByCategory[tool.primary_category]?.filter(t => t.id !== tool.id) || [];
      
      // Find random alternatives (up to 3)
      const alternatives = shuffleArray(sameCategory).slice(0, 3);
      for (const alternative of alternatives) {
        // Create a unique key for this relationship
        const relationshipKey = `${tool.id}|${alternative.id}|alternative`;
        if (!createdRelationships.has(relationshipKey)) {
          relationshipBatch.push({
            source_tool_id: tool.id,
            target_tool_id: alternative.id,
            relationship_type: 'alternative',
            description: relationshipTypes.alternative,
            strength: Math.floor(Math.random() * 4) + 6, // 6-9 (relatively strong alternatives)
            created_at: new Date().toISOString()
          });
          createdRelationships.add(relationshipKey);
        }
      }
      
      // Find complements from different categories (up to 2)
      const otherCategories = Object.keys(toolsByCategory).filter(cat => cat !== tool.primary_category);
      if (otherCategories.length > 0) {
        // Randomly select 1-2 categories
        const numCategories = Math.min(2, otherCategories.length);
        const selectedCategories = shuffleArray(otherCategories).slice(0, numCategories);
        
        for (const category of selectedCategories) {
          if (toolsByCategory[category]?.length > 0) {
            // Select a random tool from this category
            const complementTool = toolsByCategory[category][Math.floor(Math.random() * toolsByCategory[category].length)];
            
            // Create a unique key for this relationship
            const relationshipKey = `${tool.id}|${complementTool.id}|complement`;
            if (!createdRelationships.has(relationshipKey)) {
              relationshipBatch.push({
                source_tool_id: tool.id,
                target_tool_id: complementTool.id,
                relationship_type: 'complement',
                description: relationshipTypes.complement,
                strength: Math.floor(Math.random() * 3) + 7, // 7-9 (strong complements)
                created_at: new Date().toISOString()
              });
              createdRelationships.add(relationshipKey);
            }
          }
        }
      }
      
      // Occasionally create supersedes/precedes relationships
      if (Math.random() < 0.2) { // 20% chance
        // Find a random tool from any category
        const allOtherTools = tools.filter(t => t.id !== tool.id);
        if (allOtherTools.length > 0) {
          const randomTool = allOtherTools[Math.floor(Math.random() * allOtherTools.length)];
          const relationshipType = Math.random() < 0.5 ? 'supersedes' : 'precedes';
          
          // Create a unique key for this relationship
          const relationshipKey = `${tool.id}|${randomTool.id}|${relationshipType}`;
          if (!createdRelationships.has(relationshipKey)) {
            relationshipBatch.push({
              source_tool_id: tool.id,
              target_tool_id: randomTool.id,
              relationship_type: relationshipType,
              description: relationshipTypes[relationshipType],
              strength: Math.floor(Math.random() * 5) + 5, // 5-9 (variable strength)
              created_at: new Date().toISOString()
            });
            createdRelationships.add(relationshipKey);
          }
        }
      }
      
      // Occasionally create 'integrates_with' relationships
      if (Math.random() < 0.3) { // 30% chance
        // Find tools from any category
        const allOtherTools = tools.filter(t => t.id !== tool.id);
        if (allOtherTools.length > 0) {
          // Select 1-2 random tools
          const numTools = Math.floor(Math.random() * 2) + 1;
          const selectedTools = shuffleArray(allOtherTools).slice(0, numTools);
          
          for (const integratedTool of selectedTools) {
            // Create a unique key for this relationship
            const relationshipKey = `${tool.id}|${integratedTool.id}|integrates_with`;
            if (!createdRelationships.has(relationshipKey)) {
              relationshipBatch.push({
                source_tool_id: tool.id,
                target_tool_id: integratedTool.id,
                relationship_type: 'integrates_with',
                description: relationshipTypes.integrates_with,
                strength: Math.floor(Math.random() * 3) + 7, // 7-9 (strong integration)
                created_at: new Date().toISOString()
              });
              createdRelationships.add(relationshipKey);
            }
          }
        }
      }
    }
    
    console.log(`Generated ${relationshipBatch.length} tool relationships.`);
    
    // Insert relationships in batches
    if (relationshipBatch.length > 0) {
      const { error: insertError } = await supabase
        .from('journey_tool_relationships')
        .insert(relationshipBatch);
      
      if (insertError) {
        console.error('Error inserting tool relationships:', insertError);
      } else {
        console.log('Successfully inserted tool relationships.');
      }
    }
    
    console.log('Tool relationship generation completed!');
    
  } catch (error) {
    console.error('Error generating tool relationships:', error);
  }
}

/**
 * Shuffles an array randomly
 * @param {Array} array The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Run the generation process
generateToolRelationships()
  .then(() => console.log('Process completed.'))
  .catch(err => console.error('Process failed:', err));
