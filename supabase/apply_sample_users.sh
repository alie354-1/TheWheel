#!/bin/bash

# Apply the sample users migration
echo "Applying sample users migration..."
psql -U postgres -d postgres -f migrations/20250607_add_sample_users.sql

echo "Sample users migration applied successfully!"
echo ""
echo "Sample user credentials:"
echo "Technical Expert: tech.expert@example.com / password123"
echo "Business Expert: business.expert@example.com / password123"
echo "Marketing Expert: marketing.expert@example.com / password123"
echo "Financial Expert: financial.expert@example.com / password123"
echo "Design Expert: design.expert@example.com / password123"
