#!/bin/bash

# Run Journey Framework Service Test Script
# This script runs the test_journey_framework.js script with the proper environment variables

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Journey Framework Service Test${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}This script will test if the journey framework service is properly using the populated data.${NC}"
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
echo "Running framework service test script..."
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed. Please install Node.js to run this script."
  exit 1
fi

# Check if the script exists
if [ ! -f "src/utils/test_journey_framework.js" ]; then
  echo "Error: src/utils/test_journey_framework.js not found. Make sure you're in the correct directory."
  exit 1
fi

# Check if @supabase/supabase-js is installed
if ! node -e "require('@supabase/supabase-js')" &> /dev/null; then
  echo "Installing @supabase/supabase-js..."
  npm install @supabase/supabase-js
fi

# Run the test script
node src/utils/test_journey_framework.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}Framework service test completed successfully!${NC}"
  echo ""
  echo "If you encountered any issues with the service, you can:"
  echo "1. Check the service implementation to ensure it's properly accessing the data"
  echo "2. Verify that the database tables are properly populated"
  echo "3. Check for any errors in the console output"
else
  echo ""
  echo -e "\033[0;31mFramework service test failed. Please check the error messages above.${NC}"
fi
