#!/bin/bash

# Apply Expert Availability Management System
# This script applies the necessary database migrations and updates for the expert availability management system

echo "Applying Expert Availability Management System..."

# Apply the migration SQL file
echo "Applying migration: 20250607_add_expert_availability_management.sql"
psql -U postgres -d postgres -f ./supabase/migrations/20250607_add_expert_availability_management.sql

echo "Expert Availability Management System applied successfully"
