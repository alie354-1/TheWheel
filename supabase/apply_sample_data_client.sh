#!/bin/bash

# Apply Sample Data Client
# This script applies sample data using the client-side service

echo "Applying sample data using client-side service..."

# Copy the sample data service to the correct location
cp src/lib/services/sample-data.service.ts src/lib/services/

# Make the script executable
chmod +x supabase/apply_sample_data_client.sh

echo "Sample data client service applied successfully!"
echo "To use this service, call sampleDataService.addSampleExpertProfile(userId) from your application code."
