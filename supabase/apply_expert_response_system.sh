#!/bin/bash

# Apply Expert Response System Migration
# This script applies the migration for the expert response system

# Set variables
MIGRATION_FILE="migrations/20250607_add_expert_response_system.sql"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file $MIGRATION_FILE not found."
  exit 1
fi

# Display information
echo "Applying Expert Response System Migration..."
echo "Migration file: $MIGRATION_FILE"
echo "Database URL: $DB_URL"
echo ""

# Apply migration
echo "Running migration..."
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error: Migration failed."
  exit 1
fi

echo ""
echo "Expert Response System is now ready to use."
echo "The following tables have been created or updated:"
echo "- expert_profiles: Stores expert profiles with expertise areas"
echo "- expert_endorsements: Stores endorsements for experts"
echo "- expert_responses: Stores expert responses to discussion threads"
echo "- thread_replies: Updated with is_expert_response and expert_confidence_score columns"
echo ""
echo "The following functions have been created:"
echo "- get_expert_endorsement_counts: Returns counts of endorsements for each expert"
echo "- get_expertise_area_counts: Returns counts of expertise areas across all experts"
echo ""
echo "Row-level security policies have been applied to ensure proper access control."
