#!/bin/bash

# Apply Expert Service v4 Fix
# This script applies the v4 fix to the expert service, which adds the ability to get expert profiles by ID

echo "Applying Expert Service v4 Fix..."

# Copy the fixed version to the actual service file
cp src/lib/services/expert.service.fixed.v4.ts src/lib/services/expert.service.ts

echo "Expert Service v4 Fix applied successfully!"
echo "The expert service now has the ability to get expert profiles by ID, which fixes the issue with viewing expert profiles."
