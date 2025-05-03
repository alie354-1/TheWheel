#!/usr/bin/env node

/**
 * Generate Hierarchical Test Data for Terminology System
 * 
 * This script demonstrates the hierarchical inheritance capabilities of the terminology system
 * by generating a sample hierarchy with terminology overrides at each level.
 */

// Import dependencies
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data definitions
const TEST_PARTNER_ID = 'test-partner-a';
const TEST_ORG_ID = 'test-org-a';
const TEST_COMPANY_ID = 'test-company-a';
const TEST_TEAM_ID = 'test-team-a';
const TEST_USER_ID = 'test-user-a';

// Sample terminology overrides at various levels
const hierarchicalTerminology = {
  partner: {
    id: TEST_PARTNER_ID,
    name: 'Partner Level',
    terms: {
      journeyTerms: {
        mainUnit: {
          singular: 'roadmap',
          plural: 'roadmaps'
        }
      },
      systemTerms: {
        application: {
          name: 'Partner App',
          tagline: 'Partner-branded solution'
        }
      }
    }
  },
  
  organization: {
    id: TEST_ORG_ID,
    partnerId: TEST_PARTNER_ID,
    name: 'Organization Level',
    terms: {
      journeyTerms: {
        phaseUnit: {
          singular: 'segment',
          plural: 'segments'
        }
      }
    }
  },
  
  company: {
    id: TEST_COMPANY_ID,
    organizationId: TEST_ORG_ID,
    name: 'Company Level',
    terms: {
      journeyTerms: {
        stepUnit: {
          singular: 'activity',
          plural: 'activities'
        },
        progressTerms: {
          completed: 'accomplished'
        }
      }
    }
  },
  
  team: {
    id: TEST_TEAM_ID,
    companyId: TEST_COMPANY_ID,
    name: 'Team Level',
    terms: {
      toolTerms: {
        mainUnit: {
          singular: 'utility',
          plural: 'utilities'
        }
      }
    }
  },
  
  user: {
    id: TEST_USER_ID,
    name: 'User Level',
    terms: {
      systemTerms: {
        actions: {
          save: 'Keep',
          cancel: 'Nevermind'
        }
      }
    }
  }
};

/**
 * Creates entities and their relationships in the database if they don't exist
 */
async function setupEntities() {
  console.log('Setting up test entities...');
  
  try {
    // Create partner
    const partnerData = {
      id: hierarchicalTerminology.partner.id,
      name: hierarchicalTerminology.partner.name,
      slug: 'test-partner-a',
      status: 'active'
    };
    
    const { data: existingPartner } = await supabase
      .from('partners')
      .select('id')
      .eq('id', partnerData.id)
      .maybeSingle();
    
    if (!existingPartner) {
      const { error: partnerError } = await supabase
        .from('partners')
        .insert(partnerData);
      
      if (partnerError) throw new Error(`Failed to create partner: ${partnerError.message}`);
      console.log('Created partner:', partnerData.name);
    } else {
      console.log('Partner already exists:', partnerData.name);
    }
    
    // Create organization
    const orgData = {
      id: hierarchicalTerminology.organization.id,
      name: hierarchicalTerminology.organization.name,
      partner_id: hierarchicalTerminology.organization.partnerId,
      status: 'active'
    };
    
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', orgData.id)
      .maybeSingle();
    
    if (!existingOrg) {
      const { error: orgError } = await supabase
        .from('organizations')
        .insert(orgData);
      
      if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);
      console.log('Created organization:', orgData.name);
    } else {
      console.log('Organization already exists:', orgData.name);
    }
    
    // Create company
    const companyData = {
      id: hierarchicalTerminology.company.id,
      name: hierarchicalTerminology.company.name,
      organization_id: hierarchicalTerminology.company.organizationId,
      status: 'active'
    };
    
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyData.id)
      .maybeSingle();
    
    if (!existingCompany) {
      const { error: companyError } = await supabase
        .from('companies')
        .insert(companyData);
      
      if (companyError) throw new Error(`Failed to create company: ${companyError.message}`);
      console.log('Created company:', companyData.name);
    } else {
      console.log('Company already exists:', companyData.name);
    }
    
    // Create team
    const teamData = {
      id: hierarchicalTerminology.team.id,
      name: hierarchicalTerminology.team.name,
      company_id: hierarchicalTerminology.team.companyId,
      status: 'active'
    };
    
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamData.id)
      .maybeSingle();
    
    if (!existingTeam) {
      const { error: teamError } = await supabase
        .from('teams')
        .insert(teamData);
      
      if (teamError) throw new Error(`Failed to create team: ${teamError.message}`);
      console.log('Created team:', teamData.name);
    } else {
      console.log('Team already exists:', teamData.name);
    }
    
    // Create user
    const userData = {
      id: hierarchicalTerminology.user.id,
      email: 'test.user@example.com',
      name: hierarchicalTerminology.user.name,
      status: 'active'
    };
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userData.id)
      .maybeSingle();
    
    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert(userData);
      
      if (userError) throw new Error(`Failed to create user: ${userError.message}`);
      console.log('Created user:', userData.name);
    } else {
      console.log('User already exists:', userData.name);
    }
    
    // Create relationships
    
    // Add user to company
    const { data: existingCompanyMember } = await supabase
      .from('company_members')
      .select('id')
      .eq('user_id', userData.id)
      .eq('company_id', companyData.id)
      .maybeSingle();
    
    if (!existingCompanyMember) {
      const companyMemberData = {
        user_id: userData.id,
        company_id: companyData.id,
        role: 'member',
        status: 'active'
      };
      
      const { error: companyMemberError } = await supabase
        .from('company_members')
        .insert(companyMemberData);
      
      if (companyMemberError) throw new Error(`Failed to add user to company: ${companyMemberError.message}`);
      console.log('Added user to company');
    } else {
      console.log('User already member of company');
    }
    
    // Add user to team
    const { data: existingTeamMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userData.id)
      .eq('team_id', teamData.id)
      .maybeSingle();
    
    if (!existingTeamMember) {
      const teamMemberData = {
        user_id: userData.id,
        team_id: teamData.id,
        role: 'member',
        status: 'active'
      };
      
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .insert(teamMemberData);
      
      if (teamMemberError) throw new Error(`Failed to add user to team: ${teamMemberError.message}`);
      console.log('Added user to team');
    } else {
      console.log('User already member of team');
    }
    
  } catch (error) {
    console.error('Error setting up entities:', error);
    return false;
  }
  
  return true;
}

/**
 * Sets up terminology at each level of the hierarchy
 */
async function setupTerminology() {
  console.log('Setting up hierarchical terminology...');
  
  try {
    // Partner terminology
    if (Object.keys(hierarchicalTerminology.partner.terms).length > 0) {
      await setupTerminologyForEntity('partner', 
        hierarchicalTerminology.partner.id, 
        hierarchicalTerminology.partner.terms);
    }
    
    // Organization terminology
    if (Object.keys(hierarchicalTerminology.organization.terms).length > 0) {
      await setupTerminologyForEntity('organization', 
        hierarchicalTerminology.organization.id, 
        hierarchicalTerminology.organization.terms);
    }
    
    // Company terminology
    if (Object.keys(hierarchicalTerminology.company.terms).length > 0) {
      await setupTerminologyForEntity('company', 
        hierarchicalTerminology.company.id, 
        hierarchicalTerminology.company.terms);
    }
    
    // Team terminology
    if (Object.keys(hierarchicalTerminology.team.terms).length > 0) {
      await setupTerminologyForEntity('team', 
        hierarchicalTerminology.team.id, 
        hierarchicalTerminology.team.terms);
    }
    
    // User terminology
    if (Object.keys(hierarchicalTerminology.user.terms).length > 0) {
      await setupTerminologyForEntity('user', 
        hierarchicalTerminology.user.id, 
        hierarchicalTerminology.user.terms);
    }
    
  } catch (error) {
    console.error('Error setting up terminology:', error);
    return false;
  }
  
  return true;
}

/**
 * Sets up terminology for a specific entity
 */
async function setupTerminologyForEntity(entityType, entityId, terms) {
  console.log(`Setting up terminology for ${entityType} ${entityId}...`);
  
  let tableName, idColumn;
  
  // Determine table and id column names
  switch (entityType) {
    case 'partner':
      tableName = 'partner_terminology';
      idColumn = 'partner_id';
      break;
    case 'organization':
      tableName = 'organization_terminology';
      idColumn = 'organization_id';
      break;
    case 'company':
      tableName = 'company_terminology';
      idColumn = 'company_id';
      break;
    case 'team':
      tableName = 'team_terminology';
      idColumn = 'team_id';
      break;
    case 'user':
      tableName = 'user_terminology_preferences';
      idColumn = 'user_id';
      break;
  }
  
  // Flatten terminology structure
  const records = [];
  
  const flattenTerms = (obj, prefix = '') => {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenTerms(obj[key], fullKey);
      } else {
        records.push({
          key: fullKey,
          value: JSON.stringify(obj[key]),
          override_behavior: 'replace',
          [idColumn]: entityId
        });
      }
    }
  };
  
  flattenTerms(terms);
  
  // Delete existing entries
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq(idColumn, entityId);
  
  if (deleteError) {
    throw new Error(`Failed to delete existing terminology for ${entityType}: ${deleteError.message}`);
  }
  
  // Insert new entries
  if (records.length > 0) {
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(records);
    
    if (insertError) {
      throw new Error(`Failed to insert terminology for ${entityType}: ${insertError.message}`);
    }
    
    console.log(`Added ${records.length} terms for ${entityType} ${entityId}`);
  }
}

/**
 * Test terminology resolution for the user
 */
async function testTerminologyResolution() {
  console.log('Testing terminology resolution for user...');
  
  try {
    const { data: resolvedTerminology, error } = await supabase
      .rpc('resolve_terminology', {
        p_entity_type: 'user',
        p_entity_id: TEST_USER_ID,
        p_include_all: true
      });
    
    if (error) throw new Error(`Failed to resolve terminology: ${error.message}`);
    
    console.log('Successfully resolved terminology for user!');
    console.log('-----------------------------------------');
    console.log('Sample resolved terminology:');
    
    // Display sample terms to show inheritance
    const sampleTerms = [
      'journeyTerms.mainUnit.singular', // From partner
      'journeyTerms.phaseUnit.singular', // From organization
      'journeyTerms.stepUnit.singular', // From company
      'journeyTerms.progressTerms.completed', // From company
      'toolTerms.mainUnit.singular', // From team
      'systemTerms.actions.save', // From user
      'systemTerms.application.name' // From partner
    ];
    
    for (const term of sampleTerms) {
      const parts = term.split('.');
      let value = resolvedTerminology;
      
      for (const part of parts) {
        value = value?.[part];
      }
      
      console.log(`${term}: ${value !== undefined ? value : '(not set)'}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error testing terminology resolution:', error);
    return false;
  }
}

/**
 * Run all steps to set up and test hierarchical terminology
 */
async function main() {
  console.log('Starting hierarchical terminology test data generation...');
  
  // Setup entities
  const entitiesSetup = await setupEntities();
  if (!entitiesSetup) {
    console.error('Failed to set up entities. Aborting.');
    process.exit(1);
  }
  
  // Setup terminology
  const terminologySetup = await setupTerminology();
  if (!terminologySetup) {
    console.error('Failed to set up terminology. Aborting.');
    process.exit(1);
  }
  
  // Test resolution
  const resolutionTest = await testTerminologyResolution();
  if (!resolutionTest) {
    console.error('Failed to test terminology resolution.');
    process.exit(1);
  }
  
  console.log('\nHierarchical terminology test data generation complete!');
  console.log('\nTest user details for manual exploration:');
  console.log('- User ID:', TEST_USER_ID);
  console.log('- Team ID:', TEST_TEAM_ID);
  console.log('- Company ID:', TEST_COMPANY_ID);
  console.log('- Organization ID:', TEST_ORG_ID);
  console.log('- Partner ID:', TEST_PARTNER_ID);
}

// Run the script
main();
