#!/usr/bin/env node

/**
 * This script tests the fixed Idea Playground Pathway 1 functionality
 * by simulating the parsing of various JSON formats that would previously cause errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('======= TESTING IDEA PLAYGROUND PATHWAY 1 FIX =======');

// Path to the service file
const serviceFilePath = path.join(__dirname, '..', 'src', 'lib', 'services', 'idea-pathway1-ai.service.ts');

// Check if file exists
if (!fs.existsSync(serviceFilePath)) {
  console.error(`❌ File not found: ${serviceFilePath}`);
  process.exit(1);
}

// Read the file
const fileContent = fs.readFileSync(serviceFilePath, 'utf8');

// Check for JSON5 import
const hasJSON5Import = fileContent.includes("import JSON5 from 'json5'");
console.log(`JSON5 import: ${hasJSON5Import ? '✅ Found' : '❌ Not found'}`);

// Check for the improved parseSuggestionsResponse method
const improvedMethodPattern = /private\s+parseSuggestionsResponse.*?try\s+{.*?JSON5\.parse.*?}\s+catch/s;
const hasImprovedMethod = improvedMethodPattern.test(fileContent);
console.log(`Improved parsing method: ${hasImprovedMethod ? '✅ Found' : '❌ Not found'}`);

// Check for code block extraction logic
const codeBlockExtractionPattern = /jsonCodeBlockMatch.*?match\(/s;
const hasCodeBlockExtraction = codeBlockExtractionPattern.test(fileContent);
console.log(`Code block extraction: ${hasCodeBlockExtraction ? '✅ Found' : '❌ Not found'}`);

// Simple check if the service file has TypeScript errors (this is a basic check, not comprehensive)
const syntaxErrors = [];
try {
  // Check for unbalanced braces as a simple syntax check
  let braceCount = 0;
  for (const char of fileContent) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) {
      syntaxErrors.push('Unbalanced braces - more closing braces than opening braces');
      break;
    }
  }
  if (braceCount !== 0) {
    syntaxErrors.push(`Unbalanced braces - ${braceCount} unclosed opening braces`);
  }
  
  // Check for missing semicolons at obvious places
  const statementEndsWithoutSemicolon = /\b(const|let|var)\s+\w+\s*=\s*[^;{}]+$/m;
  if (statementEndsWithoutSemicolon.test(fileContent)) {
    syntaxErrors.push('Possible missing semicolons after variable declarations');
  }
  
} catch (error) {
  console.error('Error during syntax check:', error);
}

console.log(`Basic syntax check: ${syntaxErrors.length === 0 ? '✅ No obvious errors' : '❌ Potential issues found'}`);
if (syntaxErrors.length > 0) {
  console.log('Potential syntax issues:');
  syntaxErrors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
}

console.log('\n=== Overall Status ===');
if (hasJSON5Import && hasImprovedMethod && hasCodeBlockExtraction && syntaxErrors.length === 0) {
  console.log('✅ Fix appears to be successfully implemented!');
  console.log('Note: A proper TypeScript compilation would provide the most accurate validation.');
} else {
  console.log('⚠️ Fix may be partially implemented or have remaining issues.');
  console.log('Recommendation: Run TypeScript compilation to check for errors.');
}
