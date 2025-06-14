#!/bin/bash

# Apply journey step data
echo "Applying journey step templates data..."

# Apply step templates in parts to handle the large dataset
psql -U postgres -f supabase/migrations/20250610_populate_journey_step_templates.sql
echo "Applied journey step templates part 1"

psql -U postgres -f supabase/migrations/20250610_populate_journey_step_templates_part2.sql
echo "Applied journey step templates part 2"

psql -U postgres -f supabase/migrations/20250610_populate_journey_step_templates_part3.sql
echo "Applied journey step templates part 3"

psql -U postgres -f supabase/migrations/20250610_populate_journey_step_templates_part4.sql
echo "Applied journey step templates part 4"

# Apply step task templates
psql -U postgres -f supabase/migrations/20250610_populate_step_task_templates.sql
echo "Applied step task templates"

echo "All journey step data successfully applied!"
