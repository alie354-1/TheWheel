#!/bin/bash

# Apply the expert profiles table migration
echo "Applying expert profiles table migration..."
psql -U postgres -d postgres -f supabase/migrations/20250607_add_expert_profiles_table.sql

echo "Migration completed successfully!"
