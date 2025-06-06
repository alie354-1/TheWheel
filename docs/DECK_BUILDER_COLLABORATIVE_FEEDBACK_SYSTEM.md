# AI-Powered Collaborative Deck Feedback System

## 1. Vision
To create the most intuitive and intelligent pitch deck collaboration platform. Users will be able to share decks seamlessly, receive contextual feedback from stakeholders, and leverage AI to automatically analyze, prioritize, and incorporate that feedback, leading to significantly improved deck quality and faster iteration cycles. The system will also learn from all interactions to continuously enhance templates, components, and AI suggestions.

## 2. Core Architecture

### 2.1. Enhanced Sharing System
Building upon the existing Phase 2 sharing infrastructure, this system introduces more granular control and richer interaction models.

**Smart Sharing Links & Modes:**
-   **`ReviewMode`**: Stakeholders can view and add comments/suggestions. Ideal for general feedback.
-   **`CollaborateMode`**: Enables real-time feedback collection, potentially with live cursors and presence indicators.
-   **`FeedbackMode`**: Presents structured input forms alongside each slide, guiding reviewers to provide specific types of feedback (e.g., clarity, impact, data accuracy).
-   **Role-Based Permissions**:
    -   `Owner`: Full control.
    -   `Editor` (Future): Can edit content directly.
    -   `Reviewer`: Can comment and make suggestions.
    -   `Advisor`: Comments carry more weight.
    -   `Investor`: Comments might trigger specific AI analysis for financial viability, market fit, etc.
    -   `Viewer`: Read-only access.

### 2.2. Weighted Feedback Collection
Prioritizing feedback based on reviewer credibility and expertise.

**Reviewer Profiles:**
```typescript
interface ReviewerProfile {
  userId: string; // Links to existing user accounts or guest identifier
  deckId: string;
  displayName: string;
  email?: string; // Optional for guests
  role: 'Owner' | 'Editor' | 'Reviewer' | 'Advisor' | 'Investor' | 'Viewer';
  weight: number; // Default 1.0, adjustable by Owner (e.g., 0.1 to 2.0)
  expertiseTags: string[]; // e.g., ["finance", "marketing", "deep-tech", "GTM"]
  // Future: credibilityScore: number; // Historical accuracy/usefulness of feedback
}
```

**Smart Feedback Types & Input:**
-   **Slide-Level Comments**: General remarks about a slide.
-   **Element-Specific Comments**: Tied to a particular text block, image, chart, or even a selected area.
-   **Content Suggestions**: Reviewers can propose alternative text or data.
-   **Structural Feedback**: Suggestions to reorder, add, or remove slides.
-   **Visual Feedback**: Comments on design, layout, colors, fonts.
-   **Urgency Ratings**: Reviewers can mark feedback as `Critical`, `Important`, or `Suggestion`.
-   **Quick Reactions**: 👍, 👎, 🤔, 💡, ❤️, ❓ on slides or specific elements.
-   **Voice Notes**: Audio comments, auto-transcribed and linked to slide/element.
-   **Markup Tools**: Simple drawing/highlighting on the slide canvas.

### 2.3. Ultra-Intuitive Commenting System ("Click Anywhere")
Designed for zero-friction feedback.

**"Click Anywhere" Interaction:**
1.  **Hover**: Elements (text, images, charts, defined content blocks, even whitespace regions) subtly highlight.
2.  **Click**: An instant comment bubble/input field appears at the click location.
3.  **Input Methods**:
    *   Text input with rich text options (bold, italic, lists).
    *   Voice-to-text for quick dictation.
    *   Predefined quick reactions.
4.  **Contextual Anchoring**: Comments are visually anchored to the clicked element or coordinate.
    *   If an element is moved/resized, comments try to follow intelligently.
    *   Comments on deleted elements are archived but accessible.

**Advanced Commenting UX:**
-   **Comment Threads**: Replies and discussions within each comment.
-   **Resolve Comments**: Owners can mark comments as addressed.
-   **Assign Comments**: (Future) Assign feedback items as tasks.
-   **Filter/Sort Comments**: By reviewer, slide, status (open/resolved), urgency.
-   **Notification System**: Real-time or summary notifications for new feedback.

```typescript
// Represents a comment instance
interface DeckComment {
  id: string;
  deckId: string;
  slideId: string;
  elementId?: string; // If anchored to a specific visual component
  coordinates?: { x: number, y: number }; // If anchored to a point on the slide
  authorUserId: string;
  timestamp: Date;
  text: string;
  richTextContent?: string; // For formatted comments
  voiceNoteUrl?: string;
  transcription?: string;
  markupData?: any; // For drawings/highlights
  commentType: 'General' | 'Suggestion' | 'Question' | 'Praise' | 'Concern'; // Can be AI-assisted
  urgency: 'Critical' | 'Important' | 'Suggestion' | 'None';
  replies: DeckComment[];
  status: 'Open' | 'Resolved' | 'InProgress';
  reactions: { userId: string, reactionType: string }[];
}
```

### 2.4. AI Feedback Analysis Engine
Transforms raw feedback into actionable insights.

**Natural Language Processing (NLP) & Understanding:**
-   **Intent Recognition**: Identify if a comment is a question, suggestion, criticism, etc.
-   **Sentiment Analysis**: Positive, negative, neutral tone.
-   **Topic Modeling**: Group comments by common themes (e.g., "market size", "team slide").
-   **Action Item Extraction**: Identify concrete tasks from feedback.
-   **Conflict Detection**: Highlight contradictory feedback from different reviewers.
-   **Summarization**: Provide executive summaries of feedback for busy owners.

**AI-Powered Content Generation & Suggestion:**
-   **Rewrite Suggestions**: Offer alternative phrasing for clarity, conciseness, or impact based on feedback.
-   **Data Augmentation**: Suggest adding specific data points, statistics, or sources if feedback indicates a lack.
-   **Structural Recommendations**: Propose reordering slides or adding new ones (e.g., "Consider adding a slide on competitive advantages after the Problem slide").
-   **Visual Enhancements**: Suggest alternative chart types, color palettes, or image styles based on feedback like "this chart is hard to read."

### 2.5. Automatic Update System (with Owner Approval)
Streamlines the incorporation of feedback.

**AI-Generated Update Proposals:**
-   For each piece of actionable feedback (or cluster of related feedback), the AI generates a proposed change.
```typescript
interface UpdateProposal {
  id: string;
  deckId: string;
  slideId: string;
  elementId?: string; // Target element for the change
  changeType: 'TextEdit' | 'ImageSwap' | 'ChartUpdate' | 'NewElement' | 'ReorderElement' | 'DeleteElement' | 'NewSlide' | 'ReorderSlide';
  originalContent?: any; // Snapshot of content before change
  proposedContent: any; // The AI's suggested new content/data
  description: string; // AI's explanation of the change and why
  sourceFeedbackIds: string[]; // Links to comments that prompted this proposal
  confidenceScore: number; // AI's confidence in the proposal (0-1)
  weightedFeedbackScore: number; // Aggregate score from reviewers' weights
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Modified';
}
```
-   **Owner Approval Workflow**:
    -   A dedicated "Feedback Inbox" or "Suggested Changes" panel.
    -   Proposals are displayed with context (original content, proposed change, source feedback).
    -   Options: `Accept`, `Reject`, `Edit & Accept`.
    -   Batch operations for multiple proposals.
    -   Visual diffing for text changes.
    -   Change history and easy rollback for accepted proposals.

### 2.6. Comprehensive Content Intelligence System
The system learns from every interaction to improve itself and provide better guidance.

**Data Logging for Learning:**
-   **Content Snapshots**: Versions of slides and components at different stages.
-   **Feedback Data**: All comments, suggestions, reactions, and their metadata.
-   **User Actions**: How owners interact with feedback and AI proposals (accept, reject, edit).
-   **Deck Performance**: (If analytics are integrated) How decks perform after changes.
-   **Template & Component Usage**: Which templates/components are popular, effective, or often criticized.

**AI-Powered Template & Component Evolution:**
-   **Pattern Recognition**:
    -   Identify common feedback points for specific slide types or components.
    -   Discover content patterns in high-performing decks.
    -   Detect gaps in existing templates or component libraries.
-   **Automatic Improvement Suggestions**:
    -   For Template Maintainers: "The 'Market Size' slide in 'SaaS Pitch Template' frequently receives feedback about lacking source citations. Consider adding a placeholder for sources."
    -   For Component Library: "The 'Basic Bar Chart' component is often criticized for color contrast. Suggest updating default theme."
-   **New Template/Component Generation (Future)**:
    -   Based on successful custom decks, AI could propose new, optimized templates.
    -   Identify needs for new component types based on common custom HTML or complex image usage.

## 3. Implementation Plan (Phased Approach)

### Phase 1: Ultra-Smooth Commenting & Core Feedback Infrastructure (4-6 Weeks)
*   **Goal**: Deliver a vastly superior commenting experience.
*   **Key Features**:
    *   "Click Anywhere" commenting on slides (initially targeting key block types like text, images, and then general slide areas).
    *   Basic text commenting with threads and resolve status.
    *   Enhanced Sharing: `ReviewMode` with user roles (Owner, Reviewer).
    *   Reviewer Profiles: Basic version with manual weight setting by Owner.
    *   Database schema for comments, reviewers, and feedback anchoring.
    *   UI for displaying comments on slides and in a side panel.
*   **Tech Focus**: Frontend interaction, comment rendering, basic backend storage.

### Phase 2: AI Feedback Analysis & Proposal Generation (4-6 Weeks)
*   **Goal**: Introduce AI to process feedback and suggest improvements.
*   **Key Features**:
    *   NLP for comment categorization, sentiment, and intent.
    *   AI-generated text rewrite suggestions for selected comments.
    *   Initial `UpdateProposal` system with owner review panel (accept/reject).
    *   Weighted feedback scoring (basic implementation).
    *   Logging system for feedback and AI proposal interactions.
*   **Tech Focus**: AI service integration (e.g., OpenAI API), backend analysis logic, proposal UI.

### Phase 3: Content Intelligence & Learning System (Ongoing, initial 4 Weeks)
*   **Goal**: Enable the system to learn and improve templates/components.
*   **Key Features**:
    *   Comprehensive logging of content creation, feedback, and changes.
    *   Initial pattern recognition: Identify most commented-on slide types/components.
    *   Dashboard for admins/template designers showing feedback hotspots.
    *   AI suggestions for template improvements (manual review and application by admins).
*   **Tech Focus**: Data warehousing/analytics, advanced AI model training/fine-tuning (if applicable), admin dashboards.

### Phase 4: Advanced Collaboration & Automation (Ongoing, initial 4 Weeks)
*   **Goal**: Introduce real-time collaboration and more sophisticated AI actions.
*   **Key Features**:
    *   Voice notes & markup tools for commenting.
    *   `CollaborateMode` with live comment updates.
    *   More advanced AI content generation (e.g., suggesting new data points, structural changes).
    *   Refined AI proposal confidence scoring.
    *   (Future) Direct AI application of highly confident, low-risk changes with opt-out.
*   **Tech Focus**: Real-time communication (WebSockets), advanced AI integrations, complex UI states.

## 4. User Experience Flow

### For Deck Owners:
1.  **Share Deck**: Select "Share for Feedback", invite reviewers, assign roles/weights.
2.  **Receive Notifications**: Get notified of new feedback.
3.  **Review Feedback**:
    *   View comments directly on slides.
    *   Use feedback panel to filter/sort comments.
    *   See AI-generated summaries and themes.
4.  **Manage AI Proposals**: Review AI-suggested changes in the "Update Proposals" panel. Accept, reject, or edit.
5.  **Iterate**: Deck content updates based on approved changes.
6.  **Track Improvement**: (With Content Intelligence) See how feedback impacts deck quality scores or engagement.

### For Reviewers:
1.  **Open Shared Deck**: Access via unique link.
2.  **Provide Feedback**:
    *   Click anywhere on a slide to add a comment.
    *   Use text, voice, quick reactions, or markup.
    *   Reply to existing threads.
    *   Assign urgency.
3.  **View Others' Feedback**: (If permissions allow) See and interact with comments from other reviewers.
4.  **Track Resolution**: See if their feedback has been addressed or incorporated.

## 5. AI Magic Examples (Illustrative)

*   **Scenario 1 (Clarity)**:
    *   Reviewer Comment: "This explanation of our tech is too jargony." (Anchored to a specific paragraph)
    *   AI Proposal: Suggests 2-3 alternative phrasings of the paragraph, simplified for a broader audience.
*   **Scenario 2 (Missing Info)**:
    *   Reviewer Comment: "You mention market growth but don't back it up." (On Market Size slide)
    *   AI Proposal: "Add a chart showing X% CAGR for this market, citing [Source Y]. Data point: The market is projected to reach $Z billion by 2028."
*   **Scenario 3 (Visuals)**:
    *   Reviewer Comment: "This pie chart is hard to read with these colors."
    *   AI Proposal: Suggests an alternative color palette for the chart or a different chart type (e.g., bar chart) if more appropriate for the data.
*   **Scenario 4 (Template Learning)**:
    *   Content Intelligence: "70% of 'Problem' slides in 'Seed Stage Pitch' templates receive comments asking for quantifiable impact."
    *   AI Suggestion (to Admin): "Consider adding a default placeholder to the 'Problem' slide: 'Quantifiable impact: [e.g., Wasted X hours, Lost $Y revenue]'."

## 6. Success Metrics

*   **Feedback Engagement**: % of shared decks receiving comments; average comments per slide.
*   **AI Proposal Acceptance Rate**: % of AI-generated update proposals accepted by owners.
*   **Time to Incorporate Feedback**: Reduction in time spent manually updating decks post-feedback.
*   **Deck Quality Improvement**: (Subjective or via AI scoring) Improvement in deck scores after feedback cycles.
*   **User Satisfaction**: Qualitative feedback from owners and reviewers on the ease and utility of the system.
*   **Template/Component Improvement Rate**: Number of data-driven improvements made to default templates/components.

## 7. Detailed Architecture

### 7.1. Frontend Components (New/Enhanced)
*   `src/deck-builder/components/feedback/`:
    *   `CommentBubble.tsx`: Displays individual comments on the canvas.
    *   `CommentInput.tsx`: Rich input for creating/editing comments (text, voice, reactions).
    *   `CommentThread.tsx`: Displays a comment and its replies.
    *   `FeedbackPanel.tsx`: Sidebar listing all comments, with filtering/sorting.
    *   `ClickToCommentLayer.tsx`: Overlay on `SlideCanvas` to capture clicks and initiate comments.
    *   `ReviewerAvatar.tsx`: Displays reviewer icons.
    *   `MarkupToolbar.tsx`: Tools for drawing/highlighting.
*   `src/deck-builder/components/sharing/`:
    *   `EnhancedSharingModal.tsx`: Manages sharing modes, reviewer invites, weights.
    *   `ReviewerManagementPanel.tsx`: Allows owners to manage reviewers and their weights.
*   `src/deck-builder/components/ai/`:
    *   `AIProposalCard.tsx`: Displays a single AI-generated update proposal.
    *   `AIProposalsPanel.tsx`: Lists all pending AI proposals for owner review.
    *   `AISummaryView.tsx`: Shows AI-generated feedback summaries.
*   `src/deck-builder/hooks/`:
    *   `useDeckFeedback.ts`: Manages fetching, creating, and updating comments.
    *   `useAIProposals.ts`: Handles AI-generated update proposals.
    *   `useContentIntelligence.ts`: (Admin/Internal) Hook for accessing learned insights.

### 7.2. Backend Services (New/Enhanced `deckService.ts` methods)
*   `deckService.addComment(deckId, commentData)`
*   `deckService.updateComment(commentId, updates)`
*   `deckService.deleteComment(commentId)`
*   `deckService.getComments(deckId, slideId?)`
*   `deckService.updateReviewer(deckId, reviewerData)`
*   `deckService.getReviewers(deckId)`
*   `deckService.submitFeedbackForAnalysis(deckId, feedbackIds)`
*   `deckService.getAIProposals(deckId)`
*   `deckService.applyAIProposal(proposalId, action)`
*   `deckService.logContentInteraction(logData)`

### 7.3. Database Schema (Supabase - New Tables & Modifications)

**New Tables:**

```sql
-- Stores individual comments and their threads
CREATE TABLE deck_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    slide_id TEXT NOT NULL, -- Corresponds to DeckSection.id
    element_id TEXT,        -- Corresponds to VisualComponent.id if comment is on an element
    parent_comment_id UUID REFERENCES deck_comments(id) ON DELETE CASCADE, -- For threading
    author_user_id UUID REFERENCES auth.users(id),
    author_display_name TEXT, -- In case of guest or for quick display
    coordinates_x REAL, -- If comment is placed on a specific point
    coordinates_y REAL,
    text_content TEXT,
    rich_text_content JSONB, -- For structured/formatted text
    voice_note_url TEXT,
    voice_transcription TEXT,
    markup_data JSONB,      -- SVG or JSON data for drawings
    comment_type TEXT CHECK (comment_type IN ('General', 'Suggestion', 'Question', 'Praise', 'Concern')),
    urgency TEXT CHECK (urgency IN ('Critical', 'Important', 'Suggestion', 'None')) DEFAULT 'None',
    status TEXT CHECK (status IN ('Open', 'Resolved', 'InProgress', 'Archived')) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deck_comments_deck_slide ON deck_comments(deck_id, slide_id);

-- Stores reactions to comments
CREATE TABLE deck_comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES deck_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    reaction_type TEXT NOT NULL, -- e.g., '👍', '❤️'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type)
);

-- Manages reviewers and their specific settings for a deck
CREATE TABLE deck_review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Nullable for invite-by-email guests not yet signed up
    invited_email TEXT,
    display_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Editor', 'Reviewer', 'Advisor', 'Investor', 'Viewer')),
    feedback_weight REAL DEFAULT 1.0,
    expertise_tags TEXT[],
    access_token TEXT UNIQUE, -- For guest access via link
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deck_id, user_id),
    UNIQUE(deck_id, invited_email)
);

-- Stores AI-generated update proposals
CREATE TABLE deck_ai_update_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    slide_id TEXT NOT NULL,
    element_id TEXT,
    change_type TEXT NOT NULL, -- e.g., 'TextEdit', 'ImageSwap'
    description TEXT NOT NULL, -- AI's explanation
    original_content_snapshot JSONB,
    proposed_content_data JSONB NOT NULL,
    source_comment_ids UUID[], -- Feedback that triggered this
    ai_confidence_score REAL,
    weighted_feedback_score REAL,
    status TEXT CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Modified', 'Archived')) DEFAULT 'Pending',
    owner_action_notes TEXT, -- Notes from owner if modified/rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive logging for content intelligence
CREATE TABLE deck_content_interaction_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    deck_id UUID REFERENCES pitch_decks(id),
    slide_id TEXT,
    element_id TEXT,
    action_type TEXT NOT NULL, -- e.g., 'ElementCreate', 'TextEdit', 'CommentAdd', 'AIProposalAccept'
    details JSONB, -- Action-specific data
    session_id TEXT,
    client_info JSONB -- Browser, OS, etc.
);
CREATE INDEX idx_deck_content_logs_deck_action ON deck_content_interaction_logs(deck_id, action_type);

-- Table for storing learned patterns and template/component improvement suggestions
CREATE TABLE deck_learning_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL, -- 'TemplateSuggestion', 'ComponentFeedbackPattern', 'HighEngagementPattern'
    source_data_query TEXT, -- Query used to derive this insight (for reproducibility)
    description TEXT,
    details JSONB, -- Specifics of the insight
    severity TEXT CHECK (severity IN ('High', 'Medium', 'Low')), -- For feedback patterns
    confidence_score REAL,
    status TEXT CHECK (status IN ('New', 'Reviewed', 'Actioned', 'Dismissed')) DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Modifications to Existing Tables:**
*   `pitch_decks`:
    *   Add `last_feedback_activity_at TIMESTAMPTZ`
    *   Add `feedback_summary JSONB` (AI-generated high-level summary)

### 7.4. AI Service Integration
*   Abstract AI interactions behind a service layer (`AIService.ts`).
*   Initial integration with a chosen LLM provider (e.g., OpenAI, Anthropic Claude) via their SDK/API.
*   Functions for:
    *   `analyzeFeedback(comments: DeckComment[]): Promise<FeedbackAnalysis>`
    *   `generateContentSuggestion(context: string, feedback: string): Promise<ContentSuggestion>`
    *   `summarizeFeedback(comments: DeckComment[]): Promise<string>`
    *   `transcribeAudio(audioUrl: string): Promise<string>`

This detailed plan should provide a solid foundation for building this exciting new collaborative feedback system.
