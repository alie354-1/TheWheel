import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/utils/supabaseClient';
import { NextTask } from '../components/steps/ActiveStepCard';

/**
 * Hook to fetch tasks for a specific step
 * @param stepId The ID of the step to fetch tasks for
 * @returns An object containing the tasks and loading state
 */
export const useStepTasks = (stepId: string) => {
  const [tasks, setTasks] = useState<NextTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract fetchTasks function to make it reusable
  const fetchTasks = async () => {
    if (!stepId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      // Only show loading state on initial fetch
      if (tasks.length === 0) {
        setLoading(true);
      }
      setError(null);

      const { data, error } = await supabase
        .from('standup_tasks')
        .select('id, title, status')
        .eq('step_id', stepId);

      if (error) {
        throw error;
      }

      // Convert the tasks to the NextTask format
      const formattedTasks: NextTask[] = data.map(task => ({
        id: task.id,
        text: task.title,
        done: task.status === 'completed'
      }));

      setTasks(formattedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks for step:', err);
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTasks();
    
    // Set up polling interval (every 10 seconds)
    const pollingInterval = setInterval(() => {
      fetchTasks();
    }, 10000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [stepId]);

  return { 
    tasks, 
    loading, 
    error,
    refreshTasks: fetchTasks // Expose the refresh function
  };
};
