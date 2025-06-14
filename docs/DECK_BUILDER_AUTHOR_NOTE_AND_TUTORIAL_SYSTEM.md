# Deck Builder Author Note and Tutorial System

## Overview
This system enhances the deck sharing experience by allowing authors to leave personalized notes for reviewers and providing an interactive tutorial for first-time users to understand the feedback system.

## Database Schema

### smart_share_links table additions:
```sql
author_note TEXT                    -- Author's personalized message
show_tutorial BOOLEAN DEFAULT false -- Whether to show tutorial option
tutorial_style TEXT DEFAULT 'animated' CHECK (tutorial_style IN ('animated', 'interactive'))
```

### reviewer_sessions table additions:
```sql
tutorial_completed BOOLEAN DEFAULT false -- Tutorial completion status
tutorial_completed_at TIMESTAMPTZ       -- When tutorial was completed
```

## Components

### 1. AuthorNoteModal
Displays the author's personalized welcome message before reviewer enters the system.

**Features:**
- Beautiful glass morphism design
- HTML content support for rich formatting
- Optional tutorial link for first-time users
- Smooth fade animations

**Usage:**
```tsx
<AuthorNoteModal
  authorNote="Welcome to my pitch deck! I'm particularly interested in feedback on the market analysis section."
  deckTitle="Revolutionary SaaS Platform"
  onContinue={() => {/* proceed to deck */}}
  onShowTutorial={() => {/* show tutorial */}}
  hasSeenSystemBefore={false}
/>
```

### 2. InteractiveTutorialModal
A comprehensive 5-step walkthrough teaching users how to use all feedback features.

**Tutorial Steps:**
1. **Welcome** - Introduction to collaborative feedback
2. **Text Comments** - Learn to add categorized comments (suggestions, questions, praise)
3. **Voice Notes** - Record personal voice feedback
4. **Click-to-Comment** - Add location-specific feedback on slides
5. **Feedback Levels** - Switch between slide and deck-level comments

**Features:**
- Interactive demos for each feature
- Progress tracking and interaction indicators
- 60/40 split layout (demo area / instructions)
- Skip option and navigation controls
- Smooth animations and transitions

**Usage:**
```tsx
<InteractiveTutorialModal
  onComplete={() => {/* mark tutorial as completed */}}
  onSkip={() => {/* skip tutorial */}}
/>
```

## Integration Flow

### 1. Reviewer Access Flow
```typescript
// When reviewer accesses shared deck
const session = await getReviewerSession(shareToken);

// Check if author note exists
if (shareLink.author_note) {
  // Show author note modal
  showAuthorNoteModal({
    authorNote: shareLink.author_note,
    hasSeenSystemBefore: session.tutorial_completed,
    onShowTutorial: () => showTutorial()
  });
}

// Check if tutorial should be shown
if (shareLink.show_tutorial && !session.tutorial_completed) {
  // Offer tutorial after author note
  showTutorialOption();
}
```

### 2. Tutorial Completion Tracking
```typescript
// Mark tutorial as completed
async function completeTutorial(sessionId: string) {
  await supabase
    .from('reviewer_sessions')
    .update({
      tutorial_completed: true,
      tutorial_completed_at: new Date().toISOString()
    })
    .eq('session_id', sessionId);
}
```

### 3. Author Configuration
```typescript
// When creating share link
const shareLink = await createShareLink({
  deck_id: deckId,
  author_note: `
    <h3>Welcome to our investor pitch!</h3>
    <p>We're excited to share our vision with you. Please pay special attention to:</p>
    <ul>
      <li>Market opportunity slides (3-5)</li>
      <li>Financial projections (slides 12-14)</li>
      <li>Team composition (slide 18)</li>
    </ul>
    <p>Your feedback is invaluable to us!</p>
  `,
  show_tutorial: true,
  tutorial_style: 'interactive'
});
```

## Best Practices

### For Authors:
1. **Keep notes concise** - 2-3 paragraphs maximum
2. **Highlight key areas** - Direct attention to specific slides
3. **Set expectations** - Let reviewers know what kind of feedback you need
4. **Use formatting** - HTML formatting makes notes more readable

### For Implementation:
1. **Check tutorial status** - Don't show repeatedly to experienced users
2. **Smooth transitions** - Ensure modals transition smoothly
3. **Mobile responsiveness** - Test on various screen sizes
4. **Accessibility** - Ensure keyboard navigation works

## Tutorial Content Examples

### Welcome Demo
- Animated icon with checkmark
- Brief introduction text
- Sets positive tone

### Text Comment Demo
- Mini slide preview
- Animated comment form appearance
- Category selector demonstration

### Voice Note Demo
- Pulsing record button
- State change animations
- Clear recording indicators

### Click-to-Comment Demo
- Interactive slide with hover effects
- Click markers showing comment placement
- Visual feedback on interaction

### Feedback Levels Demo
- Toggle between slide/deck levels
- Example comments for each level
- Clear visual distinction

## Analytics Integration

Track these events:
- `author_note_viewed` - When author note is displayed
- `tutorial_started` - When tutorial begins
- `tutorial_step_completed` - For each step interaction
- `tutorial_completed` - When fully completed
- `tutorial_skipped` - If skipped

## Future Enhancements

1. **Video Tutorials** - Option for video walkthroughs
2. **Contextual Help** - In-app tooltips during actual use
3. **Custom Tutorials** - Authors can create deck-specific tutorials
4. **Progress Saving** - Resume tutorial where left off
5. **Multi-language** - Localized tutorial content

## Technical Notes

- Components use React hooks for state management
- Animations use CSS transitions for performance
- Tutorial progress stored in local state
- Modals use portal rendering for proper z-index
- All interactions are keyboard accessible

This system significantly improves the reviewer onboarding experience while giving authors a powerful tool to guide feedback collection.
