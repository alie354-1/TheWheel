/**
 * Database Schema Verification Utility
 * 
 * Quick check to see what tables exist in the current database
 * and verify the journey system schema.
 */

import { supabase } from '../lib/supabase';

export async function verifyJourneySchema() {
  console.log('🔍 Verifying Journey System Database Schema...\n');

  const tables = [
    'journey_phases_new',
    'journey_domains_new', 
    'journey_canonical_steps',
    'journey_tools_catalog',
    'journey_step_tool_recommendations',
    'company_journeys_new',
    'company_journey_steps_new',
    'company_members',
    'messages',
    'domain_notifications',
    'journey_recommendations',
    'company_journey_analytics',
    'company_kpi_measurements',
    'company_custom_tools'
  ];

  const results = {
    existing: [] as string[],
    missing: [] as string[],
    errors: [] as string[]
  };

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist')) {
          results.missing.push(table);
        } else {
          results.errors.push(`${table}: ${error.message}`);
        }
      } else {
        results.existing.push(table);
        console.log(`✅ ${table} - exists`);
      }
    } catch (e) {
      results.errors.push(`${table}: ${e}`);
    }
  }

  console.log('\n📊 Schema Verification Summary:');
  console.log(`✅ Existing tables: ${results.existing.length}`);
  console.log(`❌ Missing tables: ${results.missing.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);

  if (results.missing.length > 0) {
    console.log('\n❌ Missing Tables:');
    results.missing.forEach(table => console.log(`  - ${table}`));
  }

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  return results;
}

export async function checkJourneyData() {
  console.log('\n🔍 Checking Journey Data...\n');

  try {
    // Check phases
    const { data: phases, error: phasesError } = await supabase
      .from('journey_phases_new')
      .select('*');
    
    if (phasesError) {
      console.log('❌ Error fetching phases:', phasesError.message);
    } else {
      console.log(`✅ Found ${phases?.length || 0} journey phases`);
    }

    // Check domains if they exist
    const { data: domains, error: domainsError } = await supabase
      .from('journey_domains_new')
      .select('*');
    
    if (domainsError) {
      console.log('❌ Error fetching domains:', domainsError.message);
    } else {
      console.log(`✅ Found ${domains?.length || 0} journey domains`);
    }

    // Check canonical steps
    const { data: steps, error: stepsError } = await supabase
      .from('journey_canonical_steps')
      .select('*')
      .limit(5);
    
    if (stepsError) {
      console.log('❌ Error fetching canonical steps:', stepsError.message);
    } else {
      console.log(`✅ Found canonical steps (showing ${steps?.length || 0} of total)`);
    }

    // Check tools catalog
    const { data: tools, error: toolsError } = await supabase
      .from('journey_tools_catalog')
      .select('*')
      .limit(5);
    
    if (toolsError) {
      console.log('❌ Error fetching tools catalog:', toolsError.message);
    } else {
      console.log(`✅ Found tools catalog (showing ${tools?.length || 0} of total)`);
    }

    // Check step-tool recommendations
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('journey_step_tool_recommendations')
      .select('*')
      .limit(5);
    
    if (recommendationsError) {
      console.log('❌ Error fetching step-tool recommendations:', recommendationsError.message);
    } else {
      console.log(`✅ Found step-tool recommendations (showing ${recommendations?.length || 0} of total)`);
    }

  } catch (error) {
    console.log('❌ Error checking journey data:', error);
  }
}

// Function to run both checks
export async function verifyJourneySystem() {
  await verifyJourneySchema();
  await checkJourneyData();
}
