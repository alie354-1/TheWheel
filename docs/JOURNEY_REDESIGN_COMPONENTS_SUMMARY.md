# Journey Redesign Components Summary

This document provides a summary of all components created for the redesigned journey experience.

## Database Schema

### Tables
- `journey_phases`: Stores main journey phases
- `journey_challenges`: Stores business challenges (replacing steps)
- `company_challenge_progress`: Tracks company progress on challenges

### Migration Scripts
- `scripts/run-journey-transformation.js`: Migrates data from the old step-based system to the new challenge-based architecture

## Core Components

### Challenge Components

#### ChallengeCard
- **Purpose**: Display individual business challenges in a compact card format
- **Features**:
  - Status badge (Not Started, In Progress, Completed, Skipped)
  - Difficulty indicator (1-5 scale)
  - Estimated time display
  - Key outcomes preview
  - Action buttons (Start, Customize, Mark Irrelevant)
  
#### StatusBadge
- **Purpose**: Shows the current status of a challenge
- **Features**:
  - Color-coded badges for different statuses
  - Clear text labels
  - Compact design for embedding in cards

#### DifficultyIndicator
- **Purpose**: Visually indicates challenge difficulty
- **Features**:
  - 1-5 scale represented by dots
  - Color-coding (1=green to 5=red)
  - Tooltip with text description

#### EstimatedTime
- **Purpose**: Shows estimated time to complete a challenge
- **Features**:
  - Displays time range (min-max)
  - Appropriate time units (minutes, hours)
  - Clock icon for visual recognition

### Phase Components

#### PhaseProgress
- **Purpose**: Visualizes progress through a journey phase
- **Features**:
  - Progress bar showing completion percentage
  - Challenge count (completed/total)
  - Phase description
  - Clickable to filter challenges by phase

### List Components

#### ChallengeList
- **Purpose**: Displays collections of challenges
- **Features**:
  - Grid or list layout options
  - Filters and search capabilities
  - Empty state handling
  - Integration with progress data

### Editor Components

#### ChallengeEditor
- **Purpose**: Form for creating or editing challenges
- **Features**:
  - Form validation
  - Phase selection dropdown
  - Difficulty selector
  - Estimated time inputs
  - Key outcomes management (add/remove)

## Page Components

### JourneyOverviewPage
- **Purpose**: Dashboard view of journey progress
- **Features**:
  - Overall completion metrics
  - Phase-by-phase progress visualization
  - Quick action buttons for in-progress challenges
  - Recommendations for what to do next

### JourneyChallengesPage
- **Purpose**: Browse and filter all available challenges
- **Features**:
  - Search functionality
  - Phase filtering
  - Grid view of challenge cards
  - Create custom challenge button
  - Quick access to ongoing challenges

### JourneyStepPage (Enhanced)
- **Purpose**: Detailed view of a single challenge
- **Features**:
  - Step-by-step guidance
  - Tool recommendations
  - Progress tracking
  - Notes and collaboration
  - Related resources

## Service Layer

### JourneyChallengesService
- **Purpose**: Backend service for challenge operations
- **Methods**:
  - `getPhases()`: Get all journey phases
  - `getChallenges()`: Get all challenges
  - `getChallengesByPhase(phaseId)`: Get challenges for a specific phase
  - `getChallenge(challengeId)`: Get a single challenge by ID
  - `getCompanyProgress(companyId)`: Get progress for all challenges for a company
  - `updateChallengeStatus(companyId, challengeId, status, notes)`: Update status
  - `createChallenge(challenge)`: Create a new challenge
  - `updateChallenge(id, challenge)`: Update an existing challenge
  - `deleteChallenge(id)`: Delete a challenge

## Documentation

### User and Implementation Guides
- `docs/JOURNEY_EXPERIENCE_REDESIGN.md`: Overview of UX design principles
- `docs/JOURNEY_REDESIGN_IMPLEMENTATION_PLAN.md`: Technical implementation details
- `docs/THE_WHEEL_JOURNEY_USER_GUIDE.md`: End-user guide for the new experience

## Future Components (Planned)

### Advanced Features
- **AI Recommendations**: Smart challenge suggestions based on company profile
- **Challenge Collections**: Predefined groups of challenges for specific business scenarios
- **Calendar Integration**: Schedule challenge work in team calendars
- **Social Features**: See how similar companies tackled challenges
- **Export Functionality**: Generate progress reports in various formats

This component architecture provides a solid foundation for the challenge-based journey experience, with clear separation of concerns and reusable building blocks that can be extended as needed.
