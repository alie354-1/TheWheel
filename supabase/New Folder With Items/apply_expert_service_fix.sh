#!/bin/bash

# Apply Expert Service Fix
# This script applies the fixed expert service to the project

echo "Applying expert service fix..."

# Copy the fixed expert service to the main expert service
cp src/lib/services/expert.service.fixed.v2.ts src/lib/services/expert.service.ts

# Copy the fixed community index to the main community index
cp src/lib/services/community/index.fixed.ts src/lib/services/community/index.ts

echo "Expert service fix applied successfully!"
