/**
 * Enhanced Task Service
 * 
 * Provides robust task management with timeout protection, retry logic,
 * and better error handling to prevent the task loading timeout errors.
 */

import { supabase } from '../supabase.ts';
import { Task } from '../types/task.types.ts';

interface GetTasksOptions {
  category?: string;
  showCompleted?: boolean;
  standupId?: string;
  userId?: string;
}

class EnhancedTaskService {
  private readonly DEFAULT_TIMEOUT = 8000; // 8 seconds
  private readonly MAX_RETRIES = 2;
  
  /**
   * Get tasks with enhanced error handling and timeout protection
   */
  async getTasks(options: GetTasksOptions = {}): Promise<Task[]> {
    const { category, showCompleted = false, standupId, userId } = options;
    
    console.log('[TaskService] Getting tasks with options:', options);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task fetch timeout after ${this.DEFAULT_TIMEOUT}ms`));
      }, this.DEFAULT_TIMEOUT);
    });
    
    // Create the main query promise with retries
    const queryPromise = this.executeTaskQuery(options);
    
    try {
      // Race between query and timeout
      const result = await Promise.race([queryPromise, timeoutPromise]);
      console.log(`[TaskService] Successfully loaded ${result.length} tasks`);
      return result;
    } catch (error: any) {
      console.error('[TaskService] Error loading tasks:', error);
      
      // Return empty array for timeouts to prevent app crashes
      if (error.message?.includes('timeout')) {
        console.warn('[TaskService] Returning empty array due to timeout');
        return [];
      }
      
      // For other errors, still return empty array but log more details
      console.warn('[TaskService] Returning empty array due to error:', error);
      return [];
    }
  }
  
  /**
   * Execute the actual task query with retry logic
   */
  private async executeTaskQuery(options: GetTasksOptions): Promise<Task[]> {
    const { category, showCompleted = false, standupId, userId } = options;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[TaskService] Query attempt ${attempt}/${this.MAX_RETRIES}`);
        
        // Build the query
        let query = supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Add filters
        if (userId) {
          query = query.eq('assigned_to', userId);
        }
        
        if (category) {
          query = query.eq('category', category);
        }
        
        if (standupId) {
          query = query.eq('standup_entry_id', standupId);
        }
        
        if (!showCompleted) {
          query = query.neq('status', 'completed');
        }
        
        // Execute with a per-attempt timeout
        const attemptTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Query attempt ${attempt} timeout`));
          }, 3000); // 3 seconds per attempt
        });
        
        const queryExecution = query;
        const { data, error } = await Promise.race([queryExecution, attemptTimeout]);
        
        if (error) {
          throw error;
        }
        
        console.log(`[TaskService] Query attempt ${attempt} succeeded`);
        return (data || []) as Task[];
        
      } catch (error: any) {
        console.warn(`[TaskService] Query attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
        console.log(`[TaskService] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached due to the throw above
    return [];
  }
  
  /**
   * Create task with enhanced error handling
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    console.log('[TaskService] Creating task:', taskData);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();
      
      if (error) {
        console.error('[TaskService] Error creating task:', error);
        throw error;
      }
      
      console.log('[TaskService] Task created successfully');
      return data as Task;
    } catch (error) {
      console.error('[TaskService] Failed to create task:', error);
      throw error;
    }
  }
  
  /**
   * Update task with enhanced error handling
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    console.log('[TaskService] Updating task:', taskId, updates);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        console.error('[TaskService] Error updating task:', error);
        throw error;
      }
      
      console.log('[TaskService] Task updated successfully');
      return data as Task;
    } catch (error) {
      console.error('[TaskService] Failed to update task:', error);
      throw error;
    }
  }
  
  /**
   * Delete task with enhanced error handling
   */
  async deleteTask(taskId: string): Promise<void> {
    console.log('[TaskService] Deleting task:', taskId);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error('[TaskService] Error deleting task:', error);
        throw error;
      }
      
      console.log('[TaskService] Task deleted successfully');
    } catch (error) {
      console.error('[TaskService] Failed to delete task:', error);
      throw error;
    }
  }
  
  /**
   * Check connection to tasks service
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log('[TaskService] Checking connection...');
      
      // Simple query to test connection
      const { error } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn('[TaskService] Connection check failed:', error);
        return false;
      }
      
      console.log('[TaskService] Connection check passed');
      return true;
    } catch (error) {
      console.warn('[TaskService] Connection check error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const enhancedTaskService = new EnhancedTaskService();
export { EnhancedTaskService };
