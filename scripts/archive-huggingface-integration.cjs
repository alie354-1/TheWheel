/**
 * Script to archive all Hugging Face related files (both Spaces and standard API)
 * 
 * This script moves all Hugging Face related files to the archive/huggingface directory
 * so they are preserved but no longer active in the codebase.
 */

const fs = require('fs');
const path = require('path');

// Create archive directory if it doesn't exist
const archiveDir = path.join(__dirname, '../archive/huggingface');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log(`Created archive directory: ${archiveDir}`);
}

// Function to move a file to the archive directory
function archiveFile(sourcePath, targetSubDir = '') {
  try {
    const fileName = path.basename(sourcePath);
    const targetDir = path.join(archiveDir, targetSubDir);
    
    // Create target subdirectory if it doesn't exist
    if (targetSubDir && !fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, fileName);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`File not found, skipping: ${sourcePath}`);
      return;
    }
    
    // Move file to archive
    fs.copyFileSync(sourcePath, targetPath);
    fs.unlinkSync(sourcePath);
    console.log(`Archived: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    console.error(`Error archiving ${sourcePath}:`, error);
  }
}

// List of files to archive
const filesToArchive = [
  // Core Standard API files
  { path: 'src/lib/huggingface-client.ts', subDir: 'src/lib' },
  { path: 'src/lib/services/huggingface-llm.service.ts', subDir: 'src/lib/services' },
  { path: 'src/components/admin/HuggingFaceSettings.tsx', subDir: 'src/components/admin' },
  
  // Spaces-related files (already handled by other script, but included for completeness)
  { path: 'src/lib/huggingface-spaces-client.ts', subDir: 'src/lib' },
  { path: 'src/lib/services/huggingface-spaces-llm.service.ts', subDir: 'src/lib/services' },
  { path: 'src/components/admin/HuggingFaceSpacesSettings.tsx', subDir: 'src/components/admin' },
  
  // Scripts
  { path: 'scripts/test-huggingface-integration.js', subDir: 'scripts' },
  { path: 'scripts/test-huggingface-api-key.js', subDir: 'scripts' },
  { path: 'scripts/diagnose-huggingface-key.js', subDir: 'scripts' },
  { path: 'scripts/test-huggingface-api-key-direct.js', subDir: 'scripts' },
  { path: 'scripts/verify-huggingface-model-access.js', subDir: 'scripts' },
  { path: 'scripts/check-huggingface-db-settings.js', subDir: 'scripts' },
  { path: 'scripts/key-validator.js', subDir: 'scripts' },
  { path: 'scripts/archive-huggingface-spaces.js', subDir: 'scripts' },
  { path: 'scripts/archive-huggingface-spaces.cjs', subDir: 'scripts' },
  
  // Spaces-specific scripts (already handled by other script, but included for completeness)
  { path: 'scripts/run-huggingface-spaces-migration.js', subDir: 'scripts' },
  { path: 'scripts/fix-huggingface-spaces-migration.js', subDir: 'scripts' },
  { path: 'scripts/fix-huggingface-spaces-endpoint.js', subDir: 'scripts' },
  { path: 'scripts/test-huggingface-spaces.js', subDir: 'scripts' },
  { path: 'scripts/test-huggingface-spaces-integration.js', subDir: 'scripts' },
  { path: 'scripts/test-huggingface-spaces-connection.js', subDir: 'scripts' },
  { path: 'scripts/test-huggingface-spaces-connection.cjs', subDir: 'scripts' },
  { path: 'scripts/check-huggingface-space-status.js', subDir: 'scripts' },
  { path: 'scripts/check-huggingface-space-direct.cjs', subDir: 'scripts' },
  { path: 'scripts/add-huggingface-auth-token.cjs', subDir: 'scripts' },
  { path: 'scripts/run-huggingface-fix.js', subDir: 'scripts' },
  { path: 'scripts/run-huggingface-fix.cjs', subDir: 'scripts' },
  { path: 'scripts/fix-huggingface-spaces-settings.js', subDir: 'scripts' },
  
  // Docs and READMEs
  { path: 'README-HUGGINGFACE.md', subDir: '' },
  { path: 'README-HUGGINGFACE-FIX.md', subDir: '' },
  { path: 'README-HUGGINGFACE-SPACES-FIX.md', subDir: '' },
  { path: 'README-HUGGINGFACE-SPACES-REMOVAL.md', subDir: '' },
  { path: 'HUGGINGFACE-SPACES-DIAGNOSTIC-RESULT.md', subDir: '' },
  { path: 'scripts/README-HUGGINGFACE-TEST.md', subDir: 'scripts' },
];

// Archive each file
console.log('Starting archival of all Hugging Face files...');
filesToArchive.forEach(file => {
  archiveFile(path.join(__dirname, '..', file.path), file.subDir);
});

// Archive documentation directories
const docsDirs = [
  path.join(__dirname, '../docs/huggingface-spaces-integration'),
  path.join(__dirname, '../docs/huggingface-integration')
];

docsDirs.forEach(docsDir => {
  if (fs.existsSync(docsDir)) {
    // Create docs target directory
    const dirName = path.basename(docsDir);
    const docsTargetDir = path.join(archiveDir, 'docs', dirName);
    
    if (!fs.existsSync(docsTargetDir)) {
      fs.mkdirSync(docsTargetDir, { recursive: true });
    }
    
    // Get all files in the docs directory
    const docFiles = fs.readdirSync(docsDir);
    
    // Archive each doc file
    docFiles.forEach(docFile => {
      const sourcePath = path.join(docsDir, docFile);
      const targetPath = path.join(docsTargetDir, docFile);
      
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Archived: ${sourcePath} -> ${targetPath}`);
    });
    
    // Remove the original docs directory
    fs.rmSync(docsDir, { recursive: true, force: true });
    console.log(`Removed original docs directory: ${docsDir}`);
  }
});

console.log('Archival complete! All Hugging Face files have been moved to the archive directory.');
console.log('You will need to modify the following files to remove references to Hugging Face:');
console.log('1. src/lib/services/general-llm.service.ts (remove imports and Hugging Face service handling)');
console.log('2. src/lib/store.ts (remove Hugging Face feature flags)');
console.log('3. src/components/admin/FeatureFlagsSettings.tsx (remove Hugging Face UI options)');
console.log('4. src/pages/SettingsPage.tsx (remove HuggingFaceSettings component)');
