/**
 * Journey System Data Verification Script
 * 
 * This script verifies that the new journey system is properly using the populated data:
 * - Phases (5)
 * - Domains (8)
 * - Canonical Steps (150)
 * - Tools Catalog (50+)
 * - Step-Tool Recommendations (100+)
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyJourneyData() {
  console.log('🔍 Verifying Journey System Data...\n');
  
  try {
    // 1. Verify Phases
    const { data: phases, error: phasesError } = await supabase
      .from('journey_phases_new')
      .select('*')
      .order('order_index');
      
    if (phasesError) throw new Error(`Error fetching phases: ${phasesError.message}`);
    
    console.log('✅ PHASES VERIFICATION:');
    console.log(`   Found ${phases.length} phases (expected: 5)`);
    console.log('   Phase Names:');
    phases.forEach(phase => {
      console.log(`   - ${phase.name} (${phase.color || 'no color'})`);
    });
    console.log();
    
    // 2. Verify Domains
    const { data: domains, error: domainsError } = await supabase
      .from('journey_domains_new')
      .select('*')
      .order('name');
      
    if (domainsError) throw new Error(`Error fetching domains: ${domainsError.message}`);
    
    console.log('✅ DOMAINS VERIFICATION:');
    console.log(`   Found ${domains.length} domains (expected: 8)`);
    console.log('   Domain Names:');
    domains.forEach(domain => {
      console.log(`   - ${domain.name} (${domain.color || 'no color'})`);
    });
    console.log();
    
    // 3. Verify Canonical Steps
    const { data: steps, error: stepsError } = await supabase
      .from('journey_canonical_steps')
      .select('*, journey_phases_new(name), journey_domains_new(name)')
      .order('order_index');
      
    if (stepsError) throw new Error(`Error fetching canonical steps: ${stepsError.message}`);
    
    console.log('✅ CANONICAL STEPS VERIFICATION:');
    console.log(`   Found ${steps.length} canonical steps (expected: 150)`);
    
    // Count steps by phase
    const stepsByPhase = {};
    steps.forEach(step => {
      const phaseName = step.journey_phases_new?.name || 'Unknown Phase';
      stepsByPhase[phaseName] = (stepsByPhase[phaseName] || 0) + 1;
    });
    
    console.log('   Steps by Phase:');
    Object.entries(stepsByPhase).forEach(([phase, count]) => {
      console.log(`   - ${phase}: ${count} steps`);
    });
    
    // Count steps by domain
    const stepsByDomain = {};
    steps.forEach(step => {
      const domainName = step.journey_domains_new?.name || 'Unknown Domain';
      stepsByDomain[domainName] = (stepsByDomain[domainName] || 0) + 1;
    });
    
    console.log('   Steps by Domain:');
    Object.entries(stepsByDomain).forEach(([domain, count]) => {
      console.log(`   - ${domain}: ${count} steps`);
    });
    
    // Verify step metadata
    const stepsWithDeliverables = steps.filter(s => s.deliverables && s.deliverables.length > 0).length;
    const stepsWithSuccessCriteria = steps.filter(s => s.success_criteria && s.success_criteria.length > 0).length;
    const stepsWithBlockers = steps.filter(s => s.potential_blockers && s.potential_blockers.length > 0).length;
    
    console.log('   Step Metadata:');
    console.log(`   - Steps with deliverables: ${stepsWithDeliverables} (${Math.round(stepsWithDeliverables/steps.length*100)}%)`);
    console.log(`   - Steps with success criteria: ${stepsWithSuccessCriteria} (${Math.round(stepsWithSuccessCriteria/steps.length*100)}%)`);
    console.log(`   - Steps with potential blockers: ${stepsWithBlockers} (${Math.round(stepsWithBlockers/steps.length*100)}%)`);
    console.log();
    
    // 4. Verify Tools Catalog
    const { data: tools, error: toolsError } = await supabase
      .from('journey_tools_catalog')
      .select('*');
      
    if (toolsError) throw new Error(`Error fetching tools: ${toolsError.message}`);
    
    console.log('✅ TOOLS CATALOG VERIFICATION:');
    console.log(`   Found ${tools.length} tools (expected: 50+)`);
    
    // Group tools by category
    const toolsByCategory = {};
    tools.forEach(tool => {
      const category = tool.category || 'Uncategorized';
      toolsByCategory[category] = (toolsByCategory[category] || 0) + 1;
    });
    
    console.log('   Tools by Category:');
    Object.entries(toolsByCategory).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} tools`);
    });
    
    // Calculate average rating
    const avgRating = tools.reduce((sum, tool) => sum + (tool.rating || 0), 0) / tools.length;
    console.log(`   Average Tool Rating: ${avgRating.toFixed(2)}`);
    console.log();
    
    // 5. Verify Step-Tool Recommendations
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('journey_step_tool_recommendations')
      .select('*, journey_canonical_steps(name), journey_tools_catalog(name)');
      
    if (recommendationsError) throw new Error(`Error fetching recommendations: ${recommendationsError.message}`);
    
    console.log('✅ STEP-TOOL RECOMMENDATIONS VERIFICATION:');
    console.log(`   Found ${recommendations.length} step-tool recommendations (expected: 100+)`);
    
    // Count recommendations by priority
    const recsByPriority = {};
    recommendations.forEach(rec => {
      const priority = rec.priority_rank || 'Unknown';
      recsByPriority[priority] = (recsByPriority[priority] || 0) + 1;
    });
    
    console.log('   Recommendations by Priority:');
    Object.entries(recsByPriority).forEach(([priority, count]) => {
      console.log(`   - Priority ${priority}: ${count} recommendations`);
    });
    
    // Count recommendations by type
    const recsByType = {};
    recommendations.forEach(rec => {
      const type = rec.recommendation_type || 'Unknown';
      recsByType[type] = (recsByType[type] || 0) + 1;
    });
    
    console.log('   Recommendations by Type:');
    Object.entries(recsByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} recommendations`);
    });
    
    // Sample some recommendations
    console.log('   Sample Recommendations:');
    for (let i = 0; i < Math.min(5, recommendations.length); i++) {
      const rec = recommendations[i];
      console.log(`   - ${rec.journey_canonical_steps?.name || 'Unknown Step'} → ${rec.journey_tools_catalog?.name || 'Unknown Tool'} (Priority: ${rec.priority_rank})`);
    }
    console.log();
    
    // 6. Verify Step-Tool Coverage
    const stepsWithTools = new Set(recommendations.map(r => r.step_id));
    const toolsInRecs = new Set(recommendations.map(r => r.tool_id));
    
    console.log('✅ COVERAGE ANALYSIS:');
    console.log(`   Steps with tool recommendations: ${stepsWithTools.size} of ${steps.length} (${Math.round(stepsWithTools.size/steps.length*100)}%)`);
    console.log(`   Tools used in recommendations: ${toolsInRecs.size} of ${tools.length} (${Math.round(toolsInRecs.size/tools.length*100)}%)`);
    console.log(`   Average tools per step: ${(recommendations.length / stepsWithTools.size).toFixed(2)}`);
    
    // Overall verification
    console.log('\n🎉 VERIFICATION SUMMARY:');
    console.log(`   ✅ Phases: ${phases.length}/5 (${Math.round(phases.length/5*100)}%)`);
    console.log(`   ✅ Domains: ${domains.length}/8 (${Math.round(domains.length/8*100)}%)`);
    console.log(`   ✅ Canonical Steps: ${steps.length}/150 (${Math.round(steps.length/150*100)}%)`);
    console.log(`   ✅ Tools: ${tools.length}/50 (${Math.round(tools.length/50*100)}%)`);
    console.log(`   ✅ Step-Tool Recommendations: ${recommendations.length}/100 (${Math.round(recommendations.length/100*100)}%)`);
    
    const overallScore = (
      Math.min(phases.length/5, 1) * 0.1 +
      Math.min(domains.length/8, 1) * 0.1 +
      Math.min(steps.length/150, 1) * 0.3 +
      Math.min(tools.length/50, 1) * 0.2 +
      Math.min(recommendations.length/100, 1) * 0.3
    ) * 100;
    
    console.log(`\n   Overall Implementation Score: ${Math.round(overallScore)}%`);
    
    if (overallScore >= 90) {
      console.log('\n✨ EXCELLENT! The journey system is fully populated and ready to use.');
    } else if (overallScore >= 75) {
      console.log('\n✅ GOOD! The journey system is well-populated but could use some additional data.');
    } else if (overallScore >= 50) {
      console.log('\n⚠️ PARTIAL! The journey system has basic data but needs significant additional population.');
    } else {
      console.log('\n❌ INCOMPLETE! The journey system is missing critical data and requires extensive population.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR DURING VERIFICATION:');
    console.error(error);
  }
}

// Run the verification
verifyJourneyData();
