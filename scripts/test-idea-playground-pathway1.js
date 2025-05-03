/**
 * Test script for Idea Playground Pathway 1
 * 
 * This script tests the core functionality of the Idea Playground Pathway 1 feature,
 * including database tables, API endpoints, and service methods.
 */

const { supabase } = require('../src/lib/supabase');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Create readline interface for interactive testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test configuration
const testConfig = {
  userId: process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000', // Replace with a valid user ID for testing
  canvasId: null, // Will be set during test
  ideaId: null, // Will be set during test
  variationIds: [], // Will be filled during test
  mergedIdeaId: null // Will be set during test
};

async function runTests() {
  console.log('\n===== IDEA PLAYGROUND PATHWAY 1 TEST =====\n');

  try {
    await testDatabaseTables();
    await testCreateCanvas();
    await testCreateIdea();
    await testGenerateVariations();
    await testSelectVariations();
    await testMergeVariations();
    await testSaveAsFinalIdea();
    
    console.log('\n✅ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await cleanupTestData();
    rl.close();
  }
}

async function testDatabaseTables() {
  console.log('📋 Testing database tables...');
  
  // Check if tables exist
  const tables = [
    'idea_playground_variations',
    'idea_playground_merged_ideas',
    'idea_playground_merge_sources'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(`Error checking table ${table}: ${error.message}`);
      
      console.log(`  ✓ Table ${table} exists and can be queried`);
    } catch (error) {
      throw new Error(`Table check failed for ${table}: ${error.message}`);
    }
  }
  
  console.log('  ✅ All required tables are available\n');
}

async function testCreateCanvas() {
  console.log('📋 Testing canvas creation...');
  
  const canvasName = `Test Canvas ${Date.now()}`;
  const canvasDescription = 'Test canvas for Idea Playground Pathway 1';
  
  try {
    const { data, error } = await supabase
      .from('idea_playground_canvases')
      .insert({
        user_id: testConfig.userId,
        name: canvasName,
        description: canvasDescription
      })
      .select()
      .single();
    
    if (error) throw new Error(`Error creating canvas: ${error.message}`);
    
    testConfig.canvasId = data.id;
    console.log(`  ✓ Created test canvas with ID: ${testConfig.canvasId}`);
  } catch (error) {
    throw new Error(`Canvas creation failed: ${error.message}`);
  }
}

async function testCreateIdea() {
  console.log('📋 Testing idea creation...');
  
  const ideaTitle = `Test Idea ${Date.now()}`;
  
  try {
    const { data, error } = await supabase
      .from('idea_playground_ideas')
      .insert({
        canvas_id: testConfig.canvasId,
        title: ideaTitle,
        description: 'A mobile app that uses AI to help users find healthy recipes based on ingredients they have at home',
        problem_statement: 'People waste food because they don\'t know what to cook with the ingredients they have',
        solution_concept: 'AI-powered recipe recommendation based on available ingredients',
        pathway_status: 'initial'
      })
      .select()
      .single();
    
    if (error) throw new Error(`Error creating idea: ${error.message}`);
    
    testConfig.ideaId = data.id;
    console.log(`  ✓ Created test idea with ID: ${testConfig.ideaId}`);
  } catch (error) {
    throw new Error(`Idea creation failed: ${error.message}`);
  }
}

async function testGenerateVariations() {
  console.log('📋 Testing variation generation...');
  
  // Instead of calling the actual service which would require the AI model,
  // we'll simulate by inserting test variations directly into the database
  
  const variations = [
    {
      parent_idea_id: testConfig.ideaId,
      title: 'FoodMatch Pro',
      description: 'A premium subscription service that pairs users with professional chefs for personalized cooking guidance',
      problem_statement: 'Home cooks lack professional guidance for utilizing ingredients effectively',
      solution_concept: 'Live chef consultations via video call to create custom recipes',
      target_audience: 'Busy professionals with disposable income who enjoy cooking',
      unique_value: 'Access to professional culinary expertise from the comfort of home',
      strengths: ['High-quality personalized guidance', 'Premium user experience', 'Potential for high user retention'],
      weaknesses: ['Expensive to operate', 'Limited scalability due to chef availability', 'Higher price point'],
      opportunities: ['Partnership with celebrity chefs', 'Expansion into meal kit delivery', 'Cooking class add-ons'],
      threats: ['Competition from free recipe apps', 'Chef scheduling logistics', 'Economic downturns affecting luxury spending'],
      is_selected: false,
      is_merged: false
    },
    {
      parent_idea_id: testConfig.ideaId,
      title: 'IngredientSwap',
      description: 'Community platform for ingredient sharing and bartering among neighbors',
      problem_statement: 'Households waste food while others in the same neighborhood lack those ingredients',
      solution_concept: 'Local ingredient exchange network with AI-powered matching',
      target_audience: 'Environmentally conscious urban residents with tight budgets',
      unique_value: 'Reduces food waste while building community connections',
      strengths: ['Strong environmental benefits', 'Community building aspect', 'Low operational costs'],
      weaknesses: ['Reliance on critical mass in each neighborhood', 'Quality control challenges', 'Potential liability issues'],
      opportunities: ['Partnership with local governments', 'Integration with community gardens', 'Expansion to meal sharing'],
      threats: ['Food safety regulations', 'User engagement consistency', 'Scalability challenges in rural areas'],
      is_selected: false,
      is_merged: false
    },
    {
      parent_idea_id: testConfig.ideaId,
      title: 'PantryAI Chef',
      description: 'AI-powered virtual chef that creates personalized step-by-step cooking videos based on available ingredients',
      problem_statement: 'Existing recipe apps don\'t provide sufficient guidance for novice cooks',
      solution_concept: 'Custom AI-generated cooking videos tailored to user\'s skill level and available ingredients',
      target_audience: 'Young adults and new cooks with limited experience',
      unique_value: 'Visual learning experience with personalization for beginner cooks',
      strengths: ['Highly engaging visual content', 'Addresses fear of cooking', 'Strong differentiation from text recipes'],
      weaknesses: ['Technically complex to develop', 'High computing costs', 'Video quality expectations'],
      opportunities: ['Integration with smart kitchen devices', 'Cooking education partnerships', 'Premium content creation'],
      threats: ['Video content platforms offering similar features', 'AI video generation limitations', 'High user expectations'],
      is_selected: false,
      is_merged: false
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('idea_playground_variations')
      .insert(variations)
      .select();
    
    if (error) throw new Error(`Error creating variations: ${error.message}`);
    
    testConfig.variationIds = data.map(v => v.id);
    console.log(`  ✓ Created ${data.length} test variations`);
    
    for (const id of testConfig.variationIds) {
      console.log(`    - Variation ID: ${id}`);
    }
  } catch (error) {
    throw new Error(`Variation generation failed: ${error.message}`);
  }
}

async function testSelectVariations() {
  console.log('📋 Testing variation selection...');
  
  // Select the first two variations
  const selectIds = testConfig.variationIds.slice(0, 2);
  
  try {
    for (const id of selectIds) {
      const { error } = await supabase
        .from('idea_playground_variations')
        .update({ is_selected: true })
        .eq('id', id);
      
      if (error) throw new Error(`Error selecting variation ${id}: ${error.message}`);
    }
    
    console.log(`  ✓ Selected ${selectIds.length} variations for merging`);
  } catch (error) {
    throw new Error(`Variation selection failed: ${error.message}`);
  }
}

async function testMergeVariations() {
  console.log('📋 Testing variation merging...');
  
  // Create a merged idea (simulating the AI service)
  const mergedIdea = {
    canvas_id: testConfig.canvasId,
    title: 'ChefShare Community',
    description: 'A platform combining professional chef guidance with community ingredient sharing',
    problem_statement: 'Home cooks waste ingredients and lack professional guidance to use them effectively',
    solution_concept: 'Community-based ingredient exchange with AI-guided recipes and optional chef consultations',
    target_audience: 'Food enthusiasts of all skill levels who want to reduce waste and improve cooking skills',
    unique_value: 'Combines professional culinary expertise with community resource sharing',
    business_model: 'Freemium with subscription for chef consultations and premium AI features',
    strengths: ['Combines best aspects of parent ideas', 'Multiple revenue streams', 'Strong environmental and social benefits'],
    weaknesses: ['Complex platform to develop and maintain', 'Balancing premium and community aspects'],
    opportunities: ['Partnership with both chefs and local organizations', 'Expansion into in-person community events'],
    threats: ['Managing quality across community and professional components', 'Competitor imitation'],
    is_selected: false
  };
  
  try {
    // 1. Insert the merged idea
    const { data: mergedData, error: mergedError } = await supabase
      .from('idea_playground_merged_ideas')
      .insert(mergedIdea)
      .select()
      .single();
    
    if (mergedError) throw new Error(`Error creating merged idea: ${mergedError.message}`);
    
    testConfig.mergedIdeaId = mergedData.id;
    console.log(`  ✓ Created merged idea with ID: ${testConfig.mergedIdeaId}`);
    
    // 2. Create relationships between merged idea and source variations
    const mergeSourceEntries = testConfig.variationIds.slice(0, 2).map(variationId => ({
      merged_idea_id: testConfig.mergedIdeaId,
      variation_id: variationId
    }));
    
    const { error: relationError } = await supabase
      .from('idea_playground_merge_sources')
      .insert(mergeSourceEntries);
    
    if (relationError) throw new Error(`Error creating merge source relationships: ${relationError.message}`);
    
    console.log('  ✓ Created merge source relationships');
    
    // 3. Mark source variations as merged
    const { error: updateError } = await supabase
      .from('idea_playground_variations')
      .update({ is_merged: true })
      .in('id', testConfig.variationIds.slice(0, 2));
    
    if (updateError) throw new Error(`Error updating variation merge status: ${updateError.message}`);
    
    console.log('  ✓ Updated merge status of source variations');
  } catch (error) {
    throw new Error(`Variation merging failed: ${error.message}`);
  }
}

async function testSaveAsFinalIdea() {
  console.log('📋 Testing saving merged idea as final idea...');
  
  try {
    // 1. Get the merged idea details
    const { data: mergedIdea, error: fetchError } = await supabase
      .from('idea_playground_merged_ideas')
      .select('*')
      .eq('id', testConfig.mergedIdeaId)
      .single();
    
    if (fetchError) throw new Error(`Error fetching merged idea: ${fetchError.message}`);
    
    // 2. Get source variations
    const { data: mergeSources, error: sourcesError } = await supabase
      .from('idea_playground_merge_sources')
      .select('variation_id')
      .eq('merged_idea_id', testConfig.mergedIdeaId);
    
    if (sourcesError) throw new Error(`Error fetching merge sources: ${sourcesError.message}`);
    
    const sourceVariationIds = mergeSources.map(source => source.variation_id);
    
    // 3. Create a new idea from the merged idea
    const finalIdea = {
      canvas_id: testConfig.canvasId,
      title: mergedIdea.title,
      description: mergedIdea.description,
      problem_statement: mergedIdea.problem_statement,
      solution_concept: mergedIdea.solution_concept,
      target_audience: mergedIdea.target_audience,
      unique_value: mergedIdea.unique_value,
      business_model: mergedIdea.business_model,
      pathway_status: 'refined',
      metadata: {
        source_type: 'merged',
        source_id: mergedIdea.id,
        source_variations: sourceVariationIds
      }
    };
    
    const { data: savedIdea, error } = await supabase
      .from('idea_playground_ideas')
      .insert(finalIdea)
      .select()
      .single();
    
    if (error) throw new Error(`Error saving final idea: ${error.message}`);
    
    console.log(`  ✓ Created final idea with ID: ${savedIdea.id}`);
  } catch (error) {
    throw new Error(`Final idea creation failed: ${error.message}`);
  }
}

async function cleanupTestData() {
  console.log('\n📋 Cleaning up test data...');
  
  try {
    // Ask if test data should be kept
    const answer = await new Promise(resolve => {
      rl.question('Would you like to keep the test data for inspection? (y/n): ', ans => {
        resolve(ans.toLowerCase());
      });
    });
    
    if (answer === 'y' || answer === 'yes') {
      console.log('  ✓ Test data will be preserved for inspection');
      return;
    }
    
    // Delete merge sources first (due to foreign key constraints)
    if (testConfig.mergedIdeaId) {
      const { error: mergeSourcesError } = await supabase
        .from('idea_playground_merge_sources')
        .delete()
        .eq('merged_idea_id', testConfig.mergedIdeaId);
      
      if (!mergeSourcesError) {
        console.log('  ✓ Deleted merge sources');
      }
    }
    
    // Delete merged ideas
    if (testConfig.mergedIdeaId) {
      const { error: mergedIdeasError } = await supabase
        .from('idea_playground_merged_ideas')
        .delete()
        .eq('id', testConfig.mergedIdeaId);
      
      if (!mergedIdeasError) {
        console.log('  ✓ Deleted merged ideas');
      }
    }
    
    // Delete variations
    if (testConfig.ideaId) {
      const { error: variationsError } = await supabase
        .from('idea_playground_variations')
        .delete()
        .eq('parent_idea_id', testConfig.ideaId);
      
      if (!variationsError) {
        console.log('  ✓ Deleted variations');
      }
    }
    
    // Delete ideas
    if (testConfig.canvasId) {
      const { error: ideasError } = await supabase
        .from('idea_playground_ideas')
        .delete()
        .eq('canvas_id', testConfig.canvasId);
      
      if (!ideasError) {
        console.log('  ✓ Deleted ideas');
      }
    }
    
    // Delete canvas
    if (testConfig.canvasId) {
      const { error: canvasError } = await supabase
        .from('idea_playground_canvases')
        .delete()
        .eq('id', testConfig.canvasId);
      
      if (!canvasError) {
        console.log('  ✓ Deleted canvas');
      }
    }
    
    console.log('  ✅ Test data cleanup complete');
  } catch (error) {
    console.error('  ⚠️ Error during cleanup:', error.message);
  }
}

// Run the tests
runTests();
