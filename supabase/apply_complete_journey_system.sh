#!/bin/bash

# Apply the complete journey system in the correct order
echo "Applying journey system schema and data..."

# Apply schema first
psql -U postgres -f supabase/migrations/20250610_journey_schema_corrected.sql
echo "Applied journey schema"

# Make journey step data script executable
chmod +x supabase/apply_journey_step_data.sh

# Apply journey step data
./supabase/apply_journey_step_data.sh
echo "Applied journey step data"

# Apply any additional journey-related migrations
if [ -f supabase/migrations/20250610_populate_journey_data.sql ]; then
  psql -U postgres -f supabase/migrations/20250610_populate_journey_data.sql
  echo "Applied additional journey data"
fi

# Apply any journey system redesign if it exists
if [ -f supabase/migrations/20250610_add_journey_system_redesign.sql ]; then
  psql -U postgres -f supabase/migrations/20250610_add_journey_system_redesign.sql
  echo "Applied journey system redesign"
fi

echo "Journey system successfully applied!"
echo "The following migrations were applied:"
echo "- 20250610_journey_schema_corrected.sql"
echo "- 20250610_populate_journey_step_templates.sql"
echo "- 20250610_populate_journey_step_templates_part2.sql"
echo "- 20250610_populate_journey_step_templates_part3.sql"
echo "- 20250610_populate_journey_step_templates_part4.sql"
echo "- 20250610_populate_step_task_templates.sql"
echo "- Additional migrations (if available)"
