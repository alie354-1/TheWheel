#!/bin/bash

# Apply Expert Profile View Fix
# This script applies the v4 fix to the expert service and updates the CommunityExpertsPage component

echo "Applying Expert Profile View Fix..."

# Step 1: Apply the expert service v4 fix
echo "Applying Expert Service v4 Fix..."
cp src/lib/services/expert.service.fixed.v4.ts src/lib/services/expert.service.ts

# Step 2: Update the CommunityExpertsPage component
echo "Updating CommunityExpertsPage component..."
cp src/pages/community/CommunityExpertsPage.fixed.tsx src/pages/community/CommunityExpertsPage.tsx

echo "Expert Profile View Fix applied successfully!"
echo "The expert service now has the ability to get expert profiles by ID, which fixes the issue with viewing expert profiles."
