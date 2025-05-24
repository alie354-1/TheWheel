/**
 * Refactor Service Access Tool
 * 
 * This script analyzes code files to identify direct service access patterns and
 * suggests replacements with the service registry or hooks pattern.
 * 
 * Usage: node refactor-service-access.js [directory]
 * 
 * If no directory is specified, it defaults to "src".
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  // Services we want to refactor access to
  services: [
    { name: 'analyticsService', registry: 'analytics', hook: 'useAnalytics' },
    { name: 'featureFlagsService', registry: 'featureFlags', hook: 'useFeatureFlags' },
    { name: 'loggingService', registry: 'logging', hook: 'useLogging' },
    { name: 'authService', registry: 'auth', hook: 'useAuth' },
    { name: 'notificationService', registry: 'notification', hook: 'useNotification' },
    { name: 'companyAccessService', registry: 'companyAccess', hook: null },
  ],
  // File types to analyze
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  // Directories to ignore
  ignoreDirs: ['node_modules', 'build', 'dist', 'coverage', '.git'],
};

// Initialize
const rootDir = process.argv[2] || 'src';
const rootPath = path.resolve(process.cwd(), rootDir);
let totalFiles = 0;
let modifiedFiles = 0;
let serviceUsages = {};

// Initialize service usage tracking
CONFIG.services.forEach(service => {
  serviceUsages[service.name] = { direct: 0, registry: 0, hook: 0 };
});

/**
 * Main execution function
 */
async function main() {
  console.log(`\n🔍 Analyzing ${rootDir} for service access patterns...\n`);
  
  // Get all files to process
  const files = getFiles(rootPath);
  totalFiles = files.length;
  
  // Process each file
  for (const file of files) {
    await processFile(file);
  }
  
  // Print summary
  printSummary();
}

/**
 * Get all files to process
 */
function getFiles(dir) {
  const pattern = `${dir}/**/*{${CONFIG.fileExtensions.join(',')}}` 
  return glob.sync(pattern, {
    ignore: CONFIG.ignoreDirs.map(d => `${dir}/**/${d}/**`)
  });
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let modifiedContent = content;
    
    // Track service usage
    CONFIG.services.forEach(service => {
      // Check for direct imports
      const directImportRegex = new RegExp(`import\\s+{\\s*${service.name}\\s*}\\s+from`, 'g');
      const directImportMatches = content.match(directImportRegex) || [];
      serviceUsages[service.name].direct += directImportMatches.length;
      
      // Check for registry access
      const registryAccessRegex = new RegExp(`serviceRegistry\\.get\\(['"]${service.registry}['"]\\)`, 'g');
      const registryAccessMatches = content.match(registryAccessRegex) || [];
      serviceUsages[service.name].registry += registryAccessMatches.length;
      
      // Check for hook usage if available
      if (service.hook) {
        const hookUsageRegex = new RegExp(`${service.hook}\\(\\)`, 'g');
        const hookUsageMatches = content.match(hookUsageRegex) || [];
        serviceUsages[service.name].hook += hookUsageMatches.length;
      }
    });
    
    // Calculate suggested modifications
    const modifications = calculateModifications(filePath, content);
    
    // If we have suggested modifications, log them
    if (modifications.length > 0) {
      console.log(`\n📁 ${path.relative(process.cwd(), filePath)}`);
      modifications.forEach(mod => {
        console.log(`   🔄 Line ${mod.line}: ${mod.original} -> ${mod.suggested}`);
      });
      modifiedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Calculate suggested modifications for a file
 */
function calculateModifications(filePath, content) {
  const lines = content.split('\n');
  const modifications = [];
  const isReactComponent = isReactFile(filePath, content);
  
  // Look for direct service imports and suggest alternatives
  CONFIG.services.forEach(service => {
    const directImportRegex = new RegExp(`import\\s+{\\s*${service.name}\\s*}\\s+from`, 'g');
    
    // Check if file has direct imports
    if (directImportRegex.test(content)) {
      // For React components, suggest hooks
      if (isReactComponent && service.hook) {
        modifications.push({
          line: findLineNumber(lines, service.name),
          original: `import { ${service.name} } from '...'`,
          suggested: `import { ${service.hook} } from '../../lib/hooks/${service.hook}'`,
          type: 'import'
        });
        
        // Also suggest usage replacement
        const usageLines = findServiceUsageLines(lines, service.name);
        usageLines.forEach(lineNum => {
          modifications.push({
            line: lineNum,
            original: `${service.name}.someMethod()`,
            suggested: `const { someMethod } = ${service.hook}()`,
            type: 'usage'
          });
        });
      } 
      // For non-React files, suggest service registry
      else {
        modifications.push({
          line: findLineNumber(lines, service.name),
          original: `import { ${service.name} } from '...'`,
          suggested: `import { serviceRegistry } from '../../lib/services/registry'`,
          type: 'import'
        });
        
        // Also suggest usage replacement
        const usageLines = findServiceUsageLines(lines, service.name);
        usageLines.forEach(lineNum => {
          modifications.push({
            line: lineNum,
            original: `${service.name}.someMethod()`,
            suggested: `serviceRegistry.get('${service.registry}').someMethod()`,
            type: 'usage'
          });
        });
      }
    }
  });
  
  return modifications;
}

/**
 * Find line number for a specific string in the content
 */
function findLineNumber(lines, searchString) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1; // Line numbers are 1-based
    }
  }
  return 0;
}

/**
 * Find lines where a service is used
 */
function findServiceUsageLines(lines, serviceName) {
  const lineNumbers = [];
  for (let i = 0; i < lines.length; i++) {
    // Skip import lines
    if (!lines[i].includes('import') && lines[i].includes(serviceName)) {
      lineNumbers.push(i + 1); // Line numbers are 1-based
    }
  }
  return lineNumbers;
}

/**
 * Determine if a file is a React component
 */
function isReactFile(filePath, content) {
  // Check file extension
  const isReactExt = ['.jsx', '.tsx'].includes(path.extname(filePath));
  
  // Check for React imports or functional component patterns
  const hasReactImport = content.includes('import React') || content.includes('from \'react\'');
  const hasJSXSyntax = content.includes('</') || content.includes('/>');
  
  return isReactExt || (hasReactImport && hasJSXSyntax);
}

/**
 * Print a summary of findings
 */
function printSummary() {
  console.log('\n📊 Summary:');
  console.log(`   📁 Total files analyzed: ${totalFiles}`);
  console.log(`   🔄 Files with suggested changes: ${modifiedFiles}`);
  console.log('\n📊 Service Usage Patterns:');
  
  CONFIG.services.forEach(service => {
    const stats = serviceUsages[service.name];
    console.log(`   ${service.name}:`);
    console.log(`     - Direct imports: ${stats.direct}`);
    console.log(`     - Registry access: ${stats.registry}`);
    if (service.hook) {
      console.log(`     - Hook usage: ${stats.hook}`);
    }
  });
  
  console.log('\n📝 Recommendations:');
  console.log('   1. Replace direct service imports with service registry or hooks pattern');
  console.log('   2. For React components, prefer hooks pattern when available');
  console.log('   3. For utility functions or non-React code, use service registry');
  console.log('   4. Run TypeScript checks after making changes to ensure type safety');
  
  console.log('\n✨ Done!\n');
}

// Run the script
main().catch(err => console.error('❌ Error:', err));