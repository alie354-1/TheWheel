# Deck Builder Phase 2 Implementation Plan

## Overview
Phase 2 completes the core user experience by adding deck library management, preview/presentation mode, and public sharing functionality. This bridges the gap between Phase 1's basic editing and a complete deck building workflow.

---

## Epic 1: Deck Library & Management
**Goal**: Enable users to browse, organize, and manage their saved pitch decks

### User Stories

**US2.1: Deck Library Browser**
- **As a** user with saved pitch decks
- **I want to** browse my deck library with visual previews
- **So that** I can quickly find and open the deck I want to work on

**Acceptance Criteria**:
- User can view all their saved decks in a grid layout
- Each deck shows: title, last modified date, thumbnail preview
- Decks are sorted by last modified (most recent first)
- User can search decks by title
- Empty state shows helpful message for new users
- Loading states while fetching decks

**Technical Tasks**:
- Create `DeckLibrary.tsx` component with grid layout
- Implement deck thumbnail generation (first section preview)
- Add search functionality with debounced input
- Create `useDeckLibrary` hook for data management
- Add loading and empty states
- Integrate with existing `DeckService.listDecks()`

**US2.2: Open Existing Deck**
- **As a** user browsing my deck library
- **I want to** click on any deck to open it for editing
- **So that** I can continue working on previously saved decks

**Acceptance Criteria**:
- Clicking a deck card opens it in the deck builder
- Deck loads with all sections and content intact
- User can navigate back to library without losing changes
- "Recently opened" indicator on frequently accessed decks
- Proper error handling for corrupted/missing decks

**Technical Tasks**:
- Update `DeckBuilderPage` to handle existing deck IDs
- Implement deck loading with error boundaries
- Add navigation breadcrumbs (Library > Deck Name)
- Create "Back to Library" functionality
- Add recently accessed tracking

**US2.3: Deck Actions & Organization**
- **As a** user managing multiple decks
- **I want to** duplicate, delete, and organize my decks
- **So that** I can efficiently manage my deck collection

**Acceptance Criteria**:
- Context menu on each deck with: Edit, Duplicate, Delete, Share
- Confirm dialog before deleting decks
- Duplicate creates copy with "(Copy)" suffix
- Bulk actions for multiple deck selection
- Sort options: Name, Date Modified, Date Created

**Technical Tasks**:
- Create `DeckContextMenu.tsx` component
- Implement deck duplication logic in `DeckService`
- Add confirmation modals for destructive actions
- Create bulk selection UI with checkboxes
- Add sorting controls to library header

---

## Epic 2: Preview & Presentation Mode
**Goal**: Provide clean, professional viewing experience for completed decks

### User Stories

**US2.4: Deck Preview Mode**
- **As a** user creating a pitch deck
- **I want to** preview my deck without editing controls
- **So that** I can see exactly how it will appear to viewers

**Acceptance Criteria**:
- "Preview" button in deck builder opens clean view
- No editing controls, toolbars, or inspector panels visible
- Sections render exactly as they will for public viewers
- Navigation between sections with arrow keys or click
- "Back to Edit" button to return to builder
- Mobile-responsive preview

**Technical Tasks**:
- Create `DeckPreview.tsx` component for clean viewing
- Implement section navigation (previous/next)
- Add keyboard navigation (arrow keys, escape)
- Create mobile-optimized layout
- Add transition animations between sections
- Integrate with existing section renderers

**US2.5: Full-Screen Presentation**
- **As a** presenter using my pitch deck
- **I want** full-screen presentation mode with navigation
- **So that** I can present professionally in any setting

**Acceptance Criteria**:
- Full-screen mode toggle from preview
- Keyboard navigation (spacebar, arrows, escape)
- Section counter/progress indicator
- Works on external displays and projectors
- Smooth transitions between sections
- Exit full-screen returns to preview

**Technical Tasks**:
- Implement browser fullscreen API
- Create presentation-specific styling
- Add progress indicator component
- Optimize for different screen resolutions
- Handle external display detection
- Add presentation mode keyboard shortcuts

**US2.6: Section Navigation**
- **As a** viewer of a pitch deck
- **I want** intuitive navigation between deck sections
- **So that** I can easily move through the presentation

**Acceptance Criteria**:
- Previous/Next buttons always visible
- Smooth scroll or slide transitions
- Progress dots showing current section
- Direct navigation to any section by clicking dots
- Touch/swipe support on mobile devices
- Keyboard navigation works throughout

**Technical Tasks**:
- Create `SectionNavigator.tsx` component
- Implement smooth scroll animations
- Add progress dot navigation
- Create touch gesture handling for mobile
- Optimize scroll performance
- Add section transition effects

---

## Epic 3: Public Sharing & Collaboration
**Goal**: Enable easy sharing of pitch decks with stakeholders and reviewers

### User Stories

**US2.7: Generate Shareable Links**
- **As a** deck owner
- **I want to** generate secure shareable links for my deck
- **So that** I can share my presentation with specific stakeholders

**Acceptance Criteria**:
- "Share" button generates unique, secure sharing URL
- Links work without requiring recipient to have an account
- Option to set link expiration date
- Ability to revoke/regenerate sharing links
- Copy link to clipboard functionality
- Share link includes deck title in URL for SEO

**Technical Tasks**:
- Extend `DeckService` with sharing functionality
- Create `ShareModal.tsx` component
- Implement secure token generation
- Add link expiration logic
- Create clipboard copy functionality
- Update database schema for sharing settings

**US2.8: Public Deck Viewing**
- **As a** stakeholder receiving a shared deck
- **I want to** view the deck in a clean, professional format
- **So that** I can review the presentation easily

**Acceptance Criteria**:
- Shared links open in clean, branded viewing experience
- No account registration required for viewing
- Mobile-optimized viewing on all devices
- Fast loading times (< 3 seconds)
- Professional appearance matching original design
- Option to view presenter contact information

**Technical Tasks**:
- Create public viewing page component
- Implement anonymous access handling
- Optimize public page performance
- Add branded header/footer for public views
- Create contact information display
- Implement view tracking for analytics

**US2.9: Sharing Analytics**
- **As a** deck owner
- **I want to** see who viewed my shared deck and engagement metrics
- **So that** I can understand audience interest and follow up

**Acceptance Criteria**:
- View count and unique viewer tracking
- Time spent on each section
- Referrer information (how they found the link)
- Geographic location of viewers (optional)
- Export analytics to CSV
- Real-time view notifications (optional)

**Technical Tasks**:
- Implement view tracking in public pages
- Create analytics dashboard component
- Add privacy-compliant tracking system
- Create CSV export functionality
- Build real-time analytics with websockets
- Add GDPR-compliant data handling

---

## Epic 4: Enhanced Navigation & UX
**Goal**: Create seamless flow between deck creation, editing, previewing, and sharing

### User Stories

**US2.10: Unified Deck Builder Entry Point**
- **As a** user wanting to work with pitch decks
- **I want** a single entry point that handles both new and existing decks
- **So that** I have a consistent, intuitive experience

**Acceptance Criteria**:
- `/decks` route shows deck library as default
- "New Deck" button prominently displayed
- Recent decks section for quick access
- Search functionality across all decks
- Onboarding flow for first-time users
- Breadcrumb navigation throughout app

**Technical Tasks**:
- Update routing structure for deck management
- Create unified deck entry page
- Implement breadcrumb navigation component
- Add onboarding tour for new users
- Update main navigation to include decks
- Create responsive layout for all screen sizes

**US2.11: Contextual Action Bar**
- **As a** user working on a deck
- **I want** easy access to key actions (save, preview, share)
- **So that** I can efficiently manage my deck workflow

**Acceptance Criteria**:
- Persistent action bar in deck builder
- Save status indicator (saved/unsaved changes)
- One-click access to preview and share
- Keyboard shortcuts for common actions
- Mobile-friendly action buttons
- Progress auto-save with visual feedback

**Technical Tasks**:
- Create `DeckActionBar.tsx` component
- Implement auto-save functionality
- Add keyboard shortcut handling
- Create mobile action sheet for small screens
- Add save status indicators
- Optimize for touch interactions

**US2.12: Improved State Management**
- **As a** developer maintaining the deck builder
- **I want** clean state management across all deck operations
- **So that** the application is reliable and performant

**Acceptance Criteria**:
- Consistent state across preview, edit, and share modes
- Proper error handling and recovery
- Optimistic updates with rollback on failure
- Local storage backup for unsaved changes
- Clean component unmounting and memory management
- Type-safe state operations throughout

**Technical Tasks**:
- Refactor state management with better patterns
- Implement error boundaries for deck operations
- Add optimistic updates for better UX
- Create local storage persistence layer
- Add comprehensive error handling
- Implement proper cleanup on component unmount

---

## Implementation Order

### Week 1: Core Infrastructure
1. **Enhanced DeckService** - Add sharing, analytics methods
2. **Database Updates** - Sharing tokens, view tracking
3. **Routing Structure** - Update app routing for new pages
4. **Base Components** - DeckLibrary, DeckPreview foundations

### Week 2: Deck Library
1. **DeckLibrary Component** - Grid view, search, actions
2. **Deck Management** - Duplicate, delete, organize
3. **Navigation Integration** - Breadcrumbs, back buttons
4. **Error Handling** - Loading states, error boundaries

### Week 3: Preview & Presentation
1. **Preview Mode** - Clean viewing experience
2. **Section Navigation** - Previous/next, progress indicators
3. **Full-Screen Mode** - Presentation-optimized view
4. **Mobile Optimization** - Touch navigation, responsive design

### Week 4: Sharing & Polish
1. **Sharing System** - Generate links, public viewing
2. **Analytics** - View tracking, engagement metrics
3. **Action Bar** - Persistent controls, auto-save
4. **Testing & Polish** - Edge cases, performance optimization

---

## Technical Architecture Updates

### New Components
```
src/deck-builder/
├── components/
│   ├── DeckLibrary.tsx           # Main library grid view
│   ├── DeckPreview.tsx           # Clean preview mode
│   ├── DeckActionBar.tsx         # Persistent action controls
│   ├── ShareModal.tsx            # Sharing link management
│   ├── SectionNavigator.tsx      # Section navigation controls
│   └── AnalyticsDashboard.tsx    # Sharing analytics
├── hooks/
│   ├── useDeckLibrary.ts         # Library data management
│   ├── useSharing.ts             # Sharing functionality
│   └── useAnalytics.ts           # Analytics data
└── pages/
    ├── DeckLibraryPage.tsx       # Main library page
    ├── PublicDeckPage.tsx        # Public sharing view
    └── DeckAnalyticsPage.tsx     # Analytics dashboard
```

### Service Layer Extensions
```typescript
// DeckService additions
class DeckService {
  // Sharing
  static async generateShareToken(deckId: string): Promise<string>
  static async getSharedDeck(token: string): Promise<Deck | null>
  static async revokeShareToken(deckId: string): Promise<void>
  
  // Analytics
  static async trackView(token: string, metadata: ViewMetadata): Promise<void>
  static async getAnalytics(deckId: string): Promise<DeckAnalytics>
  
  // Management
  static async duplicateDeck(deckId: string): Promise<Deck>
  static async updateDeckMetadata(deckId: string, updates: Partial<DeckMetadata>): Promise<void>
}
```

### Database Schema Updates
```sql
-- Add sharing columns to pitch_decks
ALTER TABLE pitch_decks ADD COLUMN share_token VARCHAR(32);
ALTER TABLE pitch_decks ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE pitch_decks ADD COLUMN shared_at TIMESTAMP;

-- Create view tracking table
CREATE TABLE deck_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id),
  share_token VARCHAR(32),
  viewer_ip VARCHAR(45),
  viewer_location JSONB,
  session_duration INTEGER,
  sections_viewed INTEGER[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Success Metrics

### User Experience
- **Time to open existing deck**: < 2 seconds from library
- **Sharing link generation**: < 1 second with copy-to-clipboard
- **Public deck loading**: < 3 seconds on mobile networks
- **Preview mode transition**: < 500ms smooth animation

### Engagement
- **Deck library usage**: > 80% of users return to edit existing decks
- **Sharing adoption**: > 60% of completed decks get shared
- **Public view completion**: > 70% of shared deck viewers see all sections
- **Mobile experience**: Full functionality maintained on mobile devices

### Technical Quality
- **Error rates**: < 1% on all core operations
- **Performance**: 95th percentile load times under target
- **Mobile compatibility**: Works on iOS Safari, Chrome Android
- **Accessibility**: WCAG 2.1 AA compliance for public sharing

This completes the foundation for a professional pitch deck builder with full creation, management, preview, and sharing capabilities.
