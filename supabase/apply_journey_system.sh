#!/bin/bash

# Apply Journey System
# This script applies all the journey system changes

echo "Applying Journey System..."

# Step 1: Make the scripts executable
echo "Making scripts executable..."
./make_journey_system_executable.sh

# Step 2: Apply the journey integration system
echo "Applying journey integration system..."
./apply_all_journey_integration.sh

echo "Journey System applied successfully!"
echo "You can now access the journey system with the new recommendation panels."
