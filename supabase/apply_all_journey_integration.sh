#!/bin/bash

# Apply All Journey Integration
# This script applies all the journey integration changes

echo "Applying all Journey Integration changes..."

# Step 1: Apply the journey integration system
echo "Applying Journey Integration System..."
./apply_journey_integration.sh

# Step 2: Apply the journey sample data
echo "Applying Journey Sample Data..."
./apply_journey_sample_data.sh

echo "All Journey Integration changes applied successfully!"
echo "You can now access the journey system with the new recommendation panels."
