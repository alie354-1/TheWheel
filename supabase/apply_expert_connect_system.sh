#!/bin/bash

# Script to apply the expert connect system migration to the Supabase database

# Set variables
MIGRATION_FILE="./migrations/20250607_add_expert_connect_system.sql"
DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Applying expert connect system migration..."

# Apply the migration
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Expert connect system migration applied successfully!"
else
  echo "Error: Failed to apply expert connect system migration."
  exit 1
fi

echo "Verifying tables..."

# Verify that the tables were created
psql "$DB_URL" -c "
  SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'expert_connect_requests') as expert_connect_requests,
         EXISTS (SELECT FROM pg_tables WHERE tablename = 'expert_sessions') as expert_sessions,
         EXISTS (SELECT FROM pg_tables WHERE tablename = 'expert_availability') as expert_availability;
"

echo "Expert connect system setup complete!"
