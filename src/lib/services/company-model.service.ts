import openai from '../openai-client';
import { supabase } from '../supabase';
import { CompanyData, companyDataService } from './company-data.service';

export interface CompanyModel {
  id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyModelService {
  trainCompanyModel: (companyId: string) => Promise<void>;
  getCompanyModel: (companyId: string) => Promise<CompanyModel | null>;
  generateCompanyInsights: (companyId: string, query: string) => Promise<any>;
}

export class OpenAICompanyModelService implements CompanyModelService {
  private companyDataService = companyDataService;
  
  async trainCompanyModel(companyId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 1. Collect company data
      const companyData = await this.companyDataService.collectCompanyData(companyId);
      
      // 2. Store the data for future reference
      await this.companyDataService.storeCompanyData(companyId, companyData);
      
      // 3. Generate embeddings for the company data
      const embeddings = await this.generateEmbeddings(companyData);
      
      // 4. Store the embeddings
      await this.storeEmbeddings(companyId, embeddings);
      
      // 5. Log success
      await supabase.from('model_training_logs').insert({
        company_id: companyId,
        status: 'success',
        message: 'Model trained successfully',
        duration_ms: Date.now() - startTime
      });
    } catch (error: any) {
      // Log failure
      await supabase.from('model_training_logs').insert({
        company_id: companyId,
        status: 'error',
        message: error.message,
        duration_ms: Date.now() - startTime
      });
      
      throw error;
    }
  }
  
  async getCompanyModel(companyId: string): Promise<CompanyModel | null> {
    const { data, error } = await supabase
      .from('company_model_data')
      .select('id, company_id, created_at, updated_at')
      .eq('company_id', companyId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No model found
      }
      throw error;
    }
    
    return data as CompanyModel;
  }
  
  async generateCompanyInsights(companyId: string, query: string): Promise<any> {
    // 1. Retrieve relevant company embeddings
    const relevantEmbeddings = await this.retrieveRelevantEmbeddings(companyId, query);
    
    // 2. Get company name
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();
    
    // 3. Generate response using company-specific context
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant specialized in ${company.name}. 
                   Use the following company-specific information to inform your responses.
                   ${relevantEmbeddings.map(e => e.chunk_text).join('\n\n')}`
        },
        { role: "user", content: query }
      ]
    });
    
    // 4. Log the query
    await supabase.from('llm_query_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      company_id: companyId,
      query_text: query,
      response_length: completion.choices[0].message.content?.length || 0,
      duration_ms: 0, // Would track this properly in production
      models_used: { company_model: true }
    });
    
    return completion.choices[0].message;
  }
  
  // Helper methods for embeddings
  private async generateEmbeddings(companyData: CompanyData): Promise<any[]> {
    // Convert company data into chunks
    const chunks = this.chunkCompanyData(companyData);
    
    // Generate embeddings for each chunk
    const embeddings = [];
    for (const chunk of chunks) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.text
      });
      
      embeddings.push({
        chunk: chunk.text,
        metadata: chunk.metadata,
        embedding: embeddingResponse.data[0].embedding
      });
    }
    
    return embeddings;
  }
  
  private chunkCompanyData(companyData: CompanyData): Array<{text: string, metadata: any}> {
    const chunks: Array<{text: string, metadata: any}> = [];
    
    // Company info
    chunks.push({
      text: `Company Name: ${companyData.company.name}
Description: ${companyData.company.description || 'N/A'}
Industry: ${companyData.company.industries ? companyData.company.industries.join(', ') : 'N/A'}
Business Model: ${companyData.company.business_model || 'N/A'}
Target Market: ${companyData.company.target_market || 'N/A'}`,
      metadata: {
        type: 'company_info',
        company_id: companyData.company.id
      }
    });
    
    // Team members
    if (companyData.members.length > 0) {
      chunks.push({
        text: `Team Members: ${companyData.members.map(m => 
          `${m.title || 'Team Member'} (${m.role})`).join(', ')}`,
        metadata: {
          type: 'team_info',
          company_id: companyData.company.id
        }
      });
    }
    
    // Documents (chunk each document separately)
    companyData.documents.forEach(doc => {
      chunks.push({
        text: `Document: ${doc.title}
Description: ${doc.description || 'N/A'}
Type: ${doc.file_type}`,
        metadata: {
          type: 'document',
          document_id: doc.id,
          company_id: companyData.company.id
        }
      });
    });
    
    // Tasks (chunk by groups of 5 tasks)
    const taskChunks = this.chunkArray(companyData.tasks, 5);
    taskChunks.forEach((taskGroup, index) => {
      chunks.push({
        text: `Tasks (Group ${index + 1}):\n${taskGroup.map(task => 
          `- ${task.title}: ${task.description} (Priority: ${task.priority}, Status: ${task.status})`
        ).join('\n')}`,
        metadata: {
          type: 'tasks',
          group: index,
          company_id: companyData.company.id
        }
      });
    });
    
    // Market Research
    companyData.marketResearch.forEach(research => {
      chunks.push({
        text: `Market Research: ${research.title}
Insights: ${JSON.stringify(research.insights)}
Competitors: ${JSON.stringify(research.competitors)}
Notes: ${research.notes || 'N/A'}`,
        metadata: {
          type: 'market_research',
          research_id: research.id,
          company_id: companyData.company.id
        }
      });
    });
    
    // Business Models
    companyData.businessModels.forEach(model => {
      chunks.push({
        text: `Business Model: ${model.title}
Revenue Streams: ${JSON.stringify(model.revenue_streams)}
Cost Structure: ${JSON.stringify(model.cost_structure)}
Key Metrics: ${JSON.stringify(model.key_metrics)}`,
        metadata: {
          type: 'business_model',
          model_id: model.id,
          company_id: companyData.company.id
        }
      });
    });
    
    // AI Discussions (chunk each discussion separately)
    companyData.aiDiscussions.forEach(discussion => {
      chunks.push({
        text: `AI Discussion: ${discussion.title}
Context: ${JSON.stringify(discussion.context)}
Messages: ${JSON.stringify(discussion.messages).substring(0, 1000)}...`,
        metadata: {
          type: 'ai_discussion',
          discussion_id: discussion.id,
          company_id: companyData.company.id
        }
      });
    });
    
    // Standup Entries (chunk by groups of 5 entries)
    const standupChunks = this.chunkArray(companyData.standupEntries, 5);
    standupChunks.forEach((standupGroup, index) => {
      chunks.push({
        text: `Standup Entries (Group ${index + 1}):\n${standupGroup.map(entry => 
          `- Date: ${entry.date}\nAccomplished: ${entry.accomplished}\nWorking On: ${entry.working_on}\nBlockers: ${entry.blockers || 'None'}\nGoals: ${entry.goals}`
        ).join('\n\n')}`,
        metadata: {
          type: 'standup_entries',
          group: index,
          company_id: companyData.company.id
        }
      });
    });
    
    return chunks;
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private async storeEmbeddings(companyId: string, embeddings: any[]): Promise<void> {
    // First, delete existing embeddings for this company
    await supabase
      .from('company_embeddings')
      .delete()
      .eq('company_id', companyId);
    
    // Then insert new embeddings
    for (const embedding of embeddings) {
      await supabase
        .from('company_embeddings')
        .insert({
          company_id: companyId,
          chunk_text: embedding.chunk,
          metadata: embedding.metadata,
          embedding: embedding.embedding
        });
    }
  }
  
  private async retrieveRelevantEmbeddings(companyId: string, query: string): Promise<any[]> {
    // 1. Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query
    });
    
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // 2. Retrieve similar embeddings from database
    const { data: relevantChunks, error } = await supabase
      .rpc('match_company_embeddings', {
        query_embedding: queryEmbedding,
        company_id: companyId,
        match_threshold: 0.7,
        match_count: 10
      });
    
    if (error) throw error;
    
    return relevantChunks || [];
  }
}

export const companyModelService = new OpenAICompanyModelService();
