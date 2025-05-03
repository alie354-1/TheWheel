/**
 * One-by-One Tool Migration Script
 * 
 * This script migrates tool associations from journey_step_tools to step_tools
 * one at a time to carefully track any issues.
 */

const { supabase } = require('./supabase-client.cjs');

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

async function migrateTools() {
  log.step('Starting individual tool association migration');
  
  try {
    // Check if tools table exists
    const { data: toolsCount, error: toolsError } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
      
    if (toolsError) {
      log.error(`Error checking tools table: ${toolsError.message}`);
      
      if (toolsError.message.includes('does not exist')) {
        log.step('Creating tools table');
        
        const createQuery = `
          CREATE TABLE IF NOT EXISTS tools (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            type VARCHAR(50),
            is_premium BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `;
        
        const { error: createError } = await supabase.rpc('run_sql', { query: createQuery });
        
        if (createError) {
          log.error(`Failed to create tools table: ${createError.message}`);
          return false;
        }
        
        log.success('Created tools table');
      }
    }
    
    // Check if step_tools table exists
    const { data: stepToolsCount, error: stepToolsError } = await supabase
      .from('step_tools')
      .select('*', { count: 'exact', head: true });
      
    if (stepToolsError) {
      log.error(`Error checking step_tools table: ${stepToolsError.message}`);
      
      if (stepToolsError.message.includes('does not exist')) {
        log.step('Creating step_tools table');
        
        const createQuery = `
          CREATE TABLE IF NOT EXISTS step_tools (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
            tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
            relevance_score DECIMAL(3,2) NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(step_id, tool_id)
          );
        `;
        
        const { error: createError } = await supabase.rpc('run_sql', { query: createQuery });
        
        if (createError) {
          log.error(`Failed to create step_tools table: ${createError.message}`);
          return false;
        }
        
        log.success('Created step_tools table');
      }
    }
    
    // First get all tool associations from journey_step_tools
    const { data: sourceAssociations, error: sourceError } = await supabase
      .from('journey_step_tools')
      .select('*');
      
    if (sourceError) {
      log.error(`Could not fetch tool associations: ${sourceError.message}`);
      return false;
    }
    
    if (!sourceAssociations || sourceAssociations.length === 0) {
      log.warning('No tool associations found to migrate');
      return true;
    }
    
    log.info(`Found ${sourceAssociations.length} tool associations to migrate`);
    
    // First, ensure all tool IDs exist in the tools table
    const uniqueToolIds = [...new Set(sourceAssociations.map(assoc => assoc.tool_id))];
    log.info(`Found ${uniqueToolIds.length} unique tools`);
    
    // For each unique tool ID, check if it exists in the tools table
    for (const toolId of uniqueToolIds) {
      // Find a tool association with this tool ID to get some info about the tool
      const assoc = sourceAssociations.find(a => a.tool_id === toolId);
      
      // Check if tool exists
      const { data: existingTool, error: checkError } = await supabase
        .from('tools')
        .select('id')
        .eq('id', toolId)
        .maybeSingle();
        
      if (checkError && !checkError.message.includes('does not exist')) {
        log.error(`Error checking tool ${toolId}: ${checkError.message}`);
        continue;
      }
      
      if (!existingTool) {
        // Insert placeholder tool
        const { error: insertError } = await supabase
          .from('tools')
          .insert({
            id: toolId,
            name: `Tool ${toolId.slice(0, 8)}`, // Use part of UUID as name
            description: 'Imported from legacy data',
            created_at: assoc.created_at || new Date()
          });
          
        if (insertError) {
          log.error(`Failed to create tool ${toolId}: ${insertError.message}`);
        } else {
          log.success(`Created placeholder tool ${toolId}`);
        }
      }
    }
    
    // Now migrate each association one by one
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < sourceAssociations.length; i++) {
      const assoc = sourceAssociations[i];
      
      // Every 50 records, log progress
      if (i % 50 === 0) {
        log.info(`Migrating association ${i + 1}/${sourceAssociations.length}...`);
      }
      
      try {
        // Check if this association already exists in step_tools
        const { data: existingRecord, error: checkError } = await supabase
          .from('step_tools')
          .select('id')
          .eq('step_id', assoc.step_id)
          .eq('tool_id', assoc.tool_id)
          .maybeSingle();
          
        if (checkError && !checkError.message.includes('does not exist')) {
          log.error(`Error checking for existing tool association: ${checkError.message}`);
          errorCount++;
          continue;
        }
        
        if (existingRecord) {
          // Already exists, skip
          successCount++;
          continue;
        }
        
        // Insert the tool association into step_tools
        const { error: insertError } = await supabase
          .from('step_tools')
          .insert({
            step_id: assoc.step_id,
            tool_id: assoc.tool_id,
            relevance_score: assoc.relevance_score || 0.5,
            created_at: assoc.created_at || new Date()
          });
          
        if (insertError) {
          log.error(`Failed to insert tool association: ${insertError.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (e) {
        log.error(`Exception processing association ${i+1}: ${e.message}`);
        errorCount++;
      }
    }
    
    log.success(`Tool association migration complete: ${successCount} migrated, ${errorCount} errors`);
    
    // Verify the migration
    const { count: targetCount, error: countError } = await supabase
      .from('step_tools')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      log.warning(`Could not verify migration result: ${countError.message}`);
    } else {
      log.success(`Verification: step_tools now contains ${targetCount} records`);
    }
    
    return errorCount === 0;
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    return false;
  }
}

// Run the migration
migrateTools()
  .then(success => {
    if (success) {
      log.success('Tool association migration completed successfully');
    } else {
      log.warning('Tool association migration completed with warnings or errors');
      process.exit(1);
    }
  })
  .catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
