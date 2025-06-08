import { supabase } from '@/lib/supabase';

/**
 * Interface for contract templates
 */
export interface ContractTemplate {
  id: string;
  expert_id: string;
  title: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for contracts
 */
export interface Contract {
  id: string;
  expert_id: string;
  user_id: string;
  connect_request_id?: string;
  template_id?: string;
  title: string;
  content: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'terminated';
  expert_signed: boolean;
  user_signed: boolean;
  expert_signed_at?: string;
  user_signed_at?: string;
  valid_from?: string;
  valid_until?: string;
  hourly_rate?: number;
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for payments
 */
export interface Payment {
  id: string;
  expert_id: string;
  user_id: string;
  session_id?: string;
  contract_id?: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_reference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  notes?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing expert contracts and payments
 */
export const contractService = {
  /**
   * Create a new contract template
   * @param data The template data
   * @returns The created template
   */
  async createContractTemplate(data: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContractTemplate | null> {
    const { data: template, error } = await supabase
      .from('expert_contract_templates')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating contract template:', error);
      throw error;
    }

    return template;
  },

  /**
   * Get contract templates for an expert
   * @param expertId The expert's ID
   * @returns Array of templates
   */
  async getContractTemplates(expertId: string): Promise<ContractTemplate[]> {
    const { data, error } = await supabase
      .from('expert_contract_templates')
      .select('*')
      .eq('expert_id', expertId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contract templates:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific contract template by ID
   * @param templateId The template ID
   * @returns The template
   */
  async getContractTemplateById(templateId: string): Promise<ContractTemplate | null> {
    const { data, error } = await supabase
      .from('expert_contract_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching contract template:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a contract template
   * @param templateId The template ID
   * @param updates The updates to apply
   * @returns The updated template
   */
  async updateContractTemplate(templateId: string, updates: Partial<Omit<ContractTemplate, 'id' | 'expert_id' | 'created_at' | 'updated_at'>>): Promise<ContractTemplate | null> {
    const { data, error } = await supabase
      .from('expert_contract_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract template:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a contract template
   * @param templateId The template ID
   * @returns Whether the deletion was successful
   */
  async deleteContractTemplate(templateId: string): Promise<boolean> {
    const { error } = await supabase
      .from('expert_contract_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting contract template:', error);
      throw error;
    }

    return true;
  },

  /**
   * Create a new contract
   * @param data The contract data
   * @returns The created contract
   */
  async createContract(data: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract | null> {
    const { data: contract, error } = await supabase
      .from('expert_contracts')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      throw error;
    }

    return contract;
  },

  /**
   * Get contracts for an expert
   * @param expertId The expert's ID
   * @param status Optional status filter
   * @returns Array of contracts
   */
  async getContractsByExpert(expertId: string, status?: string): Promise<Contract[]> {
    let query = supabase
      .from('expert_contracts')
      .select('*')
      .eq('expert_id', expertId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get contracts for a user
   * @param userId The user's ID
   * @param status Optional status filter
   * @returns Array of contracts
   */
  async getContractsByUser(userId: string, status?: string): Promise<Contract[]> {
    let query = supabase
      .from('expert_contracts')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific contract by ID
   * @param contractId The contract ID
   * @returns The contract
   */
  async getContractById(contractId: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('expert_contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a contract
   * @param contractId The contract ID
   * @param updates The updates to apply
   * @returns The updated contract
   */
  async updateContract(contractId: string, updates: Partial<Omit<Contract, 'id' | 'created_at' | 'updated_at'>>): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('expert_contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      throw error;
    }

    return data;
  },

  /**
   * Sign a contract as an expert
   * @param contractId The contract ID
   * @returns The updated contract
   */
  async signContractAsExpert(contractId: string): Promise<Contract | null> {
    return this.updateContract(contractId, {
      expert_signed: true,
      expert_signed_at: new Date().toISOString(),
      status: 'sent'
    });
  },

  /**
   * Sign a contract as a user
   * @param contractId The contract ID
   * @returns The updated contract
   */
  async signContractAsUser(contractId: string): Promise<Contract | null> {
    return this.updateContract(contractId, {
      user_signed: true,
      user_signed_at: new Date().toISOString(),
      status: 'accepted'
    });
  },

  /**
   * Reject a contract
   * @param contractId The contract ID
   * @param reason Optional reason for rejection
   * @returns The updated contract
   */
  async rejectContract(contractId: string, reason?: string): Promise<Contract | null> {
    return this.updateContract(contractId, {
      status: 'rejected',
      terms_and_conditions: reason ? `Rejected: ${reason}` : undefined
    });
  },

  /**
   * Create a new payment
   * @param data The payment data
   * @returns The created payment
   */
  async createPayment(data: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    const { data: payment, error } = await supabase
      .from('expert_payments')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }

    return payment;
  },

  /**
   * Get payments for an expert
   * @param expertId The expert's ID
   * @param status Optional status filter
   * @returns Array of payments
   */
  async getPaymentsByExpert(expertId: string, status?: string): Promise<Payment[]> {
    let query = supabase
      .from('expert_payments')
      .select('*')
      .eq('expert_id', expertId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get payments for a user
   * @param userId The user's ID
   * @param status Optional status filter
   * @returns Array of payments
   */
  async getPaymentsByUser(userId: string, status?: string): Promise<Payment[]> {
    let query = supabase
      .from('expert_payments')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific payment by ID
   * @param paymentId The payment ID
   * @returns The payment
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('expert_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a payment
   * @param paymentId The payment ID
   * @param updates The updates to apply
   * @returns The updated payment
   */
  async updatePayment(paymentId: string, updates: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('expert_payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a payment status
   * @param paymentId The payment ID
   * @param status The new status
   * @returns The updated payment
   */
  async updatePaymentStatus(paymentId: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'): Promise<Payment | null> {
    return this.updatePayment(paymentId, { status });
  }
};
