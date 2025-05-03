/**
 * Script to test the Hugging Face Spaces service integration
 * 
 * This script loads the Hugging Face Spaces service and tests basic
 * functionality by sending a query and checking the response.
 */

// Import the Hugging Face Spaces service
const { huggingFaceSpacesGeneralLLMService } = require('../src/lib/services/huggingface-spaces-llm.service');
const { appSettingsService } = require('../src/lib/services/app-settings.service');

// Test prompt
const TEST_PROMPT = 'Generate a short business idea for a tech startup.';

// Main test function
async function testHuggingFaceSpacesService() {
  console.log('Testing Hugging Face Spaces service integration...');
  
  try {
    // First check if Hugging Face Spaces settings exist
    console.log('Checking Hugging Face Spaces settings...');
    const settings = await appSettingsService.getGlobalSettings('huggingface_spaces');
    
    if (!settings || !settings.spaces) {
      console.error('❌ No Hugging Face Spaces settings found.');
      console.log('Please configure Hugging Face Spaces in the Settings page first.');
      return false;
    }
    
    if (!settings.enabled) {
      console.warn('⚠️ Hugging Face Spaces is not enabled in settings.');
      console.log('Enable Hugging Face Spaces in the Settings page to use this service.');
      return false;
    }
    
    // Check if at least one Space is configured
    const configuredSpaces = Object.entries(settings.spaces)
      .filter(([_, config]) => config.space_url)
      .map(([tier]) => tier);
    
    if (configuredSpaces.length === 0) {
      console.error('❌ No Spaces configured in settings.');
      console.log('Please configure at least one Space in the Settings page.');
      return false;
    }
    
    console.log(`✅ Found ${configuredSpaces.length} configured Space(s): ${configuredSpaces.join(', ')}`);
    console.log(`Default tier: ${settings.default_tier}`);
    
    // Now test the service by sending a query
    console.log('\nTesting query to the LLM service...');
    console.log(`Prompt: "${TEST_PROMPT}"`);
    
    const response = await huggingFaceSpacesGeneralLLMService.query(TEST_PROMPT, {
      userId: 'test-user-id',
      companyId: 'test-company-id'
    });
    
    console.log('\n✅ Query successful!');
    console.log('Response:');
    console.log('----------------------------------');
    console.log(response.content);
    console.log('----------------------------------');
    
    return true;
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    
    return false;
  }
}

// Run the test
testHuggingFaceSpacesService().then(success => {
  if (!success) {
    process.exit(1);
  }
});
