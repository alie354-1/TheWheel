#!/bin/bash

# Apply Connect Service Fix
# This script applies the fixed connect service to fix foreign key constraint issues

echo "Applying connect service fix..."

# Copy the fixed connect service to the main service
cp src/lib/services/connect.service.fixed.ts src/lib/services/connect.service.ts

echo "Connect service fix applied successfully!"
