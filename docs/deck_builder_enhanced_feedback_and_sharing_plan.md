# Deck Builder Enhanced Feedback & Sharing Implementation Plan

## Overview

This document details the implementation plan for the next-generation feedback and sharing system in the Deck Builder. The goal is to provide a user-friendly, privacy-respecting, and AI-powered collaborative review experience.

---

## 1. Feedback Category Clarity

- **UI/UX**
  - Prominent feedback category selector (Content, Form, General) in comment input.
  - Visual badges/icons for each category on comments.
  - Filtering/grouping by category in feedback panel.
  - Tooltips/descriptions for each category.

- **Backend**
  - Enforce `feedback_category` field on all comments.

---

## 2. Per-Slide and Deck-Wide Comments

- **UI/UX**
  - "Click to comment" overlay on slides, with clear pin/highlight for slide-specific comments.
  - Tabs/sections in feedback panel: "This Slide" / "Whole Deck".
  - Toggle in comment input to switch between slide/deck context.
  - Persistent "Add overall feedback" button.

- **Backend**
  - Comments reference `slide_id` (nullable for deck-wide).

---

## 3. Private (User-Only) Comments

- **Database**
  - Enforce Row Level Security (RLS) so only the author (or optionally, deck owner/admin) can see their own comments.
  - For shared decks, tie comment visibility to authenticated user or unique share link recipient.

- **Frontend**
  - Only display comments authored by the current user.
  - Privacy messaging in UI.

---

## 4. Enhanced Sharing with Others

- **Author Controls**
  - "Share Comments" toggle in sharing modal.
  - Specify which recipients can see each other's comments.
  - Option to enable/disable collaborative review.

- **Email-Based Sharing**
  - Require email for all recipients.
  - Verification email with unique access link.
  - Track comments by recipient email.

- **View-Only Mode**
  - "View Only" permission for recipients.
  - Author can switch between "View Only" and "Can Comment".

- **Recipient Management**
  - Dashboard for author to manage recipients:
    - Add/remove recipients
    - Change permissions
    - View access logs
    - Revoke access

- **Privacy Controls**
  - Expiration date for shared links.
  - Disable downloads/exports for recipients.
  - Watermarking options.

---

## 5. AI Voice Note Transcription

- **Recording Interface**
  - Enhanced voice note UI with waveform, duration, pause/resume.

- **AI Transcription**
  - Automatic speech-to-text on submission.
  - "Transcribing..." indicator.
  - Display transcription with audio.
  - Editable transcription field.

- **Reviewer Experience**
  - Audio player + transcription.
  - Highlight words as spoken (optional).
  - Searchable transcriptions.

- **Multi-language Support**
  - Detect/transcribe multiple languages.
  - Optional translation.

---

## 6. Editable Comments

- **Edit Mode**
  - "Edit" button for user’s own comments.
  - Full-featured editor for text, category, attachments.

- **Version History**
  - Track edit history.
  - "Edited" indicator.
  - View previous versions.

- **Rich Text Editing**
  - Formatting (bold, italic, lists, etc.).
  - Add/remove attachments.
  - Embed links/references.

- **Edit Notifications**
  - Notify deck owner on edits (optional).
  - Show recent edits in feedback panel.

---

## 7. Additional Enhancements

- **Drafts & Autosave**
  - Save drafts before submitting, autosave on navigation.

- **Comment Resolution/Status**
  - Mark comments as "resolved" or "archived".

- **Aggregated Insights**
  - AI-powered summaries, sentiment, key themes (private to user).

- **Rich Feedback**
  - Screenshots, markup annotations.

- **Navigation**
  - "Jump to slide" from feedback panel.

- **Mobile/Accessibility**
  - Mobile-friendly, keyboard navigation, screen reader support.

- **Export/Download**
  - Export own comments as PDF/CSV.

---

## 8. Collaborative Feedback Mode

- **Selective Sharing**
  - "Feedback groups" for shared comments.
  - Share specific comments with specific recipients.

- **Threads & Discussions**
  - Replies to comments (if enabled).
  - Threaded discussions.

- **Real-time Collaboration**
  - Presence indicators, typing indicators.

- **Notifications**
  - Email notifications for new/edited comments.
  - Subscribe/unsubscribe to notifications.

---

## 9. Database & Backend Changes

- Add `voice_transcription` (TEXT) to `deck_comments`.
- Add `edit_history` (JSONB) to `deck_comments`.
- Add `is_shared` (BOOLEAN) to `deck_comments`.
- Create `comment_visibility` (junction table: comment_id, user_id/email).
- Add `permission_level` (TEXT) to `deck_share_recipients`.
- Update RLS policies for privacy and sharing.
- Integrate AI speech-to-text service for transcription.
- APIs for comment editing, versioning, and recipient management.

---

## 10. Frontend Changes

- Enhanced feedback panel and comment input.
- Sharing modal with advanced controls.
- Recipient management dashboard.
- Voice note UI with transcription.
- Editable comments with version history.
- Real-time collaboration UI (future).

---

## 11. Implementation Sequence

1. Database migrations (SQL)
2. Backend API changes
3. Frontend UI/UX enhancements
4. AI integration for transcription
5. Real-time/collaborative features

---

## 12. Testing & Rollout

- Unit and integration tests for all new features.
- User acceptance testing with sample decks.
- Gradual rollout with feature flags.

---
