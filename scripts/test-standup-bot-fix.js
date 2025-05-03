// Test script to verify the standup bot fix for company_id issue
import { supabase } from '../src/lib/supabase.js';
import { standupAIService } from '../src/lib/services/standup-ai.service.js';

async function testStandupBot() {
  console.log('Testing standup bot without company_id...');
  
  // Create a test context without company_id
  const context = {
    userId: 'test-user-id',
    useExistingModels: true
  };
  
  // Create a test standup entry
  const testEntry = {
    accomplished: 'Completed the user authentication flow',
    working_on: 'Implementing the dashboard UI',
    blockers: 'Waiting for API documentation',
    goals: 'Finish the MVP by next week',
    answers: {}
  };
  
  try {
    // Test generating section feedback
    console.log('Testing section feedback...');
    const feedback = await standupAIService.generateSectionFeedback(
      'working_on',
      testEntry.working_on,
      testEntry,
      context
    );
    console.log('Section feedback generated successfully:', feedback.content.substring(0, 100) + '...');
    
    // Test generating summary
    console.log('Testing summary generation...');
    const summary = await standupAIService.generateStandupSummary(testEntry, context);
    console.log('Summary generated successfully:', summary.content.substring(0, 100) + '...');
    
    // Test generating tasks
    console.log('Testing task generation...');
    const tasks = await standupAIService.generateTasks(testEntry, 'test-user-id', context);
    console.log('Tasks generated successfully:', tasks.length, 'tasks');
    
    console.log('All tests passed! The standup bot works without requiring company_id.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStandupBot();
