# Deck Builder Collaborative Feedback System - Phase 2 Implementation Plan

## 1. Introduction & Goals

Phase 2 of the Deck Builder Collaborative Feedback System focuses on integrating Artificial Intelligence to analyze feedback and generate actionable improvement proposals. This phase aims to significantly reduce the manual effort required by deck owners to process feedback and enhance the quality of their presentations.

**Key Goals for Phase 2:**
1.  **Implement AI-Powered Feedback Analysis**: Utilize Natural Language Processing (NLP) to understand comment sentiment, intent, and categorize feedback.
2.  **Develop AI Proposal Generation**: Enable the system to suggest concrete improvements, starting with text rewrite suggestions.
3.  **Build an Update Proposal System**: Create a workflow for deck owners to review, accept, or reject AI-generated proposals.
4.  **Introduce Weighted Feedback Scoring**: Implement a basic system to prioritize feedback based on reviewer roles or manually set weights.
5.  **Establish Comprehensive Logging**: Ensure all AI interactions, feedback processing, and proposal statuses are logged for future learning (Phase 3) and analytics.

## 2. Detailed Task Breakdown

### 2.1. AI Service Layer (`src/lib/services/aiService.ts` or similar)

*   **Task 2.1.1: AI Provider Integration Setup**
    *   Choose and configure an AI provider (e.g., OpenAI, Anthropic Claude).
    *   Set up API key management and environment variables securely.
    *   Create a basic service wrapper for making API calls.
    *   **Files to create/modify**: `src/lib/services/aiService.ts`, `.env.local` (for API keys, not committed).

*   **Task 2.1.2: Feedback Analysis Functionality**
    *   **Sentiment Analysis**: Implement a function `analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', score: number }>`.
    *   **Intent Recognition**: Implement `recognizeIntent(text: string): Promise<{ intent: 'question' | 'suggestion' | 'criticism' | 'praise' | 'concern', confidence: number }>`.
        *   This will update the `commentType` in `DeckComment` based on AI analysis.
    *   **Topic Categorization (Basic)**: Implement `categorizeComment(text: string): Promise<{ category: string, confidence: number }>` (e.g., "Clarity", "Market", "Design").
    *   **Action Item Extraction (Basic)**: Identify potential action items from comments.
    *   **Files to modify**: `src/lib/services/aiService.ts`.

*   **Task 2.1.3: Text Rewrite Suggestion Functionality**
    *   Implement `generateRewriteSuggestions(originalText: string, context?: string, feedbackPrompt?: string): Promise<string[]>`.
    *   This function will take existing text and relevant feedback to propose alternatives.
    *   **Files to modify**: `src/lib/services/aiService.ts`.

### 2.2. Update Proposal System

*   **Task 2.2.1: Backend Logic for Proposal Generation & Management**
    *   Modify `deckService.ts` (or `supabase.deck.service.ts`) to include:
        *   `createAIProposal(deckId: string, slideId: string, elementId: string | undefined, changeType: string, description: string, originalContent: any, proposedContent: any, sourceCommentIds: string[], aiConfidence: number, weightedScore: number): Promise<DeckAiUpdateProposal>`.
            *   This will call the `aiService.ts` for suggestions and then store them in `deck_ai_update_proposals`.
        *   `getAIProposals(deckId: string, slideId?: string): Promise<DeckAiUpdateProposal[]>`.
        *   `updateAIProposalStatus(proposalId: string, status: 'Accepted' | 'Rejected' | 'Modified', ownerNotes?: string): Promise<DeckAiUpdateProposal>`.
        *   When a proposal is 'Accepted', logic to apply the change to the actual deck content (VisualComponent data). This is critical and needs careful implementation to avoid data corruption. Consider versioning or snapshots.
    *   **Files to modify**: `src/enhanced-idea-hub/deck-builder/services/supabase.deck.service.ts` (or equivalent `deckService.ts`), `src/deck-builder/types/index.ts` (ensure `DeckAiUpdateProposal` type is robust).

*   **Task 2.2.2: Frontend UI for AI Proposals**
    *   Create `AIProposalCard.tsx` (`src/deck-builder/components/ai/AIProposalCard.tsx`):
        *   Displays a single AI proposal: original content (if applicable), proposed change, AI's reasoning, source comments.
        *   Buttons: "Accept", "Reject", "Edit & Accept" (Edit might be deferred if too complex for initial Phase 2).
    *   Create `AIProposalsPanel.tsx` (`src/deck-builder/components/ai/AIProposalsPanel.tsx`):
        *   Lists all pending proposals for a deck/slide.
        *   Uses `AIProposalCard` for each item.
        *   Integrates with `useAIProposals` hook.
    *   Create `useAIProposals.ts` hook (`src/deck-builder/hooks/useAIProposals.ts`):
        *   Manages fetching proposals and handling accept/reject actions.
    *   Integrate `AIProposalsPanel` into the main deck editing interface (e.g., as a tab in the `FeedbackPanel` or a separate panel).
    *   **Files to create/modify**: `src/deck-builder/components/ai/AIProposalCard.tsx`, `src/deck-builder/components/ai/AIProposalsPanel.tsx`, `src/deck-builder/hooks/useAIProposals.ts`, `src/deck-builder/components/feedback/FeedbackPanel.tsx` (potentially), `src/deck-builder/pages/DeckEditPage.tsx` (or equivalent).

### 2.3. Weighted Feedback Scoring

*   **Task 2.3.1: Backend Logic for Score Calculation**
    *   When AI proposals are generated, factor in the `feedback_weight` from `deck_review_assignments` for the source comments.
    *   The `weightedFeedbackScore` in `DeckAiUpdateProposal` should reflect this.
    *   This might involve fetching reviewer assignments when processing comments for AI analysis.
    *   **Files to modify**: `src/enhanced-idea-hub/deck-builder/services/supabase.deck.service.ts` (logic within proposal creation).

*   **Task 2.3.2: Frontend Display of Weighted Scores (Optional for UI)**
    *   Consider if/how to display this weighted score in the `AIProposalCard` or `AIProposalsPanel` to help owners prioritize.
    *   **Files to modify**: `src/deck-builder/components/ai/AIProposalCard.tsx` (potentially).

### 2.4. Enhanced Logging System

*   **Task 2.4.1: Backend Logging for AI Interactions**
    *   Expand `deck_content_interaction_logs` table or ensure its schema supports new action types.
    *   Log events such as:
        *   `AI_FEEDBACK_ANALYSIS_REQUEST` (input: comment IDs)
        *   `AI_FEEDBACK_ANALYSIS_COMPLETE` (output: analysis results)
        *   `AI_PROPOSAL_GENERATED` (proposal details)
        *   `AI_PROPOSAL_VIEWED`
        *   `AI_PROPOSAL_ACCEPTED`
        *   `AI_PROPOSAL_REJECTED`
        *   `AI_PROPOSAL_MODIFIED`
    *   Implement a service method `logContentInteraction(logData)` in `deckService.ts` if not already robust.
    *   **Files to modify**: `src/enhanced-idea-hub/deck-builder/services/supabase.deck.service.ts`, `supabase/migrations/*_deck_collaborative_feedback_schema.sql` (if schema needs minor tweaks for logging details).

*   **Task 2.4.2: Frontend Integration for Logging**
    *   Call the `logContentInteraction` service method from relevant frontend actions (e.g., when an AI proposal is accepted/rejected in `useAIProposals.ts`).
    *   **Files to modify**: `src/deck-builder/hooks/useAIProposals.ts`, other relevant UI interaction points.

## 3. New/Modified Frontend Components Summary

*   **New:**
    *   `src/deck-builder/components/ai/AIProposalCard.tsx`
    *   `src/deck-builder/components/ai/AIProposalsPanel.tsx`
    *   `src/deck-builder/hooks/useAIProposals.ts`
    *   `src/lib/services/aiService.ts` (though a service, it's a core new file)
*   **Modified (Potentially):**
    *   `src/deck-builder/components/feedback/FeedbackPanel.tsx` (to integrate AI proposals panel)
    *   `src/deck-builder/pages/DeckEditPage.tsx` (or main builder page, to host the new panels)
    *   `src/deck-builder/components/feedback/CommentThread.tsx` (to potentially show AI analysis insights per comment, or trigger rewrite suggestions)

## 4. New/Modified Backend Service Methods

*   **`aiService.ts` (New):**
    *   `analyzeSentiment(text)`
    *   `recognizeIntent(text)`
    *   `categorizeComment(text)`
    *   `generateRewriteSuggestions(originalText, context, feedbackPrompt)`
*   **`supabase.deck.service.ts` (or `deckService.ts`) (Modified/New Methods):**
    *   `createAIProposal(...)`
    *   `getAIProposals(...)`
    *   `updateAIProposalStatus(...)`
    *   (Internal logic) Applying accepted proposals to deck content.
    *   (Internal logic) Incorporating `feedback_weight` into proposal scoring.
    *   `logContentInteraction(...)` (ensure it's comprehensive).
    *   Function to trigger AI analysis for a batch of comments (e.g., `processCommentsForAI(deckId, commentIds)`).

## 5. Database Considerations

*   The existing `deck_ai_update_proposals` table seems well-suited for storing AI-generated changes.
*   The `deck_comments` table's `comment_type` field can be updated by the AI after analysis.
*   The `deck_review_assignments` table's `feedback_weight` will be used.
*   The `deck_content_interaction_logs` table will be crucial for logging all AI-related events. Ensure its `details` JSONB column is flexible enough.

## 6. Estimated Timeline & Sprint Breakdown (4-6 Weeks Target)

This is a high-level estimate and can be broken down further.

*   **Sprint 1 (1-2 Weeks): AI Service Layer & Basic Proposal Generation**
    *   Setup AI provider integration (`aiService.ts`).
    *   Implement core NLP functions: sentiment, intent, basic categorization.
    *   Implement `generateRewriteSuggestions`.
    *   Backend: `createAIProposal` (basic version, storing suggestions without applying them yet).
    *   Backend: Basic logging for AI service calls.

*   **Sprint 2 (1-2 Weeks): Update Proposal UI & Workflow**
    *   Frontend: `AIProposalCard.tsx` and `AIProposalsPanel.tsx` (display only).
    *   Frontend: `useAIProposals.ts` hook for fetching proposals.
    *   Backend: `getAIProposals` and `updateAIProposalStatus` (accept/reject status changes).
    *   Frontend: Wire up accept/reject buttons to update proposal status.
    *   Integrate proposal panel into the deck editor UI.

*   **Sprint 3 (1-2 Weeks): Applying Proposals & Weighted Scoring**
    *   Backend: Implement the critical logic for **applying accepted AI proposals** to the deck content. This needs thorough testing.
    *   Backend: Integrate `feedback_weight` from `deck_review_assignments` into the `weightedFeedbackScore` for proposals.
    *   Frontend: Potentially display weighted scores or use them for sorting proposals.
    *   Refine logging for proposal lifecycle.

*   **Sprint 4 (1 Week): Refinement, Testing & Bug Fixing**
    *   End-to-end testing of the AI feedback and proposal workflow.
    *   UI/UX polish for the new AI features.
    *   Address any bugs or edge cases.
    *   Documentation updates.

## 7. Key Dependencies & Risks

*   **AI Provider API**: Reliability, cost, and rate limits of the chosen AI service.
*   **Quality of AI Suggestions**: The usefulness of Phase 2 heavily depends on the quality of AI-generated analysis and rewrite suggestions. Prompt engineering will be key.
*   **Complexity of Applying Changes**: Modifying deck content (especially structured `VisualComponent` data) based on AI proposals can be complex and error-prone. Robust testing and potential rollback mechanisms are important.
*   **User Experience**: The AI features must be intuitive and genuinely helpful, not overwhelming or intrusive.
*   **Data Privacy**: Handling user content and feedback sent to third-party AI services requires clear user consent and privacy considerations.

## 8. Testing Strategy

*   **Unit Tests**:
    *   For `aiService.ts` functions (mocking AI provider responses).
    *   For `deckService.ts` methods related to proposal creation, status updates, and content application.
*   **Integration Tests**:
    *   Test the flow from comment creation -> AI analysis -> proposal generation -> owner review -> proposal application.
    *   Verify database interactions and data integrity.
*   **Frontend Component Tests**:
    *   For `AIProposalCard.tsx` and `AIProposalsPanel.tsx` using tools like React Testing Library.
*   **End-to-End (E2E) Tests**:
    *   Simulate user scenarios: a reviewer leaves a comment, AI processes it, owner sees a proposal, owner accepts/rejects it, content updates.
*   **Manual QA**: Thorough testing of the user interface and workflow, focusing on edge cases and usability.

## 9. Future Considerations (Leading into Phase 3)

*   The logging implemented in Phase 2 is foundational for Phase 3's Content Intelligence system.
*   User feedback on the AI proposals (e.g., rating the usefulness of suggestions) could be collected to fine-tune AI models or prompts.
*   More advanced AI capabilities (e.g., suggesting new data points, structural changes) are planned for later phases but the groundwork laid here is essential.

This plan provides a roadmap for implementing Phase 2. Each task can be further broken down into smaller sub-tasks for sprint planning.
