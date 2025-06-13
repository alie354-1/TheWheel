#!/bin/bash

# Apply the sample experts migration
echo "Applying sample experts migration..."
psql -U postgres -d postgres -f migrations/20250607_add_sample_experts.sql

echo "Sample experts migration applied successfully!"
