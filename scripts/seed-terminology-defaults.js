#!/usr/bin/env node

/**
 * Seed Terminology Defaults
 * 
 * This script populates the default terminology entries in the database.
 * Run after migrations to ensure the system has proper baseline terminology.
 */

// Import dependencies
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default terminology set
const defaultTerminology = {
  // Journey terminology
  "journeyTerms.mainUnit.singular": "journey",
  "journeyTerms.mainUnit.plural": "journeys",
  "journeyTerms.mainUnit.verb": "complete",
  "journeyTerms.mainUnit.possessive": "journey's",
  "journeyTerms.mainUnit.articleIndefinite": "a",
  "journeyTerms.mainUnit.articleDefinite": "the",
  
  "journeyTerms.phaseUnit.singular": "phase",
  "journeyTerms.phaseUnit.plural": "phases",
  "journeyTerms.phaseUnit.possessive": "phase's",
  "journeyTerms.phaseUnit.articleIndefinite": "a",
  "journeyTerms.phaseUnit.articleDefinite": "the",
  
  "journeyTerms.stepUnit.singular": "step",
  "journeyTerms.stepUnit.plural": "steps",
  "journeyTerms.stepUnit.verb": "complete",
  "journeyTerms.stepUnit.possessive": "step's",
  "journeyTerms.stepUnit.articleIndefinite": "a",
  "journeyTerms.stepUnit.articleDefinite": "the",
  
  "journeyTerms.progressTerms.notStarted": "not started",
  "journeyTerms.progressTerms.inProgress": "in progress",
  "journeyTerms.progressTerms.completed": "completed",
  "journeyTerms.progressTerms.skipped": "skipped",
  "journeyTerms.progressTerms.notNeeded": "not needed",
  
  // Tool terminology
  "toolTerms.mainUnit.singular": "tool",
  "toolTerms.mainUnit.plural": "tools",
  "toolTerms.mainUnit.verb": "use",
  "toolTerms.mainUnit.possessive": "tool's",
  "toolTerms.mainUnit.articleIndefinite": "a",
  "toolTerms.mainUnit.articleDefinite": "the",
  
  "toolTerms.evaluationTerms.singular": "evaluation",
  "toolTerms.evaluationTerms.plural": "evaluations",
  "toolTerms.evaluationTerms.verb": "evaluate",
  "toolTerms.evaluationTerms.possessive": "evaluation's",
  "toolTerms.evaluationTerms.articleIndefinite": "an",
  "toolTerms.evaluationTerms.articleDefinite": "the",
  
  // System terminology
  "systemTerms.application.name": "The Wheel",
  "systemTerms.application.shortName": "Wheel",
  "systemTerms.application.tagline": "Guiding your startup journey",
  
  "systemTerms.actions.save": "Save",
  "systemTerms.actions.cancel": "Cancel",
  "systemTerms.actions.edit": "Edit",
  "systemTerms.actions.delete": "Delete",
  "systemTerms.actions.add": "Add",
  "systemTerms.actions.submit": "Submit",
  "systemTerms.actions.back": "Back",
  "systemTerms.actions.next": "Next",
  "systemTerms.actions.finish": "Finish"
};

/**
 * Seed the terminology_defaults table with standard terminology
 */
async function seedDefaultTerminology() {
  console.log('Seeding default terminology...');
  
  try {
    // Check if defaults already exist
    const { data: existingDefaults } = await supabase
      .from('terminology_defaults')
      .select('key')
      .limit(1);
    
    if (existingDefaults && existingDefaults.length > 0) {
      // Ask for confirmation to overwrite
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Default terminology already exists. Overwrite? (y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Operation cancelled. Exiting...');
        return;
      }
      
      // Delete existing defaults
      const { error: deleteError } = await supabase
        .from('terminology_defaults')
        .delete()
        .neq('key', '');
      
      if (deleteError) {
        throw new Error(`Failed to delete existing terminology: ${deleteError.message}`);
      }
    }
    
    // Prepare data for insertion
    const records = Object.entries(defaultTerminology).map(([key, value]) => ({
      key,
      value: JSON.stringify(value), // Convert string values to JSON format
      description: `Default value for ${key}`
    }));
    
    // Insert new defaults
    const { error: insertError } = await supabase
      .from('terminology_defaults')
      .insert(records);
    
    if (insertError) {
      throw new Error(`Failed to insert default terminology: ${insertError.message}`);
    }
    
    console.log(`Successfully seeded ${records.length} default terminology entries.`);
  } catch (error) {
    console.error('Error seeding default terminology:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedDefaultTerminology();
