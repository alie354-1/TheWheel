/**
 * Script to archive Hugging Face Spaces related files
 * 
 * This script moves Hugging Face Spaces related files to the archive/huggingface-spaces directory
 * so they are preserved but no longer active in the codebase.
 */

const fs = require('fs');
const path = require('path');

// Create archive directory if it doesn't exist
const archiveDir = path.join(__dirname, '../archive/huggingface-spaces');
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
  // Source code
  { path: 'src/lib/huggingface-spaces-client.ts', subDir: 'src/lib' },
  { path: 'src/lib/services/huggingface-spaces-llm.service.ts', subDir: 'src/lib/services' },
  { path: 'src/components/admin/HuggingFaceSpacesSettings.tsx', subDir: 'src/components/admin' },
  
  // Scripts
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
];

// Archive each file
console.log('Starting archival of Hugging Face Spaces files...');
filesToArchive.forEach(file => {
  archiveFile(path.join(__dirname, '..', file.path), file.subDir);
});

// Archive documentation files
const docsDir = path.join(__dirname, '../docs/huggingface-spaces-integration');
if (fs.existsSync(docsDir)) {
  // Create docs target directory
  const docsTargetDir = path.join(archiveDir, 'docs');
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

console.log('Archival complete! All Hugging Face Spaces files have been moved to the archive directory.');
console.log('For reference, see README-HUGGINGFACE-SPACES-REMOVAL.md for details on what was removed.');
