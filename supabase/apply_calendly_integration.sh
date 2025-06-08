#!/bin/bash

# Script to apply the Calendly integration SQL migration
# This script applies the SQL migration for Calendly integration to the Supabase database

# Set variables
MIGRATION_FILE="./migrations/20250608_add_calendly_integration.sql"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Apply the migration
echo "Applying Calendly integration migration..."
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Calendly integration migration applied successfully!"
else
  echo "Error: Failed to apply Calendly integration migration."
  exit 1
fi

# Update the migration status in the migrations table
echo "Updating migration status..."
psql "$DB_URL" -c "INSERT INTO migrations (name, applied_at) VALUES ('20250608_add_calendly_integration', NOW()) ON CONFLICT (name) DO UPDATE SET applied_at = NOW();"

echo "Calendly integration setup complete!"
