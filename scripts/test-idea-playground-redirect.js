/**
 * Test script to verify the idea-playground redirect
 * 
 * This script simulates navigation to /idea-playground and checks if it redirects
 * to /idea-hub/playground as expected.
 */

const puppeteer = require('puppeteer');

async function testRedirect() {
  console.log('Starting redirect test...');
  
  // Launch a new browser instance
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the /idea-playground URL
    console.log('Navigating to /idea-playground...');
    await page.goto('http://localhost:3000/idea-playground', { waitUntil: 'networkidle0' });
    
    // Wait a moment for any redirects to complete
    await page.waitForTimeout(2000);
    
    // Get the current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check if we were redirected to /idea-hub/playground
    if (currentUrl.includes('/idea-hub/playground')) {
      console.log('✅ SUCCESS: Redirect is working correctly!');
    } else {
      console.log('❌ FAILED: Redirect is not working as expected.');
      console.log(`Expected URL to contain '/idea-hub/playground', but got '${currentUrl}'`);
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Test completed.');
  }
}

testRedirect();
