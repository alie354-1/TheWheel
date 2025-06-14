#!/bin/bash

# Apply Journey Integration System Migration
# This script applies the journey integration system migration to the Supabase database

# Set variables
MIGRATION_FILE="./migrations/20250609_add_journey_integration_system.sql"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Apply migration
echo "Applying journey integration system migration..."
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo "Journey integration system migration applied successfully!"
else
  echo "Error: Failed to apply journey integration system migration."
  exit 1
fi

# Update migration status
echo "Updating migration status..."
psql "$DB_URL" -c "INSERT INTO migration_status (migration_name, applied_at) VALUES ('20250609_add_journey_integration_system', NOW()) ON CONFLICT (migration_name) DO UPDATE SET applied_at = NOW();"

echo "Journey integration system setup complete!"
