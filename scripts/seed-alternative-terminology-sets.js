#!/usr/bin/env node

/**
 * Seed Alternative Terminology Sets
 * 
 * This script seeds alternative terminology templates for different business contexts.
 * These templates can be applied to companies, teams, or users as complete sets.
 */

// Import dependencies
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo partner for showcasing terminology templates
const DEMO_PARTNER_ID = 'demo-partner'; // Will be created if not exists

// Alternative terminology sets
const alternativeSets = {
  businessFormal: {
    displayName: 'Business Formal',
    description: 'Formal, enterprise-oriented terminology suitable for corporate environments',
    terms: {
      journeyTerms: {
        mainUnit: {
          singular: 'objective',
          plural: 'objectives',
          verb: 'achieve',
          possessive: "objective's",
          articleIndefinite: 'an',
          articleDefinite: 'the'
        },
        phaseUnit: {
          singular: 'milestone',
          plural: 'milestones',
          possessive: "milestone's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        stepUnit: {
          singular: 'action item',
          plural: 'action items',
          verb: 'complete',
          possessive: "action item's",
          articleIndefinite: 'an',
          articleDefinite: 'the'
        },
        progressTerms: {
          notStarted: 'not commenced',
          inProgress: 'in progress',
          completed: 'achieved',
          skipped: 'bypassed',
          notNeeded: 'not applicable'
        }
      },
      toolTerms: {
        mainUnit: {
          singular: 'instrument',
          plural: 'instruments',
          verb: 'utilize',
          possessive: "instrument's",
          articleIndefinite: 'an',
          articleDefinite: 'the'
        },
        evaluationTerms: {
          singular: 'assessment',
          plural: 'assessments',
          verb: 'assess',
          possessive: "assessment's",
          articleIndefinite: 'an',
          articleDefinite: 'the'
        }
      },
      systemTerms: {
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          edit: 'Edit',
          delete: 'Remove',
          add: 'Add',
          submit: 'Submit',
          back: 'Previous',
          next: 'Next',
          finish: 'Complete'
        }
      }
    }
  },
  
  startupFocused: {
    displayName: 'Startup Focused',
    description: 'Casual, growth-oriented terminology for startup environments',
    terms: {
      journeyTerms: {
        mainUnit: {
          singular: 'challenge',
          plural: 'challenges',
          verb: 'tackle',
          possessive: "challenge's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        phaseUnit: {
          singular: 'sprint',
          plural: 'sprints',
          possessive: "sprint's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        stepUnit: {
          singular: 'task',
          plural: 'tasks',
          verb: 'knock out',
          possessive: "task's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        progressTerms: {
          notStarted: 'todo',
          inProgress: 'working on it',
          completed: 'done',
          skipped: 'skipped',
          notNeeded: 'not needed'
        }
      },
      toolTerms: {
        mainUnit: {
          singular: 'resource',
          plural: 'resources',
          verb: 'use',
          possessive: "resource's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        }
      },
      systemTerms: {
        application: {
          tagline: 'Powering your startup growth'
        },
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          edit: 'Edit',
          delete: 'Remove',
          add: 'Add',
          submit: 'Go',
          back: 'Back',
          next: 'Next',
          finish: 'Done'
        }
      }
    }
  },
  
  projectManagement: {
    displayName: 'Project Management',
    description: 'Delivery and milestone-focused terminology for project management',
    terms: {
      journeyTerms: {
        mainUnit: {
          singular: 'deliverable',
          plural: 'deliverables',
          verb: 'deliver',
          possessive: "deliverable's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        phaseUnit: {
          singular: 'stage',
          plural: 'stages',
          possessive: "stage's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        stepUnit: {
          singular: 'task',
          plural: 'tasks',
          verb: 'complete',
          possessive: "task's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        progressTerms: {
          notStarted: 'backlog',
          inProgress: 'in progress',
          completed: 'done',
          skipped: 'bypassed',
          notNeeded: 'descoped'
        }
      },
      toolTerms: {
        mainUnit: {
          singular: 'resource',
          plural: 'resources',
          verb: 'allocate',
          possessive: "resource's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        evaluationTerms: {
          singular: 'review',
          plural: 'reviews',
          verb: 'review',
          possessive: "review's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        }
      }
    }
  },
  
  casual: {
    displayName: 'Casual',
    description: 'Simplified, user-friendly terminology for general use',
    terms: {
      journeyTerms: {
        mainUnit: {
          singular: 'path',
          plural: 'paths',
          verb: 'follow',
          possessive: "path's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        stepUnit: {
          singular: 'step',
          plural: 'steps',
          verb: 'do',
          possessive: "step's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        },
        progressTerms: {
          notStarted: 'not started',
          inProgress: 'working on it',
          completed: 'finished',
          skipped: 'skipped',
          notNeeded: 'skip it'
        }
      },
      toolTerms: {
        mainUnit: {
          singular: 'helper',
          plural: 'helpers',
          verb: 'use',
          possessive: "helper's",
          articleIndefinite: 'a',
          articleDefinite: 'the'
        }
      },
      systemTerms: {
        application: {
          name: 'The Wheel',
          shortName: 'Wheel',
          tagline: 'Your path to success'
        },
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          edit: 'Change',
          delete: 'Remove',
          add: 'Add',
          submit: 'Go',
          back: 'Back',
          next: 'Next',
          finish: 'Finish'
        }
      }
    }
  }
};

/**
 * Creates a demo partner for showcasing terminology templates
 */
async function createDemoPartner() {
  console.log('Setting up demo partner...');
  
  try {
    // Check if demo partner exists
    const { data: existingPartner } = await supabase
      .from('partners')
      .select('id')
      .eq('id', DEMO_PARTNER_ID)
      .maybeSingle();
    
    if (existingPartner) {
      console.log('Demo partner already exists.');
      return existingPartner.id;
    }
    
    // Create demo partner
    const { data: newPartner, error } = await supabase
      .from('partners')
      .insert({
        id: DEMO_PARTNER_ID,
        name: 'Terminology Templates Demo',
        slug: 'terminology-templates',
        logo_url: null,
        primary_color: '#4F46E5',
        secondary_color: '#10B981',
        status: 'active'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create demo partner: ${error.message}`);
    }
    
    console.log('Created demo partner:', newPartner.name);
    return newPartner.id;
  } catch (error) {
    console.error('Error creating demo partner:', error);
    process.exit(1);
  }
}

/**
 * Seed alternative terminology sets as templates
 */
async function seedAlternativeTerminologySets() {
  console.log('Seeding alternative terminology sets...');
  
  try {
    // Create or get the demo partner
    const partnerId = await createDemoPartner();
    
    // Process each alternative set
    for (const [setKey, setData] of Object.entries(alternativeSets)) {
      console.log(`Processing set: ${setData.displayName}...`);
      
      // Flatten the terminology structure for database storage
      const records = [];
      const flattenNestedObject = (obj, prefix = '') => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            flattenNestedObject(obj[key], fullKey);
          } else {
            records.push({
              key: fullKey,
              value: JSON.stringify(obj[key]), // Convert string values to JSON format
              override_behavior: 'replace',
              partner_id: partnerId
            });
          }
        }
      };
      
      flattenNestedObject(setData.terms);
      
      // Check if set already exists by looking for a record with a key from this set
      if (records.length > 0) {
        const firstKey = records[0].key;
        const { data: existingSet } = await supabase
          .from('partner_terminology')
          .select('key')
          .eq('partner_id', partnerId)
          .eq('key', firstKey)
          .limit(1);
        
        if (existingSet && existingSet.length > 0) {
          // Delete the existing set
          console.log(`Removing existing set ${setKey}...`);
          
          // Delete only the terms related to this set
          const keysToDelete = records.map(record => record.key);
          
          // We'll delete in batches to avoid potential limitations
          const BATCH_SIZE = 100;
          for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
            const batch = keysToDelete.slice(i, i + BATCH_SIZE);
            
            const { error: deleteError } = await supabase
              .from('partner_terminology')
              .delete()
              .eq('partner_id', partnerId)
              .in('key', batch);
            
            if (deleteError) {
              throw new Error(`Failed to delete existing terminology set: ${deleteError.message}`);
            }
          }
        }
        
        // Insert the new set
        console.log(`Inserting set ${setKey} with ${records.length} terms...`);
        
        // Insert in batches to avoid request size limitations
        const BATCH_SIZE = 100;
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);
          
          const { error: insertError } = await supabase
            .from('partner_terminology')
            .insert(batch);
          
          if (insertError) {
            throw new Error(`Failed to insert terminology set: ${insertError.message}`);
          }
        }
        
        console.log(`Successfully added ${records.length} terms for set ${setKey}.`);
      }
    }
    
    console.log('All alternative terminology sets seeded successfully.');
  } catch (error) {
    console.error('Error seeding alternative terminology sets:', error);
    process.exit(1);
  }
}

/**
 * Add metadata about the available templates to the white_label_configuration
 */
async function saveTemplateMetadata() {
  console.log('Saving template metadata...');
  
  try {
    const partnerId = DEMO_PARTNER_ID;
    
    // Prepare metadata for white label configuration
    const templateMetadata = Object.entries(alternativeSets).map(([key, data]) => ({
      id: key,
      displayName: data.displayName,
      description: data.description
    }));
    
    // Prepare white label configuration
    const whiteLabel = {
      partner_id: partnerId,
      terminology_settings: {
        availableTemplates: templateMetadata,
        defaultTemplate: 'businessFormal'
      },
      branding_settings: {
        showTemplateSelector: true
      }
    };
    
    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('white_label_configuration')
      .select('partner_id')
      .eq('partner_id', partnerId)
      .maybeSingle();
    
    if (existingConfig) {
      // Update existing configuration
      const { error } = await supabase
        .from('white_label_configuration')
        .update(whiteLabel)
        .eq('partner_id', partnerId);
      
      if (error) {
        throw new Error(`Failed to update white label configuration: ${error.message}`);
      }
    } else {
      // Insert new configuration
      const { error } = await supabase
        .from('white_label_configuration')
        .insert(whiteLabel);
      
      if (error) {
        throw new Error(`Failed to insert white label configuration: ${error.message}`);
      }
    }
    
    console.log('Template metadata saved successfully.');
  } catch (error) {
    console.error('Error saving template metadata:', error);
    process.exit(1);
  }
}

// Run the seeding process
async function main() {
  await seedAlternativeTerminologySets();
  await saveTemplateMetadata();
  console.log('Alternative terminology sets setup completed!');
}

main();
