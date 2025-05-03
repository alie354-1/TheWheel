import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, AlertCircle, CheckCircle, Edit, Save, X, Book, PenTool, ExternalLink, Video, FileText, Lightbulb, Brain, Plus, RotateCw, Trash2, PenTool as Tool } from 'lucide-react';
import { aiService } from '../../lib/services/ai.service';
import type { Task } from '../../lib/types/task.types';

interface TaskItemProps {
  task: Task;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onRemoveTask?: (task: Task) => void;
  onAddTask?: (task: Task) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  suggestedTask?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdateTask,
  onRemoveTask,
  onAddTask,
  isExpanded,
  onToggleExpand,
  expandedSections,
  onToggleSection,
  suggestedTask = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState(task);

  const handleGenerateAISuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await aiService.generateTasks({
        accomplished: '',
        working_on: editedTask.description,
        blockers: '',
        goals: editedTask.title
      });

      if (response.tasks && response.tasks.length > 0) {
        const suggestions = response.tasks[0];
        setEditedTask(prev => ({
          ...prev,
          implementation_tips: suggestions.implementation_tips || [],
          potential_challenges: suggestions.potential_challenges || [],
          success_metrics: suggestions.success_metrics || [],
          resources: suggestions.resources || [],
          learning_resources: suggestions.learning_resources || [],
          tools: suggestions.tools || []
        }));
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    if (suggestedTask && onAddTask) {
      onAddTask(editedTask);
    } else if (onUpdateTask) {
      onUpdateTask(task.id, editedTask);
    }
    setIsEditing(false);
  };

  const handleRegenerateResource = async (section: string, index: number) => {
    if (!editedTask.title || !editedTask.description) return;
    setIsRegenerating(`${section}-${index}`);

    try {
      const response = await aiService.generateTasks({
        accomplished: '',
        working_on: editedTask.description,
        blockers: '',
        goals: editedTask.title
      });

      if (response.tasks && response.tasks.length > 0) {
        const suggestions = response.tasks[0];
        const newResource = suggestions[section]?.[0];

        if (newResource) {
          setEditedTask(prev => {
            const items = [...(prev[section] as any[])];
            items[index] = {
              ...items[index],
              ...newResource,
              tags: items[index].tags || []
            };
            return { ...prev, [section]: items };
          });
        }
      }
    } catch (error) {
      console.error(`Error regenerating ${section}:`, error);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleRemoveSuggestion = (section: string, index: number) => {
    setEditedTask(prev => ({
      ...prev,
      [section]: (prev[section] as any[])?.filter((_, i) => i !== index) || []
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-base-content/40" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-base-200 text-base-content/70';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'tool':
        return <PenTool className="h-4 w-4" />;
      case 'template':
        return <FileText className="h-4 w-4" />;
      case 'guide':
        return <Book className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getSourceTypeStyle = (sourceType: string) => {
    switch (sourceType) {
      case 'ai':
        return 'bg-primary/20 text-primary';
      case 'web':
        return 'bg-success/20 text-success';
      case 'internal':
        return 'bg-secondary/20 text-secondary';
      case 'community':
        return 'bg-accent/20 text-accent';
      case 'expert':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-base-200 text-base-content/70';
    }
  };

  const renderTags = (tags?: string[]) => {
    if (!tags?.length) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-base-200 text-base-content/70"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const renderResourceItem = (resource: any, index: number, section: string) => {
    return (
      <div key={`${resource.title}-${index}`} className="flex items-center justify-between bg-base-100 p-2 rounded border border-base-300">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSourceTypeStyle(resource.source_type)}`}>
              {resource.source_type}
            </span>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary hover:text-primary-focus"
            >
              {getResourceIcon(resource.type)}
              <span className="ml-2">{resource.title}</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          <div className="ml-6">
            <p className="text-xs text-base-content/60">
              {resource.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {resource.tags?.map((tag: string, tagIndex: number) => (
                <span
                  key={`${tag}-${tagIndex}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-base-200 text-base-content/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRegenerateResource(section, index)}
            disabled={isRegenerating === `${section}-${index}`}
            className="text-base-content/40 hover:text-base-content/60 disabled:opacity-50"
          >
            <RotateCw 
              className={`h-4 w-4 ${isRegenerating === `${section}-${index}` ? 'animate-spin' : ''}`} 
            />
          </button>
          <button
            onClick={() => handleRemoveSuggestion(section, index)}
            className="text-base-content/40 hover:text-base-content/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderSuggestionItem = (section: string, item: any, index: number) => {
    // Special handling for resources
    if (section === 'resources') {
      return <div key={`${section}-${item.title}-${index}`}>{renderResourceItem(item, index)}</div>;
    }

    // Regular suggestion items
    const itemValue = typeof item === 'string' ? item : item.title;
    return (
      <div key={`${section}-${index}`} className="flex items-center justify-between p-2 rounded bg-base-100 border border-base-300">
        <div className="flex-1">
          <input
            type="text"
            value={itemValue}
            readOnly
            className="block w-full text-sm text-base-content border-0 focus:ring-0 p-0 bg-transparent"
          />
        </div>
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className="bg-base-100 shadow-md rounded-lg p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content">Title</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="input input-bordered w-full mt-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content">Description</label>
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={3}
              className="textarea textarea-bordered w-full mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-base-content">Priority</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                className="select select-bordered w-full mt-1 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content">Due Date</label>
              <input
                type="date"
                value={editedTask.due_date}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                className="input input-bordered w-full mt-1 text-sm"
              />
            </div>
          </div>

          {/* AI Suggestions Section */}
          <div className="border-t border-base-300 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-base-content">AI Suggestions</h3>
              <button
                onClick={handleGenerateAISuggestions}
                disabled={isGeneratingAI}
                className="btn btn-sm btn-primary"
              >
                {isGeneratingAI ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </button>
            </div>

            {/* Display AI suggestions sections */}
            {editedTask.implementation_tips?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-base-content mb-2">Implementation Tips</h4>
                <ul className="space-y-1">
                  {editedTask.implementation_tips.map((tip, index) => (
                    <li key={index} className="text-sm text-base-content/70 flex items-start">
                      <span className="mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {editedTask.potential_challenges?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-base-content mb-2">Potential Challenges</h4>
                <ul className="space-y-1">
                  {editedTask.potential_challenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-base-content/70 flex items-start">
                      <span className="mr-2">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {editedTask.success_metrics?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-base-content mb-2">Success Metrics</h4>
                <ul className="space-y-1">
                  {editedTask.success_metrics.map((metric, index) => (
                    <li key={index} className="text-sm text-base-content/70 flex items-start">
                      <span className="mr-2">•</span>
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {editedTask.resources?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-base-content mb-2">Resources</h4>
                <div className="space-y-2">
                  {editedTask.resources.map((resource, index) => renderResourceItem(resource, index, 'resources'))}
                </div>
              </div>
            )}

            {editedTask.learning_resources?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-base-content mb-2">Learning Resources</h4>
                <div className="space-y-2">
                  {editedTask.learning_resources.map((resource, index) => renderResourceItem(resource, index, 'learning_resources'))}
                </div>
              </div>
            )}

            {editedTask.tools?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-base-content mb-2">Recommended Tools</h4>
                <div className="space-y-2">
                  {editedTask.tools.map((tool, index) => renderResourceItem(tool, index, 'tools'))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setEditedTask(task);
                setIsEditing(false);
              }}
              className="btn btn-sm btn-outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-sm btn-primary"
            >
              {suggestedTask ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <div>
          <div className="flex items-center justify-between">
            <button
              onClick={onToggleExpand}
              className="flex items-center text-left flex-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-base-content/60" />
              ) : (
                <ChevronRight className="h-5 w-5 text-base-content/60" />
              )}
              <div className="ml-2">
                <p className="text-sm font-medium text-base-content">{task.title}</p>
                {!isExpanded && (
                  <div className="mt-1 flex items-center space-x-4 text-sm text-base-content/70">
                    <span>Type: {task.task_type}</span>
                    <span>•</span>
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </button>

            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {suggestedTask && onAddTask && (
                <button
                  onClick={() => onAddTask(task)}
                  className="btn btn-xs btn-primary"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-base-content/40 hover:text-base-content/60"
              >
                <Edit className="h-4 w-4" />
              </button>
              {!suggestedTask && onRemoveTask && (
                <button
                  onClick={() => onRemoveTask(task)}
                  className="p-1 text-base-content/40 hover:text-base-content/60"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {!suggestedTask && getStatusIcon(task.status)}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 ml-7 space-y-4">
              <div>
                <p className="text-sm text-base-content">{task.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-base-content/70">
                  <span>Type: {task.task_type}</span>
                  <span>•</span>
                  <span>Category: {task.category}</span>
                  <span>•</span>
                  <span>Estimated: {task.estimated_hours}h</span>
                  <span>•</span>
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Implementation Tips */}
              {task.implementation_tips?.length > 0 && (
                <div>
                  <button
                    onClick={() => onToggleSection('tips')}
                    className="flex items-center text-sm font-medium text-base-content"
                  >
                    <Lightbulb className="h-4 w-4 mr-2 text-base-content/60" />
                    Implementation Tips
                    {expandedSections['tips'] ? (
                      <ChevronDown className="h-4 w-4 ml-2 text-base-content/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2 text-base-content/60" />
                    )}
                  </button>
                  {expandedSections['tips'] && (
                    <ul className="mt-2 space-y-1 ml-6">
                      {task.implementation_tips.map((tip, index) => (
                        <li key={index} className="text-sm text-base-content/70">• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Resources */}
              {task.resources?.length > 0 && (
                <div>
                  <button
                    onClick={() => onToggleSection('resources')}
                    className="flex items-center text-sm font-medium text-base-content"
                  >
                    <Book className="h-4 w-4 mr-2 text-base-content/60" />
                    Helpful Resources
                    {expandedSections['resources'] ? (
                      <ChevronDown className="h-4 w-4 ml-2 text-base-content/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2 text-base-content/60" />
                    )}
                  </button>
                  {expandedSections['resources'] && (
                    <div className="mt-2 space-y-2 ml-6">
                      {task.resources.map((resource, index) => renderResourceItem(resource, index, 'resources'))}
                    </div>
                  )}
                </div>
              )}

              {/* Learning Resources */}
              {task.learning_resources?.length > 0 && (
                <div>
                  <button
                    onClick={() => onToggleSection('learning')}
                    className="flex items-center text-sm font-medium text-base-content"
                  >
                    <Book className="h-4 w-4 mr-2 text-base-content/60" />
                    Learning Resources
                    {expandedSections['learning'] ? (
                      <ChevronDown className="h-4 w-4 ml-2 text-base-content/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2 text-base-content/60" />
                    )}
                  </button>
                  {expandedSections['learning'] && (
                    <div className="mt-2 space-y-3 ml-6">
                      {task.learning_resources.map((resource, index) => renderResourceItem(resource, index, 'learning_resources'))}
                    </div>
                  )}
                </div>
              )}

              {/* Tools */}
              {task.tools?.length > 0 && (
                <div>
                  <button
                    onClick={() => onToggleSection('tools')}
                    className="flex items-center text-sm font-medium text-base-content"
                  >
                    <Tool className="h-4 w-4 mr-2 text-base-content/60" />
                    Recommended Tools
                    {expandedSections['tools'] ? (
                      <ChevronDown className="h-4 w-4 ml-2 text-base-content/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2 text-base-content/60" />
                    )}
                  </button>
                  {expandedSections['tools'] && (
                    <div className="mt-2 space-y-3 ml-6">
                      {task.tools.map((tool, index) => renderResourceItem(tool, index, 'tools'))}
                    </div>
                  )}
                </div>
              )}

              {/* Status Control */}
              {!suggestedTask && onUpdateTask && (
                <div className="border-t border-base-300 pt-4">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Task['status'] })}
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
