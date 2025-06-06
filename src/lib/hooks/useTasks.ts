import { useState, useEffect } from 'react';
import { taskService } from '../services/task.service.ts';
import { enhancedTaskService } from '../services/task.service.enhanced.ts';
import { Task } from '../types/task.types.ts';
import { useAuthStore } from '../store.ts';
import { supabase } from '../supabase.ts';

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
    if (!user) {
      console.log("[useTasks] No user available, skipping task load");
      setIsLoading(false);
      setTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("[useTasks] Loading tasks for user:", user.id, "category:", category);
      
      // Use enhanced task service which has built-in timeout and retry logic
      const tasks = await enhancedTaskService.getTasks({ 
        category, 
        standupId,
        userId: user.id // Always filter by current user for security
      });
      
      console.log("[useTasks] Successfully loaded tasks:", tasks.length);
      
      // Filter completed tasks if needed
      const filteredTasks = showCompleted ? tasks : tasks.filter(t => t.status !== 'completed');
      setTasks(filteredTasks);
      setError(null);
      
    } catch (err: any) {
      // Enhanced service handles most errors gracefully, but catch any remaining ones
      console.error("[useTasks] Unexpected error:", err);
      setError(err.message || "Failed to load tasks");
      setTasks([]); // Always ensure tasks is an array
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (task: Partial<Task>) => {
    if (!user) {
      const error = "Cannot create task: user not authenticated";
      setError(error);
      throw new Error(error);
    }

    try {
      // If no standupId is provided, create a default standup entry
      let entryId = standupId;
      
      if (!entryId) {
        // Create a default standup entry
        const { data: entryData, error: entryError } = await supabase
          .from('standup_entries')
          .insert({
            user_id: user.id,
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
        assigned_to: user.id,
        standup_entry_id: entryId
      };
      
      // Use enhanced task service
      const newTask = await enhancedTaskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Use enhanced task service
      const updatedTask = await enhancedTaskService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Use enhanced task service
      await enhancedTaskService.deleteTask(taskId);
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
      const { aiService } = await import('../services/ai.service.ts');
      
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
