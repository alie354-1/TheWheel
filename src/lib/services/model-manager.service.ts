import { supabase } from '../supabase';
// Removed unused import
import { companyModelService, CompanyModelService } from './company-model.service';
import { modelAbstractionService, ModelAbstractionService } from './model-abstraction.service';
import { generalLLMService, GeneralLLMService } from './general-llm.service';

export interface ModelManagerStats {
  companyModelsCount: number;
  abstractionsCount: number;
  lastUpdated: string | null;
  isOperational: boolean;
  totalQueries: number;
  avgQueryTime: number;
  queriesToday: number;
}

export class ModelManager {
  private companyModelService: CompanyModelService;
  private abstractionService: ModelAbstractionService;
  private generalLLMService: GeneralLLMService;
  
  constructor() {
    this.companyModelService = companyModelService;
    this.abstractionService = modelAbstractionService;
    this.generalLLMService = generalLLMService;
  }
  
  // Company model management
  async trainCompanyModel(companyId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.companyModelService.trainCompanyModel(companyId);
      return { success: true, message: 'Company model trained successfully' };
    } catch (error: any) {
      console.error('Error training company model:', error);
      return { success: false, message: error.message || 'Unknown error' };
    }
  }
  
  // Abstraction generation
  async generateAbstraction(companyIds: string[]): Promise<{ 
    success: boolean; 
    data?: any; 
    message?: string 
  }> {
    try {
      const abstraction = await this.abstractionService.generateAbstraction(companyIds);
      return { success: true, data: abstraction };
    } catch (error: any) {
      console.error('Error generating abstraction:', error);
      return { success: false, message: error.message || 'Unknown error' };
    }
  }
  
  // General LLM query
  async query(input: string, context: { 
    userId: string; 
    companyId?: string;
    useExistingModels?: boolean;
  }): Promise<{ 
    success: boolean; 
    data?: any; 
    message?: string 
  }> {
    try {
      const response = await this.generalLLMService.query(input, context);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Error querying general LLM:', error);
      return { success: false, message: error.message || 'Unknown error' };
    }
  }
  
  // Get company model status
  async getCompanyModelStatus(companyId: string): Promise<{
    exists: boolean;
    lastUpdated: string | null;
    embeddingsCount: number;
  }> {
    try {
      // Check if model exists
      const model = await this.companyModelService.getCompanyModel(companyId);
      
      if (!model) {
        return {
          exists: false,
          lastUpdated: null,
          embeddingsCount: 0
        };
      }
      
      // Get embeddings count
      const { count } = await supabase
        .from('company_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      
      return {
        exists: true,
        lastUpdated: model.updated_at,
        embeddingsCount: count || 0
      };
    } catch (error) {
      console.error('Error getting company model status:', error);
      return {
        exists: false,
        lastUpdated: null,
        embeddingsCount: 0
      };
    }
  }
  
  // System status check
  async checkSystemStatus(): Promise<ModelManagerStats> {
    try {
      // Get stats from database function
      const { data: statsData, error } = await supabase.rpc('get_model_stats');
      
      if (error) throw error;
      
      // Get last updated model
      const { data: lastModel } = await supabase
        .from('company_model_data')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      
      return {
        companyModelsCount: statsData.models_trained || 0,
        abstractionsCount: statsData.total_abstractions || 0,
        lastUpdated: lastModel && lastModel.length > 0 ? lastModel[0].updated_at : null,
        isOperational: true,
        totalQueries: statsData.total_queries || 0,
        avgQueryTime: statsData.avg_query_time || 0,
        queriesToday: statsData.queries_today || 0
      };
    } catch (error) {
      console.error('Error checking system status:', error);
      return {
        companyModelsCount: 0,
        abstractionsCount: 0,
        lastUpdated: null,
        isOperational: false,
        totalQueries: 0,
        avgQueryTime: 0,
        queriesToday: 0
      };
    }
  }
  
  // Get training logs
  async getTrainingLogs(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('model_training_logs')
        .select('*, companies(name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting training logs:', error);
      return [];
    }
  }
  
  // Get query logs
  async getQueryLogs(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('llm_query_logs')
        .select('*, profiles(full_name), companies(name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting query logs:', error);
      return [];
    }
  }
}

export const modelManager = new ModelManager();
