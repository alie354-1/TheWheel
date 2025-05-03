// Test script for the comprehensive logging system
// This script validates that the logging system is properly set up
// and demonstrates the new features, particularly the feedback types

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config()

// Validate required environment variables
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set')
  process.exit(1)
}

// Initialize Supabase client with the service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test functions
async function testLogSystemEvent() {
  console.log('Testing system event logging...')
  
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .insert({
        event_type: 'test_event',
        event_source: 'test_script',
        action: 'test_logging',
        data: {
          test_name: 'System Event Test',
          timestamp: new Date().toISOString()
        },
        metadata: {
          test_run: true,
          environment: 'development'
        },
        data_classification: 'non_personal',
        retention_policy: 'short_term'
      })
      .select()
      
    if (error) throw error
    
    console.log('✅ Successfully logged system event')
    return data[0]
  } catch (error) {
    console.error('❌ Failed to log system event:', error)
    return null
  }
}

async function testModelFeedback() {
  console.log('\nTesting model feedback with new feedback types...')
  
  try {
    // First, create a test model in the registry if it doesn't exist
    const modelId = uuidv4()
    const { error: modelError } = await supabase
      .from('model_registry')
      .insert({
        id: modelId,
        model_name: 'test_model',
        model_type: 'classifier',
        model_version: '1.0.0',
        model_description: 'Test model for logging system validation',
        training_date: new Date().toISOString(),
        is_active: true
      })
      
    if (modelError) throw modelError
    
    // Test each feedback type
    const feedbackTypes = [
      'positive', 
      'negative', 
      'correction', 
      'suggestion', 
      'automatic', // New type
      'neutral'    // New type
    ]
    
    for (const feedbackType of feedbackTypes) {
      const { error } = await supabase
        .from('model_feedback')
        .insert({
          id: uuidv4(),
          model_id: modelId,
          prediction_input: { query: 'Test input for ' + feedbackType },
          prediction_output: { result: 'Test output for ' + feedbackType },
          feedback_type: feedbackType,
          feedback_value: { 
            score: feedbackType === 'positive' ? 4.5 : 
                  feedbackType === 'negative' ? 1.5 : 3,
            comment: `Test ${feedbackType} feedback`
          }
        })
        
      if (error) {
        console.error(`❌ Failed to log ${feedbackType} feedback:`, error)
      } else {
        console.log(`✅ Successfully logged ${feedbackType} feedback`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Error testing model feedback:', error)
    return false
  }
}

async function testDataRetentionRules() {
  console.log('\nVerifying data retention rules...')
  
  try {
    // Query the retention policies
    const { data, error } = await supabase
      .from('retention_policies')
      .select('*')
      
    if (error) throw error
    
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} retention policies:`)
      data.forEach(policy => {
        console.log(`  - ${policy.policy}: ${policy.retention_days} days (${policy.anonymization_action})`)
      })
    } else {
      console.log('⚠️ No retention policies found')
    }
    
    return data
  } catch (error) {
    console.error('❌ Error verifying retention rules:', error)
    return null
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting comprehensive logging system tests...\n')
  
  // Run the tests
  await testLogSystemEvent()
  await testModelFeedback()
  await testDataRetentionRules()
  
  console.log('\n🎉 Testing completed!')
}

// Run the tests
runTests()
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })
