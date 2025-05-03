/**
 * Correct Tool Migration Script
 * 
 * This script properly migrates from journey_step_tools to the tools + step_tools tables
 * by correctly understanding the source data structure.
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
 * Create a proper tool from a journey_step_tools entry
 */
function createToolFromStepTool(stepTool) {
  return {
    id: stepTool.id, // Use the same ID to maintain references
    name: stepTool.name || 'Unnamed Tool',
    description: stepTool.description,
    url: stepTool.url,
    logo_url: stepTool.logo_url,
    type: stepTool.type || 'external',
    category: stepTool.category,
    is_premium: stepTool.is_premium || false,
    created_at: stepTool.created_at || new Date(),
    updated_at: stepTool.updated_at || new Date(),
    pros: stepTool.pros,
    cons: stepTool.cons,
    customer_stage: stepTool.customer_stage,
    subcategory: stepTool.subcategory,
    status: stepTool.status || 'approved',
    source: stepTool.source || 'migration'
  };
}

/**
 * Create a step_tools mapping entry from a journey_step_tools entry
 */
function createStepToolMapping(stepTool) {
  return {
    id: uuidv4(), // Generate a new ID for this relationship
    step_id: stepTool.step_id,
    tool_id: stepTool.id, // Use the same ID that was assigned to the tool
    relevance_score: stepTool.ranking ? stepTool.ranking / 5 : 0.5, // Convert to 0-1 scale
    created_at: stepTool.created_at || new Date()
  };
}

async function migrateToolsCorrectly() {
  log.step('Starting correct tool migration');

  try {
    // First check if the tools table exists
    const { error: toolsError } = await supabase
      .from('tools')
      .select('id')
      .limit(1);

    if (toolsError && toolsError.message.includes('does not exist')) {
      log.step('Creating tools table');
      
      const createToolsQuery = `
        CREATE TABLE IF NOT EXISTS tools (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          url TEXT,
          logo_url TEXT,
          type VARCHAR(50) DEFAULT 'external',
          category VARCHAR(100),
          subcategory VARCHAR(100),
          is_premium BOOLEAN DEFAULT FALSE,
          pros TEXT,
          cons TEXT,
          customer_stage VARCHAR(100),
          source VARCHAR(50),
          status VARCHAR(50) DEFAULT 'approved',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('run_sql', { query: createToolsQuery });
      
      if (createError) {
        log.error(`Failed to create tools table: ${createError.message}`);
        return false;
      }
      
      log.success('Created tools table');
    }

    // Check if the step_tools table exists
    const { error: stepToolsError } = await supabase
      .from('step_tools')
      .select('id')
      .limit(1);

    if (stepToolsError && stepToolsError.message.includes('does not exist')) {
      log.step('Creating step_tools table');
      
      const createStepToolsQuery = `
        CREATE TABLE IF NOT EXISTS step_tools (
          id UUID PRIMARY KEY,
          step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
          tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
          relevance_score DECIMAL(3,2) DEFAULT 0.5,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(step_id, tool_id)
        );
      `;
      
      const { error: createError } = await supabase.rpc('run_sql', { query: createStepToolsQuery });
      
      if (createError) {
        log.error(`Failed to create step_tools table: ${createError.message}`);
        return false;
      }
      
      log.success('Created step_tools table');
    }

    // Get all source data from journey_step_tools
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

    // First, create unique tools by deduplicating based on ID
    const uniqueToolIds = new Set();
    const uniqueTools = [];
    
    for (const stepTool of stepTools) {
      if (!uniqueToolIds.has(stepTool.id)) {
        uniqueToolIds.add(stepTool.id);
        uniqueTools.push(createToolFromStepTool(stepTool));
      }
    }

    log.info(`Found ${uniqueTools.length} unique tools`);

    // Insert tools in batches
    const BATCH_SIZE = 20;
    let successCount = 0;
    
    for (let i = 0; i < uniqueTools.length; i += BATCH_SIZE) {
      const batch = uniqueTools.slice(i, i + BATCH_SIZE);
      log.info(`Migrating tools batch ${i/BATCH_SIZE + 1}/${Math.ceil(uniqueTools.length/BATCH_SIZE)}`);
      
      const { error: batchError } = await supabase
        .from('tools')
        .upsert(batch, { onConflict: 'id' });
        
      if (batchError) {
        log.error(`Error migrating tools batch: ${batchError.message}`);
      } else {
        successCount += batch.length;
      }
    }
    
    log.success(`Migrated ${successCount}/${uniqueTools.length} tools`);

    // Create all step-tool mappings
    const stepToolMappings = stepTools.map(createStepToolMapping);
    
    log.info(`Created ${stepToolMappings.length} step-tool mappings`);
    
    // Insert mappings in batches
    let mappingSuccessCount = 0;
    
    for (let i = 0; i < stepToolMappings.length; i += BATCH_SIZE) {
      const batch = stepToolMappings.slice(i, i + BATCH_SIZE);
      log.info(`Migrating mappings batch ${i/BATCH_SIZE + 1}/${Math.ceil(stepToolMappings.length/BATCH_SIZE)}`);
      
      const { error: batchError } = await supabase
        .from('step_tools')
        .upsert(batch, { onConflict: 'step_id,tool_id' });
        
      if (batchError) {
        log.error(`Error migrating mappings batch: ${batchError.message}`);
      } else {
        mappingSuccessCount += batch.length;
      }
    }
    
    log.success(`Migrated ${mappingSuccessCount}/${stepToolMappings.length} step-tool mappings`);

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
    
    return successCount === uniqueTools.length && mappingSuccessCount === stepToolMappings.length;
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
