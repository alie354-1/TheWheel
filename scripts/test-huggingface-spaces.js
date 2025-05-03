/**
 * Utility script to test Hugging Face Spaces integration
 * 
 * This script tests the connection to a Hugging Face Space
 * and sends a test query to verify the Space is working.
 */

// Import required libraries
const axios = require('axios');

// Define test parameters
const TEST_SPACE_URL = process.env.TEST_SPACE_URL || 'https://your-username-your-space-name.hf.space';
const TEST_API_ENDPOINT = process.env.TEST_API_ENDPOINT || '/api/generate';
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN;

// Full API URL
const apiUrl = `${TEST_SPACE_URL.replace(/\/$/, '')}${TEST_API_ENDPOINT}`;

// Test prompt
const testPrompt = 'Test query from the application. Please respond with "Success" if you receive this.';

async function testHuggingFaceSpace() {
  console.log('Testing connection to Hugging Face Space...');
  console.log(`- Space URL: ${TEST_SPACE_URL}`);
  console.log(`- API Endpoint: ${TEST_API_ENDPOINT}`);
  console.log(`- Full API URL: ${apiUrl}`);
  console.log(`- Auth Token: ${TEST_AUTH_TOKEN ? 'Provided' : 'Not provided'}`);
  console.log('\nSending test query...');

  try {
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization if token is provided
    if (TEST_AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${TEST_AUTH_TOKEN}`;
    }

    // Make the request to the Hugging Face Space
    const response = await axios.post(
      apiUrl,
      { 
        inputs: testPrompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.1,
          return_full_text: false
        }
      },
      { headers }
    );

    console.log('\n✅ Connection test successful!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));

    // Check if the response contains "Success"
    const responseText = response.data.generated_text || 
                        (response.data[0] && response.data[0].generated_text) || 
                        JSON.stringify(response.data);

    if (responseText.toLowerCase().includes('success')) {
      console.log('\n✅ Response content validation successful!');
    } else {
      console.log('\n⚠️ Response does not contain "Success". The format may be different than expected.');
    }

    return true;
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. The Space might be offline or the URL is incorrect.');
    } else {
      console.error('Error details:', error.message);
    }
    
    return false;
  }
}

// Run the test
testHuggingFaceSpace().then(success => {
  if (!success) {
    process.exit(1);
  }
});
