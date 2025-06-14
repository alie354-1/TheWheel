import { useState, useCallback, useEffect } from 'react';
import { standupBotIntegrationService } from '../../../../lib/services/new_journey/standup-bot-integration.service';

// Define message type for chat
export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface UseStandupBotIntegrationProps {
  companyId: string;
  journeyId: string;
  stepId: string;
  taskIds: string[];
}

export interface UseStandupBotIntegrationReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  isLoading: boolean;
  completedTaskIds: string[];
}

export const useStandupBotIntegration = ({
  companyId,
  journeyId,
  stepId,
  taskIds
}: UseStandupBotIntegrationProps): UseStandupBotIntegrationReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hello! I'm your Standup Bot. Let me know your progress on this step or if you need any help.",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  // Initial greeting when step changes
  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm your Standup Bot. Let me know your progress on this step or if you need any help.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    ]);
    setCompletedTaskIds([]);
  }, [stepId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Process the message with the standup bot service
      const response = await standupBotIntegrationService.processMessage({
        companyId,
        journeyId,
        stepId,
        taskIds,
        message: text
      });

      // Add bot response
      const botMessage: ChatMessage = {
        text: response.text,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update completed tasks if any were detected
      if (response.completedTaskIds && response.completedTaskIds.length > 0) {
        setCompletedTaskIds(response.completedTaskIds);
      }
    } catch (error) {
      console.error('Error processing standup message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, journeyId, stepId, taskIds]);

  return {
    messages,
    sendMessage,
    isLoading,
    completedTaskIds
  };
};
