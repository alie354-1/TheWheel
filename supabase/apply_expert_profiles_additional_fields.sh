#!/bin/bash

# Apply the expert profiles additional fields migration
echo "Applying expert profiles additional fields migration..."
psql -U postgres -d postgres -f migrations/20250607_add_expert_profiles_additional_fields.sql

echo "Expert profiles additional fields migration applied successfully!"
