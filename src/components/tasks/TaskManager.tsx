import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle, AlertCircle, Filter, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { useTasks } from '../../lib/hooks/useTasks';
import TaskList from './TaskList';
import CreateTaskDialog from './CreateTaskDialog';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  task_type: string;
  estimated_hours: number;
  due_date: string;
  implementation_tips?: string[];
  potential_challenges?: string[];
  success_metrics?: string[];
  resources?: {
    title: string;
    url: string;
    type: string;
    description: string;
  }[];
  learning_resources?: {
    title: string;
    url: string;
    type: string;
    platform: string;
    description: string;
  }[];
  tools?: {
    name: string;
    url: string;
    category: string;
    description: string;
  }[];
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  highPriority: number;
  estimatedHours: number;
  completedHours: number;
}

interface TaskManagerProps {
  category?: string;
  showCompleted?: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({
  category = 'personal',
  showCompleted = false
}) => {
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks
  } = useTasks({ category, showCompleted });

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0,
    estimatedHours: 0,
    completedHours: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortField, setSortField] = useState<keyof Task>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    type: [] as string[]
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filters, sortField, sortDirection, showCompleted]);

  const calculateStats = (taskList: Task[]) => {
    const now = new Date();
    const stats: TaskStats = {
      total: taskList.length,
      completed: taskList.filter(t => t.status === 'completed').length,
      inProgress: taskList.filter(t => t.status === 'in_progress').length,
      pending: taskList.filter(t => t.status === 'pending').length,
      overdue: taskList.filter(t => 
        t.status !== 'completed' && 
        new Date(t.due_date) < now
      ).length,
      highPriority: taskList.filter(t => t.priority === 'high').length,
      estimatedHours: taskList.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
      completedHours: taskList
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
    };
    setStats(stats);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply status filter
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'completed');
    }

    // Apply custom filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(task => filters.type.includes(task.task_type));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'due_date') {
        comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredTasks(filtered);
    calculateStats(filtered);
  };

  const toggleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loading loading-spinner loading-lg text-primary mx-auto"></div>
        <p className="mt-2 text-sm text-base-content/70">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-md rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-300">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-lg font-medium text-base-content"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 mr-2 text-base-content/60" />
            ) : (
              <ChevronRight className="h-5 w-5 mr-2 text-base-content/60" />
            )}
            Tasks
          </button>
          
          {/* Collapsed View Stats */}
          {!isExpanded && (
            <div className="ml-6 flex items-center space-x-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-warning mr-1.5" />
                <span className="text-sm text-base-content/70">{stats.inProgress}</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-error mr-1.5" />
                <span className="text-sm text-base-content/70">{stats.overdue}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-success mr-1.5" />
                <span className="text-sm text-base-content/70">{stats.completed}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowCreateDialog(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </button>
        </div>

        {/* Expanded View Content */}
        {isExpanded && (
          <>
            {/* Stats */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm font-medium text-primary">Total Tasks</div>
                <div className="mt-1 text-2xl font-semibold text-primary">{stats.total}</div>
              </div>
              <div className="bg-success/10 p-4 rounded-lg">
                <div className="text-sm font-medium text-success">Completed</div>
                <div className="mt-1 text-2xl font-semibold text-success">{stats.completed}</div>
              </div>
              <div className="bg-warning/10 p-4 rounded-lg">
                <div className="text-sm font-medium text-warning">In Progress</div>
                <div className="mt-1 text-2xl font-semibold text-warning">{stats.inProgress}</div>
              </div>
              <div className="bg-error/10 p-4 rounded-lg">
                <div className="text-sm font-medium text-error">Overdue</div>
                <div className="mt-1 text-2xl font-semibold text-error">{stats.overdue}</div>
              </div>
            </div>

            {/* Filters Toggle */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-sm btn-outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-base-content mb-2">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'in_progress', 'completed'].map(status => (
                        <button
                          key={status}
                          onClick={() => toggleFilter('status', status)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            filters.status.includes(status)
                              ? status === 'completed'
                                ? 'bg-success/20 text-success'
                                : status === 'in_progress'
                                ? 'bg-warning/20 text-warning'
                                : 'bg-info/20 text-info'
                              : 'bg-base-300 text-base-content'
                          }`}
                        >
                          {status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                          {status === 'in_progress' && <Clock className="h-4 w-4 mr-1" />}
                          {status === 'pending' && <AlertCircle className="h-4 w-4 mr-1" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-base-content mb-2">Priority</h4>
                    <div className="flex flex-wrap gap-2">
                      {['low', 'medium', 'high'].map(priority => (
                        <button
                          key={priority}
                          onClick={() => toggleFilter('priority', priority)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            filters.priority.includes(priority)
                              ? priority === 'high'
                                ? 'bg-error/20 text-error'
                                : priority === 'medium'
                                ? 'bg-warning/20 text-warning'
                                : 'bg-success/20 text-success'
                              : 'bg-base-300 text-base-content'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Task List */}
      {isExpanded && (
        <div className="p-4">
          {/* Sort Controls */}
          <div className="mb-4 flex items-center space-x-3">
            <button
              onClick={() => toggleSort('due_date')}
              className="btn btn-sm btn-outline"
            >
              Due Date
              {sortField === 'due_date' && (
                sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1" />
                )
              )}
            </button>
            <button
              onClick={() => toggleSort('priority')}
              className="btn btn-sm btn-outline"
            >
              Priority
              {sortField === 'priority' && (
                sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1" />
                )
              )}
            </button>
            <button
              onClick={() => toggleSort('status')}
              className="btn btn-sm btn-outline"
            >
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1" />
                )
              )}
            </button>
          </div>

          <TaskList
            tasks={filteredTasks}
            onUpdateTask={updateTask}
          />
        </div>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onTaskCreated={createTask}
        category={category}
      />
    </div>
  );
};

export default TaskManager;
