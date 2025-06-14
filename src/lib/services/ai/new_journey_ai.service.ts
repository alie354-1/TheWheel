import OpenAI from 'openai';
import { 
  NewStepOutcome, 
  NewCompanyJourneyStep, 
  NewStepTask,
  NewSuggestionPriority
} from '../../types/new_journey.types';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

interface AdaptiveSuggestion {
  suggestion: string;
  priority: NewSuggestionPriority;
}

class NewJourneyAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  /**
   * Generates adaptive suggestions based on a step's outcome.
   * @param outcome - The detailed outcome of a completed step.
   * @returns An array of concise, actionable suggestions with priority.
   */
  async generateAdaptiveSuggestions(outcome: NewStepOutcome): Promise<AdaptiveSuggestion[]> {
    // Fetch the step details if needed in a real implementation
    // const step = await getStepDetails(outcome.company_step_id);
    
    const prompt = `
      You are an expert startup advisor providing guidance to a founder.
      The founder has just completed a step in their journey.

      Here are their results:
      - Time taken: ${outcome.time_taken_days || 'unknown'} days.
      - Confidence level (1-5): ${outcome.confidence_level || 'unknown'}.
      - Key Learnings: "${outcome.key_learnings?.join(', ') || 'None provided'}"
      - Task Results: ${JSON.stringify(outcome.task_results, null, 2)}

      Based *only* on these results, generate 3-5 concise, actionable, and forward-looking suggestions for what this founder should focus on next.
      Each suggestion should be a single sentence. Do not number them.
      Frame them as clear next steps.
      
      For each suggestion, also assign a priority level (low, medium, or high) based on its importance.
      Format your response as a JSON array of objects, each with 'suggestion' and 'priority' fields.
      Example: [{"suggestion": "Conduct 5 more customer interviews focusing on pain points.", "priority": "high"}]
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 350,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      try {
        const parsedContent = JSON.parse(content);
        return parsedContent.suggestions || [];
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        // Fallback: Try to extract suggestions manually
        const rawSuggestions = content
          .split('\n')
          .filter(s => s.trim().length > 0 && !s.startsWith('Here are'))
          .map(s => s.replace(/^- /, '').trim());
        
        return rawSuggestions.map(suggestion => ({
          suggestion,
          priority: 'medium' as NewSuggestionPriority
        }));
      }
    } catch (error) {
      console.error('Error generating adaptive suggestions:', error);
      return [];
    }
  }

  /**
   * Analyzes a standup message to identify completed tasks.
   * @param message - The user's standup message.
   * @param tasks - The list of available tasks for the current step.
   * @returns An array of task IDs that were identified as completed.
   */
  async analyzeStandupMessage(message: string, tasks: NewStepTask[]): Promise<string[]> {
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'markTasksAsComplete',
          description: 'Marks one or more tasks as complete based on the user\'s standup message.',
          parameters: {
            type: 'object',
            properties: {
              taskIds: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: tasks.map(t => t.id),
                },
                description: 'The IDs of the tasks to mark as complete.',
              },
            },
            required: ['taskIds'],
          },
        },
      },
    ];

    const prompt = `
      Analyze the following user standup message. Identify which of the available tasks were completed and call the 'markTasksAsComplete' function with the corresponding task IDs.

      User Message: "${message}"
      
      Available Tasks:
      ${tasks.map(t => `- ${t.name} (ID: ${t.id})`).join('\n')}
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an intelligent assistant that helps founders track their progress.' },
          { role: 'user', content: prompt },
        ],
        tools: tools,
        tool_choice: 'auto',
      });

      const toolCalls = response.choices[0]?.message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        try {
          const { taskIds } = JSON.parse(toolCalls[0].function.arguments);
          return taskIds || [];
        } catch (parseError) {
          console.error('Error parsing tool call arguments:', parseError);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error analyzing standup message:', error);
      return [];
    }
  }

  /**
   * Extracts detailed notes from a user message about completed tasks
   * @param message - The user message containing details about task completion
   * @param tasks - Array of tasks that were identified as completed
   * @returns Extracted notes about the completed tasks
   */
  async extractTaskNotesFromMessage(message: string, tasks: NewStepTask[]): Promise<string> {
    if (!message || tasks.length === 0) {
      return '';
    }

    const taskNames = tasks.map(t => t.name).join(', ');
    
    const prompt = `
      Extract relevant notes from this standup message about the following tasks: ${taskNames}
      
      User Message: "${message}"
      
      Extract only the information related to how they completed these tasks, any challenges they faced,
      results they achieved, or insights they gained. Format as a concise, bulleted summary.
      If there are no details about these tasks in the message, respond with "No details provided".
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an assistant that extracts task completion details from messages.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content || 'No details provided';
      return content;
    } catch (error) {
      console.error('Error extracting task notes:', error);
      return 'Error extracting details';
    }
  }

  /**
   * Recommends the next step for a company to focus on.
   * @param companyProgress - An overview of the company's current progress.
   * @returns The ID of the recommended next step.
   */
  async recommendNextStep(companyProgress: any): Promise<string | null> {
    // Placeholder for more complex recommendation logic
    console.log('Generating next step recommendation for:', companyProgress);
    return null;
  }

  /**
   * Enhances standup bot prompts with journey-specific context
   * @param promptText - The original standup prompt
   * @param journeyContext - Context from the journey system
   * @returns Enhanced prompt with journey context
   */
  async enhanceStandupPrompt(promptText: string, journeyContext: string): Promise<string> {
    if (!journeyContext) {
      return promptText;
    }
    
    // Simply append the journey context to the prompt for now
    // In a more sophisticated implementation, we could use OpenAI to intelligently
    // merge the context with the prompt
    return `${promptText}\n\nJourney Context:\n${journeyContext}`;
  }
}

export const newJourneyAIService = new NewJourneyAIService();
