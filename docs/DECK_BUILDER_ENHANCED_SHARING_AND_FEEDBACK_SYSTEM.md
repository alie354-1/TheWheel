# Enhanced Sharing and Feedback System for Deck Builder

## 1. Overview

This document outlines the architecture and implementation plan for a sophisticated sharing and feedback system within the Deck Builder. The goal is to provide granular control over how decks are shared, enhance the quality and relevance of feedback through role-based weighting and classification, and introduce a verification layer for secure access.

## 2. Core Features

### 2.1. Selective & Secure Sharing

-   **Recipient Management**: Users can share decks with specific individuals by email or phone number.
-   **Role Assignment**: Each recipient can be assigned a specific role (e.g., 'Investor', 'Designer', 'Technical Lead').
-   **Feedback Weighting**: The creator can assign a numerical weight to each role, influencing how their feedback is prioritized by the AI analysis engine.
-   **Access Verification**: Shared links can require recipients to verify their identity by entering a matching email or phone number before they can access the deck.
-   **Anonymous Sharing**: Creators can opt to share decks completely anonymously, or allow recipients to provide anonymous feedback.

### 2.2. Advanced Feedback Classification

-   **Content vs. Form**: Reviewers will be prompted to classify their feedback as related to "Content" (the narrative, data, arguments) or "Form" (visual design, layout, aesthetics).
-   **Component-Level Feedback**: The system will support anchoring comments to specific visual components on a slide, allowing for highly targeted feedback.
-   **AI-Powered Insights**: The AI engine will process and aggregate feedback, providing separate summaries for content and form. It will use the role-based weighting to generate prioritized improvement suggestions.

## 3. Database Schema Changes

The following changes will be made to the Supabase database schema to support these new features.

### 3.1. New Table: `deck_share_recipients`

This table will manage who has access to a specific share link and their associated roles and verification details.

```sql
CREATE TABLE IF NOT EXISTS deck_share_recipients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    share_link_id UUID NOT NULL REFERENCES smart_share_links(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    feedback_weight NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    access_code TEXT, -- For verification
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL),
    CONSTRAINT uq_recipient_per_link UNIQUE (share_link_id, email),
    CONSTRAINT uq_phone_per_link UNIQUE (share_link_id, phone)
);

COMMENT ON TABLE deck_share_recipients IS 'Manages individual recipients for a smart share link, including their role, feedback weight, and verification status.';
```

### 3.2. Modifications to `smart_share_links`

We will add columns to control the new sharing modes.

```sql
ALTER TABLE smart_share_links
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_anonymous_feedback BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN smart_share_links.requires_verification IS 'If true, recipients must verify their identity using the code sent to their email/phone.';
```

### 3.3. Modifications to `deck_comments`

We will add columns to classify feedback.

```sql
CREATE TYPE feedback_category AS ENUM ('Content', 'Form', 'General');

ALTER TABLE deck_comments
ADD COLUMN IF NOT EXISTS feedback_category feedback_category NOT NULL DEFAULT 'General',
ADD COLUMN IF NOT EXISTS component_id TEXT;

COMMENT ON COLUMN deck_comments.feedback_category IS 'Classifies the feedback as relating to Content, Form, or General.';
COMMENT ON COLUMN deck_comments.component_id IS 'The ID of the visual component the comment is anchored to, if any.';
```

## 4. API and Service Layer (`deckService.ts`)

New functions will be added to the `DeckService` to handle the new logic.

-   `addShareRecipients(shareLinkId, recipients)`: Bulk-adds recipients to a share link.
-   `verifyRecipientAccess(shareToken, emailOrPhone, accessCode)`: Verifies a recipient's access code.
-   `getFeedbackWithClassification(deckId)`: Fetches feedback, separating it by content and form.
-   `getAIInsightsWithWeighting(deckId)`: Triggers the AI analysis with role-based weighting.

## 5. UI Implementation Plan

### 5.1. `EnhancedSharingModal.tsx`

-   **Phase 1: Recipient Management**:
    -   Add a new state for managing a list of recipients (`[recipient, setRecipient]`).
    -   Create a sub-component `RecipientInput` for adding new recipients with email/phone, role, and weight.
    -   Display a list of added recipients.
-   **Phase 2: Verification & Anonymity**:
    -   Add toggles for `requires_verification`, `allow_anonymous_feedback`, and `creator_is_anonymous`.
    -   The UI should clearly explain what each setting does.
-   **Phase 3: Link Generation**:
    -   Update `handleGenerateLink` to pass all the new settings to the `DeckService.createSmartShareLink` and `DeckService.addShareRecipients` methods.

### 5.2. `FeedbackPanel.tsx`

-   Add a dropdown or segmented control to allow reviewers to select a `feedback_category` ('Content' or 'Form') when submitting a comment.
-   This selection will be passed in the `onCommentSubmit` handler.

### 5.3. New Component: `RecipientVerificationModal.tsx`

-   A new modal shown to users accessing a share link where `requires_verification` is true.
-   It will prompt for the email/phone and the access code sent to them.

## 6. Next Steps

1.  **Migration**: Create and run the SQL migration file.
2.  **Type Updates**: Update the TypeScript types in `src/deck-builder/types/index.ts` to reflect the schema changes.
3.  **Backend Logic**: Implement the new functions in `deckService.ts`.
4.  **Frontend UI**: Implement the UI changes, starting with `EnhancedSharingModal.tsx`.
