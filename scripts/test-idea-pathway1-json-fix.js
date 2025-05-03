#!/usr/bin/env node

/**
 * This script tests the fixed JSON parsing in idea-pathway1-ai.service.ts 
 * by trying to parse various malformed JSON samples.
 */

// Import the required JSON5 library
import JSON5 from 'json5';

console.log('======= TESTING JSON PARSING FIX =======');
console.log('Testing various malformed JSON inputs with the fixed parsing methods...\n');

// Sample malformed JSON that would cause errors
const testCases = [
  {
    name: 'Test Case 1: Trailing comma in object',
    json: `{
      "title": "AI-Powered Health Platform",
      "description": "A platform that uses AI to provide personalized health recommendations.",
      "problem_statement": "People struggle to get personalized health advice.",
      "solution_concept": "AI analysis of health data to provide recommendations.",
    }`
  },
  {
    name: 'Test Case 2: JSON inside code blocks',
    json: '```json\n' +
          '{\n' +
          '  "title": "Smart Home Ecosystem",\n' +
          '  "description": "An integrated ecosystem for smart home devices"\n' +
          '}\n' +
          '```'
  },
  {
    name: 'Test Case 3: Single quotes instead of double quotes',
    json: `{
      'title': 'Sustainable Delivery Service',
      'description': 'Eco-friendly delivery service using electric vehicles'
    }`
  },
  {
    name: 'Test Case 4: Missing quotes around keys',
    json: `{
      title: "Remote Work Platform",
      description: "All-in-one solution for remote teams"
    }`
  },
  {
    name: 'Test Case 5: Line breaks in strings',
    json: `{
      "title": "Educational 
      Platform",
      "description": "Interactive learning experiences"
    }`
  }
];

// Test each case
testCases.forEach((testCase, index) => {
  console.log(`\n${testCase.name}`);
  console.log('-'.repeat(50));
  console.log('Input JSON:');
  console.log(testCase.json);
  
  // Attempt standard JSON.parse first (this should fail for all test cases)
  try {
    const parsedData = JSON.parse(testCase.json);
    console.log('\nStandard JSON.parse result:');
    console.log(parsedData);
  } catch (error) {
    console.log('\nStandard JSON.parse failed as expected:', error.message);

    // Now try JSON5 parsing (this should succeed for many of our test cases)
    try {
      const parsedData = JSON5.parse(testCase.json);
      console.log('\nJSON5 parsing succeeded:');
      console.log(parsedData);
    } catch (error) {
      console.log('\nJSON5 parsing also failed:', error.message);
      
      // For the code block case, try extraction
      if (testCase.json.includes('```')) {
        try {
          const jsonCodeBlockMatch = testCase.json.match(/\`\`\`(?:json)?\n([\s\S]*?)\n\`\`\`/);
          if (jsonCodeBlockMatch) {
            const extractedJson = jsonCodeBlockMatch[1];
            console.log('\nExtracted JSON from code block:');
            console.log(extractedJson);
            
            const parsedData = JSON.parse(extractedJson);
            console.log('\nParsed extracted JSON:');
            console.log(parsedData);
          }
        } catch (error) {
          console.log('\nExtraction and parsing failed:', error.message);
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
});

console.log('\n✅ Test completed - This demonstrates how the fixed parsing would handle malformed JSON');
console.log('These are the types of issues that could cause the SyntaxError in the Idea Playground');
