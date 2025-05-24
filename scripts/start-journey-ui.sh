#!/bin/bash
# Script to start the development server and open the Journey UI in the browser
# Created for Sprint 3 implementation demo
# Date: May 3, 2025

echo "Starting The Wheel development server and opening the Journey UI..."

# Check if migrations have been run
echo "Checking if database migrations have been applied..."
if [ ! -f ".migration_complete" ]; then
  echo "Running required migrations first..."
  ./scripts/run-journey-migration.sh
  touch .migration_complete
  echo "Migrations completed successfully!"
fi

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to be ready
echo "Waiting for server to start..."
sleep 10

# Open the browser to the Journey page
echo "Opening browser to Journey UI..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3000/company/journey
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:3000/company/journey
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:3000/company/journey
else
  echo "Please open http://localhost:3000/company/journey in your browser"
fi

echo ""
echo "=========================================================="
echo "  Journey System UI Demo"
echo "=========================================================="
echo ""
echo "You should now see the Journey UI with the following components:"
echo ""
echo "1. Main Journey page with responsive layout"
echo "2. Timeline and List view toggle (top-right corner)"
echo "3. Phase Progress navigation (top section)"
echo "4. Action Panel with recommendations (right sidebar)"
echo ""
echo "To interact with different views and features:"
echo "- Click the view toggle button to switch between Timeline and List views"
echo "- Navigate between phases using the Phase Progress component"
echo "- View personalized recommendations in the Action Panel"
echo "- Interact with individual steps to see details"
echo ""
echo "Press Ctrl+C when you're done to stop the server"

# Wait for user to press Ctrl+C
wait $DEV_SERVER_PID
