#!/bin/bash
# Script to apply the community module foreign key fix migration
# Usage: ./apply_community_foreign_key_fix.sh [database_url]

set -e

# Default database URL if not provided
DB_URL=${1:-"postgresql://postgres:postgres@localhost:54322/postgres"}

echo "Applying community module foreign key fix migration..."
echo "Database URL: $DB_URL"

# Apply the migration
psql "$DB_URL" -f "$(dirname "$0")/migrations/20250607_fix_community_foreign_keys.sql"

echo "Migration applied successfully!"
echo "The community module should now work correctly with proper foreign key relationships."
