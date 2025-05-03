#!/usr/bin/env node

import JSON5 from 'json5';

// Test JSON responses with different issues
const testCases = [
  // Case 1: Extra trailing comma in array
  {
    name: "Trailing comma in array",
    input: `
    [
      {
        "title": "Smart Home Hub",
        "description": "A central system for smart devices",
        "value": "Universal compatibility"
      },
    ]
    `
  },
  
  // Case 2: Unquoted property names
  {
    name: "Unquoted property names",
    input: `
    [
      {
        title: "Smart Home Hub",
        description: "A central system for smart devices",
        "value": "Universal compatibility"
      }
    ]
    `
  },
  
  // Case 3: Multiple objects without array (simulate broken JSON)
  {
    name: "Multiple objects without array",
    input: `
    {
      "title": "Smart Home Hub",
      "description": "A central system for smart devices",
      "value": "Universal compatibility"
    }
    
    {
      "title": "Energy Monitor",
      "description": "Monitor and optimize energy usage",
      "value": "Cost savings"
    }
    `
  },
  
  // Case 4: Missing quotes on string values
  {
    name: "Missing quotes on string values",
    input: `
    [
      {
        "title": Smart Home Hub,
        "description": "A central system for smart devices",
        "value": Universal compatibility
      }
    ]
    `
  },

  // Case 5: Extra commas in object properties
  {
    name: "Extra commas in object properties",
    input: `
    [
      {
        "title": "Smart Home Hub", 
        "description": "A central system for smart devices",
        "properties": ["easy to use", "compatible", ],
        "metrics": ["users", "devices", ],
      }
    ]
    `
  }
];

// Apply various parsing strategies
function tryMultipleParsingStrategies(content) {
  console.log("\nTrying multiple parsing strategies...");
  
  // Strategy 1: Direct JSON5 parsing
  try {
    const result = JSON5.parse(content);
    console.log("✅ Strategy 1 (Direct JSON5 parse) succeeded");
    return result;
  } catch (e) {
    console.log("❌ Strategy 1 (Direct JSON5 parse) failed:", e.message);
  }
  
  // Strategy 2: Find and extract a JSON array using regex, then parse with JSON5
  try {
    const jsonArrayMatch = content.match(/(\[[\s\S]*?\])(?:\s*$|\s*[^\]\s])/);
    if (jsonArrayMatch) {
      const jsonString = jsonArrayMatch[1];
      const result = JSON5.parse(jsonString);
      console.log("✅ Strategy 2 (Extract JSON array + JSON5) succeeded");
      return result;
    }
  } catch (e) {
    console.log("❌ Strategy 2 (Extract JSON array + JSON5) failed:", e.message);
  }
  
  // Strategy 3: Find individual JSON objects, compose an array, then parse with JSON5
  try {
    const jsonObjectMatches = Array.from(content.matchAll(/\{[\s\S]*?(?:\}(?=\s*[\{\]]|\s*$))/g));
    if (jsonObjectMatches && jsonObjectMatches.length > 0) {
      const jsonString = '[' + jsonObjectMatches.map(match => match[0]).join(',') + ']';
      const result = JSON5.parse(jsonString);
      console.log("✅ Strategy 3 (Compose array from objects + JSON5) succeeded");
      return result;
    }
  } catch (e) {
    console.log("❌ Strategy 3 (Compose array from objects + JSON5) failed:", e.message);
  }
  
  // Strategy 4: Aggressive preprocessing before JSON5 parsing
  try {
    let processedContent = content;
    
    // First try to extract what looks like a JSON array
    const arrayMatch = processedContent.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      processedContent = arrayMatch[0];
    }
    
    // Apply aggressive fixes
    processedContent = aggressiveJSONPreprocessing(processedContent);
    
    // Try to parse with JSON5 after preprocessing
    const result = JSON5.parse(processedContent);
    console.log("✅ Strategy 4 (Aggressive preprocessing + JSON5) succeeded");
    return result;
  } catch (e) {
    console.log("❌ Strategy 4 (Aggressive preprocessing + JSON5) failed:", e.message);
  }
  
  // Strategy 5: Last-ditch effort - try to extract and parse individual objects
  try {
    const pattern = /\{\s*"?title"?[\s\S]*?(?:\}(?=\s*[\{\]]|\s*$))/g;
    const objectMatches = Array.from(content.matchAll(pattern));
    
    if (objectMatches && objectMatches.length > 0) {
      const parsedObjects = [];
      
      for (const match of objectMatches) {
        try {
          // Try to parse each object individually
          const obj = JSON5.parse(match[0]);
          parsedObjects.push(obj);
        } catch (err) {
          // Skip objects that can't be parsed
          console.log('Failed to parse individual object');
        }
      }
      
      if (parsedObjects.length > 0) {
        console.log(`✅ Strategy 5 (Parse individual objects) succeeded for ${parsedObjects.length} objects`);
        return parsedObjects;
      }
    }
  } catch (e) {
    console.log("❌ Strategy 5 (Parse individual objects) failed:", e.message);
  }
  
  // All strategies failed
  return null;
}

// Aggressive preprocessing of JSON to fix common issues
function aggressiveJSONPreprocessing(jsonString) {
  let processed = jsonString;
  
  // Fix trailing commas in objects and arrays
  processed = processed.replace(/,(\s*[\}\]])/g, '$1');
  
  // Fix missing commas between objects in arrays
  processed = processed.replace(/\}(\s*)\{/g, '},\$1{');
  
  // Fix unquoted property names
  processed = processed.replace(/(\s*)([a-zA-Z0-9_]+)(\s*):(\s*)/g, '$1"$2"$3:$4');
  
  // Fix single quotes around property names or string values (replace with double quotes)
  processed = processed.replace(/'([^']+)'/g, '"$1"');
  
  // Add quotes around unquoted string values
  processed = processed.replace(/:(\s*)([a-zA-Z0-9_\s]+)(,|$|\n|\r)/g, ':\$1"\$2"\$3');
  
  // Remove any special characters that could break JSON parsing
  processed = processed.replace(/[\u0000-\u0019]+/g, '');
  
  return processed;
}

// Run the test for each case
function runTests() {
  console.log("🧪 TESTING JSON PARSING STRATEGIES 🧪");
  console.log("===============================");
  
  testCases.forEach((testCase, index) => {
    console.log(`\n[Test Case ${index + 1}] ${testCase.name}`);
    console.log("Input:", testCase.input);
    
    // Try to parse with standard JSON first (should fail)
    try {
      const result = JSON.parse(testCase.input);
      console.log("👎 Standard JSON.parse succeeded unexpectedly:", result);
    } catch (e) {
      console.log("👍 Standard JSON.parse failed as expected:", e.message);
      
      // Now try our enhanced strategies
      const parsedResult = tryMultipleParsingStrategies(testCase.input);
      if (parsedResult) {
        console.log("✅ Enhanced parsing succeeded:", JSON.stringify(parsedResult, null, 2));
      } else {
        console.log("❌ Enhanced parsing failed for all strategies");
      }
    }
    
    console.log("---------------------------------------");
  });
  
  console.log("\n🏁 Testing complete");
}

// Run the tests
runTests();
