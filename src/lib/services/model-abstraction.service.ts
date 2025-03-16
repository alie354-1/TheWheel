import openai from '../openai-client';
import { supabase } from '../supabase';
// Removed unused import

export interface ModelAbstractionService {
  generateAbstraction: (companyIds: string[]) => Promise<any>;
  getAbstractionForCompanies: (companyIds: string[]) => Promise<any>;
}

export class OpenAIModelAbstractionService implements ModelAbstractionService {
  async generateAbstraction(companyIds: string[]): Promise<any> {
    // 1. Collect key insights from each company model
    const companyInsights = await Promise.all(
      companyIds.map(async (companyId) => {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
          
        const { data: modelData } = await supabase
          .from('company_model_data')
          .select('data_snapshot')
          .eq('company_id', companyId)
          .single();
          
        if (!modelData) {
          throw new Error(`No model data found for company ${company.name}`);
        }
          
        return {
          companyId,
          companyName: company.name,
          data: this.extractKeyInsights(modelData.data_snapshot)
        };
      })
    );
    
    // 2. Generate abstraction using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI that creates abstract representations of business patterns.
                   Analyze the following company data and extract common patterns, trends,
                   and insights that could be useful across companies. Focus on identifying
                   generalizable principles, strategies, and approaches that transcend
                   specific company contexts. Your output should be structured as JSON with
                   the following sections:
                   
                   1. common_patterns: Array of common business patterns identified
                   2. industry_insights: Object with industry-specific insights
                   3. strategic_principles: Array of strategic principles that apply across companies
                   4. market_trends: Array of market trends identified
                   5. success_factors: Array of common success factors
                   6. risk_factors: Array of common risk factors
                   7. recommendations: Array of general recommendations based on the abstracted insights`
        },
        {
          role: "user",
          content: JSON.stringify(companyInsights)
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const abstraction = JSON.parse(completion.choices[0].message.content || '{}');
    
    // 3. Store the abstraction
    const { error } = await supabase
      .from('model_abstractions')
      .insert({
        company_ids: companyIds,
        abstraction_data: abstraction,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
      
    return abstraction;
  }
  
  async getAbstractionForCompanies(companyIds: string[]): Promise<any> {
    // Sort company IDs to ensure consistent matching
    const sortedCompanyIds = [...companyIds].sort();
    
    // Retrieve existing abstraction or generate new one
    const { data: abstractions, error } = await supabase
      .from('model_abstractions')
      .select('*')
      .contains('company_ids', sortedCompanyIds)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
      
    if (abstractions && abstractions.length > 0) {
      return abstractions[0].abstraction_data;
    }
    
    return this.generateAbstraction(sortedCompanyIds);
  }
  
  private extractKeyInsights(companyData: any): any {
    // Extract the most important insights from company data
    // This is a simplified version - in a real implementation,
    // this would be more sophisticated
    
    const insights = {
      company_info: {
        name: companyData.company.name,
        industry: companyData.company.industries || [],
        business_model: companyData.company.business_model,
        target_market: companyData.company.target_market
      },
      team_size: companyData.members.length,
      document_count: companyData.documents.length,
      task_metrics: {
        total: companyData.tasks.length,
        by_priority: this.countByProperty(companyData.tasks, 'priority'),
        by_status: this.countByProperty(companyData.tasks, 'status')
      },
      market_research_topics: companyData.marketResearch.map((r: any) => r.title),
      business_model_elements: companyData.businessModels.map((m: any) => ({
        title: m.title,
        revenue_streams_count: m.revenue_streams ? m.revenue_streams.length : 0,
        cost_structure_count: m.cost_structure ? m.cost_structure.length : 0
      }))
    };
    
    return insights;
  }
  
  private countByProperty(array: any[], property: string): Record<string, number> {
    return array.reduce((acc: Record<string, number>, item: any) => {
      const value = item[property];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
}

export const modelAbstractionService = new OpenAIModelAbstractionService();
