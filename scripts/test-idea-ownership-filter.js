/**
 * Test script for idea ownership filtering
 * 
 * This script tests the filtering of ideas by ownership type in the Enhanced Idea Hub.
 */

const { supabase } = require('../src/lib/supabaseClient');

async function testIdeaOwnershipFilter() {
  console.log('Testing idea ownership filtering...');
  
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    const userId = userData.user.id;
    console.log(`Current user ID: ${userId}`);
    
    // Create test ideas with different ownership types
    const personalIdea = {
      title: 'Test Personal Idea',
      description: 'This is a test personal idea',
      ideaType: 'new_feature',
      ownershipType: 'personal',
      creatorId: userId,
      integration: { status: 'draft' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const companyIdea = {
      title: 'Test Company Idea',
      description: 'This is a test company idea',
      ideaType: 'new_feature',
      ownershipType: 'company',
      creatorId: userId,
      companyId: 'test-company-id',
      companyName: 'Test Company',
      integration: { status: 'draft' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert test ideas
    const { data: personalIdeaData, error: personalIdeaError } = await supabase
      .from('enhanced_ideas')
      .insert([personalIdea])
      .select();
      
    if (personalIdeaError) throw personalIdeaError;
    console.log('Created personal idea:', personalIdeaData[0].id);
    
    const { data: companyIdeaData, error: companyIdeaError } = await supabase
      .from('enhanced_ideas')
      .insert([companyIdea])
      .select();
      
    if (companyIdeaError) throw companyIdeaError;
    console.log('Created company idea:', companyIdeaData[0].id);
    
    // Test filtering by personal ownership
    const { data: personalIdeas, error: personalFilterError } = await supabase
      .from('enhanced_ideas')
      .select('*')
      .eq('ownershipType', 'personal')
      .in('id', [personalIdeaData[0].id, companyIdeaData[0].id]);
      
    if (personalFilterError) throw personalFilterError;
    console.log(`Personal ideas found: ${personalIdeas.length}`);
    console.log('Personal ideas:', personalIdeas.map(idea => idea.id));
    
    // Test filtering by company ownership
    const { data: companyIdeas, error: companyFilterError } = await supabase
      .from('enhanced_ideas')
      .select('*')
      .eq('ownershipType', 'company')
      .in('id', [personalIdeaData[0].id, companyIdeaData[0].id]);
      
    if (companyFilterError) throw companyFilterError;
    console.log(`Company ideas found: ${companyIdeas.length}`);
    console.log('Company ideas:', companyIdeas.map(idea => idea.id));
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('enhanced_ideas')
      .delete()
      .in('id', [personalIdeaData[0].id, companyIdeaData[0].id]);
      
    if (deleteError) throw deleteError;
    console.log('Test ideas deleted successfully');
    
    console.log('Idea ownership filtering test completed successfully!');
  } catch (error) {
    console.error('Error testing idea ownership filtering:', error);
  }
}

testIdeaOwnershipFilter();
