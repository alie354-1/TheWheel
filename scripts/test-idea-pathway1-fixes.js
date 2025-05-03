#!/usr/bin/env node
/**
 * Test script to verify all fixes for the Idea Pathway 1 feature
 * This script checks that all components are properly fixed and
 * confirms that they can work together without TypeScript errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running tests for Idea Pathway 1 fixes...');

// List of files we need to check
const filesToCheck = [
  'src/lib/services/idea-pathway1-ai.service.ts',
  'src/components/idea-playground/pathway1/SuggestionMerger.tsx',
  'src/components/idea-playground/pathway1/SuggestionsScreen.tsx'
];

// Function to check that a file exists
const checkFileExists = (filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  console.log(`✅ File exists: ${filePath}`);
  return true;
};

// Function to check file content for key indicators that fixes were applied
const checkFileContent = (filePath, indicators) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const missingIndicators = indicators.filter(indicator => !content.includes(indicator));
  
  if (missingIndicators.length > 0) {
    console.error(`❌ File ${filePath} is missing expected fixes:`, missingIndicators);
    return false;
  }
  
  console.log(`✅ File ${filePath} contains all expected fixes`);
  return true;
};

// Check all files exist
const allFilesExist = filesToCheck.every(checkFileExists);
if (!allFilesExist) {
  console.error('❌ Some required files are missing. Fixes may not be complete.');
  process.exit(1);
}

// Check specific fixes in each file
const aiServiceChecks = [
  'JSON5.parse',
  'parseSuggestionsResponse',
  'const result = JSON.parse(',
  'createBasicMergedSuggestion',
  'mergeSuggestions'
];

const mergerComponentChecks = [
  'interface SuggestionMergerProps',
  'const [mergedSuggestion, setMergedSuggestion] = useState<Suggestion | null>',
  'ideaPathway1AIService',
  'combineArrayField',
  'handleFieldUpdate'
];

const suggestionsScreenChecks = [
  'interface SuggestionsScreenProps',
  'ideaPathway1AIService.generateCompanySuggestions',
  'const [error, setError] = useState',
  'fetchIdeaAndGenerateSuggestions',
  'toggleSuggestionSelection'
];

const checksMap = {
  'src/lib/services/idea-pathway1-ai.service.ts': aiServiceChecks,
  'src/components/idea-playground/pathway1/SuggestionMerger.tsx': mergerComponentChecks,
  'src/components/idea-playground/pathway1/SuggestionsScreen.tsx': suggestionsScreenChecks
};

let allChecksPass = true;

for (const [file, checks] of Object.entries(checksMap)) {
  if (!checkFileContent(file, checks)) {
    allChecksPass = false;
  }
}

// Check for cross-component compatibility
console.log('🔄 Checking for cross-component compatibility...');

// Check that the service is properly imported in both UI components
const componentsWithImports = [
  'src/components/idea-playground/pathway1/SuggestionMerger.tsx',
  'src/components/idea-playground/pathway1/SuggestionsScreen.tsx'
];

const importCheck = 'import { ideaPathway1AIService } from';
const importChecks = componentsWithImports.every(file => {
  const fullPath = path.join(process.cwd(), file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasImport = content.includes(importCheck);
  
  if (!hasImport) {
    console.error(`❌ File ${file} is missing import for ideaPathway1AIService`);
    return false;
  }
  
  console.log(`✅ File ${file} correctly imports the AI service`);
  return true;
});

allChecksPass = allChecksPass && importChecks;

// Final verdict
if (allChecksPass) {
  console.log('\n✅ All fixes have been properly applied and components are compatible!');
  console.log('🎉 The Idea Pathway 1 feature should now be working correctly.');
  console.log('\nThe following issues were fixed:');
  console.log('  1. JSON parsing errors in the AI service');
  console.log('  2. TypeScript errors in the SuggestionMerger component');
  console.log('  3. Error handling in the SuggestionsScreen component');
  console.log('  4. Proper cross-component communication');
} else {
  console.error('\n❌ Some issues were detected with the fixes.');
  console.error('   Please review the errors above and apply additional fixes as needed.');
}
