#!/bin/bash

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Create www directory if it doesn't exist
mkdir -p www

# Copy build output to www directory
cp -r dist/health-info-237/* www/ 