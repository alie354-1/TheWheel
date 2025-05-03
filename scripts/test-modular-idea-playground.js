/**
 * Testing script for the modular Idea Playground implementation
 * 
 * This script demonstrates the basic functionality of the Idea Playground
 * using the new modular architecture.
 */

const { ideaPlaygroundService } = require('../src/lib/services/idea-playground.service.facade');

// Mock user ID for testing
const TEST_USER_ID = 'test-user-123';

/**
 * Run a simple demo of the Idea Playground functionality
 */
async function runIdeaPlaygroundDemo() {
  console.log('=== Idea Playground Modular Architecture Demo ===\n');
  
  try {
    // Initialize the service
    await ideaPlaygroundService.initialize();
    console.log('✅ Idea Playground service initialized successfully\n');
    
    // Generate a new idea
    console.log('Generating a new business idea...');
    const generatedIdea = await ideaPlaygroundService.generateIdea({
      theme: 'sustainability',
      industry: 'technology',
      userContext: 'Looking for eco-friendly software solutions',
      userId: TEST_USER_ID
    });
    
    console.log('✅ Idea generated successfully:');
    console.log(`   Title: ${generatedIdea.title}`);
    console.log(`   Description: ${generatedIdea.description.substring(0, 100)}...`);
    console.log(`   ID: ${generatedIdea.id}\n`);
    
    // Refine the idea
    console.log('Refining the idea with feedback...');
    const feedback = 'Please focus more on the B2B market and expand on the revenue model.';
    const refinedIdea = await ideaPlaygroundService.refineIdea(
      generatedIdea,
      feedback,
      TEST_USER_ID
    );
    
    console.log('✅ Idea refined successfully:');
    console.log(`   New Title: ${refinedIdea.title}`);
    console.log(`   New Description: ${refinedIdea.description.substring(0, 100)}...`);
    console.log(`   ID: ${refinedIdea.id}\n`);
    
    // Demonstrate getting ideas for a user
    console.log('Fetching all ideas for test user...');
    const userIdeas = await ideaPlaygroundService.getUserIdeas(TEST_USER_ID);
    
    console.log(`✅ Found ${userIdeas.length} ideas for user:`);
    userIdeas.forEach((idea, index) => {
      console.log(`   ${index + 1}. ${idea.title} (ID: ${idea.id})`);
    });
    
    console.log('\n=== Demo completed successfully ===');
    console.log('All modules of the Idea Playground architecture are working as expected.');
  } catch (error) {
    console.error('\n❌ Error during demo:');
    console.error(error);
    process.exit(1);
  }
}

// Run the demo
runIdeaPlaygroundDemo();
