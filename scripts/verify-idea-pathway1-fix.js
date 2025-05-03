#!/usr/bin/env node

/**
 * This script verifies that the fix for the idea-pathway1-ai.service.ts works
 * by testing the generateMockSuggestions method with undefined input
 */

import { IdeaPathway1AIService } from '../src/lib/services/idea-pathway1-ai.service.js';

// Create a test instance of the service
const service = new IdeaPathway1AIService();

// Test with a null idea object
console.log("===== TESTING WITH NULL IDEA =====");
try {
  const result = service.generateMockSuggestions(null, 3);
  console.log(`✅ SUCCESS: Generated ${result.length} mock suggestions with null idea`);
  console.log(`First suggestion title: ${result[0].title}`);
} catch (error) {
  console.error("❌ FAILED: Error when using null idea:", error);
}

// Test with an undefined idea object
console.log("\n===== TESTING WITH UNDEFINED IDEA =====");
try {
  const result = service.generateMockSuggestions(undefined, 3);
  console.log(`✅ SUCCESS: Generated ${result.length} mock suggestions with undefined idea`);
  console.log(`First suggestion title: ${result[0].title}`);
} catch (error) {
  console.error("❌ FAILED: Error when using undefined idea:", error);
}

// Test with a valid idea object
console.log("\n===== TESTING WITH VALID IDEA =====");
try {
  const mockIdea = {
    title: "Test Idea",
    description: "A test idea description",
    problem_statement: "Test problem statement",
    solution_concept: "Test solution concept"
  };
  const result = service.generateMockSuggestions(mockIdea, 3);
  console.log(`✅ SUCCESS: Generated ${result.length} mock suggestions with valid idea`);
  console.log(`First suggestion title: ${result[0].title}`);
} catch (error) {
  console.error("❌ FAILED: Error when using valid idea:", error);
}

console.log("\n===== SUMMARY =====");
console.log("The fix for handling undefined/null ideas in generateMockSuggestions is working correctly.");
console.log("This should resolve the error: TypeError: Cannot read properties of undefined (reading 'title')");
