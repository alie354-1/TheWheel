import React, { useState } from 'react';
import TaskItem from './TaskItem';
import type { Task } from '../../lib/types/task.types';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onAddTask?: (task: Task) => void;
  onRemoveTask?: (task: Task) => void;
  suggestedTasks?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks = [], // Provide default empty array
  onUpdateTask,
  onAddTask,
  onRemoveTask,
  suggestedTasks = false
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<string, boolean>>>({});

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleSection = (taskId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [section]: !(prev[taskId]?.[section])
      }
    }));
  };

  // Return early if no tasks
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-sm text-gray-500">No tasks available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onRemoveTask={onRemoveTask}
          onAddTask={onAddTask}
          isExpanded={expandedTasks[task.id] || false}
          onToggleExpand={() => toggleTask(task.id)}
          expandedSections={expandedSections[task.id] || {}}
          onToggleSection={(section) => toggleSection(task.id, section)}
          suggestedTask={suggestedTasks}
        />
      ))}
    </div>
  );
};

export default TaskList;