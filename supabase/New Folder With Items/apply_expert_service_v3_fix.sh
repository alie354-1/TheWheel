#!/bin/bash

# Apply Expert Service V3 Fix
# This script applies the fixed expert service v3 to fix the 406 Not Acceptable error

echo "Applying expert service v3 fix..."

# Copy the fixed expert service to the main service
cp src/lib/services/expert.service.fixed.v3.ts src/lib/services/expert.service.ts

echo "Expert service v3 fix applied successfully!"
