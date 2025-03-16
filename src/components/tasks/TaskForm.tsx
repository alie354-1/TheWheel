import React, { useState, useEffect } from 'react';
import { Save, X, Brain, Plus, ExternalLink, Book, PenTool, Video, FileText, RotateCw } from 'lucide-react';
import { aiService } from '../../lib/services/ai.service';
import type { Task, Resource, LearningResource, Tool } from '../../lib/types/task.types';
import { supabase } from '../../lib/supabase';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const defaultTask: Partial<Task> = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  category: 'personal',
  task_type: 'Other',
  estimated_hours: 1.0,
  due_date: new Date().toISOString().split('T')[0],
  implementation_tips: [],
  potential_challenges: [],
  success_metrics: [],
  resources: [],
  learning_resources: [],
  tools: []
};

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<Partial<Task>>(() => ({
    ...defaultTask,
    ...task,
    implementation_tips: task?.implementation_tips || [],
    potential_challenges: task?.potential_challenges || [],
    success_metrics: task?.success_metrics || [],
    resources: task?.resources || [],
    learning_resources: task?.learning_resources || [],
    tools: task?.tools || []
  }));
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [regeneratingCategory, setRegeneratingCategory] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [sampleResources, setSampleResources] = useState<any[]>([]);

  useEffect(() => {
    loadSampleResources();
  }, []);

  const loadSampleResources = async () => {
    try {
      const { data: resources, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSampleResources(resources || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const generateAISuggestions = async () => {
    if (!formData.title || !formData.description) return;
    setIsGeneratingAI(true);

    try {
      const response = await aiService.generateTasks({
        accomplished: '',
        working_on: formData.description,
        blockers: '',
        goals: formData.title
      });

      if (response.tasks && response.tasks.length > 0) {
        const suggestions = response.tasks[0];
        
        setFormData(prev => ({
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

  const handleRegenerateCategory = async (category: string) => {
    if (!formData.title || !formData.description) return;
    setRegeneratingCategory(category);

    try {
      const response = await aiService.generateTasks({
        accomplished: '',
        working_on: formData.description,
        blockers: '',
        goals: formData.title
      });

      if (response.tasks && response.tasks.length > 0) {
        const suggestions = response.tasks[0];
        setFormData(prev => ({
          ...prev,
          [category]: suggestions[category] || []
        }));
      }
    } catch (error) {
      console.error('Error regenerating category:', error);
    } finally {
      setRegeneratingCategory(null);
    }
  };

  const handleUpdateSuggestion = (category: string, index: number, updates: any) => {
    setFormData(prev => {
      const items = [...(prev[category] as any[])];
      items[index] = typeof updates === 'string' 
        ? updates
        : { ...items[index], ...updates };
      return { ...prev, [category]: items };
    });
  };

  const handleRemoveSuggestion = (category: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] as any[])?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddTag = (section: string, index: number, tag: string) => {
    if (!tag.trim()) return;
    
    setFormData(prev => {
      const items = [...(prev[section] as any[])];
      const item = items[index];
      
      if (!item.tags) {
        item.tags = [];
      }
      
      if (!item.tags.includes(tag.trim())) {
        item.tags = [...item.tags, tag.trim()];
      }
      
      items[index] = item;
      return { ...prev, [section]: items };
    });
  };

  const handleRemoveTag = (section: string, itemIndex: number, tagIndex: number) => {
    setFormData(prev => {
      const items = [...(prev[section] as any[])];
      const item = items[itemIndex];
      
      item.tags = item.tags.filter((_: string, i: number) => i !== tagIndex);
      items[itemIndex] = item;
      
      return { ...prev, [section]: items };
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
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
        return 'bg-blue-100 text-blue-800';
      case 'web':
        return 'bg-green-100 text-green-800';
      case 'internal':
        return 'bg-purple-100 text-purple-800';
      case 'community':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderResourceItem = (resource: any, index: number) => {
    return (
      <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSourceTypeStyle(resource.source_type)}`}>
              {resource.source_type}
            </span>
            <div className="flex items-center">
              {getResourceIcon(resource.type)}
              <input
                type="text"
                value={resource.title}
                onChange={(e) => handleUpdateSuggestion('resources', index, { ...resource, title: e.target.value })}
                className="ml-2 text-sm text-gray-900 border-0 focus:ring-0 w-full"
                placeholder="Resource title"
              />
            </div>
          </div>
          
          <input
            type="url"
            value={resource.url}
            onChange={(e) => handleUpdateSuggestion('resources', index, { ...resource, url: e.target.value })}
            className="text-sm text-gray-600 border-0 focus:ring-0 w-full"
            placeholder="Resource URL"
          />
          
          <input
            type="text"
            value={resource.description}
            onChange={(e) => handleUpdateSuggestion('resources', index, { ...resource, description: e.target.value })}
            className="text-sm text-gray-600 border-0 focus:ring-0 w-full"
            placeholder="Resource description"
          />
          
          <div className="flex flex-wrap gap-2">
            {resource.tags?.map((tag: string, tagIndex: number) => (
              <span
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag('resources', index, tagIndex)}
                  className="ml-1 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tag..."
              className="text-xs border-0 focus:ring-0 w-24"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('resources', index, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRegenerateCategory('resources')}
            disabled={isRegenerating === 'resources'}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <RotateCw 
              className={`h-4 w-4 ${isRegenerating === 'resources' ? 'animate-spin' : ''}`} 
            />
          </button>
          <button
            onClick={() => handleRemoveSuggestion('resources', index)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderSuggestionItem = (section: string, item: any, index: number) => {
    if (section === 'resources') {
      return renderResourceItem(item, index);
    }

    return (
      <div className="flex items-center justify-between p-2 rounded bg-white border border-gray-200">
        <div className="flex-1">
          <input
            type="text"
            value={typeof item === 'string' ? item : item.title}
            onChange={(e) => handleUpdateSuggestion(section, index, e.target.value)}
            className="block w-full text-sm text-gray-900 border-0 focus:ring-0 p-0"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRemoveSuggestion(section, index)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      ...formData,
      status: task?.status || 'pending',
      implementation_tips: formData.implementation_tips?.length ? formData.implementation_tips : undefined,
      potential_challenges: formData.potential_challenges?.length ? formData.potential_challenges : undefined,
      success_metrics: formData.success_metrics?.length ? formData.success_metrics : undefined,
      resources: formData.resources?.length ? formData.resources : undefined,
      learning_resources: formData.learning_resources?.length ? formData.learning_resources : undefined,
      tools: formData.tools?.length ? formData.tools : undefined
    };
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="task_type" className="block text-sm font-medium text-gray-700">
              Task Type
            </label>
            <select
              id="task_type"
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Feature Development">Feature Development</option>
              <option value="Bug Fix">Bug Fix</option>
              <option value="Documentation">Documentation</option>
              <option value="Research">Research</option>
              <option value="Design">Design</option>
              <option value="Planning">Planning</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Testing">Testing</option>
              <option value="Analytics">Analytics</option>
              <option value="Process Improvement">Process Improvement</option>
              <option value="Team Coordination">Team Coordination</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimated_hours"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
              min="0.5"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Task Details & AI Suggestions</h3>
            <button
              type="button"
              onClick={generateAISuggestions}
              disabled={isGeneratingAI || !formData.title || !formData.description}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate All
                </>
              )}
            </button>
          </div>

          {(formData.implementation_tips?.length || 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Implementation Tips</h4>
                <button
                  onClick={() => handleRegenerateCategory('implementation_tips')}
                  disabled={isRegenerating === 'implementation_tips'}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <RotateCw className={`h-4 w-4 ${isRegenerating === 'implementation_tips' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.implementation_tips.map((tip, index) => (
                  <div key={`tip-${index}`} className="text-sm text-gray-600">
                    {renderSuggestionItem('implementation_tips', tip, index)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(formData.potential_challenges?.length || 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Potential Challenges</h4>
                <button
                  onClick={() => handleRegenerateCategory('potential_challenges')}
                  disabled={isRegenerating === 'potential_challenges'}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <RotateCw className={`h-4 w-4 ${isRegenerating === 'potential_challenges' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.potential_challenges.map((challenge, index) => (
                  <div key={`challenge-${index}`} className="text-sm text-gray-600">
                    {renderSuggestionItem('potential_challenges', challenge, index)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(formData.success_metrics?.length || 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Success Metrics</h4>
                <button
                  onClick={() => handleRegenerateCategory('success_metrics')}
                  disabled={isRegenerating === 'success_metrics'}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <RotateCw className={`h-4 w-4 ${isRegenerating === 'success_metrics' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.success_metrics.map((metric, index) => (
                  <div key={`metric-${index}`} className="text-sm text-gray-600">
                    {renderSuggestionItem('success_metrics', metric, index)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(formData.resources?.length || 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Suggested Resources</h4>
                <button
                  onClick={() => handleRegenerateCategory('resources')}
                  disabled={isRegenerating === 'resources'}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <RotateCw className={`h-4 w-4 ${isRegenerating === 'resources' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.resources.map((resource, index) => (
                  <div key={`resource-${index}`}>
                    {renderSuggestionItem('resources', resource, index)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(formData.learning_resources?.length || 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Learning Resources</h4>
                <button
                  onClick={() => handleRegenerateCategory('learning_resources')}
                  disabled={isRegenerating === 'learning_resources'}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <RotateCw className={`h-4 w-4 ${isRegenerating === 'learning_resources' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.learning_resources.map((resource, index) => (
                  <div key={`learning-${index}`}>
                    {renderSuggestionItem('learning_resources', resource, index)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(formData.tools?.length || 0) > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Recommended Tools</h4>
                <button
                  onClick={() => handleRegenerateCategory('tools')}
                  disabled={isRegenerating === 'tools'}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  <RotateCw className={`h-4 w-4 ${isRegenerating === 'tools' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.tools.map((tool, index) => (
                  <div key={`tool-${index}`}>
                    {renderSuggestionItem('tools', tool, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Task
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
