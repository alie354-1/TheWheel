/**
 * Test script for terminology service direct methods
 * 
 * This script tests the new TerminologyService methods that replace the API endpoints:
 * - deleteTerminologyForCategory
 * - saveTerminology
 */

import { TerminologyService } from '../src/lib/services/terminology.service.js';
import { supabase } from '../src/lib/supabase.js';

// Test company ID (replace with a valid company ID from your database)
const TEST_COMPANY_ID = 'test-company-123';

async function runTests() {
  console.log('Testing terminology service methods...');
  
  try {
    // Test 1: Delete terminology for a category
    console.log('\n--- Test 1: Delete terminology for a category ---');
    await TerminologyService.deleteTerminologyForCategory('company', TEST_COMPANY_ID, 'journeyTerms');
    console.log('Successfully deleted journeyTerms terminology');
    
    // Test 2: Save new terminology
    console.log('\n--- Test 2: Save new terminology ---');
    const testRecords = [
      {
        key: 'journeyTerms.mainUnit.singular',
        value: 'Adventure',
        override_behavior: 'replace'
      },
      {
        key: 'journeyTerms.mainUnit.plural',
        value: 'Adventures',
        override_behavior: 'replace'
      }
    ];
    
    await TerminologyService.saveTerminology('company', TEST_COMPANY_ID, testRecords);
    console.log('Successfully saved new terminology records');
    
    // Test 3: Verify the terminology was saved correctly
    console.log('\n--- Test 3: Verify terminology saving ---');
    const { data, error } = await supabase
      .from('company_terminology')
      .select('*')
      .eq('company_id', TEST_COMPANY_ID)
      .like('key', 'journeyTerms.%');
    
    if (error) {
      throw error;
    }
    
    console.log('Retrieved terminology records:');
    console.log(JSON.stringify(data, null, 2));
    
    // Cleanup
    console.log('\n--- Cleanup ---');
    await TerminologyService.deleteTerminologyForCategory('company', TEST_COMPANY_ID, 'journeyTerms');
    console.log('Test cleanup complete');
    
    console.log('\nAll tests completed successfully!');
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    // Close the supabase connection
    supabase.removeAllSubscriptions();
  }
}

runTests();
