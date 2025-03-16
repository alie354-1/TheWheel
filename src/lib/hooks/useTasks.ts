import { useState, useEffect } from 'react';
import { taskService } from '../services/task.service';
import { Task } from '../types/task.types';
import { useAuthStore } from '../store';
import { supabase } from '../supabase';

interface UseTasksOptions {
  category?: string;
  showCompleted?: boolean;
  standupId?: string;
}

export function useTasks({ category, showCompleted = false, standupId }: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadTasks();
  }, [category, standupId]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const tasks = await taskService.getTasks({ category, standupId });
      setTasks(showCompleted ? tasks : tasks.filter(t => t.status !== 'completed'));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (task: Partial<Task>) => {
    try {
      // If no standupId is provided, create a default standup entry
      let entryId = standupId;
      
      if (!entryId) {
        // Create a default standup entry
        const { data: entryData, error: entryError } = await supabase
          .from('standup_entries')
          .insert({
            user_id: user?.id,
            date: new Date().toISOString().split('T')[0],
            accomplished: 'Task created outside of standup',
            working_on: task.title || 'New task',
            goals: task.description || 'Complete task',
            answers: {}
          })
          .select()
          .single();
          
        if (entryError) {
          throw entryError;
        }
        
        entryId = entryData.id;
      }
      
      // Ensure task is assigned to current user and linked to a standup entry
      const taskData = {
        ...task,
        assigned_to: user?.id,
        standup_entry_id: entryId
      };
      
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const regenerateTask = async (taskId: string) => {
    try {
      setIsRegenerating(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Import dynamically to avoid circular dependencies
      const { aiService } = await import('../services/ai.service');
      
      const response = await aiService.generateTasks({
        accomplished: '',
        working_on: task.description,
        blockers: '',
        goals: task.title
      });

      if (response.tasks && response.tasks.length > 0) {
        const suggestions = response.tasks[0];
        await updateTask(taskId, {
          implementation_tips: suggestions.implementation_tips,
          potential_challenges: suggestions.potential_challenges,
          success_metrics: suggestions.success_metrics,
          resources: suggestions.resources,
          learning_resources: suggestions.learning_resources,
          tools: suggestions.tools
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsRegenerating(null);
    }
  };

  return {
    tasks,
    isLoading,
    error,
    isRegenerating,
    createTask,
    updateTask,
    deleteTask,
    regenerateTask,
    refreshTasks: loadTasks
  };
}
