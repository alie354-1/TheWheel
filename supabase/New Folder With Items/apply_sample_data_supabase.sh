#!/bin/bash

# Apply the sample data migrations using Supabase CLI
# This script assumes you have the Supabase CLI installed and configured

echo "===== APPLYING SAMPLE DATA USING SUPABASE CLI ====="

# First, make sure all the migration files are in the correct format
# Supabase expects migration files to be in the format: YYYYMMDDHHMMSS_name.sql

echo "===== APPLYING MIGRATIONS ====="
echo "Applying startup_stage enum type..."
supabase db push migrations/20250607_create_startup_stage_enum.sql

echo "Applying expert profiles additional fields..."
supabase db push migrations/20250607_add_expert_profiles_additional_fields.sql

echo "Applying sample users..."
supabase db push migrations/20250607_add_sample_users.sql

echo "Applying sample expert profiles..."
supabase db push migrations/20250607_add_sample_experts.sql

echo ""
echo "===== SAMPLE DATA APPLIED SUCCESSFULLY ====="
echo "Sample user credentials:"
echo "Technical Expert: tech.expert@example.com / password123"
echo "Business Expert: business.expert@example.com / password123"
echo "Marketing Expert: marketing.expert@example.com / password123"
echo "Financial Expert: financial.expert@example.com / password123"
echo "Design Expert: design.expert@example.com / password123"
echo ""
echo "You can now log in with any of the sample user accounts to test the expert onboarding and connection system."
echo "See docs/SAMPLE_EXPERTS_DATA.md for more details on the sample data."
