/**
 * Financial Hub Service
 * - Fetch budget templates and categories
 * - Import template to company budget
 * - List/edit company budget
 */

// Removed: import { Client } from "pg";
import { supabase } from '../supabase';

// Removed: const PG_CONNECTION_STRING = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname";

export const financialHubService = {
  // Fetch all budget templates
  async getBudgetTemplates() {
    const { data, error } = await supabase
      .from('company_budget_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budget templates:', error);
      throw error;
    }
    return data;
  },

  // Fetch categories for a template
  async getTemplateCategories(templateId: string) {
     const { data, error } = await supabase
      .from('company_budget_template_categories')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true });

     if (error) {
       console.error('Error fetching template categories:', error);
       throw error;
     }
     return data;
  },

  // Import a template to a company's budget using RPC
  async importTemplateToCompanyBudget(companyId: string, templateId: string, addedByUserId: string) {
    const { error } = await supabase.rpc('import_budget_template', {
      p_company_id: companyId,
      p_template_id: templateId,
      p_user_id: addedByUserId
    });

    if (error) {
      console.error('Error calling import_budget_template RPC:', error);
      throw error;
    }
    // No return value needed as the function returns VOID
  },

  // List all budget line items for a company
  async getCompanyBudget(companyId: string) {
    const { data, error } = await supabase
      .from('company_budget')
      .select('*')
      .eq('company_id', companyId)
      .order('added_at', { ascending: true });

    if (error) {
      console.error('Error fetching company budget:', error);
      throw error;
    }
    return data;
  },

  // Update a budget line item
  async updateBudgetLine(budgetId: string, updates: Record<string, any>) {
    const { error } = await supabase
      .from('company_budget')
      .update(updates)
      .eq('id', budgetId);

    if (error) {
      console.error('Error updating budget line:', error);
      throw error;
    }
  },

  // Add a new budget line item
  async addBudgetLine(companyId: string, line: {
    category: string;
    description?: string;
    amount: number;
    period: 'monthly' | 'annual' | 'one-time';
    added_by: string; // Assuming added_by is UUID
    template_id?: string; // Optional fields if needed
    template_category_id?: string;
  }) {
     const { error } = await supabase
      .from('company_budget')
      .insert({
        company_id: companyId,
        ...line // Spread the line object containing fields matching table columns
      });

     if (error) {
       console.error('Error adding budget line:', error);
       throw error;
     }
  },

  // Remove a budget line item
  async removeBudgetLine(budgetId: string) {
     const { error } = await supabase
      .from('company_budget')
      .delete()
      .eq('id', budgetId);

     if (error) {
       console.error('Error removing budget line:', error);
       throw error;
     }
  },

  // Fetch calculated financial snapshot metrics
  async getFinancialSnapshot(companyId: string) {
    // Using Supabase RPC to call the database function
    const { data, error } = await supabase.rpc('get_company_financial_snapshot', {
      p_company_id: companyId
    });

    if (error) {
      console.error('Error calling get_company_financial_snapshot RPC:', error);
      throw error;
    }

    // The function returns an array of rows, even if only one row is expected.
    // We expect { monthly_burn_rate: number }
    if (data && data.length > 0) {
      return {
        burnRate: data[0].monthly_burn_rate,
        // Add runwayMonths: data[0].runway_months etc. here if the function is updated later
      };
    }

    // Return default/empty object if no data
    return { burnRate: 0 };
  }
};
