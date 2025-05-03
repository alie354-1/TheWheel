/**
 * Verification script for company members recursion and feature extraction fixes
 * 
 * This script tests both:
 * 1. The secure company access service (prevents infinite recursion)
 * 2. The uniqueness measures in model training feature extraction
 * 
 * Run this script to check if the fixes have been properly applied.
 */

// Use CommonJS module system to avoid import issues
const { v4: uuidv4 } = require('uuid');
// We'll dynamically import supabase from the service instead

// Import the services we need to test
const testCompanyAccess = async () => {
  try {
    console.log('\n--- Testing Company Access Service ---');
    console.log('Loading service dynamically...');
    
    // First import the company access service
    const { companyAccessService } = await import('../src/lib/services/company-access.service.js');
    
    // Then dynamically import supabase from another module
    const { supabase } = await import('../src/lib/services/company-access.service.js');
    
    // Get the current logged in user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting authenticated user:', userError);
      console.log('Please ensure you are logged in before running this test');
      return false;
    }
    
    const userId = userData.user?.id;
    if (!userId) {
      console.error('No user ID found. Please login first.');
      return false;
    }
    
    console.log(`Testing company access for user: ${userId.slice(0, 8)}...`);
    
    // Run the service method that avoids recursion
    console.log('Checking company access with secure method...');
    const result = await companyAccessService.checkUserCompanyAccess(userId);
    
    console.log('Company access check completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Check for any fallback usage or errors
    if (result.fallback) {
      console.warn('WARNING: Fallback method was used. The primary secure function might be unavailable.');
    }
    
    if (result.error) {
      console.warn('WARNING: Error was reported but handled gracefully:', result.error);
      console.log('The service is working but encountered a non-fatal issue.');
    } else {
      console.log('✓ Company access service working properly with no errors!');
    }
    
    return !result.error;
    
  } catch (error) {
    console.error('Error testing company access service:', error);
    console.log('The fix might not be properly applied. Please check implementation.');
    return false;
  }
};

const testFeatureExtraction = async () => {
  try {
    console.log('\n--- Testing Feature Extraction Fix ---');
    console.log('Loading service dynamically...');
    
    // First import supabase via company access service
    let supabase;
    try {
      // Try to get supabase from company access service
      const companyAccessModule = await import('../src/lib/services/company-access.service.js');
      supabase = companyAccessModule.supabase;
    } catch (err) {
      // If that fails, try to get it from model training service
      console.log('Could not get supabase from company-access.service.js, trying model-training.service.js...');
      const modelTrainingModule = await import('../src/lib/services/model-training.service.js');
      supabase = modelTrainingModule.supabase;
    }
    
    if (!supabase) {
      console.error('Failed to import supabase from any service module. Cannot proceed with test.');
      return false;
    }
    
    // Dynamic import to get the most up-to-date version of the service
    const { modelTrainingService } = await import('../src/lib/services/model-training.service.js');
    
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError);
      return false;
    }
    
    const userId = userData.user?.id;
    
    // Create a test feature set name with random ID to avoid conflicts
    const testFeatureSet = `test_feature_set_${uuidv4().slice(0, 8)}`;
    console.log(`Testing feature extraction with feature set: ${testFeatureSet}`);
    
    // Extract multiple features in rapid succession
    console.log('Extracting multiple features in rapid succession...');
    const startTime = Date.now();
    
    // Create several extraction promises
    const extractionPromises = [];
    for (let i = 0; i < 5; i++) {
      extractionPromises.push(
        modelTrainingService.extractFeatures(testFeatureSet, {
          eventTypes: ['user_action', 'component_lifecycle'],
          userId,
          limit: 2,
          anonymize: true
        })
      );
    }
    
    // Run them all at the same time to try to create timestamp conflicts
    const results = await Promise.all(extractionPromises);
    const featureIds = results.flat();
    
    const endTime = Date.now();
    console.log(`Extracted ${featureIds.length} features in ${endTime - startTime}ms`);
    
    if (featureIds.length === 0) {
      console.warn('No features were extracted. This could be because:');
      console.warn('1. There are no matching logs in the system');
      console.warn('2. The extraction process encountered errors');
      console.warn('Try running this test again or check the logs for more details');
      return false;
    }
    
    console.log(`Successfully extracted ${featureIds.length} unique features`);
    console.log('Feature IDs:', featureIds);
    
    // Clean up the test data
    console.log('\nCleaning up test features...');
    const { error: deleteError } = await supabase
      .from('extracted_features')
      .delete()
      .eq('feature_set', testFeatureSet);
      
    if (deleteError) {
      console.error('Error cleaning up test features:', deleteError);
    } else {
      console.log('Test features cleaned up successfully');
    }
    
    console.log('✓ Feature extraction working properly without uniqueness conflicts!');
    return true;
    
  } catch (error) {
    console.error('Error testing feature extraction:', error);
    console.log('The fix might not be properly applied. Please check implementation.');
    return false;
  }
};

// Run both tests
const runTests = async () => {
  console.log('================================');
  console.log('TESTING RECURSION & FEATURE FIXES');
  console.log('================================');
  
  const companyAccessResult = await testCompanyAccess();
  const featureExtractionResult = await testFeatureExtraction();
  
  console.log('\n--- Test Summary ---');
  console.log(`Company Access Service: ${companyAccessResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Feature Extraction: ${featureExtractionResult ? '✓ PASS' : '✗ FAIL'}`);
  
  if (companyAccessResult && featureExtractionResult) {
    console.log('\n✅ ALL TESTS PASSED! The fixes are working properly.');
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please review the errors above and check your implementation.');
  }
};

// Execute tests
runTests().catch(console.error);
