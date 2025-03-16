import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationMemory {
  id: string;
  user_id: string;
  messages: ConversationMessage[];
  summary?: string;
  topics?: string[];
  last_updated: string;
  created_at: string;
}

export interface StandupMemory {
  lastStandup?: {
    date: string;
    accomplished: string;
    working_on: string;
    blockers: string;
    goals: string;
    answers?: Record<string, string>;
  };
  recentStandups?: Array<{
    date: string;
    accomplished: string;
    working_on: string;
    blockers: string;
    goals: string;
    answers?: Record<string, string>;
  }>;
  progressSummary?: string;
}

class ConversationMemoryService {
  async getMemory(userId: string): Promise<ConversationMemory | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_memories')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching conversation memory:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMemory:', error);
      return null;
    }
  }

  async saveMemory(userId: string, messages: ConversationMessage[], summary?: string, topics?: string[]): Promise<string | null> {
    try {
      const existingMemory = await this.getMemory(userId);
      
      if (existingMemory) {
        // Update existing memory
        const { error } = await supabase
          .from('conversation_memories')
          .update({
            messages,
            summary,
            topics,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingMemory.id);

        if (error) {
          console.error('Error updating conversation memory:', error);
          return null;
        }

        return existingMemory.id;
      } else {
        // Create new memory
        const newMemoryId = uuidv4();
        const { error } = await supabase
          .from('conversation_memories')
          .insert({
            id: newMemoryId,
            user_id: userId,
            messages,
            summary,
            topics,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating conversation memory:', error);
          return null;
        }

        return newMemoryId;
      }
    } catch (error) {
      console.error('Error in saveMemory:', error);
      return null;
    }
  }

  async addMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<boolean> {
    try {
      const memory = await this.getMemory(userId);
      const messages = memory?.messages || [];
      
      const newMessage: ConversationMessage = {
        id: uuidv4(),
        role,
        content,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, newMessage];
      
      const result = await this.saveMemory(userId, updatedMessages, memory?.summary, memory?.topics);
      return !!result;
    } catch (error) {
      console.error('Error in addMessage:', error);
      return false;
    }
  }

  async getStandupMemory(userId: string): Promise<StandupMemory> {
    try {
      // Get the last 5 standup entries for this user
      const { data, error } = await supabase
        .from('standup_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching standup entries:', error);
        return {};
      }

      if (!data || data.length === 0) {
        return {};
      }

      // The most recent standup
      const lastStandup = data[0];
      
      // Format the standup memory
      const standupMemory: StandupMemory = {
        lastStandup: {
          date: new Date(lastStandup.created_at).toISOString(),
          accomplished: lastStandup.accomplished || '',
          working_on: lastStandup.working_on || '',
          blockers: lastStandup.blockers || '',
          goals: lastStandup.goals || '',
          answers: lastStandup.answers || {}
        },
        recentStandups: data.map(entry => ({
          date: new Date(entry.created_at).toISOString(),
          accomplished: entry.accomplished || '',
          working_on: entry.working_on || '',
          blockers: entry.blockers || '',
          goals: entry.goals || '',
          answers: entry.answers || {}
        })),
        progressSummary: this.generateProgressSummary(data)
      };

      return standupMemory;
    } catch (error) {
      console.error('Error in getStandupMemory:', error);
      return {};
    }
  }

  private generateProgressSummary(standupEntries: any[]): string {
    if (!standupEntries || standupEntries.length <= 1) {
      return "This is your first standup or we don't have enough data to generate a progress summary.";
    }

    // Compare the most recent standup with previous ones
    const latest = standupEntries[0];
    const previous = standupEntries.slice(1);

    // Check if goals from previous standups appear in accomplished items
    const allPreviousGoals = previous.flatMap(entry => 
      entry.goals ? entry.goals.split(/[.,;]/).map((g: string) => g.trim().toLowerCase()).filter((g: string) => g.length > 5) : []
    );
    
    const latestAccomplished = latest.accomplished ? 
      latest.accomplished.toLowerCase() : '';
    
    const completedGoals = allPreviousGoals.filter((goal: string) => 
      goal && latestAccomplished.includes(goal)
    );

    // Check if previous blockers are resolved
    const previousBlockers = previous[0]?.blockers ? 
      previous[0].blockers.split(/[.,;]/).map((b: string) => b.trim().toLowerCase()).filter((b: string) => b.length > 5) : [];
    
    const currentBlockers = latest.blockers ? 
      latest.blockers.toLowerCase() : '';
    
    const resolvedBlockers = previousBlockers.filter((blocker: string) => 
      blocker && !currentBlockers.includes(blocker)
    );

    // Generate the summary
    let summary = "Based on your previous standups: ";
    
    if (completedGoals.length > 0) {
      summary += `You've made progress on ${completedGoals.length} of your previous goals. `;
    }
    
    if (resolvedBlockers.length > 0) {
      summary += `You've resolved ${resolvedBlockers.length} previous blockers. `;
    }
    
    if (completedGoals.length === 0 && resolvedBlockers.length === 0) {
      summary += "I don't see clear connections between your current accomplishments and previous goals. Consider setting more specific, trackable goals. ";
    }
    
    // Add a forward-looking statement
    summary += "Let's continue building on this progress.";
    
    return summary;
  }
}

export const conversationMemoryService = new ConversationMemoryService();
