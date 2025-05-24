# Agent Guide for TheWheel Codebase

## Build & Test Commands
- Development server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm test`
- Database migration: `npm run db:migrate`

## Code Style Guidelines
- TypeScript with strong typing - define interfaces for data structures
- React functional components with hooks
- Error handling: throw errors for API calls, catch with try/catch blocks
- Naming: camelCase for variables/functions, PascalCase for components/types
- File structure: Components in src/components/, services in src/lib/services/
- CSS: TailwindCSS for styling with className props

## Architecture
- Supabase for backend (auth, database)
- React + TypeScript frontend
- Service layer for API calls
- Component-based architecture with proper separation of concerns