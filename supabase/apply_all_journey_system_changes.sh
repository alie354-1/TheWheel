#!/bin/bash

# Master script to apply all journey system changes
echo "Starting complete journey system installation..."

# Make the scripts executable first
echo "Making all scripts executable..."
chmod +x supabase/make_journey_system_executable.sh
./supabase/make_journey_system_executable.sh

# Apply the journey system schema and data
echo "Applying journey system schema and data..."
./supabase/apply_complete_journey_system.sh

echo "Journey system installation complete!"
echo "==================================="
echo "The following components have been installed:"
echo "1. Journey schema structure"
echo "2. Journey step templates data"
echo "3. Journey step task templates data"
echo "4. Additional journey configuration data"
echo "==================================="
echo "You can now use the journey system!"
