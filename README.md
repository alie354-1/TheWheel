# Wheel99

Wheel99 is a platform for idea generation, refinement, and development. It provides tools for users to create, explore, and refine business ideas with AI assistance.

## Documentation

Comprehensive documentation for the project is available in the following files:

- [Comprehensive Documentation](./docs/COMPREHENSIVE_DOCUMENTATION.md) - Main documentation with overview and references to detailed docs
- [Core Features](./docs/CORE_FEATURES.md) - Detailed description of all implemented features
- [Technical Architecture](./docs/TECHNICAL_ARCHITECTURE.md) - System design and component architecture
- [AI Implementation](./docs/AI_IMPLEMENTATION.md) - AI integration details and context-aware features
- [Roadmap](./docs/ROADMAP.md) - Planned improvements and future features
- [User Stories](./docs/USER_STORIES.md) - Detailed user stories with acceptance criteria
- [Standup Bot](./docs/STANDUP_BOT.md) - Documentation for the Standup Bot feature
- [Task Generation](./docs/TASK_GENERATION.md) - Documentation for the Task Generation feature

## Project Structure

The project is organized as follows:

```
wheel99/
  ├── src/                  # Source code
  │   ├── components/       # React components
  │   ├── lib/              # Utility functions and services
  │   ├── pages/            # Page components
  │   └── ...
  ├── public/               # Static assets
  ├── supabase/             # Database schema and migrations
  │   └── schema.sql        # Consolidated database schema
  ├── archive/              # Archived files (not included in git)
  │   ├── scripts/          # Old scripts and utilities
  │   ├── migrations/       # Old migration files
  │   ├── components/       # Unused components
  │   └── docs/             # Documentation
  └── ...
```

## Database Schema

The database schema is consolidated in a single file: `supabase/schema.sql`. This file contains all the necessary tables, functions, and policies for the application.

To apply the schema to a new Supabase project:

1. Create a new Supabase project
2. Open the SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL Editor and run

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```
4. Start the development server: `npm run dev`

## Features

- Idea generation with AI assistance
- Multiple pathways for idea development
- Canvas-based idea organization
- Collaborative features
- AI-powered refinement and validation

## Cleanup Notes

This repository has been cleaned up to remove temporary fix scripts, old migrations, and unused files. All of these files have been moved to the `archive` directory, which is excluded from git.

A manifest of all archived files can be found in `archive/ARCHIVE_MANIFEST.md`.

Older documentation files have been archived and replaced with updated versions with a more organized structure.
