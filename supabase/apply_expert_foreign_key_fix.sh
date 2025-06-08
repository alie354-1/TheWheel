#!/bin/bash

# Apply the expert foreign key fix migration
echo "Applying expert foreign key fix migration..."
psql -U postgres -d postgres -f migrations/20250607_fix_expert_foreign_keys.sql

echo "Expert foreign key fix migration applied successfully!"
