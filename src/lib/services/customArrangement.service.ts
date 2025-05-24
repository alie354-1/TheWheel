import { supabase } from '../supabase';
import { CustomStepArrangement, CustomStepOrder, CustomPhase, StepBatchOperation } from '../types/journey-unified.types';

/**
 * Custom Arrangement Service
 * 
 * Provides methods for managing custom step arrangements, orders, and phases.
 * Implements the drag-and-drop persistence for the journey steps.
 */
export class CustomArrangementService {
  
  /**
   * Create a new custom arrangement.
   */
  async createArrangement(
    companyId: string,
    userId: string,
    name: string,
    description?: string,
    isDefault = false
  ): Promise<CustomStepArrangement | null> {
    try {
      const { data, error } = await supabase
        .from('custom_step_arrangements')
        .insert({
          company_id: companyId,
          user_id: userId,
          name,
          description,
          is_default: isDefault
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as CustomStepArrangement;
    } catch (error) {
      console.error('Error creating custom arrangement:', error);
      return null;
    }
  }

  /**
   * Get all custom arrangements for a company.
   */
  async getCompanyArrangements(companyId: string): Promise<CustomStepArrangement[]> {
    try {
      const { data, error } = await supabase
        .from('custom_step_arrangements')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as CustomStepArrangement[];
    } catch (error) {
      console.error('Error getting company arrangements:', error);
      return [];
    }
  }

  /**
   * Get a user's custom arrangements.
   */
  async getUserArrangements(userId: string): Promise<CustomStepArrangement[]> {
    try {
      const { data, error } = await supabase
        .from('custom_step_arrangements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as CustomStepArrangement[];
    } catch (error) {
      console.error('Error getting user arrangements:', error);
      return [];
    }
  }

  /**
   * Get the default arrangement for a user/company,
   * or create one if it doesn't exist.
   */
  async getOrCreateDefaultArrangement(
    companyId: string,
    userId: string
  ): Promise<CustomStepArrangement | null> {
    try {
      // Try to find an existing default arrangement
      const { data: existing, error: findError } = await supabase
        .from('custom_step_arrangements')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .eq('is_default', true)
        .limit(1)
        .single();
        
      if (!findError && existing) {
        return existing as CustomStepArrangement;
      }
      
      // Create a new default arrangement
      const defaultName = 'My Custom Arrangement';
      const { data: created, error: createError } = await supabase
        .from('custom_step_arrangements')
        .insert({
          company_id: companyId,
          user_id: userId,
          name: defaultName,
          is_default: true
        })
        .select('*')
        .single();
        
      if (createError) throw createError;
      
      return created as CustomStepArrangement;
    } catch (error) {
      console.error('Error getting/creating default arrangement:', error);
      return null;
    }
  }

  /**
   * Update a custom arrangement.
   */
  async updateArrangement(
    arrangementId: string,
    updates: Partial<CustomStepArrangement>
  ): Promise<CustomStepArrangement | null> {
    try {
      const { data, error } = await supabase
        .from('custom_step_arrangements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', arrangementId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as CustomStepArrangement;
    } catch (error) {
      console.error('Error updating arrangement:', error);
      return null;
    }
  }

  /**
   * Delete a custom arrangement.
   */
  async deleteArrangement(arrangementId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_step_arrangements')
        .delete()
        .eq('id', arrangementId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting arrangement:', error);
      return false;
    }
  }

  /**
   * Get all step orders for an arrangement.
   */
  async getStepOrders(arrangementId: string): Promise<CustomStepOrder[]> {
    try {
      const { data, error } = await supabase
        .from('custom_step_order')
        .select('*')
        .eq('arrangement_id', arrangementId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      return data as CustomStepOrder[];
    } catch (error) {
      console.error('Error getting step orders:', error);
      return [];
    }
  }

  /**
   * Save a step order to an arrangement.
   */
  async saveStepOrder(
    arrangementId: string,
    stepId: string,
    orderIndex: number,
    customPhaseId?: string,
    notes?: string
  ): Promise<CustomStepOrder | null> {
    try {
      const { data, error } = await supabase
        .from('custom_step_order')
        .upsert({
          arrangement_id: arrangementId,
          step_id: stepId,
          order_index: orderIndex,
          custom_phase_id: customPhaseId,
          notes,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as CustomStepOrder;
    } catch (error) {
      console.error('Error saving step order:', error);
      return null;
    }
  }

  /**
   * Save multiple step orders in a single transaction.
   */
  async saveBatchStepOrders(
    arrangementId: string,
    orders: {
      stepId: string;
      orderIndex: number;
      customPhaseId?: string;
      notes?: string;
    }[]
  ): Promise<boolean> {
    if (!orders.length) return true;
    
    try {
      const formattedOrders = orders.map(order => ({
        arrangement_id: arrangementId,
        step_id: order.stepId,
        order_index: order.orderIndex,
        custom_phase_id: order.customPhaseId,
        notes: order.notes,
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('custom_step_order')
        .upsert(formattedOrders);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error saving batch step orders:', error);
      return false;
    }
  }

  /**
   * Remove a step from an arrangement.
   */
  async removeStepFromArrangement(
    arrangementId: string,
    stepId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_step_order')
        .delete()
        .eq('arrangement_id', arrangementId)
        .eq('step_id', stepId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error removing step from arrangement:', error);
      return false;
    }
  }

  /**
   * Reorder steps in an arrangement.
   * This method handles reordering by updating all affected step orders.
   */
  async reorderSteps(
    arrangementId: string,
    sourceIndex: number,
    destinationIndex: number
  ): Promise<boolean> {
    try {
      // Get all steps in the arrangement
      const steps = await this.getStepOrders(arrangementId);
      
      if (steps.length <= 1) return true;
      
      // Validate indices
      if (
        sourceIndex < 0 || 
        sourceIndex >= steps.length || 
        destinationIndex < 0 || 
        destinationIndex >= steps.length
      ) {
        throw new Error('Invalid source or destination index');
      }
      
      // Perform reordering
      const step = steps[sourceIndex];
      
      if (sourceIndex < destinationIndex) {
        // Moving down: decrement indices of items between source and destination
        for (let i = sourceIndex + 1; i <= destinationIndex; i++) {
          await this.saveStepOrder(
            arrangementId,
            steps[i].step_id,
            i - 1,
            steps[i].custom_phase_id,
            steps[i].notes
          );
        }
      } else if (sourceIndex > destinationIndex) {
        // Moving up: increment indices of items between destination and source
        for (let i = destinationIndex; i < sourceIndex; i++) {
          await this.saveStepOrder(
            arrangementId,
            steps[i].step_id,
            i + 1,
            steps[i].custom_phase_id,
            steps[i].notes
          );
        }
      } else {
        // No change needed
        return true;
      }
      
      // Update the moved step
      await this.saveStepOrder(
        arrangementId,
        step.step_id,
        destinationIndex,
        step.custom_phase_id,
        step.notes
      );
      
      return true;
    } catch (error) {
      console.error('Error reordering steps:', error);
      return false;
    }
  }

  /**
   * Create a custom phase.
   */
  async createCustomPhase(
    companyId: string,
    userId: string,
    name: string,
    description?: string,
    color?: string,
    orderIndex?: number
  ): Promise<CustomPhase | null> {
    try {
      // If order index is not provided, place at the end
      if (orderIndex === undefined) {
        const { count, error: countError } = await supabase
          .from('custom_phases')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('user_id', userId);
          
        if (countError) throw countError;
        
        orderIndex = count || 0;
      }
      
      const { data, error } = await supabase
        .from('custom_phases')
        .insert({
          company_id: companyId,
          user_id: userId,
          name,
          description,
          color,
          order_index: orderIndex
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as CustomPhase;
    } catch (error) {
      console.error('Error creating custom phase:', error);
      return null;
    }
  }

  /**
   * Get all custom phases for a user in a company.
   */
  async getCustomPhases(
    companyId: string,
    userId: string
  ): Promise<CustomPhase[]> {
    try {
      const { data, error } = await supabase
        .from('custom_phases')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      return data as CustomPhase[];
    } catch (error) {
      console.error('Error getting custom phases:', error);
      return [];
    }
  }

  /**
   * Update a custom phase.
   */
  async updateCustomPhase(
    phaseId: string,
    updates: Partial<CustomPhase>
  ): Promise<CustomPhase | null> {
    try {
      const { data, error } = await supabase
        .from('custom_phases')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', phaseId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as CustomPhase;
    } catch (error) {
      console.error('Error updating custom phase:', error);
      return null;
    }
  }

  /**
   * Delete a custom phase.
   */
  async deleteCustomPhase(phaseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_phases')
        .delete()
        .eq('id', phaseId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting custom phase:', error);
      return false;
    }
  }

  /**
   * Record a batch operation on steps.
   */
  async recordBatchOperation(
    companyId: string,
    userId: string,
    operationType: string,
    affectedSteps: string[],
    sourceArrangementId?: string,
    targetArrangementId?: string,
    operationData?: Record<string, any>
  ): Promise<StepBatchOperation | null> {
    try {
      const { data, error } = await supabase
        .from('step_batch_operations')
        .insert({
          company_id: companyId,
          user_id: userId,
          operation_type: operationType,
          affected_steps: affectedSteps,
          source_arrangement_id: sourceArrangementId,
          target_arrangement_id: targetArrangementId,
          operation_data: operationData || {}
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      return data as StepBatchOperation;
    } catch (error) {
      console.error('Error recording batch operation:', error);
      return null;
    }
  }

  /**
   * Get recent batch operations for a company.
   */
  async getRecentBatchOperations(
    companyId: string,
    limit = 10
  ): Promise<StepBatchOperation[]> {
    try {
      const { data, error } = await supabase
        .from('step_batch_operations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data as StepBatchOperation[];
    } catch (error) {
      console.error('Error getting recent batch operations:', error);
      return [];
    }
  }

  /**
   * Get batch operations by user.
   */
  async getUserBatchOperations(
    userId: string,
    limit = 10
  ): Promise<StepBatchOperation[]> {
    try {
      const { data, error } = await supabase
        .from('step_batch_operations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data as StepBatchOperation[];
    } catch (error) {
      console.error('Error getting user batch operations:', error);
      return [];
    }
  }
}

// Create an instance to export
export const customArrangementService = new CustomArrangementService();
