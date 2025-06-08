#!/bin/bash

# Apply the calendar integration system migration
echo "Applying calendar integration system migration..."
psql "$DATABASE_URL" -f migrations/20250608_add_calendar_integration_system.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "✅ Calendar integration system migration applied successfully"
else
  echo "❌ Failed to apply calendar integration system migration"
  exit 1
fi

echo "Calendar integration system is now ready to use!"
