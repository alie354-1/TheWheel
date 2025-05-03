# The Wheel: Data Migration Plan

This document outlines the plan for migrating data from the "tools and steps (1).xlsx" file into the new database schema, ensuring that all journey phases, steps, tools, and related content are properly loaded.

## Overview

The "tools and steps (1).xlsx" file contains essential content for the Journey Map, including:
- Phases and their sequence
- Steps within each phase
- Guidance text for each step
- Options for completing steps
- Tools recommended for each step
- Action flags for steps

This data needs to be imported into the appropriate tables in the new database schema to populate the Journey Map.

## Database Tables for Journey Content

The following tables will store the journey content:

1. `journey_phases` - Phases of the startup journey
2. `journey_steps` - Steps within each phase
3. `journey_step_options` - Options for completing each step
4. `journey_step_tools` - Tools recommended for each step
5. `journey_step_resources` - Resources related to each step
6. `journey_step_tips` - Tips for each step
7. `journey_step_checklists` - Checklist items for each step

## Data Migration Process

### 1. Excel File Parsing

Create a script to parse the Excel file and extract structured data:

```typescript
// parse-journey-data.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';

// Load the Excel file
const workbook = XLSX.readFile('tools and steps (1).xlsx');

// Get the first sheet
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Process and structure the data
const phases = [];
const steps = [];
const options = [];
const tools = [];

// Process each row
data.forEach(row => {
  // Extract phase data
  if (row.PhaseID && !phases.some(p => p.id === row.PhaseID)) {
    phases.push({
      id: row.PhaseID,
      name: row.PhaseName,
      description: row.PhaseDescription,
      order_index: row.PhaseOrder
    });
  }
  
  // Extract step data
  if (row.StepID) {
    steps.push({
      id: row.StepID,
      phase_id: row.PhaseID,
      name: row.StepName,
      description: row.StepDescription,
      guidance: row.StepGuidance,
      order_index: row.StepOrder,
      ask_wheel_enabled: row.AskWheelEnabled === 'Yes',
      ask_expert_enabled: row.AskExpertEnabled === 'Yes',
      use_tool_enabled: row.UseToolEnabled === 'Yes',
      diy_enabled: row.DIYEnabled === 'Yes',
      is_company_formation_step: row.IsCompanyFormationStep === 'Yes'
    });
    
    // Extract options
    if (row.Options) {
      const stepOptions = row.Options.split(';');
      stepOptions.forEach((option, index) => {
        options.push({
          step_id: row.StepID,
          name: option.trim(),
          order_index: index
        });
      });
    }
    
    // Extract tools
    if (row.Tools) {
      const stepTools = row.Tools.split(';');
      stepTools.forEach((tool, index) => {
        const [name, url] = tool.split('|').map(s => s.trim());
        tools.push({
          step_id: row.StepID,
          name,
          url: url || '#',
          ranking: index
        });
      });
    }
  }
});

// Write structured data to JSON files
fs.writeFileSync('journey_phases.json', JSON.stringify(phases, null, 2));
fs.writeFileSync('journey_steps.json', JSON.stringify(steps, null, 2));
fs.writeFileSync('journey_step_options.json', JSON.stringify(options, null, 2));
fs.writeFileSync('journey_step_tools.json', JSON.stringify(tools, null, 2));

console.log('Data extraction complete!');
```

### 2. SQL Generation

Create a script to generate SQL insert statements from the structured data:

```typescript
// generate-sql.ts
import * as fs from 'fs';

// Load the structured data
const phases = JSON.parse(fs.readFileSync('journey_phases.json', 'utf8'));
const steps = JSON.parse(fs.readFileSync('journey_steps.json', 'utf8'));
const options = JSON.parse(fs.readFileSync('journey_step_options.json', 'utf8'));
const tools = JSON.parse(fs.readFileSync('journey_step_tools.json', 'utf8'));

// Generate SQL for phases
let sql = '-- Journey Phases\n';
phases.forEach(phase => {
  sql += `INSERT INTO journey_phases (id, name, description, order_index) VALUES 
  ('${phase.id}', '${phase.name.replace(/'/g, "''")}', '${phase.description?.replace(/'/g, "''") || ''}', ${phase.order_index});\n`;
});

// Generate SQL for steps
sql += '\n-- Journey Steps\n';
steps.forEach(step => {
  sql += `INSERT INTO journey_steps (id, phase_id, name, description, guidance, order_index, ask_wheel_enabled, ask_expert_enabled, use_tool_enabled, diy_enabled, is_company_formation_step) VALUES 
  ('${step.id}', '${step.phase_id}', '${step.name.replace(/'/g, "''")}', '${step.description?.replace(/'/g, "''") || ''}', '${step.guidance?.replace(/'/g, "''") || ''}', ${step.order_index}, ${step.ask_wheel_enabled}, ${step.ask_expert_enabled}, ${step.use_tool_enabled}, ${step.diy_enabled}, ${step.is_company_formation_step});\n`;
});

// Generate SQL for options
sql += '\n-- Journey Step Options\n';
options.forEach(option => {
  sql += `INSERT INTO journey_step_options (step_id, name, order_index) VALUES 
  ('${option.step_id}', '${option.name.replace(/'/g, "''")}', ${option.order_index});\n`;
});

// Generate SQL for tools
sql += '\n-- Journey Step Tools\n';
tools.forEach(tool => {
  sql += `INSERT INTO journey_step_tools (step_id, name, url, ranking) VALUES 
  ('${tool.step_id}', '${tool.name.replace(/'/g, "''")}', '${tool.url}', ${tool.ranking});\n`;
});

// Write SQL to file
fs.writeFileSync('journey_data_migration.sql', sql);
console.log('SQL generation complete!');
```

### 3. Database Migration Script

Create a migration script to execute the SQL:

```typescript
// migrate-journey-data.ts
import { supabase } from './supabase-client';
import * as fs from 'fs';

async function migrateJourneyData() {
  try {
    console.log('Starting journey data migration...');
    
    // Read the SQL file
    const sql = fs.readFileSync('journey_data_migration.sql', 'utf8');
    
    // Split into individual statements
    const statements = sql.split(';\n').filter(s => s.trim());
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error('Error executing statement:', error);
        throw error;
      }
    }
    
    console.log('Journey data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateJourneyData();
```

## Alternative Approach: Admin UI

As an alternative to scripts, we can implement the Journey Content Management admin UI early in the development process and use it to import the data:

1. Build the admin UI for managing journey content
2. Add an "Import from Excel" feature
3. Upload the Excel file through the UI
4. Process and validate the data
5. Save to the database

This approach has the advantage of providing a user-friendly way to manage journey content going forward.

## Implementation Steps

1. **Prepare the Data**
   - Review the Excel file structure
   - Map columns to database fields
   - Identify any data cleaning or transformation needed

2. **Create Migration Scripts**
   - Implement the Excel parsing script
   - Implement the SQL generation script
   - Implement the database migration script

3. **Execute Migration**
   - Run the scripts in a staging environment
   - Verify data integrity
   - Fix any issues
   - Run in production

4. **Verify Migration**
   - Check that all phases, steps, options, and tools are correctly imported
   - Verify relationships between entities
   - Test the Journey Map UI with the imported data

## Timeline

- **Day 1**: Prepare data and create migration scripts
- **Day 2**: Test migration in staging environment
- **Day 3**: Execute migration in production and verify

## Conclusion

This data migration plan ensures that all journey content from the "tools and steps (1).xlsx" file is properly imported into the new database schema. By following this plan, we can populate the Journey Map with the necessary content to provide users with a comprehensive startup journey experience.
