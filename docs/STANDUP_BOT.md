# Standup Bot

## Overview

The Standup Bot is an AI-powered assistant that helps teams conduct more effective standups by providing feedback, generating summaries, and suggesting tasks based on standup entries. It acts as a virtual cofounder, offering insights and asking thoughtful questions to help users think more deeply about their work.

## Features

### 1. Section-by-Section Feedback

The Standup Bot provides real-time feedback as users fill out each section of their standup:

- **Accomplished**: Feedback on completed work with follow-up questions
- **Working On**: Insights on current tasks with suggestions for improvement
- **Blockers**: Help identifying solutions to obstacles
- **Goals**: Guidance on setting effective goals and aligning them with overall objectives

### 2. Standup Summary

After completing a standup, the bot generates a comprehensive summary that includes:

- Overall assessment of progress
- Identified strengths
- Areas for improvement
- Opportunities to explore
- Potential risks to be aware of
- Strategic recommendations

### 3. Task Generation

Based on standup entries, the bot suggests specific tasks to help users move forward, including:

- Task title and description
- Priority level (high/medium/low)
- Estimated time to complete
- Task type (Research/Planning/Development)
- Implementation tips
- Potential challenges
- Success metrics
- Relevant resources

## AI Implementation

### Context-Aware Responses

The Standup Bot uses several advanced AI techniques to provide contextual, personalized feedback:

1. **Conversation Memory**: The system maintains a history of previous standups to provide context-aware responses that reference past work and progress.

2. **Startup Stage Detection**: The bot automatically detects the user's startup stage (idea stage, early stage, or growth stage) and tailors its feedback accordingly:
   - Idea stage: Focus on validation, problem definition, and customer discovery
   - Early stage: Emphasis on learning and validation
   - Growth stage: Guidance on scaling and optimization

3. **Question Tracking**: The system tracks previously asked questions to avoid repetition and ensure diverse, thoughtful follow-ups.

4. **Similarity Detection**: Uses a similarity algorithm to identify when questions are semantically similar, even if worded differently.

### Prompt Engineering

The Standup Bot uses carefully crafted prompts that:

1. Include specific instructions for tone and style (direct but supportive, like a real cofounder)
2. Provide context from previous standups
3. Include stage-specific guidance
4. Request specific output formats (JSON for summaries and tasks)

Example prompt structure for section feedback:
```
Your cofounder said: "[user input]"

[Previous standup context]

You're a cofounder with real startup experience. Be direct but supportive.

[Stage-specific guidance]

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
```

### AI Architecture

The Standup Bot leverages a multi-tiered AI architecture:

1. **StandupAIService**: Core service that handles the AI logic for generating feedback, summaries, and tasks.

2. **StandupAIProvider**: React context provider that makes AI capabilities available throughout the application.

3. **GeneralLLMService**: Underlying service that handles communication with the language model, supporting different modes:
   - Real AI: Uses OpenAI's API for production
   - Mock AI: Uses predefined responses for testing
   - Multi-tiered AI: Combines multiple models for enhanced capabilities

4. **Feature Flags**: The system includes feature flags to control AI behavior:
   - `useRealAI`: Toggle between real and mock AI
   - `useMockAI`: Use predefined responses for testing
   - `useMultiTieredAI`: Enable advanced multi-model capabilities

## Integration

The Standup Bot is integrated into the application through:

1. **StandupAIContext**: React context that provides AI capabilities to components
2. **useStandupAIContext**: Custom hook for accessing standup AI functions
3. **StandupAIProvider**: Provider component that wraps the application

## Error Handling

The system includes robust error handling:

1. **Fallback Responses**: If the AI service fails, the system provides generic but helpful fallback responses.
2. **JSON Parsing**: For structured outputs (summaries and tasks), the system handles parsing errors gracefully.
3. **Question Extraction**: The system can extract questions from various formats for consistent follow-ups.

## Future Enhancements

Planned enhancements for the Standup Bot include:

1. **Team Insights**: Aggregate standup data to provide team-level insights
2. **Progress Tracking**: Track progress over time to identify trends
3. **Integration with Project Management Tools**: Connect with tools like Jira, Asana, or Trello
4. **Custom Prompts**: Allow users to customize the AI's focus areas
5. **Voice Interface**: Support voice input for standups
