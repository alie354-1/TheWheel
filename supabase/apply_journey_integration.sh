#!/bin/bash

# Apply Journey Integration System
# This script applies the journey integration system to the application

echo "Applying Journey Integration System..."

# Step 1: Apply the database migration
echo "Applying database migration..."
psql -U postgres -d postgres -f migrations/20250609_add_journey_integration_system.sql

# Step 2: Copy the real service implementations to replace the mock ones
echo "Copying real service implementations..."
cp ../src/lib/services/recommendation/index.real.ts ../src/lib/services/recommendation/index.ts
cp ../src/lib/services/journey-integration/index.real.ts ../src/lib/services/journey-integration/index.ts

# Step 3: Update the JourneyHomePage component
echo "Updating JourneyHomePage component..."
cp ../src/components/company/journey/pages/JourneyHomePage.updated.tsx ../src/components/company/journey/pages/JourneyHomePage.tsx

# Step 4: Run the migration script to transfer data
echo "Running data migration..."
cd ..
npx ts-node -r tsconfig-paths/register src/lib/services/journey-integration/migration.ts
cd -

echo "Journey Integration System applied successfully!"
echo "You can now access the journey system with the new recommendation panels."
