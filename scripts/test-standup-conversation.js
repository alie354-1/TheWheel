// Test script for standup conversation context
import { standupAIService } from '../src/lib/services/standup-ai.service';

/**
 * This script tests the conversation context functionality in the standup bot.
 * It simulates a conversation with multiple exchanges to verify that context is maintained.
 */
async function testStandupConversationContext() {
  console.log('Testing Standup Bot Conversation Context');
  console.log('=======================================');
  
  // Mock user ID for testing
  const userId = 'test-user-123';
  const companyId = 'test-company-456';
  
  // Create a test standup entry
  const standupEntry = {
    accomplished: '',
    working_on: '',
    blockers: '',
    goals: '',
    answers: {}
  };
  
  // Create context for the AI service
  const context = {
    userId,
    companyId,
    useExistingModels: true
  };
  
  // Simulate a conversation with the accomplishments section
  console.log('\n1. First exchange - Accomplishments:');
  
  const firstInput = "I finished implementing the authentication module and improved the UI design.";
  standupEntry.accomplished = firstInput;
  
  const firstResponse = await standupAIService.generateSectionFeedback(
    'accomplished',
    firstInput,
    standupEntry,
    context
  );
  
  console.log(`User: ${firstInput}`);
  console.log(`AI: ${firstResponse.content}`);
  console.log(`Follow-up questions: ${firstResponse.follow_up_questions?.join(', ')}`);
  
  // Should have updated the conversation history in the answers field
  console.log('\nConversation history after first exchange:');
  if (standupEntry.answers?.accomplished_conversation) {
    const convo = JSON.parse(standupEntry.answers.accomplished_conversation);
    console.log(convo);
  } else {
    console.log('No conversation history found in answers!');
  }
  
  // Now add a second exchange to test that context is maintained
  console.log('\n2. Second exchange - Accomplishments:');
  
  const secondInput = "The authentication module now supports social logins and the UI is much cleaner.";
  
  const secondResponse = await standupAIService.generateSectionFeedback(
    'accomplished',
    secondInput,
    standupEntry,
    context
  );
  
  console.log(`User: ${secondInput}`);
  console.log(`AI: ${secondResponse.content}`);
  console.log(`Follow-up questions: ${secondResponse.follow_up_questions?.join(', ')}`);
  
  // Should have updated the conversation history in the answers field
  console.log('\nConversation history after second exchange:');
  if (standupEntry.answers?.accomplished_conversation) {
    const convo = JSON.parse(standupEntry.answers.accomplished_conversation);
    console.log(convo);
  } else {
    console.log('No conversation history found in answers!');
  }
  
  // Test the working_on section to ensure different sections have separate conversations
  console.log('\n3. First exchange - Working On:');
  
  const workingOnInput = "I'm working on integrating a payment gateway and fixing some performance issues.";
  standupEntry.working_on = workingOnInput;
  
  const workingOnResponse = await standupAIService.generateSectionFeedback(
    'working_on',
    workingOnInput,
    standupEntry,
    context
  );
  
  console.log(`User: ${workingOnInput}`);
  console.log(`AI: ${workingOnResponse.content}`);
  console.log(`Follow-up questions: ${workingOnResponse.follow_up_questions?.join(', ')}`);
  
  // Should have conversation histories for both sections
  console.log('\nConversation histories after exchanges in multiple sections:');
  
  if (standupEntry.answers?.accomplished_conversation) {
    console.log('Accomplished conversation:');
    const accomplished = JSON.parse(standupEntry.answers.accomplished_conversation);
    console.log(accomplished);
  }
  
  if (standupEntry.answers?.working_on_conversation) {
    console.log('\nWorking on conversation:');
    const workingOn = JSON.parse(standupEntry.answers.working_on_conversation);
    console.log(workingOn);
  }
  
  console.log('\nTest completed! The AI responses should show awareness of previous exchanges.');
}

// Run the test
testStandupConversationContext().catch(console.error);
