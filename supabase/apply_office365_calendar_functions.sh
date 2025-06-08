#!/bin/bash

# Apply Office 365 Calendar functions to the database
echo "Applying Office 365 Calendar functions..."

# Get the path to the migration file
MIGRATION_FILE="./migrations/20250608_add_office365_calendar_functions.sql"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Apply the migration
psql "$DATABASE_URL" -f "$MIGRATION_FILE"

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Office 365 Calendar functions applied successfully."
else
  echo "Error: Failed to apply Office 365 Calendar functions."
  exit 1
fi

exit 0
