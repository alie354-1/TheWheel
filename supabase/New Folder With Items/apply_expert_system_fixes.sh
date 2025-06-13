#!/bin/bash

# Apply Expert System Fixes
# This script applies all fixes for the expert system

echo "Applying expert system fixes..."

# Apply expert service fix
./supabase/apply_expert_service_fix.sh

# Apply connect service fix
./supabase/apply_connect_service_fix.sh

# Apply expert foreign key fix
./supabase/apply_expert_foreign_key_fix.sh

# Apply expert service v3 fix (fixes 406 Not Acceptable error)
./supabase/apply_expert_service_v3_fix.sh

# Apply sample experts data
./supabase/apply_sample_experts.sh

echo "Expert system fixes applied successfully!"
