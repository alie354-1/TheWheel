#!/usr/bin/env node
/**
 * Dashboard Loading Diagnostics
 * 
 * This script helps diagnose dashboard loading issues and verify the fixes.
 * It will check if the development server is running, open the dashboard in a browser,
 * and execute the test-dashboard-load.js script.
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('\n🔍 Dashboard Loading Diagnostics Tool');
console.log('===================================\n');

// Utility function to open a URL in the default browser
function openBrowser(url) {
  const command = process.platform === 'win32' ? 'start' :
                 process.platform === 'darwin' ? 'open' : 'xdg-open';
  return execPromise(`${command} "${url}"`);
}

// Main diagnostic function
async function runDiagnostics() {
  try {
    // Step 1: Check if development server is running
    console.log('1️⃣ Checking if development server is running...');
    
    let serverRunning = false;
    try {
      const { stdout } = await execPromise('lsof -i :3000 -sTCP:LISTEN || echo "Not running"');
      serverRunning = !stdout.includes('Not running');
    } catch (error) {
      // On Windows, the above command will fail, try netstat instead
      try {
        const { stdout } = await execPromise('netstat -ano | findstr :3000');
        serverRunning = stdout.trim().length > 0;
      } catch (netstatError) {
        // If both fail, assume server is not running
        serverRunning = false;
      }
    }

    if (serverRunning) {
      console.log('✅ Development server is running on port 3000');
    } else {
      console.log('❌ Development server is not running');
      console.log('   Starting the development server for you...');
      
      // Start the dev server
      const devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: true,
        shell: true
      });
      
      // Log output with a prefix
      devServer.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim().length > 0) {
            console.log(`   [Dev Server] ${line}`);
          }
        });
      });
      
      devServer.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim().length > 0) {
            console.log(`   [Dev Server Error] ${line}`);
          }
        });
      });
      
      // Give the server time to start
      console.log('   Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      serverRunning = true;
      console.log('   Server should be running now');
    }

    // Step 2: Create a test HTML file that loads the test script
    console.log('\n2️⃣ Creating dashboard test runner...');
    
    const testRunnerFile = path.join(__dirname, '..', 'public', 'dashboard-test-runner.html');
    
    const testRunnerContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Test Runner</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #333; }
    .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .success { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .error { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
    code { background: #f1f1f1; padding: 2px 4px; border-radius: 3px; }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    button:hover { background: #0069d9; }
    pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    #log {
      background: #212529;
      color: #adb5bd;
      padding: 15px;
      border-radius: 5px;
      height: 300px;
      overflow-y: auto;
      margin-top: 20px;
    }
    .success-log { color: #28a745; }
    .error-log { color: #dc3545; }
    .warning-log { color: #ffc107; }
  </style>
</head>
<body>
  <h1>Dashboard Test Runner</h1>
  
  <div class="info">
    <p>This tool will help diagnose dashboard loading issues in the application.</p>
    <p>To run tests:</p>
    <ol>
      <li>Click the "Open Dashboard" button below to navigate to the dashboard</li>
      <li>Once dashboard is loaded, click the "Run Tests" button</li>
      <li>Check console output for detailed results</li>
    </ol>
  </div>
  
  <div>
    <button id="openDashboard">Open Dashboard</button>
    <button id="runTests">Run Tests</button>
  </div>
  
  <div id="log"><div class="info-log">Waiting for test to run...</div></div>
  
  <div class="warning">
    <strong>Note:</strong> If you see any errors in the log below, refer to the 
    <code>docs/DASHBOARD_LOADING_FIX_DETAILS.md</code> file for troubleshooting steps.
  </div>
  
  <script>
    // Setup the log display
    const logElement = document.getElementById('log');
    
    // Function to add log messages
    function log(message, type = 'info') {
      const logEntry = document.createElement('div');
      logEntry.className = \`\${type}-log\`;
      logEntry.textContent = message;
      logElement.appendChild(logEntry);
      logElement.scrollTop = logElement.scrollHeight;
    }
    
    // Open Dashboard button
    document.getElementById('openDashboard').addEventListener('click', () => {
      log('Opening dashboard...');
      window.open('/dashboard', '_blank');
    });
    
    // Run Tests button
    document.getElementById('runTests').addEventListener('click', () => {
      log('Running dashboard tests...');
      log('Paste this code in the dashboard browser console:', 'warning');
      log(\`
const script = document.createElement('script');
script.src = '/scripts/test-dashboard-load.js';
document.body.appendChild(script);
\`, 'info');
      
      log('Check browser console for detailed results', 'info');
    });
  </script>
</body>
</html>
    `;
    
    fs.writeFileSync(testRunnerFile, testRunnerContent);
    console.log(`✅ Created test runner at ${testRunnerFile}`);
    
    // Step 3: Open the test runner in a browser
    console.log('\n3️⃣ Opening test runner in browser...');
    try {
      await openBrowser('http://localhost:3000/dashboard-test-runner.html');
      console.log('✅ Browser opened with test runner');
    } catch (error) {
      console.log('❌ Failed to open browser automatically');
      console.log('   Please open this URL manually: http://localhost:3000/dashboard-test-runner.html');
    }
    
    // Final instructions
    console.log('\n📋 Final Instructions:');
    console.log('1. In the test runner browser window, click "Open Dashboard"');
    console.log('2. Once the dashboard loads, click "Run Tests"');
    console.log('3. Follow the instructions to paste the test script code in the browser console');
    console.log('4. Check the browser console for detailed diagnostic results');
    console.log('\nThank you for using the Dashboard Diagnostics Tool!');
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed with error:', error.message);
    console.log('Please check your environment and try again.');
  }
}

// Run the diagnostics
runDiagnostics().catch(console.error);
