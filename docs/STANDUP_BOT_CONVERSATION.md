# Standup Bot Conversation Context

This document describes the implementation of conversation context in the standup bot, which allows the AI assistant to maintain contextual awareness during multi-turn conversations with users.

## Overview

The standup bot now maintains a conversation history for each section of the standup (accomplished, working_on, blockers, goals), enabling it to provide more contextually relevant responses that build upon previous exchanges. This makes the conversation feel more natural and cohesive.

## Implementation Details

### 1. Conversation Storage

Conversations are stored in the `answers` field of the `standup_entries` table, which is a JSON object that can hold arbitrary key-value pairs. Each section's conversation history is stored under a key with the format `{section_name}_conversation`.

Example structure:
```json
{
  "accomplished_conversation": {
    "messages": [
      { "role": "user", "content": "I finished implementing the auth module." },
      { "role": "assistant", "content": "Great progress! How did you handle auth token expiration?" }
    ]
  },
  "working_on_conversation": {
    "messages": [
      { "role": "user", "content": "I'm integrating the payment gateway." },
      { "role": "assistant", "content": "That's an important component. Which payment provider are you using?" }
    ]
  }
}
```

### 2. Key Components

#### GeneralLLMService
- Enhanced to accept a conversation history as part of the QueryContext
- Passes the full conversation to the language model to maintain context

#### StandupAIService
- Stores and retrieves conversation histories for each section
- Builds a thread of messages for each conversation with proper system prompts
- Maintains separate conversations for each standup section

#### CofounderBot Component
- Manages UI state to update and display the conversation
- Ensures conversation state is properly initialized and maintained

### 3. How Context Affects Responses

The AI now:
- Remembers previous exchanges within a section
- Refers back to earlier points made in the conversation
- Avoids repeating information or questions
- Creates a more natural dialogue flow
- Maintains continuity of thought from one message to the next

### 4. Testing

You can test the conversation context feature using:
1. The main standup bot interface in the application
2. The `scripts/test-standup-conversation.js` script for automated testing

## Future Improvements

Potential enhancements to this feature:
- Summarizing long conversations to prevent context window limitations
- Implementing cross-section awareness (referring to topics discussed in other sections)
- Adding analytics to track conversation quality and user satisfaction
