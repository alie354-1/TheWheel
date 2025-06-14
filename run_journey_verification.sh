#!/bin/bash

# Run Journey Verification Script
# This script runs the check_journey_data.js script with the proper environment variables

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Journey System Verification${NC}"
echo "==============================="
echo ""
echo -e "${YELLOW}This script will verify that the journey system is properly using the populated data.${NC}"
echo ""

# Check if .env file exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Prompt for Supabase URL if not set
if [ -z "$SUPABASE_URL" ]; then
  echo -n "Enter your Supabase URL: "
  read SUPABASE_URL
  export SUPABASE_URL
fi

# Prompt for Supabase Key if not set
if [ -z "$SUPABASE_KEY" ]; then
  echo -n "Enter your Supabase service role key: "
  read SUPABASE_KEY
  export SUPABASE_KEY
fi

echo ""
echo "Running verification script..."
echo "==============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed. Please install Node.js to run this script."
  exit 1
fi

# Check if the script exists
if [ ! -f "check_journey_data.js" ]; then
  echo "Error: check_journey_data.js not found. Make sure you're in the correct directory."
  exit 1
fi

# Check if @supabase/supabase-js is installed
if ! node -e "require('@supabase/supabase-js')" &> /dev/null; then
  echo "Installing @supabase/supabase-js..."
  npm install @supabase/supabase-js
fi

# Run the verification script
node check_journey_data.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}Verification completed successfully!${NC}"
  echo ""
  echo "If you encountered any issues with the data, you can:"
  echo "1. Check the SQL migration files to ensure they're properly populating the data"
  echo "2. Run the migrations again if needed"
  echo "3. Manually verify the data in the Supabase dashboard"
else
  echo ""
  echo -e "\033[0;31mVerification failed. Please check the error messages above.${NC}"
fi
