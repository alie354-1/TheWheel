#!/bin/bash

# Script to apply the expert contracts and payments migration to the Supabase database

# Set variables
MIGRATION_FILE="./migrations/20250607_add_expert_contracts_payments.sql"
DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Applying expert contracts and payments migration..."

# Apply the migration
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Expert contracts and payments migration applied successfully!"
else
  echo "Error: Failed to apply expert contracts and payments migration."
  exit 1
fi

echo "Verifying tables..."

# Verify that the tables were created
psql "$DB_URL" -c "
  SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'expert_contract_templates') as expert_contract_templates,
         EXISTS (SELECT FROM pg_tables WHERE tablename = 'expert_contracts') as expert_contracts,
         EXISTS (SELECT FROM pg_tables WHERE tablename = 'expert_payments') as expert_payments;
"

# Verify that columns were added to existing tables
psql "$DB_URL" -c "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'expert_profiles' 
  AND column_name IN ('hourly_rate', 'payment_methods', 'contract_template_id');
"

psql "$DB_URL" -c "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'expert_sessions' 
  AND column_name IN ('contract_id', 'payment_status');
"

echo "Expert contracts and payments system setup complete!"
