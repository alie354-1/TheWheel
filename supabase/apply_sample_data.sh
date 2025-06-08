#!/bin/bash

# Apply the sample data migrations in the correct order

echo "===== CREATING STARTUP STAGE ENUM TYPE ====="
echo "Creating startup_stage enum type if it doesn't exist..."
psql -U postgres -d postgres -f migrations/20250607_create_startup_stage_enum.sql
echo "Startup stage enum type created or already exists!"

echo ""
echo "===== APPLYING EXPERT PROFILES ADDITIONAL FIELDS ====="
echo "Applying expert profiles additional fields migration..."
psql -U postgres -d postgres -f migrations/20250607_add_expert_profiles_additional_fields.sql
echo "Expert profiles additional fields migration applied successfully!"

echo ""
echo "===== APPLYING SAMPLE USERS ====="
echo "Applying sample users migration..."
psql -U postgres -d postgres -f migrations/20250607_add_sample_users.sql

echo ""
echo "Sample user credentials:"
echo "Technical Expert: tech.expert@example.com / password123"
echo "Business Expert: business.expert@example.com / password123"
echo "Marketing Expert: marketing.expert@example.com / password123"
echo "Financial Expert: financial.expert@example.com / password123"
echo "Design Expert: design.expert@example.com / password123"

echo ""
echo "===== APPLYING SAMPLE EXPERT PROFILES ====="
echo "Applying sample experts migration..."
psql -U postgres -d postgres -f migrations/20250607_add_sample_experts.sql

echo ""
echo "===== SAMPLE DATA APPLIED SUCCESSFULLY ====="
echo "You can now log in with any of the sample user accounts to test the expert onboarding and connection system."
echo "See docs/SAMPLE_EXPERTS_DATA.md for more details on the sample data."
