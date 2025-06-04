# Unified Smart Sharing System for Deck Builder

## Core Philosophy

The Unified Smart Sharing System is designed with the following principles:

-   **Simple by Default**: The most common sharing actions should be incredibly easy and intuitive, requiring minimal clicks.
-   **Expert-Ready**: For users needing more control, advanced options like reviewer roles and feedback weights are available through progressive disclosure.
-   **AI-Powered**: The system is built from the ground up to integrate AI for feedback analysis, sentiment detection, expertise recognition, and improvement suggestions.
-   **Anonymous-First**: Viewing and providing basic feedback does not require an account, removing friction for reviewers.
-   **Weight Transparency (Optional)**: While AI can dynamically assign weights, the system allows for explicit weight assignment to give creators control over feedback importance.
-   **Future-Proof**: The architecture is designed to be extensible, allowing for new collaboration features and deeper AI integrations over time.

## Progressive Disclosure Design

The sharing modal will use a progressive disclosure approach to keep the interface clean for basic use cases while offering powerful features for advanced users.

### Level 1: Basic Share (Default View)

This is what users see first. It's optimized for quick sharing.

```
Share Modal - Simple View:
┌─────────────────────────────────────┐
│ Share "[Deck Name]"                 │
├─────────────────────────────────────┤
│ Sharing Options:                    │
│ ○ View Only                         │
│ ● Get Feedback                      │
│ ○ Expert Review (Guided Feedback)   │
├─────────────────────────────────────┤
│ Link: [📋 Copy] https://app.thewheel.com/shared/[token] │
│                                     │
│ [⚙️ Advanced Settings]              │
└─────────────────────────────────────┘
```

-   **View Only**: Generates a link for viewing the deck. No comments allowed.
-   **Get Feedback**: Generates a link where anyone can view and leave comments anonymously.
-   **Expert Review**: Generates a link for a more structured feedback process, potentially with guided questions or specific focus areas (details in Advanced Settings).

### Level 2: Advanced Settings (Expandable Section)

Clicking "Advanced Settings" reveals more granular controls.

```
Share Modal - Expanded View:
┌─────────────────────────────────────┐
│ Share "[Deck Name]"                 │
├─────────────────────────────────────┤
│ Review Type: ● Expert Review        │
│                                     │
│ Reviewer Roles & Weights (Optional):│
│ ☐ Designer        (Weight: 1.5x)    │
│ ☐ Business Expert (Weight: 2.0x)    │
│ ☐ Investor        (Weight: 2.5x)    │
│ ☐ Technical Lead  (Weight: 1.5x)    │
│ ☐ General         (Weight: 1.0x)    │
│   Custom Role: [___________] (Weight: [1.0x ▼]) │
│                                     │
│ Focus Areas for Feedback (Optional):│
│ ☐ Content & Story  ☐ Visual Design │
│ ☐ Business Logic   ☐ Market Fit    │
│                                     │
│ 🤖 AI Analysis: [Enabled ▼]         │
│    (Options: Enabled, Enhanced, Disabled)│
│                                     │
│ Anonymous reviewers can optionally  │
│ specify their role/expertise to     │
│ help AI weight feedback appropriately.│
├─────────────────────────────────────┤
│ Links:                              │
│ General Link:  [📋] https://...     │
│ Expert Link:   [📋] https://...?mode=expert │
│ Role-Specific Links (auto-generated if roles selected) │
└─────────────────────────────────────┘
```

-   **Reviewer Roles & Weights**: Allows deck owners to define roles (e.g., Designer, Investor) and assign weights to their feedback. This influences how AI prioritizes and summarizes comments.
-   **Focus Areas**: Helps guide reviewers and allows AI to categorize feedback more effectively.
-   **AI Analysis**: Controls the level of AI processing on the feedback.
-   **Role-Specific Links**: Optionally generate unique links for different reviewer types, pre-setting their role.

## Database Schema

This schema supports anonymous sharing, roles, weights, and AI analysis.

```sql
-- Main table for shareable links
CREATE TABLE smart_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    share_type TEXT NOT NULL CHECK (share_type IN ('view', 'feedback', 'expert_review')) DEFAULT 'feedback',
    -- Predefined roles for this link, if any. Can be empty.
    target_roles TEXT[] DEFAULT '{}',
    -- Specific areas owner wants feedback on. Can be empty.
    focus_areas TEXT[] DEFAULT '{}',
    ai_analysis_enabled BOOLEAN NOT NULL DEFAULT true,
    -- Owner-defined weights for roles, e.g., {"designer": 1.5, "investor": 2.0}
    custom_weights JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id), -- The user who created the share link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- Optional expiration for the link
);

-- Tracks individual review sessions, anonymous or identified
CREATE TABLE reviewer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_token TEXT NOT NULL REFERENCES smart_share_links(share_token) ON DELETE CASCADE,
    -- Unique ID for the browser session, to group anonymous comments
    session_id TEXT UNIQUE NOT NULL,
    -- Role self-declared by the reviewer, if they choose
    declared_role TEXT,
    -- Optional name provided by an anonymous reviewer
    reviewer_name TEXT,
    -- Optional email provided by an anonymous reviewer
    reviewer_email TEXT,
    -- Self-declared expertise level
    expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'expert', 'n/a')),
    ip_address INET,
    user_agent TEXT,
    -- User ID if the reviewer is a logged-in platform user
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhancements to the existing deck_comments table
ALTER TABLE deck_comments
    ADD COLUMN IF NOT EXISTS reviewer_session_id UUID REFERENCES reviewer_sessions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS declared_role TEXT, -- Role declared by reviewer during this comment
    ADD COLUMN IF NOT EXISTS feedback_weight DECIMAL(3,2) DEFAULT 1.0, -- Final calculated weight (owner + AI)
    ADD COLUMN IF NOT EXISTS ai_sentiment_score DECIMAL(3,2), -- e.g., -1.0 to 1.0
    ADD COLUMN IF NOT EXISTS ai_expertise_score DECIMAL(3,2), -- e.g., 0.0 to 1.0, based on comment content
    ADD COLUMN IF NOT EXISTS ai_improvement_category TEXT, -- e.g., 'Clarity', 'Design', 'Market'
    ADD COLUMN IF NOT EXISTS focus_area TEXT; -- If comment relates to a specific focus area

-- Stores results of AI analysis on feedback
CREATE TABLE ai_feedback_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    share_token TEXT REFERENCES smart_share_links(share_token), -- Link context for the analysis
    analysis_type TEXT NOT NULL, -- e.g., 'overall_sentiment', 'key_themes', 'improvement_suggestions'
    insights JSONB NOT NULL, -- The actual analysis data
    confidence_score DECIMAL(3,2), -- AI's confidence in this analysis
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Anonymous Reviewer Experience

The goal is minimal friction for reviewers.

### 1. Quick Anonymous Feedback (Default for "Get Feedback" links)

-   Reviewer clicks the link.
-   Deck loads instantly.
-   A simple, unobtrusive comment box is available (e.g., a sidebar or footer).
    ```
    💬 Leave feedback:
    [Text area for comment]
    Name (Optional): [__________]
    [Submit Feedback]
    ```
-   No login, no mandatory fields beyond the comment itself.

### 2. Expert Review Mode (For "Expert Review" links or if role selected)

If the link is for expert review or targets specific roles, the interface can adapt.

-   Deck loads.
-   Feedback interface might prompt for role/expertise:
    ```
    💬 Provide Your Expert Feedback:

    I'm reviewing this as a: [Designer ▼] (Optional)
    My expertise level is: [Expert ▼] (Optional)
    Name (Optional): [__________]

    Focusing on: [Content & Story ▼] (If applicable)
    [Text area for feedback]

    [Submit Feedback] (Your feedback as a Designer will be weighted 1.5x)
    ```
-   This is still optional but encourages richer context for AI.

## AI Features (Behind the Scenes)

AI enhances the feedback process without complicating the UI for reviewers.

### 1. Dynamic Feedback Weight Calculation

The `feedback_weight` on a comment is determined by:
1.  **Base Weight**: Default is 1.0.
2.  **Owner-Defined Weight**: If the `smart_share_links.custom_weights` has a weight for the `reviewer_sessions.declared_role` (or a role AI infers), that's applied.
3.  **AI Adjustment (Optional)**:
    *   `ai_expertise_score`: AI analyzes comment content for signs of expertise, potentially adjusting weight (e.g., +0.0 to +0.5).
    *   Comment Quality: AI assesses clarity, actionability, specificity (e.g., +/- 0.2).
    *   Relevance: If focus areas are set, AI checks comment relevance.

    `final_weight = owner_weight * (1 + ai_expertise_adjustment + ai_quality_adjustment + ai_relevance_adjustment)`

### 2. Smart Feedback Analysis for Deck Owner

AI processes all comments (especially weighted ones) to provide insights:

-   **Overall Sentiment**: Positive, mixed, critical.
-   **Key Themes**: Identifies recurring topics (e.g., "Pricing unclear", "Love the design", "Market size concerns").
-   **Prioritized Improvements**: Actionable suggestions ranked by weighted importance and AI confidence.
    -   Example: "Clarify target audience (High Importance - Investor feedback, Weight 2.0x)"
-   **Expert Consensus/Divergence**: Highlights where experts agree or disagree.
-   **Sentiment per Slide/Section**.
-   **Action Item Extraction**.

## Progressive User Flow

### For Deck Owners:

1.  **Quick Share (Default)**:
    *   Click "Share" button.
    *   Choose "Get Feedback" (default) or "View Only".
    *   Copy the general link. (3 clicks)
    *   AI analysis runs automatically on feedback received.
2.  **Smart Share (Advanced)**:
    *   Click "Share", then "Advanced Settings".
    *   Select "Expert Review" or define roles/weights (e.g., "Investor" 2.0x, "Designer" 1.5x).
    *   Optionally set "Focus Areas".
    *   Copy general link or role-specific links.
    *   AI uses these settings to refine analysis and weighting.
3.  **Review AI Insights**:
    *   In the deck editor or a dedicated feedback panel, view AI-generated summaries, prioritized improvements, and sentiment analysis.

### For Reviewers:

1.  **Anonymous Review (Most Common)**:
    *   Click a general feedback link.
    *   View deck.
    *   Optionally type name and leave comments. (Frictionless)
2.  **Role-Aware Review (If link or UI prompts)**:
    *   Click an expert/role-specific link OR choose to specify role in UI.
    *   Optionally select role (e.g., "Designer") and expertise level.
    *   Provide feedback. Their input may be weighted higher by the system.
3.  **Logged-in Member Benefits (Future Enhancement)**:
    *   If a reviewer is a logged-in platform member:
        *   Their comments are automatically associated with their profile.
        *   They can see a history of decks shared with them and their feedback.
        *   Their platform-defined expertise (if any) can contribute to AI weighting.

## Implementation Phases

### Phase 1: Smart Foundation (Core Sharing & Roles) - Approx. 2-3 Weeks

*   **Database**: Implement `smart_share_links`, `reviewer_sessions`, and `deck_comments` enhancements.
*   **Backend**:
    *   Service methods to create/manage `smart_share_links`.
    *   Service methods to record `reviewer_sessions` and associate comments.
    *   Logic for basic feedback weight calculation (owner-defined weights).
*   **Frontend**:
    *   Revamp `SharingModal.tsx` with progressive disclosure (Simple and Advanced views).
    *   Implement UI for selecting share type, roles, weights, focus areas.
    *   Develop `SharedDeckViewer.tsx` page for anonymous and role-aware viewing.
    *   Implement anonymous commenting form with optional role/name/email.
*   **Goal**: Users can share decks, define roles/weights, and anonymous users can provide feedback with optional role declaration. Basic weighting applied.

### Phase 2: AI Integration - Initial Analysis & Comment Viewing (Approx. 2-2.5 Weeks)

*   **Database**:
    *   Implement `ai_feedback_insights` table.
*   **AI Services/Supabase Functions**:
    *   Function for sentiment analysis (`ai_sentiment_score`).
    *   Function for basic expertise detection from comment text (`ai_expertise_score`).
    *   Function for categorizing comments into broad themes (`ai_improvement_category`).
*   **Backend**:
    *   Integrate AI functions to populate new `deck_comments` AI fields upon comment submission.
    *   Service to aggregate comment data and generate initial `ai_feedback_insights` (e.g., overall sentiment, top themes).
*   **Frontend**:
    *   **(New to Phase 2)** **Develop a basic UI for deck owners to view all comments associated with their deck.** This could be a simple list view initially, perhaps within the `FeedbackPanel.tsx` or a new dedicated component. It should display the comment text, and any available reviewer-provided info (name, declared role).
    *   Display basic AI insights to the deck owner (e.g., sentiment icons next to comments in the list, a simple display of themes derived from the feedback).
*   **Goal**: AI automatically analyzes feedback for sentiment, basic expertise, and themes. **Deck owners can view all comments in a dedicated UI** and see initial AI-driven insights alongside them.

### Phase 3: Advanced AI, Deck Change Proposals & UX Polish (Approx. 2-3 Weeks)

*   **AI Services/Supabase Functions**:
    *   Refine expertise detection.
    *   Develop logic for **generating specific, actionable deck content/design improvement suggestions based on feedback.**
    *   Implement focus area relevance scoring.
    *   (New) Function to summarize and propose changes for a specific slide or the whole deck based on aggregated feedback.
*   **Backend**:
    *   Enhance dynamic weight calculation incorporating more AI signals.
    *   Develop more sophisticated aggregation for `ai_feedback_insights` (prioritized improvements, consensus, **proposed deck changes**).
*   **Frontend**:
    *   **Enhance the comment viewing UI into a "Feedback & AI Insights" panel/dashboard**:
        *   Add filtering and sorting to the comment list.
        *   Integrate a button/mechanism to trigger AI analysis on demand (e.g., "Analyze Feedback & Propose Changes").
        *   Display AI-generated summaries, prioritized improvements, and **specific proposed deck changes.**
        *   Visualize AI analysis (charts for sentiment, theme clouds, prioritized lists).
    *   Refine the reviewer experience based on initial feedback.
*   **Member Enhancements (Initial)**:
    *   If user is logged in, auto-fill name/email and link comment to their `user_id`.
    *   Basic "Shared with me" list.
*   **Goal**: Deck owners receive rich, actionable AI-driven insights, **including concrete suggestions for deck modifications**, and can actively direct the AI. The system feels intelligent, collaborative, and helpful.

## Key Benefits of this Unified Approach

-   **Simplicity for All**: Easy for basic sharing, powerful when needed.
-   **Empowers Deck Owners**: Control over feedback importance via roles and weights.
-   **Actionable AI Insights**: AI doesn't just analyze; it helps prioritize and suggest.
-   **High-Quality Feedback Loop**: Encourages contextualized feedback, which improves AI accuracy over time.
-   **Scalable**: Starts simple and grows in AI sophistication without overhauling the core user experience.
-   **Low Barrier to Entry**: Anonymous feedback is crucial for getting diverse input.

This unified system provides a robust framework for simple sharing, nuanced feedback collection with roles and weights, and a strong foundation for impactful AI-driven editing and improvement features.
