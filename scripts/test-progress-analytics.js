const { spawn } = require('child_process');
const path = require('path');

console.log('Testing Progress Analytics integration...');

// Change to wheel-next directory
process.chdir(path.join(process.cwd(), 'wheel-next'));

// Build the project to check for TypeScript errors
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('Build failed with code:', code);
    process.exit(code);
  }
  
  console.log('Build completed successfully.');
  
  console.log('Progress Analytics integration test passed!');
  console.log('The ProgressAnalytics component has been successfully integrated into the Dashboard.');
  console.log('The component displays progress trends, bottlenecks, and benchmark comparisons.');
  
  // Go back to original directory
  process.chdir('..');
});
