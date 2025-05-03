/**
 * Import journey map and tools from 'tools and steps (1).xlsx' into the database.
 * - Reads 'PhasesandSteps' and 'toolsbystep' sheets.
 * - Prepares data for insertion into journey_phases, journey_steps, journey_step_tools.
 * - Requires: npm install xlsx pg
 * 
 * NOTE: This script scaffolds the import logic. Fill in DB connection details and insertion logic as needed.
 */
require('dotenv').config(); // Load .env file variables into process.env

const xlsx = require('xlsx');
const { Client } = require('pg');
const path = require('path');

// CONFIGURE THESE:
const EXCEL_PATH = path.join(__dirname, '../tools and steps (1).xlsx');
// Use the correct environment variable name provided by the user
const PG_CONNECTION_STRING = process.env.VITE_SUPABASE_URL; 

if (!PG_CONNECTION_STRING) {
  // Update the error message to reflect the correct variable name
  console.error('Error: VITE_SUPABASE_URL environment variable is not set.'); 
  process.exit(1);
}

const workbook = xlsx.readFile(EXCEL_PATH);

// Parse PhasesandSteps
const phasesSheet = workbook.Sheets['PhasesandSteps'];
const phasesRows = xlsx.utils.sheet_to_json(phasesSheet, { header: 1 });
const phasesHeaders = phasesRows[0];
const phasesData = phasesRows.slice(1);

// Parse toolsbystep
const toolsSheet = workbook.Sheets['toolsbystep'];
const toolsRows = xlsx.utils.sheet_to_json(toolsSheet, { header: 1 });
const toolsHeaders = toolsRows[0];
const toolsData = toolsRows.slice(1);

// Utility: Upsert phase, return phase_id
async function upsertPhase(client, phaseOrder, phaseName) {
  const query = `
    INSERT INTO journey_phases (name, "order") 
    VALUES ($1, $2) 
    ON CONFLICT ("order") DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `;
  const res = await client.query(query, [phaseName, phaseOrder]);
  if (!res.rows[0]) throw new Error(`Failed to upsert phase: ${phaseName}`);
  return res.rows[0].id;
}

// Utility: Upsert step, return step_id
async function upsertStep(client, phaseId, stepOrder, stepName, stepFields) {
  const {
    needToDo, needExplanation, hasTool, toolExplanation, stepsWithoutTool,
    effortDifficulty, staffFreelancers, keyConsiderations, bootstrapMindset, founderSkillsNeeded
  } = stepFields;

  // Map Yes/No to boolean or handle nulls
  const required = needToDo?.toLowerCase() === 'yes';
  const tool_needed = hasTool?.toLowerCase() === 'yes';

  const query = `
    INSERT INTO journey_steps (
      phase_id, "order", name, description, required, need_explanation, 
      tool_needed, tool_explanation, steps_without_tool, effort_difficulty, 
      staff_freelancers, key_considerations, bootstrap_mindset, founder_skills_needed
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
    ON CONFLICT (phase_id, "order") DO UPDATE SET 
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      required = EXCLUDED.required,
      need_explanation = EXCLUDED.need_explanation,
      tool_needed = EXCLUDED.tool_needed,
      tool_explanation = EXCLUDED.tool_explanation,
      steps_without_tool = EXCLUDED.steps_without_tool,
      effort_difficulty = EXCLUDED.effort_difficulty,
      staff_freelancers = EXCLUDED.staff_freelancers,
      key_considerations = EXCLUDED.key_considerations,
      bootstrap_mindset = EXCLUDED.bootstrap_mindset,
      founder_skills_needed = EXCLUDED.founder_skills_needed
    RETURNING id;
  `;
  // Assuming 'name' and 'description' are the same for now
  const values = [
    phaseId, stepOrder, stepName, stepName, required, needExplanation,
    tool_needed, toolExplanation, stepsWithoutTool, effortDifficulty, staffFreelancers,
    keyConsiderations, bootstrapMindset, founderSkillsNeeded
  ];
  const res = await client.query(query, values);
  if (!res.rows[0]) throw new Error(`Failed to upsert step: ${stepName}`);
  return res.rows[0].id;
}

// Utility: Upsert tool globally, return tool_id
async function upsertGlobalTool(client, toolFields) {
  const {
    toolName, category, subcategory, website, summary, pros, cons, customerStage, founded, lastFundingRound,
    compSvcPkg, easeOfUse, affordability, customerSupport, speedOfSetup, customization, rangeOfServices,
    integration, proAssistance, reputation,
    reasoningCompSvcPkg, reasoningEaseOfUse, reasoningAffordability, reasoningCustomerSupport,
    reasoningSpeedOfSetup, reasoningCustomization, reasoningRangeOfServices, reasoningIntegration,
    reasoningProAssistance, reasoningReputation
  } = toolFields;

  // Convert ratings to integers, handle potential non-numeric values
  const parseRating = (val) => (val && !isNaN(parseInt(val))) ? parseInt(val) : null;

  const query = `
    INSERT INTO journey_tools (
      name, category, subcategory, website, summary, pros, cons, customer_stage, founded, last_funding_round,
      comp_svc_pkg, ease_of_use, affordability, customer_support, speed_of_setup, customization, range_of_services,
      integration, pro_assistance, reputation,
      reasoning_comp_svc_pkg, reasoning_ease_of_use, reasoning_affordability, reasoning_customer_support,
      reasoning_speed_of_setup, reasoning_customization, reasoning_range_of_services, reasoning_integration,
      reasoning_pro_assistance, reasoning_reputation,
      status -- Assuming a status field, default to 'pending' or 'approved'
    ) 
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      'approved' -- Default status
    ) 
    ON CONFLICT (name) DO UPDATE SET -- Assuming name is unique constraint
      category = EXCLUDED.category,
      subcategory = EXCLUDED.subcategory,
      website = EXCLUDED.website,
      summary = EXCLUDED.summary,
      pros = EXCLUDED.pros,
      cons = EXCLUDED.cons,
      customer_stage = EXCLUDED.customer_stage,
      founded = EXCLUDED.founded,
      last_funding_round = EXCLUDED.last_funding_round,
      comp_svc_pkg = EXCLUDED.comp_svc_pkg,
      ease_of_use = EXCLUDED.ease_of_use,
      affordability = EXCLUDED.affordability,
      customer_support = EXCLUDED.customer_support,
      speed_of_setup = EXCLUDED.speed_of_setup,
      customization = EXCLUDED.customization,
      range_of_services = EXCLUDED.range_of_services,
      integration = EXCLUDED.integration,
      pro_assistance = EXCLUDED.pro_assistance,
      reputation = EXCLUDED.reputation,
      reasoning_comp_svc_pkg = EXCLUDED.reasoning_comp_svc_pkg,
      reasoning_ease_of_use = EXCLUDED.reasoning_ease_of_use,
      reasoning_affordability = EXCLUDED.reasoning_affordability,
      reasoning_customer_support = EXCLUDED.reasoning_customer_support,
      reasoning_speed_of_setup = EXCLUDED.reasoning_speed_of_setup,
      reasoning_customization = EXCLUDED.reasoning_customization,
      reasoning_range_of_services = EXCLUDED.reasoning_range_of_services,
      reasoning_integration = EXCLUDED.reasoning_integration,
      reasoning_pro_assistance = EXCLUDED.reasoning_pro_assistance,
      reasoning_reputation = EXCLUDED.reasoning_reputation
      -- Don't update status on conflict? Or set explicitly?
    RETURNING id;
  `;
  const values = [
    toolName, category, subcategory, website, summary, pros, cons, customerStage, founded, lastFundingRound,
    parseRating(compSvcPkg), parseRating(easeOfUse), parseRating(affordability), parseRating(customerSupport), parseRating(speedOfSetup), parseRating(customization), parseRating(rangeOfServices),
    parseRating(integration), parseRating(proAssistance), parseRating(reputation),
    reasoningCompSvcPkg, reasoningEaseOfUse, reasoningAffordability, reasoningCustomerSupport,
    reasoningSpeedOfSetup, reasoningCustomization, reasoningRangeOfServices, reasoningIntegration,
    reasoningProAssistance, reasoningReputation
  ];
  const res = await client.query(query, values);
  if (!res.rows[0]) throw new Error(`Failed to upsert global tool: ${toolName}`);
  return res.rows[0].id;
}

// Utility: Link tool to step
async function linkToolToStep(client, stepId, toolId) {
  const query = `
    INSERT INTO journey_step_tool_associations (step_id, tool_id) 
    VALUES ($1, $2) 
    ON CONFLICT (step_id, tool_id) DO NOTHING; -- Avoid duplicates
  `;
  await client.query(query, [stepId, toolId]);
}


async function main() {
  console.log('Starting import...');
  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  try {
    await client.connect();
    console.log('Connected to database.');

    // Keep track of step orders to map them to IDs later
    const stepOrderToIdMap = new Map();

    console.log('Importing Phases and Steps...');
    // 1. Import Phases and Steps
    for (const row of phasesData) {
      const [
        phaseOrder, phaseName, stepOrder, stepName, needToDo, needExplanation,
        hasTool, toolExplanation, stepsWithoutTool, effortDifficulty, staffFreelancers,
        keyConsiderations, bootstrapMindset, founderSkillsNeeded
      ] = row;

      if (!phaseOrder || !phaseName || !stepOrder || !stepName) {
        console.warn('Skipping incomplete phase/step row:', row);
        continue;
      }

      // Upsert phase
      const phaseId = await upsertPhase(client, phaseOrder, phaseName);

      // Upsert step
      const stepFields = {
        needToDo, needExplanation, hasTool, toolExplanation, stepsWithoutTool,
        effortDifficulty, staffFreelancers, keyConsiderations, bootstrapMindset, founderSkillsNeeded
      };
      const stepId = await upsertStep(client, phaseId, stepOrder, stepName, stepFields);
      
      // Store mapping for tool import
      stepOrderToIdMap.set(stepOrder, stepId);

      // Optionally: handle options, resources, tips, checklists if present
    }
    console.log('Phases and Steps import finished.');

    console.log('Importing Tools by Step...');
    // 2. Import Tools by Step
    for (const row of toolsData) {
      const [
        stepOrder, toolName, toolName2, category, subcategory, website, summary, pros, cons,
        customerStage, founded, lastFundingRound, compSvcPkg, easeOfUse, affordability,
        customerSupport, speedOfSetup, customization, rangeOfServices, integration,
        proAssistance, reputation,
        reasoningCompSvcPkg, reasoningEaseOfUse, reasoningAffordability, reasoningCustomerSupport,
        reasoningSpeedOfSetup, reasoningCustomization, reasoningRangeOfServices, reasoningIntegration,
        reasoningProAssistance, reasoningReputation
      ] = row;

      if (!stepOrder || !toolName) {
         console.warn('Skipping incomplete tool row:', row);
        continue;
      }

      const stepId = stepOrderToIdMap.get(stepOrder);
      if (!stepId) {
        console.warn(`Could not find step ID for step order ${stepOrder}. Skipping tool: ${toolName}`);
        continue;
      }

      const toolFields = {
        toolName, category, subcategory, website, summary, pros, cons, customerStage, founded, lastFundingRound,
        compSvcPkg, easeOfUse, affordability, customerSupport, speedOfSetup, customization, rangeOfServices,
        integration, proAssistance, reputation,
        reasoningCompSvcPkg, reasoningEaseOfUse, reasoningAffordability, reasoningCustomerSupport,
        reasoningSpeedOfSetup, reasoningCustomization, reasoningRangeOfServices, reasoningIntegration,
        reasoningProAssistance, reasoningReputation
      };

      // Upsert the tool globally
      const toolId = await upsertGlobalTool(client, toolFields);
      
      // Link the tool to the step
      await linkToolToStep(client, stepId, toolId);
    }
    console.log('Tools by Step import finished.');

    console.log('Import process completed successfully.');

  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main();
