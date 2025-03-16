import React, { createContext, useContext, useState, useCallback } from 'react';
import { generalLLMService } from '../general-llm.service';
import { useAuthStore } from '../../store';
import { StandupEntry, StandupFeedback, StandupTask } from '../standup-ai.service';

interface StandupAIResponse {
  content: string;
  type?: 'feedback' | 'summary' | 'task';
}

interface StandupAIContextType {
  generateSectionFeedback: (
    section: 'accomplished' | 'working_on' | 'blockers' | 'goals',
    currentInput: string,
    currentEntry: StandupEntry
  ) => Promise<StandupFeedback>;
  generateStandupSummary: (entry: StandupEntry) => Promise<any>;
  generateTasks: (entry: StandupEntry) => Promise<StandupTask[]>;
  isLoading: boolean;
}

// Create context with default values
const StandupAIContext = createContext<StandupAIContextType>({
  generateSectionFeedback: async () => ({ content: '', follow_up_questions: [] }),
  generateStandupSummary: async () => ({}),
  generateTasks: async () => [],
  isLoading: false,
});

/**
 * Standup AI Context Provider component
 * Provides AI capabilities specifically for standup functionality
 */
export const StandupAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, featureFlags } = useAuthStore();
  const useMockAI = featureFlags?.useMockAI?.enabled || false;
  const useMultiTieredAI = featureFlags?.useMultiTieredAI?.enabled || false;

  /**
   * Generate feedback for a specific standup section
   */
  const generateSectionFeedback = useCallback(
    async (
      section: 'accomplished' | 'working_on' | 'blockers' | 'goals',
      currentInput: string,
      currentEntry: StandupEntry
    ): Promise<StandupFeedback> => {
      setIsLoading(true);
      try {
        let prompt = '';
        switch (section) {
          case 'accomplished':
            prompt = `You are a cofounder providing feedback on what your partner accomplished: "${currentInput}"`;
            break;
          case 'working_on':
            prompt = `You are a cofounder providing feedback on what your partner is working on: "${currentInput}"`;
            break;
          case 'blockers':
            prompt = `You are a cofounder providing feedback on your partner's blockers: "${currentInput || 'No blockers mentioned'}"`;
            break;
          case 'goals':
            prompt = `You are a cofounder providing feedback on your partner's goals: "${currentInput}"`;
            break;
        }

        // Add context from other sections
        prompt += `\n\nOther standup information:
        Accomplished: ${section !== 'accomplished' ? currentEntry.accomplished || 'None' : 'Current section'}
        Working on: ${section !== 'working_on' ? currentEntry.working_on || 'None' : 'Current section'}
        Blockers: ${section !== 'blockers' ? currentEntry.blockers || 'None' : 'Current section'}
        Goals: ${section !== 'goals' ? currentEntry.goals || 'None' : 'Current section'}`;

        // Add instructions for response format
        prompt += `\n\nProvide a brief, supportive response (1-2 sentences) and include 1-2 follow-up questions that would help your cofounder think more deeply about their work.`;

        const response = await generalLLMService.query(prompt, {
          userId: user?.id || 'anonymous',
          useCompanyModel: false,
          useAbstraction: false,
          useExistingModels: true,
          context: `standup_${section}`
        });

        // Extract content and follow-up questions
        const content = response.content || '';
        
        // Try to extract follow-up questions
        const followUpQuestions: string[] = [];
        
        // Look for questions at the end of the content
        const sentences = content.split(/(?<=[.!?])\s+/);
        for (const sentence of sentences) {
          if (sentence.trim().endsWith('?')) {
            followUpQuestions.push(sentence.trim());
          }
        }

        return {
          content: followUpQuestions.reduce((text, q) => text.replace(q, ''), content).trim(),
          follow_up_questions: followUpQuestions
        };
      } catch (error) {
        console.error('Error generating section feedback:', error);
        return {
          content: `I've noted your update on ${section}. Let's discuss this further as we continue.`,
          follow_up_questions: ['Could you elaborate more on this?']
        };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, useMockAI]
  );

  /**
   * Generate a summary of the entire standup
   */
  const generateStandupSummary = useCallback(async (entry: StandupEntry): Promise<any> => {
    setIsLoading(true);
    try {
      const prompt = `You are a cofounder providing a summary of your partner's standup:

Accomplished: ${entry.accomplished || 'None'}
Working on: ${entry.working_on || 'None'}
Blockers: ${entry.blockers || 'None'}
Goals: ${entry.goals || 'None'}

Provide a summary in JSON format with the following structure:
\`\`\`json
{
  "summary": "1-2 sentence assessment that's clear and insightful",
  "strengths": ["One specific strength with constructive context"],
  "areas_for_improvement": ["One clear improvement area with helpful framing"],
  "opportunities": ["One specific opportunity that builds on their work"],
  "risks": ["One potential risk to be aware of"],
  "strategic_recommendations": ["One actionable recommendation"]
}
\`\`\``;

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: 'standup_summary'
      });

      // Try to extract JSON if it exists
      const content = response.content || '';
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          return {
            content: parsedData.summary || content,
            strengths: parsedData.strengths || [],
            areas_for_improvement: parsedData.areas_for_improvement || [],
            opportunities: parsedData.opportunities || [],
            risks: parsedData.risks || [],
            strategic_recommendations: parsedData.strategic_recommendations || []
          };
        } catch (parseError) {
          console.error('Error parsing JSON from summary:', parseError);
        }
      }
      
      // Fallback if JSON parsing fails
      return {
        content,
        strengths: [],
        areas_for_improvement: [],
        opportunities: [],
        risks: [],
        strategic_recommendations: []
      };
    } catch (error) {
      console.error('Error generating standup summary:', error);
      // Fallback
      return {
        content: 'Based on your standup, you seem to be making progress. Keep up the good work!',
        strengths: ['Consistent reporting'],
        areas_for_improvement: [],
        opportunities: [],
        risks: [],
        strategic_recommendations: ['Continue with your current approach']
      };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, useMockAI]);

  /**
   * Generate tasks based on the standup
   */
  const generateTasks = useCallback(async (entry: StandupEntry): Promise<StandupTask[]> => {
    setIsLoading(true);
    try {
      const prompt = `You are a cofounder suggesting tasks based on your partner's standup:

Accomplished: ${entry.accomplished || 'None'}
Working on: ${entry.working_on || 'None'}
Blockers: ${entry.blockers || 'None'}
Goals: ${entry.goals || 'None'}

Suggest 2 important tasks in JSON format:
\`\`\`json
[
  {
    "title": "Clear action-oriented task title",
    "description": "One concise sentence explaining the task",
    "priority": "high|medium|low",
    "estimated_hours": 2,
    "task_type": "Research|Planning|Development",
    "implementation_tips": ["One practical tip for effective implementation"],
    "potential_challenges": ["One specific challenge to be aware of"],
    "success_metrics": ["One clear way to measure success"],
    "resources": []
  }
]
\`\`\``;

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: 'standup_tasks'
      });

      // Try to extract JSON if it exists
      const content = response.content || '';
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\[\s*{[\s\S]*}\s*\]/);
                        
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          
          // Ensure the response is an array
          const tasksArray = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          // Map and validate each task
          return tasksArray.map(task => ({
            id: Math.random().toString(36).substring(2, 15), // Simple ID generation
            title: task.title || 'Untitled Task',
            description: task.description || '',
            priority: validatePriority(task.priority),
            status: 'pending' as const, // Set default status
            estimated_hours: Number(task.estimated_hours) || 1,
            task_type: task.task_type || 'Other',
            implementation_tips: Array.isArray(task.implementation_tips) ? task.implementation_tips : [],
            potential_challenges: Array.isArray(task.potential_challenges) ? task.potential_challenges : [],
            success_metrics: Array.isArray(task.success_metrics) ? task.success_metrics : [],
            resources: Array.isArray(task.resources) ? task.resources : [],
            learning_resources: Array.isArray(task.learning_resources) ? task.learning_resources : [],
            tools: Array.isArray(task.tools) ? task.tools : []
          }));
        } catch (parseError) {
          console.error('Error parsing JSON from tasks:', parseError);
          // Fallback if JSON parsing fails
          return getFallbackTasks();
        }
      }
      
      // Fallback if JSON extraction fails
      return getFallbackTasks();
    } catch (error) {
      console.error('Error generating tasks:', error);
      // Fallback
      return getFallbackTasks();
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, useMockAI]);

  // Helper function to validate priority
  const validatePriority = (priority: string): 'low' | 'medium' | 'high' => {
    const normalized = priority?.toLowerCase();
    if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
      return normalized as 'low' | 'medium' | 'high';
    }
    return 'medium'; // Default
  };

  // Helper function to get fallback tasks
  const getFallbackTasks = (): StandupTask[] => {
    return [{
      id: Math.random().toString(36).substring(2, 15),
      title: 'Follow up on standup items',
      description: 'Review and act on the items discussed in your standup.',
      priority: 'medium',
      status: 'pending' as const,
      estimated_hours: 1,
      task_type: 'Follow-up',
      implementation_tips: ['Break down into smaller tasks if needed'],
      potential_challenges: ['Time constraints'],
      success_metrics: ['All items addressed'],
      resources: [],
      learning_resources: [],
      tools: []
    }];
  };

  const contextValue: StandupAIContextType = {
    generateSectionFeedback,
    generateStandupSummary,
    generateTasks,
    isLoading
  };

  return (
    <StandupAIContext.Provider value={contextValue}>
      {children}
    </StandupAIContext.Provider>
  );
};

/**
 * Custom hook to use the Standup AI context
 */
export const useStandupAIContext = () => {
  const context = useContext(StandupAIContext);
  if (!context) {
    throw new Error('useStandupAIContext must be used within a StandupAIProvider');
  }
  return context;
};
