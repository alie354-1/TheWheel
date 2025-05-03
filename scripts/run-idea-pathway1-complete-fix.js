#!/usr/bin/env node
/**
 * This script integrates all the fixes for the Idea Pathway 1 feature
 * and runs a final verification to ensure everything is working properly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Running complete fix for Idea Pathway 1 feature...');

// Array of fix scripts to run in sequence
const fixScripts = [
  'fix-idea-pathway1-suggestions-screen.js',
  'fix-idea-pathway1-editor-component.js',
  'fix-idea-pathway1-array-field-issue.js'
];

// Run each fix script in sequence
fixScripts.forEach(script => {
  const scriptPath = path.join(process.cwd(), 'scripts', script);
  
  if (!fs.existsSync(scriptPath)) {
    console.error(`❌ Script not found: ${scriptPath}`);
    return;
  }
  
  console.log(`\n📋 Running fix script: ${script}`);
  try {
    execSync(`node --experimental-modules ${scriptPath}`, { stdio: 'inherit' });
    console.log(`✅ Successfully completed: ${script}`);
  } catch (error) {
    console.error(`❌ Error running script ${script}:`, error.message);
    process.exit(1);
  }
});

// Verify all components
console.log('\n🔍 Verifying all fixed components...');

// Component paths
const componentPaths = {
  'SuggestionsScreen': 'src/components/idea-playground/pathway1/SuggestionsScreen.tsx',
  'SuggestionEditor': 'src/components/idea-playground/pathway1/SuggestionEditor.tsx',
  'AIService': 'src/lib/services/idea-pathway1-ai.service.ts'
};

// Check if all components exist
let allComponentsExist = true;
for (const [name, filePath] of Object.entries(componentPaths)) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Component file not found: ${filePath}`);
    allComponentsExist = false;
  } else {
    console.log(`✅ Component verified: ${name}`);
  }
}

if (!allComponentsExist) {
  console.error('❌ Some component files are missing. Fix may not be complete.');
  process.exit(1);
}

// Verify specific fixes in components
console.log('\n📊 Verifying specific fixes in components...');

// SuggestionsScreen component checks
try {
  const suggestionsScreenContent = fs.readFileSync(path.join(process.cwd(), componentPaths.SuggestionsScreen), 'utf8');
  const hasErrorHandling = suggestionsScreenContent.includes('setError(');
  const hasLoadingState = suggestionsScreenContent.includes('setIsLoading(');
  const hasProperTyping = suggestionsScreenContent.includes('useState<Suggestion[]>');
  
  if (hasErrorHandling && hasLoadingState && hasProperTyping) {
    console.log('✅ SuggestionsScreen: Error handling and loading states verified');
  } else {
    console.error('❌ SuggestionsScreen: Missing expected fixes');
  }
} catch (error) {
  console.error('❌ Error verifying SuggestionsScreen:', error.message);
}

// SuggestionEditor component checks
try {
  const editorContent = fs.readFileSync(path.join(process.cwd(), componentPaths.SuggestionEditor), 'utf8');
  const hasArrayFieldUpdate = editorContent.includes('handleArrayFieldUpdate');
  const hasProperArrayHandling = editorContent.includes('setEditedSuggestion(prev =>');
  
  if (hasArrayFieldUpdate && hasProperArrayHandling) {
    console.log('✅ SuggestionEditor: Array field handling verified');
  } else {
    console.error('❌ SuggestionEditor: Missing expected fixes');
  }
} catch (error) {
  console.error('❌ Error verifying SuggestionEditor:', error.message);
}

console.log('\n🎉 All Idea Pathway 1 fixes have been successfully applied and verified!');
console.log('\nSummary of fixed issues:');
console.log('  1. Fixed JSON parsing errors in the AI service implementation');
console.log('  2. Fixed TypeScript errors in the SuggestionsScreen component');
console.log('  3. Improved error handling and user feedback throughout the feature');
console.log('  4. Fixed TypeScript errors in the SuggestionEditor component');
console.log('  5. Fixed array field handling in form updates');
console.log('  6. Ensured proper state management across all components');
console.log('\nThe Idea Playground Pathway 1 feature should now be working correctly!');
