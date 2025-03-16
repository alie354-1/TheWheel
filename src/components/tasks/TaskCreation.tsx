import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, RotateCw, Brain } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { generateTasks } from '../../lib/openai';
import TaskList from './TaskList';
import { Task } from '../../lib/types/task.types';
import { StandupEntry } from '../../lib/services/standup-ai.service';

interface TaskCreationProps {
  isCompanyView?: boolean;
}

export default function TaskCreation({ isCompanyView = false }: TaskCreationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const standupEntry = location.state?.standupEntry;
    if (standupEntry) {
      generateTaskSuggestions();
    } else {
      navigate('/dashboard');
    }
  }, []);

  // Get next business day
  const getNextBusinessDay = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    
    // Keep adding days until we get a business day (Mon-Fri)
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    
    return date.toISOString().split('T')[0];
  };

  const generateTaskSuggestions = async () => {
    if (!user || !location.state?.standupEntry) return;
    setIsGenerating(true);
    setError('');

    try {
      const response = await generateTasks(location.state.standupEntry, user.id);
      const generatedTasks = response.tasks;
      
      if (!generatedTasks || !Array.isArray(generatedTasks)) {
        throw new Error('Invalid task generation response');
      }
      
      // Set next business day as due date and flatten the structure
      const categorizedTasks = generatedTasks.map((task, index) => {
        // Validate priority to ensure it's one of the allowed values
        const priority = task.priority?.toLowerCase();
        const validPriority = (priority === 'low' || priority === 'medium' || priority === 'high') 
          ? priority as 'low' | 'medium' | 'high' 
          : 'medium' as const;
          
        return {
          ...task,
          id: `suggested-${index}`, // Add unique ID for suggested tasks
          due_date: getNextBusinessDay(),
          category: isCompanyView ? 'company' : 'personal',
          status: 'pending' as const, // Ensure status is set with correct type
          priority: validPriority, // Use validated priority
          implementation_tips: task.implementation_tips || [],
          potential_challenges: task.potential_challenges || [],
          success_metrics: task.success_metrics || [],
          resources: task.resources || [],
          learning_resources: task.learning_resources || [],
          tools: task.tools || []
        };
      });

      setSuggestedTasks(categorizedTasks);
    } catch (error: any) {
      console.error('Error generating tasks:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = (task: Task) => {
    // Generate a unique ID for the selected task
    const selectedTask = {
      ...task,
      id: `selected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setSelectedTasks([...selectedTasks, selectedTask]);
    setSuggestedTasks(suggestedTasks.filter(t => t.id !== task.id));
  };

  const handleRemoveTask = (task: Task) => {
    setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    setSuggestedTasks([...suggestedTasks, task]);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const taskList = selectedTasks.find(t => t.id === taskId) ? selectedTasks : suggestedTasks;
    const updatedTasks = taskList.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    
    if (selectedTasks.find(t => t.id === taskId)) {
      setSelectedTasks(updatedTasks);
    } else {
      setSuggestedTasks(updatedTasks);
    }
  };

  const handleSaveTasks = async () => {
    if (!user || selectedTasks.length === 0) return;
    setIsSubmitting(true);
    setError('');

    try {
      // Get latest standup entry
      const { data: latestStandup } = await supabase
        .from('standup_entries')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestStandup) {
        throw new Error('No standup entry found. Please create a daily update first.');
      }

      // Create tasks
      const { error: tasksError } = await supabase
        .from('standup_tasks')
        .insert(
          selectedTasks.map(task => ({
            // Generate a proper UUID for each task
            id: crypto.randomUUID(),
            standup_entry_id: latestStandup.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status || 'pending', // Ensure status is never null
            category: task.category,
            task_type: task.task_type,
            estimated_hours: task.estimated_hours,
            due_date: task.due_date,
            implementation_tips: task.implementation_tips,
            potential_challenges: task.potential_challenges,
            success_metrics: task.success_metrics,
            resources: task.resources,
            learning_resources: task.learning_resources,
            tools: task.tools,
            assigned_to: user.id
          }))
        );

      if (tasksError) throw tasksError;

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving tasks:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create Tasks</h1>
        <button
          onClick={handleSaveTasks}
          disabled={isSubmitting || selectedTasks.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Save Tasks
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-6">
        {/* Selected Tasks */}
        {selectedTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Tasks</h2>
            <TaskList 
              tasks={selectedTasks}
              onRemoveTask={handleRemoveTask}
              onUpdateTask={handleUpdateTask}
            />
          </div>
        )}

        {/* Suggested Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">AI-Generated Task Suggestions</h2>
            <button
              onClick={generateTaskSuggestions}
              disabled={isGenerating}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </button>
          </div>

          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Generating task suggestions...</p>
            </div>
          ) : suggestedTasks.length > 0 ? (
            <TaskList 
              tasks={suggestedTasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              suggestedTasks={true}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Brain className="h-8 w-8 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No task suggestions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click the regenerate button to get new task suggestions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
