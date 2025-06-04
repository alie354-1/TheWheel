// Test script to verify rendering consistency between preview modes
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the deck preview page
    await page.goto('http://localhost:3000/decks/preview/test-deck');
    
    // Wait for the page to load
    await page.waitForSelector('.preview-slide-wrapper');
    
    console.log('Testing small preview rendering...');
    await page.screenshot({ path: 'small-preview.png' });
    
    // Toggle fullscreen mode
    const fullscreenButton = await page.waitForSelector('button[title="Toggle Fullscreen"]');
    await fullscreenButton.click();
    
    // Wait for fullscreen transition
    await page.waitForTimeout(1000);
    
    console.log('Testing large preview rendering...');
    await page.screenshot({ path: 'large-preview.png' });
    
    console.log('Test completed! Check small-preview.png and large-preview.png to verify rendering consistency');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
