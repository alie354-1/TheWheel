#!/bin/bash

# Apply Office 365 Calendar integration to the database
echo "Applying Office 365 Calendar integration..."

# Apply the Office 365 Calendar functions
echo "Applying Office 365 Calendar functions..."
bash ./apply_office365_calendar_functions.sh

# Check if the functions were applied successfully
if [ $? -ne 0 ]; then
  echo "Error: Failed to apply Office 365 Calendar functions."
  exit 1
fi

echo "Office 365 Calendar integration applied successfully."
echo "The system now supports Office 365 Calendar integration for expert availability management."

exit 0
