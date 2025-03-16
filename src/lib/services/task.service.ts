import { supabase } from '../supabase';
import { Task } from '../types/task.types';
import { v4 as uuidv4 } from 'uuid';

export interface TaskService {
  getTasks: (options: { category?: string; standupId?: string }) => Promise<Task[]>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

class SupabaseTaskService implements TaskService {
  async getTasks({ category, standupId }: { category?: string; standupId?: string }): Promise<Task[]> {
    let query = supabase
      .from('standup_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by standup entry if provided
    if (standupId) {
      query = query.eq('standup_entry_id', standupId);
    }
    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    // Ensure task has an ID
    const taskWithId = {
      id: uuidv4(),
      ...task
    };
    
    const { data, error } = await supabase
      .from('standup_tasks')
      .insert([taskWithId])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const { error } = await supabase
      .from('standup_tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) throw error;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('standup_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }
}

export const taskService = new SupabaseTaskService();
