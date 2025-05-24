# Modern Pitch Deck Builder - Implementation Plan

## Project Overview

**Vision**: Build a modern pitch deck builder that creates HTML-based presentations with smart feedback systems and template intelligence, inspired by the clean approach shown at https://thewheeldeck.netlify.app/

**Key Differentiators**:
- HTML-first approach (not traditional slide editors)
- Contextual feedback system with smart incorporation
- Template ecosystem driven by performance data
- AI-powered structure suggestions
- Mobile-optimized sharing experience

**Technical Architecture**: React components generating clean HTML structures, with Supabase backend for persistence and sharing, plus export pipeline for PPT/Google Slides conversion.

---

## Epic Breakdown

### Epic 1: Core Deck Builder Foundation
**Goal**: Create the fundamental deck building experience with template selection and basic editing

#### User Stories

**US1.1: Template Selection**
- **As a** user creating a new pitch deck
- **I want to** choose from proven templates based on my type of pitch
- **So that** I can start with a structure that has shown success

**Acceptance Criteria**:
- User can browse 3-4 starter templates (Classic VC, Product Demo, Market Opportunity, Technical/Platform)
- Templates display preview images and descriptions
- User can select a template and it generates initial sections
- Template selection creates a new deck with pre-populated section types

**Technical Tasks**:
- Create template data model in Supabase
- Build template selection UI component
- Implement template-to-sections conversion logic
- Create initial template definitions based on https://thewheeldeck.netlify.app/

**US1.2: Section-Based Editing**
- **As a** user building my pitch deck
- **I want to** edit individual sections with live preview
- **So that** I can see exactly how my deck will look when shared

**Acceptance Criteria**:
- User can click on any section to enter edit mode
- Changes appear immediately in live preview
- Preview matches final shared presentation exactly
- User can add, remove, and reorder sections

**Technical Tasks**:
- Create section editor components (Hero, Problem, Solution, Market, etc.)
- Implement live preview system
- Build drag-and-drop section reordering
- Create section add/remove functionality

**US1.3: Clean HTML Output**
- **As a** user creating presentations
- **I want** my deck to render as clean, modern HTML
- **So that** it loads fast and looks professional on any device

**Acceptance Criteria**:
- Deck renders as semantic HTML similar to example site
- Mobile-responsive design
- Fast loading times
- Professional typography and layout

**Technical Tasks**:
- Create HTML section components matching example site styling
- Implement responsive CSS framework
- Optimize rendering performance
- Create semantic HTML structure

#### Implementation Notes
- Start by recreating the exact structure/styling of https://thewheeldeck.netlify.app/ as React components
- Focus on getting the HTML output perfect before adding complex features
- Use Tailwind CSS for consistent styling matching the example

---

### Epic 2: Template System & AI Suggestions
**Goal**: Build intelligent template recommendations and AI-powered structure suggestions

#### User Stories

**US2.1: Outline-to-Structure AI**
- **As a** user with an idea for a pitch
- **I want to** input a basic outline and get AI suggestions for optimal structure
- **So that** I can build a more compelling presentation

**Acceptance Criteria**:
- User can input basic bullet points or description
- AI suggests optimal section order and types
- User can accept/reject suggestions
- System explains why certain structures work better

**Technical Tasks**:
- Integrate with OpenAI API for structure analysis
- Create outline input interface
- Build suggestion presentation UI
- Implement suggestion acceptance workflow

**US2.2: Performance-Based Template Recommendations**
- **As a** user selecting a template
- **I want to** see which templates have performed best for similar pitches
- **So that** I can choose the most effective starting point

**Acceptance Criteria**:
- Templates show performance metrics (feedback scores, usage rates)
- Recommendations based on industry/stage/type
- User can filter templates by performance indicators
- System learns from feedback to improve recommendations

**Technical Tasks**:
- Create template analytics data model
- Build performance tracking system
- Implement recommendation engine
- Create analytics dashboard for template performance

#### Implementation Notes
- Start with simple rule-based suggestions before implementing complex AI
- Track user behavior and feedback from Epic 3 to inform recommendations
- Consider integrating with existing idea hub data for context

---

### Epic 3: Smart Feedback & Collaboration
**Goal**: Create contextual feedback system with intelligent incorporation tools

#### User Stories

**US3.1: Contextual Commenting**
- **As a** reviewer providing feedback
- **I want to** click on specific elements to leave targeted comments
- **So that** my feedback is clear and actionable

**Acceptance Criteria**:
- User can click any section/element to add comment
- Comments display as overlay markers on the deck
- Reviewers can reply to comments (threaded discussions)
- Comments are visible to deck owner but not other reviewers by default

**Technical Tasks**:
- Create comment overlay system
- Build comment threading functionality
- Implement comment positioning/anchoring
- Create reviewer permission system

**US3.2: Feedback Incorporation Tools**
- **As a** deck owner receiving feedback
- **I want to** easily accept or reject specific suggestions
- **So that** I can quickly improve my deck without manual copying

**Acceptance Criteria**:
- User sees all feedback in organized panel
- Can accept/reject individual suggestions with one click
- System automatically applies accepted changes
- User can see before/after comparison of changes

**Technical Tasks**:
- Create feedback management interface
- Implement one-click feedback incorporation
- Build change preview system
- Create feedback history tracking

**US3.3: Reviewer-Friendly Sharing**
- **As a** deck owner
- **I want to** share my deck with specific reviewers easily
- **So that** I can get quality feedback without friction

**Acceptance Criteria**:
- User can generate shareable link for deck
- Link works on mobile and desktop
- Reviewers don't need accounts to provide feedback
- User can control who can see the deck

**Technical Tasks**:
- Create sharing link generation system
- Build anonymous feedback collection
- Implement share permission controls
- Create mobile-optimized review interface

#### Implementation Notes
- Start with equal feedback weighting; add reviewer authority system in later iteration
- Focus on making feedback collection as frictionless as possible
- Consider email notifications for new feedback

---

### Epic 4: Sharing & Presentation Experience
**Goal**: Create seamless sharing and presentation experience optimized for all devices

#### User Stories

**US4.1: Public Presentation Mode**
- **As a** presenter
- **I want** a clean presentation view without editing controls
- **So that** I can present professionally in any setting

**Acceptance Criteria**:
- Clean URLs for presentation mode (e.g., `/deck/share/token`)
- Full-screen presentation mode
- Keyboard navigation (arrow keys, spacebar)
- Professional appearance matching example site exactly

**Technical Tasks**:
- Create presentation-only view components
- Implement keyboard navigation
- Build full-screen mode
- Optimize for presentation displays

**US4.2: Mobile-Optimized Experience**
- **As a** user viewing decks on mobile
- **I want** the deck to look great and be easy to navigate
- **So that** I can review or present from anywhere

**Acceptance Criteria**:
- Deck is fully responsive and readable on mobile
- Touch-friendly navigation
- Fast loading on mobile connections
- Maintains professional appearance on small screens

**Technical Tasks**:
- Optimize responsive design for mobile
- Implement touch navigation
- Optimize performance for mobile
- Test across multiple devices

**US4.3: Analytics & Engagement Tracking**
- **As a** deck owner
- **I want to** see who viewed my deck and how they engaged
- **So that** I can understand my audience and improve my pitch

**Acceptance Criteria**:
- Track unique views and view duration
- Show which sections get most attention
- Identify repeat viewers
- Provide engagement analytics dashboard

**Technical Tasks**:
- Implement view tracking system
- Create engagement analytics
- Build analytics dashboard
- Ensure privacy compliance

#### Implementation Notes
- Focus on replicating the exact UX of https://thewheeldeck.netlify.app/
- Prioritize performance and mobile experience
- Keep analytics simple and actionable

---

### Epic 5: Export & Integration Pipeline
**Goal**: Enable export to traditional presentation formats while maintaining design quality

#### User Stories

**US5.1: HTML Export**
- **As a** user
- **I want to** export my deck as a standalone HTML file
- **So that** I can host it anywhere or share it offline

**Acceptance Criteria**:
- One-click export to HTML file
- Exported file is self-contained (embedded CSS/assets)
- Maintains all styling and functionality
- File works offline

**Technical Tasks**:
- Create HTML export pipeline
- Implement asset embedding
- Ensure cross-browser compatibility
- Optimize exported file size

**US5.2: PDF Generation**
- **As a** user
- **I want to** generate a PDF version of my deck
- **So that** I can share it in traditional formats

**Acceptance Criteria**:
- High-quality PDF output maintaining design
- Proper page breaks between sections
- Vector graphics where possible
- Reasonable file size

**Technical Tasks**:
- Integrate PDF generation library (e.g., Puppeteer)
- Create page layout optimization
- Implement proper typography rendering
- Add PDF metadata

**US5.3: PowerPoint/Google Slides Export**
- **As a** user
- **I want to** export to PowerPoint or Google Slides format
- **So that** I can edit in traditional tools if needed

**Acceptance Criteria**:
- Exports to .pptx format
- Maintains layout and styling as much as possible
- Includes all text content
- Provides guidance on format differences

**Technical Tasks**:
- Research PowerPoint export APIs/libraries
- Create format conversion pipeline
- Handle styling translation
- Implement export workflow

#### Implementation Notes
- Start with HTML export (easiest) and PDF (most useful)
- PowerPoint export is complex - consider as stretch goal
- Focus on maintaining design quality in exports

---

## Data Model

### Core Tables

```sql
-- Decks
CREATE TABLE pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  template_id UUID REFERENCES deck_templates(id),
  owner_id UUID REFERENCES auth.users(id),
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deck Sections
CREATE TABLE deck_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hero', 'problem', 'solution', etc.
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates
CREATE TABLE deck_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'vc_pitch', 'product_demo', etc.
  sections JSONB NOT NULL, -- Template section definitions
  performance_score DECIMAL,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback
CREATE TABLE deck_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
  section_id UUID REFERENCES deck_sections(id),
  reviewer_email TEXT,
  reviewer_name TEXT,
  comment TEXT NOT NULL,
  suggestion JSONB, -- Structured suggestions for auto-incorporation
  position JSONB, -- Where comment is positioned
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics
CREATE TABLE deck_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
  viewer_id TEXT, -- Anonymous or user ID
  session_id TEXT,
  duration_seconds INTEGER,
  sections_viewed JSONB,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Simplified MVP Schema

For initial implementation, start with just:
- `pitch_decks` (basic fields only)
- `deck_sections` 
- `deck_templates` (basic)
- `deck_feedback` (basic)

---

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management (lightweight vs current complex store)
- **React Router** for navigation
- **React Hook Form** for form handling

### Backend Integration
- **Supabase** for database and auth
- **Row Level Security** for access control
- **Real-time subscriptions** for collaborative features

### AI Integration
- **OpenAI API** for structure suggestions
- **Custom prompts** based on pitch deck best practices
- **Fallback to rule-based suggestions** when AI unavailable

### Export Pipeline
- **Puppeteer** for PDF generation
- **Custom HTML bundler** for standalone exports
- **Future**: PowerPoint API integration

---

## Implementation Phases

### Phase 1: MVP Foundation (2-3 weeks)
- Clean out existing complex deck builder code
- Recreate https://thewheeldeck.netlify.app/ styling as React components
- Implement basic template selection (3-4 templates)
- Build section editor with live preview
- Create simple sharing links

**Deliverable**: Functional deck builder that can create decks matching the example site quality

### Phase 2: Feedback System (2 weeks)
- Implement contextual commenting
- Build feedback incorporation tools
- Create reviewer-friendly sharing experience
- Add basic analytics

**Deliverable**: Full feedback and collaboration workflow

### Phase 3: AI & Intelligence (2 weeks)
- Add outline-to-structure AI suggestions
- Implement template performance tracking
- Build recommendation engine
- Create template analytics

**Deliverable**: Intelligent deck creation experience

### Phase 4: Export & Polish (1-2 weeks)
- HTML export functionality
- PDF generation
- Mobile optimization
- Performance improvements

**Deliverable**: Production-ready deck builder with export capabilities

---

## Success Metrics

### User Experience
- **Time to first deck**: < 5 minutes from idea to shareable deck
- **Mobile experience**: Full functionality maintained on mobile
- **Performance**: Page load < 2 seconds, smooth interactions

### Feedback Quality
- **Reviewer engagement**: > 70% of shared decks receive feedback
- **Feedback incorporation**: > 50% of feedback gets incorporated
- **Reviewer satisfaction**: Easy commenting and reviewing experience

### Template Intelligence
- **AI accuracy**: Structure suggestions accepted > 60% of time
- **Template performance**: Clear correlation between template choice and feedback quality
- **Usage patterns**: Templates with better performance get used more

### Technical Quality
- **Export fidelity**: Exported versions maintain > 95% of original design quality
- **Cross-platform**: Works perfectly on all major browsers and devices
- **Reliability**: < 1% error rate in core workflows

---

## Risk Mitigation

### Technical Risks
- **Complex export formats**: Start with HTML/PDF, add PowerPoint later
- **AI reliability**: Always provide fallback options
- **Performance with rich content**: Implement lazy loading and optimization

### User Experience Risks
- **Over-engineering**: Focus on core workflow before adding advanced features
- **Feedback overwhelm**: Provide clear organization and filtering tools
- **Template limitations**: Allow custom sections beyond templates

### Business Risks
- **User adoption**: Start with internal users and iterate based on feedback
- **Feedback quality**: Provide guidance and examples for good feedback
- **Export compatibility**: Set clear expectations about format limitations

---

## Next Steps

1. **Clean out current deck builder implementation**
2. **Create new simplified folder structure**
3. **Recreate example site styling as React components**
4. **Implement Phase 1 MVP features**
5. **Test with real users and iterate**

This plan prioritizes creating something genuinely useful over feature completeness, with clear phases that build on each other toward the full vision.
