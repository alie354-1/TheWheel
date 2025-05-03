#!/usr/bin/env node

/**
 * This script performs a full TypeScript type check across the entire project
 * to identify all TypeScript errors and generates a comprehensive report.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const OUTPUT_FILE = path.join(__dirname, 'typecheck-results.json');
const ERROR_SUMMARY_FILE = path.join(__dirname, 'typecheck-summary.md');

console.log('======= RUNNING FULL PROJECT TYPE CHECK =======');
console.log('This may take a few minutes depending on the size of your project...');

try {
  // Run the TypeScript compiler in noEmit mode to just check types
  console.log('Executing TypeScript compiler...');
  
  try {
    // Capture the output of tsc --noEmit
    const tscOutput = execSync('npx tsc --noEmit', { 
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    // If we got here, no errors were found
    console.log('✅ No TypeScript errors found in the project!');
    
    fs.writeFileSync(ERROR_SUMMARY_FILE, 
      `# TypeScript Error Report\n\n` +
      `**Scan Date:** ${new Date().toISOString()}\n\n` +
      `No TypeScript errors were found in the project. Great job! 🎉\n`
    );
    
    console.log(`Summary written to ${ERROR_SUMMARY_FILE}`);
    
  } catch (error) {
    // Parse the error output to extract meaningful information
    const errorOutput = error.stdout ? error.stdout.toString() : '';
    
    // Extract errors
    const errorPattern = /(.+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)/g;
    const errors = [];
    let match;
    
    while ((match = errorPattern.exec(errorOutput)) !== null) {
      errors.push({
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: `TS${match[4]}`,
        message: match[5]
      });
    }
    
    // Group errors by file
    const errorsByFile = {};
    errors.forEach(error => {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    });
    
    // Count error types
    const errorCounts = {};
    errors.forEach(error => {
      if (!errorCounts[error.code]) {
        errorCounts[error.code] = 0;
      }
      errorCounts[error.code]++;
    });
    
    // Save detailed error information
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errorsByFile,
      errorCounts
    }, null, 2));
    
    console.log(`❌ Found ${errors.length} TypeScript errors`);
    console.log(`Detailed error information saved to ${OUTPUT_FILE}`);
    
    // Generate a more readable summary file
    let summary = `# TypeScript Error Report\n\n`;
    summary += `**Scan Date:** ${new Date().toISOString()}\n\n`;
    summary += `**Total Errors:** ${errors.length}\n\n`;
    
    summary += `## Error Types\n\n`;
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count
      .forEach(([code, count]) => {
        summary += `- **${code}**: ${count} occurrences\n`;
      });
    
    summary += `\n## Errors by File\n\n`;
    Object.entries(errorsByFile)
      .sort((a, b) => b[1].length - a[1].length) // Sort by number of errors
      .forEach(([file, fileErrors]) => {
        summary += `### ${file} (${fileErrors.length} errors)\n\n`;
        fileErrors.forEach(error => {
          summary += `- Line ${error.line}: ${error.message} (${error.code})\n`;
        });
        summary += '\n';
      });
    
    // Add recommendations section
    summary += `## Recommendations\n\n`;
    
    // Common TS error codes and recommended fixes
    const commonErrors = {
      'TS2304': 'Define missing types or install type definitions',
      'TS2339': 'Fix property access on potentially undefined values',
      'TS2322': 'Correct type mismatches in assignments',
      'TS2345': 'Fix argument type mismatches in function calls',
      'TS2769': 'Update object literals to match expected types',
      'TS2739': 'Add missing properties to object literals',
      'TS2531': 'Add null checks before accessing properties',
      'TS1005': 'Fix syntax errors (often missing punctuation)',
      'TS1068': 'Fix unexpected tokens in class/interface definitions',
      'TS2451': 'Rename duplicate declarations',
      'TS2307': 'Fix module import errors',
      'TS2741': 'Fix incompatible property types',
      'TS2362': 'Fix arithmetic operations on incompatible types',
      'TS2366': 'Fix incompatible function return types',
      'TS2367': 'Fix incompatible conditional expressions',
      'TS2564': 'Initialize properties in constructor',
      'TS7030': 'Add return type annotation to function',
      'TS7031': 'Add types to function parameters',
    };
    
    // Provide recommendations based on the most common errors
    const topErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    topErrors.forEach(([code, count]) => {
      const recommendation = commonErrors[code] || 'Review and fix type errors';
      summary += `- **${code}** (${count} occurrences): ${recommendation}\n`;
    });
    
    // Calculate the most problematic files
    const topProblematicFiles = Object.entries(errorsByFile)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([file, errors]) => ({ file, count: errors.length }));
    
    summary += `\n### Most Problematic Files\n\n`;
    topProblematicFiles.forEach(({ file, count }) => {
      summary += `- **${file}**: ${count} errors\n`;
    });
    
    // Add general plan
    summary += `\n## Suggested Fix Strategy\n\n`;
    summary += `1. Start with the most problematic files first\n`;
    summary += `2. Focus on fixing one type of error at a time\n`;
    summary += `3. Consider creating utility types and type guards to address recurring issues\n`;
    summary += `4. Implement proper TypeScript typing for API responses and function parameters\n`;
    summary += `5. Address syntax errors before type errors\n`;
    
    fs.writeFileSync(ERROR_SUMMARY_FILE, summary);
    console.log(`Summary report written to ${ERROR_SUMMARY_FILE}`);
  }
  
} catch (error) {
  console.error('Error running type check:', error);
  process.exit(1);
}

console.log('\n======= TYPE CHECK COMPLETE =======');
console.log('Next steps:');
console.log('1. Review the error summary to understand the scope');
console.log('2. Prioritize files and error types for fixing');
console.log('3. Create a plan to address the errors systematically');
