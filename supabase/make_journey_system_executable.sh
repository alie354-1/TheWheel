#!/bin/bash

# Make Journey System Executable
# This script makes all the journey system scripts executable

echo "Making Journey System scripts executable..."

# Make the journey integration scripts executable
chmod +x apply_journey_integration.sh
chmod +x apply_journey_sample_data.sh
chmod +x apply_all_journey_integration.sh

echo "Journey System scripts are now executable!"
