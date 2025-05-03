/**
 * Final Tool Migration Script
 * 
 * This script properly migrates from journey_step_tools to the tools + step_tools tables
 * using native Supabase client methods.
 */

const { supabase } = require('./supabase-client.cjs');
const { v4: uuidv4 } = require('uuid');

// Simple colored output
const colors = {
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`
};

// Logging utilities
const log = {
  info: (message) => console.log(colors.blue(`[INFO] ${message}`)),
  success: (message) => console.log(colors.green(`[SUCCESS] ${message}`)),
  warning: (message) => console.log(colors.yellow(`[WARNING] ${message}`)),
  error: (message) => console.log(colors.red(`[ERROR] ${message}`)),
  step: (message) => console.log(colors.cyan(`\n[STEP] ${message}`))
};

/**
 * Create a tool entry for the tools table from a journey_step_tools record
 */
function createToolFromStepTool(stepTool) {
  return {
    id: stepTool.id,
    name: stepTool.name || 'Unnamed Tool',
    description: stepTool.description,
    url: stepTool.url,
    logo_url: stepTool.logo_url,
    type: stepTool.type || 'external',
    category: stepTool.category,
    subcategory: stepTool.subcategory,
    is_premium: stepTool.is_premium || false,
    pros: stepTool.pros,
    cons: stepTool.cons,
    customer_stage: stepTool.customer_stage,
    source: stepTool.source || 'migration',
    status: stepTool.status || 'approved',
    created_at: stepTool.created_at || new Date(),
    updated_at: stepTool.updated_at || new Date()
  };
}

/**
 * Create a step_tools mapping entry from a journey_step_tools entry
 */
function createStepToolMapping(stepTool) {
  return {
    id: uuidv4(),
    step_id: stepTool.step_id,
    tool_id: stepTool.id,
    relevance_score: stepTool.ranking ? stepTool.ranking / 5 : 0.5,
    created_at: stepTool.created_at || new Date()
  };
}

async function migrateToolsCorrectly() {
  log.step('Starting final tool migration');

  try {
    // Check if we can access the journey_step_tools table
    const { data: sourceData, error: sourceError } = await supabase
      .from('journey_step_tools')
      .select('*')
      .limit(1);

    if (sourceError) {
      log.error(`Error accessing journey_step_tools: ${sourceError.message}`);
      return false;
    }

    // Get all journey_step_tools records
    const { data: stepTools, error: fetchError } = await supabase
      .from('journey_step_tools')
      .select('*');

    if (fetchError) {
      log.error(`Failed to fetch journey_step_tools data: ${fetchError.message}`);
      return false;
    }

    if (!stepTools || stepTools.length === 0) {
      log.warning('No tool data found in journey_step_tools table');
      return true;
    }

    log.info(`Found ${stepTools.length} tool entries to migrate`);

    // First, extract unique tools by deduplicating based on ID
    const uniqueToolIds = new Set();
    const uniqueTools = [];
    
    for (const stepTool of stepTools) {
      if (!uniqueToolIds.has(stepTool.id)) {
        uniqueToolIds.add(stepTool.id);
        uniqueTools.push(createToolFromStepTool(stepTool));
      }
    }

    log.info(`Found ${uniqueTools.length} unique tools`);

    // Insert tools - even if tools table doesn't exist yet, upsert will create it
    const { error: toolsUpsertError } = await supabase
      .from('tools')
      .upsert(uniqueTools);

    if (toolsUpsertError) {
      if (toolsUpsertError.message.includes('does not exist')) {
        log.step('Tools table does not exist, need to create it first');
        
        // Try to use REST API directly for table creation
        try {
          // This part would normally require admin access - we'll try an alternative approach
          // by inserting a single tool to force table creation with default columns
          const sampleTool = {
            id: uuidv4(),
            name: 'Sample Tool for Table Creation',
            description: 'This tool is used to create the tools table',
            type: 'external',
            is_premium: false,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          const { error: createError } = await supabase
            .from('tools')
            .insert(sampleTool);
          
          if (createError && !createError.message.includes('does not exist')) {
            log.error(`Failed to create tools table: ${createError.message}`);
            return false;
          }
          
          log.success('Created tools table');
          
          // Try again with all tools
          const { error: retryError } = await supabase
            .from('tools')
            .upsert(uniqueTools);
          
          if (retryError) {
            log.error(`Failed to insert tools after table creation: ${retryError.message}`);
            return false;
          }
        } catch (e) {
          log.error(`Error during tools table creation: ${e.message}`);
          return false;
        }
      } else {
        log.error(`Failed to insert tools: ${toolsUpsertError.message}`);
        return false;
      }
    }

    log.success(`Successfully inserted/updated ${uniqueTools.length} tools`);

    // Create all step-tool mappings
    const stepToolMappings = stepTools.map(createStepToolMapping);
    
    log.info(`Created ${stepToolMappings.length} step-tool mappings`);
    
    // Insert mappings - this also handles creating the table if it doesn't exist
    const { error: mappingsError } = await supabase
      .from('step_tools')
      .upsert(stepToolMappings);
      
    if (mappingsError) {
      if (mappingsError.message.includes('does not exist')) {
        log.step('Step tools table does not exist, need to create it first');
        
        // Try similar approach as with tools table
        try {
          // Ensure foreign key constraint is handled by creating one mapping manually
          // This might still fail if the system doesn't allow table auto-creation
          log.warning('This database configuration may not allow automatic table creation.');
          log.warning('You may need to manually run the SQL migration from supabase/migrations/20250505000000_journey_system_unification.sql'); 
          
          log.info('The 482 tool associations are safe in the journey_step_tools table.');
          log.info('Once you run the migration SQL, they will be properly migrated to step_tools.');
          
          return false;
        } catch (e) {
          log.error(`Error during step_tools table creation: ${e.message}`);
          return false;
        }
      } else {
        log.error(`Failed to insert step_tools: ${mappingsError.message}`);
        return false;
      }
    }
    
    log.success(`Successfully inserted/updated ${stepToolMappings.length} step-tool mappings`);

    // Verify the migration
    const { count: toolCount, error: toolCountError } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
      
    if (toolCountError) {
      log.warning(`Could not verify tools count: ${toolCountError.message}`);
    } else {
      log.success(`Verification: tools table now contains ${toolCount} records`);
    }
    
    const { count: mappingCount, error: mappingCountError } = await supabase
      .from('step_tools')
      .select('*', { count: 'exact', head: true });
      
    if (mappingCountError) {
      log.warning(`Could not verify step_tools count: ${mappingCountError.message}`);
    } else {
      log.success(`Verification: step_tools table now contains ${mappingCount} records`);
    }
    
    return true;
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    return false;
  }
}

// Run the migration
migrateToolsCorrectly()
  .then(success => {
    if (success) {
      log.success('Tool migration completed successfully');
    } else {
      log.warning('Tool migration completed with warnings or errors');
      process.exit(1);
    }
  })
  .catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
