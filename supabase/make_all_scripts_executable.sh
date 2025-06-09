#!/bin/bash

# Make All Scripts Executable
# This script makes all the scripts in the supabase directory executable

echo "Making all scripts executable..."

# Make all .sh files executable
find . -name "*.sh" -exec chmod +x {} \;

echo "All scripts are now executable!"
