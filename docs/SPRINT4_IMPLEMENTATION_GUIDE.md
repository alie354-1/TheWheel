# Sprint 4 Implementation Guide

This document provides an overview of the Sprint 4 implementation for The Wheel, based on the unified journey system redesign.

## Overview

Sprint 4 focuses on enhancing the journey experience with collaboration features, feedback collection, improved tool selection, drag-and-drop functionality, sharing capabilities, and an advanced notification system.

## Key Components Implemented

### 1. Database Schema Enhancements
- Collaboration features (comments, presence, activity tracking)
- Comprehensive feedback system for steps and tools
- Enhanced tool selection and requirement matching
- Drag-and-drop functionality for journey steps
- Sharing capabilities for journey reports
- Advanced notification system

### 2. Frontend Components
- `StepImprovementSuggestionForm`: A form component for submitting detailed improvement suggestions
- `InlineRatingComponent`: A star-rating component for collecting quick feedback

### 3. Services
- Feedback Service: Handles collection and management of user feedback
- Sharing Service: Manages report sharing and step recommendations
- Notification Service: Provides a comprehensive notification system
- Custom Arrangement Service: Handles drag-and-drop functionality

## Running the Migrations

We've provided a migration script that handles the SQL migrations in the correct order. The script has been designed to:

1. Skip pgvector dependency (which was causing installation errors)
2. Run migrations in the correct sequential order
3. Provide clear feedback on migration success or failure

### How to Run

```bash
# Make the script executable (if not already)
chmod +x scripts/run-sprint4-migrations.sh

# Run the migration script
./scripts/run-sprint4-migrations.sh
```

The script will:
1. Run the collaboration features migration (modified to remove pgvector dependency)
2. Run the feedback system migration
3. Run the enhanced tool selection migration
4. Run the drag-drop sharing notifications migration

If a migration fails, you'll be prompted whether to continue with the next migration or stop.

## Database Configuration

The migration script uses the following default database configuration:
- Database name: `thewheel`
- Database user: `postgres`

If you need to modify these settings, edit the DB_NAME and DB_USER variables at the top of the script.

## Testing the Implementation

After running the migrations, you can test the new features:

1. **Feedback Components**: Test the feedback form and rating components integrated into journey steps
2. **Collaborative Features**: Try leaving comments on steps and observe the presence indicators
3. **Tool Selection**: Explore the enhanced tool selection system with requirement matching
4. **Sharing**: Test the sharing functionality for journey reports
5. **Notifications**: Check if notifications are properly triggered and delivered

## Known Limitations

1. The pgvector extension requirement has been commented out from the migrations. If you need vector similarity search functionality, you'll need to:
   - Install pgvector on your database server
   - Uncomment the CREATE EXTENSION line in the first migration

2. The team progress trigger function in the collaboration features has been disabled due to database schema compatibility issues. The SQL migration contains a commented-out version that can be customized based on your actual column names:
   - The system expects a status column for journey steps, but different implementations might use different column names (status, progress_state, etc.)
   - A placeholder function is created to prevent reference errors, but the actual trigger is not registered
   - You'll need to check your company_journey_steps table structure and adjust the function accordingly

3. Some advanced notification delivery methods (email, mobile) are structured in the database but require additional integration with external services to function fully.

## Troubleshooting

- **Migration Errors**: Check the SQL output for specific errors. Common issues include:
  - Column name mismatches: The migrations might reference columns that have different names in your database schema. For example, we had to change `status` to `progress_state` in the team progress trigger function.
  - Foreign key constraints (ensure referenced tables exist)
  - Permission issues (ensure the database user has sufficient privileges)
  - Syntax errors (especially if you've modified the migrations)

- **Component Integration**: If frontend components aren't appearing correctly, check:
  - Import paths
  - Component registration in their respective modules
  - Any console errors in the browser developer tools

## Next Steps

After successfully implementing Sprint 4, the system is ready for:

1. Additional frontend integration of the new features
2. Performance testing with larger datasets
3. User testing for the new collaboration and feedback features
4. Preparing for Sprint 5 enhancements
