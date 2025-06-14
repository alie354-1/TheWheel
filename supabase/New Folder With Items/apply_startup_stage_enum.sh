#!/bin/bash

# Apply the startup_stage enum migration
echo "Creating startup_stage enum type if it doesn't exist..."
psql -U postgres -d postgres -f migrations/20250607_create_startup_stage_enum.sql

echo "Startup stage enum type created or already exists!"
