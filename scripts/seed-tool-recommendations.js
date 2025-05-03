/**
 * Script to seed initial tool recommendations data
 * 
 * This script populates the tool_recommendations table with initial data
 * to demonstrate the recommendation engine functionality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function seedToolRecommendations() {
  console.log('Starting tool recommendations seeding process...');

  try {
    // Step 1: Retrieve all journey steps
    const { data: steps, error: stepsError } = await supabase
      .from('journey_steps')
      .select('id, name, phase_id')
      .limit(50); // Limit to 50 steps to avoid too much data
    
    if (stepsError) {
      throw stepsError;
    }
    
    if (!steps || steps.length === 0) {
      console.log('No journey steps found. Exiting.');
      return;
    }
    
    console.log(`Found ${steps.length} journey steps.`);
    
    // Step 2: Retrieve all tools
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('id, name, category');
    
    if (toolsError) {
      throw toolsError;
    }
    
    if (!tools || tools.length === 0) {
      console.log('No tools found. Exiting.');
      return;
    }
    
    console.log(`Found ${tools.length} tools.`);
    
    // Group tools by category for better matching
    const toolsByCategory = tools.reduce((acc, tool) => {
      const category = tool.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {});
    
    // Step 3: Create recommendations
    const recommendations = [];
    const categories = Object.keys(toolsByCategory);
    
    // For each step, assign 2-5 tools with varying relevance scores
    for (const step of steps) {
      // Randomly determine how many tools to recommend for this step (2-5)
      const numTools = 2 + Math.floor(Math.random() * 4);
      
      // Randomly select a primary category for this step
      const primaryCategory = categories[Math.floor(Math.random() * categories.length)];
      const primaryTools = toolsByCategory[primaryCategory] || [];
      
      // Randomly select a secondary category for this step
      const secondaryCategory = categories[Math.floor(Math.random() * categories.length)];
      const secondaryTools = toolsByCategory[secondaryCategory] || [];
      
      // Combine tools from both categories, prioritizing primary
      const combinedTools = [...primaryTools, ...secondaryTools];
      const selectedTools = new Set();
      
      // Add recommendations
      for (let i = 0; i < numTools && i < combinedTools.length; i++) {
        let toolIndex;
        // Try to find a tool that hasn't been selected yet
        do {
          toolIndex = Math.floor(Math.random() * combinedTools.length);
        } while (selectedTools.has(toolIndex) && selectedTools.size < combinedTools.length);
        
        if (selectedTools.size >= combinedTools.length) break;
        selectedTools.add(toolIndex);
        
        // Higher relevance scores for primary category tools
        const isPrimaryTool = toolIndex < primaryTools.length;
        const baseRelevanceScore = isPrimaryTool ? 7.0 : 5.0;
        const randomAdjustment = (Math.random() * 3) - 1; // Random adjustment between -1 and 2
        const relevanceScore = Math.max(1.0, Math.min(10.0, baseRelevanceScore + randomAdjustment));
        
        recommendations.push({
          step_id: step.id,
          tool_id: combinedTools[toolIndex].id,
          relevance_score: Number(relevanceScore.toFixed(2))
        });
      }
    }
    
    console.log(`Generated ${recommendations.length} tool recommendations.`);
    
    // Step 4: Insert recommendations in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < recommendations.length; i += BATCH_SIZE) {
      const batch = recommendations.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from('tool_recommendations')
        .upsert(batch, { onConflict: 'step_id, tool_id' });
      
      if (insertError) {
        console.error(`Error inserting batch ${i/BATCH_SIZE + 1}:`, insertError);
      } else {
        console.log(`Successfully inserted batch ${i/BATCH_SIZE + 1} of ${Math.ceil(recommendations.length/BATCH_SIZE)}`);
      }
    }
    
    console.log('✅ Tool recommendations seeding completed successfully!');
    
    // Step 5: Verify data was inserted
    const { count, error: countError } = await supabase
      .from('tool_recommendations')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting inserted recommendations:', countError);
    } else {
      console.log(`Total tool recommendations in database: ${count}`);
    }
    
  } catch (error) {
    console.error('Error seeding tool recommendations:', error);
  }
}

// Run the seeding function
seedToolRecommendations().catch(console.error);
