#!/bin/bash

# Apply All Expert System Fixes
# This script applies all the fixes for the expert system in the correct order

echo "Applying all expert system fixes..."

# Step 1: Apply expert foreign key fix
echo "Step 1: Applying expert foreign key fix..."
./supabase/apply_expert_foreign_key_fix.sh

# Step 2: Apply expert service v3 fix (query fix)
echo "Step 2: Applying expert service v3 fix (query fix)..."
./supabase/apply_expert_service_v3_fix.sh

# Step 3: Apply expert profile view fix (includes expert service v4 fix)
echo "Step 3: Applying expert profile view fix..."
./supabase/apply_expert_profile_view_fix.sh

# Step 4: Apply expert availability management
echo "Step 4: Applying expert availability management..."
./supabase/apply_expert_availability_management.sh

# Step 5: Apply Google Calendar integration
echo "Step 5: Applying Google Calendar integration..."
./supabase/apply_calendar_integration_system.sh

# Step 6: Apply Office 365 Calendar integration
echo "Step 6: Applying Office 365 Calendar integration..."
./supabase/apply_office365_calendar_integration.sh

echo "All expert system fixes applied successfully!"
echo "The expert system should now be fully functional with calendar integrations."
