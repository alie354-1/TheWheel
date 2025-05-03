/**
 * Direct browser test script for Hugging Face Space
 * 
 * This script attempts to open the Hugging Face Space in a browser
 * and check its status.
 */

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSpaceStatus() {
  console.log('Checking Hugging Face Space status...');
  
  try {
    // Get the current settings
    const { data: spacesSettings, error: spacesError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'huggingface_spaces')
      .maybeSingle();
    
    if (spacesError) {
      console.error('Error fetching Hugging Face Spaces settings:', spacesError);
      process.exit(1);
    }
    
    if (!spacesSettings) {
      console.log('Hugging Face Spaces settings not found.');
      process.exit(1);
    }
    
    // Get the base space URL
    const baseSpace = spacesSettings.value.spaces.base;
    if (!baseSpace.space_url) {
      console.log('No base Space URL configured.');
      process.exit(1);
    }
    
    const spaceUrl = baseSpace.space_url;
    console.log(`Checking Space URL: ${spaceUrl}`);
    
    // Launch a browser to check the Space status
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Log console messages
    page.on('console', message => console.log(`BROWSER CONSOLE: ${message.text()}`));
    
    // Navigate to the Space URL
    console.log(`Navigating to ${spaceUrl}...`);
    await page.goto(spaceUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Take a screenshot
    await page.screenshot({ path: 'huggingface-space-status.png' });
    console.log('Screenshot saved to huggingface-space-status.png');
    
    // Check if Space is sleeping
    const pageContent = await page.content();
    if (pageContent.includes('This Space is currently asleep') || 
        pageContent.includes('This Space is currently paused')) {
      console.log('\n⚠️ SPACE IS SLEEPING OR PAUSED');
      console.log('The Space needs to be restarted. Visit the Space URL in your browser and click "Restart Space".');
    } else {
      console.log('\n✅ SPACE APPEARS TO BE ACTIVE');
      
      // Try to find API documentation or usage examples
      const apiDocsText = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, code, pre'));
        return elements
          .filter(el => 
            el.textContent.toLowerCase().includes('api') || 
            el.textContent.toLowerCase().includes('endpoint') ||
            el.textContent.toLowerCase().includes('predict') ||
            el.textContent.toLowerCase().includes('generate') ||
            el.textContent.toLowerCase().includes('example')
          )
          .map(el => el.textContent.trim())
          .join('\n');
      });
      
      if (apiDocsText) {
        console.log('\nPossible API documentation found:');
        console.log(apiDocsText);
      }
    }
    
    // Check if there's a direct API URL in the page
    const apiUrls = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('a'));
      return elements
        .filter(el => 
          el.href.includes('api') || 
          el.href.includes('predict') || 
          el.href.includes('generate') ||
          el.textContent.toLowerCase().includes('api')
        )
        .map(el => ({ url: el.href, text: el.textContent.trim() }));
    });
    
    if (apiUrls.length > 0) {
      console.log('\nPossible API URLs found:');
      apiUrls.forEach(({ url, text }) => {
        console.log(`- ${url} (${text})`);
      });
    }
    
    // Wait for user to review, then close
    console.log('\nPress Enter to close the browser...');
    process.stdin.once('data', async () => {
      await browser.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error checking Space status:', error);
    process.exit(1);
  }
}

// Run the check
checkSpaceStatus();
