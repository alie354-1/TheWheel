import { GeneralLLMService, QueryContext } from './general-llm.service';
import { CompanyModelService } from './company-model.service';
import { conversationMemoryService, StandupMemory } from './conversation-memory.service';
import { v4 as uuidv4 } from 'uuid';
import { ideaMemoryService } from './idea-memory.service';
import { featureFlagsService } from './feature-flags.service';
import { useAuthStore } from '../store';
// Import services after all interfaces are defined to avoid circular dependencies

export interface StandupEntry {
  accomplished: string;
  working_on: string;
  blockers: string;
  goals: string;
  answers?: Record<string, string> | null; // Made optional with ? to handle missing column or null values
}

export interface StandupFeedback {
  content: string;
  follow_up_questions?: string[];
}

export interface StandupSummary {
  content: string;
  strengths: string[];
  areas_for_improvement: string[];
  opportunities: string[];
  risks: string[];
  strategic_recommendations: string[];
}

export interface SectionConversation {
  messages: Array<{role: 'user' | 'assistant', content: string}>;
}

export interface StandupTask {
  id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
  estimated_hours: number;
  task_type: string;
  implementation_tips: string[];
  potential_challenges: string[];
  success_metrics: string[];
  resources: {
    title: string;
    url: string;
    type: string;
    description: string;
  }[];
  learning_resources: {
    title: string;
    url: string;
    type: string;
    platform: string;
    description: string;
  }[];
  tools: {
    name: string;
    url: string;
    category: string;
    description: string;
  }[];
}

export class StandupAIService {
  // Static property to store asked questions and prevent repetition
  private static askedQuestions: Map<string, Set<string>> = new Map();
  
  constructor(
    private generalLLMService: GeneralLLMService = generalLLMService,
    private companyModelService: CompanyModelService = companyModelService
  ) {}
  
  // New method to get section conversation from answers or create a new one
  private getSectionConversation(
    currentEntry: StandupEntry,
    section: 'accomplished' | 'working_on' | 'blockers' | 'goals'
  ): SectionConversation {
    // Check if we have existing conversation in answers
    if (currentEntry.answers && currentEntry.answers[`${section}_conversation`]) {
      try {
        return JSON.parse(currentEntry.answers[`${section}_conversation`]);
      } catch (e) {
        console.error('Error parsing section conversation:', e);
      }
    }
    
    // Return empty conversation if none exists or parsing failed
    return { messages: [] };
  }
  
  // Helper method to track questions for a user
  private trackQuestion(userId: string, question: string): void {
    if (!StandupAIService.askedQuestions.has(userId)) {
      StandupAIService.askedQuestions.set(userId, new Set());
    }
    StandupAIService.askedQuestions.get(userId)?.add(question.toLowerCase().trim());
  }
  
  // Helper method to check if a question has been asked before
  private hasAskedQuestion(userId: string, question: string): boolean {
    const userQuestions = StandupAIService.askedQuestions.get(userId);
    if (!userQuestions) return false;
    
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Check for exact matches
    if (userQuestions.has(normalizedQuestion)) return true;
    
    // Check for similar questions (80% similarity)
    for (const asked of userQuestions) {
      if (this.calculateSimilarity(normalizedQuestion, asked) > 0.8) {
        return true;
      }
    }
    
    return false;
  }
  
  // Helper method to calculate similarity between two strings
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Count matching characters
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++;
      }
    }
    
    return matches / longer.length;
  }
  
  // Helper method to check feature flags and reset LLM service if needed
  private checkAndResetLLMService(): void {
    try {
      // Don't reset the LLM service - this is causing issues
      // featureFlagsService.resetLLMService();
      
      // Log the current feature flags state
      const { featureFlags } = useAuthStore.getState();
      console.log('Current feature flags state:', {
        useRealAI: featureFlags.useRealAI?.enabled,
        useMockAI: featureFlags.useMockAI?.enabled,
        useMultiTieredAI: featureFlags.useMultiTieredAI?.enabled
      });
    } catch (error) {
      console.error('Error checking feature flags:', error);
    }
  }
  
  async generateSectionFeedback(
    section: 'accomplished' | 'working_on' | 'blockers' | 'goals',
    currentInput: string,
    currentEntry: StandupEntry,
    context: QueryContext
  ): Promise<StandupFeedback> {
    // Check LLM service feature flags without resetting
    this.checkAndResetLLMService();
    try {
      // Check if enhanced idea generation is enabled but don't wait on it
      ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', context.userId, 'standup');
      
      // Get standup memory for context
      const standupMemory = await conversationMemoryService.getStandupMemory(context.userId);
      
      // Get section conversation history
      const sectionConversation = this.getSectionConversation(currentEntry, section);
      
      // Add current input to conversation history
      sectionConversation.messages.push({ role: 'user', content: currentInput });
      
      // Create section-specific prompt with memory context
      const promptText = this.createSectionPrompt(section, currentInput, currentEntry, standupMemory);
      
      try {
        // Prepare conversation history for LLM
        const conversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
        
        // If this is the first message in the conversation, add the prompt as system's first message
        if (sectionConversation.messages.length <= 1) {
          conversationHistory.push({ role: 'system', content: promptText });
          conversationHistory.push({ role: 'user', content: currentInput });
        } else {
          // Add all previous messages in the conversation
          // First message is system prompt
          conversationHistory.push({ role: 'system', content: promptText });
          
          // Add the conversation history (skipping the current user message which was just added)
          const previousMessages = sectionConversation.messages.slice(0, -1);
          previousMessages.forEach(message => {
            conversationHistory.push({ 
              role: message.role as 'user' | 'assistant', 
              content: message.content 
            });
          });
          
          // Add the current message
          conversationHistory.push({ role: 'user', content: currentInput });
        }
        
        // Add conversation history to context
        const contextWithHistory: QueryContext = {
          ...context,
          conversationHistory: conversationHistory
        };
        
        // Get response using all three sources with conversation history
        const response = await this.generalLLMService.query('', contextWithHistory);
        
        // Parse the response
        const content = response.content || '';
        
        // Add assistant response to conversation history
        sectionConversation.messages.push({ role: 'assistant', content });
        
        // Update the section conversation in the answers field
        if (!currentEntry.answers) {
          currentEntry.answers = {};
        }
        currentEntry.answers[`${section}_conversation`] = JSON.stringify(sectionConversation);
        
        // Extract follow-up questions
        let followUpQuestions = this.extractFollowUpQuestions(content);
        
        // Filter out questions that have already been asked
        followUpQuestions = followUpQuestions.filter(question => 
          !this.hasAskedQuestion(context.userId, question)
        );
        
        // If we have no new questions, generate a fallback question
        if (followUpQuestions.length === 0) {
          const fallbackQuestions = [
            `What's your next step with this?`,
            `How will you measure success here?`,
            `What resources do you need to move forward?`,
            `Have you considered alternative approaches?`,
            `What's the biggest risk you see?`,
            `How does this align with your overall goals?`,
            `What's the timeline for this?`,
            `Who else needs to be involved?`,
            `What would make this even more effective?`,
            `How will this impact your users/customers?`
          ];
          
          // Pick a random fallback question that hasn't been asked before
          for (const question of fallbackQuestions) {
            if (!this.hasAskedQuestion(context.userId, question)) {
              followUpQuestions = [question];
              break;
            }
          }
          
          // If all fallback questions have been asked, just use the first one
          if (followUpQuestions.length === 0) {
            followUpQuestions = [fallbackQuestions[0]];
          }
        }
        
        // Track the questions we're asking
        followUpQuestions.forEach(question => 
          this.trackQuestion(context.userId, question)
        );
        
        // Always remove the follow-up questions from the content to avoid duplication
        let cleanedContent = content;
        
        // If we found questions using the old format with a label, remove that section
        if (content.includes('Follow-up questions:')) {
          cleanedContent = content.replace(/Follow-up questions:[\s\S]*$/, '').trim();
        } else if (followUpQuestions.length > 0) {
          // For the new format, remove the questions from the end of the content
          // This prevents the same question from appearing twice
          followUpQuestions.forEach(question => {
            cleanedContent = cleanedContent.replace(question, '').trim();
          });
          
          // Clean up any trailing punctuation
          cleanedContent = cleanedContent.replace(/[.!?]\s*$/, '').trim();
          if (cleanedContent.length > 0 && !cleanedContent.match(/[.!?]$/)) {
            cleanedContent += '.';
          }
        }
        
        return {
          content: cleanedContent,
          follow_up_questions: followUpQuestions
        };
      } catch (llmError) {
        console.error('LLM service error:', llmError);
        // Fallback to a generic response
        return {
          content: `I've noted your update on ${section}. Let's discuss this further as we continue.`,
          follow_up_questions: ['Could you elaborate more on this?']
        };
      }
    } catch (error) {
      console.error('Error generating section feedback:', error);
      // Fallback to a generic response
      return {
        content: `I've noted your update on ${section}. Let's discuss this further as we continue.`,
        follow_up_questions: ['Could you elaborate more on this?']
      };
    }
  }
  
  async generateStandupSummary(entry: StandupEntry, context: QueryContext): Promise<StandupSummary> {
    // Check LLM service feature flags without resetting
    this.checkAndResetLLMService();
    try {
      // Check if enhanced idea generation is enabled but don't wait on it
      ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', context.userId, 'standup');
      
      // Get standup memory for context
      const standupMemory = await conversationMemoryService.getStandupMemory(context.userId);
      
      const prompt = this.createSummaryPrompt(entry, standupMemory);
      
      try {
        // Get response using all three sources
        const response = await this.generalLLMService.query(prompt, context);
        
        // Parse the JSON response
        const content = response.content || '';
        
        // Try to extract JSON if it exists
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
      } catch (llmError) {
        console.error('LLM service error in summary generation:', llmError);
        // Fallback
        return {
          content: 'Based on your standup, you seem to be making progress. Keep up the good work!',
          strengths: ['Consistent reporting'],
          areas_for_improvement: [],
          opportunities: [],
          risks: [],
          strategic_recommendations: ['Continue with your current approach']
        };
      }
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
    }
  }
  
  async generateTasks(entry: StandupEntry, userId: string, context: QueryContext): Promise<StandupTask[]> {
    // Check LLM service feature flags without resetting
    this.checkAndResetLLMService();
    try {
      // Check if enhanced idea generation is enabled but don't wait on it
      ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', context.userId, 'standup');
      
      // Get standup memory for context
      const standupMemory = await conversationMemoryService.getStandupMemory(context.userId);
      
      const prompt = this.createTasksPrompt(entry, standupMemory);
      
      try {
        // Get response using all three sources
        const response = await this.generalLLMService.query(prompt, context);
        
        // Parse the JSON response
        const content = response.content || '';
        
        // Try to extract JSON if it exists
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/\[\s*{[\s\S]*}\s*\]/);
                          
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            
            // Ensure the response is an array
            const tasksArray = Array.isArray(parsedData) ? parsedData : [parsedData];
            
            // Map and validate each task
            return tasksArray.map(task => ({
              id: uuidv4(), // Generate a unique ID for each task
              title: task.title || 'Untitled Task',
              description: task.description || '',
              priority: this.validatePriority(task.priority),
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
            return this.getFallbackTasks();
          }
        }
        
        // Fallback if JSON extraction fails
        return this.getFallbackTasks();
      } catch (llmError) {
        console.error('LLM service error in task generation:', llmError);
        // Fallback
        return this.getFallbackTasks();
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      // Fallback
      return this.getFallbackTasks();
    }
  }
  
  // Helper method to get fallback tasks
  private getFallbackTasks(): StandupTask[] {
    return [{
      id: uuidv4(),
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
  }
  
  private createSectionPrompt(
    section: 'accomplished' | 'working_on' | 'blockers' | 'goals', 
    currentInput: string, 
    currentEntry: StandupEntry,
    standupMemory?: StandupMemory
  ): string {
    // Determine startup stage - if no entries or memory, assume idea stage
    const hasNoEntries = !currentEntry.accomplished && !currentEntry.working_on && !currentEntry.goals;
    const hasNoMemory = !standupMemory || !standupMemory.lastStandup;
    const isIdeaStage = hasNoEntries && hasNoMemory;
    const isEarlyStage = hasNoEntries || (standupMemory?.recentStandups?.length || 0) < 3;
    
    // Section-specific prompting with more context and personality
    let sectionPrompt = '';
    switch(section) {
      case 'accomplished':
        sectionPrompt = `Your cofounder said: "${currentInput}"`;
        break;
      
      case 'working_on':
        sectionPrompt = `Your cofounder is working on: "${currentInput}"`;
        break;
      
      case 'blockers':
        sectionPrompt = `Your cofounder's blockers: "${currentInput || 'No blockers mentioned'}"`;
        break;
      
      case 'goals':
        sectionPrompt = `Your cofounder's goals: "${currentInput}"`;
        break;
    }
    
    // Add context from previous standups if available
    let memoryContext = '';
    
    if (standupMemory?.lastStandup) {
      const lastStandup = standupMemory.lastStandup;
      
      // Add relevant context based on the section
      switch(section) {
        case 'accomplished':
          if (lastStandup.working_on) {
            memoryContext = `\nPreviously working on: "${lastStandup.working_on}"\n`;
          }
          break;
        
        case 'working_on':
          if (lastStandup.goals) {
            memoryContext = `\nPrevious goals: "${lastStandup.goals}"\n`;
          }
          break;
        
        case 'blockers':
          if (lastStandup.blockers) {
            memoryContext = `\nPrevious blockers: "${lastStandup.blockers}"\n`;
          }
          break;
        
        case 'goals':
          if (lastStandup.working_on) {
            memoryContext = `\nCurrently working on: "${lastStandup.working_on}"\n`;
          }
          break;
      }
    }
    
    // Determine next section for navigation prompt
    let nextSection = '';
    switch(section) {
      case 'accomplished':
        nextSection = 'working on';
        break;
      case 'working_on':
        nextSection = 'blockers';
        break;
      case 'blockers':
        nextSection = 'goals';
        break;
      case 'goals':
        nextSection = 'summary';
        break;
    }
    
    // Idea stage specific guidance
    let stageGuidance = '';
    if (isIdeaStage) {
      stageGuidance = `This user is at the IDEA STAGE - they likely don't have a company yet. Focus on:
- Idea validation
- Problem definition
- Customer discovery
- Market research
- MVP planning
- Founder fundamentals`;
    } else if (isEarlyStage) {
      stageGuidance = `Early-stage startup - focus on validation and learning.`;
    } else {
      stageGuidance = `Growing startup - focus on scaling and optimization.`;
    }

    // Final prompt with instructions for a direct but supportive cofounder-like response
    return `${sectionPrompt}
    
${memoryContext}

You're a cofounder with real startup experience. Be direct but supportive.

${stageGuidance}

- Maintain a coherent conversation by remembering previous exchanges
- Refer back to what was discussed earlier in this conversation when relevant
- Show continuity of thought from one message to the next
- Be clear and concise - like a real cofounder would be
- Use a mix of short and medium-length sentences
- Get to the point but maintain a supportive tone
- 1-2 sentences is ideal for most responses
- End with 1 thoughtful question that:
  * Relates directly to what they shared
  * Addresses important founder considerations
  * Encourages deeper thinking
  * Is specific and contextual, not generic
  * NEVER repeats previous questions
  * Shows real startup insight
  * For idea stage, focus on validation and customer discovery
- Every 4-5 exchanges, ask if they want to move to the next section ("${nextSection}")
- If they say yes to moving to the next section, acknowledge and proceed

The user can still use the continue button, but also offer the option to move forward verbally.`;
  }
  
  private createSummaryPrompt(entry: StandupEntry, standupMemory?: StandupMemory): string {
    // Determine startup stage
    const hasNoEntries = !entry.accomplished && !entry.working_on && !entry.goals;
    const hasNoMemory = !standupMemory || !standupMemory.lastStandup;
    const isIdeaStage = hasNoEntries && hasNoMemory;
    const isEarlyStage = hasNoEntries || (standupMemory?.recentStandups?.length || 0) < 3;
    
    // Add context from previous standups if available
    let memoryContext = '';
    if (standupMemory?.progressSummary) {
      memoryContext = `\n${standupMemory.progressSummary}\n`;
    }
    
    if (standupMemory?.recentStandups && standupMemory.recentStandups.length > 1) {
      const previousStandup = standupMemory.recentStandups[1]; // Get the second most recent standup
      memoryContext += `\nPrevious standup:
Accomplished: ${previousStandup.accomplished || 'None'}
Working on: ${previousStandup.working_on || 'None'}
Blockers: ${previousStandup.blockers || 'None'}
Goals: ${previousStandup.goals || 'None'}\n`;
    }
    
    // Stage-specific guidance
    let stageGuidance = '';
    if (isIdeaStage) {
      stageGuidance = `This user is at the IDEA STAGE - they likely don't have a company yet.`;
    } else if (isEarlyStage) {
      stageGuidance = `This is an early-stage startup - focus on validation and learning.`;
    } else {
      stageGuidance = `This is a growing startup - focus on scaling and optimization.`;
    }
    
    return `Your cofounder's standup:

Accomplished: ${entry.accomplished || 'None'}
Working on: ${entry.working_on || 'None'}
Blockers: ${entry.blockers || 'None'}
Goals: ${entry.goals || 'None'}

${memoryContext}

You're a cofounder with real startup experience. Be direct but supportive.
${stageGuidance}

Format as JSON:
\`\`\`json
{
  "summary": "1-2 sentence assessment that's clear and insightful",
  "strengths": ["One specific strength with constructive context"],
  "areas_for_improvement": ["One clear improvement area with helpful framing"],
  "opportunities": ["One specific opportunity that builds on their work"],
  "risks": ["One potential risk to be aware of"],
  "strategic_recommendations": ["One actionable recommendation"]
}
\`\`\`

Be clear and concise but maintain a supportive tone. Focus on being helpful and insightful while still being direct. Balance honesty with encouragement.`;
  }
  
  private createTasksPrompt(entry: StandupEntry, standupMemory?: StandupMemory): string {
    // Determine startup stage
    const hasNoEntries = !entry.accomplished && !entry.working_on && !entry.goals;
    const hasNoMemory = !standupMemory || !standupMemory.lastStandup;
    const isIdeaStage = hasNoEntries && hasNoMemory;
    const isEarlyStage = hasNoEntries || (standupMemory?.recentStandups?.length || 0) < 3;
    
    // Add context from previous standups if available
    let memoryContext = '';
    if (standupMemory?.progressSummary) {
      memoryContext = `\n${standupMemory.progressSummary}\n`;
    }
    
    // Add information about incomplete tasks from previous standups
    if (standupMemory?.lastStandup) {
      const lastStandup = standupMemory.lastStandup;
      
      if (lastStandup.working_on) {
        memoryContext += `\nPreviously working on: "${lastStandup.working_on}"\n`;
      }
      
      if (lastStandup.blockers) {
        memoryContext += `\nPrevious blockers: "${lastStandup.blockers}"\n`;
      }
    }
    
    // Stage-specific guidance
    let stageGuidance = '';
    if (isIdeaStage) {
      stageGuidance = `This user is at the IDEA STAGE - they likely don't have a company yet. Focus on validation tasks.`;
    } else if (isEarlyStage) {
      stageGuidance = `Early-stage startup - focus on validation and learning.`;
    } else {
      stageGuidance = `Growing startup - focus on scaling and optimization.`;
    }
    
    return `Your cofounder's standup:

Accomplished: ${entry.accomplished || 'None'}
Working on: ${entry.working_on || 'None'}
Blockers: ${entry.blockers || 'None'}
Goals: ${entry.goals || 'None'}

${memoryContext}

You're a cofounder with real startup experience. Suggest 2 important tasks that will help move things forward.
${stageGuidance}

Format as JSON:
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
\`\`\`

Be clear and direct but maintain a supportive tone. Focus on tasks that will have the most impact while being realistic about what can be accomplished. Use action verbs and be specific.`;
  }
  
  private extractFollowUpQuestions(content: string): string[] {
    // First try to find questions in the traditional format (for backward compatibility)
    const labeledQuestionsMatch = content.match(/Follow-up questions:([\s\S]*?)(?:$|(?=\n\n))/);
    
    if (labeledQuestionsMatch && labeledQuestionsMatch[1]) {
      // Extract individual questions (assuming they're bullet points or numbered)
      const questions = labeledQuestionsMatch[1]
        .split(/\n+/)
        .map(q => q.trim().replace(/^[•\-\d.)\s]+/, ''))
        .filter(q => q && q.endsWith('?'));
      
      return questions;
    }
    
    // If no labeled questions found, look for questions at the end of the content
    // Split content into sentences
    const sentences = content.split(/(?<=[.!?])\s+/);
    
    // Check the last 1-2 sentences for questions
    const potentialQuestions = sentences.slice(-2);
    const questions = potentialQuestions
      .filter(s => s.trim().endsWith('?'))
      .map(s => s.trim());
    
    return questions;
  }
  
  private validatePriority(priority: string): 'low' | 'medium' | 'high' {
    const normalized = priority?.toLowerCase();
    if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
      return normalized as 'low' | 'medium' | 'high';
    }
    return 'medium'; // Default
  }
}

// Import services after all interfaces and classes are defined to avoid circular dependencies
import { generalLLMService } from './general-llm.service';
import { companyModelService } from './company-model.service';

export const standupAIService = new StandupAIService(generalLLMService, companyModelService);
