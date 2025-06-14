#!/bin/bash

# Apply Expert Onboarding System
# This script applies all the components needed for the expert onboarding system

echo "Applying Expert Onboarding System..."

# Apply database schema for expert profiles
./supabase/apply_expert_profiles_table.sh

# Apply additional fields for expert profiles
./supabase/apply_expert_profiles_additional_fields.sh

# Apply foreign key fixes
./supabase/apply_expert_foreign_key_fix.sh

# Apply sample data service
./supabase/apply_sample_data_client.sh

# Apply expert connect system
./supabase/apply_expert_connect_system.sh

# Apply expert contracts and payments
./supabase/apply_expert_contracts_payments.sh

# Apply expert response system
./supabase/apply_expert_response_system.sh

# Apply service fixes
./supabase/apply_expert_service_fix.sh
./supabase/apply_connect_service_fix.sh
./supabase/apply_expert_service_v3_fix.sh

echo "Expert Onboarding System applied successfully!"
echo "You can now create expert profiles, connect with experts, and use the expert response system."
echo "For testing purposes, you can use the 'Create Sample Expert Profile' button on the Community Experts page."
