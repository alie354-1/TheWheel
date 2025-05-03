// Update the CofounderBot component to properly display feedback
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Brain, 
  MessageSquare,
  Clock,
  CheckSquare,
  Target,
  AlertCircle,
  ArrowRight,
  ListChecks,
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import TaskPromptDialog from '../../components/TaskPromptDialog';
import { generateTasks } from '../../lib/openai';
import { standupAIService, StandupEntry } from '../../lib/services/standup-ai.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: 'question' | 'answer' | 'feedback' | 'summary' | 'section_transition';
  section?: string;
}

const SECTION_TRANSITIONS = {
  accomplished: {
    title: "Accomplishments",
    initial: "Hey! What have you accomplished recently? Even small wins count."
  },
  working_on: {
    title: "Current Work",
    initial: "What are you focused on right now?"
  },
  blockers: {
    title: "Challenges",
    initial: "Running into any roadblocks or challenges?"
  },
  goals: {
    title: "Goals",
    initial: "What are you aiming to achieve next?"
  }
};

export default function CofounderBot() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentSection, setCurrentSection] = useState<keyof typeof SECTION_TRANSITIONS>('accomplished');
  const [currentEntry, setCurrentEntry] = useState<StandupEntry>({
    accomplished: '',
    working_on: '',
    blockers: '',
    goals: '',
    answers: {}
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `→ Starting with ${SECTION_TRANSITIONS.accomplished.title.toLowerCase()} section`,
      type: 'section_transition'
    },
    {
      role: 'assistant',
      content: SECTION_TRANSITIONS.accomplished.initial,
      type: 'question'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [sectionExchangeCount, setSectionExchangeCount] = useState(0);
  const [showSectionPrompt, setShowSectionPrompt] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleNextSection = async () => {
    const sections = Object.keys(SECTION_TRANSITIONS) as Array<keyof typeof SECTION_TRANSITIONS>;
    const currentIndex = sections.indexOf(currentSection);
    
    // Reset section exchange count when moving to a new section
    setSectionExchangeCount(0);
    setShowSectionPrompt(false);
    
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSection(nextSection);
      
      // Add a subtle section header message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `→ Moving to ${SECTION_TRANSITIONS[nextSection].title.toLowerCase()} section`,
        type: 'section_transition',
        section: nextSection
      }]);
      
      // Add the initial question for this section
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: SECTION_TRANSITIONS[nextSection].initial,
        type: 'question',
        section: nextSection
      }]);
    } else {
      // Generate summary before showing task options
      await generateSummary();
    }
  };

  const generateSummary = async () => {
    setIsSummarizing(true);
    try {
  // Create context for AI service without requiring company_id
  const context: {
    userId: string;
    useExistingModels: boolean;
    companyId?: string;
  } = {
    userId: user?.id || '',
    useExistingModels: true
  };
  
  // Try to get company ID if it exists, but don't require it
  try {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user?.id)
      .single();
    
    // Only add companyId to context if it exists
    if (userProfile?.company_id) {
      context.companyId = userProfile.company_id;
    }
  } catch (error) {
    // Ignore errors fetching company_id, it's optional
    console.log('No company ID found for user, continuing without it');
  }
      
      // Generate summary using the standup AI service
      const summary = await standupAIService.generateStandupSummary(currentEntry, context);
      
      // Format feedback into a readable, concise string
      const formattedFeedback = `${summary.content}

${summary.strengths.length > 0 ? `💪 ${summary.strengths.join('\n')}` : ''}
${summary.areas_for_improvement.length > 0 ? `\n🔍 ${summary.areas_for_improvement.join('\n')}` : ''}
${summary.opportunities.length > 0 ? `\n✨ ${summary.opportunities.join('\n')}` : ''}
${summary.risks.length > 0 ? `\n⚠️ ${summary.risks.join('\n')}` : ''}
${summary.strategic_recommendations.length > 0 ? `\n🎯 ${summary.strategic_recommendations.join('\n')}` : ''}`;

      // Add a subtle section header for the summary
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `→ Moving to summary section`,
        type: 'section_transition'
      }]);
      
      // Add summary message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formattedFeedback,
        type: 'summary'
      }]);

      // Generate tasks based on the standup
      const tasks = await standupAIService.generateTasks(currentEntry, user?.id || '', context);
      
      // Store tasks for later use
      // This could be used to display task suggestions or populate the task creation dialog
      console.log('Generated tasks:', tasks);

      setIsComplete(true);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Would you like to try again?');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSaveStandup = async () => {
    if (!user) return;

    try {
      // Create a data object without the answers field first
      const entryData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        accomplished: currentEntry.accomplished,
        working_on: currentEntry.working_on,
        blockers: currentEntry.blockers,
        goals: currentEntry.goals
      };

      // Try to insert with answers field first
      try {
        const { data: entry, error: saveError } = await supabase
          .from('standup_entries')
          .insert({
            ...entryData,
            answers: currentEntry.answers || {}
          })
          .select()
          .single();

        if (saveError) throw saveError;
        
        // Show task generation prompt
        setShowTaskPrompt(true);
      } catch (answerError: any) {
        console.warn('Could not save with answers field, trying without:', answerError.message);
        
        // If that fails, try without the answers field
        const { data: entry, error: saveError } = await supabase
          .from('standup_entries')
          .insert(entryData)
          .select()
          .single();

        if (saveError) throw saveError;
        
        // Show task generation prompt
        setShowTaskPrompt(true);
      }
    } catch (error: any) {
      console.error('Error saving standup:', error);
      setError(error.message);
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isThinking) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: currentInput,
      type: 'answer',
      section: currentSection
    };
    setMessages(prev => [...prev, userMessage]);
    
  // Update current entry
  const updatedEntry = {
    ...currentEntry,
    [currentSection]: currentInput
  };
  
  // Initialize answers field if it doesn't exist
  if (!updatedEntry.answers) {
    updatedEntry.answers = {};
  }

  setCurrentInput('');
  setIsThinking(true);

  try {
    // Create context for AI service without requiring company_id
    const context: {
      userId: string;
      useExistingModels: boolean;
      companyId?: string;
    } = {
      userId: user?.id || '',
      useExistingModels: true
    };
    
    // Try to get company ID if it exists, but don't require it
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();
      
      // Only add companyId to context if it exists
      if (userProfile?.company_id) {
        context.companyId = userProfile.company_id;
      }
    } catch (error) {
      // Ignore errors fetching company_id, it's optional
      console.log('No company ID found for user, continuing without it');
    }
    
    setCurrentEntry(updatedEntry);
      
      // Generate section-specific feedback using the standup AI service
      const feedback = await standupAIService.generateSectionFeedback(
        currentSection,
        currentInput,
        currentEntry,
        context
      );
      
      // Add AI feedback message
      const feedbackMessage: Message = {
        role: 'assistant',
        content: feedback.content,
        type: 'feedback',
        section: currentSection
      };
      setMessages(prev => [...prev, feedbackMessage]);

      // Add follow-up questions if available, but only if they're not already in the content
      const followUpQuestions = feedback.follow_up_questions || [];
      if (followUpQuestions.length > 0) {
        // Check if any of the follow-up questions are already in the content
        const questionAlreadyInContent = followUpQuestions.some(q => 
          feedback.content.includes(q)
        );
        
        // Only add as a separate message if they're not already in the content
        if (!questionAlreadyInContent) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `${followUpQuestions.map(q => `${q}`).join('\n')}`,
            type: 'question',
            section: currentSection
          }]);
        }
      }
      
      // Increment the exchange count for this section
      const newCount = sectionExchangeCount + 1;
      setSectionExchangeCount(newCount);
      
      // After 4-5 exchanges, ask if they want to continue or move to the next section
      if (newCount >= 4) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Would you like to continue discussing this topic or move to the next section?',
          type: 'question',
          section: currentSection
        }]);
        setShowSectionPrompt(true);
      }

    } catch (error: any) {
      console.error('Error generating feedback:', error);
      setError(error.message);
    } finally {
      setIsThinking(false);
    }
  };

  const handleGenerateTasks = () => {
    handleSaveStandup();
  };

  const handleExit = () => {
    navigate('/dashboard');
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <h1 className="text-2xl font-semibold text-gray-900">Daily Standup</h1>
              <p className="mt-1 text-sm text-gray-500">
                Let's review your progress and plan next steps
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Object.entries(SECTION_TRANSITIONS).map(([key, section], index) => (
              <div
                key={key}
                className={`flex-1 ${index !== 0 ? 'ml-4' : ''}`}
              >
                <div className="relative">
                  <div
                    className={`h-2 rounded-full ${
                      Object.keys(SECTION_TRANSITIONS).indexOf(currentSection) >= index
                        ? 'bg-indigo-600'
                        : 'bg-gray-200'
                    }`}
                  />
                  <div className="mt-2 flex items-center justify-center">
                    {currentEntry[key as keyof StandupEntry] ? (
                      <CheckSquare className="h-4 w-4 text-green-500 mr-1" />
                    ) : key === currentSection ? (
                      <Clock className="h-4 w-4 text-indigo-500 mr-1" />
                    ) : (
                      <Target className="h-4 w-4 text-gray-400 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${
                      key === currentSection 
                        ? 'text-indigo-600'
                        : currentEntry[key as keyof StandupEntry]
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-white shadow rounded-lg">
          {/* Messages */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.type === 'summary'
                      ? 'bg-green-50 text-gray-900'
                      : message.type === 'section_transition'
                      ? 'bg-indigo-100 text-indigo-800 font-medium'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.type === 'summary' && (
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="font-medium">Summary</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {(isThinking || isSummarizing) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            {isComplete ? (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleExit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Exit
                </button>
                <button
                  onClick={handleGenerateTasks}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Generate Tasks
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleInputSubmit} className="flex space-x-4">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!currentInput.trim() || isThinking}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </button>
                </form>

                {showSectionPrompt ? (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowSectionPrompt(false);
                        setSectionExchangeCount(0);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Continue this topic
                    </button>
                    <button
                      onClick={() => {
                        setShowSectionPrompt(false);
                        setSectionExchangeCount(0);
                        handleNextSection();
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next section
                    </button>
                  </div>
                ) : (
                  currentEntry[currentSection] && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleNextSection}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task Generation Dialog */}
        <TaskPromptDialog
          isOpen={showTaskPrompt}
          onClose={() => setShowTaskPrompt(false)}
          standupEntry={currentEntry}
        />
      </div>
    </div>
  );
}
