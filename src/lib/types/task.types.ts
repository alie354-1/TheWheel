export interface Task {
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
  resources?: Resource[];
  learning_resources?: LearningResource[];
  tools?: Tool[];
}

export interface Resource {
  title: string;
  url: string;
  type: string;
  description: string;
  source_type?: 'ai' | 'web' | 'internal' | 'community' | 'expert';
  tags?: string[];
}

export interface LearningResource {
  title: string;
  url: string;
  type: string;
  platform: string;
  description: string;
  source_type?: 'ai' | 'web' | 'internal' | 'community' | 'expert';
  tags?: string[];
}

export interface Tool {
  name: string;
  url: string;
  category: string;
  description: string;
  source_type?: 'ai' | 'web' | 'internal' | 'community' | 'expert';
  tags?: string[];
}