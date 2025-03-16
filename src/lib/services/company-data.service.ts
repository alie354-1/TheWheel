import { supabase } from '../supabase';

export interface CompanyData {
  company: any;
  members: any[];
  documents: any[];
  tasks: any[];
  marketResearch: any[];
  businessModels: any[];
  aiDiscussions: any[];
  standupEntries: any[];
}

export interface CompanyDataService {
  collectCompanyData: (companyId: string) => Promise<CompanyData>;
  storeCompanyData: (companyId: string, data: CompanyData) => Promise<void>;
  getStoredCompanyData: (companyId: string) => Promise<CompanyData | null>;
}

export class SupabaseCompanyDataService implements CompanyDataService {
  async collectCompanyData(companyId: string): Promise<CompanyData> {
    // Collect company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
      
    if (companyError) throw companyError;
    
    // Collect company members
    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', companyId);
      
    if (membersError) throw membersError;
    
    // Get user IDs from members
    const userIds = members.map(member => member.user_id);
    
    // Collect company documents
    const { data: documents, error: documentsError } = await supabase
      .from('company_documents')
      .select('*')
      .eq('company_id', companyId);
      
    if (documentsError) throw documentsError;
    
    // Collect tasks assigned to company members
    const { data: tasks, error: tasksError } = await supabase
      .from('standup_tasks')
      .select('*')
      .in('assigned_to', userIds);
      
    if (tasksError) throw tasksError;
    
    // Collect market research
    const { data: marketResearch, error: marketResearchError } = await supabase
      .from('market_research')
      .select('*')
      .in('user_id', userIds);
      
    if (marketResearchError) throw marketResearchError;
    
    // Collect business models
    const { data: businessModels, error: businessModelsError } = await supabase
      .from('business_models')
      .select('*')
      .in('user_id', userIds);
      
    if (businessModelsError) throw businessModelsError;
    
    // Collect AI discussions
    const { data: aiDiscussions, error: aiDiscussionsError } = await supabase
      .from('ai_discussions')
      .select('*')
      .in('user_id', userIds);
      
    if (aiDiscussionsError) throw aiDiscussionsError;
    
    // Collect standup entries
    const { data: standupEntries, error: standupEntriesError } = await supabase
      .from('standup_entries')
      .select('*')
      .in('user_id', userIds);
      
    if (standupEntriesError) throw standupEntriesError;
    
    return {
      company,
      members,
      documents,
      tasks: tasks || [],
      marketResearch: marketResearch || [],
      businessModels: businessModels || [],
      aiDiscussions: aiDiscussions || [],
      standupEntries: standupEntries || []
    };
  }
  
  async storeCompanyData(companyId: string, data: CompanyData): Promise<void> {
    const { error } = await supabase
      .from('company_model_data')
      .upsert({
        company_id: companyId,
        data_snapshot: data,
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
  }
  
  async getStoredCompanyData(companyId: string): Promise<CompanyData | null> {
    const { data, error } = await supabase
      .from('company_model_data')
      .select('data_snapshot')
      .eq('company_id', companyId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      throw error;
    }
    
    return data.data_snapshot as CompanyData;
  }
}

export const companyDataService = new SupabaseCompanyDataService();
