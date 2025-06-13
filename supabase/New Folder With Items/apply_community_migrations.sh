#!/bin/bash

# Apply Community Module Migrations
# This script applies the community module migrations to the Supabase database
# Date: 2025-06-07

echo "Applying community module migrations..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed. Please install it first."
    echo "Visit https://supabase.com/docs/guides/cli for installation instructions."
    exit 1
fi

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL environment variable is not set."
    echo "Please set it to your Supabase database URL."
    echo "Example: export SUPABASE_DB_URL=postgresql://postgres:password@localhost:5432/postgres"
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed. Please install PostgreSQL client tools first."
    exit 1
fi

# Apply the migration directly using psql for more reliable execution
echo "Applying community module schema using psql..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20250607_community_module_schema_final.sql

# Apply the expert response system migration
echo "Applying expert response system migration..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20250607_add_expert_response_system.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "Community module migrations applied successfully!"
    echo "The community module is now ready to use."
else
    echo "Error: Failed to apply community module migrations."
    echo "Please check the error messages above and try again."
    exit 1
fi

# Verify that the community_events table has the start_date column
echo "Verifying community_events table structure..."
psql "$SUPABASE_DB_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'community_events' ORDER BY ordinal_position;"

echo "Migration and verification complete."
