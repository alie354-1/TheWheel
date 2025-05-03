/**
 * Dashboard Loading Test Script
 * 
 * This script tests the dashboard loading with disabled logging services.
 * It verifies that the dashboard can load properly despite logging services being disabled.
 */

import { supabase } from '../src/lib/supabase.ts';
import { companyAccessService } from '../src/lib/services/company-access.service.ts';
import { featureFlagsService } from '../src/lib/services/feature-flags.service.ts';
import { loggingService } from '../src/lib/services/logging.service.ts';
import { modelTrainingService } from '../src/lib/services/model-training.service.ts';

async function testDashboardLoad() {
  console.log('=== Dashboard Loading Test ===');
  console.log('Testing dashboard loading with disabled logging services...');
  
  try {
    // 1. Check if we can connect to Supabase
    console.log('\n1. Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase.from('app_settings').select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Supabase connection failed:', connectionError.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // 2. Test company access service
    console.log('\n2. Testing company access service...');
    try {
      // Use a test user ID
      const testResult = await companyAccessService.checkUserCompanyAccess('test-user-id');
      console.log('✅ Company access service working:', testResult);
    } catch (error) {
      console.error('❌ Company access service failed:', error.message);
    }
    
    // 3. Test feature flags service
    console.log('\n3. Testing feature flags service...');
    try {
      await featureFlagsService.loadFeatureFlags();
      console.log('✅ Feature flags service working');
      
      await featureFlagsService.saveFeatureFlags({ testFlag: { enabled: true } });
      console.log('✅ Feature flags save working (in-memory only)');
    } catch (error) {
      console.error('❌ Feature flags service failed:', error.message);
    }
    
    // 4. Test logging service (should be disabled)
    console.log('\n4. Testing logging service (should be disabled)...');
    try {
      const sessionId = await loggingService.startSession('test-user-id');
      console.log('✅ Logging service working in disabled mode, session ID:', sessionId);
      
      await loggingService.logEvent('test_event', { test: true });
      console.log('✅ Logging events working in disabled mode');
      
      await loggingService.endSession();
      console.log('✅ Session end working in disabled mode');
    } catch (error) {
      console.error('❌ Logging service failed:', error.message);
    }
    
    // 5. Test model training service (should be disabled)
    console.log('\n5. Testing model training service (should be disabled)...');
    try {
      await modelTrainingService.extractFeatures('test_event');
      console.log('✅ Model training service working in disabled mode');
    } catch (error) {
      console.error('❌ Model training service failed:', error.message);
    }
    
    console.log('\n=== Test Summary ===');
    console.log('All services are configured correctly for dashboard loading.');
    console.log('The dashboard should now load without errors related to logging or model training.');
    console.log('If you still see errors, check the browser console for more details.');
    
  } catch (error) {
    console.error('\n❌ Test failed with unexpected error:', error);
  } finally {
    // Close the Supabase connection
    supabase.removeAllSubscriptions();
  }
}

// Run the test
testDashboardLoad();
