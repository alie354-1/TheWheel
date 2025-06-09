#!/bin/bash

# Apply the AI recommendation engine tables migration
supabase db push --file supabase/migrations/20250609_add_ai_recommendation_engine_tables.sql
