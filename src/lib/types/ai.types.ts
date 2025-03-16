export interface AIResponse {
  feedback: {
    strengths: string[];
    areas_for_improvement: string[];
    opportunities: string[];
    risks: string[];
    strategic_recommendations: string[];
  };
  follow_up_questions: string[];
  tasks: AITask[];
}

export interface AITask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
  task_type: string;
  implementation_tips: string[];
  potential_challenges: string[];
  success_metrics: string[];
  resources: AIResource[];
  learning_resources: AILearningResource[];
  tools: AITool[];
}

export interface AIResource {
  title: string;
  url: string;
  type: string;
  description: string;
  source_type: 'ai';
}

export interface AILearningResource {
  title: string;
  url: string;
  type: string;
  platform: string;
  description: string;
  source_type: 'ai';
}

export interface AITool {
  name: string;
  url: string;
  category: string;
  description: string;
  source_type: 'ai';
}