/**
 * Simple direct check for Hugging Face Space availability
 * 
 * This script attempts to check if a Hugging Face Space exists by making
 * a simple HTTP request. It also tries to handle authentication.
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get API URL from Space URL
function getSpaceApiUrl(spaceUrl) {
  if (!spaceUrl) return null;
  
  let hostname;
  
  if (spaceUrl.includes('huggingface.co/spaces/')) {
    // Convert standard URL to API URL
    // From: https://huggingface.co/spaces/username/space-name
    // To: https://username-space-name.hf.space
    const parts = spaceUrl.split('/');
    const username = parts[parts.length - 2];
    const spaceName = parts[parts.length - 1];
    hostname = `https://${username}-${spaceName}.hf.space`;
  } else {
    // Use the URL directly
    hostname = spaceUrl.replace(/\/$/, '');
  }
  
  return hostname;
}

async function checkSpace() {
  console.log('Basic Hugging Face Space availability check...');
  
  try {
    // Get the current settings
    const { data: spacesSettings, error: spacesError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'huggingface_spaces')
      .maybeSingle();
    
    if (spacesError) {
      console.error('Error fetching Hugging Face Spaces settings:', spacesError);
      process.exit(1);
    }
    
    if (!spacesSettings) {
      console.log('Hugging Face Spaces settings not found.');
      process.exit(1);
    }
    
    // Get the base space URL and token
    const baseSpace = spacesSettings.value.spaces.base;
    if (!baseSpace.space_url) {
      console.log('No base Space URL configured.');
      process.exit(1);
    }
    
    const spaceUrl = baseSpace.space_url;
    const authToken = baseSpace.auth_token;
    const apiEndpoint = baseSpace.api_endpoint;
    
    const hostname = getSpaceApiUrl(spaceUrl);
    
    console.log(`\nChecking Space URL: ${spaceUrl}`);
    console.log(`Direct hostname: ${hostname}`);
    console.log(`Authentication token: ${authToken ? 'Provided' : 'Not provided'}`);
    console.log(`Configured API endpoint: ${apiEndpoint}`);
    
    // Headers for requests
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // 1. First check if the Space exists at all (without API endpoint)
    console.log('\n1. Checking if Space exists...');
    try {
      const response = await axios.get(hostname, { headers, timeout: 10000 });
      console.log(`✅ Space exists! Status: ${response.status}`);
      console.log('Success reaching hostname (Space web interface)');
    } catch (error) {
      console.log(`❌ Failed to reach Space: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        
        if (error.response.status === 401) {
          console.log('Authentication error (401): Token is invalid or missing');
        } else if (error.response.status === 404) {
          console.log('Not found (404): Space does not exist at this URL');
          console.log('\nPossible issues:');
          console.log('1. The Space URL is incorrect');
          console.log('2. The Space has been deleted');
          console.log('3. The Space is private and requires authentication');
        } else if (error.response.status === 403) {
          console.log('Forbidden (403): You do not have permission to access this Space');
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('Cannot connect to the Space host. The Space may not exist.');
      }
    }
    
    // 2. Then check the API endpoint with a basic request
    const fullApiUrl = `${hostname}${apiEndpoint}`;
    console.log(`\n2. Checking API endpoint: ${fullApiUrl}`);
    
    // Define several possible payload formats to try
    const payloads = [
      { name: 'Standard format', data: { inputs: "Test query from diagnostic script" } },
      { name: 'Data array', data: { data: ["Test query from diagnostic script"] } }
    ];
    
    let apiEndpointSuccess = false;
    
    for (const payload of payloads) {
      try {
        console.log(`\n   Trying ${payload.name}...`);
        const response = await axios.post(fullApiUrl, payload.data, { 
          headers, 
          timeout: 10000 
        });
        
        console.log(`✅ Success! Status: ${response.status}`);
        console.log('Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        apiEndpointSuccess = true;
        break;
      } catch (error) {
        console.log(`❌ Failed with ${payload.name}: ${error.message}`);
        if (error.response) {
          console.log(`Status: ${error.response.status}`);
          
          if (error.response.status === 401) {
            console.log('Authentication error (401): Token is invalid or missing');
          } else if (error.response.status === 404) {
            console.log('Not found (404): API endpoint does not exist');
          } else if (error.response.status === 400) {
            console.log('Bad request (400): The payload format may be incorrect');
          }
        }
      }
    }
    
    if (!apiEndpointSuccess) {
      console.log('\nNo payload format worked with the configured API endpoint.');
      
      // Try some common alternative endpoints if the configured one fails
      const alternativeEndpoints = [
        '/api/generate',
        '/run/predict', 
        '/predict',
        '/api',
        '/run',
        ''
      ].filter(endpoint => endpoint !== apiEndpoint);
      
      console.log('\n3. Trying alternative API endpoints...');
      let foundWorkingEndpoint = false;
      
      for (const endpoint of alternativeEndpoints) {
        const altApiUrl = `${hostname}${endpoint}`;
        console.log(`\n   Checking alternative endpoint: ${altApiUrl}`);
        
        for (const payload of payloads) {
          try {
            console.log(`     Trying ${payload.name}...`);
            const response = await axios.post(altApiUrl, payload.data, { 
              headers, 
              timeout: 10000 
            });
            
            console.log(`     ✅ Success! Status: ${response.status}`);
            console.log('     Response:');
            console.log('     ' + JSON.stringify(response.data, null, 2));
            
            console.log(`\n🎉 FOUND WORKING ENDPOINT: ${endpoint} with ${payload.name}`);
            console.log(`Consider updating your configuration to use this endpoint.`);
            
            foundWorkingEndpoint = true;
            break;
          } catch (error) {
            console.log(`     ❌ Failed with ${payload.name}`);
          }
        }
        
        if (foundWorkingEndpoint) break;
      }
      
      if (!foundWorkingEndpoint) {
        console.log('\n❌ Could not find any working endpoint.');
        console.log('\nTroubleshooting steps:');
        console.log('1. Check if your Space is running and not paused');
        console.log('2. Check if your Space has an API endpoint set up');
        console.log('3. Make sure your authentication token is correct if the Space is private');
        console.log('4. Check the Space documentation to find the correct API endpoint');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the check
checkSpace();
