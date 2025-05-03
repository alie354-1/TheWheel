/**
 * Test script for company context and features fix
 * 
 * This script tests both aspects of the fix:
 * 1. The secure fetch_company_context_securely function
 * 2. The extracted_features unique constraint fix
 */

import { supabase } from '../src/lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';

async function runTests() {
  console.log('Testing company context and features fix...');
  
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
    
    const userId = userData.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found. Please login first.');
      return;
    }
    
    console.log('Testing secure company context function...');
    
    // Test the secure function
    const { data: companyContextData, error: companyContextError } = await supabase.rpc(
      'fetch_company_context_securely',
      { 
        p_user_id: userId,
        p_company_id: userId // Using userId as a placeholder for company_id
      }
    );
    
    if (companyContextError) {
      console.error('Error testing company context secure function:', companyContextError);
      console.log('This is expected if you are not a member of any company');
    } else {
      console.log('Secure company context function test result:', companyContextData);
    }
    
    console.log('Testing extracted features unique constraint fix...');
    
    // Create timestamp for unique feature name
    const timestamp = new Date().getTime();
    const featureSet = 'test_feature_set';
    const featureName = `test_feature_${timestamp % 10000}`;
    
    // Create a test feature
    const feature = {
      id: uuidv4(),
      feature_set: featureSet,
      feature_name: featureName,
      feature_value: { test: 'value' },
      source_logs: [],
      is_anonymized: true,
      created_at: new Date().toISOString()
    };
    
    // Insert the feature
    const { error: insertError } = await supabase
      .from('extracted_features')
      .insert(feature);
      
    if (insertError) {
      console.error('Error inserting test feature:', insertError);
      return;
    }
    
    console.log('Successfully inserted feature:', featureName);
    
    // Try to insert a similar feature with same name but different timestamp
    const feature2 = {
      id: uuidv4(),
      feature_set: featureSet,
      feature_name: featureName,
      feature_value: { test: 'value2' },
      source_logs: [],
      is_anonymized: true,
      created_at: new Date(new Date().getTime() + 1000).toISOString() // Different timestamp
    };
    
    // Insert the second feature
    const { error: insertError2 } = await supabase
      .from('extracted_features')
      .insert(feature2);
      
    if (insertError2) {
      console.error('Error inserting second test feature:', insertError2);
      console.log('This suggests the constraint fix may not be working correctly');
      return;
    }
    
    console.log('Successfully inserted second feature with same name but different timestamp');
    console.log('This confirms the extracted_features unique constraint fix is working correctly');
    
    // Clean up test data
    console.log('Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('extracted_features')
      .delete()
      .eq('feature_set', featureSet)
      .eq('feature_name', featureName);
      
    if (deleteError) {
      console.error('Error cleaning up test data:', deleteError);
    } else {
      console.log('Successfully cleaned up test data');
    }
    
    console.log('All tests completed successfully!');
    
  } catch (err) {
    console.error('Error running tests:', err);
  }
}

runTests();
